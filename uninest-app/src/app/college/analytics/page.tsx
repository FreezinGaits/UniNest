'use client';

import React, { useState } from 'react';
import { Card, StatCard } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { formatINR } from '@/lib/utils';
import {
  BarChart3,
  ShieldCheck,
  Users,
  Printer,
  Navigation,
  IndianRupee,
  FileCheck2,
  CheckCircle2,
  Award,
} from 'lucide-react';

export default function CollegeHousingAnalyticsPage() {
  const [exportTimestamp, setExportTimestamp] = useState<string | null>(null);

  const handlePrintComplianceReport = () => {
    setExportTimestamp(new Date().toLocaleTimeString('en-IN'));
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="purple" size="sm" dot>
              PCTE Housing Cell • pcte@uninest.in
            </Badge>
            <Badge variant="success" size="sm">
              AICTE &amp; NAAC Criterion-7 Ready
            </Badge>
          </div>
          <h1 className="text-2xl font-bold text-text-primary">
            Institutional Housing Analytics &amp; AICTE/NAAC Compliance
          </h1>
          <p className="text-text-secondary mt-1 text-sm">
            PCTE Institute of Technology (Ludhiana) • Off-Campus Student Safety Coverage, Gender Distribution &amp; Rent Affordability Audit
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handlePrintComplianceReport}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-brand-600 hover:bg-brand-700 text-white shadow-sm transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            Print / Export NAAC &amp; AICTE Off-Campus Housing Compliance Report
          </button>
        </div>
      </div>

      {exportTimestamp && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between text-xs font-medium text-emerald-800">
          <span className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            Official NAAC &amp; AICTE Off-Campus Housing Compliance Dossier prepared for print/PDF export at {exportTimestamp}.
          </span>
          <button
            onClick={() => setExportTimestamp(null)}
            className="underline hover:text-emerald-950"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Top KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Police Form-11 Verified"
          value="94.2%"
          subtitle="1,695 of 1,800 off-campus students"
          icon={<ShieldCheck className="w-5 h-5" />}
          trend={{ value: '6.8% YoY compliance gain', positive: true }}
          color="brand"
        />
        <StatCard
          title="Gender Distribution"
          value="1,040B / 760G"
          subtitle="57.8% Boys • 42.2% Girls"
          icon={<Users className="w-5 h-5" />}
          color="purple"
        />
        <StatCard
          title="Median Monthly PG Tariff"
          value={formatINR(615000)}
          subtitle="83% within ₹4,500–₹6,500 band"
          icon={<IndianRupee className="w-5 h-5" />}
          color="blue"
        />
        <StatCard
          title="Walkable Commute (< 1 km)"
          value="64%"
          subtitle="1,152 students near Gate 1 & Gate 2"
          icon={<Navigation className="w-5 h-5" />}
          color="brand"
        />
      </div>

      {/* Main Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Card 1: Off-Campus Safety & Verification Coverage */}
        <Card padding="lg" className="space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-text-primary flex items-center gap-2">
                <FileCheck2 className="w-4 h-4 text-brand-600" />
                Off-Campus Safety &amp; Verification Coverage
              </h2>
              <p className="text-xs text-text-secondary mt-0.5">
                Ludhiana Police Form-11, Parent Consent &amp; Fire NOC audit across 1,800 students
              </p>
            </div>
            <Badge variant="success" size="md">
              94.2% Police Form-11 Verified
            </Badge>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="font-semibold text-text-primary">
                  Punjab Police Form-11 Tenant Verification
                </span>
                <span className="font-bold text-emerald-700">94.2% (1,695 / 1,800)</span>
              </div>
              <div className="w-full h-3 bg-surface-tertiary rounded-full overflow-hidden">
                <div className="h-full bg-emerald-600 rounded-full" style={{ width: '94.2%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="font-semibold text-text-primary">
                  Counter-Signed Parent / Guardian Consent Mandate
                </span>
                <span className="font-bold text-brand-700">96.8% (1,742 / 1,800)</span>
              </div>
              <div className="w-full h-3 bg-surface-tertiary rounded-full overflow-hidden">
                <div className="h-full bg-brand-600 rounded-full" style={{ width: '96.8%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="font-semibold text-text-primary">
                  24x7 CCTV &amp; Biometric Curfew Integration
                </span>
                <span className="font-bold text-purple-700">91.5% (Partner PGs)</span>
              </div>
              <div className="w-full h-3 bg-surface-tertiary rounded-full overflow-hidden">
                <div className="h-full bg-purple-600 rounded-full" style={{ width: '91.5%' }} />
              </div>
            </div>
          </div>
        </Card>

        {/* Card 2: Gender-wise Off-Campus Distribution */}
        <Card padding="lg" className="space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-text-primary flex items-center gap-2">
                <Users className="w-4 h-4 text-purple-600" />
                Gender-wise Off-Campus Distribution
              </h2>
              <p className="text-xs text-text-secondary mt-0.5">
                Total Off-Campus Cohort: 1,800 Enrolled Students (Academic Year 2026–27)
              </p>
            </div>
            <Badge variant="purple" size="sm">
              100% Girls in Audited Enclaves
            </Badge>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200">
              <p className="text-xs font-semibold text-blue-800 uppercase">Boys Off-Campus</p>
              <p className="text-2xl font-bold text-blue-950 mt-1">Boys: 1,040</p>
              <p className="text-xs text-blue-700 mt-1">57.8% of Off-Campus Roster</p>
              <p className="text-[11px] text-blue-600 mt-2">
                Primary Clusters: Baddowal, Passi Nagar, BRS Nagar
              </p>
            </div>

            <div className="p-4 rounded-xl bg-purple-50/70 border border-purple-200">
              <p className="text-xs font-semibold text-purple-800 uppercase">Girls Off-Campus</p>
              <p className="text-2xl font-bold text-purple-950 mt-1">Girls: 760</p>
              <p className="text-xs text-purple-700 mt-1">42.2% of Off-Campus Roster</p>
              <p className="text-[11px] text-purple-600 mt-2">
                Primary Clusters: Sarabha Link Enclave, BRS Nagar
              </p>
            </div>
          </div>

          {/* Combined Proportional Bar */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-blue-700">Boys: 1,040 (57.8%)</span>
              <span className="text-purple-700">Girls: 760 (42.2%)</span>
            </div>
            <div className="w-full h-4 bg-purple-500 rounded-full overflow-hidden flex">
              <div className="h-full bg-blue-600" style={{ width: '57.8%' }} />
            </div>
          </div>
        </Card>

        {/* Card 3: Rent Affordability Bands */}
        <Card padding="lg" className="space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-text-primary flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-brand-600" />
                Rent Affordability Bands
              </h2>
              <p className="text-xs text-text-secondary mt-0.5">
                Monthly tariff distribution across PCTE verified partner PGs (inclusive of Wi-Fi &amp; maintenance)
              </p>
            </div>
            <Badge variant="info" size="sm">
              Avg: {formatINR(615000)}/mo
            </Badge>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="font-semibold text-text-primary">
                  {formatINR(450000)}–{formatINR(550000)}: 32% (Standard Twin / Triple Sharing)
                </span>
                <span className="font-bold text-emerald-700">₹4,500–₹5,500: 32%</span>
              </div>
              <div className="w-full h-3 bg-surface-tertiary rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: '32%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="font-semibold text-text-primary">
                  {formatINR(550000)}–{formatINR(650000)}: 51% (Smart AC Residency Tier)
                </span>
                <span className="font-bold text-brand-700">₹5,500–₹6,500: 51%</span>
              </div>
              <div className="w-full h-3 bg-surface-tertiary rounded-full overflow-hidden">
                <div className="h-full bg-brand-600 rounded-full" style={{ width: '51%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="font-semibold text-text-primary">
                  {formatINR(650000)}+: 17% (Executive Single / Attached Balcony)
                </span>
                <span className="font-bold text-purple-700">₹6,500+: 17%</span>
              </div>
              <div className="w-full h-3 bg-surface-tertiary rounded-full overflow-hidden">
                <div className="h-full bg-purple-600 rounded-full" style={{ width: '17%' }} />
              </div>
            </div>
          </div>
        </Card>

        {/* Card 4: Commute Distance to Campus */}
        <Card padding="lg" className="space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-text-primary flex items-center gap-2">
                <Navigation className="w-4 h-4 text-emerald-600" />
                Commute Distance to Campus
              </h2>
              <p className="text-xs text-text-secondary mt-0.5">
                Radial distance from PCTE Campus Gate 1 (Baddowal) &amp; Gate 2 (Ferozepur Road)
              </p>
            </div>
            <Badge variant="success" size="sm">
              92% Within 3 km Radius
            </Badge>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="font-semibold text-text-primary">
                  Walkable Campus Belt (&lt; 1 km — Baddowal &amp; Passi Nagar)
                </span>
                <span className="font-bold text-emerald-700">&lt; 1 km: 64%</span>
              </div>
              <div className="w-full h-3 bg-surface-tertiary rounded-full overflow-hidden">
                <div className="h-full bg-emerald-600 rounded-full" style={{ width: '64%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="font-semibold text-text-primary">
                  Short Bike / E-Rickshaw Corridor (1–3 km — BRS Nagar &amp; Sarabha Link)
                </span>
                <span className="font-bold text-brand-700">1–3 km: 28%</span>
              </div>
              <div className="w-full h-3 bg-surface-tertiary rounded-full overflow-hidden">
                <div className="h-full bg-brand-600 rounded-full" style={{ width: '28%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="font-semibold text-text-primary">
                  College Bus / City Transit Zone (&gt; 3 km — Model Town &amp; Civil Lines)
                </span>
                <span className="font-bold text-amber-700">&gt; 3 km: 8%</span>
              </div>
              <div className="w-full h-3 bg-surface-tertiary rounded-full overflow-hidden">
                <div className="h-full bg-amber-500 rounded-full" style={{ width: '8%' }} />
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* NAAC & AICTE Institutional Certification Footer */}
      <Card padding="md" className="bg-brand-50/50 border-brand-200">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <Award className="w-6 h-6 text-brand-600 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-bold text-text-primary">
                AICTE Mandatory Disclosure &amp; NAAC Criterion-7 Student Support Attestation
              </h3>
              <p className="text-xs text-text-secondary mt-0.5">
                Prepared by PCTE Housing Cell (pcte@uninest.in) • All partner PG escrow ledgers, Form-11 police filings, and Fire Safety NOCs are digitally timestamped and auditable.
              </p>
            </div>
          </div>
          <Badge variant="success" size="md" dot>
            Verified Institutional Dossier
          </Badge>
        </div>
      </Card>
    </div>
  );
}
