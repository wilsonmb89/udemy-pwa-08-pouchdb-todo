// imports
importScripts('js/sw-utils.js')

const STATIC_CACHE = 'static-v1';
const INMUTABLE_CACHE = 'inmutable-v1';
const DYNAMIC_CACHE = 'dynamic-v1';

const APP_SHELL = [
  '/',
  'index.html',
  'js/app.js',
  'js/base.js',
  'js/sw-utils.js',
  'style/base.css',
  'style/bg.png'
];

const APP_INMUTABLE = [
  '//cdn.jsdelivr.net/npm/pouchdb@7.2.1/dist/pouchdb.min.js'
];

self.addEventListener('install', event => {
  const staticCacheProm = caches.open(STATIC_CACHE).then(cache => cache.addAll(APP_SHELL));
  const inmutableCacheProm = caches.open(INMUTABLE_CACHE).then(cache => cache.addAll(APP_INMUTABLE));

  event.waitUntil(Promise.all([staticCacheProm, inmutableCacheProm]));
});

self.addEventListener('activate', e => {
  const checkCacheProm = caches.keys().then(
    keys => {
      keys.forEach(key => {
        if (key !== STATIC_CACHE && key.includes('static')) {
          return caches.delete(key);
        }
        if (key !== DYNAMIC_CACHE && key.includes('dynamic')) {
          return caches.delete(key);
        }
      });
    }
  );
  e.waitUntil(checkCacheProm);
});

self.addEventListener('fetch', e => {
  const fetchResProm = caches.match(e.request.url)
    .then(
      cacheRes => {
        if (!!cacheRes) {
          return cacheRes;
        } else {
          return fetch(e.request).then(
            fetchRes => {
              return updateDynamicCache(DYNAMIC_CACHE, e.request, fetchRes);
            }
          );
        }
      }
    );
  e.waitUntil(e.respondWith(fetchResProm));
});