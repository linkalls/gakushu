import { Hono } from 'hono';
import { db } from '../db';
import { 
  decks, noteTypes, notes, cards, reviewLogs, media,
  sharedDecks, rankings, userStats, cloudBackups, 
  customTemplates, voiceSettings, syncQueue 
} from '../db/schema';
import { eq, and, lte, sql, desc, gte } from 'drizzle-orm';
import { CardScheduler } from '../lib/scheduler';
import { apkgImporter } from '../lib/apkg-importer';
import { authMiddleware, getUserId } from '../lib/auth-middleware';

const app = new Hono();
const scheduler = new CardScheduler();

// 認証が必要なルートにミドルウェアを適用
app.use('/*', authMiddleware);

// デッキAPI
app.get('/decks', async (c) => {
  const userId = getUserId(c);
  const allDecks = await db.select().from(decks).where(eq(decks.userId, userId));
  return c.json(allDecks);
});

app.post('/decks', async (c) => {
  const userId = getUserId(c);
  const body = await c.req.json();
  const [deck] = await db.insert(decks).values({
    userId,
    name: body.name,
    description: body.description || '',
    created: new Date(),
    modified: new Date(),
  }).returning();
  return c.json(deck);
});

app.get('/decks/:id', async (c) => {
  const userId = getUserId(c);
  const id = parseInt(c.req.param('id'));
  const deck = await db.select().from(decks)
    .where(and(eq(decks.id, id), eq(decks.userId, userId)))
    .limit(1);
  if (deck.length === 0) {
    return c.json({ error: 'デッキが見つかりません' }, 404);
  }
  return c.json(deck[0]);
});

app.put('/decks/:id', async (c) => {
  const userId = getUserId(c);
  const id = parseInt(c.req.param('id'));
  const body = await c.req.json();
  const [updated] = await db.update(decks)
    .set({
      name: body.name,
      description: body.description,
      modified: new Date(),
    })
    .where(and(eq(decks.id, id), eq(decks.userId, userId)))
    .returning();
  return c.json(updated);
});

app.delete('/decks/:id', async (c) => {
  const userId = getUserId(c);
  const id = parseInt(c.req.param('id'));
  await db.delete(decks).where(and(eq(decks.id, id), eq(decks.userId, userId)));
  return c.json({ success: true });
});

// ノートタイプAPI
app.get('/note-types', async (c) => {
  const allNoteTypes = await db.select().from(noteTypes);
  return c.json(allNoteTypes);
});

app.post('/note-types', async (c) => {
  const body = await c.req.json();
  const [noteType] = await db.insert(noteTypes).values({
    name: body.name,
    fields: body.fields,
    templates: body.templates,
    css: body.css || '',
    created: new Date(),
  }).returning();
  return c.json(noteType);
});

// ノートAPI
app.get('/notes', async (c) => {
  const userId = getUserId(c);
  const allNotes = await db.select().from(notes).where(eq(notes.userId, userId));
  return c.json(allNotes);
});

app.post('/notes', async (c) => {
  const userId = getUserId(c);
  const body = await c.req.json();
  const [note] = await db.insert(notes).values({
    userId,
    guid: crypto.randomUUID(),
    noteTypeId: body.noteTypeId,
    fields: body.fields,
    tags: body.tags || [],
    created: new Date(),
    modified: new Date(),
  }).returning();

  // ノートタイプのテンプレート数に応じてカードを作成
  const noteType = await db.select().from(noteTypes)
    .where(eq(noteTypes.id, body.noteTypeId))
    .limit(1);
  
  if (noteType[0]) {
    const templateCount = noteType[0].templates.length;
    for (let i = 0; i < templateCount; i++) {
      await db.insert(cards).values({
        noteId: note.id,
        deckId: body.deckId,
        templateIndex: i,
        state: 0, // New
        due: new Date(),
        stability: 0,
        difficulty: 0,
        elapsedDays: 0,
        scheduledDays: 0,
        reps: 0,
        lapses: 0,
        created: new Date(),
        modified: new Date(),
      });
    }
  }

  return c.json(note);
});

