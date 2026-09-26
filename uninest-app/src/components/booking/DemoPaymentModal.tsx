'use client';

import React, { useState } from 'react';
import {
  CreditCard,
  Smartphone,
  CheckCircle2,
  ShieldCheck,
  Lock,
  X,
  ArrowRight,
  Loader2,
  Sparkles,
  QrCode,
  Copy,
  Check,
  ExternalLink,
  CalendarClock,
  Clock,
  Info,
} from 'lucide-react';

interface DemoPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (data: {
    transactionId: string;
    address: string;
    landlordPhone: string;
    bookingId?: string;
    reservationType?: string;
  }) => void;
  property: {
    id: string;
    name: string;
    monthlyRent?: number;
  };
  roomId?: string;
  bedId?: string;
}

export function DemoPaymentModal({
  isOpen,
  onClose,
  onSuccess,
  property,
  roomId,
  bedId,
}: DemoPaymentModalProps) {
  // Stage 0: Booking Intent Type ('IMMEDIATE_VISIT' = ₹399 for 72h | 'ADVANCE_SESSION' = 15% Token for 15-45 days)
  const [reservationType, setReservationType] = useState<'IMMEDIATE_VISIT' | 'ADVANCE_SESSION'>('IMMEDIATE_VISIT');
  const defaultAdvanceDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const minAdvanceDate = new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const maxAdvanceDate = new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const [agreedMoveInDate, setAgreedMoveInDate] = useState(defaultAdvanceDate);

  const [method, setMethod] = useState<'real_upi' | 'card' | 'demo'>('real_upi');
  const [utrNumber, setUtrNumber] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [txDetails, setTxDetails] = useState<{
    transactionId: string;
    address: string;
    landlordPhone: string;
    bookingId?: string;
    visitOtp?: string;
    reservationType?: string;
    amountPaid?: string;
  } | null>(null);

  const monthlyRent = property.monthlyRent || 6000;
  const advanceTokenINR = Math.round(monthlyRent * 0.15); // 15% e.g. ₹900
  const activeAmountINR = reservationType === 'ADVANCE_SESSION' ? advanceTokenINR : 399;

  const UPI_ID = process.env.NEXT_PUBLIC_UPI_ID || 'anupamrai172@oksbi';
  const PAYEE_NAME = process.env.NEXT_PUBLIC_UPI_NAME || 'UniNest Housing';
  const AMOUNT = `${activeAmountINR}.00`;
  const TRANSACTION_NOTE =
    reservationType === 'ADVANCE_SESSION'
      ? `UniNest 15% Advance Hold - ${property.name.slice(0, 18)}`
      : `UniNest 399 Visit Token - ${property.name.slice(0, 18)}`;

  // Official NPCI Standard UPI Intent Link
  const upiIntentUri = `upi://pay?pa=${encodeURIComponent(UPI_ID)}&pn=${encodeURIComponent(
    PAYEE_NAME
  )}&am=${AMOUNT}&cu=INR&tn=${encodeURIComponent(TRANSACTION_NOTE)}`;

  // Dynamic QR Code using standard QR code rendering service
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
    upiIntentUri
  )}&margin=8`;

  if (!isOpen) return null;

  const handleCopyUPI = () => {
    navigator.clipboard.writeText(UPI_ID);
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2000);
  };

  const handleConfirmPayment = async () => {
    setIsProcessing(true);
    try {
      const res = await fetch('/api/demo/reservation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          propertyId: property.id,
          propertyName: property.name,
          monthlyRent,
          roomId,
          bedId,
          reservationType,
          agreedMoveInDate: reservationType === 'ADVANCE_SESSION' ? agreedMoveInDate : undefined,
          utr: utrNumber || `UTR-${Date.now().toString().slice(-8)}`,
          paymentMethod: method === 'real_upi' ? 'REAL_UPI_DIRECT' : method,
        }),
      });

      const data = await res.json();
      setIsProcessing(false);

      if (data.success) {
        setIsSuccess(true);
        const details = {
          transactionId:
            data.transactionId || (utrNumber ? `UPI-${utrNumber}` : `UNR-${Date.now().toString().slice(-6)}`),
          address:
            data.propertyAddress || 'Plot 42, Block B, BRS Nagar, Ferozepur Rd, Ludhiana - 141012',
          landlordPhone: data.landlordPhone || '+91 98989 89801',
          bookingId: data.bookingId,
          visitOtp: data.visitOtp,
          reservationType,
          amountPaid: AMOUNT,
        };
        setTxDetails(details);
      } else {
        alert(data.error || 'Payment confirmation failed');
      }
    } catch (err) {
      setIsProcessing(false);
      alert('Payment server communication error');
    }
  };

  const handleFinishSuccess = () => {
    if (txDetails) {
      onSuccess(txDetails);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-100 max-h-[92vh] overflow-y-auto">
        {!isSuccess ? (
          <>
            {/* Payment Header */}
            <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 text-white p-5 relative">
              <button
                onClick={onClose}
                className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-400 bg-emerald-950/80 px-2.5 py-0.5 rounded-full border border-emerald-800/50 mb-1.5">
                <Lock className="w-3 h-3" />
                UniNest Algorithmic Escrow Mediator • 0% Fee UPI
              </div>
              <h3 className="text-xl font-extrabold">
                {reservationType === 'IMMEDIATE_VISIT'
                  ? 'Pay ₹399 Visit Commitment Token'
                  : `Pay ₹${advanceTokenINR} Advance Holding Token (15%)`}
              </h3>
              <p className="text-xs text-slate-300 mt-0.5 truncate">{property.name}</p>
            </div>

            {/* Payment Body */}
            <div className="p-5 space-y-4">
              {/* STEP 1: BOOKING INTENT TYPE SELECTOR */}
              <div className="space-y-2">
                <label className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider block">
                  1. Select Reservation Intent Type
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setReservationType('IMMEDIATE_VISIT')}
                    className={`p-3 rounded-2xl border text-left transition-all ${
                      reservationType === 'IMMEDIATE_VISIT'
                        ? 'bg-emerald-50/90 border-emerald-500 ring-1 ring-emerald-500 shadow-sm'
                        : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-extrabold text-slate-900 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-emerald-600" />
                        Immediate (&lt;7 Days)
                      </span>
                      <span className="text-xs font-black text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
                        ₹399
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-600 leading-snug">
                      Locks bed for <strong>72 Hours</strong>. Visit PG & verify 4-digit OTP → ₹399 credited into rent or 100% instant refund!
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setReservationType('ADVANCE_SESSION')}
                    className={`p-3 rounded-2xl border text-left transition-all ${
                      reservationType === 'ADVANCE_SESSION'
                        ? 'bg-indigo-50/90 border-indigo-500 ring-1 ring-indigo-500 shadow-sm'
                        : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-extrabold text-slate-900 flex items-center gap-1">
                        <CalendarClock className="w-3.5 h-3.5 text-indigo-600" />
                        Advance (15–45d)
                      </span>
                      <span className="text-xs font-black text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded-md">
                        ₹{advanceTokenINR} (15%)
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-600 leading-snug">
                      Holds bed for future semester move-in. Pay remaining 85% balance 48h before arrival.
                    </p>
                  </button>
                </div>
              </div>

              {/* ADVANCE BOOKING MOVE-IN DATE & TIERED POLICY */}
              {reservationType === 'ADVANCE_SESSION' && (
                <div className="bg-indigo-50/70 border border-indigo-200 rounded-2xl p-3.5 space-y-2.5 text-xs">
                  <div className="flex items-center justify-between gap-2">
                    <label className="font-extrabold text-indigo-950">
                      Scheduled Move-In Date (15–45 Days):
                    </label>
                    <input
                      type="date"
                      min={minAdvanceDate}
                      max={maxAdvanceDate}
                      value={agreedMoveInDate}
                      onChange={(e) => setAgreedMoveInDate(e.target.value)}
                      className="bg-white border border-indigo-300 rounded-lg px-2.5 py-1 text-xs font-bold text-indigo-950"
                    />
                  </div>
                  <div className="text-[10px] text-indigo-800 space-y-1 border-t border-indigo-200/70 pt-2">
                    <div className="font-bold flex items-center gap-1">
                      <Info className="w-3 h-3 text-indigo-600" />
                      Tiered Cancellation Protection (Indian Contract Act Compliant):
                    </div>
                    <div className="grid grid-cols-3 gap-1.5 text-center pt-0.5">
                      <div className="bg-white p-1.5 rounded-lg border border-indigo-100">
                        <span className="font-extrabold text-emerald-700 block">&gt;30 Days</span>
                        <span>85% Refund</span>
                      </div>
                      <div className="bg-white p-1.5 rounded-lg border border-indigo-100">
                        <span className="font-extrabold text-amber-700 block">15–30 Days</span>
                        <span>50% Refund</span>
                      </div>
                      <div className="bg-white p-1.5 rounded-lg border border-indigo-100">
                        <span className="font-extrabold text-rose-700 block">&lt;7 Days</span>
                        <span>0% (To Landlord)</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2: PAYMENT METHOD TABS */}
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setMethod('real_upi')}
                  className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition-all ${
                    method === 'real_upi'
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-500 shadow-sm ring-1 ring-emerald-500'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <Smartphone className="w-4 h-4 text-emerald-600" />
                  <span>Real UPI (QR)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setMethod('card')}
                  className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition-all ${
                    method === 'card'
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-500 shadow-sm ring-1 ring-emerald-500'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <CreditCard className="w-4 h-4 text-blue-600" />
                  <span>Card / NetBanking</span>
                </button>

                <button
                  type="button"
                  onClick={() => setMethod('demo')}
                  className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition-all ${
                    method === 'demo'
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-500 shadow-sm ring-1 ring-emerald-500'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span>Instant Demo</span>
                </button>
              </div>

              {/* REAL UPI QR & MOBILE INTENT */}
              {method === 'real_upi' && (
                <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200 text-center">
                  <div className="flex items-center justify-between text-xs text-slate-600 border-b border-slate-200 pb-2">
                    <span className="font-semibold">Escrow Payee Account:</span>
                    <span className="font-extrabold text-slate-900">{PAYEE_NAME}</span>
                  </div>

                  {/* QR Code Frame */}
                  <div className="bg-white p-2.5 rounded-2xl shadow-sm border border-slate-200 inline-block mx-auto">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={qrCodeUrl}
                      alt="UniNest Dynamic UPI QR Code"
                      className="w-36 h-36 mx-auto rounded-lg"
                    />
                    <div className="flex items-center justify-center gap-1.5 mt-1.5 text-[11px] font-bold text-slate-600">
                      <QrCode className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Scan with GPay, PhonePe, Paytm, or BHIM</span>
                    </div>
                  </div>

                  {/* Mobile Direct Tap Button */}
                  <a
                    href={upiIntentUri}
                    className="w-full py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm"
                  >
                    <span>Tap to Pay ₹{AMOUNT} on Mobile App</span>
                    <ExternalLink className="w-3.5 h-3.5 text-emerald-400" />
                  </a>

                  {/* Copy UPI ID */}
                  <div className="flex items-center justify-between bg-white px-3 py-2 rounded-xl border border-slate-200 text-xs">
                    <span className="font-mono text-slate-800 font-semibold text-[11px] truncate">
                      {UPI_ID}
                    </span>
                    <button
                      type="button"
                      onClick={handleCopyUPI}
                      className="text-emerald-700 hover:text-emerald-800 font-bold text-[11px] flex items-center gap-1 shrink-0 ml-2"
                    >
                      {copiedUpi ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* UTR Input */}
                  <div className="text-left space-y-1 pt-1">
                    <label className="text-[11px] font-bold text-slate-700 block">
                      12-Digit UPI Ref / UTR Number (Optional verification):
                    </label>
                    <input
                      type="text"
                      maxLength={12}
                      value={utrNumber}
                      onChange={(e) => setUtrNumber(e.target.value.replace(/[^0-9]/g, ''))}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono font-semibold text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none"
                      placeholder="e.g. 426819203810"
                    />
                  </div>
                </div>
              )}

              {/* CARD SIMULATION */}
              {method === 'card' && (
                <div className="space-y-2 bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Card Number</label>
                    <input
                      type="text"
                      readOnly
                      value="4532 •••• •••• 8892"
                      className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 font-medium text-slate-900 font-mono"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">Expiry</label>
                      <input
                        type="text"
                        readOnly
                        value="08 / 28"
                        className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 font-medium text-slate-900 font-mono"
                      />
                    </div>
                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">CVV</label>
                      <input
                        type="password"
                        readOnly
                        value="888"
                        className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 font-medium text-slate-900 font-mono"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* INSTANT DEMO */}
              {method === 'demo' && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-900">
                  ⚡ <strong>Instant Escrow Test Mode:</strong> Simulates instant token deposit into the UniNest Escrow Ledger without opening external banking apps.
                </div>
              )}

              {/* Amount Box */}
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3 flex justify-between items-center text-xs">
                <div>
                  <span className="font-bold text-emerald-950 block">
                    {reservationType === 'IMMEDIATE_VISIT'
                      ? '72-Hour Visit Commitment Token'
                      : '15% Advance Session Holding Token'}
                  </span>
                  <span className="text-[10px] text-emerald-700">
                    {reservationType === 'IMMEDIATE_VISIT'
                      ? '100% Refundable on Visit OTP or Emergency Waiver (2/sem)'
                      : 'Credited towards 1st Month Rent • Protected by Tiered Refund'}
                  </span>
                </div>
                <span className="text-lg font-black text-emerald-700">₹{AMOUNT}</span>
              </div>

              {/* Confirm / Pay Button */}
              <button
                type="button"
                disabled={isProcessing}
                onClick={handleConfirmPayment}
                className="w-full py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Locking Funds in UniNest Escrow...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-5 h-5" />
                    <span>
                      {method === 'real_upi'
                        ? `I have paid ₹${AMOUNT} → Lock Bed in Escrow`
                        : `Confirm ₹${AMOUNT} & Lock Bed Now`}
                    </span>
                  </>
                )}
              </button>
            </div>
          </>
        ) : (
          /* SUCCESS SCREEN */
          <div className="p-6 text-center space-y-4 animate-scale-up">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto border border-emerald-300 shadow-inner">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div>
              <span className="bg-emerald-100 text-emerald-800 font-extrabold text-xs px-3 py-1 rounded-full uppercase tracking-wider">
                ✓ Locked in UniNest Escrow Vault
              </span>
              <h3 className="text-2xl font-extrabold text-slate-900 mt-2">
                {txDetails?.reservationType === 'ADVANCE_SESSION'
                  ? 'Advance Bed Hold Confirmed!'
                  : '72-Hour Bed Hold Confirmed!'}
              </h3>
              <p className="text-xs text-slate-600 mt-1">
                {txDetails?.reservationType === 'ADVANCE_SESSION'
                  ? `Your bed is reserved until ${agreedMoveInDate}. Pay the remaining 85% balance 48h before move-in.`
                  : 'Your bed is locked as RESERVED for 72 hours. Visit the PG & enter the Landlord 4-Digit Visit OTP.'}
              </p>
            </div>

            {/* Receipt Box */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs text-left space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Escrow Reference</span>
                <span className="font-mono font-bold text-slate-900">{txDetails?.transactionId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Token Held in Escrow</span>
                <span className="font-bold text-emerald-700">
                  ₹{txDetails?.amountPaid} ({PAYEE_NAME})
                </span>
              </div>
              {txDetails?.visitOtp && (
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Stage 1 Visit OTP Status</span>
                  <span className="font-bold text-indigo-700">Ready at Landlord Reception</span>
                </div>
              )}
              <div className="pt-2 border-t border-slate-200">
                <span className="text-slate-500 font-medium block">Unlocked Property Address</span>
                <p className="font-bold text-slate-900 mt-0.5">{txDetails?.address}</p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleFinishSuccess}
              className="w-full py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 transition-all"
            >
              <span>Open Escrow Workspace & Visit Schedule</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
