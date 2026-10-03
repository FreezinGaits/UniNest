import { getAllProperties } from '@/lib/propertiesStore';
import { AdminPropertiesDirectoryClient } from './AdminPropertiesDirectoryClient';

export const dynamic = 'force-dynamic';

export default async function AdminPropertiesPage() {
  const properties = await getAllProperties();

  return <AdminPropertiesDirectoryClient initialProperties={properties} />;
}
