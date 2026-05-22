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

    -- Sprint 1: Growth RPG 系统
    CREATE TABLE IF NOT EXISTS agent_levels (
      agent_id    TEXT PRIMARY KEY,
      level       INTEGER NOT NULL DEFAULT 1,
      xp          INTEGER NOT NULL DEFAULT 0,
      xp_to_next  INTEGER NOT NULL DEFAULT 100,
      skill_points INTEGER NOT NULL DEFAULT 0,
      updated_at  TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (agent_id) REFERENCES agent_personalities(agent_id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS agent_skills (
      id          TEXT PRIMARY KEY,
      agent_id    TEXT NOT NULL,
      skill_key   TEXT NOT NULL,
      level       INTEGER NOT NULL DEFAULT 0,
      unlocked_at TEXT,
      FOREIGN KEY (agent_id) REFERENCES agent_levels(agent_id) ON DELETE CASCADE,
      UNIQUE(agent_id, skill_key)
    );

    CREATE TABLE IF NOT EXISTS agent_achievements (
      id              TEXT PRIMARY KEY,
      agent_id        TEXT NOT NULL,
      achievement_key TEXT NOT NULL,
      unlocked_at     TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (agent_id) REFERENCES agent_levels(agent_id) ON DELETE CASCADE,
      UNIQUE(agent_id, achievement_key)
    );

    CREATE TABLE IF NOT EXISTS agent_event_counts (
      agent_id     TEXT NOT NULL,
      event_key    TEXT NOT NULL,   -- e.g. 'tasks_completed', 'messages_sent', 'initiative_adopted'
      count        INTEGER NOT NULL DEFAULT 0,
      PRIMARY KEY (agent_id, event_key),
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
