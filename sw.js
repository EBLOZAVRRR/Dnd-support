// Increment the cache version when changing the app shell.
const CACHE_NAME = 'dnd-support-neforiciy-v9';
const SHELL = new URL('index.html', self.registration.scope).href;
const ASSETS = [
  SHELL,
  ...['manifest.webmanifest', 'icon-192.png', 'icon-512.png', 'apple-touch-icon.png']
    .map(path => new URL(path, self.registration.scope).href)
];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => {
    return cache.addAll(ASSETS.map(url => new Request(url, {cache: 'reload'})));
  }));
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(key => key.startsWith('dnd-support-neforiciy-') && key !== CACHE_NAME)
      .map(key => caches.delete(key)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', event => {
  const {request} = event;
  if (request.method !== 'GET' || !request.url.startsWith(self.registration.scope)) return;
  const url = new URL(request.url);
  const isAppNavigation = request.mode === 'navigate'
    && (url.pathname === new URL(self.registration.scope).pathname || url.pathname === new URL(SHELL).pathname);
  url.search = '';
  const asset = isAppNavigation ? SHELL : url.href;
  if (!ASSETS.includes(asset)) return;

  event.respondWith((async () => {
    const cache = await caches.open(CACHE_NAME);
    const cached = await cache.match(asset);
    return cached || fetch(request);
  })());
});
