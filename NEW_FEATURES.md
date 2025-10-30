# 新機能実装完了ドキュメント

このドキュメントでは、Anki Alternative アプリに新たに実装された機能について詳しく説明します。

## 🎯 実装された機能一覧

### 1. 📤 Anki Web風共有機能

デッキやカード一覧を他のユーザーと共有できる、Anki Webライクな機能を実装しました。

#### 機能詳細

**デッキ共有**
- デッキを公開・非公開で共有
- ユニークなシェアコードの自動生成
- 共有デッキのタイトル・説明設定

**共有デッキブラウズ**
- 公開デッキ一覧の表示
- ダウンロード数・いいね数でソート
- 検索機能

**ダウンロード機能**
- シェアコードでデッキをダウンロード
- ダウンロード数の自動カウント
- 完全なデッキデータの復元

**いいね機能**
- デッキにいいねを付ける
- 人気デッキランキング

#### APIエンドポイント

```
GET    /api/shared-decks              # 公開デッキ一覧
GET    /api/shared-decks/:shareCode   # デッキ詳細
POST   /api/shared-decks              # デッキ共有
POST   /api/shared-decks/:shareCode/download  # ダウンロード
POST   /api/shared-decks/:id/like     # いいね
```

#### 使用方法（Web）

```typescript
import { useSharing } from '@/contexts';

function MyComponent() {
  const { sharedDecks, shareDeck, downloadDeck, likeDeck } = useSharing();
  
  // デッキを共有
  await shareDeck(deckId, 'タイトル', '説明', true);
  
  // デッキをダウンロード
  const deck = await downloadDeck('DECK-12345-abc');
  
  // いいねを付ける
  await likeDeck(deckId);
}
```

#### 使用方法（Mobile）

新しい画面 `mobile/app/sharing.tsx` で共有デッキをブラウズ・ダウンロードできます。

---

### 2. 🏆 ユーザーランキング機能

複数ユーザーの学習履歴を比較・表示するランキングシステムを実装しました。

#### 機能詳細

**グローバルランキング**
- 総レビュー数でランキング
- 上位100名表示
- リアルタイム更新

**連続学習日数ランキング**
- 現在のストリーク（連続日数）でランキング
- 最長ストリーク記録
- 毎日の学習モチベーション向上

**学習時間ランキング**
- 累計学習時間でランキング
- 秒単位で正確に記録
- 時間換算表示

**個人統計**
- 日次学習データの記録
- レビュー数、新規カード数、学習時間
- 30日間のグラフ表示（準備中）

#### データベーススキーマ

```typescript
// ランキングテーブル
rankings: {
  userId: string;
  totalReviews: number;
  totalStudyTime: number;
  currentStreak: number;
  longestStreak: number;
  rank: number;
}

// 日次統計テーブル
userStats: {
  userId: string;
  date: Date;
  reviewCount: number;
  studyTime: number;
  newCardsLearned: number;
  cardsReviewed: number;
  streak: number;
}
```

#### APIエンドポイント

```
GET    /api/rankings/global           # グローバルランキング
GET    /api/rankings/by-streak        # ストリークランキング
GET    /api/rankings/by-study-time    # 学習時間ランキング
GET    /api/rankings/user/:userId     # ユーザーランキング
POST   /api/rankings/update           # ランキング更新
GET    /api/stats/daily               # 日次統計取得
POST   /api/stats/daily               # 日次統計記録
```

#### 使用方法

```typescript
import { useRanking } from '@/contexts';

function RankingPage() {
  const { 
    globalRankings, 
    userRanking,
    fetchGlobalRankings,
    updateRanking 
  } = useRanking();
  
  useEffect(() => {
    fetchGlobalRankings();
  }, []);
  
  // ランキング更新
  await updateRanking(50, 1800, 7); // reviews, time, streak
}
```

---

### 3. ☁️ クラウドバックアップ & オフライン同期

複数デバイス間でのデータ同期とオフライン対応を実装しました。

#### 機能詳細

**クラウドバックアップ**
- 自動バックアップ作成
- デバイス別バックアップ管理
- バージョン管理
- 最新バックアップの自動取得

