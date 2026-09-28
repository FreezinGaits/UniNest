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
      studentUser = await prisma.user.findFirst({
        where: { email: { in: [session.email, session.email.replace('@uninest.in', '@uninest.demo')] } },
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

  const isDemoUser = session.email?.includes('@uninest.demo') || session.email?.includes('@uninest.in');
  const existingIds = new Set((bookings || []).map((b: any) => b.id));
  const storeMatches = (store.bookings || []).filter(
    (sb: any) =>
      (isDemoUser || sb.studentEmail === session.email || sb.studentId === session.userId) &&
      !existingIds.has(sb.id)
  );
  if (storeMatches.length > 0) {
    bookings = [...storeMatches, ...(bookings || [])];
  }

  return <StudentBookingsClient initialBookings={bookings} />;
}
