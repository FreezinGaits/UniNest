'use client';

import React, { useState } from 'react';
import { Card, StatCard } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { formatINR } from '@/lib/utils';
import {
  Scale,
  Lock,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Split,
  ArrowUpRight,
  Gavel,
} from 'lucide-react';

interface DisputeRecord {
  id: string;
  title: string;
  studentName: string;
  landlordName: string;
  property: string;
  amountPaise: number;
  splitSummary: string;
  status:
    | 'ESCROW_FROZEN'
    | 'RESOLVED_AUTO_SPLIT'
    | 'REFUNDED_100_PERCENT'
    | 'RELEASED_TO_LANDLORD';
  legalBasis: string;
  filedAt: string;
}

const INITIAL_DISPUTES: DisputeRecord[] = [
  {
    id: 'DSP-2026-009',
    title: 'Room AC & ventilation discrepancy on move-in day',
    studentName: 'Karanveer Gill',
    landlordName: 'Vikram Singh',
    property: 'PCTE Smart Student Residency (Room 301-A)',
    amountPaise: 600000,
    splitSummary: '₹6,000 Locked in Escrow Vault pending Arbitration',
    status: 'ESCROW_FROZEN',
    legalBasis: 'Section 73, Indian Contract Act 1872 (Material Misrepresentation Check)',
    filedAt: '26 Sep 2026, 10:30 AM',
  },
  {
    id: 'DSP-2026-008',
    title: 'Day-7 Unreachable Tenant Pro-Rata Claim',
    studentName: 'Aditya Pathak',
    landlordName: 'Vikram Singh',
    property: 'PAU Green Avenue Scholars Hub (Room 104-B)',
    amountPaise: 600000,
    splitSummary: '₹6,000 (₹2,800 Landlord / ₹3,200 Student Split)',
    status: 'RESOLVED_AUTO_SPLIT',
    legalBasis: 'Section 74, Indian Contract Act 1872 (7-Day Vacancy + ₹1,400 Relisting Cap)',
    filedAt: '19 Sep 2026, 06:00 PM',
  },
  {
    id: 'DSP-2026-007',
    title: 'Emergency bereavement waiver verification',
    studentName: 'Rohan Mehta',
    landlordName: 'Vikram Singh',
    property: 'PCTE Smart Student Residency (Room 102-A)',
    amountPaise: 39900,
    splitSummary: '100% Token Refunded to Student (Waiver 1/2 Used)',
    status: 'REFUNDED_100_PERCENT',
    legalBasis: 'UniNest Humanitarian Waiver Protocol (Hospital / Bereavement Proof Verified)',
    filedAt: '18 Sep 2026, 04:15 PM',
  },
];

