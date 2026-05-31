// MG IMPORT Pro — Service Worker
// Version du cache (incrémenter à chaque mise à jour)
const CACHE_VERSION = 'mg-import-v22-1';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './css/styles.css',
  './js/app.js',
  './manifest.json',
  'https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=JetBrains+Mono:wght@400;600;700&family=Plus+Jakarta+Sans:wght@300;400;500;600&display=swap',
  'https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.5.31/jspdf.plugin.autotable.min.js',
  'https://cdn.sheetjs.com/xlsx-0.20.2/package/dist/xlsx.full.min.js'
];

// Installation — mise en cache des ressources
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_VERSION).then(cache => {
      console.log('[SW] Mise en cache des ressources...');
      return cache.addAll(ASSETS_TO_CACHE.filter(url => !url.startsWith('https://')))
        .then(() => {
          // Tenter de mettre en cache les ressources externes séparément (ne pas bloquer l'install si ça échoue)
          return Promise.allSettled(
            ASSETS_TO_CACHE.filter(url => url.startsWith('https://')).map(url => 
              cache.add(url).catch(e => console.warn('[SW] Cache externe échoué:', url, e))
            )
          );
        });
    }).then(() => self.skipWaiting())
  );
});

// Activation — nettoyage anciens caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.filter(name => name !== CACHE_VERSION)
          .map(name => {
            console.log('[SW] Suppression ancien cache:', name);
            return caches.delete(name);
          })
      );
    }).then(() => self.clients.claim())
  );
});

// Interception réseau — stratégie Cache First pour les assets, Network First pour les données
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  
  // Ne pas intercepter les requêtes non-GET
  if (event.request.method !== 'GET') return;
  
  // Stratégie : Cache First
  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      if (cachedResponse) {
        // Mettre à jour en arrière-plan (stale-while-revalidate)
        const fetchPromise = fetch(event.request).then(networkResponse => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_VERSION).then(cache => {
              cache.put(event.request, responseClone);
            });
          }
          return networkResponse;
        }).catch(() => {/* pas de réseau — ok, on garde le cache */});
        return cachedResponse;
      }
      // Pas dans le cache — tenter le réseau
      return fetch(event.request).then(networkResponse => {
        if (networkResponse && networkResponse.status === 200 && networkResponse.type !== 'opaque') {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_VERSION).then(cache => {
            cache.put(event.request, responseClone);
          });
        }
        return networkResponse;
      }).catch(() => {
        // Hors ligne et pas en cache — retourner la page principale comme fallback
        if (event.request.destination === 'document') {
          return caches.match('./index.html');
        }
      });
    })
  );
});

// Message depuis la page
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
