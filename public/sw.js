const CACHE_NAME = 'easyshop-v9';
const STATIC_ASSETS = [
    '/',
    '/img/logo.svg',
    '/img/icon.svg',
    '/img/icon-192.png',
    '/img/icon-512.png'
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

// Fetch strategy
self.addEventListener('fetch', (event) => {
    if (event.request.method !== 'GET') return;

    const url = new URL(event.request.url);
    if (!url.protocol.startsWith('http')) return;

    // API — network only
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

    // Картинки — cache-first (они меняются редко)
    if (/\.(png|jpg|jpeg|gif|webp|svg|ico)(\?|$)/i.test(url.pathname)) {
        event.respondWith(
            caches.match(event.request).then((cached) => {
                const fetched = fetch(event.request).then((response) => {
                    if (response.ok) {
                        const clone = response.clone();
                        caches.open(CACHE_NAME).then((c) => c.put(event.request, clone));
                    }
                    return response;
                }).catch(() => cached);
                return cached || fetched;
            })
        );
        return;
    }

    // HTML, CSS, JS — network-first (чтобы обновления стилей/кода применялись сразу)
    event.respondWith(
        fetch(event.request).then((response) => {
            if (response.ok) {
                const clone = response.clone();
                caches.open(CACHE_NAME).then((c) => c.put(event.request, clone));
            }
            return response;
        }).catch(() => caches.match(event.request))
    );
});
