# Anki Alternative

Anki完全互換の間隔反復学習（SRS）アプリケーション - Bun.js + Next.js + React Native

## 🎯 特徴

- **100% Anki互換**: APKGファイルの完全インポートサポート
- **FSRS アルゴリズム**: ts-fsrsを使用した最新の間隔反復アルゴリズム
- **モダンスタック**: Bun.js + Next.js 16 + TypeScript
- **高速API**: Honoフレームワークによる高速RESTful API
- **美しいUI**: Tailwind CSS v4 + ダークモード完全対応
- **TDD開発**: Vitest + Bun testによるテスト駆動開発
- **マルチプラットフォーム**: Web + モバイル (React Native/Expo)
- **Context API**: テーマ管理にContext APIを使用

## 🛠️ 技術スタック

### Web (Next.js)
- **ランタイム**: Bun.js
- **フレームワーク**: Next.js 16
- **言語**: TypeScript
- **API**: Hono
- **データベース**: Bun SQLite (組み込み)
- **ORM**: Drizzle ORM
- **スケジューラ**: ts-fsrs (FSRS algorithm)
- **スタイリング**: Tailwind CSS v4
- **テスト**: Vitest + Bun test
- **インポート**: JSZip (APKG support)

### Mobile (React Native)
- **フレームワーク**: Expo + React Native
- **ルーティング**: Expo Router
- **スタイリング**: React Native StyleSheet
- **テーマ**: Context API + システムテーマ連動

## 📦 インストール

```bash
# Web アプリ
cd /path/to/project
bun install

# データベースマイグレーション
bun run scripts/migrate.ts

# 開発サーバーの起動
bun run dev

# モバイルアプリ
cd mobile
bun install
bun start
```

## 🚀 使い方

### Web アプリ開発

```bash
# 開発サーバー起動（Bunランタイム使用）
bun run dev

# ビルド
bun run build

# 本番環境での起動
bun run start

# テスト実行（Vitest）
bunx vitest run

# Bun test
bun test --run
```

### モバイルアプリ開発

```bash
cd mobile

# Expo開発サーバー起動
bun start

# Android
bun run android

# iOS
bun run ios

# Web (Expoブラウザ版)
bun run web
```

## 📚 機能

### ✅ 実装済み機能

**Webアプリ:**
- [x] デッキ管理（作成、編集、削除）
- [x] ノート管理
- [x] カード学習（FSRS アルゴリズム）
- [x] APKGファイルのインポート
- [x] レビュー履歴の記録
- [x] 統計情報の表示
- [x] メディアファイルのサポート
- [x] ダークモード（Context API使用）
- [x] レスポンシブデザイン
- [x] TDDによるテスト

**モバイルアプリ:**
- [x] ホーム画面
- [x] ダークモード（システムテーマ連動）
- [x] Expo Router によるナビゲーション
- [x] Context API テーマ管理
- [ ] デッキ管理画面
- [ ] 学習画面
- [ ] 統計画面

### 🔄 Ankiとの互換性

- ✅ APKGファイルフォーマット
- ✅ デッキ構造
- ✅ ノートタイプ（カードテンプレート）
- ✅ フィールドとタグ
- ✅ メディアファイル
- ✅ 間隔反復アルゴリズム（FSRS使用）

## 🏗️ プロジェクト構造

