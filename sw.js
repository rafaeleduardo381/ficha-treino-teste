// Service worker do app de treino: abre sem internet (última cópia) e mostra as notificações.
const CACHE = "treino-v1";
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", e => e.waitUntil(self.clients.claim()));
// Rede primeiro (o site sempre atualiza sozinho); sem internet, usa a última cópia guardada
self.addEventListener("fetch", e => {
  const r = e.request;
  if (r.method !== "GET" || new URL(r.url).origin !== self.location.origin) return;
  e.respondWith(fetch(r).then(res => {
    if (res.ok) { const c = res.clone(); caches.open(CACHE).then(k => k.put(r, c)); }
    return res;
  }).catch(() => caches.match(r, {ignoreSearch: true}).then(m => m || caches.match("./"))));
});
self.addEventListener("push", e => {
  let d = {};
  try { d = e.data.json(); } catch (_) { d = {title: "Treino", body: e.data ? e.data.text() : ""}; }
  e.waitUntil(self.registration.showNotification(d.title || "Treino", {body: d.body || "", tag: d.tag || "treino", icon: "icon-192.png", badge: "badge-96.png", data: {url: d.url || "./"}}));
});
self.addEventListener("notificationclick", e => {
  e.notification.close();
  e.waitUntil(self.clients.matchAll({type: "window", includeUncontrolled: true}).then(l => {
    for (const c of l) if ("focus" in c) return c.focus();
    return self.clients.openWindow((e.notification.data && e.notification.data.url) || "./");
  }));
});
