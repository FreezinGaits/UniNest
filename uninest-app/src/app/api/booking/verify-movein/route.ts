import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { findStoreBooking, updateStoreBooking } from '@/lib/escrowStore';

function sanitizeBookingUsers(booking: any) {
  if (!booking || typeof booking !== 'object') return booking;
  const copy = { ...booking };
  if (copy.user && typeof copy.user === 'object') {
    const { passwordHash: _pw, ...safeUser } = copy.user;
    copy.user = safeUser;
  }
  if (copy.property?.landlord?.user && typeof copy.property.landlord.user === 'object') {
    const { passwordHash: _lpw, ...safeLandlordUser } = copy.property.landlord.user;
    copy.property = {
      ...copy.property,
      landlord: {
        ...copy.property.landlord,
        user: safeLandlordUser,
      },
    };
  }
  return copy;
}

export async function POST(request: NextRequest) {
  try {
    const { bookingId, moveInKey } = await request.json();

    if (!bookingId || !moveInKey) {
      return NextResponse.json({ error: 'Booking ID and 6-digit Move-In Key are required' }, { status: 400 });
    }

    const cleanKey = moveInKey.replace(/[^0-9]/g, '');
    const rawStoreBooking = findStoreBooking(bookingId);
    const storeBooking = rawStoreBooking?.id === bookingId ? rawStoreBooking : undefined;

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

    const expectedKey = activeBooking.moveInOtp || storeBooking?.moveInOtp;

    if (!expectedKey || cleanKey !== expectedKey) {
      return NextResponse.json(
        { error: `Invalid Move-In Key. Please verify the 6-digit PIN with the student.` },
        { status: 400 }
      );
    }

    const escrowAmount = activeBooking.escrowAmount || 600000; // ₹6,000 in paise
    const nowIso = new Date().toISOString();

    // 1. Update in-memory store
    const updatedStore = storeBooking
      ? updateStoreBooking(bookingId, () => ({
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
        }))
      : null;

    // 2. Try updating Prisma DB if online
    let updatedDb: any = null;
    try {
      if (dbBooking) {
        updatedDb = await prisma.booking.update({
          where: { id: bookingId },
          data: {
            moveInVerifiedAt: new Date(),
            handshakeStatus: 'MOVEIN_OTP_VERIFIED',
            status: 'ACTIVE',
            escrowReleasedAt: new Date(),
          },
          include: {
            user: true,
            property: { include: { landlord: { include: { user: true } } } },
            bed: { include: { room: true } },
          },
        });
        await prisma.bed.update({
          where: { id: dbBooking.bedId },
          data: { status: 'OCCUPIED' },
        });

        try {
          let studentProfile = await prisma.student.findUnique({
            where: { userId: dbBooking.userId },
          });
          if (!studentProfile) {
            studentProfile = await prisma.student.create({
              data: { userId: dbBooking.userId },
            });
          }

          const existingTenancy = await prisma.tenancy.findFirst({
            where: {
              OR: [
                { bookingId: dbBooking.id },
                { studentId: studentProfile.id, bedId: dbBooking.bedId, isActive: true },
              ],
            },
          });

          if (!existingTenancy) {
            await prisma.tenancy.create({
              data: {
                studentId: studentProfile.id,
                bookingId: dbBooking.id,
                bedId: dbBooking.bedId,
                startDate: new Date(),
                isActive: true,
              },
            });
          }

          await prisma.payment.create({
            data: {
              userId: dbBooking.userId,
              amount: escrowAmount,
              type: 'RENT',
              status: 'SUCCESS',
              method: 'ESCROW_RELEASE',
              transactionId: `ESC-REL-${bookingId.slice(-6)}-${Date.now()}`,
              description: `Move-In Escrow Released for ${dbBooking.property?.name || 'Property'}`,
            },
          });
        } catch (tenancyErr) {
          console.warn('Tenancy/payment creation skipped in verify-movein:', tenancyErr);
        }
      }
    } catch (e) {
      console.warn('DB sync skipped in verify-movein:', e);
    }

    return NextResponse.json({
      success: true,
      action: 'ESCROW_RELEASED',
      escrowAmount,
      booking: sanitizeBookingUsers(updatedStore || updatedDb || activeBooking),
      message: `Move-In Handshake Verified! ₹${(escrowAmount / 100).toLocaleString('en-IN')} has been released from the UniNest Escrow Vault to your Bank Account. Tenancy is now ACTIVE!`,
    });
  } catch (error: any) {
    console.error('Move-in verification error:', error);
    return NextResponse.json({ error: error?.message || 'Failed to verify Move-In' }, { status: 500 });
  }
}
