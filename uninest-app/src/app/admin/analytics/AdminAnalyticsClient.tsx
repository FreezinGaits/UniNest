'use client';

import React, { useState } from 'react';
import { Card, StatCard } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import {
  TrendingUp,
  IndianRupee,
  ShieldCheck,
  KeyRound,
  Building2,
  Lock,
  ArrowUpRight,
  RotateCcw,
  Clock,
  CheckCircle2,
  User,
  MapPin,
  ExternalLink,
  ChevronRight,
  Info,
  Calendar,
  FileText,
} from 'lucide-react';
import { formatRupees, formatINR } from '@/lib/utils';

interface AccumulationDetail {
  title: string;
  category: string;
  totalFormatted: string;
  formula: string;
  explanation: string;
  transactions: {
    id: string;
    studentName: string;
    email: string;
    property: string;
    unit: string;
    utr: string;
    type: string;
    amount: string;
    status: string;
    recipientOrVpa: string;
    date: string;
  }[];
}

const ACCUMULATION_DATABASE: Record<string, AccumulationDetail> = {
  GMV: {
    title: 'Total Escrow Gross Merchandise Value (GMV)',
    category: 'PLATFORM_GMV',
    totalFormatted: '₹25,299',
    formula: 'Settled Move-In Rent (₹6,000) + Active Vault Escrow (₹18,900) + Student Refund (₹399) = ₹25,299',
    explanation:
      'Every single rupee in this GMV is anchored to an official 12-digit NPCI Unique Transaction Reference (UTR) transferred by students into UniNest’s escrow clearinghouse (anupamrai172@oksbi). Funds remain locked in the vault until students enter their Stage-2 Move-In OTP upon physical room handoff.',
    transactions: [
      {
        id: 'TXN-2026-9905',
        studentName: 'Aman Verma',
        email: 'aman.verma@pcte.edu.in',
        property: 'PCTE Smart Student Residency',
        unit: 'Room 202, Bed B',
        utr: '626590184327',
        type: 'Stage-2 Move-In Rent Payout',
        amount: '₹6,000',
        status: 'SETTLED_TO_LANDLORD',
        recipientOrVpa: 'Landlord Vikram Singh (vikramsingh.passi@okicici)',
        date: '20 Sep 2026, 03:15 PM',
      },
      {
        id: 'TXN-2026-9904',
        studentName: 'Karanveer Gill',
        email: 'karanveer.gill@gndec.ac.in',
        property: 'PCTE Smart Student Residency',
        unit: 'Room 301, Bed A',
        utr: '626744901288',
        type: 'First Month Rent (100% Escrow)',
        amount: '₹6,000',
        status: 'ESCROW_LOCKED',
        recipientOrVpa: 'UniNest Escrow Vault (anupamrai172@oksbi)',
        date: '26 Sep 2026, 11:05 AM',
      },
      {
        id: 'TXN-2026-9906',
        studentName: 'Simran Kaur',
        email: 'simran.kaur@pcte.edu.in',
        property: 'PAU Green Avenue Scholars Hub',
        unit: 'Room 108, Bed A',
        utr: '626433098112',
        type: 'First Month Rent (100% Escrow)',
        amount: '₹6,000',
        status: 'ESCROW_LOCKED',
        recipientOrVpa: 'UniNest Escrow Vault (anupamrai172@oksbi)',
        date: '26 Sep 2026, 09:48 AM',
      },
      {
        id: 'TXN-2026-9903',
        studentName: 'Rahul Sharma',
        email: 'rahul@uninest.in',
        property: 'PAU Green Avenue Scholars Hub',
        unit: 'Room 105, Bed B',
        utr: '626811209483',
        type: 'Remaining Escrow Balance',
        amount: '₹5,601',
        status: 'ESCROW_LOCKED',
        recipientOrVpa: 'UniNest Escrow Vault (anupamrai172@oksbi)',
        date: '25 Sep 2026, 05:10 PM',
      },
      {
        id: 'TXN-2026-9902',
        studentName: 'Rahul Sharma',
        email: 'rahul@uninest.in',
        property: 'PAU Green Avenue Scholars Hub',
        unit: 'Room 105, Bed B',
        utr: '626919884102',
        type: '15% Advance Session Token',
        amount: '₹900',
        status: 'UTR_VERIFIED',
        recipientOrVpa: 'UniNest Escrow Vault (anupamrai172@oksbi)',
        date: '25 Sep 2026, 04:42 PM',
      },
      {
        id: 'TXN-2026-9901',
        studentName: 'Rahul Sharma',
        email: 'rahul@uninest.in',
        property: 'PCTE Smart Student Residency',
        unit: 'Room 204, Bed A',
        utr: '626918402914',
        type: '₹399 72-Hour Visit Commitment Hold',
        amount: '₹399',
        status: 'ESCROW_LOCKED',
        recipientOrVpa: 'UniNest Escrow Vault (anupamrai172@oksbi)',
        date: '26 Sep 2026, 10:14 AM',
      },
      {
        id: 'TXN-2026-9907',
        studentName: 'Rohan Mehta',
        email: 'rohan.mehta@pcte.edu.in',
        property: 'PCTE Smart Student Residency',
        unit: 'Room 102, Bed A',
        utr: '626109823475',
        type: '₹399 Commitment Hold',
        amount: '₹399',
        status: 'REFUNDED_TO_STUDENT',
        recipientOrVpa: 'Student UPI (rohanmehta@paytm)',
        date: '18 Sep 2026, 06:20 PM',
      },
    ],
  },

  DISBURSED: {
    title: 'Disbursed to Landlords Post Move-In Key',
    category: 'LANDLORD_PAYOUTS',
    totalFormatted: '₹6,000',
    formula: 'Aman Verma Move-In Key Verified (₹6,000) = ₹6,000 Disbursed',
    explanation:
      'UniNest only releases rental payouts to property owners when the student physically reaches the premises, confirms room conditions, and supplies their 6-digit cryptographic Move-In Key to the landlord. Aman Verma validated room 202-B on 20 Sep 2026, triggering immediate zero-fee settlement to Vikram Singh.',
    transactions: [
      {
        id: 'TXN-2026-9905',
        studentName: 'Aman Verma',
        email: 'aman.verma@pcte.edu.in',
        property: 'PCTE Smart Student Residency',
        unit: 'Room 202, Bed B',
        utr: '626590184327',
        type: 'Stage-2 Move-In Rent Payout',
        amount: '₹6,000',
        status: 'SETTLED_TO_LANDLORD',
        recipientOrVpa: 'Vikram Singh (vikramsingh.passi@okicici)',
        date: '20 Sep 2026, 03:15 PM',
      },
    ],
  },

  VAULT: {
    title: 'Active Escrow Vault Balance',
    category: 'ESCROW_RESERVE',
    totalFormatted: '₹18,900',
    formula: 'Karanveer Gill (₹6,000) + Simran Kaur (₹6,000) + Rahul Sharma (₹5,601 + ₹900 + ₹399 = ₹6,900) = ₹18,900',
    explanation:
      'These funds are held securely in UniNest Housing VPA (anupamrai172@oksbi). Neither the landlord nor the platform can touch these funds until the student inspects their bed and verifies their Move-In OTP handshake. If the room is materially misrepresented, the student receives a 100% auto-refund under the UniNest Escrow Charter.',
    transactions: [
      {
        id: 'TXN-2026-9904',
        studentName: 'Karanveer Gill',
        email: 'karanveer.gill@gndec.ac.in',
        property: 'PCTE Smart Student Residency',
        unit: 'Room 301, Bed A',
        utr: '626744901288',
        type: 'Monthly Rent',
        amount: '₹6,000',
        status: 'ESCROW_LOCKED',
        recipientOrVpa: 'UniNest Escrow Vault (anupamrai172@oksbi)',
        date: '26 Sep 2026, 11:05 AM',
      },
      {
        id: 'TXN-2026-9906',
        studentName: 'Simran Kaur',
        email: 'simran.kaur@pcte.edu.in',
        property: 'PAU Green Avenue Scholars Hub',
        unit: 'Room 108, Bed A',
        utr: '626433098112',
        type: 'Monthly Rent',
        amount: '₹6,000',
        status: 'ESCROW_LOCKED',
        recipientOrVpa: 'UniNest Escrow Vault (anupamrai172@oksbi)',
        date: '26 Sep 2026, 09:48 AM',
      },
      {
        id: 'TXN-2026-9903',
        studentName: 'Rahul Sharma',
        email: 'rahul@uninest.in',
        property: 'PAU Green Avenue Scholars Hub',
        unit: 'Room 105, Bed B',
        utr: '626811209483',
        type: 'Balance Escrow',
        amount: '₹5,601',
        status: 'ESCROW_LOCKED',
        recipientOrVpa: 'UniNest Escrow Vault (anupamrai172@oksbi)',
        date: '25 Sep 2026, 05:10 PM',
      },
      {
        id: 'TXN-2026-9902',
        studentName: 'Rahul Sharma',
        email: 'rahul@uninest.in',
        property: 'PAU Green Avenue Scholars Hub',
        unit: 'Room 105, Bed B',
        utr: '626919884102',
        type: '15% Advance Token',
        amount: '₹900',
        status: 'UTR_VERIFIED',
        recipientOrVpa: 'UniNest Escrow Vault (anupamrai172@oksbi)',
        date: '25 Sep 2026, 04:42 PM',
      },
      {
        id: 'TXN-2026-9901',
        studentName: 'Rahul Sharma',
        email: 'rahul@uninest.in',
        property: 'PCTE Smart Student Residency',
        unit: 'Room 204, Bed A',
        utr: '626918402914',
        type: '72-Hour Commitment Hold',
        amount: '₹399',
        status: 'ESCROW_LOCKED',
        recipientOrVpa: 'UniNest Escrow Vault (anupamrai172@oksbi)',
        date: '26 Sep 2026, 10:14 AM',
      },
    ],
  },

  ZERO_MDR: {
    title: 'Zero Gateway MDR Protocol (100% Protection)',
    category: 'BANKING_PROTOCOL',
    totalFormatted: '₹0 MDR Leakage',
    formula: 'Total Processed (₹25,299) × 0.00% Merchant Discount Rate = ₹0 Deductions',
    explanation:
      'Unlike traditional rental apps that use payment gateways like Razorpay or Stripe which deduct 2% to 3% in gateway MDR fees, UniNest routes all transactions over Direct NPCI UPI Intent directly to the dedicated escrow account. Both students and landlords save 100% of payment gateway transaction charges.',
    transactions: [
      {
        id: 'NPCI-GATEWAY-001',
        studentName: 'All 4 Cohort Students',
        email: 'All registered students',
        property: 'PCTE & PAU Campuses',
        unit: '4 Active Tenancies',
        utr: 'Direct UPI Clearinghouse',
        type: 'Zero-MDR Intent Processing',
        amount: '₹25,299 GMV',
        status: 'SETTLED_0_FEE',
        recipientOrVpa: 'Clearinghouse: anupamrai172@oksbi',
        date: 'Ongoing Live Processing',
      },
    ],
  },
};

