'use client';

import React, { useState } from 'react';
import { Card, StatCard } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { formatINR } from '@/lib/utils';
import {
  TrendingUp,
  DollarSign,
  CheckCircle2,
  Clock,
  CreditCard,
  ArrowUpRight,
  ShieldCheck,
  FileText,
} from 'lucide-react';

interface SettlementRecord {
  id: string;
  jobCode: string;
  serviceTitle: string;
  customer: string;
  grossAmount: number; // paise
  platformCommission: number; // paise (15%)
  netPayout: number; // paise
  utrNo: string;
  date: string;
  status: 'SETTLED' | 'READY_FOR_PAYOUT';
}

const INITIAL_SETTLEMENTS: SettlementRecord[] = [
  {
    id: 'stl-1',
    jobCode: 'JOB-LDH-2026-101',
    serviceTitle: 'Bathroom Diverter & Tap Leakage Repair (Room 204)',
    customer: 'Rahul Sharma • PCTE Smart Student Residency',
    grossAmount: 50000,
    platformCommission: 7500,
    netPayout: 42500,
    utrNo: 'Pending Instant Settlement',
    date: '25 Sep 2026',
    status: 'READY_FOR_PAYOUT',
  },
  {
    id: 'stl-2',
    jobCode: 'JOB-LDH-2026-100',
    serviceTitle: 'Floor RO Water Purifier Filter & Membrane Change',
    customer: 'Gurpreet Kaur • Sarabha Link Girls Enclave',
    grossAmount: 120000,
    platformCommission: 18000,
    netPayout: 102000,
    utrNo: 'Pending Instant Settlement',
    date: '23 Sep 2026',
    status: 'READY_FOR_PAYOUT',
  },
  {
    id: 'stl-3',
    jobCode: 'JOB-LDH-2026-098',
    serviceTitle: 'Full PG Floor Deep Cleaning & Sanitization',
    customer: 'Vikram Singh • Passi Residency Properties',
    grossAmount: 250000,
    platformCommission: 37500,
    netPayout: 212500,
    utrNo: 'UTR426901829401',
    date: '19 Sep 2026',
    status: 'SETTLED',
  },
  {
    id: 'stl-4',
    jobCode: 'JOB-LDH-2026-095',
    serviceTitle: 'Split AC Gas Refill & Servicing (2 Units)',
    customer: 'Vikram Singh • PCTE Smart Student Residency',
    grossAmount: 160000,
    platformCommission: 24000,
    netPayout: 136000,
    utrNo: 'UTR426881092341',
    date: '14 Sep 2026',
    status: 'SETTLED',
  },
  {
    id: 'stl-5',
    jobCode: 'JOB-LDH-2026-091',
    serviceTitle: 'Room Lock Cylinder Replacement & Carpentry',
    customer: 'Aman Verma • Room 204 (Bed B)',
    grossAmount: 45000,
    platformCommission: 6750,
    netPayout: 38250,
    utrNo: 'UTR426850192837',
    date: '10 Sep 2026',
    status: 'SETTLED',
  },
];

