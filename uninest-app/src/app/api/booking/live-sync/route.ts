import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { findStoreBooking, getEscrowStore, getStoreBookings } from '@/lib/escrowStore';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const bookingId = searchParams.get('bookingId');

    const store = getEscrowStore();
    const storeBookings = getStoreBookings();

    if (bookingId) {
      const memBooking = findStoreBooking(bookingId);
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
          booking: merged,
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
      combinedMap.set(b.id, b);
    }
    for (const b of dbBookings) {
      const mem = combinedMap.get(b.id);
      combinedMap.set(b.id, {
        ...mem,
        ...b,
        visitOtp: b.visitOtp || mem?.visitOtp || null,
        moveInOtp: b.moveInOtp || mem?.moveInOtp || null,
        escrowAmount: b.escrowAmount ?? mem?.escrowAmount ?? null,
        agreement: b.agreement || mem?.agreement || null,
      });
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
