import { prisma } from '@/lib/db';
import { notFound } from 'next/navigation';
import { PropertyDetailClient } from './PropertyDetailClient';

export default async function PropertyDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const property = await prisma.property.findUnique({
    where: { id },
    include: {
      landlord: { include: { user: true } },
      rooms: { include: { beds: true } },
      reviews: { include: { user: true } },
      collegeLinks: { include: { college: true } },
    },
  });

  if (!property) return notFound();

  // Find demo student Rahul Sharma's booking if any
  const student = await prisma.user.findFirst({
    where: { email: 'rahul@uninest.demo' },
  });

  let initialBooking = null;
  let initialVisit = null;

  if (student) {
    initialBooking = await prisma.booking.findFirst({
      where: {
        userId: student.id,
        propertyId: property.id,
      },
    });

    if (initialBooking) {
      initialVisit = await prisma.visitAppointment.findFirst({
        where: {
          bookingId: initialBooking.id,
        },
        orderBy: { createdAt: 'desc' },
      });
    }
  }

  return (
    <PropertyDetailClient
      property={property}
      initialBooking={initialBooking}
      initialVisit={initialVisit}
    />
  );
}
