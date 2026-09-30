'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  User, Building2, ShieldCheck, Mail, Phone, MapPin, CreditCard,
  CheckCircle2, Sparkles, FileText, Settings, Edit3, ExternalLink,
  DollarSign, TrendingUp, Award, Save, Check
} from 'lucide-react';
import { Card, Badge, Button } from '@/components/ui/Shared';
import { useDashboardUser, isDemoAccountEmail } from '@/components/layout/DashboardShell';

export default function LandlordProfilePage() {
  const router = useRouter();
  const contextUser = useDashboardUser();
  const [isEditing, setIsEditing] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isDemoUser, setIsDemoUser] = useState(contextUser.isDemoUser);

  // Landlord Profile State (Synchronized with Vikram Singh for demo, or clean for real users)
  const [name, setName] = useState(contextUser.userName || (contextUser.isDemoUser ? 'Vikram Singh' : 'Landlord'));
  const [company, setCompany] = useState(contextUser.isDemoUser ? 'Passi Residency Properties Ltd.' : '');
  const [avatarUrl, setAvatarUrl] = useState('https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200');
  const [email, setEmail] = useState(contextUser.userEmail || (contextUser.isDemoUser ? 'landlord@uninest.in' : ''));
  const [phone, setPhone] = useState(contextUser.isDemoUser ? '+91 98989 89801' : 'Not added yet — Tap Edit Profile to add');
  const [city, setCity] = useState('Ludhiana');
  const [address, setAddress] = useState(contextUser.isDemoUser ? 'Plot 42, Block B, Passi Nagar, Ferozepur Road, Ludhiana, Punjab' : '');
  const [gstin, setGstin] = useState(contextUser.isDemoUser ? '03AABCP4829K1Z5' : '');
  const [panNo, setPanNo] = useState(contextUser.isDemoUser ? 'AABCP4829K' : '');

  // Bank payout info state
  const [bankName, setBankName] = useState(contextUser.isDemoUser ? 'HDFC Bank Ltd. (Direct UPI Linked)' : '');
  const [accountName, setAccountName] = useState(contextUser.isDemoUser ? 'Passi Residency Properties (Vikram Singh)' : '');
  const [accountNo, setAccountNo] = useState(contextUser.isDemoUser ? '50200084911098' : '');
  const [ifsc, setIfsc] = useState(contextUser.isDemoUser ? 'HDFC0000123' : '');

  const [isRealUserWithoutPhone, setIsRealUserWithoutPhone] = useState(false);

  useEffect(() => {
    fetch('/api/profile')
      .then((r) => r.json())
      .then((data) => {
        const userObj = data?.user || data;
        const rawEmail = userObj?.email || contextUser.userEmail || '';
        const userEmail = rawEmail.replace('@uninest.demo', '@uninest.in');
        const isDemoLandlord = rawEmail ? isDemoAccountEmail(rawEmail) : contextUser.isDemoUser;
        setIsDemoUser(isDemoLandlord);

        let savedParsed: any = null;
        try {
          const perUserSaved =
            localStorage.getItem('uninest_landlord_profile_' + userEmail) ||
            localStorage.getItem('uninest_landlord_profile_' + rawEmail);
          if (perUserSaved) {
            savedParsed = JSON.parse(perUserSaved);
          } else {
            const legacySaved = localStorage.getItem('uninest_landlord_profile');
            if (legacySaved) {
              const parsed = JSON.parse(legacySaved);
              if (!parsed?.email || parsed.email.toLowerCase() === userEmail.toLowerCase()) {
                savedParsed = parsed;
              }
            }
          }
        } catch {}

        if (userEmail) {
          setName(savedParsed?.name || userObj?.name || contextUser.userName || (isDemoLandlord ? 'Vikram Singh' : 'Landlord'));
          setEmail(userEmail);
          if (userObj?.avatarUrl) {
            setAvatarUrl(userObj.avatarUrl);
          }

          if (!isDemoLandlord) {
            setBankName(savedParsed?.bankName || '');
            setAccountName(savedParsed?.accountName || '');
            setAccountNo(savedParsed?.accountNo || '');
            setIfsc(savedParsed?.ifsc || '');
            setGstin(savedParsed?.gstin || '');
            setPanNo(savedParsed?.panNo || '');
            setCompany(savedParsed?.companyName || savedParsed?.company || '');
            setCity(savedParsed?.city || 'Ludhiana');
            setAddress(savedParsed?.address || '');

            const savedPhone =
              savedParsed?.phone &&
              savedParsed.phone !== '+91 98989 89801' &&
              !String(savedParsed.phone).startsWith('Not added yet')
                ? savedParsed.phone
                : '';
            const realPhone = savedPhone || userObj?.phone || '';

            if (realPhone) {
              setPhone(realPhone);
              setIsRealUserWithoutPhone(false);
            } else {
              setPhone('Not added yet — Tap Edit Profile to add');
              setIsRealUserWithoutPhone(true);
            }
          } else if (savedParsed) {
            if (savedParsed.phone) setPhone(savedParsed.phone);
            if (savedParsed.companyName || savedParsed.company) setCompany(savedParsed.companyName || savedParsed.company);
            if (savedParsed.gstin) setGstin(savedParsed.gstin);
            if (savedParsed.panNo) setPanNo(savedParsed.panNo);
            if (savedParsed.bankName) setBankName(savedParsed.bankName);
            if (savedParsed.accountName) setAccountName(savedParsed.accountName);
            if (savedParsed.accountNo) setAccountNo(savedParsed.accountNo);
            if (savedParsed.ifsc) setIfsc(savedParsed.ifsc);
            if (savedParsed.city) setCity(savedParsed.city);
            if (savedParsed.address) setAddress(savedParsed.address);
          }
        }
      })
      .catch(() => {});
  }, [contextUser.userEmail, contextUser.userName, contextUser.isDemoUser]);

  // Portfolio Summary
  const portfolio = isDemoUser
    ? {
        totalProperties: 3,
        totalUnits: 28,
        occupiedUnits: 24,
        occupancyRate: '85.7%',
        monthlyRevenue: 168000,
      }
    : {
        totalProperties: 0,
        totalUnits: 0,
        occupiedUnits: 0,
        occupancyRate: '0%',
        monthlyRevenue: 0,
      };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsEditing(false);
    const cleanEmail = email.replace('@uninest.demo', '@uninest.in');
    const cleanPhone = phone.startsWith('Not added yet') ? '' : phone.trim();
    setEmail(cleanEmail);
    if (cleanPhone) {
      setIsRealUserWithoutPhone(false);
    }
    const payload = {
      name,
      email: cleanEmail,
      phone: cleanPhone || phone,
      company,
      companyName: company,
      gstin,
      panNo,
      bankName,
      accountName,
      accountNo,
      ifsc,
      city,
      address,
    };
    try {
      localStorage.setItem('uninest_landlord_profile_' + cleanEmail, JSON.stringify(payload));
      localStorage.setItem('uninest_landlord_profile', JSON.stringify(payload));
      await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email: cleanEmail, phone: cleanPhone, avatarUrl }),
      });
      router.refresh();
    } catch {}
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
    }, 3000);
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      <div className="max-w-5xl mx-auto space-y-6">

        {isRealUserWithoutPhone && (
          <div className="bg-amber-50 border-2 border-amber-300 p-4 rounded-2xl shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-xs font-extrabold text-amber-950">Complete Your Google Landlord Setup</h3>
              <p className="text-[11px] text-amber-800 mt-0.5">
                Add your verified mobile number or switch your account role between <strong>Landlord</strong> and <strong>Student</strong>.
              </p>
            </div>
            <Link
              href="/auth/complete-profile"
              className="bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl shadow-sm shrink-0 text-center transition-all"
            >
              Set Phone &amp; Role →
            </Link>
          </div>
        )}

        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Landlord Business Profile</h1>
            <p className="text-xs text-slate-500 mt-0.5">Manage your property business credentials, bank payout settings, and verification status.</p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <Link
              href="/auth/complete-profile"
              className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-bold text-xs py-2.5 px-3.5 rounded-xl shadow-sm flex items-center gap-1.5 transition-all"
            >
              <Settings className="w-3.5 h-3.5 text-emerald-600" />
              Switch Role / Set Phone
            </Link>
            {isEditing ? (
              <Button
                onClick={handleSave}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2.5 px-4 rounded-xl shadow-md flex items-center gap-1.5"
              >
                <Save className="w-4 h-4" />
                Save Business Profile
              </Button>
            ) : (
              <Button
                onClick={() => {
                  if (phone.startsWith('Not added yet')) setPhone('+91 ');
                  setIsEditing(true);
                }}
                className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs py-2.5 px-4 rounded-xl shadow-sm flex items-center gap-1.5"
              >
                <Edit3 className="w-4 h-4" />
                Edit Profile Information
              </Button>
            )}
          </div>
        </div>

        {/* Saved Toast */}
        {savedSuccess && (
          <div className="bg-emerald-700 text-white text-xs font-bold p-3.5 rounded-xl shadow-lg flex items-center gap-2 animate-fade-in">
            <Check className="w-4 h-4 text-emerald-300" />
            <span>Business credentials & bank payout details successfully updated!</span>
          </div>
        )}

        {/* Hero Identity Banner */}
        <div className="bg-gradient-to-r from-slate-900 via-emerald-900 to-indigo-900 p-6 md:p-8 rounded-2xl text-white shadow-md">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex flex-col md:flex-row items-center gap-5 text-center md:text-left w-full">
              <div className="relative shrink-0">
                <img
                  src={avatarUrl}
                  alt={name}
                  className="w-24 h-24 rounded-full object-cover border-4 border-white/20 shadow-xl"
                />
                <span className="absolute bottom-0 right-0 bg-emerald-500 text-white p-1 rounded-full border-2 border-slate-900 shadow">
                  <ShieldCheck className="w-4 h-4" />
                </span>
              </div>

              <div className="space-y-1 w-full">
                {isEditing ? (
                  <div className="space-y-2 bg-white/10 p-3.5 rounded-xl border border-white/20">
                    <label className="text-[11px] text-emerald-100 font-bold block">Owner Full Name</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full text-slate-900 font-bold text-sm p-2 rounded-lg bg-white"
                    />
                    <label className="text-[11px] text-emerald-100 font-bold block">Company / Partnership Name</label>
                    <input
                      type="text"
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      className="w-full text-slate-900 text-xs p-2 rounded-lg bg-white"
                    />
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-center md:justify-start gap-2">
                      <h2 className="text-2xl md:text-3xl font-extrabold text-white">{name}</h2>
                      <span className="bg-emerald-500/80 backdrop-blur-md text-white border border-emerald-300/40 text-[11px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5 text-white" /> Verified Partner
                      </span>
                    </div>
                    <p className="text-emerald-300 font-medium text-sm flex items-center justify-center md:justify-start gap-1.5">
                      <Building2 className="w-4 h-4 text-emerald-400" />
                      {company}
                    </p>
                    <p className="text-xs text-slate-300">
                      GSTIN: {gstin} • PAN: {panNo} • {city}
                    </p>
                  </>
                )}
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/20 text-center shrink-0 min-w-[180px]">
              <div className="text-xs text-emerald-200 font-semibold mb-0.5">Verified Property Portfolio</div>
              <div className="text-2xl font-black text-white flex items-center justify-center gap-1">
                {portfolio.totalProperties} PGs / Hostels
              </div>
              <div className="text-[11px] text-emerald-200 mt-0.5">{portfolio.occupancyRate} Occupancy Rate</div>
            </div>
          </div>
        </div>

        {/* Profile Content Grid */}
        <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-3 gap-6">

          {/* Column 1 & 2: Business & Bank Details */}
          <div className="md:col-span-2 space-y-6">

            {/* Business Contact Card */}
            <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm space-y-4">
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-emerald-600" />
                Business Contact & Registration
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  <span className="text-slate-500 font-medium block text-[11px]">Primary Email</span>
                  {isEditing ? (
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full text-slate-900 font-bold p-2 mt-1 rounded-lg border border-slate-300 bg-white"
                    />
                  ) : (
                    <span className="text-slate-900 font-bold text-sm mt-0.5 block flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-slate-500" /> {email}
                    </span>
                  )}
                </div>

                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  <span className="text-slate-500 font-medium block text-[11px]">Phone Number</span>
                  {isEditing ? (
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full text-slate-900 font-bold p-2 mt-1 rounded-lg border border-slate-300 bg-white"
                    />
                  ) : (
                    <span className="text-slate-900 font-bold text-sm mt-0.5 block flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-slate-500" /> {phone}
                    </span>
                  )}
                </div>

                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 sm:col-span-2">
                  <span className="text-slate-500 font-medium block text-[11px]">Registered Office Address</span>
                  {isEditing ? (
                    <input
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="w-full text-slate-900 font-bold p-2 mt-1 rounded-lg border border-slate-300 bg-white"
                    />
                  ) : (
                    <span className="text-slate-900 font-bold text-sm mt-0.5 block flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> {address}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Bank Details for Direct Payouts */}
            <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-emerald-600" />
                  Bank & UPI Escrow Payout Settings
                </h3>
                <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
                  Direct UPI & IMPS Escrow Settlement
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  <span className="text-slate-500 font-medium block text-[11px]">Bank Name</span>
                  {isEditing ? (
                    <input
                      type="text"
                      value={bankName}
                      onChange={(e) => setBankName(e.target.value)}
                      className="w-full text-slate-900 font-bold p-1.5 mt-1 rounded-lg border border-slate-300 bg-white"
                      placeholder="e.g. HDFC Bank"
                    />
                  ) : (
                    <span className="text-slate-900 font-bold text-sm mt-0.5 block">{bankName || 'Add your bank details'}</span>
                  )}
                </div>

                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  <span className="text-slate-500 font-medium block text-[11px]">Account Name</span>
                  {isEditing ? (
                    <input
                      type="text"
                      value={accountName}
                      onChange={(e) => setAccountName(e.target.value)}
                      className="w-full text-slate-900 font-bold p-1.5 mt-1 rounded-lg border border-slate-300 bg-white"
                      placeholder="e.g. John Doe"
                    />
                  ) : (
                    <span className="text-slate-900 font-bold text-sm mt-0.5 block">{accountName || 'Add your bank details'}</span>
                  )}
                </div>

                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  <span className="text-slate-500 font-medium block text-[11px]">Account Number</span>
                  {isEditing ? (
                    <input
                      type="text"
                      value={accountNo}
                      onChange={(e) => setAccountNo(e.target.value)}
                      className="w-full text-slate-900 font-bold p-1.5 mt-1 rounded-lg border border-slate-300 bg-white"
                      placeholder="e.g. 50200000000000"
                    />
                  ) : (
                    <span className="text-slate-900 font-bold text-sm mt-0.5 block">{accountNo ? `•••• •••• ${accountNo.slice(-4)}` : 'Add your bank details'}</span>
                  )}
                </div>

                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  <span className="text-slate-500 font-medium block text-[11px]">IFSC Code</span>
                  {isEditing ? (
                    <input
                      type="text"
                      value={ifsc}
                      onChange={(e) => setIfsc(e.target.value)}
                      className="w-full text-slate-900 font-bold p-1.5 mt-1 rounded-lg border border-slate-300 bg-white"
                      placeholder="e.g. HDFC0000000"
                    />
                  ) : (
                    <span className="text-slate-900 font-bold text-sm mt-0.5 block">{ifsc || 'Add your bank details'}</span>
                  )}
                </div>
              </div>
            </div>

          </div>

          {/* Column 3: Verification & Portfolio Stats */}
          <div className="space-y-6">

            {/* Verification Status */}
            <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm space-y-4">
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                Compliance & Verification
              </h3>

              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl">
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <div>
                      <span className="font-bold text-emerald-900 block">GSTIN Registration</span>
                      <span className="text-[11px] text-emerald-700">{gstin}</span>
                    </div>
                  </div>
                  <Badge variant="success" size="sm">Verified</Badge>
                </div>

                <div className="flex items-center justify-between p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl">
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <div>
                      <span className="font-bold text-emerald-900 block">PAN Verification</span>
                      <span className="text-[11px] text-emerald-700">{panNo}</span>
                    </div>
                  </div>
                  <Badge variant="success" size="sm">Verified</Badge>
                </div>
              </div>
            </div>

            {/* Portfolio Summary */}
            <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm space-y-4">
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-600" />
                Portfolio Performance
              </h3>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3 text-xs">
                <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                  <span className="text-slate-600 font-medium">Total Properties Listed:</span>
                  <span className="text-slate-900 font-bold text-sm">{portfolio.totalProperties} PGs</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                  <span className="text-slate-600 font-medium">Total Student Beds:</span>
                  <span className="text-slate-900 font-bold text-sm">{portfolio.totalUnits} Beds</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-600 font-medium">Monthly Collections:</span>
                  <span className="text-emerald-700 font-extrabold text-sm">₹{portfolio.monthlyRevenue.toLocaleString()}/mo</span>
                </div>
              </div>
            </div>

          </div>

        </form>

      </div>
    </div>
  );
}
