import { prisma } from '@/lib/db';
import { TenantDisputesClient, DisputeItem } from './TenantDisputesClient';

const DEMO_DISPUTES: DisputeItem[] = [
  {
    id: 'd1',
    caseId: 'DSP-9041',
    tenantName: 'Rahul Sharma',
    property: 'PCTE Smart Student Residency (Room 204)',
    category: 'NOISE_COMPLAINT',
    subject: 'Late Night Music in Adjacent Room 205',
    status: 'RESOLVED',
    date: '01 Sep 2026',
    responseNote: 'Discussed with Room 205 tenants. Quiet hours (10 PM) enforced strictly.',
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

  return <TenantDisputesClient initialDisputes={disputes} />;
}
