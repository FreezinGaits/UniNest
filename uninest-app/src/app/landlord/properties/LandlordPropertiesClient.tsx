'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input, Select, Textarea } from '@/components/ui/Input';
import { Building2, MapPin, Plus, CheckCircle2, Camera, Image as ImageIcon, X, MessageSquare, AlertTriangle, XCircle, Send, Clock, ShieldCheck, History } from 'lucide-react';
import Link from 'next/link';
import {
  getLocalMessages,
  saveLocalMessage,
  saveLocalMessagesBatch,
  getLocalOverrides,
  saveLocalOverride,
  getLocalAuditEvents,
  saveLocalAuditEventsBatch,
} from '@/lib/messagesStorage';

export interface PropertyItem {
  id: string;
  name: string;
  locality: string;
  city: string;
  address: string;
  verificationStatus: string;
  totalRooms: number;
  totalBeds: number;
  occupiedBeds: number;
  rentPerMonth: number;
  openTickets: number;
  images?: string[];
  rejectionReason?: string;
}

interface LandlordPropertiesClientProps {
  initialProperties: PropertyItem[];
}

function sanitizeProperty(raw: any): PropertyItem {
  const totalRooms = Number(raw?.totalRooms ?? raw?.rooms?.length ?? 6) || 6;
  const totalBeds =
    Number(
      raw?.totalBeds ??
        totalRooms * Number(raw?.bedsPerRoom || 2)
    ) || 12;
  const occupiedBeds =
    raw?.occupiedBeds !== undefined && raw?.occupiedBeds !== null
      ? Number(raw.occupiedBeds)
      : Math.min(totalBeds, Math.floor(totalBeds * 0.75));

  let rawRent = Number(
    raw?.rentPerMonth ??
      (raw?.rooms?.[0]?.rent ? Number(raw.rooms[0].rent) : 6000)
  ) || 6000;
  const rentPerMonth = rawRent >= 100000 ? Math.round(rawRent / 100) : rawRent;

  const openTickets = Number(
    raw?.openTickets ??
      (Array.isArray(raw?.maintenanceTickets) ? raw.maintenanceTickets.length : 0)
  ) || 0;

  const rawStatus = String(raw?.verificationStatus || raw?.status || 'VERIFIED').toUpperCase();

  const defaultImages = [
    'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=1000&q=80',
    'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=1000&q=80',
  ];

  return {
    id: String(raw?.id || `prop-${Date.now()}`),
    name: String(raw?.name || 'UniNest Student Residency'),
    locality: String(raw?.locality || 'Ferozepur Road'),
    city: String(raw?.city || 'Ludhiana'),
    address: String(raw?.address || 'Ferozepur Road, Ludhiana'),
    verificationStatus: rawStatus === 'APPROVED' ? 'VERIFIED' : rawStatus,
    totalRooms,
    totalBeds,
    occupiedBeds,
    rentPerMonth,
    openTickets,
    images: Array.isArray(raw?.images) && raw.images.length > 0 ? raw.images : defaultImages,
    rejectionReason:
      raw?.rejectionReason ||
      (rawStatus === 'REJECTED' || rawStatus === 'SUSPENDED'
        ? raw?.verificationNotes || 'Listing requires compliance review or documentation update'
        : undefined),
  };
}

