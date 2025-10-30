import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-blue-600 text-white shadow-md">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold">Anki Alternative</h1>
          <p className="text-blue-100 mt-2">間隔反復学習システム</p>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link 
            href="/decks" 
            className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow"
          >
            <h2 className="text-xl font-semibold text-gray-800 mb-2">📚 デッキ</h2>
            <p className="text-gray-600">学習デッキを管理</p>
          </Link>

          <Link 
            href="/study" 
            className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow"
          >
            <h2 className="text-xl font-semibold text-gray-800 mb-2">✏️ 学習</h2>
            <p className="text-gray-600">カードを学習</p>
          </Link>

          <Link 
            href="/browse" 
            className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow"
          >
            <h2 className="text-xl font-semibold text-gray-800 mb-2">🔍 参照</h2>
            <p className="text-gray-600">ノートとカードを参照</p>
          </Link>

          <Link 
            href="/stats" 
            className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow"
          >
            <h2 className="text-xl font-semibold text-gray-800 mb-2">📊 統計</h2>
            <p className="text-gray-600">学習統計を表示</p>
          </Link>

          <Link 
            href="/import" 
            className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow"
          >
            <h2 className="text-xl font-semibold text-gray-800 mb-2">📥 インポート</h2>
            <p className="text-gray-600">APKGファイルをインポート</p>
          </Link>

          <Link 
            href="/settings" 
            className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow"
          >
            <h2 className="text-xl font-semibold text-gray-800 mb-2">⚙️ 設定</h2>
            <p className="text-gray-600">アプリケーション設定</p>
          </Link>
        </div>
      </main>

      <footer className="bg-gray-800 text-white py-4 mt-8">
        <div className="container mx-auto px-4 text-center">
          <p>&copy; 2024 Anki Alternative - FSRS Algorithm Powered</p>
        </div>
      </footer>
    </div>
  );
}