export default function AdminDisputesPage() {
  const [disputes, setDisputes] = useState<DisputeRecord[]>(INITIAL_DISPUTES);
  const [rulingBanner, setRulingBanner] = useState<string | null>(null);

  const handleRuling = (
    id: string,
    newStatus: DisputeRecord['status'],
    splitSummary: string,
    rulingText: string
  ) => {
    setDisputes((prev) =>
      prev.map((d) =>
        d.id === id ? { ...d, status: newStatus, splitSummary } : d
      )
    );
    setRulingBanner(rulingText);
  };

  const frozenCount = disputes.filter((d) => d.status === 'ESCROW_FROZEN').length;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold text-text-primary">
              Escrow Dispute Arbitration & Freeze Tribunal
            </h1>
            <Badge variant="purple" dot>
              Sections 73 & 74, Indian Contract Act 1872
            </Badge>
          </div>
          <p className="text-text-secondary mt-1">
            Statutory liquidated-damages tribunal preventing unlawful 100% rent forfeiture while compensating landlords for verified vacancy loss
          </p>
        </div>
      </div>

      {rulingBanner && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between text-emerald-900 text-sm">
          <div className="flex items-center gap-2">
            <Gavel className="w-5 h-5 text-emerald-600 shrink-0" />
            <span className="font-medium">{rulingBanner}</span>
          </div>
          <button
            onClick={() => setRulingBanner(null)}
            className="text-xs font-semibold text-emerald-700 hover:underline"
          >
            Dismiss
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Active Frozen Escrows"
          value={frozenCount}
          subtitle="Payout halted pending ruling"
          icon={<Lock className="w-5 h-5" />}
          color="red"
        />
        <StatCard
          title="Pro-Rata Splits Executed"
          value={disputes.filter((d) => d.status === 'RESOLVED_AUTO_SPLIT').length}
          subtitle="₹2,800 Landlord / ₹3,200 Student"
          icon={<Split className="w-5 h-5" />}
          color="blue"
        />
        <StatCard
          title="100% Student Refunds"
          value={disputes.filter((d) => d.status === 'REFUNDED_100_PERCENT').length}
          subtitle="Emergency & room defect claims"
          icon={<RotateCcw className="w-5 h-5" />}
          color="brand"
        />
        <StatCard
          title="Arbitration SLA"
          value="< 4 Hours"
          subtitle="Evidence-backed video/photo review"
          icon={<Scale className="w-5 h-5" />}
          color="purple"
        />
      </div>

      <div className="space-y-4">
        {disputes.map((dsp) => (
          <Card key={dsp.id} className="border-l-4 border-l-brand-600">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono font-bold text-sm text-brand-700">{dsp.id}</span>
                  {dsp.status === 'ESCROW_FROZEN' ? (
                    <Badge variant="danger" dot>ESCROW_FROZEN</Badge>
                  ) : dsp.status === 'RESOLVED_AUTO_SPLIT' ? (
                    <Badge variant="info" dot>RESOLVED_AUTO_SPLIT</Badge>
                  ) : dsp.status === 'REFUNDED_100_PERCENT' ? (
                    <Badge variant="success" dot>REFUNDED_100_PERCENT</Badge>
                  ) : (
                    <Badge variant="purple" dot>RELEASED_TO_LANDLORD</Badge>
                  )}
                  <span className="text-xs text-text-tertiary">Filed: {dsp.filedAt}</span>
                </div>

                <h3 className="text-base font-bold text-slate-900">{dsp.title}</h3>

                <div className="text-xs text-text-secondary flex flex-wrap gap-x-4 gap-y-1">
                  <span>
                    <strong>Student:</strong> {dsp.studentName}
                  </span>
                  <span>
                    <strong>Landlord:</strong> {dsp.landlordName}
                  </span>
                  <span>
                    <strong>Property:</strong> {dsp.property}
                  </span>
                </div>

                <div className="text-xs font-medium text-slate-700 bg-surface-secondary px-3 py-1.5 rounded-lg inline-block">
                  <strong>Statutory Basis:</strong> {dsp.legalBasis}
                </div>
              </div>

              <div className="flex flex-col items-start lg:items-end justify-between gap-3 shrink-0">
                <div className="lg:text-right">
                  <div className="text-xs text-text-secondary">Disputed Escrow Amount</div>
                  <div className="text-xl font-bold text-slate-900">{formatINR(dsp.amountPaise)}</div>
                  <div className="text-xs font-medium text-brand-700">{dsp.splitSummary}</div>
                </div>

                {dsp.status === 'ESCROW_FROZEN' && (
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={() =>
                        handleRuling(
                          dsp.id,
                          'REFUNDED_100_PERCENT',
                          '100% Refunded to Student (₹6,000)',
                          `Tribunal Ruling Executed for ${dsp.id}: 100% Student Refund (₹6,000) initiated to ${dsp.studentName} via Direct UPI.`
                        )
                      }
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 transition-colors"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      Execute 100% Student Refund (₹6,000)
                    </button>

                    <button
                      onClick={() =>
                        handleRuling(
                          dsp.id,
                          'RESOLVED_AUTO_SPLIT',
                          '₹6,000 (₹2,800 Landlord / ₹3,200 Student Split)',
                          `Tribunal Ruling Executed for ${dsp.id}: Section 74 Day-7 Pro-Rata Split (₹2,800 to Landlord ${dsp.landlordName} / ₹3,200 refunded to Student ${dsp.studentName}).`
                        )
                      }
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition-colors"
                    >
                      <Split className="w-3.5 h-3.5" />
                      Execute Day-7 Pro-Rata Split (₹2,800 / ₹3,200)
                    </button>

                    <button
                      onClick={() =>
                        handleRuling(
                          dsp.id,
                          'RELEASED_TO_LANDLORD',
                          '100% Released to Landlord — Vikram Singh (₹6,000)',
                          `Tribunal Ruling Executed for ${dsp.id}: ₹6,000 Escrow released to Landlord ${dsp.landlordName}.`
                        )
                      }
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-white text-slate-800 text-xs font-semibold hover:bg-surface-secondary transition-colors"
                    >
                      <ArrowUpRight className="w-3.5 h-3.5" />
                      Release Escrow to Landlord
                    </button>
                  </div>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
