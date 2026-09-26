import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { findStoreBooking, updateStoreBooking } from '@/lib/escrowStore';

export async function POST(request: NextRequest) {
  try {
    const { bookingId } = await request.json();

    if (!bookingId) {
      return NextResponse.json({ error: 'Booking ID is required' }, { status: 400 });
    }

    // Generate 4-digit OTP
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    const expiresAt = new Date(Date.now() + 72 * 60 * 60 * 1000); // 72 hours

    // 1. Update in-memory store (always works)
    const storeBooking = updateStoreBooking(bookingId, () => ({
      visitOtp: otp,
      visitOtpExpiresAt: expiresAt.toISOString(),
      handshakeStatus: 'PENDING',
    }));

    // 2. Try updating Prisma DB if online
    try {
      const booking = await prisma.booking.findUnique({
        where: { id: bookingId },
        include: { property: true },
      });

      if (booking) {
        await prisma.booking.update({
          where: { id: bookingId },
          data: {
            visitOtp: otp,
            visitOtpExpiresAt: expiresAt,
            handshakeStatus: 'PENDING',
          },
        });

        await prisma.notification.create({
          data: {
            userId: booking.userId,
            type: 'VISIT',
            title: '🔑 Visit OTP Generated',
            message: `Your landlord has generated a 4-digit Visit OTP for ${booking.property?.name || 'your reservation'}. Collect this PIN when you arrive physically at the PG.`,
            actionUrl: `/student/bookings/${bookingId}`,
          },
        });
      }
    } catch (dbErr) {
      console.warn('Database offline in visit-otp, synced with in-memory Escrow Store:', dbErr);
    }

    return NextResponse.json({
      success: true,
      otp,
      expiresAt: expiresAt.toISOString(),
      booking: storeBooking || findStoreBooking(bookingId),
      message: `4-Digit Visit OTP (${otp}) generated! Verbally share this PIN with the student when they arrive at the PG reception.`,
    });
  } catch (error: any) {
    console.error('Visit OTP generation error:', error);
    return NextResponse.json({ error: error?.message || 'Failed to generate OTP' }, { status: 500 });
  }
}
