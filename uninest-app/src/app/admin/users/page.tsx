import { prisma } from '@/lib/db';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Users } from 'lucide-react';

const DEMO_USERS = [
  { id: 'u1', name: 'Rahul Sharma', email: 'rahul@uninest.demo', role: 'STUDENT', phone: '+91 98765 43210', createdAt: new Date().toISOString() },
  { id: 'u2', name: 'Rajesh Kumar (Passi Residency)', email: 'landlord@uninest.demo', role: 'LANDLORD', phone: '+91 98123 45678', createdAt: new Date().toISOString() },
  { id: 'u3', name: 'UniNest Operations Admin', email: 'admin@uninest.demo', role: 'ADMIN', phone: '+91 99999 00000', createdAt: new Date().toISOString() },
  { id: 'u4', name: 'PCTE Student Housing Cell', email: 'college@uninest.demo', role: 'COLLEGE', phone: '+91 98888 11111', createdAt: new Date().toISOString() },
  { id: 'u5', name: 'Ludhiana Home Services', email: 'provider@uninest.demo', role: 'PROVIDER', phone: '+91 97777 22222', createdAt: new Date().toISOString() },
];

export default async function AdminUsersPage() {
  let users = DEMO_USERS;

  try {
    const dbUsers = await prisma.user.findMany({ orderBy: { createdAt: 'desc' }, take: 50 });
    if (dbUsers && dbUsers.length > 0) {
      users = dbUsers.map((u: any) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role,
        phone: u.phone || '—',
        createdAt: u.createdAt ? new Date(u.createdAt).toISOString() : new Date().toISOString(),
      }));
    }
  } catch (error) {
    console.warn('Database error in AdminUsersPage, using demo fallback users:', error);
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">User Management</h1>
        <p className="text-text-secondary mt-1">Manage platform accounts & roles — {users.length} registered accounts</p>
      </div>

      <Card padding="none">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-surface-tertiary border-b border-border">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase">Name</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase">Email</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase">Role</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase">Phone</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-light">
              {users.map(u => {
                const roleColor = u.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' : u.role === 'LANDLORD' ? 'bg-green-100 text-green-700' : u.role === 'STUDENT' ? 'bg-blue-100 text-blue-700' : u.role === 'COLLEGE' ? 'bg-amber-100 text-amber-700' : 'bg-cyan-100 text-cyan-700';
                return (
                  <tr key={u.id} className="hover:bg-surface-secondary/50">
                    <td className="px-4 py-3 font-medium text-slate-900">{u.name}</td>
                    <td className="px-4 py-3 text-text-secondary">{u.email}</td>
                    <td className="px-4 py-3"><span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${roleColor}`}>{u.role}</span></td>
                    <td className="px-4 py-3 text-text-secondary">{u.phone}</td>
                    <td className="px-4 py-3 text-text-tertiary text-xs">{new Date(u.createdAt).toLocaleDateString('en-IN')}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
