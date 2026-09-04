'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input, Select } from '@/components/ui/Input';
import {
  GraduationCap,
  Building,
  Users,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Phone,
  Mail,
} from 'lucide-react';

export default function CollegeOnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const totalSteps = 4;
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [formData, setFormData] = useState({
    collegeName: 'PCTE Institute',
    address: 'Ferozepur Road, Baddowal',
    city: 'Ludhiana',
    state: 'Punjab',
    contactPerson: 'Dr. Gurpreet Singh',
    contactEmail: 'housing@pcte.edu.in',
    contactPhone: '0161-2888500',
    housingCoordinator: 'Prof. Simranjit Kaur',
    totalStudents: '3200',
    hostelCapacity: '600',
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
            role: 'COLLEGE',
            email: 'pcte@uninest.demo',
            profileData: formData,
          }),
        });
        setSubmitted(true);
        setTimeout(() => {
          router.push('/college/dashboard');
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
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-bold">
            <GraduationCap className="w-3.5 h-3.5" />
            University / Campus Portal Partner
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">
            Institutional Housing Onboarding
          </h1>
          <p className="text-sm text-slate-400">
            Set up campus boundaries, off-campus housing guidelines, and student housing coordinator portal.
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
          <div className="flex items-center justify-between text-xs font-bold">
            <span className="text-slate-400">Step {step} of {totalSteps}</span>
            <span className="text-indigo-400 font-extrabold text-sm">{completionPercent}% Complete</span>
          </div>
          <div className="w-full bg-slate-950 rounded-full h-2.5 overflow-hidden border border-slate-800">
            <div
              className="bg-gradient-to-r from-indigo-500 to-emerald-500 h-full transition-all duration-500 rounded-full"
              style={{ width: `${completionPercent}%` }}
            />
          </div>
        </div>

        <Card className="bg-slate-900 border border-slate-800 p-6 md:p-8 shadow-2xl space-y-6">
          {step === 1 && (
            <div className="space-y-4 animate-fade-in">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Building className="w-5 h-5 text-indigo-400" />
                Step 1: Campus Institution Info
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Institution Name</label>
                  <Input value={formData.collegeName} onChange={(e) => setFormData({ ...formData, collegeName: e.target.value })} className="bg-slate-950 border-slate-800 font-bold text-emerald-400" />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Campus Address</label>
                  <Input value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} className="bg-slate-950 border-slate-800" />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">City</label>
                  <Input value={formData.city} onChange={(e) => setFormData({ ...formData, city: e.target.value })} className="bg-slate-950 border-slate-800" />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">State</label>
                  <Input value={formData.state} onChange={(e) => setFormData({ ...formData, state: e.target.value })} className="bg-slate-950 border-slate-800" />
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4 animate-fade-in">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Phone className="w-5 h-5 text-emerald-400" />
                Step 2: Housing Coordinator & Contacts
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Dean / Contact Person</label>
                  <Input value={formData.contactPerson} onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })} className="bg-slate-950 border-slate-800" />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Housing Coordinator</label>
                  <Input value={formData.housingCoordinator} onChange={(e) => setFormData({ ...formData, housingCoordinator: e.target.value })} className="bg-slate-950 border-slate-800" />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Official Email</label>
                  <Input value={formData.contactEmail} onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })} className="bg-slate-950 border-slate-800" />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Contact Phone</label>
                  <Input value={formData.contactPhone} onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })} className="bg-slate-950 border-slate-800" />
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4 animate-fade-in">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-amber-400" />
                Step 3: Housing Demand & On-Campus Capacity
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Total Enrolled Students</label>
                  <Input type="number" value={formData.totalStudents} onChange={(e) => setFormData({ ...formData, totalStudents: e.target.value })} className="bg-slate-950 border-slate-800" />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">On-Campus Hostel Capacity</label>
                  <Input type="number" value={formData.hostelCapacity} onChange={(e) => setFormData({ ...formData, hostelCapacity: e.target.value })} className="bg-slate-950 border-slate-800" />
                </div>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4 animate-fade-in text-center">
              <CheckCircle2 className="w-12 h-12 text-indigo-400 mx-auto" />
              <h2 className="text-xl font-bold text-white">Institutional Partnership Ready</h2>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                PCTE Institute portal setup completes with verified off-campus PGs linked within a 5 km radius.
              </p>
            </div>
          )}

          <div className="flex items-center justify-between pt-4 border-t border-slate-800">
            {step > 1 ? (
              <Button onClick={() => setStep(step - 1)} variant="outline" className="border-slate-700 hover:bg-slate-800 text-white text-xs font-bold">
                <ArrowLeft className="w-4 h-4 mr-1" /> Back
              </Button>
            ) : <div />}

            <Button onClick={handleNext} disabled={loading || submitted} className="bg-indigo-500 hover:bg-indigo-600 text-white font-extrabold px-6 py-2.5 rounded-xl text-xs">
              {submitted ? 'Completed! Redirecting...' : step === totalSteps ? 'Activate Portal' : 'Save & Continue'}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
