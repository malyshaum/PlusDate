const CACHE_PREFIX = "spa-offline-"
const CACHE_VERSION = "v2"
const CACHE_NAME = `${CACHE_PREFIX}${CACHE_VERSION}`
const OFFLINE_URL = "/offline.html"

const OFFLINE_HTML = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Offline</title>
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <style>
      :root {
        color-scheme: dark;
      }
      * {
        box-sizing: border-box;
      }
      body {
        margin: 0;
        min-height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
        font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        background: #000;
        color: #fff;
      }
      .container {
        text-align: center;
        padding: 24px;
        max-width: 320px;
      }
      h1 {
        font-size: 20px;
        margin-bottom: 8px;
      }
      p {
        margin: 0 0 16px;
        font-size: 14px;
        color: #d0d0d0;
      }
      button {
        border-radius: 999px;
        border: none;
        padding: 10px 20px;
        font-size: 14px;
        font-weight: 600;
        background: #ff5a7a;
        color: #fff;
        cursor: pointer;
      }
      button:active {
        transform: scale(0.98);
      }
    </style>
  </head>
  <body>
    <div class="container">
      <h1>Вы офлайн</h1>
      <p>Проверьте подключение к интернету.</p>
      <button type="button" onclick="window.location.reload()">Перезагрузить</button>
    </div>
  </body>
</html>`

function isSameOrigin(request) {
  try {
    const url = new URL(request.url)
    return url.origin === self.location.origin
  } catch (e) {
    return false
  }
}

self.addEventListener("install", (event) => {
  console.log("[SW] Installing...", CACHE_NAME) // ✅ Простий лог

  event.waitUntil(
    (async () => {
      try {
        const cache = await caches.open(CACHE_NAME)
        await cache.add(new Request(OFFLINE_URL, { cache: "reload" })).catch(() => {
          console.log("[SW] Failed to cache offline.html")
        })
        await cache.add(new Request("/", { cache: "reload" })).catch(() => {
          console.log("[SW] Failed to cache /")
        })
        await cache.add(new Request("/favicon.svg", { cache: "reload" })).catch(() => {
          console.log("[SW] Failed to cache favicon")
        })
        console.log("[SW] Install complete")
      } catch (e) {
        console.error("[SW] Install error:", e)
      }
    })(),
  )

  self.skipWaiting()
})

self.addEventListener("activate", (event) => {
  console.log("[SW] Activating...", CACHE_NAME)

  event.waitUntil(
    (async () => {
      const keys = await caches.keys()
      console.log("[SW] Cache keys:", keys)

      await Promise.all(
        keys
          .filter((key) => key.startsWith(CACHE_PREFIX) && key !== CACHE_NAME)
          .map((key) => {
            console.log("[SW] Deleting old cache:", key)
            return caches.delete(key)
          }),
      )

      console.log("[SW] Activate complete")
    })(),
  )

  self.clients.claim()
})

self.addEventListener("fetch", (event) => {
  const request = event.request

  // Full page loads / reloads
  if (request.mode === "navigate") {
    console.log("[SW] Navigate request:", request.url)

    event.respondWith(
      (async () => {
        try {
          const response = await fetch(request)
          console.log("[SW] Navigate fetch OK:", request.url)
          return response
        } catch (e) {
          console.log("[SW] Navigate fetch FAILED, serving offline:", e.message)

          // If network fails, serve offline fallback
          const cachedOffline = await caches.match(OFFLINE_URL)
          if (cachedOffline) {
            console.log("[SW] Serving cached offline.html")
            return cachedOffline
          }

          const cachedRoot = await caches.match("/")
          if (cachedRoot) {
            console.log("[SW] Serving cached /")
            return cachedRoot
          }

          console.log("[SW] Serving inline offline HTML")
          return new Response(OFFLINE_HTML, {
            headers: { "Content-Type": "text/html; charset=utf-8" },
          })
        }
      })(),
    )
    return
  }

  // Only handle same-origin static assets
  if (request.method === "GET" && isSameOrigin(request)) {
    const destination = request.destination
    const isStaticAsset =
      destination === "script" ||
      destination === "style" ||
      destination === "image" ||
      destination === "font" ||
      destination === "manifest"

    if (!isStaticAsset) return

    event.respondWith(
      (async () => {
        const cache = await caches.open(CACHE_NAME)
        const cached = await cache.match(request)

        if (cached) {
          console.log("[SW] Cache HIT:", request.url)
          return cached
        }

        try {
          const res = await fetch(request)
          console.log("[SW] Fetched and caching:", request.url)

          if (res && res.ok) {
            cache.put(request, res.clone()).catch(() => {})
          }
          return res
        } catch (e) {
          console.log("[SW] Fetch failed for:", request.url, e.message)
          const fallback = await cache.match(request)
          return fallback || Response.error()
        }
      })(),
    )
  }
})
