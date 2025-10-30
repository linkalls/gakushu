# クイックスタートガイド - ユーザー認証

## 🚀 セットアップ

1. **データベースマイグレーション**
```bash
bun db:migrate
```

2. **開発サーバー起動**
```bash
bun dev
```

3. **ブラウザで開く**
- http://localhost:3000

## 👤 ユーザー管理

### 新規登録
1. `/signup` にアクセス
2. 名前、メールアドレス、パスワードを入力
3. 登録完了後、自動的にログインしてホームページへ

### ログイン
1. `/login` にアクセス
2. メールアドレスとパスワードを入力
3. ログイン完了後、ホームページへ

### ログアウト
- ホームページ上部の「ログアウト」ボタンをクリック

## 📝 コード例

### 1. 現在のユーザー情報を取得

```tsx
import { useAuth } from '@/contexts';

function MyComponent() {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) return <div>読み込み中...</div>;
  if (!isAuthenticated) return <div>ログインしてください</div>;

  return <div>ようこそ、{user.name}さん</div>;
}
```

### 2. ページ全体を保護

```tsx
import { ProtectedRoute } from '@/components/ProtectedRoute';

export default function MyPage() {
  return (
    <ProtectedRoute>
      <div>このページは認証ユーザーのみアクセス可能</div>
    </ProtectedRoute>
  );
}
```

### 3. ログイン・ログアウト

```tsx
import { useAuth } from '@/contexts';

function AuthButtons() {
  const { isAuthenticated, login, logout } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    try {
      await login(email, password);
      // ログイン成功
    } catch (error) {
      // エラーハンドリング
      console.error(error);
    }
  };

  if (isAuthenticated) {
    return <button onClick={logout}>ログアウト</button>;
  }

  return (
    <div>
      <input 
        type="email" 
        value={email} 
        onChange={(e) => setEmail(e.target.value)} 
      />
      <input 
        type="password" 
        value={password} 
        onChange={(e) => setPassword(e.target.value)} 
      />
      <button onClick={handleLogin}>ログイン</button>
    </div>
  );
}
```

### 4. 新規登録

```tsx
import { useAuth } from '@/contexts';

function RegisterForm() {
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleRegister = async () => {
    try {
      await register(email, password, name);
      // 登録成功
    } catch (error) {
      // エラーハンドリング
      console.error(error);
    }
  };

  return (
    <div>
      <input 
        type="text" 
        placeholder="名前"
        value={name} 
        onChange={(e) => setName(e.target.value)} 
      />
      <input 
        type="email" 
        placeholder="メール"
        value={email} 
        onChange={(e) => setEmail(e.target.value)} 
      />
      <input 
        type="password" 
        placeholder="パスワード"
        value={password} 
        onChange={(e) => setPassword(e.target.value)} 
      />
      <button onClick={handleRegister}>登録</button>
    </div>
  );
}
```

## 🔒 APIでユーザーIDを使用

サーバー側のAPIルートでは、自動的にユーザーIDが利用可能です：

```typescript
import { authMiddleware, getUserId } from '@/lib/auth-middleware';

app.get('/my-data', authMiddleware, async (c) => {
  const userId = getUserId(c);
  
  // userIdを使ってデータをフィルタリング
  const data = await db.select()
    .from(myTable)
    .where(eq(myTable.userId, userId));
  
  return c.json(data);
});
```

## 🧪 テスト

認証関連のテストを実行：

```bash
vitest run auth-context
```

すべてのテストを実行：

```bash
vitest run
```

## 📚 AuthContext API

### プロパティ

- `user: User | null` - 現在のユーザー情報
- `isAuthenticated: boolean` - 認証状態
- `isLoading: boolean` - ロード中フラグ

### メソッド

- `login(email: string, password: string): Promise<void>` - ログイン
- `register(email: string, password: string, name: string): Promise<void>` - 新規登録
- `logout(): Promise<void>` - ログアウト

### User型

```typescript
interface User {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image: string | null;
  createdAt: Date;
  updatedAt: Date;
}
```

## 🔐 セキュリティ

- パスワードは自動的にハッシュ化されます
- セッションはデータベースに安全に保存されます
- すべてのAPIルートは認証ミドルウェアで保護されています
- ユーザーは自分のデータのみアクセスできます

## ⚙️ 環境変数

`.env.local`:
```env
BETTER_AUTH_SECRET=your-secret-key-here
BETTER_AUTH_URL=http://localhost:3000
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**重要**: 本番環境では`BETTER_AUTH_SECRET`を強力なランダムな値に変更してください！

## 🐛 トラブルシューティング

### ログインできない
- メールアドレスとパスワードが正しいか確認
- データベースマイグレーションが実行されているか確認
- ブラウザのコンソールでエラーメッセージを確認

### セッションが保持されない
- ブラウザのCookieが有効になっているか確認
- `BETTER_AUTH_URL`と`NEXT_PUBLIC_APP_URL`が正しいか確認

### APIがUnauthorizedエラーを返す
- ログインしているか確認
- セッションが有効か確認（ブラウザの開発者ツールでCookieを確認）
