import { describe, it, expect, beforeEach } from 'vitest';
import { db } from '../db';
import { syncQueue, cloudBackups } from '../db/schema';
import { eq, and } from 'drizzle-orm';

describe('Offline Sync Features', () => {
  const testUserId = 'test-user-' + Date.now();
  const testDeviceId = 'device-' + Date.now();

  beforeEach(async () => {
    await db.delete(syncQueue).where(eq(syncQueue.userId, testUserId));
    await db.delete(cloudBackups).where(eq(cloudBackups.userId, testUserId));
  });

  it('should add item to sync queue', async () => {
    const [queueItem] = await db.insert(syncQueue).values({
      userId: testUserId,
      deviceId: testDeviceId,
      entityType: 'card',
      entityId: 1,
      action: 'update',
      data: { rating: 3 },
      synced: false,
      created: new Date(),
    }).returning();

    expect(queueItem).toBeDefined();
    expect(queueItem.synced).toBe(false);
    expect(queueItem.action).toBe('update');
  });

  it('should mark sync queue item as synced', async () => {
    const [queueItem] = await db.insert(syncQueue).values({
      userId: testUserId,
      deviceId: testDeviceId,
      entityType: 'card',
      entityId: 1,
      action: 'update',
      data: { rating: 3 },
      synced: false,
      created: new Date(),
    }).returning();

    const [updated] = await db.update(syncQueue)
      .set({ synced: true })
      .where(eq(syncQueue.id, queueItem.id))
      .returning();

    expect(updated.synced).toBe(true);
  });

  it('should get unsynced items for a device', async () => {
    // 未同期アイテムを追加
    await db.insert(syncQueue).values([
      {
        userId: testUserId,
        deviceId: testDeviceId,
        entityType: 'card',
        entityId: 1,
        action: 'update',
        synced: false,
        created: new Date(),
      },
      {
        userId: testUserId,
        deviceId: testDeviceId,
        entityType: 'deck',
        entityId: 2,
        action: 'create',
        synced: false,
        created: new Date(),
      },
    ]);

    const unsynced = await db.select()
      .from(syncQueue)
      .where(and(
        eq(syncQueue.deviceId, testDeviceId),
        eq(syncQueue.synced, false)
      ));

    expect(unsynced.length).toBe(2);
  });

  it('should create cloud backup', async () => {
    const backupData = JSON.stringify({
      decks: [],
      cards: [],
      notes: [],
    });

    const [backup] = await db.insert(cloudBackups).values({
      userId: testUserId,
      backupData,
      deviceId: testDeviceId,
      deviceType: 'mobile',
      version: 1,
      created: new Date(),
    }).returning();

    expect(backup).toBeDefined();
    expect(backup.deviceType).toBe('mobile');
    expect(backup.version).toBe(1);
  });

  it('should get latest backup for user', async () => {
    // 複数のバックアップを作成
    await db.insert(cloudBackups).values([
      {
        userId: testUserId,
        backupData: JSON.stringify({ version: 1 }),
        deviceId: testDeviceId,
        deviceType: 'web',
        version: 1,
        created: new Date(Date.now() - 1000),
      },
      {
        userId: testUserId,
        backupData: JSON.stringify({ version: 2 }),
        deviceId: testDeviceId,
        deviceType: 'mobile',
        version: 2,
        created: new Date(),
      },
    ]);

    const backups = await db.select()
      .from(cloudBackups)
      .where(eq(cloudBackups.userId, testUserId))
      .orderBy(desc => cloudBackups.created);

    expect(backups[0].version).toBe(2);
  });
});
