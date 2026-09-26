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
  Sparkles,
  RefreshCw,
  Loader2,
  Phone,
  ShieldAlert,
  Key,
  KeyRound,
  XCircle,
  AlertCircle,
  Timer,
  Banknote,
  Home,
  Copy,
  Check,
  QrCode,
  Scale,
  PhoneCall,
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
  const [actionBanner, setActionBanner] = useState<{
    type: 'success' | 'warning' | 'danger' | 'info';
    title: string;
    message: string;
  } | null>(null);

  // Stage 1: Visit OTP States
  const [visitOtpInput, setVisitOtpInput] = useState('');
  const [isVerifyingVisit, setIsVerifyingVisit] = useState(false);
  const [visitVerified, setVisitVerified] = useState(!!initialBooking?.visitVerifiedAt);
  const [showPostVisitDecision, setShowPostVisitDecision] = useState(false);
  const [isSubmittingDecision, setIsSubmittingDecision] = useState(false);
  const [rejectFeedback, setRejectFeedback] = useState('');
  const [needsFeedback, setNeedsFeedback] = useState(false);

  // Emergency Cancel States (Stage 1)
  const [showEmergencyCancel, setShowEmergencyCancel] = useState(false);
  const [emergencyReason, setEmergencyReason] = useState('');
  const [isSubmittingEmergency, setIsSubmittingEmergency] = useState(false);

  // Escrow Balance Payment States (Between Stage 1 & Stage 2)
  const [agreedMoveInInput, setAgreedMoveInInput] = useState(
    initialBooking?.agreedMoveInDate
      ? new Date(initialBooking.agreedMoveInDate).toISOString().split('T')[0]
      : new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [escrowPayMethod, setEscrowPayMethod] = useState<'upi_qr' | 'instant_demo'>('instant_demo');
  const [escrowUtr, setEscrowUtr] = useState('');
  const [isPayingEscrow, setIsPayingEscrow] = useState(false);

  // Stage 2: Move-In Key States
  const [moveInKey, setMoveInKey] = useState<string | null>(
    initialBooking?.moveInOtp
      ? `${initialBooking.moveInOtp.slice(0, 3)}-${initialBooking.moveInOtp.slice(3)}`
      : null
  );
  const [isGeneratingMoveInKey, setIsGeneratingMoveInKey] = useState(false);
  const [copiedMoveInKey, setCopiedMoveInKey] = useState(false);

  // Stage 2: Delay, Cancel, Ghosting Simulation & Discrepancy Dispute States
  const [showDelayForm, setShowDelayForm] = useState(false);
  const [delayDays, setDelayDays] = useState(3);
  const [delayReason, setDelayReason] = useState('Train delayed / Travel schedule adjustment');
  const [isSubmittingDelay, setIsSubmittingDelay] = useState(false);

  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [simulatedAdvanceDays, setSimulatedAdvanceDays] = useState<number>(35);
  const [isCancelling, setIsCancelling] = useState(false);

  const [showDisputeModal, setShowDisputeModal] = useState(false);
  const [discrepancyType, setDiscrepancyType] = useState('Room has no AC (Listed as AC Room)');
  const [discrepancyDesc, setDiscrepancyDesc] = useState('');
  const [isFreezingEscrow, setIsFreezingEscrow] = useState(false);
  const [isSimulatingGhost, setIsSimulatingGhost] = useState(false);

  const property = booking?.property || {};
  const room = booking?.bed?.room || {};
  const bed = booking?.bed || {};
  const landlord = property.landlord || {};
  const landlordUser = landlord.user || {};
  const latestVisit = (booking?.visits || booking?.visitAppointments)?.[0];
  const agreement = booking?.agreement || booking?.agreements?.[0];

  const isLocationUnlocked = [
    'RESERVED',
    'VISIT_REQUESTED',
    'VISIT_CONFIRMED',
    'VISITED',
    'CONFIRMED',
    'MOVE_IN_READY',
    'ACTIVE',
  ].includes(booking?.status);

  const isAdvanceBooking = booking?.reservationType === 'ADVANCE_SESSION';
  const totalMonthlyRentINR = (room.rent || 600000) / 100; // ₹6,000
  const tokenPaidINR = isAdvanceBooking
    ? (booking?.advanceTokenAmount || 90000) / 100 // ₹900 (15%)
    : (booking?.reservationFee || 39900) / 100; // ₹399
  const remainingEscrowBalanceINR = totalMonthlyRentINR - tokenPaidINR; // ₹5,601 or ₹5,100
  const isEscrowFunded = !!(booking?.escrowAmount && booking.escrowAmount >= 600000);

  const UPI_ID = process.env.NEXT_PUBLIC_UPI_ID || 'anupamrai172@oksbi';
  const PAYEE_NAME = process.env.NEXT_PUBLIC_UPI_NAME || 'UniNest Housing';
  const escrowUpiUri = `upi://pay?pa=${encodeURIComponent(UPI_ID)}&pn=${encodeURIComponent(
    PAYEE_NAME
  )}&am=${remainingEscrowBalanceINR}.00&cu=INR&tn=${encodeURIComponent(
    `UniNest Escrow Rent - ${property.name?.slice(0, 18)}`
  )}`;
  const escrowQrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(
    escrowUpiUri
  )}&margin=8`;

  // 7-Step Algorithmic Escrow Timeline
  const TIMELINE_STEPS = [
    { key: 'SELECTED', label: 'PG Selected', isDone: true },
    {
      key: 'RESERVED',
      label: isAdvanceBooking ? `15% Token (₹${tokenPaidINR})` : '72h Hold (₹399)',
      isDone: isLocationUnlocked,
    },
    {
      key: 'VISIT_OTP',
      label: 'Stage 1: Visit OTP',
      isDone:
        visitVerified ||
        !!booking?.visitVerifiedAt ||
        ['CONFIRMED', 'MOVE_IN_READY', 'ACTIVE'].includes(booking?.status),
    },
    {
      key: 'ROOM_DECISION',
      label: 'Credit ₹399 to Rent',
      isDone:
        booking?.postVisitDecision === 'ACCEPTED' ||
        ['CONFIRMED', 'MOVE_IN_READY', 'ACTIVE'].includes(booking?.status),
    },
    {
      key: 'ESCROW_VAULT',
      label: '₹6,000 in Escrow Vault',
      isDone: isEscrowFunded || ['MOVE_IN_READY', 'ACTIVE'].includes(booking?.status),
    },
    {
      key: 'MOVEIN_KEY',
      label: 'Stage 2: Move-In Key',
      isDone: !!booking?.moveInVerifiedAt || booking?.status === 'ACTIVE',
    },
    {
      key: 'ACTIVE',
      label: 'Escrow Released & Active',
      isDone: booking?.status === 'ACTIVE',
    },
  ];

  // ─── HANDLERS ──────────────────────────────────────────────

  const handleVerifyVisitOtp = async () => {
    if (!visitOtpInput || visitOtpInput.length !== 4) {
      alert('Please enter a 4-digit Visit OTP');
      return;
    }
    setIsVerifyingVisit(true);
    try {
      const res = await fetch('/api/booking/verify-visit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId: booking.id, otp: visitOtpInput, decision: 'VERIFY_ONLY' }),
      });
      const data = await res.json();
      setIsVerifyingVisit(false);
      if (data.success) {
        setVisitVerified(true);
        setShowPostVisitDecision(true);
        setBooking((prev: any) => ({
          ...prev,
          ...(data.booking || {}),
          visitVerifiedAt: new Date().toISOString(),
          handshakeStatus: 'VISIT_OTP_VERIFIED',
          status: 'VISITED',
        }));
        setActionBanner({
          type: 'success',
          title: '✓ Stage 1 Visit OTP Verified!',
          message: data.message,
        });
      } else {
        alert(data.error || 'Invalid OTP');
      }
    } catch (e) {
      setIsVerifyingVisit(false);
      alert('Verification failed. Please try again.');
    }
  };

  const handlePostVisitDecision = async (decision: 'ACCEPTED' | 'REJECTED') => {
    setIsSubmittingDecision(true);
    try {
      const res = await fetch('/api/booking/verify-visit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId: booking.id,
          otp: visitOtpInput || booking.visitOtp || '8412',
          decision,
          feedback: rejectFeedback || undefined,
        }),
      });
      const data = await res.json();
      setIsSubmittingDecision(false);

      if (data.requiresStructuredFeedback) {
        setNeedsFeedback(true);
        return;
      }

      if (data.success) {
        if (decision === 'ACCEPTED') {
          setBooking((prev: any) => ({
            ...prev,
            ...(data.booking || {}),
            status: 'CONFIRMED',
            postVisitDecision: 'ACCEPTED',
          }));
          setActionBanner({
            type: 'success',
            title: '🎉 Room Accepted — ₹399 Credited to 1st Month Rent!',
            message: data.message,
          });
        } else {
          setBooking((prev: any) => ({
            ...prev,
            ...(data.booking || {}),
            status: 'CANCELLED',
            postVisitDecision: 'REJECTED',
          }));
          setActionBanner({
            type: 'info',
            title: '💸 100% Instant UPI Refund Initiated (₹399)',
            message: data.message,
          });
        }
        setShowPostVisitDecision(false);
      } else {
        alert(data.error || 'Could not process decision');
      }
    } catch (e) {
      setIsSubmittingDecision(false);
      alert('Failed to submit decision');
    }
  };

  const handleEmergencyCancel = async () => {
    if (!emergencyReason) {
      alert('Please select an emergency reason');
      return;
    }
    setIsSubmittingEmergency(true);
    try {
      const res = await fetch('/api/booking/verify-visit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId: booking.id,
          decision: 'EMERGENCY_CANCEL',
          reason: emergencyReason,
        }),
      });
      const data = await res.json();
      setIsSubmittingEmergency(false);
      if (data.success) {
        setBooking((prev: any) => ({
          ...prev,
          ...(data.booking || {}),
          status: 'CANCELLED',
          handshakeStatus: 'REFUNDED_EMERGENCY',
        }));
        setShowEmergencyCancel(false);
        setActionBanner({
          type: 'info',
          title: '🚑 1-Click Emergency Waiver Approved — 100% Refund (₹399)',
          message: data.message,
        });
      } else {
        alert(data.error || 'Failed');
      }
    } catch (e) {
      setIsSubmittingEmergency(false);
      alert('Request failed');
    }
  };

  const handlePayEscrowBalance = async () => {
    setIsPayingEscrow(true);
    try {
      const res = await fetch('/api/booking/pay-escrow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId: booking.id,
          agreedMoveInDate: agreedMoveInInput,
          utr: escrowUtr || `ESC-${Date.now().toString().slice(-8)}`,
          paymentMethod: escrowPayMethod,
        }),
      });
      const data = await res.json();
      setIsPayingEscrow(false);
      if (data.success) {
        setBooking((prev: any) => ({
          ...prev,
          ...(data.booking || {}),
          escrowAmount: data.totalEscrowPaise,
          agreedMoveInDate: data.agreedMoveInDate,
          graceWindowEndsAt: data.graceWindowEndsAt,
          status: 'CONFIRMED',
        }));
        setActionBanner({
          type: 'success',
          title: '🔒 ₹6,000 Locked in UniNest Escrow Vault!',
          message: data.message,
        });
      } else {
        alert(data.error || 'Escrow deposit failed');
      }
    } catch (e) {
      setIsPayingEscrow(false);
      alert('Escrow payment error');
    }
  };

  const handleGenerateMoveInKey = async () => {
    setIsGeneratingMoveInKey(true);
    try {
      const res = await fetch('/api/booking/movein-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId: booking.id }),
      });
      const data = await res.json();
      setIsGeneratingMoveInKey(false);
      if (data.success) {
        setMoveInKey(data.moveInKey);
        setBooking((prev: any) => ({
          ...prev,
          ...(data.booking || {}),
          moveInOtp: data.rawKey,
          status: 'MOVE_IN_READY',
          graceWindowEndsAt: data.graceWindowEndsAt,
        }));
        setActionBanner({
          type: 'success',
          title: `🔑 6-Digit Move-In Key Generated: ${data.moveInKey}`,
          message: data.message,
        });
      } else {
        alert(data.error || 'Failed to generate key');
      }
    } catch (e) {
      setIsGeneratingMoveInKey(false);
      alert('Key generation failed');
    }
  };

  const handleCopyMoveInKey = () => {
    const keyToCopy =
      moveInKey ||
      (booking?.moveInOtp
        ? `${booking.moveInOtp.slice(0, 3)}-${booking.moveInOtp.slice(3)}`
        : '792-410');
    navigator.clipboard.writeText(keyToCopy);
    setCopiedMoveInKey(true);
    setTimeout(() => setCopiedMoveInKey(false), 2000);
  };

  const handleDelayMoveIn = async () => {
    setIsSubmittingDelay(true);
    try {
      const res = await fetch('/api/booking/delay-movein', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId: booking.id, delayDays, reason: delayReason }),
      });
      const data = await res.json();
      setIsSubmittingDelay(false);
      if (data.success) {
        setBooking((prev: any) => ({
          ...prev,
          ...(data.booking || {}),
          delayedMoveInDate: data.newMoveInDate,
          graceWindowEndsAt: data.graceWindowEndsAt,
        }));
        setShowDelayForm(false);
        setActionBanner({
          type: 'warning',
          title: '⏰ Late Arrival Declared — ₹0 Penalty (Room Held Safe)',
          message: data.message,
        });
      } else {
        alert(data.error || 'Failed');
      }
    } catch (e) {
      setIsSubmittingDelay(false);
      alert('Request failed');
    }
  };

  const handleCancelBooking = async (mode: 'STANDARD' | 'ADVANCE_TIERED' = 'STANDARD') => {
    setIsCancelling(true);
    try {
      const res = await fetch('/api/booking/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId: booking.id,
          reason: cancelReason || 'Student initiated cancellation',
          mode,
          simulatedDaysUntilMoveIn:
            isAdvanceBooking || mode === 'ADVANCE_TIERED' ? simulatedAdvanceDays : undefined,
        }),
      });
      const data = await res.json();
      setIsCancelling(false);
      if (data.success) {
        setBooking((prev: any) => ({
          ...prev,
          ...(data.booking || {}),
          status: 'CANCELLED',
        }));
        setShowCancelConfirm(false);
        setActionBanner({
          type: 'warning',
          title: `📋 ${data.policyLabel}`,
          message: data.message,
        });
      } else {
        alert(data.error || 'Failed');
      }
    } catch (e) {
      setIsCancelling(false);
      alert('Cancellation failed');
    }
  };

  const handleSimulateDay7Ghosting = async () => {
    setIsSimulatingGhost(true);
    try {
      const res = await fetch('/api/booking/grace-expire', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId: booking.id }),
      });
      const data = await res.json();
      setIsSimulatingGhost(false);
      if (data.success) {
        setBooking((prev: any) => ({
          ...prev,
          ...(data.booking || {}),
          status: 'EXPIRED',
          handshakeStatus: 'AUTO_RELEASED_GRACE',
        }));
        setActionBanner({
          type: 'warning',
          title: '⚖️ Day 7 Grace Protocol Auto-Split Executed (₹2,800 Landlord / ₹3,200 Student)',
          message: data.message,
        });
      }
    } catch (e) {
      setIsSimulatingGhost(false);
    }
  };

  const handleFileDiscrepancyDispute = async () => {
    setIsFreezingEscrow(true);
    try {
      const res = await fetch('/api/booking/dispute-freeze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId: booking.id,
          discrepancyType,
          description: discrepancyDesc || 'Verified physical discrepancy upon move-in inspection.',
        }),
      });
      const data = await res.json();
      setIsFreezingEscrow(false);
      if (data.success) {
        setBooking((prev: any) => ({
          ...prev,
          ...(data.booking || {}),
          handshakeStatus: 'DISPUTE_FROZEN',
          status: 'CANCELLED',
        }));
        setShowDisputeModal(false);
        setActionBanner({
          type: 'danger',
          title: `🚨 Escrow 100% Frozen (${data.caseId}) — Full ₹6,000 Refund Initiated!`,
          message: data.message,
        });
      }
    } catch (e) {
      setIsFreezingEscrow(false);
    }
  };

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

  const getStatusBadge = (status: string, handshake?: string) => {
    if (handshake === 'DISPUTE_FROZEN') {
      return <Badge variant="danger">❄️ Escrow Frozen (Dispute)</Badge>;
    }
    if (handshake === 'AUTO_RELEASED_GRACE') {
      return <Badge variant="warning">⚖️ Auto-Split (Grace Expired)</Badge>;
    }
    switch (status) {
      case 'VISIT_REQUESTED':
        return <Badge variant="warning">📅 Visit Requested</Badge>;
      case 'VISIT_CONFIRMED':
        return <Badge variant="success">✓ Visit Confirmed</Badge>;
      case 'VISITED':
        return <Badge variant="info">👁️ Visit OTP Verified — Decision Pending</Badge>;
      case 'RESERVED':
      case 'PENDING':
        return (
          <Badge variant="info">
            🔒 {isAdvanceBooking ? `Advance Hold (₹${tokenPaidINR})` : '72h Bed Hold (₹399)'}
          </Badge>
        );
      case 'CONFIRMED':
        return (
          <Badge variant="success">
            {isEscrowFunded ? '🔐 ₹6,000 Locked in Escrow' : '✅ Room Accepted — Pay Balance'}
          </Badge>
        );
      case 'MOVE_IN_READY':
        return <Badge variant="success">🔑 Move-In Key Ready</Badge>;
      case 'ACTIVE':
        return <Badge variant="success">🏠 Tenancy Active (Escrow Released)</Badge>;
      case 'CANCELLED':
        return <Badge variant="danger">✕ Cancelled / Refunded</Badge>;
      case 'EXPIRED':
        return <Badge variant="warning">⏱ Grace Expired (Pro-Rata Split)</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const createdDateStr = new Date(booking?.createdAt || Date.now()).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
  const moveInDateStr = booking?.delayedMoveInDate
    ? `${new Date(booking.delayedMoveInDate).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })} (Delayed Arrival)`
    : booking?.agreedMoveInDate
    ? new Date(booking.agreedMoveInDate).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : booking?.moveInDate
    ? new Date(booking.moveInDate).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : 'Immediate / Within 72 Hours';

  return (
    <div className="space-y-6 animate-fade-in pb-16">
      {/* Back Button & Navigation Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/student/bookings"
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-indigo-600 transition-colors bg-white px-3.5 py-2 rounded-xl border border-slate-200 shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Bookings</span>
        </Link>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-mono font-bold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
            REF: {booking.referenceNo || booking.id}
          </span>
          {getStatusBadge(booking.status, booking.handshakeStatus)}
        </div>
      </div>

      {/* Live Action Outcome Banner */}
      {actionBanner && (
        <div
          className={`rounded-2xl p-4 border shadow-md flex items-start justify-between gap-3 animate-fade-in ${
            actionBanner.type === 'success'
              ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
              : actionBanner.type === 'danger'
              ? 'bg-rose-50 border-rose-300 text-rose-950'
              : actionBanner.type === 'warning'
              ? 'bg-amber-50 border-amber-300 text-amber-950'
              : 'bg-blue-50 border-blue-300 text-blue-950'
          }`}
        >
          <div className="space-y-1">
            <h4 className="text-sm font-extrabold">{actionBanner.title}</h4>
            <p className="text-xs leading-relaxed">{actionBanner.message}</p>
          </div>
          <button
            onClick={() => setActionBanner(null)}
            className="text-xs font-bold opacity-60 hover:opacity-100 px-2 py-1"
          >
            ✕
          </button>
        </div>
      )}

      {/* Main Header Card */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-300 bg-emerald-900/50 px-3 py-1 rounded-full border border-emerald-700/50">
              <ShieldCheck className="w-3.5 h-3.5" />
              Two-Stage OTP Escrow Protected
            </div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-300 bg-indigo-900/60 px-3 py-1 rounded-full border border-indigo-700/50">
              <Building2 className="w-3.5 h-3.5" />
              {isAdvanceBooking
                ? 'Advance Session Reservation (15–45 Days)'
                : 'Immediate Visit Reservation (72h Lock)'}
            </div>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold">{property.name}</h1>
          <p className="text-xs sm:text-sm text-slate-300 flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-indigo-400 shrink-0" />
            <span>
              {property.locality || property.address}, {property.city}
            </span>
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0 flex-wrap">
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

      {/* Fair-Use Guardrail & Policy Status Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-white rounded-2xl border border-slate-200 p-3.5 flex items-center justify-between shadow-sm">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Fair-Use Free Visit Refunds
            </span>
            <span className="text-xs font-extrabold text-slate-900">
              {Math.max(0, 3 - (booking.visitRejectCount || 0))} of 3 Free Remaining
            </span>
          </div>
          <Badge variant="success">Semester Quota</Badge>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-3.5 flex items-center justify-between shadow-sm">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Emergency Waiver Protection
            </span>
            <span className="text-xs font-extrabold text-slate-900">
              {Math.max(0, 2 - (booking.emergencyWaiverCount || 0))} of 2 Waivers Available
            </span>
          </div>
          <Badge variant="info">100% Refund</Badge>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-3.5 flex items-center justify-between shadow-sm">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Escrow Vault Balance
            </span>
            <span className="text-xs font-extrabold text-emerald-700">
              {isEscrowFunded
                ? '₹6,000.00 (Full Rent Locked)'
                : `₹${tokenPaidINR}.00 (Token Held)`}
            </span>
          </div>
          <Badge variant={isEscrowFunded ? 'success' : 'warning'}>
            {booking.status === 'ACTIVE' ? 'Released to Landlord' : 'Held by UniNest'}
          </Badge>
        </div>
      </div>

      {/* Visual Progress Timeline Card */}
      <Card className="p-6 border-slate-200/80 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-600" />
            <span>Dual-Stage OTP Escrow Lifecycle</span>
          </h2>
          <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">
            Milestone {TIMELINE_STEPS.filter((s) => s.isDone).length} of {TIMELINE_STEPS.length}
          </span>
        </div>
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
              <span className="text-[11px] font-extrabold block leading-snug">{step.label}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* ═══════════════════════════════════════════════════════════════════════════
          STAGE 1: VISIT OTP HANDSHAKE CARD (₹399 Commitment Token)
      ═══════════════════════════════════════════════════════════════════════════ */}
      {isLocationUnlocked && !['CANCELLED', 'EXPIRED', 'ACTIVE'].includes(booking.status) && (
        <Card className="p-6 border-2 border-emerald-300 bg-gradient-to-br from-emerald-50/40 via-white to-emerald-50/20 space-y-5 shadow-md">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-emerald-100 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-sm">
                <Key className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-extrabold text-base text-slate-900">
                  Stage 1: Physical Visit Proof Handshake (4-Digit OTP)
                </h2>
                <p className="text-xs text-slate-600">
                  Bed locked as <strong className="text-emerald-700">RESERVED for 72 Hours</strong>. Arrive at the PG and enter the Landlord&apos;s 4-Digit Visit PIN.
                </p>
              </div>
            </div>
            <Badge variant={visitVerified || booking.visitVerifiedAt ? 'success' : 'warning'}>
              {visitVerified || booking.visitVerifiedAt ? '✓ Stage 1 OTP Verified' : '⏳ 72h Lock Active'}
            </Badge>
          </div>

          {!visitVerified && !booking.visitVerifiedAt ? (
            <div className="space-y-4">
              {/* Helpful Demo OTP Hint Banner */}
              <div className="bg-slate-900 text-white rounded-2xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>
                    <strong>How Stage 1 works:</strong> Landlord generates a 4-digit PIN on their dashboard when you arrive. (Active PIN for this booking:{' '}
                    <code className="bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded font-mono font-extrabold">
                      {booking.visitOtp || '8412'}
                    </code>
                    )
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setVisitOtpInput(booking.visitOtp || '8412')}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-[11px] shrink-0 transition-colors"
                >
                  Auto-Fill PIN ({booking.visitOtp || '8412'})
                </button>
              </div>

              {/* 4-Digit OTP Input + Verify Button */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-3">
                <div className="flex-1">
                  <label className="text-xs font-extrabold text-slate-700 block mb-1.5">
                    Enter 4-Digit Visit OTP Shared by Landlord ({landlordUser.name || 'Vikram Singh'}):
                  </label>
                  <input
                    type="text"
                    maxLength={4}
                    value={visitOtpInput}
                    onChange={(e) => setVisitOtpInput(e.target.value.replace(/[^0-9]/g, ''))}
                    className="w-full bg-white border-2 border-emerald-300 rounded-xl px-4 py-3 text-2xl font-mono font-black text-center text-emerald-950 tracking-[0.5em] placeholder:text-slate-300 focus:border-emerald-600 focus:outline-none"
                    placeholder="8 4 1 2"
                  />
                </div>
                <button
                  onClick={handleVerifyVisitOtp}
                  disabled={isVerifyingVisit || visitOtpInput.length !== 4}
                  className="py-3.5 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                >
                  {isVerifyingVisit ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <ShieldCheck className="w-4 h-4" />
                  )}
                  <span>Verify Physical Visit OTP</span>
                </button>
              </div>

              {/* Pre-Visit Emergency Waiver Trigger */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-emerald-100 text-xs">
                <button
                  type="button"
                  onClick={() => setShowEmergencyCancel(!showEmergencyCancel)}
                  className="text-rose-600 hover:text-rose-700 font-extrabold flex items-center gap-1.5 transition-colors"
                >
                  <AlertCircle className="w-4 h-4" />
                  <span>Cannot visit due to Medical / Family Emergency? Trigger 1-Click Emergency Waiver (100% Refund)</span>
                </button>
                <span className="text-[11px] font-semibold text-slate-500">
                  No-Show after 72h splits ₹399 (₹200 Landlord / ₹199 Platform)
                </span>
              </div>

              {/* Emergency Waiver Form */}
              {showEmergencyCancel && (
                <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-extrabold text-rose-950 flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4 text-rose-600" />
                      1-Click Emergency Waiver (100% ₹399 Refund Within 2 Hours — No Visit Needed)
                    </h4>
                    <span className="text-[10px] font-bold bg-white text-rose-700 px-2 py-0.5 rounded border border-rose-200">
                      {Math.max(0, 2 - (booking.emergencyWaiverCount || 0))}/2 Waivers Left
                    </span>
                  </div>
                  <select
                    value={emergencyReason}
                    onChange={(e) => setEmergencyReason(e.target.value)}
                    className="w-full bg-white border border-rose-300 rounded-xl px-3 py-2.5 text-xs font-semibold text-slate-900"
                  >
                    <option value="">Select Genuine Emergency Reason...</option>
                    <option value="Medical Emergency / Sudden Hospitalization">
                      Medical Emergency / Sudden Hospitalization
                    </option>
                    <option value="Family Bereavement / Tragedy">
                      Family Bereavement / Tragedy in Family
                    </option>
                    <option value="College Admission Cancelled / Deferred">
                      College Admission Cancelled or Deferred
                    </option>
                    <option value="Severe Travel Disruption / Natural Calamity">
                      Severe Travel Disruption / Natural Calamity
                    </option>
                  </select>
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setShowEmergencyCancel(false)}
                      className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 text-xs font-bold"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleEmergencyCancel}
                      disabled={isSubmittingEmergency || !emergencyReason}
                      className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-extrabold flex items-center gap-1.5 disabled:opacity-50"
                    >
                      {isSubmittingEmergency ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      )}
                      <span>Approve Emergency Waiver & Refund ₹399</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* STAGE 1 OTP VERIFIED -> SHOW STUDENT EXPERIENCE DECISION */
            <div className="space-y-4">
              <div className="bg-emerald-100/80 border border-emerald-300 rounded-2xl p-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
                  <div>
                    <h4 className="font-extrabold text-sm text-emerald-950">
                      Physical Visit Verified via 4-Digit Handshake OTP!
                    </h4>
                    <p className="text-xs text-emerald-800 mt-0.5">
                      You have inspected {property.name}. Now choose whether to lock the room or get an instant 100% refund.
                    </p>
                  </div>
                </div>
                {booking.postVisitDecision === 'ACCEPTED' && (
                  <button
                    type="button"
                    onClick={() => setShowPostVisitDecision(!showPostVisitDecision)}
                    className="text-[11px] font-bold text-emerald-800 underline shrink-0"
                  >
                    Change Decision
                  </button>
                )}
              </div>

              {(booking.postVisitDecision !== 'ACCEPTED' || showPostVisitDecision) && (
                <div className="space-y-3">
                  <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
                    Post-Visit Decision Prompt: How was the room?
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => handlePostVisitDecision('ACCEPTED')}
                      disabled={isSubmittingDecision}
                      className="p-4 rounded-2xl border-2 border-emerald-400 bg-emerald-50 hover:bg-emerald-100 text-left transition-all space-y-1.5 shadow-sm"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-sm text-emerald-950 flex items-center gap-2">
                          <Home className="w-4 h-4 text-emerald-600" />
                          I Love the Room! ❤️
                        </span>
                        <span className="text-[11px] font-black bg-emerald-600 text-white px-2 py-0.5 rounded-md">
                          -₹{tokenPaidINR} Credit
                        </span>
                      </div>
                      <p className="text-xs text-emerald-800">
                        Apply your <strong>₹{tokenPaidINR} token as 1st Month Rent Credit</strong>. You only pay the remaining{' '}
                        <strong>₹{remainingEscrowBalanceINR.toLocaleString('en-IN')}</strong> into UniNest Escrow!
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => handlePostVisitDecision('REJECTED')}
                      disabled={isSubmittingDecision}
                      className="p-4 rounded-2xl border-2 border-slate-300 bg-white hover:bg-rose-50 hover:border-rose-300 text-left transition-all space-y-1.5 shadow-sm"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                          <XCircle className="w-4 h-4 text-rose-600" />
                          Not for me (Any Reason)
                        </span>
                        <span className="text-[11px] font-black bg-rose-100 text-rose-800 px-2 py-0.5 rounded-md">
                          100% Refund
                        </span>
                      </div>
                      <p className="text-xs text-slate-600">
                        Get an <strong>instant 100% UPI refund of ₹399</strong>. Bed is released back to AVAILABLE immediately. (Up to 3 free visits/season)
                      </p>
                    </button>
                  </div>

                  {needsFeedback && (
                    <div className="bg-amber-50 border border-amber-300 rounded-xl p-3.5 space-y-2 text-xs">
                      <p className="font-bold text-amber-950">
                        Fair-Use Guardrail (4th Consecutive Rejection): Please share brief feedback on why this PG didn&apos;t work for you to process your ₹399 refund:
                      </p>
                      <input
                        type="text"
                        value={rejectFeedback}
                        onChange={(e) => setRejectFeedback(e.target.value)}
                        placeholder="e.g. Room ventilation was low / Wanted ground floor..."
                        className="w-full bg-white border border-amber-300 rounded-lg p-2 text-slate-900"
                      />
                      <button
                        type="button"
                        onClick={() => handlePostVisitDecision('REJECTED')}
                        className="px-4 py-2 rounded-lg bg-amber-600 text-white font-bold"
                      >
                        Submit Feedback & Claim ₹399 Refund
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </Card>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════════
          ESCROW RENT DEPOSIT VAULT (Pay Remaining ₹5,601 or 85% ₹5,100 into Escrow)
      ═══════════════════════════════════════════════════════════════════════════ */}
      {!['CANCELLED', 'EXPIRED', 'ACTIVE'].includes(booking.status) &&
        (booking.postVisitDecision === 'ACCEPTED' || isAdvanceBooking) &&
        !isEscrowFunded && (
          <Card className="p-6 border-2 border-indigo-300 bg-gradient-to-br from-indigo-50/50 via-white to-indigo-50/20 space-y-5 shadow-md">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-indigo-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-sm">
                  <Banknote className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-extrabold text-base text-slate-900">
                    Deposit Remaining 1st Month Rent into UniNest Escrow Vault
                  </h2>
                  <p className="text-xs text-slate-600">
                    Landlord does <strong>NOT</strong> receive this money until you physically move in and share your 6-digit Move-In Key!
                  </p>
                </div>
              </div>
              <Badge variant="info">₹{tokenPaidINR} Token Credited</Badge>
            </div>

            {/* Mathematical Escrow Breakdown */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="bg-white p-3.5 rounded-2xl border border-slate-200">
                <span className="text-slate-500 font-semibold block">1st Month PG Rent</span>
                <span className="text-lg font-extrabold text-slate-900">
                  ₹{totalMonthlyRentINR.toLocaleString('en-IN')}.00
                </span>
              </div>
              <div className="bg-emerald-50 p-3.5 rounded-2xl border border-emerald-200">
                <span className="text-emerald-700 font-semibold block">
                  Less {isAdvanceBooking ? '15% Advance Token' : '₹399 Visit Token'} Credit
                </span>
                <span className="text-lg font-extrabold text-emerald-700">
                  - ₹{tokenPaidINR.toLocaleString('en-IN')}.00
                </span>
              </div>
              <div className="bg-indigo-950 text-white p-3.5 rounded-2xl">
                <span className="text-indigo-300 font-semibold block">Net Balance Due to Escrow</span>
                <span className="text-lg font-black text-emerald-400">
                  ₹{remainingEscrowBalanceINR.toLocaleString('en-IN')}.00
                </span>
              </div>
            </div>

            {/* Official Move-In Date Selection + Payment Method */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <div className="space-y-2">
                <label className="text-xs font-extrabold text-slate-800 block">
                  Specify Official Scheduled Move-In Date:
                </label>
                <input
                  type="date"
                  value={agreedMoveInInput}
                  onChange={(e) => setAgreedMoveInInput(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-900"
                />
                <p className="text-[11px] text-slate-500">
                  Your 7-Day Automated Grace Window starts on this Move-In Date at 12:00 PM.
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setEscrowPayMethod('instant_demo')}
                    className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold border ${
                      escrowPayMethod === 'instant_demo'
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'bg-white text-slate-700 border-slate-200'
                    }`}
                  >
                    ⚡ Instant Escrow Lock
                  </button>
                  <button
                    type="button"
                    onClick={() => setEscrowPayMethod('upi_qr')}
                    className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold border ${
                      escrowPayMethod === 'upi_qr'
                        ? 'bg-emerald-600 text-white border-emerald-600'
                        : 'bg-white text-slate-700 border-slate-200'
                    }`}
                  >
                    📱 Direct UPI QR ({UPI_ID})
                  </button>
                </div>

                {escrowPayMethod === 'upi_qr' && (
                  <div className="bg-white p-3 rounded-xl border border-slate-200 flex items-center gap-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={escrowQrUrl} alt="Escrow UPI QR" className="w-20 h-20 rounded-lg border" />
                    <div className="space-y-1.5 flex-1 text-[11px]">
                      <div className="font-bold text-slate-900">
                        Pay ₹{remainingEscrowBalanceINR.toLocaleString('en-IN')} to {PAYEE_NAME}
                      </div>
                      <a
                        href={escrowUpiUri}
                        className="inline-flex items-center gap-1 text-emerald-700 font-extrabold underline"
                      >
                        <span>Open UPI App</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                      <input
                        type="text"
                        maxLength={12}
                        value={escrowUtr}
                        onChange={(e) => setEscrowUtr(e.target.value)}
                        placeholder="Optional 12-digit UTR..."
                        className="w-full border border-slate-200 rounded px-2 py-1 text-[11px] font-mono"
                      />
                    </div>
                  </div>
                )}

                <button
                  type="button"
                  onClick={handlePayEscrowBalance}
                  disabled={isPayingEscrow}
                  className="w-full py-3.5 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 transition-all"
                >
                  {isPayingEscrow ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Lock className="w-4 h-4" />
                  )}
                  <span>
                    Pay ₹{remainingEscrowBalanceINR.toLocaleString('en-IN')} Balance → Lock Full ₹6,000 in Escrow Vault
                  </span>
                </button>
              </div>
            </div>
          </Card>
        )}

      {/* ═══════════════════════════════════════════════════════════════════════════
          STAGE 2: MOVE-IN KEY HANDSHAKE, 7-DAY GRACE WINDOW & DISPUTE PROTECTION
      ═══════════════════════════════════════════════════════════════════════════ */}
      {!['CANCELLED', 'EXPIRED', 'ACTIVE'].includes(booking.status) &&
        (isEscrowFunded || ['CONFIRMED', 'MOVE_IN_READY'].includes(booking.status)) && (
          <Card className="p-6 border-2 border-indigo-300 bg-gradient-to-br from-indigo-50/40 via-white to-slate-50 space-y-6 shadow-md">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-indigo-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-indigo-700 text-white flex items-center justify-center shadow-sm">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-extrabold text-base text-slate-900">
                    Stage 2: Move-In Key Handshake & ₹6,000 Escrow Vault Release
                  </h2>
                  <p className="text-xs text-slate-600">
                    ₹6,000 is locked safely in UniNest Escrow. Share your 6-digit Move-In Key with the landlord <strong>only after</strong> inspecting your room and receiving physical keys.
                  </p>
                </div>
              </div>
              <Badge variant="success">🔒 ₹6,000 Held in Escrow</Badge>
            </div>

            {/* 6-Digit Move-In Key Generator / Display */}
            {!moveInKey && !booking.moveInOtp ? (
              <button
                type="button"
                onClick={handleGenerateMoveInKey}
                disabled={isGeneratingMoveInKey}
                className="w-full py-4 px-5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-sm shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                {isGeneratingMoveInKey ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <KeyRound className="w-5 h-5" />
                )}
                <span>Generate 6-Digit Move-In Handshake Key</span>
              </button>
            ) : (
              <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 text-center text-white space-y-3 shadow-lg">
                <div className="text-[11px] font-bold text-indigo-300 uppercase tracking-widest">
                  Stage 2 Handshake PIN • Share With Landlord Upon Check-In
                </div>
                <div className="text-4xl sm:text-5xl font-mono font-black tracking-[0.25em] text-emerald-400">
                  {moveInKey ||
                    `${(booking.moveInOtp || '792410').slice(0, 3)}-${(
                      booking.moveInOtp || '792410'
                    ).slice(3)}`}
                </div>
                <p className="text-xs text-slate-300 max-w-md mx-auto">
                  When Landlord {landlordUser.name || 'Vikram Singh'} enters this 6-digit PIN in the Landlord Portal, UniNest Escrow immediately releases <strong>₹6,000</strong> to their bank account and activates your Digital Lease.
                </p>
                <div className="flex items-center justify-center gap-3 pt-1">
                  <button
                    type="button"
                    onClick={handleCopyMoveInKey}
                    className="inline-flex items-center gap-1.5 text-xs font-bold bg-white/10 hover:bg-white/20 px-3.5 py-1.5 rounded-xl text-white transition-colors"
                  >
                    {copiedMoveInKey ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" /> Copied Key!
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" /> Copy 6-Digit Key
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={handleGenerateMoveInKey}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-300 hover:text-white"
                  >
                    <RefreshCw className="w-3.5 h-3.5" /> Regenerate Key
                  </button>
                </div>
              </div>
            )}

            {/* 7-Day Automated Grace Protocol Visual Tracker */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h4 className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5">
                  <Timer className="w-4 h-4 text-indigo-600" />
                  7-Day Automated Grace Window & Anti-Ghosting Protection
                </h4>
                <span className="text-[11px] font-bold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-200">
                  Scheduled Move-In: {moveInDateStr}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5 text-[11px]">
                <div className="bg-white p-3 rounded-xl border border-slate-200">
                  <span className="font-extrabold text-indigo-700 block">Day 1 (Move-In + 24h)</span>
                  <span className="text-slate-600">Automated SMS & App Check-In Verification</span>
                </div>
                <div className="bg-white p-3 rounded-xl border border-slate-200">
                  <span className="font-extrabold text-amber-700 block">Day 3 & Day 5</span>
                  <span className="text-slate-600">UniNest Support Outbound Phone Calls</span>
                </div>
                <div className="bg-white p-3 rounded-xl border border-slate-200">
                  <span className="font-extrabold text-emerald-700 block">If Delay Declared</span>
                  <span className="text-slate-600">₹0 Penalty! Room held safe for full paid month</span>
                </div>
                <div className="bg-white p-3 rounded-xl border border-rose-200">
                  <span className="font-extrabold text-rose-700 block">Day 7 Total Ghosting</span>
                  <span className="text-slate-600">
                    <strong>₹2,800</strong> (14d Pro-Rata) to Landlord • <strong>₹3,200</strong> Refunded to You
                  </span>
                </div>
              </div>
            </div>

            {/* Stage 2 Edge-Case Action Bar: Arriving Late | Discrepancy Dispute | Tiered Cancel | Simulate Day 7 Ghosting */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 pt-1">
              <button
                type="button"
                onClick={() => {
                  setShowDelayForm(!showDelayForm);
                  setShowDisputeModal(false);
                  setShowCancelConfirm(false);
                }}
                className="py-3 px-3.5 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-900 font-extrabold text-xs flex items-center justify-center gap-1.5 transition-all"
              >
                <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Arriving Late (₹0 Fee)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowDisputeModal(!showDisputeModal);
                  setShowDelayForm(false);
                  setShowCancelConfirm(false);
                }}
                className="py-3 px-3.5 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-300 text-rose-900 font-extrabold text-xs flex items-center justify-center gap-1.5 transition-all"
              >
                <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
                <span>Room Discrepancy Freeze</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowCancelConfirm(!showCancelConfirm);
                  setShowDelayForm(false);
                  setShowDisputeModal(false);
                }}
                className="py-3 px-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-800 font-extrabold text-xs flex items-center justify-center gap-1.5 transition-all"
              >
                <XCircle className="w-4 h-4 text-slate-600 shrink-0" />
                <span>Tiered Cancellation</span>
              </button>

              <button
                type="button"
                onClick={handleSimulateDay7Ghosting}
                disabled={isSimulatingGhost}
                className="py-3 px-3.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-900 font-extrabold text-xs flex items-center justify-center gap-1.5 transition-all"
              >
                {isSimulatingGhost ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Scale className="w-4 h-4 text-indigo-600 shrink-0" />
                )}
                <span>Test Day 7 Ghost Split</span>
              </button>
            </div>

            {/* 1. ARRIVING LATE DECLARATION FORM */}
            {showDelayForm && (
              <div className="bg-amber-50 border border-amber-300 rounded-2xl p-4 space-y-3">
                <h4 className="text-xs font-extrabold text-amber-950 flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-amber-600" />
                  1-Click Late Arrival Declaration (Pauses 7-Day Ghosting Timer — ₹0 Deduction)
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-amber-900 block mb-1">
                      Delay Duration (Days)
                    </label>
                    <select
                      value={delayDays}
                      onChange={(e) => setDelayDays(parseInt(e.target.value))}
                      className="w-full bg-white border border-amber-300 rounded-xl p-2.5 text-xs font-bold text-slate-900"
                    >
                      {[1, 2, 3, 4, 5, 6, 7].map((d) => (
                        <option key={d} value={d}>
                          Delayed by {d} day{d > 1 ? 's' : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-amber-900 block mb-1">
                      Reason for Late Arrival
                    </label>
                    <input
                      type="text"
                      value={delayReason}
                      onChange={(e) => setDelayReason(e.target.value)}
                      placeholder="e.g. Train delayed / Medical rest / Exam schedule..."
                      className="w-full bg-white border border-amber-300 rounded-xl p-2.5 text-xs text-slate-900"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowDelayForm(false)}
                    className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 text-xs font-bold"
                  >
                    Close
                  </button>
                  <button
                    type="button"
                    onClick={handleDelayMoveIn}
                    disabled={isSubmittingDelay}
                    className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-extrabold flex items-center gap-1.5"
                  >
                    {isSubmittingDelay && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    <span>Notify Landlord & Hold My Bed Safe</span>
                  </button>
                </div>
              </div>
            )}

            {/* 2. PROPERTY MISREPRESENTATION / CONDITION DISPUTE FREEZE MODAL */}
            {showDisputeModal && (
              <div className="bg-rose-50 border-2 border-rose-300 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-extrabold text-rose-950 flex items-center gap-1.5">
                    <ShieldAlert className="w-4 h-4 text-rose-600" />
                    Property Misrepresentation on Move-In — Freeze 100% of Escrow
                  </h4>
                  <span className="text-[10px] font-black bg-rose-600 text-white px-2 py-0.5 rounded">
                    100% Refund (₹6,000) + Relocation
                  </span>
                </div>
                <p className="text-[11px] text-rose-800">
                  If the room has fake photos, no AC when listed with AC, broken washroom, or wrong sharing count, UniNest freezes 100% of your Escrow, pays ₹0 to the landlord, and issues a full refund.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-rose-900 block mb-1">
                      Discrepancy Category
                    </label>
                    <select
                      value={discrepancyType}
                      onChange={(e) => setDiscrepancyType(e.target.value)}
                      className="w-full bg-white border border-rose-300 rounded-xl p-2.5 text-xs font-bold text-slate-900"
                    >
                      <option value="Room has no AC (Listed as AC Room)">
                        Room has no AC (Listed as AC Room)
                      </option>
                      <option value="Fake / Misleading Photos — Dirty or Uninhabitable">
                        Fake / Misleading Photos — Dirty or Uninhabitable
                      </option>
                      <option value="Wrong Sharing Count (Crowded Room)">
                        Wrong Sharing Count (Crowded Room)
                      </option>
                      <option value="Broken Washroom / Water Supply Issue">
                        Broken Washroom / Water Supply Issue
                      </option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-rose-900 block mb-1">
                      Inspection Notes
                    </label>
                    <input
                      type="text"
                      value={discrepancyDesc}
                      onChange={(e) => setDiscrepancyDesc(e.target.value)}
                      placeholder="Describe what didn't match the listing..."
                      className="w-full bg-white border border-rose-300 rounded-xl p-2.5 text-xs text-slate-900"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowDisputeModal(false)}
                    className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 text-xs font-bold"
                  >
                    Close
                  </button>
                  <button
                    type="button"
                    onClick={handleFileDiscrepancyDispute}
                    disabled={isFreezingEscrow}
                    className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-extrabold flex items-center gap-1.5"
                  >
                    {isFreezingEscrow && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    <span>Freeze 100% Escrow & Claim Full ₹6,000 Refund</span>
                  </button>
                </div>
              </div>
            )}

            {/* 3. TIERED ADVANCE CANCELLATION FORM */}
            {showCancelConfirm && (
              <div className="bg-slate-100 border border-slate-300 rounded-2xl p-4 space-y-3">
                <h4 className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  Tiered Advance Reservation Cancellation (15–45 Days Policy)
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => setSimulatedAdvanceDays(35)}
                    className={`p-2.5 rounded-xl border text-left ${
                      simulatedAdvanceDays > 30
                        ? 'bg-emerald-50 border-emerald-500 ring-1 ring-emerald-500'
                        : 'bg-white border-slate-200'
                    }`}
                  >
                    <div className="font-extrabold text-emerald-800">&gt;30 Days Remaining</div>
                    <div className="text-[11px] text-slate-600">85% Refund to Student • 15% Buffer</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSimulatedAdvanceDays(20)}
                    className={`p-2.5 rounded-xl border text-left ${
                      simulatedAdvanceDays >= 15 && simulatedAdvanceDays <= 30
                        ? 'bg-amber-50 border-amber-500 ring-1 ring-amber-500'
                        : 'bg-white border-slate-200'
                    }`}
                  >
                    <div className="font-extrabold text-amber-800">15–30 Days Remaining</div>
                    <div className="text-[11px] text-slate-600">50% Refund • 50% to Landlord</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSimulatedAdvanceDays(4)}
                    className={`p-2.5 rounded-xl border text-left ${
                      simulatedAdvanceDays < 7
                        ? 'bg-rose-50 border-rose-500 ring-1 ring-rose-500'
                        : 'bg-white border-slate-200'
                    }`}
                  >
                    <div className="font-extrabold text-rose-800">&lt;7 Days (Last Minute)</div>
                    <div className="text-[11px] text-slate-600">0% Refund • 100% Token to Landlord</div>
                  </button>
                </div>
                <input
                  type="text"
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder="Optional reason for cancellation..."
                  className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-xs"
                />
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowCancelConfirm(false)}
                    className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 text-xs font-bold"
                  >
                    Go Back
                  </button>
                  <button
                    type="button"
                    onClick={() => handleCancelBooking('ADVANCE_TIERED')}
                    disabled={isCancelling}
                    className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-extrabold flex items-center gap-1.5"
                  >
                    {isCancelling && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    <span>Execute Tiered Cancellation ({simulatedAdvanceDays}d Before Move-In)</span>
                  </button>
                </div>
              </div>
            )}
          </Card>
        )}

      {/* ═══════════════════════════════════════════════════════════════════════════
          OUTCOME CARDS: ACTIVE TENANCY / CANCELLED / DISPUTE FROZEN / GRACE SPLIT
      ═══════════════════════════════════════════════════════════════════════════ */}
      {booking.status === 'ACTIVE' && (
        <Card className="p-6 border-2 border-emerald-400 bg-gradient-to-br from-emerald-50 to-white space-y-4 shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-lg">
              <Home className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-extrabold text-lg text-emerald-950">
                🎉 Stage 2 Complete — Tenancy Active & Digital Lease Issued!
              </h2>
              <p className="text-xs text-emerald-800">
                Your 6-digit Move-In Key was verified by the landlord. ₹6,000 has been released from UniNest Escrow. Welcome home to {property.name}!
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-white p-3.5 rounded-xl border border-emerald-200 text-center">
              <div className="text-[11px] font-bold text-emerald-600 uppercase">Escrow Released</div>
              <div className="text-lg font-extrabold text-emerald-950">
                ₹{((booking.escrowAmount || 600000) / 100).toLocaleString('en-IN')}
              </div>
            </div>
            <div className="bg-white p-3.5 rounded-xl border border-emerald-200 text-center">
              <div className="text-[11px] font-bold text-emerald-600 uppercase">Handshake Status</div>
              <div className="text-sm font-extrabold text-emerald-950">MOVEIN_OTP_VERIFIED ✓</div>
            </div>
            <div className="bg-white p-3.5 rounded-xl border border-emerald-200 text-center">
              <div className="text-[11px] font-bold text-emerald-600 uppercase">11-Month Digital Lease</div>
              <div className="text-sm font-extrabold text-emerald-950">SIGNED & ACTIVE</div>
            </div>
          </div>
        </Card>
      )}

      {['CANCELLED', 'EXPIRED'].includes(booking.status) && (
        <Card className="p-6 border-2 border-slate-300 bg-slate-50 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-base text-slate-900">
              Escrow Settlement Summary ({booking.handshakeStatus})
            </h3>
            <Badge variant={booking.handshakeStatus === 'DISPUTE_FROZEN' ? 'danger' : 'warning'}>
              {booking.status}
            </Badge>
          </div>
          <p className="text-xs text-slate-700 leading-relaxed">{booking.notes}</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2 text-xs">
            <div className="bg-white p-3 rounded-xl border border-slate-200">
              <span className="text-slate-500 block">Student UPI Refund</span>
              <span className="text-base font-extrabold text-emerald-700">
                ₹{((booking.refundAmount ?? 39900) / 100).toLocaleString('en-IN')}
              </span>
            </div>
            <div className="bg-white p-3 rounded-xl border border-slate-200">
              <span className="text-slate-500 block">Landlord Vacancy Payout</span>
              <span className="text-base font-extrabold text-indigo-700">
                ₹{((booking.vacancyCompAmount ?? 0) / 100).toLocaleString('en-IN')}
              </span>
            </div>
            <div className="bg-white p-3 rounded-xl border border-slate-200">
              <span className="text-slate-500 block">Bed Status on Platform</span>
              <span className="text-sm font-extrabold text-slate-900">
                {booking.handshakeStatus === 'DISPUTE_FROZEN'
                  ? 'SUSPENDED (Audit Pending)'
                  : 'AVAILABLE (Relisted)'}
              </span>
            </div>
          </div>
        </Card>
      )}

      {/* Main Grid: Details + Location + Landlord */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Booking Summary */}
          <Card className="p-6 space-y-4 border-slate-200/80">
            <h2 className="font-extrabold text-base text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
              <BedDouble className="w-5 h-5 text-indigo-600" />
              <span>Reserved Accommodation & Escrow Ledger</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-1">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Property Name
                </span>
                <span className="font-extrabold text-slate-900 text-sm">{property.name}</span>
                <span className="text-xs text-slate-500 block">Type: {property.gender || 'ANY'} PG</span>
              </div>
              <div className="bg-indigo-50/70 p-4 rounded-2xl border border-indigo-100 space-y-1">
                <span className="text-[11px] font-bold text-indigo-500 uppercase tracking-wider block">
                  Assigned Bed & Room
                </span>
                <span className="font-extrabold text-indigo-950 text-sm">
                  Room {room.roomNumber || '204'} (Bed {bed.label || bed.bedNumber || 'A'})
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
                  Deposit: {formatINR(room.deposit || 600000)} (Escrow Protected)
                </span>
              </div>
              <div className="bg-emerald-50/70 p-4 rounded-2xl border border-emerald-100 space-y-1">
                <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider block">
                  Escrow & Handshake Status
                </span>
                <span className="font-extrabold text-emerald-950 text-sm flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  ₹{tokenPaidINR} Token Paid{' '}
                  {booking.postVisitDecision === 'ACCEPTED' ? '(Credited to Rent)' : '(Locked)'}
                </span>
                <span className="text-xs text-emerald-700 block">
                  Handshake: {booking.handshakeStatus || 'PENDING'}
                </span>
              </div>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-slate-100 text-xs text-slate-600">
              <div>
                Booked On: <strong className="text-slate-900">{createdDateStr}</strong>
              </div>
              <div>
                Official Move-In Date: <strong className="text-slate-900">{moveInDateStr}</strong>
              </div>
            </div>
          </Card>

          {/* Location & Directions */}
          <Card className="p-6 space-y-4 border-slate-200/80">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                <Unlock className="w-5 h-5 text-emerald-600" />
                <span>Exact Property Location & Directions</span>
              </h2>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                Unlocked via Escrow Token
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
                        {property.address}, {property.locality || 'BRS Nagar'}, {property.city},{' '}
                        {property.state || 'Punjab'} - {property.pincode || '141012'}
                      </p>
                      <p className="text-xs text-slate-600 mt-1">
                        Landmark: Opposite PCTE Campus Gate 2, near City Market.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900 text-white p-4 rounded-2xl">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center font-bold text-white shrink-0">
                      <Navigation className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-xs">Navigate to Property</h4>
                      <p className="text-[11px] text-slate-300">
                        Open Google Maps for turn-by-turn navigation
                      </p>
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
                <span>Exact address locked until bed reservation is completed.</span>
              </div>
            )}
          </Card>
        </div>

        {/* Right Column: Visit Schedule + Landlord Contact */}
        <div className="space-y-6">
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
              </div>
            ) : (
              <div className="text-center py-4 text-xs text-slate-500 space-y-2">
                <p>No visit scheduled yet.</p>
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
                  <ShieldCheck className="w-3.5 h-3.5" /> UniNest Verified Landlord
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

      {/* Modals */}
      {showVisitModal && (
        <VisitSchedulingModal
          isOpen={showVisitModal}
          onClose={() => setShowVisitModal(false)}
          onSuccess={(newVisit) => {
            setShowVisitModal(false);
            setBooking((prev: any) => ({
              ...prev,
              status: 'VISIT_REQUESTED',
              visits: [newVisit, ...(prev.visits || [])],
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
