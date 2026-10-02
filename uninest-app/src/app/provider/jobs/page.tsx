'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
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
  X,
  Camera,
  UploadCloud,
  KeyRound,
  ShieldCheck,
  DollarSign,
  FileCheck,
  ExternalLink,
  FileText,
  Printer,
  Sparkles,
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
  amount: number; // in paise
  status: 'NEW_REQUEST' | 'IN_PROGRESS' | 'COMPLETED';
  tenantPin?: string;
  resolutionNotes?: string;
  proofPhoto?: string;
  completedAt?: string;
  netPayout?: number;
  voucherNo?: string;
}

const TECHNICIANS = [
  {
    name: 'Gurdeep Singh',
    role: 'Sr. Electrician & Wireman',
    phone: '+91 98765 00011',
    rating: 4.9,
    eta: '10 Mins (Passi Nagar Zone)',
  },
  {
    name: 'Manoj Kumar',
    role: 'Master Plumber & Pipefitter',
    phone: '+91 98765 00012',
    rating: 4.8,
    eta: '15 Mins (Ferozepur Rd Zone)',
  },
  {
    name: 'Sukhwinder Gill',
    role: 'HVAC & AC Service Lead',
    phone: '+91 98765 00016',
    rating: 4.9,
    eta: '20 Mins (Sarabha Nagar Zone)',
  },
  {
    name: 'Jagjit Singh',
    role: 'Smart Lock & Hardware Tech',
    phone: '+91 98765 00013',
    rating: 4.7,
    eta: '12 Mins (College Road Zone)',
  },
  {
    name: 'Rakesh Verma',
    role: 'Deep Cleaning & Sanitization Lead',
    phone: '+91 98765 00018',
    rating: 4.8,
    eta: '25 Mins (Model Town Zone)',
  },
];

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
    scheduledSlot: 'Today • Within 90 Mins (Standard SLA)',
    assignedTech: 'Gurdeep Singh (Sr. Electrician)',
    amount: 55000,
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
    amount: 80000,
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
    amount: 50000,
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
    amount: 50000,
    status: 'COMPLETED',
    tenantPin: '8492',
    resolutionNotes: 'Replaced brass diverter cartridge and applied teflon seal. Pressure tested at 3.2 bar without leak.',
    completedAt: '24 Sep 2026, 04:15 PM',
    netPayout: 42500,
    voucherNo: 'VOU-LDH-2026-881',
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
    amount: 120000,
    status: 'COMPLETED',
    tenantPin: '3910',
    resolutionNotes: 'Installed 100 GPD high-flow RO membrane and spun sediment filter. TDS measured down to 78 PPM.',
    completedAt: '22 Sep 2026, 11:30 AM',
    netPayout: 102000,
    voucherNo: 'VOU-LDH-2026-874',
  },
];

const SAMPLE_WORK_PHOTO =
  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400"><rect width="600" height="400" fill="%230f172a"/><rect x="20" y="20" width="560" height="360" rx="16" fill="%231e293b" stroke="%23334155" stroke-width="2"/><circle cx="300" cy="180" r="70" fill="%2338bdf8" opacity="0.15"/><path d="M270 180 L290 200 L335 155" stroke="%2338bdf8" stroke-width="8" stroke-linecap="round" stroke-linejoin="round" fill="none"/><text x="300" y="280" fill="%23f8fafc" font-size="18" font-family="sans-serif" font-weight="bold" text-anchor="middle">UniNest Verified On-Site Resolution</text><text x="300" y="310" fill="%2394a3b8" font-size="13" font-family="sans-serif" text-anchor="middle">Geo-Tagged &amp; Timestamp Verified • Ludhiana Central Hub</text></svg>';

