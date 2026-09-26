import { Suspense } from 'react';
import { getSession } from '@/lib/auth/actions';
import { getAllProperties } from '@/lib/propertiesStore';
import { LandlordPropertiesClient } from './LandlordPropertiesClient';

export default async function LandlordPropertiesPage() {
  const session = await getSession();
  if (!session) return null;

  const properties = await getAllProperties();

  return (
    <Suspense fallback={<div className="p-6 text-sm text-slate-500">Loading Property Portfolio...</div>}>
      <LandlordPropertiesClient initialProperties={properties} />
    </Suspense>
  );
}
