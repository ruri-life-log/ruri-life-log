// 🔥 Firebase設定ファイル
// 瑠璃のFirebaseプロジェクト設定

// Firebase設定オブジェクト（瑠璃の実際のプロジェクト設定）
const firebaseConfig = {
    apiKey: "AIzaSyDbJNz-R4HT9ziekVL90M8Rx-UExzEzzyc",
    authDomain: "ruri-life-log.firebaseapp.com",
    projectId: "ruri-life-log",
    storageBucket: "ruri-life-log.firebasestorage.app",
    messagingSenderId: "1043700740420",
    appId: "1:1043700740420:web:4be955de3f7d284a15a711",
    measurementId: "G-MFXB6VQS92"
};

// Firebase初期化
let app, db;

try {
    // Firebase App初期化
    app = firebase.initializeApp(firebaseConfig);
    
    // Firestore初期化
    db = firebase.firestore();
    
    // Firestore設定
    db.settings({
        cacheSizeBytes: firebase.firestore.CACHE_SIZE_UNLIMITED
    });
    
    // オフライン永続化を有効にする
    db.enablePersistence({
        synchronizeTabs: true
    }).catch((err) => {
        if (err.code == 'failed-precondition') {
            console.log('Multiple tabs open, persistence can only be enabled in one tab at a time.');
        } else if (err.code == 'unimplemented') {
            console.log('The current browser does not support offline persistence');
        }
    });
    
    console.log('🔥 Firebase初期化成功');
    
} catch (error) {
    console.error('❌ Firebase初期化エラー:', error);
}

// Firestoreコレクション参照
const collections = {
    journal: () => db.collection('journal'),
    dreams: () => db.collection('dreams'),
    emotions: () => db.collection('emotions'),
    roadmap: () => db.collection('roadmap'),
    monthlyThemes: () => db.collection('monthly_themes'),
    travels: () => db.collection('travels')
};

// Firebase接続状態監視
db.enableNetwork().then(() => {
    console.log('🌐 Firebase オンライン接続');
}).catch((error) => {
    console.log('📱 Firebase オフラインモード');
});

// タイムスタンプヘルパー
const timestamp = () => firebase.firestore.FieldValue.serverTimestamp();
const now = () => new Date().toISOString().split('T')[0]; // YYYY-MM-DD format

// エクスポート（グローバルスコープで利用可能に）
window.firebase = firebase;
window.db = db;
window.collections = collections;
window.timestamp = timestamp;
window.now = now;

// 瑠璃のドリームリスト初期データ（初回起動時に自動追加）
const initialDreams = [
    // 旅行カテゴリ
    { title: "世界一周する", category: "旅行", priority: 1 },
    { title: "韓国に行く", category: "旅行", priority: 2 },
    { title: "別府に行く", category: "旅行", priority: 2 },
    { title: "海外のビーチリゾートで小さな結婚式を挙げる", category: "旅行", priority: 1 },
    { title: "海外にハネムーンに行く", category: "旅行", priority: 1 },
    
    // ライフスタイルカテゴリ
    { title: "組織・人・場所・時間に依存しないライフスタイルを確立する", category: "ライフスタイル", priority: 1 },
    { title: "お気に入りの洋服だけのワードローブを作る", category: "ライフスタイル", priority: 2 },
    { title: "綺麗な海を見たり、窓から緑が見える場所で生活を送る", category: "ライフスタイル", priority: 1 },
    { title: "日常生活を大切に送る", category: "ライフスタイル", priority: 1 },
    { title: "ミニマルライフコストで生活する", category: "ライフスタイル", priority: 2 },
    
    // 健康・美容カテゴリ
    { title: "健康的に走る", category: "健康・美容", priority: 2 },
    { title: "人生を楽しむための体をつくる", category: "健康・美容", priority: 1 },
    { title: "綺麗な姿勢になる", category: "健康・美容", priority: 2 },
    { title: "体に優しい食生活を送る", category: "健康・美容", priority: 2 },
    { title: "温泉に毎日入ってリラックスする", category: "健康・美容", priority: 3 },
    
    // 人間関係カテゴリ
    { title: "一生にわたって仲の良いおばあちゃんになっても仲良く過ごす", category: "人間関係", priority: 1 },
    { title: "お母さん、お父さんと年に1回会う", category: "人間関係", priority: 2 },
    { title: "友達とピクニックする", category: "人間関係", priority: 3 },
    
    // ライフワークカテゴリ
    { title: "自然の中で仕事をする", category: "ライフワーク", priority: 1 },
    { title: "海外で旅しながらでも収入を得る", category: "ライフワーク", priority: 1 },
    { title: "瑠璃の名前で仕事を得る", category: "ライフワーク", priority: 1 },
    { title: "ワークタイムを週3日までに減らす", category: "ライフワーク", priority: 1 },
    { title: "瑠璃の価値観を考え、ライフスタイルを発信して応援してくれる人と繋がる", category: "ライフワーク", priority: 1 }
];

