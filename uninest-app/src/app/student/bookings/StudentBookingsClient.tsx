'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import {
  CalendarCheck,
  MapPin,
  ChevronRight,
  Sparkles,
  Clock,
  CheckCircle2,
  ShieldCheck,
  BedDouble,
  Key,
  KeyRound,
} from 'lucide-react';

interface StudentBookingsClientProps {
  initialBookings: any[];
}

export function StudentBookingsClient({ initialBookings }: StudentBookingsClientProps) {
  const router = useRouter();
  const [filter, setFilter] = useState('ALL');
  const [bookings] = useState<any[]>(initialBookings);

  const filteredBookings = bookings.filter((b) => {
    if (filter === 'ALL') return true;
    if (filter === 'RESERVED') return ['RESERVED', 'PENDING', 'VISITED'].includes(b.status);
    if (filter === 'VISIT') return ['VISIT_REQUESTED', 'VISIT_CONFIRMED', 'VISITED'].includes(b.status);
    if (filter === 'CONFIRMED') return ['CONFIRMED', 'MOVE_IN_READY', 'ACTIVE', 'OCCUPIED'].includes(b.status);
    if (filter === 'CANCELLED') return ['CANCELLED', 'EXPIRED'].includes(b.status);
    return true;
  });

  const getStatusBadge = (booking: any) => {
    const status = booking.status;
    const isAdv = booking.reservationType === 'ADVANCE_SESSION';
    const tokenAmt = isAdv
      ? (booking.advanceTokenAmount || 90000) / 100
      : (booking.reservationFee || 39900) / 100;

    if (booking.handshakeStatus === 'DISPUTE_FROZEN') {
      return <Badge variant="danger">❄️ Escrow Frozen (Dispute)</Badge>;
    }
    switch (status) {
      case 'VISIT_REQUESTED':
        return <Badge variant="warning">📅 Visit Requested</Badge>;
      case 'VISIT_CONFIRMED':
        return <Badge variant="success">✓ Visit Confirmed</Badge>;
      case 'VISITED':
        return <Badge variant="info">👁️ Stage 1 OTP Verified</Badge>;
      case 'RESERVED':
      case 'PENDING':
        return (
          <Badge variant="info">
            🔒 {isAdv ? `Advance Hold (₹${tokenAmt})` : `72h Bed Hold (₹${tokenAmt})`}
          </Badge>
        );
      case 'CONFIRMED':
      case 'MOVE_IN_READY':
        return (
          <Badge variant="success">
            {booking.escrowAmount ? '🔐 ₹6,000 in Escrow Vault' : '✅ Room Accepted'}
          </Badge>
        );
      case 'ACTIVE':
      case 'OCCUPIED':
        return <Badge variant="success">🏠 Tenancy Active</Badge>;
      case 'CANCELLED':
        return <Badge variant="danger">✕ Cancelled / Refunded</Badge>;
      case 'EXPIRED':
        return <Badge variant="warning">⚖️ Grace Expired (Auto-Split)</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getNextActionHint = (booking: any) => {
    const status = booking.status;
    if (booking.handshakeStatus === 'DISPUTE_FROZEN') {
      return '100% Escrow Frozen due to room discrepancy. Full ₹6,000 refund initiated.';
    }
    if (status === 'RESERVED' || status === 'VISIT_REQUESTED' || status === 'VISIT_CONFIRMED') {
      return 'Stage 1 Handshake: Visit PG within 72h & enter Landlord’s 4-Digit Visit OTP to verify physical inspection.';
    }
    if (status === 'VISITED') {
      return 'Visit OTP Verified! Choose "Accept Room (Credit ₹399 to Rent)" or "100% Instant Refund".';
    }
    if (status === 'CONFIRMED' && !booking.escrowAmount) {
      return 'Room Accepted! Deposit remaining rent balance into UniNest Escrow Vault & E-Sign 11-Month Agreement.';
    }
    if (status === 'CONFIRMED' || status === 'MOVE_IN_READY') {
      return 'Stage 2 Handshake: Share your 6-Digit Move-In Key with the Landlord during physical check-in.';
    }
    if (status === 'ACTIVE') {
      return 'Tenancy active! ₹6,000 released from Escrow to Landlord.';
    }
    return booking.notes || 'Open Escrow Workspace for full details.';
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 rounded-3xl text-white shadow-xl">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-300 bg-emerald-900/50 px-3 py-1 rounded-full border border-emerald-700/50 mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            Two-Stage OTP Handshake & Algorithmic Escrow
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold">My Escrow Bookings</h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            Manage 72-hour commitment holds (₹399), 15–45 day advance reservations (15% token), Stage 1 Visit OTPs, and Stage 2 Move-In Keys.
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
          { key: 'RESERVED', label: 'Stage 1: Visit Hold (₹399)' },
          { key: 'CONFIRMED', label: 'Stage 2: Escrow Locked / Active' },
          { key: 'CANCELLED', label: 'Cancelled / Auto-Split' },
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
            const isAdv = booking.reservationType === 'ADVANCE_SESSION';
            const tokenAmt = isAdv
              ? (booking.advanceTokenAmount || 90000) / 100
              : (booking.reservationFee || 39900) / 100;
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
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={
                        property?.images?.[0] ||
                        'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800'
                      }
                      alt={property?.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute bottom-1 right-1 bg-slate-900/85 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                      ₹{tokenAmt} Token
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[11px] font-mono font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                        {booking.referenceNo || booking.id}
                      </span>
                      {getStatusBadge(booking)}
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-100">
                        {isAdv ? 'Advance (15–45d)' : 'Immediate (72h)'}
                      </span>
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
                          Room {room.roomNumber} (Bed {bed?.label || bed?.bedNumber || 'A'})
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-600 pt-1 flex items-center gap-1.5 font-medium">
                      {booking.status === 'RESERVED' ? (
                        <Key className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      ) : (
                        <KeyRound className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                      )}
                      <span>{getNextActionHint(booking)}</span>
                    </p>
                  </div>
                </div>

                {/* Right Section: Fee, Date & CTA Button */}
                <div className="flex items-center justify-between md:flex-col md:items-end gap-3 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100 shrink-0">
                  <div className="text-left md:text-right">
                    <div className="text-[11px] font-medium text-slate-400">Booked On {createdDateStr}</div>
                    <div className="text-xs font-extrabold text-emerald-700 flex items-center md:justify-end gap-1 mt-0.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      {booking.escrowAmount
                        ? `₹${(booking.escrowAmount / 100).toLocaleString('en-IN')} in Escrow`
                        : `₹${tokenAmt} Token Paid`}
                    </div>
                  </div>

                  <button
                    type="button"
                    className="py-2.5 px-4 rounded-xl bg-indigo-600 group-hover:bg-indigo-700 text-white font-extrabold text-xs shadow-md shadow-indigo-600/20 flex items-center gap-1.5 transition-all"
                  >
                    <span>Open Escrow Workspace</span>
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
                Reserve a bed with a ₹399 commitment token (72h hold) or 15% advance token (15–45 days) to unlock our Two-Stage OTP Escrow protection.
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
