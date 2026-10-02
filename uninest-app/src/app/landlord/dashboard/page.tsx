import { getSession } from '@/lib/auth/actions';
import { prisma } from '@/lib/db';
import { getPropertiesForLandlord, isDemoLandlordEmail } from '@/lib/propertiesStore';
import { formatRupees } from '@/lib/utils';
import { Card, StatCard } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { ProgressBar } from '@/components/ui/Shared';
import Link from 'next/link';
import {
  Building2,
  BedDouble,
  CreditCard,
  Wrench,
  TrendingUp,
  Plus,
  ShieldCheck,
  Clock,
  Eye,
  AlertTriangle,
  MessageSquare,
} from 'lucide-react';
import { getEmergenciesForRole } from '@/lib/emergencyStore';
import { getAdminMessages } from '@/lib/adminMessagesStore';

export const dynamic = 'force-dynamic';

export default async function LandlordDashboard() {
  const session = await getSession();
  if (!session) return null;

  const isDemoUser = isDemoLandlordEmail(session.email);

  // Single unified source of truth shared with /landlord/properties
  const properties = await getPropertiesForLandlord(session.email);

  let recentBookings: any[] = [];
  if (isDemoUser || properties.length > 0) {
    try {
      recentBookings = await prisma.booking.findMany({
        where: isDemoUser ? undefined : { propertyId: { in: properties.map((p) => p.id) } },
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: {
          user: { select: { name: true } },
          property: { select: { name: true } },
          bed: { include: { room: { select: { roomNumber: true } } } },
        },
      });
    } catch (error) {
      console.warn('Database error in LandlordDashboard bookings, using fallback:', error);
    }
  }

  if ((!recentBookings || recentBookings.length === 0) && isDemoUser) {
    recentBookings = [
      {
        id: 'bkg-pcte-2026-demo',
        status: 'RESERVED',
        user: { name: 'Rahul Sharma' },
        property: { name: 'PCTE Smart Student Residency' },
        bed: { label: 'A', room: { roomNumber: '204' } },
      },
    ];
  }

  // Dynamically compute all portfolio metrics from the exact properties list
  const totalBeds = properties.reduce((acc, p) => acc + Number(p.totalBeds || 0), 0);
  const occupiedBeds = properties.reduce((acc, p) => acc + Number(p.occupiedBeds || 0), 0);
  const reservedBeds = recentBookings.filter(
    (b) => b.status === 'RESERVED' || b.status === 'VISIT_REQUESTED' || b.status === 'VISIT_CONFIRMED'
  ).length || (isDemoUser ? 1 : 0);
  const openMaintenance = properties.reduce((acc, p) => acc + Number(p.openTickets || 0), 0);
  const availableBeds = Math.max(0, totalBeds - occupiedBeds - reservedBeds);
  const occupancyRate = totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0;

  // Calculate actual monthly rent collected (occupiedBeds * rentPerMonth) & expected rent (totalBeds * rentPerMonth) in Rupees
  const collectedRentRupees = properties.reduce(
    (sum, p) => sum + Number(p.occupiedBeds || 0) * Number(p.rentPerMonth || 6000),
    0
  );
  const expectedRentRupees = properties.reduce(
    (sum, p) => sum + Number(p.totalBeds || 0) * Number(p.rentPerMonth || 6000),
    0
  );
  const ancillaryEarningsRupees = isDemoUser ? 8500 : 0;

  const emergencies = getEmergenciesForRole('LANDLORD', session.email);
  const activeEmergencies = emergencies.filter((e) => e.status !== 'RESOLVED');

  const allAdminMessages = getAdminMessages();
  const recentAdminNotes = allAdminMessages.filter(
    (m) => m.fromRole === 'ADMIN' && properties.some((p) => p.id === m.toPropertyId)
  );
  const latestAdminNote = recentAdminNotes.length > 0 ? recentAdminNotes[recentAdminNotes.length - 1] : null;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">
            Landlord Business Dashboard
          </h1>
          <p className="text-text-secondary mt-1">
            {isDemoUser ? 'Passi Residency Properties Ltd.' : (session.name || 'Landlord Portfolio')} • {properties.length}{' '}
            {properties.length === 1 ? 'property' : 'properties'} ({totalBeds} total beds)
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/landlord/properties">
            <Button variant="outline" size="sm">
              <Eye className="w-4 h-4" /> View Properties ({properties.length})
            </Button>
          </Link>
          <Link href="/landlord/properties?add=true">
            <Button size="sm">
              <Plus className="w-4 h-4" /> Add Property
            </Button>
          </Link>
        </div>
      </div>

      {/* Active Property Emergency Alert */}
      {activeEmergencies.length > 0 && (
        <div
          className={`border-2 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-md transition-all ${
            activeEmergencies[0].status === 'AWAITING_TENANT_CONFIRMATION'
              ? 'bg-amber-50 border-amber-500'
              : 'bg-rose-50 border-rose-500 animate-pulse'
          }`}
        >
          <div className="flex items-start sm:items-center gap-3">
            <AlertTriangle
              className={`w-6 h-6 shrink-0 mt-0.5 sm:mt-0 ${
                activeEmergencies[0].status === 'AWAITING_TENANT_CONFIRMATION'
                  ? 'text-amber-600'
                  : 'text-rose-600'
              }`}
            />
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-mono text-xs font-bold text-slate-800 bg-white/80 border border-slate-300 px-2 py-0.5 rounded">
                  {activeEmergencies[0].dispatchNo}
                </span>
                <span
                  className={`text-xs font-bold uppercase tracking-wider ${
                    activeEmergencies[0].status === 'AWAITING_TENANT_CONFIRMATION'
                      ? 'text-amber-900 bg-amber-200/80 px-2 py-0.5 rounded-full'
                      : 'text-rose-900 bg-rose-200/80 px-2 py-0.5 rounded-full'
                  }`}
                >
                  {activeEmergencies[0].status === 'AWAITING_TENANT_CONFIRMATION'
                    ? 'In-House Resolution Awaiting Tenant OTP'
                    : 'Critical Property Hazard Alert (15-Min SLA)'}
                </span>
              </div>
              <p className="text-sm font-black text-slate-950 mt-0.5">
                {activeEmergencies[0].title} — {activeEmergencies[0].property} ({activeEmergencies[0].unit})
              </p>
              <p className="text-xs text-slate-700 mt-0.5">
                {activeEmergencies[0].status === 'AWAITING_TENANT_CONFIRMATION' ? (
                  <span>
                    Tenant OTP Code: <strong className="font-mono font-black text-indigo-700">{activeEmergencies[0].resolutionOtp || '4192'}</strong> • Share with resident {activeEmergencies[0].tenantName} to close ticket.
                  </span>
                ) : (
                  <span>
                    Tenant: <strong>{activeEmergencies[0].tenantName}</strong> ({activeEmergencies[0].tenantPhone}) • QuickFix Duty Tech: <strong>{activeEmergencies[0].assignedTech}</strong> (ETA ~{activeEmergencies[0].etaMins}m)
                  </span>
                )}
              </p>
            </div>
          </div>
          <Link
            href="/landlord/maintenance"
            className={`font-extrabold text-xs px-4 py-2 rounded-xl shrink-0 shadow-sm transition-colors text-white ${
              activeEmergencies[0].status === 'AWAITING_TENANT_CONFIRMATION'
                ? 'bg-amber-700 hover:bg-amber-800'
                : 'bg-rose-600 hover:bg-rose-700'
            }`}
          >
            {activeEmergencies[0].status === 'AWAITING_TENANT_CONFIRMATION'
              ? 'View In-House Status →'
              : 'Review & Coordinate Caretaker →'}
          </Link>
        </div>
      )}

      {/* Official Admin Communication Notice Banner */}
      {latestAdminNote && (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-300 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-sm">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-900 bg-amber-200/90 px-2 py-0.5 rounded-full">
                  Official Communication from UniNest Admin
                </span>
                <span className="text-xs font-bold text-slate-800">
                  Regarding: <strong className="text-slate-950 font-black">{latestAdminNote.propertyName || 'Property Portfolio'}</strong>
                </span>
                <span className="text-[11px] text-slate-500">
                  {new Date(latestAdminNote.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <p className="text-xs font-semibold text-slate-800 mt-1 bg-white/80 px-3 py-1 rounded-lg border border-amber-200/60 inline-block">
                "{latestAdminNote.message}"
              </p>
            </div>
          </div>
          <Link
            href="/landlord/properties"
            className="bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs px-4 py-2 rounded-xl shrink-0 shadow-sm transition-colors flex items-center gap-1.5"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            View in Properties Portfolio →
          </Link>
        </div>
      )}

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Properties"
          value={properties.length}
          subtitle={`${totalBeds} beds total across portfolio`}
          icon={<Building2 className="w-5 h-5" />}
          color="brand"
        />
        <StatCard
          title="Occupancy"
          value={`${occupancyRate}%`}
          subtitle={`${occupiedBeds}/${totalBeds} beds occupied`}
          icon={<BedDouble className="w-5 h-5" />}
          color="blue"
          trend={{ value: occupancyRate >= 60 ? 'Healthy' : 'Growing', positive: true }}
        />
        <StatCard
          title="Rent Collected"
          value={formatRupees(collectedRentRupees)}
          subtitle={`of ${formatRupees(expectedRentRupees)} expected`}
          icon={<CreditCard className="w-5 h-5" />}
          color="brand"
        />
        <StatCard
          title="Earnings This Month"
          value={formatRupees(ancillaryEarningsRupees)}
          subtitle="From ancillary services"
          icon={<TrendingUp className="w-5 h-5" />}
          color="purple"
        />
      </div>

      {/* Occupancy & Alerts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Occupancy Breakdown */}
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-text-primary">
              Portfolio Bed Inventory ({totalBeds} Beds)
            </h2>
            <Link href="/landlord/beds" className="text-xs font-bold text-brand-600 hover:text-brand-700">
              Manage Bed Matrix →
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
            {[
              { label: 'Occupied', count: occupiedBeds, color: 'bg-blue-500' },
              { label: 'Available', count: availableBeds, color: 'bg-emerald-500' },
              { label: 'Reserved (OTP Hold)', count: reservedBeds, color: 'bg-amber-500' },
              { label: 'Open Tickets', count: openMaintenance, color: 'bg-red-500' },
            ].map((item) => (
              <div key={item.label} className="bg-surface-secondary rounded-lg p-3 text-center">
                <div className={`w-3 h-3 rounded-full ${item.color} mx-auto mb-2`} />
                <p className="text-xl font-bold text-text-primary">{item.count}</p>
                <p className="text-xs text-text-secondary">{item.label}</p>
              </div>
            ))}
          </div>
          <ProgressBar value={occupiedBeds} max={totalBeds || 1} label="Overall Portfolio Occupancy" color="brand" />
        </Card>

        {/* Alerts */}
        <Card>
          <h2 className="text-lg font-semibold text-text-primary mb-4">Alerts & Maintenance</h2>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-amber-50 rounded-lg border border-amber-200">
              <Wrench className="w-5 h-5 text-amber-600 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-amber-800">
                  {openMaintenance} Open Maintenance {openMaintenance === 1 ? 'Ticket' : 'Tickets'}
                </p>
                <p className="text-xs text-amber-600">Bathroom Tap Leak (Room 204)</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <BedDouble className="w-5 h-5 text-blue-600 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-blue-800">Vacant Beds Ready to Book</p>
                <p className="text-xs text-blue-600">
                  {availableBeds} vacant beds across {properties.length} properties
                </p>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Properties & Bookings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Properties */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-text-primary">
              Your Properties ({properties.length})
            </h2>
            <Link href="/landlord/properties" className="text-sm text-brand-600 hover:text-brand-700 font-medium">
              View All →
            </Link>
          </div>
          <div className="space-y-3">
            {properties.map((property) => (
              <Link
                key={property.id}
                href={`/landlord/properties/${property.id}`}
                className="flex items-center justify-between gap-3 p-3 rounded-lg border border-border-light hover:border-brand-200 hover:bg-surface-secondary transition-all"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 bg-brand-50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Building2 className="w-5 h-5 text-brand-600" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="text-sm font-bold text-text-primary truncate">{property.name}</p>
                      {property.verificationStatus === 'VERIFIED' ? (
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                      ) : (
                        <Clock className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-text-secondary truncate">
                      {property.locality}, {property.city} • ₹{Number(property.rentPerMonth || 6000).toLocaleString('en-IN')}/mo
                    </p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-xs font-extrabold text-slate-900 block">
                    {property.occupiedBeds}/{property.totalBeds} beds
                  </span>
                  <span
                    className={`text-[10px] font-bold ${
                      property.verificationStatus === 'VERIFIED' ? 'text-emerald-600' : 'text-amber-600'
                    }`}
                  >
                    {property.verificationStatus}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </Card>

        {/* Recent Bookings */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-text-primary">Recent Bookings</h2>
            <Link href="/landlord/bookings" className="text-sm text-brand-600 hover:text-brand-700 font-medium">
              View All →
            </Link>
          </div>
          <div className="space-y-3">
            {recentBookings.length > 0 ? (
              recentBookings.map((booking: any) => (
                <div key={booking.id} className="flex items-center gap-3 p-3 rounded-lg border border-border-light">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-text-primary">{booking.user?.name || 'Rahul Sharma'}</p>
                    <p className="text-xs text-text-secondary">
                      {booking.property?.name || 'PCTE Smart Student Residency'} • Room{' '}
                      {booking.bed?.room?.roomNumber || '204'}
                    </p>
                  </div>
                  <Badge variant={booking.status === 'ACTIVE' ? 'success' : 'warning'} size="sm">
                    {booking.status || 'RESERVED'}
                  </Badge>
                </div>
              ))
            ) : (
              <p className="text-sm text-text-secondary py-4 text-center">No recent bookings yet.</p>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
