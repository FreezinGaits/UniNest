'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { login } from '@/lib/auth/actions';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Building2, Mail, Lock, ArrowRight, User, Phone, ShieldCheck, Scale } from 'lucide-react';

const portalQuickAccess = [
  { email: 'rahul@uninest.demo', displayEmail: 'rahul.sharma@pcte.edu.in', password: 'demo123', role: 'Student', name: 'Rahul Sharma' },
  { email: 'landlord@uninest.demo', displayEmail: 'vikram@passiresidency.in', password: 'demo123', role: 'Landlord', name: 'Vikram Singh' },
  { email: 'admin@uninest.demo', displayEmail: 'nodal.escrow@uninest.in', password: 'demo123', role: 'Escrow Admin', name: 'UniNest Escrow Officer' },
  { email: 'pcte@uninest.demo', displayEmail: 'housing.cell@pcte.edu.in', password: 'demo123', role: 'College Partner', name: 'PCTE Housing Cell' },
  { email: 'provider@uninest.demo', displayEmail: 'dispatch@quickfix.in', password: 'demo123', role: 'Vendor Partner', name: 'QuickFix Maintenance' },
];

export default function LoginPage() {
  const [authMode, setAuthMode] = useState<'SIGN_IN' | 'REGISTER'>('SIGN_IN');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedRole, setSelectedRole] = useState<'STUDENT' | 'LANDLORD'>('STUDENT');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [legalAccepted, setLegalAccepted] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!legalAccepted) {
      setError('Please accept the UniNest Terms of Use, DPDP Privacy Policy & Escrow Charter to proceed.');
      return;
    }
    setError('');
    setLoading(true);

    const targetEmail =
      authMode === 'REGISTER'
        ? selectedRole === 'LANDLORD'
          ? 'landlord@uninest.demo'
          : 'rahul@uninest.demo'
        : email;
    const targetPass = authMode === 'REGISTER' ? 'demo123' : password;

    const result = await login(targetEmail, targetPass);
    if (result.success) {
      router.push(selectedRole === 'LANDLORD' && authMode === 'REGISTER' ? '/landlord/dashboard' : '/');
      router.refresh();
    } else {
      setError(result.error || 'Authentication failed. Please check your credentials.');
    }
    setLoading(false);
  }

  async function handleQuickAccess(account: typeof portalQuickAccess[0]) {
    setEmail(account.displayEmail);
    setPassword(account.password);
    setError('');
    setLoading(true);

    const result = await login(account.email, account.password);
    if (result.success) {
      router.push('/');
      router.refresh();
    } else {
      setError(result.error || 'Login failed');
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen flex">
      {/* Left side - Brand */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-brand-600 via-brand-700 to-brand-900 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-64 h-64 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-40 right-20 w-96 h-96 bg-brand-300 rounded-full blur-3xl" />
        </div>
        <div className="relative z-10 flex flex-col justify-center px-12 lg:px-16">
          <Link href="/" className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
              <Building2 className="w-7 h-7 text-white" />
            </div>
            <span className="text-3xl font-bold text-white">UniNest</span>
          </Link>
          <h1 className="text-4xl lg:text-5xl font-bold text-white leading-tight mb-4">
            Student Housing,<br />
            <span className="text-brand-200">Protected by Escrow.</span>
          </h1>
          <p className="text-lg text-brand-100 max-w-md leading-relaxed">
            From finding a verified PG to signing your 11-month tripartite Leave & License agreement — protected by our Two-Stage OTP Handshake Escrow.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-4 text-xs font-semibold text-brand-100">
            <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-full border border-white/15">
              <ShieldCheck className="w-4 h-4 text-emerald-300" />
              <span>Two-Stage OTP Escrow</span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-full border border-white/15">
              <Scale className="w-4 h-4 text-brand-200" />
              <span>Sec 10A IT Act E-Sign</span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-full border border-white/15">
              <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
              <span>Ludhiana Hub (PCTE / PAU / GNDEC)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Login / Register Form */}
      <div className="flex-1 flex items-center justify-center p-6 bg-surface-secondary">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="flex items-center justify-between mb-6 lg:hidden">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-10 h-10 bg-brand-600 rounded-xl flex items-center justify-center">
                <Building2 className="w-5 h-5 text-white" />
              </div>
              <span className="text-2xl font-bold text-text-primary">UniNest</span>
            </Link>
            <Link href="/legal" className="text-xs font-semibold text-brand-600 hover:underline">
              Legal & Escrow Policy
            </Link>
          </div>

          {/* Mode Toggle */}
          <div className="grid grid-cols-2 gap-1.5 p-1 bg-surface-tertiary rounded-xl border border-border mb-6">
            <button
              type="button"
              onClick={() => { setAuthMode('SIGN_IN'); setError(''); }}
              className={`py-2 text-xs font-bold rounded-lg transition-all ${
                authMode === 'SIGN_IN' ? 'bg-surface text-text-primary shadow-sm' : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => { setAuthMode('REGISTER'); setError(''); }}
              className={`py-2 text-xs font-bold rounded-lg transition-all ${
                authMode === 'REGISTER' ? 'bg-surface text-text-primary shadow-sm' : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              Create Account
            </button>
          </div>

          <div className="mb-6">
            <h2 className="text-2xl font-bold text-text-primary">
              {authMode === 'SIGN_IN' ? 'Sign in to UniNest' : 'Create your UniNest Account'}
            </h2>
            <p className="text-xs text-text-secondary mt-1">
              {authMode === 'SIGN_IN'
                ? 'Access your verified student housing & escrow dashboard.'
                : 'Register as a Student or Verified Property Owner in Ludhiana.'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3.5">
            {authMode === 'REGISTER' && (
              <>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedRole('STUDENT')}
                    className={`py-2.5 px-3 rounded-lg border text-xs font-bold transition-all ${
                      selectedRole === 'STUDENT'
                        ? 'border-brand-600 bg-brand-50 text-brand-700'
                        : 'border-border bg-surface text-text-secondary'
                    }`}
                  >
                    🎓 I am a Student
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedRole('LANDLORD')}
                    className={`py-2.5 px-3 rounded-lg border text-xs font-bold transition-all ${
                      selectedRole === 'LANDLORD'
                        ? 'border-brand-600 bg-brand-50 text-brand-700'
                        : 'border-border bg-surface text-text-secondary'
                    }`}
                  >
                    🏢 I am a PG Owner
                  </button>
                </div>
                <Input
                  label="Full Legal Name (As per Aadhaar)"
                  type="text"
                  placeholder="Rahul Sharma"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  icon={<User className="w-4 h-4" />}
                  required
                />
                <Input
                  label="Mobile Number (UPI Linked)"
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  icon={<Phone className="w-4 h-4" />}
                  required
                />
              </>
            )}

            <Input
              label="Email Address"
              type="email"
              placeholder="you@college.edu.in"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              icon={<Mail className="w-4 h-4" />}
              required
            />
            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              icon={<Lock className="w-4 h-4" />}
              required
            />

            {/* Mandatory Legal Agreement Consent */}
            <label className="flex items-start gap-2.5 pt-1 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={legalAccepted}
                onChange={(e) => setLegalAccepted(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500"
              />
              <span className="text-[11px] text-text-secondary leading-relaxed">
                I agree to the{' '}
                <Link href="/legal?doc=terms" className="text-brand-600 font-semibold hover:underline">
                  Platform Terms of Use
                </Link>
                ,{' '}
                <Link href="/legal?doc=escrow" className="text-brand-600 font-semibold hover:underline">
                  Two-Stage OTP Escrow Charter
                </Link>{' '}
                &{' '}
                <Link href="/legal?doc=privacy" className="text-brand-600 font-semibold hover:underline">
                  DPDP Act 2023 Privacy Notice
                </Link>
                .
              </span>
            </label>

            {error && (
              <div className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2 font-medium">
                {error}
              </div>
            )}
            <Button type="submit" loading={loading} className="w-full" size="lg">
              {authMode === 'SIGN_IN' ? 'Sign In to Portal' : 'Create Verified Account'}
              <ArrowRight className="w-4 h-4" />
            </Button>
          </form>

          {/* Verified Role Quick-Access */}
          <div className="mt-7">
            <div className="relative mb-3.5">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-[10px]">
                <span className="bg-surface-secondary px-3 text-text-tertiary font-bold uppercase tracking-wider">
                  Verified Role Portals (One-Click Access)
                </span>
              </div>
            </div>
            <div className="space-y-1.5">
              {portalQuickAccess.map(account => (
                <button
                  key={account.email}
                  onClick={() => handleQuickAccess(account)}
                  disabled={loading}
                  className="w-full flex items-center gap-3 px-3.5 py-2 rounded-lg border border-border bg-surface hover:bg-surface-tertiary transition-colors text-left disabled:opacity-50"
                >
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-white text-xs font-bold">
                    {account.name[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-text-primary truncate">{account.name}</p>
                    <p className="text-[11px] text-text-tertiary truncate">{account.displayEmail}</p>
                  </div>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-surface-tertiary text-text-secondary">
                    {account.role}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-border flex items-center justify-between text-[11px] text-text-tertiary">
            <span>Protected by Indian Contract Act, 1872</span>
            <Link href="/legal" className="font-semibold text-brand-600 hover:underline">
              Legal Compliance Center →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
