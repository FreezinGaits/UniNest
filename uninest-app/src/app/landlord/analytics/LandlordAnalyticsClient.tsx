'use client';

import React, { useState } from 'react';
import { Card, StatCard } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import {
  BarChart3,
  TrendingUp,
  Users,
  DollarSign,
  Building2,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  ShieldCheck,
  Download,
  Printer,
  Clock,
  PieChart,
  Percent,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
} from 'lucide-react';
import { formatINR } from '@/lib/utils';

interface PropertyPerformanceItem {
  name: string;
  totalBeds: number;
  occupiedBeds: number;
  occupancyRate: number;
  monthlyRevenue: number; // paise
  revPAU: number; // paise (revenue per available unit)
  maintenanceCost: number; // paise
  grossYield: number; // percentage
  collectionEfficiency: number; // percentage
}

const PROPERTY_PERFORMANCE: PropertyPerformanceItem[] = [
  {
    name: 'PCTE Smart Student Residency',
    totalBeds: 12,
    occupiedBeds: 9,
    occupancyRate: 75,
    monthlyRevenue: 5850000, // ₹58,500
    revPAU: 487500, // ₹4,875
    maintenanceCost: 45000, // ₹450
    grossYield: 9.8,
    collectionEfficiency: 100,
  },
  {
    name: 'Passi Luxury PG & Co-Living',
    totalBeds: 16,
    occupiedBeds: 14,
    occupancyRate: 87.5,
    monthlyRevenue: 8400000, // ₹84,000
    revPAU: 525000, // ₹5,250
    maintenanceCost: 35000, // ₹350
    grossYield: 10.2,
    collectionEfficiency: 96.5,
  },
  {
    name: 'Campus Edge Girls Hostel',
    totalBeds: 12,
    occupiedBeds: 10,
    occupancyRate: 83.3,
    monthlyRevenue: 3400000, // ₹34,000
    revPAU: 283300, // ₹2,833
    maintenanceCost: 20000, // ₹200
    grossYield: 8.4,
    collectionEfficiency: 98.0,
  },
];

// Historical 6-month financial performance data
const MONTHLY_TRENDS = [
  { month: 'Apr 2026', collected: 142000, expenses: 22000, occupancy: 78 },
  { month: 'May 2026', collected: 148500, expenses: 24500, occupancy: 80 },
  { month: 'Jun 2026', collected: 154000, expenses: 21000, occupancy: 80 },
  { month: 'Jul 2026', collected: 162000, expenses: 28000, occupancy: 85 },
  { month: 'Aug 2026', collected: 166500, expenses: 26000, occupancy: 85 },
  { month: 'Sep 2026', collected: 168000, expenses: 26900, occupancy: 82 },
];

