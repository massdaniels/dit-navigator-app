// public/sw.js

// Cache names for different types of assets
const CACHE_NAME = 'dit-navigator-v1';
const DATA_CACHE_NAME = 'dit-navigator-data-v1';

// List of files to cache (your app shell)
const urlsToCache = [
  '/', // The root page
  '/build/', // Contains your Remix app's JS/CSS bundles (Remix serves them from /build)
  // Add other critical static assets like images, fonts if not handled by Remix's build
  // You might need to inspect your /build output to get exact paths for CSS/JS.
  // For production, Workbox is ideal for asset pre-caching.
];

// 1. Install event: Cache app shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Caching app shell');
        return cache.addAll(urlsToCache);
      })
      .catch(error => {
        console.error('Service Worker: Failed to cache app shell', error);
      })
  );
});

// 2. Activate event: Clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== DATA_CACHE_NAME) {
            console.log('Service Worker: Deleting old cache', cacheName);
            return caches.delete(cacheName);
          }
          return null;
        })
      );
    })
  );
  // Ensure the service worker takes control of the page immediately
  event.waitUntil(self.clients.claim());
});

// 3. Fetch event: Intercept network requests
self.addEventListener('fetch', (event) => {
  // We want to handle navigation requests and API calls differently
  const { request } = event;
  const url = new URL(request.url);

  // Strategy for HTML navigation requests (app shell)
  if (request.mode === 'navigate') {
    event.respondWith(
      caches.match(request).then((response) => {
        // If HTML is in cache, return it
        if (response) {
          return response;
        }
        // Otherwise, go to network
        return fetch(request).catch(() => {
          // Fallback for offline navigation (e.g., a simple offline page)
          // You might create a /offline.html page for this
          // return caches.match('/offline.html');
          console.log('Service Worker: Network failed for navigation, no offline fallback');
          return new Response('<h1>You are offline</h1><p>Please check your internet connection.</p>', {
            headers: { 'Content-Type': 'text/html' }
          });
        });
      })
    );
    return;
  }

  // Strategy for API data or dynamic content (Network-First)
  // Adjust this based on your needs: Cache-First, Stale-While-Revalidate
  // For now, let's try network-first for anything not explicitly cached as app shell.
  event.respondWith(
    fetch(request)
      .then(response => {
        // Cache successful network responses (e.g., API calls)
        const responseToCache = response.clone();
        if (response.ok && request.method === 'GET') { // Only cache GET requests
          caches.open(DATA_CACHE_NAME).then(cache => {
            cache.put(request, responseToCache);
          });
        }
        return response;
      })
      .catch(() => {
        // If network fails, try to serve from cache
        return caches.match(request).then(response => {
          if (response) {
            console.log('Service Worker: Serving from data cache:', url.pathname);
            return response;
          }
          // If not in cache, fallback to a default response or indicate offline
          console.log('Service Worker: Request failed from network and not in cache:', url.pathname);
          return new Response('<h1>You are offline</h1><p>Data not available offline.</p>', {
            headers: { 'Content-Type': 'text/html' }
          });
        });
      })
  );
});

// Optional: Message event (e.g., for updating cache)
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});