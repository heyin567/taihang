/* ============================================================
   太行徒步志 · Service Worker
   - 离线优先策略:本站静态资源用 cache-first
   - 字体 CDN:stale-while-revalidate
   - 天气 API:network-only(不缓存,实时性重要)
   - 版本号变更即触发更新
   ============================================================ */

const VERSION = "th-v1.1.0";
const CORE_CACHE = `${VERSION}-core`;
const FONT_CACHE = `${VERSION}-font`;

const CORE_ASSETS = [
    "./",
    "./index.html",
    "./style.css",
    "./safety.js",
    "./store.js",
    "./culture.js",
    "./friends.js",
    "./weather.js",
    "./data.js",
    "./app.js",
    "./admin.js",
    "./manifest.json"
];

self.addEventListener("install", e => {
    e.waitUntil(
        caches.open(CORE_CACHE)
            .then(c => c.addAll(CORE_ASSETS).catch(() => {}))
            .then(() => self.skipWaiting())
    );
});

self.addEventListener("activate", e => {
    e.waitUntil(
        caches.keys().then(keys => Promise.all(
            keys.filter(k => !k.startsWith(VERSION)).map(k => caches.delete(k))
        )).then(() => self.clients.claim())
    );
});

self.addEventListener("fetch", e => {
    const req = e.request;
    if (req.method !== "GET") return;

    const url = new URL(req.url);

    // 天气 / GeoAPI 不缓存
    if (url.hostname.includes("qweather.com")) return;

    // 字体 CDN:stale-while-revalidate
    if (url.hostname.includes("jsdelivr.net") || url.hostname.includes("unpkg.com")) {
        e.respondWith(swrStrategy(req, FONT_CACHE));
        return;
    }

    // 同源资源:cache-first 回退到网络
    if (url.origin === location.origin) {
        e.respondWith(cacheFirst(req, CORE_CACHE));
        return;
    }

    // 其他:网络优先,失败回退缓存
    e.respondWith(networkFirst(req, CORE_CACHE));
});

async function cacheFirst(req, cacheName) {
    const cache = await caches.open(cacheName);
    const cached = await cache.match(req);
    if (cached) return cached;
    try {
        const res = await fetch(req);
        if (res.ok) cache.put(req, res.clone());
        return res;
    } catch {
        return cached || new Response("offline", { status: 503 });
    }
}

async function networkFirst(req, cacheName) {
    const cache = await caches.open(cacheName);
    try {
        const res = await fetch(req);
        if (res.ok) cache.put(req, res.clone());
        return res;
    } catch {
        const cached = await cache.match(req);
        return cached || new Response("offline", { status: 503 });
    }
}

async function swrStrategy(req, cacheName) {
    const cache = await caches.open(cacheName);
    const cached = await cache.match(req);
    const fetchPromise = fetch(req).then(res => {
        if (res.ok) cache.put(req, res.clone());
        return res;
    }).catch(() => cached);
    return cached || fetchPromise;
}

self.addEventListener("message", e => {
    if (e.data === "skipWaiting") self.skipWaiting();
});
