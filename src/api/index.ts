import { Hono } from 'hono';
import { db } from '../db';
import { decks, noteTypes, notes, cards, reviewLogs, media } from '../db/schema';
import { eq, and, lte, sql } from 'drizzle-orm';
import { CardScheduler } from '../lib/scheduler';
import { apkgImporter } from '../lib/apkg-importer';

const app = new Hono();
const scheduler = new CardScheduler();

// デッキAPI
app.get('/decks', async (c) => {
  const allDecks = await db.select().from(decks);
  return c.json(allDecks);
});

app.post('/decks', async (c) => {
  const body = await c.req.json();
  const [deck] = await db.insert(decks).values({
    name: body.name,
    description: body.description || '',
    created: new Date(),
    modified: new Date(),
  }).returning();
  return c.json(deck);
});

app.get('/decks/:id', async (c) => {
  const id = parseInt(c.req.param('id'));
  const deck = await db.select().from(decks).where(eq(decks.id, id)).limit(1);
  if (deck.length === 0) {
    return c.json({ error: 'デッキが見つかりません' }, 404);
  }
  return c.json(deck[0]);
});

app.put('/decks/:id', async (c) => {
  const id = parseInt(c.req.param('id'));
  const body = await c.req.json();
  const [updated] = await db.update(decks)
    .set({
      name: body.name,
      description: body.description,
      modified: new Date(),
    })
    .where(eq(decks.id, id))
    .returning();
  return c.json(updated);
});

app.delete('/decks/:id', async (c) => {
  const id = parseInt(c.req.param('id'));
  await db.delete(decks).where(eq(decks.id, id));
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
  const allNotes = await db.select().from(notes);
  return c.json(allNotes);
});

app.post('/notes', async (c) => {
  const body = await c.req.json();
  const [note] = await db.insert(notes).values({
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
  const id = parseInt(c.req.param('id'));
  const note = await db.select().from(notes).where(eq(notes.id, id)).limit(1);
  if (note.length === 0) {
    return c.json({ error: 'ノートが見つかりません' }, 404);
  }
  return c.json(note[0]);
});

app.put('/notes/:id', async (c) => {
  const id = parseInt(c.req.param('id'));
  const body = await c.req.json();
  const [updated] = await db.update(notes)
    .set({
      fields: body.fields,
      tags: body.tags,
      modified: new Date(),
    })
    .where(eq(notes.id, id))
    .returning();
  return c.json(updated);
});

app.delete('/notes/:id', async (c) => {
  const id = parseInt(c.req.param('id'));
  await db.delete(cards).where(eq(cards.noteId, id));
  await db.delete(notes).where(eq(notes.id, id));
  return c.json({ success: true });
});

// カードAPI
app.get('/cards/due', async (c) => {
  const deckId = c.req.query('deckId');
  const now = new Date();
  
  let dueCards;
  
  if (deckId) {
    dueCards = await db.select().from(cards)
      .where(and(lte(cards.due, now), eq(cards.deckId, parseInt(deckId))));
  } else {
    dueCards = await db.select().from(cards).where(lte(cards.due, now));
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

export default app;
