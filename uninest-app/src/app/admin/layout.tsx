import { redirect } from 'next/navigation';
import { getSession, requireRole } from '@/lib/auth/actions';
import { DashboardShell } from '@/components/layout/DashboardShell';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect('/login');
  await requireRole('ADMIN');
  return (
    <DashboardShell role={session.role} userName={session.name} userEmail={session.email}>
      {children}
    </DashboardShell>
  );
}