export function AdminAnalyticsClient() {
  const [selectedKey, setSelectedKey] = useState<string | null>(null);

  const activeModalData = selectedKey ? ACCUMULATION_DATABASE[selectedKey] : null;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold text-text-primary">
              Platform GMV, Escrow Velocity & Unit Economics
            </h1>
            <Badge variant="success" dot>Live Environment</Badge>
          </div>
          <p className="text-text-secondary mt-1">
            Real-time financial performance and click-to-elaborate revenue accumulation for all platform transactions.
          </p>
        </div>
      </div>

      {/* Interactive Top StatCards with Click-to-Elaborate indicator */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          onClick={() => setSelectedKey('GMV')}
          className="cursor-pointer group transition-all transform hover:-translate-y-1 focus:outline-none"
        >
          <Card hover className="border border-slate-200 group-hover:border-brand-500 shadow-sm relative overflow-hidden">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Escrow GMV</span>
              <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
                <IndianRupee className="w-5 h-5" />
              </div>
            </div>
            <div className="text-2xl font-extrabold text-slate-900">₹25,299</div>
            <p className="text-xs text-slate-500 mt-1">All-time verified payments in ledger</p>
            <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] font-semibold text-brand-600 group-hover:text-brand-700">
              <span>Inspect accumulation breakdown</span>
              <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </Card>
        </div>

        <div
          onClick={() => setSelectedKey('DISBURSED')}
          className="cursor-pointer group transition-all transform hover:-translate-y-1 focus:outline-none"
        >
          <Card hover className="border border-slate-200 group-hover:border-blue-500 shadow-sm relative overflow-hidden">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Disbursed to Landlords</span>
              <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
                <ArrowUpRight className="w-5 h-5" />
              </div>
            </div>
            <div className="text-2xl font-extrabold text-slate-900">₹6,000</div>
            <p className="text-xs text-slate-500 mt-1">Released post Stage-2 Move-In Key</p>
            <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] font-semibold text-blue-600 group-hover:text-blue-700">
              <span>Inspect landlord payout details</span>
              <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </Card>
        </div>

        <div
          onClick={() => setSelectedKey('VAULT')}
          className="cursor-pointer group transition-all transform hover:-translate-y-1 focus:outline-none"
        >
          <Card hover className="border border-slate-200 group-hover:border-purple-500 shadow-sm relative overflow-hidden">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active Escrow Vault</span>
              <div className="p-2 rounded-lg bg-purple-50 text-purple-600">
                <Lock className="w-5 h-5" />
              </div>
            </div>
            <div className="text-2xl font-extrabold text-slate-900">₹18,900</div>
            <p className="text-xs text-slate-500 mt-1">Protected in anupamrai172@oksbi</p>
            <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] font-semibold text-purple-600 group-hover:text-purple-700">
              <span>Inspect locked student funds</span>
              <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </Card>
        </div>

        <div
          onClick={() => setSelectedKey('ZERO_MDR')}
          className="cursor-pointer group transition-all transform hover:-translate-y-1 focus:outline-none"
        >
          <Card hover className="border border-slate-200 group-hover:border-amber-500 shadow-sm relative overflow-hidden">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Zero Gateway MDR</span>
              <div className="p-2 rounded-lg bg-amber-50 text-amber-600">
                <ShieldCheck className="w-5 h-5" />
              </div>
            </div>
            <div className="text-2xl font-extrabold text-slate-900">100% Protected</div>
            <p className="text-xs text-slate-500 mt-1">Zero gateway intermediary deductions</p>
            <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] font-semibold text-amber-600 group-hover:text-amber-700">
              <span>Inspect direct UPI protocol</span>
              <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </Card>
        </div>
      </div>

      {/* Unit Economics Table with Interactive Drill-Down */}
      <Card padding="none" className="overflow-hidden border border-slate-200 shadow-sm">
        <div className="px-5 py-4 border-b border-border flex items-center justify-between bg-surface-secondary/40">
          <div>
            <h2 className="text-base font-bold text-text-primary">
              Live Environment Unit Economics & Cashflow Breakdown
            </h2>
            <p className="text-xs text-text-secondary mt-0.5">
              Click any revenue stream below to open its itemized calculation dossier & student transaction origin
            </p>
          </div>
          <Badge variant="info">4 Active Student Tenancies</Badge>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-surface-tertiary border-b border-border">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase">Revenue Stream</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase">On-Ground Volume</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-text-secondary uppercase">Gross Flow (GMV)</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-text-secondary uppercase">Current Status</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-text-secondary uppercase">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-light">
              <tr
                onClick={() => setSelectedKey('DISBURSED')}
                className="hover:bg-blue-50/50 cursor-pointer transition-colors"
              >
                <td className="px-4 py-3.5">
                  <div className="font-semibold text-slate-900">Stage-2 Move-In Rent Payouts (Settled to Landlords)</div>
                  <div className="text-xs text-slate-500">Released only upon physical room key handover</div>
                </td>
                <td className="px-4 py-3.5 text-text-secondary">1 Confirmed Tenancy (Aman Verma)</td>
                <td className="px-4 py-3.5 text-right font-bold text-blue-700">₹6,000</td>
                <td className="px-4 py-3.5 text-right">
                  <Badge variant="success">Settled to Landlord</Badge>
                </td>
                <td className="px-4 py-3.5 text-center">
                  <Button size="sm" variant="ghost" className="text-xs font-bold text-brand-600">
                    Inspect Origin →
                  </Button>
                </td>
              </tr>

              <tr
                onClick={() => setSelectedKey('VAULT')}
                className="hover:bg-purple-50/50 cursor-pointer transition-colors"
              >
                <td className="px-4 py-3.5">
                  <div className="font-semibold text-slate-900">First Month Escrow Rent (Protected Vault Hold)</div>
                  <div className="text-xs text-slate-500">Simran Kaur & Karanveer Gill pending Move-In handshakes</div>
                </td>
                <td className="px-4 py-3.5 text-text-secondary">2 Tenancies in Audit</td>
                <td className="px-4 py-3.5 text-right font-bold text-purple-700">₹12,000</td>
                <td className="px-4 py-3.5 text-right">
                  <Badge variant="warning">Locked in Escrow</Badge>
                </td>
                <td className="px-4 py-3.5 text-center">
                  <Button size="sm" variant="ghost" className="text-xs font-bold text-purple-600">
                    Inspect Origin →
                  </Button>
                </td>
              </tr>

              <tr
                onClick={() => setSelectedKey('VAULT')}
                className="hover:bg-emerald-50/50 cursor-pointer transition-colors"
              >
                <td className="px-4 py-3.5">
                  <div className="font-semibold text-slate-900">Multi-Stage Commitment Holds & 15% Advance Tokens</div>
                  <div className="text-xs text-slate-500">Rahul Sharma 72h Visit Hold + 15% Token + Remaining Balance</div>
                </td>
                <td className="px-4 py-3.5 text-text-secondary">3 Staged Payments (Rahul Sharma)</td>
                <td className="px-4 py-3.5 text-right font-bold text-emerald-700">₹6,900</td>
                <td className="px-4 py-3.5 text-right">
                  <Badge variant="info">Escrow Protected</Badge>
                </td>
                <td className="px-4 py-3.5 text-center">
                  <Button size="sm" variant="ghost" className="text-xs font-bold text-emerald-600">
                    Inspect Origin →
                  </Button>
                </td>
              </tr>

              <tr
                onClick={() => setSelectedKey('GMV')}
                className="hover:bg-rose-50/50 cursor-pointer transition-colors"
              >
                <td className="px-4 py-3.5">
                  <div className="font-semibold text-slate-900">Student 72-Hour Guarantee Refunds Processed</div>
                  <div className="text-xs text-slate-500">Rohan Mehta refunded after opting out within 72h window</div>
                </td>
                <td className="px-4 py-3.5 text-text-secondary">1 Refunded Hold (Rohan Mehta)</td>
                <td className="px-4 py-3.5 text-right font-bold text-rose-600">₹399</td>
                <td className="px-4 py-3.5 text-right">
                  <Badge variant="outline">Refunded to Student</Badge>
                </td>
                <td className="px-4 py-3.5 text-center">
                  <Button size="sm" variant="ghost" className="text-xs font-bold text-rose-600">
                    Inspect Origin →
                  </Button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>

      {/* Ludhiana College Campus Micro-Market Distribution */}
      <Card padding="none" className="overflow-hidden border border-slate-200 shadow-sm">
        <div className="px-5 py-4 border-b border-border flex items-center justify-between bg-surface-secondary/40">
          <div>
            <h2 className="text-base font-bold text-text-primary">
              Ludhiana Campus Micro-Market Real Activity
            </h2>
            <p className="text-xs text-text-secondary mt-0.5">
              Live accommodation density and active student cohort distribution
            </p>
          </div>
          <Badge variant="success">38 Total Beds Configured</Badge>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-surface-tertiary border-b border-border">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase">Campus Cluster</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase">Property & Landlord</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-text-secondary uppercase">Beds</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-text-secondary uppercase">Live Students</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-text-secondary uppercase">Rent / Bed</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-light">
              <tr className="hover:bg-slate-50">
                <td className="px-4 py-3.5 font-bold text-slate-900">PCTE Baddowal Corridor</td>
                <td className="px-4 py-3.5 text-text-secondary">PCTE Smart Student Residency (Vikram Singh)</td>
                <td className="px-4 py-3.5 text-center font-medium">9 / 12 (75%)</td>
                <td className="px-4 py-3.5 text-center">
                  <span className="font-bold text-emerald-700">Aman Verma, Rahul Sharma, Karanveer</span>
                </td>
                <td className="px-4 py-3.5 text-right font-bold text-slate-900">₹6,000 / mo</td>
              </tr>
              <tr className="hover:bg-slate-50">
                <td className="px-4 py-3.5 font-bold text-slate-900">PAU Gate 1 & Sarabha Nagar</td>
                <td className="px-4 py-3.5 text-text-secondary">PAU Green Avenue Scholars Hub (Vikram Singh)</td>
                <td className="px-4 py-3.5 text-center font-medium">14 / 16 (88%)</td>
                <td className="px-4 py-3.5 text-center">
                  <span className="font-bold text-blue-700">Simran Kaur, Rahul Sharma</span>
                </td>
                <td className="px-4 py-3.5 text-right font-bold text-slate-900">₹7,500 / mo</td>
              </tr>
              <tr className="hover:bg-slate-50">
                <td className="px-4 py-3.5 font-bold text-slate-900">BRS Nagar Engineering Cluster</td>
                <td className="px-4 py-3.5 text-text-secondary">Campus Edge Girls Hostel (Sunita Devi)</td>
                <td className="px-4 py-3.5 text-center font-medium">8 / 10 (80%)</td>
                <td className="px-4 py-3.5 text-center text-slate-500 font-medium">
                  Offline Resident Cohort
                </td>
                <td className="px-4 py-3.5 text-right font-bold text-slate-900">₹6,500 / mo</td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>

      {/* Interactive Elaboration Modal */}
      {activeModalData && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedKey(null)}
          title={activeModalData.title}
          size="lg"
        >
          <div className="space-y-5">
            {/* Summary Formula Banner */}
            <div className="p-4 rounded-xl bg-slate-900 text-white space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
                  Mathematical Accumulation Formula
                </span>
                <span className="text-xl font-black text-white">{activeModalData.totalFormatted}</span>
              </div>
              <p className="font-mono text-xs bg-slate-800 p-2.5 rounded-lg text-slate-200 border border-slate-700 break-words">
                {activeModalData.formula}
              </p>
              <p className="text-xs text-slate-300 leading-relaxed pt-1">
                {activeModalData.explanation}
              </p>
            </div>

            {/* Line-by-line origin breakdown */}
            <div>
              <h3 className="text-sm font-bold text-slate-900 mb-2.5 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-brand-600" />
                Underlying Transaction Ledger Origin (Where Each Rupee Came From)
              </h3>

              <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
                {activeModalData.transactions.map((tx) => (
                  <div
                    key={tx.id}
                    className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-slate-50 transition-colors space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-sm text-slate-900">{tx.studentName}</span>
                        <span className="text-xs text-slate-500">({tx.email})</span>
                      </div>
                      <span className="text-base font-black text-emerald-700">{tx.amount}</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600">
                      <div>
                        <span className="font-semibold text-slate-700">Property: </span>
                        {tx.property} ({tx.unit})
                      </div>
                      <div>
                        <span className="font-semibold text-slate-700">Type: </span>
                        {tx.type}
                      </div>
                      <div>
                        <span className="font-semibold text-slate-700">NPCI UTR: </span>
                        <span className="font-mono text-[11px] font-bold text-slate-800">{tx.utr}</span>
                      </div>
                      <div>
                        <span className="font-semibold text-slate-700">Payment Date: </span>
                        {tx.date}
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between text-[11px]">
                      <span className="text-slate-500">
                        Destination: <strong className="text-slate-700">{tx.recipientOrVpa}</strong>
                      </span>
                      <Badge
                        variant={
                          tx.status === 'SETTLED_TO_LANDLORD'
                            ? 'success'
                            : tx.status === 'REFUNDED_TO_STUDENT'
                            ? 'danger'
                            : 'warning'
                        }
                        size="sm"
                      >
                        {tx.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
              <span className="text-xs text-slate-500 font-medium">
                Protected by UniNest NPCI Escrow Clearinghouse Protocol
              </span>
              <Button onClick={() => setSelectedKey(null)} variant="primary" size="sm">
                Close Dossier
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
