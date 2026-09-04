import { prisma } from '@/lib/db';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Wrench, CheckCircle2, Clock, AlertCircle } from 'lucide-react';

const DEMO_MAINTENANCE_TICKETS = [
  {
    id: 'm1',
    ticketNo: 'MNT-2026-089',
    property: 'PCTE Smart Student Residency',
    room: 'Room 204 (Bed A)',
    tenant: 'Rahul Sharma',
    issue: 'Bathroom Tap Leak',
    category: 'PLUMBING',
    priority: 'MEDIUM',
    status: 'ASSIGNED',
    vendor: 'Ludhiana Home Services',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'm2',
    ticketNo: 'MNT-2026-074',
    property: 'Passi Luxury PG & Co-Living',
    room: 'Room 102 (Bed B)',
    tenant: 'Aman Verma',
    issue: 'AC Cooling Coil Dust Cleaning',
    category: 'HVAC / ELECTRICAL',
    priority: 'LOW',
    status: 'COMPLETED',
    vendor: 'CoolTech Appliances',
    createdAt: new Date().toISOString(),
  },
];

export default async function MaintenanceRequestsPage() {
  let tickets = DEMO_MAINTENANCE_TICKETS;

  try {
    const dbTickets = await prisma.maintenanceTicket.findMany({
      orderBy: { createdAt: 'desc' },
      include: { property: true },
    });
    if (dbTickets && dbTickets.length > 0) {
      tickets = dbTickets.map((t: any) => ({
        id: t.id,
        ticketNo: `MNT-2026-0${t.id.slice(-2)}`,
        property: t.property?.name || 'PCTE Smart Student Residency',
        room: 'Room 204',
        tenant: 'Rahul Sharma',
        issue: t.title || t.description || 'General Repair',
        category: t.category || 'PLUMBING',
        priority: t.priority || 'MEDIUM',
        status: t.status || 'OPEN',
        vendor: 'Ludhiana Home Services',
        createdAt: t.createdAt ? new Date(t.createdAt).toISOString() : new Date().toISOString(),
      }));
    }
  } catch (error) {
    console.warn('Database error in Landlord MaintenanceRequestsPage, using demo fallback tickets:', error);
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Maintenance Dispatch & Tickets</h1>
          <p className="text-text-secondary mt-1">Tenant issue requests, SLA escalation tracking, and vendor assignment</p>
        </div>
        <div className="p-2.5 bg-amber-50 rounded-xl">
          <Wrench className="w-6 h-6 text-amber-600" />
        </div>
      </div>

      <Card padding="none">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-surface-tertiary border-b border-border">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase">Ticket ID & Issue</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase">Property & Room</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase">Tenant</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase">Assigned Vendor</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase">Priority</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-light">
              {tickets.map(t => (
                <tr key={t.id} className="hover:bg-surface-secondary/50">
                  <td className="px-4 py-3 font-bold text-slate-900">
                    <div>{t.issue}</div>
                    <div className="text-xs font-mono text-slate-400">{t.ticketNo}</div>
                  </td>
                  <td className="px-4 py-3 text-text-secondary text-xs">
                    <span className="font-semibold text-slate-800">{t.property}</span>
                    <div className="text-slate-500">{t.room}</div>
                  </td>
                  <td className="px-4 py-3 text-text-secondary text-xs font-medium">{t.tenant}</td>
                  <td className="px-4 py-3 text-text-secondary text-xs font-semibold text-brand-700">{t.vendor}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                      t.priority === 'HIGH' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                      {t.priority}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={t.status === 'COMPLETED' ? 'success' : 'warning'} size="sm">
                      {t.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Button size="sm" variant="outline" className="text-xs">
                      Manage →
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
