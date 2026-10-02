'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Select, Textarea } from '@/components/ui/Input';
import {
  Wrench,
  CheckCircle2,
  Clock,
  AlertCircle,
  AlertTriangle,
  Phone,
  Camera,
  UploadCloud,
  ShieldCheck,
  KeyRound,
  DollarSign,
  FileText,
  Check,
  Eye,
  X,
  Sparkles,
  ArrowRight,
  UserCheck,
} from 'lucide-react';
import { formatINR } from '@/lib/utils';
import { EmergencyDispatchRecord } from '@/lib/emergencyStore';

export interface TicketItem {
  id: string;
  ticketNo: string;
  property: string;
  room: string;
  tenant: string;
  tenantPhone?: string;
  issue: string;
  category: string;
  priority: string;
  status: string;
  vendor: string;
  createdAt: string;
  resolutionNote?: string;
  tenantEvidencePhoto?: string;
  resolutionPhoto?: string;
  costIncurred?: number; // in rupees
  tenantSignedOff?: boolean;
}

interface LandlordMaintenanceClientProps {
  initialTickets: TicketItem[];
}

const SAMPLE_TAP_BEFORE_PHOTO =
  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400"><rect width="600" height="400" fill="%231e293b"/><circle cx="300" cy="180" r="60" fill="%230284c7" opacity="0.2"/><path d="M260 160 C260 130 340 130 340 160 L340 210 L320 210 L320 240 L280 240 L280 210 L260 210 Z" fill="%2394a3b8"/><path d="M300 245 L300 290" stroke="%2338bdf8" stroke-width="6" stroke-linecap="round" stroke-dasharray="10 8"/><text x="300" y="340" fill="%23f8fafc" font-size="16" font-family="sans-serif" font-weight="bold" text-anchor="middle">Tenant Submitted Evidence: Leaking Diverter Tap</text><text x="300" y="365" fill="%2394a3b8" font-size="12" font-family="sans-serif" text-anchor="middle">Reported by Rahul Sharma • Room 204 Bathroom</text></svg>';

const SAMPLE_FIXED_PHOTO =
  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400"><rect width="600" height="400" fill="%23064e3b"/><circle cx="300" cy="180" r="65" fill="%2310b981" opacity="0.25"/><path d="M250 180 L285 215 L350 145" stroke="%2334d399" stroke-width="12" stroke-linecap="round" stroke-linejoin="round" fill="none"/><text x="300" y="300" fill="%23ecfdf5" font-size="18" font-family="sans-serif" font-weight="bold" text-anchor="middle">Resolved &amp; Pressure Tested</text><text x="300" y="330" fill="%23a7f3d0" font-size="13" font-family="sans-serif" text-anchor="middle">New Cartridge Installed • Zero Leakage Verified</text></svg>';

const SAMPLE_BREAKER_FIX_PHOTO =
  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400"><rect width="600" height="400" fill="%230f172a"/><rect x="180" y="100" width="240" height="180" rx="12" fill="%231e293b" stroke="%2338bdf8" stroke-width="3"/><rect x="220" y="140" width="30" height="60" rx="4" fill="%2322c55e"/><rect x="270" y="140" width="30" height="60" rx="4" fill="%2322c55e"/><rect x="320" y="140" width="30" height="60" rx="4" fill="%2322c55e"/><text x="300" y="320" fill="%23f8fafc" font-size="17" font-family="sans-serif" font-weight="bold" text-anchor="middle">Landlord Self-Resolution: Main 32A MCB Replaced</text><text x="300" y="348" fill="%2394a3b8" font-size="12" font-family="sans-serif" text-anchor="middle">Tested 230V Phase Load • Caretaker Passi Residency</text></svg>';

