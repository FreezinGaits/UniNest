'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import {
  Wrench,
  CheckCircle2,
  ArrowLeft,
  Sparkles,
  ShieldCheck,
  Zap,
} from 'lucide-react';

export default function ProviderOnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const totalSteps = 4;
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [formData, setFormData] = useState({
    businessName: 'QuickFix Services',
    ownerName: 'Harpreet Singh',
    phone: '9898989810',
    email: 'provider@uninest.demo',
    coverageArea: 'Ludhiana City & Vicinity (Ferozepur Rd, BRS Nagar)',
    coverageRadius: '12.0',
    rateCard: 'Plumbing visit: ₹299, AC Servicing: ₹499, Deep Cleaning: ₹999',
    categories: ['Plumbing', 'AC Repair', 'Deep Cleaning', 'Electrician', 'RO Service'],
  });

  const completionPercent = Math.round((step / totalSteps) * 100);

  const handleNext = async () => {
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      setLoading(true);
      try {
        await fetch('/api/user/onboarding', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            role: 'PROVIDER',
            email: formData.email,
            profileData: formData,
          }),
        });
        setSubmitted(true);
        setTimeout(() => {
          router.push('/provider/dashboard');
        }, 1500);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white p-4 md:p-8 flex items-center justify-center">
      <div className="max-w-3xl w-full space-y-6 animate-fade-in">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold">
            <Wrench className="w-3.5 h-3.5" />
            Service Provider Registration
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">
            Register Student Services Business
          </h1>
          <p className="text-sm text-slate-400">
            Offer deep cleaning, AC maintenance, plumbing, & repairs directly to student housing.
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
          <div className="flex items-center justify-between text-xs font-bold">
            <span className="text-slate-400">Step {step} of {totalSteps}</span>
            <span className="text-amber-400 font-extrabold text-sm">{completionPercent}% Complete</span>
          </div>
          <div className="w-full bg-slate-950 rounded-full h-2.5 overflow-hidden border border-slate-800">
            <div
              className="bg-gradient-to-r from-amber-500 to-emerald-500 h-full transition-all duration-500 rounded-full"
              style={{ width: `${completionPercent}%` }}
            />
          </div>
        </div>

        <Card className="bg-slate-900 border border-slate-800 p-6 md:p-8 shadow-2xl space-y-6">
          {step === 1 && (
            <div className="space-y-4 animate-fade-in">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Wrench className="w-5 h-5 text-amber-400" />
                Step 1: Business Details
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Business Name</label>
                  <Input value={formData.businessName} onChange={(e) => setFormData({ ...formData, businessName: e.target.value })} className="bg-slate-950 border-slate-800" />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Owner Name</label>
                  <Input value={formData.ownerName} onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })} className="bg-slate-950 border-slate-800" />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Phone Number</label>
                  <Input value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="bg-slate-950 border-slate-800" />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Coverage Area</label>
                  <Input value={formData.coverageArea} onChange={(e) => setFormData({ ...formData, coverageArea: e.target.value })} className="bg-slate-950 border-slate-800" />
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4 animate-fade-in">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Zap className="w-5 h-5 text-emerald-400" />
                Step 2: Select Service Categories
              </h2>
              <div className="grid grid-cols-2 gap-3 text-xs">
                {['Plumbing', 'AC Repair', 'Deep Cleaning', 'Electrician', 'RO Service', 'Pest Control'].map((cat) => (
                  <div key={cat} className="bg-slate-950 border border-slate-800 p-3 rounded-xl flex items-center gap-2 font-bold text-slate-200">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    {cat}
                  </div>
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4 animate-fade-in">
              <h2 className="text-xl font-bold text-white">Step 3: Service Rate Card</h2>
              <div className="text-xs">
                <label className="block text-slate-300 font-semibold mb-1">Standard Rate Card Details</label>
                <textarea
                  value={formData.rateCard}
                  onChange={(e) => setFormData({ ...formData, rateCard: e.target.value })}
                  rows={4}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4 animate-fade-in text-center">
              <ShieldCheck className="w-12 h-12 text-emerald-400 mx-auto" />
              <h2 className="text-xl font-bold text-white">Verification Complete</h2>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                QuickFix Services is registered and ready to receive service orders from student residents.
              </p>
            </div>
          )}

          <div className="flex items-center justify-between pt-4 border-t border-slate-800">
            {step > 1 ? (
              <Button onClick={() => setStep(step - 1)} variant="outline" className="border-slate-700 hover:bg-slate-800 text-white text-xs font-bold">
                <ArrowLeft className="w-4 h-4 mr-1" /> Back
              </Button>
            ) : <div />}

            <Button onClick={handleNext} disabled={loading || submitted} className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold px-6 py-2.5 rounded-xl text-xs">
              {submitted ? 'Verified! Redirecting...' : step === totalSteps ? 'Activate Profile' : 'Save & Continue'}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
