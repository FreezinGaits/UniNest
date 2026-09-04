import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth/actions';

export default async function HomePage() {
  const session = await getSession();
  
  if (session) {
    const roleRoutes: Record<string, string> = {
      STUDENT: '/student/dashboard',
      LANDLORD: '/landlord/dashboard',
      ADMIN: '/admin/dashboard',
      COLLEGE: '/college/dashboard',
      PROVIDER: '/provider/dashboard',
    };
    redirect(roleRoutes[session.role] || '/student/dashboard');
  }

  redirect('/login');
}
