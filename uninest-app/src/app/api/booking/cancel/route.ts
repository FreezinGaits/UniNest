import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { findStoreBooking, updateStoreBooking } from '@/lib/escrowStore';

export async function POST(request: NextRequest) {
  try {
    const { bookingId, reason, mode, simulatedDaysUntilMoveIn } = await request.json();
    // mode: 'STANDARD' | 'NO_SHOW_72H' | 'ADVANCE_TIERED'

    if (!bookingId) {
      return NextResponse.json({ error: 'Booking ID is required' }, { status: 400 });
    }

    const storeBooking = findStoreBooking(bookingId);
    let dbBooking: any = null;
    try {
      dbBooking = await prisma.booking.findUnique({
        where: { id: bookingId },
        include: { property: { include: { landlord: { include: { user: true } } } } },
      });
    } catch (e) {
      // Fallback to in-memory store
    }

    const booking = dbBooking || storeBooking;
    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    let refundPercentage = 100;
    let refundAmount = 0; // in paise
    let landlordAmount = 0; // in paise
    let platformAmount = 0; // in paise
    let policyLabel = 'Voluntary Cancellation';

    // ─── SCENARIO A: 72-HOUR UNEXPLAINED NO-SHOW (₹200 Landlord / ₹199 Platform) ───
    if (mode === 'NO_SHOW_72H') {
      refundPercentage = 0;
      refundAmount = 0;
      landlordAmount = 20000; // ₹200 Vacancy Disturbance Credit
      platformAmount = 19900; // ₹199 UniNest Operating Cost
      policyLabel = '72-Hour Unexplained Visit No-Show Split';
    }
    // ─── SCENARIO B: ADVANCE BOOKING TIERED CANCELLATION (15–45 Days) ───────────
    else if (booking.reservationType === 'ADVANCE_SESSION' || mode === 'ADVANCE_TIERED') {
      const moveInTarget = booking.agreedMoveInDate || booking.moveInDate;
      const daysUntilMoveIn =
        typeof simulatedDaysUntilMoveIn === 'number'
          ? simulatedDaysUntilMoveIn
          : moveInTarget
          ? Math.ceil((new Date(moveInTarget).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
          : 35;

      const tokenAmount = booking.advanceTokenAmount || booking.reservationFee || 90000; // ₹900 default 15% token

      if (daysUntilMoveIn > 30) {
        refundPercentage = 85;
        refundAmount = Math.floor(tokenAmount * 0.85);
        platformAmount = tokenAmount - refundAmount;
        landlordAmount = 0;
        policyLabel = `Advance Cancel (>30 Days Left: ${daysUntilMoveIn}d) — 85% Student Refund`;
      } else if (daysUntilMoveIn >= 15) {
        refundPercentage = 50;
        refundAmount = Math.floor(tokenAmount * 0.5);
        landlordAmount = tokenAmount - refundAmount;
        platformAmount = 0;
        policyLabel = `Advance Cancel (15–30 Days Left: ${daysUntilMoveIn}d) — 50% Refund / 50% Landlord`;
      } else {
        refundPercentage = 0;
        refundAmount = 0;
        landlordAmount = tokenAmount;
        platformAmount = 0;
        policyLabel = `Last-Minute Advance Cancel (<7 Days Left: ${daysUntilMoveIn}d) — 100% Token to Landlord`;
      }
    }
    // ─── SCENARIO C: STANDARD IMMEDIATE TOKEN CANCEL ───────────────────────────
    else {
      const hoursElapsed = (Date.now() - new Date(booking.createdAt).getTime()) / (1000 * 60 * 60);
      if (hoursElapsed >= 72 && !booking.visitVerifiedAt) {
        refundPercentage = 0;
        refundAmount = 0;
        landlordAmount = 20000; // ₹200
        platformAmount = 19900; // ₹199
        policyLabel = '72h Token Expired Without Visit — ₹200 Landlord / ₹199 Platform';
      } else {
        refundPercentage = 100;
        refundAmount = booking.reservationFee || 39900;
        landlordAmount = 0;
        platformAmount = 0;
        policyLabel = 'Within 72h Window — 100% Token Refund';
      }
    }

    const updatedStore = updateStoreBooking(bookingId, () => ({
      status: mode === 'NO_SHOW_72H' ? 'EXPIRED' : 'CANCELLED',
      handshakeStatus: refundPercentage > 0 ? 'REFUNDED_EMERGENCY' : 'AUTO_RELEASED_GRACE',
      emergencyReason: reason || policyLabel,
      vacancyCompAmount: landlordAmount,
      refundAmount,
      notes: `${policyLabel}. Student Refund: ₹${(refundAmount / 100).toLocaleString('en-IN')} (${refundPercentage}%). Landlord Vacancy Credit: ₹${(landlordAmount / 100).toLocaleString('en-IN')}.`,
    }));

    try {
      if (dbBooking) {
        await prisma.booking.update({
          where: { id: bookingId },
          data: {
            status: mode === 'NO_SHOW_72H' ? 'EXPIRED' : 'CANCELLED',
            handshakeStatus: refundPercentage > 0 ? 'REFUNDED_EMERGENCY' : 'AUTO_RELEASED_GRACE',
            emergencyReason: reason || policyLabel,
            vacancyCompAmount: landlordAmount,
          },
        });
        await prisma.bed.update({
          where: { id: dbBooking.bedId },
          data: { status: 'AVAILABLE' },
        });
      }
    } catch (e) {
      console.warn('DB sync skipped in cancel:', e);
    }

    return NextResponse.json({
      success: true,
      policyLabel,
      refundPercentage,
      refundAmount,
      landlordAmount,
      platformAmount,
      booking: updatedStore,
      message:
        mode === 'NO_SHOW_72H'
          ? `72-Hour No-Show Enforced: ₹399 Token split → ₹200 credited to Landlord Vacancy Fund, ₹199 to UniNest Operating Cost. Bed unlocked to AVAILABLE.`
          : refundPercentage > 0
          ? `${policyLabel}: ₹${(refundAmount / 100).toLocaleString('en-IN')} (${refundPercentage}%) refunded to Student UPI.${
              landlordAmount > 0 ? ` ₹${(landlordAmount / 100).toLocaleString('en-IN')} paid to Landlord.` : ''
            }`
          : `${policyLabel}: 0% Refund. ₹${(landlordAmount / 100).toLocaleString('en-IN')} credited to Landlord Vacancy Fund.`,
    });
  } catch (error: any) {
    console.error('Cancellation error:', error);
    return NextResponse.json({ error: error?.message || 'Failed to cancel booking' }, { status: 500 });
  }
}
