-- FeiControl v1.1 — 002_personality.sql
-- Agent 人格化系统 · 数据库迁移
-- 依赖: 已有 SQLite 数据库 (better-sqlite3)
-- 执行方式: 见 src/lib/db.ts 的 migration runner
-- 日期: 2025-07

BEGIN TRANSACTION;

-- █████ 1. 性格档案 █████
-- 每个 Agent 一张，1:1 关系
CREATE TABLE IF NOT EXISTS agent_personalities (
  agent_id         TEXT PRIMARY KEY,
  extraversion     INTEGER NOT NULL DEFAULT 5 CHECK(extraversion BETWEEN 1 AND 10),
  conscientiousness INTEGER NOT NULL DEFAULT 5 CHECK(conscientiousness BETWEEN 1 AND 10),
  humor            INTEGER NOT NULL DEFAULT 5 CHECK(humor BETWEEN 1 AND 10),
  empathy          INTEGER NOT NULL DEFAULT 5 CHECK(empathy BETWEEN 1 AND 10),
  creativity       INTEGER NOT NULL DEFAULT 5 CHECK(creativity BETWEEN 1 AND 10),
  is_auto_inferred BOOLEAN NOT NULL DEFAULT 0,
  -- 说话风格（可选，覆盖性格驱动的默认值）
  tone             TEXT DEFAULT NULL CHECK(tone IN ('formal','casual','warm',NULL)),
  verbosity        TEXT DEFAULT NULL CHECK(verbosity IN ('brief','normal','detailed',NULL)),
  emoji_usage      TEXT DEFAULT NULL CHECK(emoji_usage IN ('never','occasional','frequent',NULL)),
  updated_at       TEXT NOT NULL DEFAULT (datetime('now'))
);

-- █████ 2. 当前心情 █████
-- 1:1，计算得出，每 5 分钟刷新
CREATE TABLE IF NOT EXISTS agent_moods (
  agent_id    TEXT PRIMARY KEY,
  mood        TEXT NOT NULL CHECK(mood IN ('happy','calm','tired','sad','confused','excited')),
  reason      TEXT NOT NULL DEFAULT '',
  updated_at  TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (agent_id) REFERENCES agent_personalities(agent_id)
);

-- █████ 3. 心情历史 █████
-- 用于时间轴展示和趋势分析
CREATE TABLE IF NOT EXISTS agent_mood_history (
  id        INTEGER PRIMARY KEY AUTOINCREMENT,
  agent_id  TEXT NOT NULL,
  mood      TEXT NOT NULL,
  trigger   TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (agent_id) REFERENCES agent_personalities(agent_id)
);
CREATE INDEX IF NOT EXISTS idx_mood_history_agent_time 
  ON agent_mood_history(agent_id, created_at DESC);

-- █████ 4. 主动发起设置 █████
CREATE TABLE IF NOT EXISTS agent_initiative_settings (
  agent_id      TEXT PRIMARY KEY,
  enabled       BOOLEAN NOT NULL DEFAULT 0,
  frequency     TEXT NOT NULL DEFAULT 'low' CHECK(frequency IN ('high','medium','low','important_only')),
  created_at    TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at    TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (agent_id) REFERENCES agent_personalities(agent_id)
);

-- █████ 5. 触发器：agent_moods 更新时自动写入历史 █████
-- 确保每次心情变化都被记录
CREATE TRIGGER IF NOT EXISTS trg_mood_after_update
AFTER UPDATE ON agent_moods
FOR EACH ROW
BEGIN
  INSERT INTO agent_mood_history (agent_id, mood, trigger, created_at)
  VALUES (NEW.agent_id, NEW.mood, 
    CASE WHEN OLD.mood != NEW.mood 
      THEN 'mood_change:' || OLD.mood || '→' || NEW.mood 
      ELSE 'refresh:' || NEW.reason 
    END,
    datetime('now'));
END;

-- 首次插入时也记录
CREATE TRIGGER IF NOT EXISTS trg_mood_after_insert
AFTER INSERT ON agent_moods
FOR EACH ROW
BEGIN
  INSERT INTO agent_mood_history (agent_id, mood, trigger, created_at)
  VALUES (NEW.agent_id, NEW.mood, 'initial:' || NEW.reason, datetime('now'));
END;

COMMIT;
