/**
 * FeiControl — 人格化系统 SQLite 连接
 * 路径: data/personality.db
 */
import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const DB_PATH = path.join(process.cwd(), 'data', 'personality.db');

let _db: Database.Database | null = null;

export function getPersonalityDb(): Database.Database {
  if (_db) return _db;

  const dataDir = path.dirname(DB_PATH);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  _db = new Database(DB_PATH);
  _db.pragma('journal_mode = WAL');
  _db.pragma('synchronous = NORMAL');

  // Auto-migrate on first connect
  _db.exec(`
    CREATE TABLE IF NOT EXISTS agent_personalities (
      agent_id         TEXT PRIMARY KEY,
      extraversion     INTEGER NOT NULL DEFAULT 5 CHECK(extraversion BETWEEN 1 AND 10),
      conscientiousness INTEGER NOT NULL DEFAULT 5 CHECK(conscientiousness BETWEEN 1 AND 10),
      humor            INTEGER NOT NULL DEFAULT 5 CHECK(humor BETWEEN 1 AND 10),
      empathy          INTEGER NOT NULL DEFAULT 5 CHECK(empathy BETWEEN 1 AND 10),
      creativity       INTEGER NOT NULL DEFAULT 5 CHECK(creativity BETWEEN 1 AND 10),
      is_auto_inferred INTEGER NOT NULL DEFAULT 0,
      tone             TEXT DEFAULT NULL CHECK(tone IN ('formal','casual','warm',NULL)),
      verbosity        TEXT DEFAULT NULL CHECK(verbosity IN ('brief','normal','detailed',NULL)),
      emoji_usage      TEXT DEFAULT NULL CHECK(emoji_usage IN ('never','occasional','frequent',NULL)),
      updated_at       TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS agent_moods (
      agent_id    TEXT PRIMARY KEY,
      mood        TEXT NOT NULL CHECK(mood IN ('happy','calm','tired','sad','confused','excited')),
      reason      TEXT NOT NULL DEFAULT '',
      updated_at  TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (agent_id) REFERENCES agent_personalities(agent_id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS agent_mood_history (
      id        INTEGER PRIMARY KEY AUTOINCREMENT,
      agent_id  TEXT NOT NULL,
      mood      TEXT NOT NULL,
      trigger   TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (agent_id) REFERENCES agent_personalities(agent_id) ON DELETE CASCADE
    );
    CREATE INDEX IF NOT EXISTS idx_mood_history_agent_time
      ON agent_mood_history(agent_id, created_at DESC);

    CREATE TABLE IF NOT EXISTS agent_initiative_settings (
      agent_id      TEXT PRIMARY KEY,
      enabled       INTEGER NOT NULL DEFAULT 0,
      frequency     TEXT NOT NULL DEFAULT 'low' CHECK(frequency IN ('high','medium','low','important_only')),
      created_at    TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at    TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (agent_id) REFERENCES agent_personalities(agent_id) ON DELETE CASCADE
    );
  `);

  return _db;
}

/** 关闭数据库连接 (测试/清理用) */
export function closePersonalityDb(): void {
  if (_db) {
    _db.close();
    _db = null;
  }
}