app.get('/notes/:id', async (c) => {
  const userId = getUserId(c);
  const id = parseInt(c.req.param('id'));
  const note = await db.select().from(notes)
    .where(and(eq(notes.id, id), eq(notes.userId, userId)))
    .limit(1);
  if (note.length === 0) {
    return c.json({ error: 'ノートが見つかりません' }, 404);
  }
  return c.json(note[0]);
});

app.put('/notes/:id', async (c) => {
  const userId = getUserId(c);
  const id = parseInt(c.req.param('id'));
  const body = await c.req.json();
  const [updated] = await db.update(notes)
    .set({
      fields: body.fields,
      tags: body.tags,
      modified: new Date(),
    })
    .where(and(eq(notes.id, id), eq(notes.userId, userId)))
    .returning();
  return c.json(updated);
});

app.delete('/notes/:id', async (c) => {
  const userId = getUserId(c);
  const id = parseInt(c.req.param('id'));
  // まず、関連するカードを削除
  const note = await db.select().from(notes)
    .where(and(eq(notes.id, id), eq(notes.userId, userId)))
    .limit(1);
  
  if (note.length === 0) {
    return c.json({ error: 'ノートが見つかりません' }, 404);
  }
  
  await db.delete(cards).where(eq(cards.noteId, id));
  await db.delete(notes).where(eq(notes.id, id));
  return c.json({ success: true });
});

// カードAPI
app.get('/cards/due', async (c) => {
  const userId = getUserId(c);
  const deckId = c.req.query('deckId');
  const now = new Date();
  
  let dueCards;
  
  if (deckId) {
    // デッキIDが指定された場合、ユーザーのデッキか確認
    const deck = await db.select().from(decks)
      .where(and(eq(decks.id, parseInt(deckId)), eq(decks.userId, userId)))
      .limit(1);
    
    if (deck.length === 0) {
      return c.json({ error: 'デッキが見つかりません' }, 404);
    }
    
    dueCards = await db.select().from(cards)
      .where(and(lte(cards.due, now), eq(cards.deckId, parseInt(deckId))));
  } else {
    // ユーザーの全デッキのカードを取得
    const userDecks = await db.select().from(decks).where(eq(decks.userId, userId));
    const deckIds = userDecks.map(d => d.id);
    
    if (deckIds.length === 0) {
      return c.json([]);
    }
    
    dueCards = await db.select().from(cards)
      .where(and(lte(cards.due, now), sql`${cards.deckId} IN ${deckIds}`));
  }
  
  return c.json(dueCards);
});

app.get('/cards/:id', async (c) => {
  const id = parseInt(c.req.param('id'));
  const card = await db.select().from(cards).where(eq(cards.id, id)).limit(1);
  if (card.length === 0) {
    return c.json({ error: 'カードが見つかりません' }, 404);
  }
  return c.json(card[0]);
});

app.get('/cards/:id/options', async (c) => {
  const id = parseInt(c.req.param('id'));
  const [card] = await db.select().from(cards).where(eq(cards.id, id)).limit(1);
  
  if (!card) {
    return c.json({ error: 'カードが見つかりません' }, 404);
  }
  
  const options = scheduler.getNextReviewOptions(card);
  return c.json(options);
});

