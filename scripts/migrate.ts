import { Database } from 'bun:sqlite';
import { drizzle } from 'drizzle-orm/bun-sqlite';
import { migrate } from 'drizzle-orm/bun-sqlite/migrator';
import path from 'path';
import fs from 'fs';

const dbDir = path.join(process.cwd(), 'data');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const dbPath = path.join(dbDir, 'anki.db');
const sqlite = new Database(dbPath);
const db = drizzle(sqlite);

console.log('🚀 Running migrations...');
migrate(db, { migrationsFolder: './drizzle' });
console.log('✅ Migrations completed!');

sqlite.close();
