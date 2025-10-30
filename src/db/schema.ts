import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';

// ユーザーテーブル
export const users = sqliteTable('user', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: integer('emailVerified', { mode: 'boolean' }).notNull().default(false),
  image: text('image'),
  createdAt: integer('createdAt', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updatedAt', { mode: 'timestamp' }).notNull(),
});

// セッションテーブル
export const sessions = sqliteTable('session', {
  id: text('id').primaryKey(),
  expiresAt: integer('expiresAt', { mode: 'timestamp' }).notNull(),
  token: text('token').notNull().unique(),
  createdAt: integer('createdAt', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updatedAt', { mode: 'timestamp' }).notNull(),
  ipAddress: text('ipAddress'),
  userAgent: text('userAgent'),
  userId: text('userId').notNull().references(() => users.id),
});

// アカウントテーブル
export const accounts = sqliteTable('account', {
  id: text('id').primaryKey(),
  accountId: text('accountId').notNull(),
  providerId: text('providerId').notNull(),
  userId: text('userId').notNull().references(() => users.id),
  accessToken: text('accessToken'),
  refreshToken: text('refreshToken'),
  idToken: text('idToken'),
  accessTokenExpiresAt: integer('accessTokenExpiresAt', { mode: 'timestamp' }),
  refreshTokenExpiresAt: integer('refreshTokenExpiresAt', { mode: 'timestamp' }),
  scope: text('scope'),
  password: text('password'),
  createdAt: integer('createdAt', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updatedAt', { mode: 'timestamp' }).notNull(),
});

// 確認トークンテーブル
export const verifications = sqliteTable('verification', {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: integer('expiresAt', { mode: 'timestamp' }).notNull(),
  createdAt: integer('createdAt', { mode: 'timestamp' }),
  updatedAt: integer('updatedAt', { mode: 'timestamp' }),
});

// デッキテーブル - Ankiのコレクション
export const decks = sqliteTable('decks', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: text('user_id').notNull().references(() => users.id),
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
  userId: text('user_id').notNull().references(() => users.id),
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
// 共有デッキテーブル - Anki Web like sharing
export const sharedDecks = sqliteTable('shared_decks', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  deckId: integer('deck_id').notNull().references(() => decks.id),
  userId: text('user_id').notNull().references(() => users.id),
  isPublic: integer('is_public', { mode: 'boolean' }).notNull().default(false),
  shareCode: text('share_code').notNull().unique(),
  title: text('title').notNull(),
  description: text('description'),
  downloadCount: integer('download_count').notNull().default(0),
  likeCount: integer('like_count').notNull().default(0),
  created: integer('created', { mode: 'timestamp' }).notNull(),
  modified: integer('modified', { mode: 'timestamp' }).notNull(),
});

// 学習履歴統計テーブル - ランキング用
export const userStats = sqliteTable('user_stats', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: text('user_id').notNull().references(() => users.id),
  date: integer('date', { mode: 'timestamp' }).notNull(),
  reviewCount: integer('review_count').notNull().default(0),
  studyTime: integer('study_time').notNull().default(0), // 秒単位
  newCardsLearned: integer('new_cards_learned').notNull().default(0),
  cardsReviewed: integer('cards_reviewed').notNull().default(0),
  streak: integer('streak').notNull().default(0), // 連続学習日数
});

// ランキングテーブル
export const rankings = sqliteTable('rankings', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: text('user_id').notNull().references(() => users.id),
  totalReviews: integer('total_reviews').notNull().default(0),
  totalStudyTime: integer('total_study_time').notNull().default(0),
  currentStreak: integer('current_streak').notNull().default(0),
  longestStreak: integer('longest_streak').notNull().default(0),
  rank: integer('rank'),
  updated: integer('updated', { mode: 'timestamp' }).notNull(),
});

// クラウドバックアップテーブル
export const cloudBackups = sqliteTable('cloud_backups', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: text('user_id').notNull().references(() => users.id),
  backupData: text('backup_data').notNull(), // JSON圧縮データ
  deviceId: text('device_id').notNull(),
  deviceType: text('device_type').notNull(), // 'web' | 'mobile' | 'ios' | 'android'
  version: integer('version').notNull(),
  created: integer('created', { mode: 'timestamp' }).notNull(),
});

// カスタムテンプレートテーブル
export const customTemplates = sqliteTable('custom_templates', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: text('user_id').notNull().references(() => users.id),
  name: text('name').notNull(),
  frontTemplate: text('front_template').notNull(),
  backTemplate: text('back_template').notNull(),
  css: text('css'),
  javascript: text('javascript'),
  isPublic: integer('is_public', { mode: 'boolean' }).notNull().default(false),
  downloadCount: integer('download_count').notNull().default(0),
  created: integer('created', { mode: 'timestamp' }).notNull(),
  modified: integer('modified', { mode: 'timestamp' }).notNull(),
});

// 音声設定テーブル
export const voiceSettings = sqliteTable('voice_settings', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: text('user_id').notNull().references(() => users.id),
  enabled: integer('enabled', { mode: 'boolean' }).notNull().default(false),
  voice: text('voice'), // 音声ID
  speed: real('speed').notNull().default(1.0),
  pitch: real('pitch').notNull().default(1.0),
  autoPlay: integer('auto_play', { mode: 'boolean' }).notNull().default(false),
  fieldToRead: text('field_to_read'), // どのフィールドを読み上げるか
});

// オフライン同期キュー
export const syncQueue = sqliteTable('sync_queue', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: text('user_id').notNull().references(() => users.id),
  deviceId: text('device_id').notNull(),
  entityType: text('entity_type').notNull(), // 'card' | 'deck' | 'note' | 'review'
  entityId: integer('entity_id').notNull(),
  action: text('action').notNull(), // 'create' | 'update' | 'delete'
  data: text('data', { mode: 'json' }),
  synced: integer('synced', { mode: 'boolean' }).notNull().default(false),
  created: integer('created', { mode: 'timestamp' }).notNull(),
});

export type SharedDeck = typeof sharedDecks.$inferSelect;
export type NewSharedDeck = typeof sharedDecks.$inferInsert;
export type UserStats = typeof userStats.$inferSelect;
export type NewUserStats = typeof userStats.$inferInsert;
export type Ranking = typeof rankings.$inferSelect;
export type NewRanking = typeof rankings.$inferInsert;
export type CloudBackup = typeof cloudBackups.$inferSelect;
export type NewCloudBackup = typeof cloudBackups.$inferInsert;
export type CustomTemplate = typeof customTemplates.$inferSelect;
export type NewCustomTemplate = typeof customTemplates.$inferInsert;
export type VoiceSettings = typeof voiceSettings.$inferSelect;
export type NewVoiceSettings = typeof voiceSettings.$inferInsert;
export type SyncQueue = typeof syncQueue.$inferSelect;
export type NewSyncQueue = typeof syncQueue.$inferInsert;
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Session = typeof sessions.$inferSelect;
export type NewSession = typeof sessions.$inferInsert;
export type Account = typeof accounts.$inferSelect;
export type NewAccount = typeof accounts.$inferInsert;
export type Verification = typeof verifications.$inferSelect;
export type NewVerification = typeof verifications.$inferInsert;
