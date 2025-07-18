# 🌸 瑠璃の人生ログサイト

## 概要
モバイルボヘミアン実現への38週間の旅路を記録するFirebaseベースのPWAサイト

## 🚀 機能
- 📝 **ジャーナリング**：日々の記録と感情トラッキング
- ✨ **ドリームリスト管理**：127個の夢の進捗追跡
- 🗺️ **38週間ロードマップ**：モバイルボヘミアン実現計画
- 💖 **感情トラッキング**：幸福度の数値化と可視化
- 🌙 **月次TO BEリスト**：意識的な生活サポート
- 🗾 **旅ログ**：移動と体験の記録

## 🛠️ 技術スタック
- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Backend**: Firebase (Firestore, Hosting)
- **PWA**: Service Worker, Web App Manifest
- **分析**: BigQuery連携予定
- **自動更新**: Claude MCP連携

## 📁 プロジェクト構造
```
ruri-life-log/
├── public/
│   ├── index.html          # メインページ
│   ├── styles/
│   │   └── main.css        # スタイルシート
│   ├── js/
│   │   ├── app.js          # メインアプリロジック
│   │   └── firebase-config.js  # Firebase設定
│   ├── manifest.json       # PWA設定
│   └── sw.js              # Service Worker
├── firebase.json           # Firebase設定
├── .firebaserc            # プロジェクト設定
├── firestore.rules        # Firestoreセキュリティルール
└── firestore.indexes.json  # Firestoreインデックス
```

## 🔧 セットアップ手順

### 1. Firebase設定
1. [Firebase Console](https://console.firebase.google.com/)でプロジェクト作成
2. プロジェクト名: `ruri-life-log` (推奨)
3. Firestore有効化
4. Firebase Hosting有効化
5. プロジェクト設定から設定情報を取得

### 2. Firebase設定情報の追加
`public/js/firebase-config.js`ファイルの`firebaseConfig`オブジェクトに以下の情報を追加：

```javascript
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "ruri-life-log.firebaseapp.com",
  projectId: "ruri-life-log",
  storageBucket: "ruri-life-log.appspot.com",
  messagingSenderId: "123456789",
  appId: "your-app-id"
};
```

### 3. ローカル開発
```bash
# Firebase CLI インストール
npm install -g firebase-tools

# ログイン
firebase login

# プロジェクト初期化（既に設定済み）
# firebase init hosting

# ローカル開発サーバー起動
firebase serve
```

### 4. デプロイ
```bash
firebase deploy
```

## 📊 データ構造

### Firestore Collections
- `journal`: ジャーナルエントリー
  ```javascript
  {
    content: "今日の記録",
    date: "2025-07-18",
    createdAt: timestamp,
    mood: "😊",
    tags: ["旅行", "仕事"]
  }
  ```

- `dreams`: ドリームリストアイテム
  ```javascript
  {
    title: "世界一周する",
    completed: false,
    category: "旅行",
    createdAt: timestamp,
    priority: 1
  }
  ```

- `emotions`: 感情トラッキングデータ
  ```javascript
  {
    happiness_level: 8.5,
    date: "2025-07-18",
    createdAt: timestamp,
    note: "今日はとても良い日でした"
  }
  ```

- `roadmap`: 38週間ロードマップ進捗
  ```javascript
  {
    week: 6,
    reflection: "今週の振り返り",
    completed: true,
    date: "2025-07-18",
    createdAt: timestamp
  }
  ```

- `monthly_themes`: 月次TO BEリスト
  ```javascript
  {
    title: "毎日ジャーナリング継続",
    completed: false,
    month: "2025-07",
    createdAt: timestamp
  }
  ```

- `travels`: 旅ログエントリー
  ```javascript
  {
    location: "知床, 北海道",
    experience: "温泉と夕日が最高でした",
    date: "2025-07-18",
    createdAt: timestamp
  }
  ```

## 🎯 開発ロードマップ

### Phase 1: 基盤構築 ✅
- [x] Firebase設定
- [x] 基本的なプロジェクト構造
- [x] PWA設定
- [x] GitHub MCP連携

### Phase 2: コア機能実装 🚧
- [x] ジャーナリング機能
- [x] ドリームリスト管理
- [x] 感情トラッキング
- [x] ロードマップ進捗管理
- [ ] データ分析ダッシュボード

### Phase 3: 高度な機能 🔮
- [ ] Claude MCP自動更新
- [ ] BigQuery連携
- [ ] プッシュ通知
- [ ] オフライン対応強化
- [ ] データエクスポート機能

## 🌟 特徴

### PWA対応
- オフライン対応
- インストール可能
- プッシュ通知対応
- アプリのような体験

### リアルタイム同期
- Firestoreによるリアルタイムデータ同期
- 複数デバイス間での自動同期

### レスポンシブデザイン
- モバイルファースト設計
- タブレット・デスクトップ対応

### アクセシビリティ
- キーボードショートカット対応
- ダークモード対応
- 読み上げソフト対応

## 🔐 セキュリティ

現在は開発モードで全許可設定。本番環境では認証を追加予定：
- Firebase Authentication
- ユーザー別データ分離
- セキュリティルール強化

## 📱 キーボードショートカット
- `Ctrl/Cmd + J`: ジャーナルエントリー追加
- `Ctrl/Cmd + D`: ドリーム追加
- `Ctrl/Cmd + E`: 感情記録追加

## 🌐 本番環境
デプロイ後のURL: `https://ruri-life-log.web.app`

## 📞 サポート
- 開発者: Claude MCP連携
- リポジトリ: https://github.com/ruri-life-log/ruri-life-log

## 📝 更新履歴
- **2025-07-18**: プロジェクト初期化、基本機能実装
- **Phase 2**: コア機能拡張予定
- **Phase 3**: AI連携機能実装予定

---

**🎊 瑠璃のモバイルボヘミアン実現を全力サポート！**