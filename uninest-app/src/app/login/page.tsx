'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { login } from '@/lib/auth/actions';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Building2, Mail, Lock, ArrowRight } from 'lucide-react';

const demoAccounts = [
  { email: 'rahul@uninest.demo', password: 'demo123', role: 'Student', name: 'Rahul Sharma' },
  { email: 'landlord@uninest.demo', password: 'demo123', role: 'Landlord', name: 'Vikram Singh' },
  { email: 'admin@uninest.demo', password: 'demo123', role: 'Admin', name: 'UniNest Admin' },
  { email: 'pcte@uninest.demo', password: 'demo123', role: 'College', name: 'PCTE Admin' },
  { email: 'provider@uninest.demo', password: 'demo123', role: 'Provider', name: 'QuickFix Services' },
];

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(email, password);
    if (result.success) {
      router.push('/');
      router.refresh();
    } else {
      setError(result.error || 'Login failed');
    }
    setLoading(false);
  }

  async function handleDemoLogin(account: typeof demoAccounts[0]) {
    setEmail(account.email);
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
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
              <Building2 className="w-7 h-7 text-white" />
            </div>
            <span className="text-3xl font-bold text-white">UniNest</span>
          </div>
          <h1 className="text-4xl lg:text-5xl font-bold text-white leading-tight mb-4">
            Student Housing,<br />
            <span className="text-brand-200">Without the Headache.</span>
          </h1>
          <p className="text-lg text-brand-100 max-w-md leading-relaxed">
            From finding a PG to living there — all in one place. Verified listings, digital agreements, 
            automated rent, and a complete rental lifecycle platform.
          </p>
          <div className="mt-8 flex items-center gap-6 text-sm text-brand-200">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-brand-300 rounded-full" />
              <span>84 Verified PGs</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-brand-300 rounded-full" />
              <span>720+ Students</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-brand-300 rounded-full" />
              <span>Ludhiana</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-6 bg-surface-secondary">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="flex items-center gap-2.5 mb-8 lg:hidden">
            <div className="w-10 h-10 bg-brand-600 rounded-xl flex items-center justify-center">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-bold text-text-primary">UniNest</span>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-text-primary">Welcome back</h2>
            <p className="text-text-secondary mt-1">Sign in to your account to continue.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email"
              type="email"
              placeholder="you@example.com"
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
            {error && (
              <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                {error}
              </div>
            )}
            <Button type="submit" loading={loading} className="w-full" size="lg">
              Sign In
              <ArrowRight className="w-4 h-4" />
            </Button>
          </form>

          {/* Demo Accounts */}
          <div className="mt-8">
            <div className="relative mb-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-surface-secondary px-3 text-text-tertiary font-medium">DEMO ACCOUNTS</span>
              </div>
            </div>
            <div className="space-y-2">
              {demoAccounts.map(account => (
                <button
                  key={account.email}
                  onClick={() => handleDemoLogin(account)}
                  disabled={loading}
                  className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg border border-border bg-surface hover:bg-surface-tertiary transition-colors text-left disabled:opacity-50"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white text-xs font-bold">
                    {account.name[0]}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-text-primary">{account.name}</p>
                    <p className="text-xs text-text-tertiary">{account.email}</p>
                  </div>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-surface-tertiary text-text-secondary">
                    {account.role}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <p className="text-xs text-text-tertiary text-center mt-6">
            Demo mode — all integrations are simulated for demonstration.
          </p>
        </div>
      </div>
    </div>
  );
}
