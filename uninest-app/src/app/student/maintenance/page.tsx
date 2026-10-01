'use client';

import React, { useState, useEffect } from 'react';
import {
  Wrench, Plus, CheckCircle2, Clock, AlertTriangle, Droplets, Zap,
  Wind, KeyRound, ShieldCheck, X, Camera, Sparkles, UserCheck, Star,
  HelpCircle, ChevronDown, ChevronUp, Check, AlertCircle, Wifi, Sofa
} from 'lucide-react';
import { Card, Badge, Button } from '@/components/ui/Shared';
import { useDashboardUser, isDemoAccountEmail } from '@/components/layout/DashboardShell';

interface MaintenanceTicket {
  id: string;
  ticketId: string;
  category: 'PLUMBING' | 'ELECTRICAL' | 'HVAC' | 'LOCKSMITH' | 'FURNITURE' | 'INTERNET';
  title: string;
  description: string;
  priority: 'URGENT' | 'HIGH' | 'MEDIUM' | 'LOW';
  status: 'OPEN' | 'PENDING' | 'IN_PROGRESS' | 'RESOLVED';
  technician: string;
  createdAt: string;
  eta: string;
  slot?: string;
  photoName?: string;
  rating?: number;
}

const INITIAL_TICKETS: MaintenanceTicket[] = [
  {
    id: 'tkt-3',
    ticketId: 'MNT-2026-003',
    category: 'ELECTRICAL',
    title: 'Power socket sparking in Room 204',
    description: 'The main power socket is sparking when appliances are plugged in.',
    priority: 'URGENT',
    status: 'OPEN',
    technician: 'Pending Assignment',
    createdAt: 'Just now',
    eta: 'Within 2 hours',
    slot: 'Immediate (2h Emergency SLA)',
    photoName: 'socket_spark_room204.jpg',
  },
  {
    id: 'tkt-2',
    ticketId: 'MNT-2026-002',
    category: 'HVAC',
    title: 'AC not cooling properly',
    description: 'Air conditioner in the room is running but not cooling the room at all.',
    priority: 'MEDIUM',
    status: 'IN_PROGRESS',
    technician: 'QuickFix Services',
    createdAt: '1 day ago',
    eta: 'Today by 5:00 PM',
    slot: 'Afternoon (1 PM - 4 PM)',
    photoName: 'ac_compressor_filter.jpg',
  },
  {
    id: 'tkt-1',
    ticketId: 'MNT-2026-001',
    category: 'PLUMBING',
    title: 'Bathroom tap leaking',
    description: 'Continuous water dripping from the washbasin tap.',
    priority: 'HIGH',
    status: 'RESOLVED',
    technician: 'UniNest Plumber',
    createdAt: '3 days ago',
    eta: 'Resolved',
    slot: 'Morning (9 AM - 12 PM)',
    rating: 5,
  },
];

