import { describe, it, expect, beforeEach } from 'vitest';
import { db } from '../db';
import { voiceSettings } from '../db/schema';
import { eq } from 'drizzle-orm';

describe('Voice Settings Features', () => {
  const testUserId = 'test-user-' + Date.now();

  beforeEach(async () => {
    await db.delete(voiceSettings).where(eq(voiceSettings.userId, testUserId));
  });

  it('should create voice settings for user', async () => {
    const [settings] = await db.insert(voiceSettings).values({
      userId: testUserId,
      enabled: true,
      voice: 'ja-JP-Standard-A',
      speed: 1.0,
      pitch: 1.0,
      autoPlay: true,
      fieldToRead: 'Front',
    }).returning();

    expect(settings).toBeDefined();
    expect(settings.enabled).toBe(true);
    expect(settings.voice).toBe('ja-JP-Standard-A');
  });

  it('should update voice settings', async () => {
    const [settings] = await db.insert(voiceSettings).values({
      userId: testUserId,
      enabled: false,
      speed: 1.0,
      pitch: 1.0,
      autoPlay: false,
    }).returning();

    const [updated] = await db.update(voiceSettings)
      .set({
        enabled: true,
        speed: 1.5,
        autoPlay: true,
      })
      .where(eq(voiceSettings.id, settings.id))
      .returning();

    expect(updated.enabled).toBe(true);
    expect(updated.speed).toBe(1.5);
    expect(updated.autoPlay).toBe(true);
  });

  it('should get voice settings for user', async () => {
    await db.insert(voiceSettings).values({
      userId: testUserId,
      enabled: true,
      voice: 'ja-JP-Standard-B',
      speed: 1.2,
      pitch: 1.1,
      autoPlay: true,
    });

    const [settings] = await db.select()
      .from(voiceSettings)
      .where(eq(voiceSettings.userId, testUserId));

    expect(settings).toBeDefined();
    expect(settings.voice).toBe('ja-JP-Standard-B');
    expect(settings.speed).toBe(1.2);
  });
});
