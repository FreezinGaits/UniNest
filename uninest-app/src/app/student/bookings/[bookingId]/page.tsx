import { prisma } from '@/lib/db';
import { findStoreBooking } from '@/lib/escrowStore';
import { BookingWorkspaceClient } from './BookingWorkspaceClient';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ bookingId: string }>;
}

export default async function BookingDetailPage({ params }: PageProps) {
  const { bookingId } = await params;
  let booking: any = null;

  try {
    booking = await prisma.booking.findUnique({
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
  } catch (error) {
    // Database offline — use synchronized globalThis Escrow Store
  }

  if (!booking) {
    const storeBooking = findStoreBooking(bookingId);
    booking = storeBooking ? { ...storeBooking, id: storeBooking.id } : null;
  }

  return <BookingWorkspaceClient booking={booking} />;
}
