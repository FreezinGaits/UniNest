import { prisma } from '@/lib/db';
import { getEscrowStore } from '@/lib/escrowStore';
import { LandlordBookingsClient } from './LandlordBookingsClient';

export const dynamic = 'force-dynamic';

export default async function LandlordBookingsPage() {
  const store = getEscrowStore();
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
    // Database offline — use synchronized globalThis Escrow Store
  }

  if (!bookings || bookings.length === 0) {
    bookings = store.bookings;
  }

  if (!visits || visits.length === 0) {
    visits = store.visits;
  }

  return <LandlordBookingsClient bookings={bookings} visits={visits} />;
}
