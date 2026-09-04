import { getSession } from '@/lib/auth/actions';
import { prisma } from '@/lib/db';
import { formatINR } from '@/lib/utils';
import { Card, StatCard } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import {
  DollarSign, Wifi, UtensilsCrossed, Shirt, Droplets, Dumbbell,
  Users, Gift, TrendingUp, ArrowRight, Building2, ShieldCheck
} from 'lucide-react';

const DEMO_REWARDS = [
  { id: 'r1', source: 'wifi', description: 'Monthly Wi-Fi Provider Revenue Share (15 tenants)', amount: 2250, month: 9, year: 2026 },
  { id: 'r2', source: 'food', description: 'Tiffin & Meal Box Ancillary Affiliate (PCTE Students)', amount: 3800, month: 9, year: 2026 },
  { id: 'r3', source: 'laundry', description: 'On-Demand PG Laundry Service Revenue Share', amount: 1450, month: 9, year: 2026 },
  { id: 'r4', source: 'referral', description: 'UniNest Landlord Partner Referral Bonus', amount: 1000, month: 8, year: 2026 },
];

const DEMO_SERVICE_ORDERS = [
  { id: 'so1', serviceName: 'Deep Cleaning & Sanitization', customerName: 'Rahul Sharma (Room 204)', amount: 1200, landlordShare: 120, status: 'COMPLETED' },
  { id: 'so2', serviceName: 'High-Speed Wi-Fi Router Setup', customerName: 'Aman Verma (Room 102)', amount: 800, landlordShare: 80, status: 'COMPLETED' },
  { id: 'so3', serviceName: 'Bathroom Tap Leak Repair', customerName: 'Passi PG Manager', amount: 650, landlordShare: 65, status: 'IN_PROGRESS' },
];

