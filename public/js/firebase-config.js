// Firebase 設定ファイル
// 瑠璃のFirebaseプロジェクトの設定を入力してください

const firebaseConfig = {
  // 瑠璃のFirebaseプロジェクト設定をここに追加
  // 例:
  // apiKey: "your-api-key",
  // authDomain: "ruri-life-log.firebaseapp.com",
  // projectId: "ruri-life-log",
  // storageBucket: "ruri-life-log.appspot.com",
  // messagingSenderId: "123456789",
  // appId: "your-app-id"
};

// Firebase初期化
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js';
import { getFirestore, connectFirestoreEmulator } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';
import { getAuth } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

// 開発環境でのFirestoreエミュレータ接続（必要に応じて）
// if (location.hostname === 'localhost') {
//   connectFirestoreEmulator(db, 'localhost', 8080);
// }

console.log('🔥 Firebase初期化完了');