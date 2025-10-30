// Service Worker for Signal Pilot PWA
// AGGRESSIVE UPDATE STRATEGY: Network-only for HTML, check for updates every 10 seconds
// IMPORTANT: Update CACHE_VERSION on each deployment to match index.html VERSION
const CACHE_VERSION = '202510301909'; // Last updated: 2025-10-30 19:09 UTC
const CACHE_NAME = `signal-pilot-${CACHE_VERSION}`;
const ASSETS_TO_CACHE = [
  '/manifest.json',
  '/favicon.ico',
  '/monogram-square-favicon_192x192.png',
  '/monogram-square-favicon_512x512.png'
];

// Check for updates every 10 seconds
const UPDATE_CHECK_INTERVAL = 10000;

// Install event - cache static assets only
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker version:', CACHE_VERSION);
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Caching static assets');
        return cache.addAll(ASSETS_TO_CACHE);
      })
      .catch((err) => {
        console.log('[SW] Cache failed:', err);
      })
  );
  // Force the waiting service worker to become the active service worker
  self.skipWaiting();
});

// Activate event - clean ALL old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker version:', CACHE_VERSION);
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('[SW] Deleting old cache:', cache);
            return caches.delete(cache);
          }
        })
      );
    })
  );
  // Take control of all clients immediately
  self.clients.claim();
});

// Fetch event - NETWORK FIRST for HTML, cache for other assets
self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Skip cross-origin requests
  if (!request.url.startsWith(self.location.origin)) {
    return;
  }

  // Skip chrome-extension and other protocols
  if (!request.url.startsWith('http')) {
    return;
  }

  // NETWORK ONLY for HTML pages (NO CACHING - always fresh)
  if (request.headers.get('accept').includes('text/html')) {
    event.respondWith(
      fetch(request, {
        cache: 'no-cache',  // Force fresh fetch from server
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache'
        }
      })
        .then((response) => {
          // DO NOT CACHE HTML - return fresh response immediately
          return response;
        })
        .catch(() => {
          // Only use cache as absolute fallback (offline mode)
          return caches.match(request).then((cachedResponse) => {
            return cachedResponse || caches.match('/index.html');
          });
        })
    );
    return;
  }

  // CACHE FIRST for other assets (CSS, JS, images)
  event.respondWith(
    caches.match(request)
      .then((cachedResponse) => {
        if (cachedResponse) {
          // Return cached version but fetch in background to update cache
          fetch(request).then((response) => {
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, response);
            });
          }).catch(() => {});
          return cachedResponse;
        }

        // Not in cache, fetch from network
        return fetch(request).then((response) => {
          // Check if valid response
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }

          // Clone and cache the response
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseToCache);
          });

          return response;
        });
      })
  );
});

// Listen for messages from the client
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    console.log('[SW] Received SKIP_WAITING message');
    self.skipWaiting();
  }

  if (event.data && event.data.type === 'CHECK_UPDATE') {
    console.log('[SW] Checking for updates...');
    self.registration.update();
  }
});

// Periodic update check - check for new service worker every 10 seconds
setInterval(() => {
  console.log('[SW] Periodic update check');
  self.registration.update().catch((err) => {
    console.log('[SW] Update check failed:', err);
  });
}, UPDATE_CHECK_INTERVAL);

// Notify clients when new version is available
self.addEventListener('controllerchange', () => {
  console.log('[SW] Controller changed - new version available');
  self.clients.matchAll().then((clients) => {
    clients.forEach((client) => {
      client.postMessage({
        type: 'NEW_VERSION_AVAILABLE',
        version: CACHE_VERSION
      });
    });
  });
});
