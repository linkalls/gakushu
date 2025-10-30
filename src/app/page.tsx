'use client';

import Link from 'next/link';
import { Header } from '@/components/Header';

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900 transition-colors">
      <Header title="Anki Alternative" subtitle="間隔反復学習システム" />

      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link 
            href="/decks" 
            className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md hover:shadow-lg transition-all"
          >
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-2">📚 デッキ</h2>
            <p className="text-gray-600 dark:text-gray-400">学習デッキを管理</p>
          </Link>

          <Link 
            href="/study" 
            className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md hover:shadow-lg transition-all"
          >
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-2">✏️ 学習</h2>
            <p className="text-gray-600 dark:text-gray-400">カードを学習</p>
          </Link>

          <Link 
            href="/browse" 
            className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md hover:shadow-lg transition-all"
          >
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-2">🔍 参照</h2>
            <p className="text-gray-600 dark:text-gray-400">ノートとカードを参照</p>
          </Link>

          <Link 
            href="/stats" 
            className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md hover:shadow-lg transition-all"
          >
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-2">📊 統計</h2>
            <p className="text-gray-600 dark:text-gray-400">学習統計を表示</p>
          </Link>

          <Link 
            href="/import" 
            className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md hover:shadow-lg transition-all"
          >
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-2">📥 インポート</h2>
            <p className="text-gray-600 dark:text-gray-400">APKGファイルをインポート</p>
          </Link>

          <Link 
            href="/settings" 
            className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md hover:shadow-lg transition-all"
          >
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-2">⚙️ 設定</h2>
            <p className="text-gray-600 dark:text-gray-400">アプリケーション設定</p>
          </Link>
        </div>
      </main>

      <footer className="bg-gray-800 dark:bg-gray-950 text-white py-4 mt-8 transition-colors">
        <div className="container mx-auto px-4 text-center">
          <p>&copy; 2024 Anki Alternative - FSRS Algorithm Powered</p>
        </div>
      </footer>
    </div>
  );
}
