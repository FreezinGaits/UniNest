import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { findStoreBooking, getEscrowStore, getStoreBookings } from '@/lib/escrowStore';

import { getSession } from '@/lib/auth/actions';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

function sanitizeBookingForRole(booking: any, isLandlordOrAdmin: boolean) {
  if (!booking || typeof booking !== 'object') return booking;
  const copy = { ...booking };

  // Never leak visitOtp, arrivalFallbackCode, or unverified moveInOtp to students!
  if (!isLandlordOrAdmin) {
    delete copy.visitOtp;
    delete copy.visitOtpExpiresAt;
    delete copy.arrivalFallbackCode;
    if (!copy.arrivalVerifiedAt) {
      delete copy.moveInOtp;
    }
  } else {
    // Landlords should not see the student's move-in PIN until it has been entered and verified
    if (!copy.moveInVerifiedAt) {
      delete copy.moveInOtp;
    }
  }

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

export async function GET(request: NextRequest) {
  try {
    const session = await getSession().catch(() => null);
    const isLandlordOrAdmin =
      session?.role === 'LANDLORD' || session?.role === 'ADMIN';

    const { searchParams } = new URL(request.url);
    const bookingId = searchParams.get('bookingId');

    const store = getEscrowStore();
    const storeBookings = getStoreBookings();

    if (bookingId) {
      const rawMemBooking = findStoreBooking(bookingId);
      const memBooking = rawMemBooking?.id === bookingId ? rawMemBooking : undefined;
      let dbBooking: any = null;

      try {
        dbBooking = await prisma.booking.findUnique({
          where: { id: bookingId },
          include: {
            user: true,
            property: {
              include: {
                landlord: {
                  include: { user: true },
                },
              },
            },
            bed: {
              include: { room: true },
            },
            visits: {
              orderBy: { createdAt: 'desc' },
            },
            agreement: true,
            tenancy: true,
          },
        });
      } catch {
        // Prisma fallback to globalThis memory store
      }

      const merged = dbBooking
        ? {
            ...memBooking,
            ...dbBooking,
            visitOtp: dbBooking.visitOtp || memBooking?.visitOtp || null,
            visitOtpExpiresAt: dbBooking.visitOtpExpiresAt || memBooking?.visitOtpExpiresAt || null,
            visitVerifiedAt: dbBooking.visitVerifiedAt || memBooking?.visitVerifiedAt || null,
            postVisitDecision: dbBooking.postVisitDecision || memBooking?.postVisitDecision || null,
            moveInOtp: dbBooking.moveInOtp || memBooking?.moveInOtp || null,
            moveInVerifiedAt: dbBooking.moveInVerifiedAt || memBooking?.moveInVerifiedAt || null,
            escrowAmount: dbBooking.escrowAmount ?? memBooking?.escrowAmount ?? null,
            handshakeStatus: dbBooking.handshakeStatus || memBooking?.handshakeStatus || 'PENDING',
            status: dbBooking.status || memBooking?.status || 'RESERVED',
            agreement: dbBooking.agreement || memBooking?.agreement || null,
            visits:
              dbBooking.visits && dbBooking.visits.length > 0
                ? dbBooking.visits
                : memBooking?.visits || [],
          }
        : memBooking;

      if (!merged) {
        return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
      }

      return NextResponse.json(
        {
          success: true,
          timestamp: new Date().toISOString(),
          booking: sanitizeBookingForRole(merged, isLandlordOrAdmin),
          studentStats: store.studentStats,
        },
        {
          headers: {
            'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          },
        }
      );
    }

    // Return full list of bookings & visits for Landlord / Admin live portal sync
    let dbBookings: any[] = [];
    let dbVisits: any[] = [];

    try {
      dbBookings = await prisma.booking.findMany({
        include: {
          user: true,
          property: {
            include: {
              landlord: { include: { user: true } },
            },
          },
          bed: { include: { room: true } },
          visits: { orderBy: { createdAt: 'desc' } },
          agreement: true,
          tenancy: true,
        },
        orderBy: { createdAt: 'desc' },
      });

      dbVisits = await prisma.visitAppointment.findMany({
        include: {
          property: true,
        },
        orderBy: { createdAt: 'desc' },
      });
    } catch {
      // Fallback to store
    }

    const combinedMap = new Map<string, any>();
    for (const b of storeBookings) {
      combinedMap.set(b.id, sanitizeBookingForRole(b, isLandlordOrAdmin));
    }
    for (const b of dbBookings) {
      const mem = combinedMap.get(b.id);
      combinedMap.set(
        b.id,
        sanitizeBookingForRole(
          {
            ...mem,
            ...b,
            visitOtp: b.visitOtp || mem?.visitOtp || null,
            moveInOtp: b.moveInOtp || mem?.moveInOtp || null,
            escrowAmount: b.escrowAmount ?? mem?.escrowAmount ?? null,
            agreement: b.agreement || mem?.agreement || null,
          },
          isLandlordOrAdmin
        )
      );
    }

    return NextResponse.json(
      {
        success: true,
        timestamp: new Date().toISOString(),
        bookings: Array.from(combinedMap.values()),
        visits: dbVisits.length > 0 ? dbVisits : store.visits,
        studentStats: store.studentStats,
      },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        },
      }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Live sync failed' },
      { status: 500 }
    );
  }
}
