'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Lock,
  AlertCircle,
  FileText,
  X,
  ArrowRight,
  Zap,
  Building2,
  Scale,
} from 'lucide-react';
import { formatINR } from '@/lib/utils';

interface ReservationConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmPayment: () => void;
  onOpenTerms: () => void;
  property: {
    id: string;
    name: string;
    locality?: string;
    city: string;
    address?: string;
  };
  room?: {
    roomNumber: string;
    rent: number;
    deposit: number;
  };
  bedLabel?: string;
}

export function ReservationConfirmationModal({
  isOpen,
  onClose,
  onConfirmPayment,
  onOpenTerms,
  property,
  room,
  bedLabel = 'A',
}: ReservationConfirmationModalProps) {
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [acceptedEscrowLaw, setAcceptedEscrowLaw] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const rentVal = room ? room.rent / 100 : 6000;
  const depositVal = room ? room.deposit / 100 : 10000;
  const roomNum = room ? room.roomNumber : '204';

  const handleContinue = () => {
    if (!acceptedTerms || !acceptedEscrowLaw) {
      setErrorMsg(
        'Please accept both the Reservation Terms and the Statutory Escrow Agreement before proceeding.'
      );
      return;
    }
    setErrorMsg('');
    onConfirmPayment();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-100 space-y-0">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-800 to-teal-900 p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 text-emerald-200 hover:text-white bg-emerald-900/40 p-1.5 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="inline-flex items-center gap-1.5 bg-emerald-500/25 border border-emerald-400/40 px-3 py-1 rounded-full text-xs font-bold text-emerald-100 mb-2">
            <Lock className="w-3.5 h-3.5" />
            UniNest Algorithmic Escrow Protection
          </div>
          <h2 className="text-xl md:text-2xl font-extrabold">Confirm Your Bed Reservation</h2>
          <p className="text-xs text-emerald-100/90 mt-1">
            Lock this bed exclusively via UniNest Escrow & unlock exact coordinates and landlord visit scheduling.
          </p>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          {/* Reservation Breakdown Card */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200/80 pb-3">
              <div>
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  Verified Property
                </span>
                <h4 className="text-base font-extrabold text-slate-900 flex items-center gap-1.5 mt-0.5">
                  <Building2 className="w-4 h-4 text-emerald-600" />
                  {property.name}
                </h4>
                <p className="text-xs text-slate-600">
                  Locality: {property.locality || 'Ferozepur Road'}, {property.city}
                </p>
              </div>
              <div className="bg-emerald-100 text-emerald-800 font-bold px-3 py-1 rounded-lg text-xs border border-emerald-200 shrink-0">
                Room {roomNum} • Bed {bedLabel}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-1 text-center text-xs">
              <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                <span className="text-slate-500 block text-[11px]">Monthly Rent</span>
                <span className="font-bold text-slate-900 text-sm">{formatINR(rentVal * 100)}</span>
              </div>
              <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                <span className="text-slate-500 block text-[11px]">Deposit</span>
                <span className="font-bold text-slate-900 text-sm">{formatINR(depositVal * 100)}</span>
              </div>
              <div className="bg-emerald-50 p-2.5 rounded-xl border border-emerald-200">
                <span className="text-emerald-700 block font-semibold text-[11px]">Visit Hold Token</span>
                <span className="font-extrabold text-emerald-700 text-sm">₹399</span>
              </div>
            </div>
          </div>

          {/* What Unlocks Banner */}
          <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-3.5 space-y-2">
            <div className="text-xs font-extrabold text-emerald-900 flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-emerald-600" />
              Escrow Protections Activated Upon Reservation:
            </div>
            <ul className="text-xs text-slate-700 space-y-1 pl-5 list-disc font-medium">
              <li>
                <strong>Exact Property Address & Pinpoint Directions</strong> (Street & House #)
              </li>
              <li>
                <strong>Stage 1 Physical Visit OTP Handshake</strong> (100% rent credit if you love it, or 100% instant UPI refund if rejected)
              </li>
              <li>
                <strong>72-Hour Exclusive Bed Lock</strong> (Or 15–45 Day Advance Semester Hold)
              </li>
              <li>
                <strong>1-Click Emergency Waiver Protection</strong> (Medical / Family Emergencies)
              </li>
            </ul>
          </div>

          {/* Legal Consent Checkboxes */}
          <div className="space-y-2.5 pt-1">
            <div className="flex items-start gap-2.5">
              <input
                type="checkbox"
                id="acceptTerms"
                checked={acceptedTerms}
                onChange={(e) => {
                  setAcceptedTerms(e.target.checked);
                  if (e.target.checked && acceptedEscrowLaw) setErrorMsg('');
                }}
                className="mt-1 w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300 cursor-pointer"
              />
              <label htmlFor="acceptTerms" className="text-xs text-slate-700 leading-snug cursor-pointer">
                I have read and agree to the <strong>72-Hour Visit OTP Handshake Terms</strong>, 3-Visit Fair-Use Quota, and 72-Hour No-Show Split (₹200 Landlord / ₹199 Platform).{' '}
                <button
                  type="button"
                  onClick={onOpenTerms}
                  className="text-emerald-700 underline font-bold hover:text-emerald-900 inline-flex items-center gap-0.5"
                >
                  <FileText className="w-3 h-3" />
                  Read Summary Clauses
                </button>
              </label>
            </div>

            <div className="flex items-start gap-2.5">
              <input
                type="checkbox"
                id="acceptEscrowLaw"
                checked={acceptedEscrowLaw}
                onChange={(e) => {
                  setAcceptedEscrowLaw(e.target.checked);
                  if (e.target.checked && acceptedTerms) setErrorMsg('');
                }}
                className="mt-1 w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300 cursor-pointer"
              />
              <label htmlFor="acceptEscrowLaw" className="text-xs text-slate-700 leading-snug cursor-pointer">
                I appoint <strong>UniNest Housing</strong> as Escrow Custodian under the Indian Contract Act, 1872 and consent to the{' '}
                <Link
                  href="/legal?doc=escrow"
                  target="_blank"
                  className="text-indigo-700 underline font-bold hover:text-indigo-900 inline-flex items-center gap-0.5"
                >
                  <Scale className="w-3 h-3" />
                  Master Escrow & DPDP Act 2023 Legal Policy
                </Link>
                .
              </label>
            </div>

            {errorMsg && (
              <div className="text-xs font-semibold text-rose-600 bg-rose-50 border border-rose-200 p-2.5 rounded-lg flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {errorMsg}
              </div>
            )}
          </div>

          {/* Buttons */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="w-1/3 py-3 px-4 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleContinue}
              className="w-2/3 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 transition-all"
            >
              <span>Proceed to Secure UPI Escrow Payment</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
