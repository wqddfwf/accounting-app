// 缓存名称，更改此版本号将使缓存失效
const CACHE_NAME = 'daily-accounting-v1';

// 需要缓存的文件
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
];

// 安装Service Worker
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('缓存已打开');
        return cache.addAll(urlsToCache);
      })
  );
});

// 激活Service Worker
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            // 删除不在白名单中的缓存
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// 拦截网络请求
self.addEventListener('fetch', event => {
  // 处理非Firebase的请求
  if (!event.request.url.includes('firebase') && !event.request.url.includes('googleapis')) {
    event.respondWith(
      caches.match(event.request)
        .then(response => {
          // 如果在缓存中找到了响应，就返回缓存的版本
          if (response) {
            return response;
          }
          // 否则从网络获取
          return fetch(event.request)
            .then(response => {
              // 检查是否收到有效响应
              if (!response || response.status !== 200 || response.type !== 'basic') {
                return response;
              }

              // 克隆响应，一份用于缓存，一份返回给浏览器
              const responseToCache = response.clone();

              caches.open(CACHE_NAME)
                .then(cache => {
                  cache.put(event.request, responseToCache);
                });

              return response;
            });
        })
    );
  } else {
    // 对于Firebase请求，直接从网络获取，不进行缓存
    event.respondWith(fetch(event.request));
  }
}); 