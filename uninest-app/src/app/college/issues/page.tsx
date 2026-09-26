'use client';

import React, { useState } from 'react';
import { Card, StatCard } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { formatINR } from '@/lib/utils';
import {
  AlertTriangle,
  ShieldAlert,
  CheckCircle2,
  PhoneCall,
  Building2,
  User,
  Lock,
  ArrowUpRight,
  Clock,
} from 'lucide-react';

interface OffCampusIncident {
  id: string;
  ticketCode: string;
  title: string;
  description: string;
  studentName: string;
  studentRoll: string;
  pgName: string;
  landlordName: string;
  escrowFrozenPaise: number;
  status: 'ESCROW_FROZEN_UNDER_REVIEW' | 'IN_PROGRESS' | 'ESCALATED_TO_NODAL' | 'RESOLVED';
  priority: 'URGENT' | 'HIGH' | 'MEDIUM';
  reportedAt: string;
  nodalOfficerNote: string;
}

const INITIAL_INCIDENTS: OffCampusIncident[] = [
  {
    id: 'inc-14',
    ticketCode: '#INC-2026-014',
    title: 'AC cooling discrepancy reported during move-in',
    description:
      'Split AC in Room 105 (Bed B) not cooling below 27°C during 48-hour move-in inspection window. Student invoked UniNest Escrow Freeze until compressor gas refill is completed.',
    studentName: 'Karanveer Gill',
    studentRoll: 'PCTE-BPH-2024-019',
    pgName: 'Passi Nagar Scholars Nest',
    landlordName: 'Vikram Singh',
    escrowFrozenPaise: 1160000,
    status: 'ESCROW_FROZEN_UNDER_REVIEW',
    priority: 'HIGH',
    reportedAt: 'Today, 10:15 AM',
    nodalOfficerNote: 'Escrow payout paused automatically; HVAC technician visit logged.',
  },
  {
    id: 'inc-13',
    ticketCode: '#INC-2026-013',
    title: 'Late evening medical pharmacy assistance request',
    description:
      'Student requested urgent prescription antipyretic delivery at 10:40 PM after curfew hours. Lady Warden & 24x7 PG security desk coordinated medicine handover within 22 minutes.',
    studentName: 'Simran Kaur',
    studentRoll: 'PCTE-MBA-2025-034',
    pgName: 'Sarabha Link Girls Enclave',
    landlordName: 'Gurpreet Kaur',
    escrowFrozenPaise: 0,
    status: 'RESOLVED',
    priority: 'URGENT',
    reportedAt: 'Yesterday, 10:40 PM',
    nodalOfficerNote: 'Verified by Prof. Amandeep Kaur Grewal (Girls Warden). Parent informed.',
  },
  {
    id: 'inc-12',
    ticketCode: '#INC-2026-012',
    title: 'Sub-meter reading verification for August cycle',
    description:
      'Clarification requested on shared AC sub-meter opening reading for Room 204. Landlord uploaded timestamped meter photo; tariff reconciled at ₹9/unit institutional rate.',
    studentName: 'Rahul Sharma',
    studentRoll: 'PCTE-CSE-2024-089',
    pgName: 'PCTE Smart Student Residency',
    landlordName: 'Vikram Singh',
    escrowFrozenPaise: 0,
    status: 'RESOLVED',
    priority: 'MEDIUM',
    reportedAt: '21 Sep 2026',
    nodalOfficerNote: 'Digital sub-meter log verified by PCTE Housing Cell.',
  },
  {
    id: 'inc-11',
    ticketCode: '#INC-2026-011',
    title: 'Water purifier RO filter replacement',
    description:
      '2nd-floor common drinking water RO TDS indicator triggered maintenance alert. Landlord scheduled Kent service engineer for candle & membrane replacement.',
    studentName: 'Rohan Mehta',
    studentRoll: 'PCTE-BCA-2024-052',
    pgName: 'PCTE Smart Student Residency',
    landlordName: 'Vikram Singh',
    escrowFrozenPaise: 0,
    status: 'IN_PROGRESS',
    priority: 'MEDIUM',
    reportedAt: '24 Sep 2026',
    nodalOfficerNote: 'Service ticket open; completion SLA by 05:00 PM today.',
  },
];

