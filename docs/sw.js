// Signal Pilot Docs - Service Worker for offline access
const CACHE_VERSION = 'sp-docs-v1';
const RUNTIME_CACHE = 'sp-docs-runtime-v1';

// Core shell assets to pre-cache on install
const PRECACHE_URLS = [
  '/',
  '/manifest.json',
  '/assets/stylesheets/main.6543a935.min.css',
  '/assets/stylesheets/palette.06af60db.min.css',
  '/assets/stylesheets/extra.css',
  '/assets/javascripts/bundle.fe8b6f2b.min.js',
  '/favicon-192x192.png',
  '/favicon-512x512.png',
  '/apple-touch-icon.png',
];

// Install: pre-cache core shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION).then((cache) => {
      return cache.addAll(PRECACHE_URLS);
    }).then(() => self.skipWaiting())
  );
});

// Activate: clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys
          .filter((key) => key !== CACHE_VERSION && key !== RUNTIME_CACHE)
          .map((key) => caches.delete(key))
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch strategy
self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Only handle GET requests
  if (request.method !== 'GET') return;

  // Skip cross-origin requests
  if (!request.url.startsWith(self.location.origin)) return;

  const url = new URL(request.url);

  // HTML pages: network-first (fresh content when online, cached when offline)
  if (request.headers.get('accept')?.includes('text/html') ||
      url.pathname.endsWith('/') ||
      url.pathname.endsWith('.html')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(RUNTIME_CACHE).then((cache) => cache.put(request, clone));
          }
          return response;
        })
        .catch(() => {
          return caches.match(request).then((cached) => {
            return cached || caches.match('/');
          });
        })
    );
    return;
  }

  // Static assets (CSS, JS, images, fonts): cache-first
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;

      return fetch(request).then((response) => {
        if (response.ok) {
          const clone = response.clone();
          caches.open(RUNTIME_CACHE).then((cache) => cache.put(request, clone));
        }
        return response;
      });
    })
  );
});
