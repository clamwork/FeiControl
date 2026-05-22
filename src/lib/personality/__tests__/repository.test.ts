/**
 * 存储层单元测试
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { getPersonalityDb, closePersonalityDb } from '../db';
import {
  getPersonality, upsertPersonality, resetPersonality, saveInferredResult,
  getMood, updateMood, getMoodHistory,
  getInitiativeSettings, upsertInitiativeSettings, getAllEnabledInitiativeSettings,
} from '../repository';
import type { AgentPersonality } from '../types';

const TEST_AGENT = 'test-repo-agent';

beforeAll(() => {
  const db = getPersonalityDb();
  db.prepare('DELETE FROM agent_personalities WHERE agent_id = ?').run(TEST_AGENT);
  db.prepare('DELETE FROM agent_moods WHERE agent_id = ?').run(TEST_AGENT);
  db.prepare('DELETE FROM agent_mood_history WHERE agent_id = ?').run(TEST_AGENT);
  db.prepare('DELETE FROM agent_initiative_settings WHERE agent_id = ?').run(TEST_AGENT);
});

afterAll(() => {
  closePersonalityDb();
});

describe('Personality CRUD', () => {
  it('默认性格 agentId 正确', () => {
    const p = getPersonality(TEST_AGENT);
    expect(p.agentId).toBe(TEST_AGENT);
  });

  it('默认外向 = 5', () => {
    expect(getPersonality(TEST_AGENT).extraversion).toBe(5);
  });

  it('更新外向 = 8', () => {
    upsertPersonality({ agentId: TEST_AGENT, extraversion: 8, conscientiousness: 5, humor: 5, empathy: 5, creativity: 5, isAutoInferred: false });
    expect(getPersonality(TEST_AGENT).extraversion).toBe(8);
  });

  it('更新严谨 = 9', () => {
    upsertPersonality({ agentId: TEST_AGENT, extraversion: 8, conscientiousness: 9, humor: 5, empathy: 5, creativity: 5, isAutoInferred: false });
    expect(getPersonality(TEST_AGENT).conscientiousness).toBe(9);
  });

  it('保存推断结果', () => {
    saveInferredResult(TEST_AGENT, { extraversion: 7, conscientiousness: 6, humor: 8, empathy: 4, creativity: 9, confidence: 0.85 });
    const p = getPersonality(TEST_AGENT);
    expect(p.isAutoInferred).toBe(true);
    expect(p.extraversion).toBe(7);
  });

  it('重置后回到默认', () => {
    resetPersonality(TEST_AGENT);
    // Re-insert for subsequent tests
    const db = getPersonalityDb();
    db.prepare('INSERT OR IGNORE INTO agent_personalities (agent_id) VALUES (?)').run(TEST_AGENT);
    expect(getPersonality(TEST_AGENT).extraversion).toBe(5);
  });
});

describe('Mood CRUD', () => {
  it('未设置心情 → null', () => {
    expect(getMood('non-existent')).toBeNull();
  });

  it('设置心情', () => {
    updateMood(TEST_AGENT, 'happy', '测试', 'test');
    const mood = getMood(TEST_AGENT);
    expect(mood).not.toBeNull();
    expect(mood?.mood).toBe('happy');
  });

  it('更新心情', () => {
    updateMood(TEST_AGENT, 'excited', '新测试', 'test2');
    expect(getMood(TEST_AGENT)?.mood).toBe('excited');
  });

  it('心情历史记录', () => {
    updateMood(TEST_AGENT, 'happy', '测试', 'test');
    const history = getMoodHistory(TEST_AGENT, 10);
    expect(history.length).toBeGreaterThanOrEqual(1);
    expect(history[0].mood).toBe('happy');
  });
});

describe('Initiative Settings CRUD', () => {
  it('默认未启用', () => {
    const s = getInitiativeSettings(TEST_AGENT);
    expect(s.enabled).toBe(false);
    expect(s.frequency).toBe('low');
  });

  it('启用主动发起', () => {
    upsertInitiativeSettings({ agentId: TEST_AGENT, enabled: true, frequency: 'high' });
    const s = getInitiativeSettings(TEST_AGENT);
    expect(s.enabled).toBe(true);
    expect(s.frequency).toBe('high');
  });

  it('已启用的列表', () => {
    const list = getAllEnabledInitiativeSettings();
    expect(list.length).toBeGreaterThanOrEqual(1);
    expect(list.some(s => s.agentId === TEST_AGENT)).toBe(true);
  });
});
