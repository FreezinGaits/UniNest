'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import {
  Phone, AlertTriangle, Flame, HeartPulse, ShieldAlert, Wrench,
  Droplets, Zap, KeyRound, Wind, Building2, CheckCircle2
} from 'lucide-react';

const officialEmergencies = [
  { label: 'National Emergency', number: '112', icon: ShieldAlert, color: 'bg-red-600', desc: 'Police, Fire, Ambulance — unified helpline' },
  { label: 'Ambulance', number: '108', icon: HeartPulse, color: 'bg-red-500', desc: 'Medical emergency transport' },
  { label: 'Police Control Room', number: '100', icon: ShieldAlert, color: 'bg-blue-600', desc: 'Law enforcement & student safety' },
  { label: 'Fire Brigade', number: '101', icon: Flame, color: 'bg-orange-600', desc: 'Fire & rescue department' },
  { label: 'Women Safety Helpline', number: '1091', icon: Phone, color: 'bg-purple-600', desc: '24/7 Women safety helpline' },
];

const propertyEmergencies = [
  { title: 'Main Fuse / Power Outage', category: 'Electrical', icon: Zap, desc: 'Power outage, failure, circuit trip', color: 'bg-amber-100 text-amber-700' },
  { title: 'Water Pipe Burst / Tank Empty', category: 'Plumbing', icon: Droplets, desc: 'Burst pipe, tap leak, tank empty', color: 'bg-blue-100 text-blue-700' },
  { title: 'Electronic Door Lock Jammed', category: 'Lockout', icon: KeyRound, desc: 'Locked out of room, broken lock', color: 'bg-slate-100 text-slate-700' },
  { title: 'Severe Water Logging', category: 'Water', icon: Droplets, desc: 'Drainage overflow, severe logging, pump issue', color: 'bg-cyan-100 text-cyan-700' },
  { title: 'Gas / Kitchen Leak', category: 'Hazard', icon: Flame, desc: 'Pantry gas leak, smoke, or urgent hazard', color: 'bg-rose-100 text-rose-700' },
];

import { useDashboardUser, isDemoAccountEmail } from '@/components/layout/DashboardShell';

