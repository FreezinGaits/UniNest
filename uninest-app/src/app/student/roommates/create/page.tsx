'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft, CheckCircle2, ChevronRight, Sparkles, User, MapPin, DollarSign,
  Moon, BookOpen, Sun, ShieldCheck, Lock, Eye, Check, Sliders
} from 'lucide-react';
import { Card, Button, Input, Badge } from '@/components/ui/Shared';

export default function CreateRoommateRequestPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: 'Rahul Sharma',
    gender: 'Male',
    collegeName: 'PCTE Institute of Technology',
    course: 'B.Tech CSE',
    year: 2,
    city: 'Ludhiana',
    locality: 'Ferozepur Road',
    radiusKm: 3.0,
    budgetMin: 5000,
    budgetMax: 7000,
    roomType: 'Double Sharing',
    moveInDate: '2026-09-15',
    genderPreference: 'Same Gender',
    sleepSchedule: 'Night Owl',
    studySchedule: 'Late Night',
    noisePreference: 'Quiet Room',
    cleanlinessPreference: 'Very Neat',
    smokingPreference: 'Non-Smoker',
    foodPreference: 'Vegetarian',
    socialPreference: 'Balanced',
    visitorPreference: 'Weekend Only',
    petPreference: 'No Pets',
    acPreference: true,
    coolerPreference: false,
    heaterPreference: false,
    wifiPreference: true,
    foodProvidedPreference: true,
    attachedBathroomPreference: true,
    furniturePreference: true,
    description: 'Focused on studies, clean, non-smoker and prefer a quiet room near PCTE campus.',
    showFirstName: true,
    showCollege: true,
    showCourse: true,
    showBudget: true,
    showLifestyle: true,
  });

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    if (step < 6) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/student/roommates/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (data.success) {
        alert('🎉 Roommate Request Published Successfully!');
        router.push('/student/roommates');
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (err: any) {
      console.error('Failed to submit roommate request:', err);
      alert('Failed to publish request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Navigation & Title */}
        <div className="flex items-center justify-between">
          <Link href="/student/roommates">
            <Button variant="secondary" className="bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 text-xs py-2 rounded-xl">
              <ArrowLeft className="w-4 h-4 mr-1 text-slate-600" />
              Back to Roommates
            </Button>
          </Link>
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            Step {step} of 6
          </span>
        </div>

        {/* Header Banner */}
        <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-700 p-6 md:p-8 rounded-2xl text-white shadow-md">
          <h1 className="text-2xl md:text-3xl font-extrabold text-white">
            Create Your Roommate Profile
          </h1>
          <p className="text-xs md:text-sm text-emerald-100 mt-1">
            Answer a few quick questions to match with verified students near PCTE & GNDEC with similar study habits and budget.
          </p>

          {/* Stepper Progress Bar */}
          <div className="mt-6">
            <div className="w-full bg-white/20 h-2 rounded-full overflow-hidden">
              <div
                className="bg-white h-full transition-all duration-500 rounded-full"
                style={{ width: `${(step / 6) * 100}%` }}
              />
            </div>
            <div className="flex justify-between text-[11px] text-emerald-100 mt-2 font-semibold">
              <span className={step >= 1 ? 'text-white font-bold' : ''}>1. Basic</span>
              <span className={step >= 2 ? 'text-white font-bold' : ''}>2. Location</span>
              <span className={step >= 3 ? 'text-white font-bold' : ''}>3. Budget</span>
              <span className={step >= 4 ? 'text-white font-bold' : ''}>4. Lifestyle</span>
              <span className={step >= 5 ? 'text-white font-bold' : ''}>5. Amenities</span>
              <span className={step >= 6 ? 'text-white font-bold' : ''}>6. Bio & Privacy</span>
            </div>
          </div>
        </div>

        {/* Wizard Form Card */}
        <div className="bg-white border border-slate-200 p-6 md:p-8 rounded-2xl shadow-sm space-y-6">
          <form onSubmit={step === 6 ? handleSubmit : (e) => e.preventDefault()}>
            {/* STEP 1: Basic & College Info */}
            {step === 1 && (
              <div className="space-y-5 animate-in fade-in">
                <h2 className="text-base font-extrabold text-slate-900 flex items-center">
                  <User className="w-5 h-5 text-emerald-600 mr-2" />
                  Personal & Academic Details
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">Display Name</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleChange('name', e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 focus:bg-white focus:border-emerald-500 focus:outline-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">Gender</label>
                    <select
                      value={formData.gender}
                      onChange={(e) => handleChange('gender', e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 focus:bg-white focus:border-emerald-500 focus:outline-none"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">College Name</label>
                    <input
                      type="text"
                      value={formData.collegeName}
                      onChange={(e) => handleChange('collegeName', e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 focus:bg-white focus:border-emerald-500 focus:outline-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">Course & Stream</label>
                    <input
                      type="text"
                      value={formData.course}
                      onChange={(e) => handleChange('course', e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 focus:bg-white focus:border-emerald-500 focus:outline-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">Academic Year</label>
                    <select
                      value={formData.year}
                      onChange={(e) => handleChange('year', parseInt(e.target.value))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 focus:bg-white focus:border-emerald-500 focus:outline-none"
                    >
                      <option value={1}>1st Year</option>
                      <option value={2}>2nd Year</option>
                      <option value={3}>3rd Year</option>
                      <option value={4}>4th Year</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: Location & Timeline */}
            {step === 2 && (
              <div className="space-y-5 animate-in fade-in">
                <h2 className="text-base font-extrabold text-slate-900 flex items-center">
                  <MapPin className="w-5 h-5 text-emerald-600 mr-2" />
                  Target Locality & Move-In Timeline
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">Target City</label>
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) => handleChange('city', e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 focus:bg-white focus:border-emerald-500 focus:outline-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">Preferred Locality</label>
                    <select
                      value={formData.locality}
                      onChange={(e) => handleChange('locality', e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 focus:bg-white focus:border-emerald-500 focus:outline-none"
                    >
                      <option value="Ferozepur Road">Ferozepur Road (Near PCTE)</option>
                      <option value="BRS Nagar">BRS Nagar</option>
                      <option value="Model Town">Model Town</option>
                      <option value="Sarabha Nagar">Sarabha Nagar</option>
                      <option value="Gurdev Nagar">Gurdev Nagar</option>
                      <option value="Gill Road">Gill Road (Near GNDEC)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">Max Campus Radius (km)</label>
                    <input
                      type="number"
                      step="0.5"
                      value={formData.radiusKm}
                      onChange={(e) => handleChange('radiusKm', parseFloat(e.target.value))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 focus:bg-white focus:border-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">Expected Move-In Date</label>
                    <input
                      type="date"
                      value={formData.moveInDate}
                      onChange={(e) => handleChange('moveInDate', e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 focus:bg-white focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3: Budget & Sharing */}
            {step === 3 && (
              <div className="space-y-5 animate-in fade-in">
                <h2 className="text-base font-extrabold text-slate-900 flex items-center">
                  <DollarSign className="w-5 h-5 text-emerald-600 mr-2" />
                  Monthly Budget & Room Occupancy
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">Minimum Rent (₹/mo)</label>
                    <input
                      type="number"
                      step="500"
                      value={formData.budgetMin}
                      onChange={(e) => handleChange('budgetMin', parseInt(e.target.value))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 focus:bg-white focus:border-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">Maximum Rent (₹/mo)</label>
                    <input
                      type="number"
                      step="500"
                      value={formData.budgetMax}
                      onChange={(e) => handleChange('budgetMax', parseInt(e.target.value))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 focus:bg-white focus:border-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">Preferred Room Sharing</label>
                    <select
                      value={formData.roomType}
                      onChange={(e) => handleChange('roomType', e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 focus:bg-white focus:border-emerald-500 focus:outline-none"
                    >
                      <option value="Double Sharing">Double Sharing (2 Beds)</option>
                      <option value="Single Room">Single Room / Flatmate</option>
                      <option value="Triple Sharing">Triple Sharing (3 Beds)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">Gender Preference</label>
                    <select
                      value={formData.genderPreference}
                      onChange={(e) => handleChange('genderPreference', e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 focus:bg-white focus:border-emerald-500 focus:outline-none"
                    >
                      <option value="Same Gender">Same Gender Only</option>
                      <option value="Any Gender">Any Gender</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 4: Lifestyle Habits */}
            {step === 4 && (
              <div className="space-y-5 animate-in fade-in">
                <h2 className="text-base font-extrabold text-slate-900 flex items-center">
                  <Moon className="w-5 h-5 text-emerald-600 mr-2" />
                  Lifestyle & Living Habits
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Sleep Schedule</label>
                    <select
                      value={formData.sleepSchedule}
                      onChange={(e) => handleChange('sleepSchedule', e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 focus:bg-white focus:border-emerald-500 focus:outline-none"
                    >
                      <option value="Night Owl">🌙 Night Owl (Sleep late 12am+)</option>
                      <option value="Early Riser">🌅 Early Riser (Up before 7am)</option>
                      <option value="Flexible">Flexible Schedule</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Study Habits</label>
                    <select
                      value={formData.studySchedule}
                      onChange={(e) => handleChange('studySchedule', e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 focus:bg-white focus:border-emerald-500 focus:outline-none"
                    >
                      <option value="Late Night">Late Night Study in Room</option>
                      <option value="Daytime Study">Daytime / Library Study</option>
                      <option value="Group Study">Group Study Sessions</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Noise Preference</label>
                    <select
                      value={formData.noisePreference}
                      onChange={(e) => handleChange('noisePreference', e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 focus:bg-white focus:border-emerald-500 focus:outline-none"
                    >
                      <option value="Quiet Room">Quiet Room (Focus Environment)</option>
                      <option value="Moderate">Moderate Noise Okay</option>
                      <option value="Music Friendly">Music / Chat Friendly</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Cleanliness Standard</label>
                    <select
                      value={formData.cleanlinessPreference}
                      onChange={(e) => handleChange('cleanlinessPreference', e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 focus:bg-white focus:border-emerald-500 focus:outline-none"
                    >
                      <option value="Very Neat">Very Neat (Daily Cleaning)</option>
                      <option value="Moderate">Moderate Cleanliness</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Smoking Preference</label>
                    <select
                      value={formData.smokingPreference}
                      onChange={(e) => handleChange('smokingPreference', e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 focus:bg-white focus:border-emerald-500 focus:outline-none"
                    >
                      <option value="Non-Smoker">Strictly Non-Smoker</option>
                      <option value="Smoker">Smoker / Outdoor Only</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Food Preference</label>
                    <select
                      value={formData.foodPreference}
                      onChange={(e) => handleChange('foodPreference', e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 focus:bg-white focus:border-emerald-500 focus:outline-none"
                    >
                      <option value="Vegetarian">Vegetarian Only</option>
                      <option value="Non-Vegetarian">Non-Vegetarian</option>
                      <option value="Any Food">Any Food Choice</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 5: Room Amenities */}
            {step === 5 && (
              <div className="space-y-5 animate-in fade-in">
                <h2 className="text-base font-extrabold text-slate-900 flex items-center">
                  <Sparkles className="w-5 h-5 text-emerald-600 mr-2" />
                  Must-Have PG Amenities
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  {[
                    { label: 'Air Conditioning (AC)', key: 'acPreference' },
                    { label: 'High Speed Wi-Fi', key: 'wifiPreference' },
                    { label: 'Attached Bathroom', key: 'attachedBathroomPreference' },
                    { label: '3-Time Meals Included', key: 'foodProvidedPreference' },
                    { label: 'Furnished Study Desk & Wardrobe', key: 'furniturePreference' },
                  ].map((amenity) => (
                    <label
                      key={amenity.key}
                      className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer hover:border-emerald-400 transition-all"
                    >
                      <span className="text-slate-800 font-semibold">{amenity.label}</span>
                      <input
                        type="checkbox"
                        checked={(formData as any)[amenity.key]}
                        onChange={(e) => handleChange(amenity.key, e.target.checked)}
                        className="w-4 h-4 accent-emerald-600 rounded"
                      />
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* STEP 6: Bio & Privacy Settings */}
            {step === 6 && (
              <div className="space-y-6 animate-in fade-in">
                <h2 className="text-base font-extrabold text-slate-900 flex items-center">
                  <Lock className="w-5 h-5 text-emerald-600 mr-2" />
                  Bio & Privacy Control
                </h2>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">About Me / Bio</label>
                  <textarea
                    rows={3}
                    value={formData.description}
                    onChange={(e) => handleChange('description', e.target.value)}
                    placeholder="Write a short summary about your routine, expectations from a roommate..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 focus:bg-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-3">
                  <h4 className="text-xs font-extrabold text-emerald-800 flex items-center">
                    <ShieldCheck className="w-4 h-4 mr-1.5 text-emerald-600" />
                    UniNest Privacy Gating Settings
                  </h4>

                  {[
                    { label: 'Show First Name publicly', key: 'showFirstName' },
                    { label: 'Show College Name on profile', key: 'showCollege' },
                    { label: 'Show Course & Year', key: 'showCourse' },
                    { label: 'Show Budget range on discovery feed', key: 'showBudget' },
                    { label: 'Show Lifestyle badges', key: 'showLifestyle' },
                  ].map((priv) => (
                    <label key={priv.key} className="flex items-center justify-between text-xs text-slate-700 font-medium">
                      <span>{priv.label}</span>
                      <input
                        type="checkbox"
                        checked={(formData as any)[priv.key]}
                        onChange={(e) => handleChange(priv.key, e.target.checked)}
                        className="w-4 h-4 accent-emerald-600 rounded"
                      />
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Wizard Navigation Footer */}
            <div className="flex items-center justify-between mt-8 pt-5 border-t border-slate-100">
              {step > 1 ? (
                <Button
                  type="button"
                  onClick={handleBack}
                  variant="secondary"
                  className="bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 text-xs px-5 rounded-xl font-semibold"
                >
                  Previous Step
                </Button>
              ) : (
                <div />
              )}

              {step < 6 ? (
                <Button
                  type="button"
                  onClick={handleNext}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-6 py-2.5 rounded-xl shadow-sm"
                >
                  Next Step
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              ) : (
                <Button
                  type="submit"
                  disabled={loading}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-8 py-2.5 rounded-xl shadow-md"
                >
                  {loading ? 'Publishing Request...' : 'Publish Roommate Request 🎉'}
                </Button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
