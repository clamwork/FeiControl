/**
 * FeiControl — Agent 进化里程碑引擎
 * Sprint 1: Evolution milestone detection + unlock
 */
import { getPersonalityDb } from './db';
import type { AgentEvolution, EvolutionMilestone } from './types';
import { EVOLUTION_MILESTONES } from './types';
import crypto from 'crypto';

/** 获取 Agent 已解锁的里程碑 */
export function getUnlockedMilestones(agentId: string): AgentEvolution[] {
  const db = getPersonalityDb();
  const rows = db.prepare(`
    SELECT * FROM agent_evolution_milestones WHERE agent_id = ?
  `).all(agentId) as Array<{
    id: string; agent_id: string; milestone_threshold: number; unlocked_at: string;
  }>;
  return rows.map(r => ({
    id: r.id,
    agentId: r.agent_id,
    milestoneThreshold: r.milestone_threshold,
    unlockedAt: r.unlocked_at,
  }));
}

/** 获取 Agent 已解锁的里程碑 threshold 集合 */
export function getUnlockedThresholds(agentId: string): Set<number> {
  return new Set(getUnlockedMilestones(agentId).map(m => m.milestoneThreshold));
}

/**
 * 检查并解锁新里程碑，返回新解锁的列表
 * 在 addXp 之后调用，传入新等级
 */
export function checkEvolutionMilestones(agentId: string, currentLevel: number): Array<{
  milestone: EvolutionMilestone;
  unlockedAt: string;
}> {
  const db = getPersonalityDb();
  const unlocked = getUnlockedThresholds(agentId);
  const newlyUnlocked: Array<{
    milestone: EvolutionMilestone;
    unlockedAt: string;
  }> = [];

  for (const ms of EVOLUTION_MILESTONES) {
    if (unlocked.has(ms.threshold)) continue;
    if (currentLevel >= ms.threshold) {
      const now = new Date().toISOString();
      db.prepare(`
        INSERT INTO agent_evolution_milestones (id, agent_id, milestone_threshold, unlocked_at)
        VALUES (?, ?, ?, ?)
      `).run(crypto.randomUUID(), agentId, ms.threshold, now);

      newlyUnlocked.push({ milestone: ms, unlockedAt: now });
    }
  }

  return newlyUnlocked;
}

/**
 * 获取全部里程碑的达成状态（含定义）
 */
export function getMilestonesWithStatus(agentId: string): Array<{
  threshold: number;
  name: string;
  title: string;
  effects: string[];
  visualTags: string[];
  unlocked: boolean;
  unlockedAt: string | null;
}> {
  const unlocked = new Map(
    getUnlockedMilestones(agentId).map(m => [m.milestoneThreshold, m.unlockedAt])
  );

  return EVOLUTION_MILESTONES.map(ms => ({
    threshold: ms.threshold,
    name: ms.name,
    title: ms.title,
    effects: ms.effects,
    visualTags: ms.visualTags,
    unlocked: unlocked.has(ms.threshold),
    unlockedAt: unlocked.get(ms.threshold) ?? null,
  }));
}
