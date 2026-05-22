/**
 * FeiControl — Agent 人格化系统 · 类型定义
 */

/** 五维性格 + 三个说话风格 */
export interface AgentPersonality {
  agentId: string;
  extraversion: number;        // 外向 1-10
  conscientiousness: number;   // 严谨 1-10
  humor: number;               // 幽默 1-10
  empathy: number;             // 同理心 1-10
  creativity: number;          // 创造力 1-10
  isAutoInferred: boolean;
  customTraits?: {
    tone?: 'formal' | 'casual' | 'warm';
    verbosity?: 'brief' | 'normal' | 'detailed';
    emojiUsage?: 'never' | 'occasional' | 'frequent';
  };
}

/** 五维性格推断输入 */
export interface InferenceInput {
  conversations: Array<{
    role: 'user' | 'assistant';
    content: string;
  }>;
}

/** 五维性格推断结果 */
export interface InferenceResult {
  extraversion: number;
  conscientiousness: number;
  humor: number;
  empathy: number;
  creativity: number;
  confidence: number;
}

/** Agent 心情 */
export type AgentMood = 'happy' | 'calm' | 'tired' | 'sad' | 'confused' | 'excited';

/** 心情记录 */
export interface MoodEntry {
  agentId: string;
  mood: AgentMood;
  reason: string;
  updatedAt: string;
}

/** 心情历史条目 */
export interface MoodHistoryEntry {
  id: number;
  agentId: string;
  mood: AgentMood;
  trigger: string;
  createdAt: string;
}

/** 主动发起设置 */
export interface InitiativeSettings {
  agentId: string;
  enabled: boolean;
  frequency: 'high' | 'medium' | 'low' | 'important_only';
}

// ─── Sprint 1: 成长 RPG 系统 ─────────────────────────────────────────

/** Agent 等级状态 */
export interface AgentLevel {
  agentId: string;
  level: number;
  xp: number;
  xpToNext: number;
  skillPoints: number;
  updatedAt: string;
}

/** 技能项 */
export interface AgentSkill {
  id: string;
  agentId: string;
  skillKey: SkillKey;
  level: number;        // 0 = 未解锁
  unlockedAt: string | null;
}

/** 技能标识 */
export type SkillKey =
  | 'quick_task'
  | 'batch_mode'
  | 'auto_retry'
  | 'idea_gen'
  | 'cross_domain'
  | 'story_telling'
  | 'empathy_boost'
  | 'initiative'
  | 'teamwork'
  | 'memory_boost'
  | 'pattern_recog'
  | 'self_improve';

/** 技能定义（元数据，不存 DB） */
export interface SkillDefinition {
  key: SkillKey;
  tree: 'efficiency' | 'creativity' | 'social' | 'learning';
  name: string;
  description: string;
  effectPerLevel: string;
  costPerLevel: number;   // 每级消耗技能点
  maxLevel: number;
}

/** 所有技能元数据 */
export const SKILL_DEFINITIONS: SkillDefinition[] = [
  { key: 'quick_task',    tree: 'efficiency',  name: '快速执行',   description: '缩短任务处理时间',  effectPerLevel: '任务完成时间 -5%', costPerLevel: 2, maxLevel: 3 },
  { key: 'batch_mode',   tree: 'efficiency',  name: '批量处理',   description: '同时处理更多任务',  effectPerLevel: '同时处理任务 +1', costPerLevel: 3, maxLevel: 2 },
  { key: 'auto_retry',   tree: 'efficiency',  name: '自动重试',   description: '失败自动重试',      effectPerLevel: '失败自动重试 1 次', costPerLevel: 2, maxLevel: 1 },
  { key: 'idea_gen',     tree: 'creativity',  name: '创意生成',   description: '提供额外创意观点',  effectPerLevel: '每次对话额外观点', costPerLevel: 2, maxLevel: 3 },
  { key: 'cross_domain', tree: 'creativity',  name: '跨域联想',   description: '跨领域知识连接',    effectPerLevel: '跨领域知识联想', costPerLevel: 3, maxLevel: 2 },
  { key: 'story_telling',tree: 'creativity',  name: '故事讲述',   description: '用故事解释概念',    effectPerLevel: '故事化解释', costPerLevel: 2, maxLevel: 2 },
  { key: 'empathy_boost',tree: 'social',      name: '同理心增强', description: '加速心情恢复',      effectPerLevel: '心情恢复速度 +20%', costPerLevel: 2, maxLevel: 3 },
  { key: 'initiative',   tree: 'social',      name: '主动发起',   description: '提高主动发起概率',  effectPerLevel: '主动发起概率 +10%', costPerLevel: 3, maxLevel: 3 },
  { key: 'teamwork',     tree: 'social',      name: '团队协作',   description: '提升协作效率',      effectPerLevel: '多 Agent 协作效率 +15%', costPerLevel: 3, maxLevel: 2 },
  { key: 'memory_boost', tree: 'learning',    name: '记忆增强',   description: '提高长期记忆保留率', effectPerLevel: '记忆保留率 +10%', costPerLevel: 2, maxLevel: 3 },
  { key: 'pattern_recog',tree: 'learning',    name: '模式识别',   description: '识别用户习惯',      effectPerLevel: '识别用户习惯模式', costPerLevel: 3, maxLevel: 2 },
  { key: 'self_improve', tree: 'learning',    name: '自我改进',   description: '降低错误率',        effectPerLevel: '错误率 -5%', costPerLevel: 3, maxLevel: 2 },
];

/** 成就条目 */
export interface AgentAchievement {
  id: string;
  agentId: string;
  achievementKey: AchievementKey;
  unlockedAt: string;
}

/** 成就标识 */
export type AchievementKey =
  | 'first_task'
  | 'hundred_tasks'
  | 'thousand_messages'
  | 'level_five'
  | 'all_skills'
  | 'happy_day'
  | 'innovator'
  | 'champion';

/** 成就定义 */
export interface AchievementDefinition {
  key: AchievementKey;
  name: string;
  description: string;
  condition: string;
  reward: string;        // 描述性奖励文本
  rewardXp?: number;     // 奖励经验
  rewardSkillPoints?: number;
}

export const ACHIEVEMENT_DEFINITIONS: AchievementDefinition[] = [
  { key: 'first_task',        name: '初心者',   description: '完成第一个任务',           condition: '完成任务数 ≥ 1',          reward: '100 XP', rewardXp: 100 },
  { key: 'hundred_tasks',     name: '勤勉者',   description: '完成 100 个任务',         condition: '完成任务数 ≥ 100',        reward: '称号 + 500 XP', rewardXp: 500 },
  { key: 'thousand_messages',  name: '沟通者',   description: '发送 1000 条消息',        condition: '消息数 ≥ 1000',          reward: '称号 + 1 技能点', rewardSkillPoints: 1 },
  { key: 'level_five',        name: '升级狂',   description: '达到 5 级',               condition: '等级 ≥ 5',               reward: '称号' },
  { key: 'all_skills',        name: '全能的',   description: '解锁所有技能',             condition: '所有技能 ≥ 1 级',         reward: '称号 + 3 技能点', rewardSkillPoints: 3 },
  { key: 'happy_day',         name: '开心果',   description: '心情「开心」累计 24 小时', condition: '开心累计 24h',             reward: '称号' },
  { key: 'innovator',         name: '创新者',   description: '被采纳 50 次主动建议',     condition: '主动建议采纳数 ≥ 50',     reward: '称号 + 500 XP', rewardXp: 500 },
  { key: 'champion',          name: '冠军',     description: '达到 10 级',              condition: '等级 ≥ 10',              reward: '称号 + 自定义头像框' },
];
