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

export default function LandlordProfilePage() {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Landlord Profile State (Synchronized with Vikram Singh / landlord@uninest.in)
  const [name, setName] = useState('Vikram Singh');
  const [company, setCompany] = useState('Passi Residency Properties Ltd.');
  const [avatarUrl, setAvatarUrl] = useState('https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200');
  const [email, setEmail] = useState('landlord@uninest.in');
  const [phone, setPhone] = useState('+91 98989 89801');
  const [city, setCity] = useState('Ludhiana');
  const [address, setAddress] = useState('Plot 42, Block B, Passi Nagar, Ferozepur Road, Ludhiana, Punjab');
  const [gstin, setGstin] = useState('03AABCP4829K1Z5');
  const [panNo, setPanNo] = useState('AABCP4829K');

  // Bank payout info state
  const [bankName, setBankName] = useState('HDFC Bank Ltd. (Direct UPI Linked)');
  const [accountName, setAccountName] = useState('Passi Residency Properties (Vikram Singh)');
  const [accountNo, setAccountNo] = useState('50200084911098');
  const [ifsc, setIfsc] = useState('HDFC0000123');

  const [isRealUserWithoutPhone, setIsRealUserWithoutPhone] = useState(false);

  useEffect(() => {
    let savedParsed: any = null;
    try {
      const saved = localStorage.getItem('uninest_landlord_profile');
      if (saved) {
        savedParsed = JSON.parse(saved);
        if (savedParsed.name) setName(savedParsed.name);
        if (savedParsed.email) setEmail(savedParsed.email.replace('@uninest.demo', '@uninest.in'));
        if (savedParsed.phone) setPhone(savedParsed.phone);
        if (savedParsed.company) setCompany(savedParsed.company);
        if (savedParsed.address) setAddress(savedParsed.address);
      }
    } catch {}

    fetch('/api/profile')
      .then((r) => r.json())
      .then((data) => {
        if (data?.authenticated && data?.user) {
          const userEmail = (data.user.email || 'landlord@uninest.in').replace('@uninest.demo', '@uninest.in');
          const isDemoLandlord = userEmail.toLowerCase() === 'landlord@uninest.in';

          setName(data.user.name || 'Vikram Singh');
          setEmail(userEmail);
          if (data.user.avatarUrl) {
            setAvatarUrl(data.user.avatarUrl);
          }

          if (!isDemoLandlord) {
            const isSameSavedUser =
              savedParsed?.email &&
              savedParsed.email.toLowerCase() === userEmail.toLowerCase();
            const savedPhone =
              isSameSavedUser &&
              savedParsed.phone &&
              savedParsed.phone !== '+91 98989 89801'
                ? savedParsed.phone
                : '';
            const realPhone = data.user.phone || savedPhone || '';

            if (realPhone) {
              setPhone(realPhone);
              setIsRealUserWithoutPhone(false);
            } else {
              setPhone('Not added yet — Tap Edit Profile to add');
              setIsRealUserWithoutPhone(true);
            }
          }
        }
      })
      .catch(() => {});
  }, []);

  // Portfolio Summary
  const portfolio = {
    totalProperties: 3,
    totalUnits: 28,
    occupiedUnits: 24,
    occupancyRate: '85.7%',
    monthlyRevenue: 168000,
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
    try {
      localStorage.setItem(
        'uninest_landlord_profile',
        JSON.stringify({ name, email: cleanEmail, phone: cleanPhone || phone, company, address, bankName, accountName, accountNo, ifsc })
      );
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
                    />
                  ) : (
                    <span className="text-slate-900 font-bold text-sm mt-0.5 block">{bankName}</span>
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
                    />
                  ) : (
                    <span className="text-slate-900 font-bold text-sm mt-0.5 block">{accountName}</span>
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
                    />
                  ) : (
                    <span className="text-slate-900 font-bold text-sm mt-0.5 block">•••• •••• {accountNo.slice(-4)}</span>
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
                    />
                  ) : (
                    <span className="text-slate-900 font-bold text-sm mt-0.5 block">{ifsc}</span>
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