// 38週間ロードマップ初期データ
const roadmapWeeks = [
    // Phase 1: 整え・発信スタート（2025年7月〜9月）
    { week: 1, period: "2025/07/07〜07/13", content: "業務内容の棚卸し（好き/嫌い/疲れる/任せたい） / 現実と理想のギャップジャーナリング", phase: 1 },
    { week: 2, period: "2025/07/14〜07/20", content: "「理想の1日」ビジュアル化＆感覚を再確認 / note/Threadsで発信テーマを決定", phase: 1 },
    { week: 3, period: "2025/07/21〜07/27", content: "初投稿：「会社辞めたいと思った理由」 / noteで"今の働き方への違和感"記事", phase: 1 },
    { week: 4, period: "2025/07/28〜08/03", content: "週2回のThreads投稿スタート / 「モバイルボヘミアンになりたい理由」記事作成", phase: 1 },
    { week: 5, period: "2025/08/04〜08/10", content: "暮らしの発信素材ストック集め（写真・日常） / 自分の「整う習慣」も発信ネタに追加", phase: 1 },
    { week: 6, period: "2025/08/11〜08/17", content: "副業に向けて「るりの発信コンセプト」整理 / 引き継げそうな業務を社内でメモしはじめる", phase: 1 },
    { week: 7, period: "2025/08/18〜08/24", content: "note記事：「自由な働き方のためにしてること」 / 小さなデジタル商品案を考える", phase: 1 },
    { week: 8, period: "2025/08/25〜08/31", content: "「週3で暮らす理想の暮らし」文章化＆発信 / 副業プランをノートに3つ書いてみる", phase: 1 },
    { week: 9, period: "2025/09/01〜09/07", content: "Threads：「旅をしながら働く人生を選びたい理由」 / 自分の過去と今を照らす記事を書く", phase: 1 },
    { week: 10, period: "2025/09/08〜09/14", content: "引き継ぎリストの"私が担当しているタスク全体像"をまとめる（準備だけ） / 「自分の理想と向き合う週」として心身ケア重視", phase: 1 },
    
    // Phase 2: 副業土台づくり（2025年10月〜12月）
    { week: 20, period: "2025/11/18〜11/24", content: "暮らしと働き方をテーマにミニ講座企画（アイデア段階OK） / noteマガジン or メルマガ準備", phase: 2 },
    { week: 25, period: "2025/12/23〜12/29", content: "2025年のふりかえりジャーナリング / Threads＆noteで「ありがとう2025年」投稿＆整え納め🌙", phase: 2 },
    
    // Phase 3: 独立・実験・旅立ち（2026年1月〜3月）
    { week: 30, period: "2026/01/26〜02/01", content: "⭐️**正式に退職の意思を上司に伝える（退職日：3月末予定）** / 引き継ぎ内容の整理スタート", phase: 3 },
    { week: 35, period: "2026/03/02〜03/08", content: "\"るりの旅暮らし\"開始宣言＆発信スタート / 旅先からライブ感のある発信（写真/動画）", phase: 3 },
    { week: 38, period: "2026/03/23〜03/29", content: "今後の収入源と暮らし方の方向性を調整 / 第一段階の「理想の人生」完了🌱次のテーマを描く", phase: 3 }
];

// 初期データセットアップ関数
async function setupInitialData() {
    try {
        // ドリームリストの初期データをチェック
        const dreamsSnapshot = await collections.dreams().limit(1).get();
        
        if (dreamsSnapshot.empty) {
            console.log('🌟 初期ドリームリストを作成中...');
            
            const batch = db.batch();
            
            initialDreams.forEach(dream => {
                const dreamRef = collections.dreams().doc();
                batch.set(dreamRef, {
                    ...dream,
                    completed: false,
                    createdAt: timestamp()
                });
            });
            
            await batch.commit();
            console.log('✨ 初期ドリームリスト作成完了！');
        }
        
        // ロードマップの初期データをチェック
        const roadmapSnapshot = await collections.roadmap().limit(1).get();
        
        if (roadmapSnapshot.empty) {
            console.log('🗺️ 初期ロードマップを作成中...');
            
            const batch = db.batch();
            
            roadmapWeeks.forEach(week => {
                const weekRef = collections.roadmap().doc();
                batch.set(weekRef, {
                    ...week,
                    completed: false,
                    reflection: "",
                    createdAt: timestamp()
                });
            });
            
            await batch.commit();
            console.log('🎯 初期ロードマップ作成完了！');
        }
        
    } catch (error) {
        console.error('❌ 初期データセットアップエラー:', error);
    }
}

// DOMコンテンツ読み込み完了後に初期データセットアップを実行
document.addEventListener('DOMContentLoaded', () => {
    // Firebase初期化完了を待つ
    if (db) {
        setupInitialData();
    } else {
        // Firebase初期化を待ってから実行
        setTimeout(() => {
            if (db) {
                setupInitialData();
            }
        }, 1000);
    }
});

// デバッグ用：Firebase接続テスト
window.testFirebaseConnection = async () => {
    try {
        await collections.journal().add({
            content: "Firebase接続テスト",
            date: now(),
            createdAt: timestamp(),
            isTest: true
        });
        console.log('✅ Firebase接続テスト成功');
        return true;
    } catch (error) {
        console.error('❌ Firebase接続テストエラー:', error);
        return false;
    }
};

console.log('🌸 瑠璃のFirebase設定完了！人生ログサイトの準備万端✨');