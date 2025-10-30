import { describe, it, expect } from 'vitest';
import { CardScheduler } from '../lib/scheduler';
import type { Card } from '../db/schema';

describe('CardScheduler', () => {
  it('新しいカードを正しくスケジュールする', () => {
    const scheduler = new CardScheduler();
    const card: Partial<Card> = {
      state: 0,
      stability: 0,
      difficulty: 0,
      elapsedDays: 0,
      scheduledDays: 0,
      reps: 0,
      lapses: 0,
    };

    const result = scheduler.schedule(card as Card, 3); // Good
    
    expect(result.state).toBeGreaterThanOrEqual(0);
    expect(result.stability).toBeGreaterThan(0);
    expect(result.due).toBeInstanceOf(Date);
  });

  it('レビュー評価に応じて難易度を調整する', () => {
    const scheduler = new CardScheduler();
    const card: Partial<Card> = {
      state: 2, // Review
      stability: 10,
      difficulty: 5,
      elapsedDays: 5,
      scheduledDays: 5,
      reps: 5,
      lapses: 0,
    };

    const resultHard = scheduler.schedule(card as Card, 2);
    const resultGood = scheduler.schedule(card as Card, 3);
    const resultEasy = scheduler.schedule(card as Card, 4);

    expect(resultHard.difficulty).toBeGreaterThanOrEqual((card.difficulty || 0));
    expect(resultEasy.difficulty).toBeLessThanOrEqual((card.difficulty || 0));
  });

  it('次のレビュー候補日を取得する', () => {
    const scheduler = new CardScheduler();
    const card: Partial<Card> = {
      state: 2,
      stability: 10,
      difficulty: 5,
      elapsedDays: 5,
      scheduledDays: 5,
      reps: 5,
      lapses: 0,
    };

    const options = scheduler.getNextReviewOptions(card as Card);
    
    expect(options).toHaveProperty('again');
    expect(options).toHaveProperty('hard');
    expect(options).toHaveProperty('good');
    expect(options).toHaveProperty('easy');
  });
});
