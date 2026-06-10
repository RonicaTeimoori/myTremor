// MyTremor service worker
// Strategy: network-first for everything, with a tiny offline fallback.
// This avoids the classic "user updated but still sees old version" problem.

const CACHE_NAME = 'mytremor-v1'
const OFFLINE_URLS = ['/']

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(OFFLINE_URLS))
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

  // Network-first; fall back to cache; finally to "/" if all else fails
  event.respondWith(
    fetch(request)
      .then((response) => {
        // Cache a copy of successful navigations
        if (response.ok && request.mode === 'navigate') {
          const copy = response.clone()
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy))
        }
        return response
      })
      .catch(async () => {
        const cached = await caches.match(request)
        if (cached) return cached
        if (request.mode === 'navigate') {
          const fallback = await caches.match('/')
          if (fallback) return fallback
        }
        return new Response('Offline', { status: 503, statusText: 'Offline' })
      })
  )
})
