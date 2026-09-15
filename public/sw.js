const CACHE = "marketlift-shell-v3";
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
  if (event.request.method !== "GET" || event.request.mode !== "navigate") return;
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

function safeHref(value) {
  try {
    const target = new URL(value || "/notifications", self.location.origin);
    if (target.origin !== self.location.origin) return "/notifications";
    return `${target.pathname}${target.search}${target.hash}`;
  } catch {
    return "/notifications";
  }
}

self.addEventListener("push", (event) => {
  event.waitUntil(
    (async () => {
      let payload = {};
      try {
        payload = event.data ? event.data.json() : {};
      } catch {
        payload = {
          title: "Marketlift",
          body: event.data ? event.data.text() : "You have a new update.",
        };
      }

      const windows = await self.clients.matchAll({
        type: "window",
        includeUncontrolled: true,
      });
      if (windows.some((client) => client.visibilityState === "visible")) {
        return;
      }

      const href = safeHref(payload.href);
      const notificationId = String(payload.id || "update");
      await self.registration.showNotification(payload.title || "Marketlift", {
        body: payload.body || "You have a new Marketlift update.",
        icon: "/icons/icon-192.png",
        badge: "/icons/icon-192.png",
        tag: `marketlift-${notificationId}`,
        data: {
          href,
          notificationId,
          type: String(payload.type || ""),
        },
      });
    })(),
  );
});

self.addEventListener("notificationclick", (event) => {
  const href = safeHref(event.notification?.data?.href);
  event.notification.close();
  event.waitUntil(
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clients) => {
        const target = new URL(href, self.location.origin).href;
        for (const client of clients) {
          if (client.url === target && "focus" in client) {
            return client.focus();
          }
        }
        return self.clients.openWindow ? self.clients.openWindow(target) : undefined;
      }),
  );
});
