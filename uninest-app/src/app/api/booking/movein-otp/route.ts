import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth/actions';
import { findStoreBooking, updateStoreBooking } from '@/lib/escrowStore';

export async function POST(request: NextRequest) {
  try {
    const session = await getSession().catch(() => null);
    if (!session) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { bookingId } = await request.json().catch(() => ({}));

    if (!bookingId) {
      return NextResponse.json({ error: 'Booking ID is required' }, { status: 400 });
    }

    // 1. Fetch booking
    let dbBooking: any = null;
    try {
      dbBooking = await prisma.booking.findUnique({
        where: { id: bookingId },
        include: {
          user: true,
          property: { include: { landlord: { include: { user: true } } } },
        },
      });
    } catch {
      // Fallback to in-memory store
    }

    const rawStoreBooking = findStoreBooking(bookingId);
    const storeBooking = rawStoreBooking?.id === bookingId ? rawStoreBooking : undefined;
    const activeBooking = dbBooking || storeBooking;

    if (!activeBooking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    // 2. Ownership check
    const bookingUserEmail = activeBooking.user?.email || activeBooking.userEmail;
    const bookingUserId = activeBooking.userId || activeBooking.user?.id;
    const isOwner =
      (session.userId && bookingUserId && session.userId === bookingUserId) ||
      (session.email && bookingUserEmail && session.email.toLowerCase() === bookingUserEmail.toLowerCase()) ||
      session.role === 'ADMIN';

    if (!isOwner) {
      return NextResponse.json(
        { error: 'Forbidden: You are not authorized to access this booking.' },
        { status: 403 }
      );
    }

    // 3. Strict Precondition: Physical Arrival must be verified before Handshake Key is revealed!
    if (!activeBooking.arrivalVerifiedAt && !storeBooking?.arrivalVerifiedAt) {
      return NextResponse.json(
        {
          error: 'ARRIVAL_NOT_VERIFIED',
          message:
            'Move-In Handshake Key is shielded. Physical arrival verification at the property premises is required before unlocking.',
        },
        { status: 403 }
      );
    }

    // 4. Retrieve or generate Move-In Key
    let moveInKey = activeBooking.moveInOtp || storeBooking?.moveInOtp;
    if (!moveInKey) {
      moveInKey = Math.floor(100000 + Math.random() * 900000).toString();
    }

    const graceEnd = activeBooking.graceWindowEndsAt || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

    // 5. Update in-memory store
    const updatedStore = updateStoreBooking(bookingId, (b) => ({
      ...b,
      moveInOtp: moveInKey,
      status: 'MOVE_IN_READY',
      escrowAmount: b.escrowAmount || 600000,
      graceWindowEndsAt: graceEnd,
    }));

    // 6. Update Prisma DB if online
    try {
      if (dbBooking) {
        await prisma.booking.update({
          where: { id: bookingId },
          data: {
            moveInOtp: moveInKey,
            status: 'MOVE_IN_READY',
          },
        });
      }
    } catch (dbErr) {
      console.warn('Database offline in movein-otp, synced with in-memory Escrow Store:', dbErr);
    }

    const formattedKey = `${moveInKey.slice(0, 3)}-${moveInKey.slice(3)}`;

    return NextResponse.json({
      success: true,
      moveInKey: formattedKey,
      rawKey: moveInKey,
      graceWindowEndsAt: graceEnd,
      booking: updatedStore || findStoreBooking(bookingId),
      message: `Your 6-Digit Move-In Handshake Key is ${formattedKey}. Share this with your landlord after inspecting your room & receiving keys.`,
    });
  } catch (error: any) {
    console.error('Move-in key retrieval error:', error);
    return NextResponse.json({ error: error?.message || 'Failed to retrieve Move-In Key' }, { status: 500 });
  }
}
