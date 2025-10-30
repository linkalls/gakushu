'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function ImportPage() {
  const [importing, setImporting] = useState(false);
  const [message, setMessage] = useState('');

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImporting(true);
    setMessage('');

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/import/apkg', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();
      
      if (result.success) {
        setMessage('✅ ' + result.message);
      } else {
        setMessage('❌ ' + result.message);
      }
    } catch (error) {
      setMessage('❌ インポート中にエラーが発生しました');
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-blue-600 text-white shadow-md">
        <div className="container mx-auto px-4 py-6">
          <Link href="/" className="text-sm text-blue-100 hover:text-white">
            ← ホームに戻る
          </Link>
          <h1 className="text-3xl font-bold mt-2">インポート</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              APKGファイルをインポート
            </h2>
            <p className="text-gray-600 mb-6">
              Ankiの.apkgファイルをアップロードして、デッキをインポートできます。
            </p>

            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <input
                type="file"
                accept=".apkg"
                onChange={handleFileUpload}
                disabled={importing}
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className={`cursor-pointer inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors ${
                  importing ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {importing ? 'インポート中...' : 'ファイルを選択'}
              </label>
              <p className="text-gray-500 mt-4 text-sm">
                .apkg形式のファイルのみサポートしています
              </p>
            </div>

            {message && (
              <div className={`mt-6 p-4 rounded-lg ${
                message.startsWith('✅') 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {message}
              </div>
            )}

            <div className="mt-8 pt-8 border-t">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                インポートについて
              </h3>
              <ul className="text-gray-600 space-y-2">
                <li>• Anki形式の.apkgファイルを完全サポート</li>
                <li>• デッキ、ノート、カード、メディアファイルをインポート</li>
                <li>• 既存のデータは保持されます</li>
                <li>• FSRSアルゴリズムで学習スケジュールを最適化</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
