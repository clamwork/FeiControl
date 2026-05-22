/**
 * FeiControl — Agent 成长引擎 (Level / XP / Skills)
 * Sprint 1: Growth RPG 系统
 */

import { getPersonalityDb } from './db';
import type { AgentLevel, AgentSkill, SkillKey } from './types';
import { SKILL_DEFINITIONS } from './types';
import crypto from 'crypto';

// ─── Level / XP CRUD ─────────────────────────────────────────────────

/** 初始化一个 Agent 的等级记录（首次使用时自动创建） */
export function initLevel(agentId: string): AgentLevel {
  const db = getPersonalityDb();
  db.prepare(`
    INSERT OR IGNORE INTO agent_levels (agent_id, level, xp, xp_to_next, skill_points, updated_at)
    VALUES (?, 1, 0, 100, 0, datetime('now'))
  `).run(agentId);
  return getLevel(agentId);
}

/** 获取等级信息 */
export function getLevel(agentId: string): AgentLevel {
  const db = getPersonalityDb();
  const row = db.prepare('SELECT * FROM agent_levels WHERE agent_id = ?').get(agentId) as {
    agent_id: string; level: number; xp: number; xp_to_next: number; skill_points: number; updated_at: string;
  } | undefined;
  if (!row) return initLevel(agentId);
  return {
    agentId: row.agent_id,
    level: row.level,
    xp: row.xp,
    xpToNext: row.xp_to_next,
    skillPoints: row.skill_points,
    updatedAt: row.updated_at,
  };
}

/** 升级所需经验公式: 100 × 1.5^(level - 1) */
export function calcXpToNext(level: number): number {
  return Math.floor(100 * Math.pow(1.5, level - 1));
}

/** 增加经验，返回升级结果 */
export function addXp(agentId: string, amount: number, reason: string): {
  xp: number;
  level: number;
  xpToNext: number;
  didLevelUp: boolean;
  newSkillPoints: number;
} {
  const db = getPersonalityDb();
  const current = getLevel(agentId);

  let newXp = current.xp + amount;
  let newLevel = current.level;
  let newSkillPoints = current.skillPoints;
  let didLevelUp = false;

  // 循环升级（可能一次加经验升多级）
  while (newXp >= calcXpToNext(newLevel)) {
    newXp -= calcXpToNext(newLevel);
    newLevel += 1;
    newSkillPoints += 1;  // 每升一级给 1 技能点
    didLevelUp = true;
  }

  const xpToNext = calcXpToNext(newLevel);

  db.prepare(`
    UPDATE agent_levels SET
      level = ?, xp = ?, xp_to_next = ?, skill_points = ?, updated_at = datetime('now')
    WHERE agent_id = ?
  `).run(newLevel, newXp, xpToNext, newSkillPoints, agentId);

  return { xp: newXp, level: newLevel, xpToNext, didLevelUp, newSkillPoints };
}

// ─── 技能系统 ─────────────────────────────────────────────────────────

/** 获取 Agent 所有技能 */
export function getSkills(agentId: string): AgentSkill[] {
  const db = getPersonalityDb();
  const rows = db.prepare('SELECT * FROM agent_skills WHERE agent_id = ?').all(agentId) as Array<{
    id: string; agent_id: string; skill_key: string; level: number; unlocked_at: string | null;
  }>;
  return rows.map(r => ({
    id: r.id,
    agentId: r.agent_id,
    skillKey: r.skill_key as SkillKey,
    level: r.level,
    unlockedAt: r.unlocked_at,
  }));
}

/** 初始化 Agent 的未解锁技能记录（全部 skill_key 插入一行 level=0） */
export function initSkills(agentId: string): void {
  const db = getPersonalityDb();
  const existing = getSkills(agentId);
  const existingKeys = new Set(existing.map(s => s.skillKey));

  const insert = db.prepare(`
    INSERT OR IGNORE INTO agent_skills (id, agent_id, skill_key, level, unlocked_at)
    VALUES (?, ?, ?, 0, NULL)
  `);

  for (const def of SKILL_DEFINITIONS) {
    if (!existingKeys.has(def.key)) {
      insert.run(crypto.randomUUID(), agentId, def.key);
    }
  }
}

/** 解锁或升级技能（消耗技能点） */
export function applySkill(agentId: string, skillKey: SkillKey): {
  success: boolean;
  message: string;
  newLevel: number;
  skillPointsLeft: number;
} {
  const db = getPersonalityDb();
  const level = getLevel(agentId);

  // 确保技能行存在
  initSkills(agentId);

  const skillDef = SKILL_DEFINITIONS.find(s => s.key === skillKey);
  if (!skillDef) return { success: false, message: '技能不存在', newLevel: 0, skillPointsLeft: level.skillPoints };

  const currentSkill = db.prepare('SELECT * FROM agent_skills WHERE agent_id = ? AND skill_key = ?').get(agentId, skillKey) as {
    id: string; level: number; unlocked_at: string | null;
  } | undefined;

  if (!currentSkill) return { success: false, message: '技能记录不存在', newLevel: 0, skillPointsLeft: level.skillPoints };

  const currentLevel = currentSkill.level;
  if (currentLevel >= skillDef.maxLevel) {
    return { success: false, message: '技能已满级', newLevel: currentLevel, skillPointsLeft: level.skillPoints };
  }

  const cost = skillDef.costPerLevel;
  if (level.skillPoints < cost) {
    return { success: false, message: `技能点不足（需要 ${cost}，当前 ${level.skillPoints}）`, newLevel: currentLevel, skillPointsLeft: level.skillPoints };
  }

  const newLevel = currentLevel + 1;
  const unlockedAt = currentLevel === 0 ? new Date().toISOString() : currentSkill.unlocked_at;
  const newSkillPoints = level.skillPoints - cost;

  db.prepare(`
    UPDATE agent_skills SET level = ?, unlocked_at = ? WHERE agent_id = ? AND skill_key = ?
  `).run(newLevel, unlockedAt, agentId, skillKey);

  db.prepare(`
    UPDATE agent_levels SET skill_points = ?, updated_at = datetime('now') WHERE agent_id = ?
  `).run(newSkillPoints, agentId);

  return { success: true, message: `技能升级成功 → Lv.${newLevel}`, newLevel, skillPointsLeft: newSkillPoints };
}

/** 获取 Agent 的有效统计（技能影响后的最终数值） */
export function getEffectiveStats(agentId: string): {
  efficiency: number;       // 任务效率百分比加成
  creativity: number;       // 创意等级
  social: number;           // 社交等级
  learning: number;         // 学习等级
  initiativeBonus: number;  // 主动发起概率加成
  empathyBonus: number;     // 心情恢复速度加成
} {
  const skills = getSkills(agentId);
  const skillMap = new Map(skills.map(s => [s.skillKey, s.level]));

  const getLevel = (key: SkillKey) => skillMap.get(key) ?? 0;

  return {
    efficiency: getLevel('quick_task') * 5,       // 每级 -5% 任务时间
    creativity: getLevel('idea_gen'),
    social: getLevel('empathy_boost'),
    learning: getLevel('memory_boost'),
    initiativeBonus: getLevel('initiative') * 10,  // 每级 +10%
    empathyBonus: getLevel('empathy_boost') * 20,  // 每级 +20%
  };
}
