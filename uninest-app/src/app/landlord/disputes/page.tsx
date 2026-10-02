import { getSession } from '@/lib/auth/actions';
import { getDisputesForRole, DisputeCase } from '@/lib/disputesStore';
import { TenantDisputesClient } from './TenantDisputesClient';

export default async function TenantDisputesPage() {
  const session = await getSession();
  const disputes: DisputeCase[] = getDisputesForRole('LANDLORD', session?.email);

  return (
    <TenantDisputesClient
      initialDisputes={disputes}
      landlordName={session?.name || 'Vikram Singh (Passi Group)'}
    />
  );
}
