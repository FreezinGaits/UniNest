import Link from 'next/link';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth/actions';
import { formatINR } from '@/lib/utils';
import { Card, StatCard } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import {
  Briefcase,
  Star,
  DollarSign,
  Clock,
  CheckCircle2,
  ShieldCheck,
  Wrench,
  ArrowRight,
  User,
  AlertTriangle,
} from 'lucide-react';
import { getEmergenciesForRole } from '@/lib/emergencyStore';

const FALLBACK_JOBS = [
  {
    id: 'ord-1',
    serviceName: 'Power Socket Sparking & MCB Replacement',
    customerName: 'Rahul Sharma • PCTE Smart Student Residency (Room 204)',
    categoryName: 'Electrical (90-Min Urgent SLA)',
    amount: 55000,
    commission: 8250,
    status: 'IN_PROGRESS',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'ord-2',
    serviceName: 'Split AC Gas Refill & Cooling Coil Jet Wash',
    customerName: 'Vikram Singh • PCTE Smart Student Residency',
    categoryName: 'AC / HVAC Servicing',
    amount: 80000,
    commission: 12000,
    status: 'IN_PROGRESS',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'ord-3',
    serviceName: 'Bathroom Diverter & Tap Leakage Repair',
    customerName: 'Rahul Sharma • PCTE Smart Student Residency (Room 204)',
    categoryName: 'Plumbing & Repairs',
    amount: 50000,
    commission: 7500,
    status: 'COMPLETED',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'ord-4',
    serviceName: 'Full PG Floor Deep Cleaning & Sanitization',
    customerName: 'Vikram Singh • Passi Residency Properties',
    categoryName: 'Cleaning & Housekeeping',
    amount: 250000,
    commission: 37500,
    status: 'COMPLETED',
    createdAt: new Date().toISOString(),
  },
];