app.post('/cards/:id/review', async (c) => {
  const id = parseInt(c.req.param('id'));
  const { rating, reviewTime } = await c.req.json();
  
  const [card] = await db.select().from(cards).where(eq(cards.id, id)).limit(1);
  
  if (!card) {
    return c.json({ error: 'カードが見つかりません' }, 404);
  }
  
  const result = scheduler.schedule(card, rating);
  
  // カードを更新
  const [updated] = await db.update(cards)
    .set({
      state: result.state,
      due: result.due,
      stability: result.stability,
      difficulty: result.difficulty,
      elapsedDays: result.elapsedDays,
      scheduledDays: result.scheduledDays,
      reps: result.reps,
      lapses: result.lapses,
      lastReview: new Date(),
      modified: new Date(),
    })
    .where(eq(cards.id, id))
    .returning();
  
  // レビューログを保存
  await db.insert(reviewLogs).values({
    cardId: id,
    rating,
    state: result.state,
    due: result.due,
    stability: result.stability,
    difficulty: result.difficulty,
    elapsedDays: result.elapsedDays,
    scheduledDays: result.scheduledDays,
    reviewTime: reviewTime || 0,
    reviewDate: new Date(),
  });
  
  return c.json(updated);
});

// 統計API
app.get('/stats/deck/:id', async (c) => {
  const deckId = parseInt(c.req.param('id'));
  const now = new Date();
  
  const total = await db.select({ count: sql<number>`count(*)` })
    .from(cards)
    .where(eq(cards.deckId, deckId));
  
  const due = await db.select({ count: sql<number>`count(*)` })
    .from(cards)
    .where(and(eq(cards.deckId, deckId), lte(cards.due, now)));
  
  const newCards = await db.select({ count: sql<number>`count(*)` })
    .from(cards)
    .where(and(eq(cards.deckId, deckId), eq(cards.state, 0)));
  
  return c.json({
    total: total[0]?.count || 0,
    due: due[0]?.count || 0,
    new: newCards[0]?.count || 0,
  });
});

// インポートAPI
app.post('/import/apkg', async (c) => {
  const formData = await c.req.formData();
  const file = formData.get('file');
  
  if (!file || !(file instanceof File)) {
    return c.json({ error: 'ファイルが見つかりません' }, 400);
  }
  
  const buffer = await file.arrayBuffer();
  const result = await apkgImporter.importApkg(Buffer.from(buffer));
  
  return c.json(result);
});

// メディアAPI
app.get('/media/:filename', async (c) => {
  const filename = c.req.param('filename');
  const [mediaFile] = await db.select().from(media)
    .where(eq(media.filename, filename))
    .limit(1);
  
  if (!mediaFile) {
    return c.json({ error: 'メディアが見つかりません' }, 404);
  }
  
  return c.json(mediaFile);
});

// 共有デッキAPI - Anki Web like
app.get('/shared-decks', async (c) => {
  const publicDecks = await db.select().from(sharedDecks)
    .where(eq(sharedDecks.isPublic, true))
    .orderBy(desc(sharedDecks.downloadCount))
    .limit(50);
  return c.json(publicDecks);
});

app.get('/shared-decks/:shareCode', async (c) => {
  const shareCode = c.req.param('shareCode');
  const [sharedDeck] = await db.select().from(sharedDecks)
    .where(eq(sharedDecks.shareCode, shareCode))
    .limit(1);
  
  if (!sharedDeck) {
    return c.json({ error: '共有デッキが見つかりません' }, 404);
  }
  
  return c.json(sharedDeck);
});

