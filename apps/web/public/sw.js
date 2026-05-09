/* Work Product of Gerald Shikunyi Kombo. Trading as Gerald Shikunyi Kombo (Digital Services). Intellectual Property Rights Reserved. */

const CACHE_NAME = 'taluq-v2026-bundles-optimized';
const OFFLINE_URL = '/';

// Pre-cache essential assets to save bundles on repeat visits
const PRECACHE_ASSETS = [
  '/',
  '/manifest.webmanifest',
  // In a real build, we'd inject Webpack/Next.js chunk hashes here
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.filter((name) => name !== CACHE_NAME).map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

// Cache-First Strategy for static assets (Saves MBs of data for Kenyans)
// Network-First Strategy for API calls to ensure live balance
self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Ignore non-GET requests (POST, PUT, etc)
  if (request.method !== 'GET') return;

  // API calls: Network-first, fallback to cache
  if (request.url.includes('/api/')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const resClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, resClone));
          return response;
        })
        .catch(() => caches.match(request))
    );
    return;
  }

  // Static Assets & Navigation: Cache-first, fallback to network
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse; // Bundle saver!
      }
      return fetch(request).then((networkResponse) => {
        // Cache new assets on the fly
        if (request.url.startsWith('http') && !request.url.includes('chrome-extension')) {
          const resClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, resClone));
        }
        return networkResponse;
      }).catch(() => {
        // If everything fails (no network, no cache), return the offline page
        if (request.mode === 'navigate') {
          return caches.match(OFFLINE_URL);
        }
      });
    })
  );
});

self.addEventListener('sync', (event) => {
  if (event.tag === 'taluq-p2p-sync') {
    event.waitUntil(
      // Mock background sync execution for when a user reconnects to network
      Promise.resolve().then(() => console.log('[Taluq Service Worker] Background Sync: P2P transfer processed offline.'))
    );
  }
});
