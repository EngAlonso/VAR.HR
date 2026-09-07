const basePath = new URL("./", self.location.href).pathname;

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

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
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