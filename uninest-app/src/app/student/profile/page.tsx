'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  User, ShieldCheck, Mail, Phone, MapPin, GraduationCap, Calendar,
  CreditCard, BedDouble, CheckCircle2, Sparkles, FileText, Settings,
  Edit3, ExternalLink, Moon, Sun, BookOpen, AlertCircle, Award, Heart,
  Save, Check, Camera
} from 'lucide-react';
import { Card, Badge, Button } from '@/components/ui/Shared';

export default function StudentProfilePage() {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Profile Form State (Synchronized with Rahul Sharma / rahul@uninest.in)
  const [name, setName] = useState('Rahul Sharma');
  const [avatarUrl, setAvatarUrl] = useState('https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200');
  const [email, setEmail] = useState('rahul@uninest.in');
  const [phone, setPhone] = useState('+91 98765 43210');
  const [emergencyPhone, setEmergencyPhone] = useState('+91 98123 45678 (Parent - Ramesh Sharma)');
  const [collegeName, setCollegeName] = useState('PCTE Institute of Technology');
  const [course, setCourse] = useState('B.Tech Computer Science & Engineering');
  const [year, setYear] = useState(2);
  const [studentId, setStudentId] = useState('PCTE-CSE-2024-089');
  const [city, setCity] = useState('Ludhiana');

  // Roommate Preferences State
  const [locality, setLocality] = useState('Ferozepur Road (Near PCTE)');
  const [budgetMin, setBudgetMin] = useState(5000);
  const [budgetMax, setBudgetMax] = useState(7000);
  const [roomType, setRoomType] = useState('Double Sharing');
  const [sleepSchedule, setSleepSchedule] = useState('Night Owl (12 AM - 8 AM)');
  const [studySchedule, setStudySchedule] = useState('Night Focus (10 PM - 2 AM)');
  const [cleanliness, setCleanliness] = useState('High / Daily Clean');
  const [food, setFood] = useState('Vegetarian');
  const [smoking, setSmoking] = useState('Non-Smoker');

  useEffect(() => {
    try {
      const saved = localStorage.getItem('uninest_student_profile');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.name) setName(parsed.name);
        if (parsed.email) setEmail(parsed.email.replace('@uninest.demo', '@uninest.in'));
        if (parsed.phone) setPhone(parsed.phone);
        if (parsed.emergencyPhone) setEmergencyPhone(parsed.emergencyPhone);
        if (parsed.collegeName) setCollegeName(parsed.collegeName);
        if (parsed.course) setCourse(parsed.course);
      }
    } catch {}

    fetch('/api/profile')
      .then((r) => r.json())
      .then((data) => {
        if (data?.authenticated && data?.user?.role === 'STUDENT') {
          setName(data.user.name || 'Rahul Sharma');
          setEmail((data.user.email || 'rahul@uninest.in').replace('@uninest.demo', '@uninest.in'));
        }
      })
      .catch(() => {});
  }, []);

  // Fixed metadata for active stay & KYC
  const currentStay = {
    propertyName: 'PCTE Smart Student Residency',
    address: 'Passi Nagar, Ferozepur Road, Ludhiana',
    roomNo: 'Room 204 (Bed A)',
    rent: 6000,
    status: 'ACTIVE',
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsEditing(false);
    const cleanEmail = email.replace('@uninest.demo', '@uninest.in');
    setEmail(cleanEmail);
    try {
      localStorage.setItem(
        'uninest_student_profile',
        JSON.stringify({ name, email: cleanEmail, phone, emergencyPhone, collegeName, course, year, studentId })
      );
      await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email: cleanEmail }),
      });
      router.refresh();
    } catch {}
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
    }, 3000);
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      <div className="max-w-5xl mx-auto space-y-6">

        {/* Top Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Student Profile Workspace</h1>
            <p className="text-xs text-slate-500 mt-0.5">Manage and edit your personal information, college credentials, and roommate preferences.</p>
          </div>

          <div className="flex items-center gap-3">
            {isEditing ? (
              <Button
                onClick={handleSave}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2.5 px-4 rounded-xl shadow-md flex items-center gap-1.5"
              >
                <Save className="w-4 h-4" />
                Save Profile Changes
              </Button>
            ) : (
              <Button
                onClick={() => setIsEditing(true)}
                className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs py-2.5 px-4 rounded-xl shadow-sm flex items-center gap-1.5"
              >
                <Edit3 className="w-4 h-4" />
                Edit Profile Information
              </Button>
            )}
          </div>
        </div>

        {/* Saved Success Banner */}
        {savedSuccess && (
          <div className="bg-emerald-700 text-white text-xs font-bold p-3.5 rounded-xl shadow-lg flex items-center gap-2 animate-fade-in">
            <Check className="w-4 h-4 text-emerald-300" />
            <span>Profile successfully updated and synced across UniNest marketplace!</span>
          </div>
        )}

        {/* Hero Identity Banner */}
        <div className="bg-gradient-to-r from-emerald-700 via-teal-600 to-indigo-700 p-6 md:p-8 rounded-2xl text-white shadow-md">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex flex-col md:flex-row items-center gap-5 text-center md:text-left w-full">
              <div className="relative shrink-0">
                <img
                  src={avatarUrl}
                  alt={name}
                  className="w-24 h-24 rounded-full object-cover border-4 border-white/40 shadow-xl"
                />
                <span className="absolute bottom-0 right-0 bg-emerald-500 text-white p-1 rounded-full border-2 border-white shadow">
                  <ShieldCheck className="w-4 h-4" />
                </span>
              </div>

              <div className="space-y-1 w-full">
                {isEditing ? (
                  <div className="space-y-2 bg-white/10 p-3.5 rounded-xl border border-white/20">
                    <label className="text-[11px] text-emerald-100 font-bold block">Full Name</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full text-slate-900 font-bold text-sm p-2 rounded-lg bg-white"
                    />
                    <label className="text-[11px] text-emerald-100 font-bold block">Avatar Photo URL</label>
                    <input
                      type="text"
                      value={avatarUrl}
                      onChange={(e) => setAvatarUrl(e.target.value)}
                      className="w-full text-slate-900 text-xs p-2 rounded-lg bg-white"
                    />
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-center md:justify-start gap-2">
                      <h2 className="text-2xl md:text-3xl font-extrabold text-white">{name}</h2>
                      <span className="bg-emerald-500/80 backdrop-blur-md text-white border border-emerald-300/40 text-[11px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5 text-white" /> Verified Student
                      </span>
                    </div>
                    <p className="text-emerald-100 font-medium text-sm flex items-center justify-center md:justify-start gap-1.5">
                      <GraduationCap className="w-4 h-4 text-emerald-200" />
                      {collegeName}
                    </p>
                    <p className="text-xs text-emerald-50">
                      {course} • Year {year} • Roll No: {studentId}
                    </p>
                  </>
                )}
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/20 text-center shrink-0 min-w-[170px]">
              <div className="text-xs text-emerald-100 font-semibold mb-0.5">UniNest Trust Rating</div>
              <div className="text-2xl font-black text-white flex items-center justify-center gap-1">
                <Award className="w-6 h-6 text-amber-300" /> 100%
              </div>
              <div className="text-[11px] text-emerald-100 mt-0.5">Identity & College Verified</div>
            </div>
          </div>
        </div>

        {/* Profile Details Form & Grid */}
        <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-3 gap-6">

          {/* Column 1 & 2: Personal & Academic & Preferences */}
          <div className="md:col-span-2 space-y-6">

            {/* Personal Details Section */}
            <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm space-y-4">
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <User className="w-4 h-4 text-emerald-600" />
                Personal & Academic Details
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                
                {/* Email */}
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  <span className="text-slate-500 font-medium block text-[11px]">Email Address</span>
                  {isEditing ? (
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full text-slate-900 font-bold p-2 mt-1 rounded-lg border border-slate-300 bg-white"
                    />
                  ) : (
                    <span className="text-slate-900 font-bold text-sm mt-0.5 block flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-slate-500" /> {email}
                    </span>
                  )}
                </div>

                {/* Phone */}
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  <span className="text-slate-500 font-medium block text-[11px]">Phone Number</span>
                  {isEditing ? (
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full text-slate-900 font-bold p-2 mt-1 rounded-lg border border-slate-300 bg-white"
                    />
                  ) : (
                    <span className="text-slate-900 font-bold text-sm mt-0.5 block flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-slate-500" /> {phone}
                    </span>
                  )}
                </div>

                {/* College */}
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  <span className="text-slate-500 font-medium block text-[11px]">College / University</span>
                  {isEditing ? (
                    <input
                      type="text"
                      value={collegeName}
                      onChange={(e) => setCollegeName(e.target.value)}
                      className="w-full text-slate-900 font-bold p-2 mt-1 rounded-lg border border-slate-300 bg-white"
                    />
                  ) : (
                    <span className="text-slate-900 font-bold text-sm mt-0.5 block">{collegeName}</span>
                  )}
                </div>

                {/* Course & Year */}
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  <span className="text-slate-500 font-medium block text-[11px]">Course & Academic Year</span>
                  {isEditing ? (
                    <div className="flex gap-2 mt-1">
                      <input
                        type="text"
                        value={course}
                        onChange={(e) => setCourse(e.target.value)}
                        className="w-full text-slate-900 font-bold p-2 rounded-lg border border-slate-300 bg-white"
                      />
                      <input
                        type="number"
                        min={1}
                        max={5}
                        value={year}
                        onChange={(e) => setYear(Number(e.target.value))}
                        className="w-16 text-slate-900 font-bold p-2 rounded-lg border border-slate-300 bg-white"
                      />
                    </div>
                  ) : (
                    <span className="text-slate-900 font-bold text-sm mt-0.5 block">{course} (Year {year})</span>
                  )}
                </div>

                {/* Emergency Contact */}
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 sm:col-span-2">
                  <span className="text-slate-500 font-medium block text-[11px]">Emergency Contact (Parent / Guardian)</span>
                  {isEditing ? (
                    <input
                      type="text"
                      value={emergencyPhone}
                      onChange={(e) => setEmergencyPhone(e.target.value)}
                      className="w-full text-slate-900 font-bold p-2 mt-1 rounded-lg border border-slate-300 bg-white"
                    />
                  ) : (
                    <span className="text-slate-900 font-bold text-sm mt-0.5 block">{emergencyPhone}</span>
                  )}
                </div>

              </div>
            </div>

            {/* Roommate Preference Section */}
            <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <Heart className="w-4 h-4 text-emerald-600" />
                  Roommate Preference Profile
                </h3>
                <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
                  Published on Marketplace
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
                
                {/* Target Locality */}
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  <span className="text-slate-500 font-medium block text-[11px]">Target Locality</span>
                  {isEditing ? (
                    <input
                      type="text"
                      value={locality}
                      onChange={(e) => setLocality(e.target.value)}
                      className="w-full text-slate-900 font-bold p-1.5 mt-1 rounded-lg border border-slate-300 bg-white"
                    />
                  ) : (
                    <span className="text-slate-900 font-bold mt-0.5 block">{locality}</span>
                  )}
                </div>

                {/* Budget Range */}
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  <span className="text-slate-500 font-medium block text-[11px]">Max Monthly Budget (₹)</span>
                  {isEditing ? (
                    <div className="flex items-center gap-1 mt-1">
                      <input
                        type="number"
                        step={500}
                        value={budgetMin}
                        onChange={(e) => setBudgetMin(Number(e.target.value))}
                        className="w-full text-slate-900 font-bold p-1.5 rounded-lg border border-slate-300 bg-white"
                      />
                      <span>-</span>
                      <input
                        type="number"
                        step={500}
                        value={budgetMax}
                        onChange={(e) => setBudgetMax(Number(e.target.value))}
                        className="w-full text-slate-900 font-bold p-1.5 rounded-lg border border-slate-300 bg-white"
                      />
                    </div>
                  ) : (
                    <span className="text-emerald-700 font-extrabold mt-0.5 block">
                      ₹{budgetMin.toLocaleString()} - ₹{budgetMax.toLocaleString()}/mo
                    </span>
                  )}
                </div>

                {/* Room Type */}
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  <span className="text-slate-500 font-medium block text-[11px]">Room Sharing Type</span>
                  {isEditing ? (
                    <select
                      value={roomType}
                      onChange={(e) => setRoomType(e.target.value)}
                      className="w-full text-slate-900 font-bold p-1.5 mt-1 rounded-lg border border-slate-300 bg-white"
                    >
                      <option value="Single Room">Single Private Room</option>
                      <option value="Double Sharing">Double Sharing</option>
                      <option value="Triple Sharing">Triple Sharing</option>
                    </select>
                  ) : (
                    <span className="text-slate-900 font-bold mt-0.5 block">{roomType}</span>
                  )}
                </div>

                {/* Sleep Schedule */}
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  <span className="text-slate-500 font-medium block text-[11px]">Sleep Habits</span>
                  {isEditing ? (
                    <select
                      value={sleepSchedule}
                      onChange={(e) => setSleepSchedule(e.target.value)}
                      className="w-full text-slate-900 font-bold p-1.5 mt-1 rounded-lg border border-slate-300 bg-white"
                    >
                      <option value="Night Owl (12 AM - 8 AM)">Night Owl (12 AM - 8 AM)</option>
                      <option value="Early Riser (10 PM - 6 AM)">Early Riser (10 PM - 6 AM)</option>
                      <option value="Flexible Schedule">Flexible Schedule</option>
                    </select>
                  ) : (
                    <span className="text-slate-900 font-bold mt-0.5 block">{sleepSchedule}</span>
                  )}
                </div>

                {/* Cleanliness */}
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  <span className="text-slate-500 font-medium block text-[11px]">Cleanliness Standard</span>
                  {isEditing ? (
                    <select
                      value={cleanliness}
                      onChange={(e) => setCleanliness(e.target.value)}
                      className="w-full text-slate-900 font-bold p-1.5 mt-1 rounded-lg border border-slate-300 bg-white"
                    >
                      <option value="High / Daily Clean">High / Daily Clean</option>
                      <option value="Moderate Cleanliness">Moderate Cleanliness</option>
                      <option value="Flexible">Flexible</option>
                    </select>
                  ) : (
                    <span className="text-slate-900 font-bold mt-0.5 block">{cleanliness}</span>
                  )}
                </div>

                {/* Food & Smoking */}
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  <span className="text-slate-500 font-medium block text-[11px]">Diet & Smoking Habits</span>
                  {isEditing ? (
                    <div className="flex gap-1 mt-1">
                      <select
                        value={food}
                        onChange={(e) => setFood(e.target.value)}
                        className="w-full text-slate-900 font-bold p-1.5 rounded-lg border border-slate-300 bg-white"
                      >
                        <option value="Vegetarian">Vegetarian</option>
                        <option value="Non-Vegetarian">Non-Vegetarian</option>
                        <option value="Eggetarian">Eggetarian</option>
                      </select>
                      <select
                        value={smoking}
                        onChange={(e) => setSmoking(e.target.value)}
                        className="w-full text-slate-900 font-bold p-1.5 rounded-lg border border-slate-300 bg-white"
                      >
                        <option value="Non-Smoker">Non-Smoker</option>
                        <option value="Smoker">Smoker</option>
                      </select>
                    </div>
                  ) : (
                    <span className="text-slate-900 font-bold mt-0.5 block">{food} • {smoking}</span>
                  )}
                </div>

              </div>
            </div>

          </div>

          {/* Column 3: Verification & Active Accommodation */}
          <div className="space-y-6">

            {/* Identity & Verification Status */}
            <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm space-y-4">
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                Identity & KYC Verification
              </h3>

              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl">
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <div>
                      <span className="font-bold text-emerald-900 block">Student College ID</span>
                      <span className="text-[11px] text-emerald-700">Verified via PCTE Database</span>
                    </div>
                  </div>
                  <Badge variant="success" size="sm">Verified</Badge>
                </div>

                <div className="flex items-center justify-between p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl">
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <div>
                      <span className="font-bold text-emerald-900 block">Government Aadhaar KYC</span>
                      <span className="text-[11px] text-emerald-700">Verified on 15 Aug 2026</span>
                    </div>
                  </div>
                  <Badge variant="success" size="sm">Verified</Badge>
                </div>
              </div>
            </div>

            {/* Active Accommodation Summary */}
            <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <BedDouble className="w-4 h-4 text-emerald-600" />
                  Active Accommodation
                </h3>
                <Link href="/student/bookings" className="text-xs text-emerald-600 font-bold hover:underline flex items-center gap-1">
                  Workspace <ExternalLink className="w-3 h-3" />
                </Link>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2 text-xs">
                <span className="font-extrabold text-slate-900 text-sm block">{currentStay.propertyName}</span>
                <p className="text-slate-500 flex items-center">
                  <MapPin className="w-3.5 h-3.5 text-emerald-600 mr-1 shrink-0" />
                  {currentStay.address}
                </p>
                <div className="flex justify-between items-center pt-2 border-t border-slate-200 mt-2">
                  <span className="text-slate-600 font-medium">{currentStay.roomNo}</span>
                  <span className="text-emerald-700 font-bold">₹{currentStay.rent.toLocaleString()}/mo</span>
                </div>
              </div>
            </div>

          </div>

        </form>

      </div>
    </div>
  );
}
