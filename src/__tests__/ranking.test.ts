import { describe, it, expect, beforeEach } from 'vitest';
import { db } from '../db';
import { rankings, userStats } from '../db/schema';
import { eq, desc } from 'drizzle-orm';

describe('Ranking Features', () => {
  const testUserId = 'test-user-' + Date.now();

  beforeEach(async () => {
    await db.delete(rankings).where(eq(rankings.userId, testUserId));
    await db.delete(userStats).where(eq(userStats.userId, testUserId));
  });

  it('should create user ranking record', async () => {
    const [ranking] = await db.insert(rankings).values({
      userId: testUserId,
      totalReviews: 100,
      totalStudyTime: 3600,
      currentStreak: 7,
      longestStreak: 10,
      updated: new Date(),
    }).returning();

    expect(ranking).toBeDefined();
    expect(ranking.totalReviews).toBe(100);
    expect(ranking.currentStreak).toBe(7);
  });

  it('should record daily study statistics', async () => {
    const today = new Date();
    
    const [stats] = await db.insert(userStats).values({
      userId: testUserId,
      date: today,
      reviewCount: 50,
      studyTime: 1800,
      newCardsLearned: 10,
      cardsReviewed: 40,
      streak: 5,
    }).returning();

    expect(stats).toBeDefined();
    expect(stats.reviewCount).toBe(50);
    expect(stats.studyTime).toBe(1800);
  });

  it('should get top rankings sorted by total reviews', async () => {
    // テストデータを作成
    const users = ['user1', 'user2', 'user3'];
    
    for (let i = 0; i < users.length; i++) {
      await db.insert(rankings).values({
        userId: users[i],
        totalReviews: (i + 1) * 100,
        totalStudyTime: (i + 1) * 3600,
        currentStreak: i + 1,
        longestStreak: i + 2,
        rank: null,
        updated: new Date(),
      });
    }

    const topRankings = await db.select()
      .from(rankings)
      .orderBy(desc(rankings.totalReviews))
      .limit(10);

    expect(topRankings.length).toBeGreaterThan(0);
    expect(topRankings[0].totalReviews).toBeGreaterThanOrEqual(topRankings[topRankings.length - 1].totalReviews);
  });

  it('should update streak when studying consecutive days', async () => {
    const [ranking] = await db.insert(rankings).values({
      userId: testUserId,
      totalReviews: 100,
      totalStudyTime: 3600,
      currentStreak: 7,
      longestStreak: 10,
      updated: new Date(),
    }).returning();

    // 連続日数を更新
    const [updated] = await db.update(rankings)
      .set({
        currentStreak: ranking.currentStreak + 1,
        longestStreak: Math.max(ranking.longestStreak, ranking.currentStreak + 1),
      })
      .where(eq(rankings.id, ranking.id))
      .returning();

    expect(updated.currentStreak).toBe(8);
    expect(updated.longestStreak).toBe(10);
  });
});
