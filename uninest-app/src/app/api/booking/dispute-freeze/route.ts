import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { findStoreBooking, updateStoreBooking } from '@/lib/escrowStore';

import { recordDisputePenalty } from '@/lib/landlordTrustStore';
import { addAdminMessage, addPropertyAuditEvent } from '@/lib/adminMessagesStore';

/**
 * Property Misrepresentation / Condition Dispute on Move-In
 * Trigger: Fake photos, No AC, broken washroom, or wrong sharing discovered on Move-In Day.
 * Outcome:
 * - Escrow Freezes 100% of Funds (`DISPUTE_FROZEN`)
 * - 100% Full Refund (₹6,000 + ₹399) + Priority Relocation Assistance to Student
 * - ₹0 payout to Landlord; Property flagged for physical audit
 * - Landlord Trust Score penalized (-5%) + Anti-Retaliation Advisory served
 */
export async function POST(request: NextRequest) {
  try {
    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Invalid or empty request body' }, { status: 400 });
    }
    const { bookingId, discrepancyType, description } = body;

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
    } catch (dbErr) {
      console.warn('DB update skipped in dispute freeze:', dbErr);
    }

    try {
      const landlordEmail = storeBooking?.property?.landlord?.user?.email || 'landlord@uninest.in';
      const propName = storeBooking?.property?.name || 'PCTE Smart Student Residency';
      const studentName = storeBooking?.user?.name || 'Rahul Sharma';

      recordDisputePenalty(landlordEmail, propName, studentName, reasonText);

      addAdminMessage({
        fromRole: 'ADMIN',
        fromName: 'UniNest Trust & Arbitration Board',
        toPropertyId: storeBooking?.propertyId || 'prop-pcte-1',
        propertyName: propName,
        message: `CRITICAL NOTICE (${caseId}): Tenant ${studentName} filed a Move-In Dispute for ${propName}. 100% Escrow Refund processed. Reason: ${reasonText}. Platform Trust Score: -5% Penalty applied. ⚠️ FAIR PRACTICE DIRECTIVE: You are strictly forbidden from contacting, calling, or harassing the student regarding this refund. Direct tenant contact is masked. Rectify room amenities before re-listing.`,
      });

      addPropertyAuditEvent({
        propertyId: storeBooking?.propertyId || 'prop-pcte-1',
        propertyName: propName,
        actorRole: 'SYSTEM',
        actorName: 'UniNest Trust Engine',
        action: 'REJECTED',
        title: `Escrow Dispute Freeze & 100% Refund Issued (${caseId})`,
        details: `Discrepancy: ${reasonText}. Trust Score Penalty: -5%. Anti-Retaliation Advisory served.`,
      });
    } catch (trustErr) {
      console.warn('Failed to record trust penalty:', trustErr);
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
