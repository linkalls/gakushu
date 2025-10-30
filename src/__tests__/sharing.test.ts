import { describe, it, expect, beforeEach } from 'vitest';
import { db } from '../db';
import { sharedDecks, decks, users } from '../db/schema';
import { eq } from 'drizzle-orm';

describe('Sharing Features', () => {
  const testUserId = 'test-user-' + Date.now();

  beforeEach(async () => {
    // テストデータのクリーンアップ
    await db.delete(sharedDecks).where(eq(sharedDecks.userId, testUserId));
  });

  it('should create a shared deck with unique share code', async () => {
    const shareCode = `SHARE-${Date.now()}`;
    
    const [sharedDeck] = await db.insert(sharedDecks).values({
      deckId: 1,
      userId: testUserId,
      isPublic: true,
      shareCode,
      title: 'Test Shared Deck',
      description: 'Test description',
      created: new Date(),
      modified: new Date(),
    }).returning();

    expect(sharedDeck).toBeDefined();
    expect(sharedDeck.shareCode).toBe(shareCode);
    expect(sharedDeck.isPublic).toBe(true);
  });

  it('should increment download count when deck is downloaded', async () => {
    const shareCode = `SHARE-${Date.now()}`;
    
    const [sharedDeck] = await db.insert(sharedDecks).values({
      deckId: 1,
      userId: testUserId,
      isPublic: true,
      shareCode,
      title: 'Test Shared Deck',
      description: 'Test description',
      created: new Date(),
      modified: new Date(),
    }).returning();

    // ダウンロード数を増やす
    const [updated] = await db.update(sharedDecks)
      .set({ downloadCount: sharedDeck.downloadCount + 1 })
      .where(eq(sharedDecks.id, sharedDeck.id))
      .returning();

    expect(updated.downloadCount).toBe(1);
  });

  it('should find shared deck by share code', async () => {
    const shareCode = `SHARE-${Date.now()}`;
    
    await db.insert(sharedDecks).values({
      deckId: 1,
      userId: testUserId,
      isPublic: true,
      shareCode,
      title: 'Test Shared Deck',
      created: new Date(),
      modified: new Date(),
    });

    const [found] = await db.select()
      .from(sharedDecks)
      .where(eq(sharedDecks.shareCode, shareCode));

    expect(found).toBeDefined();
    expect(found.shareCode).toBe(shareCode);
  });
});