export default function StudentWelfareIncidentDeskPage() {
  const [incidents, setIncidents] = useState<OffCampusIncident[]>(INITIAL_INCIDENTS);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [actionBanner, setActionBanner] = useState<string | null>(null);

  const handleEscalate = (id: string, code: string, pgName: string) => {
    setIncidents((prev) =>
      prev.map((inc) =>
        inc.id === id
          ? {
              ...inc,
              status: 'ESCALATED_TO_NODAL',
              nodalOfficerNote:
                'Escalated to Landlord & PCTE Chief Nodal Officer. Mandatory 24-hr SLA notice dispatched.',
            }
          : inc
      )
    );
    setActionBanner(
      `Incident ${code} (${pgName}) escalated to Landlord & PCTE Nodal Officer with high-priority SLA lock.`
    );
  };

  const handleResolve = (id: string, code: string) => {
    setIncidents((prev) =>
      prev.map((inc) =>
        inc.id === id
          ? {
              ...inc,
              status: 'RESOLVED',
              escrowFrozenPaise: 0,
              nodalOfficerNote:
                'Issue verified & closed by PCTE Housing Cell. Any associated escrow hold released.',
            }
          : inc
      )
    );
    setActionBanner(`Incident ${code} marked as RESOLVED by PCTE Housing Cell.`);
  };

  const visibleIncidents =
    filterStatus === 'ALL'
      ? incidents
      : incidents.filter((inc) => inc.status === filterStatus);

  const activeCount = incidents.filter((i) => i.status !== 'RESOLVED').length;
  const frozenTotalPaise = incidents.reduce((sum, i) => sum + i.escrowFrozenPaise, 0);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="purple" size="sm" dot>
              PCTE Housing Cell • pcte@uninest.in
            </Badge>
            <Badge variant="danger" size="sm" dot>
              24x7 Warden &amp; SOS Helpline Active
            </Badge>
          </div>
          <h1 className="text-2xl font-bold text-text-primary">
            Student Welfare, SOS &amp; Off-Campus Incident Desk
          </h1>
          <p className="text-text-secondary mt-1 text-sm">
            PCTE Institute of Technology (Ludhiana) • Off-Campus Grievance Resolution, Escrow Freeze Arbitration &amp; Emergency Response
          </p>
        </div>

        <div className="px-4 py-2.5 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
          <PhoneCall className="w-5 h-5 text-red-600" />
          <div>
            <p className="text-xs font-medium text-red-700">PCTE 24x7 Control Room</p>
            <p className="text-sm font-bold text-red-900">+91 161 288 8500 (Extn. 108)</p>
          </div>
        </div>
      </div>

      {/* Action Feedback Banner */}
      {actionBanner && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between text-emerald-800 text-sm font-medium">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{actionBanner}</span>
          </div>
          <button
            onClick={() => setActionBanner(null)}
            className="text-xs text-emerald-700 underline hover:text-emerald-900"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Open Welfare / PG Tickets"
          value={activeCount}
          subtitle="Out of 4 recent off-campus cases"
          icon={<AlertTriangle className="w-5 h-5" />}
          color="amber"
        />
        <StatCard
          title="Escrow Frozen Under Review"
          value={formatINR(frozenTotalPaise)}
          subtitle="Protected until landlord fixes defect"
          icon={<Lock className="w-5 h-5" />}
          color="red"
        />
        <StatCard
          title="Median SOS Response Time"
          value="18 Mins"
          subtitle="Baddowal & Sarabha Patrol Units"
          icon={<Clock className="w-5 h-5" />}
          color="brand"
        />
        <StatCard
          title="Resolved This Month"
          value="96.4%"
          subtitle="Verified by student sign-off"
          icon={<CheckCircle2 className="w-5 h-5" />}
          color="blue"
        />
      </div>

      {/* Filter Pills */}
      <Card padding="sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="text-xs font-semibold text-text-secondary">
            Filter by Incident Status:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {[
              { key: 'ALL', label: 'All Incidents (4)' },
              { key: 'ESCROW_FROZEN_UNDER_REVIEW', label: 'Escrow Frozen' },
              { key: 'IN_PROGRESS', label: 'In Progress' },
              { key: 'ESCALATED_TO_NODAL', label: 'Escalated' },
              { key: 'RESOLVED', label: 'Resolved' },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setFilterStatus(tab.key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  filterStatus === tab.key
                    ? 'bg-brand-600 text-white'
                    : 'bg-surface-secondary text-text-secondary hover:bg-surface-tertiary'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Incident Cards List */}
      <div className="space-y-4">
        {visibleIncidents.map((incident) => (
          <Card key={incident.id} padding="lg" className="space-y-4">
            <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-3">
              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-md bg-surface-tertiary text-text-primary">
                    {incident.ticketCode}
                  </span>
                  <Badge
                    variant={
                      incident.priority === 'URGENT'
                        ? 'danger'
                        : incident.priority === 'HIGH'
                        ? 'warning'
                        : 'info'
                    }
                    size="sm"
                  >
                    Priority: {incident.priority}
                  </Badge>
                  <Badge
                    variant={
                      incident.status === 'RESOLVED'
                        ? 'success'
                        : incident.status === 'ESCROW_FROZEN_UNDER_REVIEW'
                        ? 'danger'
                        : incident.status === 'ESCALATED_TO_NODAL'
                        ? 'purple'
                        : 'warning'
                    }
                    size="sm"
                    dot
                  >
                    {incident.status}
                  </Badge>
                  <span className="text-xs text-text-tertiary">• Logged {incident.reportedAt}</span>
                </div>

                <h3 className="text-base font-bold text-text-primary">{incident.title}</h3>
                <p className="text-sm text-text-secondary max-w-3xl">{incident.description}</p>
              </div>

              {incident.escrowFrozenPaise > 0 && (
                <div className="px-3.5 py-2.5 rounded-xl bg-red-50 border border-red-200 shrink-0">
                  <p className="text-[11px] font-semibold text-red-700 uppercase">
                    Escrow Payout Frozen
                  </p>
                  <p className="text-base font-bold text-red-900">
                    {formatINR(incident.escrowFrozenPaise)} Held
                  </p>
                </div>
              )}
            </div>

            {/* Student, PG & Nodal Note Metadata */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-3.5 rounded-xl bg-surface-secondary border border-border-light text-xs">
              <div className="flex items-start gap-2">
                <User className="w-4 h-4 text-brand-600 shrink-0 mt-0.5" />
                <div>
                  <span className="text-text-tertiary block">Reporting PCTE Student</span>
                  <span className="font-semibold text-text-primary">
                    {incident.studentName} ({incident.studentRoll})
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <Building2 className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                <div>
                  <span className="text-text-tertiary block">Partner PG &amp; Landlord</span>
                  <span className="font-semibold text-text-primary">
                    {incident.pgName} • Landlord: {incident.landlordName}
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <ShieldAlert className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <span className="text-text-tertiary block">PCTE Nodal Officer Action Log</span>
                  <span className="font-medium text-text-secondary">{incident.nodalOfficerNote}</span>
                </div>
              </div>
            </div>

            {/* Interactive Action Buttons */}
            <div className="pt-2 border-t border-border-light flex flex-wrap items-center justify-between gap-3">
              <span className="text-xs text-text-tertiary">
                Audited under PCTE Off-Campus Student Welfare Charter
              </span>

              <div className="flex flex-wrap items-center gap-2.5">
                {incident.status !== 'RESOLVED' && (
                  <button
                    onClick={() =>
                      handleEscalate(incident.id, incident.ticketCode, incident.pgName)
                    }
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 transition-colors"
                  >
                    <ArrowUpRight className="w-3.5 h-3.5" />
                    Escalate to Landlord &amp; Nodal Officer
                  </button>
                )}

                {incident.status !== 'RESOLVED' ? (
                  <button
                    onClick={() => handleResolve(incident.id, incident.ticketCode)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-brand-600 hover:bg-brand-700 text-white shadow-sm transition-colors"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Mark Issue Resolved
                  </button>
                ) : (
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700">
                    <CheckCircle2 className="w-4 h-4" /> Closed &amp; Archived in NAAC Welfare Log
                  </span>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
