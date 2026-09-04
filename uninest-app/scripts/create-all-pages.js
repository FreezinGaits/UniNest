const fs = require('fs');
const path = require('path');

const targetDir = path.join(__dirname, '..', 'src', 'app');

const routes = [
  // ADMIN
  { path: 'admin/verification', title: 'Property Verification', desc: 'Review and verify landlord property listings', icon: 'Shield', table: 'properties' },
  { path: 'admin/bookings', title: 'Bookings Management', desc: 'All platform-wide student bookings', icon: 'CalendarCheck', table: 'bookings' },
  { path: 'admin/payments', title: 'Payment Records', desc: 'Financial transactions across all properties and students', icon: 'CreditCard', table: 'payments' },
  { path: 'admin/kyc', title: 'Student KYC Records', desc: 'Aadhaar, College ID, and identity verification queue', icon: 'ClipboardList', table: 'kyc' },
  { path: 'admin/tenant-verification', title: 'Tenant Verification', desc: 'Police verification and background clearance tracking', icon: 'Eye', table: 'tenantVerification' },
  { path: 'admin/maintenance', title: 'Maintenance Tickets', desc: 'Platform-wide maintenance & emergency requests', icon: 'Wrench', table: 'maintenance' },
  { path: 'admin/disputes', title: 'Dispute Resolution', desc: 'Tenant-landlord dispute tracking and evidence review', icon: 'AlertTriangle', table: 'disputes' },
  { path: 'admin/vendors', title: 'Service Vendors', desc: 'Registered service providers and dispatch status', icon: 'Truck', table: 'vendors' },
  { path: 'admin/services', title: 'Service Orders', desc: 'Platform service requests (Cleaning, Plumbing, Laundry)', icon: 'ShoppingBag', table: 'services' },
  { path: 'admin/analytics', title: 'Platform Analytics', desc: 'Revenue, occupancy rates, and platform metrics', icon: 'BarChart3', table: 'analytics' },
  { path: 'admin/audit-log', title: 'Audit Log', desc: 'Immutable platform activity and security log', icon: 'Clock', table: 'auditLog' },

  // STUDENT
  { path: 'student/saved', title: 'Saved Properties', desc: 'Your shortlisted PG accommodations', icon: 'Heart', table: 'saved' },
  { path: 'student/bookings', title: 'My Bookings', desc: 'Your booking history, active reservations, and status', icon: 'CalendarCheck', table: 'studentBookings' },
  { path: 'student/stay', title: 'My Stay Details', desc: 'Current PG details, room assignment, and roommate info', icon: 'Building2', table: 'stay' },
  { path: 'student/payments', title: 'Rent & Payments', desc: 'Monthly rent dues, receipts, and payment history', icon: 'CreditCard', table: 'studentPayments' },
  { path: 'student/electricity', title: 'Electricity Dues', desc: 'Meter readings, sub-meter splits, and payment history', icon: 'Zap', table: 'electricity' },
  { path: 'student/maintenance', title: 'Maintenance Tickets', desc: 'Report plumbing, electrical, or structural issues', icon: 'Wrench', table: 'studentMaintenance' },
  { path: 'student/services', title: 'On-Demand Services', desc: 'Book room cleaning, laundry, or food subscriptions', icon: 'ShoppingBag', table: 'studentServices' },
  { path: 'student/documents', title: 'My Documents', desc: 'Rental agreements, rent receipts, and KYC documents', icon: 'FileText', table: 'documents' },
  { path: 'student/disputes', title: 'Disputes & Complaints', desc: 'File formal complaints regarding deposit, rent, or maintenance', icon: 'AlertTriangle', table: 'studentDisputes' },
  { path: 'student/emergency', title: 'Emergency Assistance', desc: 'SOS alerts, warden contacts, and local police helpline', icon: 'Phone', table: 'emergency' },
  { path: 'student/profile', title: 'Student Profile', desc: 'Personal details, college info, and preferences', icon: 'User', table: 'profile' },

  // LANDLORD
  { path: 'landlord/properties', title: 'My Properties', desc: 'Manage your PG properties, pricing, and amenities', icon: 'Building2', table: 'landlordProperties' },
  { path: 'landlord/beds', title: 'Bed Inventory', desc: 'Room and bed availability across all your properties', icon: 'BedDouble', table: 'beds' },
  { path: 'landlord/bookings', title: 'Tenant Bookings', desc: 'Incoming booking requests and active tenancies', icon: 'CalendarCheck', table: 'landlordBookings' },
  { path: 'landlord/tenants', title: 'Tenant Directory', desc: 'Active tenants, contact details, and lease end dates', icon: 'Users', table: 'tenants' },
  { path: 'landlord/rent', title: 'Rent Collection', desc: 'Track pending, paid, and overdue rent payments', icon: 'CreditCard', table: 'rent' },
  { path: 'landlord/electricity', title: 'Electricity Metering', desc: 'Log sub-meter readings and split utility bills', icon: 'Zap', table: 'landlordElectricity' },
  { path: 'landlord/maintenance', title: 'Maintenance Requests', desc: 'Pending maintenance tickets reported by tenants', icon: 'Wrench', table: 'landlordMaintenance' },
  { path: 'landlord/compliance', title: 'Tenant Verification & Police Clearance', desc: 'Submit and track police verification forms for tenants', icon: 'Shield', table: 'compliance' },
  { path: 'landlord/disputes', title: 'Tenant Disputes', desc: 'Review and resolve tenant complaints', icon: 'AlertTriangle', table: 'landlordDisputes' },
  { path: 'landlord/services', title: 'Partner Services', desc: 'Manage vendor service dispatch for your properties', icon: 'ShoppingBag', table: 'landlordServices' },
  { path: 'landlord/earnings', title: 'Earnings & Payouts', desc: 'Monthly rental income, service commissions, and payouts', icon: 'DollarSign', table: 'earnings' },
  { path: 'landlord/analytics', title: 'Property Analytics', desc: 'Occupancy metrics, revenue performance, and trends', icon: 'BarChart3', table: 'landlordAnalytics' },
  { path: 'landlord/documents', title: 'Rental Agreements & Records', desc: 'Digital 11-month lease agreements and deposit receipts', icon: 'FileText', table: 'landlordDocuments' },
  { path: 'landlord/profile', title: 'Landlord Profile', desc: 'Business profile, bank details for payouts, and contact info', icon: 'User', table: 'landlordProfile' },

  // COLLEGE
  { path: 'college/students', title: 'Student Roster', desc: 'Enrolled students using off-campus accommodations', icon: 'GraduationCap', table: 'collegeStudents' },
  { path: 'college/housing', title: 'Off-Campus Housing Overview', desc: 'Verified PG options near campus', icon: 'Building2', table: 'collegeHousing' },
  { path: 'college/verified-pgs', title: 'Verified Partner PGs', desc: 'PGs verified for student safety and college standards', icon: 'Shield', table: 'collegeVerified' },
  { path: 'college/overflow', title: 'Hostel Overflow Management', desc: 'Directing unhoused students to verified off-campus beds', icon: 'MapPin', table: 'collegeOverflow' },
  { path: 'college/issues', title: 'Student Welfare & Safety Issues', desc: 'Safety alerts and complaints submitted by students', icon: 'AlertTriangle', table: 'collegeIssues' },
  { path: 'college/analytics', title: 'Housing Analytics', desc: 'Student distribution, rent affordability, and safety ratings', icon: 'BarChart3', table: 'collegeAnalytics' },

  // PROVIDER
  { path: 'provider/jobs', title: 'Service Jobs', desc: 'Assigned service orders and maintenance jobs', icon: 'Briefcase', table: 'providerJobs' },
  { path: 'provider/customers', title: 'Customer Directory', desc: 'Students and landlords who requested services', icon: 'Users', table: 'providerCustomers' },
  { path: 'provider/availability', title: 'Service Schedule', desc: 'Manage your operating hours and dispatch availability', icon: 'Clock', table: 'providerAvailability' },
  { path: 'provider/services-list', title: 'Service Offerings', desc: 'Manage your service catalog and pricing', icon: 'ShoppingBag', table: 'providerServices' },
  { path: 'provider/pricing', title: 'Pricing & Commissions', desc: 'Set rate cards for plumbing, electrical, and cleaning', icon: 'DollarSign', table: 'providerPricing' },
  { path: 'provider/earnings', title: 'Earnings & Payouts', desc: 'Track job payouts after UniNest commission', icon: 'TrendingUp', table: 'providerEarnings' },
  { path: 'provider/ratings', title: 'Customer Ratings', desc: 'Feedback and ratings from completed service jobs', icon: 'Star', table: 'providerRatings' },
  { path: 'provider/profile', title: 'Provider Profile', desc: 'Business license, coverage area, and team setup', icon: 'User', table: 'providerProfile' },
];

