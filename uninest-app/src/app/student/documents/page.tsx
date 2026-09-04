import { prisma } from '@/lib/db';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { FileText } from 'lucide-react';
import { formatINR } from '@/lib/utils';

export default async function MyDocumentsPage() {
  let items: any[] = [];
  const tableType = 'documents' as string;
  try {
    if (['bookings', 'studentBookings', 'landlordBookings'].includes(tableType)) {
      items = await prisma.booking.findMany({
        orderBy: { createdAt: 'desc' },
        include: { property: true, user: true, bed: { include: { room: true } } }
      });
    } else if (['payments', 'studentPayments', 'rent', 'earnings'].includes(tableType)) {
      items = await prisma.payment.findMany({
        orderBy: { createdAt: 'desc' },
        include: { user: true }
      });
    } else if (['maintenance', 'studentMaintenance', 'landlordMaintenance'].includes(tableType)) {
      items = await prisma.maintenanceTicket.findMany({
        orderBy: { createdAt: 'desc' },
        include: { property: true }
      });
    } else if (['tenants', 'collegeStudents'].includes(tableType)) {
      items = await prisma.student.findMany({
        include: { user: true, college: true }
      });
    } else if (tableType === 'kyc') {
      items = await prisma.kYCRecord.findMany({
        include: { student: { include: { user: true } } }
      });
    } else if (['tenantVerification', 'compliance'].includes(tableType)) {
      items = await prisma.tenantVerification.findMany({
        orderBy: { createdAt: 'desc' }
      });
    } else if (['properties', 'landlordProperties', 'collegeHousing', 'collegeVerified'].includes(tableType)) {
      items = await prisma.property.findMany({
        orderBy: { createdAt: 'desc' },
        include: { rooms: { include: { beds: true } }, landlord: { include: { user: true } } }
      });
    } else if (['disputes', 'studentDisputes', 'landlordDisputes', 'collegeIssues'].includes(tableType)) {
      items = await prisma.dispute.findMany({
        orderBy: { createdAt: 'desc' }
      });
    } else if (['services', 'studentServices', 'landlordServices', 'providerJobs'].includes(tableType)) {
      items = await prisma.serviceOrder.findMany({
        orderBy: { createdAt: 'desc' }
      });
    } else if (tableType === 'auditLog') {
      items = await prisma.auditLog.findMany({
        orderBy: { createdAt: 'desc' },
        take: 20,
        include: { user: true }
      });
    } else if (tableType === 'beds') {
      items = await prisma.bed.findMany({
        include: { room: { include: { property: true } } },
        take: 30
      });
    }
  } catch (e) {
    items = [];
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">My Documents</h1>
          <p className="text-text-secondary mt-1">Rental agreements, rent receipts, and KYC documents</p>
        </div>
        <div className="p-2.5 bg-brand-50 rounded-xl">
          <FileText className="w-6 h-6 text-brand-600" />
        </div>
      </div>

      {items.length > 0 ? (
        <Card padding="none">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-surface-tertiary border-b border-border">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase">ID / Title</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase">Details</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-light">
                {items.map((item, idx) => (
                  <tr key={item.id || idx} className="hover:bg-surface-secondary/50">
                    <td className="px-4 py-3 font-medium text-text-primary">
                      {item.name || item.studentName || item.user?.name || item.reportedBy || item.title || item.referenceNo || `Item #${idx + 1}`}
                    </td>
                    <td className="px-4 py-3 text-text-secondary">
                      {item.email || item.property?.name || item.city || item.description || item.category || (item.amount ? formatINR(item.amount) : '—')}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={
                        (item.status === 'VERIFIED' || item.status === 'ACTIVE' || item.status === 'SUCCESS' || item.status === 'PAID') ? 'success' :
                        (item.status === 'PENDING' || item.status === 'OPEN' || item.status === 'DUE') ? 'warning' : 'default'
                      } size="sm">
                        {item.status || item.verificationStatus || item.role || 'ACTIVE'}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-text-tertiary text-xs">
                      {item.createdAt ? new Date(item.createdAt).toLocaleDateString('en-IN') : new Date().toLocaleDateString('en-IN')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      ) : (
        <Card>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-12 h-12 bg-brand-50 rounded-2xl flex items-center justify-center mb-3">
              <FileText className="w-6 h-6 text-brand-600" />
            </div>
            <h3 className="text-base font-semibold text-text-primary">My Documents</h3>
            <p className="text-sm text-text-secondary max-w-md mt-1 mb-4">Rental agreements, rent receipts, and KYC documents</p>
            <Badge variant="outline">UniNest Demo Module</Badge>
          </div>
        </Card>
      )}
    </div>
  );
}
