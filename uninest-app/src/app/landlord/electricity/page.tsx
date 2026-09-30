import { getSession } from '@/lib/auth/actions';
import { isDemoLandlordEmail } from '@/lib/propertiesStore';
import { getAllElectricityReadings } from '@/lib/electricityStore';
import { ElectricityMeteringClient } from './ElectricityMeteringClient';

export const dynamic = 'force-dynamic';

export default async function ElectricityMeteringPage() {
  const session = await getSession();
  const isDemoUser = isDemoLandlordEmail(session?.email);
  const readings = isDemoUser ? await getAllElectricityReadings() : [];

  return <ElectricityMeteringClient initialReadings={readings} />;
}