export default async function LandlordEarningsPage() {
  const session = await getSession();
  if (!session) return null;

  let rewards = DEMO_REWARDS;
  let serviceOrders = DEMO_SERVICE_ORDERS;
  let totalRentCollected = 168000;
  let totalRentDue = 180000;

  try {
    const landlord = await prisma.landlord.findUnique({ where: { userId: session.userId } });
    if (landlord) {
      const dbRewards = await prisma.landlordReward.findMany({
        where: { landlordId: landlord.id },
        orderBy: { createdAt: 'desc' },
      });
      if (dbRewards && dbRewards.length > 0) {
        rewards = dbRewards as any[];
      }

      const properties = await prisma.property.findMany({
        where: { landlordId: landlord.id },
        include: {
          rooms: { include: { beds: { include: { tenancies: { where: { isActive: true }, include: { rentRecords: true } } } } } },
        },
      });

      const dbOrders = await prisma.serviceOrder.findMany({
        where: { propertyId: { in: properties.map(p => p.id) } },
        orderBy: { createdAt: 'desc' },
      });
      if (dbOrders && dbOrders.length > 0) {
        serviceOrders = dbOrders as any[];
      }

      let dbCollected = 0;
      let dbDue = 0;
      properties.forEach(p => p.rooms.forEach(r => r.beds.forEach(b => b.tenancies.forEach(t => t.rentRecords.forEach(rr => {
        dbCollected += rr.amountPaid;
        dbDue += rr.amountDue;
      })))));

      if (dbDue > 0) {
        totalRentCollected = dbCollected;
        totalRentDue = dbDue;
      }
    }
  } catch (error) {
    console.warn('Database error in LandlordEarningsPage, using demo fallback data:', error);
  }

  const totalRewards = rewards.reduce((sum, r) => sum + r.amount, 0);
  const totalCommissions = serviceOrders.reduce((sum, s) => sum + (s.landlordShare || 0), 0);
  const totalServiceRevenue = serviceOrders.reduce((sum, s) => sum + s.amount, 0);

  const rewardsBySource: Record<string, number> = {};
  rewards.forEach(r => {
    rewardsBySource[r.source] = (rewardsBySource[r.source] || 0) + r.amount;
  });

  const sourceIcons: Record<string, any> = {
    wifi: Wifi,
    food: UtensilsCrossed,
    laundry: Shirt,
    water: Droplets,
    gym: Dumbbell,
    guest: Users,
    referral: Gift,
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Earnings & Ancillary Rewards</h1>
          <p className="text-text-secondary mt-1">Rental ledger income, service commissions, and ancillary PG monetization</p>
        </div>
        <div className="p-2.5 bg-emerald-50 rounded-xl">
          <DollarSign className="w-6 h-6 text-emerald-600" />
        </div>
      </div>

      {/* Key Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Rent Collected" value={formatINR(totalRentCollected)} subtitle="Current billing cycle" icon={<DollarSign className="w-5 h-5 text-emerald-600" />} />
        <StatCard title="Rent Outstanding" value={formatINR(totalRentDue - totalRentCollected)} subtitle="Pending dues" icon={<TrendingUp className="w-5 h-5 text-amber-600" />} />
        <StatCard title="Ancillary Rewards" value={formatINR(totalRewards)} subtitle="Service commissions" icon={<Gift className="w-5 h-5 text-purple-600" />} />
        <StatCard title="Total Earnings" value={formatINR(totalRentCollected + totalRewards)} subtitle="Rent + Rewards" icon={<DollarSign className="w-5 h-5 text-brand-600" />} />
      </div>

      {/* Ancillary Commission Breakdown */}
      <section className="space-y-4">
        <h2 className="text-lg font-bold text-text-primary flex items-center gap-2">
          <Gift className="w-5 h-5 text-purple-600" /> Ancillary Service Revenue Share
          <Badge variant="success" size="sm">Active Stream</Badge>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.entries(rewardsBySource).map(([source, amount]) => {
            const Icon = sourceIcons[source] || DollarSign;
            return (
              <Card key={source}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Icon className="w-5 h-5 text-purple-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-text-primary capitalize">{source}</p>
                    <p className="text-xs text-text-tertiary">Commission</p>
                  </div>
                  <p className="text-base font-bold text-emerald-700">{formatINR(amount)}</p>
                </div>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Commission Split Model */}
      <section>
        <h2 className="text-lg font-bold text-text-primary mb-3">Commission Revenue Model</h2>
        <Card className="bg-gradient-to-r from-slate-900 to-slate-800 text-white p-6 rounded-2xl border-none">
          <div className="space-y-3">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Automated Revenue Split</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div className="bg-white/10 p-4 rounded-xl">
                <p className="text-xs text-slate-300">Total Vendor Service Orders</p>
                <p className="text-xl font-bold text-white mt-1">{formatINR(totalServiceRevenue)}</p>
              </div>
              <div className="bg-emerald-500/20 border border-emerald-500/30 p-4 rounded-xl">
                <p className="text-xs text-emerald-300">Landlord Net Payout</p>
                <p className="text-xl font-bold text-emerald-400 mt-1">{formatINR(totalRewards + totalCommissions)}</p>
              </div>
              <div className="bg-blue-500/20 border border-blue-500/30 p-4 rounded-xl">
                <p className="text-xs text-blue-300">UniNest Platform Fee</p>
                <p className="text-xl font-bold text-blue-400 mt-1">{formatINR(Math.round(totalServiceRevenue * 0.1))}</p>
              </div>
            </div>
          </div>
        </Card>
      </section>

      {/* Service Orders Table */}
      <section>
        <h2 className="text-lg font-bold text-text-primary mb-3">Recent Ancillary Orders</h2>
        <Card padding="none">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-surface-tertiary border-b border-border">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase">Service Name</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase">Customer</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-text-secondary uppercase">Order Total</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-text-secondary uppercase">Your Commission</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-light">
                {serviceOrders.map(so => (
                  <tr key={so.id} className="hover:bg-surface-secondary/50">
                    <td className="px-4 py-3 font-bold text-slate-900">{so.serviceName}</td>
                    <td className="px-4 py-3 text-text-secondary">{so.customerName}</td>
                    <td className="px-4 py-3 text-right font-medium text-slate-700">{formatINR(so.amount)}</td>
                    <td className="px-4 py-3 text-right font-extrabold text-emerald-700">{formatINR(so.landlordShare || 0)}</td>
                    <td className="px-4 py-3">
                      <Badge variant={so.status === 'COMPLETED' ? 'success' : 'warning'} size="sm">
                        {so.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </section>
    </div>
  );
}
