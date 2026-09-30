'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Users, MessageSquare, Sparkles, ShieldCheck, Heart, ArrowLeft,
  CheckCircle2, AlertCircle, Edit, PauseCircle, XCircle, Eye
} from 'lucide-react';
import { Card, Badge, Button } from '@/components/ui/Shared';
import { formatINR } from '@/lib/utils';
import { useDashboardUser } from '@/components/layout/DashboardShell';

export default function MyRoommateRequestsDashboard() {
  const { isDemoUser, userName, userEmail } = useDashboardUser();
  const [activeTab, setActiveTab] = useState<'REQUEST' | 'INTERESTS' | 'MATCHES'>('MATCHES');
  const [myReq, setMyReq] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [simranStatus, setSimranStatus] = useState<'PENDING' | 'ACCEPTED' | 'DECLINED'>('PENDING');
  const [activeChatMatch, setActiveChatMatch] = useState<string>(isDemoUser ? 'Aman Verma' : 'No active matches yet');

  useEffect(() => {
    fetchMyDetails();
  }, [userEmail, isDemoUser]);

  const fetchMyDetails = async () => {
    try {
      const localReq = userEmail ? localStorage.getItem('uninest_roommate_request_' + userEmail) : null;
      if (localReq) {
        try {
          setMyReq(JSON.parse(localReq));
        } catch {}
      }
      const res = await fetch('/api/student/roommates');
      const data = await res.json();
      if (data.success && data.currentStudentRequest) {
        if (isDemoUser || data.currentStudentRequest.id !== 'req-rahul-id') {
          setMyReq(data.currentStudentRequest);
        }
      }
    } catch (err) {
      console.error('Error loading my request:', err);
    } finally {
      setLoading(false);
    }
  };

  const activeMatchesCount = isDemoUser ? (simranStatus === 'ACCEPTED' ? 2 : 1) : 0;
  const receivedInterestsCount = isDemoUser ? (simranStatus === 'PENDING' ? 1 : 0) : 0;

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Navigation Header */}
        <div className="flex items-center justify-between">
          <Link href="/student/roommates">
            <Button variant="secondary" className="bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 text-xs py-2 rounded-xl">
              <ArrowLeft className="w-4 h-4 mr-1 text-slate-600" />
              Roommate Marketplace Feed
            </Button>
          </Link>
          <Link href="/student/roommates/create">
            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2 rounded-xl shadow-sm">
              <Edit className="w-3.5 h-3.5 mr-1.5" />
              {myReq || isDemoUser ? 'Edit My Request' : 'Publish Request'}
            </Button>
          </Link>
        </div>

        {/* Hero Header */}
        <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-700 p-6 md:p-8 rounded-2xl text-white shadow-md">
          <h1 className="text-2xl font-extrabold text-white">My Roommate Dashboard</h1>
          <p className="text-xs md:text-sm text-emerald-100 mt-1">
            {isDemoUser
              ? `Manage your active request, respond to incoming student interest, and chat with your mutual matches (${activeChatMatch}).`
              : 'Manage your roommate request, respond to incoming student interest, and chat with mutual matches.'}
          </p>

          {/* Navigation Tabs */}
          <div className="flex flex-wrap gap-2 mt-6 pt-4 border-t border-white/20 text-xs font-semibold">
            <button
              onClick={() => setActiveTab('MATCHES')}
              className={`px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
                activeTab === 'MATCHES'
                  ? 'bg-white text-emerald-800 font-bold shadow-md'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              Active Matches ({activeMatchesCount})
            </button>
            <button
              onClick={() => setActiveTab('INTERESTS')}
              className={`px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
                activeTab === 'INTERESTS'
                  ? 'bg-white text-emerald-800 font-bold shadow-md'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
              Received Interests ({receivedInterestsCount})
            </button>
            <button
              onClick={() => setActiveTab('REQUEST')}
              className={`px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
                activeTab === 'REQUEST'
                  ? 'bg-white text-emerald-800 font-bold shadow-md'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              <Users className="w-3.5 h-3.5 text-indigo-600" />
              My Published Request
            </button>
          </div>
        </div>

        {/* Tab 1: Active Matches */}
        {activeTab === 'MATCHES' && (
          <div className="space-y-4">
            {!isDemoUser ? (
              <div className="bg-white border border-slate-200 p-8 rounded-2xl shadow-sm text-center space-y-3">
                <Users className="w-10 h-10 text-slate-300 mx-auto" />
                <h3 className="text-base font-bold text-slate-800">No Active Roommate Matches Yet</h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  Publish your roommate request or browse the Roommate Marketplace to send interest to compatible students.
                </p>
                <div className="pt-2 flex justify-center gap-2">
                  <Link href="/student/roommates">
                    <Button className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2 rounded-xl">
                      Browse Roommates
                    </Button>
                  </Link>
                  <Link href="/student/roommates/create">
                    <Button variant="secondary" className="bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 text-xs font-bold px-4 py-2 rounded-xl">
                      Publish My Request
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <>
                <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <img
                      src="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150"
                      alt="Aman Verma"
                      className="w-14 h-14 rounded-full object-cover border-2 border-emerald-300 shadow-sm"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-bold text-slate-900">Aman Verma</h3>
                        <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 rounded-full text-xs font-extrabold">
                          91% Match
                        </span>
                      </div>
                      <p className="text-xs text-slate-500">PCTE Institute of Technology • B.Tech CSE Year 2</p>
                      <p className="text-xs text-emerald-700 font-semibold mt-1">
                        💬 Last message: &quot;Awesome, same here! Let us check compatible rooms together...&quot;
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Link href="/student/roommates/matches/match-rahul-aman/chat">
                      <Button className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-sm">
                        <MessageSquare className="w-4 h-4 mr-1.5" />
                        Open Chat
                      </Button>
                    </Link>
                    <Link href="/student/roommates/rooms">
                      <Button variant="secondary" className="bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 text-xs px-3 py-2 rounded-xl font-medium">
                        Shared PGs
                      </Button>
                    </Link>
                  </div>
                </div>

                {simranStatus === 'ACCEPTED' && (
                  <div className="bg-white border border-emerald-200 p-5 rounded-2xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <img
                        src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"
                        alt="Simran Kaur"
                        className="w-14 h-14 rounded-full object-cover border-2 border-emerald-300 shadow-sm"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-base font-bold text-slate-900">Simran Kaur</h3>
                          <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 rounded-full text-xs font-extrabold">
                            84% Match
                          </span>
                        </div>
                        <p className="text-xs text-slate-500">PCTE Institute of Technology • BBA Year 3</p>
                        <p className="text-xs text-emerald-700 font-semibold mt-1">
                          💬 Mutual match unlocked! Start chatting about BRS Nagar PGs.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <Link href="/student/roommates/matches/match-rahul-simran/chat">
                        <Button className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-sm">
                          <MessageSquare className="w-4 h-4 mr-1.5" />
                          Open Chat
                        </Button>
                      </Link>
                      <Link href="/student/roommates/rooms">
                        <Button variant="secondary" className="bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 text-xs px-3 py-2 rounded-xl font-medium">
                          Shared PGs
                        </Button>
                      </Link>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* Tab 2: Received Interests */}
        {activeTab === 'INTERESTS' && (
          <div className="space-y-4">
            {!isDemoUser ? (
              <div className="bg-white border border-slate-200 p-8 rounded-2xl shadow-sm text-center space-y-2">
                <Heart className="w-10 h-10 text-slate-300 mx-auto" />
                <h3 className="text-base font-bold text-slate-800">No Pending Interest Requests</h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  When other students express interest in your roommate profile, they will appear here.
                </p>
              </div>
            ) : simranStatus === 'DECLINED' ? (
              <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm text-center text-xs text-slate-500">
                No pending roommate interest requests. (Simran Kaur&apos;s interest was declined.)
              </div>
            ) : (
              <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <img
                    src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"
                    alt="Simran Kaur"
                    className="w-14 h-14 rounded-full object-cover border-2 border-indigo-300 shadow-sm"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-slate-900">Simran Kaur</h3>
                      <span className="bg-indigo-50 text-indigo-700 border border-indigo-200 px-2.5 py-0.5 rounded-full text-xs font-extrabold">
                        84% Match
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">PCTE Institute of Technology • BBA Year 3</p>
                    <p className="text-xs text-slate-600 mt-1">Expressed interest in becoming your roommate in BRS Nagar.</p>
                  </div>
                </div>

                {simranStatus === 'ACCEPTED' ? (
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl">
                      ✓ Matched with Simran Kaur
                    </span>
                    <Link href="/student/roommates/matches/match-rahul-simran/chat">
                      <Button className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-sm">
                        Open Chat
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      onClick={() => {
                        setSimranStatus('ACCEPTED');
                        setActiveChatMatch('Simran Kaur');
                      }}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-sm"
                    >
                      Accept &amp; Match
                    </Button>
                    <Button
                      onClick={() => setSimranStatus('DECLINED')}
                      variant="secondary"
                      className="bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 text-xs px-3 py-2 rounded-xl"
                    >
                      Decline
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: My Published Request (My Active Roommate Request) */}
        {activeTab === 'REQUEST' && (
          !myReq && !isDemoUser ? (
            <div className="bg-white border border-slate-200 p-8 rounded-2xl shadow-sm text-center space-y-3">
              <Sparkles className="w-10 h-10 text-emerald-500 mx-auto" />
              <h3 className="text-base font-bold text-slate-800">No Roommate Request Published Yet</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Create your roommate profile with your preferred locality, budget, and study habits so compatible students can match with you.
              </p>
              <div className="pt-2">
                <Link href="/student/roommates/create">
                  <Button className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-5 py-2.5 rounded-xl">
                    Create Roommate Request
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 rounded-full text-xs font-bold inline-block mb-2">
                    Status: {myReq?.status || 'ACTIVE'}
                  </span>
                  <h3 className="text-lg font-bold text-slate-900">
                    {myReq?.name || userName || 'Rahul Sharma'} — My Active Roommate Request
                  </h3>
                  <p className="text-xs text-slate-500">
                    {myReq?.collegeName || 'PCTE Institute of Technology'} • {myReq?.course || 'B.Tech CSE'} • Year {myReq?.year || 2}
                  </p>
                </div>

                <Link href="/student/roommates/create">
                  <Button variant="secondary" className="bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 text-xs py-2 rounded-xl font-medium">
                    <Edit className="w-3.5 h-3.5 mr-1 text-slate-600" />
                    Edit Profile
                  </Button>
                </Link>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
                <div>
                  <span className="text-slate-500 block">Locality:</span>
                  <span className="text-slate-800 font-semibold">
                    {myReq?.Area || myReq?.locality || 'Ferozepur Road / Passi Nagar'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">Budget:</span>
                  <span className="text-emerald-700 font-extrabold">
                    {myReq?.budgetMax ? formatINR(myReq.budgetMax > 50000 ? myReq.budgetMax : myReq.budgetMax * 100) : '₹6,500'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">Room Type:</span>
                  <span className="text-slate-800 font-semibold">
                    {myReq?.roomType || '2-Sharing'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">Move-In / Sleep:</span>
                  <span className="text-slate-800 font-semibold">
                    {myReq?.moveInDate
                      ? new Date(myReq.moveInDate).toLocaleDateString('en-IN')
                      : myReq?.sleepSchedule || 'Night Owl'}
                  </span>
                </div>
              </div>

              <p className="text-xs text-slate-600 italic">
                &quot;{myReq?.bio || myReq?.description || 'Focused on studies, clean, non-smoker and prefer a quiet room near PCTE campus.'}&quot;
              </p>
            </div>
          )
        )}
      </div>
    </div>
  );
}
