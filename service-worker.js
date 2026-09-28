// FAS Schools Attendance — Service Worker v3
const CACHE_VERSION = 'fas-attendance-v3';
const CACHE_STATIC  = CACHE_VERSION + '-static';
const CACHE_MODELS  = CACHE_VERSION + '-models';

const STATIC_ASSETS = ['./','./index.html','./manifest.json','./logo.png'];

self.addEventListener('install', event => {
  console.log('[SW] Installing version:', CACHE_VERSION);
  event.waitUntil(
    caches.open(CACHE_STATIC).then(cache => {
      return Promise.all(STATIC_ASSETS.map(url =>
        cache.add(url).catch(err => console.warn('[SW] Failed:', url, err.message))
      ));
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  console.log('[SW] Activating version:', CACHE_VERSION);
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => !k.startsWith(CACHE_VERSION))
        .map(k => { console.log('[SW] Deleting old cache:', k); return caches.delete(k); }))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const req = event.request;
  const url = new URL(req.url);
  if (req.method !== 'GET') return;
  if (url.hostname === 'script.google.com' || url.hostname === 'script.googleusercontent.com') return;
  if (url.hostname === 'cdn.jsdelivr.net') { event.respondWith(handleCacheFirst(req, CACHE_MODELS)); return; }
  if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') { event.respondWith(handleCacheFirst(req, CACHE_MODELS)); return; }
  if (url.origin === self.location.origin) { event.respondWith(handleStaticFetch(req)); return; }
});

async function handleCacheFirst(req, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(req);
  if (cached) return cached;
  try {
    const response = await fetch(req);
    if (response && response.status === 200) cache.put(req, response.clone());
    return response;
  } catch (err) {
    return new Response('', { status: 503, statusText: 'Offline' });
  }
}

async function handleStaticFetch(req) {
  if (req.mode === 'navigate' || req.destination === 'document') {
    try {
      const response = await fetch(req);
      if (response && response.status === 200) {
        const cache = await caches.open(CACHE_STATIC);
        cache.put(req, response.clone());
      }
      return response;
    } catch (err) {
      const cache = await caches.open(CACHE_STATIC);
      const cached = await cache.match('./index.html');
      if (cached) return cached;
      return new Response('', { status: 503 });
    }
  }
  const cache = await caches.open(CACHE_STATIC);
  const cached = await cache.match(req);
  if (cached) {
    fetch(req).then(res => { if (res && res.status === 200 && res.type === 'basic') cache.put(req, res.clone()); }).catch(() => {});
    return cached;
  }
  try {
    const response = await fetch(req);
    if (response && response.status === 200 && response.type === 'basic') cache.put(req, response.clone());
    return response;
  } catch (err) {
    return new Response('', { status: 503 });
  }
}