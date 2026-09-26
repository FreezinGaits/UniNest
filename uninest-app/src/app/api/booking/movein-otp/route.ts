import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { findStoreBooking, updateStoreBooking } from '@/lib/escrowStore';

export async function POST(request: NextRequest) {
  try {
    const { bookingId } = await request.json();

    if (!bookingId) {
      return NextResponse.json({ error: 'Booking ID is required' }, { status: 400 });
    }

    // Generate 6-digit Move-In Key
    const moveInKey = Math.floor(100000 + Math.random() * 900000).toString();
    const graceEnd = new Date();
    graceEnd.setDate(graceEnd.getDate() + 7); // 7-day grace window

    // 1. Update in-memory store
    const updatedStore = updateStoreBooking(bookingId, (b) => ({
      moveInOtp: moveInKey,
      status: 'MOVE_IN_READY',
      escrowAmount: b.escrowAmount || 600000,
      graceWindowEndsAt: graceEnd.toISOString(),
      notes: `Stage 2 Move-In Key (${moveInKey.slice(0, 3)}-${moveInKey.slice(3)}) generated. Share with Landlord upon physical check-in to release ₹6,000 Escrow.`,
    }));

    // 2. Try updating Prisma DB if online
    try {
      const booking = await prisma.booking.findUnique({
        where: { id: bookingId },
        include: { property: { include: { landlord: { include: { user: true } } } } },
      });

      if (booking) {
        await prisma.booking.update({
          where: { id: bookingId },
          data: {
            moveInOtp: moveInKey,
            status: 'MOVE_IN_READY',
            graceWindowEndsAt: graceEnd,
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
      graceWindowEndsAt: graceEnd.toISOString(),
      booking: updatedStore || findStoreBooking(bookingId),
      message: `Your 6-Digit Move-In Handshake Key is ${formattedKey}. Share this with your landlord after inspecting your room & receiving keys. 7-Day Grace Window active.`,
    });
  } catch (error: any) {
    console.error('Move-in key generation error:', error);
    return NextResponse.json({ error: error?.message || 'Failed to generate Move-In Key' }, { status: 500 });
  }
}
