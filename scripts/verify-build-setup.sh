#!/usr/bin/env bash

# React Native Build Verification Script
# このスクリプトはビルド環境が正しく設定されているか確認します

set -e

echo "🔍 React Native ビルド環境チェック"
echo "=================================="
echo ""

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

check_command() {
    if command -v "$1" &> /dev/null; then
        echo -e "${GREEN}✓${NC} $1 が見つかりました: $(command -v $1)"
        if [ -n "$2" ]; then
            echo "  バージョン: $($1 $2 2>&1 | head -1)"
        fi
        return 0
    else
        echo -e "${RED}✗${NC} $1 が見つかりません"
        return 1
    fi
}

check_file() {
    if [ -f "$1" ]; then
        echo -e "${GREEN}✓${NC} $1 が存在します"
        return 0
    else
        echo -e "${RED}✗${NC} $1 が見つかりません"
        return 1
    fi
}

check_dir() {
    if [ -d "$1" ]; then
        echo -e "${GREEN}✓${NC} $1 ディレクトリが存在します"
        return 0
    else
        echo -e "${YELLOW}!${NC} $1 ディレクトリが見つかりません"
        return 1
    fi
}

errors=0

echo "📋 基本ツールのチェック"
echo "----------------------"
check_command "node" "--version" || ((errors++))
check_command "bun" "--version" || ((errors++))
check_command "java" "-version" || ((errors++))
check_command "eas" "--version" || ((errors++))
echo ""

echo "📁 プロジェクト構造のチェック"
echo "----------------------------"
check_file "package.json" || ((errors++))
check_file "mobile/package.json" || ((errors++))
check_file "mobile/app.json" || ((errors++))
check_file "mobile/eas.json" || ((errors++))
check_file "mobile/tailwind.config.js" || ((errors++))
check_file "mobile/metro.config.js" || ((errors++))
check_file "mobile/global.css" || ((errors++))
check_file "mobile/vitest.config.ts" || ((errors++))
echo ""

echo "📦 生成されたファイルのチェック"
echo "------------------------------"
check_dir "node_modules" || echo "  → 'bun install' を実行してください"
check_dir "mobile/node_modules" || echo "  → 'cd mobile && bun install' を実行してください"
check_dir "mobile/android" || echo "  → 'bun run prebuild:mobile' を実行してください"
echo ""

echo "🧪 テストのチェック"
echo "------------------"
if check_file "mobile/src/__tests__/config.test.ts"; then
    echo "  → テストを実行: bun run test:mobile"
fi
echo ""

echo "📚 ドキュメントのチェック"
echo "------------------------"
check_file "BUILD_GUIDE.md" || ((errors++))
check_file "QUICKSTART_BUILD.md" || ((errors++))
check_file "mobile/README.md" || ((errors++))
echo ""

echo "=================================="
if [ $errors -eq 0 ]; then
    echo -e "${GREEN}✓ すべてのチェックに合格しました！${NC}"
    echo ""
    echo "次のステップ:"
    echo "1. テストを実行: bun run test:mobile"
    echo "2. ビルドを実行: bun run build:mobile:preview"
    echo ""
    echo "詳細は QUICKSTART_BUILD.md を参照してください。"
else
    echo -e "${RED}✗ $errors 個の問題が見つかりました${NC}"
    echo ""
    echo "修正方法:"
    echo "1. 依存関係をインストール: bun install"
    echo "2. Androidプロジェクトを生成: bun run prebuild:mobile"
    echo ""
    echo "詳細は BUILD_GUIDE.md を参照してください。"
    exit 1
fi
