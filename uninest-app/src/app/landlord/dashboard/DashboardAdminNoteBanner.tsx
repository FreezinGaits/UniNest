'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { MessageSquare } from 'lucide-react';
import { AdminMessage } from '@/lib/adminMessagesStore';
import { getLocalMessages } from '@/lib/messagesStorage';

interface DashboardAdminNoteBannerProps {
  initialLatestNote: AdminMessage | null;
}

export function DashboardAdminNoteBanner({ initialLatestNote }: DashboardAdminNoteBannerProps) {
  const [latestNote, setLatestNote] = useState<AdminMessage | null>(initialLatestNote);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const local = getLocalMessages();
      const adminOnly = local.filter((m) => m.fromRole === 'ADMIN');
      if (adminOnly.length > 0) {
        const sorted = [...adminOnly].sort(
          (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );
        setLatestNote(sorted[0]);
      }
    }
  }, []);

  if (!latestNote) return null;

  return (
    <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-300 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-slide-down">
      <div className="flex items-start sm:items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-sm">
          <MessageSquare className="w-5 h-5" />
        </div>
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] font-black uppercase tracking-wider text-amber-900 bg-amber-200/90 px-2 py-0.5 rounded-full">
              Official Communication from UniNest Admin
            </span>
            <span className="text-xs font-bold text-slate-800">
              Regarding: <strong className="text-slate-950 font-black">{latestNote.propertyName || 'Property Portfolio'}</strong>
            </span>
            <span className="text-[11px] text-slate-500">
              {new Date(latestNote.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
          <p className="text-xs font-semibold text-slate-800 mt-1 bg-white/80 px-3 py-1 rounded-lg border border-amber-200/60 inline-block shadow-2xs">
            "{latestNote.message}"
          </p>
        </div>
      </div>
      <Link
        href="/landlord/properties"
        className="bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs px-4 py-2 rounded-xl shrink-0 shadow-sm transition-colors flex items-center gap-1.5"
      >
        <MessageSquare className="w-3.5 h-3.5" />
        View in Properties Portfolio →
      </Link>
    </div>
  );
}
