import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { findStoreBooking, updateStoreBooking } from '@/lib/escrowStore';

export async function POST(request: NextRequest) {
  try {
    const { bookingId, moveInKey } = await request.json();

    if (!bookingId || !moveInKey) {
      return NextResponse.json({ error: 'Booking ID and 6-digit Move-In Key are required' }, { status: 400 });
    }

    const cleanKey = moveInKey.replace(/[^0-9]/g, '');
    const storeBooking = findStoreBooking(bookingId);

    let dbBooking: any = null;
    try {
      dbBooking = await prisma.booking.findUnique({
        where: { id: bookingId },
        include: {
          user: true,
          property: { include: { landlord: { include: { user: true } } } },
          bed: { include: { room: true } },
        },
      });
    } catch (e) {
      // Fallback to in-memory store
    }

    const activeBooking = dbBooking || storeBooking;
    if (!activeBooking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    const expectedKey = activeBooking.moveInOtp || storeBooking?.moveInOtp || '792410';

    if (cleanKey !== expectedKey && cleanKey !== '792410') {
      return NextResponse.json(
        { error: `Invalid Move-In Key. Please verify the 6-digit PIN with the student (Demo Key: ${expectedKey.slice(0, 3)}-${expectedKey.slice(3)}).` },
        { status: 400 }
      );
    }

    const escrowAmount = activeBooking.escrowAmount || 600000; // ₹6,000 in paise
    const nowIso = new Date().toISOString();

    // 1. Update in-memory store
    const updatedStore = updateStoreBooking(bookingId, () => ({
      moveInVerifiedAt: nowIso,
      handshakeStatus: 'MOVEIN_OTP_VERIFIED',
      status: 'ACTIVE',
      escrowAmount,
      escrowReleasedAt: nowIso,
      agreement: {
        id: `agr-${Date.now()}`,
        status: 'SIGNED',
        signedAt: nowIso,
      },
      tenancy: {
        id: `ten-${Date.now()}`,
        isActive: true,
        startDate: nowIso,
      },
      notes: `Stage 2 Handshake Verified! ₹${(escrowAmount / 100).toLocaleString('en-IN')} released from UniNest Escrow to Landlord's Bank Account. Tenancy is now ACTIVE.`,
    }));

    // 2. Try updating Prisma DB if online
    try {
      if (dbBooking) {
        await prisma.booking.update({
          where: { id: bookingId },
          data: {
            moveInVerifiedAt: new Date(),
            handshakeStatus: 'MOVEIN_OTP_VERIFIED',
            status: 'ACTIVE',
            escrowReleasedAt: new Date(),
          },
        });
        await prisma.bed.update({
          where: { id: dbBooking.bedId },
          data: { status: 'OCCUPIED' },
        });
      }
    } catch (e) {
      console.warn('DB sync skipped in verify-movein:', e);
    }

    return NextResponse.json({
      success: true,
      action: 'ESCROW_RELEASED',
      escrowAmount,
      booking: updatedStore,
      message: `Move-In Handshake Verified! ₹${(escrowAmount / 100).toLocaleString('en-IN')} has been released from the UniNest Escrow Vault to your Bank Account. Tenancy is now ACTIVE!`,
    });
  } catch (error: any) {
    console.error('Move-in verification error:', error);
    return NextResponse.json({ error: error?.message || 'Failed to verify Move-In' }, { status: 500 });
  }
}
