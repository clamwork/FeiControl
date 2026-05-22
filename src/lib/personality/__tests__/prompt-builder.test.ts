/**
 * 人格化系统单元测试
 */
import {
  buildPersonalityPrompt,
  inferPersonality,
  generateExampleReply,
  PRESET_TEMPLATES,
} from '../prompt-builder';
import type { AgentPersonality, InferenceInput } from '../types';

// ─── Helpers ────────────────────────────────────────────────────────

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

// ─── Tests ──────────────────────────────────────────────────────────

function assert(condition: boolean, msg: string) {
  if (!condition) throw new Error(`FAIL: ${msg}`);
  console.log(`  ✓ ${msg}`);
}

// 1. 默认性格 Prompt 包含所有维度
const defaultPrompt = buildPersonalityPrompt(makePersonality(), { agentName: 'TestBot' });
assert(defaultPrompt.length > 100, '默认 Prompt 长度 > 100');
assert(defaultPrompt.includes('TestBot'), 'Prompt 包含 Agent 名称');
assert(defaultPrompt.includes('性格设定'), 'Prompt 包含性格设定区');
assert(defaultPrompt.includes('语言风格'), 'Prompt 包含语言风格区');
assert(defaultPrompt.includes('约束'), 'Prompt 包含约束区');

// 2. 高严谨性格
const highCons = buildPersonalityPrompt(makePersonality({ conscientiousness: 10, humor: 1 }), { agentName: '严肃Agent' });
assert(highCons.includes('结构化'), '高严谨 → 结构化输出');
assert(highCons.includes('认真严肃'), '高严谨 + 低幽默 → 认真严肃');
assert(highCons.includes('置信度'), '高严谨 → 置信度标注');

// 3. 高外向 + 高幽默
const highExt = buildPersonalityPrompt(makePersonality({ extraversion: 9, humor: 8, creativity: 7 }), { agentName: '欢乐Agent' });
assert(highExt.includes('热情'), '高外向 → 热情');
assert(highExt.includes('俏皮话'), '高幽默 → 俏皮话');
assert(highExt.includes('替代方案'), '高创造 → 补充建议');

// 4. 高同理心
const highEmp = buildPersonalityPrompt(makePersonality({ empathy: 9 }), { agentName: '暖心Agent' });
assert(highEmp.includes('温暖'), '高同理心 → 温暖风格');

// 5. 预设模板覆盖
assert(PRESET_TEMPLATES.length >= 4, '至少 4 个预设模板');
const labels = PRESET_TEMPLATES.map(t => t.labelZh);
assert(labels.includes('高效助手型'), '包含高效助手型');
assert(labels.includes('创意伙伴型'), '包含创意伙伴型');

// 6. 推断引擎 - 空输入
const emptyInfer = inferPersonality({ conversations: [] });
assert(emptyInfer.extraversion === 5, '空输入 → 默认外向 5');
assert(emptyInfer.conscientiousness === 5, '空输入 → 默认严谨 5');

// 7. 推断引擎 - 短对话
const shortConv: InferenceInput = {
  conversations: [
    { role: 'user', content: '你好' },
    { role: 'assistant', content: '你好！有什么需要帮忙的吗？' },
    { role: 'user', content: '帮我分析数据' },
    { role: 'assistant', content: '好的。数据量500条，异常12条，占比2.4%。建议清理第3类异常。' },
  ],
};
const shortInfer = inferPersonality(shortConv);
// 只有 2 条 assistant 回复，不够 20 条，所以部分维度可能是默认的
assert(shortInfer.confidence < 0.5, '短对话 → 低置信度');

// 8. 推断引擎 - 足量严谨对话（确定性词语多）
const manyConscientious: InferenceInput = {
  conversations: Array(30).fill(null).flatMap(() => [
    { role: 'user' as const, content: '分析这个CSV' },
    { role: 'assistant' as const, content: '好的。绝对确定共有1250行，务必注意缺失值23处，肯定需要先处理缺失值再分析。异常检测发现5条必须处理的记录。' },
  ]),
};
const consInfer = inferPersonality(manyConscientious);
assert(consInfer.conscientiousness >= 7, '严谨对话 → 高严谨分数');
assert(consInfer.confidence > 0.4, '足量对话 → 中高置信度');

// 9. 示例回复测试
const ex1 = generateExampleReply(makePersonality({ conscientiousness: 9, extraversion: 3 }));
assert(ex1.includes('您好') || ex1.includes('助手'), '高严谨低外向 → 正式开场');

const ex2 = generateExampleReply(makePersonality({ empathy: 9 }));
assert(ex2.includes('你好呀') || ex2.includes('帮忙'), '高同理心 → 温暖开场');

const ex3 = generateExampleReply(makePersonality({ extraversion: 9 }));
assert(ex3.includes('嗨') || ex3.includes('今天过得怎么样'), '高外向 → 热情开场');

// 10. 自定义说话风格
const customPrompt = buildPersonalityPrompt(
  makePersonality({
    customTraits: { tone: 'warm', verbosity: 'brief', emojiUsage: 'frequent' },
  }),
  { agentName: '温暖Agent' }
);
assert(customPrompt.includes('温暖'), 'warm 风格 → 温暖描述');
assert(customPrompt.includes('emoji'), 'frequent emoji → 要求使用 emoji');
assert(customPrompt.includes('简明扼要'), 'brief 风格 → 简洁表达');

console.log('\n=== 所有测试通过 ===');
