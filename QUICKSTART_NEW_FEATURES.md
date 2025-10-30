# 新機能クイックスタートガイド

このガイドでは、新しく実装された機能の使い方を簡単に説明します。

## 🚀 セットアップ

### 1. データベースマイグレーション

新しいテーブルを作成します：

```bash
bun run db:migrate:new
```

### 2. 開発サーバー起動

```bash
# Webアプリ
bun run dev

# モバイルアプリ
bun run dev:mobile
```

## 📤 デッキ共有機能の使い方

### Webアプリ

```typescript
import { useSharing } from '@/contexts';

function ShareDeckButton({ deckId }: { deckId: number }) {
  const { shareDeck } = useSharing();
  
  const handleShare = async () => {
    const sharedDeck = await shareDeck(
      deckId,
      'My Awesome Deck',
      'Learn Japanese verbs',
      true // 公開設定
    );
    
    console.log('Share code:', sharedDeck.shareCode);
    // ユーザーにシェアコードを表示
  };
  
  return <button onClick={handleShare}>デッキを共有</button>;
}
```

### 共有デッキをブラウズ

```typescript
function SharedDecksPage() {
  const { sharedDecks, fetchPublicDecks, downloadDeck } = useSharing();
  
  useEffect(() => {
    fetchPublicDecks();
  }, []);
  
  return (
    <div>
      {sharedDecks.map(deck => (
        <div key={deck.id}>
          <h3>{deck.title}</h3>
          <p>{deck.description}</p>
          <button onClick={() => downloadDeck(deck.shareCode)}>
            ダウンロード
          </button>
        </div>
      ))}
    </div>
  );
}
```

### モバイルアプリ

`mobile/app/sharing.tsx` 画面に移動するだけで、共有デッキをブラウズ・ダウンロードできます。

## 🏆 ランキング機能の使い方

### グローバルランキングを表示

```typescript
import { useRanking } from '@/contexts';

function RankingsPage() {
  const { globalRankings, fetchGlobalRankings } = useRanking();
  
  useEffect(() => {
    fetchGlobalRankings(100); // 上位100名
  }, []);
  
  return (
    <div>
      <h1>グローバルランキング</h1>
      {globalRankings.map((ranking, index) => (
        <div key={ranking.id}>
          <span>#{index + 1}</span>
          <span>{ranking.totalReviews} レビュー</span>
          <span>{ranking.currentStreak} 日連続</span>
        </div>
      ))}
    </div>
  );
}
```

### 学習後にランキング更新

```typescript
function StudySession() {
  const { updateRanking } = useRanking();
  const { recordDailyStats } = useRanking();
  
  const finishSession = async (reviewCount: number, studyTime: number) => {
    // ランキング更新
    await updateRanking(reviewCount, studyTime, 7); // 7日連続
    
    // 日次統計記録
    await recordDailyStats({
      reviewCount,
      studyTime,
      newCardsLearned: 10,
      cardsReviewed: reviewCount,
    });
  };
  
  return <button onClick={() => finishSession(50, 1800)}>完了</button>;
}
```

## ☁️ バックアップ・同期機能

### 手動バックアップ作成

```typescript
import { useSync } from '@/contexts';

function BackupButton() {
  const { createBackup } = useSync();
  
  const handleBackup = async () => {
    const data = {
      decks: [...], // デッキデータ
      cards: [...], // カードデータ
      notes: [...], // ノートデータ
    };
    
    await createBackup(
      data,
      'my-device-123',
      'web'
    );
    
    alert('バックアップ完了！');
  };
  
  return <button onClick={handleBackup}>バックアップ</button>;
}
```

### 最新バックアップから復元

```typescript
function RestoreButton() {
  const { getLatestBackup, restoreBackup } = useSync();
  
  const handleRestore = async () => {
    const latest = await getLatestBackup('web');
    
    if (latest) {
      const { data } = await restoreBackup(latest.id);
      // データを復元
      console.log('Restored data:', data);
    }
  };
  
  return <button onClick={handleRestore}>復元</button>;
}
```

### オフライン変更の自動記録

```typescript
function OfflineReview() {
  const { isOnline, addToSyncQueue } = useSync();
  
  const reviewCard = async (cardId: number, rating: number) => {
    // カードをレビュー
    // ...
    
    // オフラインの場合、同期キューに追加
    if (!isOnline) {
      await addToSyncQueue({
        entityType: 'card',
        entityId: cardId,
        action: 'update',
        data: { rating, timestamp: Date.now() }
      });
    }
  };
  
  return <div>{isOnline ? 'オンライン' : 'オフライン'}</div>;
}
```

