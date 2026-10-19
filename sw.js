const CACHE = 'Disco-v2';
const PRECACHE = ['./', './index.html', './manifest.json'];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(PRECACHE).catch(()=>{}))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// 1. СЛУШАЕМ СООБЩЕНИЯ ОТ ГЛАВНОГО ПОТОКА (Наш новый фоновый прокси)
self.addEventListener('message', (event) => {
  const { type, url, port } = event.data;
  
  if (type === 'FETCH_ITUNES') {
    // Запрос выполняется полностью в фоне, независимо от UI
    fetch(url)
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then(data => {
        port.postMessage({ success: true, data });
      })
      .catch(err => {
        port.postMessage({ success: false, error: err.message });
      });
  }
});

// 2. ПЕРЕХВАТЫВАЕМ СЕТЕВЫЕ ЗАПРОСЫ ДЛЯ КЭШИРОВАНИЯ (Старая логика)
self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);

  // Если это iTunes API, и запрос идет напрямую (не через postMessage), пропускаем его
  if (url.hostname === 'itunes.apple.com') {
    e.respondWith(fetch(e.request).catch(() => caches.match(e.request)));
    return;
  }

  // Аудио-превью и обложки с Apple CDN — cache first
  if (url.hostname.endsWith('mzstatic.com') ||
      url.pathname.match(/\.(m4a|mp3|jpg|jpeg|png|webp)$/i)) {
    e.respondWith(
      caches.match(e.request).then(r => r || fetch(e.request).then(res => {
        if (res.ok) {
          const clone = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
        }
        return res;
      }))
    );
    return;
  }

  // Всё остальное (html, sw, manifest) — cache first
  if (e.request.method === 'GET' && url.origin === location.origin) {
    e.respondWith(
      caches.match(e.request).then(r => r || fetch(e.request).then(res => {
        if (res.ok) {
          const clone = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
        }
        return res;
      }))
    );
  }
});