export default function ServiceJobsPage() {
  const [jobs, setJobs] = useState<JobItem[]>(INITIAL_JOBS);
  const [filter, setFilter] = useState<'ALL' | 'NEW_REQUEST' | 'IN_PROGRESS' | 'COMPLETED'>('ALL');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modal states for realistic multi-step field operations
  const [dispatchingJob, setDispatchingJob] = useState<JobItem | null>(null);
  const [completingJob, setCompletingJob] = useState<JobItem | null>(null);
  const [voucherJob, setVoucherJob] = useState<JobItem | null>(null);

  // Form states inside Dispatch Modal
  const [selectedTech, setSelectedTech] = useState(TECHNICIANS[0].name);
  const [dispatchEta, setDispatchEta] = useState('15 Mins (Rapid SLA)');
  const [dispatchNote, setDispatchNote] = useState('Please carry safety kit, insulated tools, and replacement modular parts.');

  // Form states inside Completion Modal
  const [completionPin, setCompletionPin] = useState('');
  const [pinError, setPinError] = useState<string | null>(null);
  const [workNotes, setWorkNotes] = useState('');
  const [proofPhoto, setProofPhoto] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load live DB orders & emergency dispatches & merge
  useEffect(() => {
    async function loadLiveOrders() {
      try {
        // 1. Fetch live emergency dispatches
        const emgRes = await fetch('/api/demo/emergency?role=PROVIDER');
        if (emgRes.ok) {
          const emgJson = await emgRes.json();
          if (emgJson.emergencies && Array.isArray(emgJson.emergencies)) {
            const mappedEmg: JobItem[] = emgJson.emergencies.map((e: any) => ({
              id: e.id,
              jobCode: e.dispatchNo,
              title: `🚨 ${e.title}`,
              category: `${e.category} Emergency`,
              priority: 'URGENT' as const,
              property: e.property,
              room: e.unit,
              locality: 'Passi Nagar, Ludhiana',
              requestedBy: `${e.tenantName} (Student Resident)`,
              contactPhone: e.tenantPhone,
              scheduledSlot:
                e.status === 'RESOLVED'
                  ? 'Resolved within SLA'
                  : `Emergency 15-Min SLA (${e.etaMins}m ETA) • Reported ${e.reportedAt}`,
              assignedTech: e.assignedTech,
              amount: 65000,
              status:
                e.status === 'RESOLVED'
                  ? 'COMPLETED'
                  : e.status === 'ON_SITE' || e.status === 'EN_ROUTE'
                  ? 'IN_PROGRESS'
                  : 'NEW_REQUEST',
              tenantPin: e.tenantPin || '8492',
              resolutionNotes: e.notes || 'Emergency attended and hazard neutralized.',
              completedAt: e.resolvedAt || 'Today, Resolved',
              netPayout: 55250,
              voucherNo: `VOU-EMG-${e.dispatchNo.replace('EMG-', '')}`,
            }));

            setJobs((prev) => {
              const existingIds = new Set(prev.map((j) => j.id));
              const additions = mappedEmg.filter((me) => !existingIds.has(me.id));
              return [...additions, ...prev];
            });
          }
        }

        // 2. Fetch service orders
        const res = await fetch('/api/demo/service');
        if (res.ok) {
          const json = await res.json();
          if (json.success && Array.isArray(json.orders)) {
            const mappedOrders: JobItem[] = json.orders.map((o: any, idx: number) => ({
              id: o.id || `live-${idx}`,
              jobCode: `JOB-SRV-${String(o.id).slice(-4).toUpperCase()}`,
              title: o.name || 'Student Ancillary Service',
              category: o.category || 'Student Services',
              priority: 'MEDIUM' as const,
              property: 'PCTE Smart Student Residency',
              room: o.room || 'Room 204 (Bed A)',
              locality: 'Passi Nagar, Ludhiana',
              requestedBy: `${o.customerName || 'Verified Student'} (Tenant)`,
              contactPhone: '+91 98765 43210',
              scheduledSlot: o.scheduledDate
                ? `Delivery: ${new Date(o.scheduledDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}`
                : 'Within 24 Hours SLA',
              assignedTech: 'QuickFix Duty Technician',
              amount: Number(o.price || 80000),
              status: o.status === 'COMPLETED' ? 'COMPLETED' : o.status === 'IN_PROGRESS' ? 'IN_PROGRESS' : 'NEW_REQUEST',
            }));

            setJobs((prev) => {
              const existingIds = new Set(prev.map((j) => j.id));
              const additions = mappedOrders.filter((mo) => !existingIds.has(mo.id));
              return [...additions, ...prev];
            });
          }
        }
      } catch {}
    }

    loadLiveOrders();
  }, []);

  const filteredJobs = jobs.filter((j) => (filter === 'ALL' ? true : j.status === filter));

  // Determine active emergency dispatches vs resolved ones strictly on emergency tickets
  const isEmergencyJob = (j: JobItem) =>
    j.id.startsWith('emg-') ||
    j.jobCode.startsWith('EMG-') ||
    j.category.toLowerCase().includes('emergency') ||
    j.title.includes('🚨');

  const activeEmergencies = jobs.filter((j) => isEmergencyJob(j) && j.status !== 'COMPLETED');
  const resolvedEmergencies = jobs.filter((j) => isEmergencyJob(j) && j.status === 'COMPLETED');

  // Trigger dispatch modal
  const handleOpenDispatchModal = (job: JobItem) => {
    setDispatchingJob(job);
    setSelectedTech(job.assignedTech && job.assignedTech !== 'QuickFix Duty Technician' ? job.assignedTech : TECHNICIANS[0].name);
    setDispatchEta(isEmergencyJob(job) ? '15 Mins (Rapid SLA)' : '30 Mins');
    setDispatchNote('Direct contact established with tenant. Priority on-site arrival confirmed.');
  };

  // Confirm dispatch and assign tech
  const handleConfirmDispatch = async () => {
    if (!dispatchingJob) return;
    const targetId = dispatchingJob.id;
    const techName = selectedTech;
    const etaText = dispatchEta;

    setJobs((prev) =>
      prev.map((j) =>
        j.id === targetId
          ? {
              ...j,
              status: 'IN_PROGRESS',
              assignedTech: techName,
              scheduledSlot: `En Route • ETA: ${etaText}`,
            }
          : j
      )
    );

    // Sync status with API
    if (targetId.startsWith('emg-') || targetId.startsWith('EMG-')) {
      try {
        await fetch('/api/demo/emergency', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'UPDATE_STATUS',
            id: targetId,
            status: 'ON_SITE',
            notes: `Dispatched ${techName}. ETA: ${etaText}.`,
          }),
        });
      } catch {}
    } else {
      try {
        await fetch('/api/demo/service', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orderId: targetId, status: 'IN_PROGRESS' }),
        });
      } catch {}
    }

    setToastMessage(`Tech ${techName} dispatched for ${dispatchingJob.jobCode}. Tenant alert SMS sent.`);
    setDispatchingJob(null);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Trigger completion modal
  const handleOpenCompletionModal = (job: JobItem) => {
    setCompletingJob(job);
    setCompletionPin('');
    setPinError(null);
    setWorkNotes(
      job.resolutionNotes ||
        `Inspected and resolved ${job.title.replace('🚨 ', '')}. Performed electrical/functional diagnostic test and verified safety with resident.`
    );
    setProofPhoto(null);
  };

  // Handle Photo upload
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      setProofPhoto(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Confirm completion with Doorstep PIN and photo proof
  const handleConfirmCompletion = async () => {
    if (!completingJob) return;

    // PIN Validation (require 4 digits)
    const cleanPin = completionPin.trim();
    if (!cleanPin || cleanPin.length < 4) {
      setPinError('Please enter the 4-digit verification PIN provided by the tenant or caretaker at the door.');
      return;
    }

    setIsSubmitting(true);
    const targetId = completingJob.id;
    const nowStr = new Date().toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    const netPayout = Math.round(completingJob.amount * 0.85);
    const voucherNo = `VOU-LDH-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const finalPhoto = proofPhoto || SAMPLE_WORK_PHOTO;

    setJobs((prev) =>
      prev.map((j) =>
        j.id === targetId
          ? {
              ...j,
              status: 'COMPLETED',
              scheduledSlot: `Completed • ${nowStr}`,
              tenantPin: cleanPin,
              resolutionNotes: workNotes,
              proofPhoto: finalPhoto,
              completedAt: nowStr,
              netPayout,
              voucherNo,
            }
          : j
      )
    );

    // Sync status with API
    if (targetId.startsWith('emg-') || targetId.startsWith('EMG-')) {
      try {
        await fetch('/api/demo/emergency', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'UPDATE_STATUS',
            id: targetId,
            status: 'RESOLVED',
            notes: workNotes,
          }),
        });
      } catch {}
    } else {
      try {
        await fetch('/api/demo/service', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orderId: targetId, status: 'COMPLETED' }),
        });
      } catch {}
    }

    setIsSubmitting(false);
    setToastMessage(`Job ${completingJob.jobCode} verified & completed! Net payout ${formatINR(netPayout)} credited.`);
    setCompletingJob(null);
    setTimeout(() => setToastMessage(null), 4500);
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="bg-slate-900 text-white text-xs font-bold px-4 py-3 rounded-2xl shadow-lg flex items-center justify-between animate-slide-down">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{toastMessage}</span>
          </div>
          <button onClick={() => setToastMessage(null)} className="text-slate-400 hover:text-white p-1">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Service Jobs & SLA Dispatch Board</h1>
          <p className="text-xs text-slate-500 mt-1">
            Live maintenance dispatches, resident requests, and technician field fulfillment for QuickFix Services.
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

      {/* Active 15-Min Emergency Alert Banner — ONLY shows when an uncompleted emergency dispatch actually exists */}
      {activeEmergencies.length > 0 && (
        <div className="bg-rose-50 border-2 border-rose-500 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-md animate-pulse">
          <div className="flex items-start sm:items-center gap-3">
            <AlertTriangle className="w-6 h-6 text-rose-600 shrink-0 mt-0.5 sm:mt-0" />
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-mono text-xs font-bold text-rose-800 bg-rose-100 px-2 py-0.5 rounded">
                  {activeEmergencies[0].jobCode}
                </span>
                <span className="text-xs font-black text-rose-900 uppercase tracking-wider">
                  Active 15-Min Emergency SLA ({activeEmergencies.length} Pending Dispatch)
                </span>
              </div>
              <p className="text-sm font-black text-rose-950 mt-0.5">
                {activeEmergencies[0].title} — {activeEmergencies[0].property} ({activeEmergencies[0].room})
              </p>
              <p className="text-xs text-rose-700 mt-0.5">
                On-call tech: <strong>{activeEmergencies[0].assignedTech}</strong> • Resident: {activeEmergencies[0].requestedBy} ({activeEmergencies[0].contactPhone})
              </p>
            </div>
          </div>
          <button
            onClick={() => handleOpenDispatchModal(activeEmergencies[0])}
            className="bg-rose-600 hover:bg-rose-700 text-white font-black text-xs px-4 py-2.5 rounded-xl uppercase tracking-wider shrink-0 transition-all shadow-sm"
          >
            Dispatch Duty Tech Now →
          </button>
        </div>
      )}

      {/* Green SLA Compliance Banner — Shows when all emergency dispatches are completed and zero breaches */}
      {activeEmergencies.length === 0 && resolvedEmergencies.length > 0 && (
        <div className="bg-emerald-50 border border-emerald-300 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <div>
              <p className="text-xs font-extrabold text-emerald-900">
                100% Emergency SLA Compliant — All Critical P0 Dispatches Resolved
              </p>
              <p className="text-[11px] text-emerald-700 mt-0.5">
                {resolvedEmergencies.length} emergency dispatch{resolvedEmergencies.length > 1 ? 'es have' : ' has'} been attended to within the 15-minute protocol window. Ledger payouts credited to QuickFix Services wallet.
              </p>
            </div>
          </div>
          <span className="bg-emerald-600 text-white text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider shrink-0">
            SLA Verified
          </span>
        </div>
      )}

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
        {filteredJobs.map((job) => {
          const isEmergency = isEmergencyJob(job);
          return (
            <Card
              key={job.id}
              className={`p-5 transition-all ${
                isEmergency && job.status !== 'COMPLETED'
                  ? 'border-2 border-rose-400 bg-rose-50/20 shadow-md'
                  : 'border-slate-200 hover:shadow-md'
              }`}
            >
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

                  <div className="flex items-center gap-4 text-[11px] text-slate-500 pt-1 flex-wrap">
                    <span className="flex items-center gap-1">
                      <Wrench className="w-3 h-3 text-cyan-600" /> Assigned Technician:{' '}
                      <strong className="text-slate-800">{job.assignedTech}</strong>
                    </span>
                    <span className="flex items-center gap-1">
                      <Phone className="w-3 h-3 text-emerald-600" /> {job.contactPhone}
                    </span>
                    {job.tenantPin && (
                      <span className="flex items-center gap-1 text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded font-mono font-bold">
                        <KeyRound className="w-3 h-3 text-indigo-600" /> Doorstep PIN: {job.tenantPin}
                      </span>
                    )}
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
                      onClick={() => handleOpenDispatchModal(job)}
                      className={`py-2.5 px-4 rounded-xl text-white font-extrabold text-xs flex items-center gap-1.5 shadow-sm transition-all ${
                        isEmergency
                          ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-200'
                          : 'bg-indigo-600 hover:bg-indigo-700'
                      }`}
                    >
                      <Play className="w-3.5 h-3.5" />
                      <span>Accept & Dispatch Tech</span>
                    </button>
                  )}

                  {job.status === 'IN_PROGRESS' && (
                    <button
                      onClick={() => handleOpenCompletionModal(job)}
                      className="py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-sm transition-all"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Mark Completed & Bill</span>
                    </button>
                  )}

                  {job.status === 'COMPLETED' && (
                    <div className="flex flex-col items-end gap-1.5">
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-xl">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Settled to Ledger
                      </span>
                      <button
                        onClick={() => setVoucherJob(job)}
                        className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 transition-colors"
                      >
                        <FileCheck className="w-3.5 h-3.5" /> View Payout Voucher
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* 1. DISPATCH MODAL */}
      {dispatchingJob && (
        <Modal
          isOpen={Boolean(dispatchingJob)}
          onClose={() => setDispatchingJob(null)}
          title={`Dispatch Technician • ${dispatchingJob.jobCode}`}
          description="Assign a certified service technician, set the on-site arrival window, and trigger resident dispatch alert."
          size="lg"
        >
          <div className="space-y-5">
            {/* Target Job Quick Summary */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Dispatched Job</span>
                <Badge
                  variant={dispatchingJob.priority === 'URGENT' ? 'danger' : 'warning'}
                  size="sm"
                >
                  {dispatchingJob.priority} PRIORITY
                </Badge>
              </div>
              <p className="text-sm font-extrabold text-slate-900">{dispatchingJob.title}</p>
              <div className="flex items-center gap-4 text-xs text-slate-600 flex-wrap">
                <span>📍 {dispatchingJob.property} ({dispatchingJob.room})</span>
                <span>👤 {dispatchingJob.requestedBy}</span>
                <span>📞 {dispatchingJob.contactPhone}</span>
              </div>
            </div>

            {/* Select Technician */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                Select Available Technician from QuickFix Roster
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {TECHNICIANS.map((tech) => (
                  <div
                    key={tech.name}
                    onClick={() => setSelectedTech(tech.name)}
                    className={`p-3 rounded-xl border cursor-pointer transition-all ${
                      selectedTech === tech.name
                        ? 'border-indigo-600 bg-indigo-50/50 ring-2 ring-indigo-500/20'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-extrabold text-slate-900">{tech.name}</p>
                      <span className="text-[11px] font-bold text-amber-600">⭐ {tech.rating}</span>
                    </div>
                    <p className="text-[11px] text-slate-500">{tech.role}</p>
                    <p className="text-[10px] text-indigo-700 font-semibold mt-1">📍 {tech.eta}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Select ETA Window */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                Estimated Doorstep Arrival SLA
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  '15 Mins (Rapid SLA)',
                  '30 Mins (Standard)',
                  '45 Mins',
                  '60 Mins',
                ].map((eta) => (
                  <button
                    key={eta}
                    type="button"
                    onClick={() => setDispatchEta(eta)}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all text-center ${
                      dispatchEta === eta
                        ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {eta}
                  </button>
                ))}
              </div>
            </div>

            {/* Dispatcher Notes */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                Field Technician Instructions & Safety Protocol
              </label>
              <input
                type="text"
                value={dispatchNote}
                onChange={(e) => setDispatchNote(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                placeholder="Notes for technician upon arrival..."
              />
            </div>

            {/* Resident Alert Simulation Notification */}
            <div className="bg-sky-50 border border-sky-200 rounded-xl p-3 flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
              <p className="text-[11px] text-sky-800 leading-relaxed">
                Confirming dispatch triggers an automated SMS and WhatsApp notification to resident{' '}
                <strong>{dispatchingJob.requestedBy}</strong> with tech details, GPS ETA, and a 4-digit Doorstep Verification PIN.
              </p>
            </div>

            {/* Footer Buttons */}
            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setDispatchingJob(null)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDispatch}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-extrabold flex items-center gap-1.5 shadow-sm transition-all"
              >
                <Play className="w-3.5 h-3.5" />
                <span>Confirm Dispatch & Notify Tenant</span>
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* 2. COMPLETION & BILLING MODAL */}
      {completingJob && (
        <Modal
          isOpen={Boolean(completingJob)}
          onClose={() => setCompletingJob(null)}
          title={`Verify On-Site Completion & Bill • ${completingJob.jobCode}`}
          description="In compliance with UniNest Facility SLA, verify the resident's doorstep OTP, attach photo proof, and credit payout to your vendor ledger."
          size="lg"
        >
          <div className="space-y-5">
            {/* Job Information & Rate Summary */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase">Fulfillment For</p>
                <p className="text-sm font-black text-slate-900">{completingJob.title}</p>
                <p className="text-xs text-slate-600">
                  {completingJob.property} ({completingJob.room}) • Tech: <strong>{completingJob.assignedTech}</strong>
                </p>
              </div>
              <div className="text-left sm:text-right">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Approved Rate</span>
                <span className="text-base font-black text-emerald-700">{formatINR(completingJob.amount)}</span>
              </div>
            </div>

            {/* Doorstep Verification PIN */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1">
                  <KeyRound className="w-3.5 h-3.5 text-indigo-600" /> Doorstep Resident Verification PIN (4 Digits)
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setCompletionPin('8492');
                    setPinError(null);
                  }}
                  className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 underline decoration-indigo-300"
                >
                  Fill Simulation PIN (8492)
                </button>
              </div>
              <input
                type="text"
                maxLength={4}
                value={completionPin}
                onChange={(e) => {
                  setCompletionPin(e.target.value.replace(/\D/g, ''));
                  if (pinError) setPinError(null);
                }}
                className={`w-full text-center text-xl font-mono font-black tracking-widest p-3 rounded-xl border ${
                  pinError ? 'border-rose-500 bg-rose-50' : 'border-slate-200 focus:ring-2 focus:ring-indigo-500'
                }`}
                placeholder="• • • •"
              />
              {pinError ? (
                <p className="text-xs text-rose-600 font-semibold">{pinError}</p>
              ) : (
                <p className="text-[11px] text-slate-500">
                  Ask resident <strong>{completingJob.requestedBy}</strong> or caretaker for the 4-digit code provided on their UniNest app.
                </p>
              )}
            </div>

            {/* Work Resolution Summary */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                Work Resolution Summary & Parts Replaced
              </label>
              <textarea
                rows={2}
                value={workNotes}
                onChange={(e) => setWorkNotes(e.target.value)}
                className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                placeholder="Describe resolution (e.g. Replaced 16A socket and MCB, checked earthing and tested load)..."
              />
            </div>

            {/* Photo Proof of Work Attachment */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1">
                  <Camera className="w-3.5 h-3.5 text-cyan-600" /> Photo Proof of Completed Work
                </label>
                {!proofPhoto && (
                  <button
                    type="button"
                    onClick={() => setProofPhoto(SAMPLE_WORK_PHOTO)}
                    className="text-[11px] font-bold text-cyan-600 hover:text-cyan-800 underline decoration-cyan-300"
                  >
                    Use Sample Geo-Tagged Photo
                  </button>
                )}
              </div>

              {proofPhoto ? (
                <div className="relative rounded-xl overflow-hidden border border-slate-200 bg-slate-900 group">
                  <img src={proofPhoto} alt="Work Proof" className="w-full h-36 object-cover" />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-between p-3 text-white text-xs">
                    <span className="flex items-center gap-1 font-bold">
                      <ShieldCheck className="w-4 h-4 text-emerald-400" /> Geo-Tagged Proof Attached
                    </span>
                    <button
                      type="button"
                      onClick={() => setProofPhoto(null)}
                      className="bg-rose-600 hover:bg-rose-700 text-white p-1 rounded-lg text-xs"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <label className="border-2 border-dashed border-slate-200 hover:border-slate-300 rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer bg-slate-50/50 hover:bg-slate-50 transition-colors">
                  <UploadCloud className="w-6 h-6 text-slate-400 mb-1" />
                  <span className="text-xs font-bold text-slate-700">Upload on-site inspection photo</span>
                  <span className="text-[10px] text-slate-400 mt-0.5">JPG, PNG or WEBP (Max 5MB)</span>
                  <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                </label>
              )}
            </div>

            {/* Financial Release Breakdown */}
            <div className="p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-1.5 text-xs">
              <div className="flex items-center justify-between text-slate-600">
                <span>Gross Service Charge:</span>
                <span className="font-bold">{formatINR(completingJob.amount)}</span>
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <span>UniNest Platform Facilitation Fee (15%):</span>
                <span className="font-bold text-rose-600">-{formatINR(Math.round(completingJob.amount * 0.15))}</span>
              </div>
              <div className="pt-1.5 border-t border-emerald-200 flex items-center justify-between text-emerald-950 font-black">
                <span>Instant Net Credit to Vendor Ledger (85%):</span>
                <span className="text-sm font-black text-emerald-800">
                  {formatINR(Math.round(completingJob.amount * 0.85))}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setCompletingJob(null)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleConfirmCompletion}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold flex items-center gap-1.5 shadow-sm transition-all"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Verify OTP & Release Ledger Payout</span>
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* 3. VOUCHER & WORK CERTIFICATE MODAL */}
      {voucherJob && (
        <Modal
          isOpen={Boolean(voucherJob)}
          onClose={() => setVoucherJob(null)}
          title="Job Completion Certificate & Ledger Payout Voucher"
          size="lg"
        >
          <div className="space-y-5 print:p-0">
            {/* Voucher Header */}
            <div className="p-4 bg-slate-900 text-white rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest block">
                  Official Facility Operations Voucher
                </span>
                <h3 className="text-base font-black mt-0.5">{voucherJob.voucherNo || 'VOU-LDH-2026-904'}</h3>
                <p className="text-xs text-slate-400">
                  Job Code: <strong>{voucherJob.jobCode}</strong> • Settled to QuickFix Services
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-black px-3 py-1 rounded-full">
                  ✓ VERIFIED & SETTLED
                </span>
              </div>
            </div>

            {/* Grid of Key Verification Details */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <span className="text-[10px] font-bold text-slate-400 block uppercase">Doorstep PIN</span>
                <span className="text-sm font-black font-mono text-indigo-700">
                  {voucherJob.tenantPin || '8492'}
                </span>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <span className="text-[10px] font-bold text-slate-400 block uppercase">Technician</span>
                <span className="text-xs font-black text-slate-900">{voucherJob.assignedTech}</span>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <span className="text-[10px] font-bold text-slate-400 block uppercase">Resolved Date</span>
                <span className="text-xs font-black text-slate-900">{voucherJob.completedAt || 'Today'}</span>
              </div>
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
                <span className="text-[10px] font-bold text-emerald-700 block uppercase">Net Payout</span>
                <span className="text-sm font-black text-emerald-800">
                  {formatINR(voucherJob.netPayout || Math.round(voucherJob.amount * 0.85))}
                </span>
              </div>
            </div>

            {/* Resolution Notes */}
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Technical Resolution Log
              </span>
              <p className="text-slate-800 leading-relaxed">
                {voucherJob.resolutionNotes || 'Routine maintenance and inspection completed. Normal functionality confirmed with tenant.'}
              </p>
            </div>

            {/* Photo Proof */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Photographic Verification Evidence
              </span>
              <div className="rounded-xl overflow-hidden border border-slate-200 bg-slate-900 max-h-48 flex items-center justify-center">
                <img
                  src={voucherJob.proofPhoto || SAMPLE_WORK_PHOTO}
                  alt="Verified Work Proof"
                  className="w-full h-48 object-cover"
                />
              </div>
            </div>

            {/* Financial Ledger Statement */}
            <div className="p-3.5 bg-slate-100/70 border border-slate-200 rounded-xl text-xs space-y-1.5">
              <div className="flex items-center justify-between text-slate-600">
                <span>Customer & Property:</span>
                <span className="font-bold">{voucherJob.property} ({voucherJob.room})</span>
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <span>Approved Job Gross:</span>
                <span className="font-bold">{formatINR(voucherJob.amount)}</span>
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <span>Platform Commission (15%):</span>
                <span className="font-bold text-rose-600">-{formatINR(Math.round(voucherJob.amount * 0.15))}</span>
              </div>
              <div className="pt-1.5 border-t border-slate-200 flex items-center justify-between font-black text-slate-900">
                <span>Net Credit Released to Wallet:</span>
                <span className="text-sm font-black text-emerald-700">
                  {formatINR(voucherJob.netPayout || Math.round(voucherJob.amount * 0.85))}
                </span>
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => window.print()}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-1.5 transition-colors"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Certificate</span>
              </button>
              <button
                type="button"
                onClick={() => setVoucherJob(null)}
                className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
