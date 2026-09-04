import { prisma } from '@/lib/db';
import { LandlordBookingsClient } from './LandlordBookingsClient';

export default async function LandlordBookingsPage() {
  let bookings: any[] = [];
  let visits: any[] = [];

  try {
    bookings = await prisma.booking.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        property: true,
        user: true,
        bed: { include: { room: true } },
      },
    });

    visits = await prisma.visitAppointment.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        student: { select: { name: true, email: true, phone: true } },
        property: { select: { name: true, locality: true, city: true } },
      },
    });
  } catch (error) {
    console.warn('Database error in LandlordBookingsPage, using fallback demo data:', error);
  }

  // Fallback demo data if DB query fails or returns empty
  if (!bookings || bookings.length === 0) {
    bookings = [
      {
        id: 'bkg-pcte-2026-demo',
        referenceNo: 'RES-PCTE-88902',
        status: 'RESERVED',
        tokenAmountPaid: 1000,
        remainingAmountDue: 5000,
        monthlyRent: 6000,
        createdAt: new Date().toISOString(),
        user: { name: 'Rahul Sharma', email: 'rahul@uninest.demo', phone: '+91 98765 43210' },
        property: { name: 'PCTE Smart Student Residency', locality: 'Ferozepur Road', city: 'Ludhiana' },
        bed: { bedNumber: 'A', room: { roomNumber: '204' } },
      },
    ];
  }

  if (!visits || visits.length === 0) {
    visits = [
      {
        id: 'vst-1',
        scheduledDate: '2026-09-08',
        timeSlot: 'Morning (11:00 AM)',
        status: 'CONFIRMED',
        createdAt: new Date().toISOString(),
        student: { name: 'Rahul Sharma', email: 'rahul@uninest.demo', phone: '+91 98765 43210' },
        property: { name: 'PCTE Smart Student Residency', locality: 'Ferozepur Road', city: 'Ludhiana' },
      },
    ];
  }

  return <LandlordBookingsClient bookings={bookings} visits={visits} />;
}
