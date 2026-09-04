'use me';
'use client';

import React, { useState } from 'react';
import { CreditCard, Smartphone, CheckCircle2, ShieldCheck, Lock, X, ArrowRight, Loader2, Sparkles } from 'lucide-react';

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
  const [method, setMethod] = useState<'upi' | 'card' | 'demo'>('upi');
  const [upiId, setUpiId] = useState('rahul@upi');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [txDetails, setTxDetails] = useState<{ transactionId: string; address: string; landlordPhone: string } | null>(null);

  if (!isOpen) return null;

  const handlePay = async () => {
    setIsProcessing(true);
    try {
      const res = await fetch('/api/demo/reservation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          propertyId: property.id,
          roomId,
          bedId,
        }),
      });

      const data = await res.json();
      setIsProcessing(false);

      if (data.success) {
        setIsSuccess(true);
        const details = {
          transactionId: data.transactionId || 'UNR-DEMO-2026-00452',
          address: data.propertyAddress || 'Plot 42, Green Avenue, Ferozepur Rd, Ludhiana - 141001',
          landlordPhone: data.landlordPhone || '+91 9898989801',
        };
        setTxDetails(details);
      } else {
        alert(data.error || 'Payment failed');
      }
    } catch (err) {
      setIsProcessing(false);
      alert('Payment server error');
    }
  };

  const handleFinishSuccess = () => {
    if (txDetails) {
      onSuccess(txDetails);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-100 space-y-0">
        {!isSuccess ? (
          <>
            {/* Payment Header */}
            <div className="bg-slate-900 text-white p-5 relative">
              <button
                onClick={onClose}
                className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-950/60 px-2.5 py-0.5 rounded-full border border-emerald-800/40 mb-1">
                <Lock className="w-3 h-3" />
                256-Bit Escrow Encrypted
              </div>
              <h3 className="text-lg font-extrabold">Complete ₹399 Reservation Fee</h3>
              <p className="text-xs text-slate-400">Property: {property.name}</p>
            </div>

            {/* Payment Body */}
            <div className="p-5 space-y-4">
              {/* Method Selector */}
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setMethod('upi')}
                  className={`p-3 rounded-xl border text-xs font-bold flex flex-col items-center gap-1.5 transition-all ${
                    method === 'upi'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-500 shadow-sm'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <Smartphone className="w-5 h-5 text-emerald-600" />
                  <span>UPI Payment</span>
                </button>

                <button
                  type="button"
                  onClick={() => setMethod('card')}
                  className={`p-3 rounded-xl border text-xs font-bold flex flex-col items-center gap-1.5 transition-all ${
                    method === 'card'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-500 shadow-sm'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <CreditCard className="w-5 h-5 text-blue-600" />
                  <span>Debit / Card</span>
                </button>

                <button
                  type="button"
                  onClick={() => setMethod('demo')}
                  className={`p-3 rounded-xl border text-xs font-bold flex flex-col items-center gap-1.5 transition-all ${
                    method === 'demo'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-500 shadow-sm'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <Sparkles className="w-5 h-5 text-amber-500" />
                  <span>One-Click Demo</span>
                </button>
              </div>

              {/* Method Inputs */}
              {method === 'upi' && (
                <div className="space-y-1.5 bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <label className="text-xs font-semibold text-slate-700 block">Enter UPI ID</label>
                  <input
                    type="text"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs font-medium text-slate-900 focus:border-emerald-500 focus:outline-none"
                    placeholder="username@upi"
                  />
                  <div className="flex gap-2 pt-1 text-[11px] text-slate-500">
                    <span className="bg-white px-2 py-0.5 rounded border border-slate-200">Google Pay</span>
                    <span className="bg-white px-2 py-0.5 rounded border border-slate-200">PhonePe</span>
                    <span className="bg-white px-2 py-0.5 rounded border border-slate-200">Paytm</span>
                  </div>
                </div>
              )}

              {method === 'card' && (
                <div className="space-y-2 bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Card Number</label>
                    <input
                      type="text"
                      readOnly
                      value="4532 •••• •••• 8892"
                      className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 font-medium text-slate-900"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">Expiry</label>
                      <input
                        type="text"
                        readOnly
                        value="08 / 28"
                        className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 font-medium text-slate-900"
                      />
                    </div>
                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">CVV</label>
                      <input
                        type="password"
                        readOnly
                        value="888"
                        className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 font-medium text-slate-900"
                      />
                    </div>
                  </div>
                </div>
              )}

              {method === 'demo' && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-900">
                  ⚡ <strong>Simulated Demo Payment:</strong> Automatically simulates a successful ₹399 payment without charging real funds.
                </div>
              )}

              {/* Amount Box */}
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex justify-between items-center text-xs">
                <span className="font-semibold text-emerald-900">Total Payable Now</span>
                <span className="text-base font-extrabold text-emerald-700">₹399.00</span>
              </div>

              {/* Pay Button */}
              <button
                type="button"
                disabled={isProcessing}
                onClick={handlePay}
                className="w-full py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Processing Demo Escrow...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-5 h-5" />
                    <span>Pay ₹399 Demo Payment</span>
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
                ✓ Reservation Successful
              </span>
              <h3 className="text-2xl font-extrabold text-slate-900 mt-2">Bed Hold Confirmed!</h3>
              <p className="text-xs text-slate-600 mt-1">
                Your bed is reserved for 72 hours. Exact address and visit scheduling are now unlocked.
              </p>
            </div>

            {/* Receipt Box */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs text-left space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Reservation ID</span>
                <span className="font-bold text-slate-900">{txDetails?.transactionId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Amount Paid</span>
                <span className="font-bold text-emerald-700">₹399.00 (Escrow Held)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Status</span>
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
