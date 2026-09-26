import { Card, StatCard } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import {
  TrendingUp,
  IndianRupee,
  ShieldCheck,
  KeyRound,
  Building2,
  Layers,
} from 'lucide-react';

const REVENUE_STREAMS = [
  {
    stream: 'Stage-2 Move-In Success Fees (5% First Month Rent)',
    volume: '142 Confirmed Tenancies',
    gmv: '₹8,52,000',
    netRevenue: '₹1,14,200',
    takeRate: '13.4% Blended',
  },
  {
    stream: '₹399 72-Hour Visit Commitment Tokens & 15% Advance Holds',
    volume: '218 Bed Locks',
    gmv: '₹3,98,000',
    netRevenue: '₹42,800',
    takeRate: '10.7% Net Retained',
  },
  {
    stream: 'Landlord Verified Badge & Escrow SaaS Subscriptions',
    volume: '24 Verified PGs (Passi Residency, PAU Hub, etc.)',
    gmv: '₹1,20,000',
    netRevenue: '₹44,150',
    takeRate: 'SaaS Recurring',
  },
  {
    stream: 'QuickFix Services & Ancillary Vendor Commissions (15%)',
    volume: '274 SLA Jobs',
    gmv: '₹1,15,000',
    netRevenue: '₹17,250',
    takeRate: '15.0% Commission',
  },
];

const MICRO_MARKETS = [
  {
    cluster: 'PCTE Baddowal & Ferozepur Road Corridor',
    partnerCell: 'PCTE Housing Cell (pcte@uninest.in)',
    verifiedBeds: 340,
    occupancyRate: '94.2%',
    monthlyGmv: '₹6,95,000',
    avgRent: '₹6,000 / mo',
  },
  {
    cluster: 'PAU Gate 1 & Sarabha Nagar Cluster',
    partnerCell: 'PAU Student Welfare Desk',
    verifiedBeds: 280,
    occupancyRate: '91.8%',
    monthlyGmv: '₹4,80,000',
    avgRent: '₹6,200 / mo',
  },
  {
    cluster: 'GNDEC Gill Road Engineering Cluster',
    partnerCell: 'GNDEC Off-Campus Registry',
    verifiedBeds: 210,
    occupancyRate: '88.5%',
    monthlyGmv: '₹3,10,000',
    avgRent: '₹5,500 / mo',
  },
];

export default function AdminAnalyticsPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold text-text-primary">
              Platform GMV, Escrow Velocity & Unit Economics
            </h1>
            <Badge variant="success" dot>
              Q3 FY 2026-27 Live Metrics
            </Badge>
          </div>
          <p className="text-text-secondary mt-1">
            Executive financial performance across Ludhiana higher-education micro-markets (`PCTE`, `PAU`, `GNDEC`)
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Monthly Gross Merchandise Value"
          value="₹14,85,000"
          subtitle="Escrow rent + tokens + ancillary GMV"
          icon={<IndianRupee className="w-5 h-5" />}
          color="brand"
          trend={{ value: '24.8% MoM growth', positive: true }}
        />
        <StatCard
          title="Net Platform Revenue"
          value="₹2,18,400"
          subtitle="Tokens + Move-In Fees + SaaS + 15% SLA"
          icon={<TrendingUp className="w-5 h-5" />}
          color="purple"
          trend={{ value: '14.7% blended take-rate', positive: true }}
        />
        <StatCard
          title="Two-Stage OTP Conversion"
          value="91.4%"
          subtitle="Stage-1 Visit to Stage-2 Move-In"
          icon={<KeyRound className="w-5 h-5" />}
          color="blue"
        />
        <StatCard
          title="Zero-Fraud Escrow Protection"
          value="100%"
          subtitle="0 fake listing losses via UPI Escrow"
          icon={<ShieldCheck className="w-5 h-5" />}
          color="amber"
        />
      </div>

      <Card padding="none">
        <div className="px-5 py-4 border-b border-border flex items-center justify-between bg-surface-secondary/40">
          <div>
            <h2 className="text-base font-bold text-text-primary">
              Unit Economics & Revenue Stream Breakdown
            </h2>
            <p className="text-xs text-text-secondary">
              Zero payment gateway MDR leakage via Direct NPCI UPI Intent (`anupamrai172@oksbi`)
            </p>
          </div>
          <Badge variant="info">EBITDA Margin: 68.4%</Badge>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-surface-tertiary border-b border-border">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase">Revenue Stream</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase">Monthly Volume</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-text-secondary uppercase">Gross Flow (GMV)</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-text-secondary uppercase">Net Platform Revenue</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase">Take-Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-light">
              {REVENUE_STREAMS.map((r) => (
                <tr key={r.stream} className="hover:bg-surface-secondary/50">
                  <td className="px-4 py-3.5 font-semibold text-slate-900">{r.stream}</td>
                  <td className="px-4 py-3.5 text-text-secondary">{r.volume}</td>
                  <td className="px-4 py-3.5 text-right font-medium text-slate-800">{r.gmv}</td>
                  <td className="px-4 py-3.5 text-right font-bold text-emerald-700">{r.netRevenue}</td>
                  <td className="px-4 py-3.5">
                    <Badge variant="purple">{r.takeRate}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card padding="none">
        <div className="px-5 py-4 border-b border-border flex items-center justify-between bg-surface-secondary/40">
          <div>
            <h2 className="text-base font-bold text-text-primary">
              Ludhiana College Micro-Market Performance (`PCTE`, `PAU`, `GNDEC`)
            </h2>
            <p className="text-xs text-text-secondary">
              Hyper-local student housing density and verified bed utilization
            </p>
          </div>
          <Badge variant="success">830 Verified Beds Active</Badge>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-surface-tertiary border-b border-border">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase">Micro-Market Cluster</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase">Institutional Liaison</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-text-secondary uppercase">Verified Beds</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-text-secondary uppercase">Occupancy</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-text-secondary uppercase">Monthly GMV</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-text-secondary uppercase">Avg All-In Rent</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-light">
              {MICRO_MARKETS.map((m) => (
                <tr key={m.cluster} className="hover:bg-surface-secondary/50">
                  <td className="px-4 py-3.5 font-semibold text-slate-900">{m.cluster}</td>
                  <td className="px-4 py-3.5 text-text-secondary">{m.partnerCell}</td>
                  <td className="px-4 py-3.5 text-right font-medium text-slate-900">{m.verifiedBeds}</td>
                  <td className="px-4 py-3.5 text-right">
                    <Badge variant="success">{m.occupancyRate}</Badge>
                  </td>
                  <td className="px-4 py-3.5 text-right font-bold text-slate-900">{m.monthlyGmv}</td>
                  <td className="px-4 py-3.5 text-right text-text-secondary">{m.avgRent}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
