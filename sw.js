const CACHE_NAME = 'gym-daily-v2-offline'; // Mudei a versão para forçar atualização
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './images/gymdaily.png',
  './libs/tailwind.js', // Agora local
  './libs/lucide.js'    // Agora local
];

// Instalação
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Cacheando arquivos locais...');
      return cache.addAll(ASSETS);
    })
  );
});

// Ativação (Limpa caches antigos se houver)
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(keyList.map((key) => {
        if (key !== CACHE_NAME) {
          return caches.delete(key);
        }
      }));
    })
  );
});

// Interceptação de Rede (Estratégia: Cache First, depois Network)
self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((response) => {
      // Se achar no cache, retorna o cache. Se não, tenta a internet.
      return response || fetch(e.request);
    })
  );
});