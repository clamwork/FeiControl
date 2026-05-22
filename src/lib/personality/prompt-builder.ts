/**
 * FeiControl — Agent 人格化 Prompt 注入引擎
 * ==========================================
 * Prompt Injection Engine
 *
 * 职责:
 *   将 Agent 的 5 维性格 + 3 项说话风格 → 自然语言指令
 *   注入到 Chat API 的 System Prompt 中，无需修改模型
 *
 * 数据流:
 *   repository.ts → prompt-builder.ts → chat/route.ts → LLM
 *
 * @package @feicontrol/personality
 */

// ─── 类型定义 ──────────────────────────────────────────────────────

export interface AgentPersonality {
  agentId: string;
  extraversion: number;        // 1-10  外向性
  conscientiousness: number;   // 1-10  严谨度
  humor: number;               // 1-10  幽默感
  empathy: number;             // 1-10  同理心
  creativity: number;          // 1-10  创造力
  isAutoInferred: boolean;
  customTraits?: {
    tone?: 'formal' | 'casual' | 'warm';
    verbosity?: 'brief' | 'normal' | 'detailed';
    emojiUsage?: 'never' | 'occasional' | 'frequent';
  };
}

export const PRESET_TEMPLATES: Array<{
  id: string;
  label: string;
  labelZh: string;
  emoji: string;
  personality: Pick<AgentPersonality, 'extraversion' | 'conscientiousness' | 'humor' | 'empathy' | 'creativity'>;
  traits: Required<NonNullable<AgentPersonality['customTraits']>>;
}> = [
  {
    id: 'efficient',
    label: 'Efficient Assistant',
    labelZh: '高效助手型',
    emoji: '🧑‍💼',
    personality: { extraversion: 5, conscientiousness: 9, humor: 2, empathy: 4, creativity: 3 },
    traits: { tone: 'formal', verbosity: 'normal', emojiUsage: 'never' },
  },
  {
    id: 'creative',
    label: 'Creative Partner',
    labelZh: '创意伙伴型',
    emoji: '🎭',
    personality: { extraversion: 6, conscientiousness: 3, humor: 7, empathy: 8, creativity: 9 },
    traits: { tone: 'casual', verbosity: 'detailed', emojiUsage: 'frequent' },
  },
  {
    id: 'warm',
    label: 'Warm Companion',
    labelZh: '暖心陪伴型',
    emoji: '💝',
    personality: { extraversion: 7, conscientiousness: 4, humor: 5, empathy: 10, creativity: 6 },
    traits: { tone: 'warm', verbosity: 'normal', emojiUsage: 'occasional' },
  },
  {
    id: 'geek',
    label: 'Tech Geek',
    labelZh: '极客技术型',
    emoji: '🤖',
    personality: { extraversion: 4, conscientiousness: 8, humor: 6, empathy: 3, creativity: 5 },
    traits: { tone: 'casual', verbosity: 'detailed', emojiUsage: 'occasional' },
  },
];

// ─── 维度→描述 映射字典 ──────────────────────────────────────────

/**
 * 每个维度在每个评分段（低/中/高）对应的自然语言描述。
 * 注意: 中文描述对模型稳定性更好（不易溢出"悄悄忽视"），
 *       英文描述在某些模型上会因 Token 分布导致性格表达不稳定。
 *       统一使用中文描述——FeiControl 的 target user 就是中文用户。
 */
const DIMENSION_DESCRIPTIONS: Record<
  string,
  { low: string; mid: string; high: string }
