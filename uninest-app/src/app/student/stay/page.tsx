'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { formatINR } from '@/lib/utils';
import {
  Building2, BedDouble, Users, ShieldAlert, CheckCircle2, AlertTriangle,
  XCircle, Sparkles, Heart, Clock, Volume2, ShieldCheck, FileCheck, Plus, Wrench, Shield
} from 'lucide-react';
import { Modal } from '@/components/ui/Modal';

import { useDashboardUser, isDemoAccountEmail } from '@/components/layout/DashboardShell';

export interface DamageProtectionClaim {
  id: string;
  claimId: string;
  item: string;
  incidentType: string;
  description: string;
  estimatedCost: number;
  approvedAmount: number;
  status: 'APPROVED' | 'PARTIAL' | 'PENDING' | 'REJECTED';
  verdict: string;
  createdAt: string;
}

const INITIAL_DAMAGE_CLAIMS: DamageProtectionClaim[] = [
  {
    id: 'clm-01',
    claimId: 'CLM-2026-081',
    item: 'Bathroom Tap Diverter Strain',
    incidentType: 'Accidental Fixture Strain',
    description: 'Quarter-turn cartridge developed internal hairline crack during use, causing continuous water drip.',
    estimatedCost: 700,
    approvedAmount: 700,
    status: 'APPROVED',
    verdict: 'Approved under ₹5,000 Micro-Damage Policy. Landlord reimbursed from protection fund; student deposit untouched.',
    createdAt: '12 Oct 2026',
  },
];

