# 新機能ドキュメント

このプロジェクトに追加された新機能の概要です。

## 🎯 追加された機能

### 1. 📱 モバイル完全対応（Solito使用）

- **Bun Workspaceの構成**: モノレポ構造でWeb（Next.js）とMobile（Expo）を統合
- **Solito統合**: クロスプラットフォームナビゲーションとコンポーネント共有
- **共有UIコンポーネント**: `packages/app`に配置された再利用可能なコンポーネント
  - `DeckCard`: デッキ表示カード
  - `ReviewButton`: 復習ボタン
  - `StatsCard`: 統計表示カード

#### モバイルアプリの構成

```
mobile/
├── app/              # Expo Routerベースの画面
│   ├── _layout.tsx   # ルートレイアウト
│   ├── index.tsx     # ホーム画面
│   ├── decks.tsx     # デッキ一覧
│   ├── study.tsx     # 学習画面
│   ├── stats.tsx     # 統計画面
│   ├── browse.tsx    # 参照画面
│   ├── import.tsx    # インポート画面
│   └── settings.tsx  # 設定画面
└── src/
    └── contexts/     # 共有Context
```

### 2. 🔌 Hono API統合（Next.js API Routes）

- **Honoフレームワーク**: 高速で軽量なAPIルーター
- **Next.js API Routes統合**: `app/api/[...route]/route.ts`でHonoハンドラーを使用
- **RESTful API設計**: 
  - デッキ管理 (`/api/decks`)
  - ノート管理 (`/api/notes`)
  - カード管理 (`/api/cards`)
  - 統計 (`/api/stats`)
  - インポート (`/api/import`)

#### APIエンドポイント例

```typescript
GET    /api/decks          # デッキ一覧取得
POST   /api/decks          # デッキ作成
GET    /api/decks/:id      # デッキ詳細取得
PUT    /api/decks/:id      # デッキ更新
DELETE /api/decks/:id      # デッキ削除

GET    /api/cards/due      # 復習カード取得
POST   /api/cards/:id/review  # カード復習記録
GET    /api/cards/:id/options # 復習オプション取得
```

### 3. 🎨 Context API強化（7種類のContext）

#### 実装済みContext

1. **ThemeContext** (`src/contexts/ThemeContext.tsx`)
   - ライト/ダークモード切り替え
   - システム設定の自動検出
   - ローカルストレージ永続化

2. **AppContext** (`src/contexts/AppContext.tsx`)
   - デッキ管理
   - グローバル状態管理（読み込み状態、エラー状態）
   - CRUD操作のヘルパー関数

3. **StudyContext** (`src/contexts/StudyContext.tsx`)
   - 学習セッション管理
   - 統計計算（日次、週次）
   - 回答記録

4. **Providers** (`src/contexts/index.tsx`)
   - すべてのContextの統合
   - 簡易インポート

#### 使用例

```typescript
import { useTheme, useApp, useStudy } from '@/contexts';

function MyComponent() {
  const { isDark, toggleTheme } = useTheme();
  const { decks, addDeck, currentDeck } = useApp();
  const { startSession, recordAnswer } = useStudy();
  
  // ...
}
```

### 4. 🧪 TDD（テスト駆動開発）

#### テストカバレッジ

- **Context Tests**: 各Contextの単体テスト
  - `app-context.test.tsx`
  - `study-context.test.tsx`
  - `theme.test.tsx`
  
- **API Tests**: Hono APIエンドポイントのテスト
  - `api.test.ts`
  - `hono-nextjs.test.ts`
  
- **Integration Tests**: Context間の統合テスト
  - `integration.test.tsx`

- **Scheduler Tests**: FSRSアルゴリズムのテスト
  - `scheduler.test.ts`

#### テスト実行

```bash
# すべてのテストを実行
bun test

# ウォッチモードで実行
bun test:watch

# UIモードで実行
bun test:ui

# カバレッジ付きで実行
bun test:coverage
```

## 🚀 使い方

### 開発環境のセットアップ

```bash
# 依存関係のインストール
bun install

# Webアプリの開発サーバー起動
bun dev

# モバイルアプリの開発サーバー起動
bun dev:mobile

# テスト実行
bun test
```

### ビルド

```bash
# Webアプリのビルド
bun build

# モバイルアプリのビルド
bun build:mobile
```

## 📁 プロジェクト構造

```
.
├── packages/
│   └── app/              # 共有UIコンポーネント（Solito）
│       ├── components/
│       └── package.json
├── mobile/               # モバイルアプリ（Expo）
│   ├── app/              # 画面
│   └── src/
│       └── contexts/     # 共有Context
├── src/
│   ├── api/              # Hono APIルート定義
│   ├── app/              # Next.jsアプリ
│   │   └── api/
│   │       └── [...route]/
│   │           └── route.ts  # Hono統合
│   ├── contexts/         # React Context
│   │   ├── ThemeContext.tsx
│   │   ├── AppContext.tsx
│   │   ├── StudyContext.tsx
│   │   └── index.tsx
│   └── __tests__/        # テスト
│       ├── app-context.test.tsx
│       ├── study-context.test.tsx
│       ├── api.test.ts
│       ├── hono-nextjs.test.ts
│       └── integration.test.tsx
├── package.json          # ルートpackage.json（workspace設定）
└── vitest.config.ts      # テスト設定
```

## 🔧 技術スタック

- **フレームワーク**: Next.js 16, Expo 54
- **ランタイム**: Bun
- **状態管理**: React Context API
- **API**: Hono 4
- **ナビゲーション**: Solito 4
- **スタイリング**: Tailwind CSS 4, React Native StyleSheet
- **テスト**: Vitest 4, React Testing Library
- **データベース**: Drizzle ORM
- **学習アルゴリズム**: ts-fsrs (FSRS v5)

## 📝 今後の拡張予定

- [ ] オフライン同期機能
- [ ] プッシュ通知
- [ ] データエクスポート/インポート
- [ ] カスタムテーマ
- [ ] 音声再生機能
- [ ] 画像オクルージョン
- [ ] アドオンシステム
