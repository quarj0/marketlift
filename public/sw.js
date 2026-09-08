const CACHE = "marketlift-shell-v2";
const FALLBACK = "/offline";
self.addEventListener("install", (event) =>
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.addAll([FALLBACK, "/manifest.webmanifest"])),
  ),
);
self.addEventListener("activate", (event) =>
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys
          .filter((key) => key.startsWith("marketlift-shell-") && key !== CACHE)
          .map((key) => caches.delete(key)),
      );
      await self.clients.claim();
    })(),
  ),
);
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET" || event.request.mode !== "navigate")
    return;
  event.respondWith(
    fetch(event.request).catch(
      async () =>
        (await caches.match(FALLBACK)) ||
        new Response("Offline", {
          status: 503,
          headers: { "Content-Type": "text/plain" },
        }),
    ),
  );
});