export default function ProviderEarningsPage() {
  const [records, setRecords] = useState<SettlementRecord[]>(INITIAL_SETTLEMENTS);
  const [payoutSuccessMsg, setPayoutSuccessMsg] = useState<string | null>(null);

  const pendingAmount = records
    .filter((r) => r.status === 'READY_FOR_PAYOUT')
    .reduce((sum, r) => sum + r.netPayout, 0);

  const settledAmount =
    4120000 +
    records
      .filter((r) => r.status === 'SETTLED')
      .reduce((sum, r) => sum + r.netPayout, 0);

  const handleInstantPayout = () => {
    if (pendingAmount <= 0) return;
    const generatedUtr = `UTR${Math.floor(426910000000 + Math.random() * 89999999)}`;
    setRecords((prev) =>
      prev.map((r) =>
        r.status === 'READY_FOR_PAYOUT'
          ? { ...r, status: 'SETTLED', utrNo: generatedUtr }
          : r
      )
    );
    setPayoutSuccessMsg(
      `Instant UPI Settlement of ${formatINR(pendingAmount)} disbursed to quickfix.ldh@okhdfcbank (Bank Ref: ${generatedUtr}).`
    );
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">
            Vendor Earnings & UPI Settlement Ledger
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Track gross job billings, 15% UniNest marketplace commission, and T+1 Direct UPI settlements to QuickFix Services.
          </p>
        </div>

        <button
          type="button"
          disabled={pendingAmount <= 0}
          onClick={handleInstantPayout}
          className="py-3 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md flex items-center gap-2 transition-all disabled:opacity-50"
        >
          <ArrowUpRight className="w-4 h-4" />
          <span>
            {pendingAmount > 0
              ? `Settle ${formatINR(pendingAmount)} to UPI Now`
              : 'All Dues Settled'}
          </span>
        </button>
      </div>

      {payoutSuccessMsg && (
        <div className="bg-emerald-700 text-white text-xs font-bold p-4 rounded-2xl shadow-lg flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-300 shrink-0" />
          <span>{payoutSuccessMsg}</span>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Net Disbursed Earnings"
          value={formatINR(settledAmount)}
          subtitle="Settled via Direct UPI"
          icon={<DollarSign className="w-5 h-5" />}
          color="brand"
        />
        <StatCard
          title="Ready for Instant Payout"
          value={formatINR(pendingAmount)}
          subtitle="Completed SLA jobs"
          icon={<Clock className="w-5 h-5" />}
          color="amber"
        />
        <StatCard
          title="Platform Commission"
          value="15%"
          subtitle="Standard Verified Vendor Tier"
          icon={<TrendingUp className="w-5 h-5" />}
          color="blue"
        />
        <StatCard
          title="Linked UPI VPA"
          value="quickfix.ldh"
          subtitle="@okhdfcbank (Verified)"
          icon={<ShieldCheck className="w-5 h-5" />}
          color="purple"
        />
      </div>

      {/* Itemized Ledger Table */}
      <Card padding="none">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
            <FileText className="w-4 h-4 text-indigo-600" />
            <span>Job-Wise Settlement & Commission Breakdown</span>
          </h2>
          <span className="text-xs font-semibold text-slate-500">All amounts in INR</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-extrabold text-slate-500 uppercase">Job Code</th>
                <th className="px-4 py-3 text-left text-xs font-extrabold text-slate-500 uppercase">Service & Customer</th>
                <th className="px-4 py-3 text-right text-xs font-extrabold text-slate-500 uppercase">Gross Billed</th>
                <th className="px-4 py-3 text-right text-xs font-extrabold text-slate-500 uppercase">UniNest Fee (15%)</th>
                <th className="px-4 py-3 text-right text-xs font-extrabold text-slate-500 uppercase">Net Vendor Payout</th>
                <th className="px-4 py-3 text-left text-xs font-extrabold text-slate-500 uppercase">UTR / Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {records.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50/70">
                  <td className="px-4 py-3.5 font-mono text-xs font-bold text-indigo-600">
                    {r.jobCode}
                    <div className="text-[10px] text-slate-400 font-sans">{r.date}</div>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="font-bold text-slate-900 text-xs">{r.serviceTitle}</div>
                    <div className="text-[11px] text-slate-500">{r.customer}</div>
                  </td>
                  <td className="px-4 py-3.5 text-right font-semibold text-slate-700">
                    {formatINR(r.grossAmount)}
                  </td>
                  <td className="px-4 py-3.5 text-right text-xs font-semibold text-rose-600">
                    -{formatINR(r.platformCommission)}
                  </td>
                  <td className="px-4 py-3.5 text-right font-black text-emerald-700">
                    {formatINR(r.netPayout)}
                  </td>
                  <td className="px-4 py-3.5">
                    <Badge variant={r.status === 'SETTLED' ? 'success' : 'warning'} size="sm">
                      {r.status === 'SETTLED' ? `✓ ${r.utrNo}` : 'READY FOR PAYOUT'}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
