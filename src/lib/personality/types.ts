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
