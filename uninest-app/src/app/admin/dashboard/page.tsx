import { getAllProperties } from '@/lib/propertiesStore';
import { getPlatformUsers } from '@/lib/usersStore';
import { AdminDashboardClient } from './AdminDashboardClient';

export const dynamic = 'force-dynamic';

export default async function AdminDashboardPage() {
  const [properties, users] = await Promise.all([
    getAllProperties(),
    getPlatformUsers(),
  ]);

  return (
    <AdminDashboardClient
      initialProperties={properties}
      initialUsers={users}
      initialRevenueRupees={485000}
      initialActiveBookings={3}
      initialTotalBookings={4}
      initialOpenMaintenance={3}
      initialOpenDisputes={1}
      initialServiceOrders={3}
    />
  );
}
