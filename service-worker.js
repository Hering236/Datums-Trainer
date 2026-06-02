const CACHE_NAME = "trainer-app-v2"; // 🔥 Version erhöhen WICHTIG

const urlsToCache = [
  "./",
  "./index.html",
  "./manifest.json"
];

// =====================
// INSTALL (Cache initial)
// =====================
self.addEventListener("install", event => {
  self.skipWaiting(); // 🔥 sofort aktiv werden

  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(urlsToCache);
    })
  );
});

// =====================
// ACTIVATE (alte Caches löschen)
// =====================
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) {
            return caches.delete(key); // 🔥 alte Versionen löschen
          }
        })
      );
    })
  );

  self.clients.claim(); // sofort Kontrolle übernehmen
});

// =====================
// FETCH (Network first, fallback cache)
// =====================
self.addEventListener("fetch", event => {

  event.respondWith(
    fetch(event.request)
      .then(response => {
        // neue Version immer cachen
        const responseClone = response.clone();
        caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, responseClone);
        });
        return response;
      })
      .catch(() => {
        // offline fallback
        return caches.match(event.request);
      })
  );
});