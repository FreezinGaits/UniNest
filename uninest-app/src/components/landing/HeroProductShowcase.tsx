'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Building2,
  ShieldCheck,
  MapPin,
  Zap,
  Wrench,
  GraduationCap,
  Users,
  CheckCircle2,
  ArrowRight,
  Star,
  SlidersHorizontal,
  Lock,
  Unlock,
  Sparkles,
  ChevronRight,
  CalendarCheck,
  Clock,
  BedDouble,
  FileText,
  AlertCircle,
  Eye,
  Camera,
  Layers,
} from 'lucide-react';

export function HeroProductShowcase() {
  const [activePortalTab, setActivePortalTab] = useState<'student' | 'landlord' | 'college' | 'quickfix'>('student');
  const [selectedBed, setSelectedBed] = useState<'A' | 'B'>('A');

  return (
    <div className="relative mx-auto max-w-6xl mt-8">
      {/* Decorative Glows */}
      <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-3/4 h-64 bg-gradient-to-r from-emerald-500/20 via-brand-500/20 to-teal-500/20 blur-3xl rounded-full pointer-events-none -z-10" />

      {/* Main Glassmorphism Browser Container */}
      <div className="bg-white/95 backdrop-blur-xl border border-slate-200/90 rounded-3xl shadow-2xl overflow-hidden transition-all duration-300 hover:shadow-brand-500/10 hover:border-brand-200">
        
        {/* Browser Top Chrome / Nav Bar */}
        <div className="bg-slate-900 text-white px-4 py-3 sm:px-6 flex flex-wrap items-center justify-between gap-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block" />
              <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
              <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
            </div>
            <div className="hidden sm:flex items-center gap-1.5 ml-4 bg-slate-800/90 px-3 py-1 rounded-lg text-xs font-mono text-slate-300 border border-slate-700/60">
              <Lock className="w-3 h-3 text-emerald-400" />
              <span>uninest.in/student/search?hub=pcte-ludhiana&amp;radius=3km</span>
            </div>
          </div>

          {/* Interactive Portal Switcher Tabs */}
          <div className="flex items-center gap-1 p-1 bg-slate-800/90 rounded-xl border border-slate-700/60 text-xs">
            <button
              onClick={() => setActivePortalTab('student')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-bold transition-all ${
                activePortalTab === 'student'
                  ? 'bg-emerald-500 text-slate-950 shadow-sm'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Student</span> Search
            </button>
            <button
              onClick={() => setActivePortalTab('landlord')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-bold transition-all ${
                activePortalTab === 'landlord'
                  ? 'bg-emerald-500 text-slate-950 shadow-sm'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Landlord</span> OS
            </button>
            <button
              onClick={() => setActivePortalTab('college')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-bold transition-all ${
                activePortalTab === 'college'
                  ? 'bg-emerald-500 text-slate-950 shadow-sm'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">PCTE</span> Housing
            </button>
            <button
              onClick={() => setActivePortalTab('quickfix')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-bold transition-all ${
                activePortalTab === 'quickfix'
                  ? 'bg-emerald-500 text-slate-950 shadow-sm'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <Wrench className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">QuickFix</span> Network
            </button>
          </div>
        </div>

        {/* Tab 1: Student Marketplace View */}
        {activePortalTab === 'student' && (
          <div className="p-4 sm:p-6 lg:p-8 bg-gradient-to-b from-slate-50/60 to-white">
            {/* Search Filter Strip Simulation */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-sm mb-6">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <MapPin className="w-3 h-3 text-emerald-600" />
                  PCTE Institute (Baddowal Campus)
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                  Radius: 3 km
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                  Double Sharing
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                  4 Meals Included
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                <span>Showing <strong>12</strong> Verified PGs</span>
              </div>
            </div>

            {/* Showcase Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
              {/* Featured PG Card */}
              <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/90 shadow-md p-5 flex flex-col justify-between relative overflow-hidden group">
                <div className="absolute top-4 right-4 z-10">
                  <span className="px-3 py-1 rounded-full text-[11px] font-extrabold bg-emerald-600 text-white shadow-sm flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    100% On-Site Verified
                  </span>
                </div>

                <div>
                  {/* Image with overlay badge */}
                  <div className="relative rounded-xl overflow-hidden aspect-[16/9] mb-4 bg-slate-100">
                    <img
                      src="https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=800&q=80"
                      alt="PCTE Smart Residency"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute bottom-2 left-2 bg-slate-900/85 backdrop-blur-sm text-white px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-emerald-400" />
                      5 mins walk to PCTE Gate 2
                    </div>
                  </div>

                  {/* Title & Location */}
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <h3 className="font-extrabold text-slate-900 text-lg sm:text-xl">
                        PCTE Smart Student Residency
                      </h3>
                      <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        Plot 42, Block B, BRS Nagar, Ferozepur Road, Ludhiana
                      </p>
                    </div>
                    <div className="flex items-center gap-1 px-2 py-0.5 bg-amber-50 border border-amber-200 rounded-lg text-xs font-bold text-amber-800">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      4.9 (28)
                    </div>
                  </div>

                  {/* Bed Level Inventory Picker */}
                  <div className="my-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-2">
                      <span className="flex items-center gap-1.5">
                        <BedDouble className="w-4 h-4 text-emerald-600" />
                        Room 204 — Bed-Level Availability:
                      </span>
                      <span className="text-[11px] text-emerald-700 font-semibold">1 Bed Available</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <button
                        onClick={() => setSelectedBed('A')}
                        className={`p-2 rounded-lg border text-left transition-all ${
                          selectedBed === 'A'
                            ? 'bg-emerald-50 border-emerald-300 text-emerald-950 font-bold ring-2 ring-emerald-400/30'
                            : 'bg-white border-slate-200 text-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span>Bed A (Window View)</span>
                          <span className="w-2 h-2 rounded-full bg-emerald-500" />
                        </div>
                        <span className="text-[10px] text-slate-500 block mt-0.5">₹6,000 / month</span>
                      </button>

                      <div className="p-2 rounded-lg border border-slate-200 bg-slate-100/70 text-slate-400 cursor-not-allowed text-left">
                        <div className="flex items-center justify-between">
                          <span>Bed B (Desk Side)</span>
                          <span className="text-[10px] font-semibold text-rose-500">Occupied</span>
                        </div>
                        <span className="text-[10px] text-slate-400 block mt-0.5">By Rahul Sharma</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Pricing & CTA */}
                <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-xl sm:text-2xl font-black text-slate-900">₹6,000</span>
                      <span className="text-xs text-slate-500 font-medium">/ month base rent</span>
                    </div>
                    <div className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1 mt-0.5">
                      <Sparkles className="w-3 h-3 text-emerald-600" />
                      True Monthly Cost: <strong>₹8,200</strong> (Meals + Wi-Fi + Power)
                    </div>
                  </div>

                  <Link
                    href="/login"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20 transition-all hover:scale-[1.02]"
                  >
                    <Lock className="w-3.5 h-3.5" />
                    Reserve Bed for ₹399
                  </Link>
                </div>
              </div>

              {/* Two-Stage Geofence Escrow Architecture Explainer Panel */}
              <div className="lg:col-span-5 flex flex-col gap-4 justify-between">
                {/* Two-Stage Escrow Flow Card */}
                <div className="bg-gradient-to-br from-brand-900 via-slate-900 to-slate-950 text-white p-5 rounded-2xl border border-slate-800 shadow-md">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wider bg-emerald-500 text-slate-950">
                      Core Technology
                    </span>
                    <span className="text-xs text-slate-300 font-bold">Two-Stage OTP Escrow</span>
                  </div>

                  <h4 className="font-extrabold text-base text-white mb-3">
                    Zero Risk of Deposit Loss or Ghost Move-Ins
                  </h4>

                  <div className="space-y-3 text-xs">
                    <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-white/5 border border-white/10">
                      <div className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-300 flex items-center justify-center font-bold text-xs shrink-0">
                        1
                      </div>
                      <div>
                        <strong className="text-white block font-bold">Stage 1: Physical Visit OTP</strong>
                        <span className="text-slate-300 text-[11px]">
                          Landlord verbally provides 4-digit OTP only during physical walk-through inspection.
                        </span>
                      </div>
                    </div>

                    <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-white/5 border border-white/10">
                      <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-300 flex items-center justify-center font-bold text-xs shrink-0">
                        2
                      </div>
                      <div>
                        <strong className="text-white block font-bold">Stage 2: GPS 250m Geofence Handshake</strong>
                        <span className="text-slate-300 text-[11px]">
                          Student GPS verified within 250m $\rightarrow$ Unlocks 6-digit Move-In PIN $\rightarrow$ Escrow released to Host.
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Sub-Meter Electricity Splitter Widget */}
                <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-sm">
                  <div className="flex items-center justify-between mb-2 text-xs">
                    <span className="font-bold text-slate-800 flex items-center gap-1.5">
                      <Zap className="w-4 h-4 text-amber-500" />
                      Room 204 Sub-Meter Calculator
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                      PSPCL @ ₹9.00 / kWh
                    </span>
                  </div>

                  <div className="bg-slate-50 p-2.5 rounded-xl text-xs space-y-1.5 border border-slate-100">
                    <div className="flex justify-between text-slate-600">
                      <span>Meter Units: 1240 kWh $\rightarrow$ 1540 kWh</span>
                      <strong className="text-slate-900">300 Units</strong>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Total Room Power Bill</span>
                      <strong className="text-slate-900">₹2,700</strong>
                    </div>
                    <div className="pt-1.5 border-t border-slate-200 flex justify-between font-extrabold text-emerald-700">
                      <span>Each Student Split (3 Beds):</span>
                      <span className="text-sm">₹900 / month</span>
                    </div>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-2 flex items-center gap-1">
                    <Camera className="w-3 h-3 text-slate-400" />
                    Monthly meter dial photo attached to digital receipt.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Landlord OS View */}
        {activePortalTab === 'landlord' && (
          <div className="p-4 sm:p-6 lg:p-8 bg-gradient-to-b from-slate-50/60 to-white animate-fade-in">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                <span className="text-xs text-slate-500 font-semibold block">Total Accommodations</span>
                <span className="text-2xl font-black text-slate-900 mt-1 block">3 PGs</span>
                <span className="text-[11px] text-emerald-600 font-bold">100% Verified Live</span>
              </div>
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                <span className="text-xs text-slate-500 font-semibold block">Total Bed Capacity</span>
                <span className="text-2xl font-black text-slate-900 mt-1 block">36 Beds</span>
                <span className="text-[11px] text-slate-500">32 Occupied (88%)</span>
              </div>
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                <span className="text-xs text-slate-500 font-semibold block">Monthly Rental Run-Rate</span>
                <span className="text-2xl font-black text-emerald-700 mt-1 block">₹2.16L</span>
                <span className="text-[11px] text-emerald-600 font-bold">Zero Brokerage Loss</span>
              </div>
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                <span className="text-xs text-slate-500 font-semibold block">Sub-Meter Power Billed</span>
                <span className="text-2xl font-black text-amber-600 mt-1 block">₹28,800</span>
                <span className="text-[11px] text-slate-500">Automated Split</span>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
                    <Building2 className="w-4 h-4 text-emerald-700" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-slate-900 text-sm">Passi Luxury PG &amp; Co-Living</h4>
                    <span className="text-[11px] text-slate-500">Near Wave Mall, Main Ferozepur Road</span>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Active in Student Search
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70">
                  <span className="text-slate-500 font-semibold block mb-1">Room 101 (Double Sharing)</span>
                  <div className="flex gap-2">
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-bold text-[10px]">Bed A: Available</span>
                    <span className="px-2 py-0.5 bg-slate-200 text-slate-700 rounded font-bold text-[10px]">Bed B: Occupied</span>
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70">
                  <span className="text-slate-500 font-semibold block mb-1">Room 102 (Triple Sharing)</span>
                  <div className="flex gap-1.5">
                    <span className="px-2 py-0.5 bg-slate-200 text-slate-700 rounded font-bold text-[10px]">Bed A: Occupied</span>
                    <span className="px-2 py-0.5 bg-slate-200 text-slate-700 rounded font-bold text-[10px]">Bed B: Occupied</span>
                    <span className="px-2 py-0.5 bg-slate-200 text-slate-700 rounded font-bold text-[10px]">Bed C: Occupied</span>
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70">
                  <span className="text-slate-500 font-semibold block mb-1">Sub-Meter Status</span>
                  <span className="text-emerald-700 font-bold block">✓ October Billing Finalized</span>
                  <span className="text-[10px] text-slate-400">UPI receipts auto-sent to tenants</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: PCTE Housing Cell View */}
        {activePortalTab === 'college' && (
          <div className="p-4 sm:p-6 lg:p-8 bg-gradient-to-b from-slate-50/60 to-white animate-fade-in">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h4 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-indigo-600" />
                  PCTE Institute of Management — Housing Oversight Desk
                </h4>
                <p className="text-xs text-slate-500">Live safety registry for off-campus enrolled students</p>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                Institutional Hub Active
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5 text-xs">
              <div className="bg-white p-4 rounded-xl border border-slate-200">
                <span className="text-slate-500 font-semibold block">Monitored Student Residents</span>
                <span className="text-2xl font-black text-slate-900 mt-1 block">420 Students</span>
                <span className="text-[11px] text-emerald-600 font-bold">100% Geofence Check-in Verified</span>
              </div>
              <div className="bg-white p-4 rounded-xl border border-slate-200">
                <span className="text-slate-500 font-semibold block">Vetted Campus PGs</span>
                <span className="text-2xl font-black text-indigo-600 mt-1 block">24 Hostels</span>
                <span className="text-[11px] text-slate-500">Within 3 km of Gate 1 &amp; Gate 2</span>
              </div>
              <div className="bg-white p-4 rounded-xl border border-slate-200">
                <span className="text-slate-500 font-semibold block">Emergency Safety Status</span>
                <span className="text-2xl font-black text-emerald-600 mt-1 block">Normal</span>
                <span className="text-[11px] text-slate-500">Zero Active Panic Alerts</span>
              </div>
            </div>

            <div className="p-3.5 bg-indigo-50/70 border border-indigo-200 rounded-xl text-xs text-indigo-900 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />
                <span>
                  <strong>Form-11 Residence Compliance:</strong> All outstation PCTE students have digital lease records on file with verified guardian emergency contacts.
                </span>
              </div>
              <Link href="/login" className="font-bold text-indigo-700 hover:underline shrink-0">
                View Registry →
              </Link>
            </div>
          </div>
        )}

        {/* Tab 4: QuickFix Service Partner View */}
        {activePortalTab === 'quickfix' && (
          <div className="p-4 sm:p-6 lg:p-8 bg-gradient-to-b from-slate-50/60 to-white animate-fade-in">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h4 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                  <Wrench className="w-5 h-5 text-amber-500" />
                  QuickFix Facility Services — On-Demand Campus Dispatch
                </h4>
                <p className="text-xs text-slate-500">2-Hour SLA Maintenance &amp; Repair Network for Student Accommodations</p>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
                Technician Network Active
              </span>
            </div>

            <div className="space-y-3">
              <div className="p-3.5 rounded-xl bg-white border border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center font-bold text-amber-800">
                    ⚡
                  </div>
                  <div>
                    <strong className="text-slate-900 block font-bold">Sub-Meter Calibration &amp; MCB Replacement</strong>
                    <span className="text-slate-500 text-[11px]">Passi Residency, Room 204 • Tech Assigned: Harpreet Singh</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Photo Proof Uploaded
                  </span>
                  <span className="font-black text-slate-900">₹850</span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-white border border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center font-bold text-blue-800">
                    ❄️
                  </div>
                  <div>
                    <strong className="text-slate-900 block font-bold">AC Chemical Deep Cleaning &amp; Filter Service</strong>
                    <span className="text-slate-500 text-[11px]">PCTE Smart Residency, Floor 2 • 2-Hour SLA Met</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Completed &amp; Signed
                  </span>
                  <span className="font-black text-slate-900">₹599</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer Trust Ticker */}
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-100 flex flex-wrap items-center justify-between text-xs text-slate-500 gap-3">
          <div className="flex items-center gap-4 flex-wrap font-medium">
            <span className="flex items-center gap-1.5 text-slate-700 font-bold">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              50+ Verified PGs in Ludhiana
            </span>
            <span className="flex items-center gap-1.5 text-slate-700 font-bold">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              100% Escrow Protected Hold
            </span>
            <span className="flex items-center gap-1.5 text-slate-700 font-bold">
              <FileText className="w-4 h-4 text-emerald-600" />
              11-Month e-Stamp Agreement
            </span>
          </div>
          <Link
            href="/student/search"
            className="font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 hover:translate-x-0.5 transition-transform"
          >
            Launch Interactive Search <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
