// 🔄 Service Worker - 瑠璃の人生ログサイト
// オフライン対応・キャッシュ管理・PWA機能

const CACHE_NAME = 'ruri-life-log-v1.0.0';
const DATA_CACHE_NAME = 'ruri-life-log-data-v1.0.0';

// キャッシュするリソース
const FILES_TO_CACHE = [
    '/',
    '/index.html',
    '/styles/main.css',
    '/js/app.js',
    '/js/firebase-config.js',
    '/manifest.json',
    // Firebase SDK
    'https://www.gstatic.com/firebasejs/10.0.0/firebase-app-compat.js',
    'https://www.gstatic.com/firebasejs/10.0.0/firebase-firestore-compat.js',
    // フォント（オプション）
    'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap',
    // アイコン（実際のアイコンファイルが作成されたら追加）
    '/icons/icon-192x192.png',
    '/icons/icon-512x512.png'
];

// Firebase関連のURL（データキャッシュ用）
const DATA_URLS = [
    'https://firestore.googleapis.com',
    'https://ruri-life-log-default-rtdb.firebaseio.com'
];

// ==========================================================
// Service Worker インストール
// ==========================================================

self.addEventListener('install', (event) => {
    console.log('🔧 Service Worker: Installing...');
    
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('📦 Service Worker: Pre-caching app shell');
            return cache.addAll(FILES_TO_CACHE);
        })
    );
    
    // 新しいService Workerを即座にアクティブ化
    self.skipWaiting();
});

// ==========================================================
// Service Worker アクティベーション
// ==========================================================

self.addEventListener('activate', (event) => {
    console.log('✅ Service Worker: Activating...');
    
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    // 古いキャッシュを削除
                    if (cacheName !== CACHE_NAME && cacheName !== DATA_CACHE_NAME) {
                        console.log('🗑️ Service Worker: Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    
    // 全てのクライアントでService Workerを即座に制御開始
    self.clients.claim();
});

// ==========================================================
// ネットワークリクエスト処理
// ==========================================================

self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);
    
    // Firebase APIリクエストの処理
    if (isFirebaseRequest(url)) {
        event.respondWith(handleFirebaseRequest(request));
        return;
    }
    
    // 通常のリソースリクエストの処理
    event.respondWith(handleResourceRequest(request));
});

// Firebase関連リクエストかどうかを判定
function isFirebaseRequest(url) {
    return DATA_URLS.some(dataUrl => url.href.includes(dataUrl)) ||
           url.href.includes('googleapis.com') ||
           url.href.includes('firebaseio.com');
}

// Firebase APIリクエストの処理（Network First戦略）
async function handleFirebaseRequest(request) {
    try {
        // ネットワークを最初に試行
        const networkResponse = await fetch(request);
        
        // 成功した場合、レスポンスをキャッシュ
        if (networkResponse.status === 200) {
            const cache = await caches.open(DATA_CACHE_NAME);
            cache.put(request.url, networkResponse.clone());
        }
        
        return networkResponse;
    } catch (error) {
        // ネットワークエラーの場合、キャッシュから取得
        console.log('📡 Service Worker: Network request failed, trying cache...', request.url);
        
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }
        
        // オフライン用のエラーレスポンス
        return new Response(
            JSON.stringify({
                error: 'offline',
                message: 'オフラインモードです。データの同期は接続復旧後に行われます。'
            }),
            {
                status: 503,
                statusText: 'Service Unavailable',
                headers: { 'Content-Type': 'application/json' }
            }
        );
    }
}

// 通常のリソースリクエストの処理（Cache First戦略）
async function handleResourceRequest(request) {
    // GETリクエストのみキャッシュ処理
    if (request.method !== 'GET') {
        return fetch(request);
    }
    
    try {
        // キャッシュを最初に確認
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }
        
        // キャッシュにない場合、ネットワークから取得
        const networkResponse = await fetch(request);
        
        // 成功した場合、キャッシュに保存
        if (networkResponse.status === 200) {
            const cache = await caches.open(CACHE_NAME);
            cache.put(request, networkResponse.clone());
        }
        
        return networkResponse;
    } catch (error) {
        console.log('❌ Service Worker: Failed to fetch resource:', request.url);
        
        // オフライン用のフォールバック
        if (request.url.includes('.html') || request.headers.get('accept').includes('text/html')) {
            return caches.match('/index.html');
        }
        
        return new Response('オフラインです', {
            status: 503,
            statusText: 'Service Unavailable'
        });
    }
}

// ==========================================================
// バックグラウンド同期（将来実装）
// ==========================================================

