import { getSession } from '@/lib/auth/actions';
import { prisma } from '@/lib/db';
import { formatINR } from '@/lib/utils';
import { Card, StatCard } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import {
  DollarSign, Wifi, UtensilsCrossed, Shirt, Droplets, Dumbbell,
  Users, Gift, TrendingUp, ArrowRight, Building2
} from 'lucide-react';

export default async function LandlordEarningsPage() {
  const session = await getSession();
  if (!session) return null;

  const landlord = await prisma.landlord.findUnique({ where: { userId: session.userId } });
  if (!landlord) return null;

  // Fetch rewards
  const rewards = await prisma.landlordReward.findMany({
    where: { landlordId: landlord.id },
    orderBy: { createdAt: 'desc' },
  });

  // Fetch payments (rent collected)
  const properties = await prisma.property.findMany({
    where: { landlordId: landlord.id },
    include: {
      rooms: { include: { beds: { include: { tenancies: { where: { isActive: true }, include: { rentRecords: true } } } } } },
    },
  });

  // Fetch commissions
  const serviceOrders = await prisma.serviceOrder.findMany({
    where: { propertyId: { in: properties.map(p => p.id) } },
    orderBy: { createdAt: 'desc' },
  });

  // Calculate totals
  let totalRentCollected = 0;
  let totalRentDue = 0;
  properties.forEach(p => p.rooms.forEach(r => r.beds.forEach(b => b.tenancies.forEach(t => t.rentRecords.forEach(rr => {
    totalRentCollected += rr.amountPaid;
    totalRentDue += rr.amountDue;
  })))));

  const totalRewards = rewards.reduce((sum, r) => sum + r.amount, 0);
  const totalCommissions = serviceOrders.reduce((sum, s) => sum + (s.landlordShare || 0), 0);
  const totalUniNestShare = serviceOrders.reduce((sum, s) => sum + (s.commission || 0), 0);
  const totalServiceRevenue = serviceOrders.reduce((sum, s) => sum + s.amount, 0);

  // Group rewards by source
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
          <h1 className="text-2xl font-bold text-text-primary">Earnings & Rewards</h1>
          <p className="text-text-secondary mt-1">Rental income, service commissions, and ancillary earnings</p>
        </div>
        <div className="p-2.5 bg-emerald-50 rounded-xl">
          <DollarSign className="w-6 h-6 text-emerald-600" />
        </div>
      </div>

      {/* Financial disclaimer */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-2.5 text-xs text-amber-800 font-medium">
        💡 All financial figures are <strong>demo/illustrative</strong> — not actual revenue. Money stored as paise (₹1 = 100 paise).
      </div>

      {/* Key Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Rent Collected" value={formatINR(totalRentCollected)} subtitle="Demo total" icon={<DollarSign className="w-5 h-5 text-emerald-600" />} />
        <StatCard title="Rent Outstanding" value={formatINR(totalRentDue - totalRentCollected)} subtitle="Pending dues" icon={<TrendingUp className="w-5 h-5 text-amber-600" />} />
        <StatCard title="Ancillary Rewards" value={formatINR(totalRewards)} subtitle="Service commissions" icon={<Gift className="w-5 h-5 text-purple-600" />} />
        <StatCard title="Total Earnings" value={formatINR(totalRentCollected + totalRewards)} subtitle="Rent + Rewards" icon={<DollarSign className="w-5 h-5 text-brand-600" />} />
      </div>

      {/* Ancillary Commission Breakdown — Most Prominent */}
      <section>
        <h2 className="text-lg font-bold text-text-primary mb-4 flex items-center gap-2">
          <Gift className="w-5 h-5 text-purple-600" /> Ancillary Service Earnings
          <Badge variant="success" size="sm">Active Revenue Stream</Badge>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {Object.entries(rewardsBySource).map(([source, amount]) => {
            const Icon = sourceIcons[source] || DollarSign;
            return (
              <Card key={source}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center">
                    <Icon className="w-5 h-5 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-text-primary capitalize">{source}</p>
                    <p className="text-xs text-text-tertiary">Commission earned</p>
                  </div>
                  <p className="text-lg font-bold text-emerald-700">{formatINR(amount)}</p>
                </div>
              </Card>
            );
          })}
          {Object.keys(rewardsBySource).length === 0 && (
            <Card>
              <p className="text-sm text-text-secondary text-center py-4">No reward data yet. Service commissions appear here when tenants purchase ancillary services.</p>
            </Card>
          )}
        </div>
        <div className="mt-3 text-xs text-text-tertiary">
          Total Landlord Share: <strong className="text-emerald-700">{formatINR(totalRewards)}</strong> · UniNest retains platform fee from service vendor commission.
        </div>
      </section>

      {/* Commission Split Example */}
      <section>
        <h2 className="text-lg font-bold text-text-primary mb-3">Commission Split Model</h2>
        <Card>
          <div className="bg-surface-secondary rounded-lg p-4">
            <p className="text-xs font-semibold text-text-tertiary uppercase tracking-wider mb-3">Illustrative Demo Economics</p>
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-sm text-text-secondary">Customer pays (service)</span>
                <span className="text-sm font-bold text-text-primary">{formatINR(totalServiceRevenue || 50000)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-text-secondary">Vendor commission</span>
                <span className="text-sm font-bold text-amber-700">{formatINR(totalUniNestShare + totalCommissions || 10000)}</span>
              </div>
              <div className="h-px bg-border" />
              <div className="flex items-center justify-between">
                <span className="text-sm text-text-secondary">→ UniNest retained</span>
                <span className="text-sm font-bold text-brand-700">{formatINR(totalUniNestShare || 7500)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-text-secondary">→ Landlord share</span>
                <span className="text-sm font-bold text-emerald-700">{formatINR(totalCommissions || 2500)}</span>
              </div>
            </div>
          </div>
          <p className="text-[11px] text-text-tertiary mt-2">Label: Illustrative demo economics — not actual rates</p>
        </Card>
      </section>

      {/* Service Orders Table */}
      {serviceOrders.length > 0 && (
        <section>
          <h2 className="text-lg font-bold text-text-primary mb-3">Recent Service Orders</h2>
          <Card padding="none">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-surface-tertiary border-b border-border">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase">Service</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase">Customer</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-text-secondary uppercase">Amount</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-text-secondary uppercase">Your Share</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-light">
                  {serviceOrders.map(so => (
                    <tr key={so.id} className="hover:bg-surface-secondary/50">
                      <td className="px-4 py-3 font-medium text-text-primary">{so.serviceName}</td>
                      <td className="px-4 py-3 text-text-secondary">{so.customerName}</td>
                      <td className="px-4 py-3 text-right text-text-primary">{formatINR(so.amount)}</td>
                      <td className="px-4 py-3 text-right font-semibold text-emerald-700">{formatINR(so.landlordShare || 0)}</td>
                      <td className="px-4 py-3">
                        <Badge variant={so.status === 'COMPLETED' ? 'success' : so.status === 'CONFIRMED' ? 'warning' : 'default'} size="sm">
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
      )}

      {/* Reward History */}
      {rewards.length > 0 && (
        <section>
          <h2 className="text-lg font-bold text-text-primary mb-3">Reward History</h2>
          <Card padding="none">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-surface-tertiary border-b border-border">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase">Source</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase">Description</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-text-secondary uppercase">Amount</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase">Period</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-light">
                  {rewards.map(r => (
                    <tr key={r.id} className="hover:bg-surface-secondary/50">
                      <td className="px-4 py-3 font-medium text-text-primary capitalize">{r.source}</td>
                      <td className="px-4 py-3 text-text-secondary">{r.description}</td>
                      <td className="px-4 py-3 text-right font-semibold text-emerald-700">{formatINR(r.amount)}</td>
                      <td className="px-4 py-3 text-text-tertiary text-xs">{r.month}/{r.year}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </section>
      )}
    </div>
  );
}