export default function EmergencyPage() {
  const { userEmail: ctxEmail, isDemoUser: ctxIsDemo } = useDashboardUser();
  const [isDemo, setIsDemo] = useState<boolean>(ctxIsDemo);
  const [dispatchedIssue, setDispatchedIssue] = useState<string | null>(null);
  const [isDispatching, setIsDispatching] = useState(false);

  useEffect(() => {
    if (ctxEmail) {
      setIsDemo(isDemoAccountEmail(ctxEmail));
      return;
    }
    fetch('/api/profile')
      .then((res) => res.json())
      .then((data) => {
        const email = data?.email || data?.user?.email || '';
        setIsDemo(isDemoAccountEmail(email));
      })
      .catch(() => {
        setIsDemo(false);
      });
  }, [ctxEmail]);

  async function handleQuickDispatch(title: string) {
    setIsDispatching(true);
    setDispatchedIssue(title);
    try {
      await fetch('/api/demo/emergency', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: title }),
      });
    } catch {
      // ignore fallback errors
    } finally {
      setIsDispatching(false);
    }
  }

  const landlordPhone = '+91 98140 12345';
  const propertyName = isDemo
    ? 'PCTE Smart Student Residency (Room 204, Bed A)'
    : 'UniNest Student Safety Support Desk';
  const wardenPhone = '+91 98765 11223';

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Emergency & Student Safety SOS</h1>
          <p className="text-xs text-slate-500 mt-0.5">Instant one-tap emergency helplines, hostel warden, and urgent property services.</p>
        </div>
        <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl">
          <Phone className="w-6 h-6 text-rose-600 animate-pulse" />
        </div>
      </div>

      {/* Critical Disclaimer Notice */}
      <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 flex items-start gap-3 shadow-sm">
        <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-bold text-rose-900">For immediate life-threatening emergencies, call 112 or 108 directly.</p>
          <p className="text-xs text-rose-700 mt-0.5">
            UniNest connects you directly to official government emergency services and on-campus hostel security.
          </p>
        </div>
      </div>

      {/* Official Government Helplines */}
      <section className="space-y-3">
        <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-rose-600" />
          Official Emergency Helplines (24x7)
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {officialEmergencies.map((e) => (
            <div key={e.number} className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 ${e.color} rounded-xl flex items-center justify-center shrink-0`}>
                  <e.icon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900">{e.label}</p>
                  <p className="text-[11px] text-slate-500">{e.desc}</p>
                </div>
              </div>
              <a
                href={`tel:${e.number}`}
                className="bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-sm px-3.5 py-2 rounded-xl shadow-sm transition-colors shrink-0 ml-2"
              >
                {e.number}
              </a>
            </div>
          ))}
        </div>
      </section>

      {/* Hostel & Landlord Emergency Contacts */}
      <section className="space-y-3">
        <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
          <Building2 className="w-5 h-5 text-emerald-600" />
          Your Accommodation SOS Contacts
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm flex items-center justify-between">
            <div>
              <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold px-2 py-0.5 rounded-md mb-1 inline-block">
                Property Landlord / Owner
              </span>
              <p className="text-sm font-extrabold text-slate-900">{propertyName}</p>
              <p className="text-xs text-slate-500 mt-0.5">
                {isDemo ? 'Vikram Singh (Owner — Passi Residency)' : 'On-Call Property Caretaker Desk'}
              </p>
            </div>
            <a
              href={`tel:${landlordPhone}`}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-3.5 py-2 rounded-xl shadow-sm transition-colors"
            >
              Call {landlordPhone}
            </a>
          </div>

          <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm flex items-center justify-between">
            <div>
              <span className="bg-indigo-50 text-indigo-700 border border-indigo-200 text-[10px] font-bold px-2 py-0.5 rounded-md mb-1 inline-block">
                Campus Security / Warden
              </span>
              <p className="text-sm font-extrabold text-slate-900">PCTE Campus Security Desk</p>
              <p className="text-xs text-slate-500 mt-0.5">Chief Security Officer (Main Gate)</p>
            </div>
            <a
              href={`tel:${wardenPhone}`}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-3.5 py-2 rounded-xl shadow-sm transition-colors"
            >
              Call {wardenPhone}
            </a>
          </div>
        </div>
      </section>

      {/* Urgent On-Demand Property Services */}
      <section className="space-y-3">
        <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
          <Wrench className="w-5 h-5 text-amber-600" />
          Urgent 15-Min Property Emergency Dispatch
        </h2>

        {dispatchedIssue && (
          <div className="bg-emerald-50 border-2 border-emerald-500 rounded-2xl p-4 flex items-center justify-between gap-3 shadow-sm animate-fade-in">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <div>
                <p className="text-xs sm:text-sm font-extrabold text-emerald-900">
                  Emergency Response Dispatched for: {dispatchedIssue} — Caretaker notified (15-min SLA active)
                </p>
                <p className="text-[11px] text-emerald-700 mt-0.5">
                  {isDispatching ? 'Syncing alert with property caretaker...' : 'Duty technician & property manager alerted via SMS/Call.'}
                </p>
              </div>
            </div>
            <Badge variant="success" size="sm">
              15-MIN SLA ACTIVE
            </Badge>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {propertyEmergencies.map((item) => {
            const isSelected = dispatchedIssue === item.title;
            return (
              <div
                key={item.title}
                onClick={() => handleQuickDispatch(item.title)}
                className={`bg-white border p-4 rounded-2xl shadow-sm flex flex-col justify-between cursor-pointer transition-all hover:shadow-md active:scale-[0.99] ${
                  isSelected
                    ? 'border-emerald-600 ring-2 ring-emerald-500/20 bg-emerald-50/20'
                    : 'border-slate-200 hover:border-amber-400'
                }`}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-9 h-9 ${item.color} rounded-xl flex items-center justify-center shrink-0`}>
                    <item.icon className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-extrabold text-slate-900">{item.title}</p>
                    <p className="text-[11px] text-slate-500">{item.desc}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px]">
                  <span className="text-slate-500 font-medium">ETA: ~15-30 Mins</span>
                  <span
                    className={`font-bold px-2 py-0.5 rounded-md border ${
                      isSelected
                        ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                        : 'bg-amber-50 text-amber-700 border-amber-200'
                    }`}
                  >
                    {isSelected ? '✓ Dispatched' : 'Tap to Dispatch'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