self.addEventListener('sync', (event) => {
    console.log('🔄 Service Worker: Background sync triggered');
    
    if (event.tag === 'journal-sync') {
        event.waitUntil(syncJournalData());
    } else if (event.tag === 'dreams-sync') {
        event.waitUntil(syncDreamsData());
    } else if (event.tag === 'emotions-sync') {
        event.waitUntil(syncEmotionsData());
    }
});

// ジャーナルデータの同期
async function syncJournalData() {
    try {
        console.log('📝 Service Worker: Syncing journal data...');
        
        // IndexedDBからペンディング中のデータを取得
        const pendingEntries = await getPendingJournalEntries();
        
        // Firebase Firestoreに送信
        for (const entry of pendingEntries) {
            await submitJournalEntry(entry);
        }
        
        console.log('✅ Service Worker: Journal sync completed');
    } catch (error) {
        console.error('❌ Service Worker: Journal sync failed:', error);
        throw error; // 再試行のため
    }
}

// ドリームデータの同期
async function syncDreamsData() {
    try {
        console.log('✨ Service Worker: Syncing dreams data...');
        // 実装詳細は省略（同様のパターン）
    } catch (error) {
        console.error('❌ Service Worker: Dreams sync failed:', error);
        throw error;
    }
}

// 感情データの同期
async function syncEmotionsData() {
    try {
        console.log('💖 Service Worker: Syncing emotions data...');
        // 実装詳細は省略（同様のパターン）
    } catch (error) {
        console.error('❌ Service Worker: Emotions sync failed:', error);
        throw error;
    }
}

// ==========================================================
// プッシュ通知（将来実装）
// ==========================================================

self.addEventListener('push', (event) => {
    console.log('🔔 Service Worker: Push notification received');
    
    if (!event.data) {
        return;
    }
    
    const data = event.data.json();
    const options = {
        body: data.body || '新しい通知があります',
        icon: '/icons/icon-192x192.png',
        badge: '/icons/badge-72x72.png',
        vibrate: [200, 100, 200],
        data: data.data || {},
        actions: [
            {
                action: 'open',
                title: '開く'
            },
            {
                action: 'dismiss',
                title: '閉じる'
            }
        ],
        requireInteraction: true,
        tag: data.tag || 'default'
    };
    
    event.waitUntil(
        self.registration.showNotification(data.title || '瑠璃の人生ログ', options)
    );
});

// 通知クリック処理
self.addEventListener('notificationclick', (event) => {
    console.log('🔔 Service Worker: Notification clicked');
    
    event.notification.close();
    
    if (event.action === 'dismiss') {
        return;
    }
    
    // アプリを開く
    event.waitUntil(
        clients.matchAll().then((clientList) => {
            // 既に開いているタブがあるかチェック
            for (const client of clientList) {
                if (client.url === '/' && 'focus' in client) {
                    return client.focus();
                }
            }
            
            // 新しいタブを開く
            if (clients.openWindow) {
                return clients.openWindow('/');
            }
        })
    );
});

// ==========================================================
// ヘルパー関数（将来実装のスケルトン）
// ==========================================================

// IndexedDBからペンディング中のジャーナルエントリを取得
async function getPendingJournalEntries() {
    // IndexedDB実装は将来追加
    return [];
}

// Firebase Firestoreにジャーナルエントリを送信
async function submitJournalEntry(entry) {
    // Firebase送信実装は将来追加
    console.log('Submitting journal entry:', entry);
}

// ==========================================================
// メッセージ処理（メインスレッドとの通信）
// ==========================================================

self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
    
    if (event.data && event.data.type === 'CACHE_STATS') {
        getCacheStats().then(stats => {
            event.ports[0].postMessage(stats);
        });
    }
});

// キャッシュ統計情報を取得
async function getCacheStats() {
    const cacheNames = await caches.keys();
    const stats = {};
    
    for (const cacheName of cacheNames) {
        const cache = await caches.open(cacheName);
        const keys = await cache.keys();
        stats[cacheName] = keys.length;
    }
    
    return stats;
}

// ==========================================================
// デバッグ用ログ
// ==========================================================

console.log('🌸 Service Worker: Ruri Life Log SW loaded successfully!');

// Service Worker更新チェック
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'CHECK_UPDATE') {
        self.registration.update();
    }
});

// エラーハンドリング
self.addEventListener('error', (event) => {
    console.error('❌ Service Worker: Error occurred:', event.error);
});

self.addEventListener('unhandledrejection', (event) => {
    console.error('❌ Service Worker: Unhandled promise rejection:', event.reason);
});

console.log('✨ Service Worker: All event listeners registered. Ready for PWA magic!');