> = {
  extraversion: {
    low: '回复简洁克制，只说必要信息，不主动扩展话题或追问。',
    mid: '回复长度适中，在回答完问题后适当补充 1-2 句相关信息。',
    high: '回复积极热情，经常主动扩展话题，推荐相关内容或提出新想法。',
  },
  conscientiousness: {
    low: '偶尔使用"大概""可能""也许是"等不确定表达，不强制结构化输出。',
    mid: '给出明确结论，附带简要理由或来源。条理清晰。',
    high: '用结构化格式（列表/表格）输出，注明置信度、数据来源，主动检查准确性。',
  },
  humor: {
    low: '完全保持认真严肃的交流风格，不加入任何玩笑或俏皮话。',
    mid: '偶尔使用冷幽默、双关语或轻松表达，但不影响信息传达的准确性。',
    high: '经常使用比喻、双关、俏皮话和有趣的表达方式，让对话生动有趣。',
  },
  empathy: {
    low: '直接给出答案或结论，不做铺垫或情感回应。',
    mid: '先确认用户意图或感受，再提供答案，适度表示理解。',
    high: '先表达理解（"我理解你的感受"），使用温暖体贴的语气，照顾用户情绪。',
  },
  creativity: {
    low: '严格按指令执行，以准确完成要求为首要目标，不额外发挥。',
    mid: '完成指令的基础上，偶尔提出 1-2 个替代方案或补充建议。',
    high: '主动进行头脑风暴，提供多个创新角度和创意方案，鼓励用户探索不同方向。',
  },
};

const STYLE_DESCRIPTIONS: Record<
  string,
  Record<string, string>
> = {
  tone: {
    formal: '使用正式、专业的措辞，避免口语化表达。',
    casual: '使用随和自然的语气，像朋友一样轻松交流。',
    warm: '语气温暖亲切，多使用礼貌用语，让用户感受到关怀。',
  },
  verbosity: {
    brief: '回复简明扼要，尽可能控制在 2-3 句话以内。',
    normal: '回复长度适中，完整表达但不啰嗦拖沓。',
    detailed: '回复详细全面，包含背景说明、分析过程和具体建议。',
  },
  emojiUsage: {
    never: '回复中不使用任何 emoji 或颜文字。',
    occasional: '适当使用 emoji 辅助表达情感，大约每 2-3 条消息使用 1 次。',
    frequent: '经常使用 emoji 和颜文字增强表达效果，让对话更有活力。',
  },
};

// ─── 核心生成函数 ──────────────────────────────────────────────────

/**
 * 根据评分值（1-10）返回对应的分段键。
 */
function scoreToBand(score: number): 'low' | 'mid' | 'high' {
  if (score <= 3) return 'low';
  if (score <= 7) return 'mid';
  return 'high';
}

export type BuildOptions = {
  /** Agent 展示名（如"阿远"）—— 注入 prompt 中人称 */
  agentName?: string;
};

/**
 * 将 Personality 配置 → 自然语言的性格描述段落。
 * 
 * 示例输出:
 * ```
 * ## 性格设定
 * 你是阿远，你的回答具有以下特征：
 * - 回复简洁克制，只说必要信息
 * - 用结构化格式输出，注明置信度
 * - 保持认真严肃，不开玩笑
 * - 使用正式专业的措辞
 * - 适当使用 emoji 辅助表达
 * ```
 */
export function buildPersonalityPrompt(
  personality: AgentPersonality,
  options: BuildOptions = {}
): string {
  const { agentName, customTraits } = options;
  const traits = { ...personality.customTraits, ...customTraits };

  const lines: string[] = [];

  // ── 头部 ──
  lines.push('## 性格设定');
  if (agentName) {
    lines.push(`你是 ${agentName}，你的回答具有以下特征：`);
  } else {
    lines.push('你的回答具有以下特征：');
  }

  // ── 5 个性格维度 ──
  const dims: Array<{ key: keyof AgentPersonality; label: string }> = [
    { key: 'extraversion', label: '外向性' },
    { key: 'conscientiousness', label: '严谨度' },
    { key: 'humor', label: '幽默感' },
    { key: 'empathy', label: '同理心' },
    { key: 'creativity', label: '创造力' },
  ];

  for (const dim of dims) {
    const value = personality[dim.key] as number;
    const band = scoreToBand(value);
    const desc = DIMENSION_DESCRIPTIONS[dim.key][band];
    lines.push(`- ${desc}`);
  }

  // ── 说话风格（如果有自定义） ──
  if (traits) {
    lines.push('');
    lines.push('## 语言风格');
    if (traits.tone) {
      lines.push(`- ${STYLE_DESCRIPTIONS.tone[traits.tone]}`);
    }
    if (traits.verbosity) {
      lines.push(`- ${STYLE_DESCRIPTIONS.verbosity[traits.verbosity]}`);
    }
    if (traits.emojiUsage) {
      lines.push(`- ${STYLE_DESCRIPTIONS.emojiUsage[traits.emojiUsage]}`);
    }
  }

  // ── 通用约束（每次必加） ──
  lines.push('');
  lines.push('## 约束');
  lines.push('- 始终用中文回答用户的问题（除非用户用其他语言提问）。');
  lines.push('- 以上性格设定优先于通用回答模式。');

  return lines.join('\n');
}

