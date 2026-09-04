import { prisma } from '@/lib/db';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { AlertTriangle, CheckCircle } from 'lucide-react';

const DEMO_DISPUTES = [
  {
    id: 'd1',
    caseId: 'DSP-9041',
    tenantName: 'Rahul Sharma',
    property: 'PCTE Smart Student Residency (Room 204)',
    category: 'NOISE_COMPLAINT',
    subject: 'Late Night Music in Adjacent Room 205',
    status: 'RESOLVED',
    date: '01 Sep 2026',
  },
  {
    id: 'd2',
    caseId: 'DSP-9048',
    tenantName: 'Aman Verma',
    property: 'Passi Luxury PG (Room 102)',
    category: 'DEPOSIT_REFUND',
    subject: 'Security Deposit Deduction Inquiry',
    status: 'IN_REVIEW',
    date: '03 Sep 2026',
  },
];

export default async function TenantDisputesPage() {
  let disputes = DEMO_DISPUTES;

  try {
    const dbDisputes = await prisma.dispute.findMany({
      orderBy: { createdAt: 'desc' },
    });
    if (dbDisputes && dbDisputes.length > 0) {
      disputes = dbDisputes.map((d: any) => ({
        id: d.id,
        caseId: `DSP-${d.id.slice(-4)}`,
        tenantName: d.reportedBy || 'Rahul Sharma',
        property: 'PCTE Smart Student Residency',
        category: d.type || 'TENANT_ISSUE',
        subject: d.title || d.description || 'Tenant Complaint',
        status: d.status || 'OPEN',
        date: new Date(d.createdAt).toLocaleDateString('en-IN'),
      }));
    }
  } catch (error) {
    console.warn('Database error in TenantDisputesPage, using demo fallback disputes:', error);
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Tenant Disputes & Mediation</h1>
          <p className="text-text-secondary mt-1">Review tenant grievances, room conflicts, and security deposit queries</p>
        </div>
        <div className="p-2.5 bg-amber-50 rounded-xl">
          <AlertTriangle className="w-6 h-6 text-amber-600" />
        </div>
      </div>

      <Card padding="none">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-surface-tertiary border-b border-border">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase">Case ID & Subject</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase">Complainant</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase">Property</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase">Category</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-light">
              {disputes.map(d => (
                <tr key={d.id} className="hover:bg-surface-secondary/50">
                  <td className="px-4 py-3 font-bold text-slate-900">
                    <div>{d.subject}</div>
                    <div className="text-xs font-mono text-slate-400">{d.caseId}</div>
                  </td>
                  <td className="px-4 py-3 text-text-secondary font-medium">{d.tenantName}</td>
                  <td className="px-4 py-3 text-text-secondary text-xs">{d.property}</td>
                  <td className="px-4 py-3"><span className="bg-slate-100 text-slate-700 font-semibold px-2 py-0.5 rounded text-xs">{d.category}</span></td>
                  <td className="px-4 py-3">
                    <Badge variant={d.status === 'RESOLVED' ? 'success' : 'warning'} size="sm">
                      {d.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Button size="sm" variant="outline" className="text-xs font-bold">
                      Open Mediation →
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
