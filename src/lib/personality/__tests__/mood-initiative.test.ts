/**
 * 心情计算 + 主动发起单元测试
 */
import { describe, it, expect, afterAll } from 'vitest';
import { calculateMood } from '../mood-calculator';
import { checkInitiative } from '../initiative-engine';
import { closePersonalityDb } from '../db';

describe('心情衰减', () => {
  it('task_done → mood 应改善', () => {
    const result = calculateMood('t', [{type:'task_done', timestamp:Date.now()-5000}], 'calm', Date.now()-3600000);
    expect(result.mood).toBe('happy');
  });

  it('task_fail → confused', () => {
    const result = calculateMood('t', [{type:'task_fail', timestamp:Date.now()-5000}], 'happy', Date.now()-3600000);
    expect(result.mood).toBe('confused');
  });

  it('criticism → confused', () => {
    const result = calculateMood('t', [{type:'user_criticism', timestamp:Date.now()-5000}], 'happy', Date.now()-3600000);
    expect(result.mood).toBe('confused');
  });

  it('praise → excited', () => {
    const result = calculateMood('t', [{type:'user_praise', timestamp:Date.now()-5000}], 'calm', Date.now()-3600000);
    expect(result.mood).toBe('excited');
  });

  it('idle → calm (衰减)', () => {
    const result = calculateMood('t', [{type:'long_idle', timestamp:Date.now()-5000}], 'excited', Date.now()-3600000);
    expect(result.mood).toBe('calm');
  });

  it('fail + praise → happy', () => {
    const result = calculateMood('t', [
      {type:'task_fail', timestamp:Date.now()-10000},
      {type:'user_praise', timestamp:Date.now()-5000},
    ], 'calm', Date.now()-3600000);
    expect(result.mood).toBe('happy');
  });

  it('8h idle → calm', () => {
    const result = calculateMood('t', [], 'excited', Date.now()-8*3600000);
    expect(result.mood).toBe('calm');
  });

  it('未启用不发起', () => {
    expect(checkInitiative('nonexistent')).toBeNull();
  });
});

afterAll(() => {
  closePersonalityDb();
});
