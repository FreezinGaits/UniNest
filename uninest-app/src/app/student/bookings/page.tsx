import { prisma } from '@/lib/db';
import { getEscrowStore } from '@/lib/escrowStore';
import { StudentBookingsClient } from './StudentBookingsClient';
import { getSession } from '@/lib/auth/actions';

export const dynamic = 'force-dynamic';

export default async function MyBookingsPage() {
  const store = getEscrowStore();
  let bookings: any[] = [];

  const session = await getSession();
  if (!session) {
    return <StudentBookingsClient initialBookings={[]} />;
  }

  try {
    let studentUser = await prisma.user.findUnique({
      where: { id: session.userId },
    });

    if (!studentUser && session.email) {
      studentUser = await prisma.user.findUnique({
        where: { email: session.email },
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
    const isDemoUser = session.email?.includes('@uninest.demo') || session.email?.includes('@uninest.in');
    if (isDemoUser) {
      bookings = store.bookings;
    }
  }

  return <StudentBookingsClient initialBookings={bookings} />;
}
