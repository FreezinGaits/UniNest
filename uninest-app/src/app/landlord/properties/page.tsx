import { getSession } from '@/lib/auth/actions';
import { getAllProperties } from '@/lib/propertiesStore';
import { LandlordPropertiesClient } from './LandlordPropertiesClient';

export default async function LandlordPropertiesPage() {
  const session = await getSession();
  if (!session) return null;

  const properties = await getAllProperties();

  return <LandlordPropertiesClient initialProperties={properties} />;
}
