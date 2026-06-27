const CACHE_VERSION = 'sofram-v2';
const CACHE_NAMES = {
  static: `${CACHE_VERSION}-static`,
  images: `${CACHE_VERSION}-images`,
  dynamic: `${CACHE_VERSION}-dynamic`
};

const STATIC_ASSETS = ['/', '/index.html', '/manifest.json', '/Logo.svg', '/icon-192.png', '/icon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAMES.static).then(c => c.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(k => !Object.values(CACHE_NAMES).includes(k))
          .map(k => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  if(e.request.method !== 'GET') return;
  const url = new URL(e.request.url);

  // Images: cache first
  if(e.request.destination === 'image'){
    e.respondWith(
      caches.open(CACHE_NAMES.images).then(cache =>
        cache.match(e.request).then(cached =>
          cached || fetch(e.request).then(res => {
            cache.put(e.request, res.clone());
            return res;
          })
        )
      )
    );
    return;
  }

  // Static assets: cache first
  if(url.pathname.match(/\.(svg|png|ico|woff2?)$/)){
    e.respondWith(
      caches.match(e.request).then(cached =>
        cached || fetch(e.request).then(res => {
          caches.open(CACHE_NAMES.static).then(c => c.put(e.request, res.clone()));
          return res;
        })
      )
    );
    return;
  }

  // HTML & everything else: network first, fallback to cache
  e.respondWith(
    fetch(e.request)
      .then(res => {
        caches.open(CACHE_NAMES.dynamic).then(c => c.put(e.request, res.clone()));
        return res;
      })
      .catch(() => caches.match(e.request))
  );
});
