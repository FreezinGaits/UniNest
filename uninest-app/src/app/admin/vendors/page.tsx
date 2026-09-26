'use client';

import React, { useState } from 'react';
import { Card, StatCard } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import {
  Wrench,
  Star,
  CheckCircle2,
  Percent,
  ShieldCheck,
  Briefcase,
} from 'lucide-react';

interface ServiceVendor {
  id: string;
  name: string;
  email: string;
  specialty: string;
  rating: string;
  jobsCompleted: number;
  commissionRate: number;
  status: 'VERIFIED_PARTNER' | 'PENDING_AUDIT';
}

const INITIAL_VENDORS: ServiceVendor[] = [
  {
    id: 'VND-01',
    name: 'QuickFix Services',
    email: 'provider@uninest.in',
    specialty: 'Plumbing, Electrical & HVAC',
    rating: '4.9★',
    jobsCompleted: 48,
    commissionRate: 15,
    status: 'VERIFIED_PARTNER',
  },
  {
    id: 'VND-02',
    name: 'PureWash Student Laundry',
    email: 'ops@purewash.in',
    specialty: 'Laundry & Dry Cleaning',
    rating: '4.8★',
    jobsCompleted: 112,
    commissionRate: 15,
    status: 'VERIFIED_PARTNER',
  },
  {
    id: 'VND-03',
    name: 'Annapurna Homestyle Tiffins',
    email: 'kitchen@annapurnatiffins.in',
    specialty: 'Student Meal Subscriptions',
    rating: '4.7★',
    jobsCompleted: 85,
    commissionRate: 12,
    status: 'VERIFIED_PARTNER',
  },
  {
    id: 'VND-04',
    name: 'Ludhiana CoolCare Appliances',
    email: 'service@coolcareldh.in',
    specialty: 'AC & Refrigerator Rental/Repair',
    rating: '4.6★',
    jobsCompleted: 29,
    commissionRate: 15,
    status: 'PENDING_AUDIT',
  },
];

export default function AdminVendorsPage() {
  const [vendors, setVendors] = useState<ServiceVendor[]>(INITIAL_VENDORS);
  const [toast, setToast] = useState<string | null>(null);

  const handleVerifyPartner = (id: string, name: string) => {
    setVendors((prev) =>
      prev.map((v) => (v.id === id ? { ...v, status: 'VERIFIED_PARTNER' } : v))
    );
    setToast(`${name} approved as a Verified Partner on the UniNest Ludhiana SLA Network.`);
  };

  const handleAdjustCommission = (id: string, name: string) => {
    setVendors((prev) =>
      prev.map((v) => {
        if (v.id !== id) return v;
        const nextCommission = v.commissionRate === 15 ? 12 : 15;
        setToast(`Platform commission tier for ${name} updated to ${nextCommission}%.`);
        return { ...v, commissionRate: nextCommission };
      })
    );
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold text-text-primary">
              Verified Service Vendors & SLA Partner Network
            </h1>
            <Badge variant="success" dot>
              15% Ancillary Take-Rate
            </Badge>
          </div>
          <p className="text-text-secondary mt-1">
            Background-verified Ludhiana maintenance, laundry, tiffin, and appliance partners serving student residences
          </p>
        </div>
      </div>

      {toast && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between text-emerald-900 text-sm">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
            <span className="font-medium">{toast}</span>
          </div>
          <button
            onClick={() => setToast(null)}
            className="text-xs font-semibold text-emerald-700 hover:underline"
          >
            Dismiss
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Verified SLA Partners"
          value={vendors.filter((v) => v.status === 'VERIFIED_PARTNER').length}
          subtitle="Police & GST verified"
          icon={<Wrench className="w-5 h-5" />}
          color="brand"
        />
        <StatCard
          title="Total Jobs Completed"
          value={vendors.reduce((acc, v) => acc + v.jobsCompleted, 0)}
          subtitle="Across PCTE, PAU & GNDEC"
          icon={<Briefcase className="w-5 h-5" />}
          color="blue"
        />
        <StatCard
          title="Average Partner Rating"
          value="4.8★"
          subtitle="Verified student feedback"
          icon={<Star className="w-5 h-5" />}
          color="amber"
        />
        <StatCard
          title="Platform Take-Rate"
          value="12% – 15%"
          subtitle="Auto-deducted at settlement"
          icon={<Percent className="w-5 h-5" />}
          color="purple"
        />
      </div>

      <Card padding="none">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-surface-tertiary border-b border-border">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase">Vendor Name</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase">Category / Specialty</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase">Rating & Volume</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase">Commission Tier</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase">Status</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-text-secondary uppercase">Governance Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-light">
              {vendors.map((v) => (
                <tr key={v.id} className="hover:bg-surface-secondary/50 transition-colors">
                  <td className="px-4 py-3.5">
                    <div className="font-semibold text-slate-900">{v.name}</div>
                    <div className="text-xs text-text-secondary font-mono">{v.email}</div>
                  </td>
                  <td className="px-4 py-3.5 text-slate-800 font-medium">{v.specialty}</td>
                  <td className="px-4 py-3.5">
                    <span className="font-bold text-amber-600">{v.rating}</span>
                    <span className="text-xs text-text-secondary ml-2">({v.jobsCompleted} jobs)</span>
                  </td>
                  <td className="px-4 py-3.5">
                    <Badge variant="purple">{v.commissionRate}% Platform Fee</Badge>
                  </td>
                  <td className="px-4 py-3.5">
                    {v.status === 'VERIFIED_PARTNER' ? (
                      <Badge variant="success" dot>VERIFIED_PARTNER</Badge>
                    ) : (
                      <Badge variant="warning" dot>PENDING_AUDIT</Badge>
                    )}
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    <div className="inline-flex items-center gap-2">
                      {v.status === 'PENDING_AUDIT' && (
                        <button
                          onClick={() => handleVerifyPartner(v.id, v.name)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 transition-colors"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Verify Partner
                        </button>
                      )}
                      <button
                        onClick={() => handleAdjustCommission(v.id, v.name)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-border bg-white text-slate-700 text-xs font-semibold hover:bg-surface-secondary transition-colors"
                      >
                        Adjust Commission Tier
                      </button>
                    </div>
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
