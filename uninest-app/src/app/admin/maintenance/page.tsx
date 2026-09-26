'use client';

import React, { useState } from 'react';
import { Card, StatCard } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import {
  Wrench,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Building2,
  ShieldCheck,
} from 'lucide-react';

interface MaintenanceTicket {
  id: string;
  title: string;
  category: string;
  property: string;
  studentName: string;
  vendor: string;
  priority: 'URGENT_4H' | 'HIGH_12H' | 'STANDARD_24H';
  slaRemaining: string;
  status: 'DISPATCHED' | 'IN_PROGRESS' | 'RESOLVED';
}

const INITIAL_TICKETS: MaintenanceTicket[] = [
  {
    id: '#MNT-2026-001',
    title: 'Bathroom tap leaking',
    category: 'Plumbing',
    property: 'PCTE Smart Student Residency (Room 204)',
    studentName: 'Rahul Sharma',
    vendor: 'QuickFix Services',
    priority: 'HIGH_12H',
    slaRemaining: '3h 40m remaining',
    status: 'IN_PROGRESS',
  },
  {
    id: '#MNT-2026-002',
    title: 'AC not cooling properly',
    category: 'HVAC & Cooling',
    property: 'PAU Green Avenue Scholars Hub (Room 108)',
    studentName: 'Simran Kaur',
    vendor: 'QuickFix Services',
    priority: 'HIGH_12H',
    slaRemaining: '5h 15m remaining',
    status: 'DISPATCHED',
  },
  {
    id: '#MNT-2026-003',
    title: 'Power socket sparking in Room 204',
    category: 'Electrical Safety',
    property: 'PCTE Smart Student Residency (Room 204)',
    studentName: 'Rahul Sharma',
    vendor: 'QuickFix Services',
    priority: 'URGENT_4H',
    slaRemaining: '1h 10m remaining',
    status: 'IN_PROGRESS',
  },
  {
    id: '#MNT-2026-004',
    title: 'RO Water Purifier filter change',
    category: 'Appliance Care',
    property: 'PCTE Smart Student Residency (Common Pantry)',
    studentName: 'Aman Verma',
    vendor: 'QuickFix Services',
    priority: 'STANDARD_24H',
    slaRemaining: 'Completed within 4h 20m',
    status: 'RESOLVED',
  },
];

export default function AdminMaintenancePage() {
  const [tickets, setTickets] = useState<MaintenanceTicket[]>(INITIAL_TICKETS);
  const [notice, setNotice] = useState<string | null>(null);

  const handleAdvanceStatus = (id: string) => {
    setTickets((prev) =>
      prev.map((t) => {
        if (t.id !== id) return t;
        const nextStatus =
          t.status === 'DISPATCHED'
            ? 'IN_PROGRESS'
            : 'RESOLVED';
        return {
          ...t,
          status: nextStatus,
          slaRemaining:
            nextStatus === 'RESOLVED' ? 'Resolved within SLA' : t.slaRemaining,
        };
      })
    );
    setNotice(`SLA Ticket ${id} status updated and synced with QuickFix Services & Landlord Vikram Singh.`);
  };

  const openCount = tickets.filter((t) => t.status !== 'RESOLVED').length;
  const resolvedCount = tickets.filter((t) => t.status === 'RESOLVED').length;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold text-text-primary">
              Platform Maintenance SLA & Dispatch Oversight
            </h1>
            <Badge variant="info" dot>
              Primary Partner: QuickFix Services
            </Badge>
          </div>
          <p className="text-text-secondary mt-1">
            Real-time SLA tracking across all verified Ludhiana student residencies with automated technician dispatch
          </p>
        </div>
      </div>

      {notice && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between text-emerald-900 text-sm">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
            <span className="font-medium">{notice}</span>
          </div>
          <button
            onClick={() => setNotice(null)}
            className="text-xs font-semibold text-emerald-700 hover:underline"
          >
            Dismiss
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Active SLA Tickets"
          value={openCount}
          subtitle="Assigned to QuickFix Services"
          icon={<Wrench className="w-5 h-5" />}
          color="amber"
        />
        <StatCard
          title="Resolved Within SLA"
          value={resolvedCount}
          subtitle="98.4% On-Time Resolution Rate"
          icon={<CheckCircle2 className="w-5 h-5" />}
          color="brand"
        />
        <StatCard
          title="Urgent Safety Response"
          value="< 4 Hours"
          subtitle="Electrical & water emergencies"
          icon={<AlertTriangle className="w-5 h-5" />}
          color="red"
        />
        <StatCard
          title="Properties Monitored"
          value="12 PGs"
          subtitle="PCTE, PAU & GNDEC clusters"
          icon={<Building2 className="w-5 h-5" />}
          color="blue"
        />
      </div>

      <Card padding="none">
        <div className="px-5 py-4 border-b border-border flex items-center justify-between bg-surface-secondary/40">
          <div>
            <h2 className="text-base font-bold text-text-primary">
              Live Maintenance Dispatch Queue
            </h2>
            <p className="text-xs text-text-secondary">
              Technicians verify completion via student OTP sign-off
            </p>
          </div>
          <Badge variant="success">QuickFix Services SLA Active</Badge>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-surface-tertiary border-b border-border">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase">Ticket ID & Issue</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase">Property & Student</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase">Assigned Partner</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase">Priority & SLA Timer</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase">Status</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-text-secondary uppercase">Dispatch Control</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-light">
              {tickets.map((t) => (
                <tr key={t.id} className="hover:bg-surface-secondary/50 transition-colors">
                  <td className="px-4 py-3.5">
                    <div className="font-mono font-bold text-brand-700 text-xs">{t.id}</div>
                    <div className="font-semibold text-slate-900">{t.title}</div>
                    <div className="text-xs text-text-tertiary">{t.category}</div>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="font-medium text-slate-900">{t.property}</div>
                    <div className="text-xs text-text-secondary">Reported by: {t.studentName}</div>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="font-semibold text-slate-900">{t.vendor}</div>
                    <div className="text-xs text-text-tertiary font-mono">provider@uninest.in</div>
                  </td>
                  <td className="px-4 py-3.5">
                    {t.priority === 'URGENT_4H' ? (
                      <Badge variant="danger">URGENT (4h SLA)</Badge>
                    ) : t.priority === 'HIGH_12H' ? (
                      <Badge variant="warning">HIGH (12h SLA)</Badge>
                    ) : (
                      <Badge variant="info">STANDARD (24h SLA)</Badge>
                    )}
                    <div className="text-xs text-text-secondary mt-1 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {t.slaRemaining}
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    {t.status === 'RESOLVED' ? (
                      <Badge variant="success" dot>RESOLVED</Badge>
                    ) : t.status === 'IN_PROGRESS' ? (
                      <Badge variant="info" dot>IN_PROGRESS</Badge>
                    ) : (
                      <Badge variant="warning" dot>DISPATCHED</Badge>
                    )}
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    {t.status !== 'RESOLVED' ? (
                      <button
                        onClick={() => handleAdvanceStatus(t.id)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-600 text-white text-xs font-semibold hover:bg-brand-700 transition-colors"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        {t.status === 'DISPATCHED' ? 'Mark In-Progress' : 'Mark Resolved'}
                      </button>
                    ) : (
                      <span className="text-xs font-semibold text-emerald-700">SLA Met</span>
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
