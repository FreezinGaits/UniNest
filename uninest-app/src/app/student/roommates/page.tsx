'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Users, Search, Filter, ShieldCheck, Heart, MessageSquare, Sparkles,
  MapPin, DollarSign, Moon, BookOpen, Sun, Zap, CheckCircle2, ChevronRight,
  TrendingUp, Award, UserPlus, RefreshCw, AlertCircle, Eye, SlidersHorizontal,
  Lock, Check, Home, Info, HelpCircle
} from 'lucide-react';
import { Card, Badge, Button, Input } from '@/components/ui/Shared';

interface RoommateRequest {
  id: string;
  studentId: string;
  name: string;
  avatarUrl?: string;
  gender: string;
  collegeName: string;
  course: string;
  year: number;
  city: string;
  locality: string;
  budgetMin: number;
  budgetMax: number;
  roomType: string;
  sleepSchedule?: string;
  studySchedule?: string;
  noisePreference?: string;
  cleanlinessPreference?: string;
  smokingPreference?: string;
  foodPreference?: string;
  description?: string;
  isVerified: boolean;
  compatibility: {
    totalScore: number;
    breakdown: Record<string, number>;
    explanation: string;
    matchingPoints: string[];
  };
}

export default function RoommateDiscoveryPage() {
  const router = useRouter();
  const [requests, setRequests] = useState<RoommateRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocality, setSelectedLocality] = useState('ALL');
  const [selectedGender, setSelectedGender] = useState('ALL');
  const [selectedRoomType, setSelectedRoomType] = useState('ALL');
  const [maxBudget, setMaxBudget] = useState(15000);
  const [expressedInterests, setExpressedInterests] = useState<Record<string, boolean>>({});
  const [showMatchModal, setShowMatchModal] = useState<any>(null);
  const [currentReq, setCurrentReq] = useState<any>(null);

  useEffect(() => {
    fetchRequests();
  }, [selectedLocality, selectedGender, selectedRoomType, maxBudget]);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.set('search', searchQuery);
      if (selectedLocality !== 'ALL') params.set('locality', selectedLocality);
      if (selectedGender !== 'ALL') params.set('gender', selectedGender);
      if (selectedRoomType !== 'ALL') params.set('roomType', selectedRoomType);
      if (maxBudget) params.set('maxBudget', maxBudget.toString());

      const res = await fetch(`/api/student/roommates?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setRequests(data.requests || []);
        setCurrentReq(data.currentStudentRequest);
      }
    } catch (err) {
      console.error('Failed to load roommate requests:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchRequests();
  };

  const handleExpressInterest = async (req: RoommateRequest) => {
    if (!currentReq) {
      alert('Please create your roommate profile first to express interest!');
      router.push('/student/roommates/create');
      return;
    }

    try {
      const res = await fetch('/api/student/roommates/interest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderRequestId: currentReq.id,
          receiverRequestId: req.id,
        }),
      });
      const data = await res.json();

      setExpressedInterests((prev) => ({ ...prev, [req.id]: true }));

      if (data.isMutual && data.match) {
        setShowMatchModal({
          matchedUser: req,
          match: data.match,
        });
      } else {
        alert(`Interest sent to ${req.name}! You will be notified when they accept.`);
      }
    } catch (err) {
      console.error('Error expressing interest:', err);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-700 p-6 md:p-8 text-white shadow-md">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/20 backdrop-blur-md text-white border border-white/30 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-200 animate-pulse" />
                UniNest Roommate Marketplace
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-950/30 text-emerald-100 border border-emerald-400/30">
                🛡️ Verified Students Only
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
              Find Your Perfect College Roommate
            </h1>
            <p className="text-emerald-50 mt-1.5 max-w-2xl text-xs md:text-sm leading-relaxed">
              Discover verified students near PCTE & GNDEC with our 9-Factor Compatibility Engine. Match on sleep schedules, study habits, budget, and book shared PGs together!
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link href="/student/roommates/create">
              <Button className="bg-white text-emerald-800 hover:bg-emerald-50 font-bold shadow-md border border-white/40 text-xs px-4 py-2.5">
                <UserPlus className="w-4 h-4 mr-2 text-emerald-600" />
                {currentReq ? 'Edit My Request' : 'Create Roommate Request'}
              </Button>
            </Link>
            <Link href="/student/roommates/my-requests">
              <Button variant="secondary" className="bg-emerald-950/40 hover:bg-emerald-950/60 text-white border border-white/30 text-xs px-4 py-2.5">
                <MessageSquare className="w-4 h-4 mr-2" />
                My Matches & Requests
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Ticker */}
        <div className="mt-6 pt-5 border-t border-white/20 grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
          <div className="p-2.5 bg-white/10 backdrop-blur-md rounded-xl border border-white/20">
            <div className="text-xl font-extrabold text-white">12+</div>
            <div className="text-[11px] text-emerald-100 mt-0.5">Active Student Profiles</div>
          </div>
          <div className="p-2.5 bg-white/10 backdrop-blur-md rounded-xl border border-white/20">
            <div className="text-xl font-extrabold text-emerald-200">91%</div>
            <div className="text-[11px] text-emerald-100 mt-0.5">Avg Match Compatibility</div>
          </div>
          <div className="p-2.5 bg-white/10 backdrop-blur-md rounded-xl border border-white/20">
            <div className="text-xl font-extrabold text-white">100%</div>
            <div className="text-[11px] text-emerald-100 mt-0.5">Privacy & Safety Gated</div>
          </div>
          <div className="p-2.5 bg-white/10 backdrop-blur-md rounded-xl border border-white/20">
            <div className="text-xl font-extrabold text-amber-200">₹0</div>
            <div className="text-[11px] text-emerald-100 mt-0.5">Brokerage Fee</div>
          </div>
        </div>
      </div>

      {/* Main Grid: Filters & Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar Filters */}
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 flex items-center text-sm">
                <Filter className="w-4 h-4 mr-2 text-emerald-600" />
                Refine Roommate Search
              </h3>
              <button
                onClick={() => {
                  setSelectedLocality('ALL');
                  setSelectedGender('ALL');
                  setSelectedRoomType('ALL');
                  setMaxBudget(10000);
                  setSearchQuery('');
                }}
                className="text-xs text-emerald-600 hover:text-emerald-700 font-semibold"
              >
                Reset
              </button>
            </div>

            <form onSubmit={handleSearchSubmit} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1.5">Keyword Search</label>
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search name, course, college..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1.5">Gender Preference</label>
                <select
                  value={selectedGender}
                  onChange={(e) => setSelectedGender(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="ALL">All Genders</option>
                  <option value="Male">Male Students</option>
                  <option value="Female">Female Students</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1.5">Locality / Area</label>
                <select
                  value={selectedLocality}
                  onChange={(e) => setSelectedLocality(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="ALL">All Localities</option>
                  <option value="Ferozepur Road">Ferozepur Road (Near PCTE)</option>
                  <option value="BRS Nagar">BRS Nagar</option>
                  <option value="Model Town">Model Town</option>
                  <option value="Sarabha Nagar">Sarabha Nagar</option>
                  <option value="Gurdev Nagar">Gurdev Nagar</option>
                  <option value="Gill Road">Gill Road (Near GNDEC)</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1.5">Room Type</label>
                <select
                  value={selectedRoomType}
                  onChange={(e) => setSelectedRoomType(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="ALL">All Room Types</option>
                  <option value="Double Sharing">Double Sharing</option>
                  <option value="Single Room">Single Room / Flatmate</option>
                  <option value="Triple Sharing">Triple Sharing</option>
                </select>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="font-semibold text-slate-700">Max Budget</label>
                  <span className="font-bold text-emerald-600">₹{maxBudget.toLocaleString()}/mo</span>
                </div>
                <input
                  type="range"
                  min="4000"
                  max="20000"
                  step="500"
                  value={maxBudget}
                  onChange={(e) => setMaxBudget(parseInt(e.target.value))}
                  className="w-full accent-emerald-600 bg-slate-200 h-1.5 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              <Button type="submit" className="w-full bg-slate-900 hover:bg-slate-800 text-white text-xs py-2 rounded-xl">
                Apply Filters
              </Button>
            </form>
          </div>

          {/* Retention Flywheel Card */}
          <div className="bg-gradient-to-br from-emerald-50 to-indigo-50 border border-emerald-200/80 p-5 rounded-2xl shadow-sm space-y-3">
            <h4 className="text-xs font-bold text-emerald-900 flex items-center">
              <TrendingUp className="w-4 h-4 mr-2 text-emerald-600" />
              Retention Flywheel
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Matched roommates stay 3.2x longer in shared PGs, reducing landlord vacancy and offering lower individual monthly rent.
            </p>
            <div className="space-y-2 text-xs text-slate-700 pt-1">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Shared PG cost split up to 50%</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Same college peer verification</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>In-app moderated chat safety</span>
              </div>
            </div>
          </div>
        </div>

        {/* Discovery Request Feed */}
        <div className="lg:col-span-3 space-y-4">
          <div className="flex items-center justify-between bg-white border border-slate-200 px-5 py-3 rounded-2xl shadow-sm">
            <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <Users className="w-5 h-5 text-emerald-600" />
              Recommended Roommate Matches ({requests.length})
            </h2>
            <span className="text-xs font-medium text-slate-500">Ranked by 9-Factor Score</span>
          </div>

          {loading ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 shadow-sm">
              <RefreshCw className="w-8 h-8 animate-spin text-emerald-600 mx-auto mb-3" />
              <p className="text-sm font-medium text-slate-600">Calculating compatibility scores...</p>
            </div>
          ) : requests.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
              <AlertCircle className="w-10 h-10 text-slate-400 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-800">No matching roommate requests found</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                Try expanding your budget filter or selecting "All Localities" to see more verified student profiles.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {requests.map((req) => {
                const isSent = expressedInterests[req.id];
                const score = req.compatibility.totalScore;

                return (
                  <div
                    key={req.id}
                    className="bg-white border border-slate-200 hover:border-emerald-400 hover:shadow-md transition-all duration-200 p-5 rounded-2xl flex flex-col justify-between relative overflow-hidden group shadow-sm"
                  >
                    {/* Compatibility Score Ribbon */}
                    <div className="absolute top-4 right-4 flex items-center gap-1 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full text-emerald-700 font-extrabold text-xs">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                      {score}% Match
                    </div>

                    <div>
                      {/* User Header */}
                      <div className="flex items-start gap-3.5 mb-3.5">
                        <img
                          src={req.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'}
                          alt={req.name}
                          className="w-13 h-13 rounded-full object-cover border-2 border-emerald-200 shadow-sm"
                        />
                        <div className="pr-16">
                          <div className="flex items-center gap-1.5">
                            <h3 className="text-base font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                              {req.name}
                            </h3>
                            {req.isVerified && (
                              <ShieldCheck className="w-4 h-4 text-emerald-600" />
                            )}
                          </div>
                          <p className="text-xs font-semibold text-emerald-700 mt-0.5">{req.collegeName}</p>
                          <p className="text-xs text-slate-500">
                            {req.course} • Year {req.year} • {req.gender}
                          </p>
                        </div>
                      </div>

                      {/* Matching Explanation Banner */}
                      <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-xl p-3 mb-3.5 text-xs text-slate-800">
                        <span className="font-bold text-emerald-800 block mb-0.5">Compatibility Insight:</span>
                        {req.compatibility.explanation}
                      </div>

                      {/* Lifestyle Badges Grid */}
                      <div className="flex flex-wrap gap-1.5 mb-3.5">
                        {req.sleepSchedule && (
                          <span className="bg-slate-100 text-slate-700 border border-slate-200 px-2 py-0.5 rounded-md text-[11px] font-medium flex items-center">
                            <Moon className="w-3 h-3 mr-1 text-indigo-500" />
                            {req.sleepSchedule}
                          </span>
                        )}
                        {req.smokingPreference && (
                          <span className="bg-slate-100 text-slate-700 border border-slate-200 px-2 py-0.5 rounded-md text-[11px] font-medium">
                            🚭 {req.smokingPreference}
                          </span>
                        )}
                        {req.foodPreference && (
                          <span className="bg-slate-100 text-slate-700 border border-slate-200 px-2 py-0.5 rounded-md text-[11px] font-medium">
                            🥗 {req.foodPreference}
                          </span>
                        )}
                        {req.noisePreference && (
                          <span className="bg-slate-100 text-slate-700 border border-slate-200 px-2 py-0.5 rounded-md text-[11px] font-medium">
                            🎧 {req.noisePreference}
                          </span>
                        )}
                      </div>

                      {/* Location & Budget Row */}
                      <div className="grid grid-cols-2 gap-2 text-xs py-2.5 px-3 bg-slate-50 rounded-xl border border-slate-200 mb-3.5">
                        <div>
                          <span className="text-slate-500 block text-[11px]">Preferred Area:</span>
                          <span className="text-slate-800 font-semibold flex items-center mt-0.5">
                            <MapPin className="w-3 h-3 text-emerald-600 mr-1 shrink-0" />
                            {req.locality}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-500 block text-[11px]">Budget Range:</span>
                          <span className="text-emerald-700 font-extrabold mt-0.5 block">
                            ₹{req.budgetMin.toLocaleString()} - ₹{req.budgetMax.toLocaleString()}/mo
                          </span>
                        </div>
                      </div>

                      {req.description && (
                        <p className="text-xs text-slate-600 line-clamp-2 italic mb-3.5">
                          "{req.description}"
                        </p>
                      )}
                    </div>

                    {/* Action Footer */}
                    <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
                      <Link href={`/student/roommates/${req.id}`} className="flex-1">
                        <Button variant="secondary" className="w-full bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 text-xs py-2 rounded-xl">
                          <Eye className="w-3.5 h-3.5 mr-1.5 text-slate-600" />
                          View Profile
                        </Button>
                      </Link>

                      <Button
                        onClick={() => handleExpressInterest(req)}
                        disabled={isSent}
                        className={`flex-1 text-xs py-2 font-bold rounded-xl ${
                          isSent
                            ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                            : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm'
                        }`}
                      >
                        {isSent ? (
                          <>
                            <Check className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                            Interest Sent
                          </>
                        ) : (
                          <>
                            <Heart className="w-3.5 h-3.5 mr-1 fill-white" />
                            I'm Interested
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Why Roommate Matching Matters Section */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 shadow-sm space-y-6">
        <h3 className="text-lg font-extrabold text-slate-900 flex items-center">
          <Award className="w-5 h-5 text-amber-500 mr-2" />
          Why UniNest Roommate Matching Drives Platform Retention
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-slate-50 p-5 rounded-xl border border-slate-200">
            <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-sm mb-3">
              1
            </div>
            <h4 className="font-bold text-slate-900 text-xs mb-1">9-Factor Compatibility</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Captures sleep, study, food, cleanliness, and budget preferences during onboarding to calculate weighted fit.
            </p>
          </div>

          <div className="bg-slate-50 p-5 rounded-xl border border-slate-200">
            <div className="w-9 h-9 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-sm mb-3">
              2
            </div>
            <h4 className="font-bold text-slate-900 text-xs mb-1">Mutual Interest Unlock</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Chat unlocks only when both students express mutual interest, avoiding unwanted spam or privacy breaches.
            </p>
          </div>

          <div className="bg-slate-50 p-5 rounded-xl border border-slate-200">
            <div className="w-9 h-9 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center font-bold text-sm mb-3">
              3
            </div>
            <h4 className="font-bold text-slate-900 text-xs mb-1">Moderated Safety Chat</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              In-app messaging automatically masks external phone numbers and links to prevent off-platform leakage.
            </p>
          </div>

          <div className="bg-slate-50 p-5 rounded-xl border border-slate-200">
            <div className="w-9 h-9 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-sm mb-3">
              4
            </div>
            <h4 className="font-bold text-slate-900 text-xs mb-1">Collaborative PG Booking</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Matched roommates view overlapping PG rooms, split monthly rent transparently, and lock in joint reservations.
            </p>
          </div>
        </div>
      </div>

      {/* Mutual Match Modal */}
      {showMatchModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-emerald-300 rounded-2xl p-6 md:p-8 max-w-md w-full text-center relative overflow-hidden shadow-2xl animate-in zoom-in-95">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4 border border-emerald-300">
              <Sparkles className="w-8 h-8 text-emerald-600" />
            </div>

            <h3 className="text-2xl font-black text-slate-900 tracking-tight">IT'S A MUTUAL MATCH! 🎉</h3>
            <p className="text-xs text-slate-600 mt-2">
              You and <span className="font-bold text-emerald-700">{showMatchModal.matchedUser.name}</span> both expressed interest in becoming roommates!
            </p>

            <div className="my-5 p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 flex items-center justify-center gap-3">
              <div className="text-center">
                <img
                  src={currentReq?.student?.user?.avatarUrl || 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=100'}
                  className="w-12 h-12 rounded-full mx-auto mb-1 border-2 border-emerald-500 object-cover"
                />
                <span className="text-slate-900 font-bold">You</span>
              </div>
              <div className="text-emerald-600 font-extrabold text-sm px-2">91% Match</div>
              <div className="text-center">
                <img
                  src={showMatchModal.matchedUser.avatarUrl}
                  className="w-12 h-12 rounded-full mx-auto mb-1 border-2 border-emerald-500 object-cover"
                />
                <span className="text-slate-900 font-bold">{showMatchModal.matchedUser.name}</span>
              </div>
            </div>

            <div className="space-y-2.5">
              <Button
                onClick={() => {
                  const mId = showMatchModal.match.id;
                  setShowMatchModal(null);
                  router.push(`/student/roommates/matches/${mId}/chat`);
                }}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl shadow-md"
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                Open Student Chat Now
              </Button>

              <Button
                onClick={() => setShowMatchModal(null)}
                variant="secondary"
                className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs py-2.5 rounded-xl"
              >
                Continue Browsing Profiles
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
