import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth/actions';
import { getPropertiesForLandlord, isDemoLandlordEmail } from '@/lib/propertiesStore';
import { getEscrowStore } from '@/lib/escrowStore';
import { LandlordBookingsClient } from './LandlordBookingsClient';

export const dynamic = 'force-dynamic';

export default async function LandlordBookingsPage() {
  const session = await getSession();
  const isDemoUser = isDemoLandlordEmail(session?.email);
  const landlordProps = await getPropertiesForLandlord(session?.email);
  const propIds = landlordProps.map((p) => p.id);

  const store = getEscrowStore();
  let bookings: any[] = [];
  let visits: any[] = [];

  if (isDemoUser || propIds.length > 0) {
    try {
      bookings = await prisma.booking.findMany({
        where: isDemoUser ? undefined : { propertyId: { in: propIds } },
        orderBy: { createdAt: 'desc' },
        include: {
          property: true,
          user: true,
          bed: { include: { room: true } },
        },
      });

      visits = await prisma.visitAppointment.findMany({
        where: isDemoUser ? undefined : { propertyId: { in: propIds } },
        orderBy: { createdAt: 'desc' },
        include: {
          student: { select: { name: true, email: true, phone: true } },
          property: { select: { name: true, locality: true, city: true } },
        },
      });
    } catch (error) {
      // Database offline — use synchronized globalThis Escrow Store
    }
  }

  if ((!bookings || bookings.length === 0) && isDemoUser) {
    bookings = store.bookings;
  }

  if ((!visits || visits.length === 0) && isDemoUser) {
    visits = store.visits;
  }

  return <LandlordBookingsClient bookings={bookings} visits={visits} />;
}
