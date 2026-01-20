
const CACHE_NAME = 'pm-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});

// Push notification event listener
self.addEventListener('push', function(event) {
  const data = event.data ? event.data.json() : { title: 'Lembrete', body: 'Você tem uma nova notificação!' };
  
  const options = {
    body: data.body,
    icon: 'https://picsum.photos/192/192',
    badge: 'https://picsum.photos/96/96',
    vibrate: [100, 50, 100],
    data: {
      url: data.url || '/'
    }
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  event.waitUntil(
    clients.openWindow(event.notification.data.url)
  );
});
