'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { formatINR } from '@/lib/utils';
import {
  Briefcase,
  CheckCircle2,
  Clock,
  MapPin,
  Phone,
  User,
  Wrench,
  AlertTriangle,
  Play,
  Check,
  Building2,
} from 'lucide-react';

interface JobItem {
  id: string;
  jobCode: string;
  title: string;
  category: string;
  priority: 'URGENT' | 'HIGH' | 'MEDIUM';
  property: string;
  room: string;
  locality: string;
  requestedBy: string;
  contactPhone: string;
  scheduledSlot: string;
  assignedTech: string;
  amount: number;
  status: 'NEW_REQUEST' | 'IN_PROGRESS' | 'COMPLETED';
}

const INITIAL_JOBS: JobItem[] = [
  {
    id: 'job-1',
    jobCode: 'JOB-LDH-2026-104',
    title: 'Power Socket Sparking & MCB Replacement',
    category: 'Electrical Wiring',
    priority: 'URGENT',
    property: 'PCTE Smart Student Residency',
    room: 'Room 204 (Bed A)',
    locality: 'Passi Nagar, Ferozepur Road',
    requestedBy: 'Rahul Sharma (Student Tenant)',
    contactPhone: '+91 98765 43210',
    scheduledSlot: 'Today • Within 90 Mins (Emergency SLA)',
    assignedTech: 'Gurdeep Singh (Sr. Electrician)',
    amount: 55000, // ₹550 in paise
    status: 'NEW_REQUEST',
  },
  {
    id: 'job-2',
    jobCode: 'JOB-LDH-2026-103',
    title: 'Split AC Gas Refill & Cooling Coil Jet Wash',
    category: 'AC / HVAC Servicing',
    priority: 'HIGH',
    property: 'PCTE Smart Student Residency',
    room: 'Room 204',
    locality: 'Passi Nagar, Ferozepur Road',
    requestedBy: 'Vikram Singh (Landlord)',
    contactPhone: '+91 98989 89801',
    scheduledSlot: 'Today • 02:00 PM – 04:00 PM',
    assignedTech: 'Sukhwinder Gill (HVAC Lead)',
    amount: 80000, // ₹800 in paise
    status: 'IN_PROGRESS',
  },
  {
    id: 'job-3',
    jobCode: 'JOB-LDH-2026-102',
    title: 'Pre-Move-In Full Room Deep Cleaning & Sanitization',
    category: 'Deep Cleaning',
    priority: 'MEDIUM',
    property: 'Passi Nagar Scholars Nest',
    room: 'Room 105 (Bed B)',
    locality: 'Ferozepur Road, Ludhiana',
    requestedBy: 'Karanveer Gill (Incoming Tenant)',
    contactPhone: '+91 98555 44321',
    scheduledSlot: 'Tomorrow • 10:00 AM – 12:00 PM',
    assignedTech: 'Rakesh Verma (Sanitization Lead)',
    amount: 50000, // ₹500 in paise
    status: 'NEW_REQUEST',
  },
  {
    id: 'job-4',
    jobCode: 'JOB-LDH-2026-101',
    title: 'Bathroom Diverter & Tap Leakage Repair',
    category: 'Plumbing Repair',
    priority: 'HIGH',
    property: 'PCTE Smart Student Residency',
    room: 'Room 204',
    locality: 'Passi Nagar, Ferozepur Road',
    requestedBy: 'Rahul Sharma (Student Tenant)',
    contactPhone: '+91 98765 43210',
    scheduledSlot: 'Completed • 24 Sep 2026',
    assignedTech: 'Manoj Kumar (Master Plumber)',
    amount: 50000, // ₹500 in paise
    status: 'COMPLETED',
  },
  {
    id: 'job-5',
    jobCode: 'JOB-LDH-2026-100',
    title: 'Common Floor RO Water Purifier Filter & Membrane Change',
    category: 'Plumbing & RO',
    priority: 'MEDIUM',
    property: 'Sarabha Link Girls Enclave',
    room: '2nd Floor Common Pantry',
    locality: 'Sarabha Nagar, Ludhiana',
    requestedBy: 'Gurpreet Kaur (Landlord)',
    contactPhone: '+91 98142 55667',
    scheduledSlot: 'Completed • 22 Sep 2026',
    assignedTech: 'Manoj Kumar (Master Plumber)',
    amount: 120000, // ₹1,200 in paise
    status: 'COMPLETED',
  },
];

