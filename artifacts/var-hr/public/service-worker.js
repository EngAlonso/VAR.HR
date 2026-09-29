const basePath = new URL("./", self.location.href).pathname;
const SHELL_CACHE = "var-hr-shell-v3";
const SHELL_ASSETS = [
  basePath,
  `${basePath}index.html`,
  `${basePath}manifest.webmanifest`,
  `${basePath}favicon.svg`,
  `${basePath}icons/icon-180.png`,
  `${basePath}icons/icon-192.png`,
  `${basePath}icons/icon-512.png`,
];

function resolveNotificationUrl(value) {
  if (typeof value !== "string" || value.length === 0) {
    return new URL(basePath, self.location.origin).href;
  }

  if (/^https?:\/\//i.test(value)) return value;

  const relativePath = value.replace(/^\/+/, "");
  return new URL(relativePath, new URL(basePath, self.location.origin)).href;
}

async function notifyClients(message) {
  const clients = await self.clients.matchAll({
    type: "window",
    includeUncontrolled: true,
  });
  clients.forEach((client) => client.postMessage(message));
}

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(SHELL_CACHE).then((cache) =>
      cache.addAll(SHELL_ASSETS).catch(() => undefined),
    ),
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key.startsWith("var-hr-shell-") && key !== SHELL_CACHE)
            .map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  const url = new URL(request.url);

  if (
    request.method !== "GET" ||
    url.origin !== self.location.origin ||
    url.pathname.includes("/api/") ||
    url.pathname.endsWith("/service-worker.js")
  ) {
    return;
  }

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          void caches.open(SHELL_CACHE).then((cache) => cache.put(basePath, copy));
          return response;
        })
        .catch(async () => {
          const cache = await caches.open(SHELL_CACHE);
          return (
            (await cache.match(basePath)) ||
            (await cache.match(`${basePath}index.html`)) ||
            Response.error()
          );
        }),
    );
    return;
  }

  if (["script", "style", "font", "image"].includes(request.destination)) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request).then((response) => {
          if (response.ok) {
            const copy = response.clone();
            void caches.open(SHELL_CACHE).then((cache) => cache.put(request, copy));
          }
          return response;
        });
      }),
    );
  }
});

self.addEventListener("push", (event) => {
  let payload = {};
  try {
    payload = event.data ? event.data.json() : {};
  } catch {
    payload = { body: event.data ? event.data.text() : "" };
  }

  const title =
    typeof payload.title === "string" && payload.title
      ? payload.title
      : "VAR.HR update";
  const body =
    typeof payload.body === "string"
      ? payload.body
      : typeof payload.message === "string"
        ? payload.message
        : "You have a new notification.";
  const data = payload.data && typeof payload.data === "object" ? payload.data : {};
  const notificationId =
    typeof payload.id === "string"
      ? payload.id
      : typeof data.notificationId === "string"
        ? data.notificationId
        : undefined;
  const targetUrl = resolveNotificationUrl(
    typeof data.url === "string" ? data.url : basePath,
  );

  const options = {
    body,
    data: { ...data, notificationId, url: targetUrl },
    tag: typeof payload.tag === "string" ? payload.tag : "var-hr-notification",
    renotify: true,
  };
  if (typeof payload.icon === "string") options.icon = resolveNotificationUrl(payload.icon);
  if (typeof payload.badge === "string") options.badge = resolveNotificationUrl(payload.badge);

  event.waitUntil(
    Promise.all([
      self.registration.showNotification(title, options),
      notifyClients({ type: "NEW_NOTIFICATION", notificationId }),
    ]),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const targetUrl = resolveNotificationUrl(event.notification.data?.url);

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clients) => {
      const matchingClient = clients.find((client) => client.url === targetUrl);
      if (matchingClient && "focus" in matchingClient) return matchingClient.focus();
      if (self.clients.openWindow) return self.clients.openWindow(targetUrl);
      return undefined;
    }),
  );
});

self.addEventListener("notificationclose", (event) => {
  const notificationId = event.notification.data?.notificationId;
  event.waitUntil(
    notifyClients({ type: "NOTIFICATION_CLOSED", notificationId }),
  );
});