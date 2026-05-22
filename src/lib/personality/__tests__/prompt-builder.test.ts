/**
 * 人格化系统单元测试
 */
import { describe, it, expect } from 'vitest';
import {
  buildPersonalityPrompt,
  inferPersonality,
  generateExampleReply,
  PRESET_TEMPLATES,
} from '../prompt-builder';
import type { AgentPersonality } from '../types';

function makePersonality(overrides: Partial<AgentPersonality> = {}): AgentPersonality {
  return {
    agentId: 'test',
    extraversion: 5,
    conscientiousness: 5,
    humor: 5,
    empathy: 5,
    creativity: 5,
    isAutoInferred: false,
    ...overrides,
  };
}

describe('buildPersonalityPrompt', () => {
  it('默认 Prompt 长度 > 100', () => {
    const prompt = buildPersonalityPrompt(makePersonality(), { agentName: 'TestBot' });
    expect(prompt.length).toBeGreaterThan(100);
  });

  it('Prompt 包含 Agent 名称', () => {
    const prompt = buildPersonalityPrompt(makePersonality(), { agentName: 'TestBot' });
    expect(prompt).toContain('TestBot');
  });

  it('Prompt 包含性格设定区', () => {
    const prompt = buildPersonalityPrompt(makePersonality());
    expect(prompt).toContain('性格设定');
  });

  it('包含语言风格区', () => {
    const prompt = buildPersonalityPrompt(makePersonality());
    expect(prompt).toContain('语言风格');
  });

  it('包含约束区', () => {
    const prompt = buildPersonalityPrompt(makePersonality());
    expect(prompt).toContain('约束');
  });

  it('高严谨 → 结构化输出', () => {
    const prompt = buildPersonalityPrompt(makePersonality({ conscientiousness: 10, humor: 1 }), { agentName: '严肃Agent' });
    expect(prompt).toContain('结构化');
  });

  it('包含预设模板', () => {
    expect(PRESET_TEMPLATES.length).toBeGreaterThanOrEqual(4);
  });
});

describe('inferPersonality', () => {
  it('空输入 → 默认外向 5', () => {
    const result = inferPersonality({ conversations: [] });
    expect(result.extraversion).toBe(5);
  });

  it('默认严谨 5', () => {
    const result = inferPersonality({ conversations: [] });
    expect(result.conscientiousness).toBe(5);
  });

  it('短对话 → 低置信度', () => {
    const result = inferPersonality({ conversations: [] });
    expect(result.confidence).toBeLessThan(0.5);
  });
});

describe('generateExampleReply', () => {
  it('高严谨低外向 → 正式开场', () => {
    const reply = generateExampleReply(makePersonality({ conscientiousness: 10, extraversion: 3 }));
    expect(reply).toContain('您好');
  });

  it('高外向 → 热情开场', () => {
    const reply = generateExampleReply(makePersonality({ extraversion: 9 }));
    expect(reply).toContain('嗨');
  });

  it('高同理心 → 温暖开场', () => {
    const reply = generateExampleReply(makePersonality({ empathy: 9 }));
    expect(reply).toContain('你好呀');
  });
});
