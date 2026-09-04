import { prisma } from '@/lib/db';
import { formatINR } from '@/lib/utils';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import {
  Building2, MapPin, ShieldCheck, Wifi, UtensilsCrossed, Shirt, Car,
  Zap, CheckCircle2, User, Star, AlertCircle, CalendarCheck, Phone, Check, ArrowLeft
} from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export default async function PropertyDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const property = await prisma.property.findUnique({
    where: { id },
    include: {
      landlord: { include: { user: true } },
      rooms: { include: { beds: true } },
      reviews: { include: { user: true } },
      collegeLinks: { include: { college: true } },
    },
  });

  if (!property) return notFound();

  const minRent = property.rooms.length > 0 ? Math.min(...property.rooms.map(r => r.rent)) : 0;
  const minDeposit = property.rooms.length > 0 ? Math.min(...property.rooms.map(r => r.deposit)) : 0;
  const totalBeds = property.rooms.reduce((acc, r) => acc + r.beds.length, 0);
  const availableBeds = property.rooms.reduce((acc, r) => acc + r.beds.filter(b => b.status === 'AVAILABLE').length, 0);
  const avgRating = property.reviews.length > 0
    ? property.reviews.reduce((acc, r) => acc + r.overall, 0) / property.reviews.length
    : 0;

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl mx-auto pb-12">
      {/* Back button */}
      <div>
        <Link href="/student/search" className="inline-flex items-center gap-1.5 text-sm font-medium text-text-secondary hover:text-text-primary transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to PG Search
        </Link>
      </div>

      {/* Property Header Banner */}
      <div className="bg-surface rounded-2xl border border-border p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-bold text-text-primary">{property.name}</h1>
              {property.verificationStatus === 'VERIFIED' && (
                <span className="verified-badge">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  UniNest Verified
                </span>
              )}
            </div>
            <p className="text-text-secondary flex items-center gap-1.5 text-sm">
              <MapPin className="w-4 h-4 text-brand-600 flex-shrink-0" />
              {property.address}, {property.city}, {property.state} - {property.pincode}
            </p>
            {property.collegeLinks.length > 0 && (
              <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-700 bg-brand-50 px-2.5 py-1 rounded-md">
                <Building2 className="w-3.5 h-3.5" />
                {property.collegeLinks[0].distance?.toFixed(1)} km from {property.collegeLinks[0].college.collegeName}
              </div>
            )}
          </div>
          <div className="bg-surface-secondary rounded-xl p-4 border border-border flex flex-col items-end justify-center min-w-[200px]">
            <span className="text-xs text-text-tertiary">Starting from</span>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold text-brand-700">{formatINR(minRent)}</span>
              <span className="text-xs text-text-secondary">/month</span>
            </div>
            <span className="text-xs text-text-tertiary mt-1">Deposit: {formatINR(minDeposit)}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <Card>
            <h2 className="text-lg font-semibold text-text-primary mb-3">About this Property</h2>
            <p className="text-text-secondary text-sm leading-relaxed">{property.description || 'No description provided.'}</p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-border-light text-center">
              <div className="bg-surface-secondary p-3 rounded-lg">
                <span className="text-xs text-text-tertiary">Gender Allowed</span>
                <p className="font-semibold text-sm text-text-primary mt-0.5">{property.gender}</p>
              </div>
              <div className="bg-surface-secondary p-3 rounded-lg">
                <span className="text-xs text-text-tertiary">Total Capacity</span>
                <p className="font-semibold text-sm text-text-primary mt-0.5">{totalBeds} Beds</p>
              </div>
              <div className="bg-surface-secondary p-3 rounded-lg">
                <span className="text-xs text-text-tertiary">Available Beds</span>
                <p className="font-semibold text-sm text-brand-600 mt-0.5">{availableBeds} Available</p>
              </div>
              <div className="bg-surface-secondary p-3 rounded-lg">
                <span className="text-xs text-text-tertiary">Rating</span>
                <p className="font-semibold text-sm text-amber-600 mt-0.5 flex items-center justify-center gap-1">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  {avgRating > 0 ? avgRating.toFixed(1) : 'New'}
                </p>
              </div>
            </div>
          </Card>

          {/* Rooms & Bed Selection */}
          <Card>
            <h2 className="text-lg font-semibold text-text-primary mb-1">Available Rooms & Beds</h2>
            <p className="text-xs text-text-secondary mb-4">Select a room and bed to proceed with digital booking.</p>

            <div className="space-y-4">
              {property.rooms.map(room => (
                <div key={room.id} className="border border-border rounded-xl p-4 space-y-3 bg-surface hover:border-brand-300 transition-colors">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-base text-text-primary">Room {room.roomNumber}</span>
                        <Badge variant="outline" size="sm">{room.sharing}-Sharing</Badge>
                        {room.hasAC && <Badge variant="info" size="sm">AC</Badge>}
                        {room.hasCooler && <Badge variant="default" size="sm">Cooler</Badge>}
                        {room.hasAttBath && <Badge variant="success" size="sm">Attached Bath</Badge>}
                      </div>
                      <p className="text-xs text-text-tertiary mt-0.5">Floor {room.floor}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-lg font-bold text-text-primary">{formatINR(room.rent)}</span>
                      <span className="text-xs text-text-secondary">/mo</span>
                    </div>
                  </div>

                  {/* Bed Grid */}
                  <div className="pt-2">
                    <p className="text-xs font-semibold text-text-secondary mb-2">Beds in this Room:</p>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {room.beds.map(bed => (
                        <div
                          key={bed.id}
                          className={`p-3 rounded-lg border text-center transition-all ${
                            bed.status === 'AVAILABLE'
                              ? 'border-brand-300 bg-brand-50/50 hover:bg-brand-100/50 cursor-pointer'
                              : 'border-border bg-surface-tertiary opacity-70 cursor-not-allowed'
                          }`}
                        >
                          <span className="text-xs font-bold text-text-primary block">Bed {bed.label}</span>
                          <span className={`text-[10px] font-semibold uppercase mt-0.5 inline-block px-1.5 py-0.2 rounded ${
                            bed.status === 'AVAILABLE' ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-200 text-gray-700'
                          }`}>
                            {bed.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Amenities & Rules */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Card>
              <h3 className="font-semibold text-text-primary mb-3 text-base">Included Amenities</h3>
              <ul className="space-y-2 text-sm text-text-secondary">
                {property.amenities.map(a => (
                  <li key={a} className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-brand-600 flex-shrink-0" />
                    <span>{a}</span>
                  </li>
                ))}
              </ul>
            </Card>
            <Card>
              <h3 className="font-semibold text-text-primary mb-3 text-base">House Rules</h3>
              <ul className="space-y-2 text-sm text-text-secondary">
                {property.rules.map(r => (
                  <li key={r} className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0" />
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
            </Card>
          </div>

          {/* Reviews */}
          <Card>
            <h2 className="text-lg font-semibold text-text-primary mb-4">Student Reviews</h2>
            {property.reviews.length === 0 ? (
              <p className="text-sm text-text-secondary py-4 text-center">No reviews submitted yet.</p>
            ) : (
              <div className="space-y-4">
                {property.reviews.map(review => (
                  <div key={review.id} className="border-b border-border-light pb-4 last:border-none last:pb-0 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-text-tertiary" />
                        <span className="text-sm font-semibold text-text-primary">{review.user?.name || 'Student'}</span>
                        {review.isVerifiedStay && <Badge variant="success" size="sm">Verified Stay</Badge>}
                      </div>
                      <div className="flex items-center gap-1 text-amber-500 text-xs font-bold">
                        <Star className="w-3.5 h-3.5 fill-amber-400" />
                        {review.overall}/5
                      </div>
                    </div>
                    <p className="text-sm text-text-secondary italic">"{review.comment}"</p>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Right Column / Sticky Sidebar */}
        <div className="space-y-6">
          {/* Booking Card */}
          <Card className="sticky top-6">
            <h3 className="font-bold text-lg text-text-primary mb-1">Book Your Bed</h3>
            <p className="text-xs text-text-secondary mb-4">Instant reservation with ₹399 token fee.</p>

            <div className="space-y-3 mb-6 bg-surface-secondary p-3.5 rounded-xl text-sm border border-border">
              <div className="flex justify-between">
                <span className="text-text-secondary">Reservation Fee:</span>
                <span className="font-semibold text-text-primary">₹399 (Fully Refundable)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">Monthly Rent:</span>
                <span className="font-semibold text-text-primary">From {formatINR(minRent)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">Agreement Term:</span>
                <span className="font-semibold text-text-primary">11 Months</span>
              </div>
            </div>

            <Button className="w-full" size="lg" icon={<CalendarCheck className="w-4 h-4" />}>
              Reserve Bed Now (₹399)
            </Button>
            <p className="text-[11px] text-text-tertiary text-center mt-2">
              🔒 Safe & Secure payment processed via UniNest Gateway.
            </p>

            {/* Landlord Contact Card */}
            <div className="mt-6 pt-6 border-t border-border space-y-3">
              <span className="text-xs font-semibold uppercase text-text-tertiary tracking-wider block">Managed By</span>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-brand-100 rounded-full flex items-center justify-center font-bold text-brand-700">
                  {property.landlord?.user?.name?.[0] || 'L'}
                </div>
                <div>
                  <p className="text-sm font-bold text-text-primary">{property.landlord?.businessName || property.landlord?.user?.name}</p>
                  <p className="text-xs text-text-secondary">{property.landlord?.user?.phone || 'Verified Landlord'}</p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
