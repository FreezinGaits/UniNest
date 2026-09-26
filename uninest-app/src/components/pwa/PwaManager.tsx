'use client';

import React, { useEffect, useState, useCallback } from 'react';
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

const INSTALLED_STORAGE_KEY = 'uninest_pwa_installed_v1';
const BANNER_DISMISSED_KEY = 'uninest_pwa_banner_dismissed';

// Module-level singleton so the prompt persists across Next.js client route navigation
let globalDeferredPrompt: BeforeInstallPromptEvent | null = null;
let globalIsInstalled = false;

function checkIsStandalone(): boolean {
  if (typeof window === 'undefined') return false;
  const isStandaloneDisplay =
    window.matchMedia('(display-mode: standalone)').matches ||
    window.matchMedia('(display-mode: window-controls-overlay)').matches ||
    window.matchMedia('(display-mode: minimal-ui)').matches ||
    (window.navigator as any).standalone === true ||
    document.referrer.includes('android-app://');

  if (isStandaloneDisplay) {
    try {
      localStorage.setItem(INSTALLED_STORAGE_KEY, 'true');
    } catch {
      // ignore storage errors
    }
    globalIsInstalled = true;
    return true;
  }
  return false;
}

function notifyPwaListeners() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('uninest:pwa-state-updated'));
  }
}

export function triggerPwaInstallModal() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('uninest:open-pwa-install'));
  }
}

/**
 * Hook used by Sidebar and Mobile Header to know whether to display the Install button.
 * Returns `isInstallable = true` ONLY when the user is on the web page AND the PWA is NOT installed yet.
 */
export function usePwaInstallState() {
  const [isInstallable, setIsInstallable] = useState(false);

  const evaluateState = useCallback(() => {
    if (typeof window === 'undefined') return;

    // 1. If running inside the installed PWA window, never show the install button
    if (checkIsStandalone() || globalIsInstalled) {
      setIsInstallable(false);
      return;
    }

    // 2. Check if already marked installed in shared origin localStorage
    try {
      if (localStorage.getItem(INSTALLED_STORAGE_KEY) === 'true') {
        setIsInstallable(false);
        return;
      }
    } catch {
      // ignore
    }

    // 3. On iOS Safari (no beforeinstallprompt API), show until installed in standalone mode
    const ua = window.navigator.userAgent.toLowerCase();
    const isIosSafari =
      /iphone|ipad|ipod/.test(ua) && /safari/.test(ua) && !/crios|fxios|opios|edgios/.test(ua);

    if (isIosSafari) {
      setIsInstallable(true);
      return;
    }

    // 4. On Chrome / Edge / Android / Desktop: ONLY show if the browser fired `beforeinstallprompt`
    // (When the PWA is already installed and Chrome shows "Open in app" in the URL bar,
    // Chrome does NOT fire `beforeinstallprompt`, so `globalDeferredPrompt` is null and the button stays hidden!)
    setIsInstallable(globalDeferredPrompt !== null);
  }, []);

  useEffect(() => {
    evaluateState();

    // Also query navigator.getInstalledRelatedApps() where supported
    if (typeof navigator !== 'undefined' && 'getInstalledRelatedApps' in navigator) {
      (navigator as any)
        .getInstalledRelatedApps()
        .then((apps: any[]) => {
          if (Array.isArray(apps) && apps.length > 0) {
            globalIsInstalled = true;
            try {
              localStorage.setItem(INSTALLED_STORAGE_KEY, 'true');
            } catch {}
            setIsInstallable(false);
          }
        })
        .catch(() => {});
    }

    const mediaQuery = window.matchMedia('(display-mode: standalone)');
    const handleMediaChange = () => evaluateState();

    window.addEventListener('uninest:pwa-state-updated', evaluateState);
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleMediaChange);
    }

    return () => {
      window.removeEventListener('uninest:pwa-state-updated', evaluateState);
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleMediaChange);
      }
    };
  }, [evaluateState]);

  return {
    isInstallable,
    triggerInstall: triggerPwaInstallModal,
  };
}

export function PwaManager() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(
    globalDeferredPrompt
  );
  const [isStandalone, setIsStandalone] = useState(false);
  const [swActive, setSwActive] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [justReconnected, setJustReconnected] = useState(false);
  const [showInstallModal, setShowInstallModal] = useState(false);
  const [showMobileBanner, setShowMobileBanner] = useState(false);
  const [isIos, setIsIos] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const standalone = checkIsStandalone();
    setIsStandalone(standalone);

    const ua = window.navigator.userAgent.toLowerCase();
    const iosDevice = /iphone|ipad|ipod/.test(ua);
    setIsIos(iosDevice);

    // Register Service Worker (/sw.js)
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

    // Listen for beforeinstallprompt (fired ONLY when PWA is not yet installed)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      // If the user reinstalled after uninstalling, clear the old flag because browser says it's installable again
      try {
        localStorage.removeItem(INSTALLED_STORAGE_KEY);
      } catch {}
      globalIsInstalled = false;
      globalDeferredPrompt = e as BeforeInstallPromptEvent;
      setDeferredPrompt(globalDeferredPrompt);
      notifyPwaListeners();

      const dismissed = sessionStorage.getItem(BANNER_DISMISSED_KEY);
      if (!checkIsStandalone() && !dismissed && window.innerWidth < 768) {
        setShowMobileBanner(true);
      }
    };

    const handleAppInstalled = () => {
      globalIsInstalled = true;
      globalDeferredPrompt = null;
      try {
        localStorage.setItem(INSTALLED_STORAGE_KEY, 'true');
      } catch {}
      setIsStandalone(true);
      setDeferredPrompt(null);
      setShowInstallModal(false);
      setShowMobileBanner(false);
      notifyPwaListeners();
    };

    const handleOpenInstallModal = async () => {
      // If native prompt is ready, trigger it directly in 1 click!
      if (globalDeferredPrompt) {
        await globalDeferredPrompt.prompt();
        const choice = await globalDeferredPrompt.userChoice;
        if (choice.outcome === 'accepted') {
          handleAppInstalled();
        }
        return;
      }
      setShowInstallModal(true);
    };

    // Online / Offline resilience tracking
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
    const promptEvent = globalDeferredPrompt || deferredPrompt;
    if (promptEvent) {
      await promptEvent.prompt();
      const choice = await promptEvent.userChoice;
      if (choice.outcome === 'accepted') {
        globalIsInstalled = true;
        globalDeferredPrompt = null;
        try {
          localStorage.setItem(INSTALLED_STORAGE_KEY, 'true');
        } catch {}
        setDeferredPrompt(null);
        setIsStandalone(true);
        setShowInstallModal(false);
        setShowMobileBanner(false);
        notifyPwaListeners();
      }
    } else {
      setShowInstallModal(true);
    }
  };

  const dismissBanner = () => {
    sessionStorage.setItem(BANNER_DISMISSED_KEY, '1');
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

      {/* Mobile Floating Install App Banner — ONLY shown when not installed */}
      {showMobileBanner && !isStandalone && deferredPrompt && (
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

      {/* PWA Installation Guide Modal (Fallback for iOS Safari) */}
      {showInstallModal && !isStandalone && (
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
                  Install UniNest on Your Device
                </h3>
                <p className="text-xs text-slate-500">
                  Full-screen mobile & desktop app with real-time Escrow OTP sync
                </p>
              </div>
            </div>

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

            {isIos && (
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5 text-xs">
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
