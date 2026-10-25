// Minimal app-shell service worker — no next-pwa/workbox dependency.
// ponytail: this is deliberately small. It caches static assets
// (icons, manifest, Next's hashed build output) so the app opens instantly
// from a home-screen icon, and lets every GET to /, /admin-short-ui, /view
// and all /api/* requests go straight to the network uncached, since this
// is live, personal, auth-gated data — caching it would mean either
// showing stale items or (worse) leaking a previous session's data to a
// different signed-in device. Upgrade path if true offline support is
// wanted later: add an IndexedDB-backed outbox for queued writes.

const CACHE_NAME = 'cloud-clipboard-shell-v1'
const SHELL_ASSETS = [
  '/manifest.webmanifest',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
]

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(SHELL_ASSETS)).catch(() => {})
  )
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  )
  self.clients.claim()
})

self.addEventListener('fetch', (event) => {
  const { request } = event
  if (request.method !== 'GET') return

  const url = new URL(request.url)

  // Never cache API responses or HTML pages — always fresh, auth-aware.
  if (url.pathname.startsWith('/api/') || request.mode === 'navigate') return

  // Cache-first for Next's hashed static assets and our icons/manifest.
  if (url.pathname.startsWith('/_next/static/') || SHELL_ASSETS.includes(url.pathname)) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached
        return fetch(request).then((res) => {
          const copy = res.clone()
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy))
          return res
        })
      })
    )
  }
})
