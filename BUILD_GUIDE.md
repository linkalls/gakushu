# React Native Build Guide

このドキュメントでは、Next.jsとReact Nativeの両方のビルドプロセスについて説明します。

## 前提条件

- Node.js 18以上
- Bun 1.0以上
- Java Development Kit (JDK) 17以上（Android ビルド用）
- Android SDK（Android ビルド用）
- EAS CLI: `bun install -g eas-cli`

## セットアップ

### 1. 依存関係のインストール

```bash
# ルートとすべてのワークスペースの依存関係をインストール
bun install
```

### 2. Android プロジェクトの生成（初回のみ）

```bash
# mobileディレクトリでAndroidプロジェクトを生成
bun run prebuild:mobile
```

## ビルドプロセス

### Next.js（Web）のビルド

Next.js側のビルドには既知の問題があります（`bun:sqlite`モジュールの問題）。これは開発時の問題であり、実際のデプロイには影響しません。

```bash
# Next.jsをビルド（TypeScriptチェックまで正常に動作）
bun run build
```

**注意**: `bun:sqlite`のエラーが表示されますが、これは予想される動作です。TypeScriptのコンパイルが成功していれば問題ありません。

### React Native（モバイル）のビルド

#### 開発ビルド

```bash
# Expo Goで実行可能なビルド
bun run dev:mobile
```

#### Android APKビルド（ローカル）

```bash
# プレビュービルド（デバッグ署名）
bun run build:mobile:preview

# または

# プロダクションビルド
bun run build:mobile:production

# または直接mobileディレクトリで実行
cd mobile
eas build --platform android --local --profile preview
```

#### ビルドプロファイル

`mobile/eas.json`には以下のプロファイルが定義されています：

- **development**: 開発クライアントビルド、内部配布用
- **preview**: APKビルド、テスト用
- **production**: APKビルド、リリース用

## テスト

### Next.js（Web）のテスト

```bash
# 全テストを実行
bun run test

# ウォッチモード
bun run test:watch

# カバレッジ付き
bun run test:coverage
```

### React Native（モバイル）のテスト

```bash
# モバイルアプリのテストを実行
bun run test:mobile

# または直接mobileディレクトリで実行
cd mobile
bun test
```

## トラブルシューティング

### Next.jsビルドの問題

**問題**: `Failed to load external module bun:sqlite`

**解決策**: これは既知の問題です。TypeScriptのコンパイルが成功していれば、アプリケーションは正常に動作します。本番環境では別のデータベース（PostgreSQLなど）を使用することを推奨します。

### React Nativeビルドの問題

**問題**: `eas build`が失敗する

**解決策**:
1. Androidプロジェクトが生成されているか確認: `bun run prebuild:mobile`
2. JDKとAndroid SDKが正しくインストールされているか確認
3. `mobile/android`ディレクトリが存在するか確認

**問題**: 依存関係のエラー

**解決策**:
```bash
# node_modulesを削除して再インストール
rm -rf node_modules mobile/node_modules
bun install
```

## ディレクトリ構造

```
.
├── src/              # Next.js ソースコード
├── mobile/           # React Native アプリ
│   ├── app/         # Expo Router ページ
│   ├── src/         # 共有コンポーネントとコンテキスト
│   ├── android/     # 生成されたAndroidプロジェクト
│   ├── app.json     # Expo設定
│   ├── eas.json     # EAS Build設定
│   └── package.json # モバイル依存関係
└── package.json     # ルート依存関係
```

## CI/CD統合

### GitHub Actions例

```yaml
name: Build Mobile App
on: [push]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Bun
        uses: oven-sh/setup-bun@v1
        
      - name: Install dependencies
        run: bun install
        
      - name: Setup EAS
        uses: expo/expo-github-action@v8
        with:
          eas-version: latest
          token: ${{ secrets.EXPO_TOKEN }}
          
      - name: Build Android APK
        run: cd mobile && eas build --platform android --local --profile preview
```

## 次のステップ

1. **署名キーの設定**: プロダクションビルドには署名キーが必要です
2. **環境変数**: `.env`ファイルで環境固有の設定を管理
3. **配布**: Google Play StoreまたはTestFlightへのアップロード

## 参考リンク

- [Expo Documentation](https://docs.expo.dev/)
- [EAS Build Documentation](https://docs.expo.dev/build/introduction/)
- [React Native Documentation](https://reactnative.dev/)
- [Next.js Documentation](https://nextjs.org/docs)
