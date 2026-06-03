const CACHE_NAME = "trainer-app-v1";

// 🔥 Grund-Assets (deine App bleibt stabil)
const STATIC_ASSETS = [
    "./",
    "./index.html",
    "./manifest.json",
    "./service-worker.js"
];

// =========================
// INSTALL
// =========================
self.addEventListener("install", (event) => {
    self.skipWaiting();

    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(STATIC_ASSETS);
        })
    );
});

// =========================
// ACTIVATE
// =========================
self.addEventListener("activate", (event) => {
    event.waitUntil(
        clients.claim()
    );
});

// =========================
// FETCH (HIER PASSIERT DIE MAGIE)
// =========================
self.addEventListener("fetch", (event) => {
    const requestUrl = event.request.url;

    event.respondWith(
        caches.match(event.request).then((cached) => {
            if (cached) return cached;

            return fetch(event.request).then((response) => {
                // Nur gültige Responses cachen
                if (
                    !response ||
                    response.status !== 200 ||
                    response.type !== "basic"
                ) {
                    return response;
                }

                // 🔥 WICHTIG: Flags automatisch mitspeichern
                const shouldCache =
                    requestUrl.includes("/flags/") ||   // 👈 deine Flaggen
                    requestUrl.endsWith(".png") ||      // optional: Bilder allgemein
                    requestUrl.includes("index.html") ||
                    requestUrl.includes("manifest.json");

                if (shouldCache) {
                    const responseClone = response.clone();
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(event.request, responseClone);
                    });
                }

                return response;
            }).catch(() => {
                // Offline-Fallback (optional)
                return caches.match("./");
            });
        })
    );
});