import { getSession } from '@/lib/auth/actions';
import { prisma } from '@/lib/db';
import { formatINR } from '@/lib/utils';
import { Card, StatCard } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { ProgressBar } from '@/components/ui/Shared';
import Link from 'next/link';
import {
  Building2, BedDouble, Users, CreditCard, Wrench, TrendingUp,
  AlertTriangle, Plus, ArrowRight, Zap, ShieldCheck, DollarSign,
  CalendarCheck, BarChart3, Eye
} from 'lucide-react';

export default async function LandlordDashboard() {
  const session = await getSession();
  if (!session) return null;

  const landlord = await prisma.landlord.findUnique({
    where: { userId: session.userId },
  });

  if (!landlord) {
    return (
      <div className="space-y-6 animate-fade-in">
        <h1 className="text-2xl font-bold">Welcome to UniNest</h1>
        <Card className="text-center py-8">
          <Building2 className="w-12 h-12 text-brand-300 mx-auto mb-3" />
          <h2 className="text-lg font-semibold mb-1">Get Started as a Landlord</h2>
          <p className="text-sm text-text-secondary mb-4">List your first property to start managing tenants.</p>
          <Link href="/landlord/properties">
            <Button><Plus className="w-4 h-4" /> Add Property</Button>
          </Link>
        </Card>
      </div>
    );
  }

  // Fetch landlord stats
  const properties = await prisma.property.findMany({
    where: { landlordId: landlord.id },
    include: {
      rooms: {
        include: {
          beds: true,
        },
      },
      maintenanceTickets: {
        where: { status: { in: ['OPEN', 'ASSIGNED', 'IN_PROGRESS'] } },
      },
    },
  });

  const totalBeds = properties.reduce((acc, p) => acc + p.rooms.reduce((a, r) => a + r.beds.length, 0), 0);
  const occupiedBeds = properties.reduce((acc, p) => acc + p.rooms.reduce((a, r) => a + r.beds.filter(b => b.status === 'OCCUPIED').length, 0), 0);
  const availableBeds = properties.reduce((acc, p) => acc + p.rooms.reduce((a, r) => a + r.beds.filter(b => b.status === 'AVAILABLE').length, 0), 0);
  const reservedBeds = properties.reduce((acc, p) => acc + p.rooms.reduce((a, r) => a + r.beds.filter(b => b.status === 'RESERVED').length, 0), 0);
  const openMaintenance = properties.reduce((acc, p) => acc + p.maintenanceTickets.length, 0);
  const occupancyRate = totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0;

  // Rent data
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  // Get all tenancies for this landlord's properties
  const propertyIds = properties.map(p => p.id);
  const bedIds = properties.flatMap(p => p.rooms.flatMap(r => r.beds.map(b => b.id)));

  const rentRecords = await prisma.rentRecord.findMany({
    where: {
      tenancy: { bedId: { in: bedIds } },
      month: currentMonth,
      year: currentYear,
    },
  });

  const expectedRent = rentRecords.reduce((acc, r) => acc + r.amountDue, 0);
  const collectedRent = rentRecords.reduce((acc, r) => acc + r.amountPaid, 0);
  const overdueRent = rentRecords.filter(r => r.status === 'OVERDUE').reduce((acc, r) => acc + (r.amountDue - r.amountPaid), 0);

  // Landlord rewards
  const rewards = await prisma.landlordReward.findMany({
    where: { landlordId: landlord.id, month: currentMonth, year: currentYear },
  });
  const totalRewards = rewards.reduce((acc, r) => acc + r.amount, 0);

  // Recent bookings
  const recentBookings = await prisma.booking.findMany({
    where: { propertyId: { in: propertyIds } },
    orderBy: { createdAt: 'desc' },
    take: 5,
    include: {
      user: { select: { name: true } },
      property: { select: { name: true } },
      bed: { include: { room: { select: { roomNumber: true } } } },
    },
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">
            Landlord Dashboard
          </h1>
          <p className="text-text-secondary mt-1">
            {landlord.businessName || session.name} • {properties.length} {properties.length === 1 ? 'property' : 'properties'}
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/landlord/properties">
            <Button variant="outline" size="sm">
              <Eye className="w-4 h-4" /> View Properties
            </Button>
          </Link>
          <Link href="/landlord/properties">
            <Button size="sm">
              <Plus className="w-4 h-4" /> Add Property
            </Button>
          </Link>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Properties"
          value={properties.length}
          subtitle={`${totalBeds} beds total`}
          icon={<Building2 className="w-5 h-5" />}
          color="brand"
        />
        <StatCard
          title="Occupancy"
          value={`${occupancyRate}%`}
          subtitle={`${occupiedBeds}/${totalBeds} beds occupied`}
          icon={<BedDouble className="w-5 h-5" />}
          color="blue"
          trend={occupancyRate >= 80 ? { value: 'Healthy', positive: true } : { value: 'Below target', positive: false }}
        />
        <StatCard
          title="Rent Collected"
          value={formatINR(collectedRent)}
          subtitle={`of ${formatINR(expectedRent)} expected`}
          icon={<CreditCard className="w-5 h-5" />}
          color={overdueRent > 0 ? 'red' : 'brand'}
        />
        <StatCard
          title="Earnings This Month"
          value={formatINR(totalRewards)}
          subtitle="From ancillary services"
          icon={<TrendingUp className="w-5 h-5" />}
          color="purple"
        />
      </div>

      {/* Occupancy & Alerts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Occupancy Breakdown */}
        <Card className="lg:col-span-2">
          <h2 className="text-lg font-semibold text-text-primary mb-4">Bed Inventory</h2>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-4">
            {[
              { label: 'Occupied', count: occupiedBeds, color: 'bg-blue-500' },
              { label: 'Available', count: availableBeds, color: 'bg-emerald-500' },
              { label: 'Reserved', count: reservedBeds, color: 'bg-amber-500' },
              { label: 'Notice', count: properties.reduce((acc, p) => acc + p.rooms.reduce((a, r) => a + r.beds.filter(b => b.status === 'NOTICE_PERIOD').length, 0), 0), color: 'bg-orange-500' },
              { label: 'Maintenance', count: properties.reduce((acc, p) => acc + p.rooms.reduce((a, r) => a + r.beds.filter(b => b.status === 'MAINTENANCE_HOLD').length, 0), 0), color: 'bg-red-500' },
            ].map(item => (
              <div key={item.label} className="bg-surface-secondary rounded-lg p-3 text-center">
                <div className={`w-3 h-3 rounded-full ${item.color} mx-auto mb-2`} />
                <p className="text-xl font-bold text-text-primary">{item.count}</p>
                <p className="text-xs text-text-secondary">{item.label}</p>
              </div>
            ))}
          </div>
          <ProgressBar value={occupiedBeds} max={totalBeds} label="Overall Occupancy" color="brand" />
        </Card>

        {/* Alerts */}
        <Card>
          <h2 className="text-lg font-semibold text-text-primary mb-4">Alerts</h2>
          <div className="space-y-3">
            {overdueRent > 0 && (
              <div className="flex items-center gap-3 p-3 bg-red-50 rounded-lg border border-red-200">
                <CreditCard className="w-5 h-5 text-red-600 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-red-800">Rent Overdue</p>
                  <p className="text-xs text-red-600">{formatINR(overdueRent)} pending</p>
                </div>
              </div>
            )}
            {openMaintenance > 0 && (
              <div className="flex items-center gap-3 p-3 bg-amber-50 rounded-lg border border-amber-200">
                <Wrench className="w-5 h-5 text-amber-600 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-amber-800">Open Maintenance</p>
                  <p className="text-xs text-amber-600">{openMaintenance} tickets pending</p>
                </div>
              </div>
            )}
            {availableBeds > 0 && (
              <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <BedDouble className="w-5 h-5 text-blue-600 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-blue-800">Vacant Beds</p>
                  <p className="text-xs text-blue-600">{availableBeds} beds to fill</p>
                </div>
              </div>
            )}
            {overdueRent === 0 && openMaintenance === 0 && availableBeds === 0 && (
              <div className="flex items-center gap-3 p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                <ShieldCheck className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-emerald-800">All Good!</p>
                  <p className="text-xs text-emerald-600">No pending issues</p>
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Properties & Bookings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Properties */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-text-primary">Properties</h2>
            <Link href="/landlord/properties" className="text-sm text-brand-600 hover:text-brand-700 font-medium">
              View All
            </Link>
          </div>
          <div className="space-y-3">
            {properties.map(property => {
              const pBeds = property.rooms.reduce((a, r) => a + r.beds.length, 0);
              const pOccupied = property.rooms.reduce((a, r) => a + r.beds.filter(b => b.status === 'OCCUPIED').length, 0);
              return (
                <Link key={property.id} href={`/landlord/properties/${property.id}`}>
                  <div className="flex items-center gap-3 p-3 rounded-lg border border-border-light hover:border-brand-200 hover:bg-surface-secondary transition-all">
                    <div className="w-10 h-10 bg-brand-50 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Building2 className="w-5 h-5 text-brand-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-text-primary truncate">{property.name}</p>
                        {property.verificationStatus === 'VERIFIED' && (
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                        )}
                      </div>
                      <p className="text-xs text-text-secondary">{pOccupied}/{pBeds} beds • {property.rooms.length} rooms</p>
                    </div>
                    <div className="text-right">
                      <ProgressBar value={pOccupied} max={pBeds} showPercent={false} className="w-16" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </Card>

        {/* Recent Bookings */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-text-primary">Recent Bookings</h2>
            <Link href="/landlord/bookings" className="text-sm text-brand-600 hover:text-brand-700 font-medium">
              View All
            </Link>
          </div>
          {recentBookings.length === 0 ? (
            <div className="text-center py-8">
              <CalendarCheck className="w-8 h-8 text-text-tertiary mx-auto mb-2" />
              <p className="text-sm text-text-secondary">No bookings yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentBookings.map(booking => (
                <div key={booking.id} className="flex items-center gap-3 p-3 rounded-lg border border-border-light">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-text-primary">{booking.user.name}</p>
                    <p className="text-xs text-text-secondary">
                      {booking.property.name} • Room {booking.bed.room.roomNumber}, Bed {booking.bed.label}
                    </p>
                  </div>
                  <Badge variant={
                    booking.status === 'CONFIRMED' || booking.status === 'ACTIVE' ? 'success' :
                    booking.status === 'PENDING' ? 'warning' :
                    booking.status === 'CANCELLED' ? 'danger' : 'info'
                  } size="sm">
                    {booking.status.replace('_', ' ')}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Why Stay on UniNest */}
      <Card className="bg-gradient-to-r from-brand-50 via-surface to-blue-50 border-brand-200">
        <h2 className="text-lg font-semibold text-text-primary mb-3">More Than a Listing. Your PG Operating System.</h2>
        <p className="text-sm text-text-secondary mb-4">
          UniNest helps you manage tenants, collect rent, track electricity, handle maintenance, resolve disputes, 
          and earn from ancillary services — all from one dashboard.
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Rent Collection', icon: <CreditCard className="w-4 h-4" /> },
            { label: 'Electricity Tracking', icon: <Zap className="w-4 h-4" /> },
            { label: 'Maintenance', icon: <Wrench className="w-4 h-4" /> },
            { label: 'Earnings', icon: <DollarSign className="w-4 h-4" /> },
          ].map(item => (
            <div key={item.label} className="flex items-center gap-2 text-sm text-text-secondary">
              <div className="text-brand-600">{item.icon}</div>
              {item.label}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