export function LandlordPropertiesClient({ initialProperties }: LandlordPropertiesClientProps) {
  const searchParams = useSearchParams();
  const [properties, setProperties] = useState<PropertyItem[]>(() => {
    const list = (Array.isArray(initialProperties) ? initialProperties : []).map(sanitizeProperty);
    if (typeof window !== 'undefined') {
      const overrides = getLocalOverrides();
      return list.map((p) => {
        const o = overrides[p.id];
        return o ? { ...p, verificationStatus: o.verificationStatus, rejectionReason: o.rejectionReason } : p;
      });
    }
    return list;
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [uploadedFileNames, setUploadedFileNames] = useState<string[]>([]);

  // Admin Communication & Notes State
  const [adminMessages, setAdminMessages] = useState<any[]>(() => {
    if (typeof window !== 'undefined') {
      return getLocalMessages();
    }
    return [];
  });
  const [messagesModalOpen, setMessagesModalOpen] = useState(false);
  const [activePropertyForNotes, setActivePropertyForNotes] = useState<PropertyItem | null>(null);
  const [notesThread, setNotesThread] = useState<any[]>([]);
  const [auditEventsList, setAuditEventsList] = useState<any[]>([]);
  const [modalTab, setModalTab] = useState<'MESSAGES' | 'AUDIT'>('MESSAGES');
  const [replyText, setReplyText] = useState('');
  const [sendingReply, setSendingReply] = useState(false);
  const [loadingNotes, setLoadingNotes] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    locality: 'Ferozepur Road',
    address: '',
    city: 'Ludhiana',
    type: 'PG',
    totalRooms: 4,
    bedsPerRoom: 2,
    rentPerMonth: 6000,
    gender: 'ANY',
    description: '',
    images: [
      'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=1000&q=80',
    ] as string[],
  });

  const fetchAdminMessages = async () => {
    try {
      const res = await fetch('/api/admin/messages', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        const apiMsgs = data.messages || [];
        saveLocalMessagesBatch(apiMsgs);
        if (data.auditEvents) {
          saveLocalAuditEventsBatch(data.auditEvents);
        }
        setAdminMessages(getLocalMessages());
      }
    } catch (err) {
      console.warn('Error fetching admin messages:', err);
    }
  };

  useEffect(() => {
    if (searchParams?.get('add') === 'true') {
      setIsModalOpen(true);
    }

    const overrides = getLocalOverrides();

    // Refresh properties list from API and apply local overrides
    fetch('/api/properties', { cache: 'no-store' })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.properties && Array.isArray(data.properties) && data.properties.length > 0) {
          const sanitized = data.properties.map((rawP: any) => {
            const p = sanitizeProperty(rawP);
            const o = overrides[p.id];
            return o ? { ...p, verificationStatus: o.verificationStatus, rejectionReason: o.rejectionReason } : p;
          });
          setProperties(sanitized);
        }
      })
      .catch((err) => console.warn('Error syncing properties from API:', err));

    fetchAdminMessages();
  }, [searchParams]);

  const openPropertyNotes = async (prop: PropertyItem) => {
    setActivePropertyForNotes(prop);
    setMessagesModalOpen(true);
    setLoadingNotes(true);
    setReplyText('');

    // Instant render from localStorage
    const localMsgs = getLocalMessages(prop.id);
    const localAudits = getLocalAuditEvents(prop.id);
    setNotesThread(localMsgs);
    setAuditEventsList(localAudits);

    try {
      const res = await fetch(`/api/admin/messages?propertyId=${prop.id}`, { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        const apiMsgs = data.messages || [];
        const apiAudits = data.auditEvents || [];

        saveLocalMessagesBatch(apiMsgs);
        saveLocalAuditEventsBatch(apiAudits);

        const updatedMsgs = getLocalMessages(prop.id);
        const updatedAudits = getLocalAuditEvents(prop.id);
        setNotesThread(updatedMsgs);
        setAuditEventsList(updatedAudits);
        setAdminMessages(getLocalMessages());

        // Mark as read
        fetch('/api/admin/messages', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ propertyId: prop.id }),
        }).catch(() => {});
      }
    } catch (err) {
      console.error('Error fetching property notes:', err);
    } finally {
      setLoadingNotes(false);
    }
  };

  const handleSendReply = async () => {
    if (!replyText.trim() || !activePropertyForNotes) return;
    setSendingReply(true);

    const optimisticMsg = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      fromRole: 'LANDLORD' as const,
      fromName: 'Vikram Singh (Landlord)',
      toPropertyId: activePropertyForNotes.id,
      propertyName: activePropertyForNotes.name,
      message: replyText.trim(),
      timestamp: new Date().toISOString(),
      read: false,
    };

    // 1. Immediately persist locally
    saveLocalMessage(optimisticMsg);
    setNotesThread((prev) => [...prev, optimisticMsg]);
    setAdminMessages((prev) => [...prev, optimisticMsg]);
    setReplyText('');

    try {
      const res = await fetch('/api/admin/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          toPropertyId: activePropertyForNotes.id,
          propertyName: activePropertyForNotes.name,
          message: optimisticMsg.message,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.message) {
          saveLocalMessage(data.message);
        }
      } else {
        alert('Failed to send reply to server.');
      }
    } catch (err) {
      console.error('Error sending reply:', err);
      alert('Network error sending reply.');
    } finally {
      setSendingReply(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.address) return;

    setIsSubmitting(true);

    try {
      const res = await fetch('/api/properties', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok && data.property) {
        const cleanNew = sanitizeProperty(data.property);
        setProperties((prev) => [cleanNew, ...prev.filter((p) => p.id !== cleanNew.id)]);
        setShowSuccessToast(true);
        setTimeout(() => setShowSuccessToast(false), 5000);
      } else {
        alert('Failed to save property. Please try again.');
      }
    } catch (err) {
      console.warn('API error submitting property:', err);
      alert('Failed to save property. Please try again.');
    } finally {
      setIsSubmitting(false);
      setIsModalOpen(false);

      setFormData({
        name: '',
        locality: 'Ferozepur Road',
        address: '',
        city: 'Ludhiana',
        type: 'PG',
        totalRooms: 4,
        bedsPerRoom: 2,
        rentPerMonth: 6000,
        gender: 'ANY',
        description: '',
        images: [
          'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=1000&q=80',
        ],
      });
      setUploadedFileNames([]);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Toast Notification */}
      {showSuccessToast && (
        <div className="bg-emerald-500 text-white px-4 py-3 rounded-xl shadow-lg flex items-center justify-between animate-slide-down">
          <div className="flex items-center gap-2 font-medium text-sm">
            <CheckCircle2 className="w-5 h-5 text-white" />
            New PG Property listed successfully with photos! Under review for UniNest Verification badge.
          </div>
          <button onClick={() => setShowSuccessToast(false)} className="text-white/80 hover:text-white font-bold text-sm">
            Dismiss
          </button>
        </div>
      )}

      {/* Official Admin Communication Banner */}
      {(() => {
        const adminNotes = adminMessages.filter((m) => m.fromRole === 'ADMIN');
        const latestNote = adminNotes.length > 0 ? adminNotes[adminNotes.length - 1] : null;
        if (!latestNote) return null;

        return (
          <div className="bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50 border-2 border-amber-300 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-slide-down">
            <div className="flex items-start sm:items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-sm">
                <MessageSquare className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] font-black uppercase tracking-wider text-amber-900 bg-amber-200/90 px-2 py-0.5 rounded-full">
                    Official Notice from UniNest Admin
                  </span>
                  <span className="text-xs font-bold text-slate-800">
                    Regarding: <strong className="text-slate-950 font-black">{latestNote.propertyName || 'Property Portfolio'}</strong>
                  </span>
                  <span className="text-[11px] text-slate-500">
                    {new Date(latestNote.timestamp).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                  </span>
                </div>
                <p className="text-xs font-semibold text-slate-800 mt-1 bg-white/80 px-3 py-1.5 rounded-lg border border-amber-200/60 inline-block shadow-2xs">
                  "{latestNote.message}"
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Button
                size="sm"
                onClick={() => {
                  const targetProp = properties.find((p) => p.id === latestNote.toPropertyId) || properties[0];
                  if (targetProp) openPropertyNotes(targetProp);
                }}
                className="bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-sm"
              >
                <MessageSquare className="w-3.5 h-3.5 mr-1.5" />
                Open Discussion & Reply
              </Button>
            </div>
          </div>
        );
      })()}

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Property Portfolio</h1>
          <p className="text-text-secondary mt-1">Manage PG units, room configurations, photo galleries, and bed occupancy</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="bg-brand-600 hover:bg-brand-700 text-white font-bold">
          <Plus className="w-4 h-4 mr-2" /> Add New PG / Hostel
        </Button>
      </div>

      {/* Property Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {properties.map((rawProp) => {
          const p = sanitizeProperty(rawProp);
          const coverImage = p.images && p.images[0];
          const isRejected = p.verificationStatus === 'REJECTED' || p.verificationStatus === 'SUSPENDED';
          const isVerified = p.verificationStatus === 'VERIFIED';
          const propMessages = adminMessages.filter((m) => m.toPropertyId === p.id);
          const hasUnread = propMessages.some((m) => m.fromRole === 'ADMIN' && !m.read);

          return (
            <Card key={p.id} className={`overflow-hidden rounded-2xl border transition-all shadow-sm flex flex-col justify-between ${
              isRejected ? 'border-rose-300 bg-rose-50/10' : 'border-slate-200 hover:border-brand-300'
            }`}>
              {/* Cover Photo Banner */}
              {coverImage && (
                <div className="h-36 w-full relative bg-slate-100 overflow-hidden">
                  <img src={coverImage} alt={p.name} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-black/20 flex items-between justify-between p-3">
                    <Badge
                      variant={isVerified ? 'success' : isRejected ? 'danger' : 'warning'}
                      size="sm"
                      className="self-start shadow-sm font-bold uppercase tracking-wider text-[10px]"
                    >
                      {isRejected ? '❌ REJECTED BY ADMIN' : isVerified ? '✓ VERIFIED' : '⏳ UNDER REVIEW'}
                    </Badge>
                    <span className="self-end text-[11px] font-bold text-white bg-slate-900/80 px-2.5 py-0.5 rounded-full backdrop-blur-sm flex items-center gap-1">
                      <Camera className="w-3 h-3" /> {p.images?.length || 1} Photos
                    </span>
                  </div>
                </div>
              )}

              <div className="p-5 space-y-4 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                        {p.name}
                        {hasUnread && (
                          <span className="inline-flex items-center gap-1 text-[10px] bg-amber-500 text-white font-bold px-1.5 py-0.5 rounded-full animate-pulse">
                            New Note
                          </span>
                        )}
                      </h2>
                      <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3.5 h-3.5 text-brand-600 shrink-0" /> {p.address}
                      </p>
                    </div>
                    <div className="w-9 h-9 bg-brand-50 rounded-xl flex items-center justify-center text-brand-600 shrink-0">
                      <Building2 className="w-4 h-4" />
                    </div>
                  </div>

                  {/* Rejection Alert Box */}
                  {isRejected && (
                    <div className="my-3 bg-rose-50 border-2 border-rose-200 rounded-xl p-3 text-xs space-y-1.5 shadow-2xs">
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-rose-800 flex items-center gap-1.5">
                          <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                          Listing Suspended / Rejected by Admin
                        </span>
                        <span className="text-[10px] uppercase font-bold text-rose-700 bg-rose-200/80 px-2 py-0.5 rounded">Action Required</span>
                      </div>
                      <p className="text-slate-800 text-[11px] leading-relaxed">
                        <strong className="text-rose-900 font-bold">Admin Feedback:</strong>{' '}
                        {p.rejectionReason || 'Building compliance or safety verification standards not met.'}
                      </p>
                      <button
                        type="button"
                        onClick={() => openPropertyNotes(p)}
                        className="text-brand-600 hover:text-brand-800 font-bold text-[11px] underline flex items-center gap-1 pt-1"
                      >
                        <MessageSquare className="w-3 h-3" /> View Admin Feedback & Request Re-Audit →
                      </button>
                    </div>
                  )}

                  <div className="grid grid-cols-3 gap-2 my-4 p-3 bg-slate-50 rounded-xl text-center">
                    <div>
                      <p className="text-[11px] text-slate-500 font-medium">Beds Occupied</p>
                      <p className="text-sm font-black text-slate-900 mt-0.5">
                        {p.occupiedBeds} / {p.totalBeds}
                      </p>
                    </div>
                    <div>
                      <p className="text-[11px] text-slate-500 font-medium">Monthly Rent</p>
                      <p className="text-sm font-black text-emerald-700 mt-0.5">
                        ₹{Number(p.rentPerMonth || 6000).toLocaleString('en-IN')}
                      </p>
                    </div>
                    <div>
                      <p className="text-[11px] text-slate-500 font-medium">Open Issues</p>
                      <p className="text-sm font-black text-amber-600 mt-0.5">{p.openTickets} tickets</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-2 pt-3 border-t border-slate-100">
                  <div className="flex items-center gap-1.5">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openPropertyNotes(p)}
                      className={`text-xs font-bold flex items-center gap-1.5 ${
                        propMessages.length > 0
                          ? 'border-brand-500 text-brand-700 bg-brand-50/60 hover:bg-brand-100'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-brand-600" />
                      Admin Notes
                      {propMessages.length > 0 && (
                        <span className="bg-brand-600 text-white text-[10px] px-1.5 py-0.2 rounded-full font-black">
                          {propMessages.length}
                        </span>
                      )}
                    </Button>
                  </div>
                  <Link href={`/landlord/properties/${p.id}`}>
                    <Button size="sm" variant="outline" className="text-xs font-bold">
                      Manage Property →
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Add Property Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add New PG / Hostel Unit"
        description="Register a new student accommodation property on UniNest with verified photos"
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Property Name *"
            placeholder="e.g. Passi Executive Student PG"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Property Type"
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              options={[
                { value: 'PG', label: 'Student PG (Paying Guest)' },
                { value: 'HOSTEL', label: 'Private Student Hostel' },
                { value: 'FLAT', label: 'Co-Living Student Apartment' },
              ]}
            />
            <Select
              label="Gender Preference"
              value={formData.gender}
              onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
              options={[
                { value: 'ANY', label: 'Co-Ed / All Students' },
                { value: 'MALE', label: 'Boys Only' },
                { value: 'FEMALE', label: 'Girls Only' },
              ]}
            />
          </div>

          <Input
            label="Street Address *"
            placeholder="Plot 88, BRS Nagar, Ferozepur Road"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Locality / Campus Vicinity"
              value={formData.locality}
              onChange={(e) => setFormData({ ...formData, locality: e.target.value })}
              options={[
                { value: 'Ferozepur Road', label: 'Ferozepur Road (PCTE Vicinity)' },
                { value: 'BRS Nagar', label: 'BRS Nagar (PAU Vicinity)' },
                { value: 'Sarabha Nagar', label: 'Sarabha Nagar' },
                { value: 'Model Town', label: 'Model Town' },
                { value: 'Gill Road', label: 'Gill Road (GNDEC Vicinity)' },
              ]}
            />
            <Input
              label="City"
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="Number of Rooms"
              type="number"
              min={1}
              value={formData.totalRooms}
              onChange={(e) => setFormData({ ...formData, totalRooms: Number(e.target.value) })}
            />
            <Input
              label="Beds Per Room"
              type="number"
              min={1}
              value={formData.bedsPerRoom}
              onChange={(e) => setFormData({ ...formData, bedsPerRoom: Number(e.target.value) })}
            />
            <Input
              label="Monthly Rent (₹) *"
              type="number"
              min={1000}
              value={formData.rentPerMonth}
              onChange={(e) => setFormData({ ...formData, rentPerMonth: Number(e.target.value) })}
            />
          </div>

          {/* Photo Upload Section */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2.5">
            <label className="font-bold text-slate-700 flex items-center justify-between text-xs">
              <span className="flex items-center gap-1.5">
                <Camera className="w-4 h-4 text-brand-600" />
                <span>Upload PG & Room Photos</span>
              </span>
              <span className="text-[11px] text-slate-400 font-normal">Shown to student tenants in search</span>
            </label>

            <div className="flex items-center gap-2">
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => {
                  const files = e.target.files;
                  if (files && files.length > 0) {
                    const names = Array.from(files).map((f) => f.name);
                    setUploadedFileNames(names);
                    const mockUrls = Array.from(files).map(
                      () => 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=1000&q=80'
                    );
                    setFormData((prev) => ({
                      ...prev,
                      images: [...new Set([...prev.images, ...mockUrls])],
                    }));
                  }
                }}
                className="text-xs text-slate-500 file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100"
              />
            </div>

            {uploadedFileNames.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {uploadedFileNames.map((fn, i) => (
                  <span key={i} className="text-[11px] font-mono bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded">
                    ✓ {fn}
                  </span>
                ))}
              </div>
            )}

            {/* Quick Photo Presets */}
            <div className="flex items-center gap-2 flex-wrap pt-1">
              <span className="text-[11px] text-slate-500 font-medium">Quick Photo Presets:</span>
              {[
                { label: '🛏️ Modern Room', url: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=1000&q=80' },
                { label: '🪴 Study Balcony', url: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=1000&q=80' },
                { label: '🚿 Attached Bath', url: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1000&q=80' },
              ].map((preset) => {
                const isSelected = formData.images.includes(preset.url);
                return (
                  <button
                    key={preset.url}
                    type="button"
                    onClick={() => {
                      setFormData((prev) => ({
                        ...prev,
                        images: isSelected
                          ? prev.images.filter((u) => u !== preset.url)
                          : [...prev.images, preset.url],
                      }));
                    }}
                    className={`text-[11px] px-2.5 py-1 rounded-lg border font-semibold transition-all ${
                      isSelected
                        ? 'bg-brand-50 text-brand-700 border-brand-300 shadow-sm'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {preset.label} {isSelected ? '✓' : '+'}
                  </button>
                );
              })}
            </div>
          </div>

          <Textarea
            label="Description & Rules"
            placeholder="Provide details about food availability, high-speed WiFi, security warden, sub-meter rules..."
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="bg-brand-600 hover:bg-brand-700 text-white font-bold">
              {isSubmitting ? 'Registering Property...' : 'Save & Publish Property'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Landlord Communication & Notes Modal */}
      <Modal
        isOpen={messagesModalOpen}
        onClose={() => setMessagesModalOpen(false)}
        title="Admin Communication & Property History"
        description="Official correspondence and compliance audit history with UniNest Admin"
        size="lg"
      >
        <div className="space-y-4 text-sm flex flex-col h-[70vh]">
          {/* Property Selector & Status Summary */}
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 flex-1 w-full sm:w-auto">
              <span className="font-bold text-slate-700 shrink-0">Select PG:</span>
              <select
                value={activePropertyForNotes?.id || ''}
                onChange={(e) => {
                  const target = properties.find((p) => p.id === e.target.value);
                  if (target) openPropertyNotes(target);
                }}
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
                  activePropertyForNotes?.verificationStatus === 'VERIFIED'
                    ? 'success'
                    : activePropertyForNotes?.verificationStatus === 'REJECTED' || activePropertyForNotes?.verificationStatus === 'SUSPENDED'
                    ? 'danger'
                    : 'warning'
                }
                size="sm"
                className="font-bold uppercase tracking-wider text-[10px]"
              >
                {activePropertyForNotes?.verificationStatus || 'UNDER REVIEW'}
              </Badge>
            </div>
          </div>

          {activePropertyForNotes?.rejectionReason && (
            <div className="bg-rose-50 border border-rose-200 rounded-xl p-2.5 text-xs text-rose-800 flex items-center justify-between gap-2">
              <span className="font-medium">
                <strong>Rejection Issue:</strong> {activePropertyForNotes.rejectionReason}
              </span>
              <span className="text-[10px] uppercase font-bold text-rose-700 bg-rose-200/80 px-2 py-0.5 rounded">Action Required</span>
            </div>
          )}

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
              Communication Log ({notesThread.length})
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
                {loadingNotes ? (
                  <p className="text-slate-500 text-center py-8 text-xs">Loading correspondence history...</p>
                ) : notesThread.length > 0 ? (
                  notesThread.map((msg, idx) => {
                    const isAdmin = msg.fromRole === 'ADMIN';
                    return (
                      <div
                        key={idx}
                        className={`p-3.5 rounded-xl shadow-sm border ${
                          isAdmin
                            ? 'bg-amber-50/70 border-amber-200/80 mr-4'
                            : 'bg-white border-emerald-200 ml-4'
                        }`}
                      >
                        <div className="flex justify-between items-center mb-1.5 gap-2">
                          <div className="flex items-center gap-1.5">
                            <span
                              className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                                isAdmin
                                  ? 'bg-amber-200 text-amber-900'
                                  : 'bg-emerald-100 text-emerald-900'
                              }`}
                            >
                              {isAdmin ? '🛡️ UNINEST ADMIN' : '🏠 LANDLORD (YOU)'}
                            </span>
                            <span className="font-bold text-slate-900 text-xs">{msg.fromName}</span>
                          </div>
                          <span className="text-[10px] text-slate-400 font-medium">
                            {new Date(msg.timestamp).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                          </span>
                        </div>
                        <p className="text-slate-700 text-xs whitespace-pre-wrap leading-relaxed">
                          {msg.message}
                        </p>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-8 text-xs text-slate-500 space-y-1">
                    <MessageSquare className="w-8 h-8 text-slate-300 mx-auto mb-1" />
                    <p className="font-bold text-slate-700">No message history for this property yet.</p>
                    <p className="text-[11px] text-slate-400">
                      Type a message below to contact the UniNest admin team regarding listing approvals or verification.
                    </p>
                  </div>
                )}
              </div>

              {/* Reply Form */}
              <div className="mt-2 space-y-2">
                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl p-3 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none shadow-sm"
                  rows={2}
                  placeholder="Reply to UniNest Admin (e.g. 'I have updated the fire extinguisher certificates and fixed Room 204')..."
                />
                <div className="flex justify-between items-center">
                  <span className="text-[11px] text-slate-400">
                    Saved permanently in browser storage & synced to admin compliance team.
                  </span>
                  <Button
                    onClick={handleSendReply}
                    disabled={sendingReply || !replyText.trim()}
                    className="bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs"
                  >
                    <Send className="w-3.5 h-3.5 mr-1.5" />
                    {sendingReply ? 'Sending...' : 'Send Reply to Admin'}
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