## 🎨 カスタムテンプレート

### テンプレート作成

```typescript
import { useTemplate } from '@/contexts';

function CreateTemplateForm() {
  const { createTemplate } = useTemplate();
  
  const handleSubmit = async () => {
    await createTemplate({
      name: 'Beautiful Cards',
      frontTemplate: `
        <div class="card-front">
          <h1>{{Question}}</h1>
        </div>
      `,
      backTemplate: `
        <div class="card-back">
          <h1>{{Question}}</h1>
          <hr>
          <p>{{Answer}}</p>
        </div>
      `,
      css: `
        .card-front {
          background: linear-gradient(45deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 40px;
          text-align: center;
        }
      `,
      isPublic: true
    });
    
    alert('テンプレート作成完了！');
  };
  
  return <button onClick={handleSubmit}>作成</button>;
}
```

### 公開テンプレートをダウンロード

```typescript
function TemplateGallery() {
  const { publicTemplates, fetchPublicTemplates, downloadTemplate } = useTemplate();
  
  useEffect(() => {
    fetchPublicTemplates();
  }, []);
  
  return (
    <div>
      {publicTemplates.map(template => (
        <div key={template.id}>
          <h3>{template.name}</h3>
          <p>{template.downloadCount} downloads</p>
          <button onClick={() => downloadTemplate(template.id)}>
            ダウンロード
          </button>
        </div>
      ))}
    </div>
  );
}
```

## 🔊 音声読み上げ

### 音声設定

```typescript
import { useVoice } from '@/contexts';

function VoiceSettings() {
  const { settings, voices, updateSettings } = useVoice();
  
  const handleUpdate = async () => {
    await updateSettings({
      enabled: true,
      voice: 'ja-JP-Standard-A',
      speed: 1.2,
      pitch: 1.0,
      autoPlay: true,
      fieldToRead: 'Front'
    });
  };
  
  return (
    <div>
      <select onChange={(e) => updateSettings({ voice: e.target.value })}>
        {voices.map(voice => (
          <option key={voice.name} value={voice.name}>
            {voice.name}
          </option>
        ))}
      </select>
      <button onClick={handleUpdate}>設定保存</button>
    </div>
  );
}
```

### カード学習時に読み上げ

```typescript
function StudyCard({ cardText }: { cardText: string }) {
  const { speak, stop, settings } = useVoice();
  
  useEffect(() => {
    if (settings.autoPlay) {
      speak(cardText);
    }
  }, [cardText]);
  
  return (
    <div>
      <p>{cardText}</p>
      <button onClick={() => speak(cardText)}>🔊 再生</button>
      <button onClick={stop}>⏹️ 停止</button>
    </div>
  );
}
```

## 📱 モバイルアプリ

新しい画面が追加されています：

1. **共有デッキ画面** (`/sharing`)
   - 公開デッキのブラウズ
   - ダウンロード・いいね

2. **ランキング画面** (`/rankings`)
   - グローバルランキング
   - ストリーク・学習時間ランキング
   - 個人統計

3. **テンプレート画面** (`/templates`)
   - 公開テンプレートストア
   - マイテンプレート管理

これらの画面はExpo Routerで自動的にルーティングされます。

## 🧪 テスト

すべての機能はテスト済みです：

```bash
# すべてのテストを実行
bun test

# 特定のテストのみ
bun test sharing.test.ts
bun test ranking.test.ts
bun test sync.test.ts
```

## 💡 ヒント

### パフォーマンス最適化

- ランキングは1日1回の更新で十分
- バックアップは学習セッション後に自動実行
- 同期キューは定期的にクリーンアップ

### ベストプラクティス

- 共有デッキには説明を付ける
- テンプレートはプレビューしてから公開
- 音声速度は1.0-1.5が聞き取りやすい
- オフライン時は重要な変更を避ける

## 🆘 トラブルシューティング

### マイグレーションが失敗する

```bash
# データベースファイルがない場合は作成
mkdir -p data
touch data/anki.db

# 再度マイグレーション実行
bun run db:migrate:new
```

### Contextが動作しない

Providersが正しく配置されているか確認：

```typescript
// app/layout.tsx
import { Providers } from '@/contexts';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
```

### 音声が再生されない

ブラウザの音声許可を確認してください。HTTPSまたはlocalhostでのみ動作します。

---

これで新機能をすぐに使い始められます！詳細は `NEW_FEATURES.md` を参照してください。
