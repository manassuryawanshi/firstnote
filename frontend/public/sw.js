self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(clients.claim());
});

self.addEventListener("fetch", (event) => {
  // A minimal fetch listener is required by most browsers to prompt "Add to Home Screen"
  // For a basic PWA, we simply let the network handle it.
  event.respondWith(
    fetch(event.request).catch(() => {
      // Offline fallback could go here
      return new Response("Offline mode not available.");
    })
  );
});
