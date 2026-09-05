// Service Worker for Signal Pilot Education Hub
// Smart caching strategy that respects aggressive cache prevention

const CACHE_VERSION = 'sp-edu-v1';
const STATIC_CACHE = `${CACHE_VERSION}-static`;
const DYNAMIC_CACHE = `${CACHE_VERSION}-dynamic`;
const IMAGE_CACHE = `${CACHE_VERSION}-images`;

// Assets to cache immediately on install
const STATIC_ASSETS = [
  '/',
  '/education/index.html',
  '/education/beginner.html',
  '/education/intermediate.html',
  '/education/advanced.html',
  '/education/calculators.html',
  '/education/search.html',
  '/education/assets/signalpilot-theme.css',
  '/education/assets/edu.css',
  '/education/assets/chatbot.css',
  '/education/assets/notes.css',
  '/education/assets/edu.js',
  '/education/assets/chatbot.js',
  '/education/assets/notes.js',
  '/education/assets/social-share.js',
  '/education/assets/analytics.js',
  '/education/assets/certificate.js',
  '/education/offline.html'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...');

  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('[SW] Caching static assets');
        return cache.addAll(STATIC_ASSETS.filter(url => url !== '/education/offline.html')); // Skip offline.html if doesn't exist yet
      })
      .then(() => self.skipWaiting())
      .catch((err) => {
        console.log('[SW] Install failed:', err);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...');

  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((name) => name.startsWith('sp-edu-') && name !== STATIC_CACHE && name !== DYNAMIC_CACHE && name !== IMAGE_CACHE)
            .map((name) => {
              console.log('[SW] Deleting old cache:', name);
              return caches.delete(name);
            })
        );
      })
      .then(() => self.clients.claim())
  );
});

// Fetch event - smart caching strategy
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip external requests (CDN, analytics, etc)
  if (!url.origin.includes('signalpilot.io') && !url.origin.includes('localhost')) {
    return;
  }

  // HTML files: Network-first (respects cache prevention headers)
  if (request.headers.get('accept')?.includes('text/html')) {
    event.respondWith(networkFirstStrategy(request, DYNAMIC_CACHE));
    return;
  }

  // Images: Cache-first (with long expiry)
  if (request.headers.get('accept')?.includes('image')) {
    event.respondWith(cacheFirstStrategy(request, IMAGE_CACHE));
    return;
  }

  // CSS/JS: Stale-while-revalidate (fast + fresh)
  if (url.pathname.endsWith('.css') || url.pathname.endsWith('.js')) {
    event.respondWith(staleWhileRevalidateStrategy(request, STATIC_CACHE));
    return;
  }

  // Default: Network-first
  event.respondWith(networkFirstStrategy(request, DYNAMIC_CACHE));
});

// STRATEGIES

// Network-first: Try network, fallback to cache (for HTML)
async function networkFirstStrategy(request, cacheName) {
  try {
    const networkResponse = await fetch(request);

    // Only cache successful responses
    if (networkResponse && networkResponse.status === 200) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    // Network failed, try cache
    const cachedResponse = await caches.match(request);

    if (cachedResponse) {
      console.log('[SW] Serving from cache (offline):', request.url);
      return cachedResponse;
    }

    // No cache available, show offline page
    if (request.headers.get('accept')?.includes('text/html')) {
      const offlinePage = await caches.match('/education/offline.html');
      if (offlinePage) return offlinePage;
    }

    // Return error
    return new Response('Offline and no cached version available', {
      status: 503,
      statusText: 'Service Unavailable',
      headers: new Headers({
        'Content-Type': 'text/plain'
      })
    });
  }
}

// Cache-first: Try cache, fallback to network (for images)
async function cacheFirstStrategy(request, cacheName) {
  const cachedResponse = await caches.match(request);

  if (cachedResponse) {
    return cachedResponse;
  }

  try {
    const networkResponse = await fetch(request);

    if (networkResponse && networkResponse.status === 200) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    console.log('[SW] Cache and network both failed for:', request.url);
    return new Response('Resource not available', { status: 404 });
  }
}

// Stale-while-revalidate: Return cache immediately, update in background (for CSS/JS)
async function staleWhileRevalidateStrategy(request, cacheName) {
  const cachedResponse = await caches.match(request);

  const fetchPromise = fetch(request).then((networkResponse) => {
    if (networkResponse && networkResponse.status === 200) {
      // Clone BEFORE using the response (can only read body once)
      const responseToCache = networkResponse.clone();
      caches.open(cacheName).then(cache => {
        cache.put(request, responseToCache);
      });
    }
    return networkResponse;
  }).catch(() => {
    // Network failed, but we already returned cached version
    console.log('[SW] Background update failed for:', request.url);
  });

  // Return cached version immediately, or wait for network if no cache
  return cachedResponse || fetchPromise;
}

// Note: Progress sync is handled in supabase-client.js (not in service worker)
// - Auto-sync every 5 minutes when signed in
// - Sync on page unload (beforeunload event)
// - Sync on auth state change (sign in/out)
// Service worker background sync is not needed as localStorage sync is more reliable

// Push notifications (for future use)
self.addEventListener('push', (event) => {
  const data = event.data?.json() || {};

  const options = {
    body: data.body || 'New content available!',
    icon: '/education/assets/icons/icon-192x192.png',
    badge: '/education/assets/icons/badge-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    }
  };

  event.waitUntil(
    self.registration.showNotification(data.title || 'Signal Pilot Education', options)
  );
});

// Notification click
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked');
  event.notification.close();

  event.waitUntil(
    clients.openWindow('/')
  );
});

console.log('[SW] Service Worker loaded');
