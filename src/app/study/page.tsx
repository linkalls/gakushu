'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

interface Card {
  id: number;
  noteId: number;
  deckId: number;
  templateIndex: number;
  state: number;
  due: Date;
}

interface Note {
  id: number;
  fields: string[];
}

interface ReviewOptions {
  again: { due: Date; interval: number };
  hard: { due: Date; interval: number };
  good: { due: Date; interval: number };
  easy: { due: Date; interval: number };
}

function StudyContent() {
  const searchParams = useSearchParams();
  const deckId = searchParams.get('deck');
  
  const [currentCard, setCurrentCard] = useState<Card | null>(null);
  const [currentNote, setCurrentNote] = useState<Note | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [reviewOptions, setReviewOptions] = useState<ReviewOptions | null>(null);
  const [startTime, setStartTime] = useState<number>(Date.now());
  const [dueCards, setDueCards] = useState<Card[]>([]);

  useEffect(() => {
    loadDueCards();
  }, [deckId]);

  const loadDueCards = async () => {
    const url = deckId ? `/api/cards/due?deckId=${deckId}` : '/api/cards/due';
    const response = await fetch(url);
    const cards = await response.json();
    setDueCards(cards);
    
    if (cards.length > 0) {
      loadCard(cards[0]);
    }
  };

  const loadCard = async (card: Card) => {
    setCurrentCard(card);
    setShowAnswer(false);
    setStartTime(Date.now());
    
    // ノートを読み込む
    const noteResponse = await fetch(`/api/notes/${card.noteId}`);
    const note = await noteResponse.json();
    setCurrentNote(note);
    
    // レビューオプションを読み込む
    const optionsResponse = await fetch(`/api/cards/${card.id}/options`);
    const options = await optionsResponse.json();
    setReviewOptions(options);
  };

  const submitReview = async (rating: number) => {
    if (!currentCard) return;
    
    const reviewTime = Date.now() - startTime;
    
    await fetch(`/api/cards/${currentCard.id}/review`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rating, reviewTime }),
    });
    
    // 次のカードを読み込む
    const remainingCards = dueCards.slice(1);
    setDueCards(remainingCards);
    
    if (remainingCards.length > 0) {
      loadCard(remainingCards[0]);
    } else {
      setCurrentCard(null);
      setCurrentNote(null);
    }
  };

  const formatInterval = (interval: number) => {
    if (interval < 1) return '今日';
    if (interval === 1) return '1日';
    if (interval < 30) return `${interval}日`;
    if (interval < 365) return `${Math.floor(interval / 30)}ヶ月`;
    return `${Math.floor(interval / 365)}年`;
  };

  if (!currentCard || !currentNote) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-blue-600 text-white shadow-md">
          <div className="container mx-auto px-4 py-6">
            <Link href="/decks" className="text-sm text-blue-100 hover:text-white">
              ← デッキに戻る
            </Link>
            <h1 className="text-3xl font-bold mt-2">学習</h1>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8">
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              🎉 お疲れさまでした！
            </h2>
            <p className="text-gray-600 mb-6">
              復習するカードはもうありません
            </p>
            <Link
              href="/decks"
              className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              デッキに戻る
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-blue-600 text-white shadow-md">
        <div className="container mx-auto px-4 py-6">
          <Link href="/decks" className="text-sm text-blue-100 hover:text-white">
            ← デッキに戻る
          </Link>
          <h1 className="text-3xl font-bold mt-2">学習</h1>
          <p className="text-blue-100 mt-2">残り: {dueCards.length}枚</p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-lg shadow-md p-8 mb-6">
            <div className="mb-8">
              <h2 className="text-sm text-gray-500 mb-2">質問</h2>
              <div 
                className="text-2xl text-gray-800"
                dangerouslySetInnerHTML={{ __html: currentNote.fields[0] }}
              />
            </div>

            {showAnswer && (
              <div className="border-t pt-8">
                <h2 className="text-sm text-gray-500 mb-2">回答</h2>
                <div 
                  className="text-xl text-gray-800"
                  dangerouslySetInnerHTML={{ __html: currentNote.fields[1] }}
                />
              </div>
            )}
          </div>

          {!showAnswer ? (
            <div className="flex justify-center">
              <button
                onClick={() => setShowAnswer(true)}
                className="bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                解答を表示
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-4">
              <button
                onClick={() => submitReview(1)}
                className="bg-red-500 text-white px-4 py-3 rounded-lg hover:bg-red-600 transition-colors"
              >
                <div className="font-semibold">もう一度</div>
                {reviewOptions && (
                  <div className="text-sm opacity-90">
                    {formatInterval(reviewOptions.again.interval)}
                  </div>
                )}
              </button>

              <button
                onClick={() => submitReview(2)}
                className="bg-orange-500 text-white px-4 py-3 rounded-lg hover:bg-orange-600 transition-colors"
              >
                <div className="font-semibold">難しい</div>
                {reviewOptions && (
                  <div className="text-sm opacity-90">
                    {formatInterval(reviewOptions.hard.interval)}
                  </div>
                )}
              </button>

              <button
                onClick={() => submitReview(3)}
                className="bg-green-500 text-white px-4 py-3 rounded-lg hover:bg-green-600 transition-colors"
              >
                <div className="font-semibold">普通</div>
                {reviewOptions && (
                  <div className="text-sm opacity-90">
                    {formatInterval(reviewOptions.good.interval)}
                  </div>
                )}
              </button>

              <button
                onClick={() => submitReview(4)}
                className="bg-blue-500 text-white px-4 py-3 rounded-lg hover:bg-blue-600 transition-colors"
              >
                <div className="font-semibold">簡単</div>
                {reviewOptions && (
                  <div className="text-sm opacity-90">
                    {formatInterval(reviewOptions.easy.interval)}
                  </div>
                )}
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default function StudyPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center"><div className="text-gray-600">読み込み中...</div></div>}>
      <StudyContent />
    </Suspense>
  );
}
