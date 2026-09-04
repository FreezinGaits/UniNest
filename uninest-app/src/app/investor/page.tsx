'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Building2, ArrowRight, ChevronRight, Users, TrendingUp, BarChart3, CreditCard, ShieldCheck, Target, DollarSign, CheckCircle2, AlertTriangle, Lightbulb, PieChart, ArrowLeft } from 'lucide-react';

const ASSUMPTIONS = {
  bookingFee: 399, landlordSuccessFee: 500, monthlyPaymentFee: 50,
  avgMonthsRetained: 8, ancillaryPerMonth: 150, directCostPerStudent: 120,
  cac: 200, refundRate: 0.05, gatewayPct: 0.02, supportCostPerStudent: 80,
};

function UnitEcon({ a }: { a: typeof ASSUMPTIONS }) {
  const rev = a.bookingFee + a.landlordSuccessFee + (a.monthlyPaymentFee * a.avgMonthsRetained) + (a.ancillaryPerMonth * a.avgMonthsRetained);
  const cost = a.directCostPerStudent + (a.bookingFee * a.refundRate) + (rev * a.gatewayPct) + a.supportCostPerStudent;
  const contribution = rev - cost;
  const margin = rev > 0 ? (contribution / rev * 100) : 0;
  const ltv = rev;
  const ltvCac = a.cac > 0 ? (ltv / a.cac) : 0;
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      {[
        { l: 'Revenue / Student', v: `₹${rev.toFixed(0)}` },
        { l: 'Direct Cost', v: `₹${cost.toFixed(0)}` },
        { l: 'Contribution', v: `₹${contribution.toFixed(0)}` },
        { l: 'Margin', v: `${margin.toFixed(1)}%` },
        { l: 'LTV', v: `₹${ltv.toFixed(0)}` },
        { l: 'LTV:CAC', v: `${ltvCac.toFixed(1)}x` },
      ].map(m => (
        <div key={m.l} className="bg-white border border-gray-200 rounded-xl p-4 text-center">
          <p className="text-xs text-gray-500 mb-1">{m.l}</p>
          <p className="text-xl font-bold text-gray-900">{m.v}</p>
        </div>
      ))}
    </div>
  );
}

const SCENARIOS = [
  { name: 'Conservative', campuses: 1, pgsPerCampus: 10, bedsPerPg: 20, occupancy: 0.5, ancillaryAdoption: 0.2, subConversion: 0.1 },
  { name: 'Base', campuses: 1, pgsPerCampus: 20, bedsPerPg: 25, occupancy: 0.65, ancillaryAdoption: 0.35, subConversion: 0.2 },
  { name: 'Upside', campuses: 2, pgsPerCampus: 25, bedsPerPg: 30, occupancy: 0.8, ancillaryAdoption: 0.5, subConversion: 0.35 },
];

const FUND_ALLOC = [
  { cat: 'Product & Infrastructure', pct: 25 },
  { cat: 'Pilot Operations', pct: 15 },
  { cat: 'Property Verification', pct: 15 },
  { cat: 'Student Acquisition', pct: 15 },
  { cat: 'Landlord Acquisition', pct: 10 },
  { cat: 'Legal & Compliance', pct: 5 },
  { cat: 'Branding & Demo', pct: 10 },
  { cat: 'Contingency', pct: 5 },
];

