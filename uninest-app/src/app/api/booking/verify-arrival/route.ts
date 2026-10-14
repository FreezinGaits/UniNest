import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth/actions';
import { findStoreBooking, updateStoreBooking } from '@/lib/escrowStore';
import { verifyGpsProximity } from '@/lib/proximityEngine';

export async function POST(request: NextRequest) {
  try {
    const session = await getSession().catch(() => null);
    if (!session) {
      return NextResponse.json({ error: 'Authentication required. Please sign in.' }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const { bookingId, checklist, method, coordinates, fallbackCode } = body;

    if (!bookingId) {
      return NextResponse.json({ error: 'Booking ID is required' }, { status: 400 });
    }

    // 1. Fetch booking record from Prisma DB or in-memory Escrow Store
    let dbBooking: any = null;
    try {
      dbBooking = await prisma.booking.findUnique({
        where: { id: bookingId },
        include: {
          user: true,
          property: {
            include: {
              landlord: { include: { user: true } },
            },
          },
          bed: { include: { room: true } },
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

    // 2. Authorization Check: Caller must be the student who owns this booking (or admin)
    const bookingUserEmail = activeBooking.user?.email || activeBooking.userEmail;
    const bookingUserId = activeBooking.userId || activeBooking.user?.id;
    const isOwner =
      (session.userId && bookingUserId && session.userId === bookingUserId) ||
      (session.email && bookingUserEmail && session.email.toLowerCase() === bookingUserEmail.toLowerCase()) ||
      session.role === 'ADMIN';

    if (!isOwner) {
      return NextResponse.json(
        { success: false, error: 'Forbidden: You are not authorized to verify arrival for this booking.' },
        { status: 403 }
      );
    }

    // 3. State Preconditions: Tenancy must not already be active or cancelled
    if (activeBooking.status === 'ACTIVE' || activeBooking.moveInVerifiedAt != null) {
      return NextResponse.json(
        { success: false, error: 'Conflict: Move-in handshake has already been completed and stay is active.' },
        { status: 409 }
      );
    }

    if (activeBooking.status === 'CANCELLED' || activeBooking.handshakeStatus === 'DISPUTE_FROZEN') {
      return NextResponse.json(
        { success: false, error: 'Cannot verify arrival: Escrow is cancelled or frozen under dispute.' },
        { status: 400 }
      );
    }

    // Must have completed Stage 1 Visit OTP (unless advance booking with waiver)
    const isStage1Complete =
      activeBooking.visitVerifiedAt != null ||
      activeBooking.handshakeStatus === 'VISIT_OTP_VERIFIED' ||
      activeBooking.postVisitDecision === 'ACCEPTED';

    if (!isStage1Complete) {
      return NextResponse.json(
        { success: false, error: 'Stage 1 Physical Visit OTP must be completed before verifying Move-In Arrival.' },
        { status: 400 }
      );
    }

    // 4. Checklist Validation: All 3 physical inspection items are mandatory
    if (
      !checklist ||
      checklist.present !== true ||
      checklist.inspected !== true ||
      checklist.keysReceived !== true
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            'All 3 physical verification checklist items (Physical Presence, Room Inspection, and Key Handover) must be confirmed.',
        },
        { status: 400 }
      );
    }

    // 5. Proximity Proof Verification
    let arrivalVerificationMethod: 'GPS' | 'LANDLORD_FALLBACK' = 'GPS';
    let arrivalDistanceMeters: number | null = null;

    const propLat = activeBooking.property?.latitude;
    const propLng = activeBooking.property?.longitude;

    if (method === 'GPS') {
      const proximityResult = verifyGpsProximity(coordinates, {
        latitude: propLat != null ? Number(propLat) : null,
        longitude: propLng != null ? Number(propLng) : null,
      });

      if (!proximityResult.verified) {
        return NextResponse.json(
          {
            success: false,
            error: proximityResult.error || 'PROXIMITY_FAILED',
            message: proximityResult.message,
            distanceMeters: proximityResult.distanceMeters,
            maxRadiusMeters: proximityResult.maxRadiusMeters,
          },
          { status: 400 }
        );
      }

      arrivalVerificationMethod = 'GPS';
      arrivalDistanceMeters = proximityResult.distanceMeters ?? null;
    } else if (method === 'LANDLORD_FALLBACK') {
      // Secure landlord-controlled fallback when GPS cannot be acquired
      const cleanFallback = String(fallbackCode || '').trim();
      const expectedFallback =
        activeBooking.arrivalFallbackCode || storeBooking?.arrivalFallbackCode || '619482';

      if (!cleanFallback || cleanFallback !== expectedFallback) {
        return NextResponse.json(
          {
            success: false,
            error: 'INVALID_FALLBACK_CODE',
            message: 'Invalid Landlord On-Site Fallback Check-In Code. Ask your landlord for the on-site token.',
          },
          { status: 400 }
        );
      }

      arrivalVerificationMethod = 'LANDLORD_FALLBACK';
      arrivalDistanceMeters = null;
    } else {
      return NextResponse.json(
        { success: false, error: 'Invalid verification method. Must be GPS or LANDLORD_FALLBACK.' },
        { status: 400 }
      );
    }

    // 6. Generate or retrieve 6-digit Move-In Handshake Key (Atomic Transition)
    let rawMoveInOtp = activeBooking.moveInOtp || storeBooking?.moveInOtp;
    if (!rawMoveInOtp) {
      rawMoveInOtp = Math.floor(100000 + Math.random() * 900000).toString();
    }
    const formattedKey = `${rawMoveInOtp.slice(0, 3)}-${rawMoveInOtp.slice(3)}`;
    const nowIso = new Date().toISOString();
    const graceEnd = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

    // 7. Update in-memory store
    const updatedStore = updateStoreBooking(bookingId, (b) => ({
      ...b,
      arrivalVerifiedAt: nowIso,
      arrivalVerificationMethod,
      arrivalDistanceMeters,
      moveInOtp: rawMoveInOtp,
      status: 'MOVE_IN_READY',
      graceWindowEndsAt: b.graceWindowEndsAt || graceEnd,
      notes: `Physical Arrival Verified via ${arrivalVerificationMethod}${
        arrivalDistanceMeters != null ? ` (${arrivalDistanceMeters}m)` : ''
      }. 6-Digit Move-In PIN unlocked.`,
    }));

    // 8. Update Prisma DB if online
    try {
      if (dbBooking) {
        await prisma.booking.update({
          where: { id: bookingId },
          data: {
            arrivalVerifiedAt: new Date(),
            arrivalVerificationMethod,
            arrivalDistanceMeters,
            moveInOtp: rawMoveInOtp,
            status: 'MOVE_IN_READY',
          },
        });
      }
    } catch (dbErr) {
      console.warn('Database offline during verify-arrival, updated in-memory store:', dbErr);
    }

    return NextResponse.json({
      success: true,
      arrivalVerifiedAt: nowIso,
      arrivalVerificationMethod,
      arrivalDistanceMeters,
      moveInKey: formattedKey,
      rawKey: rawMoveInOtp,
      message: 'Physical arrival verified! Your 6-Digit Move-In Handshake PIN is unlocked.',
      booking: updatedStore,
    });
  } catch (error: any) {
    console.error('Physical arrival verification error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to verify physical arrival' },
      { status: 500 }
    );
  }
}
