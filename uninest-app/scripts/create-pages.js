const fs = require('fs');
const path = require('path');

const base = path.join(__dirname, 'src', 'app');

const pages = {
  // ADMIN
  'admin/users': { title: 'User Management', desc: 'Manage all platform users', icon: 'Users', query: `const users = await prisma.user.findMany({ orderBy: { createdAt: 'desc' }, take: 50 });`, table: `users.map(u => '<tr key={u.id} className="hover:bg-surface-secondary/50"><td className="px-4 py-3 font-medium">{u.name}</td><td className="px-4 py-3 text-text-secondary">{u.email}</td><td className="px-4 py-3"><span className={"px-2 py-0.5 rounded-full text-xs font-semibold " + (u.role === "ADMIN" ? "bg-purple-100 text-purple-700" : u.role === "LANDLORD" ? "bg-green-100 text-green-700" : u.role === "STUDENT" ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-700")}>{u.role}</span></td><td className="px-4 py-3 text-text-secondary text-sm">{u.phone || "—"}</td><td className="px-4 py-3 text-text-tertiary text-xs">{new Date(u.createdAt).toLocaleDateString("en-IN")}</td></tr>')`, heads: 'Name,Email,Role,Phone,Joined' },
  'admin/properties': { title: 'All Properties', desc: 'Platform-wide property listings', icon: 'Building2', query: `const items = await prisma.property.findMany({ orderBy: { createdAt: 'desc' }, include: { rooms: { include: { beds: true } }, landlord: { include: { user: true } } } });`, table: `items.map(p => '<tr key={p.id} className="hover:bg-surface-secondary/50"><td className="px-4 py-3 font-medium">{p.name}</td><td className="px-4 py-3 text-text-secondary">{p.landlord?.user?.name}</td><td className="px-4 py-3 text-text-secondary">{p.city}</td><td className="px-4 py-3">{p.rooms.reduce((a,r) => a + r.beds.length, 0)} beds</td><td className="px-4 py-3"><span className={"px-2 py-0.5 rounded-full text-xs font-semibold " + (p.verificationStatus === "VERIFIED" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700")}>{p.verificationStatus}</span></td></tr>')`, heads: 'Name,Owner,City,Capacity,Status' },
  'admin/bookings': { title: 'All Bookings', desc: 'Platform booking records', icon: 'CalendarCheck' },
  'admin/payments': { title: 'Payment Records', desc: 'All financial transactions', icon: 'CreditCard' },
  'admin/verification': { title: 'Property Verification', desc: 'Verify landlord properties', icon: 'Shield' },
  'admin/kyc': { title: 'KYC Records', desc: 'Student identity verification', icon: 'ClipboardList' },
  'admin/tenant-verification': { title: 'Tenant Verification', desc: 'Police verification tracking', icon: 'Eye' },
  'admin/maintenance': { title: 'Maintenance Tickets', desc: 'All maintenance requests', icon: 'Wrench' },
  'admin/disputes': { title: 'Dispute Resolution', desc: 'Open and resolved disputes', icon: 'AlertTriangle' },
  'admin/vendors': { title: 'Service Vendors', desc: 'Manage service providers', icon: 'Truck' },
  'admin/services': { title: 'Service Catalog', desc: 'Available services for tenants', icon: 'ShoppingBag' },
  'admin/analytics': { title: 'Platform Analytics', desc: 'Revenue, growth, and operational metrics', icon: 'BarChart3' },
  'admin/audit-log': { title: 'Audit Log', desc: 'Complete activity trail', icon: 'Clock' },
  // STUDENT
  'student/saved': { title: 'Saved PGs', desc: 'Your shortlisted accommodations', icon: 'Heart' },
  'student/bookings': { title: 'My Bookings', desc: 'Your booking history and active reservations', icon: 'CalendarCheck' },
  'student/stay': { title: 'My Stay', desc: 'Current accommodation details', icon: 'Building2' },
  'student/payments': { title: 'Payments', desc: 'Rent payments and transaction history', icon: 'CreditCard' },
  'student/electricity': { title: 'Electricity', desc: 'Meter readings and billing', icon: 'Zap' },
  'student/maintenance': { title: 'Maintenance', desc: 'Report and track maintenance issues', icon: 'Wrench' },
  'student/services': { title: 'Services', desc: 'Order services for your stay', icon: 'ShoppingBag' },
  'student/documents': { title: 'Documents', desc: 'Agreements, receipts, and ID copies', icon: 'FileText' },
  'student/disputes': { title: 'Disputes', desc: 'Raise and track dispute resolutions', icon: 'AlertTriangle' },
  'student/emergency': { title: 'Emergency', desc: 'Emergency contacts and incident reporting', icon: 'Phone' },
  'student/profile': { title: 'Profile', desc: 'Your account and preferences', icon: 'User' },
  // LANDLORD
  'landlord/properties': { title: 'My Properties', desc: 'Manage your PG properties', icon: 'Building2' },
  'landlord/beds': { title: 'Bed Management', desc: 'View and manage all beds across properties', icon: 'BedDouble' },
  'landlord/bookings': { title: 'Bookings', desc: 'Incoming and active bookings', icon: 'CalendarCheck' },
  'landlord/tenants': { title: 'Tenants', desc: 'Current and past tenants', icon: 'Users' },
  'landlord/rent': { title: 'Rent Collection', desc: 'Track rent payments and dues', icon: 'CreditCard' },
  'landlord/electricity': { title: 'Electricity', desc: 'Meter readings and billing', icon: 'Zap' },
  'landlord/maintenance': { title: 'Maintenance', desc: 'Maintenance requests from tenants', icon: 'Wrench' },
  'landlord/compliance': { title: 'Compliance', desc: 'Tenant verification and regulatory compliance', icon: 'Shield' },
  'landlord/disputes': { title: 'Disputes', desc: 'Tenant disputes and resolutions', icon: 'AlertTriangle' },
  'landlord/services': { title: 'Services', desc: 'Ancillary services for your properties', icon: 'ShoppingBag' },
  'landlord/earnings': { title: 'Earnings', desc: 'Revenue from rent and services', icon: 'DollarSign' },
  'landlord/analytics': { title: 'Analytics', desc: 'Property performance and occupancy trends', icon: 'BarChart3' },
  'landlord/documents': { title: 'Documents', desc: 'Agreements and compliance documents', icon: 'FileText' },
  'landlord/profile': { title: 'Profile', desc: 'Business profile and settings', icon: 'User' },
  // COLLEGE
  'college/students': { title: 'Students', desc: 'Students using off-campus housing', icon: 'GraduationCap' },
  'college/housing': { title: 'Off-Campus Housing', desc: 'Housing options near your campus', icon: 'Building2' },
  'college/verified-pgs': { title: 'Verified PGs', desc: 'UniNest-verified accommodations', icon: 'Shield' },
  'college/overflow': { title: 'Hostel Overflow', desc: 'Students needing off-campus placement', icon: 'MapPin' },
  'college/issues': { title: 'Issues', desc: 'Student housing complaints', icon: 'AlertTriangle' },
  'college/analytics': { title: 'Analytics', desc: 'Housing adoption and safety metrics', icon: 'BarChart3' },
  // PROVIDER
  'provider/jobs': { title: 'Jobs', desc: 'Active and pending service jobs', icon: 'Briefcase' },
  'provider/customers': { title: 'Customers', desc: 'Your service customers', icon: 'Users' },
  'provider/availability': { title: 'Availability', desc: 'Set your working schedule', icon: 'Clock' },
  'provider/services-list': { title: 'My Services', desc: 'Services you offer', icon: 'ShoppingBag' },
  'provider/pricing': { title: 'Pricing', desc: 'Set your service rates', icon: 'DollarSign' },
  'provider/earnings': { title: 'Earnings', desc: 'Revenue and payout history', icon: 'TrendingUp' },
  'provider/ratings': { title: 'Ratings & Reviews', desc: 'Customer feedback', icon: 'Star' },
  'provider/profile': { title: 'Profile', desc: 'Business profile and certifications', icon: 'User' },
};