function generatePageCode(route) {
  return `import { prisma } from '@/lib/db';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { ${route.icon} } from 'lucide-react';
import { formatINR } from '@/lib/utils';

export default async function ${route.title.replace(/[^a-zA-Z]/g, '')}Page() {
  let items: any[] = [];
  const tableType = '${route.table}' as string;
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
          <h1 className="text-2xl font-bold text-text-primary">${route.title}</h1>
          <p className="text-text-secondary mt-1">${route.desc}</p>
        </div>
        <div className="p-2.5 bg-brand-50 rounded-xl">
          <${route.icon} className="w-6 h-6 text-brand-600" />
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
                      {item.name || item.studentName || item.user?.name || item.reportedBy || item.title || item.referenceNo || \`Item #\${idx + 1}\`}
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
              <${route.icon} className="w-6 h-6 text-brand-600" />
            </div>
            <h3 className="text-base font-semibold text-text-primary">${route.title}</h3>
            <p className="text-sm text-text-secondary max-w-md mt-1 mb-4">${route.desc}</p>
            <Badge variant="outline">UniNest Demo Module</Badge>
          </div>
        </Card>
      )}
    </div>
  );
}
`;
}

let count = 0;
routes.forEach(route => {
  const dir = path.join(targetDir, route.path);
  const file = path.join(dir, 'page.tsx');
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(file, generatePageCode(route));
  count++;
  console.log(`Generated [${count}/${routes.length}]: ${route.path}/page.tsx`);
});

console.log('All routes regenerated cleanly!');
