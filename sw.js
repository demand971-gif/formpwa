const VERSION = 'form-pwa-v7';
const SHELL = VERSION + '-shell';
const MEDIA = VERSION + '-media';
const PRECACHE = [
  './',
  './index.html',
  './offline.html',
  './manifest.json',
  './manifest.webmanifest',
  './icons/icon-180.png',
  './icons/icon-192.png',
  './icons/icon-512.png'
];

self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(SHELL);
    await Promise.all(PRECACHE.map(async url => {
      try {
        const res = await fetch(url, { cache: 'reload' });
        if (res && res.ok) await cache.put(url, res);
      } catch (err) {}
    }));
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keep = new Set([SHELL, MEDIA]);
    const keys = await caches.keys();
    await Promise.all(keys.filter(k => !keep.has(k)).map(k => caches.delete(k)));
    await self.clients.claim();
    const clients = await self.clients.matchAll({ type: 'window' });
    clients.forEach(c => c.postMessage({ type: 'SW_ACTIVATED', version: VERSION }));
  })());
});

self.addEventListener('message', event => {
  const data = event.data || {};
  if (data.type === 'SKIP_WAITING') self.skipWaiting();
  if (data.type === 'GET_STATUS') {
    event.source && event.source.postMessage({
      type: 'SW_STATUS',
      version: VERSION,
      online: true
    });
  }
});

function isMedia(url) {
  return /\/media\//.test(url.pathname) || /\/icons\//.test(url.pathname);
}

self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  if (url.hostname.includes('youtube') || url.pathname.includes('youtube')) return;

  if (req.mode === 'navigate') {
    event.respondWith(networkFirst(req));
    return;
  }
  if (isMedia(url)) {
    event.respondWith(cacheFirst(req, MEDIA));
    return;
  }
  event.respondWith(staleWhileRevalidate(req, SHELL));
});

async function networkFirst(req) {
  try {
    const res = await fetch(req);
    if (res && res.ok) {
      const cache = await caches.open(SHELL);
      cache.put('./index.html', res.clone());
    }
    return res;
  } catch (err) {
    return (await caches.match('./index.html'))
      || (await caches.match('./offline.html'))
      || new Response('FORM is offline.', { status: 503, headers: { 'Content-Type': 'text/plain' } });
  }
}

async function cacheFirst(req, cacheName) {
  const cached = await caches.match(req);
  if (cached) return cached;
  try {
    const res = await fetch(req);
    if (res && res.ok) {
      const cache = await caches.open(cacheName);
      cache.put(req, res.clone());
    }
    return res;
  } catch (err) {
    return cached || Response.error();
  }
}

async function staleWhileRevalidate(req, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(req);
  const network = fetch(req).then(res => {
    if (res && res.ok) cache.put(req, res.clone());
    return res;
  }).catch(() => cached);
  return cached || network;
}
