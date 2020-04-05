
const cacheName = 'firebase-v1';

const staticAssets = [
  './',
  './notes',
  './about',
  './index.html',
  './404.html',
  './assets/css/styles.css',
  './assets/css/font-awesome.min.css',
  './assets/css/w3.css',
  './assets/icons/icon-32.png',
  './assets/icons/icon-64.png',
  './assets/icons/icon-96.png',
  './assets/icons/icon-128.png',
  './assets/icons/icon-168.png',
  './assets/icons/icon-192.png',
  './assets/icons/icon-256.png',
  './assets/icons/icon-512.png',
  './assets/imag/logo.png'
];

self.addEventListener('install', async event => {
  const cache = await caches.open(cacheName);
  cache.addAll(staticAssets);
});

self.addEventListener('activate', (event) => {
  var cacheKeeplist = [cacheName];

  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(keyList.map((key) => {
        if (cacheKeeplist.indexOf(key) === -1) {
          return caches.delete(key);
        }
      }));
    })
  );

});

self.addEventListener('fetch', event => {
  const req = event.request;
  const url = new URL(req.url);

  if (url.origin === location.url) {
      event.respondWith(cacheFirst(req));
  } else {
      event.respondWith(networkFirst(req));
  }
});

async function cacheFirst(req) {
  const cachedResponse = caches.match(req);
  return cachedResponse || fetch(req);
}

async function networkFirst(req) {
  const cache = await caches.open(cacheName);

  try {
      const res = await fetch(req);
      if(req.method == 'GET') cache.put(req, res.clone());
      return res;
  } catch (error) {
      return await cache.match(req);
  }
}

self.addEventListener('push', function(event) {
  const {notification} = JSON.parse(event.data.text());
  event.waitUntil(self.registration.showNotification(notification.title, notification));
});