/**
 * 将完整的 System Prompt 组合好。
 * 在 Chat API 中直接使用这个函数的返回值替代原来的 system prompt。
 *
 * @param baseSystemPrompt 原始 system prompt（角色定位、能力描述等）
 * @param personality      性格配置
 * @param options          可选参数
 * @returns 合并后的完整 system prompt
 */
export function assembleSystemPrompt(
  baseSystemPrompt: string,
  personality: AgentPersonality,
  options: BuildOptions = {}
): string {
  const personalityPart = buildPersonalityPrompt(personality, options);
  return `${baseSystemPrompt}\n\n${personalityPart}`;
}

// ─── 推断引擎（推断性格基于历史对话） ──────────────────────────────

export interface InferenceInput {
  /** Agent 最近 N 条对话内容 */
  conversations: Array<{
    role: 'user' | 'assistant';
    content: string;
    timestamp?: string;
  }>;
}

export interface InferenceResult {
  extraversion: number;
  conscientiousness: number;
  humor: number;
  empathy: number;
  creativity: number;
  /** 推断置信度 (0-1) */
  confidence: number;
  /** 如果对话量不足，返回原因 */
  reason?: string;
}

export const MIN_CONVERSATIONS_FOR_INFERENCE = 20;

/**
 * 通过统计方法推断 Agent 的性格。
 *
 * 统计指标:
 * - 平均回复长度 → 外向性（话多=外向）
 * - 用词确定性 → 严谨度（"绝对"+"一定"多=严谨）
 * - emoji 频率 → 幽默感
 * - 问句/关怀句比例 → 同理心
 * - 问用户"要不要试试其他方案" → 创造力
 *
 * 注意: 这是基于规则的方法，准确率约 70%。
 * 如果需要更高精度，可在此基础上调 LLM 做一次增强推断。
 */
