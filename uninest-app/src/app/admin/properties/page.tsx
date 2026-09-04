import { prisma } from '@/lib/db';
import { Card } from '@/components/ui/Card';
import { Building2 } from 'lucide-react';

export default async function Page() {
  const items = await prisma.property.findMany({
    orderBy: { createdAt: 'desc' },
    include: { rooms: { include: { beds: true } }, landlord: { include: { user: true } } },
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">All Properties</h1>
        <p className="text-text-secondary mt-1">Platform-wide property listings — {items.length} total</p>
      </div>
      <Card padding="none">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-surface-tertiary border-b border-border">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase">Name</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase">Owner</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase">City</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase">Beds</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-light">
              {items.map(p => {
                const bedCount = p.rooms.reduce((a, r) => a + r.beds.length, 0);
                const statusColor = p.verificationStatus === 'VERIFIED' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700';
                return (
                  <tr key={p.id} className="hover:bg-surface-secondary/50">
                    <td className="px-4 py-3 font-medium">{p.name}</td>
                    <td className="px-4 py-3 text-text-secondary">{p.landlord?.user?.name || '—'}</td>
                    <td className="px-4 py-3 text-text-secondary">{p.city}</td>
                    <td className="px-4 py-3">{bedCount} beds</td>
                    <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${statusColor}`}>{p.verificationStatus}</span></td>
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