export function LandlordAnalyticsClient({
  occupancyRate,
  totalRevenueMonth,
  yieldPercentage,
  isDemoUser,
}: {
  occupancyRate: number;
  totalRevenueMonth: number;
  yieldPercentage: number;
  isDemoUser: boolean;
}) {
  const [timeRange, setTimeRange] = useState<'THIS_MONTH' | 'LAST_3_MONTHS' | '6_MONTH_YTD'>('THIS_MONTH');
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'CASHFLOW' | 'OCCUPANCY' | 'PROPERTIES'>('OVERVIEW');

  // Financial Metrics (in Paise)
  const grossIncome = totalRevenueMonth > 0 ? totalRevenueMonth : 16800000; // ₹1,68,000
  const maintenanceExpenses = 1240000; // ₹12,400
  const electricityCommonExpenses = 680000; // ₹6,800
  const wifiInternetExpenses = 420000; // ₹4,200
  const platformFees = 350000; // ₹3,500
  const totalOpEx = maintenanceExpenses + electricityCommonExpenses + wifiInternetExpenses + platformFees; // ₹26,900
  const netOperatingIncome = grossIncome - totalOpEx; // ₹1,41,100 (NOI)
  const noiMargin = Math.round((netOperatingIncome / grossIncome) * 100);

  const maxCollected = Math.max(...MONTHLY_TRENDS.map((m) => m.collected));

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header with Time Period & Export */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Portfolio Analytics &amp; Financial Yield</h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time occupancy velocity, Net Operating Income (NOI), cash flow projections, and property asset yield.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Time range selector */}
          <div className="flex items-center bg-white border border-slate-200 rounded-xl p-1 text-xs font-bold shadow-2xs">
            {[
              { key: 'THIS_MONTH', label: 'September 2026' },
              { key: 'LAST_3_MONTHS', label: 'Last 3 Mos' },
              { key: '6_MONTH_YTD', label: '6-Month YTD' },
            ].map((t) => (
              <button
                key={t.key}
                onClick={() => setTimeRange(t.key as any)}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  timeRange === t.key
                    ? 'bg-slate-900 text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <Button
            size="sm"
            variant="outline"
            onClick={() => window.print()}
            className="text-xs font-bold flex items-center gap-1.5 bg-white hover:bg-slate-50 shadow-2xs"
          >
            <Printer className="w-3.5 h-3.5 text-slate-600" />
            <span>Print Report</span>
          </Button>
        </div>
      </div>

      {/* Top Level Key Performance Indicators (KPIs) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Portfolio Occupancy"
          value={`${occupancyRate}%`}
          subtitle="33 of 40 beds active"
          icon={<Users className="w-5 h-5 text-indigo-600" />}
        />
        <StatCard
          title="Gross Monthly Rent"
          value={formatINR(grossIncome)}
          subtitle="98.2% collection efficiency"
          icon={<DollarSign className="w-5 h-5 text-emerald-600" />}
        />
        <StatCard
          title="Net Operating Income"
          value={formatINR(netOperatingIncome)}
          subtitle={`${noiMargin}% Operating Margin (NOI)`}
          icon={<TrendingUp className="w-5 h-5 text-purple-600" />}
        />
        <StatCard
          title="Average Stay Tenure"
          value="11.4 mos"
          subtitle="91% annual renewal rate"
          icon={<Building2 className="w-5 h-5 text-amber-600" />}
        />
      </div>

      {/* Section 1: 6-Month Rental Revenue & Operating Expense Trends */}
      <Card className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-indigo-600" />
              <h2 className="text-base font-extrabold text-slate-900">
                6-Month Revenue &amp; Operating Expense Trends
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Historical rental collections vs. on-site maintenance, common utilities, and platform expenses.
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs font-bold">
            <span className="flex items-center gap-1.5 text-emerald-700">
              <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" /> Gross Rent Collected
            </span>
            <span className="flex items-center gap-1.5 text-rose-700">
              <span className="w-3 h-3 rounded-full bg-rose-400 inline-block" /> OpEx Expenses
            </span>
          </div>
        </div>

        {/* Bar Chart Visualization */}
        <div className="space-y-4">
          <div className="grid grid-cols-6 gap-2 sm:gap-4 h-48 items-end pt-6 pb-2 px-2 border-b border-slate-200">
            {MONTHLY_TRENDS.map((item) => {
              const collectedHeight = Math.round((item.collected / maxCollected) * 100);
              const expenseHeight = Math.round((item.expenses / maxCollected) * 100);
              return (
                <div key={item.month} className="flex flex-col items-center h-full justify-end group">
                  <div className="w-full flex items-end justify-center gap-1 sm:gap-1.5 h-full">
                    {/* Gross Bar */}
                    <div
                      style={{ height: `${collectedHeight}%` }}
                      className="w-full max-w-[28px] bg-emerald-500 rounded-t-md hover:bg-emerald-600 transition-all relative flex flex-col justify-start items-center"
                    >
                      <div className="hidden group-hover:block absolute -top-8 bg-slate-900 text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow whitespace-nowrap z-10">
                        ₹{(item.collected).toLocaleString('en-IN')}
                      </div>
                    </div>

                    {/* Expense Bar */}
                    <div
                      style={{ height: `${expenseHeight}%` }}
                      className="w-full max-w-[28px] bg-rose-300 rounded-t-md hover:bg-rose-400 transition-all relative flex flex-col justify-start items-center"
                    >
                      <div className="hidden group-hover:block absolute -top-8 bg-slate-900 text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow whitespace-nowrap z-10">
                        ₹{(item.expenses).toLocaleString('en-IN')}
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] sm:text-xs font-bold text-slate-500 mt-2 text-center">
                    {item.month.split(' ')[0]}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-500 pt-1">
            <span>Average Monthly Gross: <strong>₹1,56,833</strong></span>
            <span>Average Net Operating Income (NOI): <strong>₹1,32,100 / month</strong></span>
            <span className="text-emerald-700 font-bold">YoY Growth: +18.3%</span>
          </div>
        </div>
      </Card>

      {/* Section 2: Financial Mix & Expense Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Box A: Revenue Mix */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <PieChart className="w-4 h-4 text-indigo-600" />
              Monthly Revenue Mix (September 2026)
            </h3>
            <Badge variant="success" size="sm">₹1,68,000 Total</Badge>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-3.5 h-3.5 bg-emerald-500 rounded-full shrink-0" />
                <div>
                  <span className="text-xs font-extrabold text-slate-900 block">Fixed Student Room Rent</span>
                  <span className="text-[10px] text-slate-500">33 occupied beds @ average ₹4,833</span>
                </div>
              </div>
              <span className="font-black text-slate-900 text-sm">{formatINR(15950000)}</span>
            </div>

            <div className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-3.5 h-3.5 bg-purple-500 rounded-full shrink-0" />
                <div>
                  <span className="text-xs font-extrabold text-slate-900 block">Ancillary WiFi &amp; Mess Sub-Splits</span>
                  <span className="text-[10px] text-slate-500">High-speed fiber &amp; optional tiffin meal plan</span>
                </div>
              </div>
              <span className="font-black text-purple-700 text-sm">{formatINR(850000)}</span>
            </div>

            <div className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-3.5 h-3.5 bg-amber-500 rounded-full shrink-0" />
                <div>
                  <span className="text-xs font-extrabold text-slate-900 block">Vendor Service Commission Share</span>
                  <span className="text-[10px] text-slate-500">QuickFix 10% property revenue rebate</span>
                </div>
              </div>
              <span className="font-black text-amber-700 text-sm">{formatINR(250000)}</span>
            </div>
          </div>
        </Card>

        {/* Box B: Operating Expenses (OpEx) & Net Cash Flow */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
              Operating Expenses (OpEx) &amp; Net Cash Flow
            </h3>
            <Badge variant="outline" size="sm">₹26,900 OpEx</Badge>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between py-2 border-b border-slate-100">
              <span className="text-slate-600 font-medium">Routine Maintenance &amp; Plumbing Repairs:</span>
              <span className="font-extrabold text-rose-600">-{formatINR(maintenanceExpenses)}</span>
            </div>

            <div className="flex items-center justify-between py-2 border-b border-slate-100">
              <span className="text-slate-600 font-medium">Common Area Corridor Electricity &amp; Pump:</span>
              <span className="font-extrabold text-rose-600">-{formatINR(electricityCommonExpenses)}</span>
            </div>

            <div className="flex items-center justify-between py-2 border-b border-slate-100">
              <span className="text-slate-600 font-medium">High-Speed Commercial Fiber Internet:</span>
              <span className="font-extrabold text-rose-600">-{formatINR(wifiInternetExpenses)}</span>
            </div>

            <div className="flex items-center justify-between py-2 border-b border-slate-100">
              <span className="text-slate-600 font-medium">UniNest Platform Facilitation &amp; Escrow Fee:</span>
              <span className="font-extrabold text-rose-600">-{formatINR(platformFees)}</span>
            </div>

            {/* Net Operating Income Result */}
            <div className="pt-3 flex items-center justify-between bg-emerald-50/80 p-3 rounded-xl border border-emerald-200 mt-2">
              <div>
                <span className="text-xs font-black text-emerald-950 uppercase tracking-wider block">
                  Net Operating Cash Flow (NOI)
                </span>
                <span className="text-[10px] text-emerald-700">Available for landlord bank payout</span>
              </div>
              <span className="text-lg font-black text-emerald-800">
                {formatINR(netOperatingIncome)}
              </span>
            </div>
          </div>
        </Card>
      </div>

      {/* Section 3: Bed Occupancy & Turnover Velocity + Lease Expiry Radar */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Occupancy Velocity */}
        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <Users className="w-4 h-4 text-brand-600" />
              Bed Inventory &amp; Turnover Velocity
            </h3>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              82.5% Active
            </span>
          </div>

          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200">
              <span className="text-xl font-black text-emerald-800">33</span>
              <p className="text-[11px] font-bold text-emerald-700 mt-0.5">Occupied Beds</p>
            </div>
            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200">
              <span className="text-xl font-black text-amber-800">5</span>
              <p className="text-[11px] font-bold text-amber-700 mt-0.5">Vacant &amp; Ready</p>
            </div>
            <div className="p-3 bg-slate-100 rounded-xl border border-slate-200">
              <span className="text-xl font-black text-slate-700">2</span>
              <p className="text-[11px] font-bold text-slate-500 mt-0.5">Turnover / Paint</p>
            </div>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-slate-600">Average Vacancy Fill Time:</span>
              <strong className="text-emerald-700 font-extrabold">4.2 Days (vs 18d Market Avg)</strong>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-600">RevPAU (Revenue Per Available Bed):</span>
              <strong className="text-slate-900 font-extrabold">₹4,200 / bed / mo</strong>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-600">Tenant Dispute Loss:</span>
              <strong className="text-emerald-700 font-extrabold">₹0 (100% Escrow Protection)</strong>
            </div>
          </div>
        </Card>

        {/* Student Lease Expiry & Semester Renewal Radar */}
        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-indigo-600" />
              Semester Turnover &amp; Renewal Radar
            </h3>
            <Badge variant="info" size="sm">PCTE &amp; GNDU Cycles</Badge>
          </div>

          <p className="text-xs text-slate-500">
            Proactive tracking of upcoming tenancy completion windows based on academic semester schedules.
          </p>

          <div className="space-y-3 text-xs">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
              <div>
                <span className="font-extrabold text-slate-900 block">Expiring in next 30 Days</span>
                <span className="text-[10px] text-slate-500">PCTE Final Semester Exit</span>
              </div>
              <div className="text-right">
                <span className="font-black text-amber-700 block">4 Beds</span>
                <span className="text-[10px] text-emerald-600 font-bold">3 Pre-Booked</span>
              </div>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
              <div>
                <span className="font-extrabold text-slate-900 block">Expiring in 60 Days</span>
                <span className="text-[10px] text-slate-500">Mid-term Internship Rotations</span>
              </div>
              <div className="text-right">
                <span className="font-black text-slate-700 block">6 Beds</span>
                <span className="text-[10px] text-indigo-600 font-bold">Renewal Offered</span>
              </div>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
              <div>
                <span className="font-extrabold text-slate-900 block">Stable Annual Contracts (90+ Days)</span>
                <span className="text-[10px] text-slate-500">11-Month Standard College Tenancies</span>
              </div>
              <div className="text-right">
                <span className="font-black text-emerald-700 block">23 Beds</span>
                <span className="text-[10px] text-emerald-700 font-bold">100% Active Escrow</span>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Section 4: Property-by-Property Performance Matrix Table */}
      <Card padding="none">
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-base font-extrabold text-slate-900">
              Property Performance &amp; Asset Comparison Matrix
            </h3>
            <p className="text-xs text-slate-500">
              Comparative analysis of occupancy, RevPAU, maintenance load, and annualized rental yield across your portfolio.
            </p>
          </div>
          <Badge variant="success" size="sm">3 Verified Assets</Badge>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-surface-tertiary border-b border-border">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase">Property Name</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-text-secondary uppercase">Total Beds</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-text-secondary uppercase">Occupancy %</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-text-secondary uppercase">Monthly Gross</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-text-secondary uppercase">RevPAU</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-text-secondary uppercase">Collection Rate</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-text-secondary uppercase">Gross Yield</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-light text-xs">
              {PROPERTY_PERFORMANCE.map((p) => (
                <tr key={p.name} className="hover:bg-surface-secondary/50 transition-colors">
                  <td className="px-4 py-3.5 font-bold text-slate-900">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-indigo-600 shrink-0" />
                      <span>{p.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-center font-semibold text-slate-700">
                    {p.occupiedBeds} / {p.totalBeds}
                  </td>
                  <td className="px-4 py-3.5 text-center">
                    <span className="font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      {p.occupancyRate}%
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-right font-extrabold text-slate-900">
                    {formatINR(p.monthlyRevenue)}
                  </td>
                  <td className="px-4 py-3.5 text-right font-mono font-bold text-indigo-700">
                    {formatINR(p.revPAU)}
                  </td>
                  <td className="px-4 py-3.5 text-center font-bold text-emerald-600">
                    {p.collectionEfficiency}%
                  </td>
                  <td className="px-4 py-3.5 text-right font-black text-purple-700">
                    {p.grossYield}%
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
