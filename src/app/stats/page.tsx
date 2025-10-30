'use client';

import Link from 'next/link';

export default function StatsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-blue-600 text-white shadow-md">
        <div className="container mx-auto px-4 py-6">
          <Link href="/" className="text-sm text-blue-100 hover:text-white">
            ← ホームに戻る
          </Link>
          <h1 className="text-3xl font-bold mt-2">統計</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            学習統計
          </h2>
          <p className="text-gray-600">
            統計機能は今後実装予定です。レビュー履歴、学習進捗、リテンション率などを表示します。
          </p>
        </div>
      </main>
    </div>
  );
}
