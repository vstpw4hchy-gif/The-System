const CACHE_NAME = 'the-system-cache-v1';
const ASSETS = ['./', './index.html', './manifest.json', './icon-192.png', './icon-512.png'];

self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.addAll(ASSETS);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys.filter(function(k) { return k !== CACHE_NAME; }).map(function(k) { return caches.delete(k); })
      );
    })
  );
  self.clients.claim();
});

// Network-first: always try to fetch the latest version when online,
// and only fall back to the cached copy if the network request fails.
// This means edits to index.html show up the next time the app is opened
// with a connection, with no need to bump a version number or reinstall.
self.addEventListener('fetch', function(event) {
  event.respondWith(
    fetch(event.request).then(function(response) {
      var copy = response.clone();
      caches.open(CACHE_NAME).then(function(cache) {
        try { cache.put(event.request, copy); } catch (e) {}
      });
      return response;
    }).catch(function() {
      return caches.match(event.request);
    })
  );
});
