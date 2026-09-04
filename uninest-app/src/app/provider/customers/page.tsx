import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Users, Phone, Mail, MapPin } from 'lucide-react';
import { formatINR } from '@/lib/utils';
import { prisma } from '@/lib/db';

const DEMO_CUSTOMERS = [
  {
    id: 'cust-1',
    name: 'Rahul Sharma',
    type: 'Student Tenant',
    property: 'PCTE Smart Student Residency (Room 204)',
    phone: '+91 98765 43210',
    email: 'rahul@uninest.demo',
    ordersCount: 3,
    spent: 2800,
    status: 'ACTIVE',
  },
  {
    id: 'cust-2',
    name: 'Passi Residency Management',
    type: 'PG Landlord',
    property: 'Passi Luxury PG (Ferozepur Rd)',
    phone: '+91 98123 45678',
    email: 'landlord@uninest.demo',
    ordersCount: 8,
    spent: 14500,
    status: 'VERIFIED',
  },
  {
    id: 'cust-3',
    name: 'Aman Verma',
    type: 'Student Tenant',
    property: 'Gulmohar Student Living (Room 102)',
    phone: '+91 97890 12345',
    email: 'aman@uninest.demo',
    ordersCount: 2,
    spent: 1600,
    status: 'ACTIVE',
  },
];

export default async function CustomerDirectoryPage() {
  let customers = DEMO_CUSTOMERS;

  try {
    const dbCustomers = await prisma.user.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
    });
    if (dbCustomers && dbCustomers.length > 0) {
      customers = dbCustomers.map((u: any) => ({
        id: u.id,
        name: u.name,
        type: u.role === 'STUDENT' ? 'Student Tenant' : 'PG Landlord',
        property: 'PCTE Student Residency',
        phone: u.phone || '+91 98765 43210',
        email: u.email,
        ordersCount: 2,
        spent: 2400,
        status: 'ACTIVE',
      }));
    }
  } catch (error) {
    console.warn('Database error in CustomerDirectoryPage, using fallback customer directory:', error);
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Customer Directory</h1>
          <p className="text-text-secondary mt-1">Students & PG Landlords requesting home & maintenance services</p>
        </div>
        <div className="p-2.5 bg-brand-50 rounded-xl">
          <Users className="w-6 h-6 text-brand-600" />
        </div>
      </div>

      <Card padding="none">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-surface-tertiary border-b border-border">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase">Customer Name</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase">Type / Category</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase">Property Location</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase">Contact</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase">Total Spent</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-light">
              {customers.map((c) => (
                <tr key={c.id} className="hover:bg-surface-secondary/50">
                  <td className="px-4 py-3 font-bold text-slate-900">{c.name}</td>
                  <td className="px-4 py-3 text-text-secondary">
                    <span className="bg-slate-100 text-slate-700 font-semibold px-2 py-0.5 rounded text-xs">
                      {c.type}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-text-secondary text-xs">{c.property}</td>
                  <td className="px-4 py-3 text-text-secondary text-xs">
                    <div>{c.phone}</div>
                    <div className="text-slate-400">{c.email}</div>
                  </td>
                  <td className="px-4 py-3 font-extrabold text-emerald-700">{formatINR(c.spent)}</td>
                  <td className="px-4 py-3">
                    <Badge variant="success" size="sm">
                      {c.status}
                    </Badge>
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
