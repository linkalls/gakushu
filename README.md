# Anki Alternative

Anki完全互換の間隔反復学習（SRS）アプリケーション

## 🎯 特徴

- **100% Anki互換**: APKGファイルの完全インポートサポート
- **FSRS アルゴリズム**: ts-fsrsを使用した最新の間隔反復アルゴリズム
- **モダンスタック**: Bun.js + Next.js + TypeScript
- **高速API**: Honoフレームワークによる高速RESTful API
- **美しいUI**: Tailwind CSS v4による洗練されたデザイン
- **TDD開発**: Vitestによるテスト駆動開発

## 🛠️ 技術スタック

- **ランタイム**: Bun.js
- **フレームワーク**: Next.js 16
- **言語**: TypeScript
- **API**: Hono
- **データベース**: Bun SQLite (組み込み)
- **ORM**: Drizzle ORM
- **スケジューラ**: ts-fsrs (FSRS algorithm)
- **スタイリング**: Tailwind CSS v4
- **テスト**: Vitest + Testing Library
- **インポート**: JSZip (APKG support)

## 📦 インストール

```bash
# 依存関係のインストール
bun install

# データベースマイグレーション
bun run scripts/migrate.ts

# 開発サーバーの起動
bun run dev
```

## 🚀 使い方

### 開発サーバーの起動

```bash
bun run dev
```

ブラウザで `http://localhost:3000` を開く

### ビルド

```bash
bun run build
```

### 本番環境での起動

```bash
bun run start
```

### テストの実行

```bash
# テストを実行
bun test

# テストUIを起動
bun run test:ui
```

## 📚 機能

### ✅ 実装済み機能

- [x] デッキ管理（作成、編集、削除）
- [x] ノート管理
- [x] カード学習（FSRS アルゴリズム）
- [x] APKGファイルのインポート
- [x] レビュー履歴の記録
- [x] 統計情報の表示
- [x] メディアファイルのサポート
- [x] レスポンシブデザイン
- [x] TDDによるテスト

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
├── src/
│   ├── app/              # Next.js アプリケーション
│   │   ├── api/         # API routes (Hono)
│   │   ├── decks/       # デッキページ
│   │   ├── study/       # 学習ページ
│   │   ├── browse/      # ノート参照ページ
│   │   ├── stats/       # 統計ページ
│   │   ├── import/      # インポートページ
│   │   └── settings/    # 設定ページ
│   ├── components/       # Reactコンポーネント
│   ├── lib/             # ユーティリティ
│   │   ├── scheduler.ts # FSRSスケジューラ
│   │   └── apkg-importer.ts # APKGインポーター
│   ├── db/              # データベース
│   │   ├── schema.ts    # Drizzle スキーマ
│   │   └── index.ts     # DB接続
│   └── __tests__/       # テスト
├── scripts/             # スクリプト
├── drizzle/            # マイグレーション
├── data/               # データベースファイル
└── public/             # 静的ファイル
```

## 🗄️ データベーススキーマ

- **decks**: デッキ情報
- **note_types**: ノートタイプ（カードテンプレート）
- **notes**: ノート（質問と回答）
- **cards**: カード（レビューアイテム）
- **review_logs**: レビュー履歴
- **media**: メディアファイル

## 🧪 テスト

TDD（テスト駆動開発）アプローチで開発されています。

```bash
# すべてのテストを実行
bun test

# ウォッチモード
bun test --watch

# カバレッジ
bun test --coverage
```

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
- `GET /api/cards/:id/options` - レビューオプションを取得
- `POST /api/cards/:id/review` - カードをレビュー

### 統計
- `GET /api/stats/deck/:id` - デッキの統計を取得

### インポート
- `POST /api/import/apkg` - APKGファイルをインポート

## 🎨 UI/UX

- Tailwind CSS v4による美しいデザイン
- レスポンシブデザイン（モバイル対応）
- ダークモード対応（予定）
- アクセシビリティ対応

## 🔧 設定

- 1日の新規カード数
- 1日の復習カード数
- FSRSパラメータの最適化

## 📝 ライセンス

MIT License

## 🤝 コントリビューション

プルリクエストを歓迎します！

## 📞 サポート

問題が発生した場合は、GitHubのIssuesで報告してください。

---

**Powered by FSRS Algorithm** 🚀