let created = 0;
for (const [route, cfg] of Object.entries(pages)) {
  const dir = path.join(base, route);
  const file = path.join(dir, 'page.tsx');
  if (fs.existsSync(file)) { console.log(`SKIP ${route}`); continue; }
  fs.mkdirSync(dir, { recursive: true });

  const content = `import { prisma } from '@/lib/db';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { ${cfg.icon} } from 'lucide-react';

export default async function Page() {
${cfg.query ? '  ' + cfg.query : ''}
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">${cfg.title}</h1>
        <p className="text-text-secondary mt-1">${cfg.desc}</p>
      </div>
${cfg.table ? `      <Card padding="none">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-surface-tertiary border-b border-border">
              <tr>${cfg.heads.split(',').map(h => `<th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">${h}</th>`).join('')}</tr>
            </thead>
            <tbody className="divide-y divide-border-light">
              {${cfg.table}}
            </tbody>
          </table>
        </div>
      </Card>` : `      <Card>
        <div className="flex flex-col items-center justify-center py-16">
          <div className="w-14 h-14 bg-brand-50 rounded-2xl flex items-center justify-center mb-4">
            <${cfg.icon} className="w-7 h-7 text-brand-600" />
          </div>
          <h2 className="text-lg font-semibold text-text-primary mb-1">${cfg.title}</h2>
          <p className="text-sm text-text-secondary max-w-md text-center">${cfg.desc}. This section is ready for your data.</p>
        </div>
      </Card>`}
    </div>
  );
}
`;
  fs.writeFileSync(file, content);
  created++;
  console.log(`✅ ${route}`);
}
console.log(`\nDone! Created ${created} pages.`);
