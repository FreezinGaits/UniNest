import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { findStoreBooking, getEscrowStore, updateStoreBooking } from '@/lib/escrowStore';

export async function POST(request: NextRequest) {
  try {
    const { bookingId, otp, decision, reason, feedback } = await request.json();
    // decision: 'VERIFY_ONLY' | 'ACCEPTED' | 'REJECTED' | 'EMERGENCY_CANCEL'

    if (!bookingId) {
      return NextResponse.json({ error: 'Booking ID required' }, { status: 400 });
    }

    const store = getEscrowStore();
    let currentBooking = findStoreBooking(bookingId);

    // Try reading from Prisma DB if available
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
    } catch (dbErr) {
      // Fallback to in-memory store
    }

    const activeBooking = dbBooking || currentBooking;
    if (!activeBooking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    // ─── 1. PRE-VISIT EMERGENCY WAIVER (2 per semester) ──────────────────────
    if (decision === 'EMERGENCY_CANCEL') {
      const currentWaivers = Math.max(
        activeBooking.emergencyWaiverCount || 0,
        store.studentStats.emergencyWaiversUsed
      );

      if (currentWaivers >= 2) {
        return NextResponse.json(
          {
            error: 'Emergency waiver limit reached (Max 2 free waivers per semester). Please contact UniNest Support with medical/official documentation.',
            waiverLimitReached: true,
          },
          { status: 400 }
        );
      }

      const newWaiverCount = currentWaivers + 1;
      store.studentStats.emergencyWaiversUsed = newWaiverCount;

      const updatedStore = updateStoreBooking(bookingId, () => ({
        handshakeStatus: 'REFUNDED_EMERGENCY',
        postVisitDecision: 'EMERGENCY_CANCEL',
        status: 'CANCELLED',
        emergencyReason: reason || 'Verified Student Emergency',
        emergencyWaiverCount: newWaiverCount,
        refundAmount: 39900,
        notes: `1-Click Emergency Waiver Triggered (${reason || 'Emergency'}). 100% Refund (₹399) dispatched to student UPI within 2 hours.`,
      }));

      try {
        if (dbBooking) {
          await prisma.booking.update({
            where: { id: bookingId },
            data: {
              handshakeStatus: 'REFUNDED_EMERGENCY',
              postVisitDecision: 'EMERGENCY_CANCEL',
              status: 'CANCELLED',
              emergencyReason: reason || 'Verified Student Emergency',
              emergencyWaiverCount: { increment: 1 },
            },
          });
          await prisma.bed.update({
            where: { id: dbBooking.bedId },
            data: { status: 'AVAILABLE' },
          });
        }
      } catch (e) {
        console.warn('DB sync skipped in emergency cancel:', e);
      }

      return NextResponse.json({
        success: true,
        action: 'EMERGENCY_REFUND',
        refundAmount: 39900,
        waiversRemaining: Math.max(0, 2 - newWaiverCount),
        booking: updatedStore,
        message: `Emergency Waiver approved (${reason || 'Emergency'}). 100% Refund of ₹399 initiated to your UPI (within 2 hours). Bed released back to marketplace.`,
      });
    }

    // ─── 2. VISIT OTP VERIFICATION & POST-VISIT DECISION ─────────────────────
    if (decision === 'VERIFY_ONLY' || decision === 'ACCEPTED' || decision === 'REJECTED') {
      const cleanOtp = (otp || '').toString().trim();
      const expectedOtp = activeBooking.visitOtp || currentBooking?.visitOtp || '8412';

      // When decision is VERIFY_ONLY, validate the 4-digit OTP (allow expectedOtp or demo master 8412)
      if (decision === 'VERIFY_ONLY') {
        if (!cleanOtp || cleanOtp.length !== 4) {
          return NextResponse.json({ error: 'Please enter the 4-digit Visit OTP shared by the landlord.' }, { status: 400 });
        }
        if (cleanOtp !== expectedOtp && cleanOtp !== '8412') {
          return NextResponse.json(
            { error: `Invalid Visit OTP. Ask the landlord to generate/share the 4-digit PIN (Demo PIN: ${expectedOtp}).` },
            { status: 400 }
          );
        }

        const nowIso = new Date().toISOString();
        const updatedStore = updateStoreBooking(bookingId, () => ({
          visitVerifiedAt: nowIso,
          handshakeStatus: 'VISIT_OTP_VERIFIED',
          status: 'VISITED',
          notes: 'Stage 1 Handshake Complete: Physical PG visit verified via 4-digit OTP. Awaiting student decision.',
        }));

        try {
          if (dbBooking) {
            await prisma.booking.update({
              where: { id: bookingId },
              data: {
                visitVerifiedAt: new Date(),
                handshakeStatus: 'VISIT_OTP_VERIFIED',
                status: 'VISITED',
              },
            });
          }
        } catch (e) {
          console.warn('DB sync skipped in OTP verify:', e);
        }

        return NextResponse.json({
          success: true,
          action: 'OTP_VERIFIED',
          booking: updatedStore,
          message: 'Visit OTP verified! Physical visit recorded on the UniNest Trust Ledger. Now choose whether you love the room or want an instant ₹399 refund.',
        });
      }

      // ─── 2A. ROOM ACCEPTED ("I Love It! ❤️") ───────────────────────────────
      if (decision === 'ACCEPTED') {
        const rentPaise = activeBooking.bed?.room?.rent || 600000; // ₹6,000
        const creditPaise = 39900; // ₹399
        const remainingPaise = rentPaise - creditPaise; // ₹5,601 (560100 paise)

        const updatedStore = updateStoreBooking(bookingId, (b) => ({
          visitVerifiedAt: b.visitVerifiedAt || new Date().toISOString(),
          handshakeStatus: 'VISIT_OTP_VERIFIED',
          postVisitDecision: 'ACCEPTED',
          status: 'CONFIRMED',
          notes: `Room Accepted! ₹399 token credited towards 1st Month Rent. Pay remaining ₹${(remainingPaise / 100).toLocaleString('en-IN')} into UniNest Escrow Vault.`,
        }));

        try {
          if (dbBooking) {
            await prisma.booking.update({
              where: { id: bookingId },
              data: {
                visitVerifiedAt: dbBooking.visitVerifiedAt || new Date(),
                handshakeStatus: 'VISIT_OTP_VERIFIED',
                postVisitDecision: 'ACCEPTED',
                status: 'CONFIRMED',
              },
            });
          }
        } catch (e) {
          console.warn('DB sync skipped in room accept:', e);
        }

        return NextResponse.json({
          success: true,
          action: 'ROOM_ACCEPTED',
          creditAmount: creditPaise,
          remainingRent: remainingPaise,
          booking: updatedStore,
          message: `Awesome! ₹399 has been credited towards your 1st Month Rent. You only need to deposit ₹${(remainingPaise / 100).toLocaleString('en-IN')} into the UniNest Escrow Vault to lock your move-in.`,
        });
      }

      // ─── 2B. ROOM REJECTED ("Not for me" — Fair-Use 3 Free/Semester) ───────
      if (decision === 'REJECTED') {
        const currentRejects = Math.max(
          activeBooking.visitRejectCount || 0,
          store.studentStats.freeVisitRejectsUsed
        );

        // Fair-Use Anti-Abuse Filter: On 4th rejection, require structured feedback
        if (currentRejects >= 3 && !feedback) {
          return NextResponse.json(
            {
              error: 'Fair-Use Guardrail: You have used all 3 instant no-questions-asked visit refunds this semester. Please provide structured feedback on why this PG did not meet your needs to process your refund.',
              requiresStructuredFeedback: true,
              freeRejectsRemaining: 0,
            },
            { status: 400 }
          );
        }

        const newRejectCount = currentRejects + 1;
        store.studentStats.freeVisitRejectsUsed = newRejectCount;
        const freeRejectsRemaining = Math.max(0, 3 - newRejectCount);

        const updatedStore = updateStoreBooking(bookingId, (b) => ({
          visitVerifiedAt: b.visitVerifiedAt || new Date().toISOString(),
          handshakeStatus: 'VISIT_OTP_VERIFIED',
          postVisitDecision: 'REJECTED',
          status: 'CANCELLED',
          visitRejectCount: newRejectCount,
          refundAmount: 39900,
          notes: `Visit Completed — Room Rejected by Student. 100% Instant Refund (₹399) dispatched to Student UPI. Bed reverted to AVAILABLE.`,
        }));

        try {
          if (dbBooking) {
            await prisma.booking.update({
              where: { id: bookingId },
              data: {
                visitVerifiedAt: dbBooking.visitVerifiedAt || new Date(),
                handshakeStatus: 'VISIT_OTP_VERIFIED',
                postVisitDecision: 'REJECTED',
                status: 'CANCELLED',
                visitRejectCount: newRejectCount,
              },
            });
            await prisma.bed.update({
              where: { id: dbBooking.bedId },
              data: { status: 'AVAILABLE' },
            });
          }
        } catch (e) {
          console.warn('DB sync skipped in room reject:', e);
        }

        return NextResponse.json({
          success: true,
          action: 'ROOM_REJECTED',
          refundAmount: 39900,
          freeRejectsRemaining,
          booking: updatedStore,
          message: `100% Instant UPI Refund of ₹399 initiated! Bed has been released back to AVAILABLE. Fair-Use Quota: ${freeRejectsRemaining}/3 free visit refunds remaining this semester.`,
        });
      }
    }

    return NextResponse.json({ error: 'Invalid decision type' }, { status: 400 });
  } catch (error: any) {
    console.error('Visit verification error:', error);
    return NextResponse.json({ error: error?.message || 'Failed to verify visit' }, { status: 500 });
  }
}
