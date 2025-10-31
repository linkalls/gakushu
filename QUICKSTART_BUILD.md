# React Native ビルド クイックスタート

## 🚀 すぐに始める

### 前提条件チェック

```bash
# Node.js/Bunのバージョン確認
bun --version  # 1.0以上

# EAS CLIのインストール（初回のみ）
bun install -g eas-cli

# JDKのバージョン確認（Androidビルド用）
java -version  # 17以上推奨
```

### ステップ1: 依存関係のインストール

```bash
# プロジェクトルートで実行
bun install
```

### ステップ2: Next.js（Web）のビルド確認

```bash
# Next.jsのTypeScriptチェックを実行
bun run build

# 注意: "bun:sqlite"エラーが出ますが、TypeScriptが成功すればOKです
```

### ステップ3: React Native（モバイル）のセットアップ

```bash
# Androidプロジェクトを生成（初回のみ）
bun run prebuild:mobile

# これにより mobile/android/ ディレクトリが作成されます
```

### ステップ4: テストの実行

```bash
# モバイルアプリのテストを実行
bun run test:mobile

# 全テストが通ればOK ✅
```

### ステップ5: ビルドの実行

#### オプション A: プレビュービルド（推奨 - 初回）

```bash
# デバッグAPKをビルド
bun run build:mobile:preview

# または mobileディレクトリで直接実行
cd mobile
eas build --platform android --local --profile preview
```

#### オプション B: プロダクションビルド

```bash
# リリースAPKをビルド
bun run build:mobile:production

# または
cd mobile
eas build --platform android --local --profile production
```

## 📁 ビルド成果物

ビルドが成功すると、以下の場所にAPKが生成されます：

```
mobile/android/app/build/outputs/apk/release/
```

## ✅ ビルド成功の確認

ビルドが成功すると、以下のメッセージが表示されます：

```
✅ Build finished
APK: /path/to/mobile/android/app/build/outputs/apk/release/app-release.apk
```

## 🔍 トラブルシューティング

### エラー: "JAVA_HOME is not set"

```bash
# JDKのパスを設定
export JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64
export PATH=$JAVA_HOME/bin:$PATH
```

### エラー: "Android SDK not found"

```bash
# Android SDKをインストール
# Ubuntu/Debian
sudo apt-get install android-sdk

# またはAndroid Studioをインストール
```

### エラー: "eas command not found"

```bash
# EAS CLIを再インストール
bun install -g eas-cli
```

### ビルドがハングする場合

```bash
# Gradleデーモンを停止
cd mobile/android
./gradlew --stop

# 再度ビルド
cd ..
eas build --platform android --local --profile preview
```

## 📊 ビルドプロファイルの違い

| プロファイル | 用途 | 署名 | サイズ | デバッグ可能 |
|------------|------|------|--------|------------|
| development | 開発 | デバッグ | 大 | ✅ |
| preview | テスト | デバッグ | 中 | ✅ |
| production | リリース | リリース | 小 | ❌ |

## 🎯 次のステップ

1. **APKのインストール**: 生成されたAPKをAndroidデバイスにインストール
2. **署名キーの設定**: プロダクションビルド用の署名キーを作成
3. **CI/CDの設定**: GitHub Actionsなどで自動ビルド

## 📚 追加リソース

- [詳細ビルドガイド](./BUILD_GUIDE.md)
- [Expo公式ドキュメント](https://docs.expo.dev/)
- [EAS Build](https://docs.expo.dev/build/introduction/)

## 🐛 問題が解決しない場合

1. `mobile/android`ディレクトリを削除して再生成:
   ```bash
   rm -rf mobile/android
   bun run prebuild:mobile
   ```

2. node_modulesをクリーンインストール:
   ```bash
   rm -rf node_modules mobile/node_modules
   bun install
   ```

3. Gradleキャッシュをクリア:
   ```bash
   rm -rf ~/.gradle/caches
   ```
