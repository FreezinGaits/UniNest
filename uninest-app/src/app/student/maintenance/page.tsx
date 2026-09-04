'use client';

import React, { useState } from 'react';
import {
  Wrench, Plus, CheckCircle2, Clock, AlertTriangle, Droplets, Zap,
  Wind, KeyRound, ShieldCheck, X, Camera, Sparkles, UserCheck, Star
} from 'lucide-react';
import { Card, Badge, Button } from '@/components/ui/Shared';

interface MaintenanceTicket {
  id: string;
  ticketId: string;
  category: 'PLUMBING' | 'ELECTRICAL' | 'HVAC' | 'LOCKSMITH' | 'FURNITURE' | 'INTERNET';
  title: string;
  description: string;
  priority: 'URGENT' | 'MEDIUM' | 'LOW';
  status: 'PENDING' | 'IN_PROGRESS' | 'RESOLVED';
  technician: string;
  createdAt: string;
  eta: string;
  rating?: number;
}

const INITIAL_TICKETS: MaintenanceTicket[] = [
  {
    id: 'tkt-1',
    ticketId: 'TKT-PLM-8042',
    category: 'PLUMBING',
    title: 'Bathroom Washbasin Tap Leaking & Slow Drainage',
    description: 'The tap in Room 204 attached bathroom is leaking continuously causing water wastage. Needs washer replacement.',
    priority: 'URGENT',
    status: 'IN_PROGRESS',
    technician: 'Ramesh Kumar (UniNest Verified Plumber)',
    createdAt: '04 Sep 2026, 10:15 AM',
    eta: 'Today by 4:00 PM',
  },
  {
    id: 'tkt-2',
    ticketId: 'TKT-HVC-7911',
    category: 'HVAC',
    title: 'Air Conditioner Filter Servicing & Cooling Inspection',
    description: 'Split AC cooling has slowed down. Requesting filter cleaning and gas check prior to semester exams.',
    priority: 'MEDIUM',
    status: 'PENDING',
    technician: 'Assigned to CoolFix Solutions',
    createdAt: '03 Sep 2026, 02:30 PM',
    eta: 'Tomorrow by 11:00 AM',
  },
  {
    id: 'tkt-3',
    ticketId: 'TKT-ELE-6540',
    category: 'ELECTRICAL',
    title: 'Study Desk Tube Light Bulb Replacement',
    description: 'Main LED tube light near study table flickered and burned out.',
    priority: 'LOW',
    status: 'RESOLVED',
    technician: 'Suresh Verma (Electrician)',
    createdAt: '28 Aug 2026, 09:00 AM',
    eta: 'Resolved on 28 Aug',
    rating: 5,
  },
];

export default function MaintenanceTicketsPage() {
  const [tickets, setTickets] = useState<MaintenanceTicket[]>(INITIAL_TICKETS);
  const [modalOpen, setModalOpen] = useState(false);
  const [category, setCategory] = useState<'PLUMBING' | 'ELECTRICAL' | 'HVAC' | 'LOCKSMITH' | 'FURNITURE' | 'INTERNET'>('PLUMBING');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'URGENT' | 'MEDIUM' | 'LOW'>('MEDIUM');
  const [slot, setSlot] = useState('Morning (9 AM - 12 PM)');

  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description) return;

    const newTicket: MaintenanceTicket = {
      id: `tkt-${Date.now()}`,
      ticketId: `TKT-${category.slice(0, 3)}-${Math.floor(1000 + Math.random() * 9000)}`,
      category,
      title,
      description,
      priority,
      status: 'PENDING',
      technician: 'Auto-assigned to UniNest Duty Technician',
      createdAt: 'Just now',
      eta: 'SLA Guarantee: Within 24 hours',
    };

    setTickets([newTicket, ...tickets]);
    setModalOpen(false);
    setTitle('');
    setDescription('');
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Maintenance & Repairs</h1>
          <p className="text-xs text-slate-500 mt-0.5">Report plumbing, electrical, AC, or furniture issues with guaranteed SLA resolution.</p>
        </div>
        <Button
          onClick={() => setModalOpen(true)}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2.5 px-4 rounded-xl shadow-sm flex items-center gap-1.5 shrink-0"
        >
          <Plus className="w-4 h-4" />
          Raise Maintenance Ticket
        </Button>
      </div>

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

      {/* Ticket List */}
      <div className="space-y-4">
        <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
          <Wrench className="w-4 h-4 text-emerald-600" />
          Your Active Maintenance Tickets ({tickets.length})
        </h2>

        <div className="grid grid-cols-1 gap-4">
          {tickets.map((tkt) => (
            <div key={tkt.id} className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm hover:border-slate-300 transition-all space-y-3">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                      {tkt.ticketId}
                    </span>
                    <Badge variant={tkt.priority === 'URGENT' ? 'danger' : tkt.priority === 'MEDIUM' ? 'warning' : 'default'} size="sm">
                      {tkt.priority} PRIORITY
                    </Badge>
                    <Badge variant={tkt.status === 'RESOLVED' ? 'success' : tkt.status === 'IN_PROGRESS' ? 'warning' : 'default'} size="sm">
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

              <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-2 border-t border-slate-100 gap-2 text-xs">
                <div className="flex items-center gap-2 text-slate-600">
                  <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Assigned: <strong className="text-slate-900">{tkt.technician}</strong></span>
                </div>

                <div className="flex items-center gap-1.5 text-emerald-800 font-medium">
                  <Clock className="w-3.5 h-3.5 text-emerald-600" />
                  <span>SLA: {tkt.eta}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* RAISE TICKET MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-5 animate-scale-in border border-slate-200 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <Wrench className="w-5 h-5 text-emerald-600" />
                <h3 className="text-base font-extrabold text-slate-900">Raise Maintenance Ticket</h3>
              </div>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-1">
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
                  <option value="PLUMBING">Plumbing (Tap leak, flush, drain)</option>
                  <option value="ELECTRICAL">Electrical (Switchboard, light bulb, fan)</option>
                  <option value="HVAC">HVAC / Air Conditioner / Cooler</option>
                  <option value="LOCKSMITH">Door Lock / Key / Latch</option>
                  <option value="FURNITURE">Bed / Study Table / Wardrobe</option>
                  <option value="INTERNET">Wi-Fi / Router Signal</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Issue Title</label>
                <input
                  type="text"
                  placeholder="e.g. Bathroom sink water leaking onto floor"
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
                    <option value="URGENT">Urgent (Immediate visit)</option>
                    <option value="MEDIUM">Medium (Within 24 Hours)</option>
                    <option value="LOW">Low (Routine maintenance)</option>
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

              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-emerald-800">
                <Camera className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Simulated Photo Attached: <strong>Room_Issue_Photo_01.jpg</strong></span>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
                <Button type="button" variant="ghost" onClick={() => setModalOpen(false)}>Cancel</Button>
                <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2.5 px-4 rounded-xl">
                  Dispatch Technician
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
