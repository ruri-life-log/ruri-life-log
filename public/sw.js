// Service Worker for PWA
// 瑠璃の人生ログアプリのオフライン対応

const CACHE_NAME = 'ruri-life-log-v1.0.0';
const urlsToCache = [
  '/',
  '/index.html',
  '/styles/main.css',
  '/js/app.js',
  '/js/firebase-config.js',
  '/manifest.json',
  'https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js',
  'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js',
  'https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js'
];

// Service Worker インストール
self.addEventListener('install', (event) => {
  console.log('🔧 Service Worker インストール中...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('📦 キャッシュオープン完了');
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        console.log('✅ 必要ファイルのキャッシュ完了');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('❌ キャッシュエラー:', error);
      })
  );
});

// Service Worker アクティベート
self.addEventListener('activate', (event) => {
  console.log('🚀 Service Worker アクティベート');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('🗑️ 古いキャッシュを削除:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('✅ Service Worker アクティベート完了');
      return self.clients.claim();
    })
  );
});

// ネットワークリクエスト処理
self.addEventListener('fetch', (event) => {
  // Firebase API関連のリクエストはキャッシュしない
  if (event.request.url.includes('firebaseio.com') || 
      event.request.url.includes('googleapis.com') ||
      event.request.url.includes('identitytoolkit.googleapis.com')) {
    return;
  }
  
  // POSTリクエストはキャッシュしない
  if (event.request.method !== 'GET') {
    return;
  }
  
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // キャッシュにあれば返す
        if (response) {
          console.log('📦 キャッシュから取得:', event.request.url);
          return response;
        }
        
        // なければネットワークから取得
        return fetch(event.request)
          .then((response) => {
            // レスポンスが有効でない場合はそのまま返す
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }
            
            // レスポンスをクローンしてキャッシュに保存
            const responseToCache = response.clone();
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });
            
            return response;
          })
          .catch((error) => {
            console.log('❌ ネットワークエラー:', error);
            
            // ネットワークエラーの場合、オフライン用の簡易ページを表示
            if (event.request.destination === 'document') {
              return caches.match('/index.html');
            }
            
            // その他のリソースはエラーを返す
            throw error;
          });
      })
  );
});

// バックグラウンド同期（将来の機能拡張用）
self.addEventListener('sync', (event) => {
  console.log('🔄 バックグラウンド同期イベント:', event.tag);
  
  if (event.tag === 'background-sync') {
    console.log('🔄 バックグラウンド同期実行');
    // オフライン時に保存されたデータをFirestoreに同期する処理
    // 将来の機能拡張で実装予定
  }
});

// プッシュ通知（将来の機能拡張用）
self.addEventListener('push', (event) => {
  console.log('🔔 プッシュ通知受信:', event);
  
  let notificationData = {
    title: '瑠璃の人生ログ',
    body: '今日の記録をつける時間ですね！',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-192x192.png',
    vibrate: [200, 100, 200],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 'journal-reminder'
    },
    actions: [
      {
        action: 'open',
        title: 'アプリを開く',
        icon: '/icons/icon-192x192.png'
      },
      {
        action: 'close',
        title: '後で',
        icon: '/icons/icon-192x192.png'
      }
    ]
  };
  
  // プッシュデータがある場合はそれを使用
  if (event.data) {
    try {
      const pushData = event.data.json();
      notificationData = { ...notificationData, ...pushData };
    } catch (error) {
      console.error('❌ プッシュデータパースエラー:', error);
    }
  }
  
  event.waitUntil(
    self.registration.showNotification(notificationData.title, notificationData)
  );
});

// プッシュ通知クリックイベント
self.addEventListener('notificationclick', (event) => {
  console.log('🔔 プッシュ通知クリック:', event.action);
  
  event.notification.close();
  
  if (event.action === 'open' || !event.action) {
    // アプリを開く
    event.waitUntil(
      clients.matchAll({ type: 'window', includeUncontrolled: true })
        .then((clients) => {
          // 既に開いているタブがある場合はそれをアクティブに
          for (let client of clients) {
            if (client.url === self.location.origin && 'focus' in client) {
              return client.focus();
            }
          }
          
          // なければ新しいタブで開く
          if (clients.openWindow) {
            return clients.openWindow('/');
          }
        })
    );
  }
  // 'close'アクションの場合は何もしない
});

// エラーハンドラー
self.addEventListener('error', (event) => {
  console.error('❌ Service Worker エラー:', event.error);
});

console.log('🌸 瑠璃の人生ログ Service Worker 準備完了！');