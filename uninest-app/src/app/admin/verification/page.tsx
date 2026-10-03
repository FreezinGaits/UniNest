import { getAllProperties } from '@/lib/propertiesStore';
import { AdminVerificationCenterClient } from './AdminVerificationCenterClient';

export const dynamic = 'force-dynamic';

export default async function PropertyVerificationPage() {
  const properties = await getAllProperties();

  return <AdminVerificationCenterClient initialProperties={properties} />;
}
