import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth/actions';
import { formatINR } from '@/lib/utils';
import { Card, StatCard } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Briefcase, Star, DollarSign, Clock, CheckCircle2, TrendingUp } from 'lucide-react';

export default async function ProviderDashboard() {
  const session = await getSession();
  if (!session) return null;

  const provider = await prisma.serviceProvider.findUnique({ where: { userId: session.userId } });

  const serviceOrders = provider ? await prisma.serviceOrder.findMany({
    where: { providerId: provider.id },
    orderBy: { createdAt: 'desc' },
    take: 10,
  }) : [];

  const completedJobs = serviceOrders.filter(o => o.status === 'COMPLETED').length;
  const activeJobs = serviceOrders.filter(o => o.status === 'IN_PROGRESS' || o.status === 'CONFIRMED').length;
  const totalEarnings = serviceOrders.filter(o => o.status === 'COMPLETED').reduce((a, o) => a + o.amount - o.commission, 0);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Provider Dashboard</h1>
        <p className="text-text-secondary mt-1">{provider?.businessName || 'Service Provider'}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Active Jobs" value={activeJobs} subtitle="In progress" icon={<Briefcase className="w-5 h-5" />} color="blue" />
        <StatCard title="Completed Jobs" value={completedJobs} subtitle="All time" icon={<CheckCircle2 className="w-5 h-5" />} color="brand" />
        <StatCard title="Rating" value={provider?.rating?.toFixed(1) || '—'} subtitle={`${provider?.totalJobs || 0} total jobs`} icon={<Star className="w-5 h-5" />} color="amber" />
        <StatCard title="Total Earnings" value={formatINR(totalEarnings)} subtitle="After commission" icon={<DollarSign className="w-5 h-5" />} color="purple" />
      </div>

      <Card>
        <h2 className="text-lg font-semibold mb-4">Recent Jobs</h2>
        {serviceOrders.length === 0 ? (
          <p className="text-sm text-text-secondary text-center py-8">No jobs yet.</p>
        ) : (
          <div className="space-y-2">
            {serviceOrders.map(order => (
              <div key={order.id} className="flex items-center gap-3 p-3 rounded-lg border border-border-light">
                <div className="flex-1">
                  <p className="text-sm font-medium text-text-primary">{order.serviceName}</p>
                  <p className="text-xs text-text-secondary">{order.customerName} • {order.categoryName}</p>
                </div>
                <p className="text-sm font-semibold text-text-primary">{formatINR(order.amount)}</p>
                <Badge variant={
                  order.status === 'COMPLETED' ? 'success' :
                  order.status === 'IN_PROGRESS' ? 'info' :
                  order.status === 'CONFIRMED' ? 'warning' : 'default'
                } size="sm">
                  {order.status.replace('_', ' ')}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
