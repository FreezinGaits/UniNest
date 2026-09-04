import { prisma } from '@/lib/db';
import { formatINR } from '@/lib/utils';
import { Card, StatCard } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { ProgressBar } from '@/components/ui/Shared';
import {
  Users, Building2, BedDouble, CreditCard, CalendarCheck, Shield,
  Wrench, AlertTriangle, TrendingUp, BarChart3, Clock, ShoppingBag
} from 'lucide-react';
import Link from 'next/link';

export default async function AdminDashboard() {
  const [
    userCount,
    studentCount,
    landlordCount,
    propertyCount,
    bedCount,
    occupiedBedCount,
    bookingCount,
    activeBookingCount,
    paymentSum,
    openMaintenance,
    openDisputes,
    serviceOrderCount,
    recentAuditLogs,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { role: 'STUDENT' } }),
    prisma.user.count({ where: { role: 'LANDLORD' } }),
    prisma.property.count(),
    prisma.bed.count(),
    prisma.bed.count({ where: { status: 'OCCUPIED' } }),
    prisma.booking.count(),
    prisma.booking.count({ where: { status: { in: ['PENDING', 'CONFIRMED', 'ACTIVE'] } } }),
    prisma.payment.aggregate({ where: { status: 'SUCCESS' }, _sum: { amount: true } }),
    prisma.maintenanceTicket.count({ where: { status: { in: ['OPEN', 'ASSIGNED', 'IN_PROGRESS'] } } }),
    prisma.dispute.count({ where: { status: { in: ['OPEN', 'EVIDENCE_SUBMITTED', 'RESPONSE_PENDING', 'UNDER_REVIEW'] } } }),
    prisma.serviceOrder.count(),
    prisma.auditLog.findMany({ orderBy: { createdAt: 'desc' }, take: 10, include: { user: { select: { name: true, role: true } } } }),
  ]);

  const totalRevenue = paymentSum._sum.amount || 0;
  const occupancyRate = bedCount > 0 ? Math.round((occupiedBedCount / bedCount) * 100) : 0;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Admin Overview</h1>
        <p className="text-text-secondary mt-1">Platform-wide metrics and operations.</p>
      </div>

      {/* Key Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Users" value={userCount} subtitle={`${studentCount} students, ${landlordCount} landlords`} icon={<Users className="w-5 h-5" />} color="brand" />
        <StatCard title="Properties" value={propertyCount} subtitle={`${bedCount} beds total`} icon={<Building2 className="w-5 h-5" />} color="blue" />
        <StatCard title="Occupancy Rate" value={`${occupancyRate}%`} subtitle={`${occupiedBedCount}/${bedCount} beds`} icon={<BedDouble className="w-5 h-5" />} color="purple" />
        <StatCard title="Total Revenue" value={formatINR(totalRevenue)} subtitle="All-time payments" icon={<CreditCard className="w-5 h-5" />} color="brand" />
      </div>

      {/* Operations Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link href="/admin/bookings">
          <Card hover>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-50"><CalendarCheck className="w-5 h-5 text-blue-600" /></div>
              <div>
                <p className="text-sm font-medium text-text-primary">Active Bookings</p>
                <p className="text-xl font-bold text-text-primary">{activeBookingCount}</p>
              </div>
            </div>
          </Card>
        </Link>
        <Link href="/admin/verification">
          <Card hover>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-50"><Shield className="w-5 h-5 text-emerald-600" /></div>
              <div>
                <p className="text-sm font-medium text-text-primary">Verifications</p>
                <p className="text-xl font-bold text-text-primary">{propertyCount}</p>
              </div>
            </div>
          </Card>
        </Link>
        <Link href="/admin/maintenance">
          <Card hover>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-50"><Wrench className="w-5 h-5 text-amber-600" /></div>
              <div>
                <p className="text-sm font-medium text-text-primary">Open Maintenance</p>
                <p className="text-xl font-bold text-amber-600">{openMaintenance}</p>
              </div>
            </div>
          </Card>
        </Link>
        <Link href="/admin/disputes">
          <Card hover>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-red-50"><AlertTriangle className="w-5 h-5 text-red-600" /></div>
              <div>
                <p className="text-sm font-medium text-text-primary">Open Disputes</p>
                <p className="text-xl font-bold text-red-600">{openDisputes}</p>
              </div>
            </div>
          </Card>
        </Link>
      </div>

      {/* Audit Log & Platform Health */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-text-primary">Recent Audit Log</h2>
            <Link href="/admin/audit-log" className="text-sm text-brand-600 font-medium">View All</Link>
          </div>
          {recentAuditLogs.length === 0 ? (
            <p className="text-sm text-text-secondary text-center py-8">No audit entries yet.</p>
          ) : (
            <div className="space-y-2">
              {recentAuditLogs.map(log => (
                <div key={log.id} className="flex items-start gap-3 p-2.5 rounded-lg hover:bg-surface-secondary transition-colors">
                  <Clock className="w-4 h-4 text-text-tertiary mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-text-primary">
                      <span className="font-medium">{log.user?.name || 'System'}</span>
                      {' '}{log.action.toLowerCase()} {log.entity.toLowerCase()}
                    </p>
                    <p className="text-[11px] text-text-tertiary">
                      {new Date(log.createdAt).toLocaleString('en-IN')}
                    </p>
                  </div>
                  <Badge variant="outline" size="sm">{log.entity}</Badge>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card>
          <h2 className="text-lg font-semibold text-text-primary mb-4">Platform Health</h2>
          <div className="space-y-4">
            <ProgressBar value={occupiedBedCount} max={bedCount} label="Bed Occupancy" color="brand" />
            <ProgressBar value={studentCount} max={userCount} label="Student Ratio" color="blue" />
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="bg-surface-secondary rounded-lg p-3">
                <p className="text-xs text-text-tertiary">Service Orders</p>
                <p className="text-lg font-bold text-text-primary">{serviceOrderCount}</p>
              </div>
              <div className="bg-surface-secondary rounded-lg p-3">
                <p className="text-xs text-text-tertiary">Total Bookings</p>
                <p className="text-lg font-bold text-text-primary">{bookingCount}</p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
