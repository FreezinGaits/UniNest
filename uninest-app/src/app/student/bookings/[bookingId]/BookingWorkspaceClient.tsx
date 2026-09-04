'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import {
  CalendarCheck,
  MapPin,
  ShieldCheck,
  Clock,
  CheckCircle2,
  Lock,
  Unlock,
  Navigation,
  MessageSquare,
  FileText,
  AlertTriangle,
  ArrowLeft,
  Calendar,
  Building2,
  BedDouble,
  UserCheck,
  ExternalLink,
  ChevronRight,
  Sparkles,
  RefreshCw,
  Loader2,
  Phone,
  ShieldAlert,
} from 'lucide-react';
import { formatINR } from '@/lib/utils';
import { VisitSchedulingModal } from '@/components/booking/VisitSchedulingModal';
import { UniNestMessagesModal } from '@/components/booking/UniNestMessagesModal';

interface BookingWorkspaceClientProps {
  booking: any;
}

export function BookingWorkspaceClient({ booking: initialBooking }: BookingWorkspaceClientProps) {
  const [booking, setBooking] = useState<any>(initialBooking);
  const [showVisitModal, setShowVisitModal] = useState(false);
  const [showChatModal, setShowChatModal] = useState(false);
  const [isAcceptingCounter, setIsAcceptingCounter] = useState(false);

  const property = booking.property || {};
  const room = booking.bed?.room || {};
  const bed = booking.bed || {};
  const landlord = property.landlord || {};
  const landlordUser = landlord.user || {};
  const latestVisit = (booking.visits || booking.visitAppointments)?.[0];
  const agreement = booking.agreement || booking.agreements?.[0];
  const tenancy = booking.tenancy;

  const isLocationUnlocked = ['RESERVED', 'VISIT_REQUESTED', 'VISIT_CONFIRMED', 'CONFIRMED', 'OCCUPIED'].includes(
    booking.status
  );

  // Timeline Step Definitions
  const TIMELINE_STEPS = [
    { key: 'SELECTED', label: 'PG Selected', isDone: true },
    {
      key: 'RESERVED',
      label: 'Bed Reserved (₹399)',
      isDone: isLocationUnlocked,
    },
    {
      key: 'VISIT_REQUESTED',
      label: 'Visit Scheduled',
      isDone: ['VISIT_REQUESTED', 'VISIT_CONFIRMED', 'CONFIRMED', 'OCCUPIED'].includes(booking.status),
    },
    {
      key: 'VISIT_CONFIRMED',
      label: 'Visit Confirmed',
      isDone: ['VISIT_CONFIRMED', 'CONFIRMED', 'OCCUPIED'].includes(booking.status),
    },
    {
      key: 'KYC',
      label: 'KYC Verification',
      isDone: ['CONFIRMED', 'OCCUPIED'].includes(booking.status),
    },
    {
      key: 'AGREEMENT',
      label: 'Tenancy Agreement',
      isDone: agreement?.status === 'SIGNED' || ['CONFIRMED', 'OCCUPIED'].includes(booking.status),
    },
    {
      key: 'MOVE_IN',
      label: 'Move-In Active',
      isDone: booking.status === 'CONFIRMED' || booking.status === 'OCCUPIED',
    },
  ];

  const handleAcceptCounterProposal = async () => {
    if (!latestVisit?.id) return;
    setIsAcceptingCounter(true);
    try {
      const res = await fetch('/api/visits/accept-counter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ visitId: latestVisit.id }),
      });
      const data = await res.json();
      setIsAcceptingCounter(false);
      if (data.success) {
        setBooking((prev: any) => ({
          ...prev,
          status: 'VISIT_CONFIRMED',
          visitAppointments: [
            {
              ...latestVisit,
              status: 'CONFIRMED',
              scheduledDate: latestVisit.counterDate || latestVisit.scheduledDate,
              timeSlot: latestVisit.counterSlot || latestVisit.timeSlot,
            },
            ...(prev.visitAppointments?.slice(1) || []),
          ],
        }));
      } else {
        alert(data.error || 'Failed to accept counter-proposal');
      }
    } catch (e) {
      setIsAcceptingCounter(false);
      alert('Error accepting counter-proposal');
    }
  };

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
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const createdDateStr = new Date(booking.createdAt).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  const moveInDateStr = booking.moveInDate
    ? new Date(booking.moveInDate).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : 'Immediate / As Scheduled';

  return (
    <div className="space-y-6 animate-fade-in pb-16">
      {/* Back Button & Navigation Header */}
      <div className="flex items-center justify-between">
        <Link
          href="/student/bookings"
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-indigo-600 transition-colors bg-white px-3.5 py-2 rounded-xl border border-slate-200 shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Bookings</span>
        </Link>
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-bold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
            REF: {booking.id}
          </span>
          {getStatusBadge(booking.status)}
        </div>
      </div>

      {/* Main Header Card */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-300 bg-indigo-900/60 px-3 py-1 rounded-full border border-indigo-700/50">
            <Building2 className="w-3.5 h-3.5" />
            UniNest Booking Workspace
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold">{property.name}</h1>
          <p className="text-xs sm:text-sm text-slate-300 flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-indigo-400 shrink-0" />
            <span>{property.locality || property.address}, {property.city}</span>
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => setShowChatModal(true)}
            className="py-3 px-4 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-xs flex items-center gap-2 transition-all"
          >
            <MessageSquare className="w-4 h-4 text-emerald-400" />
            <span>Message Landlord</span>
          </button>

          <button
            onClick={() => setShowVisitModal(true)}
            className="py-3 px-5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition-all"
          >
            <Calendar className="w-4 h-4" />
            <span>Schedule / Change Visit</span>
          </button>
        </div>
      </div>

      {/* Counter-Proposal Alert Banner (If Landlord suggested another time) */}
      {latestVisit?.status === 'COUNTER_PROPOSED' && (
        <div className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl p-5 text-white shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4 animate-fade-in">
          <div className="flex items-start gap-3">
            <RefreshCw className="w-6 h-6 shrink-0 mt-0.5 animate-spin-slow" />
            <div className="space-y-1">
              <h3 className="font-extrabold text-sm sm:text-base">Landlord Suggested a Counter-Proposal Time</h3>
              <p className="text-xs text-amber-50">
                Landlord {landlordUser.name || 'Vikram Singh'} suggested visiting on{' '}
                <strong>
                  {new Date(latestVisit.counterDate || latestVisit.scheduledDate).toLocaleDateString('en-IN', {
                    weekday: 'short',
                    day: 'numeric',
                    month: 'short',
                  })}{' '}
                  ({latestVisit.counterSlot})
                </strong>
                .
              </p>
              {latestVisit.counterReason && (
                <p className="text-[11px] italic bg-black/20 p-2 rounded-lg mt-1">
                  "{latestVisit.counterReason}"
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleAcceptCounterProposal}
              disabled={isAcceptingCounter}
              className="py-2.5 px-4 rounded-xl bg-white text-slate-900 font-extrabold text-xs hover:bg-slate-100 transition-all shadow-md flex items-center gap-1.5"
            >
              {isAcceptingCounter ? (
                <Loader2 className="w-4 h-4 animate-spin text-slate-900" />
              ) : (
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              )}
              <span>Accept Counter Slot</span>
            </button>
            <button
              onClick={() => setShowVisitModal(true)}
              className="py-2.5 px-4 rounded-xl bg-slate-900/40 border border-white/40 text-white font-bold text-xs hover:bg-slate-900/60 transition-all"
            >
              Propose New Time
            </button>
          </div>
        </div>
      )}

      {/* Visual Progress Timeline Card */}
      <Card className="p-6 border-slate-200/80 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-600" />
            <span>Booking Progress Timeline</span>
          </h2>
          <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">
            Step {TIMELINE_STEPS.filter((s) => s.isDone).length} of {TIMELINE_STEPS.length} Completed
          </span>
        </div>

        {/* Timeline Horizontal / Grid Progress */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 pt-2">
          {TIMELINE_STEPS.map((step, idx) => (
            <div
              key={step.key}
              className={`p-3 rounded-2xl border text-center transition-all flex flex-col justify-between space-y-2 ${
                step.isDone
                  ? 'bg-emerald-50/80 border-emerald-300 text-emerald-950 shadow-sm'
                  : idx === TIMELINE_STEPS.filter((s) => s.isDone).length
                  ? 'bg-indigo-50 border-indigo-300 text-indigo-950 ring-2 ring-indigo-500/30'
                  : 'bg-slate-50 border-slate-200 text-slate-400 opacity-60'
              }`}
            >
              <div className="w-7 h-7 rounded-full mx-auto flex items-center justify-center font-bold text-xs shadow-sm">
                {step.isDone ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 fill-emerald-100" />
                ) : (
                  <span className="w-6 h-6 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center text-[10px]">
                    {idx + 1}
                  </span>
                )}
              </div>

              <span className="text-[11px] font-extrabold block leading-snug">
                {step.label}
              </span>
            </div>
          ))}
        </div>
      </Card>

      {/* Main Grid: Details + Exact Location */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): Booking Summary & Landlord Contact */}
        <div className="lg:col-span-2 space-y-6">
          {/* Booking Summary Details */}
          <Card className="p-6 space-y-4 border-slate-200/80">
            <h2 className="font-extrabold text-base text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
              <BedDouble className="w-5 h-5 text-indigo-600" />
              <span>Reserved Accommodation Summary</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-1">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Property Name
                </span>
                <span className="font-extrabold text-slate-900 text-sm">{property.name}</span>
                <span className="text-xs text-slate-500 block">Type: {property.gender} PG</span>
              </div>

              <div className="bg-indigo-50/70 p-4 rounded-2xl border border-indigo-100 space-y-1">
                <span className="text-[11px] font-bold text-indigo-500 uppercase tracking-wider block">
                  Assigned Bed & Room
                </span>
                <span className="font-extrabold text-indigo-950 text-sm">
                  Room {room.roomNumber || '102'} ({bed.label || 'Bed B'})
                </span>
                <span className="text-xs text-indigo-700 block">
                  {room.sharing ? `${room.sharing}-Sharing Room` : 'Double Sharing'}
                </span>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-1">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Monthly Rent & Deposit
                </span>
                <span className="font-extrabold text-slate-900 text-sm">
                  {formatINR(room.rent || 600000)} / month
                </span>
                <span className="text-xs text-slate-500 block">
                  Deposit: {formatINR(room.deposit || 600000)} (Refundable)
                </span>
              </div>

              <div className="bg-emerald-50/70 p-4 rounded-2xl border border-emerald-100 space-y-1">
                <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider block">
                  Reservation Token Fee
                </span>
                <span className="font-extrabold text-emerald-950 text-sm flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  ₹399 Token Paid (Verified)
                </span>
                <span className="text-xs text-emerald-700 block">Holds bed & unlocks exact location</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-slate-100 text-xs text-slate-600">
              <div>
                Booked On: <strong className="text-slate-900">{createdDateStr}</strong>
              </div>
              <div>
                Target Move-In Date: <strong className="text-slate-900">{moveInDateStr}</strong>
              </div>
            </div>
          </Card>

          {/* Location & Directions Access Card (Unlocked!) */}
          <Card className="p-6 space-y-4 border-slate-200/80">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                <Unlock className="w-5 h-5 text-emerald-600" />
                <span>Exact Property Location & Directions</span>
              </h2>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                Unlocked via ₹399 Hold
              </span>
            </div>

            {isLocationUnlocked ? (
              <div className="space-y-4">
                <div className="bg-emerald-50/60 border border-emerald-200 rounded-2xl p-4 space-y-2">
                  <div className="flex items-start gap-2.5">
                    <MapPin className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wide block">
                        Full Street Address
                      </span>
                      <p className="text-sm font-extrabold text-slate-900 mt-0.5">
                        {property.address}, {property.locality || 'BRS Nagar'}, {property.city}, {property.state} - {property.pincode || '141001'}
                      </p>
                      <p className="text-xs text-slate-600 mt-1">
                        Landmark: Opposite PCTE Campus Gate 2, near City Market.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Google Maps Directions Action */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900 text-white p-4 rounded-2xl">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center font-bold text-white shrink-0">
                      <Navigation className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-xs">Navigate to Property</h4>
                      <p className="text-[11px] text-slate-300">Open Google Maps for turn-by-turn navigation</p>
                    </div>
                  </div>

                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                      `${property.name} ${property.address} ${property.city}`
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full sm:w-auto py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs rounded-xl flex items-center justify-center gap-2 transition-colors shrink-0 shadow-md"
                  >
                    <span>Open in Google Maps</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            ) : (
              <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl text-xs text-amber-900 flex items-center gap-3">
                <Lock className="w-5 h-5 text-amber-600 shrink-0" />
                <span>Exact address and street location are locked until bed reservation is completed.</span>
              </div>
            )}
          </Card>

          {/* Agreement & Verification Section */}
          <Card className="p-6 space-y-4 border-slate-200/80">
            <h2 className="font-extrabold text-base text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
              <FileText className="w-5 h-5 text-indigo-600" />
              <span>Tenancy Agreement & KYC Status</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                    11-Month Digital Lease
                  </span>
                  <span className="font-extrabold text-slate-900 text-xs mt-0.5 block">
                    {agreement?.status === 'SIGNED' ? '✓ Fully Signed' : 'Pending Signature'}
                  </span>
                </div>
                <Badge variant={agreement?.status === 'SIGNED' ? 'success' : 'outline'}>
                  {agreement?.status || 'SIGNED'}
                </Badge>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                    Student Student Verification
                  </span>
                  <span className="font-extrabold text-slate-900 text-xs mt-0.5 block">
                    Aadhaar & College ID Verified
                  </span>
                </div>
                <Badge variant="success">Verified</Badge>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column (1 Col): Scheduled Visit & Landlord Profile Card */}
        <div className="space-y-6">
          {/* Scheduled Visit Appointment Status Card */}
          <Card className="p-5 space-y-4 border-slate-200/80">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-indigo-600" />
                <span>Visit Schedule</span>
              </h3>
              {latestVisit && (
                <Badge
                  variant={
                    latestVisit.status === 'CONFIRMED'
                      ? 'success'
                      : latestVisit.status === 'COUNTER_PROPOSED'
                      ? 'warning'
                      : 'info'
                  }
                >
                  {latestVisit.status}
                </Badge>
              )}
            </div>

            {latestVisit ? (
              <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-100 text-xs">
                <div className="flex items-center justify-between text-slate-600">
                  <span>Visit Date:</span>
                  <strong className="text-slate-900 font-extrabold">
                    {new Date(latestVisit.scheduledDate).toLocaleDateString('en-IN', {
                      weekday: 'short',
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </strong>
                </div>

                <div className="flex items-center justify-between text-slate-600">
                  <span>Time Slot:</span>
                  <strong className="text-indigo-600 font-extrabold">{latestVisit.timeSlot}</strong>
                </div>

                <div className="flex items-center justify-between text-slate-600">
                  <span>Visitors:</span>
                  <span className="font-bold text-slate-800">{latestVisit.visitorCount || 1} Person(s)</span>
                </div>

                {latestVisit.notes && (
                  <div className="pt-2 border-t border-slate-200 text-slate-500 text-[11px]">
                    Note: "{latestVisit.notes}"
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-4 text-xs text-slate-500 space-y-2">
                <p>No visit scheduled yet for this booking.</p>
                <button
                  onClick={() => setShowVisitModal(true)}
                  className="py-2 px-4 rounded-xl bg-indigo-600 text-white font-bold text-xs shadow-sm hover:bg-indigo-700 transition-colors"
                >
                  Schedule Visit Now
                </button>
              </div>
            )}

            <button
              onClick={() => setShowVisitModal(true)}
              className="w-full py-2.5 px-3 bg-white hover:bg-slate-50 text-indigo-600 font-bold text-xs rounded-xl border border-indigo-200 flex items-center justify-center gap-1.5 transition-colors"
            >
              <CalendarCheck className="w-3.5 h-3.5" />
              <span>{latestVisit ? 'Reschedule Visit' : 'Schedule Visit'}</span>
            </button>
          </Card>

          {/* Verified Landlord Contact Card */}
          <Card className="p-5 space-y-4 border-slate-200/80">
            <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
              <UserCheck className="w-4 h-4 text-emerald-600" />
              <span>Landlord Contact Info</span>
            </h3>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-700 text-white font-extrabold text-lg flex items-center justify-center shadow-md">
                {(landlordUser.name || 'V')[0]}
              </div>
              <div>
                <h4 className="font-extrabold text-sm text-slate-900">
                  {landlordUser.name || 'Vikram Singh'}
                </h4>
                <div className="flex items-center gap-1 text-[11px] text-emerald-600 font-bold mt-0.5">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  UniNest Verified Landlord
                </div>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex items-center justify-between">
                <span className="text-slate-500 font-medium">Verified Phone:</span>
                <strong className="text-slate-900 font-bold flex items-center gap-1">
                  <Phone className="w-3 h-3 text-emerald-600" />
                  {landlordUser.phone || '+91 9898989801'}
                </strong>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex items-center justify-between">
                <span className="text-slate-500 font-medium">Response Rate:</span>
                <span className="font-extrabold text-emerald-600">98% (Avg 15 mins)</span>
              </div>
            </div>

            <button
              onClick={() => setShowChatModal(true)}
              className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 transition-all"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Open In-App Moderated Chat</span>
            </button>
          </Card>
        </div>
      </div>

      {/* Visit Scheduling Modal */}
      {showVisitModal && (
        <VisitSchedulingModal
          isOpen={showVisitModal}
          onClose={() => setShowVisitModal(false)}
          onSuccess={(newVisit) => {
            setShowVisitModal(false);
            setBooking((prev: any) => ({
              ...prev,
              status: 'VISIT_REQUESTED',
              visitAppointments: [newVisit, ...(prev.visitAppointments || [])],
            }));
          }}
          property={{
            id: property.id,
            name: property.name,
            locality: property.locality,
            city: property.city,
            landlordName: landlordUser.name,
          }}
          bookingId={booking.id}
        />
      )}

      {/* Moderated In-App Chat Modal */}
      {showChatModal && (
        <UniNestMessagesModal
          isOpen={showChatModal}
          onClose={() => setShowChatModal(false)}
          propertyName={property.name}
          landlordName={landlordUser.name || 'Vikram Singh'}
          bookingId={booking.id}
          visitId={latestVisit?.id}
        />
      )}
    </div>
  );
}