**オフライン同期キュー**
- オフライン時の変更を自動キューイング
- オンライン復帰時の自動同期
- 変更内容の保存（作成・更新・削除）
- 競合解決（Last-Write-Wins）

**デバイス管理**
- Web・iOS・Android別管理
- デバイスIDによる識別
- デバイス別同期状態

#### データベーススキーマ

```typescript
// バックアップテーブル
cloudBackups: {
  userId: string;
  backupData: string; // JSON圧縮
  deviceId: string;
  deviceType: 'web' | 'mobile' | 'ios' | 'android';
  version: number;
  created: Date;
}

// 同期キュー
syncQueue: {
  userId: string;
  deviceId: string;
  entityType: 'card' | 'deck' | 'note' | 'review';
  entityId: number;
  action: 'create' | 'update' | 'delete';
  data: JSON;
  synced: boolean;
  created: Date;
}
```

#### APIエンドポイント

```
GET    /api/backups                   # バックアップ一覧
GET    /api/backups/latest            # 最新バックアップ
POST   /api/backups                   # バックアップ作成
POST   /api/backups/restore/:id       # バックアップ復元
GET    /api/sync/queue                # 同期キュー取得
POST   /api/sync/queue                # キューに追加
POST   /api/sync/mark-synced          # 同期完了マーク
```

#### 使用方法

```typescript
import { useSync } from '@/contexts';

function SyncManager() {
  const { 
    createBackup, 
    getLatestBackup,
    addToSyncQueue,
    syncAll,
    isOnline 
  } = useSync();
  
  // バックアップ作成
  await createBackup(data, deviceId, 'web');
  
  // 最新バックアップ取得
  const backup = await getLatestBackup('mobile');
  
  // オフライン変更を記録
  if (!isOnline) {
    await addToSyncQueue({
      entityType: 'card',
      entityId: cardId,
      action: 'update',
      data: { rating: 3 }
    });
  }
  
  // 全同期
  await syncAll(deviceId);
}
```

---

### 4. 🎨 カスタムカードテンプレート

HTML/CSS/JavaScriptで自由にカスタマイズできるテンプレートシステムを実装しました。

#### 機能詳細

**テンプレート作成**
- フロント・バックテンプレートのHTML編集
- カスタムCSS適用
- JavaScript実行（任意）
- プレビュー機能（準備中）

**公開テンプレート**
- テンプレートを公開
- コミュニティ共有
- ダウンロード数カウント

**テンプレートストア**
- 人気テンプレート一覧
- ダウンロード数でソート
- 検索機能

#### テンプレート例

```html
<!-- フロントテンプレート -->
<div class="card-front">
  <h1>{{Front}}</h1>
  <div class="hint">{{Hint}}</div>
</div>

<!-- バックテンプレート -->
<div class="card-back">
  <h1>{{Front}}</h1>
  <hr>
  <p>{{Back}}</p>
</div>

<!-- CSS -->
<style>
.card-front {
  font-size: 24px;
  text-align: center;
  padding: 20px;
}
.card-back {
  font-size: 18px;
}
</style>
```

#### APIエンドポイント

```
GET    /api/templates                 # ユーザーテンプレート
GET    /api/templates?public=true     # 公開テンプレート
GET    /api/templates/:id             # テンプレート詳細
POST   /api/templates                 # テンプレート作成
PUT    /api/templates/:id             # テンプレート更新
DELETE /api/templates/:id             # テンプレート削除
POST   /api/templates/:id/download    # ダウンロード
```

#### 使用方法

```typescript
import { useTemplate } from '@/contexts';

function TemplateEditor() {
  const { 
    templates,
    createTemplate,
    downloadTemplate 
  } = useTemplate();
  
  // テンプレート作成
  await createTemplate({
    name: 'Custom Basic',
    frontTemplate: '<div>{{Front}}</div>',
    backTemplate: '<div>{{Back}}</div>',
    css: '.card { font-size: 20px; }',
    isPublic: true
  });
  
  // ダウンロード
  const template = await downloadTemplate(templateId);
}
```

