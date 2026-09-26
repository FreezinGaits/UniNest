/**
 * UniNest Production Progressive Web Application (PWA) Service Worker v3.0
 * - Zero-interference passthrough for all Next.js App Router navigations, RSC streams, and /api/* routes
 * - Prevents Chromium WebAPK/Standalone ERR_FAILED ("This page couldn't load") on redirects and dynamic routes
 */

const CACHE_NAME = 'uninest-pwa-v3.0';
const STATIC_SHELL_ASSETS = ['/icon-192.png', '/icon-512.png', '/manifest.webmanifest'];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      for (const assetUrl of STATIC_SHELL_ASSETS) {
        try {
          const res = await fetch(assetUrl, { cache: 'no-cache' });
          if (res && res.ok && !res.redirected) {
            await cache.put(assetUrl, res);
          }
        } catch {
          // Ignore individual precache errors
        }
      }
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

  // Only serve static PWA icons/manifest from cache-with-network-fallback.
  // All HTML navigations, Next.js RSC payloads, /_next/ chunks, and /api/* routes
  // use native browser networking so redirects, auth cookies, and live data never fail.
  if (STATIC_SHELL_ASSETS.includes(url.pathname)) {
    event.respondWith(
      caches.match(request).then((cached) => {
        const networkFetch = fetch(request)
          .then((response) => {
            if (response && response.status === 200 && !response.redirected) {
              const copy = response.clone();
              caches.open(CACHE_NAME).then((cache) => cache.put(request, copy)).catch(() => {});
            }
            return response;
          })
          .catch(() => cached || new Response('', { status: 504 }));

        return cached || networkFetch;
      })
    );
  }
});
