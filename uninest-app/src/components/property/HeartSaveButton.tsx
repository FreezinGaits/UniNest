'use client';

import React, { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';

const LOCAL_SAVED_KEY = 'uninest_saved_pg_ids';

export function readLocalSavedIds(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(LOCAL_SAVED_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function writeLocalSavedIds(ids: string[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LOCAL_SAVED_KEY, JSON.stringify(Array.from(new Set(ids))));
  } catch {
    // Ignore storage errors
  }
}

interface HeartSaveButtonProps {
  propertyId: string;
  initialSaved?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'icon-only' | 'button';
  onToggle?: (saved: boolean) => void;
}

export function HeartSaveButton({
  propertyId,
  initialSaved = false,
  size = 'md',
  variant = 'icon-only',
  onToggle,
}: HeartSaveButtonProps) {
  const [isSaved, setIsSaved] = useState(initialSaved);
  const [loading, setLoading] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  useEffect(() => {
    const localIds = readLocalSavedIds();
    if (localIds.includes(propertyId)) {
      setIsSaved(true);
    } else {
      setIsSaved(initialSaved);
    }
  }, [initialSaved, propertyId]);

  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (loading) return;
    const nextSaved = !isSaved;
    setIsSaved(nextSaved);
    setLoading(true);

    // Immediately update localStorage for instant cross-tab/page sync
    const currentLocal = readLocalSavedIds();
    if (nextSaved) {
      writeLocalSavedIds([...currentLocal, propertyId]);
    } else {
      writeLocalSavedIds(currentLocal.filter((id) => id !== propertyId));
    }

    try {
      const res = await fetch('/api/student/saved', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ propertyId }),
      });

      const data = await res.json().catch(() => ({}));
      setLoading(false);

      if (res.ok && (data.success || typeof data.saved === 'boolean')) {
        const finalSaved = typeof data.saved === 'boolean' ? data.saved : nextSaved;
        setIsSaved(finalSaved);
        if (Array.isArray(data.savedIds)) {
          writeLocalSavedIds(data.savedIds);
        }
        const msg = data.message || (finalSaved ? 'Property saved to shortlist' : 'Removed from saved properties');
        setToastMsg(msg);
        if (onToggle) onToggle(finalSaved);
        setTimeout(() => setToastMsg(null), 2500);
      } else {
        // Keep optimistic localStorage state if offline, or notify user
        const msg = nextSaved ? 'Property saved to shortlist' : 'Removed from saved properties';
        setToastMsg(msg);
        if (onToggle) onToggle(nextSaved);
        setTimeout(() => setToastMsg(null), 2500);
      }
    } catch {
      setLoading(false);
      const msg = nextSaved ? 'Property saved to shortlist' : 'Removed from saved properties';
      setToastMsg(msg);
      if (onToggle) onToggle(nextSaved);
      setTimeout(() => setToastMsg(null), 2500);
    }
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  if (variant === 'button') {
    return (
      <div className="relative inline-block">
        <button
          type="button"
          onClick={handleToggle}
          disabled={loading}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all border ${
            isSaved
              ? 'bg-rose-50 border-rose-200 text-rose-600 hover:bg-rose-100'
              : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          <Heart
            className={`${iconSizes[size]} ${
              isSaved ? 'fill-rose-500 text-rose-500' : 'text-slate-400 hover:text-rose-500'
            } transition-colors`}
          />
          <span>{isSaved ? '♥ Saved' : '♡ Save Property'}</span>
        </button>

        {toastMsg && (
          <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 z-50 whitespace-nowrap bg-slate-900 text-white text-[11px] font-semibold px-3 py-1.5 rounded-lg shadow-xl animate-fade-in border border-slate-700">
            {toastMsg}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="relative inline-block">
      <button
        type="button"
        onClick={handleToggle}
        disabled={loading}
        title={isSaved ? 'Remove from saved' : 'Save property'}
        className={`p-2.5 rounded-full transition-all backdrop-blur-md ${
          isSaved
            ? 'bg-rose-500/90 text-white shadow-md shadow-rose-500/30'
            : 'bg-white/80 hover:bg-white text-slate-600 hover:text-rose-500 border border-slate-200/60 shadow-sm'
        }`}
      >
        <Heart
          className={`${iconSizes[size]} ${
            isSaved ? 'fill-white text-white' : 'text-slate-600 hover:text-rose-500'
          } transition-transform active:scale-125`}
        />
      </button>

      {toastMsg && (
        <div className="absolute top-full mt-2 right-0 z-50 whitespace-nowrap bg-slate-900 text-white text-[11px] font-semibold px-3 py-1.5 rounded-lg shadow-xl animate-fade-in border border-slate-700">
          {toastMsg}
        </div>
      )}
    </div>
  );
}
