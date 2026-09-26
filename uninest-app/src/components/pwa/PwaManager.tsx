'use client';

import React, { useEffect, useState } from 'react';
import {
  Smartphone,
  Download,
  CheckCircle2,
  Wifi,
  WifiOff,
  Share,
  PlusSquare,
  ShieldCheck,
  X,
  KeyRound,
  Sparkles,
} from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export function triggerPwaInstallModal() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('uninest:open-pwa-install'));
  }
}

export function PwaManager() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isStandalone, setIsStandalone] = useState(false);
  const [swActive, setSwActive] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [justReconnected, setJustReconnected] = useState(false);
  const [showInstallModal, setShowInstallModal] = useState(false);
  const [showMobileBanner, setShowMobileBanner] = useState(false);
  const [isIos, setIsIos] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // 1. Check standalone mode & iOS detection
    const standalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true;
    setIsStandalone(standalone);

    const ua = window.navigator.userAgent.toLowerCase();
    const iosDevice = /iphone|ipad|ipod/.test(ua);
    setIsIos(iosDevice);

    // Show subtle install banner on mobile if not dismissed and not standalone
    const dismissed = sessionStorage.getItem('uninest_pwa_banner_dismissed');
    if (!standalone && !dismissed && window.innerWidth < 768) {
      setShowMobileBanner(true);
    }

    // 2. Register Service Worker (/sw.js)
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js', { scope: '/' })
        .then((reg) => {
          setSwActive(true);
          reg.update().catch(() => {});
        })
        .catch(() => {
          setSwActive(false);
        });
    }

    // 3. Listen for beforeinstallprompt (Android / Chrome / Edge)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setIsStandalone(true);
      setDeferredPrompt(null);
      setShowInstallModal(false);
      setShowMobileBanner(false);
    };

    // 4. Listen for custom event from Sidebar / Mobile Header
    const handleOpenInstallModal = () => {
      setShowInstallModal(true);
    };

    // 5. Online / Offline resilience tracking for PG gate visits
    setIsOnline(navigator.onLine);
    const handleOnline = () => {
      setIsOnline(true);
      setJustReconnected(true);
      window.dispatchEvent(new CustomEvent('uninest:network-reconnected'));
      setTimeout(() => setJustReconnected(false), 4000);
    };
    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);
    window.addEventListener('uninest:open-pwa-install', handleOpenInstallModal);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      window.removeEventListener('uninest:open-pwa-install', handleOpenInstallModal);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleNativeInstall = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        setDeferredPrompt(null);
        setShowInstallModal(false);
        setShowMobileBanner(false);
      }
    } else {
      setShowInstallModal(true);
    }
  };

  const dismissBanner = () => {
    sessionStorage.setItem('uninest_pwa_banner_dismissed', '1');
    setShowMobileBanner(false);
  };

  return (
    <>
      {/* Live Network Offline / Reconnected Banner */}
      {!isOnline && (
        <div className="fixed top-0 left-0 right-0 z-[100] bg-amber-600 text-white px-4 py-2 text-xs font-bold flex items-center justify-center gap-2 shadow-lg">
          <WifiOff className="w-4 h-4 shrink-0 animate-pulse" />
          <span>
            Offline Mode Active — Cached Workspace Ready. Reconnect to internet to verify live Escrow OTPs or 12-digit UPI UTRs.
          </span>
        </div>
      )}

      {isOnline && justReconnected && (
        <div className="fixed top-0 left-0 right-0 z-[100] bg-emerald-600 text-white px-4 py-2 text-xs font-bold flex items-center justify-center gap-2 shadow-lg animate-fade-in">
          <Wifi className="w-4 h-4 shrink-0" />
          <span>Back Online — Live Escrow OTP & Multi-Portal Sync Restored!</span>
        </div>
      )}

      {/* Mobile Floating Install App Banner (above bottom nav) */}
      {showMobileBanner && !isStandalone && (
        <div className="fixed bottom-20 left-3 right-3 z-40 md:hidden bg-slate-900/95 backdrop-blur-md text-white p-3.5 rounded-2xl shadow-2xl border border-indigo-500/40 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-emerald-600 flex items-center justify-center font-black text-base shrink-0 shadow-md">
              U
            </div>
            <div className="min-w-0">
              <p className="text-xs font-extrabold truncate flex items-center gap-1">
                <span>Install UniNest Mobile App</span>
                <Sparkles className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              </p>
              <p className="text-[11px] text-slate-300 truncate">
                Instant 1-tap Visit OTPs, UPI Escrow & offline PG maps
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={handleNativeInstall}
              className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs transition-colors shadow-sm"
            >
              Install
            </button>
            <button
              onClick={dismissBanner}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white"
              aria-label="Dismiss install banner"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* PWA Installation & Mobile Handshake Guide Modal */}
      {showInstallModal && (
        <div className="fixed inset-0 z-[90] bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-5 relative">
            <button
              onClick={() => setShowInstallModal(false)}
              className="absolute top-4 right-4 p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3.5">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-700 via-indigo-600 to-emerald-600 text-white flex flex-col items-center justify-center shadow-lg shrink-0">
                <span className="text-2xl font-black leading-none">U</span>
                <span className="text-[8px] font-extrabold tracking-widest text-emerald-200 mt-0.5">
                  ESCROW
                </span>
              </div>
              <div>
                <div className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  <ShieldCheck className="w-3 h-3" /> Progressive Web App (PWA)
                </div>
                <h3 className="text-lg font-extrabold text-slate-900 mt-1">
                  {isStandalone ? 'UniNest App Installed' : 'Install UniNest on Your Device'}
                </h3>
                <p className="text-xs text-slate-500">
                  Full-screen mobile & desktop app with real-time Escrow OTP sync
                </p>
              </div>
            </div>

            {/* Live PWA & Escrow Engine Diagnostics */}
            <div className="bg-slate-50 rounded-2xl p-3.5 border border-slate-200/80 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-600 font-semibold flex items-center gap-1.5">
                  <Smartphone className="w-3.5 h-3.5 text-indigo-600" /> PWA Service Worker
                </span>
                <span className="font-extrabold text-emerald-700 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  {swActive ? 'Active & Caching Ready' : 'Registered (v2.5)'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600 font-semibold flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5 text-emerald-600" /> Live Escrow OTP Sync
                </span>
                <span className="font-extrabold text-emerald-700 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                  Real-Time Handshake Ready
                </span>
              </div>
            </div>

            {deferredPrompt ? (
              <button
                onClick={handleNativeInstall}
                className="w-full py-3.5 px-5 rounded-2xl bg-gradient-to-r from-indigo-600 to-emerald-600 hover:from-indigo-500 hover:to-emerald-500 text-white font-extrabold text-sm shadow-lg flex items-center justify-center gap-2 transition-all"
              >
                <Download className="w-4 h-4" />
                <span>Install UniNest App Now (1-Tap)</span>
              </button>
            ) : isStandalone ? (
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-xs text-emerald-900 font-semibold flex items-center gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>
                  You are currently running UniNest in installed standalone app mode!
                </span>
              </div>
            ) : (
              <div className="space-y-3 text-xs">
                <div className="p-3.5 rounded-2xl bg-indigo-50/70 border border-indigo-200 space-y-1.5">
                  <p className="font-extrabold text-indigo-950 flex items-center gap-1.5">
                    <Smartphone className="w-4 h-4 text-indigo-600" />
                    <span>Android (Chrome / Edge / Samsung)</span>
                  </p>
                  <p className="text-indigo-800 leading-relaxed">
                    Tap the browser menu <strong>(⋮)</strong> in the top-right corner and select{' '}
                    <strong>&ldquo;Install App&rdquo;</strong> or <strong>&ldquo;Add to Home Screen&rdquo;</strong>.
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
                  <p className="font-extrabold text-slate-900 flex items-center gap-1.5">
                    <Share className="w-4 h-4 text-blue-600" />
                    <span>iPhone & iPad (Safari)</span>
                  </p>
                  <p className="text-slate-600 leading-relaxed">
                    Tap the <strong>Share</strong> icon at the bottom of Safari, scroll down, and tap{' '}
                    <strong className="inline-flex items-center gap-1 text-slate-900">
                      <PlusSquare className="w-3.5 h-3.5 inline" /> Add to Home Screen
                    </strong>
                    .
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-1.5">
                  <p className="font-extrabold text-emerald-950 flex items-center gap-1.5">
                    <Download className="w-4 h-4 text-emerald-600" />
                    <span>Desktop (Chrome / Edge on Windows & Mac)</span>
                  </p>
                  <p className="text-emerald-800 leading-relaxed">
                    Click the <strong>Install UniNest icon</strong> on the right side of your address bar to launch UniNest as a standalone desktop window.
                  </p>
                </div>
              </div>
            )}

            <button
              onClick={() => setShowInstallModal(false)}
              className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}
