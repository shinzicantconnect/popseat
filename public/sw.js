// Pop Seat Cinema — pass-through service worker
// Registers install/activate/fetch handlers so PWABuilder detects an active SW.

self.addEventListener('install', (event) => {
  // Skip waiting so the new SW activates immediately
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  // Claim all open clients immediately
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  // Pass every request straight through to the network (no caching)
  event.respondWith(fetch(event.request));
});

