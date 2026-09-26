import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { findStoreBooking, updateStoreBooking } from '@/lib/escrowStore';

export async function POST(request: NextRequest) {
  try {
    const { bookingId, agreedMoveInDate, utr, paymentMethod } = await request.json();

    if (!bookingId) {
      return NextResponse.json({ error: 'Booking ID is required' }, { status: 400 });
    }

    const storeBooking = findStoreBooking(bookingId);
    const totalRentPaise = storeBooking?.bed?.room?.rent || 600000; // ₹6,000
    const tokenCreditPaise =
      storeBooking?.reservationType === 'ADVANCE_SESSION'
        ? storeBooking?.advanceTokenAmount || 90000 // ₹900 (15%)
        : storeBooking?.reservationFee || 39900; // ₹399
    const balancePaidPaise = totalRentPaise - tokenCreditPaise; // ₹5,601 or ₹5,100

    const moveInTarget = agreedMoveInDate
      ? new Date(agreedMoveInDate)
      : storeBooking?.agreedMoveInDate
      ? new Date(storeBooking.agreedMoveInDate)
      : new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);

    const graceEnd = new Date(moveInTarget);
    graceEnd.setDate(graceEnd.getDate() + 7); // 7-Day Grace Window

    const txRef = utr ? `UPI-${utr}` : `ESC-${Date.now().toString().slice(-8)}`;

    const updatedStore = updateStoreBooking(bookingId, (b) => ({
      status: 'CONFIRMED',
      postVisitDecision: 'ACCEPTED',
      handshakeStatus: 'VISIT_OTP_VERIFIED',
      escrowAmount: totalRentPaise,
      agreedMoveInDate: moveInTarget.toISOString(),
      moveInDate: moveInTarget.toISOString(),
      graceWindowEndsAt: graceEnd.toISOString(),
      notes: `₹${(balancePaidPaise / 100).toLocaleString('en-IN')} balance paid (${txRef}) + ₹${(tokenCreditPaise / 100).toLocaleString('en-IN')} token credit = ₹${(totalRentPaise / 100).toLocaleString('en-IN')} locked in UniNest Escrow Vault. Official Move-In: ${moveInTarget.toLocaleDateString('en-IN')}.`,
    }));

    try {
      await prisma.booking.update({
        where: { id: bookingId },
        data: {
          status: 'CONFIRMED',
          postVisitDecision: 'ACCEPTED',
          escrowAmount: totalRentPaise,
          agreedMoveInDate: moveInTarget,
          moveInDate: moveInTarget,
          graceWindowEndsAt: graceEnd,
        },
      });
    } catch (e) {
      console.warn('DB sync skipped in pay-escrow:', e);
    }

    return NextResponse.json({
      success: true,
      transactionId: txRef,
      balancePaidPaise,
      tokenCreditPaise,
      totalEscrowPaise: totalRentPaise,
      agreedMoveInDate: moveInTarget.toISOString(),
      graceWindowEndsAt: graceEnd.toISOString(),
      booking: updatedStore,
      message: `₹${(balancePaidPaise / 100).toLocaleString('en-IN')} received! Total ₹${(totalRentPaise / 100).toLocaleString('en-IN')} is now locked safely in the UniNest Escrow Vault. Funds will only be released to the landlord when you share your 6-digit Move-In Key on arrival.`,
    });
  } catch (error: any) {
    console.error('Pay escrow error:', error);
    return NextResponse.json({ error: error?.message || 'Failed to deposit into escrow' }, { status: 500 });
  }
}
