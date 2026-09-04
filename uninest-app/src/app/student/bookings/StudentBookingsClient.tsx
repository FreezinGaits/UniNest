'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { CalendarCheck, MapPin, ChevronRight, Sparkles, Clock, CheckCircle2, ShieldCheck, ArrowRight, BedDouble } from 'lucide-react';
import { formatINR } from '@/lib/utils';

interface StudentBookingsClientProps {
  initialBookings: any[];
}

export function StudentBookingsClient({ initialBookings }: StudentBookingsClientProps) {
  const router = useRouter();
  const [filter, setFilter] = useState('ALL');
  const [bookings] = useState<any[]>(initialBookings);

  const filteredBookings = bookings.filter((b) => {
    if (filter === 'ALL') return true;
    if (filter === 'RESERVED') return b.status === 'RESERVED' || b.status === 'PENDING';
    if (filter === 'VISIT') return b.status === 'VISIT_REQUESTED' || b.status === 'VISIT_CONFIRMED';
    if (filter === 'CONFIRMED') return b.status === 'CONFIRMED' || b.status === 'OCCUPIED';
    if (filter === 'CANCELLED') return b.status === 'CANCELLED' || b.status === 'EXPIRED';
    return true;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'VISIT_REQUESTED':
        return <Badge variant="warning">📅 Visit Requested</Badge>;
      case 'VISIT_CONFIRMED':
        return <Badge variant="success">✓ Visit Confirmed</Badge>;
      case 'RESERVED':
      case 'PENDING':
        return <Badge variant="info">🔒 Bed Reserved (₹399 Paid)</Badge>;
      case 'CONFIRMED':
      case 'OCCUPIED':
        return <Badge variant="success">🎉 Move-in Confirmed</Badge>;
      case 'CANCELLED':
        return <Badge variant="danger">✕ Cancelled</Badge>;
      case 'EXPIRED':
        return <Badge variant="outline">⏱ Expired</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getNextActionHint = (booking: any) => {
    const status = booking.status;
    const visit = booking.visitAppointments?.[0];

    if (status === 'VISIT_REQUESTED') {
      return visit
        ? `Awaiting Landlord approval for ${new Date(visit.scheduledDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })} (${visit.timeSlot})`
        : 'Schedule property visit timing';
    }
    if (status === 'VISIT_CONFIRMED') {
      return `Visit confirmed for ${visit ? new Date(visit.scheduledDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }) : 'Upcoming'}. Tap to get directions.`;
    }
    if (status === 'RESERVED' || status === 'PENDING') {
      return 'Schedule property visit or proceed with agreement & KYC';
    }
    if (status === 'CONFIRMED') {
      return 'Tenancy active. View agreement, pay rent, or request maintenance.';
    }
    return 'View booking workspace details';
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 rounded-3xl text-white shadow-xl">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-300 bg-indigo-900/60 px-3 py-1 rounded-full border border-indigo-700/50 mb-2">
            <CalendarCheck className="w-3.5 h-3.5" />
            Interactive Workspace Ecosystem
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold">My Bookings</h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            Track bed reservations, schedule visits, access exact location & communicate safely with landlords.
          </p>
        </div>

        <Link
          href="/student/search"
          className="inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-5 py-3 rounded-xl transition-all shadow-md shrink-0"
        >
          <Sparkles className="w-4 h-4" />
          <span>Explore More PGs</span>
        </Link>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-bold">
        {[
          { key: 'ALL', label: `All Bookings (${bookings.length})` },
          { key: 'RESERVED', label: 'Reserved (₹399 Hold)' },
          { key: 'VISIT', label: 'Visits Scheduled' },
          { key: 'CONFIRMED', label: 'Confirmed / Active' },
          { key: 'CANCELLED', label: 'Cancelled / Expired' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`px-4 py-2.5 rounded-xl border transition-all whitespace-nowrap ${
              filter === tab.key
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-600/20'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Booking List Container */}
      {filteredBookings.length > 0 ? (
        <div className="space-y-4">
          {filteredBookings.map((booking) => {
            const property = booking.property;
            const room = booking.bed?.room;
            const bed = booking.bed;
            const createdDateStr = new Date(booking.createdAt).toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            });

            return (
              <div
                key={booking.id}
                onClick={() => router.push(`/student/bookings/${booking.id}`)}
                className="bg-white rounded-2xl border border-slate-200 hover:border-indigo-500 hover:shadow-lg transition-all duration-200 cursor-pointer overflow-hidden group p-5 flex flex-col md:flex-row md:items-center justify-between gap-5"
              >
                {/* Left Section: Image & Info */}
                <div className="flex items-start gap-4">
                  <div className="relative w-24 h-24 rounded-2xl overflow-hidden bg-slate-100 shrink-0">
                    <img
                      src={property?.images?.[0] || 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800'}
                      alt={property?.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute bottom-1 right-1 bg-slate-900/80 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                      ₹399 Paid
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[11px] font-mono font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                        REF: {booking.id}
                      </span>
                      {getStatusBadge(booking.status)}
                    </div>

                    <h3 className="text-lg font-extrabold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1">
                      {property?.name}
                    </h3>

                    <div className="flex items-center gap-3 text-xs text-slate-600 flex-wrap">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-indigo-500" />
                        {property?.locality || property?.address}, {property?.city}
                      </span>
                      {room && (
                        <span className="font-semibold text-slate-800 bg-indigo-50 text-indigo-900 px-2 py-0.5 rounded-md border border-indigo-100">
                          Room {room.roomNumber} ({bed?.label || 'Bed'})
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-500 pt-1 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                      <span>{getNextActionHint(booking)}</span>
                    </p>
                  </div>
                </div>

                {/* Right Section: Fee, Date & CTA Button */}
                <div className="flex items-center justify-between md:flex-col md:items-end gap-3 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100 shrink-0">
                  <div className="text-left md:text-right">
                    <div className="text-[11px] font-medium text-slate-400">Booked On</div>
                    <div className="text-xs font-bold text-slate-800">{createdDateStr}</div>
                    <div className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1 mt-0.5">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      ₹399 Fee Paid
                    </div>
                  </div>

                  <button
                    type="button"
                    className="py-2.5 px-4 rounded-xl bg-indigo-600 group-hover:bg-indigo-700 text-white font-extrabold text-xs shadow-md shadow-indigo-600/20 flex items-center gap-1.5 transition-all"
                  >
                    <span>Open Workspace</span>
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Empty State */
        <Card className="py-16 text-center">
          <div className="flex flex-col items-center justify-center max-w-md mx-auto space-y-4">
            <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-3xl flex items-center justify-center border border-indigo-100 shadow-sm">
              <BedDouble className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <h3 className="text-xl font-extrabold text-slate-900">No bookings match filter</h3>
              <p className="text-xs text-slate-500">
                You haven't placed any bed reservations under this status yet. Reserve a bed for ₹399 to unlock exact property locations.
              </p>
            </div>

            <Link
              href="/student/search"
              className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs px-6 py-3 rounded-xl shadow-md transition-all mt-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>Browse Student PGs</span>
            </Link>
          </div>
        </Card>
      )}
    </div>
  );
}
