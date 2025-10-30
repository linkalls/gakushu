'use client';

import Link from 'next/link';

export default function SettingsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-blue-600 text-white shadow-md">
        <div className="container mx-auto px-4 py-6">
          <Link href="/" className="text-sm text-blue-100 hover:text-white">
            ← ホームに戻る
          </Link>
          <h1 className="text-3xl font-bold mt-2">設定</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            アプリケーション設定
          </h2>

          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                学習設定
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-700 mb-2">
                    1日の新規カード数
                  </label>
                  <input
                    type="number"
                    defaultValue={20}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 mb-2">
                    1日の復習カード数
                  </label>
                  <input
                    type="number"
                    defaultValue={200}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            <div className="pt-6 border-t">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                FSRSパラメータ
              </h3>
              <p className="text-gray-600 text-sm mb-4">
                FSRS（Free Spaced Repetition Scheduler）アルゴリズムを使用しています。
                学習データが蓄積されると、パラメータが最適化されます。
              </p>
            </div>

            <div className="pt-6 border-t">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                データ管理
              </h3>
              <div className="space-y-2">
                <button className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                  データをエクスポート
                </button>
                <button className="w-full bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors">
                  すべてのデータを削除
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
