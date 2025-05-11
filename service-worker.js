const CACHE_NAME = 'flappy-bird-ultra-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/style.css',
  '/script.js',
  '/images/flappy.png',
  '/images/bg-day.png',
  '/images/bg-night.png',
  '/images/Pipe.png',
  '/images/Ground.png',
  '/sounds/flap.mp3',
  '/sounds/score.mp3',
  '/sounds/hit.mp3'
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
