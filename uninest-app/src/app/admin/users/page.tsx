import { prisma } from '@/lib/db';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Users } from 'lucide-react';

export default async function Page() {
  const users = await prisma.user.findMany({ orderBy: { createdAt: 'desc' }, take: 50 });

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">User Management</h1>
        <p className="text-text-secondary mt-1">Manage all platform users — {users.length} total</p>
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
                    <td className="px-4 py-3 font-medium">{u.name}</td>
                    <td className="px-4 py-3 text-text-secondary">{u.email}</td>
                    <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${roleColor}`}>{u.role}</span></td>
                    <td className="px-4 py-3 text-text-secondary">{u.phone || '—'}</td>
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
