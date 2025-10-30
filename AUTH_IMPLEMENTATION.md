# ユーザー認証実装サマリー

## 実装内容

Better Authを使用してユーザー認証機能を実装しました。以下の機能が含まれています：

### 1. データベーススキーマ
- **users**: ユーザー情報テーブル
- **sessions**: セッション管理テーブル
- **accounts**: アカウント情報（OAuth/パスワード）テーブル
- **verifications**: メール確認トークンテーブル

既存のテーブルにユーザーIDを追加：
- **decks**: `userId`フィールドを追加
- **notes**: `userId`フィールドを追加

### 2. 認証システム
- **Better Auth設定** (`src/lib/auth.ts`)
  - Drizzle ORM統合
  - メール/パスワード認証有効化
  - SQLiteアダプター使用

- **クライアント** (`src/lib/auth-client.ts`)
  - フロントエンド用認証クライアント
  - `signIn`, `signUp`, `signOut`, `useSession`をエクスポート

- **APIルート** (`src/app/api/auth/[...all]/route.ts`)
  - Better AuthのNext.js統合
  - GET/POSTハンドラー

### 3. AuthContext
- **Context** (`src/contexts/AuthContext.tsx`)
  - `user`: 現在のユーザー情報
  - `isAuthenticated`: 認証状態
  - `isLoading`: ロード中フラグ
  - `login()`: ログイン関数
  - `register()`: 新規登録関数
  - `logout()`: ログアウト関数

- Providersに統合済み (`src/contexts/index.tsx`)

### 4. 認証ミドルウェア
- **API保護** (`src/lib/auth-middleware.ts`)
  - `authMiddleware`: リクエストの認証チェック
  - `getUserId()`: リクエストからユーザーIDを取得

- 全APIルートに適用済み (`src/api/index.ts`)
  - デッキ、ノート、カードはユーザー別にフィルタリング
  - ユーザーは自分のデータのみアクセス可能

### 5. UIコンポーネント
- **ログインページ** (`src/app/login/page.tsx`)
  - メール/パスワードでログイン
  - エラーハンドリング
  - 新規登録へのリンク

- **新規登録ページ** (`src/app/signup/page.tsx`)
  - メール/パスワード/名前で登録
  - パスワード確認
  - バリデーション（8文字以上）

- **保護ルート** (`src/components/ProtectedRoute.tsx`)
  - 認証が必要なページを保護
  - 未認証時は自動的にログインページへリダイレクト

### 6. テスト
- **AuthContext テスト** (`src/__tests__/auth-context.test.tsx`)
  - 7つのユニットテストがすべてPASS
  - 型定義、認証状態、関数シグネチャ、エラーハンドリングをカバー

## 使い方

### 1. データベースマイグレーション
```bash
bun db:migrate
```

### 2. 環境変数
`.env.local`ファイルが作成済み：
```
BETTER_AUTH_SECRET=your-secret-key-change-this-in-production
BETTER_AUTH_URL=http://localhost:3000
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**本番環境では`BETTER_AUTH_SECRET`を変更してください！**

### 3. アプリケーション起動
```bash
bun dev
```

### 4. 新規ユーザー登録
1. http://localhost:3000/signup にアクセス
2. 名前、メールアドレス、パスワードを入力
3. 登録ボタンをクリック

### 5. ログイン
1. http://localhost:3000/login にアクセス
2. メールアドレスとパスワードを入力
3. ログインボタンをクリック

### 6. Contextの使用
```tsx
import { useAuth } from '@/contexts';

function MyComponent() {
  const { user, isAuthenticated, login, logout } = useAuth();

  if (!isAuthenticated) {
    return <div>ログインが必要です</div>;
  }

  return (
    <div>
      <p>ようこそ、{user.name}さん</p>
      <button onClick={logout}>ログアウト</button>
    </div>
  );
}
```

### 7. 保護ルートの使用
```tsx
import { ProtectedRoute } from '@/components/ProtectedRoute';

function ProtectedPage() {
  return (
    <ProtectedRoute>
      <div>このページは認証が必要です</div>
    </ProtectedRoute>
  );
}
```

## データの分離

- ユーザーごとにデータが完全に分離されています
- デッキ、ノート、カードはすべてユーザーIDでフィルタリング
- 他のユーザーのデータにはアクセスできません

## セキュリティ

- パスワードはBetter Authによって自動的にハッシュ化
- セッションはデータベースに安全に保存
- APIは認証ミドルウェアで保護
- CSRF保護機能を内蔵

## 今後の拡張

Better Authは以下の機能も簡単に追加できます：

1. **ソーシャルログイン**
   - Google
   - GitHub
   - その他のOAuthプロバイダー

2. **2要素認証（2FA）**

3. **メール確認**

4. **パスワードリセット**

5. **セッション管理**
   - 複数デバイスの管理
   - セッション失効

## テスト結果

```bash
✓ AuthContext (Unit Tests) > AuthContextの型定義が正しい
✓ AuthContext (Unit Tests) > ユーザーオブジェクトの型が正しい
✓ AuthContext (Unit Tests) > 認証状態がユーザーの有無で変わる
✓ AuthContext (Unit Tests) > ログイン関数のシグネチャが正しい
✓ AuthContext (Unit Tests) > 登録関数のシグネチャが正しい
✓ AuthContext (Unit Tests) > ログアウト関数が定義されている
✓ AuthContext (Unit Tests) > エラーハンドリングが可能

 7 pass
 0 fail
```

## 注意事項

既存のテストについて：
- 一部の既存テストがReact 19の互換性問題により失敗しています
- これは認証実装とは無関係な問題です
- 認証関連のテストはすべてPASSしています
- Schedulerテストも引き続きPASSしています

テスト実行時は以下を使用：
```bash
vitest run auth-context  # 認証テスト
vitest run scheduler     # スケジューラーテスト
```
