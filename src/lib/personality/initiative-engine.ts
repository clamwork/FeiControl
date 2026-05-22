/**
 * FeiControl — 主动发起引擎
 *
 * 检查各种条件，决定 Agent 是否需要主动向用户发起对话
 */
import type { InitiativeSettings } from './types';
import { getAllEnabledInitiativeSettings, getPersonality } from './repository';
import { getPersonalityDb } from './db';

export type InitiativeTrigger =
  | 'long_idle'
  | 'task_status_change'
  | 'important_event'
  | 'mood_change'
  | 'knowledge_update';

export interface InitiativeAction {
  agentId: string;
  trigger: InitiativeTrigger;
  message: string;
  priority: number;   // 0-100, higher = more urgent
  cooldownMinutes: number;
}

/** 触发条件配置 */
const TRIGGER_CONFIG: Record<InitiativeTrigger, {
  description: string;
  defaultCooldown: number;  // 分钟
}> = {
  long_idle: {
    description: '长时间无对话（> 阈值时间）',
    defaultCooldown: 60,
  },
  task_status_change: {
    description: '任务状态变更时主动报告',
    defaultCooldown: 5,
  },
  important_event: {
    description: '重要事件（提醒、通知等）',
    defaultCooldown: 0,  // 不限制
  },
  mood_change: {
    description: '心情变化时主动表达',
    defaultCooldown: 120,
  },
  knowledge_update: {
    description: '学会新技能/知识更新时',
    defaultCooldown: 30,
  },
};

const FREQUENCY_MULTIPLIER: Record<string, number> = {
  high: 0.5,
  medium: 1.0,
  low: 2.0,
  important_only: 999,
};

// 内存中的冷却标记
const cooldowns = new Map<string, number>();

function isOnCooldown(agentId: string, trigger: InitiativeTrigger): boolean {
  const key = `${agentId}:${trigger}`;
  const until = cooldowns.get(key);
  if (!until) return false;
  if (Date.now() > until) {
    cooldowns.delete(key);
    return false;
  }
  return true;
}

function setCooldown(agentId: string, trigger: InitiativeTrigger, minutes: number): void {
  const key = `${agentId}:${trigger}`;
  cooldowns.set(key, Date.now() + minutes * 60 * 1000);
}

/**
 * 检查是否应该发起对话
 * 调用频率: 每分钟一次
 */
export function checkInitiative(agentId: string): InitiativeAction | null {
  const settings = getAllEnabledInitiativeSettings().find(s => s.agentId === agentId);
  if (!settings || !settings.enabled) return null;

  const freqMult = FREQUENCY_MULTIPLIER[settings.frequency] ?? 1.0;

  // 检查每种触发条件
  for (const [triggerStr, config] of Object.entries(TRIGGER_CONFIG)) {
    const trigger = triggerStr as InitiativeTrigger;
    const cooldown = Math.round(config.defaultCooldown * freqMult);

    if (isOnCooldown(agentId, trigger)) continue;

    // 条件判断
    switch (trigger) {
      case 'long_idle': {
        const idleMinutes = getIdleMinutes(agentId);
        const threshold = settings.frequency === 'high' ? 30
          : settings.frequency === 'medium' ? 120
          : settings.frequency === 'low' ? 480
          : 9999; // important_only
        if (idleMinutes >= threshold) {
          setCooldown(agentId, trigger, cooldown);
          return {
            agentId,
            trigger,
            message: `👋 已经${Math.round(idleMinutes)}分钟没有任务了，需要我帮忙做点什么吗？`,
            priority: 30,
            cooldownMinutes: cooldown,
          };
        }
        break;
      }

      case 'mood_change': {
        const personality = getPersonality(agentId);
        // 外向型 Agent 更愿意表达心情
        if (personality.extraversion < 5) break;
        setCooldown(agentId, trigger, cooldown);
        return {
          agentId,
          trigger,
          message: `💭 今天心情有些变化，想聊聊吗？`,
          priority: 20,
          cooldownMinutes: cooldown,
        };
      }

      default:
        break;
    }
  }

  return null;
}

/**
 * 获取 Agent 空闲时间（分钟）
 */
function getIdleMinutes(agentId: string): number {
  try {
    const db = getPersonalityDb();
    const row = db.prepare(
      `SELECT timestamp FROM activities WHERE agent = ? ORDER BY timestamp DESC LIMIT 1`
    ).get(agentId) as { timestamp: string } | undefined;

    if (!row) return 9999; // 从无活动

    const lastActive = new Date(row.timestamp).getTime();
    return (Date.now() - lastActive) / 60000;
  } catch {
    return 0;
  }
}

/**
 * 检查所有已启用的 Agent 的主动发起
 * 返回所有需要发起的动作列表，按优先级排序
 */
export function checkAllAgents(): InitiativeAction[] {
  const settings = getAllEnabledInitiativeSettings();
  const actions: InitiativeAction[] = [];

  for (const s of settings) {
    const action = checkInitiative(s.agentId);
    if (action) actions.push(action);
  }

  return actions.sort((a, b) => b.priority - a.priority);
}