export default function InvestorPage() {
  const [a, setA] = useState(ASSUMPTIONS);

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-sm text-gray-500 hover:text-brand-600"><ArrowLeft className="w-4 h-4" /> UniNest</Link>
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Investor Demo</span>
          <Link href="/demo" className="text-sm font-medium text-brand-600">Product Demo →</Link>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-4 py-12 space-y-16">

        {/* Hero */}
        <section className="text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-brand-50 border border-brand-200 rounded-full text-xs font-semibold text-brand-700 mb-4">Pre-Seed · ₹1,00,000 Pilot</div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 leading-tight">UniNest</h1>
          <p className="text-xl text-gray-500 mt-3 max-w-xl mx-auto">The operating system for student housing — connecting students, landlords, colleges, and service providers.</p>
        </section>

        {/* Problem */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2"><AlertTriangle className="w-6 h-6 text-red-500" /> The Problem</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-white border rounded-xl p-5">
              <h3 className="font-bold text-gray-800 mb-3">Students</h3>
              <ul className="space-y-2 text-sm text-gray-600">{['Unverified listings with hidden costs', 'Lost deposits with no recourse', 'Manual rent via cash/screenshots', 'No maintenance accountability'].map(i => <li key={i} className="flex gap-2"><span className="text-red-400">✕</span>{i}</li>)}</ul>
            </div>
            <div className="bg-white border rounded-xl p-5">
              <h3 className="font-bold text-gray-800 mb-3">Landlords</h3>
              <ul className="space-y-2 text-sm text-gray-600">{['High vacancy periods', 'Rent collection delays', 'Electricity dispute headaches', 'No platform value after PG is full'].map(i => <li key={i} className="flex gap-2"><span className="text-amber-400">✕</span>{i}</li>)}</ul>
            </div>
          </div>
        </section>

        {/* Solution */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2"><Lightbulb className="w-6 h-6 text-brand-500" /> The Solution</h2>
          <div className="bg-white border rounded-xl p-6">
            <p className="text-gray-700 mb-4">UniNest digitizes the complete rental lifecycle: <strong>Find → Verify → Book → Live → Pay → Manage → Earn → Repeat</strong></p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[{ l: 'For Students', d: 'Search, book, pay, maintain — one app' }, { l: 'For Landlords', d: 'Tenants, rent, utilities, earnings' }, { l: 'For Colleges', d: 'Student housing oversight' }, { l: 'For Providers', d: 'Service dispatch & payouts' }].map(r => (
                <div key={r.l} className="bg-brand-50 rounded-lg p-3"><p className="text-xs font-bold text-brand-700">{r.l}</p><p className="text-[11px] text-brand-600 mt-1">{r.d}</p></div>
              ))}
            </div>
          </div>
        </section>

        {/* Landlord Retention */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Why Landlords Stay After PG is Full</h2>
          <p className="text-sm text-gray-500 mb-6">UniNest becomes the operating layer — not just an acquisition channel.</p>
          <div className="flex flex-wrap gap-2 justify-center">
            {['Rent Collection', 'Electricity', 'Maintenance', 'Verification', 'Agreements', 'Services + Rewards', 'Analytics', 'Vacancy → Refill'].map((s,i) => (
              <div key={s} className="flex items-center gap-1">
                <span className="bg-brand-100 text-brand-800 text-xs font-semibold px-3 py-1.5 rounded-full">{s}</span>
                {i < 7 && <ChevronRight className="w-3 h-3 text-gray-300" />}
              </div>
            ))}
          </div>
        </section>

        {/* Unit Economics */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-2"><DollarSign className="w-6 h-6 text-brand-500" /> Unit Economics Calculator</h2>
          <p className="text-xs text-gray-400 mb-6">All numbers are illustrative assumptions — not historical actuals. Adjust inputs below.</p>
          <div className="grid sm:grid-cols-2 gap-6">
            <div className="bg-white border rounded-xl p-5 space-y-3">
              <h3 className="font-bold text-sm text-gray-700 mb-2">Inputs (Configurable)</h3>
              {Object.entries(a).map(([k, v]) => (
                <div key={k} className="flex items-center justify-between gap-3">
                  <label className="text-xs text-gray-500 flex-1">{k.replace(/([A-Z])/g, ' $1').trim()}</label>
                  <input type="number" value={v} onChange={e => setA(p => ({ ...p, [k]: Number(e.target.value) }))}
                    className="w-20 text-right text-sm font-mono border border-gray-200 rounded px-2 py-1" />
                </div>
              ))}
            </div>
            <div>
              <h3 className="font-bold text-sm text-gray-700 mb-3">Outputs</h3>
              <UnitEcon a={a} />
            </div>
          </div>
        </section>

        {/* Business Scenarios */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2"><BarChart3 className="w-6 h-6 text-brand-500" /> Business Scenarios</h2>
          <div className="grid md:grid-cols-3 gap-4">
            {SCENARIOS.map(s => {
              const beds = s.campuses * s.pgsPerCampus * s.bedsPerPg;
              const students = Math.round(beds * s.occupancy);
              const bookingRev = students * a.bookingFee;
              const rentRev = students * a.monthlyPaymentFee * a.avgMonthsRetained;
              const ancRev = Math.round(students * s.ancillaryAdoption * a.ancillaryPerMonth * a.avgMonthsRetained);
              const subRev = Math.round(s.campuses * s.pgsPerCampus * s.subConversion * 499 * 12);
              const totalRev = bookingRev + rentRev + ancRev + subRev;
              return (
                <div key={s.name} className={`bg-white border rounded-xl p-5 ${s.name === 'Base' ? 'border-brand-300 ring-2 ring-brand-100' : ''}`}>
                  <h3 className="font-bold text-gray-800 mb-3">{s.name}</h3>
                  <div className="space-y-1.5 text-sm">
                    <div className="flex justify-between"><span className="text-gray-500">Campuses</span><span className="font-semibold">{s.campuses}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">Total Beds</span><span className="font-semibold">{beds}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">Active Students</span><span className="font-semibold">{students}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">Occupancy</span><span className="font-semibold">{(s.occupancy*100)}%</span></div>
                    <div className="border-t my-2" />
                    <div className="flex justify-between"><span className="text-gray-500">Est. Annual Revenue</span><span className="font-bold text-brand-700">₹{(totalRev/1000).toFixed(0)}K</span></div>
                  </div>
                </div>
              );
            })}
          </div>
          <p className="text-[11px] text-gray-400 text-center mt-3">All scenarios use configurable assumptions above. Numbers are estimates, not projections.</p>
        </section>

        {/* Funding Ask */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">₹1,00,000 Pilot Funding Plan</h2>
          <p className="text-xs text-gray-400 mb-6">Proposed pilot allocation — not an audited budget</p>
          <div className="bg-white border rounded-xl p-6">
            <div className="space-y-2">
              {FUND_ALLOC.map(f => (
                <div key={f.cat} className="flex items-center gap-3">
                  <span className="text-xs text-gray-600 w-40 flex-shrink-0">{f.cat}</span>
                  <div className="flex-1 bg-gray-100 rounded-full h-5 overflow-hidden">
                    <div className="h-full bg-brand-500 rounded-full flex items-center justify-end pr-2" style={{ width: `${f.pct}%` }}>
                      <span className="text-[10px] font-bold text-white">{f.pct}%</span>
                    </div>
                  </div>
                  <span className="text-xs font-mono text-gray-700 w-16 text-right">₹{(f.pct * 1000).toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Milestones */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Pilot Success Gates</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {[
              { gate: 'Supply', target: '50 verified beds', metric: 'Beds onboarded' },
              { gate: 'Demand', target: '100 enquiries', metric: 'Student leads' },
              { gate: 'Conversion', target: '20% booking rate', metric: 'Enquiry → Book' },
              { gate: 'Retention', target: '80% landlord active', metric: 'After 3 months' },
              { gate: 'Economics', target: 'Positive contribution', metric: 'Per-student' },
            ].map((g, i) => (
              <div key={g.gate} className="bg-white border rounded-xl p-4 text-center">
                <div className="text-xs font-bold text-brand-600 mb-1">GATE {i + 1}</div>
                <div className="font-bold text-gray-900 text-sm">{g.gate}</div>
                <div className="text-xs text-gray-500 mt-2">{g.target}</div>
                <div className="text-[11px] text-gray-400 mt-1">{g.metric}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Traction */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Traction & Validation</h2>
          <div className="grid sm:grid-cols-4 gap-3">
            {[
              { label: 'Actual', value: '0 live transactions', bg: 'bg-gray-50 border-gray-200' },
              { label: 'Demo', value: '60 seeded beds', bg: 'bg-blue-50 border-blue-200' },
              { label: 'Pilot Target', value: '50 move-ins', bg: 'bg-amber-50 border-amber-200' },
              { label: 'Year 1 Target', value: '200 active students', bg: 'bg-brand-50 border-brand-200' },
            ].map(t => (
              <div key={t.label} className={`border rounded-xl p-4 text-center ${t.bg}`}>
                <p className="text-[11px] font-semibold uppercase text-gray-500 mb-1">{t.label}</p>
                <p className="font-bold text-gray-900 text-sm">{t.value}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Moat */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Potential Moat</h2>
          <p className="text-xs text-gray-400 mb-4">To be built through execution — not yet defensible</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {['Campus-cluster density', 'Verified local PG supply', 'Landlord relationships', 'Student lifecycle data', 'Property/tenancy history', 'Campus distribution', 'Ancillary-service network', 'Landlord financial incentives'].map(m => (
              <div key={m} className="bg-white border rounded-lg p-3 text-center text-xs font-medium text-gray-700">{m}</div>
            ))}
          </div>
        </section>

        {/* Risks */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Risk & Mitigation</h2>
          <div className="bg-white border rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead><tr className="bg-gray-50 border-b"><th className="text-left px-4 py-2 text-xs text-gray-500">Risk</th><th className="text-left px-4 py-2 text-xs text-gray-500">Mitigation</th></tr></thead>
              <tbody>
                {[
                  ['Low initial supply', 'Campus-cluster focus; direct landlord outreach'],
                  ['Platform leakage', 'Post-booking value (rent, utilities, services) retains users'],
                  ['Rent defaults', 'Automated reminders; landlord visibility; deposit protection'],
                  ['Seasonality', 'Mid-year transfers; ancillary services are year-round'],
                  ['Competitor response', 'Deep post-booking integration is hard to replicate quickly'],
                ].map(([r, m]) => (
                  <tr key={r} className="border-b border-gray-50"><td className="px-4 py-2.5 font-medium text-gray-700">{r}</td><td className="px-4 py-2.5 text-gray-600">{m}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* What We Are Not */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">What UniNest Is — and Is Not</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-red-50 border border-red-100 rounded-xl p-5">
              <h3 className="font-bold text-red-800 text-sm mb-3">UniNest is NOT</h3>
              <ul className="space-y-1.5 text-sm text-red-700">{['A landlord or property owner', 'A master lessee', 'A lender or insurer', 'A court or police authority'].map(i => <li key={i}>✕ {i}</li>)}</ul>
            </div>
            <div className="bg-brand-50 border border-brand-100 rounded-xl p-5">
              <h3 className="font-bold text-brand-800 text-sm mb-3">UniNest IS</h3>
              <ul className="space-y-1.5 text-sm text-brand-700">{['A technology marketplace & facilitator', 'A rental operating layer for landlords', 'A service coordination platform', 'A student housing lifecycle engine'].map(i => <li key={i}>✓ {i}</li>)}</ul>
            </div>
          </div>
        </section>

        {/* Roadmap */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Roadmap: Future Without Overpromising</h2>
          <div className="grid md:grid-cols-3 gap-4">
            {[
              { phase: 'NOW — MVP', items: ['Verified PG listings', 'Bed-level booking', 'KYC & agreements (demo)', 'Rent collection', 'Basic utilities & maintenance'] },
              { phase: 'NEXT — Phase 2', items: ['AutoPay integration', 'Roommate matching', 'Ancillary marketplace', 'Landlord earnings dashboard', 'Advanced dispute workflow'] },
              { phase: 'LATER — Phase 3+', items: ['Smart meter IoT', 'Official API integrations', 'Financing partnerships', 'Multi-city expansion', 'Predictive analytics'] },
            ].map(p => (
              <div key={p.phase} className="bg-white border rounded-xl p-5">
                <h3 className="font-bold text-brand-700 text-sm mb-3">{p.phase}</h3>
                <ul className="space-y-1.5">{p.items.map(i => <li key={i} className="text-sm text-gray-600 flex gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-brand-400 mt-0.5 flex-shrink-0" />{i}</li>)}</ul>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="bg-brand-600 rounded-2xl p-8 text-center">
          <h2 className="text-2xl font-bold text-white mb-2">See the Product in Action</h2>
          <p className="text-brand-100 text-sm mb-6">Walk through the complete student → landlord → admin lifecycle.</p>
          <Link href="/demo" className="inline-flex items-center gap-2 px-6 py-3 bg-white text-brand-700 font-semibold rounded-xl hover:bg-brand-50">
            Launch Product Demo <ArrowRight className="w-4 h-4" />
          </Link>
        </section>
      </div>
    </div>
  );
}
