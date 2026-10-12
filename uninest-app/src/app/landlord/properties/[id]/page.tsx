import { getAllProperties } from '@/lib/propertiesStore';
import { getAdminMessages } from '@/lib/adminMessagesStore';
import { ManagePropertyClient } from './ManagePropertyClient';

export const dynamic = 'force-dynamic';

export default async function LandlordPropertyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const storeProperties = await getAllProperties();
  const matched = storeProperties.find((p) => p.id === id) || null;
  const adminNotes = getAdminMessages(id);

  return (
    <ManagePropertyClient
      id={id}
      initialProperty={matched}
      adminNotes={adminNotes}
    />
  );
}
