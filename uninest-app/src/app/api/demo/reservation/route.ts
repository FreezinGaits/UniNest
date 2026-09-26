import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getEscrowStore, EscrowBookingRecord } from '@/lib/escrowStore';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      propertyId,
      propertyName,
      roomId,
      bedId,
      userId,
      reservationType = 'IMMEDIATE_VISIT', // 'IMMEDIATE_VISIT' | 'ADVANCE_SESSION'
      agreedMoveInDate,
      monthlyRent = 6000,
    } = body;

    if (!propertyId) {
      return NextResponse.json({ error: 'Property ID is required' }, { status: 400 });
    }

    const store = getEscrowStore();

    // Fair-Use Guardrail: Max 2 active unverified reservations simultaneously
    const activeHolds = store.bookings.filter((b) =>
      ['RESERVED', 'VISIT_REQUESTED', 'VISIT_CONFIRMED'].includes(b.status)
    );
    if (activeHolds.length >= 2 && body.enforceFairUseLimit) {
      return NextResponse.json(
        {
          error:
            'Fair-Use Guardrail: You already have 2 active bed holds. Please complete your physical visit or cancel an existing hold before reserving another PG.',
          maxActiveReservationsReached: true,
        },
        { status: 400 }
      );
    }

    const isAdvance = reservationType === 'ADVANCE_SESSION';
    const rentPaise = monthlyRent * 100; // ₹6,000 -> 600000 paise
    const tokenPaise = isAdvance ? Math.round(rentPaise * 0.15) : 39900; // 15% (₹900) or ₹399

    const now = new Date();
    const expiresAt = isAdvance
      ? agreedMoveInDate
        ? new Date(agreedMoveInDate)
        : new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
      : new Date(now.getTime() + 72 * 60 * 60 * 1000); // 72h lock

    const moveInTarget = agreedMoveInDate
      ? new Date(agreedMoveInDate)
      : new Date(now.getTime() + (isAdvance ? 30 : 5) * 24 * 60 * 60 * 1000);

    const graceEnd = new Date(moveInTarget.getTime() + 7 * 24 * 60 * 60 * 1000);
    const txNo = `UNR-${isAdvance ? 'ADV' : 'TOK'}-${Date.now().toString().slice(-6)}`;
    const generatedVisitOtp = Math.floor(1000 + Math.random() * 9000).toString();

    let bookingId = `bkg-${Date.now().toString().slice(-6)}`;
    let resolvedAddress = 'Plot 42, Block B, Passi Nagar, Ferozepur Road, Ludhiana - 141012';
    let resolvedLandlordPhone = '+91 98989 89801';
    let resolvedLandlordName = 'Vikram Singh';
    let resolvedPropertyName = propertyName || 'PCTE Smart Student Residency';

    // Try Prisma DB first if online
    try {
      let studentUser = userId ? await prisma.user.findUnique({ where: { id: userId } }) : null;
      if (!studentUser) {
        studentUser = await prisma.user.findFirst({ where: { email: 'rahul@uninest.demo' } });
      }
      if (!studentUser) {
        studentUser = await prisma.user.findFirst({ where: { role: 'STUDENT' } });
      }

      const property = await prisma.property.findUnique({
        where: { id: propertyId },
        include: { landlord: { include: { user: true } }, rooms: { include: { beds: true } } },
      });

      if (studentUser && property) {
        resolvedPropertyName = property.name;
        resolvedAddress = `${property.address}, ${property.locality || ''}, ${property.city}`;
        resolvedLandlordPhone = property.landlord?.user?.phone || resolvedLandlordPhone;
        resolvedLandlordName = property.landlord?.user?.name || resolvedLandlordName;

        let targetBedId = bedId;
        if (!targetBedId) {
          const availBed = await prisma.bed.findFirst({
            where: { room: { propertyId: property.id }, status: 'AVAILABLE' },
          });
          targetBedId = availBed?.id || property.rooms?.[0]?.beds?.[0]?.id;
        }

        if (targetBedId) {
          await prisma.payment.create({
            data: {
              userId: studentUser.id,
              amount: tokenPaise,
              type: 'RESERVATION_FEE',
              status: 'SUCCESS',
              method: 'DIRECT_UPI',
              transactionId: txNo,
              description: isAdvance
                ? `15% Advance Holding Token (₹${tokenPaise / 100}) for ${property.name}`
                : `₹399 Bed Commitment Token for ${property.name}`,
            },
          });

          const dbBooking = await prisma.booking.create({
            data: {
              userId: studentUser.id,
              propertyId: property.id,
              bedId: targetBedId,
              status: 'RESERVED',
              reservationType: isAdvance ? 'ADVANCE_SESSION' : 'IMMEDIATE_VISIT',
              reservationFee: tokenPaise,
              advanceTokenAmount: isAdvance ? tokenPaise : null,
              visitOtp: generatedVisitOtp,
              visitOtpExpiresAt: expiresAt,
              agreedMoveInDate: moveInTarget,
              moveInDate: moveInTarget,
              graceWindowEndsAt: graceEnd,
              expiresAt,
              notes: isAdvance
                ? `15% Advance Holding Token (₹${tokenPaise / 100}) paid. Pay 85% balance 48h before ${moveInTarget.toLocaleDateString('en-IN')}.`
                : 'Bed locked as RESERVED for 72 Hours via ₹399 Commitment Token.',
            },
          });

          bookingId = dbBooking.id;

          await prisma.bed.update({
            where: { id: targetBedId },
            data: { status: 'RESERVED' },
          });
        }
      }
    } catch (dbErr) {
      console.warn('Database offline in /api/demo/reservation, saving to in-memory Escrow Store:', dbErr);
    }

    // Always add/sync to in-memory Escrow Store so Student & Landlord portals see it immediately
    const newEscrowRecord: EscrowBookingRecord = {
      id: bookingId,
      referenceNo: `RES-${Date.now().toString().slice(-5)}`,
      userId: 'usr-student-demo',
      propertyId,
      bedId: bedId || 'bed-204-a',
      status: 'RESERVED',
      reservationType: isAdvance ? 'ADVANCE_SESSION' : 'IMMEDIATE_VISIT',
      reservationFee: tokenPaise,
      advanceTokenAmount: isAdvance ? tokenPaise : null,
      escrowAmount: null,
      escrowReleasedAt: null,
      visitOtp: generatedVisitOtp,
      visitOtpExpiresAt: expiresAt.toISOString(),
      visitVerifiedAt: null,
      postVisitDecision: null,
      moveInOtp: null,
      moveInVerifiedAt: null,
      handshakeStatus: 'PENDING',
      moveInDate: moveInTarget.toISOString(),
      agreedMoveInDate: moveInTarget.toISOString(),
      delayedMoveInDate: null,
      graceWindowEndsAt: graceEnd.toISOString(),
      expiresAt: expiresAt.toISOString(),
      emergencyReason: null,
      emergencyWaiverCount: 0,
      visitRejectCount: 0,
      vacancyCompAmount: null,
      refundAmount: null,
      disputeReason: null,
      notes: isAdvance
        ? `Advance Booking (15–45 Days): 15% Holding Token (₹${tokenPaise / 100}) paid. Remaining 85% (₹${(rentPaise - tokenPaise) / 100}) due 48h before ${moveInTarget.toLocaleDateString('en-IN')}.`
        : `Immediate Visit Hold: ₹399 Token paid. Bed locked for 72 Hours. Visit PG & enter 4-Digit Landlord OTP (Demo OTP: ${generatedVisitOtp}).`,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
      user: {
        id: 'usr-student-demo',
        name: 'Rahul Sharma',
        email: 'rahul@uninest.demo',
        phone: '+91 98765 43210',
      },
      property: {
        id: propertyId,
        name: resolvedPropertyName,
        address: resolvedAddress,
        locality: 'Ferozepur Road',
        city: 'Ludhiana',
        state: 'Punjab',
        pincode: '141012',
        gender: 'MALE',
        images: ['https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800'],
        monthlyRent,
        depositAmount: monthlyRent,
        landlord: {
          companyName: 'UniNest Verified Residency',
          user: {
            id: 'usr-landlord-demo',
            name: resolvedLandlordName,
            email: 'landlord@uninest.demo',
            phone: resolvedLandlordPhone,
          },
        },
      },
      bed: {
        id: bedId || 'bed-204-a',
        label: 'A',
        bedNumber: 'A',
        monthlyRent,
        room: {
          id: roomId || 'rm-204',
          roomNumber: '204',
          type: 'DOUBLE',
          sharing: 2,
          rent: rentPaise,
          deposit: rentPaise,
        },
      },
      visits: [],
      agreement: {
        id: `agr-${Date.now()}`,
        status: 'DRAFT',
      },
      tenancy: null,
    };

    store.bookings.unshift(newEscrowRecord);

    return NextResponse.json({
      success: true,
      transactionId: txNo,
      bookingId: newEscrowRecord.id,
      bedId: newEscrowRecord.bedId,
      reservationType: newEscrowRecord.reservationType,
      tokenPaidPaise: tokenPaise,
      visitOtp: generatedVisitOtp,
      propertyAddress: resolvedAddress,
      landlordPhone: resolvedLandlordPhone,
      landlordName: resolvedLandlordName,
      message: isAdvance
        ? `15% Advance Holding Token (₹${tokenPaise / 100}) locked in Escrow! Bed reserved until ${moveInTarget.toLocaleDateString('en-IN')}.`
        : '₹399 Commitment Token paid! Bed locked as RESERVED for 72 hours. Exact address & Visit OTP system unlocked!',
    });
  } catch (error: any) {
    console.error('Reservation API Error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to process reservation' },
      { status: 500 }
    );
  }
}
