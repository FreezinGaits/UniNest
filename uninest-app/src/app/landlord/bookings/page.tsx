import { prisma } from '@/lib/db';
import { LandlordBookingsClient } from './LandlordBookingsClient';

export default async function LandlordBookingsPage() {
  const landlordUser = await prisma.user.findFirst({
    where: { email: 'landlord@uninest.demo' },
  });

  const bookings = await prisma.booking.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      property: true,
      user: true,
      bed: { include: { room: true } },
    },
  });

  const visits = await prisma.visitAppointment.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      student: { select: { name: true, email: true, phone: true } },
      property: { select: { name: true, locality: true, city: true } },
    },
  });

  return <LandlordBookingsClient bookings={bookings} visits={visits} />;
}
