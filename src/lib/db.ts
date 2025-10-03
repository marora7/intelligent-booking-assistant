import Database from 'better-sqlite3';
import path from 'path';

// Single shared connection instance (SQLite rule: use single connection)
const dbPath = path.join(process.cwd(), 'data', 'database.db');
const db = new Database(dbPath);

// Enable WAL mode for better concurrency (SQLite rule)
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON'); // Critical for referential integrity
db.pragma('synchronous = NORMAL');
db.pragma('cache_size = -64000'); // 64MB cache
db.pragma('temp_store = MEMORY');

// Graceful shutdown (SQLite rule)
process.on('exit', () => db.close());
process.on('SIGINT', () => {
  db.close();
  process.exit(0);
});

export default db;

