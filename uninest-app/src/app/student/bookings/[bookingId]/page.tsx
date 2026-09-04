import { prisma } from '@/lib/db';
import { notFound } from 'next/navigation';
import { BookingWorkspaceClient } from './BookingWorkspaceClient';

interface PageProps {
  params: Promise<{ bookingId: string }>;
}

export default async function BookingDetailPage({ params }: PageProps) {
  const { bookingId } = await params;

  let studentUser = await prisma.user.findFirst({
    where: { email: 'rahul@uninest.demo' },
  });

  if (!studentUser) {
    studentUser = await prisma.user.findFirst({
      where: { role: 'STUDENT' },
    });
  }

  let booking = await prisma.booking.findUnique({
    where: { id: bookingId },
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

  // Fallback: If demo booking ID not found directly, try finding Rahul's booking
  if (!booking && studentUser) {
    booking = await prisma.booking.findFirst({
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

  if (!booking) {
    notFound();
  }

  return <BookingWorkspaceClient booking={booking} />;
}
