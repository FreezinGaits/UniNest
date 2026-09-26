'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  User,
  Briefcase,
  ShieldCheck,
  Mail,
  Phone,
  MapPin,
  CreditCard,
  CheckCircle2,
  Star,
  Edit3,
  Save,
  Check,
  Wrench,
  Users,
  Award,
  Clock,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

export default function ProviderProfilePage() {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Provider Profile State (Synchronized with QuickFix Services / provider@uninest.in)
  const [businessName, setBusinessName] = useState('QuickFix Services');
  const [ownerName, setOwnerName] = useState('Harpreet Singh');
  const [email, setEmail] = useState('provider@uninest.in');
  const [phone, setPhone] = useState('+91 98765 00005');
  const [officeAddress, setOfficeAddress] = useState('SCO 18, Phase 1, Dugri Road, Near Model Town, Ludhiana, Punjab - 141002');
  const [gstin, setGstin] = useState('03AAFCQ9182M1Z8');
  const [msmeReg, setMsmeReg] = useState('UDYAM-PB-10-0084921');
  const [upiVpa, setUpiVpa] = useState('quickfix.ldh@okhdfcbank');
  const [bankName, setBankName] = useState('HDFC Bank Ltd. (Model Town Branch)');
  const [accountNo, setAccountNo] = useState('50200091827412');
  const [ifsc, setIfsc] = useState('HDFC0000381');

  useEffect(() => {
    try {
      const saved = localStorage.getItem('uninest_provider_profile');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.businessName) setBusinessName(parsed.businessName);
        if (parsed.ownerName) setOwnerName(parsed.ownerName);
        if (parsed.email) setEmail(parsed.email.replace('@uninest.demo', '@uninest.in'));
        if (parsed.phone) setPhone(parsed.phone);
        if (parsed.officeAddress) setOfficeAddress(parsed.officeAddress);
        if (parsed.upiVpa) setUpiVpa(parsed.upiVpa);
      }
    } catch {}

    fetch('/api/profile')
      .then((r) => r.json())
      .then((data) => {
        if (data?.authenticated && data?.user?.role === 'PROVIDER') {
          setBusinessName(data.user.name || 'QuickFix Services');
          setEmail((data.user.email || 'provider@uninest.in').replace('@uninest.demo', '@uninest.in'));
        }
      })
      .catch(() => {});
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsEditing(false);
    const cleanEmail = email.replace('@uninest.demo', '@uninest.in');
    setEmail(cleanEmail);
    try {
      localStorage.setItem(
        'uninest_provider_profile',
        JSON.stringify({ businessName, ownerName, email: cleanEmail, phone, officeAddress, upiVpa })
      );
      await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: businessName, email: cleanEmail }),
      });
      router.refresh();
    } catch {}
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const technicians = [
    { name: 'Gurdeep Singh', role: 'Senior Electrician & Sub-Meter Specialist', phone: '+91 98152 44102', kyc: 'Police Verified', exp: '7 Yrs' },
    { name: 'Manoj Kumar', role: 'Master Plumber & RO Water Technician', phone: '+91 98721 88310', kyc: 'Police Verified', exp: '6 Yrs' },
    { name: 'Sukhwinder Gill', role: 'AC / HVAC & Geyser Engineer', phone: '+91 98148 33921', kyc: 'Police Verified', exp: '5 Yrs' },
    { name: 'Rakesh Verma', role: 'Deep Cleaning & Sanitization Lead', phone: '+91 97811 55409', kyc: 'Police Verified', exp: '4 Yrs' },
  ];

  const coverageZones = [
    'Ferozepur Road & PCTE Campus Belt',
    'Passi Nagar & Baddowal Student Hub',
    'PAU Campus Gates 1, 2 & 4',
    'Sarabha Nagar & BRS Nagar',
    'Model Town & Dugri Phase 1–3',
    'GNDEC Gill Road Corridor',
  ];

  return (
    <div className="space-y-6 animate-fade-in pb-12 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Service Provider Business Profile
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage vendor trade credentials, Ludhiana PG coverage zones, verified field technicians, and UPI settlement settings.
          </p>
        </div>

        <div>
          {isEditing ? (
            <Button
              onClick={handleSave}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2.5 px-4 rounded-xl shadow-md flex items-center gap-1.5"
            >
              <Save className="w-4 h-4" />
              Save Vendor Profile
            </Button>
          ) : (
            <Button
              onClick={() => setIsEditing(true)}
              className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs py-2.5 px-4 rounded-xl shadow-sm flex items-center gap-1.5"
            >
              <Edit3 className="w-4 h-4" />
              Edit Business Profile
            </Button>
          )}
        </div>
      </div>

      {savedSuccess && (
        <div className="bg-emerald-700 text-white text-xs font-bold p-3.5 rounded-xl shadow-lg flex items-center gap-2 animate-fade-in">
          <Check className="w-4 h-4 text-emerald-300" />
          <span>Vendor profile & sidebar account identity synchronized successfully!</span>
        </div>
      )}

      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-cyan-950 to-indigo-950 p-6 md:p-8 rounded-3xl text-white shadow-xl">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col md:flex-row items-center gap-5 text-center md:text-left">
            <div className="w-20 h-20 rounded-2xl bg-cyan-600/30 border-2 border-cyan-400/40 flex items-center justify-center text-2xl font-black text-cyan-200 shadow-lg shrink-0">
              <Wrench className="w-9 h-9 text-cyan-300" />
            </div>
            <div className="space-y-1.5">
              {isEditing ? (
                <div className="space-y-2 bg-white/10 p-3 rounded-xl border border-white/20">
                  <label className="text-[11px] text-cyan-200 font-bold block">Registered Vendor Name</label>
                  <input
                    type="text"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    className="w-full text-slate-900 font-bold text-sm p-2 rounded-lg bg-white"
                  />
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-center md:justify-start gap-2.5 flex-wrap">
                    <h2 className="text-2xl font-extrabold">{businessName}</h2>
                    <Badge variant="success" size="sm">
                      ✓ Verified SLA Vendor
                    </Badge>
                  </div>
                  <p className="text-xs text-cyan-200 font-medium">
                    Lead Dispatcher: <strong>{ownerName}</strong> • GSTIN: {gstin} • MSME: {msmeReg}
                  </p>
                </>
              )}
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-md px-5 py-4 rounded-2xl border border-white/15 text-center shrink-0">
            <div className="text-xs font-semibold text-cyan-200">Vendor SLA Rating</div>
            <div className="text-2xl font-black text-white flex items-center justify-center gap-1 mt-0.5">
              <span>4.9</span>
              <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
            </div>
            <div className="text-[11px] text-slate-300 mt-0.5">48 Completed PG Jobs • 98% On-Time</div>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Business Contact & Trade Registration */}
          <Card className="p-6 space-y-4">
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
              <Briefcase className="w-4 h-4 text-cyan-600" />
              <span>Business Contact & Dispatch Credentials</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <span className="text-slate-500 font-medium block text-[11px]">Primary Dispatch Email</span>
                {isEditing ? (
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full text-slate-900 font-bold p-1.5 mt-1 rounded-lg border border-slate-300 bg-white"
                  />
                ) : (
                  <span className="text-slate-900 font-bold text-sm mt-0.5 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-cyan-600" /> {email}
                  </span>
                )}
              </div>

              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <span className="text-slate-500 font-medium block text-[11px]">24x7 Dispatch Helpline</span>
                {isEditing ? (
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full text-slate-900 font-bold p-1.5 mt-1 rounded-lg border border-slate-300 bg-white"
                  />
                ) : (
                  <span className="text-slate-900 font-bold text-sm mt-0.5 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-cyan-600" /> {phone}
                  </span>
                )}
              </div>

              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 sm:col-span-2">
                <span className="text-slate-500 font-medium block text-[11px]">Registered Workshop & Dispatch Hub</span>
                {isEditing ? (
                  <input
                    type="text"
                    value={officeAddress}
                    onChange={(e) => setOfficeAddress(e.target.value)}
                    className="w-full text-slate-900 font-bold p-1.5 mt-1 rounded-lg border border-slate-300 bg-white"
                  />
                ) : (
                  <span className="text-slate-900 font-bold text-sm mt-0.5 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-cyan-600 shrink-0" /> {officeAddress}
                  </span>
                )}
              </div>
            </div>
          </Card>

          {/* Verified Field Technicians Roster */}
          <Card className="p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Users className="w-4 h-4 text-cyan-600" />
                <span>Police-Verified Field Technicians Roster (4 Active)</span>
              </h3>
              <Badge variant="success" size="sm">
                Form-11 & Aadhaar Verified
              </Badge>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {technicians.map((tech) => (
                <div key={tech.name} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-slate-900 text-xs">{tech.name}</span>
                    <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                      {tech.kyc}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 font-medium">{tech.role}</p>
                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                    <span>{tech.phone}</span>
                    <span className="font-semibold text-cyan-700">{tech.exp} Exp</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Direct UPI & Bank Settlement */}
          <Card className="p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-emerald-600" />
                <span>Direct UPI & Bank Settlement Account</span>
              </h3>
              <Badge variant="success" size="sm">
                T+1 Automated Settlement
              </Badge>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <span className="text-slate-500 font-medium block text-[11px]">Verified Merchant UPI ID</span>
                {isEditing ? (
                  <input
                    type="text"
                    value={upiVpa}
                    onChange={(e) => setUpiVpa(e.target.value)}
                    className="w-full text-slate-900 font-bold p-1.5 mt-1 rounded-lg border border-slate-300 bg-white"
                  />
                ) : (
                  <span className="font-mono font-bold text-emerald-700 text-sm mt-0.5 block">{upiVpa}</span>
                )}
              </div>
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <span className="text-slate-500 font-medium block text-[11px]">Settlement Bank</span>
                <span className="text-slate-900 font-bold text-sm mt-0.5 block">{bankName}</span>
              </div>
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <span className="text-slate-500 font-medium block text-[11px]">Account Number</span>
                <span className="text-slate-900 font-bold text-sm mt-0.5 block">•••• •••• {accountNo.slice(-4)}</span>
              </div>
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <span className="text-slate-500 font-medium block text-[11px]">IFSC Code</span>
                <span className="text-slate-900 font-bold text-sm mt-0.5 block">{ifsc}</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column: Coverage Zones & SLA Compliance */}
        <div className="space-y-6">
          <Card className="p-6 space-y-4">
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-cyan-600" />
              <span>Ludhiana PG Coverage Zones</span>
            </h3>
            <div className="space-y-2">
              {coverageZones.map((zone) => (
                <div
                  key={zone}
                  className="flex items-center gap-2 p-2.5 rounded-xl bg-cyan-50/60 border border-cyan-200 text-xs font-semibold text-cyan-950"
                >
                  <CheckCircle2 className="w-4 h-4 text-cyan-600 shrink-0" />
                  <span>{zone}</span>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-6 space-y-4">
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Statutory & SLA Compliance</span>
            </h3>
            <div className="space-y-2.5 text-xs">
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between">
                <div>
                  <span className="font-bold text-emerald-900 block">GSTIN Certificate</span>
                  <span className="text-[11px] text-emerald-700">{gstin}</span>
                </div>
                <Badge variant="success" size="sm">Verified</Badge>
              </div>
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between">
                <div>
                  <span className="font-bold text-emerald-900 block">MSME Udyam License</span>
                  <span className="text-[11px] text-emerald-700">{msmeReg}</span>
                </div>
                <Badge variant="success" size="sm">Verified</Badge>
              </div>
              <div className="p-3 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-between">
                <div>
                  <span className="font-bold text-indigo-900 block">Emergency Response SLA</span>
                  <span className="text-[11px] text-indigo-700">Under 90 Mins (Ludhiana)</span>
                </div>
                <Badge variant="info" size="sm">Active</Badge>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
