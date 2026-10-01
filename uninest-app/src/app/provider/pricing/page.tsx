'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { DollarSign, Wrench, Zap, Wind, Sparkles, Key, Paintbrush, Info, Calculator, CheckCircle2, Plus } from 'lucide-react';
import { formatINR } from '@/lib/utils';

const initialRateCard = [
  { id: 1, service: 'Plumbing Repair', rate: '₹350 base + ₹150/hr', type: 'variable', baseAmount: 35000, icon: Wrench },
  { id: 2, service: 'Electrical Wiring', rate: '₹400 base + ₹200/hr', type: 'variable', baseAmount: 40000, icon: Zap },
  { id: 3, service: 'AC Service/Gas Refill', rate: '₹800 flat', type: 'flat', baseAmount: 80000, icon: Wind },
  { id: 4, service: 'Deep Cleaning (1 Room)', rate: '₹500 flat', type: 'flat', baseAmount: 50000, icon: Sparkles },
  { id: 5, service: 'Deep Cleaning (Full PG)', rate: '₹2,500 flat', type: 'flat', baseAmount: 250000, icon: Sparkles },
  { id: 6, service: 'Lock Replacement', rate: '₹450 flat', type: 'flat', baseAmount: 45000, icon: Key },
  { id: 7, service: 'Painting (per wall)', rate: '₹1,200', type: 'flat', baseAmount: 120000, icon: Paintbrush },
];

export default function PricingCommissionsPage() {
  const [calculatorQuote, setCalculatorQuote] = useState<number>(1000);

  const vendorShare = Math.round(calculatorQuote * 0.85);
  const platformFee = Math.round(calculatorQuote * 0.10);
  const landlordReward = calculatorQuote - vendorShare - platformFee;

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Service Rate Card & Commission Splits</h1>
          <p className="text-text-secondary mt-1">Standard Ludhiana PG maintenance rates, material charges, and net payout splits</p>
        </div>
        <div className="p-2.5 bg-brand-50 rounded-xl">
          <DollarSign className="w-6 h-6 text-brand-600" />
        </div>
      </div>

      {/* Economics Split Calculator */}
      <Card className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white border-none shadow-md">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Calculator className="w-5 h-5 text-emerald-400" />
              <h2 className="text-base font-extrabold text-white">Live Vendor Net Take-Home Calculator</h2>
            </div>
            <p className="text-xs text-slate-300 max-w-xl">
              UniNest features automated escrow clearing: <strong>85%</strong> direct to vendor account on T+1, <strong>10%</strong> platform commission, and <strong>5%</strong> landlord referral rebate.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <label className="text-xs font-bold text-slate-300">Test Billing Amount (₹):</label>
              <input
                type="number"
                min="100"
                step="50"
                value={calculatorQuote}
                onChange={(e) => setCalculatorQuote(Math.max(0, Number(e.target.value)))}
                className="w-32 px-3 py-1.5 rounded-xl bg-slate-800 text-white font-extrabold text-sm border border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 text-center shrink-0">
            <div className="p-3 bg-white/10 rounded-xl border border-white/15">
              <div className="text-[10px] text-emerald-300 font-bold uppercase">Vendor (85%)</div>
              <div className="text-lg font-black text-emerald-400">₹{vendorShare.toLocaleString('en-IN')}</div>
              <div className="text-[9px] text-slate-400">Net Direct UPI</div>
            </div>
            <div className="p-3 bg-white/10 rounded-xl border border-white/15">
              <div className="text-[10px] text-indigo-300 font-bold uppercase">Platform (10%)</div>
              <div className="text-lg font-black text-indigo-300">₹{platformFee.toLocaleString('en-IN')}</div>
              <div className="text-[9px] text-slate-400">UniNest SLA OS</div>
            </div>
            <div className="p-3 bg-white/10 rounded-xl border border-white/15">
              <div className="text-[10px] text-amber-300 font-bold uppercase">Host PG (5%)</div>
              <div className="text-lg font-black text-amber-300">₹{landlordReward.toLocaleString('en-IN')}</div>
              <div className="text-[9px] text-slate-400">Partner Rebate</div>
            </div>
          </div>
        </div>
      </Card>

      <Card className="bg-blue-50/50 border-blue-100">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
          <div>
            <h3 className="text-sm font-medium text-blue-900">Material Charges & Spare Parts Policy</h3>
            <p className="text-xs text-blue-700 mt-1">
              Extra parts (pipes, taps, MCBs, AC capacitors) are billed at MRP with zero markup. Customer approval via the student or landlord app is required before purchasing replacement hardware.
            </p>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {initialRateCard.map((item) => {
          const Icon = item.icon;
          return (
            <Card key={item.id} className="hover:border-brand-300 transition-colors border-slate-200">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-brand-50 rounded-xl text-brand-600">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-text-primary text-sm">{item.service}</h3>
                    <div className="mt-1">
                      <span className="text-base font-extrabold text-brand-600">{item.rate}</span>
                    </div>
                  </div>
                </div>
                <Badge variant={item.type === 'flat' ? 'success' : 'warning'} size="sm">
                  {item.type === 'flat' ? 'Fixed Rate' : 'Variable'}
                </Badge>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
