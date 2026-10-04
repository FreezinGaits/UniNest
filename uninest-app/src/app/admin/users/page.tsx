import { getPlatformUsers } from '@/lib/usersStore';
import { AdminUsersClient } from './AdminUsersClient';

export const dynamic = 'force-dynamic';

export default async function AdminUsersPage() {
  const users = await getPlatformUsers();

  return <AdminUsersClient initialUsers={users} />;
}