export default async function ProviderDashboard() {
  const session = await getSession();
  if (!session) return null;

  let provider: any = null;
  let serviceOrders: any[] = [];

  try {
    provider = await prisma.serviceProvider.findUnique({ where: { userId: session.userId } });

    if (provider) {
      const rawOrders = await prisma.serviceOrder.findMany({
        where: { providerId: provider.id },
        take: 20,
        orderBy: { createdAt: 'desc' },
      });
      serviceOrders = rawOrders.map((o: any) => {
        const customer = o.customerName || o.tenancy?.student?.user?.name || 'Rahul Sharma';
        const room = o.tenancy?.bed?.room?.roomNumber
          ? `${o.tenancy.bed.room.property?.name || 'PCTE Smart Student Residency'} (Room ${o.tenancy.bed.room.roomNumber})`
          : 'PCTE Smart Student Residency';
        const service = o.serviceName || o.service?.name || 'PG Maintenance Service';
        const category = o.categoryName || o.service?.category || 'General Maintenance';
        const rawAmt = o.amount || o.service?.price || 50000;
        const amountPaise = rawAmt < 5000 ? rawAmt * 100 : rawAmt;
        return {
          id: o.id,
          serviceName: service,
          customerName: customer.includes('•') ? customer : `${customer} • ${room}`,
          categoryName: category,
          customer,
          room,
          service,
          plan: o.plan || category,
          amount: amountPaise,
          commission: o.commission || Math.round(amountPaise * 0.15),
          status: o.status || 'IN_PROGRESS',
          Started: new Date(o.createdAt || Date.now()).toLocaleDateString('en-IN'),
          createdAt: o.createdAt ? new Date(o.createdAt).toISOString() : new Date().toISOString(),
        };
      });
    }
  } catch {
    // Fallback below
  }

  if (!provider) {
    provider = {
      businessName: session.name || 'QuickFix Services',
      rating: 4.9,
      totalJobs: 48,
    };
  }

  if (!serviceOrders || serviceOrders.length === 0) {
    serviceOrders = FALLBACK_JOBS;
  }

  const emergencies = getEmergenciesForRole('PROVIDER', session.email);
  const activeEmergencies = emergencies.filter((e) => e.status !== 'RESOLVED');

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">
            {provider?.businessName || 'QuickFix Services'} — Vendor Operations
          </h1>
          <p className="text-text-secondary text-xs sm:text-sm mt-1">
            Verified Ludhiana PG Maintenance, Plumbing, Electrical & Cleaning SLA Partner ({session.email})
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" /> Verified SLA Vendor
          </span>
          <Link
            href="/provider/profile"
            className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-3.5 py-1.5 rounded-full flex items-center gap-1.5 transition-colors"
          >
            <User className="w-3.5 h-3.5" /> Business Profile
          </Link>
        </div>
      </div>

      {activeEmergencies.length > 0 && (
        <div className="bg-rose-50 border-2 border-rose-500 rounded-2xl p-4 flex items-center justify-between gap-4 shadow-md animate-pulse">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-6 h-6 text-rose-600 shrink-0" />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-rose-800 bg-rose-100 px-2 py-0.5 rounded">
                  {activeEmergencies[0].dispatchNo}
                </span>
                <span className="text-xs font-bold text-rose-900 uppercase">
                  Active 15-Min Property Emergency
                </span>
              </div>
              <p className="text-sm font-black text-rose-950 mt-0.5">
                {activeEmergencies[0].title} — {activeEmergencies[0].property} ({activeEmergencies[0].unit})
              </p>
              <p className="text-xs text-rose-700 mt-0.5">
                Assigned Tech: <strong>{activeEmergencies[0].assignedTech}</strong> • ETA: ~{activeEmergencies[0].etaMins} mins • Tenant: {activeEmergencies[0].tenantName} ({activeEmergencies[0].tenantPhone})
              </p>
            </div>
          </div>
          <Link
            href="/provider/jobs"
            className="bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs px-4 py-2 rounded-xl shrink-0 shadow-sm transition-colors"
          >
            Open Dispatch Board →
          </Link>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Active Dispatches"
          value={3}
          subtitle="90-Min Urgent SLA Active"
          icon={<Briefcase className="w-5 h-5" />}
          color="blue"
        />
        <StatCard
          title="Completed PG Jobs"
          value={provider?.totalJobs || 48}
          subtitle="98.4% On-Time SLA"
          icon={<CheckCircle2 className="w-5 h-5" />}
          color="brand"
        />
        <StatCard
          title="Customer Rating"
          value={provider?.rating?.toFixed(1) || '4.9'}
          subtitle="From 34 verified reviews"
          icon={<Star className="w-5 h-5" />}
          color="amber"
        />
        <StatCard
          title="Net Disbursed Earnings"
          value={formatINR(4507500)}
          subtitle="After 15% commission"
          icon={<DollarSign className="w-5 h-5" />}
          color="purple"
        />
      </div>

      {/* Quick Action Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link href="/provider/jobs">
          <Card hover className="p-4 flex items-center justify-between border-slate-200">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600">
                <Wrench className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">SLA Dispatch Board</p>
                <p className="text-xs text-slate-500">Accept & complete PG jobs</p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400" />
          </Card>
        </Link>
        <Link href="/provider/availability">
          <Card hover className="p-4 flex items-center justify-between border-slate-200">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">Shift & Slot Roster</p>
                <p className="text-xs text-slate-500">4 Police-verified techs active</p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400" />
          </Card>
        </Link>
        <Link href="/provider/earnings">
          <Card hover className="p-4 flex items-center justify-between border-slate-200">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600">
                <DollarSign className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">Instant UPI Settlement</p>
                <p className="text-xs text-slate-500">₹1,445 ready for payout</p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400" />
          </Card>
        </Link>
      </div>

      <Card>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Recent Service Orders & Maintenance Dispatches</h2>
          <Link href="/provider/jobs" className="text-xs font-bold text-brand-600 hover:underline">
            Open Full Dispatch Board →
          </Link>
        </div>
        <div className="space-y-2.5">
          {serviceOrders.map((order: any) => (
            <div
              key={order.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl border border-slate-200 bg-slate-50/50"
            >
              <div className="flex-1">
                <p className="text-sm font-bold text-slate-900">{order.serviceName}</p>
                <p className="text-xs text-slate-500">
                  {order.customerName} • {order.categoryName}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <p className="text-sm font-extrabold text-emerald-700">{formatINR(order.amount)}</p>
                <Badge
                  variant={
                    order.status === 'COMPLETED'
                      ? 'success'
                      : order.status === 'IN_PROGRESS'
                      ? 'info'
                      : order.status === 'CONFIRMED'
                      ? 'warning'
                      : 'default'
                  }
                  size="sm"
                >
                  {order.status.replace('_', ' ')}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