```
anki-alternative/
├── src/                    # Webアプリソース
│   ├── app/               # Next.js App Router
│   │   ├── api/          # Hono API routes
│   │   ├── decks/        # デッキページ
│   │   ├── study/        # 学習ページ
│   │   ├── browse/       # ノート参照
│   │   ├── stats/        # 統計
│   │   ├── import/       # APKGインポート
│   │   └── settings/     # 設定
│   ├── components/        # Reactコンポーネント
│   │   ├── Header.tsx    # 共通ヘッダー
│   │   └── ThemeToggle.tsx # ダークモード切り替え
│   ├── contexts/          # React Context
│   │   └── ThemeContext.tsx # テーマ管理
│   ├── lib/              # ユーティリティ
│   │   ├── scheduler.ts  # FSRSスケジューラ
│   │   └── apkg-importer.ts # APKGインポーター
│   ├── db/               # データベース
│   │   ├── schema.ts     # Drizzle スキーマ
│   │   └── index.ts      # DB接続（Bun SQLite）
│   └── __tests__/        # テスト
│       ├── scheduler.test.ts
│       ├── theme.test.tsx
│       └── setup.ts
├── mobile/                # React Native モバイルアプリ
│   ├── app/              # Expo Router
│   │   ├── _layout.tsx  # ルートレイアウト
│   │   └── index.tsx    # ホーム画面
│   └── src/
│       └── contexts/
│           └── ThemeContext.tsx # モバイル用テーマ
├── scripts/              # スクリプト
│   └── migrate.ts       # DBマイグレーション
├── drizzle/             # マイグレーションファイル
└── data/                # SQLiteデータベース
```

## 🗄️ データベーススキーマ

- **decks**: デッキ情報
- **note_types**: ノートタイプ（カードテンプレート）
- **notes**: ノート（質問と回答）
- **cards**: カード（レビューアイテム + FSRS パラメータ）
- **review_logs**: レビュー履歴
- **media**: メディアファイル（Base64エンコード）

## 🧪 テスト

TDD（テスト駆動開発）アプローチで開発されています。

```bash
# Vitest実行
bunx vitest run

# ウォッチモード
bunx vitest watch

# Bun test
bun test --run
```

### テストカバレッジ
- ✅ FSRSスケジューラー
- ✅ テーマContext（Web）
- ⏳ テーマContext（Mobile - React 19互換性調整中）

## 📖 API エンドポイント

### デッキ
- `GET /api/decks` - すべてのデッキを取得
- `POST /api/decks` - デッキを作成
- `GET /api/decks/:id` - デッキの詳細を取得
- `PUT /api/decks/:id` - デッキを更新
- `DELETE /api/decks/:id` - デッキを削除

### ノート
- `GET /api/notes` - すべてのノートを取得
- `POST /api/notes` - ノートを作成
- `GET /api/notes/:id` - ノートの詳細を取得
- `PUT /api/notes/:id` - ノートを更新
- `DELETE /api/notes/:id` - ノートを削除

### カード
- `GET /api/cards/due` - 復習待ちカードを取得
- `GET /api/cards/:id` - カードの詳細を取得
- `GET /api/cards/:id/options` - レビューオプションを取得（FSRS計算）
- `POST /api/cards/:id/review` - カードをレビュー

### 統計
- `GET /api/stats/deck/:id` - デッキの統計を取得

### インポート
- `POST /api/import/apkg` - APKGファイルをインポート

## 🎨 ダークモード

### Web
- Context APIによるテーマ管理
- localStorage でユーザー設定を保存
- システム設定の自動検出
- ページ全体でダークモード対応

### Mobile
- システムテーマの自動連動
- Appearanceモジュールでテーマ変更を監視
- Context APIで全画面共通管理

## 🔧 Bun.js ランタイム

- **開発サーバー**: `bun run dev` で高速起動
- **ビルド**: Next.js Turbopackと統合
- **SQLite**: Bun組み込みSQLiteを使用（開発時）
- **テスト**: Bun test + Vitestのハイブリッド

## 📝 設定

- 1日の新規カード数
- 1日の復習カード数
- FSRSパラメータの最適化
- テーマ設定（ライト/ダーク/自動）

## 🚧 今後の予定

- [ ] モバイルアプリの全機能実装
- [ ] オフライン同期機能
- [ ] クラウドバックアップ
- [ ] 音声読み上げ機能
- [ ] カスタムカードテンプレート
- [ ] プラグインシステム

## 📝 ライセンス

MIT License

## 🤝 コントリビューション

プルリクエストを歓迎します！

---

**Powered by FSRS Algorithm & Bun.js** 🚀
