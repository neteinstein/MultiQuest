// Service worker: makes MultiQuest installable and playable offline.
// Network first, so a new deploy shows up right away; the cache is the
// fallback when there is no connection.
const CACHE = 'multiquest-v3';
const CORE = [
  './',
  'index.html',
  'manifest.webmanifest',
  'css/style.css',
  'js/rules.js',
  'js/i18n.js',
  'js/avatars.js',
  'js/facts.js',
  'js/generators.js',
  'js/questions.js',
  'js/game.js',
  'icons/icon.svg',
  'icons/icon-192.png',
  'icons/icon-512.png',
  'icons/apple-touch-icon.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((c) => c.addAll(CORE)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;
  // Pages are revalidated with the server every time: the HTML names the
  // versioned scripts, so a stale copy from the HTTP cache would keep an old
  // game running for up to 10 minutes after a deploy.
  const isPage = req.mode === 'navigate' || req.destination === 'document';
  event.respondWith(
    fetch(req, isPage ? { cache: 'no-cache' } : undefined)
      .then((res) => {
        if (res.ok) {
          // Store under the URL without ?v= so offline lookups find it.
          const key = new URL(req.url);
          key.search = '';
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(key.href, copy));
        }
        return res;
      })
      .catch(() =>
        caches.match(req, { ignoreSearch: true }).then((hit) =>
          hit || (req.mode === 'navigate' ? caches.match('index.html') : Response.error())
        )
      )
  );
});
