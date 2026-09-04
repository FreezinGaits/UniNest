import { prisma } from '@/lib/db';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { FileText, Download, ShieldCheck, FilePlus } from 'lucide-react';

const DEMO_DOCUMENTS = [
  {
    id: 'doc-1',
    title: '11-Month Digital Student Lease Agreement',
    tenantName: 'Rahul Sharma',
    property: 'PCTE Smart Student Residency (Room 204)',
    docType: 'LEASE_AGREEMENT',
    fileSize: '1.4 MB',
    status: 'ACTIVE',
    signedDate: '15 Aug 2026',
  },
  {
    id: 'doc-2',
    title: 'Security Deposit Escrow Receipt (₹12,000)',
    tenantName: 'Aman Verma',
    property: 'Passi Luxury PG (Room 102)',
    docType: 'DEPOSIT_RECEIPT',
    fileSize: '450 KB',
    status: 'ACTIVE',
    signedDate: '20 Aug 2026',
  },
  {
    id: 'doc-3',
    title: 'PG Property Registration Certificate',
    tenantName: 'Passi Residency Management',
    property: 'Passi Luxury PG & Co-Living',
    docType: 'PROPERTY_LICENSE',
    fileSize: '2.8 MB',
    status: 'VERIFIED',
    signedDate: '01 Jan 2026',
  },
];

export default async function RentalAgreementsRecordsPage() {
  let docs = DEMO_DOCUMENTS;

  try {
    const dbDocs = await prisma.kYCRecord.findMany({
      take: 10,
    });
    if (dbDocs && dbDocs.length > 0) {
      docs = dbDocs.map((d: any) => ({
        id: d.id,
        title: 'Student Aadhaar & Lease Document',
        tenantName: 'Rahul Sharma',
        property: 'PCTE Smart Student Residency',
        docType: 'LEASE_AGREEMENT',
        fileSize: '1.2 MB',
        status: d.status || 'VERIFIED',
        signedDate: new Date(d.createdAt).toLocaleDateString('en-IN'),
      }));
    }
  } catch (error) {
    console.warn('Database error in RentalAgreementsRecordsPage, using demo fallback documents:', error);
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Rental Agreements & Document Vault</h1>
          <p className="text-text-secondary mt-1">Digital e-signed 11-month lease deeds, security deposit receipts, and municipal NOCs</p>
        </div>
        <Button className="bg-brand-600 hover:bg-brand-700 text-white font-bold">
          <FilePlus className="w-4 h-4 mr-1.5" /> Upload Document
        </Button>
      </div>

      <Card padding="none">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-surface-tertiary border-b border-border">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase">Document Name</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase">Associated Tenant / PG</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase">Type</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase">Signed Date</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase">Download</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-light">
              {docs.map(d => (
                <tr key={d.id} className="hover:bg-surface-secondary/50">
                  <td className="px-4 py-3 font-bold text-slate-900">
                    <div>{d.title}</div>
                    <div className="text-xs text-slate-400">{d.fileSize}</div>
                  </td>
                  <td className="px-4 py-3 text-text-secondary text-xs">
                    <span className="font-semibold text-slate-800">{d.tenantName}</span>
                    <div className="text-slate-500">{d.property}</div>
                  </td>
                  <td className="px-4 py-3"><span className="bg-purple-50 text-purple-700 font-semibold px-2 py-0.5 rounded text-xs">{d.docType}</span></td>
                  <td className="px-4 py-3 text-text-tertiary text-xs">{d.signedDate}</td>
                  <td className="px-4 py-3">
                    <Badge variant={d.status === 'ACTIVE' || d.status === 'VERIFIED' ? 'success' : 'warning'} size="sm">
                      {d.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Button size="sm" variant="outline" className="text-xs">
                      <Download className="w-3.5 h-3.5 mr-1" /> PDF
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
