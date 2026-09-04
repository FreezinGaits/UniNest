'use me';
'use client';

import React from 'react';
import { X, ShieldCheck, HelpCircle, FileText, CheckCircle } from 'lucide-react';

interface ReservationTermsModalProps {
  isOpen: boolean;
  onClose: () => void;
  propertyName?: string;
  reservationFee?: number;
}

export function ReservationTermsModal({
  isOpen,
  onClose,
  propertyName = 'CampusNest Residency',
  reservationFee = 399,
}: ReservationTermsModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-100 space-y-0 max-h-[85vh] flex flex-col">
        {/* Modal Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-emerald-400" />
            <h3 className="font-extrabold text-base">UniNest Reservation & Privacy Policy</h3>
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
            <strong>Key Guarantee:</strong> The ₹{reservationFee} fee reserves your chosen bed exclusively for 72 hours and instantly unlocks full landlord communication and exact property coordinates.
          </div>

          <div className="space-y-3">
            <div>
              <h4 className="font-extrabold text-slate-900 text-sm mb-1 flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                1. Reservation Purpose & Fee Policy
              </h4>
              <p>
                The ₹{reservationFee} token fee is an official reservation hold payment processed via UniNest Escrow Services. It prevents the landlord from renting the bed to another student while you complete your physical/virtual visit.
              </p>
            </div>

            <div>
              <h4 className="font-extrabold text-slate-900 text-sm mb-1 flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                2. Exact Address & Contact Reveal Timeline
              </h4>
              <p>
                Prior to reservation, property coordinates are protected to preserve landlord privacy and prevent off-platform spam. Immediately upon payment completion:
              </p>
              <ul className="list-disc pl-5 mt-1 space-y-0.5 text-slate-600">
                <li>Exact street address and house/flat number will be revealed.</li>
                <li>In-app visit scheduling calendar will open.</li>
                <li>UniNest controlled landlord messenger will activate.</li>
              </ul>
            </div>

            <div>
              <h4 className="font-extrabold text-slate-900 text-sm mb-1 flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                3. Refund & Cancellation Rules
              </h4>
              <p>
                - <strong>100% Refundable</strong> if you visit the property and find that the room amenities or condition do not match the verified UniNest listing.
              </p>
              <p className="mt-1">
                - <strong>Full Adjustment</strong>: The ₹{reservationFee} reservation fee is 100% credited towards your first month’s rent upon signing the digital lease agreement.
              </p>
            </div>

            <div>
              <h4 className="font-extrabold text-slate-900 text-sm mb-1 flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                4. Communication Guidelines
              </h4>
              <p>
                All initial pre-visit communication must be conducted via the UniNest Controlled Messaging interface. Personal phone numbers or off-platform direct payments are restricted to ensure full legal protection under UniNest Safety Guarantee.
              </p>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 shrink-0 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition-colors"
          >
            I Understand
          </button>
        </div>
      </div>
    </div>
  );
}
