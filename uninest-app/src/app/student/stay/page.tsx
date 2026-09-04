'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { formatINR } from '@/lib/utils';
import {
  Building2, BedDouble, Users, ShieldAlert, CheckCircle2, AlertTriangle,
  XCircle, Sparkles, Heart, Clock, Volume2, ShieldCheck, FileCheck
} from 'lucide-react';

export default function MyStayDetailsPage() {
  const [claimScenario, setClaimScenario] = useState<string | null>(null);

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">My Stay & Roommate Hub</h1>
          <p className="text-text-secondary mt-1">Current accommodation, roommate compatibility score, and accidental damage policy</p>
        </div>
        <div className="p-2.5 bg-brand-50 rounded-xl">
          <Building2 className="w-6 h-6 text-brand-600" />
        </div>
      </div>

      {/* Property & Bed Overview */}
      <Card className="bg-surface-primary border border-border">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="success">ACTIVE TENANCY</Badge>
              <span className="text-xs text-text-tertiary font-mono">ID: TEN-2026-8912</span>
            </div>
            <h2 className="text-xl font-bold text-text-primary">ABC Student Residence</h2>
            <p className="text-sm text-text-secondary">Plot 45, Near PCTE Campus Main Gate, Baddowal, Ludhiana</p>
            <div className="flex flex-wrap items-center gap-4 text-xs text-text-secondary pt-1">
              <span>Room: <strong>204-A (Double Sharing)</strong></span>
              <span>Bed: <strong>204-A-1</strong></span>
              <span>Monthly Rent: <strong>{formatINR(600000)}</strong></span>
              <span>Deposit: <strong>{formatINR(1200000)} (HELD)</strong></span>
            </div>
          </div>

          <div className="flex flex-col items-start md:items-end justify-center p-4 bg-brand-50/50 rounded-2xl border border-brand-100 min-w-[220px]">
            <span className="text-xs font-semibold text-brand-800 uppercase tracking-wider">Landlord Contact</span>
            <span className="text-sm font-bold text-text-primary mt-0.5">Vikram Singh</span>
            <span className="text-xs text-text-secondary">+91 98765 43210</span>
            <Badge variant="outline" className="mt-2 text-[10px]">VERIFIED LANDLORD</Badge>
          </div>
        </div>
      </Card>

      {/* SECTION 6: ROOMMATE MATCHING COMPATIBILITY */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-text-primary flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500" /> Roommate Compatibility Engine
            </h2>
            <p className="text-xs text-text-secondary">Algorithmic preference matching based on student living habits</p>
          </div>
          <Badge variant="success" size="sm" className="bg-emerald-100 text-emerald-800 font-bold">
            87% MATCH SCORE
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Roommate Profile Card */}
          <Card className="md:col-span-1 space-y-4 border-l-4 border-l-brand-600">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-brand-100 flex items-center justify-center font-bold text-brand-700 text-lg">
                AS
              </div>
              <div>
                <h3 className="font-bold text-text-primary">Aman Sharma</h3>
                <p className="text-xs text-text-secondary">B.Tech CSE · 3rd Year (PCTE)</p>
                <Badge variant="outline" className="text-[10px] mt-1">Bed 204-A-2</Badge>
              </div>
            </div>

            <div className="pt-2 border-t border-border space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-text-tertiary">Sleep Schedule</span>
                <span className="font-semibold text-text-primary">Night Owl (12 AM - 7 AM)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-tertiary">Noise Preference</span>
                <span className="font-semibold text-text-primary">Quiet Study Only</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-tertiary">Cleanliness Level</span>
                <span className="font-semibold text-text-primary">4 / 5 (High)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-tertiary">Diet & Food</span>
                <span className="font-semibold text-text-primary">Pure Vegetarian</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-tertiary">Smoking / Drinking</span>
                <span className="font-semibold text-emerald-700">Strictly Non-Smoker</span>
              </div>
            </div>
          </Card>

          {/* Matching Analysis Breakdown */}
          <Card className="md:col-span-2 space-y-4">
            <h3 className="font-bold text-sm text-text-primary border-b border-border pb-2">
              Why Rahul & Aman Are an 87% Match
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-emerald-50/60 border border-emerald-200 rounded-xl flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-emerald-900 block font-semibold">Matched Study Habits (+30%)</strong>
                  <span className="text-emerald-800">Both prefer quiet library atmosphere after 8 PM.</span>
                </div>
              </div>

              <div className="p-3 bg-emerald-50/60 border border-emerald-200 rounded-xl flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-emerald-900 block font-semibold">Matched Cleanliness (+25%)</strong>
                  <span className="text-emerald-800">Both rated 4/5 for daily room hygiene expectations.</span>
                </div>
              </div>

              <div className="p-3 bg-emerald-50/60 border border-emerald-200 rounded-xl flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-emerald-900 block font-semibold">Dietary Harmony (+20%)</strong>
                  <span className="text-emerald-800">No conflict on shared fridge or food storage space.</span>
                </div>
              </div>

              <div className="p-3 bg-amber-50/60 border border-amber-200 rounded-xl flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-amber-900 block font-semibold">Minor Sleep Variance (-13%)</strong>
                  <span className="text-amber-800">Aman sleeps at 12:30 AM; Rahul sleeps at 11:30 PM.</span>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* SECTION 7: ACCIDENTAL MICRO-DAMAGE PROTECTION */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-text-primary flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-brand-600" /> Up to ₹5,000 Accidental Micro-Damage Protection
            </h2>
            <p className="text-xs text-text-secondary">UniNest automatically covers up to ₹5,000 in minor accidental property damage per tenancy</p>
          </div>
          <Badge variant="outline" className="font-mono text-brand-700">
            LIMIT: ₹5,000 DEMO COVERAGE
          </Badge>
        </div>

        <Card className="space-y-5">
          <div className="p-4 bg-brand-50/50 rounded-xl border border-brand-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-semibold text-brand-800 uppercase">Protection Plan Status</span>
              <h3 className="text-base font-bold text-text-primary mt-0.5">Fully Active · Zero Student Co-Pay</h3>
              <p className="text-xs text-text-secondary">Protects your security deposit against accidental door/fixture damage, minor leaks, or wall scuffs.</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-text-tertiary">Used: ₹0 / ₹5,000</span>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-bold text-text-primary mb-3">Interactive Claim Test Matrix (Demonstration)</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
              <button
                onClick={() => setClaimScenario('ACCIDENTAL_700')}
                className={`p-3 rounded-xl border text-left text-xs space-y-1 transition-all ${
                  claimScenario === 'ACCIDENTAL_700' ? 'border-brand-600 bg-brand-50' : 'border-border hover:border-brand-300'
                }`}
              >
                <div className="font-bold text-text-primary">₹700 Tap Leaking</div>
                <div className="text-[10px] text-text-secondary">Accidental fixture strain</div>
                <Badge variant="success" size="sm" className="mt-1">APPROVE ₹700</Badge>
              </button>

              <button
                onClick={() => setClaimScenario('ACCIDENTAL_8000')}
                className={`p-3 rounded-xl border text-left text-xs space-y-1 transition-all ${
                  claimScenario === 'ACCIDENTAL_8000' ? 'border-brand-600 bg-brand-50' : 'border-border hover:border-brand-300'
                }`}
              >
                <div className="font-bold text-text-primary">₹8,000 Door Break</div>
                <div className="text-[10px] text-text-secondary">Eligible accident over limit</div>
                <Badge variant="warning" size="sm" className="mt-1">CAP AT ₹5,000</Badge>
              </button>

              <button
                onClick={() => setClaimScenario('INTENTIONAL')}
                className={`p-3 rounded-xl border text-left text-xs space-y-1 transition-all ${
                  claimScenario === 'INTENTIONAL' ? 'border-brand-600 bg-brand-50' : 'border-border hover:border-brand-300'
                }`}
              >
                <div className="font-bold text-text-primary">Wall Punch Damage</div>
                <div className="text-[10px] text-text-secondary">Vandalism / Intentional</div>
                <Badge variant="danger" size="sm" className="mt-1">REJECT</Badge>
              </button>

              <button
                onClick={() => setClaimScenario('PRE_EXISTING')}
                className={`p-3 rounded-xl border text-left text-xs space-y-1 transition-all ${
                  claimScenario === 'PRE_EXISTING' ? 'border-brand-600 bg-brand-50' : 'border-border hover:border-brand-300'
                }`}
              >
                <div className="font-bold text-text-primary">Pre-Existing Scratch</div>
                <div className="text-[10px] text-text-secondary">Logged in Move-in Report</div>
                <Badge variant="default" size="sm" className="mt-1">REJECT (NO CHARGE)</Badge>
              </button>

              <button
                onClick={() => setClaimScenario('WEAR_TEAR')}
                className={`p-3 rounded-xl border text-left text-xs space-y-1 transition-all ${
                  claimScenario === 'WEAR_TEAR' ? 'border-brand-600 bg-brand-50' : 'border-border hover:border-brand-300'
                }`}
              >
                <div className="font-bold text-text-primary">Normal Paint Fading</div>
                <div className="text-[10px] text-text-secondary">Normal Wear & Tear</div>
                <Badge variant="default" size="sm" className="mt-1">REJECT (LANDLORD OBLIGATION)</Badge>
              </button>
            </div>
          </div>

          {/* Selected Test Verdict */}
          {claimScenario && (
            <div className="p-4 rounded-xl border border-border bg-surface-secondary text-xs space-y-2">
              <div className="flex items-center gap-2 font-bold">
                {claimScenario === 'ACCIDENTAL_700' && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                {claimScenario === 'ACCIDENTAL_8000' && <AlertTriangle className="w-4 h-4 text-amber-600" />}
                {(claimScenario === 'INTENTIONAL' || claimScenario === 'PRE_EXISTING' || claimScenario === 'WEAR_TEAR') && <XCircle className="w-4 h-4 text-red-600" />}
                <span className="text-text-primary">Verdict Explanation:</span>
              </div>
              <p className="text-text-secondary">
                {claimScenario === 'ACCIDENTAL_700' && 'Approved: ₹700 is within the ₹5,000 accidental protection limit. Landlord reimbursed from protection fund; student deposit untouched.'}
                {claimScenario === 'ACCIDENTAL_8000' && 'Partial Approval: UniNest covers the maximum policy cap of ₹5,000. Remaining ₹3,000 payable by tenant or deposit deduction.'}
                {claimScenario === 'INTENTIONAL' && 'Rejected: Damage determined to be intentional vandalism. Tenant personally liable for 100% repair cost.'}
                {claimScenario === 'PRE_EXISTING' && 'Rejected: Photo evidence in Move-in Condition Report (DOC-MIN-2026) proves scratch existed prior to move-in. Tenant cleared of liability.'}
                {claimScenario === 'WEAR_TEAR' && 'Rejected: Paint aging is classified as normal wear and tear under standard rental terms. Landlord handles maintenance.'}
              </p>
            </div>
          )}
        </Card>
      </section>
    </div>
  );
}
