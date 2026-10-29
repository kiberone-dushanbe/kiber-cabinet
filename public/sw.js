/* Service worker KIBERone: приложение открывается быстро и без сети показывает последнюю версию.
   Запросы к Supabase, YouTube и другим сайтам не кэшируются — данные всегда свежие. */
const CACHE = 'kiberone-v1'

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(['./', './index.html', './manifest.webmanifest', './icon-192.png'])))
  self.skipWaiting()
})

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
  )
  self.clients.claim()
})

self.addEventListener('fetch', (e) => {
  const req = e.request
  const url = new URL(req.url)
  if (req.method !== 'GET' || url.origin !== self.location.origin) return

  // Страница: сначала сеть (чтобы сразу получать новую версию), без сети — из кэша
  if (req.mode === 'navigate') {
    e.respondWith(
      fetch(req)
        .then((res) => { const copy = res.clone(); caches.open(CACHE).then((c) => c.put('./index.html', copy)); return res })
        .catch(() => caches.match('./index.html'))
    )
    return
  }

  // Файлы сборки (с хэшем в имени) и картинки: из кэша, а в фоне обновляем
  e.respondWith(
    caches.match(req).then((cached) => {
      const net = fetch(req).then((res) => {
        if (res.ok) { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(req, copy)) }
        return res
      }).catch(() => cached)
      return cached || net
    })
  )
})
