import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth/actions';
import { DashboardShell } from '@/components/layout/DashboardShell';

export default async function StudentLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect('/login');
  if (session.role !== 'STUDENT' && session.role !== 'ADMIN') redirect('/unauthorized');

  return (
    <DashboardShell
      role={session.role}
      userName={session.name}
      userEmail={session.email}
    >
      {children}
    </DashboardShell>
  );
}
