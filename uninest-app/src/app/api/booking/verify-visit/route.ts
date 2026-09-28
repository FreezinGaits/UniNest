import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { findStoreBooking, getEscrowStore, updateStoreBooking } from '@/lib/escrowStore';

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
    const { bookingId, otp, decision, reason, feedback } = await request.json();
    // decision: 'VERIFY_ONLY' | 'ACCEPTED' | 'REJECTED' | 'EMERGENCY_CANCEL'

    if (!bookingId) {
      return NextResponse.json({ error: 'Booking ID required' }, { status: 400 });
    }

    const store = getEscrowStore();
    const rawStoreBooking = findStoreBooking(bookingId);
    const currentBooking = rawStoreBooking?.id === bookingId ? rawStoreBooking : undefined;

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

      const updatedStore = currentBooking
        ? updateStoreBooking(bookingId, () => ({
            handshakeStatus: 'REFUNDED_EMERGENCY',
            postVisitDecision: 'EMERGENCY_CANCEL',
            status: 'CANCELLED',
            emergencyReason: reason || 'Verified Student Emergency',
            emergencyWaiverCount: newWaiverCount,
            refundAmount: 39900,
            notes: `1-Click Emergency Waiver Triggered (${reason || 'Emergency'}). 100% Refund (₹399) dispatched to student UPI within 2 hours.`,
          }))
        : null;

      let updatedDb: any = null;
      try {
        if (dbBooking) {
          updatedDb = await prisma.booking.update({
            where: { id: bookingId },
            data: {
              handshakeStatus: 'REFUNDED_EMERGENCY',
              postVisitDecision: 'EMERGENCY_CANCEL',
              status: 'CANCELLED',
              emergencyReason: reason || 'Verified Student Emergency',
              emergencyWaiverCount: { increment: 1 },
            },
            include: {
              user: true,
              property: { include: { landlord: { include: { user: true } } } },
              bed: { include: { room: true } },
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
        booking: sanitizeBookingUsers(updatedStore || updatedDb || activeBooking),
        message: `Emergency Waiver approved (${reason || 'Emergency'}). 100% Refund of ₹399 initiated to your UPI (within 2 hours). Bed released back to marketplace.`,
      });
    }

    // ─── 2. VISIT OTP VERIFICATION & POST-VISIT DECISION ─────────────────────
    if (decision === 'VERIFY_ONLY' || decision === 'ACCEPTED' || decision === 'REJECTED') {
      const cleanOtp = (otp || '').toString().trim();
      const expectedOtp = activeBooking.visitOtp || currentBooking?.visitOtp;

      // When decision is VERIFY_ONLY, validate the 4-digit OTP
      if (decision === 'VERIFY_ONLY') {
        if (!cleanOtp || cleanOtp.length !== 4) {
          return NextResponse.json({ error: 'Please enter the 4-digit Visit OTP shared by the landlord.' }, { status: 400 });
        }
        if (!expectedOtp || cleanOtp !== expectedOtp) {
          return NextResponse.json(
            { error: `Invalid Visit OTP. Ask the landlord to generate/share the 4-digit PIN.` },
            { status: 400 }
          );
        }

        const nowIso = new Date().toISOString();
        const updatedStore = currentBooking
          ? updateStoreBooking(bookingId, () => ({
              visitVerifiedAt: nowIso,
              handshakeStatus: 'VISIT_OTP_VERIFIED',
              status: 'VISITED',
              notes: 'Stage 1 Handshake Complete: Physical PG visit verified via 4-digit OTP. Awaiting student decision.',
            }))
          : null;

        let updatedDb: any = null;
        try {
          if (dbBooking) {
            updatedDb = await prisma.booking.update({
              where: { id: bookingId },
              data: {
                visitVerifiedAt: new Date(),
                handshakeStatus: 'VISIT_OTP_VERIFIED',
                status: 'VISITED',
              },
              include: {
                user: true,
                property: { include: { landlord: { include: { user: true } } } },
                bed: { include: { room: true } },
              },
            });
          }
        } catch (e) {
          console.warn('DB sync skipped in OTP verify:', e);
        }

        return NextResponse.json({
          success: true,
          action: 'OTP_VERIFIED',
          booking: sanitizeBookingUsers(updatedStore || updatedDb || activeBooking),
          message: 'Visit OTP verified! Physical visit recorded on the UniNest Trust Ledger. Now choose whether you love the room or want an instant ₹399 refund.',
        });
      }

      // For ACCEPTED or REJECTED, verify that visitVerifiedAt is already set OR valid OTP is provided
      const isAlreadyVerified = Boolean(
        activeBooking.visitVerifiedAt || currentBooking?.visitVerifiedAt
      );
      const otpMatches = Boolean(cleanOtp && expectedOtp && cleanOtp === expectedOtp);
      if (!isAlreadyVerified && !otpMatches) {
        return NextResponse.json(
          { error: 'Visit OTP must be verified before submitting a post-visit decision.' },
          { status: 400 }
        );
      }

      // ─── 2A. ROOM ACCEPTED ("I Love It! ❤️") ───────────────────────────────
      if (decision === 'ACCEPTED') {
        const rentPaise = activeBooking.bed?.room?.rent || 600000; // ₹6,000
        const creditPaise = 39900; // ₹399
        const remainingPaise = rentPaise - creditPaise; // ₹5,601 (560100 paise)

        const updatedStore = currentBooking
          ? updateStoreBooking(bookingId, (b) => ({
              visitVerifiedAt: b.visitVerifiedAt || new Date().toISOString(),
              handshakeStatus: 'VISIT_OTP_VERIFIED',
              postVisitDecision: 'ACCEPTED',
              status: 'CONFIRMED',
              notes: `Room Accepted! ₹399 token credited towards 1st Month Rent. Pay remaining ₹${(remainingPaise / 100).toLocaleString('en-IN')} into UniNest Escrow Vault.`,
            }))
          : null;

        let updatedDb: any = null;
        try {
          if (dbBooking) {
            updatedDb = await prisma.booking.update({
              where: { id: bookingId },
              data: {
                visitVerifiedAt: dbBooking.visitVerifiedAt || new Date(),
                handshakeStatus: 'VISIT_OTP_VERIFIED',
                postVisitDecision: 'ACCEPTED',
                status: 'CONFIRMED',
              },
              include: {
                user: true,
                property: { include: { landlord: { include: { user: true } } } },
                bed: { include: { room: true } },
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
          booking: sanitizeBookingUsers(updatedStore || updatedDb || activeBooking),
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

        const updatedStore = currentBooking
          ? updateStoreBooking(bookingId, (b) => ({
              visitVerifiedAt: b.visitVerifiedAt || new Date().toISOString(),
              handshakeStatus: 'VISIT_OTP_VERIFIED',
              postVisitDecision: 'REJECTED',
              status: 'CANCELLED',
              visitRejectCount: newRejectCount,
              refundAmount: 39900,
              notes: `Visit Completed — Room Rejected by Student. 100% Instant Refund (₹399) dispatched to Student UPI. Bed reverted to AVAILABLE.`,
            }))
          : null;

        let updatedDb: any = null;
        try {
          if (dbBooking) {
            updatedDb = await prisma.booking.update({
              where: { id: bookingId },
              data: {
                visitVerifiedAt: dbBooking.visitVerifiedAt || new Date(),
                handshakeStatus: 'VISIT_OTP_VERIFIED',
                postVisitDecision: 'REJECTED',
                status: 'CANCELLED',
                visitRejectCount: newRejectCount,
              },
              include: {
                user: true,
                property: { include: { landlord: { include: { user: true } } } },
                bed: { include: { room: true } },
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
          booking: sanitizeBookingUsers(updatedStore || updatedDb || activeBooking),
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
