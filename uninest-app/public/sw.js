/**
 * UniNest Production Progressive Web Application (PWA) Service Worker
 * - Ensures real-time network-only execution for all /api/* Escrow, OTP, and UPI UTR routes
 * - Provides fast app-shell caching and graceful offline resilience for mobile & desktop
 */

const CACHE_NAME = 'uninest-pwa-v2.5';
const PRECACHE_URLS = ['/', '/login', '/legal', '/manifest.webmanifest'];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_URLS).catch(() => {
        // Non-blocking precache
      });
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) =>
        Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              return caches.delete(cacheName);
            }
          })
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  // 1. NEVER cache API endpoints — Escrow OTP handshakes, UPI UTR checks, and profile syncs must ALWAYS be real-time
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(fetch(request));
    return;
  }

  // 2. Skip Next.js HMR / webpack internal streams in dev
  if (url.pathname.startsWith('/_next/webpack-hmr')) {
    return;
  }

  // 3. Network-First strategy for HTML navigation & portal routes so live data is always fresh,
  // with instant fallback to cached shell if mobile signal drops momentarily at a PG gate.
  if (request.mode === 'navigate' || (request.headers.get('accept') || '').includes('text/html')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response && response.status === 200) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, copy)).catch(() => {});
          }
          return response;
        })
        .catch(async () => {
          const cached = await caches.match(request);
          if (cached) return cached;
          return caches.match('/');
        })
    );
    return;
  }

  // 4. Stale-While-Revalidate for static assets (icons, fonts, CSS, images)
  if (
    url.pathname.startsWith('/_next/static/') ||
    url.pathname.startsWith('/icon') ||
    url.pathname.startsWith('/apple-icon') ||
    url.pathname.endsWith('.png') ||
    url.pathname.endsWith('.svg') ||
    url.pathname.endsWith('.woff2')
  ) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        const fetchPromise = fetch(request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              const copy = networkResponse.clone();
              caches.open(CACHE_NAME).then((cache) => cache.put(request, copy)).catch(() => {});
            }
            return networkResponse;
          })
          .catch(() => cachedResponse);
        return cachedResponse || fetchPromise;
      })
    );
  }
});