export function LandlordMaintenanceClient({ initialTickets }: LandlordMaintenanceClientProps) {
  const [tickets, setTickets] = useState<TicketItem[]>(() =>
    initialTickets.map((t) => ({
      ...t,
      tenantPhone: t.tenantPhone || '+91 98765 43210',
      tenantEvidencePhoto: t.tenantEvidencePhoto || SAMPLE_TAP_BEFORE_PHOTO,
      resolutionPhoto: t.resolutionPhoto || (t.status === 'COMPLETED' ? SAMPLE_FIXED_PHOTO : undefined),
      costIncurred: t.costIncurred || (t.status === 'COMPLETED' ? 450 : 0),
      tenantSignedOff: t.tenantSignedOff ?? t.status === 'COMPLETED',
    }))
  );

  const [selectedTicket, setSelectedTicket] = useState<TicketItem | null>(null);
  const [emergencies, setEmergencies] = useState<EmergencyDispatchRecord[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState<string | null>(null);

  // Landlord Self-Resolution Modal State
  const [selfResolvingEmergency, setSelfResolvingEmergency] = useState<EmergencyDispatchRecord | null>(null);
  const [selfResolveNotes, setSelfResolveNotes] = useState('');
  const [selfResolvePhoto, setSelfResolvePhoto] = useState<string | null>(null);
  const [selfResolveOtp, setSelfResolveOtp] = useState('4192');

  // Ticket Modal Form States
  const [assignedVendor, setAssignedVendor] = useState('Ludhiana Home Services');
  const [resolutionType, setResolutionType] = useState<'VENDOR' | 'IN_HOUSE'>('VENDOR');
  const [updatedPriority, setUpdatedPriority] = useState('MEDIUM');
  const [updatedStatus, setUpdatedStatus] = useState('ASSIGNED');
  const [resolutionNote, setResolutionNote] = useState('');
  const [ticketCost, setTicketCost] = useState('0');
  const [ticketProofPhoto, setTicketProofPhoto] = useState<string | null>(null);
  const [ticketTenantSigned, setTicketTenantSigned] = useState(false);

  // Load live emergencies
  const loadEmergencies = () => {
    fetch('/api/demo/emergency?role=LANDLORD')
      .then((res) => res.json())
      .then((data) => {
        if (data.emergencies && Array.isArray(data.emergencies)) {
          setEmergencies(data.emergencies);
        }
      })
      .catch(() => {});
  };

  useEffect(() => {
    loadEmergencies();
  }, []);

  const activeEmergency = emergencies.find((e) => e.status !== 'RESOLVED');

  const [tableFilter, setTableFilter] = useState<'ALL' | 'EMERGENCY' | 'IN_PROGRESS' | 'COMPLETED'>('ALL');
  const [tableSearch, setTableSearch] = useState('');

  // Map emergency dispatches so they show in the Property Maintenance Queue table
  const mappedEmergencies: TicketItem[] = emergencies.map((e) => ({
    id: e.id,
    ticketNo: e.dispatchNo,
    property: e.property,
    room: e.unit,
    tenant: e.tenantName,
    tenantPhone: e.tenantPhone,
    issue: e.title,
    category: `${e.category} Emergency`,
    priority: 'URGENT',
    status:
      e.status === 'RESOLVED'
        ? 'COMPLETED'
        : e.status === 'AWAITING_TENANT_CONFIRMATION'
        ? 'AWAITING_OTP'
        : e.status === 'EN_ROUTE'
        ? 'EN_ROUTE'
        : 'ASSIGNED',
    vendor:
      e.resolvedBy === 'LANDLORD_IN_HOUSE'
        ? 'Passi In-House Caretaker'
        : `${e.assignedVendor} (${e.assignedTech})`,
    createdAt: e.reportedAt || new Date().toISOString(),
    resolutionNote: e.notes || e.landlordResolutionNotes,
    tenantEvidencePhoto: e.proofPhoto || SAMPLE_BREAKER_FIX_PHOTO,
    resolutionPhoto: e.proofPhoto,
    costIncurred: e.resolvedBy === 'LANDLORD_IN_HOUSE' ? 0 : 550,
    tenantSignedOff: e.status === 'RESOLVED',
  }));

  const allTickets: TicketItem[] = [
    ...mappedEmergencies,
    ...tickets.filter((t) => !mappedEmergencies.some((m) => m.ticketNo === t.ticketNo || m.id === t.id)),
  ];

  const filteredTickets = allTickets.filter((t) => {
    const isEmg = t.ticketNo.startsWith('EMG-') || t.id.startsWith('emg-');
    const matchesFilter =
      tableFilter === 'ALL'
        ? true
        : tableFilter === 'EMERGENCY'
        ? isEmg
        : tableFilter === 'COMPLETED'
        ? t.status === 'COMPLETED'
        : t.status !== 'COMPLETED';

    const matchesSearch =
      t.issue.toLowerCase().includes(tableSearch.toLowerCase()) ||
      t.ticketNo.toLowerCase().includes(tableSearch.toLowerCase()) ||
      t.property.toLowerCase().includes(tableSearch.toLowerCase()) ||
      t.tenant.toLowerCase().includes(tableSearch.toLowerCase()) ||
      t.room.toLowerCase().includes(tableSearch.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  const handleOpenTicket = (ticket: TicketItem) => {
    if (ticket.ticketNo.startsWith('EMG-') || ticket.id.startsWith('emg-')) {
      const emg = emergencies.find((e) => e.id === ticket.id || e.dispatchNo === ticket.ticketNo);
      if (emg) {
        handleOpenSelfResolve(emg);
        return;
      }
    }

    setSelectedTicket(ticket);
    setAssignedVendor(ticket.vendor || 'Ludhiana Home Services');
    setResolutionType(ticket.vendor.includes('In-House') ? 'IN_HOUSE' : 'VENDOR');
    setUpdatedPriority(ticket.priority);
    setUpdatedStatus(ticket.status);
    setResolutionNote(ticket.resolutionNote || '');
    setTicketCost(String(ticket.costIncurred || 0));
    setTicketProofPhoto(ticket.resolutionPhoto || null);
    setTicketTenantSigned(Boolean(ticket.tenantSignedOff));
  };

  // Open Landlord Self-Resolution Modal
  const handleOpenSelfResolve = (emg: EmergencyDispatchRecord) => {
    setSelfResolvingEmergency(emg);
    setSelfResolveNotes(
      'Inspected MCB breaker cluster on 2nd floor corridor distribution board. Replaced tripped 32A breaker switch and tested phase voltage (230V normal). Restored power to Room 204.'
    );
    setSelfResolvePhoto(SAMPLE_BREAKER_FIX_PHOTO);
    setSelfResolveOtp(emg.resolutionOtp || '4192');
  };

  // Submit Landlord Self-Resolution and issue OTP to tenant
  const handleSubmitSelfResolve = async () => {
    if (!selfResolvingEmergency) return;
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/demo/emergency', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'LANDLORD_SELF_RESOLVE',
          id: selfResolvingEmergency.id,
          notes: selfResolveNotes,
          proofPhoto: selfResolvePhoto || SAMPLE_BREAKER_FIX_PHOTO,
          otp: selfResolveOtp,
        }),
      });

      if (!res.ok) throw new Error('Failed to submit in-house resolution');

      setShowSuccessToast(
        `Emergency marked resolved in-house! Confirmation OTP (${selfResolveOtp}) issued to tenant ${selfResolvingEmergency.tenantName}.`
      );
      setSelfResolvingEmergency(null);
      loadEmergencies();
      setTimeout(() => setShowSuccessToast(null), 5000);
    } catch {
      alert('Failed to submit self-resolution. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Save changes to general maintenance ticket
  const handleSaveTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket) return;

    setIsSubmitting(true);

    try {
      const finalVendor = resolutionType === 'IN_HOUSE' ? 'Passi In-House Maintenance Team' : assignedVendor;
      const res = await fetch('/api/demo/maintenance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ticketId: selectedTicket.id,
          vendor: finalVendor,
          priority: updatedPriority,
          status: updatedStatus,
          resolutionNote,
          costIncurred: Number(ticketCost) || 0,
        }),
      });

      if (!res.ok) throw new Error('Failed to save ticket');

      setTickets(
        tickets.map((t) =>
          t.id === selectedTicket.id
            ? {
                ...t,
                vendor: finalVendor,
                priority: updatedPriority,
                status: updatedStatus,
                resolutionNote,
                costIncurred: Number(ticketCost) || 0,
                resolutionPhoto: ticketProofPhoto || (updatedStatus === 'COMPLETED' ? SAMPLE_FIXED_PHOTO : undefined),
                tenantSignedOff: ticketTenantSigned || updatedStatus === 'COMPLETED',
              }
            : t
        )
      );

      setShowSuccessToast(`Ticket ${selectedTicket.ticketNo} updated successfully! Audit log and vendor notified.`);
      setSelectedTicket(null);
      setTimeout(() => setShowSuccessToast(null), 4000);
    } catch {
      alert('Failed to save ticket. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Toast Notification */}
      {showSuccessToast && (
        <div className="bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-xl flex items-center justify-between animate-slide-down">
          <div className="flex items-center gap-2 font-bold text-xs sm:text-sm">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>{showSuccessToast}</span>
          </div>
          <button onClick={() => setShowSuccessToast(null)} className="text-slate-400 hover:text-white p-1">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Maintenance Dispatch & Tickets</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Tenant issue requests, SLA escalation tracking, in-house caretaker fixes, and vendor assignment
          </p>
        </div>
        <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-xl">
          <Wrench className="w-6 h-6 text-amber-600" />
        </div>
      </div>

      {/* Active Emergency Alert Banner */}
      {activeEmergency && (
        <div
          className={`border-2 rounded-2xl p-5 shadow-md space-y-4 transition-all ${
            activeEmergency.status === 'AWAITING_TENANT_CONFIRMATION'
              ? 'bg-amber-50/90 border-amber-500'
              : 'bg-rose-50 border-rose-500 animate-pulse'
          }`}
        >
          <div className="flex items-start justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <div
                className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${
                  activeEmergency.status === 'AWAITING_TENANT_CONFIRMATION'
                    ? 'bg-amber-600 text-white'
                    : 'bg-rose-600 text-white'
                }`}
              >
                {activeEmergency.status === 'AWAITING_TENANT_CONFIRMATION' ? (
                  <KeyRound className="w-6 h-6" />
                ) : (
                  <AlertTriangle className="w-6 h-6" />
                )}
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-xs font-bold bg-white/80 border border-slate-300 text-slate-800 px-2 py-0.5 rounded">
                    {activeEmergency.dispatchNo}
                  </span>
                  <span
                    className={`text-[11px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                      activeEmergency.status === 'AWAITING_TENANT_CONFIRMATION'
                        ? 'bg-amber-200 text-amber-900'
                        : 'bg-rose-200 text-rose-900'
                    }`}
                  >
                    {activeEmergency.status === 'AWAITING_TENANT_CONFIRMATION'
                      ? 'In-House Resolution Awaiting Tenant OTP'
                      : 'Critical Property Hazard (15-Min SLA)'}
                  </span>
                </div>
                <h3 className="text-base font-black text-slate-950 mt-1">
                  {activeEmergency.title} — {activeEmergency.property} ({activeEmergency.unit})
                </h3>
              </div>
            </div>

            <Badge
              variant={activeEmergency.status === 'AWAITING_TENANT_CONFIRMATION' ? 'warning' : 'danger'}
              size="sm"
            >
              {activeEmergency.status === 'AWAITING_TENANT_CONFIRMATION'
                ? 'PENDING RESIDENT OTP'
                : activeEmergency.status === 'EN_ROUTE'
                ? 'DUTY TECH EN ROUTE'
                : activeEmergency.status}
            </Badge>
          </div>

          {/* Tri-Party Context & Contact Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-white/90 p-3.5 rounded-xl border border-slate-200 text-xs">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Tenant Reporting</span>
              <p className="font-extrabold text-slate-900">{activeEmergency.tenantName}</p>
              <a
                href={`tel:${activeEmergency.tenantPhone}`}
                className="text-blue-700 font-bold hover:underline flex items-center gap-1 mt-1 text-[11px]"
              >
                <Phone className="w-3 h-3" /> Call Tenant ({activeEmergency.tenantPhone})
              </a>
            </div>

            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Assigned QuickFix Vendor</span>
              <p className="font-extrabold text-slate-900">{activeEmergency.assignedTech}</p>
              <a
                href={`tel:${activeEmergency.techPhone}`}
                className="text-emerald-700 font-bold hover:underline flex items-center gap-1 mt-1 text-[11px]"
              >
                <Phone className="w-3 h-3" /> Call Tech ({activeEmergency.techPhone})
              </a>
            </div>

            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Caretaker Action</span>
              <p className="text-slate-700 font-medium">On-site caretaker notified to grant electrical/pipe valve access.</p>
              <p className="text-[11px] text-amber-700 font-bold mt-0.5">ETA: ~{activeEmergency.etaMins} mins</p>
            </div>
          </div>

          {/* Action Options: Vendor vs In-House Self Resolve */}
          {activeEmergency.status !== 'AWAITING_TENANT_CONFIRMATION' ? (
            <div className="bg-white p-3.5 rounded-xl border border-rose-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="text-xs">
                <p className="font-bold text-slate-900 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  Did you or your caretaker fix this issue already?
                </p>
                <p className="text-slate-500 mt-0.5">
                  You can resolve it directly in-house with photo proof and a 4-digit Tenant Confirmation OTP without waiting for the vendor.
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Button
                  onClick={() => handleOpenSelfResolve(activeEmergency)}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-sm flex items-center gap-1.5 px-4 py-2"
                >
                  <Check className="w-4 h-4" />
                  <span>I Fixed It (In-House Resolve)</span>
                </Button>
              </div>
            </div>
          ) : (
            <div className="bg-amber-100/70 border border-amber-300 p-3.5 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="text-xs space-y-1">
                <p className="font-black text-amber-950 flex items-center gap-1.5">
                  <KeyRound className="w-4 h-4 text-amber-700" />
                  Tenant Confirmation OTP Issued: <span className="font-mono text-base font-black px-2 py-0.5 bg-white rounded border border-amber-300 text-indigo-700">{activeEmergency.resolutionOtp || '4192'}</span>
                </p>
                <p className="text-amber-800">
                  Share code <strong className="font-mono">{activeEmergency.resolutionOtp || '4192'}</strong> with tenant {activeEmergency.tenantName}. Once verified in student app, this emergency automatically archives.
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => handleOpenSelfResolve(activeEmergency)}
                  className="text-xs font-bold text-amber-900 bg-white border border-amber-300 hover:bg-amber-50 px-3 py-1.5 rounded-lg shadow-2xs"
                >
                  Edit In-House Proof
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tickets Table */}
      <Card padding="none">
        <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-extrabold text-slate-900">Property Maintenance Queue</h2>
              <Badge variant="info" size="sm">Total Tickets: {allTickets.length}</Badge>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Live requests submitted by student residents across your properties, including P0 critical emergency dispatches.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            {/* Search Input */}
            <input
              type="text"
              placeholder="Search tickets, rooms, tenants..."
              value={tableSearch}
              onChange={(e) => setTableSearch(e.target.value)}
              className="text-xs px-3 py-1.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50"
            />

            {/* Filter Tabs */}
            <div className="flex items-center gap-1 text-xs">
              {[
                { key: 'ALL', label: `All (${allTickets.length})` },
                { key: 'EMERGENCY', label: `🚨 P0 (${allTickets.filter((t) => t.ticketNo.startsWith('EMG-')).length})` },
                { key: 'IN_PROGRESS', label: `Active (${allTickets.filter((t) => t.status !== 'COMPLETED').length})` },
                { key: 'COMPLETED', label: `Completed (${allTickets.filter((t) => t.status === 'COMPLETED').length})` },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setTableFilter(tab.key as any)}
                  className={`px-2.5 py-1.5 rounded-lg border text-xs font-bold transition-all whitespace-nowrap ${
                    tableFilter === tab.key
                      ? 'bg-slate-900 text-white border-slate-900 shadow-2xs'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-surface-tertiary border-b border-border">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase">Ticket &amp; Issue</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase">Property &amp; Room</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase">Tenant</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase">Fulfillment Partner</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase">Priority</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-light">
              {filteredTickets.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-xs text-slate-500 font-medium">
                    No tickets match the selected filter or search term.
                  </td>
                </tr>
              ) : (
                filteredTickets.map((t) => {
                  const isEmg = t.ticketNo.startsWith('EMG-');
                  return (
                    <tr
                      key={t.id}
                      className={`transition-colors ${
                        isEmg
                          ? t.status === 'COMPLETED'
                            ? 'bg-emerald-50/20 hover:bg-emerald-50/30'
                            : 'bg-rose-50/30 hover:bg-rose-50/50 border-l-4 border-l-rose-500'
                          : 'hover:bg-surface-secondary/50'
                      }`}
                    >
                      <td className="px-4 py-3 font-bold text-slate-900">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span>{t.issue}</span>
                          {isEmg && (
                            <span className="text-[10px] font-black uppercase tracking-wider text-rose-700 bg-rose-100 px-1.5 py-0.5 rounded border border-rose-300">
                              🚨 15-Min P0
                            </span>
                          )}
                          {t.tenantEvidencePhoto && !isEmg && (
                            <span className="text-[10px] text-cyan-700 bg-cyan-50 px-1.5 py-0.5 rounded font-bold border border-cyan-200">
                              Photo Attached
                            </span>
                          )}
                        </div>
                        <div className="text-xs font-mono text-slate-500 flex items-center gap-1 mt-0.5">
                          <span className="font-bold">{t.ticketNo}</span>
                          <span>• {t.category}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-text-secondary text-xs">
                        <span className="font-semibold text-slate-800">{t.property}</span>
                        <div className="text-slate-500">{t.room}</div>
                      </td>
                      <td className="px-4 py-3 text-text-secondary text-xs font-medium">{t.tenant}</td>
                      <td className="px-4 py-3 text-text-secondary text-xs font-semibold text-brand-700">
                        <div>{t.vendor}</div>
                        {t.costIncurred ? (
                          <span className="text-[11px] text-slate-400 font-normal">Cost: ₹{t.costIncurred}</span>
                        ) : null}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-0.5 rounded text-xs font-bold ${
                            t.priority === 'URGENT'
                              ? 'bg-rose-100 text-rose-700 border border-rose-200'
                              : t.priority === 'HIGH'
                              ? 'bg-red-100 text-red-700'
                              : 'bg-amber-100 text-amber-700'
                          }`}
                        >
                          {t.priority}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <Badge
                          variant={
                            t.status === 'COMPLETED'
                              ? 'success'
                              : t.status === 'AWAITING_OTP'
                              ? 'warning'
                              : t.status === 'EN_ROUTE' || t.status === 'IN_PROGRESS'
                              ? 'info'
                              : 'warning'
                          }
                          size="sm"
                        >
                          {t.status === 'AWAITING_OTP'
                            ? 'AWAITING TENANT OTP'
                            : t.status === 'EN_ROUTE'
                            ? 'TECH EN ROUTE'
                            : t.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleOpenTicket(t)}
                          className={`text-xs font-bold ${
                            isEmg && t.status !== 'COMPLETED'
                              ? 'bg-rose-50 text-rose-700 border-rose-300 hover:bg-rose-100'
                              : 'hover:bg-slate-100'
                          }`}
                        >
                          {isEmg && t.status !== 'COMPLETED' ? 'Action P0 →' : 'Manage →'}
                        </Button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* 1. UPGRADED TICKET DISPATCH & RESOLUTION MODAL */}
      {selectedTicket && (
        <Modal
          isOpen={!!selectedTicket}
          onClose={() => setSelectedTicket(null)}
          title={`Manage Maintenance Ticket • ${selectedTicket.ticketNo}`}
          description={`${selectedTicket.property} • ${selectedTicket.room} (${selectedTicket.tenant})`}
          size="xl"
        >
          <form onSubmit={handleSaveTicket} className="space-y-5">
            {/* Section 1: Tenant Reported Issue & Evidence */}
            <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black text-amber-800 uppercase tracking-widest">
                  Resident Reported Problem
                </span>
                <span className="text-xs font-mono font-bold text-slate-500">
                  Reported: {new Date(selectedTicket.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                </span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="space-y-1 flex-1">
                  <p className="text-base font-black text-slate-900">{selectedTicket.issue}</p>
                  <p className="text-xs text-slate-600">Category: <strong>{selectedTicket.category}</strong></p>
                  <p className="text-xs text-slate-600">
                    Contact: <strong>{selectedTicket.tenant}</strong> ({selectedTicket.tenantPhone})
                  </p>
                </div>

                {/* Evidence Photo Preview */}
                {selectedTicket.tenantEvidencePhoto && (
                  <div className="shrink-0 space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Resident Photo Proof
                    </span>
                    <div className="w-36 h-24 rounded-xl overflow-hidden border border-amber-300 bg-slate-900 shadow-2xs">
                      <img
                        src={selectedTicket.tenantEvidencePhoto}
                        alt="Tenant Evidence"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Section 2: Fulfillment Route Choice (Vendor vs In-House) */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                Fulfillment Route
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div
                  onClick={() => setResolutionType('VENDOR')}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                    resolutionType === 'VENDOR'
                      ? 'border-indigo-600 bg-indigo-50/50 ring-2 ring-indigo-500/20'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Wrench className="w-4 h-4 text-indigo-600" />
                    <p className="text-xs font-extrabold text-slate-900">Assign to Registered Vendor Partner</p>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    QuickFix, Ludhiana Home Services, or CoolTech Appliance network.
                  </p>
                </div>

                <div
                  onClick={() => setResolutionType('IN_HOUSE')}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                    resolutionType === 'IN_HOUSE'
                      ? 'border-emerald-600 bg-emerald-50/50 ring-2 ring-emerald-500/20'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <p className="text-xs font-extrabold text-slate-900">Passi In-House Caretaker Repair</p>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Resolved by on-site property staff/landlord with zero platform vendor fee.
                  </p>
                </div>
              </div>
            </div>

            {/* Section 3: Vendor selection (if Vendor) and Priority */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {resolutionType === 'VENDOR' ? (
                <Select
                  label="Assigned Service Vendor *"
                  value={assignedVendor}
                  onChange={(e) => setAssignedVendor(e.target.value)}
                  options={[
                    { value: 'Ludhiana Home Services', label: 'Ludhiana Home Services (Plumbing & Cleaning)' },
                    { value: 'CoolTech Appliances', label: 'CoolTech Appliances (HVAC & AC)' },
                    { value: 'QuickFix Electricals', label: 'QuickFix Electricals (Wiring & Sub-meters)' },
                  ]}
                />
              ) : (
                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                    Assigned In-House Caretaker
                  </label>
                  <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800">
                    Passi Residency On-Site Maintenance Staff
                  </div>
                </div>
              )}

              <Select
                label="Dispatch Priority"
                value={updatedPriority}
                onChange={(e) => setUpdatedPriority(e.target.value)}
                options={[
                  { value: 'LOW', label: 'LOW (Routine)' },
                  { value: 'MEDIUM', label: 'MEDIUM (Standard 24h SLA)' },
                  { value: 'HIGH', label: 'HIGH (Urgent 4h SLA)' },
                  { value: 'URGENT', label: 'URGENT (Emergency)' },
                ]}
              />
            </div>

            {/* Section 4: Work Order Status & Incurred Cost */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Select
                label="Work Order Status"
                value={updatedStatus}
                onChange={(e) => setUpdatedStatus(e.target.value)}
                options={[
                  { value: 'OPEN', label: 'OPEN (Unassigned)' },
                  { value: 'ASSIGNED', label: 'ASSIGNED (Dispatched)' },
                  { value: 'IN_PROGRESS', label: 'IN_PROGRESS (Technician On-Site)' },
                  { value: 'COMPLETED', label: 'COMPLETED (Resolved)' },
                ]}
              />

              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                  Parts / Repair Cost Incurred (₹)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs text-slate-400 font-bold">₹</span>
                  <input
                    type="number"
                    value={ticketCost}
                    onChange={(e) => setTicketCost(e.target.value)}
                    className="w-full text-xs pl-7 pr-3 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 bg-white"
                    placeholder="0"
                  />
                </div>
              </div>
            </div>

            {/* Section 5: Work Resolution Notes */}
            <Textarea
              label="Work Resolution & Inspection Notes"
              placeholder="Describe what was repaired, replacement parts used, and operational checks performed..."
              value={resolutionNote}
              onChange={(e) => setResolutionNote(e.target.value)}
              rows={2}
            />

            {/* Section 6: Photo Proof of Resolution (for In-Progress or Completed) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1">
                  <Camera className="w-3.5 h-3.5 text-emerald-600" /> Resolution Proof Photo (Before / After)
                </label>
                {!ticketProofPhoto && (
                  <button
                    type="button"
                    onClick={() => setTicketProofPhoto(SAMPLE_FIXED_PHOTO)}
                    className="text-[11px] font-bold text-emerald-700 hover:underline"
                  >
                    Attach Sample Proof Photo
                  </button>
                )}
              </div>

              {ticketProofPhoto ? (
                <div className="relative rounded-xl overflow-hidden border border-slate-200 bg-slate-900 group max-h-32">
                  <img src={ticketProofPhoto} alt="Resolution Proof" className="w-full h-32 object-cover" />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-between p-3 text-white text-xs">
                    <span className="flex items-center gap-1 font-bold">
                      <ShieldCheck className="w-4 h-4 text-emerald-400" /> Resolution Proof Attached
                    </span>
                    <button
                      type="button"
                      onClick={() => setTicketProofPhoto(null)}
                      className="bg-rose-600 hover:bg-rose-700 text-white p-1 rounded-lg text-xs"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <label className="border-2 border-dashed border-slate-200 hover:border-slate-300 rounded-xl p-3 flex flex-col items-center justify-center cursor-pointer bg-slate-50/50 hover:bg-slate-50 transition-colors">
                  <UploadCloud className="w-5 h-5 text-slate-400 mb-0.5" />
                  <span className="text-xs font-bold text-slate-700">Attach repair completion photo</span>
                  <span className="text-[10px] text-slate-400">JPG, PNG or WEBP (Max 5MB)</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const reader = new FileReader();
                      reader.onload = (event) => setTicketProofPhoto(event.target?.result as string);
                      reader.readAsDataURL(file);
                    }}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            {/* Tenant Sign-off toggle */}
            <div className="flex items-center gap-2 p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <input
                type="checkbox"
                id="tenantSigned"
                checked={ticketTenantSigned}
                onChange={(e) => setTicketTenantSigned(e.target.checked)}
                className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
              />
              <label htmlFor="tenantSigned" className="text-xs font-semibold text-slate-700 cursor-pointer">
                Tenant on-site sign-off obtained ({selectedTicket.tenant} inspected work & verified functionality)
              </label>
            </div>

            {/* Footer Buttons */}
            <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
              <Button type="button" variant="outline" onClick={() => setSelectedTicket(null)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting} className="bg-brand-600 hover:bg-brand-700 text-white font-extrabold text-xs">
                {isSubmitting ? 'Updating Dispatch...' : 'Save & Update Work Order'}
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* 2. LANDLORD IN-HOUSE RESOLUTION & OTP MODAL */}
      {selfResolvingEmergency && (
        <Modal
          isOpen={Boolean(selfResolvingEmergency)}
          onClose={() => setSelfResolvingEmergency(null)}
          title={`Resolve Emergency In-House • ${selfResolvingEmergency.dispatchNo}`}
          description="Submit proof of self-resolution and issue a 4-digit Confirmation OTP to the resident to officially close this emergency."
          size="lg"
        >
          <div className="space-y-5">
            {/* Context Box */}
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-1">
              <span className="text-[10px] font-black text-emerald-800 uppercase tracking-widest block">
                In-House Landlord / Caretaker Resolution
              </span>
              <p className="text-sm font-black text-emerald-950">{selfResolvingEmergency.title}</p>
              <p className="text-xs text-emerald-700">
                {selfResolvingEmergency.property} ({selfResolvingEmergency.unit}) • Tenant: <strong>{selfResolvingEmergency.tenantName}</strong>
              </p>
            </div>

            {/* Technical Resolution Notes */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                Technical Work Performed & Root Cause
              </label>
              <textarea
                rows={3}
                value={selfResolveNotes}
                onChange={(e) => setSelfResolveNotes(e.target.value)}
                className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                placeholder="Explain how you or your caretaker resolved the fault (e.g., replaced 32A MCB breaker, reset pump, cleared trap)..."
              />
            </div>

            {/* Photo Proof of In-House Work */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1">
                  <Camera className="w-3.5 h-3.5 text-emerald-600" /> Photo Proof of In-House Resolution
                </label>
                {!selfResolvePhoto && (
                  <button
                    type="button"
                    onClick={() => setSelfResolvePhoto(SAMPLE_BREAKER_FIX_PHOTO)}
                    className="text-[11px] font-bold text-emerald-700 hover:underline"
                  >
                    Use Sample Proof Photo
                  </button>
                )}
              </div>

              {selfResolvePhoto ? (
                <div className="relative rounded-xl overflow-hidden border border-slate-200 bg-slate-900 max-h-36">
                  <img src={selfResolvePhoto} alt="Resolution Proof" className="w-full h-36 object-cover" />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-between p-3 text-white text-xs">
                    <span className="flex items-center gap-1 font-bold">
                      <ShieldCheck className="w-4 h-4 text-emerald-400" /> Proof Attached
                    </span>
                    <button
                      type="button"
                      onClick={() => setSelfResolvePhoto(null)}
                      className="bg-rose-600 hover:bg-rose-700 text-white p-1 rounded-lg text-xs"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <label className="border-2 border-dashed border-slate-200 hover:border-slate-300 rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer bg-slate-50/50 hover:bg-slate-50 transition-colors">
                  <UploadCloud className="w-6 h-6 text-slate-400 mb-1" />
                  <span className="text-xs font-bold text-slate-700">Upload photo of repaired component</span>
                  <span className="text-[10px] text-slate-400">JPG, PNG or WEBP (Max 5MB)</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const reader = new FileReader();
                      reader.onload = (event) => setSelfResolvePhoto(event.target?.result as string);
                      reader.readAsDataURL(file);
                    }}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            {/* Generated Confirmation OTP Display */}
            <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-2xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black text-indigo-800 uppercase tracking-widest flex items-center gap-1">
                  <KeyRound className="w-3.5 h-3.5 text-indigo-600" /> Tenant Verification OTP (4 Digits)
                </span>
                <span className="text-[11px] text-indigo-600 font-bold">Auto-Generated</span>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-2xl font-mono font-black tracking-widest text-indigo-900 bg-white px-3 py-1 rounded-xl border border-indigo-300 shadow-2xs">
                    {selfResolveOtp}
                  </span>
                </div>
                <p className="text-[11px] text-indigo-800 max-w-xs leading-relaxed text-right">
                  Give this code to resident <strong>{selfResolvingEmergency.tenantName}</strong>. They must enter it on their UniNest app to officially confirm the issue is resolved.
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
              <Button
                type="button"
                variant="outline"
                onClick={() => setSelfResolvingEmergency(null)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                disabled={isSubmitting}
                onClick={handleSubmitSelfResolve}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-sm flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>Submit Resolution & Issue OTP to Tenant</span>
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
