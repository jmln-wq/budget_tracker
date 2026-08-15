// ========================================
// Budget Tracker - Service Worker
// ========================================

const CACHE = "budget-v2";

const FILES = [
    "./",
    "./index.html",
    "./style.css",
    "./script.js",
    "./chart.umd.js",
    "./manifest.json",
    "./icons/icon-192.png",
    "./icons/icon-512.png"
];


// ========================================
// INSTALL
// ========================================

self.addEventListener("install", event => {

    event.waitUntil(

        caches.open(CACHE)
            .then(cache => {

                return cache.addAll(FILES);

            })

    );

    // Activate the new worker immediately
    self.skipWaiting();

});


// ========================================
// ACTIVATE
// ========================================

self.addEventListener("activate", event => {

    event.waitUntil(

        caches.keys()
            .then(cacheNames => {

                return Promise.all(

                    cacheNames.map(cacheName => {

                        if (cacheName !== CACHE) {

                            return caches.delete(
                                cacheName
                            );

                        }

                    })

                );

            })

    );

    // Take control of the app immediately
    self.clients.claim();

});


// ========================================
// FETCH
// ========================================

self.addEventListener("fetch", event => {

    event.respondWith(

        caches.match(event.request)
            .then(cachedResponse => {

                // Use cached file if available
                if (cachedResponse) {

                    return cachedResponse;

                }

                // Otherwise get it from the network
                return fetch(event.request);

            })

    );

});