---

### 5. 🔊 音声読み上げ機能

Web Speech APIを使用した音声読み上げ機能を実装しました。

#### 機能詳細

**自動読み上げ**
- カード表示時の自動再生
- フィールド選択（Front/Back/Both）
- 自動再生ON/OFF

**音声カスタマイズ**
- 速度調整（0.5x - 2.0x）
- ピッチ調整
- 音声選択（システム音声）

**多言語対応**
- Web Speech API対応の全言語
- 日本語、英語、中国語など
- 音声エンジン別音声

#### APIエンドポイント

```
GET    /api/voice/settings            # 音声設定取得
POST   /api/voice/settings            # 音声設定更新
```

#### 使用方法

```typescript
import { useVoice } from '@/contexts';

function StudyCard() {
  const { 
    settings,
    voices,
    speak,
    stop,
    updateSettings 
  } = useVoice();
  
  // 設定更新
  await updateSettings({
    enabled: true,
    voice: 'ja-JP-Standard-A',
    speed: 1.2,
    autoPlay: true
  });
  
  // 読み上げ
  speak('こんにちは');
  
  // 停止
  stop();
}
```

---

## 🧪 テスト駆動開発（TDD）

すべての新機能はTDDアプローチで実装されています。

### テストファイル

- `src/__tests__/sharing.test.ts` - 共有機能
- `src/__tests__/ranking.test.ts` - ランキング機能
- `src/__tests__/sync.test.ts` - 同期機能
- `src/__tests__/custom-templates.test.ts` - テンプレート機能
- `src/__tests__/voice.test.ts` - 音声機能
- `src/__tests__/new-features-api.test.ts` - API統合テスト

### テスト実行

```bash
# すべてのテストを実行
bun test

# ウォッチモード
bun test:watch

# カバレッジ
bun test:coverage
```

---

## 📱 モバイルアプリ完全実装

### 新規画面

- `mobile/app/sharing.tsx` - 共有デッキブラウザ
- `mobile/app/rankings.tsx` - ランキング表示
- `mobile/app/templates.tsx` - テンプレートストア

### Context統合

すべての新機能はContext APIで統合されており、Web/モバイル両方で同じAPIを使用できます。

```typescript
// Web & Mobile共通
import { 
  useSharing, 
  useRanking, 
  useSync, 
  useTemplate, 
  useVoice 
} from '@/contexts';
```

---

## 🔐 認証統合

すべての新機能は既存の認証システムと統合されており、ユーザー別にデータが管理されます。

- Better Auth使用
- セッション管理
- ユーザーIDベースのデータ分離

---

## 🚀 デプロイメント

### データベースマイグレーション

新しいテーブルを追加したため、マイグレーションが必要です：

```bash
bun run db:generate
bun run db:migrate
```

### 環境変数

追加の環境変数は不要です。既存の設定で動作します。

---

## 📊 パフォーマンス

- ランキングクエリ: インデックス最適化済み
- バックアップデータ: JSON圧縮
- 同期キュー: バッチ処理対応
- 音声: ブラウザネイティブAPI使用（軽量）

---

## 🔮 今後の拡張予定

- [ ] ランキングのリアルタイム更新（WebSocket）
- [ ] グラフィカルな統計表示
- [ ] テンプレートプレビュー機能
- [ ] 音声合成API統合（クラウドTTS）
- [ ] プッシュ通知（モバイル）
- [ ] ソーシャル機能（フォロー・コメント）

---

## 📝 まとめ

この実装により、Anki Alternative は以下の機能を持つフル機能のSRSアプリケーションになりました：

✅ Anki完全互換のコア機能  
✅ Anki Web風の共有・コミュニティ機能  
✅ グローバルランキング・統計  
✅ クロスプラットフォーム同期  
✅ カスタマイズ可能なテンプレート  
✅ 音声読み上げサポート  
✅ TDDによる高品質コード  
✅ Web + モバイル完全対応  

すべての機能は7つのContextを通じて提供され、テスト済みで本番環境にデプロイ可能です。