app.post('/shared-decks', async (c) => {
  const userId = getUserId(c);
  const body = await c.req.json();
  const shareCode = `DECK-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
  const [sharedDeck] = await db.insert(sharedDecks).values({
    deckId: body.deckId,
    userId,
    isPublic: body.isPublic || false,
    shareCode,
    title: body.title,
    description: body.description,
    created: new Date(),
    modified: new Date(),
  }).returning();
  
  return c.json(sharedDeck);
});

app.post('/shared-decks/:shareCode/download', async (c) => {
  const shareCode = c.req.param('shareCode');
  const [sharedDeck] = await db.select().from(sharedDecks)
    .where(eq(sharedDecks.shareCode, shareCode))
    .limit(1);
  
  if (!sharedDeck) {
    return c.json({ error: '共有デッキが見つかりません' }, 404);
  }
  
  // ダウンロード数を増やす
  await db.update(sharedDecks)
    .set({ downloadCount: sharedDeck.downloadCount + 1 })
    .where(eq(sharedDecks.id, sharedDeck.id));
  
  // デッキのデータを取得して返す
  const deck = await db.select().from(decks)
    .where(eq(decks.id, sharedDeck.deckId))
    .limit(1);
  
  return c.json({ sharedDeck, deck: deck[0] });
});

app.post('/shared-decks/:id/like', async (c) => {
  const id = parseInt(c.req.param('id'));
  const [sharedDeck] = await db.select().from(sharedDecks)
    .where(eq(sharedDecks.id, id))
    .limit(1);
  
  if (!sharedDeck) {
    return c.json({ error: '共有デッキが見つかりません' }, 404);
  }
  
  const [updated] = await db.update(sharedDecks)
    .set({ likeCount: sharedDeck.likeCount + 1 })
    .where(eq(sharedDecks.id, id))
    .returning();
  
  return c.json(updated);
});

// ランキングAPI
app.get('/rankings/global', async (c) => {
  const limit = parseInt(c.req.query('limit') || '100');
  const topRankings = await db.select().from(rankings)
    .orderBy(desc(rankings.totalReviews))
    .limit(limit);
  
  return c.json(topRankings);
});

app.get('/rankings/by-streak', async (c) => {
  const limit = parseInt(c.req.query('limit') || '100');
  const topRankings = await db.select().from(rankings)
    .orderBy(desc(rankings.currentStreak))
    .limit(limit);
  
  return c.json(topRankings);
});

app.get('/rankings/by-study-time', async (c) => {
  const limit = parseInt(c.req.query('limit') || '100');
  const topRankings = await db.select().from(rankings)
    .orderBy(desc(rankings.totalStudyTime))
    .limit(limit);
  
  return c.json(topRankings);
});

app.get('/rankings/user/:userId', async (c) => {
  const userId = c.req.param('userId');
  const [ranking] = await db.select().from(rankings)
    .where(eq(rankings.userId, userId))
    .limit(1);
  
  if (!ranking) {
    return c.json({ error: 'ランキングが見つかりません' }, 404);
  }
  
  return c.json(ranking);
});

app.post('/rankings/update', async (c) => {
  const userId = getUserId(c);
  const body = await c.req.json();
  
  // 既存のランキングを取得
  const [existing] = await db.select().from(rankings)
    .where(eq(rankings.userId, userId))
    .limit(1);
  
  if (existing) {
    // 更新
    const [updated] = await db.update(rankings)
      .set({
        totalReviews: existing.totalReviews + (body.reviewCount || 0),
        totalStudyTime: existing.totalStudyTime + (body.studyTime || 0),
        currentStreak: body.currentStreak || existing.currentStreak,
        longestStreak: Math.max(existing.longestStreak, body.currentStreak || 0),
        updated: new Date(),
      })
      .where(eq(rankings.userId, userId))
      .returning();
    
    return c.json(updated);
  } else {
    // 新規作成
    const [created] = await db.insert(rankings).values({
      userId,
      totalReviews: body.reviewCount || 0,
      totalStudyTime: body.studyTime || 0,
      currentStreak: body.currentStreak || 0,
      longestStreak: body.currentStreak || 0,
      updated: new Date(),
    }).returning();
    
    return c.json(created);
  }
});

// 学習統計API
app.get('/stats/daily', async (c) => {
  const userId = getUserId(c);
  const days = parseInt(c.req.query('days') || '30');
  const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  
  const stats = await db.select().from(userStats)
    .where(and(eq(userStats.userId, userId), gte(userStats.date, startDate)))
    .orderBy(desc(userStats.date));
  
  return c.json(stats);
});

app.post('/stats/daily', async (c) => {
  const userId = getUserId(c);
  const body = await c.req.json();
  
  const [stats] = await db.insert(userStats).values({
    userId,
    date: new Date(),
    reviewCount: body.reviewCount || 0,
    studyTime: body.studyTime || 0,
    newCardsLearned: body.newCardsLearned || 0,
    cardsReviewed: body.cardsReviewed || 0,
    streak: body.streak || 0,
  }).returning();
  
  return c.json(stats);
});

// クラウドバックアップAPI
app.get('/backups', async (c) => {
  const userId = getUserId(c);
  const backups = await db.select().from(cloudBackups)
    .where(eq(cloudBackups.userId, userId))
    .orderBy(desc(cloudBackups.created))
    .limit(10);
  
  return c.json(backups);
});

app.get('/backups/latest', async (c) => {
  const userId = getUserId(c);
  const deviceType = c.req.query('deviceType');
  
  let query = db.select().from(cloudBackups)
    .where(eq(cloudBackups.userId, userId));
  
  if (deviceType) {
    query = query.where(eq(cloudBackups.deviceType, deviceType));
  }
  
  const [backup] = await query.orderBy(desc(cloudBackups.created)).limit(1);
  
  if (!backup) {
    return c.json({ error: 'バックアップが見つかりません' }, 404);
  }
  
  return c.json(backup);
});

app.post('/backups', async (c) => {
  const userId = getUserId(c);
  const body = await c.req.json();
  
  const [backup] = await db.insert(cloudBackups).values({
    userId,
    backupData: JSON.stringify(body.data),
    deviceId: body.deviceId,
    deviceType: body.deviceType,
    version: body.version || 1,
    created: new Date(),
  }).returning();
  
  return c.json(backup);
});

app.post('/backups/restore/:id', async (c) => {
  const userId = getUserId(c);
  const id = parseInt(c.req.param('id'));
  
  const [backup] = await db.select().from(cloudBackups)
    .where(and(eq(cloudBackups.id, id), eq(cloudBackups.userId, userId)))
    .limit(1);
  
  if (!backup) {
    return c.json({ error: 'バックアップが見つかりません' }, 404);
  }
  
  return c.json({ backup, data: JSON.parse(backup.backupData) });
});

// オフライン同期API
app.get('/sync/queue', async (c) => {
  const userId = getUserId(c);
  const deviceId = c.req.query('deviceId');
  
  if (!deviceId) {
    return c.json({ error: 'deviceIdが必要です' }, 400);
  }
  
  const queue = await db.select().from(syncQueue)
    .where(and(
      eq(syncQueue.userId, userId),
      eq(syncQueue.deviceId, deviceId),
      eq(syncQueue.synced, false)
    ))
    .orderBy(syncQueue.created);
  
  return c.json(queue);
});

app.post('/sync/queue', async (c) => {
  const userId = getUserId(c);
  const body = await c.req.json();
  
  const [item] = await db.insert(syncQueue).values({
    userId,
    deviceId: body.deviceId,
    entityType: body.entityType,
    entityId: body.entityId,
    action: body.action,
    data: body.data,
    synced: false,
    created: new Date(),
  }).returning();
  
  return c.json(item);
});

app.post('/sync/mark-synced', async (c) => {
  const userId = getUserId(c);
  const body = await c.req.json();
  
  await db.update(syncQueue)
    .set({ synced: true })
    .where(and(
      eq(syncQueue.userId, userId),
      eq(syncQueue.id, body.id)
    ));
  
  return c.json({ success: true });
});

// カスタムテンプレートAPI
app.get('/templates', async (c) => {
  const userId = getUserId(c);
  const showPublic = c.req.query('public') === 'true';
  
  if (showPublic) {
    const templates = await db.select().from(customTemplates)
      .where(eq(customTemplates.isPublic, true))
      .orderBy(desc(customTemplates.downloadCount))
      .limit(50);
    return c.json(templates);
  } else {
    const templates = await db.select().from(customTemplates)
      .where(eq(customTemplates.userId, userId));
    return c.json(templates);
  }
});

app.get('/templates/:id', async (c) => {
  const id = parseInt(c.req.param('id'));
  const [template] = await db.select().from(customTemplates)
    .where(eq(customTemplates.id, id))
    .limit(1);
  
  if (!template) {
    return c.json({ error: 'テンプレートが見つかりません' }, 404);
  }
  
  return c.json(template);
});

app.post('/templates', async (c) => {
  const userId = getUserId(c);
  const body = await c.req.json();
  
  const [template] = await db.insert(customTemplates).values({
    userId,
    name: body.name,
    frontTemplate: body.frontTemplate,
    backTemplate: body.backTemplate,
    css: body.css,
    javascript: body.javascript,
    isPublic: body.isPublic || false,
    created: new Date(),
    modified: new Date(),
  }).returning();
  
  return c.json(template);
});

app.put('/templates/:id', async (c) => {
  const userId = getUserId(c);
  const id = parseInt(c.req.param('id'));
  const body = await c.req.json();
  
  const [updated] = await db.update(customTemplates)
    .set({
      name: body.name,
      frontTemplate: body.frontTemplate,
      backTemplate: body.backTemplate,
      css: body.css,
      javascript: body.javascript,
      isPublic: body.isPublic,
      modified: new Date(),
    })
    .where(and(eq(customTemplates.id, id), eq(customTemplates.userId, userId)))
    .returning();
  
  return c.json(updated);
});

app.delete('/templates/:id', async (c) => {
  const userId = getUserId(c);
  const id = parseInt(c.req.param('id'));
  
  await db.delete(customTemplates)
    .where(and(eq(customTemplates.id, id), eq(customTemplates.userId, userId)));
  
  return c.json({ success: true });
});

app.post('/templates/:id/download', async (c) => {
  const id = parseInt(c.req.param('id'));
  
  const [template] = await db.select().from(customTemplates)
    .where(eq(customTemplates.id, id))
    .limit(1);
  
  if (!template) {
    return c.json({ error: 'テンプレートが見つかりません' }, 404);
  }
  
  // ダウンロード数を増やす
  await db.update(customTemplates)
    .set({ downloadCount: template.downloadCount + 1 })
    .where(eq(customTemplates.id, id));
  
  return c.json(template);
});

// 音声設定API
app.get('/voice/settings', async (c) => {
  const userId = getUserId(c);
  const [settings] = await db.select().from(voiceSettings)
    .where(eq(voiceSettings.userId, userId))
    .limit(1);
  
  if (!settings) {
    // デフォルト設定を返す
    return c.json({
      enabled: false,
      speed: 1.0,
      pitch: 1.0,
      autoPlay: false,
    });
  }
  
  return c.json(settings);
});

app.post('/voice/settings', async (c) => {
  const userId = getUserId(c);
  const body = await c.req.json();
  
  const [existing] = await db.select().from(voiceSettings)
    .where(eq(voiceSettings.userId, userId))
    .limit(1);
  
  if (existing) {
    const [updated] = await db.update(voiceSettings)
      .set({
        enabled: body.enabled,
        voice: body.voice,
        speed: body.speed,
        pitch: body.pitch,
        autoPlay: body.autoPlay,
        fieldToRead: body.fieldToRead,
      })
      .where(eq(voiceSettings.userId, userId))
      .returning();
    
    return c.json(updated);
  } else {
    const [created] = await db.insert(voiceSettings).values({
      userId,
      enabled: body.enabled || false,
      voice: body.voice,
      speed: body.speed || 1.0,
      pitch: body.pitch || 1.0,
      autoPlay: body.autoPlay || false,
      fieldToRead: body.fieldToRead,
    }).returning();
    
    return c.json(created);
  }
});

export default app;
