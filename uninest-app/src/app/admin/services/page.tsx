'use client';

import React, { useState } from 'react';
import { Card, StatCard } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { formatINR } from '@/lib/utils';
import {
  Sparkles,
  IndianRupee,
  CheckCircle2,
  Clock,
  Wrench,
  TrendingUp,
} from 'lucide-react';

interface AncillaryServiceOrder {
  id: string;
  serviceName: string;
  requester: string;
  requesterRole: 'STUDENT' | 'LANDLORD';
  vendor: string;
  orderValuePaise: number;
  commissionPaise: number;
  status: 'COMPLETED' | 'IN_PROGRESS';
  date: string;
}

const INITIAL_ORDERS: AncillaryServiceOrder[] = [
  {
    id: 'SRV-2026-301',
    serviceName: 'PG Deep Cleaning',
    requester: 'Rahul Sharma (Room 204-A)',
    requesterRole: 'STUDENT',
    vendor: 'QuickFix Services',
    orderValuePaise: 120000,
    commissionPaise: 18000,
    status: 'COMPLETED',
    date: '25 Sep 2026',
  },
  {
    id: 'SRV-2026-302',
    serviceName: 'Bathroom Plumbing Repair',
    requester: 'Vikram Singh (Passi Residency)',
    requesterRole: 'LANDLORD',
    vendor: 'QuickFix Services',
    orderValuePaise: 80000,
    commissionPaise: 12000,
    status: 'IN_PROGRESS',
    date: '26 Sep 2026',
  },
  {
    id: 'SRV-2026-303',
    serviceName: 'Monthly Laundry Pack',
    requester: 'Simran Kaur (Room 108-A)',
    requesterRole: 'STUDENT',
    vendor: 'PureWash Student Laundry',
    orderValuePaise: 150000,
    commissionPaise: 22500,
    status: 'COMPLETED',
    date: '24 Sep 2026',
  },
  {
    id: 'SRV-2026-304',
    serviceName: 'High-Speed Wi-Fi Router Setup',
    requester: 'Aman Verma (Room 202-B)',
    requesterRole: 'STUDENT',
    vendor: 'QuickFix Services',
    orderValuePaise: 100000,
    commissionPaise: 15000,
    status: 'COMPLETED',
    date: '21 Sep 2026',
  },
  {
    id: 'SRV-2026-305',
    serviceName: 'AC Gas Refill',
    requester: 'Vikram Singh (Passi Residency)',
    requesterRole: 'LANDLORD',
    vendor: 'QuickFix Services',
    orderValuePaise: 220000,
    commissionPaise: 33000,
    status: 'COMPLETED',
    date: '19 Sep 2026',
  },
];

export default function AdminServicesPage() {
  const [orders, setOrders] = useState<AncillaryServiceOrder[]>(INITIAL_ORDERS);

  const totalOrderVolumePaise = orders.reduce((sum, o) => sum + o.orderValuePaise, 0);
  const totalCommissionPaise = orders.reduce((sum, o) => sum + o.commissionPaise, 0);

  const markOrderCompleted = (id: string) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === id ? { ...o, status: 'COMPLETED' } : o))
    );
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold text-text-primary">
              Student Ancillary Services & Commission Ledger
            </h1>
            <Badge variant="success" dot>
              15% Platform Take-Rate
            </Badge>
          </div>
          <p className="text-text-secondary mt-1">
            Value-added campus living services fulfilled by QuickFix Services and verifiedLudhiana partners
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Gross Service GMV"
          value={formatINR(totalOrderVolumePaise)}
          subtitle="5 fulfilled & active work orders"
          icon={<Sparkles className="w-5 h-5" />}
          color="brand"
        />
        <StatCard
          title="UniNest 15% Commission"
          value={formatINR(totalCommissionPaise)}
          subtitle="Net ancillary platform revenue"
          icon={<TrendingUp className="w-5 h-5" />}
          color="purple"
        />
        <StatCard
          title="Primary Fulfiller"
          value="QuickFix Services"
          subtitle="provider@uninest.in • 4.9★"
          icon={<Wrench className="w-5 h-5" />}
          color="blue"
        />
        <StatCard
          title="Completion Rate"
          value={`${orders.filter((o) => o.status === 'COMPLETED').length}/${orders.length}`}
          subtitle="Verified via Student OTP"
          icon={<CheckCircle2 className="w-5 h-5" />}
          color="amber"
        />
      </div>

      <Card padding="none">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-surface-tertiary border-b border-border">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase">Order ID & Service</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase">Requester</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase">Fulfilling Vendor</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-text-secondary uppercase">Order Value</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-text-secondary uppercase">15% UniNest Fee</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase">Status</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-text-secondary uppercase">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-light">
              {orders.map((o) => (
                <tr key={o.id} className="hover:bg-surface-secondary/50 transition-colors">
                  <td className="px-4 py-3.5">
                    <div className="font-mono font-bold text-xs text-brand-700">{o.id}</div>
                    <div className="font-semibold text-slate-900">{o.serviceName}</div>
                    <div className="text-xs text-text-tertiary">{o.date}</div>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="font-medium text-slate-900">{o.requester}</div>
                    <Badge variant={o.requesterRole === 'STUDENT' ? 'info' : 'purple'}>
                      {o.requesterRole}
                    </Badge>
                  </td>
                  <td className="px-4 py-3.5 font-medium text-slate-800">{o.vendor}</td>
                  <td className="px-4 py-3.5 text-right font-semibold text-slate-900">
                    {formatINR(o.orderValuePaise)}
                  </td>
                  <td className="px-4 py-3.5 text-right font-bold text-emerald-700">
                    {formatINR(o.commissionPaise)}
                  </td>
                  <td className="px-4 py-3.5">
                    {o.status === 'COMPLETED' ? (
                      <Badge variant="success" dot>COMPLETED</Badge>
                    ) : (
                      <Badge variant="warning" dot>IN_PROGRESS</Badge>
                    )}
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    {o.status === 'IN_PROGRESS' ? (
                      <button
                        onClick={() => markOrderCompleted(o.id)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 transition-colors"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Settle & Complete
                      </button>
                    ) : (
                      <span className="text-xs font-semibold text-text-tertiary">Commission Settled</span>
                    )}
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
