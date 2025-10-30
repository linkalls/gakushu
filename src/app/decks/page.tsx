'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Deck {
  id: number;
  name: string;
  description: string | null;
  created: Date;
  modified: Date;
}

interface DeckStats {
  total: number;
  due: number;
  new: number;
}

export default function DecksPage() {
  const [decks, setDecks] = useState<Deck[]>([]);
  const [stats, setStats] = useState<Map<number, DeckStats>>(new Map());
  const [showNewDeck, setShowNewDeck] = useState(false);
  const [newDeckName, setNewDeckName] = useState('');
  const [newDeckDesc, setNewDeckDesc] = useState('');

  useEffect(() => {
    loadDecks();
  }, []);

  const loadDecks = async () => {
    const response = await fetch('/api/decks');
    const data = await response.json();
    setDecks(data);
    
    // 各デッキの統計を読み込む
    const statsMap = new Map<number, DeckStats>();
    for (const deck of data) {
      const statsResponse = await fetch(`/api/stats/deck/${deck.id}`);
      const statsData = await statsResponse.json();
      statsMap.set(deck.id, statsData);
    }
    setStats(statsMap);
  };

  const createDeck = async (e: React.FormEvent) => {
    e.preventDefault();
    
    await fetch('/api/decks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: newDeckName,
        description: newDeckDesc,
      }),
    });
    
    setNewDeckName('');
    setNewDeckDesc('');
    setShowNewDeck(false);
    loadDecks();
  };

  const deleteDeck = async (id: number) => {
    if (!confirm('本当にこのデッキを削除しますか？')) return;
    
    await fetch(`/api/decks/${id}`, {
      method: 'DELETE',
    });
    
    loadDecks();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-blue-600 text-white shadow-md">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <Link href="/" className="text-sm text-blue-100 hover:text-white">
                ← ホームに戻る
              </Link>
              <h1 className="text-3xl font-bold mt-2">デッキ</h1>
            </div>
            <button
              onClick={() => setShowNewDeck(true)}
              className="bg-white text-blue-600 px-4 py-2 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
            >
              + 新規デッキ
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {showNewDeck && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h2 className="text-2xl font-bold mb-4">新規デッキ作成</h2>
              <form onSubmit={createDeck}>
                <div className="mb-4">
                  <label className="block text-gray-700 font-semibold mb-2">
                    デッキ名
                  </label>
                  <input
                    type="text"
                    value={newDeckName}
                    onChange={(e) => setNewDeckName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 font-semibold mb-2">
                    説明
                  </label>
                  <textarea
                    value={newDeckDesc}
                    onChange={(e) => setNewDeckDesc(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    作成
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowNewDeck(false)}
                    className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors"
                  >
                    キャンセル
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {decks.map((deck) => {
            const deckStats = stats.get(deck.id);
            return (
              <div key={deck.id} className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-2">
                  {deck.name}
                </h2>
                {deck.description && (
                  <p className="text-gray-600 mb-4">{deck.description}</p>
                )}
                
                {deckStats && (
                  <div className="mb-4 text-sm text-gray-600">
                    <div className="flex justify-between">
                      <span>総カード数:</span>
                      <span className="font-semibold">{deckStats.total}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>復習待ち:</span>
                      <span className="font-semibold text-red-600">{deckStats.due}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>新規:</span>
                      <span className="font-semibold text-blue-600">{deckStats.new}</span>
                    </div>
                  </div>
                )}

                <div className="flex gap-2">
                  <Link
                    href={`/study?deck=${deck.id}`}
                    className="flex-1 bg-blue-600 text-white text-center px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    学習
                  </Link>
                  <button
                    onClick={() => deleteDeck(deck.id)}
                    className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
                  >
                    削除
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {decks.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg mb-4">
              デッキがまだありません
            </p>
            <button
              onClick={() => setShowNewDeck(true)}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              最初のデッキを作成
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
