import { getAllProperties } from '@/lib/propertiesStore';
import { AdminPropertiesClient } from './AdminPropertiesClient';

export default async function AdminPropertiesPage() {
  const properties = await getAllProperties();

  return <AdminPropertiesClient initialProperties={properties} />;
}
