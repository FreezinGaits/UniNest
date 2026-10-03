'use client';

import React, { useState, useEffect } from 'react';
import { Card, StatCard } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import {
  ShieldCheck,
  ShieldAlert,
  CheckCircle2,
  XCircle,
  Clock,
  MapPin,
  Search,
  MessageSquare,
  History,
  FileText,
  User,
  Phone,
  Flame,
  Camera,
  FileCheck,
} from 'lucide-react';
import { PropertyItem } from '@/lib/propertiesStore';
import {
  getLocalMessages,
  saveLocalMessage,
  saveLocalMessagesBatch,
  getLocalOverrides,
  saveLocalOverride,
  getLocalAuditEvents,
  saveLocalAuditEvent,
  saveLocalAuditEventsBatch,
} from '@/lib/messagesStorage';

interface AdminVerificationCenterProps {
  initialProperties: PropertyItem[];
}

const REJECTION_REASONS = [
  'Fire safety non-compliant',
  'Incomplete Punjab Police Form-11',
  'Location & physical audit failed',
  'Building code violations',
  'Misleading listing details',
  'Inadequate sanitation facilities',
  'Expired municipal trade license',
];

export function AdminVerificationCenterClient({ initialProperties }: AdminVerificationCenterProps) {
  const [properties, setProperties] = useState<PropertyItem[]>(() => {
    const list = initialProperties || [];
    if (typeof window !== 'undefined') {
      const overrides = getLocalOverrides();
      return list.map((p) => {
        const o = overrides[p.id];
        return o ? { ...p, verificationStatus: o.verificationStatus, rejectionReason: o.rejectionReason } : p;
      });
    }
    return list;
  });

  const [activeTab, setActiveTab] = useState<'ALL' | 'PENDING' | 'VERIFIED' | 'REJECTED'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Rejection Modal State
  const [rejectionModalOpen, setRejectionModalOpen] = useState(false);
  const [rejectionPropertyId, setRejectionPropertyId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState<string>('Fire safety non-compliant');

  // Audit & Communication Modal State
  const [messagesModalOpen, setMessagesModalOpen] = useState(false);
  const [messagePropertyId, setMessagePropertyId] = useState<string | null>(null);
  const [messagesList, setMessagesList] = useState<any[]>([]);
  const [auditEventsList, setAuditEventsList] = useState<any[]>([]);
  const [modalTab, setModalTab] = useState<'AUDIT' | 'MESSAGES'>('AUDIT');
  const [newMessageText, setNewMessageText] = useState('');
  const [messagesLoading, setMessagesLoading] = useState(false);

  useEffect(() => {
    const overrides = getLocalOverrides();
    fetch('/api/properties', { cache: 'no-store' })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.properties && Array.isArray(data.properties) && data.properties.length > 0) {
          const merged = data.properties.map((p: any) => {
            const o = overrides[p.id];
            return o ? { ...p, verificationStatus: o.verificationStatus, rejectionReason: o.rejectionReason } : p;
          });
          setProperties(merged);
        }
      })
      .catch(() => {});

    // Sync any local offline messages with server
    const localMsgs = getLocalMessages();
    if (localMsgs.length > 0) {
      fetch('/api/admin/messages', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ incomingMessages: localMsgs }),
      }).catch(() => {});
    }
  }, []);

  const verifiedCount = properties.filter((p) => p.verificationStatus === 'VERIFIED').length;
  const rejectedCount = properties.filter(
    (p) => p.verificationStatus === 'REJECTED' || p.verificationStatus === 'SUSPENDED'
  ).length;
  const pendingCount = properties.filter(
    (p) =>
      p.verificationStatus === 'UNDER_REVIEW' ||
      p.verificationStatus === 'PENDING' ||
      p.verificationStatus === 'SUBMITTED'
  ).length;

  const handleStatusChange = async (propertyId: string, newStatus: 'VERIFIED' | 'REJECTED', reason?: string) => {
    if (newStatus === 'REJECTED' && !reason && !rejectionModalOpen) {
      setRejectionPropertyId(propertyId);
      setRejectionReason('Fire safety non-compliant');
      setRejectionModalOpen(true);
      return;
    }

    setActionLoadingId(propertyId);
    try {
      saveLocalOverride(propertyId, newStatus, reason);

      const targetProp = properties.find((p) => p.id === propertyId);
      const propName = targetProp?.name || 'Property';

      saveLocalAuditEvent({
        id: `evt-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        propertyId,
        propertyName: propName,
        actorRole: 'ADMIN',
        actorName: 'UniNest Safety Board',
        action: newStatus === 'REJECTED' ? 'REJECTED' : 'VERIFIED',
        title: `Verification Audit ${newStatus === 'REJECTED' ? 'REJECTED / SUSPENDED' : 'APPROVED & CERTIFIED'}`,
        details: reason ? `Flagged Reason: ${reason}` : 'All safety & legal requirements met.',
        timestamp: new Date().toISOString(),
      });

      saveLocalMessage({
        id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        fromRole: 'ADMIN',
        fromName: 'UniNest Compliance Officer',
        toPropertyId: propertyId,
        propertyName: propName,
        message: newStatus === 'REJECTED'
          ? `Official Notice: Listing has been marked as REJECTED. Reason: ${reason || 'Safety compliance documentation required.'}. Please submit proof of rectification to request re-inspection.`
          : `Official Notice: Property listing has been APPROVED and certified by UniNest Safety Board! Verification badge awarded.`,
        timestamp: new Date().toISOString(),
        read: false,
      });

      const res = await fetch('/api/admin/properties/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ propertyId, status: newStatus, rejectionReason: reason }),
      });

      if (res.ok) {
        setProperties((prev) =>
          prev.map((p) => (p.id === propertyId ? { ...p, verificationStatus: newStatus, rejectionReason: reason } : p))
        );
        setToastMessage(
          newStatus === 'VERIFIED'
            ? 'Safety audit passed! Verification badge awarded live.'
            : 'Listing marked as Non-Compliant/Rejected. Notice sent to landlord.'
        );
        if (newStatus === 'REJECTED') {
          setRejectionModalOpen(false);
          setRejectionPropertyId(null);
        }
      } else {
        alert('Server returned failure on verification update.');
      }
    } catch (err) {
      console.error('Failed to update verification status:', err);
      alert('Error updating status.');
    } finally {
      setActionLoadingId(null);
      setTimeout(() => setToastMessage(null), 4000);
    }
  };

  const openDossier = async (propertyId: string) => {
    setMessagePropertyId(propertyId);
    setMessagesModalOpen(true);
    setMessagesLoading(true);

    const localMsgs = getLocalMessages(propertyId);
    const localAudits = getLocalAuditEvents(propertyId);
    setMessagesList(localMsgs);
    setAuditEventsList(localAudits);

    try {
      const res = await fetch(`/api/admin/messages?propertyId=${propertyId}`);
      if (res.ok) {
        const data = await res.json();
        saveLocalMessagesBatch(data.messages || []);
        saveLocalAuditEventsBatch(data.auditEvents || []);

        setMessagesList(getLocalMessages(propertyId));
        setAuditEventsList(getLocalAuditEvents(propertyId));
      }
    } catch (err) {
      console.error('Error fetching dossier:', err);
    } finally {
      setMessagesLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!newMessageText.trim() || !messagePropertyId) return;
    try {
      const targetProp = properties.find((p) => p.id === messagePropertyId);
      const propName = targetProp?.name || 'Property';

      const optimisticMsg = {
        id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        fromRole: 'ADMIN' as const,
        fromName: 'UniNest Compliance Officer',
        toPropertyId: messagePropertyId,
        propertyName: propName,
        message: newMessageText.trim(),
        timestamp: new Date().toISOString(),
        read: false,
      };

      saveLocalMessage(optimisticMsg);
      setMessagesList((prev) => [...prev, optimisticMsg]);
      setNewMessageText('');

      const res = await fetch('/api/admin/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          toPropertyId: messagePropertyId,
          propertyName: propName,
          message: optimisticMsg.message,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.message) {
          saveLocalMessage(data.message);
        }
      }
    } catch (err) {
      console.error('Error sending message:', err);
    }
  };

  const filteredProperties = properties.filter((p) => {
    const isPending =
      p.verificationStatus === 'UNDER_REVIEW' ||
      p.verificationStatus === 'PENDING' ||
      p.verificationStatus === 'SUBMITTED';
    const isVerified = p.verificationStatus === 'VERIFIED';
    const isRejected = p.verificationStatus === 'REJECTED' || p.verificationStatus === 'SUSPENDED';

    if (activeTab === 'PENDING' && !isPending) return false;
    if (activeTab === 'VERIFIED' && !isVerified) return false;
    if (activeTab === 'REJECTED' && !isRejected) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        p.name.toLowerCase().includes(q) ||
        p.address.toLowerCase().includes(q) ||
        (p.ownerName || '').toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="bg-slate-900 text-white px-4 py-3 rounded-xl shadow-lg flex items-center justify-between text-sm animate-slide-down">
          <div className="flex items-center gap-2 font-medium">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            {toastMessage}
          </div>
          <button onClick={() => setToastMessage(null)} className="text-white/70 hover:text-white font-bold text-xs">
            Dismiss
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">
            Safety, Compliance & Physical Inspection Verification Center
          </h1>
          <p className="text-text-secondary mt-1">
            Audit legal documentation, verify Punjab Police Form-11 records, inspect fire safety certifications, and manage platform verification badges.
          </p>
        </div>
      </div>

      {/* Compliance & Audit Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Verified & Certified"
          value={verifiedCount}
          subtitle="Gold & Silver badge holders"
          icon={<ShieldCheck className="w-5 h-5 text-emerald-600" />}
          color="brand"
        />
        <StatCard
          title="Flagged / Rejected"
          value={rejectedCount}
          subtitle="Action required by landlord"
          icon={<ShieldAlert className="w-5 h-5 text-rose-600" />}
          color="red"
        />
        <StatCard
          title="Pending Inspections"
          value={pendingCount}
          subtitle="Awaiting physical survey"
          icon={<Clock className="w-5 h-5 text-amber-600" />}
          color="amber"
        />
        <StatCard
          title="Safety Compliance Index"
          value="96%"
          subtitle="Punjab Police & Fire NOC score"
          icon={<FileCheck className="w-5 h-5 text-brand-600" />}
          color="brand"
        />
      </div>

      {/* Filter Tabs & Search */}
      <Card className="p-4 space-y-3">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
          <div className="flex items-center gap-1.5 flex-wrap">
            {[
              { id: 'ALL', label: `All Listings (${properties.length})` },
              { id: 'PENDING', label: `Pending Review (${pendingCount})` },
              { id: 'VERIFIED', label: `Certified / Verified (${verifiedCount})` },
              { id: 'REJECTED', label: `Flagged / Rejected (${rejectedCount})` },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  activeTab === tab.id
                    ? 'bg-brand-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by PG name, owner, locality..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>
        </div>
      </Card>

      {/* Compliance Verification Table */}
      <Card className="overflow-hidden border border-slate-200 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-extrabold uppercase tracking-wider">
                <th className="py-3.5 px-4">Accommodation Details</th>
                <th className="py-3.5 px-4">Owner & KYC</th>
                <th className="py-3.5 px-4">Safety & Legal Compliance Grid</th>
                <th className="py-3.5 px-4">Audit Status</th>
                <th className="py-3.5 px-4 text-right">Verification Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProperties.map((p) => {
                const isRejected = p.verificationStatus === 'REJECTED' || p.verificationStatus === 'SUSPENDED';
                const isVerified = p.verificationStatus === 'VERIFIED';
                const isPcte1 = p.id === 'prop-pcte-1';

                return (
                  <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                    {/* Accommodation */}
                    <td className="py-4 px-4">
                      <div>
                        <div className="font-extrabold text-slate-900 text-sm flex items-center gap-1.5">
                          {p.name}
                        </div>
                        <p className="text-slate-500 text-[11px] flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3 text-brand-600 shrink-0" />
                          {p.address}
                        </p>
                        <span className="text-[10px] text-brand-700 bg-brand-50 border border-brand-200 px-2 py-0.2 rounded-full font-bold mt-1 inline-block">
                          Opp. PCTE Campus
                        </span>
                      </div>
                    </td>

                    {/* Owner & KYC */}
                    <td className="py-4 px-4">
                      <div className="space-y-0.5">
                        <div className="font-bold text-slate-900 flex items-center gap-1">
                          <User className="w-3.5 h-3.5 text-slate-400" />
                          {p.ownerName || 'Vikram Singh'}
                        </div>
                        <p className="text-slate-500 text-[11px] flex items-center gap-1">
                          <Phone className="w-3 h-3 text-slate-400" />
                          +91 98765-43210
                        </p>
                        <span className="text-[9px] font-black uppercase text-emerald-800 bg-emerald-50 border border-emerald-200 px-1.5 py-0.2 rounded">
                          ✓ Aadhaar & PAN Verified
                        </span>
                      </div>
                    </td>

                    {/* Compliance Checklist Grid */}
                    <td className="py-4 px-4">
                      <div className="grid grid-cols-2 gap-1.5 min-w-[240px]">
                        <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-50/80 px-2 py-0.5 rounded border border-emerald-200">
                          🛡️ Form-11: Verified
                        </span>
                        <span
                          className={`flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded border ${
                            isRejected
                              ? 'text-rose-800 bg-rose-50 border-rose-300'
                              : 'text-emerald-800 bg-emerald-50/80 border-emerald-200'
                          }`}
                        >
                          <Flame className="w-3 h-3" />
                          Fire NOC: {isRejected ? 'Deficient' : 'Certified'}
                        </span>
                        <span className="flex items-center gap-1 text-[11px] font-bold text-indigo-800 bg-indigo-50/80 px-2 py-0.5 rounded border border-indigo-200">
                          📜 Trade License: Valid
                        </span>
                        <span className="flex items-center gap-1 text-[11px] font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                          <Camera className="w-3 h-3" /> CCTV & Biometric
                        </span>
                      </div>
                    </td>

                    {/* Audit Status */}
                    <td className="py-4 px-4">
                      <div className="space-y-1">
                        <Badge
                          variant={isVerified ? 'success' : isRejected ? 'danger' : 'warning'}
                          size="sm"
                          className="font-black uppercase tracking-wider text-[10px]"
                        >
                          {isVerified ? '✓ VERIFIED (GOLD TIER)' : isRejected ? '❌ REJECTED' : '⏳ UNDER REVIEW'}
                        </Badge>
                        {isRejected && (
                          <div className="text-[10px] text-rose-700 font-bold bg-rose-50 border border-rose-200 px-2 py-0.5 rounded leading-tight">
                            Reason: {p.rejectionReason || 'Fire safety non-compliant'}
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Verification Actions */}
                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openDossier(p.id)}
                          className="text-xs font-bold border-slate-300 hover:bg-slate-100"
                        >
                          <History className="w-3.5 h-3.5 mr-1 text-slate-500" />
                          Audit Dossier & Notes
                        </Button>

                        {isRejected ? (
                          <Button
                            size="sm"
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs"
                            onClick={() => handleStatusChange(p.id, 'VERIFIED')}
                            disabled={actionLoadingId === p.id}
                          >
                            Approve Listing
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-rose-600 border-rose-300 hover:bg-rose-50 font-bold text-xs"
                            onClick={() => handleStatusChange(p.id, 'REJECTED')}
                            disabled={actionLoadingId === p.id}
                          >
                            Revoke Badge
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Rejection Modal with pre-defined reason chips */}
      <Modal
        isOpen={rejectionModalOpen}
        onClose={() => setRejectionModalOpen(false)}
        title="Revoke Verification Badge & Mark Non-Compliant"
      >
        <div className="space-y-4 text-sm">
          <p className="text-slate-600 text-xs">
            Select the compliance failure reason. This will be officially recorded in the audit trail and sent to the landlord.
          </p>
          <div className="flex flex-wrap gap-2">
            {REJECTION_REASONS.map((reason) => (
              <button
                key={reason}
                onClick={() => setRejectionReason(reason)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all border ${
                  rejectionReason === reason
                    ? 'bg-rose-100 border-rose-300 text-rose-800 shadow-2xs'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                {reason}
              </button>
            ))}
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Additional Compliance Notes</label>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              className="w-full border border-slate-200 rounded-xl p-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500"
              rows={3}
              placeholder="Specify requirements for re-audit..."
            />
          </div>
          <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
            <Button variant="outline" onClick={() => setRejectionModalOpen(false)}>
              Cancel
            </Button>
            <Button
              className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs"
              onClick={() => {
                if (rejectionPropertyId) {
                  handleStatusChange(rejectionPropertyId, 'REJECTED', rejectionReason);
                }
              }}
              disabled={!rejectionReason.trim()}
            >
              Confirm Rejection & Revoke Badge
            </Button>
          </div>
        </div>
      </Modal>

      {/* Audit Dossier & Communication Modal */}
      <Modal
        isOpen={messagesModalOpen}
        onClose={() => setMessagesModalOpen(false)}
        title="Safety Dossier, Compliance Trail & Correspondence"
        size="lg"
      >
        <div className="space-y-4 text-sm flex flex-col h-[70vh]">
          {/* Property Selector */}
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 flex-1 w-full sm:w-auto">
              <span className="font-bold text-slate-700 shrink-0">Inspecting Accommodation:</span>
              <select
                value={messagePropertyId || ''}
                onChange={(e) => openDossier(e.target.value)}
                className="bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500 w-full sm:w-auto"
              >
                {properties.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.verificationStatus})
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-700">Status:</span>
              <Badge
                variant={
                  properties.find((p) => p.id === messagePropertyId)?.verificationStatus === 'VERIFIED'
                    ? 'success'
                    : 'danger'
                }
                size="sm"
                className="font-bold uppercase tracking-wider text-[10px]"
              >
                {properties.find((p) => p.id === messagePropertyId)?.verificationStatus || 'UNDER REVIEW'}
              </Badge>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex border-b border-slate-200 gap-4 text-xs font-bold">
            <button
              onClick={() => setModalTab('AUDIT')}
              className={`pb-2 flex items-center gap-1.5 transition-colors border-b-2 -mb-[1px] ${
                modalTab === 'AUDIT'
                  ? 'border-brand-600 text-brand-700'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              <History className="w-3.5 h-3.5" />
              Audit Trail & Lifecycle History ({auditEventsList.length})
            </button>
            <button
              onClick={() => setModalTab('MESSAGES')}
              className={`pb-2 flex items-center gap-1.5 transition-colors border-b-2 -mb-[1px] ${
                modalTab === 'MESSAGES'
                  ? 'border-brand-600 text-brand-700'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              Official Correspondence ({messagesList.length})
            </button>
          </div>

          {/* Tab 1: Audit Trail */}
          {modalTab === 'AUDIT' && (
            <div className="flex-1 overflow-y-auto space-y-3 bg-slate-50/70 p-4 rounded-xl border border-slate-200">
              {auditEventsList.length > 0 ? (
                auditEventsList.map((evt, idx) => (
                  <div key={idx} className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                            evt.action === 'REJECTED'
                              ? 'bg-rose-100 text-rose-800'
                              : evt.action === 'VERIFIED'
                              ? 'bg-emerald-100 text-emerald-800'
                              : evt.action === 'SUBMITTED'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-slate-100 text-slate-800'
                          }`}
                        >
                          {evt.action}
                        </span>
                        <span className="font-extrabold text-slate-900 text-xs">{evt.title}</span>
                      </div>
                      <span className="text-[10px] text-slate-400">
                        {new Date(evt.timestamp).toLocaleString()}
                      </span>
                    </div>
                    {evt.details && (
                      <p className="text-xs text-slate-600 pl-1 border-l-2 border-slate-200 mt-1">
                        {evt.details}
                      </p>
                    )}
                    <div className="text-[10px] text-slate-400 pt-0.5">
                      Logged by: <strong className="text-slate-600">{evt.actorName} ({evt.actorRole})</strong>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 text-xs text-slate-400">
                  <History className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  No audit logs recorded for this accommodation.
                </div>
              )}
            </div>
          )}

          {/* Tab 2: Messages */}
          {modalTab === 'MESSAGES' && (
            <>
              <div className="flex-1 overflow-y-auto space-y-3 bg-slate-50/70 p-4 rounded-xl border border-slate-200">
                {messagesLoading ? (
                  <p className="text-slate-500 text-center py-8">Loading correspondence history...</p>
                ) : messagesList.length > 0 ? (
                  messagesList.map((msg, idx) => {
                    const isLandlord = msg.fromRole === 'LANDLORD';
                    return (
                      <div
                        key={idx}
                        className={`p-3.5 rounded-xl shadow-sm border ${
                          isLandlord
                            ? 'bg-emerald-50/90 border-emerald-200 ml-4'
                            : 'bg-white border-indigo-100 mr-4'
                        }`}
                      >
                        <div className="flex justify-between items-center mb-1.5 gap-2">
                          <div className="flex items-center gap-1.5">
                            <span
                              className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                                isLandlord
                                  ? 'bg-emerald-200 text-emerald-900'
                                  : 'bg-indigo-100 text-indigo-900'
                              }`}
                            >
                              {msg.fromRole}
                            </span>
                            <span className="font-bold text-slate-900 text-xs">{msg.fromName}</span>
                          </div>
                          <span className="text-[10px] text-slate-400 font-medium">
                            {new Date(msg.timestamp).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-slate-700 text-xs whitespace-pre-wrap leading-relaxed">
                          {msg.message}
                        </p>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-slate-500 text-center py-8 text-xs">
                    No official notes logged for this accommodation yet.
                  </p>
                )}
              </div>
              <div className="mt-2 space-y-2">
                <textarea
                  value={newMessageText}
                  onChange={(e) => setNewMessageText(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl p-3 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none shadow-sm"
                  rows={2}
                  placeholder="Type official notification, compliance request, or note to landlord..."
                />
                <div className="flex justify-between items-center">
                  <span className="text-[11px] text-slate-400">
                    Saved permanently in browser storage & synced to landlord portal.
                  </span>
                  <Button
                    onClick={sendMessage}
                    disabled={!newMessageText.trim()}
                    className="bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs"
                  >
                    Send Official Note
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </Modal>
    </div>
  );
}
