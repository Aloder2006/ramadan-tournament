/* ═══════════════════════════════════════════════════
   Ramadan Tournament — Service Worker
   ═══════════════════════════════════════════════════
   - Cache-First   → static assets (CSS, JS, fonts, images)
   - Network-First → API calls (always fresh if online, cached if offline)
   - Clears old caches on activation
   ═══════════════════════════════════════════════════ */

const CACHE_VERSION = 'ramadan-v1';
const STATIC_CACHE = `${CACHE_VERSION}-static`;
const API_CACHE = `${CACHE_VERSION}-api`;

/* ─── Assets to pre-cache on install ─── */
const PRECACHE_URLS = [
    '/',
    '/index.html',
    '/manifest.json',
    '/icon-192x192.png',
    '/icon-512x512.png',
];

/* ─── INSTALL ─── */
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(STATIC_CACHE)
            .then((cache) => cache.addAll(PRECACHE_URLS))
            .then(() => self.skipWaiting())
    );
});

/* ─── ACTIVATE — clear old caches ─── */
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) =>
            Promise.all(
                keys
                    .filter((key) => key !== STATIC_CACHE && key !== API_CACHE)
                    .map((key) => caches.delete(key))
            )
        ).then(() => self.clients.claim())
    );
});

/* ─── FETCH ─── */
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // Skip non-GET requests
    if (request.method !== 'GET') return;

    // Skip chrome-extension, etc.
    if (!url.protocol.startsWith('http')) return;

    // ── API calls → Network-First ──
    if (url.pathname.startsWith('/api/')) {
        event.respondWith(networkFirst(request));
        return;
    }

    // ── Google Fonts → Cache-First ──
    if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') {
        event.respondWith(cacheFirst(request, STATIC_CACHE));
        return;
    }

    // ── Static assets → Cache-First ──
    if (isStaticAsset(url.pathname)) {
        event.respondWith(cacheFirst(request, STATIC_CACHE));
        return;
    }

    // ── Navigation requests (SPA) → Network-First with fallback to cached index.html ──
    if (request.mode === 'navigate') {
        event.respondWith(
            fetch(request)
                .then((response) => {
                    const clone = response.clone();
                    caches.open(STATIC_CACHE).then((cache) => cache.put(request, clone));
                    return response;
                })
                .catch(() => caches.match('/index.html'))
        );
        return;
    }

    // ── Everything else → Network-First ──
    event.respondWith(networkFirst(request));
});

/* ═══════════════════════════════════════════════════
   STRATEGIES
   ═══════════════════════════════════════════════════ */

/**
 * Cache-First: check cache → if miss, fetch & cache
 */
async function cacheFirst(request, cacheName) {
    const cached = await caches.match(request);
    if (cached) return cached;

    try {
        const response = await fetch(request);
        if (response.ok) {
            const cache = await caches.open(cacheName);
            cache.put(request, response.clone());
        }
        return response;
    } catch {
        // Offline and not cached — return a minimal fallback
        return new Response('Offline', { status: 503, statusText: 'Service Unavailable' });
    }
}

/**
 * Network-First: try network → if fail, fall back to cache
 * For API calls: always cache the latest successful response
 */
async function networkFirst(request) {
    try {
        const response = await fetch(request);
        if (response.ok) {
            const cache = await caches.open(API_CACHE);
            cache.put(request, response.clone());
        }
        return response;
    } catch {
        const cached = await caches.match(request);
        if (cached) return cached;

        // Return a JSON error for API requests when offline and uncached
        return new Response(
            JSON.stringify({ message: 'أنت غير متصل بالإنترنت', offline: true }),
            { status: 503, headers: { 'Content-Type': 'application/json' } }
        );
    }
}

/* ─── Helper: detect static assets by extension ─── */
function isStaticAsset(pathname) {
    return /\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot|webp|avif)(\?.*)?$/i.test(pathname);
}
