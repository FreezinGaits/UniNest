import { getSession } from '@/lib/auth/actions';
import { prisma } from '@/lib/db';
import { formatINR, timeAgo } from '@/lib/utils';
import { Card, StatCard } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import {
  Search, CalendarCheck, CreditCard, Wrench, Zap, Bell,
  BedDouble, ArrowRight, Building2, Shield, MapPin
} from 'lucide-react';
import Link from 'next/link';

export default async function StudentDashboard() {
  const session = await getSession();
  if (!session) return null;

  // Fetch student data
  const student = await prisma.student.findUnique({
    where: { userId: session.userId },
    include: {
      tenancies: {
        where: { isActive: true },
        include: {
          bed: {
            include: {
              room: {
                include: {
                  property: true,
                },
              },
            },
          },
          rentRecords: {
            orderBy: { dueDate: 'desc' },
            take: 3,
          },
        },
      },
    },
  });

  const bookings = await prisma.booking.findMany({
    where: { userId: session.userId },
    orderBy: { createdAt: 'desc' },
    take: 5,
    include: {
      property: true,
      bed: { include: { room: true } },
    },
  });

  const notifications = await prisma.notification.findMany({
    where: { userId: session.userId, isRead: false },
    orderBy: { createdAt: 'desc' },
    take: 5,
  });

  const activeTenancy = student?.tenancies?.[0];
  const currentProperty = activeTenancy?.bed?.room?.property;
  const pendingRent = activeTenancy?.rentRecords?.find(r => r.status === 'DUE' || r.status === 'OVERDUE');

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-bold text-text-primary">
          Welcome back, {session.name.split(' ')[0]} 👋
        </h1>
        <p className="text-text-secondary mt-1">
          {activeTenancy
            ? `You're staying at ${currentProperty?.name}`
            : 'Find your perfect PG accommodation.'}
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Current Stay"
          value={activeTenancy ? currentProperty?.name || 'Active' : 'Not Checked In'}
          subtitle={activeTenancy ? `Room ${activeTenancy.bed.room.roomNumber}, Bed ${activeTenancy.bed.label}` : 'Search for PGs'}
          icon={<BedDouble className="w-5 h-5" />}
          color="brand"
        />
        <StatCard
          title="Rent Status"
          value={pendingRent ? formatINR(pendingRent.amountDue) : activeTenancy ? 'Paid' : '—'}
          subtitle={pendingRent ? `Due ${new Date(pendingRent.dueDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}` : 'No pending rent'}
          icon={<CreditCard className="w-5 h-5" />}
          color={pendingRent?.status === 'OVERDUE' ? 'red' : 'blue'}
        />
        <StatCard
          title="Active Bookings"
          value={bookings.filter(b => !['COMPLETED', 'CANCELLED', 'EXPIRED'].includes(b.status)).length}
          subtitle="Pending confirmations"
          icon={<CalendarCheck className="w-5 h-5" />}
          color="amber"
        />
        <StatCard
          title="Notifications"
          value={notifications.length}
          subtitle="Unread messages"
          icon={<Bell className="w-5 h-5" />}
          color="purple"
        />
      </div>

      {/* Quick Actions */}
      <Card>
        <h2 className="text-lg font-semibold text-text-primary mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { label: 'Find PG', icon: <Search className="w-5 h-5" />, href: '/student/search', color: 'bg-blue-50 text-blue-600' },
            { label: 'My Bookings', icon: <CalendarCheck className="w-5 h-5" />, href: '/student/bookings', color: 'bg-emerald-50 text-emerald-600' },
            { label: 'Pay Rent', icon: <CreditCard className="w-5 h-5" />, href: '/student/payments', color: 'bg-purple-50 text-purple-600' },
            { label: 'Electricity', icon: <Zap className="w-5 h-5" />, href: '/student/electricity', color: 'bg-amber-50 text-amber-600' },
            { label: 'Maintenance', icon: <Wrench className="w-5 h-5" />, href: '/student/maintenance', color: 'bg-red-50 text-red-600' },
            { label: 'Services', icon: <Building2 className="w-5 h-5" />, href: '/student/services', color: 'bg-cyan-50 text-cyan-600' },
          ].map(action => (
            <Link
              key={action.href}
              href={action.href}
              className="flex flex-col items-center gap-2 p-4 rounded-xl border border-border hover:border-brand-200 hover:bg-surface-secondary transition-all"
            >
              <div className={`p-2.5 rounded-lg ${action.color}`}>{action.icon}</div>
              <span className="text-xs font-medium text-text-primary">{action.label}</span>
            </Link>
          ))}
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Current Stay */}
        {activeTenancy && currentProperty && (
          <Card>
            <div className="flex items-start justify-between mb-4">
              <h2 className="text-lg font-semibold text-text-primary">Current Stay</h2>
              <Badge variant="success" dot>Active</Badge>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-brand-100 rounded-lg flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-brand-600" />
                </div>
                <div>
                  <p className="font-semibold text-text-primary">{currentProperty.name}</p>
                  <p className="text-sm text-text-secondary">{currentProperty.address}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-surface-secondary rounded-lg p-3">
                  <p className="text-xs text-text-tertiary">Room</p>
                  <p className="font-semibold text-text-primary">{activeTenancy.bed.room.roomNumber}</p>
                </div>
                <div className="bg-surface-secondary rounded-lg p-3">
                  <p className="text-xs text-text-tertiary">Bed</p>
                  <p className="font-semibold text-text-primary">{activeTenancy.bed.label}</p>
                </div>
                <div className="bg-surface-secondary rounded-lg p-3">
                  <p className="text-xs text-text-tertiary">Rent</p>
                  <p className="font-semibold text-text-primary">{formatINR(activeTenancy.bed.room.rent)}/mo</p>
                </div>
                <div className="bg-surface-secondary rounded-lg p-3">
                  <p className="text-xs text-text-tertiary">Since</p>
                  <p className="font-semibold text-text-primary">
                    {new Date(activeTenancy.startDate).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
                  </p>
                </div>
              </div>
              <Link href="/student/stay">
                <Button variant="outline" size="sm" className="w-full">
                  View Details <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </Link>
            </div>
          </Card>
        )}

        {/* Recent Notifications */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-text-primary">Recent Notifications</h2>
            <Link href="/student/profile" className="text-sm text-brand-600 hover:text-brand-700 font-medium">
              View All
            </Link>
          </div>
          {notifications.length === 0 ? (
            <div className="text-center py-8">
              <Bell className="w-8 h-8 text-text-tertiary mx-auto mb-2" />
              <p className="text-sm text-text-secondary">No new notifications</p>
            </div>
          ) : (
            <div className="space-y-2">
              {notifications.map(n => (
                <div key={n.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-surface-secondary transition-colors">
                  <div className="w-2 h-2 bg-brand-500 rounded-full mt-1.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-text-primary">{n.title}</p>
                    <p className="text-xs text-text-secondary mt-0.5 truncate">{n.message}</p>
                    <p className="text-[10px] text-text-tertiary mt-1">{timeAgo(n.createdAt)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Recent Bookings */}
        {bookings.length > 0 && (
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-text-primary">Recent Bookings</h2>
              <Link href="/student/bookings" className="text-sm text-brand-600 hover:text-brand-700 font-medium">
                View All
              </Link>
            </div>
            <div className="space-y-3">
              {bookings.slice(0, 3).map(b => (
                <div key={b.id} className="flex items-center gap-3 p-3 rounded-lg border border-border-light">
                  <div className="w-10 h-10 bg-surface-tertiary rounded-lg flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-text-secondary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-text-primary truncate">{b.property.name}</p>
                    <p className="text-xs text-text-secondary">
                      Room {b.bed.room.roomNumber}, Bed {b.bed.label}
                    </p>
                  </div>
                  <Badge variant={
                    b.status === 'ACTIVE' ? 'success' :
                    b.status === 'PENDING' ? 'warning' :
                    b.status === 'CANCELLED' ? 'danger' : 'info'
                  }>
                    {b.status.replace('_', ' ')}
                  </Badge>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Search CTA - Show when no active tenancy */}
        {!activeTenancy && (
          <Card className="bg-gradient-to-br from-brand-50 to-blue-50 border-brand-200">
            <div className="text-center py-4">
              <div className="w-14 h-14 bg-brand-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <Search className="w-7 h-7 text-brand-600" />
              </div>
              <h3 className="text-lg font-semibold text-text-primary mb-1">Find Your PG</h3>
              <p className="text-sm text-text-secondary mb-4 max-w-xs mx-auto">
                Search verified PG accommodations near your college. Compare prices, amenities, and reviews.
              </p>
              <Link href="/student/search">
                <Button>
                  <Search className="w-4 h-4" />
                  Start Searching
                </Button>
              </Link>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