export default function MyStayDetailsPage() {
  const { userEmail, isDemoUser } = useDashboardUser();
  const [claimScenario, setClaimScenario] = useState<string | null>(null);
  const [isDemo, setIsDemo] = useState<boolean>(isDemoUser);

  // Real Database Connected Accidental Damage Claims State
  const [claims, setClaims] = useState<DamageProtectionClaim[]>(INITIAL_DAMAGE_CLAIMS);
  const [showClaimModal, setShowClaimModal] = useState(false);
  const [isSubmittingClaim, setIsSubmittingClaim] = useState(false);
  const [newClaimItem, setNewClaimItem] = useState('');
  const [newClaimType, setNewClaimType] = useState('Accidental Fixture Strain');
  const [newClaimCost, setNewClaimCost] = useState('');
  const [newClaimDesc, setNewClaimDesc] = useState('');

  // Fetch real tickets from database via /api/demo/maintenance
  useEffect(() => {
    fetch('/api/demo/maintenance')
      .then((res) => res.json())
      .then((data) => {
        if (data?.success && Array.isArray(data?.tickets)) {
          const damageTickets = data.tickets.filter((t: any) =>
            t.category === 'ACCIDENTAL_DAMAGE' ||
            (t.title && t.title.toLowerCase().includes('accidental')) ||
            (t.description && t.description.toLowerCase().includes('micro-damage'))
          );
          if (damageTickets.length > 0) {
            const mapped: DamageProtectionClaim[] = damageTickets.map((t: any) => {
              const costMatch = t.description?.match(/₹(\d+[\d,]*)/);
              const cost = costMatch ? parseInt(costMatch[1].replace(/,/g, ''), 10) : 700;
              const approved = Math.min(cost, 5000);
              return {
                id: t.id,
                claimId: t.ticketId || `CLM-2026-${t.id.slice(-3)}`,
                item: t.title?.replace('Accidental Micro-Damage Claim: ', '') || 'Accidental Fixture Strain',
                incidentType: 'Accidental Damage',
                description: t.description || 'Reported micro-damage claim',
                estimatedCost: cost,
                approvedAmount: approved,
                status: (cost <= 5000 ? 'APPROVED' : 'PARTIAL') as any,
                verdict: cost <= 5000
                  ? `Approved under ₹5,000 Micro-Damage Policy. Landlord reimbursed from protection fund; student deposit untouched.`
                  : `Partial Approval: UniNest covers the maximum policy cap of ₹5,000. Remaining ₹${cost - 5000} balance payable separately.`,
                createdAt: t.createdAt || 'Recent',
              };
            });
            setClaims((prev) => {
              const combined = [...mapped];
              for (const c of prev) {
                if (!combined.some((x) => x.id === c.id || x.claimId === c.claimId)) {
                  combined.push(c);
                }
              }
              return combined;
            });
          }
        }
      })
      .catch(() => {});
  }, []);

  const handleSubmitClaim = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClaimItem.trim() || !newClaimCost) return;
    setIsSubmittingClaim(true);

    const costNum = Math.abs(parseInt(newClaimCost, 10)) || 500;
    const approvedAmt = Math.min(costNum, 5000);
    const status: 'APPROVED' | 'PARTIAL' = costNum <= 5000 ? 'APPROVED' : 'PARTIAL';
    const verdictText =
      costNum <= 5000
        ? `Approved: ₹${costNum.toLocaleString('en-IN')} is within ₹5,000 accidental protection limit. Landlord reimbursed from protection fund; student deposit untouched.`
        : `Partial Approval: UniNest covers the maximum policy cap of ₹5,000. Remaining ₹${(costNum - 5000).toLocaleString('en-IN')} balance payable separately.`;

    try {
      const res = await fetch('/api/demo/maintenance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: 'ACCIDENTAL_DAMAGE',
          issue: `Accidental Micro-Damage Claim: ${newClaimItem} (₹${costNum}) - ${newClaimDesc || 'Minor accidental crack/wear during normal tenancy.'}`,
          priority: 'MEDIUM',
          reportedBy: 'Rahul Sharma',
          estimatedCost: costNum,
          photoFileName: 'damage_evidence.jpg',
        }),
      });
      const data = await res.json().catch(() => ({}));
      const newId = data?.ticket?.id || `clm-${Date.now()}`;

      const newClaim: DamageProtectionClaim = {
        id: newId,
        claimId: `CLM-2026-${Math.floor(100 + Math.random() * 900)}`,
        item: newClaimItem,
        incidentType: newClaimType,
        description: newClaimDesc || 'Accidental micro-damage during tenancy.',
        estimatedCost: costNum,
        approvedAmount: approvedAmt,
        status,
        verdict: verdictText,
        createdAt: 'Just now',
      };

      setClaims((prev) => [newClaim, ...prev]);
      setShowClaimModal(false);
      setNewClaimItem('');
      setNewClaimCost('');
      setNewClaimDesc('');
    } catch (err) {
      console.error('Failed to submit claim:', err);
    } finally {
      setIsSubmittingClaim(false);
    }
  };

  const totalUsedCoverage = claims.reduce(
    (acc, c) => acc + (c.status !== 'REJECTED' ? c.approvedAmount : 0),
    0
  );
  const remainingCoverage = Math.max(0, 5000 - totalUsedCoverage);

  useEffect(() => {
    try {
      localStorage.removeItem('uninest_preview_demo_data');
    } catch {}
    if (userEmail) {
      const demo = isDemoAccountEmail(userEmail);
      const activeStay = localStorage.getItem(`uninest_active_stay_${userEmail}`);
      setIsDemo(demo || Boolean(activeStay));
      return;
    }

    fetch('/api/profile')
      .then((res) => res.json())
      .then((data) => {
        const email = data?.email || data?.user?.email || '';
        const demo = isDemoAccountEmail(email);
        const activeStay = email ? localStorage.getItem(`uninest_active_stay_${email}`) : null;
        setIsDemo(demo || Boolean(activeStay));
      })
      .catch(() => {
        setIsDemo(false);
      });
  }, [userEmail]);

  if (!isDemo) {
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
        <div className="bg-surface border border-border p-8 rounded-2xl text-center shadow-sm space-y-4">
          <p className="text-sm text-text-secondary max-w-md mx-auto">
            No active tenancy — Book and complete move-in to see your stay details here.
          </p>
          <div className="flex items-center justify-center">
            <a
              href="/student/search"
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors"
            >
              Find &amp; Book a PG
            </a>
          </div>
        </div>
      </div>
    );
  }

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
            <h2 className="text-xl font-bold text-text-primary">PCTE Smart Student Residency</h2>
            <p className="text-sm text-text-secondary">Plot 42, Opp. PCTE Campus, Ferozepur Road, Ludhiana</p>
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
            <span className="text-xs text-text-secondary">+91 98989 89801</span>
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
            91% MATCH SCORE
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Roommate Profile Card */}
          <Card className="md:col-span-1 space-y-4 border-l-4 border-l-brand-600">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-brand-100 flex items-center justify-center font-bold text-brand-700 text-lg">
                AV
              </div>
              <div>
                <h3 className="font-bold text-text-primary">Aman Verma</h3>
                <p className="text-xs text-text-secondary">B.Tech CSE · 2nd Year (PCTE)</p>
                <Badge variant="outline" className="text-[10px] mt-1">Bed 204-A-2</Badge>
              </div>
            </div>

            <div className="pt-2 border-t border-border space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-text-tertiary">Sleep Schedule</span>
                <span className="font-semibold text-text-primary">Night Owl (12 AM - 8 AM)</span>
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
              Why Rahul & Aman Are a 91% Match
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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div>
            <h2 className="text-lg font-bold text-text-primary flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-brand-600 shrink-0" />
              <span>Up to ₹5,000 Accidental Micro-Damage Protection</span>
            </h2>
            <p className="text-xs text-text-secondary">
              UniNest automatically covers up to ₹5,000 in minor accidental property damage per tenancy
            </p>
          </div>
          <Badge variant="outline" className="font-mono text-brand-700 bg-brand-50/80 self-start sm:self-auto shrink-0">
            PROTECTION: ₹5,000 ACTIVE
          </Badge>
        </div>

        <Card className="space-y-6">
          {/* Protection Plan Live Status Banner */}
          <div className="p-4 sm:p-5 bg-brand-50/60 rounded-2xl border border-brand-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-xs font-bold text-brand-800 uppercase tracking-wider">
                Protection Plan Status
              </span>
              <h3 className="text-base font-extrabold text-slate-900">Fully Active · Zero Student Co-Pay</h3>
              <p className="text-xs text-slate-600 max-w-xl">
                Protects your security deposit against accidental door/fixture damage, minor leaks, or wall scuffs.
                Claims are automatically reviewed and synchronized with the Landlord &amp; Admin trust portals.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-brand-200/50">
              <div className="text-left sm:text-right">
                <div className="text-xs font-bold text-slate-900">
                  Used: ₹{totalUsedCoverage.toLocaleString('en-IN')} / ₹5,000
                </div>
                <div className="text-[11px] text-emerald-700 font-semibold">
                  Remaining: ₹{remainingCoverage.toLocaleString('en-IN')}
                </div>
              </div>
              <Button
                size="sm"
                onClick={() => setShowClaimModal(true)}
                className="bg-brand-600 hover:bg-brand-700 text-white font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>File Damage Claim</span>
              </Button>
            </div>
          </div>

          {/* Active Protection Claims List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                <Wrench className="w-4 h-4 text-brand-600" />
                <span>Registered Protection Claims (Live DB Synced)</span>
              </h3>
              <span className="text-xs text-slate-500 font-medium">
                {claims.length} {claims.length === 1 ? 'Record' : 'Records'}
              </span>
            </div>

            <div className="space-y-2.5">
              {claims.map((c) => (
                <div
                  key={c.id}
                  className="p-3.5 sm:p-4 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-all space-y-2 shadow-xs"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">
                        {c.claimId}
                      </span>
                      <span className="font-extrabold text-sm text-slate-900">{c.item}</span>
                      <span className="text-xs text-slate-400">• {c.incidentType}</span>
                    </div>
                    <div className="flex items-center gap-2 self-start sm:self-auto">
                      <Badge
                        variant={c.status === 'APPROVED' ? 'success' : c.status === 'PARTIAL' ? 'warning' : 'outline'}
                        size="sm"
                        className="font-bold"
                      >
                        {c.status === 'APPROVED'
                          ? '100% ESCROW COVERED'
                          : c.status === 'PARTIAL'
                          ? 'PARTIAL CAP COVERAGE'
                          : c.status}
                      </Badge>
                      <span className="text-xs font-extrabold text-slate-900">
                        ₹{c.estimatedCost.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">{c.description}</p>

                  <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 flex items-start gap-2 text-xs">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span className="text-slate-700">{c.verdict}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Policy Assessment Precedents Grid */}
          <div className="pt-2 border-t border-slate-100 space-y-3">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900">Policy Claim Assessment Guidelines &amp; Precedents</h3>
              <p className="text-xs text-slate-500">
                Tap each scenario to see how UniNest assesses accidental damage vs normal wear &amp; tear or intentional vandalism:
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
              <button
                type="button"
                onClick={() => setClaimScenario('ACCIDENTAL_700')}
                className={`p-3 rounded-xl border text-left text-xs space-y-1.5 transition-all ${
                  claimScenario === 'ACCIDENTAL_700'
                    ? 'border-brand-600 bg-brand-50/80 shadow-xs ring-1 ring-brand-500'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="font-extrabold text-slate-900">₹700 Tap Leaking</div>
                <div className="text-[11px] text-slate-500">Accidental fixture strain</div>
                <Badge variant="success" size="sm" className="mt-1 font-bold">
                  APPROVE ₹700
                </Badge>
              </button>

              <button
                type="button"
                onClick={() => setClaimScenario('ACCIDENTAL_8000')}
                className={`p-3 rounded-xl border text-left text-xs space-y-1.5 transition-all ${
                  claimScenario === 'ACCIDENTAL_8000'
                    ? 'border-brand-600 bg-brand-50/80 shadow-xs ring-1 ring-brand-500'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="font-extrabold text-slate-900">₹8,000 Door Break</div>
                <div className="text-[11px] text-slate-500">Eligible accident over limit</div>
                <Badge variant="warning" size="sm" className="mt-1 font-bold">
                  CAP AT ₹5,000
                </Badge>
              </button>

              <button
                type="button"
                onClick={() => setClaimScenario('INTENTIONAL')}
                className={`p-3 rounded-xl border text-left text-xs space-y-1.5 transition-all ${
                  claimScenario === 'INTENTIONAL'
                    ? 'border-brand-600 bg-brand-50/80 shadow-xs ring-1 ring-brand-500'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="font-extrabold text-slate-900">Wall Punch Damage</div>
                <div className="text-[11px] text-slate-500">Vandalism / Intentional</div>
                <Badge variant="danger" size="sm" className="mt-1 font-bold">
                  REJECT
                </Badge>
              </button>

              <button
                type="button"
                onClick={() => setClaimScenario('PRE_EXISTING')}
                className={`p-3 rounded-xl border text-left text-xs space-y-1.5 transition-all ${
                  claimScenario === 'PRE_EXISTING'
                    ? 'border-brand-600 bg-brand-50/80 shadow-xs ring-1 ring-brand-500'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="font-extrabold text-slate-900">Pre-Existing Scratch</div>
                <div className="text-[11px] text-slate-500">Logged in Move-in Report</div>
                <Badge variant="default" size="sm" className="mt-1 font-bold">
                  REJECT (NO CHARGE)
                </Badge>
              </button>

              <button
                type="button"
                onClick={() => setClaimScenario('WEAR_TEAR')}
                className={`p-3 rounded-xl border text-left text-xs space-y-1.5 transition-all ${
                  claimScenario === 'WEAR_TEAR'
                    ? 'border-brand-600 bg-brand-50/80 shadow-xs ring-1 ring-brand-500'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="font-extrabold text-slate-900">Normal Paint Fading</div>
                <div className="text-[11px] text-slate-500">Normal Wear &amp; Tear</div>
                <Badge variant="default" size="sm" className="mt-1 font-bold">
                  LANDLORD RESPONSIBILITY
                </Badge>
              </button>
            </div>

            {/* Selected Assessment Precedent Verdict */}
            {claimScenario && (
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/80 text-xs space-y-2">
                <div className="flex items-center gap-2 font-bold">
                  {claimScenario === 'ACCIDENTAL_700' && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                  {claimScenario === 'ACCIDENTAL_8000' && <AlertTriangle className="w-4 h-4 text-amber-600" />}
                  {(claimScenario === 'INTENTIONAL' || claimScenario === 'PRE_EXISTING' || claimScenario === 'WEAR_TEAR') && (
                    <XCircle className="w-4 h-4 text-red-600" />
                  )}
                  <span className="text-slate-900">Precedent Verdict &amp; Legal Adjudication:</span>
                </div>
                <p className="text-slate-600 leading-relaxed">
                  {claimScenario === 'ACCIDENTAL_700' &&
                    'Approved: ₹700 is within the ₹5,000 accidental protection limit. Landlord is reimbursed directly from the UniNest escrow protection fund; the student security deposit is untouched.'}
                  {claimScenario === 'ACCIDENTAL_8000' &&
                    'Partial Approval: UniNest covers the maximum policy cap of ₹5,000. The remaining ₹3,000 balance is payable by tenant or deposit adjustment with mutual consent.'}
                  {claimScenario === 'INTENTIONAL' &&
                    'Rejected: Damage determined to be intentional vandalism. Tenant is personally liable for 100% of the replacement/repair cost under the master lease deed.'}
                  {claimScenario === 'PRE_EXISTING' &&
                    'Rejected (Zero Charge): Move-in Condition Report (DOC-MIN-2026) signed during handover proves scratch existed prior to move-in. Tenant is completely cleared of liability.'}
                  {claimScenario === 'WEAR_TEAR' &&
                    'Rejected (Landlord Obligation): Paint aging and hairline cosmetic wear are classified as normal wear and tear under Punjab rental guidelines. Landlord handles maintenance without tenant cost.'}
                </p>
              </div>
            )}
          </div>
        </Card>

        {/* Claim Submission Modal */}
        <Modal
          isOpen={showClaimModal}
          onClose={() => setShowClaimModal(false)}
          title="File Accidental Micro-Damage Protection Claim"
          description="Registered under UniNest ₹5,000 Zero-Copay Protection Policy"
          size="md"
        >
          <form onSubmit={handleSubmitClaim} className="p-4 sm:p-6 space-y-4">
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-2.5">
              <Shield className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
              <div className="text-xs text-emerald-900">
                <strong>Zero Co-Pay Coverage:</strong> Minor accidental damages up to ₹5,000 are covered by the UniNest
                escrow pool without reducing your security deposit.
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Damaged Item / Fixture</label>
              <input
                type="text"
                required
                placeholder="e.g. Bathroom Tap Diverter, Study Table Hinge, Door Latch"
                value={newClaimItem}
                onChange={(e) => setNewClaimItem(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Incident Category</label>
                <select
                  value={newClaimType}
                  onChange={(e) => setNewClaimType(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none bg-white"
                >
                  <option value="Accidental Fixture Strain">Accidental Fixture Strain</option>
                  <option value="Minor Plumbing Leak">Minor Plumbing Leak</option>
                  <option value="Door / Window Hardware Failure">Door / Window Hardware Failure</option>
                  <option value="Accidental Furniture Crack">Accidental Furniture Crack</option>
                  <option value="Wall Paint Scuff">Wall Paint Scuff</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Estimated Repair Cost (₹)</label>
                <input
                  type="number"
                  required
                  min="100"
                  max="20000"
                  placeholder="e.g. 700"
                  value={newClaimCost}
                  onChange={(e) => setNewClaimCost(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Description of Incident</label>
              <textarea
                rows={3}
                required
                placeholder="Briefly explain what occurred accidentally and what repair is required..."
                value={newClaimDesc}
                onChange={(e) => setNewClaimDesc(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-200">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowClaimModal(false)}
                disabled={isSubmittingClaim}
                className="text-xs font-bold"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={isSubmittingClaim}
                className="bg-brand-600 hover:bg-brand-700 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-sm"
              >
                {isSubmittingClaim ? (
                  <span>Recording Claim...</span>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Submit &amp; Sync with Landlord</span>
                  </>
                )}
              </Button>
            </div>
          </form>
        </Modal>
      </section>
    </div>
  );
}