export default function ServiceJobsPage() {
  const [jobs, setJobs] = useState<JobItem[]>(INITIAL_JOBS);
  const [filter, setFilter] = useState<'ALL' | 'NEW_REQUEST' | 'IN_PROGRESS' | 'COMPLETED'>('ALL');

  const filteredJobs = jobs.filter((j) => (filter === 'ALL' ? true : j.status === filter));

  const handleAdvanceStatus = (id: string, nextStatus: 'IN_PROGRESS' | 'COMPLETED') => {
    setJobs((prev) =>
      prev.map((j) =>
        j.id === id
          ? {
              ...j,
              status: nextStatus,
              scheduledSlot: nextStatus === 'COMPLETED' ? 'Completed • Just Now' : j.scheduledSlot,
            }
          : j
      )
    );
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Service Jobs & SLA Dispatch Board</h1>
          <p className="text-xs text-slate-500 mt-1">
            Live maintenance tickets and student service orders dispatched to QuickFix Services across Ludhiana PGs.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="info" size="sm">
            {jobs.filter((j) => j.status !== 'COMPLETED').length} Active Dispatches
          </Badge>
          <Badge variant="success" size="sm">
            {jobs.filter((j) => j.status === 'COMPLETED').length} Completed
          </Badge>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-bold">
        {[
          { key: 'ALL', label: `All Jobs (${jobs.length})` },
          { key: 'NEW_REQUEST', label: `New Requests (${jobs.filter((j) => j.status === 'NEW_REQUEST').length})` },
          { key: 'IN_PROGRESS', label: `In Progress (${jobs.filter((j) => j.status === 'IN_PROGRESS').length})` },
          { key: 'COMPLETED', label: `Completed (${jobs.filter((j) => j.status === 'COMPLETED').length})` },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setFilter(t.key as any)}
            className={`px-4 py-2.5 rounded-xl border transition-all whitespace-nowrap ${
              filter === t.key
                ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Jobs List */}
      <div className="space-y-4">
        {filteredJobs.map((job) => (
          <Card key={job.id} className="p-5 border-slate-200 hover:shadow-md transition-all">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-[11px] font-bold bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded border border-slate-200">
                    {job.jobCode}
                  </span>
                  <Badge
                    variant={
                      job.priority === 'URGENT' ? 'danger' : job.priority === 'HIGH' ? 'warning' : 'info'
                    }
                    size="sm"
                  >
                    {job.priority} PRIORITY
                  </Badge>
                  <Badge
                    variant={
                      job.status === 'COMPLETED'
                        ? 'success'
                        : job.status === 'IN_PROGRESS'
                        ? 'info'
                        : 'warning'
                    }
                    size="sm"
                  >
                    {job.status.replace('_', ' ')}
                  </Badge>
                  <span className="text-xs font-semibold text-slate-500">• {job.category}</span>
                </div>

                <h3 className="text-base font-extrabold text-slate-900">{job.title}</h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-slate-600 pt-1">
                  <div className="flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                    <span>
                      <strong>{job.property}</strong> ({job.room})
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>{job.requestedBy}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    <span>{job.scheduledSlot}</span>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-[11px] text-slate-500 pt-1">
                  <span className="flex items-center gap-1">
                    <Wrench className="w-3 h-3 text-cyan-600" /> Assigned Technician:{' '}
                    <strong className="text-slate-800">{job.assignedTech}</strong>
                  </span>
                  <span className="flex items-center gap-1">
                    <Phone className="w-3 h-3 text-emerald-600" /> {job.contactPhone}
                  </span>
                </div>
              </div>

              {/* Right Column: Fee & Action Buttons */}
              <div className="flex sm:flex-row lg:flex-col items-center lg:items-end justify-between gap-3 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-100 shrink-0">
                <div className="text-left lg:text-right">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Approved Rate</span>
                  <span className="text-lg font-black text-emerald-700">{formatINR(job.amount)}</span>
                </div>

                {job.status === 'NEW_REQUEST' && (
                  <button
                    onClick={() => handleAdvanceStatus(job.id, 'IN_PROGRESS')}
                    className="py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-sm transition-all"
                  >
                    <Play className="w-3.5 h-3.5" />
                    <span>Accept & Dispatch Tech</span>
                  </button>
                )}

                {job.status === 'IN_PROGRESS' && (
                  <button
                    onClick={() => handleAdvanceStatus(job.id, 'COMPLETED')}
                    className="py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-sm transition-all"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Mark Completed & Bill</span>
                  </button>
                )}

                {job.status === 'COMPLETED' && (
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Settled to Ledger
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
