import { prisma } from '@/lib/db';
import { getEscrowStore } from '@/lib/escrowStore';
import { StudentBookingsClient } from './StudentBookingsClient';

export const dynamic = 'force-dynamic';

export default async function MyBookingsPage() {
  const store = getEscrowStore();
  let bookings: any[] = [];

  try {
    let studentUser = await prisma.user.findFirst({
      where: { email: 'rahul@uninest.demo' },
    });

    if (!studentUser) {
      studentUser = await prisma.user.findFirst({
        where: { role: 'STUDENT' },
      });
    }

    if (studentUser) {
      bookings = await prisma.booking.findMany({
        where: { userId: studentUser.id },
        orderBy: { createdAt: 'desc' },
        include: {
          property: {
            include: {
              landlord: { include: { user: true } },
              rooms: { include: { beds: true } },
            },
          },
          bed: {
            include: {
              room: true,
            },
          },
          visits: {
            orderBy: { createdAt: 'desc' },
          },
          agreement: true,
          tenancy: true,
        },
      });
    }
  } catch (error) {
    // Database offline — use synchronized globalThis Escrow Store
  }

  if (!bookings || bookings.length === 0) {
    bookings = store.bookings;
  }

  return <StudentBookingsClient initialBookings={bookings} />;
}
