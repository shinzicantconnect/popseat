// Pop Seat Cinema — client-side instrumentation
// Registers the service worker before React hydration begins.
// See: https://nextjs.org/docs/app/api-reference/file-conventions/instrumentation-client

if (typeof window !== "undefined" && "serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw.js")
      .then((registration) => {
        console.log("[SW] Registered with scope:", registration.scope);
      })
      .catch((err) => {
        console.error("[SW] Registration failed:", err);
      });
  });
}