export default function MaintenanceTicketsPage() {
  const { userEmail: ctxEmail, isDemoUser: ctxIsDemo } = useDashboardUser();
  const [isDemo, setIsDemo] = useState<boolean>(ctxIsDemo);
  const [userEmail, setUserEmail] = useState<string>(ctxEmail || '');
  const [tickets, setTickets] = useState<MaintenanceTicket[]>(ctxIsDemo ? INITIAL_TICKETS : []);
  const [filterTab, setFilterTab] = useState<'ALL' | 'ACTIVE' | 'RESOLVED'>('ALL');

  // Modal & Form State
  const [modalOpen, setModalOpen] = useState(false);
  const [category, setCategory] = useState<'PLUMBING' | 'ELECTRICAL' | 'HVAC' | 'LOCKSMITH' | 'FURNITURE' | 'INTERNET'>('PLUMBING');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'URGENT' | 'HIGH' | 'MEDIUM' | 'LOW'>('MEDIUM');
  const [slot, setSlot] = useState('Morning (9 AM - 12 PM)');
  const [attachedFileName, setAttachedFileName] = useState<string>('Room_Issue_Photo_01.jpg');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Success Banner
  const [toastBanner, setToastBanner] = useState<{
    title: string;
    message: string;
    ticketId: string;
  } | null>(null);

  // SLA Architecture Drawer
  const [showSlaInfo, setShowSlaInfo] = useState(false);

  useEffect(() => {
    const loadTicketsForEmail = (email: string) => {
      const demo = isDemoAccountEmail(email);
      setIsDemo(demo);
      setUserEmail(email);

      let savedTickets: MaintenanceTicket[] = [];
      try {
        const raw = localStorage.getItem(`uninest_student_maintenance_${email || 'guest'}`);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) {
            savedTickets = parsed;
          }
        }
      } catch {}

      if (demo) {
        const existingIds = new Set(savedTickets.map((t) => t.id));
        setTickets([...savedTickets, ...INITIAL_TICKETS.filter((t) => !existingIds.has(t.id))]);
      } else {
        setTickets(savedTickets);
      }

      // Sync live tickets from database
      fetch('/api/demo/maintenance')
        .then((res) => res.json())
        .then((data) => {
          if (data?.success && Array.isArray(data.tickets) && data.tickets.length > 0) {
            setTickets((prev) => {
              const currentIds = new Set(prev.map((t) => t.id));
              const newFromDb = data.tickets.filter((t: any) => !currentIds.has(t.id));
              return [...prev, ...newFromDb];
            });
          }
        })
        .catch(() => {});
    };

    if (ctxEmail) {
      loadTicketsForEmail(ctxEmail);
      return;
    }

    fetch('/api/profile')
      .then((res) => res.json())
      .then((data) => {
        const email = data?.email || data?.user?.email || '';
        loadTicketsForEmail(email);
      })
      .catch(() => {
        setIsDemo(false);
        setTickets([]);
      });
  }, [ctxEmail]);

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description) return;

    setIsSubmitting(true);
    const newTicketId = `MNT-2026-${Math.floor(100 + Math.random() * 900)}`;

    const newTicket: MaintenanceTicket = {
      id: `tkt-${Date.now()}`,
      ticketId: newTicketId,
      category,
      title,
      description,
      priority,
      status: 'OPEN',
      technician: 'Auto-assigned to UniNest Duty Technician',
      createdAt: 'Just now',
      eta: priority === 'URGENT' ? 'Within 2 hours' : 'Within 24 hours',
      slot,
      photoName: attachedFileName,
    };

    const updatedTickets = [newTicket, ...tickets];
    setTickets(updatedTickets);
    setModalOpen(false);
    setTitle('');
    setDescription('');
    setIsSubmitting(false);

    // Save to LocalStorage
    try {
      const storageKey = `uninest_student_maintenance_${userEmail || 'guest'}`;
      const raw = localStorage.getItem(storageKey);
      const saved = raw ? JSON.parse(raw) : [];
      saved.unshift(newTicket);
      localStorage.setItem(storageKey, JSON.stringify(saved));
    } catch {}

    // Show Confirmation Banner
    setToastBanner({
      title: `✓ Maintenance Ticket ${newTicketId} Raised Successfully!`,
      message: `Technician auto-dispatched for preferred slot: ${slot}. Guaranteed resolution under UniNest 24-Hour SLA.`,
      ticketId: newTicketId,
    });

    // Trigger API persistence in Prisma & Audit Log
    try {
      await fetch('/api/demo/maintenance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTicket),
      });
    } catch (err) {
      console.warn('Background ticket sync:', err);
    }
  };

  const handleRateTicket = (ticketId: string, rating: number) => {
    setTickets((prev) =>
      prev.map((t) => (t.id === ticketId ? { ...t, rating } : t))
    );
  };

  const getCategoryIcon = (cat: string) => {
    switch (cat.toUpperCase()) {
      case 'PLUMBING':
        return <Droplets className="w-4 h-4 text-sky-600" />;
      case 'ELECTRICAL':
        return <Zap className="w-4 h-4 text-amber-500" />;
      case 'HVAC':
        return <Wind className="w-4 h-4 text-indigo-500" />;
      case 'LOCKSMITH':
        return <KeyRound className="w-4 h-4 text-emerald-600" />;
      case 'FURNITURE':
        return <Sofa className="w-4 h-4 text-orange-600" />;
      case 'INTERNET':
        return <Wifi className="w-4 h-4 text-purple-600" />;
      default:
        return <Wrench className="w-4 h-4 text-emerald-600" />;
    }
  };

  const filteredTickets = tickets.filter((tkt) => {
    if (filterTab === 'ALL') return true;
    if (filterTab === 'ACTIVE') return tkt.status !== 'RESOLVED';
    if (filterTab === 'RESOLVED') return tkt.status === 'RESOLVED';
    return true;
  });

  const openCount = tickets.filter((t) => t.status !== 'RESOLVED').length;
  const resolvedCount = tickets.filter((t) => t.status === 'RESOLVED').length;

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Maintenance & Repairs</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Report plumbing, electrical, AC, or furniture issues with guaranteed SLA resolution.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowSlaInfo(!showSlaInfo)}
            className="border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold py-2 px-3 rounded-xl flex items-center gap-1.5"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>SLA &amp; Flow Guide</span>
            {showSlaInfo ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </Button>

          <Button
            onClick={() => setModalOpen(true)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs py-2.5 px-4 rounded-xl shadow-md flex items-center gap-1.5 shrink-0 transition-transform active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Raise Maintenance Ticket</span>
          </Button>
        </div>
      </div>

      {/* Success Toast Banner */}
      {toastBanner && (
        <div className="bg-emerald-50 border border-emerald-300 rounded-2xl p-4 shadow-sm flex items-start justify-between gap-3 animate-fade-in">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-extrabold text-emerald-950">{toastBanner.title}</h4>
              <p className="text-xs text-emerald-800 mt-0.5">{toastBanner.message}</p>
            </div>
          </div>
          <button
            onClick={() => setToastBanner(null)}
            className="text-emerald-700 hover:text-emerald-950 text-xs font-bold p-1"
          >
            ✕
          </button>
        </div>
      )}

      {/* SLA & End-to-End Flow Guide (Collapsible) */}
      {showSlaInfo && (
        <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-teal-950 border border-slate-700 rounded-2xl p-6 text-white shadow-lg space-y-4 animate-fade-in">
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              Statutory 24-Hour SLA Guarantee
            </span>
            <span className="text-[11px] text-slate-400">Section 12, Student Housing Tenancy Charter</span>
          </div>
          <h3 className="text-lg font-bold text-white">How UniNest Maintenance &amp; Repair Flow Operates</h3>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs pt-1">
            <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700 space-y-1.5">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-300 flex items-center justify-center font-bold text-xs">
                1
              </div>
              <div className="font-bold text-slate-100">Ticket Logged by Student</div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Student specifies room, category (plumbing, electrical), description, and attaches photo evidence.
              </p>
            </div>

            <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700 space-y-1.5">
              <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-300 flex items-center justify-center font-bold text-xs">
                2
              </div>
              <div className="font-bold text-slate-100">Landlord &amp; Vendor Alert</div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Landlord Portal receives live alert. Pre-approved local service vendor (QuickFix / Home Services) is auto-notified.
              </p>
            </div>

            <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700 space-y-1.5">
              <div className="w-7 h-7 rounded-lg bg-indigo-500/20 text-indigo-300 flex items-center justify-center font-bold text-xs">
                3
              </div>
              <div className="font-bold text-slate-100">Physical Visit &amp; Fix</div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Verified technician visits within SLA window (Urgent: 2h, Medium: 24h) and performs repairs at ₹0 cost to tenant.
              </p>
            </div>

            <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700 space-y-1.5">
              <div className="w-7 h-7 rounded-lg bg-purple-500/20 text-purple-300 flex items-center justify-center font-bold text-xs">
                4
              </div>
              <div className="font-bold text-slate-100">Sign-Off &amp; Rating</div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Student inspects repair, rates technician (1–5 stars), and ticket closes on the immutable UniNest Trust Ledger.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* SLA Info Banner */}
      <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 p-5 rounded-2xl text-white shadow-md flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-emerald-500/20 border border-emerald-400/30 rounded-xl">
            <ShieldCheck className="w-6 h-6 text-emerald-300" />
          </div>
          <div>
            <h3 className="font-extrabold text-sm text-white">UniNest 24-Hour SLA Guarantee</h3>
            <p className="text-xs text-emerald-200 mt-0.5">
              Urgent maintenance issues (plumbing, power outage) are attended to within 4 hours by verified technicians.
            </p>
          </div>
        </div>
        <span className="hidden md:inline-block text-xs font-bold bg-white/10 border border-white/20 px-3 py-1.5 rounded-xl text-emerald-200">
          Landlord Pre-Approved
        </span>
      </div>

      {/* Filter Tabs & Ticket List */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-2">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setFilterTab('ALL')}
              className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-colors ${
                filterTab === 'ALL'
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              All Tickets ({tickets.length})
            </button>
            <button
              onClick={() => setFilterTab('ACTIVE')}
              className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-colors ${
                filterTab === 'ACTIVE'
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Active / Open ({openCount})
            </button>
            <button
              onClick={() => setFilterTab('RESOLVED')}
              className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-colors ${
                filterTab === 'RESOLVED'
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Resolved ({resolvedCount})
            </button>
          </div>
          <span className="text-xs text-slate-500 font-medium">PCTE Smart Student Residency • Room 204</span>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {filteredTickets.length === 0 ? (
            <div className="bg-white border border-slate-200 p-8 rounded-2xl text-center shadow-sm">
              <p className="text-sm text-slate-500">
                No tickets matching this filter. Submit a ticket if you experience any facility issues.
              </p>
            </div>
          ) : (
            filteredTickets.map((tkt) => (
              <div
                key={tkt.id}
                className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm hover:border-slate-300 transition-all space-y-3"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <div className="flex items-center gap-1 font-mono text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                        {getCategoryIcon(tkt.category)}
                        <span>{tkt.ticketId}</span>
                      </div>
                      <Badge
                        variant={
                          tkt.priority === 'URGENT'
                            ? 'danger'
                            : tkt.priority === 'HIGH'
                            ? 'danger'
                            : tkt.priority === 'MEDIUM'
                            ? 'warning'
                            : 'default'
                        }
                        size="sm"
                      >
                        {tkt.priority} PRIORITY
                      </Badge>
                      <Badge
                        variant={
                          tkt.status === 'RESOLVED'
                            ? 'success'
                            : tkt.status === 'IN_PROGRESS'
                            ? 'warning'
                            : 'default'
                        }
                        size="sm"
                      >
                        {tkt.status.replace('_', ' ')}
                      </Badge>
                    </div>
                    <h3 className="font-extrabold text-sm text-slate-900 mt-1">{tkt.title}</h3>
                  </div>

                  <div className="text-right text-xs shrink-0">
                    <span className="text-slate-400 block text-[11px]">Logged On</span>
                    <span className="font-semibold text-slate-700">{tkt.createdAt}</span>
                  </div>
                </div>

                <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-200">
                  {tkt.description}
                </p>

                {tkt.photoName && (
                  <div className="flex items-center gap-2 text-[11px] text-slate-500">
                    <Camera className="w-3.5 h-3.5 text-slate-400" />
                    <span>Evidence Attached: <strong>{tkt.photoName}</strong></span>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-2 border-t border-slate-100 gap-2 text-xs">
                  <div className="flex items-center gap-2 text-slate-600">
                    <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>
                      Assigned: <strong className="text-slate-900">{tkt.technician}</strong>
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    {tkt.slot && (
                      <span className="text-[11px] text-slate-500 hidden sm:inline">
                        Slot: {tkt.slot}
                      </span>
                    )}

                    <div className="flex items-center gap-1.5 text-emerald-800 font-medium">
                      <Clock className="w-3.5 h-3.5 text-emerald-600" />
                      <span>SLA: {tkt.eta}</span>
                    </div>

                    {tkt.status === 'RESOLVED' && (
                      <div className="flex items-center gap-1 pl-2 border-l border-slate-200">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            onClick={() => handleRateTicket(tkt.id, star)}
                            className="p-0.5 hover:scale-110 transition-transform"
                          >
                            <Star
                              className={`w-3.5 h-3.5 ${
                                (tkt.rating || 0) >= star
                                  ? 'fill-amber-400 text-amber-400'
                                  : 'text-slate-300'
                              }`}
                            />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* RAISE TICKET MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-5 animate-scale-in border border-slate-200 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <Wrench className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">Raise Maintenance Ticket</h3>
                  <p className="text-[11px] text-slate-500">24-Hour Guaranteed Resolution • Landlord Pre-Approved</p>
                </div>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTicket} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Issue Category</label>
                <select
                  value={category}
                  onChange={(e: any) => setCategory(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-medium text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  <option value="PLUMBING">🚰 Plumbing (Tap leak, flush, drain, water tank)</option>
                  <option value="ELECTRICAL">⚡ Electrical (Switchboard, socket sparking, bulb, fan)</option>
                  <option value="HVAC">❄️ HVAC (Air Conditioner cooling, remote, filter)</option>
                  <option value="LOCKSMITH">🔑 Locksmith (Door lock, latch, key duplicate)</option>
                  <option value="FURNITURE">🪑 Furniture (Bed frame, study table, chair, wardrobe)</option>
                  <option value="INTERNET">📶 Wi-Fi / Internet (Router reboot, signal drop)</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Issue Title</label>
                <input
                  type="text"
                  placeholder="e.g. Bathroom sink pipe leaking onto floor"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-medium text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Detailed Description</label>
                <textarea
                  rows={3}
                  placeholder="Describe the issue, exact room location, and when it started..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-medium text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Priority Level</label>
                  <select
                    value={priority}
                    onChange={(e: any) => setPriority(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-medium text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  >
                    <option value="URGENT">🚨 Urgent (Within 2 Hours)</option>
                    <option value="HIGH">⚡ High Priority (Within 6 Hours)</option>
                    <option value="MEDIUM">🛠️ Medium (Within 24 Hours)</option>
                    <option value="LOW">📋 Low (Routine 48h Maintenance)</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Preferred Time Slot</label>
                  <select
                    value={slot}
                    onChange={(e) => setSlot(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-medium text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  >
                    <option value="Morning (9 AM - 12 PM)">Morning (9 AM - 12 PM)</option>
                    <option value="Afternoon (1 PM - 4 PM)">Afternoon (1 PM - 4 PM)</option>
                    <option value="Evening (5 PM - 8 PM)">Evening (5 PM - 8 PM)</option>
                  </select>
                </div>
              </div>

              {/* Photo Evidence Attachment */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <label className="font-bold text-slate-700 flex items-center gap-1.5">
                  <Camera className="w-4 h-4 text-emerald-600" />
                  <span>Attach Photo Evidence</span>
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) setAttachedFileName(file.name);
                    }}
                    className="text-xs text-slate-500 file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
                  />
                  {attachedFileName && (
                    <span className="text-[11px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 truncate">
                      {attachedFileName}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
                <Button type="button" variant="ghost" onClick={() => setModalOpen(false)}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs py-2.5 px-4 rounded-xl shadow-md flex items-center gap-1.5"
                >
                  <Wrench className="w-4 h-4" />
                  <span>{isSubmitting ? 'Dispatching...' : 'Dispatch Technician'}</span>
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
