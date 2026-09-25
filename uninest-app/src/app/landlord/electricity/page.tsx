import { getAllElectricityReadings } from '@/lib/electricityStore';
import { ElectricityMeteringClient } from './ElectricityMeteringClient';

export const dynamic = 'force-dynamic';

export default async function ElectricityMeteringPage() {
  const readings = await getAllElectricityReadings();

  return <ElectricityMeteringClient initialReadings={readings} />;
}
