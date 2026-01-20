
const CACHE_NAME = 'pm-v1.1.2';
const ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  'https://cdn.tailwindcss.com'
];

self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
    ))
  );
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  
  event.respondWith(
    caches.match(event.request).then(cached => {
      const networked = fetch(event.request)
        .then(res => {
          const cacheCopy = res.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, cacheCopy));
          return res;
        })
        .catch(() => cached);
      return cached || networked;
    })
  );
});

// Listener para notificações Push do Firebase (FCM)
self.addEventListener('push', event => {
  const data = event.data ? event.data.json() : { title: 'Project Manager', body: 'Você tem uma nova atualização!' };
  
  const options = {
    body: data.body,
    icon: 'https://picsum.photos/192/192',
    badge: 'https://picsum.photos/96/96',
    vibrate: [200, 100, 200],
    data: { url: data.url || '/' }
  };

  event.waitUntil(self.registration.showNotification(data.title, options));
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(clients.openWindow(event.notification.data.url));
});
