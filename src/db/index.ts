import { Database } from 'bun:sqlite';
import { drizzle } from 'drizzle-orm/bun-sqlite';
import * as schema from './schema';
import path from 'path';
import fs from 'fs';

const dbDir = path.join(process.cwd(), 'data');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const dbPath = path.join(dbDir, 'anki.db');
const sqlite = new Database(dbPath);
sqlite.run('PRAGMA journal_mode = WAL');

export const db = drizzle(sqlite, { schema });
export { schema };
