'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  CalendarCheck,
  CheckCircle2,
  Clock,
  XCircle,
  RefreshCw,
  ShieldCheck,
  Key,
  KeyRound,
  Loader2,
  Banknote,
  Home,
  Copy,
  Check,
  Scale,
  ShieldAlert,
} from 'lucide-react';

interface LandlordBookingsClientProps {
  bookings: any[];
  visits: any[];
}

export function LandlordBookingsClient({
  bookings: initialBookings,
  visits: initialVisits,
}: LandlordBookingsClientProps) {
  const [visits, setVisits] = useState(initialVisits);
  const [bookings, setBookings] = useState(initialBookings);
  const [isLiveSyncing, setIsLiveSyncing] = useState(false);
  const [lastSyncedAt, setLastSyncedAt] = useState<string>('Live');
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [banner, setBanner] = useState<{
    type: 'success' | 'warning' | 'danger';
    title: string;
    message: string;
  } | null>(null);

  // Counter proposal state
  const [counterId, setCounterId] = useState<string | null>(null);
  const [counterSlot, setCounterSlot] = useState('06:00 PM – 07:00 PM');
  const [counterReason, setCounterReason] = useState('Earlier slot is occupied. Proposed evening slot.');

  // Stage 1: Visit OTP State
  const [generatingOtpFor, setGeneratingOtpFor] = useState<string | null>(null);
  const [generatedOtps, setGeneratedOtps] = useState<Record<string, { otp: string; expiresAt: string }>>({});
  const [copiedOtp, setCopiedOtp] = useState<string | null>(null);

  // Stage 2: Move-In Key Verification State
  const [moveInKeyInput, setMoveInKeyInput] = useState<Record<string, string>>({});
  const [verifyingMoveIn, setVerifyingMoveIn] = useState<string | null>(null);
  const [moveInVerified, setMoveInVerified] = useState<Record<string, boolean>>({});
  const [processingSplitFor, setProcessingSplitFor] = useState<string | null>(null);

  const syncLivePortal = useCallback(async (showSpinner = false) => {
    if (showSpinner) setIsLiveSyncing(true);
    try {
      const res = await fetch('/api/booking/live-sync', { cache: 'no-store' });
      const data = await res.json();
      if (data?.success) {
        if (Array.isArray(data.bookings) && data.bookings.length > 0) {
          setBookings(data.bookings);
        }
        if (Array.isArray(data.visits) && data.visits.length > 0) {
          setVisits(data.visits);
        }
        setLastSyncedAt(
          new Date().toLocaleTimeString('en-IN', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
          })
        );
      }
    } catch {
      // Ignore transient offline error
    } finally {
      if (showSpinner) setIsLiveSyncing(false);
    }
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      if (typeof document !== 'undefined' && document.visibilityState === 'visible') {
        syncLivePortal(false);
      }
    }, 4000);

    const handleReconnected = () => syncLivePortal(true);
    window.addEventListener('uninest:network-reconnected', handleReconnected);
    return () => {
      clearInterval(interval);
      window.removeEventListener('uninest:network-reconnected', handleReconnected);
    };
  }, [syncLivePortal]);

  const handleRespondVisit = async (visitId: string, action: 'ACCEPT' | 'COUNTER_PROPOSE' | 'DECLINE') => {
    setLoadingId(visitId);
    try {
      const res = await fetch('/api/visits/respond', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          visitId,
          action,
          counterSlot: action === 'COUNTER_PROPOSE' ? counterSlot : undefined,
          counterReason: action === 'COUNTER_PROPOSE' ? counterReason : undefined,
        }),
      });
      const data = await res.json();
      setLoadingId(null);
      if (data.success && data.visit) {
        setVisits((prev) =>
          prev.map((v) =>
            v.id === visitId ? { ...v, status: data.visit.status, counterSlot: data.visit.counterSlot } : v
          )
        );
        setCounterId(null);
      } else {
        const fallbackStatus =
          action === 'ACCEPT' ? 'CONFIRMED' : action === 'COUNTER_PROPOSE' ? 'COUNTER_PROPOSED' : 'CANCELLED';
        setVisits((prev) =>
          prev.map((v) => (v.id === visitId ? { ...v, status: fallbackStatus, counterSlot } : v))
        );
        setCounterId(null);
      }
    } catch (err) {
      setLoadingId(null);
    }
  };

  const handleGenerateVisitOtp = async (bookingId: string) => {
    setGeneratingOtpFor(bookingId);
    try {
      const res = await fetch('/api/booking/visit-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId }),
      });
      const data = await res.json();
      setGeneratingOtpFor(null);
      if (data.success) {
        setGeneratedOtps((prev) => ({
          ...prev,
          [bookingId]: { otp: data.otp, expiresAt: data.expiresAt },
        }));
        setBookings((prev) =>
          prev.map((b) => (b.id === bookingId ? { ...b, visitOtp: data.otp, visitOtpExpiresAt: data.expiresAt } : b))
        );
        setBanner({
          type: 'success',
          title: `🔑 4-Digit Visit OTP Generated: ${data.otp}`,
          message: data.message,
        });
      } else {
        alert(data.error || 'Failed to generate OTP');
      }
    } catch (e) {
      setGeneratingOtpFor(null);
      alert('OTP generation failed');
    }
  };

  const handleCopyOtp = (bookingId: string, otp: string) => {
    navigator.clipboard.writeText(otp);
    setCopiedOtp(bookingId);
    setTimeout(() => setCopiedOtp(null), 2000);
  };

  const handleTrigger72hNoShow = async (bookingId: string) => {
    setProcessingSplitFor(bookingId);
    try {
      const res = await fetch('/api/booking/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId,
          mode: 'NO_SHOW_72H',
          reason: '72-Hour Unexplained Visit No-Show Claimed by Landlord',
        }),
      });
      const data = await res.json();
      setProcessingSplitFor(null);
      if (data.success) {
        setBookings((prev) =>
          prev.map((b) =>
            b.id === bookingId
              ? {
                  ...b,
                  ...(data.booking || {}),
                  status: 'EXPIRED',
                  handshakeStatus: 'AUTO_RELEASED_GRACE',
                  vacancyCompAmount: 20000,
                }
              : b
          )
        );
        setBanner({
          type: 'warning',
          title: '⏱ 72-Hour No-Show Claim Processed — ₹200 Vacancy Credit Paid to Landlord!',
          message: data.message,
        });
      }
    } catch (e) {
      setProcessingSplitFor(null);
    }
  };

  const handleVerifyMoveInKey = async (bookingId: string) => {
    const key = moveInKeyInput[bookingId];
    if (!key || key.replace(/[^0-9]/g, '').length !== 6) {
      alert('Please enter the 6-digit Move-In Key provided by the student at check-in.');
      return;
    }
    setVerifyingMoveIn(bookingId);
    try {
      const res = await fetch('/api/booking/verify-movein', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId, moveInKey: key }),
      });
      const data = await res.json();
      setVerifyingMoveIn(null);
      if (data.success) {
        setMoveInVerified((prev) => ({ ...prev, [bookingId]: true }));
        setBookings((prev) =>
          prev.map((b) =>
            b.id === bookingId
              ? {
                  ...b,
                  ...(data.booking || {}),
                  status: 'ACTIVE',
                  handshakeStatus: 'MOVEIN_OTP_VERIFIED',
                }
              : b
          )
        );
        setBanner({
          type: 'success',
          title: '💰 Stage 2 Move-In Verified — ₹6,000 Escrow Released to Your Bank Account!',
          message: data.message,
        });
      } else {
        alert(data.error || 'Invalid Move-In Key');
      }
    } catch (e) {
      setVerifyingMoveIn(null);
      alert('Verification failed');
    }
  };

  const handleTriggerDay7GhostSplit = async (bookingId: string) => {
    setProcessingSplitFor(bookingId);
    try {
      const res = await fetch('/api/booking/grace-expire', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId }),
      });
      const data = await res.json();
      setProcessingSplitFor(null);
      if (data.success) {
        setBookings((prev) =>
          prev.map((b) =>
            b.id === bookingId
              ? {
                  ...b,
                  ...(data.booking || {}),
                  status: 'EXPIRED',
                  handshakeStatus: 'AUTO_RELEASED_GRACE',
                  vacancyCompAmount: 280000,
                }
              : b
          )
        );
        setBanner({
          type: 'warning',
          title: '⚖️ Day 7 Unreachable Tenant Claim Processed — ₹2,800 (14d Pro-Rata) Paid to You!',
          message: data.message,
        });
      }
    } catch (e) {
      setProcessingSplitFor(null);
    }
  };

  const getStatusBadgeClasses = (b: any) => {
    if (b.handshakeStatus === 'DISPUTE_FROZEN') {
      return {
        cls: 'bg-rose-100 text-rose-800 border-rose-300',
        label: '❄️ Escrow Frozen (Dispute)',
        icon: ShieldAlert,
      };
    }
    if (b.status === 'ACTIVE' || moveInVerified[b.id]) {
      return {
        cls: 'bg-emerald-100 text-emerald-800 border-emerald-300',
        label: '🏠 ACTIVE — Escrow Paid Out',
        icon: Home,
      };
    }
    if (b.status === 'MOVE_IN_READY') {
      return {
        cls: 'bg-indigo-100 text-indigo-800 border-indigo-300',
        label: '🔑 Move-In Key Ready',
        icon: KeyRound,
      };
    }
    if (b.status === 'CONFIRMED') {
      return {
        cls: 'bg-teal-100 text-teal-800 border-teal-300',
        label: b.escrowAmount ? '🔒 ₹6,000 Locked in Escrow' : '✓ Room Accepted',
        icon: Banknote,
      };
    }
    if (b.status === 'VISITED') {
      return {
        cls: 'bg-blue-100 text-blue-800 border-blue-300',
        label: '👁️ Visit Verified — Awaiting Student',
        icon: CheckCircle2,
      };
    }
    if (b.status === 'RESERVED') {
      return {
        cls: 'bg-amber-100 text-amber-900 border-amber-300',
        label:
          b.reservationType === 'ADVANCE_SESSION'
            ? '📅 Advance Hold (15% Token)'
            : '⏳ 72h Bed Hold (₹399 Token)',
        icon: Key,
      };
    }
    if (b.status === 'EXPIRED') {
      return {
        cls: 'bg-amber-100 text-amber-900 border-amber-300',
        label: '⚖️ Pro-Rata Vacancy Payout',
        icon: Scale,
      };
    }
    return {
      cls: 'bg-rose-100 text-rose-800 border-rose-300',
      label: b.status,
      icon: XCircle,
    };
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12 animate-fade-in">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 rounded-3xl p-6 text-white shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-300 bg-emerald-900/50 px-3 py-1 rounded-full border border-emerald-700/50 mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            Landlord Algorithmic Escrow &amp; Handshake Desk
          </div>
          <h1 className="text-2xl font-extrabold">Landlord Escrow &amp; Booking Control</h1>
          <p className="text-xs text-slate-300 mt-1">
            Generate Stage 1 Visit OTPs (4-digit), verify Stage 2 Move-In Keys (6-digit) to release ₹6,000 escrow, and file statutory vacancy compensation claims.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0 self-start sm:self-center flex-wrap">
          <button
            type="button"
            onClick={() => syncLivePortal(true)}
            className="px-3.5 py-2.5 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-400/40 rounded-xl text-xs font-extrabold text-emerald-200 flex items-center gap-1.5 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLiveSyncing ? 'animate-spin' : ''}`} />
            <span>Sync Live ({lastSyncedAt})</span>
          </button>
          <Link
            href="/legal?doc=escrow"
            target="_blank"
            className="px-4 py-2.5 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-xs font-bold text-white flex items-center gap-1.5"
          >
            <Scale className="w-4 h-4 text-emerald-400" />
            <span>Escrow &amp; Vacancy Policy</span>
          </Link>
        </div>
      </div>

      {/* Live Action Banner */}
      {banner && (
        <div
          className={`rounded-2xl p-4 border shadow-md flex items-start justify-between gap-3 ${
            banner.type === 'success'
              ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
              : banner.type === 'warning'
              ? 'bg-amber-50 border-amber-300 text-amber-950'
              : 'bg-rose-50 border-rose-300 text-rose-950'
          }`}
        >
          <div className="space-y-1">
            <h4 className="text-sm font-extrabold">{banner.title}</h4>
            <p className="text-xs">{banner.message}</p>
          </div>
          <button onClick={() => setBanner(null)} className="text-xs font-bold opacity-60 hover:opacity-100">
            ✕
          </button>
        </div>
      )}

      {/* SECTION 1: ESCROW BED RESERVATIONS & TWO-STAGE OTP HANDSHAKES */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            Two-Stage Escrow Bookings &amp; OTP Handshakes ({bookings.length})
          </h2>
          <span className="text-xs font-bold bg-emerald-50 text-emerald-800 px-3 py-1 rounded-full border border-emerald-200">
            Stage 1 (4-Digit Visit PIN) • Stage 2 (6-Digit Move-In Key)
          </span>
        </div>

        <div className="space-y-5">
          {bookings.map((b) => {
            const badge = getStatusBadgeClasses(b);
            const StatusIcon = badge.icon;
            const otpData =
              generatedOtps[b.id] ||
              (b.visitOtp
                ? {
                    otp: b.visitOtp,
                    expiresAt: b.visitOtpExpiresAt || new Date(Date.now() + 72 * 3600 * 1000).toISOString(),
                  }
                : null);
            const isVerified = moveInVerified[b.id] || b.status === 'ACTIVE';
            const tokenINR =
              b.reservationType === 'ADVANCE_SESSION'
                ? (b.advanceTokenAmount || 90000) / 100
                : (b.reservationFee || 39900) / 100;

            return (
              <div
                key={b.id}
                className="border-2 border-slate-200 rounded-2xl p-5 bg-slate-50/40 hover:bg-white transition-all space-y-4 shadow-sm"
              >
                {/* Booking Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-slate-900 text-white font-extrabold text-sm flex items-center justify-center">
                      {b.user?.name?.[0] || 'R'}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-sm font-extrabold text-slate-900">
                          {b.user?.name || 'Rahul Sharma'}
                        </h4>
                        <span className="text-[10px] font-mono font-bold bg-slate-200/80 text-slate-700 px-2 py-0.5 rounded">
                          {b.referenceNo || b.id}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 font-medium mt-0.5">
                        {b.property?.name} • Room {b.bed?.room?.roomNumber || '204'} (Bed{' '}
                        {b.bed?.label || b.bed?.bedNumber || 'A'})
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`px-3 py-1.5 rounded-full text-[11px] font-extrabold border flex items-center gap-1.5 ${badge.cls}`}
                    >
                      <StatusIcon className="w-3.5 h-3.5" />
                      {badge.label}
                    </span>
                  </div>
                </div>

                {/* Financial & Timing Pills */}
                <div className="flex flex-wrap items-center gap-2.5 text-xs">
                  <span className="bg-emerald-50 text-emerald-800 font-bold px-3 py-1.5 rounded-xl border border-emerald-200">
                    {b.reservationType === 'ADVANCE_SESSION'
                      ? `15% Advance Token: ₹${tokenINR} Paid ✓`
                      : `72h Visit Token: ₹${tokenINR} Paid ✓`}
                  </span>
                  <span className="bg-indigo-50 text-indigo-900 font-bold px-3 py-1.5 rounded-xl border border-indigo-200">
                    Escrow Vault:{' '}
                    {b.escrowAmount
                      ? `₹${(b.escrowAmount / 100).toLocaleString('en-IN')} Locked`
                      : 'Awaiting Post-Visit Rent Deposit'}
                  </span>
                  <span className="bg-white text-slate-700 font-bold px-3 py-1.5 rounded-xl border border-slate-200">
                    Move-In Target:{' '}
                    {b.delayedMoveInDate
                      ? `${new Date(b.delayedMoveInDate).toLocaleDateString('en-IN')} (Delayed)`
                      : b.agreedMoveInDate
                      ? new Date(b.agreedMoveInDate).toLocaleDateString('en-IN')
                      : 'Immediate'}
                  </span>
                </div>

                {/* Delayed Arrival Alert Banner */}
                {b.delayedMoveInDate && (
                  <div className="bg-amber-50 border border-amber-300 rounded-xl p-3 text-xs text-amber-950 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>
                        <strong>TENANT_ARRIVING_DELAYED:</strong> Student informed late arrival on{' '}
                        <strong>{new Date(b.delayedMoveInDate).toLocaleDateString('en-IN')}</strong>. Full month rent is guaranteed in Escrow upon check-in.
                      </span>
                    </div>
                  </div>
                )}

                {/* ═══════════════════════════════════════════════════════════════
                    STAGE 1: GENERATE 4-DIGIT VISIT OTP & 72H NO-SHOW CLAIM
                ═══════════════════════════════════════════════════════════════ */}
                {['RESERVED', 'VISIT_REQUESTED', 'VISIT_CONFIRMED'].includes(b.status) &&
                  !b.visitVerifiedAt && (
                    <div className="bg-emerald-50/80 border border-emerald-300 rounded-2xl p-4 space-y-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <h4 className="text-xs font-extrabold text-emerald-950 flex items-center gap-1.5">
                          <Key className="w-4 h-4 text-emerald-600" />
                          Stage 1: Physical Visit Proof Handshake (4-Digit OTP)
                        </h4>
                        <button
                          type="button"
                          onClick={() => handleTrigger72hNoShow(b.id)}
                          disabled={processingSplitFor === b.id}
                          className="text-[11px] font-extrabold text-amber-900 bg-amber-100 hover:bg-amber-200 px-3 py-1 rounded-lg border border-amber-300 transition-colors"
                        >
                          File 72h Visit No-Show Claim (₹200 Vacancy Credit)
                        </button>
                      </div>
                      <p className="text-xs text-emerald-800">
                        When {b.user?.name || 'Rahul Sharma'} arrives physically at the PG reception, provide this 4-digit Visit OTP. Once they enter it in their Student Portal, Stage 1 is verified.
                      </p>

                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-900 text-white p-4 rounded-xl">
                        {otpData ? (
                          <div className="flex items-center gap-4">
                            <div>
                              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">
                                Active 4-Digit Visit PIN
                              </span>
                              <span className="text-3xl font-mono font-black tracking-[0.4em] text-white">
                                {otpData.otp}
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleCopyOtp(b.id, otpData.otp)}
                              className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-bold flex items-center gap-1.5"
                            >
                              {copiedOtp === b.id ? (
                                <>
                                  <Check className="w-3.5 h-3.5 text-emerald-400" /> Copied
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3.5 h-3.5" /> Copy PIN
                                </>
                              )}
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-300">No Visit OTP generated yet.</span>
                        )}

                        <button
                          type="button"
                          onClick={() => handleGenerateVisitOtp(b.id)}
                          disabled={generatingOtpFor === b.id}
                          className="py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs flex items-center justify-center gap-1.5 transition-all shrink-0"
                        >
                          {generatingOtpFor === b.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <RefreshCw className="w-4 h-4" />
                          )}
                          <span>{otpData ? 'Issue New Visit OTP' : 'Generate 4-Digit Visit OTP'}</span>
                        </button>
                      </div>
                    </div>
                  )}

                {/* Visit Verified Indicator */}
                {b.visitVerifiedAt && (
                  <div className="bg-emerald-100/80 border border-emerald-300 rounded-xl p-3 flex items-center justify-between gap-2 text-xs text-emerald-950 font-semibold">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>
                        Stage 1 Visit OTP Verified on{' '}
                        {new Date(b.visitVerifiedAt).toLocaleDateString('en-IN')}
                        {b.postVisitDecision === 'ACCEPTED' &&
                          ' • Student Accepted Room (₹399 Credited to 1st Month Rent)'}
                        {b.postVisitDecision === 'REJECTED' &&
                          ' • Student Rejected Room (₹399 Refunded, Bed Unlocked)'}
                      </span>
                    </div>
                  </div>
                )}

                {/* ═══════════════════════════════════════════════════════════════
                    STAGE 2: MOVE-IN KEY VERIFICATION (6-DIGIT) & ESCROW RELEASE
                ═══════════════════════════════════════════════════════════════ */}
                {['CONFIRMED', 'MOVE_IN_READY'].includes(b.status) && !isVerified && (
                  <div className="bg-indigo-50/90 border-2 border-indigo-300 rounded-2xl p-4 space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h4 className="text-xs font-extrabold text-indigo-950 flex items-center gap-1.5">
                        <KeyRound className="w-4 h-4 text-indigo-600" />
                        Stage 2: Enter Student&apos;s 6-Digit Move-In Handshake Key (Releases ₹6,000 Escrow)
                      </h4>
                      <button
                        type="button"
                        onClick={() => handleTriggerDay7GhostSplit(b.id)}
                        disabled={processingSplitFor === b.id}
                        className="text-[11px] font-extrabold text-indigo-900 bg-indigo-200/80 hover:bg-indigo-300 px-3 py-1 rounded-lg border border-indigo-300 transition-colors"
                      >
                        File Day 7 Unreachable Tenant Claim (₹2,800 Pro-Rata)
                      </button>
                    </div>

                    <p className="text-xs text-indigo-800">
                      When {b.user?.name || 'Rahul Sharma'} arrives for physical check-in and inspects the room, ask them for their <strong>6-Digit Move-In Handshake Key</strong>. Entering it below immediately releases <strong>₹6,000</strong> from UniNest Escrow to your bank account.
                    </p>

                    {b.moveInOtp && (
                      <div className="bg-indigo-100/90 border border-indigo-300 rounded-xl p-3 flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2 text-xs">
                          <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 animate-ping shrink-0" />
                          <span className="font-extrabold text-indigo-950">
                            Live Signal: Student Generated Move-In Key ({String(b.moveInOtp).slice(0, 3)}-{String(b.moveInOtp).slice(3)})
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            setMoveInKeyInput((prev) => ({
                              ...prev,
                              [b.id]: `${String(b.moveInOtp).slice(0, 3)}-${String(b.moveInOtp).slice(3)}`,
                            }))
                          }
                          className="px-3 py-1 rounded-lg bg-indigo-700 hover:bg-indigo-800 text-white font-extrabold text-xs transition-colors"
                        >
                          Auto-Fill Key
                        </button>
                      </div>
                    )}

                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                      <input
                        type="text"
                        maxLength={7}
                        value={moveInKeyInput[b.id] || ''}
                        onChange={(e) =>
                          setMoveInKeyInput((prev) => ({
                            ...prev,
                            [b.id]: e.target.value.replace(/[^0-9-]/g, ''),
                          }))
                        }
                        className="flex-1 bg-white border-2 border-indigo-300 rounded-xl px-4 py-3 text-xl font-mono font-black text-center text-indigo-950 tracking-[0.3em] placeholder:text-slate-300 focus:border-indigo-600 focus:outline-none"
                        placeholder="XXX-XXX"
                      />
                      <button
                        type="button"
                        onClick={() => handleVerifyMoveInKey(b.id)}
                        disabled={verifyingMoveIn === b.id}
                        className="py-3.5 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs shadow-md shadow-indigo-600/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                      >
                        {verifyingMoveIn === b.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <ShieldCheck className="w-4 h-4" />
                        )}
                        <span>Verify Key &amp; Release ₹6,000 Escrow</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Active Tenancy Payout Success */}
                {isVerified && (
                  <div className="bg-emerald-100 border border-emerald-300 rounded-2xl p-4 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                        <Home className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-extrabold text-sm text-emerald-950">
                          🎉 Stage 2 Complete — ₹{((b.escrowAmount || 600000) / 100).toLocaleString('en-IN')}{' '}
                          Escrow Released to Your Bank Account!
                        </h4>
                        <p className="text-xs text-emerald-800">
                          {b.user?.name || 'Rahul Sharma'} is now an ACTIVE tenant. Bed marked OCCUPIED &amp; 11-Month Digital Lease activated.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Cancelled / Expired / Dispute Settlement Summary */}
                {['CANCELLED', 'EXPIRED'].includes(b.status) && (
                  <div className="bg-slate-100 border border-slate-300 rounded-xl p-3.5 flex flex-wrap items-center justify-between gap-3 text-xs">
                    <div className="text-slate-700 font-medium">{b.notes}</div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="bg-white px-2.5 py-1 rounded-lg border border-slate-200 font-extrabold text-indigo-700">
                        Landlord Vacancy Credit: ₹{((b.vacancyCompAmount || 0) / 100).toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* SECTION 2: PROPERTY VISIT APPOINTMENTS */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
            <Clock className="w-5 h-5 text-indigo-600" />
            Scheduled Visit Appointments ({visits.length})
          </h2>
          <span className="text-xs font-bold bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full border border-indigo-200">
            Real-time Slot Control
          </span>
        </div>

        {visits.length === 0 ? (
          <div className="text-center py-8 text-xs text-slate-500 bg-slate-50 rounded-xl border border-slate-100">
            No visit appointments scheduled yet.
          </div>
        ) : (
          <div className="space-y-3">
            {visits.map((v) => (
              <div
                key={v.id}
                className="border border-slate-200 rounded-xl p-4 bg-slate-50/60 hover:bg-white transition-all space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/80 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-indigo-600 text-white font-bold text-sm flex items-center justify-center">
                      {v.student?.name?.[0] || 'S'}
                    </div>
                    <div>
                      <h4 className="text-sm font-extrabold text-slate-900">
                        {v.student?.name || 'Rahul Sharma'}
                      </h4>
                      <p className="text-xs text-slate-500 font-medium">
                        {v.property?.name || 'PCTE Smart Student Residency'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold px-3 py-1 rounded-lg bg-white border border-slate-200 text-slate-700">
                      📅 {new Date(v.scheduledDate).toLocaleDateString('en-IN')} ({v.timeSlot})
                    </span>
                    <span
                      className={`text-xs font-extrabold px-2.5 py-1 rounded-full ${
                        v.status === 'CONFIRMED'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : v.status === 'COUNTER_PROPOSED'
                          ? 'bg-amber-100 text-amber-800 border border-amber-300'
                          : v.status === 'CANCELLED'
                          ? 'bg-rose-100 text-rose-800 border border-rose-300'
                          : 'bg-indigo-100 text-indigo-800 border border-indigo-300'
                      }`}
                    >
                      {v.status}
                    </span>
                  </div>
                </div>

                {v.notes && (
                  <p className="text-xs text-slate-600 italic bg-white p-2.5 rounded-lg border border-slate-200">
                    &ldquo;{v.notes}&rdquo;
                  </p>
                )}

                {v.status === 'REQUESTED' && (
                  <div className="flex items-center justify-end gap-2 pt-1">
                    <button
                      disabled={loadingId === v.id}
                      onClick={() => handleRespondVisit(v.id, 'DECLINE')}
                      className="px-3 py-1.5 rounded-lg border border-rose-200 text-rose-700 bg-rose-50 hover:bg-rose-100 text-xs font-bold transition-colors"
                    >
                      Decline
                    </button>
                    <button
                      disabled={loadingId === v.id}
                      onClick={() => setCounterId(counterId === v.id ? null : v.id)}
                      className="px-3 py-1.5 rounded-lg border border-amber-200 text-amber-800 bg-amber-50 hover:bg-amber-100 text-xs font-bold transition-colors flex items-center gap-1"
                    >
                      <RefreshCw className="w-3.5 h-3.5" /> Suggest Another Time
                    </button>
                    <button
                      disabled={loadingId === v.id}
                      onClick={() => handleRespondVisit(v.id, 'ACCEPT')}
                      className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold shadow-sm transition-colors flex items-center gap-1"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" /> Accept Visit
                    </button>
                  </div>
                )}

                {counterId === v.id && (
                  <div className="bg-amber-50/80 border border-amber-200 p-3 rounded-xl space-y-2 text-xs">
                    <span className="font-bold text-amber-900 block">
                      Propose Alternative Time Slot to Student
                    </span>
                    <div className="grid grid-cols-2 gap-2">
                      <select
                        value={counterSlot}
                        onChange={(e) => setCounterSlot(e.target.value)}
                        className="bg-white border border-amber-300 rounded-lg p-2 font-semibold text-slate-900"
                      >
                        <option value="10:00 AM – 11:00 AM">10:00 AM – 11:00 AM</option>
                        <option value="02:00 PM – 03:00 PM">02:00 PM – 03:00 PM</option>
                        <option value="06:00 PM – 07:00 PM">06:00 PM – 07:00 PM</option>
                        <option value="07:00 PM – 08:00 PM">07:00 PM – 08:00 PM</option>
                      </select>
                      <input
                        type="text"
                        value={counterReason}
                        onChange={(e) => setCounterReason(e.target.value)}
                        placeholder="Reason for change..."
                        className="bg-white border border-amber-300 rounded-lg p-2 text-slate-900"
                      />
                    </div>
                    <div className="flex justify-end gap-2 pt-1">
                      <button
                        onClick={() => setCounterId(null)}
                        className="px-3 py-1 rounded bg-slate-200 text-slate-700 font-bold"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleRespondVisit(v.id, 'COUNTER_PROPOSE')}
                        className="px-3 py-1 rounded bg-amber-600 text-white font-bold"
                      >
                        Send Counter Proposal
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
