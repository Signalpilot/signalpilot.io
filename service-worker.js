// DEPRECATED - Service Worker removed to eliminate caching issues
// This file exists only to unregister itself from existing installations

self.addEventListener('install', function(event) {
  console.log('[SW] Uninstalling service worker...');
  self.skipWaiting();
});

self.addEventListener('activate', function(event) {
  console.log('[SW] Cleaning up caches and unregistering...');
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          console.log('[SW] Deleting cache:', cacheName);
          return caches.delete(cacheName);
        })
      );
    }).then(function() {
      console.log('[SW] All caches deleted, service worker will unregister');
      return self.registration.unregister();
    }).then(function() {
      console.log('[SW] Service worker unregistered successfully');
      // Notify all clients to reload
      return self.clients.matchAll();
    }).then(function(clients) {
      clients.forEach(function(client) {
        client.postMessage({
          type: 'SW_UNREGISTERED',
          message: 'Service worker removed, page will reload for fresh content'
        });
      });
    })
  );
});

// No fetch handler - pass through all requests
self.addEventListener('fetch', function(event) {
  // Do nothing - let browser fetch normally
  return;
});
