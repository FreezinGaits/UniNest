'use client';

import React, { useState, useEffect, useRef, use } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft, Send, ShieldCheck, Sparkles, Building2, AlertTriangle,
  Lock, CheckCheck, RefreshCw, Home, Heart, PhoneOff, MessageSquare
} from 'lucide-react';
import { Card, Badge, Button } from '@/components/ui/Shared';

export default function ModeratedRoommateChatPage({
  params: paramsPromise,
}: {
  params: Promise<{ matchId: string }> | { matchId: string };
}) {
  const router = useRouter();
  const routeParams = useParams();
  
  // Safely unwrap matchId from params or routeParams
  const resolvedParams = paramsPromise && typeof (paramsPromise as any).then === 'function' 
    ? use(paramsPromise as Promise<{ matchId: string }>)
    : (paramsPromise as { matchId: string });
    
  const matchId = resolvedParams?.matchId || (routeParams?.matchId as string) || 'match-demo-01';

  const [matchData, setMatchData] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [safetyWarning, setSafetyWarning] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchChat();
  }, [matchId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchChat = async () => {
    try {
      const res = await fetch(`/api/student/roommates/matches/${matchId}/chat`);
      const data = await res.json();
      if (data.success && data.match) {
        setMatchData(data.match);
        setMessages(data.match.messages || []);
      }
    } catch (err) {
      console.error('Error fetching chat:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || sending) return;

    const currentText = inputText;
    setInputText('');
    setSending(true);
    setSafetyWarning(null);

    const senderId = matchData?.studentAId || 'rahul-student-id';
    const partnerId = matchData?.studentBId || 'aman-student-id';

    try {
      const res = await fetch(`/api/student/roommates/matches/${matchId}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderId,
          content: currentText,
        }),
      });

      const data = await res.json();
      if (data.success && data.message) {
        const newMsg = data.message;
        setMessages((prev) => [...prev, newMsg]);

        if (data.isBlocked) {
          setSafetyWarning(data.warningMessage || '⚠️ For your safety, phone numbers, emails, and links are masked.');
        }

        // Simulate interactive reply from Aman Verma after 1.5 seconds if not blocked
        if (!data.isBlocked) {
          setTimeout(() => {
            const partnerReply = {
              id: `msg-reply-${Date.now()}`,
              matchId,
              senderId: partnerId,
              content: "Sounds great! I'm checking double sharing PGs near PCTE campus on UniNest right now. Let's reserve a bed together!",
              isBlocked: false,
              createdAt: new Date().toISOString(),
            };
            setMessages((prev) => [...prev, partnerReply]);
          }, 1500);
        }
      }
    } catch (err) {
      console.error('Error sending chat message:', err);
      // Fallback local append for immediate UI feedback
      const localMsg = {
        id: `msg-local-${Date.now()}`,
        matchId,
        senderId,
        content: currentText,
        isBlocked: false,
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, localMsg]);
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="py-16 text-center">
        <RefreshCw className="w-8 h-8 animate-spin text-emerald-600 mx-auto mb-2" />
        <p className="text-sm font-medium text-slate-600">Loading moderated student chat workspace...</p>
      </div>
    );
  }

  const reqA = matchData?.requestA;
  const reqB = matchData?.requestB;
  const partnerReq = reqB || reqA;
  const score = matchData?.compatibilityScore || 91;

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)] bg-slate-50 border border-slate-200 rounded-2xl overflow-hidden shadow-sm animate-fade-in">
      {/* Top Header */}
      <header className="bg-white border-b border-slate-200 px-5 py-3.5 flex items-center justify-between z-10 shrink-0">
        <div className="flex items-center gap-3.5">
          <Link href="/student/roommates/my-requests">
            <Button variant="secondary" className="bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 text-xs px-3 py-1.5 rounded-xl font-medium">
              <ArrowLeft className="w-4 h-4 mr-1 text-slate-600" />
              Back
            </Button>
          </Link>

          <img
            src={partnerReq?.student?.user?.avatarUrl || 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150'}
            alt={partnerReq?.name || 'Aman Verma'}
            className="w-10 h-10 rounded-full object-cover border-2 border-emerald-300 shadow-sm"
          />

          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-extrabold text-slate-900">{partnerReq?.name || 'Aman Verma'}</h2>
              <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-extrabold px-2 py-0.5 rounded-full flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-emerald-600" />
                {score}% Match
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium">
              {partnerReq?.collegeName || 'PCTE Institute'} • {partnerReq?.course || 'B.Tech CSE'}
            </p>
          </div>
        </div>

        {/* Room Search CTA */}
        <Link href={`/student/roommates/rooms?matchId=${matchId}`}>
          <Button className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2 rounded-xl shadow-sm">
            <Home className="w-4 h-4 mr-1.5" />
            Find a Room Together 🏠
          </Button>
        </Link>
      </header>

      {/* Safety Banner */}
      <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 text-xs text-amber-900 flex items-center justify-between shrink-0 font-medium">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0" />
          <span>
            <strong className="font-bold text-amber-950">UniNest Moderated Safety Chat:</strong> Phone numbers, emails, and external links are masked to protect students from off-platform fraud.
          </span>
        </div>
        <span className="bg-amber-100 text-amber-800 border border-amber-300 text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0">
          🔒 Active Moderation
        </span>
      </div>

      {/* Live Moderation Warning Alert */}
      {safetyWarning && (
        <div className="bg-rose-50 border-b border-rose-200 px-4 py-2.5 text-xs text-rose-800 flex items-center justify-between animate-slide-down shrink-0">
          <div className="flex items-center gap-2 font-medium">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{safetyWarning}</span>
          </div>
          <button onClick={() => setSafetyWarning(null)} className="text-rose-600 hover:underline text-[11px] font-bold">
            Dismiss
          </button>
        </div>
      )}

      {/* Chat Messages Body */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 bg-slate-100/60">
        <div className="text-center my-2">
          <div className="inline-block bg-white border border-slate-200 rounded-full px-4 py-1.5 text-xs text-slate-600 shadow-sm font-medium">
            🎉 You matched with <strong className="text-slate-900">{partnerReq?.name || 'Aman Verma'}</strong>! Preferred Budget: ₹5,000 - ₹7,000/mo near PCTE.
          </div>
        </div>

        {messages.map((msg) => {
          const isMe = msg.senderId === matchData?.studentAId || msg.senderId === 'rahul-student-id';

          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-md rounded-2xl px-4 py-2.5 text-sm shadow-sm ${
                  msg.isBlocked
                    ? 'bg-rose-50 border border-rose-200 text-rose-800 italic font-medium'
                    : isMe
                    ? 'bg-emerald-600 text-white rounded-br-none font-medium'
                    : 'bg-white border border-slate-200 text-slate-900 rounded-bl-none font-medium'
                }`}
              >
                <p>{msg.content}</p>
                <div
                  className={`text-[10px] mt-1 flex items-center gap-1 font-semibold ${
                    isMe ? 'text-emerald-100 justify-end' : 'text-slate-400'
                  }`}
                >
                  {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  {isMe && <CheckCheck className="w-3 h-3 text-emerald-100" />}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Chat Input Bar */}
      <form onSubmit={handleSendMessage} className="bg-white border-t border-slate-200 p-3 md:p-4 shrink-0">
        <div className="flex items-center gap-2 max-w-4xl mx-auto">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type a message... (Try typing a phone number to test safety moderation)"
            className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
          />
          <Button
            type="submit"
            disabled={sending || !inputText.trim()}
            className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl px-5 py-3 font-semibold text-xs shadow-sm"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </form>
    </div>
  );
}
