/**
 * FeiControl — Agent 人格化 DB 存储层
 * 基于 SQLite (better-sqlite3)
 */
import { getPersonalityDb } from './db';
import type {
  AgentPersonality,
  AgentMood,
  MoodEntry,
  MoodHistoryEntry,
  InferenceResult,
  InitiativeSettings,
} from './types';

// ─── Personality CRUD ───────────────────────────────────────────────

function rowToPersonality(row: {
  agent_id: string;
  extraversion: number;
  conscientiousness: number;
  humor: number;
  empathy: number;
  creativity: number;
  is_auto_inferred: number;
  tone: string | null;
  verbosity: string | null;
  emoji_usage: string | null;
}): AgentPersonality {
  return {
    agentId: row.agent_id,
    extraversion: row.extraversion,
    conscientiousness: row.conscientiousness,
    humor: row.humor,
    empathy: row.empathy,
    creativity: row.creativity,
    isAutoInferred: row.is_auto_inferred === 1,
    customTraits: {
      tone: (row.tone as 'formal' | 'casual' | 'warm') ?? undefined,
      verbosity: (row.verbosity as 'brief' | 'normal' | 'detailed') ?? undefined,
      emojiUsage: (row.emoji_usage as 'never' | 'occasional' | 'frequent') ?? undefined,
    },
  };
}

/** 默认性格（全 5 分，手动模式） */
function makeDefault(agentId: string): AgentPersonality {
  return {
    agentId,
    extraversion: 5,
    conscientiousness: 5,
    humor: 5,
    empathy: 5,
    creativity: 5,
    isAutoInferred: false,
  };
}

/** 获取 Agent 性格，不存在则返回默认值 */
export function getPersonality(agentId: string): AgentPersonality {
  const db = getPersonalityDb();
  const row = db.prepare('SELECT * FROM agent_personalities WHERE agent_id = ?').get(agentId) as any;
  if (!row) return makeDefault(agentId);
  return rowToPersonality(row);
}

/** 创建或更新性格档案 */
export function upsertPersonality(p: AgentPersonality): void {
  const db = getPersonalityDb();
  db.prepare(`
    INSERT INTO agent_personalities (agent_id, extraversion, conscientiousness, humor, empathy, creativity, is_auto_inferred, tone, verbosity, emoji_usage, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
    ON CONFLICT(agent_id) DO UPDATE SET
      extraversion = excluded.extraversion,
      conscientiousness = excluded.conscientiousness,
      humor = excluded.humor,
      empathy = excluded.empathy,
      creativity = excluded.creativity,
      is_auto_inferred = excluded.is_auto_inferred,
      tone = excluded.tone,
      verbosity = excluded.verbosity,
      emoji_usage = excluded.emoji_usage,
      updated_at = datetime('now')
  `).run(
    p.agentId,
    p.extraversion,
    p.conscientiousness,
    p.humor,
    p.empathy,
    p.creativity,
    p.isAutoInferred ? 1 : 0,
    p.customTraits?.tone ?? null,
    p.customTraits?.verbosity ?? null,
    p.customTraits?.emojiUsage ?? null,
  );
}

/** 保存推断结果 */
export function saveInferredResult(agentId: string, result: InferenceResult): void {
  const existing = getPersonality(agentId);
  upsertPersonality({
    ...existing,
    agentId,
    extraversion: result.extraversion,
    conscientiousness: result.conscientiousness,
    humor: result.humor,
    empathy: result.empathy,
    creativity: result.creativity,
    isAutoInferred: true,
  });
}

/** 重置为默认性格 */
export function resetPersonality(agentId: string): void {
  const db = getPersonalityDb();
  db.prepare('DELETE FROM agent_personalities WHERE agent_id = ?').run(agentId);
}

// ─── Mood CRUD ──────────────────────────────────────────────────────

/** 获取当前心情 */
export function getMood(agentId: string): MoodEntry | null {
  const db = getPersonalityDb();
  const row = db.prepare('SELECT * FROM agent_moods WHERE agent_id = ?').get(agentId) as any;
  if (!row) return null;
  return {
    agentId: row.agent_id,
    mood: row.mood as AgentMood,
    reason: row.reason,
    updatedAt: row.updated_at,
  };
}

/** 更新心情（INSERT OR REPLACE + 写入历史） */
export function updateMood(agentId: string, mood: AgentMood, reason: string, trigger?: string): void {
  const db = getPersonalityDb();
  db.prepare(`
    INSERT INTO agent_moods (agent_id, mood, reason, updated_at)
    VALUES (?, ?, ?, datetime('now'))
    ON CONFLICT(agent_id) DO UPDATE SET
      mood = excluded.mood,
      reason = excluded.reason,
      updated_at = datetime('now')
  `).run(agentId, mood, reason);

  db.prepare(`
    INSERT INTO agent_mood_history (agent_id, mood, trigger, created_at)
    VALUES (?, ?, ?, datetime('now'))
  `).run(agentId, mood, trigger ?? reason);
}

/** 获取心情历史（最近 count 条） */
export function getMoodHistory(agentId: string, count = 50): MoodHistoryEntry[] {
  const db = getPersonalityDb();
  const rows = db.prepare(
    'SELECT * FROM agent_mood_history WHERE agent_id = ? ORDER BY created_at DESC LIMIT ?'
  ).all(agentId, count) as Array<{
    id: number;
    agent_id: string;
    mood: string;
    trigger: string;
    created_at: string;
  }>;

  return rows.map(r => ({
    id: r.id,
    agentId: r.agent_id,
    mood: r.mood as AgentMood,
    trigger: r.trigger,
    createdAt: r.created_at,
  }));
}

// ─── Initiative Settings CRUD ──────────────────────────────────────

/** 获取主动发起设置 */
export function getInitiativeSettings(agentId: string): InitiativeSettings {
  const db = getPersonalityDb();
  const row = db.prepare('SELECT * FROM agent_initiative_settings WHERE agent_id = ?').get(agentId) as any;
  if (!row) {
    return { agentId, enabled: false, frequency: 'low' };
  }
  return {
    agentId: row.agent_id,
    enabled: row.enabled === 1,
    frequency: row.frequency as InitiativeSettings['frequency'],
  };
}

/** 更新主动发起设置 */
export function upsertInitiativeSettings(s: InitiativeSettings): void {
  const db = getPersonalityDb();
  db.prepare(`
    INSERT INTO agent_initiative_settings (agent_id, enabled, frequency, updated_at)
    VALUES (?, ?, ?, datetime('now'))
    ON CONFLICT(agent_id) DO UPDATE SET
      enabled = excluded.enabled,
      frequency = excluded.frequency,
      updated_at = datetime('now')
  `).run(s.agentId, s.enabled ? 1 : 0, s.frequency);
}

/** 获取所有已启用的主动发起设置 */
export function getAllEnabledInitiativeSettings(): InitiativeSettings[] {
  const db = getPersonalityDb();
  const rows = db.prepare('SELECT * FROM agent_initiative_settings WHERE enabled = 1').all() as Array<{
    agent_id: string;
    enabled: number;
    frequency: string;
  }>;
  return rows.map(r => ({
    agentId: r.agent_id,
    enabled: r.enabled === 1,
    frequency: r.frequency as InitiativeSettings['frequency'],
  }));
}
