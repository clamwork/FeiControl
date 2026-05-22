/**
 * 存储层单元测试
 */
import { getPersonalityDb, closePersonalityDb } from '../db';
import {
  getPersonality,
  upsertPersonality,
  resetPersonality,
  updateMood,
  getMood,
  getMoodHistory,
  getInitiativeSettings,
  upsertInitiativeSettings,
  getAllEnabledInitiativeSettings,
} from '../repository';
import type { AgentPersonality, AgentMood } from '../types';

function assert(condition: boolean, msg: string) {
  if (!condition) throw new Error(`FAIL: ${msg}`);
  console.log(`  ✓ ${msg}`);
}

// 清理数据库
const db = getPersonalityDb();
db.exec('DELETE FROM agent_mood_history');
db.exec('DELETE FROM agent_moods');
db.exec('DELETE FROM agent_initiative_settings');
db.exec('DELETE FROM agent_personalities');

const TEST_AGENT = 'test-repo';

// 1. 默认值
const def = getPersonality(TEST_AGENT);
assert(def.agentId === TEST_AGENT, '默认性格 agentId 正确');
assert(def.extraversion === 5, '默认外向 = 5');
assert(def.conscientiousness === 5, '默认严谨 = 5');
assert(def.humor === 5, '默认幽默 = 5');
assert(def.empathy === 5, '默认同理心 = 5');
assert(def.creativity === 5, '默认创造力 = 5');
assert(def.isAutoInferred === false, '默认非推断');

// 2. 创建/更新
upsertPersonality({ agentId: TEST_AGENT, extraversion: 8, conscientiousness: 9, humor: 2, empathy: 7, creativity: 6, isAutoInferred: false });
const p = getPersonality(TEST_AGENT);
assert(p.extraversion === 8, '外向已更新为 8');
assert(p.conscientiousness === 9, '严谨已更新为 9');

// 3. 带自定义风格
upsertPersonality({
  agentId: TEST_AGENT,
  extraversion: 8, conscientiousness: 9, humor: 2, empathy: 7, creativity: 6,
  isAutoInferred: false,
  customTraits: { tone: 'formal', verbosity: 'detailed', emojiUsage: 'never' },
});
const p2 = getPersonality(TEST_AGENT);
assert(p2.customTraits?.tone === 'formal', 'tone = formal');
assert(p2.customTraits?.verbosity === 'detailed', 'verbosity = detailed');
assert(p2.customTraits?.emojiUsage === 'never', 'emojiUsage = never');

// 4. 重置
resetPersonality(TEST_AGENT);
const p3 = getPersonality(TEST_AGENT);
assert(p3.extraversion === 5, '重置后外向 = 5');

// 恢复 personality 以便后续测试（外键依赖）
upsertPersonality({ agentId: TEST_AGENT, extraversion: 5, conscientiousness: 5, humor: 5, empathy: 5, creativity: 5, isAutoInferred: false });

// 5. 心情 CRUD
const noMood = getMood(TEST_AGENT);
assert(noMood === null, '未设置心情 → null');

updateMood(TEST_AGENT, 'happy', '测试通过', 'test');
const mood = getMood(TEST_AGENT);
assert(mood !== null, '心情已设置');
assert(mood!.mood === 'happy', '心情 = happy');
assert(mood!.reason === '测试通过', '原因正确');

// 6. 心情历史
const history = getMoodHistory(TEST_AGENT);
assert(history.length === 1, '心情历史 = 1 条');
assert(history[0].mood === 'happy', '历史心情 = happy');

updateMood(TEST_AGENT, 'excited', '又一个测试', 'test2');
const history2 = getMoodHistory(TEST_AGENT);
assert(history2.length === 2, '心情历史 = 2 条');

// 7. 主动发起设置
const defInitiative = getInitiativeSettings(TEST_AGENT);
assert(defInitiative.enabled === false, '默认未启用');
assert(defInitiative.frequency === 'low', '默认频率 = low');

upsertInitiativeSettings({ agentId: TEST_AGENT, enabled: true, frequency: 'high' });
const initiative = getInitiativeSettings(TEST_AGENT);
assert(initiative.enabled === true, '已启用');
assert(initiative.frequency === 'high', '频率 = high');

// 8. 查询所有已启用
const allEnabled = getAllEnabledInitiativeSettings();
assert(allEnabled.length >= 1, '至少 1 个已启用');
assert(allEnabled.some(s => s.agentId === TEST_AGENT), '包含测试 Agent');

console.log('\n=== 存储层测试通过 ===');

closePersonalityDb();