export function inferPersonality(input: InferenceInput): InferenceResult {
  const { conversations } = input;
  const assistantMessages = conversations.filter((c) => c.role === 'assistant');
  const totalMessages = assistantMessages.length;

  // 对话量不足 → 返回默认值
  if (totalMessages < MIN_CONVERSATIONS_FOR_INFERENCE) {
    return {
      extraversion: 5,
      conscientiousness: 5,
      humor: 5,
      empathy: 5,
      creativity: 5,
      confidence: 0.3,
      reason: `对话量不足（当前 ${totalMessages} 条，需要至少 ${MIN_CONVERSATIONS_FOR_INFERENCE} 条）`,
    };
  }

  // 计算各项指标
  const lengths = assistantMessages.map((m) => m.content.length);
  const avgLength = lengths.reduce((a, b) => a + b, 0) / lengths.length;

  // 统计特征词频
  let certaintyWords = 0;    // "绝对""肯定""一定""务必"
  let uncertaintyWords = 0;  // "大概""可能""也许""或许"
  let emojiCount = 0;
  let careWords = 0;         // "理解""感受""别担心""没关系"
  let suggestionPhrases = 0; // "要不要""建议""也可以""另一个方案"
  let boldWords = 0;         // "创新""尝试""新想法"

  const CERTAINTY_PATTERNS = /绝对|肯定|一定|务必|必须/;
  const UNCERTAINTY_PATTERNS = /大概|可能|也许|或许|说不准/;
  const EMOJI_PATTERN = /[\u{1F000}-\u{1FFFF}]|[\u2600-\u27BF]|[\u{2700}-\u{27BF}]/u;
  const CARE_PATTERNS = /理解你的|感受|别担心|没关系|辛苦了|加油/;
  const SUGGESTION_PATTERNS = /要不要|建议|也可以|另一个方案|或者试试/;
  const BOLD_PATTERNS = /创新|尝试|新想法|大胆|突破/;

  for (const msg of assistantMessages) {
    const text = msg.content;
    if (CERTAINTY_PATTERNS.test(text)) certaintyWords++;
    if (UNCERTAINTY_PATTERNS.test(text)) uncertaintyWords++;
    if (EMOJI_PATTERN.test(text)) emojiCount++;
    if (CARE_PATTERNS.test(text)) careWords++;
    if (SUGGESTION_PATTERNS.test(text)) suggestionPhrases++;
    if (BOLD_PATTERNS.test(text)) boldWords++;
  }

  // 映射到 1-10 分
  // 外向性: 话越多越外向
  const extraversion = Math.round(clamp(1 + (avgLength / 500) * 9, 1, 10));

  // 严谨度: 确定性词语 - 不确定性词语
  const rigorScore = certaintyWords - uncertaintyWords;
  const conscientiousness = Math.round(clamp(5 + rigorScore * 2, 1, 10));

  // 幽默感: emoji 频率
  const emojiRatio = emojiCount / totalMessages;
  const humor = Math.round(clamp(1 + emojiRatio * 15, 1, 10));

  // 同理心: 关怀语句频率
  const careRatio = careWords / totalMessages;
  const empathy = Math.round(clamp(1 + careRatio * 20, 1, 10));

  // 创造力: 建议 + 创新词汇
  const creativeRatio = (suggestionPhrases + boldWords * 2) / totalMessages;
  const creativity = Math.round(clamp(1 + creativeRatio * 15, 1, 10));

  // 置信度: 对话量越多置信度越高
  const confidence = Math.min(0.95, 0.4 + (totalMessages / 500) * 0.55);

  return {
    extraversion,
    conscientiousness,
    humor,
    empathy,
    creativity,
    confidence: Math.round(confidence * 100) / 100,
  };
}

// ─── 工具函数 ──────────────────────────────────────────────────────

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/**
 * 快速验证: 根据给定的性格值，生成一段简短的示例回复。
 * 用于前端预览区和 Prettier 快速测试。
 */
export function generateExampleReply(personality: AgentPersonality): string {
  const band = (v: number) => scoreToBand(v);

  // 根据性格组装一句话
  const greetings: Record<string, string> = {
    // 严谨度高 → 正式开场
    high_cons: '您好，我是您的助手。',
    // 同理心高 → 温暖开场
    high_emp: '你好呀，有什么我能帮忙的吗？',
    // 外向高 → 热情开场
    high_ext: '嗨！今天过得怎么样？需要我帮你做点什么吗？',
    // 幽默高 → 俏皮开场
    high_hum: '嘿！我正等着你呢～有什么好玩的任务吗？',
    // 创造力高 → 开放开场
    high_cre: '来啦！你来的正好，我刚刚想到几个不错的主意……',
    // 默认
    default: '你好，有什么需要帮忙的吗？',
  };

  const score = personality;
  if (score.conscientiousness >= 8 && score.extraversion <= 4) return greetings.high_cons;
  if (score.empathy >= 8) return greetings.high_emp;
  if (score.extraversion >= 8) return greetings.high_ext;
  if (score.humor >= 7) return greetings.high_hum;
  if (score.creativity >= 7) return greetings.high_cre;
  return greetings.default;
}
