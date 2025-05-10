const CACHE_NAME = 'slm-cache-v11'; // Incremented cache version
const TRANSFORMERS_URL = 'https://cdn.jsdelivr.net/npm/@xenova/transformers@1.3.1/dist/transformers.min.js';

const urlsToCache = [
  './',
  './index.html',
  './styles.css',
  './script.js',
  './manifest.json',
  './icon.png',
  './favicon.ico',
  TRANSFORMERS_URL // Added Transformers.js library to cache
];

// Install event - cache assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Service Worker: Caching files:', urlsToCache); // Added log
        return cache.addAll(urlsToCache);
      })
      .catch(err => { // Added catch for install phase logging
        console.error('Service Worker: Failed to cache files during install:', err);
        // Not re-throwing err here to allow SW to install even if one asset fails,
        // though addAll is atomic. If it fails, it rejects.
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Service Worker: Deleting old cache:', cacheName); // Added log
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Fetch event - serve from cache if available, otherwise fetch from network
self.addEventListener('fetch', event => {
  // Removed the specific 'if (event.request.url === transformersUrl)' block.
  // All requests, including for transformers.min.js, will now use the cache-first strategy.

  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Return cached response if found
        if (response) {
          return response;
        }
        
        // Otherwise fetch from network
        return fetch(event.request).then(
          networkResponse => {
            // Don't cache if response is not valid (original condition)
            // This means opaque responses fetched here won't be cached by this block.
            // However, TRANSFORMERS_URL should have been cached during 'install'.
            if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
              return networkResponse;
            }
            
            // Clone the response as it's a stream and can only be consumed once
            const responseToCache = networkResponse.clone();
            
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });
              
            return networkResponse;
          }
        ).catch(error => {
          console.error('Service Worker: Fetch failed for:', event.request.url, error);
          // If fetch fails (e.g., offline) and not in cache, this will propagate the error.
          throw error;
        });
      })
  );
});
