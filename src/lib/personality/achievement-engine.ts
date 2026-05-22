/**
 * FeiControl — Agent 成就引擎
 * Sprint 1: Growth RPG 系统
 */

import { getPersonalityDb } from './db';
import { getLevel, addXp, getSkills } from './growth-engine';
import type { AchievementKey, AgentAchievement } from './types';
import { ACHIEVEMENT_DEFINITIONS, SKILL_DEFINITIONS } from './types';
import crypto from 'crypto';

// ─── 事件计数 ─────────────────────────────────────────────────────────

/** 记录事件次数（自增计数器） */
export function trackEvent(agentId: string, eventKey: string, increment = 1): number {
  const db = getPersonalityDb();
  db.prepare(`
    INSERT INTO agent_event_counts (agent_id, event_key, count)
    VALUES (?, ?, ?)
    ON CONFLICT(agent_id, event_key) DO UPDATE SET
      count = count + excluded.count
  `).run(agentId, eventKey, increment);

  const row = db.prepare('SELECT count FROM agent_event_counts WHERE agent_id = ? AND event_key = ?').get(agentId, eventKey) as { count: number } | undefined;
  return row?.count ?? increment;
}

/** 获取事件计数 */
export function getEventCount(agentId: string, eventKey: string): number {
  const db = getPersonalityDb();
  const row = db.prepare('SELECT count FROM agent_event_counts WHERE agent_id = ? AND event_key = ?').get(agentId, eventKey) as { count: number } | undefined;
  return row?.count ?? 0;
}

// ─── 成就检测 ─────────────────────────────────────────────────────────

/** 获取 Agent 已解锁的成就 */
export function getAchievements(agentId: string): AgentAchievement[] {
  const db = getPersonalityDb();
  const rows = db.prepare('SELECT * FROM agent_achievements WHERE agent_id = ?').all(agentId) as Array<{
    id: string; agent_id: string; achievement_key: string; unlocked_at: string;
  }>;
  return rows.map(r => ({
    id: r.id,
    agentId: r.agent_id,
    achievementKey: r.achievement_key as AchievementKey,
    unlockedAt: r.unlocked_at,
  }));
}

/** 成就检测核心：检查所有未达成的成就，返回新解锁的成就列表 */
export function checkAchievements(agentId: string): Array<{
  key: AchievementKey;
  name: string;
  reward: string;
  rewardXp?: number;
  rewardSkillPoints?: number;
}> {
  const db = getPersonalityDb();
  const unlocked = new Set(getAchievements(agentId).map(a => a.achievementKey));
  const level = getLevel(agentId);
  const skills = getSkills(agentId);
  const tasksDone = getEventCount(agentId, 'tasks_completed');
  const messagesSent = getEventCount(agentId, 'messages_sent');
  const initiativesAdopted = getEventCount(agentId, 'initiative_adopted');
  const allSkillKeys = new Set(skills.map(s => s.skillKey));

  const newlyUnlocked: Array<{
    key: AchievementKey;
    name: string;
    reward: string;
    rewardXp?: number;
    rewardSkillPoints?: number;
  }> = [];

  for (const def of ACHIEVEMENT_DEFINITIONS) {
    if (unlocked.has(def.key)) continue;

    let achieved = false;
    switch (def.key) {
      case 'first_task':
        achieved = tasksDone >= 1;
        break;
      case 'hundred_tasks':
        achieved = tasksDone >= 100;
        break;
      case 'thousand_messages':
        achieved = messagesSent >= 1000;
        break;
      case 'level_five':
        achieved = level.level >= 5;
        break;
      case 'all_skills':
        achieved = allSkillKeys.size >= SKILL_DEFINITIONS.length && skills.every(s => s.level >= 1);
        break;
      case 'happy_day':
        // 累计 happy 状态 ≥ 24h — 简化实现：检查心情历史中有多少 'happy' 记录
        {
          const happyCount = db.prepare(
            `SELECT COUNT(*) as cnt FROM agent_mood_history WHERE agent_id = ? AND mood = 'happy'`
          ).get(agentId) as { cnt: number };
          achieved = happyCount.cnt >= 24; // 24 条心情记录 ≈ 24h（假设每小时记录一次）
        }
        break;
      case 'innovator':
        achieved = initiativesAdopted >= 50;
        break;
      case 'champion':
        achieved = level.level >= 10;
        break;
    }

    if (achieved) {
      // 写入 DB
      db.prepare(`
        INSERT INTO agent_achievements (id, agent_id, achievement_key, unlocked_at)
        VALUES (?, ?, ?, datetime('now'))
      `).run(crypto.randomUUID(), agentId, def.key);

      // 发放奖励
      if (def.rewardXp) {
        addXp(agentId, def.rewardXp, `成就奖励: ${def.name}`);
      }
      if (def.rewardSkillPoints) {
        const lvl = getLevel(agentId);
        db.prepare(`
          UPDATE agent_levels SET skill_points = skill_points + ?, updated_at = datetime('now')
          WHERE agent_id = ?
        `).run(def.rewardSkillPoints, agentId);
      }

      newlyUnlocked.push({
        key: def.key,
        name: def.name,
        reward: def.reward,
        rewardXp: def.rewardXp,
        rewardSkillPoints: def.rewardSkillPoints,
      });
    }
  }

  return newlyUnlocked;
}

/** 获取成就完整信息（包含达成状态） */
export function getAchievementsWithStatus(agentId: string): Array<{
  key: AchievementKey;
  name: string;
  description: string;
  condition: string;
  reward: string;
  unlocked: boolean;
  unlockedAt: string | null;
}> {
  const unlocked = new Map(getAchievements(agentId).map(a => [a.achievementKey, a.unlockedAt]));

  return ACHIEVEMENT_DEFINITIONS.map(def => ({
    key: def.key,
    name: def.name,
    description: def.description,
    condition: def.condition,
    reward: def.reward,
    unlocked: unlocked.has(def.key),
    unlockedAt: unlocked.get(def.key) ?? null,
  }));
}
