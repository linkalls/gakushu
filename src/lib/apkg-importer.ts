import JSZip from 'jszip';
import { db } from '../db';
import { decks, noteTypes, notes, cards, media } from '../db/schema';
import Database from 'better-sqlite3';

export interface AnkiPackage {
  decks: any[];
  notes: any[];
  cards: any[];
  models: any[];
  media: Map<string, Uint8Array>;
}

export class ApkgImporter {
  /**
   * APKGファイルをインポート
   */
  async importApkg(file: File | Buffer): Promise<{ success: boolean; message: string }> {
    try {
      const zip = new JSZip();
      const contents = await zip.loadAsync(file);

      // collection.anki2データベースを読み込む
      const collectionFile = contents.file('collection.anki2');
      if (!collectionFile) {
        throw new Error('collection.anki2が見つかりません');
      }

      const collectionData = await collectionFile.async('nodebuffer');
      const ankiDb = new Database(':memory:');
      
      // データをメモリDBにロード
      const stmt = ankiDb.prepare('PRAGMA page_size');
      // 実際のインポート処理は簡略化

      // メディアファイルを読み込む
      const mediaMap = await this.loadMedia(contents);

      // データをインポート
      await this.importCollection(ankiDb, mediaMap);

      ankiDb.close();

      return { success: true, message: 'インポートが完了しました' };
    } catch (error) {
      console.error('インポートエラー:', error);
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'インポートに失敗しました' 
      };
    }
  }

  /**
   * メディアファイルを読み込む
   */
  private async loadMedia(zip: JSZip): Promise<Map<string, string>> {
    const mediaMap = new Map<string, string>();
    
    const mediaFile = zip.file('media');
    if (!mediaFile) return mediaMap;

    const mediaJson = await mediaFile.async('text');
    const mediaIndex = JSON.parse(mediaJson);

    for (const [key, filename] of Object.entries(mediaIndex)) {
      const file = zip.file(key);
      if (file) {
        const data = await file.async('base64');
        mediaMap.set(filename as string, data);
      }
    }

    return mediaMap;
  }

  /**
   * Ankiコレクションからデータをインポート
   */
  private async importCollection(ankiDb: Database.Database, mediaMap: Map<string, string>) {
    // ノートタイプ（モデル）をインポート
    const modelsResult = ankiDb.prepare('SELECT models FROM col').get() as { models: string } | undefined;
    if (!modelsResult) return;
    
    const modelsData = JSON.parse(modelsResult.models);
    
    const modelIdMap = new Map<number, number>();
    
    for (const [ankiModelId, model] of Object.entries(modelsData)) {
      const modelData = model as any;
      const fields = modelData.flds.map((f: any) => f.name);
      const templates = modelData.tmpls.map((t: any) => ({
        name: t.name,
        front: t.qfmt,
        back: t.afmt,
      }));

      const [result] = await db.insert(noteTypes).values({
        name: modelData.name,
        fields,
        templates,
        css: modelData.css || '',
        created: new Date(),
      }).returning();

      modelIdMap.set(parseInt(ankiModelId), result.id);
    }

    // デッキをインポート
    const decksResult = ankiDb.prepare('SELECT decks FROM col').get() as { decks: string } | undefined;
    if (!decksResult) return;
    
    const decksJson = JSON.parse(decksResult.decks);
    
    const deckIdMap = new Map<number, number>();
    
    for (const [ankiDeckId, deck] of Object.entries(decksJson)) {
      const deckData = deck as any;
      const [result] = await db.insert(decks).values({
        name: deckData.name,
        description: deckData.desc || '',
        created: new Date(deckData.id),
        modified: new Date(deckData.mod * 1000),
      }).returning();

      deckIdMap.set(parseInt(ankiDeckId), result.id);
    }

    // ノートをインポート
    const notesData = ankiDb.prepare('SELECT * FROM notes').all() as any[];
    const noteIdMap = new Map<number, number>();

    for (const note of notesData) {
      const fields = note.flds.split('\x1f');
      const tags = note.tags.trim().split(/\s+/).filter((t: string) => t);

      const [result] = await db.insert(notes).values({
        guid: note.guid,
        noteTypeId: modelIdMap.get(note.mid) || 1,
        fields,
        tags,
        created: new Date(note.id),
        modified: new Date(note.mod * 1000),
      }).returning();

      noteIdMap.set(note.id, result.id);
    }

    // カードをインポート
    const cardsData = ankiDb.prepare('SELECT * FROM cards').all() as any[];

    for (const card of cardsData) {
      await db.insert(cards).values({
        noteId: noteIdMap.get(card.nid) || 0,
        deckId: deckIdMap.get(card.did) || 1,
        templateIndex: card.ord,
        state: card.type,
        due: new Date(card.due * 1000),
        stability: 0,
        difficulty: 0,
        elapsedDays: 0,
        scheduledDays: 0,
        reps: card.reps || 0,
        lapses: card.lapses || 0,
        lastReview: card.lastReview ? new Date(card.lastReview * 1000) : null,
        created: new Date(),
        modified: new Date(),
      });
    }

    // メディアをインポート
    for (const [filename, data] of mediaMap.entries()) {
      await db.insert(media).values({
        filename,
        data,
        created: new Date(),
      });
    }
  }
}

export const apkgImporter = new ApkgImporter();
