'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import {
  Phone, AlertTriangle, Flame, HeartPulse, ShieldAlert, Wrench,
  Droplets, Zap, KeyRound, Wind, Building2, CheckCircle2, Clock,
  ShieldCheck, X, Check,
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
import { EmergencyDispatchRecord } from '@/lib/emergencyStore';

export default function EmergencyPage() {
  const { userEmail: ctxEmail, isDemoUser: ctxIsDemo } = useDashboardUser();
  const [isDemo, setIsDemo] = useState<boolean>(ctxIsDemo);
  const [dispatchedIssue, setDispatchedIssue] = useState<string | null>(null);
  const [activeDispatch, setActiveDispatch] = useState<EmergencyDispatchRecord | null>(null);
  const [isDispatching, setIsDispatching] = useState(false);
  const [studentEnteredOtp, setStudentEnteredOtp] = useState('');
  const [otpError, setOtpError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const loadEmergencies = () => {
    fetch('/api/demo/emergency?role=STUDENT')
      .then((res) => res.json())
      .then((data) => {
        if (data.emergencies && Array.isArray(data.emergencies)) {
          const active = data.emergencies.find((e: EmergencyDispatchRecord) => e.status !== 'RESOLVED');
          if (active) {
            setActiveDispatch(active);
            setDispatchedIssue(active.title);
          } else {
            setActiveDispatch(null);
            setDispatchedIssue(null);
          }
        }
      })
      .catch(() => {});
  };

  useEffect(() => {
    if (ctxEmail) {
      setIsDemo(isDemoAccountEmail(ctxEmail));
    } else {
      fetch('/api/profile')
        .then((res) => res.json())
        .then((data) => {
          const email = data?.email || data?.user?.email || '';
          setIsDemo(isDemoAccountEmail(email));
        })
        .catch(() => {
          setIsDemo(false);
        });
    }

    loadEmergencies();
  }, [ctxEmail]);

  async function handleQuickDispatch(title: string) {
    setIsDispatching(true);
    setDispatchedIssue(title);
    try {
      const res = await fetch('/api/demo/emergency', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: title,
          property: isDemo ? 'PCTE Smart Student Residency' : 'Student Accommodation Unit',
          unit: 'Room 204 (Bed A)',
          tenantName: isDemo ? 'Rahul Sharma' : 'Student Resident',
          tenantPhone: '+91 98765 43210',
          tenantEmail: ctxEmail || 'rahul@uninest.in',
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.emergency) {
          setActiveDispatch(data.emergency);
          setToastMessage(`🚨 15-Min Emergency SLA active for ${title}! Caretaker & QuickFix alerted.`);
          setTimeout(() => setToastMessage(null), 5000);
        }
      }
    } catch {
      // ignore fallback errors
    } finally {
      setIsDispatching(false);
    }
  }

  async function handleResolveDispatch(id: string) {
    try {
      const res = await fetch('/api/demo/emergency', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'UPDATE_STATUS',
          id,
          status: 'RESOLVED',
          notes: 'Marked resolved by tenant.',
        }),
      });
      if (res.ok) {
        setActiveDispatch(null);
        setDispatchedIssue(null);
        setToastMessage('Emergency marked resolved. Thank you for confirming!');
        setTimeout(() => setToastMessage(null), 4000);
      }
    } catch {}
  }

  // Confirm In-House resolution via Landlord's OTP
  async function handleConfirmLandlordOtp() {
    if (!activeDispatch) return;
    if (!studentEnteredOtp || studentEnteredOtp.length < 4) {
      setOtpError('Please enter the 4-digit verification code provided by your landlord.');
      return;
    }

    try {
      const res = await fetch('/api/demo/emergency', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'TENANT_CONFIRM_OTP',
          id: activeDispatch.id,
          otp: studentEnteredOtp,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setOtpError(data.error || 'Invalid OTP code. Please check with your landlord.');
        return;
      }

      setToastMessage('✅ In-House resolution confirmed! Emergency officially closed.');
      setActiveDispatch(null);
      setDispatchedIssue(null);
      setStudentEnteredOtp('');
      setOtpError(null);
      loadEmergencies();
      setTimeout(() => setToastMessage(null), 5000);
    } catch {
      setOtpError('Failed to verify OTP. Please try again.');
    }
  }

  // Reject In-House resolution if issue was not actually fixed
  async function handleRejectLandlordResolution() {
    if (!activeDispatch) return;
    try {
      const res = await fetch('/api/demo/emergency', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'REOPEN_DISPATCH',
          id: activeDispatch.id,
          notes: 'Resident reported issue still unresolved. Duty vendor technician re-dispatched.',
        }),
      });

      if (res.ok) {
        setToastMessage('Dispatch reopened! QuickFix Duty Technician notified to attend on-site immediately.');
        loadEmergencies();
        setTimeout(() => setToastMessage(null), 5000);
      }
    } catch {}
  }

  const landlordPhone = '+91 98140 12345';
  const propertyName = isDemo
    ? 'PCTE Smart Student Residency (Room 204, Bed A)'
    : 'UniNest Student Safety Support Desk';
  const wardenPhone = '+91 98765 11223';

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-xl flex items-center justify-between animate-slide-down">
          <div className="flex items-center gap-2 font-bold text-xs sm:text-sm">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>{toastMessage}</span>
          </div>
          <button onClick={() => setToastMessage(null)} className="text-slate-400 hover:text-white p-1">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

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
      <section className="space-y-4">
        <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
          <Wrench className="w-5 h-5 text-amber-600" />
          Urgent 15-Min Property Emergency Dispatch
        </h2>

        {/* 1. LANDLORD SELF-RESOLUTION CONFIRMATION OTP BOX */}
        {activeDispatch && activeDispatch.status === 'AWAITING_TENANT_CONFIRMATION' && (
          <div className="bg-amber-50 border-2 border-amber-500 rounded-2xl p-5 shadow-md space-y-4 animate-slide-down">
            <div className="flex items-start justify-between flex-wrap gap-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-600 text-white flex items-center justify-center shrink-0">
                  <KeyRound className="w-6 h-6 animate-pulse" />
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-amber-800 bg-amber-200/80 px-2 py-0.5 rounded-full">
                    Action Required: Verify In-House Resolution
                  </span>
                  <h3 className="text-base font-extrabold text-slate-900 mt-1">
                    Landlord marked &quot;{activeDispatch.title}&quot; as Resolved In-House
                  </h3>
                </div>
              </div>
              <Badge variant="warning" size="sm">
                CONFIRMATION REQUIRED
              </Badge>
            </div>

            {/* Landlord Resolution Notes & Attached Photo */}
            <div className="bg-white p-4 rounded-xl border border-amber-200 space-y-3 text-xs">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Landlord Resolution Summary
                </span>
                <p className="text-slate-800 font-medium mt-0.5">
                  {activeDispatch.landlordResolutionNotes || 'Caretaker inspected and restored functionality on-site.'}
                </p>
              </div>

              {activeDispatch.proofPhoto && (
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Landlord Submitted Photo Proof
                  </span>
                  <div className="rounded-xl overflow-hidden border border-slate-200 bg-slate-900 max-h-40 max-w-sm">
                    <img src={activeDispatch.proofPhoto} alt="Proof" className="w-full h-40 object-cover" />
                  </div>
                </div>
              )}
            </div>

            {/* OTP Entry Box */}
            <div className="bg-white p-4 rounded-xl border border-amber-300 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <p className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <KeyRound className="w-4 h-4 text-indigo-600" /> Enter 4-Digit Resolution OTP from Landlord
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Ask landlord {activeDispatch.landlordName} for the 4-digit code after confirming power/water works.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setStudentEnteredOtp(activeDispatch.resolutionOtp || '4192');
                    setOtpError(null);
                  }}
                  className="text-[11px] font-bold text-indigo-600 hover:underline"
                >
                  Fill Landlord OTP ({activeDispatch.resolutionOtp || '4192'})
                </button>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <input
                  type="text"
                  maxLength={4}
                  value={studentEnteredOtp}
                  onChange={(e) => {
                    setStudentEnteredOtp(e.target.value.replace(/\D/g, ''));
                    if (otpError) setOtpError(null);
                  }}
                  className={`w-full sm:w-44 text-center text-xl font-mono font-black tracking-widest p-2.5 rounded-xl border ${
                    otpError ? 'border-rose-500 bg-rose-50' : 'border-slate-300 focus:ring-2 focus:ring-amber-500'
                  }`}
                  placeholder="• • • •"
                />
                <button
                  onClick={handleConfirmLandlordOtp}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs px-4 py-3 rounded-xl shadow-sm transition-all flex items-center justify-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Confirm &amp; Close Emergency</span>
                </button>
                <button
                  onClick={handleRejectLandlordResolution}
                  className="text-xs font-bold text-rose-700 hover:text-rose-900 hover:bg-rose-50 px-3 py-3 rounded-xl border border-rose-200 transition-colors"
                >
                  Not Fixed (Reopen &amp; Call Vendor)
                </button>
              </div>
              {otpError && <p className="text-xs text-rose-600 font-semibold">{otpError}</p>}
            </div>
          </div>
        )}

        {/* 2. STANDARD ACTIVE VENDOR DISPATCH CARD */}
        {activeDispatch && activeDispatch.status !== 'AWAITING_TENANT_CONFIRMATION' && (
          <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 border-2 border-emerald-500 rounded-2xl p-5 shadow-sm space-y-4 animate-fade-in">
            <div className="flex items-start justify-between flex-wrap gap-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <CheckCircle2 className="w-6 h-6 animate-pulse" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs font-bold text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded">
                      {activeDispatch.dispatchNo}
                    </span>
                    <Badge variant={activeDispatch.status === 'RESOLVED' ? 'success' : 'warning'} size="sm">
                      {activeDispatch.status === 'EN_ROUTE' ? 'TECHNICIAN EN ROUTE' : activeDispatch.status}
                    </Badge>
                    <span className="text-[11px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full">
                      15-MIN SLA ACTIVE
                    </span>
                  </div>
                  <h3 className="text-base font-extrabold text-slate-900 mt-1">
                    {activeDispatch.title}
                  </h3>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleResolveDispatch(activeDispatch.id)}
                  className="text-xs font-bold text-slate-600 hover:text-slate-900 bg-white border border-slate-300 hover:bg-slate-100 px-3 py-1.5 rounded-xl transition-colors shadow-2xs"
                >
                  Mark Resolved
                </button>
              </div>
            </div>

            {/* Tri-Party Live Status Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1 text-xs">
              {/* Box 1: On-Call SLA Vendor */}
              <div className="bg-white p-3.5 rounded-xl border border-emerald-200 shadow-2xs space-y-1">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                  Assigned Vendor &amp; Tech
                </span>
                <p className="font-extrabold text-slate-900">{activeDispatch.assignedVendor}</p>
                <p className="text-slate-600 font-medium">{activeDispatch.assignedTech}</p>
                <div className="pt-1.5">
                  <a
                    href={`tel:${activeDispatch.techPhone}`}
                    className="inline-flex items-center gap-1.5 text-[11px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-1 rounded-lg hover:bg-blue-100 transition-colors"
                  >
                    <Phone className="w-3 h-3" /> Call Tech ({activeDispatch.techPhone})
                  </a>
                </div>
              </div>

              {/* Box 2: Landlord & Caretaker */}
              <div className="bg-white p-3.5 rounded-xl border border-emerald-200 shadow-2xs space-y-1">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                  Property Caretaker Desk
                </span>
                <p className="font-extrabold text-slate-900">{activeDispatch.landlordName}</p>
                <p className="text-emerald-700 font-medium flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Caretaker Notified via SMS
                </p>
                <div className="pt-1.5">
                  <a
                    href={`tel:${activeDispatch.landlordPhone}`}
                    className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg hover:bg-emerald-100 transition-colors"
                  >
                    <Phone className="w-3 h-3" /> Call Caretaker ({activeDispatch.landlordPhone})
                  </a>
                </div>
              </div>

              {/* Box 3: Live ETA & Unit */}
              <div className="bg-white p-3.5 rounded-xl border border-emerald-200 shadow-2xs space-y-1">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                  Location &amp; Arrival ETA
                </span>
                <p className="font-extrabold text-slate-900">{activeDispatch.unit}</p>
                <p className="text-slate-500">{activeDispatch.property}</p>
                <div className="pt-1.5 text-slate-800 font-bold flex items-center gap-1 text-[11px]">
                  <Clock className="w-3.5 h-3.5 text-amber-600" />
                  <span>ETA: ~{activeDispatch.etaMins} mins (Target Arrival)</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Property Emergency Buttons */}
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
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${item.color}`}>
                      <item.icon className="w-4 h-4" />
                    </div>
                    <Badge variant={isSelected ? 'success' : 'outline'} size="sm">
                      {isSelected ? 'ACTIVE DISPATCH' : '15-MIN SLA'}
                    </Badge>
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-900">{item.title}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">{item.desc}</p>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between mt-3 text-xs">
                  <span className="font-bold text-emerald-700 flex items-center gap-1">
                    <Zap className="w-3 h-3 text-amber-500" /> One-Tap Rapid SOS
                  </span>
                  <span className="text-slate-400 font-medium">Auto-Dispatches Tech</span>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
