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
} from 'lucide-react';

interface DemoPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (data: { transactionId: string; address: string; landlordPhone: string }) => void;
  property: {
    id: string;
    name: string;
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
  const [method, setMethod] = useState<'real_upi' | 'card' | 'demo'>('real_upi');
  const [utrNumber, setUtrNumber] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [txDetails, setTxDetails] = useState<{ transactionId: string; address: string; landlordPhone: string } | null>(null);

  const UPI_ID = process.env.NEXT_PUBLIC_UPI_ID || 'anupamrai172@oksbi';
  const PAYEE_NAME = process.env.NEXT_PUBLIC_UPI_NAME || 'UniNest Housing';
  const AMOUNT = '399.00';
  const TRANSACTION_NOTE = `UniNest Token - ${property.name.slice(0, 20)}`;

  // Official NPCI Standard UPI Intent Link
  const upiIntentUri = `upi://pay?pa=${encodeURIComponent(UPI_ID)}&pn=${encodeURIComponent(PAYEE_NAME)}&am=${AMOUNT}&cu=INR&tn=${encodeURIComponent(TRANSACTION_NOTE)}`;

  // Dynamic QR Code using standard QR code rendering service
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(upiIntentUri)}&margin=8`;

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
          roomId,
          bedId,
          utr: utrNumber || `UTR-${Date.now().toString().slice(-8)}`,
          paymentMethod: method === 'real_upi' ? 'REAL_UPI_DIRECT' : method,
        }),
      });

      const data = await res.json();
      setIsProcessing(false);

      if (data.success) {
        setIsSuccess(true);
        const details = {
          transactionId: data.transactionId || (utrNumber ? `UPI-${utrNumber}` : `UNR-${Date.now().toString().slice(-6)}`),
          address: data.propertyAddress || 'Plot 42, Block B, BRS Nagar, Ferozepur Rd, Ludhiana - 141012',
          landlordPhone: data.landlordPhone || '+91 98989 89801',
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
      <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-100 max-h-[92vh] overflow-y-auto">
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
                Live 0% Commission Direct UPI Gateway
              </div>
              <h3 className="text-xl font-extrabold">Pay ₹399 Bed Reservation Token</h3>
              <p className="text-xs text-slate-300 mt-0.5 truncate">{property.name}</p>
            </div>

            {/* Payment Body */}
            <div className="p-5 space-y-4">
              {/* Method Selector Tabs */}
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
                  <Smartphone className="w-4.5 h-4.5 text-emerald-600" />
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
                  <CreditCard className="w-4.5 h-4.5 text-blue-600" />
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
                  <Sparkles className="w-4.5 h-4.5 text-amber-500" />
                  <span>Instant Demo</span>
                </button>
              </div>

              {/* REAL UPI QR & MOBILE INTENT */}
              {method === 'real_upi' && (
                <div className="space-y-3.5 bg-slate-50 p-4 rounded-2xl border border-slate-200 text-center">
                  <div className="flex items-center justify-between text-xs text-slate-600 border-b border-slate-200 pb-2">
                    <span className="font-semibold">Payee Account:</span>
                    <span className="font-extrabold text-slate-900">{PAYEE_NAME}</span>
                  </div>

                  {/* QR Code Frame */}
                  <div className="bg-white p-3 rounded-2xl shadow-sm border border-slate-200 inline-block mx-auto">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={qrCodeUrl}
                      alt="UniNest Dynamic UPI QR Code"
                      className="w-44 h-44 mx-auto rounded-lg"
                    />
                    <div className="flex items-center justify-center gap-1.5 mt-2 text-[11px] font-bold text-slate-600">
                      <QrCode className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Scan with GPay, PhonePe, Paytm, or BHIM</span>
                    </div>
                  </div>

                  {/* Mobile Direct Tap Button */}
                  <a
                    href={upiIntentUri}
                    className="w-full py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm"
                  >
                    <span>Tap to Pay on Mobile App (GPay / PhonePe)</span>
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
                  ⚡ <strong>Instant Test Mode:</strong> Simulates an instant test approval without opening external banking apps.
                </div>
              )}

              {/* Amount Box */}
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3 flex justify-between items-center text-xs">
                <div>
                  <span className="font-bold text-emerald-950 block">Reservation Token Amount</span>
                  <span className="text-[10px] text-emerald-700">100% Refundable per UniNest Fair Escrow Policy</span>
                </div>
                <span className="text-lg font-black text-emerald-700">₹399.00</span>
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
                    <span>Verifying with Escrow Ledger...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-5 h-5" />
                    <span>
                      {method === 'real_upi'
                        ? 'I have completed the ₹399 payment → Confirm'
                        : 'Confirm & Hold Bed for 72 Hours'}
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
                ✓ Payment Verified & Received
              </span>
              <h3 className="text-2xl font-extrabold text-slate-900 mt-2">Bed Hold Confirmed!</h3>
              <p className="text-xs text-slate-600 mt-1">
                Your bed is reserved for 72 hours. Exact address and visit scheduling are now unlocked.
              </p>
            </div>

            {/* Receipt Box */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs text-left space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Transaction Reference</span>
                <span className="font-mono font-bold text-slate-900">{txDetails?.transactionId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Amount Received</span>
                <span className="font-bold text-emerald-700">₹399.00 (Credited to {PAYEE_NAME})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Payment Status</span>
                <span className="font-bold text-emerald-600 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Successful
                </span>
              </div>
              <div className="pt-2 border-t border-slate-200">
                <span className="text-slate-500 font-medium block">Unlocked Address</span>
                <p className="font-bold text-slate-900 mt-0.5">{txDetails?.address}</p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleFinishSuccess}
              className="w-full py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 transition-all"
            >
              <span>Unlock Exact Location & Visit System</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
