const CACHE_NAME = "wifi-qr-v1";
const ASSETS = [
	"./",
	"./index.html",
	"./css/style.css",
	"./js/qrcode.min.js",
	"./js/db.js",
	"./js/app.js",
	"./manifest.json",
	"./icons/icon-192.png",
	"./icons/icon-512.png",
];

self.addEventListener("install", (e) => {
	e.waitUntil(
		caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
	);
	self.skipWaiting();
});

self.addEventListener("activate", (e) => {
	e.waitUntil(
		caches.keys().then((keys) =>
			Promise.all(
				keys
					.filter((key) => key !== CACHE_NAME)
					.map((key) => caches.delete(key))
			)
		)
	);
	self.clients.claim();
});

self.addEventListener("fetch", (e) => {
	e.respondWith(
		caches.match(e.request).then((cached) => {
			const fetchPromise = fetch(e.request)
				.then((response) => {
					if (response && response.status === 200 && response.type === "basic") {
						const clone = response.clone();
						caches.open(CACHE_NAME).then((cache) => cache.put(e.request, clone));
					}
					return response;
				})
				.catch(() => cached);

			return cached || fetchPromise;
		})
	);
});
