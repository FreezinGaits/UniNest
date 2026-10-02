'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Select, Textarea } from '@/components/ui/Input';
import { Wrench, CheckCircle2, Clock, AlertCircle, AlertTriangle, Phone } from 'lucide-react';

export interface TicketItem {
  id: string;
  ticketNo: string;
  property: string;
  room: string;
  tenant: string;
  issue: string;
  category: string;
  priority: string;
  status: string;
  vendor: string;
  createdAt: string;
  resolutionNote?: string;
}

interface LandlordMaintenanceClientProps {
  initialTickets: TicketItem[];
}

export function LandlordMaintenanceClient({ initialTickets }: LandlordMaintenanceClientProps) {
  const [tickets, setTickets] = useState<TicketItem[]>(initialTickets);
  const [selectedTicket, setSelectedTicket] = useState<TicketItem | null>(null);
  const [emergencies, setEmergencies] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  useEffect(() => {
    fetch('/api/demo/emergency?role=LANDLORD')
      .then((res) => res.json())
      .then((data) => {
        if (data.emergencies && Array.isArray(data.emergencies)) {
          setEmergencies(data.emergencies);
        }
      })
      .catch(() => {});
  }, []);

  const [assignedVendor, setAssignedVendor] = useState('Ludhiana Home Services');
  const [updatedPriority, setUpdatedPriority] = useState('MEDIUM');
  const [updatedStatus, setUpdatedStatus] = useState('ASSIGNED');
  const [resolutionNote, setResolutionNote] = useState('');

  const handleOpenTicket = (ticket: TicketItem) => {
    setSelectedTicket(ticket);
    setAssignedVendor(ticket.vendor || 'Ludhiana Home Services');
    setUpdatedPriority(ticket.priority);
    setUpdatedStatus(ticket.status);
    setResolutionNote(ticket.resolutionNote || '');
  };

  const handleSaveTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket) return;

    setIsSubmitting(true);

    try {
      const res = await fetch('/api/demo/maintenance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ticketId: selectedTicket.id,
          vendor: assignedVendor,
          priority: updatedPriority,
          status: updatedStatus,
          resolutionNote,
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to save ticket');
      }

      setTickets(
        tickets.map((t) =>
          t.id === selectedTicket.id
            ? {
                ...t,
                vendor: assignedVendor,
                priority: updatedPriority,
                status: updatedStatus,
                resolutionNote: resolutionNote,
              }
            : t
        )
      );
      setIsSubmitting(false);
      setSelectedTicket(null);
      setShowSuccessToast(true);

      setTimeout(() => setShowSuccessToast(false), 4000);
    } catch (err) {
      alert('Failed to save ticket. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Toast Notification */}
      {showSuccessToast && (
        <div className="bg-emerald-500 text-white px-4 py-3 rounded-xl shadow-lg flex items-center justify-between animate-slide-down">
          <div className="flex items-center gap-2 font-medium text-sm">
            <CheckCircle2 className="w-5 h-5 text-white" />
            Maintenance ticket dispatch updated! Vendor notified and tenant informed.
          </div>
          <button onClick={() => setShowSuccessToast(false)} className="text-white/80 hover:text-white font-bold text-sm">
            Dismiss
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Maintenance Dispatch & Tickets</h1>
          <p className="text-text-secondary mt-1">Tenant issue requests, SLA escalation tracking, and vendor assignment</p>
        </div>
        <div className="p-2.5 bg-amber-50 rounded-xl">
          <Wrench className="w-6 h-6 text-amber-600" />
        </div>
      </div>

      {/* Active Emergency Alert Banner */}
      {emergencies.filter((e) => e.status !== 'RESOLVED').length > 0 && (
        <div className="bg-rose-50 border-2 border-rose-500 rounded-2xl p-5 shadow-md space-y-3 animate-pulse">
          <div className="flex items-start justify-between flex-wrap gap-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-rose-800 bg-rose-100 px-2 py-0.5 rounded">
                    {emergencies.filter((e) => e.status !== 'RESOLVED')[0].dispatchNo}
                  </span>
                  <span className="text-[11px] font-bold text-rose-800 bg-rose-200/80 px-2 py-0.5 rounded-full uppercase tracking-wider">
                    Critical Property Hazard (15-Min SLA)
                  </span>
                </div>
                <h3 className="text-base font-extrabold text-slate-900 mt-0.5">
                  {emergencies.filter((e) => e.status !== 'RESOLVED')[0].title} — {emergencies.filter((e) => e.status !== 'RESOLVED')[0].property} ({emergencies.filter((e) => e.status !== 'RESOLVED')[0].unit})
                </h3>
              </div>
            </div>

            <Badge variant="danger" size="sm">
              {emergencies.filter((e) => e.status !== 'RESOLVED')[0].status === 'EN_ROUTE' ? 'DUTY TECH EN ROUTE' : emergencies.filter((e) => e.status !== 'RESOLVED')[0].status}
            </Badge>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-white/80 p-3.5 rounded-xl border border-rose-200 text-xs">
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Tenant Reporting</span>
              <p className="font-extrabold text-slate-900">{emergencies.filter((e) => e.status !== 'RESOLVED')[0].tenantName}</p>
              <a href={`tel:${emergencies.filter((e) => e.status !== 'RESOLVED')[0].tenantPhone}`} className="text-blue-700 font-bold hover:underline flex items-center gap-1 mt-1">
                <Phone className="w-3 h-3" /> Call Tenant ({emergencies.filter((e) => e.status !== 'RESOLVED')[0].tenantPhone})
              </a>
            </div>

            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Assigned QuickFix Vendor</span>
              <p className="font-extrabold text-slate-900">{emergencies.filter((e) => e.status !== 'RESOLVED')[0].assignedTech}</p>
              <a href={`tel:${emergencies.filter((e) => e.status !== 'RESOLVED')[0].techPhone}`} className="text-emerald-700 font-bold hover:underline flex items-center gap-1 mt-1">
                <Phone className="w-3 h-3" /> Call Tech ({emergencies.filter((e) => e.status !== 'RESOLVED')[0].techPhone})
              </a>
            </div>

            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Caretaker Action</span>
              <p className="text-slate-700 font-medium">On-site caretaker notified via SMS to grant electrical/pipe valve access.</p>
              <p className="text-[11px] text-amber-700 font-bold mt-1">ETA: ~{emergencies.filter((e) => e.status !== 'RESOLVED')[0].etaMins} mins</p>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <Card padding="none">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-surface-tertiary border-b border-border">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase">Ticket ID & Issue</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase">Property & Room</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase">Tenant</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase">Assigned Vendor</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase">Priority</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-light">
              {tickets.map((t) => (
                <tr key={t.id} className="hover:bg-surface-secondary/50">
                  <td className="px-4 py-3 font-bold text-slate-900">
                    <div>{t.issue}</div>
                    <div className="text-xs font-mono text-slate-400">{t.ticketNo}</div>
                  </td>
                  <td className="px-4 py-3 text-text-secondary text-xs">
                    <span className="font-semibold text-slate-800">{t.property}</span>
                    <div className="text-slate-500">{t.room}</div>
                  </td>
                  <td className="px-4 py-3 text-text-secondary text-xs font-medium">{t.tenant}</td>
                  <td className="px-4 py-3 text-text-secondary text-xs font-semibold text-brand-700">{t.vendor}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-0.5 rounded text-xs font-bold ${
                        t.priority === 'HIGH' || t.priority === 'URGENT'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-amber-100 text-amber-700'
                      }`}
                    >
                      {t.priority}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={t.status === 'COMPLETED' ? 'success' : t.status === 'IN_PROGRESS' ? 'info' : 'warning'} size="sm">
                      {t.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Button size="sm" variant="outline" onClick={() => handleOpenTicket(t)} className="text-xs font-bold">
                      Manage →
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Ticket Dispatch Modal */}
      {selectedTicket && (
        <Modal
          isOpen={!!selectedTicket}
          onClose={() => setSelectedTicket(null)}
          title={`Maintenance Ticket ${selectedTicket.ticketNo}`}
          description={`${selectedTicket.property} • ${selectedTicket.room} (${selectedTicket.tenant})`}
          size="lg"
        >
          <form onSubmit={handleSaveTicket} className="space-y-4">
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <p className="text-xs font-bold text-amber-800 uppercase">Reported Issue</p>
              <p className="text-base font-bold text-amber-950 mt-0.5">{selectedTicket.issue}</p>
              <p className="text-xs text-amber-700 mt-1">Category: {selectedTicket.category}</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Select
                label="Assigned Service Vendor *"
                value={assignedVendor}
                onChange={(e) => setAssignedVendor(e.target.value)}
                options={[
                  { value: 'Ludhiana Home Services', label: 'Ludhiana Home Services (Plumbing & Cleaning)' },
                  { value: 'CoolTech Appliances', label: 'CoolTech Appliances (HVAC & AC)' },
                  { value: 'QuickFix Electricals', label: 'QuickFix Electricals (Wiring & Sub-meters)' },
                  { value: 'Passi In-House Maintenance', label: 'Passi In-House Maintenance Team' },
                ]}
              />

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

            <Select
              label="Work Order Status"
              value={updatedStatus}
              onChange={(e) => setUpdatedStatus(e.target.value)}
              options={[
                { value: 'OPEN', label: 'OPEN (Unassigned)' },
                { value: 'ASSIGNED', label: 'ASSIGNED (Vendor Dispatched)' },
                { value: 'IN_PROGRESS', label: 'IN_PROGRESS (Technician On-Site)' },
                { value: 'COMPLETED', label: 'COMPLETED (Resolved)' },
              ]}
            />

            <Textarea
              label="Resolution & Dispatch Notes"
              placeholder="Enter technician details, estimated completion time, or work order resolution details..."
              value={resolutionNote}
              onChange={(e) => setResolutionNote(e.target.value)}
              rows={3}
            />

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
              <Button type="button" variant="outline" onClick={() => setSelectedTicket(null)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting} className="bg-brand-600 hover:bg-brand-700 text-white font-bold">
                {isSubmitting ? 'Updating Dispatch...' : 'Save & Notify Vendor'}
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
