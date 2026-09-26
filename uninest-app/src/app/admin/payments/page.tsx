'use client';

import React, { useState } from 'react';
import { Card, StatCard } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { formatINR } from '@/lib/utils';
import {
  IndianRupee,
  Lock,
  CheckCircle2,
  ArrowUpRight,
  RotateCcw,
  FileCheck2,
  ShieldCheck,
  Clock,
  Download,
} from 'lucide-react';

interface EscrowTransaction {
  id: string;
  utrNumber: string;
  payer: string;
  payerEmail: string;
  property: string;
  type: string;
  amountPaise: number;
  status: 'UTR_VERIFIED' | 'ESCROW_LOCKED' | 'SETTLED_TO_LANDLORD' | 'REFUNDED_TO_STUDENT' | 'PENDING_UTR_AUDIT';
  timestamp: string;
  vpa: string;
}

const INITIAL_TRANSACTIONS: EscrowTransaction[] = [
  {
    id: 'TXN-2026-9901',
    utrNumber: '626918402914',
    payer: 'Rahul Sharma',
    payerEmail: 'rahul@uninest.in',
    property: 'PCTE Smart Student Residency (Room 204-A)',
    type: '₹399 Commitment Hold',
    amountPaise: 39900,
    status: 'ESCROW_LOCKED',
    timestamp: '26 Sep 2026, 10:14 AM',
    vpa: 'rahulsharma@oksbi',
  },
  {
    id: 'TXN-2026-9902',
    utrNumber: '626919884102',
    payer: 'Rahul Sharma',
    payerEmail: 'rahul@uninest.in',
    property: 'PAU Green Avenue Scholars Hub (Room 105-B)',
    type: '₹900 15% Advance Token',
    amountPaise: 90000,
    status: 'UTR_VERIFIED',
    timestamp: '25 Sep 2026, 04:42 PM',
    vpa: 'rahulsharma@oksbi',
  },
  {
    id: 'TXN-2026-9903',
    utrNumber: '626811209483',
    payer: 'Rahul Sharma',
    payerEmail: 'rahul@uninest.in',
    property: 'PAU Green Avenue Scholars Hub (Room 105-B)',
    type: '₹5,601 Escrow Balance',
    amountPaise: 560100,
    status: 'ESCROW_LOCKED',
    timestamp: '25 Sep 2026, 05:10 PM',
    vpa: 'rahulsharma@oksbi',
  },
  {
    id: 'TXN-2026-9904',
    utrNumber: '626744901288',
    payer: 'Karanveer Gill',
    payerEmail: 'karanveer.gill@gndec.ac.in',
    property: 'PCTE Smart Student Residency (Room 301-A)',
    type: '₹6,000 Monthly Rent',
    amountPaise: 600000,
    status: 'PENDING_UTR_AUDIT',
    timestamp: '26 Sep 2026, 11:05 AM',
    vpa: 'karanveergill@ybl',
  },
  {
    id: 'TXN-2026-9905',
    utrNumber: '626590184327',
    payer: 'Aman Verma',
    payerEmail: 'aman.verma@pcte.edu.in',
    property: 'PCTE Smart Student Residency (Room 202-B)',
    type: '₹6,000 Landlord Payout — Vikram Singh',
    amountPaise: 600000,
    status: 'SETTLED_TO_LANDLORD',
    timestamp: '20 Sep 2026, 03:15 PM',
    vpa: 'vikramsingh.passi@okicici',
  },
  {
    id: 'TXN-2026-9906',
    utrNumber: '626433098112',
    payer: 'Simran Kaur',
    payerEmail: 'simran.kaur@pcte.edu.in',
    property: 'PAU Green Avenue Scholars Hub (Room 108-A)',
    type: '₹6,000 Monthly Rent',
    amountPaise: 600000,
    status: 'PENDING_UTR_AUDIT',
    timestamp: '26 Sep 2026, 09:48 AM',
    vpa: 'simrankaur@okaxis',
  },
  {
    id: 'TXN-2026-9907',
    utrNumber: '626109823475',
    payer: 'Rohan Mehta',
    payerEmail: 'rohan.mehta@pcte.edu.in',
    property: 'PCTE Smart Student Residency (Room 102-A)',
    type: '₹399 Commitment Hold',
    amountPaise: 39900,
    status: 'REFUNDED_TO_STUDENT',
    timestamp: '18 Sep 2026, 06:20 PM',
    vpa: 'rohanmehta@paytm',
  },
];

