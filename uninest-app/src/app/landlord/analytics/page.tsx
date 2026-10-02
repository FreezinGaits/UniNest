import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth/actions';
import { LandlordAnalyticsClient } from './LandlordAnalyticsClient';

export default async function PropertyAnalyticsPage() {
  const session = await getSession();
  const isDemoUser =
    session?.email?.toLowerCase().includes('demo') ||
    session?.email?.toLowerCase() === 'landlord@uninest.in' ||
    session?.email?.toLowerCase() === 'vikram@passiresidency.in' ||
    !session;

  let occupancyRate = isDemoUser ? 82 : 0;
  let totalRevenueMonth = isDemoUser ? 16800000 : 0;
  let yieldPercentage = isDemoUser ? 9.8 : 0;

  try {
    const properties = await prisma.property.findMany({
      include: { rooms: { include: { beds: true } } },
    });
    if (properties && properties.length > 0) {
      let totalBeds = 0;
      let occBeds = 0;
      properties.forEach((p) =>
        p.rooms.forEach((r) =>
          r.beds.forEach((b) => {
            totalBeds++;
            if (b.status === 'OCCUPIED') occBeds++;
          })
        )
      );
      if (totalBeds > 0) {
        occupancyRate = Math.round((occBeds / totalBeds) * 100);
      }
    }
  } catch (error) {
    console.warn('Database error in PropertyAnalyticsPage, using demo fallback analytics:', error);
  }

  return (
    <LandlordAnalyticsClient
      occupancyRate={occupancyRate}
      totalRevenueMonth={totalRevenueMonth}
      yieldPercentage={yieldPercentage}
      isDemoUser={isDemoUser}
    />
  );
}
