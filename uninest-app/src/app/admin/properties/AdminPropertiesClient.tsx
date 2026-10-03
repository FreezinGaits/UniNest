'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Building2, ShieldCheck, CheckCircle2, XCircle, Clock, MapPin, Search, MessageSquare, History, FileText, ArrowRight } from 'lucide-react';
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

interface AdminPropertiesClientProps {
  initialProperties: PropertyItem[];
}

const REJECTION_REASONS = [
  'Safety compliance not met',
  'Incomplete documentation',
  'Location verification failed',
  'Building code violations',
  'Misleading listing details',
  'Fire safety non-compliant',
  'Inadequate sanitation facilities'
];

export function AdminPropertiesClient({ initialProperties }: AdminPropertiesClientProps) {
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
  const [activeTab, setActiveTab] = useState<'ALL' | 'UNDER_REVIEW' | 'VERIFIED' | 'REJECTED'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Rejection Modal State
  const [rejectionModalOpen, setRejectionModalOpen] = useState(false);
  const [rejectionPropertyId, setRejectionPropertyId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState<string>('');
  
  // Messages & Audit Modal State
  const [messagesModalOpen, setMessagesModalOpen] = useState(false);
  const [messagePropertyId, setMessagePropertyId] = useState<string | null>(null);
  const [messagesList, setMessagesList] = useState<any[]>([]);
  const [auditEventsList, setAuditEventsList] = useState<any[]>([]);
  const [modalTab, setModalTab] = useState<'MESSAGES' | 'AUDIT'>('MESSAGES');
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

  const underReviewCount = properties.filter(
    (p) =>
      p.verificationStatus === 'UNDER_REVIEW' ||
      p.verificationStatus === 'PENDING' ||
      p.verificationStatus === 'SUBMITTED'
  ).length;

  const handleStatusChange = async (propertyId: string, newStatus: 'VERIFIED' | 'REJECTED', reason?: string) => {
    if (newStatus === 'REJECTED' && !reason && !rejectionModalOpen) {
      setRejectionPropertyId(propertyId);
      setRejectionReason('');
      setRejectionModalOpen(true);
      return;
    }

    setActionLoadingId(propertyId);
    try {
      // 1. Immediately persist locally
      saveLocalOverride(propertyId, newStatus, reason);

      const targetProp = properties.find((p) => p.id === propertyId);
      const propName = targetProp?.name || 'Property';

      // 2. Add local audit event
      const auditEvt = {
        id: `evt-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        propertyId,
        propertyName: propName,
        actorRole: 'ADMIN' as const,
        actorName: 'UniNest Admin',
        action: newStatus === 'REJECTED' ? ('REJECTED' as const) : ('VERIFIED' as const),
        title: `Listing ${newStatus === 'REJECTED' ? 'Rejected' : 'Approved & Verified'} by Admin`,
        details: reason ? `Reason: ${reason}` : undefined,
        timestamp: new Date().toISOString(),
      };
      saveLocalAuditEvent(auditEvt);

      // 3. Add official notification message to thread
      const notifMsg = {
        id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        fromRole: 'ADMIN' as const,
        fromName: 'UniNest Compliance Officer',
        toPropertyId: propertyId,
        propertyName: propName,
        message: newStatus === 'REJECTED'
          ? `Official Notice: Listing has been rejected/suspended by Admin. Reason: ${reason || 'Safety compliance documentation or verification required.'}. Please update your property details or submit required compliance documents and reply here to request re-audit.`
          : `Official Notice: Property listing has been APPROVED and verified by UniNest Admin! It is now published live for student bed reservations.`,
        timestamp: new Date().toISOString(),
        read: false,
      };
      saveLocalMessage(notifMsg);

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
            ? 'Property verified successfully! It is now published live for student booking.'
            : 'Property listing has been marked as Rejected.'
        );
        if (newStatus === 'REJECTED') {
          setRejectionModalOpen(false);
          setRejectionPropertyId(null);
        }
      } else {
        alert('Failed to update status on server.');
      }
    } catch (err) {
      console.error('Failed to update verification status:', err);
      alert('Error updating status.');
    } finally {
      setActionLoadingId(null);
      setTimeout(() => setToastMessage(null), 4000);
    }
  };

  const openMessages = async (propertyId: string) => {
    setMessagePropertyId(propertyId);
    setMessagesModalOpen(true);
    setMessagesLoading(true);

    // Instant render from localStorage
    const localMsgs = getLocalMessages(propertyId);
    const localAudits = getLocalAuditEvents(propertyId);
    setMessagesList(localMsgs);
    setAuditEventsList(localAudits);

    try {
      const res = await fetch(`/api/admin/messages?propertyId=${propertyId}`);
      if (res.ok) {
        const data = await res.json();
        const apiMsgs = data.messages || [];
        const apiAudits = data.auditEvents || [];

        // Merge & save
        saveLocalMessagesBatch(apiMsgs);
        saveLocalAuditEventsBatch(apiAudits);

        const updatedMsgs = getLocalMessages(propertyId);
        const updatedAudits = getLocalAuditEvents(propertyId);
        setMessagesList(updatedMsgs);
        setAuditEventsList(updatedAudits);
      }
    } catch (err) {
      console.error('Error fetching messages:', err);
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
        fromName: 'UniNest Admin (ADMIN)',
        toPropertyId: messagePropertyId,
        propertyName: propName,
        message: newMessageText.trim(),
        timestamp: new Date().toISOString(),
        read: false,
      };

      // 1. Immediately persist locally
      saveLocalMessage(optimisticMsg);
      setMessagesList((prev) => [...prev, optimisticMsg]);
      setNewMessageText('');

      // 2. Post to API
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
    const isUnderReview =
      p.verificationStatus === 'UNDER_REVIEW' ||
      p.verificationStatus === 'PENDING' ||
      p.verificationStatus === 'SUBMITTED';
    const isVerified = p.verificationStatus === 'VERIFIED';
    const isRejected = p.verificationStatus === 'REJECTED' || p.verificationStatus === 'SUSPENDED';

    if (activeTab === 'UNDER_REVIEW' && !isUnderReview) return false;
    if (activeTab === 'VERIFIED' && !isVerified) return false;
    if (activeTab === 'REJECTED' && !isRejected) return false;

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        (p.name || '').toLowerCase().includes(q) ||
        (p.address || '').toLowerCase().includes(q) ||
        (p.city || '').toLowerCase().includes(q) ||
        (p.ownerName && p.ownerName.toLowerCase().includes(q))
      );
    }

    return true;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {toastMessage && (
        <div className="bg-emerald-600 text-white px-4 py-3 rounded-xl shadow-lg flex items-center justify-between animate-slide-down">
          <div className="flex items-center gap-2 font-medium text-sm">
            <CheckCircle2 className="w-5 h-5" />
            {toastMessage}
          </div>
          <button onClick={() => setToastMessage(null)} className="text-white/80 hover:text-white font-bold text-xs">
            Dismiss
          </button>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Admin Property Management & Verification</h1>
          <p className="text-slate-500 text-sm mt-1">
            Review landlord property submissions, verify safety & compliance, and publish listings live.
          </p>
        </div>

        {underReviewCount > 0 && (
          <div className="bg-amber-50 border border-amber-200 text-amber-900 px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 shrink-0">
            <Clock className="w-4 h-4 text-amber-600 animate-pulse" />
            <span>{underReviewCount} property submission(s) pending review</span>
          </div>
        )}
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div className="flex flex-wrap items-center gap-2 bg-slate-100 p-1 rounded-xl w-full sm:w-auto">
          <button
            onClick={() => setActiveTab('ALL')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'ALL' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Listings ({properties.length})
          </button>

          <button
            onClick={() => setActiveTab('UNDER_REVIEW')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'UNDER_REVIEW'
                ? 'bg-amber-500 text-white shadow-sm'
                : 'text-amber-700 hover:bg-amber-100'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            Pending ({underReviewCount})
          </button>

          <button
            onClick={() => setActiveTab('VERIFIED')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'VERIFIED' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Verified ({properties.filter((p) => p.verificationStatus === 'VERIFIED').length})
          </button>
          
          <button
            onClick={() => setActiveTab('REJECTED')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'REJECTED' ? 'bg-white text-red-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Rejected ({properties.filter((p) => p.verificationStatus === 'REJECTED' || p.verificationStatus === 'SUSPENDED').length})
          </button>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by PG name or owner..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>
      </div>

      <Card padding="none">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Property Details</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Owner / Landlord</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Location & Rent</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Capacity</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Status</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase">Admin Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProperties.length > 0 ? (
                filteredProperties.map((p) => {
                  const isUnderReview =
                    p.verificationStatus === 'UNDER_REVIEW' ||
                    p.verificationStatus === 'PENDING' ||
                    p.verificationStatus === 'SUBMITTED';
                  const isVerified = p.verificationStatus === 'VERIFIED';
                  const isRejected = p.verificationStatus === 'REJECTED' || p.verificationStatus === 'SUSPENDED';
                  const rentVal = Number(p.rentPerMonth || 6000);
                  const displayRent = rentVal >= 100000 ? Math.round(rentVal / 100) : rentVal;

                  return (
                    <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-4 py-4">
                        <div className="font-bold text-slate-900 flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-brand-600 shrink-0" />
                          {p.name}
                        </div>
                        {p.description && <p className="text-xs text-slate-500 mt-1 line-clamp-1">{p.description}</p>}
                      </td>

                      <td className="px-4 py-4 text-slate-600">
                        <span className="font-semibold text-slate-900">{p.ownerName || 'Landlord Partner'}</span>
                      </td>

                      <td className="px-4 py-4 text-xs text-slate-600">
                        <p className="flex items-center gap-1 font-medium text-slate-900">
                          <MapPin className="w-3.5 h-3.5 text-brand-600" /> {p.locality || 'Ferozepur Road'}, {p.city || 'Ludhiana'}
                        </p>
                        <p className="text-emerald-700 font-bold mt-0.5">₹{displayRent.toLocaleString('en-IN')}/mo</p>
                      </td>

                      <td className="px-4 py-4 text-xs">
                        <span className="font-bold text-slate-900">{p.totalBeds || (p.totalRooms || 6) * 2} beds</span>
                        <span className="text-slate-500 block text-[11px]">{p.totalRooms || 6} rooms</span>
                      </td>

                      <td className="px-4 py-4">
                        {isVerified && (
                          <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 text-xs font-bold px-2.5 py-1 rounded-full">
                            <ShieldCheck className="w-3.5 h-3.5" /> VERIFIED
                          </span>
                        )}
                        {isUnderReview && (
                          <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-800 text-xs font-bold px-2.5 py-1 rounded-full animate-pulse">
                            <Clock className="w-3.5 h-3.5" /> UNDER REVIEW
                          </span>
                        )}
                        {isRejected && (
                          <div className="flex flex-col items-start">
                            <span className="inline-flex items-center gap-1 bg-red-100 text-red-800 text-xs font-bold px-2.5 py-1 rounded-full">
                              <XCircle className="w-3.5 h-3.5" /> REJECTED
                            </span>
                            {p.rejectionReason && (
                              <span className="text-[10px] text-red-600 mt-1 max-w-[120px] leading-tight">
                                {p.rejectionReason}
                              </span>
                            )}
                          </div>
                        )}
                      </td>

                      <td className="px-4 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openMessages(p.id)}
                            className="text-slate-600 hover:bg-slate-100 text-xs font-bold"
                            title="Send Note"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                          </Button>
                          
                          {isUnderReview ? (
                            <>
                              <Button
                                size="sm"
                                disabled={actionLoadingId === p.id}
                                onClick={() => handleStatusChange(p.id, 'VERIFIED')}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                disabled={actionLoadingId === p.id}
                                onClick={() => handleStatusChange(p.id, 'REJECTED')}
                                className="text-red-600 border-red-200 hover:bg-red-50 text-xs font-bold"
                              >
                                Reject
                              </Button>
                            </>
                          ) : isVerified ? (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleStatusChange(p.id, 'REJECTED')}
                              className="text-slate-500 hover:text-red-600 text-xs"
                            >
                              Revoke Badge
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              onClick={() => handleStatusChange(p.id, 'VERIFIED')}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold"
                            >
                              Approve
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-slate-500">
                    <Building2 className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="font-semibold text-sm">No properties found</p>
                    <p className="text-xs text-slate-400">Try changing your tab or search term.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal
        isOpen={rejectionModalOpen}
        onClose={() => setRejectionModalOpen(false)}
        title="Reject Property Listing"
      >
        <div className="space-y-4 text-sm">
          <p className="text-slate-600">
            Please provide a reason for rejecting this property. This will be visible to the landlord.
          </p>
          <div className="flex flex-wrap gap-2">
            {REJECTION_REASONS.map((reason) => (
              <button
                key={reason}
                onClick={() => setRejectionReason(reason)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors border ${
                  rejectionReason === reason
                    ? 'bg-red-100 border-red-200 text-red-800'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                {reason}
              </button>
            ))}
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Additional Notes</label>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              className="w-full border border-slate-200 rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              rows={3}
              placeholder="Provide more details..."
            />
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setRejectionModalOpen(false)}>
              Cancel
            </Button>
            <Button
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={() => {
                if (rejectionPropertyId) {
                  handleStatusChange(rejectionPropertyId, 'REJECTED', rejectionReason);
                }
              }}
              disabled={!rejectionReason.trim()}
            >
              Confirm Rejection
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={messagesModalOpen}
        onClose={() => setMessagesModalOpen(false)}
        title="Admin Communication & Property History"
        size="lg"
      >
        <div className="space-y-4 text-sm flex flex-col h-[70vh]">
          {/* Property Selector & Header Info */}
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 flex-1 w-full sm:w-auto">
              <span className="font-bold text-slate-700 shrink-0">Viewing Property:</span>
              <select
                value={messagePropertyId || ''}
                onChange={(e) => openMessages(e.target.value)}
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
              <span className="text-[11px] text-slate-500">Owner:</span>
              <span className="font-bold text-slate-900">
                {properties.find((p) => p.id === messagePropertyId)?.ownerName || 'Landlord'}
              </span>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex border-b border-slate-200 gap-4 text-xs font-bold">
            <button
              onClick={() => setModalTab('MESSAGES')}
              className={`pb-2 flex items-center gap-1.5 transition-colors border-b-2 -mb-[1px] ${
                modalTab === 'MESSAGES'
                  ? 'border-brand-600 text-brand-700'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              Communication Log ({messagesList.length})
            </button>
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
          </div>

          {/* Tab 1: Messages */}
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
                    No official communication logged for this PG yet. Type a note or request below.
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

          {/* Tab 2: Audit Trail & Lifecycle History */}
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
                  No audit logs recorded for this property yet.
                </div>
              )}
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}