export default function AdminPaymentsPage() {
  const [transactions, setTransactions] = useState<EscrowTransaction[]>(INITIAL_TRANSACTIONS);
  const [auditToast, setAuditToast] = useState<string | null>(null);

  const pendingCount = transactions.filter((t) => t.status === 'PENDING_UTR_AUDIT').length;

  const handleVerifyUtr = (id: string, utr: string) => {
    setTransactions((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status: 'ESCROW_LOCKED' } : t))
    );
    setAuditToast(`NPCI UTR #${utr} cryptographically verified and locked in UniNest Escrow Vault (anupamrai172@oksbi).`);
  };

  const handleDownloadReceipt = (txn: EscrowTransaction) => {
    setAuditToast(
      `Audit Certificate generated for ${txn.id} • UTR: ${txn.utrNumber} • ${formatINR(txn.amountPaise)} (${txn.status}).`
    );
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold text-text-primary">
              NPCI Direct UPI Escrow & UTR Settlement Ledger
            </h1>
            <Badge variant="success" dot>
              VPA: anupamrai172@oksbi
            </Badge>
          </div>
          <p className="text-text-secondary mt-1">
            Zero-MDR Direct UPI intent clearinghouse for ₹399 Commitment Holds, 15% Advance Tokens, and Stage 2 Landlord Disbursements
          </p>
        </div>
      </div>

      {auditToast && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between text-emerald-900 text-sm">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
            <span className="font-medium">{auditToast}</span>
          </div>
          <button
            onClick={() => setAuditToast(null)}
            className="text-xs font-semibold text-emerald-700 hover:underline ml-4"
          >
            Dismiss
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Escrow Vault Balance"
          value="₹1,42,800"
          subtitle="Locked in UniNest Housing VPA"
          icon={<Lock className="w-5 h-5" />}
          color="brand"
        />
        <StatCard
          title="Disbursed to Landlords"
          value="₹4,85,000"
          subtitle="Released post Stage-2 Move-In Key"
          icon={<ArrowUpRight className="w-5 h-5" />}
          color="blue"
        />
        <StatCard
          title="Student Refunds Processed"
          value="₹8,798"
          subtitle="Stage-1 Rejects & Emergency Waivers"
          icon={<RotateCcw className="w-5 h-5" />}
          color="purple"
        />
        <StatCard
          title="Pending UTR Verifications"
          value={pendingCount}
          subtitle="12-digit NPCI RRN cross-check"
          icon={<Clock className="w-5 h-5" />}
          color="amber"
        />
      </div>

      <Card padding="none">
        <div className="px-5 py-4 border-b border-border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 bg-surface-secondary/40">
          <div>
            <h2 className="text-base font-bold text-text-primary">
              Central Escrow Vault Ledger (Payee: UniNest Housing • anupamrai172@oksbi)
            </h2>
            <p className="text-xs text-text-secondary">
              Every transaction is anchored to a 12-digit NPCI Unique Transaction Reference (UTR)
            </p>
          </div>
          <Badge variant="info">0.00% Gateway MDR • Direct UPI Protocol</Badge>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-surface-tertiary border-b border-border">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase">12-Digit UTR / ID</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase">Payer / Beneficiary</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase">Transaction Type</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-text-secondary uppercase">Amount</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase">Escrow Status</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-text-secondary uppercase">Audit Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-light">
              {transactions.map((txn) => {
                const statusBadge =
                  txn.status === 'ESCROW_LOCKED' ? (
                    <Badge variant="info" dot>ESCROW_LOCKED</Badge>
                  ) : txn.status === 'UTR_VERIFIED' ? (
                    <Badge variant="success" dot>UTR_VERIFIED</Badge>
                  ) : txn.status === 'SETTLED_TO_LANDLORD' ? (
                    <Badge variant="purple" dot>SETTLED_TO_LANDLORD</Badge>
                  ) : txn.status === 'REFUNDED_TO_STUDENT' ? (
                    <Badge variant="warning" dot>REFUNDED_TO_STUDENT</Badge>
                  ) : (
                    <Badge variant="danger" dot>PENDING_UTR_AUDIT</Badge>
                  );

                return (
                  <tr key={txn.id} className="hover:bg-surface-secondary/50 transition-colors">
                    <td className="px-4 py-3.5">
                      <div className="font-mono font-bold text-slate-900">UTR: {txn.utrNumber}</div>
                      <div className="text-xs text-text-tertiary">{txn.id} • {txn.timestamp}</div>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="font-semibold text-slate-900">{txn.payer}</div>
                      <div className="text-xs text-text-secondary font-mono">{txn.vpa} • {txn.property}</div>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="font-medium text-slate-800">{txn.type}</span>
                    </td>
                    <td className="px-4 py-3.5 text-right font-bold text-slate-900">
                      {formatINR(txn.amountPaise)}
                    </td>
                    <td className="px-4 py-3.5">{statusBadge}</td>
                    <td className="px-4 py-3.5 text-right">
                      {txn.status === 'PENDING_UTR_AUDIT' ? (
                        <button
                          onClick={() => handleVerifyUtr(txn.id, txn.utrNumber)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 transition-colors"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Verify UTR & Lock Escrow
                        </button>
                      ) : (
                        <button
                          onClick={() => handleDownloadReceipt(txn)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-white text-slate-700 text-xs font-semibold hover:bg-surface-secondary transition-colors"
                        >
                          <Download className="w-3.5 h-3.5" />
                          Download Audit Receipt
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
