'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Building2,
  GraduationCap,
  Phone,
  ShieldCheck,
  ArrowRight,
  User,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export default function CompleteGoogleProfilePage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [role, setRole] = useState<'STUDENT' | 'LANDLORD'>('STUDENT');
  const [phone, setPhone] = useState('');
  const [organization, setOrganization] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/profile')
      .then((r) => r.json())
      .then((data) => {
        if (data?.authenticated && data?.user) {
          setName(data.user.name || '');
          setEmail(data.user.email || '');
          setAvatarUrl(data.user.avatarUrl || '');
          if (data.user.role === 'LANDLORD' || data.user.role === 'STUDENT') {
            setRole(data.user.role);
          }
          if (data.user.phone) {
            setPhone(data.user.phone);
          }
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  async function handleComplete(e: React.FormEvent) {
    e.preventDefault();
    if (!phone.trim() || phone.replace(/\D/g, '').length < 10) {
      setError('Please enter your valid 10-digit mobile number.');
      return;
    }
    setError('');
    setSaving(true);

    try {
      const cleanPhone = phone.trim().startsWith('+91')
        ? phone.trim()
        : `+91 ${phone.trim().replace(/^0+/, '')}`;

      const res = await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          phone: cleanPhone,
          avatarUrl,
          role,
          organization: organization.trim() || undefined,
          college: role === 'STUDENT' ? organization.trim() : undefined,
          companyName: role === 'LANDLORD' ? organization.trim() : undefined,
        }),
      });

      const storageKey =
        role === 'LANDLORD' ? 'uninest_landlord_profile' : 'uninest_student_profile';
      localStorage.setItem(
        storageKey,
        JSON.stringify({
          name,
          email,
          phone: cleanPhone,
          avatarUrl,
          collegeName: role === 'STUDENT' ? organization.trim() : undefined,
          college: role === 'STUDENT' ? organization.trim() : undefined,
          company: role === 'LANDLORD' ? organization.trim() : undefined,
          companyName: role === 'LANDLORD' && organization.trim() ? organization.trim() : undefined,
        })
      );

      if (res.ok) {
        router.push(role === 'LANDLORD' ? '/landlord/dashboard' : '/student/dashboard');
        router.refresh();
      } else {
        setError('Could not save profile. Please try again.');
        setSaving(false);
      }
    } catch {
      setError('Network error while saving profile.');
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-sm text-slate-500">
        Loading your Google profile...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl border border-slate-200 shadow-xl p-6 sm:p-8 space-y-6 animate-fade-in">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 text-[11px] font-extrabold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Google Account Verified
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900">Complete Your Setup</h1>
          <p className="text-xs text-slate-500">
            Select your portal role and enter your mobile number for Escrow OTP handshakes.
          </p>
        </div>

        {/* Google Identity Card */}
        <div className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={name}
              className="w-12 h-12 rounded-full object-cover border-2 border-white shadow"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-brand-600 text-white font-extrabold text-lg flex items-center justify-center shrink-0">
              {(name || email || 'U')[0].toUpperCase()}
            </div>
          )}
          <div className="min-w-0">
            <p className="text-sm font-extrabold text-slate-900 truncate">{name}</p>
            <p className="text-xs text-slate-500 truncate">{email}</p>
          </div>
        </div>

        <form onSubmit={handleComplete} className="space-y-4">
          {/* Role Selection */}
          <div className="space-y-2">
            <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider">
              1. How are you using UniNest? *
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRole('STUDENT')}
                className={`p-3.5 rounded-2xl border-2 text-left transition-all space-y-1.5 ${
                  role === 'STUDENT'
                    ? 'border-brand-600 bg-brand-50/70 text-brand-950 shadow-sm'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                }`}
              >
                <GraduationCap
                  className={`w-5 h-5 ${role === 'STUDENT' ? 'text-brand-600' : 'text-slate-400'}`}
                />
                <div className="font-extrabold text-xs">I am a Student</div>
                <p className="text-[10px] text-slate-500 leading-snug">
                  Book verified PGs & manage rent escrow
                </p>
              </button>

              <button
                type="button"
                onClick={() => setRole('LANDLORD')}
                className={`p-3.5 rounded-2xl border-2 text-left transition-all space-y-1.5 ${
                  role === 'LANDLORD'
                    ? 'border-brand-600 bg-brand-50/70 text-brand-950 shadow-sm'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                }`}
              >
                <Building2
                  className={`w-5 h-5 ${role === 'LANDLORD' ? 'text-brand-600' : 'text-slate-400'}`}
                />
                <div className="font-extrabold text-xs">I am a Landlord</div>
                <p className="text-[10px] text-slate-500 leading-snug">
                  List PGs, manage beds & collect rent
                </p>
              </button>
            </div>
          </div>

          {/* Mobile Phone Input */}
          <Input
            id="phone"
            name="tel"
            autoComplete="tel"
            label="2. Your Mobile Number (For UPI & Visit OTPs) *"
            type="tel"
            placeholder="e.g. 9876543210"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            icon={<Phone className="w-4 h-4" />}
            required
          />

          {/* Optional College or Business Name */}
          <Input
            id="organization"
            label={
              role === 'STUDENT'
                ? '3. Your College / University (Optional)'
                : '3. Your PG / Property Business Name (Optional)'
            }
            type="text"
            placeholder={
              role === 'STUDENT'
                ? 'e.g. PCTE, PAU, GNDEC (can be added later)'
                : 'e.g. Sharma Student Residency (can be added later)'
            }
            value={organization}
            onChange={(e) => setOrganization(e.target.value)}
            icon={
              role === 'STUDENT' ? (
                <GraduationCap className="w-4 h-4" />
              ) : (
                <Building2 className="w-4 h-4" />
              )
            }
          />

          {error && (
            <div className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-xl px-3.5 py-2.5 font-medium">
              {error}
            </div>
          )}

          <Button type="submit" loading={saving} className="w-full" size="lg">
            <span>
              Continue as {role === 'LANDLORD' ? 'Landlord / PG Owner' : 'Student'}
            </span>
            <ArrowRight className="w-4 h-4" />
          </Button>
        </form>

        <div className="pt-2 border-t border-slate-100 flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Your phone number is used only for verified UniNest Escrow handshakes.</span>
        </div>
      </div>
    </div>
  );
}
