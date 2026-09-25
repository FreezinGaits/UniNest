import { getAllProperties } from '@/lib/propertiesStore';
import { AdminPropertiesClient } from '../properties/AdminPropertiesClient';

export default async function PropertyVerificationPage() {
  const properties = await getAllProperties();

  return <AdminPropertiesClient initialProperties={properties} />;
}
