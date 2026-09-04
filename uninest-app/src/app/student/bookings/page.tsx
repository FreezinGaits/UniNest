import { prisma } from '@/lib/db';
import { StudentBookingsClient } from './StudentBookingsClient';

export default async function MyBookingsPage() {
  // Find Rahul Sharma student user
  let studentUser = await prisma.user.findFirst({
    where: { email: 'rahul@uninest.demo' },
  });

  if (!studentUser) {
    studentUser = await prisma.user.findFirst({
      where: { role: 'STUDENT' },
    });
  }

  let bookings: any[] = [];
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

  return <StudentBookingsClient initialBookings={bookings} />;
}
