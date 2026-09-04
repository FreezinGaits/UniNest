'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { login } from '@/lib/auth/actions';
import {
  Building2, Users, DollarSign, ShieldCheck, ShoppingBag, GraduationCap,
  Target, BarChart3, ArrowLeft, Play, Clock, Loader2, ArrowRight, CheckCircle2
} from 'lucide-react';

interface Journey {
  title: string;
  desc: string;
  role?: string;
  email?: string;
  targetPath: string;
  icon: any;
  color: string;
}

const journeys: Journey[] = [
  {
    title: 'Student Journey',
    desc: 'Search → Book → KYC → Move-in → Pay → Maintain → Services',
    email: 'rahul@uninest.demo',
    targetPath: '/student/dashboard',
    icon: Users,
    color: 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100',
  },
  {
    title: 'Landlord Journey',
    desc: 'Dashboard → Properties → Beds → Rent → Electricity → Earnings',
    email: 'landlord@uninest.demo',
    targetPath: '/landlord/dashboard',
    icon: Building2,
    color: 'bg-brand-50 text-brand-700 border-brand-200 hover:bg-brand-100',
  },
  {
    title: 'Revenue Model',
    desc: 'Unit economics, scenarios, and funding plan',
    targetPath: '/investor',
    icon: DollarSign,
    color: 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100',
  },
  {
    title: 'Trust Architecture',
    desc: 'KYC → Verification → Agreement → Payment Records → Disputes',
    email: 'rahul@uninest.demo',
    targetPath: '/student/agreements',
    icon: ShieldCheck,
    color: 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100',
  },
  {
    title: 'Ancillary Earnings',
    desc: 'Service purchases → Vendor commission → Landlord rewards',
    email: 'landlord@uninest.demo',
    targetPath: '/landlord/rewards',
    icon: ShoppingBag,
    color: 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100',
  },
  {
    title: 'College Layer',
    desc: 'Student housing oversight, verified PGs, hostel overflow',
    email: 'pcte@uninest.demo',
    targetPath: '/college/dashboard',
    icon: GraduationCap,
    color: 'bg-cyan-50 text-cyan-700 border-cyan-200 hover:bg-cyan-100',
  },
  {
    title: 'Competitive Positioning',
    desc: 'Why not WhatsApp? Why not NoBroker? Why UniNest?',
    targetPath: '/#competitive',
    icon: Target,
    color: 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100',
  },
  {
    title: 'Funding Plan',
    desc: '₹1 lakh allocation, milestones, and success gates',
    targetPath: '/investor#funding',
    icon: BarChart3,
    color: 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100',
  },
];

const demoSteps = [
  { step: 1, title: 'Student Finds PG', desc: 'Search with filters, view property detail with room/bed matrix', path: '/student/properties', role: 'rahul@uninest.demo', time: '30s' },
  { step: 2, title: 'Student Books', desc: 'Select bed, pay ₹399 reservation fee', path: '/student/bookings', role: 'rahul@uninest.demo', time: '20s' },
  { step: 3, title: 'KYC + Agreement', desc: 'Aadhaar verification, digital 11-month lease signing', path: '/student/agreements', role: 'rahul@uninest.demo', time: '20s' },
  { step: 4, title: 'Tenant Verification', desc: 'Police verification submission workflow', path: '/landlord/verification', role: 'landlord@uninest.demo', time: '15s' },
  { step: 5, title: 'Move-In Condition', desc: 'Condition report, bed status changes to occupied', path: '/student/move-in', role: 'rahul@uninest.demo', time: '15s' },
  { step: 6, title: 'Rent + AutoPay', desc: 'Monthly rent due, UPI payment, AutoPay toggle', path: '/student/payments', role: 'rahul@uninest.demo', time: '20s' },
  { step: 7, title: 'Electricity + Maintenance', desc: 'Sub-meter reading, utility charge split, ticket submission', path: '/student/maintenance', role: 'rahul@uninest.demo', time: '20s' },
  { step: 8, title: 'Service Purchase', desc: 'Book cleaning/laundry, vendor dispatched', path: '/student/services', role: 'rahul@uninest.demo', time: '15s' },
  { step: 9, title: 'Landlord Earnings', desc: 'Commission from services → landlord reward dashboard', path: '/landlord/rewards', role: 'landlord@uninest.demo', time: '15s' },
  { step: 10, title: 'Admin Audit Trail', desc: 'Platform metrics, audit trail, financial overview', path: '/admin/audit', role: 'admin@uninest.demo', time: '10s' },
];

