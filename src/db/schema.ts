import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';

// デッキテーブル - Ankiのコレクション
export const decks = sqliteTable('decks', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  description: text('description'),
  created: integer('created', { mode: 'timestamp' }).notNull(),
  modified: integer('modified', { mode: 'timestamp' }).notNull(),
});

// ノートタイプ（カードテンプレート）
export const noteTypes = sqliteTable('note_types', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  fields: text('fields', { mode: 'json' }).notNull().$type<string[]>(),
  templates: text('templates', { mode: 'json' }).notNull().$type<Array<{
    name: string;
    front: string;
    back: string;
  }>>(),
  css: text('css').default(''),
  created: integer('created', { mode: 'timestamp' }).notNull(),
});

// ノート（質問と回答のペア）
export const notes = sqliteTable('notes', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  guid: text('guid').notNull().unique(),
  noteTypeId: integer('note_type_id').notNull().references(() => noteTypes.id),
  fields: text('fields', { mode: 'json' }).notNull().$type<string[]>(),
  tags: text('tags', { mode: 'json' }).notNull().$type<string[]>().default([]),
  created: integer('created', { mode: 'timestamp' }).notNull(),
  modified: integer('modified', { mode: 'timestamp' }).notNull(),
});

// カード（レビューアイテム）
export const cards = sqliteTable('cards', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  noteId: integer('note_id').notNull().references(() => notes.id),
  deckId: integer('deck_id').notNull().references(() => decks.id),
  templateIndex: integer('template_index').notNull(),
  
  // FSRS パラメータ
  state: integer('state').notNull().default(0), // 0=New, 1=Learning, 2=Review, 3=Relearning
  due: integer('due', { mode: 'timestamp' }).notNull(),
  stability: real('stability').notNull().default(0),
  difficulty: real('difficulty').notNull().default(0),
  elapsedDays: integer('elapsed_days').notNull().default(0),
  scheduledDays: integer('scheduled_days').notNull().default(0),
  reps: integer('reps').notNull().default(0),
  lapses: integer('lapses').notNull().default(0),
  lastReview: integer('last_review', { mode: 'timestamp' }),
  
  created: integer('created', { mode: 'timestamp' }).notNull(),
  modified: integer('modified', { mode: 'timestamp' }).notNull(),
});

// レビュー履歴
export const reviewLogs = sqliteTable('review_logs', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  cardId: integer('card_id').notNull().references(() => cards.id),
  rating: integer('rating').notNull(), // 1=Again, 2=Hard, 3=Good, 4=Easy
  state: integer('state').notNull(),
  due: integer('due', { mode: 'timestamp' }).notNull(),
  stability: real('stability').notNull(),
  difficulty: real('difficulty').notNull(),
  elapsedDays: integer('elapsed_days').notNull(),
  scheduledDays: integer('scheduled_days').notNull(),
  reviewTime: integer('review_time').notNull(), // ミリ秒
  reviewDate: integer('review_date', { mode: 'timestamp' }).notNull(),
});

// メディアファイル
export const media = sqliteTable('media', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  filename: text('filename').notNull().unique(),
  data: text('data').notNull(), // Base64エンコード
  created: integer('created', { mode: 'timestamp' }).notNull(),
});

export type Deck = typeof decks.$inferSelect;
export type NewDeck = typeof decks.$inferInsert;
export type NoteType = typeof noteTypes.$inferSelect;
export type NewNoteType = typeof noteTypes.$inferInsert;
export type Note = typeof notes.$inferSelect;
export type NewNote = typeof notes.$inferInsert;
export type Card = typeof cards.$inferSelect;
export type NewCard = typeof cards.$inferInsert;
export type ReviewLog = typeof reviewLogs.$inferSelect;
export type NewReviewLog = typeof reviewLogs.$inferInsert;
export type Media = typeof media.$inferSelect;
export type NewMedia = typeof media.$inferInsert;
