'use client';

import React, { useState } from 'react';
import {
  Zap, CreditCard, CheckCircle2, Clock, Users, ArrowUpRight,
  ShieldCheck, AlertCircle, FileText, Check, Sparkles
} from 'lucide-react';
import { Card, Badge, Button } from '@/components/ui/Shared';

export default function ElectricityDuesPage() {
  const [paid, setPaid] = useState(false);
  const [paying, setPaying] = useState(false);

  const currentBill = {
    month: 'Sep 2026',
    dueDate: '10 Oct 2026',
    meterNo: 'SUB-MTR-204',
    prevReading: 1245,
    currReading: 1312,
    totalUnits: 67,
    ratePerUnit: 9.50,
    totalAmount: 636.50, // ₹636.50
    studentShare: 318.25,  // 50% split with roommate
    roommateShare: 318.25,
    roommateName: 'Aman Verma',
    roommateStatus: 'PAID', // Aman already paid his half
    property: 'PCTE Smart Student Residency',
    roomAssignment: 'Room 204, Bed B'
  };

  const history = [
    { month: 'Aug 2026', units: 67, prevReading: 1178, currReading: 1245, totalBill: 636.50, share: 318.25, status: 'PAID', datePaid: '08 Sep 2026' },
    { month: 'Jul 2026', units: 73, prevReading: 1105, currReading: 1178, totalBill: 693.50, share: 346.75, status: 'PAID', datePaid: '05 Aug 2026' },
  ];

  const handlePayBill = () => {
    setPaying(true);
    setTimeout(() => {
      setPaying(false);
      setPaid(true);
    }, 1200);
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Electricity Dues & Sub-Meter Split</h1>
          <p className="text-xs text-slate-500 mt-0.5">Automated sub-meter consumption calculations & 50/50 roommate split ledger.</p>
        </div>
        <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-xl shrink-0">
          <Zap className="w-6 h-6 text-amber-600" />
        </div>
      </div>

      {/* Active Month Bill Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Current Bill Period</span>
              <Badge variant="warning" size="sm">{currentBill.month}</Badge>
            </div>
            <h2 className="text-2xl font-extrabold text-slate-900 mt-1">
              ₹{currentBill.studentShare.toLocaleString()} <span className="text-xs font-normal text-slate-500">(Your 50% Share)</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Total Room Bill: ₹{currentBill.totalAmount.toLocaleString()} • Due Date: <strong className="text-slate-900">{currentBill.dueDate}</strong>
            </p>
          </div>

          <div>
            {paid ? (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 font-extrabold text-xs px-4 py-2.5 rounded-xl flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Electricity Bill Paid!
              </div>
            ) : (
              <Button
                onClick={handlePayBill}
                disabled={paying}
                className="bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs py-2.5 px-5 rounded-xl shadow-md flex items-center gap-2"
              >
                <CreditCard className="w-4 h-4" />
                {paying ? 'Processing UPI Payment...' : `Pay My Share (₹${currentBill.studentShare})`}
              </Button>
            )}
          </div>
        </div>

        {/* Sub-Meter Technical Breakdown Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1">
            <span className="text-[11px] font-semibold text-slate-500 block">Sub-Meter Number</span>
            <span className="text-sm font-extrabold text-slate-900 font-mono block">{currentBill.meterNo}</span>
            <span className="text-[11px] text-slate-500 block pt-1">{currentBill.property} - {currentBill.roomAssignment}</span>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1">
            <span className="text-[11px] font-semibold text-slate-500 block">Units Consumed</span>
            <span className="text-sm font-extrabold text-amber-700 block">{currentBill.totalUnits} kWh</span>
            <span className="text-[11px] text-slate-500 block pt-1">
              Readings: {currentBill.prevReading} → {currentBill.currReading}
            </span>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1">
            <span className="text-[11px] font-semibold text-slate-500 block">Tariff Rate</span>
            <span className="text-sm font-extrabold text-slate-900 block">₹{currentBill.ratePerUnit.toFixed(2)} / Unit</span>
            <span className="text-[11px] text-slate-500 block pt-1">PSPCL State Tariff</span>
          </div>

        </div>

        {/* 50/50 Roommate Split Status */}
        <div className="bg-amber-50/60 border border-amber-200 p-4 rounded-xl space-y-3">
          <h3 className="text-xs font-extrabold text-amber-900 flex items-center gap-2">
            <Users className="w-4 h-4 text-amber-600" />
            50/50 Double Sharing Roommate Split Status
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="bg-white p-3 rounded-lg border border-amber-200 flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-900 block">Rahul Sharma (You)</span>
                <span className="text-slate-500 text-[11px]">Share: ₹{currentBill.studentShare}</span>
              </div>
              <Badge variant={paid ? 'success' : 'warning'} size="sm">
                {paid ? 'PAID' : 'PENDING'}
              </Badge>
            </div>

            <div className="bg-white p-3 rounded-lg border border-amber-200 flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-900 block">{currentBill.roommateName} (Roommate)</span>
                <span className="text-slate-500 text-[11px]">Share: ₹{currentBill.roommateShare}</span>
              </div>
              <Badge variant="success" size="sm">PAID (UPI)</Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Billing History Table */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
        <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
          <FileText className="w-4 h-4 text-emerald-600" />
          Past Electricity Payment History
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase">
              <tr>
                <th className="px-4 py-3 text-left">Bill Month</th>
                <th className="px-4 py-3 text-left">Consumption</th>
                <th className="px-4 py-3 text-left">Total Room Bill</th>
                <th className="px-4 py-3 text-left">Your Share</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Payment Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {history.map((h, i) => (
                <tr key={i} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-bold text-slate-900">{h.month}</td>
                  <td className="px-4 py-3">
                    {h.units} kWh
                    <span className="block text-[10px] text-slate-400">({h.prevReading} → {h.currReading})</span>
                  </td>
                  <td className="px-4 py-3 font-semibold">₹{h.totalBill.toLocaleString()}</td>
                  <td className="px-4 py-3 font-bold text-emerald-700">₹{h.share.toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <Badge variant="success" size="sm">{h.status}</Badge>
                  </td>
                  <td className="px-4 py-3 text-slate-500">{h.datePaid}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
