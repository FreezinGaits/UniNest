'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input, Select } from '@/components/ui/Input';
import { STATES_DATA } from '@/lib/locationData';
import {
  Building2,
  User,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  FileText,
  DollarSign,
  MapPin,
  Bed,
  Plus,
} from 'lucide-react';

export default function LandlordOnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const totalSteps = 5;
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [formData, setFormData] = useState({
    fullName: '',
    businessName: '',
    phone: '',
    email: '',
    address: '',
    city: 'Ludhiana',
    state: 'Punjab',
    panNo: '',
    gstNo: '',
    bankAccount: '',
    ifscCode: '',
    propertyName: '',
    propertyType: 'PG',
    locality: 'Ferozepur Road',
    baseRent: '',
    deposit: '',
    wifiCharge: '',
    foodCharge: '',
    maintenanceCharge: '',
    electricityRate: '',
  });

  const [fileName, setFileName] = useState('');

  useEffect(() => {
    fetch('/api/profile')
      .then((res) => res.json())
      .then((data) => {
        if (data?.user) {
          setFormData((prev) => ({
            ...prev,
            fullName: data.user.name || prev.fullName,
            email: data.user.email || prev.email,
            phone: data.user.phone || prev.phone,
            businessName: data.user.companyName || prev.businessName,
          }));
        }
      })
      .catch(() => {});
  }, []);

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
            role: 'LANDLORD',
            email: formData.email,
            propertyName: formData.propertyName,
            profileData: formData,
          }),
        });
        setSubmitted(true);
        setTimeout(() => {
          router.push('/landlord/dashboard');
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
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
            <Building2 className="w-3.5 h-3.5" />
            Landlord Partner Registration
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">
            Register Your PG / Student Property
          </h1>
          <p className="text-sm text-slate-400">
            List properties, setup room sharing & rent breakdown, and get verified student tenants.
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
          <div className="flex items-center justify-between text-xs font-bold">
            <span className="text-slate-400">Step {step} of {totalSteps}: {
              step === 1 ? 'Landlord Profile' :
              step === 2 ? 'Tax & Banking Info' :
              step === 3 ? 'Property Registration' :
              step === 4 ? 'Rental & Utility Cost Config' : 'Ownership Proof Upload'
            }</span>
            <span className="text-emerald-400 font-extrabold text-sm">{completionPercent}% Complete</span>
          </div>
          <div className="w-full bg-slate-950 rounded-full h-2.5 overflow-hidden border border-slate-800">
            <div
              className="bg-gradient-to-r from-emerald-500 to-indigo-500 h-full transition-all duration-500 rounded-full"
              style={{ width: `${completionPercent}%` }}
            />
          </div>
        </div>

        <Card className="bg-slate-900 border border-slate-800 p-6 md:p-8 shadow-2xl space-y-6">
          {step === 1 && (
            <div className="space-y-4 animate-fade-in">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <User className="w-5 h-5 text-emerald-400" />
                Step 1: Landlord / Business Entity Details
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Owner Name</label>
                  <Input value={formData.fullName} onChange={(e) => setFormData({ ...formData, fullName: e.target.value })} className="bg-slate-950 border-slate-800" />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Business Name / Entity</label>
                  <Input value={formData.businessName} onChange={(e) => setFormData({ ...formData, businessName: e.target.value })} className="bg-slate-950 border-slate-800" />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Phone Number</label>
                  <Input value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="bg-slate-950 border-slate-800" />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Email</label>
                  <Input
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    disabled={Boolean(formData.email && formData.email.includes('@'))}
                    className="bg-slate-950/60 border-slate-800 text-slate-400"
                  />
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4 animate-fade-in">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-400" />
                Step 2: Tax & Bank Payout Details
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">PAN Card Number</label>
                  <Input value={formData.panNo} onChange={(e) => setFormData({ ...formData, panNo: e.target.value })} className="bg-slate-950 border-slate-800" />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">GST Number (Optional)</label>
                  <Input value={formData.gstNo} onChange={(e) => setFormData({ ...formData, gstNo: e.target.value })} className="bg-slate-950 border-slate-800" />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Bank Account Number</label>
                  <Input value={formData.bankAccount} onChange={(e) => setFormData({ ...formData, bankAccount: e.target.value })} className="bg-slate-950 border-slate-800" />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">IFSC Code</label>
                  <Input value={formData.ifscCode} onChange={(e) => setFormData({ ...formData, ifscCode: e.target.value })} className="bg-slate-950 border-slate-800" />
                </div>
                <div>
                  <Input
                    label="City"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    placeholder="e.g. Ludhiana"
                    className="bg-slate-950 border-slate-800"
                  />
                </div>
                <div>
                  <Input
                    label="Full Street Address"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="Plot 42, Opp. PCTE Campus, Ferozepur Road"
                    className="bg-slate-950 border-slate-800"
                  />
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4 animate-fade-in">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Building2 className="w-5 h-5 text-emerald-400" />
                Step 3: Property Info & Locality
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Property Name</label>
                  <Input value={formData.propertyName} onChange={(e) => setFormData({ ...formData, propertyName: e.target.value })} className="bg-slate-950 border-slate-800" />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Property Type</label>
                  <Select value={formData.propertyType} onChange={(e) => setFormData({ ...formData, propertyType: e.target.value })} className="bg-slate-950 border-slate-800">
                    <option value="PG">PG Accommodation</option>
                    <option value="HOSTEL">Student Hostel</option>
                    <option value="FLAT">Student Flat</option>
                  </Select>
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Locality</label>
                  <Select value={formData.locality} onChange={(e) => setFormData({ ...formData, locality: e.target.value })} className="bg-slate-950 border-slate-800">
                    <option value="Ferozepur Road">Ferozepur Road</option>
                    <option value="BRS Nagar">BRS Nagar</option>
                    <option value="Sarabha Nagar">Sarabha Nagar</option>
                    <option value="Model Town">Model Town</option>
                    <option value="Rajguru Nagar">Rajguru Nagar</option>
                    <option value="Civil Lines">Civil Lines</option>
                  </Select>
                </div>
                <div>
                  <Input
                    label="City"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    placeholder="e.g. Ludhiana"
                    className="bg-slate-950 border-slate-800"
                  />
                </div>
                <div className="md:col-span-2">
                  <Input
                    label="Full Street Address"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="Plot 42, Opp. PCTE Campus, Ferozepur Road"
                    className="bg-slate-950 border-slate-800"
                  />
                </div>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4 animate-fade-in">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-emerald-400" />
                Step 4: True Cost Breakdown Configuration
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Base Room Rent (₹/mo)</label>
                  <Input type="number" value={formData.baseRent} onChange={(e) => setFormData({ ...formData, baseRent: e.target.value })} className="bg-slate-950 border-slate-800" />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Security Deposit (₹)</label>
                  <Input type="number" value={formData.deposit} onChange={(e) => setFormData({ ...formData, deposit: e.target.value })} className="bg-slate-950 border-slate-800" />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Food Charge (₹/mo)</label>
                  <Input type="number" value={formData.foodCharge} onChange={(e) => setFormData({ ...formData, foodCharge: e.target.value })} className="bg-slate-950 border-slate-800" />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Electricity Rate (₹/Unit Submeter)</label>
                  <Input type="number" value={formData.electricityRate} onChange={(e) => setFormData({ ...formData, electricityRate: e.target.value })} className="bg-slate-950 border-slate-800" />
                </div>
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="space-y-4 animate-fade-in text-center">
              <ShieldCheck className="w-12 h-12 text-emerald-400 mx-auto" />
              <h2 className="text-xl font-bold text-white">
                Step 5: Verification & Verification Request
              </h2>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Submit your electricity bill and property ownership documents to receive the official <strong className="text-emerald-400">UniNest Verified</strong> badge.
              </p>
              <div className="border-2 border-dashed border-slate-800 hover:border-emerald-500/50 rounded-2xl p-6 text-center bg-slate-950/60 relative max-w-md mx-auto mt-4 cursor-pointer">
                <input
                  type="file"
                  accept=".pdf,.jpg,.png"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  onChange={(e) => setFileName(e.target.files?.[0]?.name || '')}
                />
                <p className="font-bold text-white text-xs mb-2">Upload Property Document</p>
                <div className={`inline-block px-3 py-1 rounded text-[11px] font-bold ${fileName ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300' : 'bg-slate-800 text-slate-300'}`}>
                  {fileName ? `✓ ${fileName} Uploaded` : 'No file selected'}
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between pt-4 border-t border-slate-800">
            {step > 1 ? (
              <Button onClick={() => setStep(step - 1)} variant="outline" className="border-slate-700 hover:bg-slate-800 text-white text-xs font-bold">
                <ArrowLeft className="w-4 h-4 mr-1" /> Back
              </Button>
            ) : <div />}

            <Button onClick={handleNext} disabled={loading || submitted} className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-extrabold px-6 py-2.5 rounded-xl text-xs">
              {submitted ? 'Verified! Redirecting...' : step === totalSteps ? 'Submit Property' : 'Save & Continue'}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
