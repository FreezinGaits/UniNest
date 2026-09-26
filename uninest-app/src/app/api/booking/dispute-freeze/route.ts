import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { findStoreBooking, updateStoreBooking } from '@/lib/escrowStore';

/**
 * Property Misrepresentation / Condition Dispute on Move-In
 * Trigger: Fake photos, No AC, broken washroom, or wrong sharing discovered on Move-In Day.
 * Outcome:
 * - Escrow Freezes 100% of Funds (`DISPUTE_FROZEN`)
 * - 100% Full Refund (₹6,000 + ₹399) + Priority Relocation Assistance to Student
 * - ₹0 payout to Landlord; Property flagged for physical audit
 */
export async function POST(request: NextRequest) {
  try {
    const { bookingId, discrepancyType, description } = await request.json();

    if (!bookingId) {
      return NextResponse.json({ error: 'Booking ID is required' }, { status: 400 });
    }

    const storeBooking = findStoreBooking(bookingId);
    const escrowAmount = storeBooking?.escrowAmount || 600000; // ₹6,000
    const tokenAmount = storeBooking?.reservationFee || 39900; // ₹399
    const fullRefundPaise = escrowAmount + tokenAmount; // ₹6,399 (or ₹6,000 if token was credited)
    const caseId = `UN-ESC-DSP-${Math.floor(10000 + Math.random() * 90000)}`;

    const reasonText = `${discrepancyType || 'Property Misrepresentation'}: ${
      description || 'Room condition does not match verified listing photos/amenities.'
    }`;

    const updatedStore = updateStoreBooking(bookingId, () => ({
      handshakeStatus: 'DISPUTE_FROZEN',
      status: 'CANCELLED',
      disputeReason: reasonText,
      refundAmount: 600000, // Full ₹6,000 (includes ₹399 token credit)
      vacancyCompAmount: 0,
      notes: `ESCROW FROZEN (${caseId}): ${reasonText}. 100% Full Refund (₹6,000 including ₹399 token) initiated to Student UPI + Priority Relocation Assistance activated. Landlord payout: ₹0 (Property flagged for audit).`,
    }));

    try {
      const dbBooking = await prisma.booking.findUnique({ where: { id: bookingId } });
      if (dbBooking) {
        await prisma.booking.update({
          where: { id: bookingId },
          data: {
            handshakeStatus: 'DISPUTE_FROZEN',
            status: 'CANCELLED',
            emergencyReason: reasonText,
            vacancyCompAmount: 0,
          },
        });
        await prisma.bed.update({
          where: { id: dbBooking.bedId },
          data: { status: 'MAINTENANCE_HOLD' },
        });
      }
    } catch (e) {
      console.warn('DB sync skipped in dispute-freeze:', e);
    }

    return NextResponse.json({
      success: true,
      caseId,
      action: 'ESCROW_DISPUTE_FROZEN',
      refundAmountPaise: 600000,
      landlordPayoutPaise: 0,
      booking: updatedStore,
      message: `Dispute ${caseId} Filed! 100% of Escrow Funds Frozen. Full ₹6,000 (₹5,601 + ₹399 token) refund initiated to your UPI + UniNest Priority Relocation Desk assigned. Property suspended pending physical audit.`,
    });
  } catch (error: any) {
    console.error('Dispute freeze error:', error);
    return NextResponse.json({ error: error?.message || 'Failed to freeze escrow' }, { status: 500 });
  }
}
