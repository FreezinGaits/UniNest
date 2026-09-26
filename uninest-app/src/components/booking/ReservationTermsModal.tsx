'use client';

import React from 'react';
import Link from 'next/link';
import { X, FileText, CheckCircle, Scale, ExternalLink } from 'lucide-react';

interface ReservationTermsModalProps {
  isOpen: boolean;
  onClose: () => void;
  propertyName?: string;
  reservationFee?: number;
}

export function ReservationTermsModal({
  isOpen,
  onClose,
  propertyName = 'UniNest Verified Residency',
  reservationFee = 399,
}: ReservationTermsModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-100 space-y-0 max-h-[85vh] flex flex-col">
        {/* Modal Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <Scale className="w-5 h-5 text-emerald-400" />
            <h3 className="font-extrabold text-base">
              UniNest Escrow & Two-Stage OTP Master Terms
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Terms Content */}
        <div className="p-6 space-y-4 overflow-y-auto text-xs text-slate-700 leading-relaxed">
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-emerald-900 font-medium">
            <strong>Statutory Protection (Indian Contract Act, 1872):</strong> Your token payment is held in the{' '}
            <strong>UniNest Escrow Vault</strong> (`anupamrai172@oksbi`) and is never released to the landlord without cryptographic OTP verification.
          </div>

          <div className="space-y-3.5">
            <div>
              <h4 className="font-extrabold text-slate-900 text-sm mb-1 flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                1. Stage 1: ₹{reservationFee} Visit Token & 72-Hour Lock
              </h4>
              <p>
                Locks your selected bed at <strong>{propertyName}</strong> as <code>RESERVED</code> for 72 hours and unlocks exact street coordinates. When you physically visit the PG, the Landlord generates a <strong>4-Digit Visit OTP</strong>.
              </p>
              <ul className="list-disc pl-5 mt-1 space-y-1 text-slate-600">
                <li>
                  <strong>If You Accept the Room:</strong> 100% of the ₹{reservationFee} token is credited towards your 1st month&apos;s rent.
                </li>
                <li>
                  <strong>If You Reject the Room:</strong> 100% instant UPI refund of ₹{reservationFee} (up to 3 free rejected-visit refunds per semester).
                </li>
                <li>
                  <strong>Emergency Waiver:</strong> 100% refund within 2 hours for medical or family emergencies prior to visiting (up to 2 waivers per semester).
                </li>
                <li>
                  <strong>72-Hour No-Show:</strong> If 72 hours elapse with no visit or waiver, ₹200 is paid to the Landlord&apos;s Vacancy Fund and ₹199 to UniNest Operations.
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-extrabold text-slate-900 text-sm mb-1 flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                2. Advance Semester Bookings (15–45 Days Ahead)
              </h4>
              <p>
                Requires a <strong>15% Advance Holding Token</strong> (e.g., ₹900 on ₹6,000 rent), with the 85% balance payable 48 hours before move-in. Tiered Cancellation Schedule:
              </p>
              <ul className="list-disc pl-5 mt-1 space-y-0.5 text-slate-600">
                <li><strong>&gt;30 Days before Move-In:</strong> 85% Refund to Student (15% platform buffer).</li>
                <li><strong>15–30 Days before Move-In:</strong> 50% Refund to Student / 50% to Landlord.</li>
                <li><strong>&lt;7 Days before Move-In:</strong> 0% Refund (100% of token to Landlord).</li>
              </ul>
            </div>

            <div>
              <h4 className="font-extrabold text-slate-900 text-sm mb-1 flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                3. Stage 2: Move-In Key, 7-Day Grace & Discrepancy Freeze
              </h4>
              <p>
                Your 1st month&apos;s rent is held in Escrow until you physically move in, sign the <strong>11-Month Tripartite Leave & License Agreement</strong>, and share your <strong>6-Digit Move-In Key</strong> with the Landlord.
              </p>
              <ul className="list-disc pl-5 mt-1 space-y-0.5 text-slate-600">
                <li>
                  <strong>Declared Late Arrival:</strong> ₹0 deduction if you declare a 1–7 day travel/medical delay in the app.
                </li>
                <li>
                  <strong>Day 7 Unreachable Tenant Settlement:</strong> If unreachable for 7 full days post move-in, Landlord receives 14 Days Pro-Rata (₹2,800) and Student is refunded the remaining 16 Days (₹3,200).
                </li>
                <li>
                  <strong>100% Misrepresentation Refund:</strong> If room condition/AC/hygiene does not match verified listing photos on Move-In Day, Escrow freezes 100% of funds and refunds you in full.
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 shrink-0 flex items-center justify-between">
          <Link
            href="/legal?doc=escrow"
            target="_blank"
            className="text-xs font-extrabold text-indigo-700 hover:underline inline-flex items-center gap-1"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Open Full Legal & Statutory Center</span>
            <ExternalLink className="w-3 h-3" />
          </Link>
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition-colors"
          >
            I Agree & Understand
          </button>
        </div>
      </div>
    </div>
  );
}
