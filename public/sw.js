/**
 * TableView service worker.
 *
 * Caching strategy — chosen to make a stale-cache white screen impossible:
 *
 *   - Navigations (HTML)      -> NETWORK FIRST. A deploy always wins; the cached
 *                                shell is only used when the network fails.
 *   - /assets/*  (hashed)     -> CACHE FIRST. Immutable by construction, so a
 *                                cached copy can never be stale.
 *   - other same-origin GETs  -> STALE WHILE REVALIDATE.
 *   - ads / analytics / CDN   -> never intercepted.
 *
 * CACHE_VERSION is injected at build time by the plugin in vite.config.ts. Any
 * change to the build produces a new cache name, and activate() deletes the rest.
 */

const CACHE_VERSION = '__BUILD_VERSION__';
const CACHE_NAME = `tableview-${CACHE_VERSION}`;

/** How many same-origin entries to retain before evicting the oldest. */
const MAX_CACHE_ENTRIES = 120;

/** Hosts that must never be intercepted (ads, analytics, error reporting). */
const BYPASS_HOSTS = [
  'googlesyndication.com',
  'googleadservices.com',
  'doubleclick.net',
  'google-analytics.com',
  'googletagmanager.com',
  'clarity.ms',
  'sentry.io',
];

/** Cross-origin hosts we are happy to serve from cache (fonts are immutable). */
const CACHEABLE_CROSS_ORIGIN = ['fonts.gstatic.com', 'fonts.googleapis.com'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) =>
        cache.addAll([
          '/',
          '/index.html',
          '/favicon.svg',
          '/manifest.webmanifest',
          '/icon-192.png',
          '/icon-512.png',
        ])
      )
      .catch(() => {
        // A failed precache must not block activation.
      })
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))
      )
      .then(() => self.clients.claim())
  );
});

function shouldBypass(url) {
  return BYPASS_HOSTS.some((host) => url.hostname.endsWith(host));
}

function isCacheableCrossOrigin(url) {
  return CACHEABLE_CROSS_ORIGIN.some((host) => url.hostname.endsWith(host));
}

/** Keep the cache bounded so it cannot grow without limit on long-lived clients. */
async function trimCache(cacheName, maxEntries) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  if (keys.length <= maxEntries) return;
  await Promise.all(keys.slice(0, keys.length - maxEntries).map((key) => cache.delete(key)));
}

function putInCache(request, response) {
  if (!response || response.status !== 200 || response.type === 'opaque') return;
  const copy = response.clone();
  caches
    .open(CACHE_NAME)
    .then((cache) => cache.put(request, copy))
    .then(() => trimCache(CACHE_NAME, MAX_CACHE_ENTRIES))
    .catch(() => {
      // Quota or private-mode failures are non-fatal.
    });
}

/** HTML: always try the network first so a deploy is picked up immediately. */
async function handleNavigation(request) {
  try {
    const response = await fetch(request);
    putInCache('/index.html', response.clone());
    return response;
  } catch {
    const cached = (await caches.match('/index.html')) || (await caches.match('/'));
    if (cached) return cached;
    return new Response('Offline', { status: 503, statusText: 'Offline' });
  }
}

/** Hashed build output: safe to serve from cache without revalidating. */
async function handleAsset(request) {
  const cached = await caches.match(request);
  if (cached) return cached;
  const response = await fetch(request);
  putInCache(request, response.clone());
  return response;
}

async function handleStaleWhileRevalidate(request) {
  const cached = await caches.match(request);
  const network = fetch(request)
    .then((response) => {
      putInCache(request, response.clone());
      return response;
    })
    .catch(() => undefined);

  if (cached) return cached;
  const response = await network;
  if (response) return response;
  return new Response('Offline', { status: 503, statusText: 'Offline' });
}

self.addEventListener('fetch', (event) => {
  const request = event.request;

  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  if (shouldBypass(url)) return;

  const sameOrigin = url.origin === self.location.origin;
  if (!sameOrigin && !isCacheableCrossOrigin(url)) return;

  // Never let the service worker interfere with the SW script itself or ads.txt.
  if (sameOrigin && (url.pathname === '/sw.js' || url.pathname === '/ads.txt')) return;

  if (request.mode === 'navigate') {
    event.respondWith(handleNavigation(request));
    return;
  }

  if (sameOrigin && url.pathname.startsWith('/assets/')) {
    event.respondWith(handleAsset(request));
    return;
  }

  event.respondWith(handleStaleWhileRevalidate(request));
});

// Allow the page to activate an updated worker immediately.
self.addEventListener('message', (event) => {
  if (event.data === 'SKIP_WAITING') self.skipWaiting();
});
