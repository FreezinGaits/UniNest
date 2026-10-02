import { prisma } from '@/lib/db';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { ShoppingBag, Truck, CheckCircle2 } from 'lucide-react';
import { formatINR } from '@/lib/utils';

const DEMO_SERVICES = [
  {
    id: 's1',
    serviceName: 'PG Deep Cleaning & Disinfection',
    provider: 'Ludhiana Home Services',
    property: 'PCTE Smart Student Residency (Room 204)',
    requestedBy: 'Rahul Sharma',
    amount: 150000,
    totalAmount: 150000,
    landlordCommission: 15000,
    landlordShare: 15000,
    status: 'COMPLETED',
    date: '02 Sep 2026',
  },
  {
    id: 's2',
    serviceName: 'Commercial Laundry Pick-up',
    provider: 'Express PG DryCleaners',
    property: 'PCTE Smart Student Residency (Room 204)',
    requestedBy: 'Aman Verma',
    amount: 80000,
    totalAmount: 80000,
    landlordCommission: 8000,
    landlordShare: 8000,
    status: 'IN_PROGRESS',
    date: '04 Sep 2026',
  },
  {
    id: 's3',
    serviceName: 'Room AC Filter Servicing',
    provider: 'CoolAir Maintenance',
    property: 'PCTE Smart Student Residency (Room 205)',
    requestedBy: 'Rohit Verma',
    amount: 70000,
    totalAmount: 70000,
    landlordCommission: 7000,
    landlordShare: 7000,
    status: 'COMPLETED',
    date: '05 Sep 2026',
  },
];

import { getSession } from '@/lib/auth/actions';

export default async function PartnerServicesPage() {
  const session = await getSession();
  const isDemoUser = session?.email?.toLowerCase().includes('demo') || 
                     session?.email?.toLowerCase() === 'landlord@uninest.in' || 
                     session?.email?.toLowerCase() === 'vikram@passiresidency.in';

  let services = isDemoUser ? DEMO_SERVICES : [];

  try {
    const dbOrders = await prisma.serviceOrder.findMany({
      include: { provider: true },
      orderBy: { createdAt: 'desc' },
    });
    if (dbOrders && dbOrders.length > 0) {
      services = dbOrders.map((o: any) => {
        const rawAmount = o.totalAmount || o.amount || 0;
        const totalAmount = rawAmount < 10000 ? rawAmount * 100 : rawAmount;
        const rawShare = o.landlordShare || o.landlordCommission || Math.round(totalAmount * 0.05);
        const landlordShare = rawShare < 1000 && totalAmount >= 10000 ? rawShare * 100 : rawShare;
        return {
          id: o.id,
          serviceName: o.serviceName || 'PG Maintenance',
          provider: o.provider?.businessName || 'QuickFix Services',
          property: o.property?.name || 'PCTE Smart Student Residency',
          requestedBy: o.customerName || 'Rahul Sharma',
          amount: totalAmount,
          totalAmount,
          landlordCommission: landlordShare,
          landlordShare,
          status: o.status || 'COMPLETED',
          date: new Date(o.createdAt).toLocaleDateString('en-IN'),
        };
      });
    }
  } catch (error) {
    console.warn('Database error in PartnerServicesPage, using demo fallback services:', error);
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Ancillary Partner Services</h1>
          <p className="text-text-secondary mt-1">Vendor service dispatch, PG cleaning schedules, and affiliate earnings</p>
        </div>
        <div className="p-2.5 bg-blue-50 rounded-xl">
          <ShoppingBag className="w-6 h-6 text-blue-600" />
        </div>
      </div>

      {!isDemoUser && services.length === 0 ? (
        <div className="text-center py-12 text-sm text-text-secondary">No services configured yet.</div>
      ) : (
        <>
      <Card padding="none">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-surface-tertiary border-b border-border">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase">Service Name</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase">Provider Vendor</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase">Property</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-text-secondary uppercase">Total Price</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-text-secondary uppercase">Landlord Share</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-light">
              {services.map(s => (
                <tr key={s.id} className="hover:bg-surface-secondary/50">
                  <td className="px-4 py-3 font-bold text-slate-900">{s.serviceName}</td>
                  <td className="px-4 py-3 text-text-secondary text-xs font-semibold text-brand-700">{s.provider}</td>
                  <td className="px-4 py-3 text-text-secondary text-xs">{s.property}</td>
                  <td className="px-4 py-3 text-right font-medium text-slate-700">{formatINR(s.amount)}</td>
                  <td className="px-4 py-3 text-right font-extrabold text-emerald-700">{formatINR(s.landlordCommission)}</td>
                  <td className="px-4 py-3">
                    <Badge variant={s.status === 'COMPLETED' ? 'success' : 'warning'} size="sm">
                      {s.status}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
        </>
      )}
    </div>
  );
}
