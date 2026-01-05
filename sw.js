const CACHE_NAME = 'gym-daily-dev-v3'; // Mudei o nome para forçar atualização
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './images/gymdaily.png',
  './libs/tailwind.js',
  './libs/lucide.js'
];

self.addEventListener('install', (e) => {
  self.skipWaiting(); // Força o novo Service Worker a ativar imediatamente
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
});

self.addEventListener('activate', (e) => {
  // Limpa caches antigos imediatamente
  e.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(keyList.map((key) => {
        if (key !== CACHE_NAME) {
          return caches.delete(key);
        }
      }));
    }).then(() => self.clients.claim()) // Assume o controle da página imediatamente
  );
});

// ESTRATÉGIA: NETWORK FIRST (REDE PRIMEIRO)
// Isso resolve o problema do Ctrl+F5. Ele sempre tenta baixar o novo.
self.addEventListener('fetch', (e) => {
  e.respondWith(
    fetch(e.request)
      .then((response) => {
        // Se a internet funcionou, clonamos a resposta para atualizar o cache
        // assim o offline continua funcionando com a versão mais recente
        const resClone = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(e.request, resClone);
        });
        return response;
      })
      .catch(() => {
        // Se a internet falhar, aí sim usamos o cache
        return caches.match(e.request);
      })
  );
});