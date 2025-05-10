const CACHE_NAME = 'slm-cache-v10'; // Incremented cache version
const urlsToCache = [
  './',
  './index.html',
  './styles.css',
  './script.js',
  './manifest.json',
  './icon.png',
  './favicon.ico',
  'https://cdn.jsdelivr.net/npm/@xenova/transformers@1.3.1/dist/transformers.min.js'
];

// Install event - cache assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(urlsToCache);
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
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Fetch event - serve from cache if available, otherwise fetch from network
self.addEventListener('fetch', event => {
  const transformersUrl = 'https://cdn.jsdelivr.net/npm/@xenova/transformers@1.3.1/dist/transformers.min.js';

  if (event.request.url === transformersUrl) {
    // Always fetch transformers.min.js from network directly
    event.respondWith(
      fetch(event.request).catch(error => {
        console.error('Failed to fetch transformers.min.js:', error);
        throw error;
      })
    );
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Return cached response if found
        if (response) {
          return response;
        }
        
        // Otherwise fetch from network
        return fetch(event.request).then(
          response => {
            // Don't cache if response is not valid
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }
            
            // Clone the response as it's a stream and can only be consumed once
            const responseToCache = response.clone();
            
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });
              
            return response;
          }
        ).catch(error => {
          console.error('Fetch failed for:', event.request.url, error);
          throw error;
        });
      })
  );
});
