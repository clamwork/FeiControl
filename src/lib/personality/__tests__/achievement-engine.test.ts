/**
 * 成就引擎单元测试
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { getPersonalityDb, closePersonalityDb } from '../db';
import { initLevel, addXp } from '../growth-engine';
import { trackEvent, getEventCount, getAchievements, checkAchievements, getAchievementsWithStatus } from '../achievement-engine';
import { ACHIEVEMENT_DEFINITIONS } from '../types';

const TEST_AGENT = 'test-achievement-agent';

beforeAll(() => {
  getPersonalityDb();
  const db = getPersonalityDb();
  db.prepare('INSERT OR IGNORE INTO agent_personalities (agent_id) VALUES (?)').run(TEST_AGENT);
  // Clean up
  db.prepare('DELETE FROM agent_achievements WHERE agent_id = ?').run(TEST_AGENT);
  db.prepare('DELETE FROM agent_event_counts WHERE agent_id = ?').run(TEST_AGENT);
  db.prepare('DELETE FROM agent_levels WHERE agent_id = ?').run(TEST_AGENT);
  initLevel(TEST_AGENT);
});

afterAll(() => {
  closePersonalityDb();
});

describe('trackEvent / getEventCount', () => {
  it('starts at 0 for unknown events', () => {
    expect(getEventCount(TEST_AGENT, 'tasks_completed')).toBe(0);
  });

  it('increments event counter', () => {
    const count = trackEvent(TEST_AGENT, 'tasks_completed', 1);
    expect(count).toBe(1);
    expect(getEventCount(TEST_AGENT, 'tasks_completed')).toBe(1);
  });

  it('accumulates increments', () => {
    trackEvent(TEST_AGENT, 'tasks_completed', 5);
    expect(getEventCount(TEST_AGENT, 'tasks_completed')).toBe(6);
  });
});

describe('getAchievements', () => {
  it('returns empty for new agent', () => {
    const achievements = getAchievements(TEST_AGENT);
    expect(achievements).toHaveLength(0);
  });
});

describe('checkAchievements', () => {
  it('unlocks first_task after 1 task completed', () => {
    // Ensure tasks_completed is at least 1
    const current = getEventCount(TEST_AGENT, 'tasks_completed');
    if (current < 1) {
      trackEvent(TEST_AGENT, 'tasks_completed', 1);
    }
    const unlocked = checkAchievements(TEST_AGENT);
    const firstTask = unlocked.find(a => a.key === 'first_task');
    expect(firstTask).toBeDefined();
    expect(firstTask?.name).toBe('初心者');
  });
});

describe('getAchievementsWithStatus', () => {
  it('returns all achievement definitions with unlock status', () => {
    const all = getAchievementsWithStatus(TEST_AGENT);
    expect(all.length).toBe(ACHIEVEMENT_DEFINITIONS.length);
    const firstTask = all.find(a => a.key === 'first_task');
    expect(firstTask?.unlocked).toBe(true);
  });
});

describe('level-based achievements', () => {
  it('unlocks level_five when agent reaches level 5', () => {
    const freshAgent = 'test-level-ach-' + Date.now();
    const db = getPersonalityDb();
    db.prepare('INSERT OR IGNORE INTO agent_personalities (agent_id) VALUES (?)').run(freshAgent);
    initLevel(freshAgent);
    trackEvent(freshAgent, 'tasks_completed', 1); // first_task

    // Add enough XP to reach level 5
    // L1→2:100, 2→3:150, 3→4:225, 4→5:338 = 813 total XP
    addXp(freshAgent, 900, 'power leveling');

    const unlocked = checkAchievements(freshAgent);
    const levelFive = unlocked.find(a => a.key === 'level_five');
    expect(levelFive).toBeDefined();
    expect(levelFive?.key).toBe('level_five');
  });
});
