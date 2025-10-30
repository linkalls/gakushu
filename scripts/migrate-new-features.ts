import { Database } from 'bun:sqlite';
import path from 'path';

/**
 * 新機能用のデータベーステーブルを作成するマイグレーション
 */
async function migrateNewFeatures() {
  console.log('🚀 新機能テーブルのマイグレーションを開始します...');

  const dbPath = path.join(process.cwd(), 'data', 'anki.db');
  const db = new Database(dbPath);

  try {
    // 共有デッキテーブル
    db.run(`
      CREATE TABLE IF NOT EXISTS shared_decks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        deck_id INTEGER NOT NULL REFERENCES decks(id),
        user_id TEXT NOT NULL REFERENCES user(id),
        is_public INTEGER NOT NULL DEFAULT 0,
        share_code TEXT NOT NULL UNIQUE,
        title TEXT NOT NULL,
        description TEXT,
        download_count INTEGER NOT NULL DEFAULT 0,
        like_count INTEGER NOT NULL DEFAULT 0,
        created INTEGER NOT NULL,
        modified INTEGER NOT NULL
      )
    `);
    console.log('✅ shared_decks テーブル作成完了');

    // ユーザー統計テーブル
    db.run(`
      CREATE TABLE IF NOT EXISTS user_stats (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT NOT NULL REFERENCES user(id),
        date INTEGER NOT NULL,
        review_count INTEGER NOT NULL DEFAULT 0,
        study_time INTEGER NOT NULL DEFAULT 0,
        new_cards_learned INTEGER NOT NULL DEFAULT 0,
        cards_reviewed INTEGER NOT NULL DEFAULT 0,
        streak INTEGER NOT NULL DEFAULT 0
      )
    `);
    console.log('✅ user_stats テーブル作成完了');

    // ランキングテーブル
    db.run(`
      CREATE TABLE IF NOT EXISTS rankings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT NOT NULL REFERENCES user(id),
        total_reviews INTEGER NOT NULL DEFAULT 0,
        total_study_time INTEGER NOT NULL DEFAULT 0,
        current_streak INTEGER NOT NULL DEFAULT 0,
        longest_streak INTEGER NOT NULL DEFAULT 0,
        rank INTEGER,
        updated INTEGER NOT NULL
      )
    `);
    console.log('✅ rankings テーブル作成完了');

    // クラウドバックアップテーブル
    db.run(`
      CREATE TABLE IF NOT EXISTS cloud_backups (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT NOT NULL REFERENCES user(id),
        backup_data TEXT NOT NULL,
        device_id TEXT NOT NULL,
        device_type TEXT NOT NULL,
        version INTEGER NOT NULL,
        created INTEGER NOT NULL
      )
    `);
    console.log('✅ cloud_backups テーブル作成完了');

    // カスタムテンプレートテーブル
    db.run(`
      CREATE TABLE IF NOT EXISTS custom_templates (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT NOT NULL REFERENCES user(id),
        name TEXT NOT NULL,
        front_template TEXT NOT NULL,
        back_template TEXT NOT NULL,
        css TEXT,
        javascript TEXT,
        is_public INTEGER NOT NULL DEFAULT 0,
        download_count INTEGER NOT NULL DEFAULT 0,
        created INTEGER NOT NULL,
        modified INTEGER NOT NULL
      )
    `);
    console.log('✅ custom_templates テーブル作成完了');

    // 音声設定テーブル
    db.run(`
      CREATE TABLE IF NOT EXISTS voice_settings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT NOT NULL REFERENCES user(id),
        enabled INTEGER NOT NULL DEFAULT 0,
        voice TEXT,
        speed REAL NOT NULL DEFAULT 1.0,
        pitch REAL NOT NULL DEFAULT 1.0,
        auto_play INTEGER NOT NULL DEFAULT 0,
        field_to_read TEXT
      )
    `);
    console.log('✅ voice_settings テーブル作成完了');

    // 同期キューテーブル
    db.run(`
      CREATE TABLE IF NOT EXISTS sync_queue (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT NOT NULL REFERENCES user(id),
        device_id TEXT NOT NULL,
        entity_type TEXT NOT NULL,
        entity_id INTEGER NOT NULL,
        action TEXT NOT NULL,
        data TEXT,
        synced INTEGER NOT NULL DEFAULT 0,
        created INTEGER NOT NULL
      )
    `);
    console.log('✅ sync_queue テーブル作成完了');

    // インデックスを作成
    db.run('CREATE INDEX IF NOT EXISTS idx_shared_decks_share_code ON shared_decks(share_code)');
    db.run('CREATE INDEX IF NOT EXISTS idx_shared_decks_public ON shared_decks(is_public)');
    db.run('CREATE INDEX IF NOT EXISTS idx_user_stats_user_date ON user_stats(user_id, date)');
    db.run('CREATE INDEX IF NOT EXISTS idx_rankings_user ON rankings(user_id)');
    db.run('CREATE INDEX IF NOT EXISTS idx_rankings_total_reviews ON rankings(total_reviews DESC)');
    db.run('CREATE INDEX IF NOT EXISTS idx_rankings_streak ON rankings(current_streak DESC)');
    db.run('CREATE INDEX IF NOT EXISTS idx_cloud_backups_user ON cloud_backups(user_id, created DESC)');
    db.run('CREATE INDEX IF NOT EXISTS idx_sync_queue_device ON sync_queue(device_id, synced)');
    db.run('CREATE INDEX IF NOT EXISTS idx_custom_templates_public ON custom_templates(is_public)');
    console.log('✅ インデックス作成完了');

    console.log('🎉 すべてのマイグレーションが完了しました！');
  } catch (error) {
    console.error('❌ マイグレーションエラー:', error);
    throw error;
  } finally {
    db.close();
  }
}

// スクリプトとして実行
if (import.meta.main) {
  migrateNewFeatures()
    .then(() => {
      console.log('✨ マイグレーション成功');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 マイグレーション失敗:', error);
      process.exit(1);
    });
}

export { migrateNewFeatures };
