const CACHE_NAME = 'easyshop-v2';
const STATIC_ASSETS = [
    '/',
    '/img/logo.png',
    '/img/icons/icon-192.png',
    '/img/icons/icon-512.png'
];

// Install — кэшируем статику
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(STATIC_ASSETS);
        })
    );
    self.skipWaiting();
});

// Activate — удаляем старые кэши
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(
                keys.filter((key) => key !== CACHE_NAME)
                    .map((key) => caches.delete(key))
            );
        })
    );
    self.clients.claim();
});

// Fetch — network-first для API, cache-first для статики
self.addEventListener('fetch', (event) => {
    // Пропускаем POST-запросы (tracking, API mutations) — не кэшируем
    if (event.request.method !== 'GET') return;

    const url = new URL(event.request.url);

    // Пропускаем не-http(s) схемы (chrome-extension://, etc.)
    if (!url.protocol.startsWith('http')) return;

    // API запросы — всегда из сети
    if (url.pathname.startsWith('/api/')) {
        event.respondWith(
            fetch(event.request).catch(() => {
                return new Response(JSON.stringify({ error: 'Нет подключения к интернету' }), {
                    headers: { 'Content-Type': 'application/json' }
                });
            })
        );
        return;
    }

    // Статика — cache-first, потом сеть
    event.respondWith(
        caches.match(event.request).then((cached) => {
            const fetched = fetch(event.request).then((response) => {
                // Кэшируем новые ответы
                if (response.ok) {
                    const clone = response.clone();
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(event.request, clone);
                    });
                }
                return response;
            }).catch(() => cached);

            return cached || fetched;
        })
    );
});