export default function DemoPage() {
  const router = useRouter();
  const [loadingKey, setLoadingKey] = useState<string | null>(null);

  async function handleLaunch(targetPath: string, email?: string, key?: string) {
    const k = key || targetPath;
    setLoadingKey(k);
    try {
      if (email) {
        await login(email, 'demo123');
      }
      router.push(targetPath);
      router.refresh();
    } catch (e) {
      console.error('Launch failed:', e);
    } finally {
      setLoadingKey(null);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-sm text-gray-500 hover:text-brand-600">
            <ArrowLeft className="w-4 h-4" /> UniNest
          </Link>
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Judge Demo Mode</span>
          <Link href="/investor" className="text-sm font-medium text-brand-600 hover:underline">
            Investor Deck →
          </Link>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-4 py-12 space-y-16">
        <section className="text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-brand-50 border border-brand-200 rounded-full text-xs font-semibold text-brand-700 mb-4">
            <span className="w-1.5 h-1.5 bg-brand-500 rounded-full animate-pulse" />
            1-Click Guided Demo Launch
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900">Product Demo Hub</h1>
          <p className="text-gray-500 mt-3 max-w-md mx-auto text-sm">
            Click any journey below to instantly log in as that role and launch the live workflow.
          </p>
        </section>

        {/* 1-Click Role Switch Bar */}
        <section className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
          <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-4 text-center">
            Instant Demo Account Switcher
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {[
              { role: 'Student', name: 'Rahul Sharma', email: 'rahul@uninest.demo', path: '/student/dashboard', color: 'bg-blue-600 text-white' },
              { role: 'Landlord', name: 'Vikram Singh', email: 'landlord@uninest.demo', path: '/landlord/dashboard', color: 'bg-emerald-600 text-white' },
              { role: 'Admin', name: 'UniNest Admin', email: 'admin@uninest.demo', path: '/admin/dashboard', color: 'bg-purple-600 text-white' },
              { role: 'College', name: 'PCTE Admin', email: 'pcte@uninest.demo', path: '/college/dashboard', color: 'bg-amber-600 text-white' },
              { role: 'Provider', name: 'QuickFix Services', email: 'provider@uninest.demo', path: '/provider/dashboard', color: 'bg-cyan-600 text-white' },
            ].map((acc) => (
              <button
                key={acc.email}
                onClick={() => handleLaunch(acc.path, acc.email, acc.email)}
                disabled={loadingKey !== null}
                className="flex flex-col items-center justify-center p-3 rounded-xl border border-gray-200 hover:border-brand-500 hover:shadow-md transition-all text-center bg-gray-50 hover:bg-white disabled:opacity-50"
              >
                {loadingKey === acc.email ? (
                  <Loader2 className="w-5 h-5 animate-spin text-brand-600 my-1" />
                ) : (
                  <div className={`w-8 h-8 rounded-full ${acc.color} flex items-center justify-center text-xs font-bold mb-1 shadow-sm`}>
                    {acc.name[0]}
                  </div>
                )}
                <span className="text-xs font-bold text-gray-900">{acc.role}</span>
                <span className="text-[10px] text-gray-400 truncate max-w-full">{acc.name}</span>
              </button>
            ))}
          </div>
        </section>

        {/* Journey Buttons */}
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-4">Explore by Journey</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {journeys.map((j) => (
              <button
                key={j.title}
                onClick={() => handleLaunch(j.targetPath, j.email, j.title)}
                disabled={loadingKey !== null}
                className={`border rounded-xl p-4 text-left transition-all ${j.color} disabled:opacity-50 relative group`}
              >
                <div className="flex items-center justify-between mb-2">
                  <j.icon className="w-6 h-6" />
                  {loadingKey === j.title && <Loader2 className="w-4 h-4 animate-spin text-brand-600" />}
                </div>
                <h3 className="font-bold text-sm">{j.title}</h3>
                <p className="text-[11px] mt-1 opacity-80 leading-relaxed">{j.desc}</p>
                <div className="mt-3 flex items-center gap-1 text-[11px] font-semibold text-brand-700">
                  Launch Step <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* 5-Minute Guided Demo */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-brand-600 rounded-xl flex items-center justify-center shadow-sm">
              <Play className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">5-Minute Guided Walkthrough</h2>
              <p className="text-xs text-gray-500 flex items-center gap-1">
                <Clock className="w-3 h-3" /> Click any step below to launch directly into that live screen
              </p>
            </div>
          </div>

          <div className="relative">
            <div className="absolute left-5 top-0 bottom-0 w-px bg-brand-200" />
            <div className="space-y-3">
              {demoSteps.map((s) => (
                <div key={s.step} className="relative pl-12">
                  <div className="absolute left-3 top-3 w-4 h-4 rounded-full bg-brand-600 text-white text-[9px] font-bold flex items-center justify-center z-10 shadow-sm">
                    {s.step}
                  </div>
                  <button
                    onClick={() => handleLaunch(s.path, s.role, `step-${s.step}`)}
                    disabled={loadingKey !== null}
                    className="w-full bg-white border border-gray-200 hover:border-brand-400 rounded-xl p-4 text-left hover:shadow-md transition-all disabled:opacity-50 flex items-center justify-between group"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-gray-900 text-sm group-hover:text-brand-700 transition-colors">
                          {s.title}
                        </h3>
                        <span className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-medium">
                          {s.time}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">{s.desc}</p>
                    </div>
                    {loadingKey === `step-${s.step}` ? (
                      <Loader2 className="w-4 h-4 animate-spin text-brand-600 flex-shrink-0" />
                    ) : (
                      <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-brand-600 group-hover:translate-x-1 transition-all flex-shrink-0" />
                    )}
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8 bg-brand-50 border border-brand-200 rounded-xl p-5 text-center">
            <p className="font-semibold text-brand-800 text-sm">
              &ldquo;One student creates value before booking, during tenancy, and after moving out.&rdquo;
            </p>
          </div>

          <div className="mt-6 text-center">
            <button
              onClick={() => handleLaunch('/student/dashboard', 'rahul@uninest.demo', 'start-main')}
              disabled={loadingKey !== null}
              className="inline-flex items-center gap-2 px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-xl transition-all shadow-sm disabled:opacity-50 text-sm"
            >
              {loadingKey === 'start-main' ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Play className="w-4 h-4" />
              )}
              Start Full Demo (Student View)
            </button>
          </div>
        </section>

        <section className="bg-gray-100 rounded-xl p-4 text-center text-xs text-gray-500">
          All data shown in this demo is seeded in PostgreSQL 17 for demonstration purposes.
        </section>
      </div>
    </div>
  );
}
