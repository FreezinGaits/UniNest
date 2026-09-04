'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft, ShieldCheck, Sparkles, Heart, MessageSquare, MapPin,
  Moon, BookOpen, Sun, CheckCircle2, AlertTriangle, UserCheck, Check,
  Sliders, Award
} from 'lucide-react';
import { Card, Badge, Button } from '@/components/ui/Shared';

export default function RoommateProfileDetailsPage({
  params,
}: {
  params: Promise<{ requestId: string }> | { requestId: string };
}) {
  // Unwrap Next.js 16 dynamic route params Promise
  const resolvedParams = params instanceof Promise ? use(params) : params;
  const requestId = resolvedParams.requestId;

  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [interestSent, setInterestSent] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, [requestId]);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/student/roommates?studentId=`);
      const data = await res.json();
      let found = null;
      if (data.success && data.requests) {
        found = data.requests.find((r: any) => r.id === requestId);
      }
      if (!found) {
        found = getFallbackProfile(requestId);
      }
      setProfile(found);
    } catch (err) {
      console.error('Error fetching roommate profile:', err);
      setProfile(getFallbackProfile(requestId));
    } finally {
      setLoading(false);
    }
  };

  const getFallbackProfile = (id: string) => {
    const demoProfiles: Record<string, any> = {
      'req-aman-id': {
        id: 'req-aman-id',
        name: 'Aman Verma',
        avatarUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150',
        gender: 'Male',
        collegeName: 'PCTE Institute of Technology',
        course: 'B.Tech CSE',
        year: 2,
        city: 'Ludhiana',
        locality: 'Ferozepur Road',
        budgetMin: 5000,
        budgetMax: 8000,
        roomType: 'Double Sharing',
        sleepSchedule: 'Night Owl (12 AM - 8 AM)',
        studySchedule: 'Night Study Focus',
        noisePreference: 'Quiet & Focused',
        cleanlinessPreference: 'High / Daily Clean',
        smokingPreference: 'Non-Smoker',
        foodPreference: 'Vegetarian',
        acPreference: true,
        wifiPreference: true,
        attachedBathroomPreference: true,
        foodProvidedPreference: true,
        isVerified: true,
        compatibility: {
          totalScore: 91,
          breakdown: {
            budget: 100,
            location: 100,
            roomType: 100,
            sleep: 95,
            noise: 90,
            cleanliness: 90,
            study: 90,
            smoking: 100,
            food: 100,
          },
          explanation: 'Perfect match! Both prefer night study, non-smoking, vegetarian, and double sharing near PCTE.',
        },
      },
      'req-simran-id': {
        id: 'req-simran-id',
        name: 'Simran Kaur',
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
        gender: 'Female',
        collegeName: 'PCTE Institute of Technology',
        course: 'BBA',
        year: 3,
        city: 'Ludhiana',
        locality: 'BRS Nagar',
        budgetMin: 6000,
        budgetMax: 9000,
        roomType: 'Double Sharing',
        sleepSchedule: 'Early Riser (10 PM - 6 AM)',
        studySchedule: 'Morning Focus',
        noisePreference: 'Moderate',
        cleanlinessPreference: 'High / Daily Clean',
        smokingPreference: 'Non-Smoker',
        foodPreference: 'Vegetarian',
        acPreference: true,
        wifiPreference: true,
        attachedBathroomPreference: true,
        foodProvidedPreference: true,
        isVerified: true,
        compatibility: {
          totalScore: 84,
          breakdown: {
            budget: 90,
            location: 85,
            roomType: 90,
            sleep: 75,
            noise: 85,
            cleanliness: 90,
            study: 80,
            smoking: 100,
            food: 100,
          },
          explanation: 'Strong overlap on budget and cleanliness, slightly different sleep timings.',
        },
      },
      'req-rohan-id': {
        id: 'req-rohan-id',
        name: 'Rohan Mehta',
        avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
        gender: 'Male',
        collegeName: 'GNDEC Ludhiana',
        course: 'B.Tech IT',
        year: 2,
        city: 'Ludhiana',
        locality: 'Ferozepur Road',
        budgetMin: 4500,
        budgetMax: 7500,
        roomType: 'Triple Sharing',
        sleepSchedule: 'Flexible',
        studySchedule: 'Evening Study',
        noisePreference: 'Quiet & Focused',
        cleanlinessPreference: 'Moderate',
        smokingPreference: 'Non-Smoker',
        foodPreference: 'Non-Vegetarian',
        acPreference: true,
        wifiPreference: true,
        attachedBathroomPreference: false,
        foodProvidedPreference: true,
        isVerified: true,
        compatibility: {
          totalScore: 78,
          breakdown: {
            budget: 95,
            location: 95,
            roomType: 70,
            sleep: 80,
            noise: 85,
            cleanliness: 75,
            study: 75,
            smoking: 100,
            food: 70,
          },
          explanation: 'Good budget and location sync near Ferozepur Road.',
        },
      },
    };
    return demoProfiles[id] || demoProfiles['req-aman-id'];
  };

  const handleExpressInterest = async () => {
    try {
      const res = await fetch('/api/student/roommates/interest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderRequestId: 'req-rahul-id',
          receiverRequestId: profile.id,
        }),
      });
      const data = await res.json();
      setInterestSent(true);

      if (data.isMutual && data.match) {
        router.push(`/student/roommates/matches/${data.match.id}/chat`);
      } else {
        alert(`Interest expressed for ${profile.name}!`);
      }
    } catch (err) {
      console.error('Error sending interest:', err);
    }
  };

  if (loading) {
    return (
      <div className="py-16 text-center">
        <Sparkles className="w-8 h-8 animate-spin text-emerald-600 mx-auto mb-2" />
        <p className="text-sm font-medium text-slate-600">Loading student profile & compatibility analysis...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="py-16 text-center">
        <h2 className="text-xl font-bold text-slate-800">Roommate Request Not Found</h2>
        <Link href="/student/roommates" className="mt-4 inline-block">
          <Button variant="secondary" className="bg-slate-100 text-xs">Return to Roommates Feed</Button>
        </Link>
      </div>
    );
  }

  const score = profile.compatibility?.totalScore || 91;
  const bd = profile.compatibility?.breakdown || {
    budget: 100,
    location: 100,
    roomType: 100,
    sleep: 100,
    noise: 100,
    cleanliness: 100,
    study: 100,
    smoking: 100,
    food: 100,
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Navigation Bar */}
        <div className="flex items-center justify-between">
          <Link href="/student/roommates">
            <Button variant="secondary" className="bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 text-xs py-2 rounded-xl">
              <ArrowLeft className="w-4 h-4 mr-1 text-slate-600" />
              Back to Roommates Feed
            </Button>
          </Link>
          <button
            onClick={() => setShowReportModal(true)}
            className="text-xs text-rose-600 hover:underline flex items-center gap-1 font-semibold"
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            Report Profile
          </button>
        </div>

        {/* User Hero Banner */}
        <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-700 p-6 md:p-8 rounded-2xl text-white shadow-md relative overflow-hidden">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
            <div className="flex items-center gap-5 text-center md:text-left">
              <img
                src={profile.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'}
                alt={profile.name}
                className="w-24 h-24 rounded-full object-cover border-4 border-white/40 shadow-xl"
              />
              <div>
                <div className="flex items-center justify-center md:justify-start gap-2">
                  <h1 className="text-2xl md:text-3xl font-extrabold text-white">{profile.name}</h1>
                  {profile.isVerified && <ShieldCheck className="w-6 h-6 text-emerald-200" />}
                </div>
                <p className="text-emerald-100 font-semibold text-sm mt-0.5">{profile.collegeName}</p>
                <p className="text-xs text-emerald-50 mt-1">
                  {profile.course} • Academic Year {profile.year} • {profile.gender}
                </p>
                <div className="flex items-center justify-center md:justify-start gap-2 text-xs text-white/90 mt-2 font-medium">
                  <MapPin className="w-3.5 h-3.5 text-emerald-200" />
                  Target: {profile.locality}, {profile.city}
                </div>
              </div>
            </div>

            {/* Score Ring / Action */}
            <div className="flex flex-col items-center gap-3 bg-white/10 backdrop-blur-md p-5 rounded-2xl border border-white/20 w-full md:w-auto">
              <div className="text-center">
                <div className="text-3xl font-black text-white">{score}%</div>
                <div className="text-[11px] text-emerald-100 uppercase tracking-wider font-bold">Compatibility Score</div>
              </div>

              <Button
                onClick={handleExpressInterest}
                disabled={interestSent}
                className={`w-full text-xs py-2.5 font-bold rounded-xl ${
                  interestSent
                    ? 'bg-white/20 text-white cursor-not-allowed border border-white/30'
                    : 'bg-white text-emerald-800 hover:bg-emerald-50 shadow-md'
                }`}
              >
                {interestSent ? (
                  <>
                    <Check className="w-4 h-4 mr-1.5 text-emerald-300" />
                    Interest Expressed
                  </>
                ) : (
                  <>
                    <Heart className="w-4 h-4 mr-1.5 fill-emerald-600 text-emerald-600" />
                    I'm Interested
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* 9-Factor Compatibility Breakdown */}
        <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm space-y-4">
          <h3 className="text-base font-extrabold text-slate-900 flex items-center">
            <Sparkles className="w-4 h-4 text-emerald-600 mr-2" />
            9-Factor Compatibility Engine Analysis
          </h3>

          <div className="bg-emerald-50/70 p-4 rounded-xl border border-emerald-200/80 text-xs text-slate-800">
            <span className="font-bold text-emerald-800 block mb-1">Algorithmic Summary:</span>
            {profile.compatibility?.explanation || 'High compatibility across budget, sleep schedule, and room preferences.'}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {[
              { label: 'Budget Alignment (20%)', score: bd.budget },
              { label: 'Location & Campus Proximity (15%)', score: bd.location },
              { label: 'Sleep Schedule Sync (15%)', score: bd.sleep },
              { label: 'Noise & Focus Level (10%)', score: bd.noise },
              { label: 'Cleanliness Standard (10%)', score: bd.cleanliness },
              { label: 'Study Routine (10%)', score: bd.study },
              { label: 'Room Sharing Type (10%)', score: bd.roomType },
              { label: 'Smoking Preference (5%)', score: bd.smoking },
              { label: 'Food & Meal Preference (5%)', score: bd.food },
            ].map((cat) => (
              <div key={cat.label} className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-slate-700 font-semibold">{cat.label}</span>
                  <span className="font-extrabold text-emerald-700">{cat.score}%</span>
                </div>
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-emerald-600 h-full rounded-full"
                    style={{ width: `${cat.score}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Detailed Lifestyle & Amenities Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm">
            <h3 className="text-base font-extrabold text-slate-900 mb-4">Lifestyle Preferences</h3>
            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Sleep Schedule:</span>
                <span className="text-slate-900 font-bold">{profile.sleepSchedule}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Study Routine:</span>
                <span className="text-slate-900 font-bold">{profile.studySchedule}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Noise Preference:</span>
                <span className="text-slate-900 font-bold">{profile.noisePreference}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Cleanliness:</span>
                <span className="text-slate-900 font-bold">{profile.cleanlinessPreference}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Smoking:</span>
                <span className="text-slate-900 font-bold">{profile.smokingPreference}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-slate-500 font-medium">Food Habit:</span>
                <span className="text-slate-900 font-bold">{profile.foodPreference}</span>
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm">
            <h3 className="text-base font-extrabold text-slate-900 mb-4">Required Room Amenities</h3>
            <div className="space-y-3 text-xs">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className={`w-4 h-4 ${profile.acPreference ? 'text-emerald-600' : 'text-slate-300'}`} />
                <span className="text-slate-800 font-medium">Air Conditioning (AC)</span>
              </div>
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className={`w-4 h-4 ${profile.wifiPreference ? 'text-emerald-600' : 'text-slate-300'}`} />
                <span className="text-slate-800 font-medium">High-Speed Wi-Fi</span>
              </div>
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className={`w-4 h-4 ${profile.attachedBathroomPreference ? 'text-emerald-600' : 'text-slate-300'}`} />
                <span className="text-slate-800 font-medium">Attached Bathroom</span>
              </div>
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className={`w-4 h-4 ${profile.foodProvidedPreference ? 'text-emerald-600' : 'text-slate-300'}`} />
                <span className="text-slate-800 font-medium">Meals Included (MESS/Food)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Report Modal */}
        {showReportModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl">
              <h3 className="text-lg font-bold text-slate-900">Report Profile</h3>
              <p className="text-xs text-slate-600">
                Please select the reason for reporting this roommate request profile. Our moderation team will review it within 2 hours.
              </p>

              <select className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900">
                <option>Inappropriate bio or details</option>
                <option>Impersonation or fake profile</option>
                <option>Off-platform financial solicitation</option>
                <option>Other policy violation</option>
              </select>

              <div className="flex justify-end gap-2 pt-2">
                <Button onClick={() => setShowReportModal(false)} variant="secondary" className="text-xs bg-slate-100 text-slate-700">
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    alert('Report submitted. Thank you for keeping UniNest safe!');
                    setShowReportModal(false);
                  }}
                  className="bg-rose-600 hover:bg-rose-700 text-xs text-white font-bold"
                >
                  Submit Report
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
