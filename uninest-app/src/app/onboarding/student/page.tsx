'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input, Select } from '@/components/ui/Input';
import { STATES_DATA, COLLEGES_DATA } from '@/lib/locationData';
import {
  GraduationCap,
  Building2,
  Home,
  User,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Upload,
  FileText,
  DollarSign,
  Heart,
  Moon,
  BookOpen,
  Volume2,
} from 'lucide-react';

export default function StudentOnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const totalSteps = 5;
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [formData, setFormData] = useState({
    // Step 1: Personal Info
    fullName: 'Rahul Sharma',
    phone: '9876543210',
    email: 'rahul@uninest.demo',
    gender: 'MALE',
    dob: '2003-05-15',
    emergencyName: 'Rajesh Sharma',
    emergencyPhone: '9814012345',
    emergencyRel: 'Father',

    // Step 2: Academic Details
    state: 'Punjab',
    city: 'Ludhiana',
    collegeName: 'PCTE Institute',
    enrollmentNo: 'PCTE-BTECH-2024-042',
    course: 'B.Tech Computer Science',
    year: '3',

    // Step 3: Housing Preferences
    prefSharing: 'Double Sharing',
    prefLocation: 'Ferozepur Road / BRS Nagar',
    budgetMin: '5000',
    budgetMax: '7000',
    acPref: true,

    // Step 4: Lifestyle & Roommate Preferences
    sleepSchedule: 'Night Owl (12 AM - 7 AM)',
    studyHabits: 'Quiet focused study in room',
    cleanliness: '4',
    noisePref: 'Moderate noise acceptable',
    smokingPref: 'Non-smoker strictly',
    foodPref: 'Vegetarian',
    socialPref: 'Friendly & conversational',

    // Step 5: Document KYC
    documentType: 'Aadhaar Card',
    documentNo: '9876 5432 1098',
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
            role: 'STUDENT',
            email: formData.email,
            profileData: formData,
          }),
        });
        setSubmitted(true);
        setTimeout(() => {
          router.push('/student/search');
        }, 1500);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white p-4 md:p-8 flex items-center justify-center">
      <div className="max-w-3xl w-full space-y-6 animate-fade-in">
        {/* Header Branding */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            UniNest Student Onboarding
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">
            Complete Your Student Housing Profile
          </h1>
          <p className="text-sm text-slate-400">
            Set up your academic details, roommate preferences, and budget to get instant AI-matched PG listings.
          </p>
        </div>

        {/* Progress Counter & Bar */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
          <div className="flex items-center justify-between text-xs font-bold">
            <span className="text-slate-400">Step {step} of {totalSteps}: {
              step === 1 ? 'Personal Information' :
              step === 2 ? 'Academic Details' :
              step === 3 ? 'Housing & Budget' :
              step === 4 ? 'Lifestyle & Roommate Prefs' : 'KYC Document Verification'
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

        {/* Step Card Container */}
        <Card className="bg-slate-900 border border-slate-800 p-6 md:p-8 shadow-2xl space-y-6">
          {step === 1 && (
            <div className="space-y-4 animate-fade-in">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <User className="w-5 h-5 text-emerald-400" />
                Step 1: Personal & Emergency Contact
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Full Name</label>
                  <Input
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="bg-slate-950 border-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Phone Number</label>
                  <Input
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="bg-slate-950 border-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Email Address</label>
                  <Input
                    value={formData.email}
                    disabled
                    className="bg-slate-950/60 border-slate-800 text-slate-400"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Gender</label>
                  <Select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    className="bg-slate-950 border-slate-800"
                  >
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                    <option value="OTHER">Other</option>
                  </Select>
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Emergency Contact Name</label>
                  <Input
                    value={formData.emergencyName}
                    onChange={(e) => setFormData({ ...formData, emergencyName: e.target.value })}
                    placeholder="e.g. Rajesh Sharma"
                    className="bg-slate-950 border-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Emergency Phone & Relationship</label>
                  <div className="flex gap-2">
                    <Input
                      value={formData.emergencyPhone}
                      onChange={(e) => setFormData({ ...formData, emergencyPhone: e.target.value })}
                      className="bg-slate-950 border-slate-800"
                    />
                    <Select
                      value={formData.emergencyRel}
                      onChange={(e) => setFormData({ ...formData, emergencyRel: e.target.value })}
                      className="bg-slate-950 border-slate-800"
                    >
                      <option value="Father">Father</option>
                      <option value="Mother">Mother</option>
                      <option value="Guardian">Guardian</option>
                    </Select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4 animate-fade-in">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-indigo-400" />
                Step 2: Academic & Campus Location
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">State</label>
                  <Select
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    className="bg-slate-950 border-slate-800"
                  >
                    {STATES_DATA.map((s) => (
                      <option key={s.code} value={s.name}>{s.name}</option>
                    ))}
                  </Select>
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">City</label>
                  <Input value={formData.city} onChange={(e) => setFormData({ ...formData, city: e.target.value })} className="bg-slate-950 border-slate-800" />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">College / Institute Name</label>
                  <Select
                    value={formData.collegeName}
                    onChange={(e) => setFormData({ ...formData, collegeName: e.target.value })}
                    className="bg-slate-950 border-slate-800 text-emerald-400 font-bold"
                  >
                    {COLLEGES_DATA.map((c) => (
                      <option key={c.id} value={c.name}>{c.name}</option>
                    ))}
                  </Select>
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Student Roll / Enrollment No</label>
                  <Input
                    value={formData.enrollmentNo}
                    onChange={(e) => setFormData({ ...formData, enrollmentNo: e.target.value })}
                    className="bg-slate-950 border-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Degree / Course</label>
                  <Input
                    value={formData.course}
                    onChange={(e) => setFormData({ ...formData, course: e.target.value })}
                    className="bg-slate-950 border-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Year of Study</label>
                  <Select
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                    className="bg-slate-950 border-slate-800"
                  >
                    <option value="1">1st Year</option>
                    <option value="2">2nd Year</option>
                    <option value="3">3rd Year</option>
                    <option value="4">4th Year / Postgrad</option>
                  </Select>
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4 animate-fade-in">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Home className="w-5 h-5 text-emerald-400" />
                Step 3: Housing Preferences & Monthly Budget
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Preferred Room Sharing</label>
                  <Select
                    value={formData.prefSharing}
                    onChange={(e) => setFormData({ ...formData, prefSharing: e.target.value })}
                    className="bg-slate-950 border-slate-800"
                  >
                    <option value="Single Room">Single Room</option>
                    <option value="Double Sharing">Double Sharing (2-Sharing)</option>
                    <option value="Triple Sharing">Triple Sharing (3-Sharing)</option>
                  </Select>
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Preferred Locality</label>
                  <Input
                    value={formData.prefLocation}
                    onChange={(e) => setFormData({ ...formData, prefLocation: e.target.value })}
                    placeholder="e.g. Ferozepur Road / BRS Nagar"
                    className="bg-slate-950 border-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Monthly Rent Budget Min (₹)</label>
                  <Input
                    type="number"
                    value={formData.budgetMin}
                    onChange={(e) => setFormData({ ...formData, budgetMin: e.target.value })}
                    className="bg-slate-950 border-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Monthly Rent Budget Max (₹)</label>
                  <Input
                    type="number"
                    value={formData.budgetMax}
                    onChange={(e) => setFormData({ ...formData, budgetMax: e.target.value })}
                    className="bg-slate-950 border-slate-800"
                  />
                </div>
                <div className="col-span-2">
                  <label className="flex items-center gap-2 bg-slate-950 border border-slate-800 p-3 rounded-xl cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.acPref}
                      onChange={(e) => setFormData({ ...formData, acPref: e.target.checked })}
                      className="rounded accent-emerald-500 w-4 h-4"
                    />
                    <span className="text-slate-300 font-semibold">AC Room preferred</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4 animate-fade-in">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Heart className="w-5 h-5 text-amber-400" />
                Step 4: Lifestyle & Roommate Matching
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Sleep Schedule</label>
                  <Select
                    value={formData.sleepSchedule}
                    onChange={(e) => setFormData({ ...formData, sleepSchedule: e.target.value })}
                    className="bg-slate-950 border-slate-800"
                  >
                    <option value="Early Riser (6 AM - 10 PM)">Early Riser (6 AM - 10 PM)</option>
                    <option value="Night Owl (12 AM - 7 AM)">Night Owl (12 AM - 7 AM)</option>
                    <option value="Flexible">Flexible</option>
                  </Select>
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Food Preference</label>
                  <Select
                    value={formData.foodPref}
                    onChange={(e) => setFormData({ ...formData, foodPref: e.target.value })}
                    className="bg-slate-950 border-slate-800"
                  >
                    <option value="Vegetarian">Strictly Vegetarian</option>
                    <option value="Non-Vegetarian">Non-Vegetarian</option>
                    <option value="Eggetarian">Eggetarian</option>
                  </Select>
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Smoking Habit</label>
                  <Select
                    value={formData.smokingPref}
                    onChange={(e) => setFormData({ ...formData, smokingPref: e.target.value })}
                    className="bg-slate-950 border-slate-800"
                  >
                    <option value="Non-smoker strictly">Non-smoker strictly</option>
                    <option value="Occasional">Occasional</option>
                  </Select>
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Cleanliness Rating (1 to 5)</label>
                  <Select
                    value={formData.cleanliness}
                    onChange={(e) => setFormData({ ...formData, cleanliness: e.target.value })}
                    className="bg-slate-950 border-slate-800"
                  >
                    <option value="5">5/5 - Extremely neat & orderly</option>
                    <option value="4">4/5 - Clean & organized</option>
                    <option value="3">3/5 - Average</option>
                  </Select>
                </div>
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="space-y-4 animate-fade-in">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                Step 5: KYC Verification & College ID
              </h2>
              <div className="grid grid-cols-1 gap-4 text-xs">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Government ID Type</label>
                  <Select
                    value={formData.documentType}
                    onChange={(e) => setFormData({ ...formData, documentType: e.target.value })}
                    className="bg-slate-950 border-slate-800"
                  >
                    <option value="Aadhaar Card">Aadhaar Card</option>
                    <option value="Passport">Passport</option>
                    <option value="Driving License">Driving License</option>
                  </Select>
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">ID Document Number</label>
                  <Input
                    value={formData.documentNo}
                    onChange={(e) => setFormData({ ...formData, documentNo: e.target.value })}
                    className="bg-slate-950 border-slate-800"
                  />
                </div>
                <div className="border-2 border-dashed border-slate-800 hover:border-emerald-500/50 rounded-2xl p-6 text-center bg-slate-950/60 cursor-pointer">
                  <Upload className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                  <p className="font-bold text-white text-xs">Upload Student ID Card / Admission Slip</p>
                  <p className="text-[11px] text-slate-400 mt-1">PNG, JPG or PDF up to 5MB (Simulated Verification)</p>
                  <span className="inline-block mt-3 px-3 py-1 rounded bg-emerald-500/20 text-emerald-300 font-bold text-[11px]">
                    ✓ PCTE_ID_CARD_2024.pdf Attached
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-800">
            {step > 1 ? (
              <Button
                onClick={handleBack}
                variant="outline"
                className="border-slate-700 hover:bg-slate-800 text-white flex items-center gap-1.5 text-xs font-bold"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </Button>
            ) : (
              <div />
            )}

            <Button
              onClick={handleNext}
              disabled={loading || submitted}
              className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-extrabold px-6 py-2.5 rounded-xl flex items-center gap-2 text-xs shadow-lg shadow-emerald-500/20"
            >
              {submitted ? (
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" /> Profile Verified! Redirecting...
                </span>
              ) : step === totalSteps ? (
                <span>Submit & Search PGs</span>
              ) : (
                <span className="flex items-center gap-1">
                  Save & Continue <ArrowRight className="w-4 h-4" />
                </span>
              )}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
