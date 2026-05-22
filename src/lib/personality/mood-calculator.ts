/**
 * FeiControl — 心情计算服务
 *
 * 基于 Agent 的任务表现、交互频率、用户反馈计算当前心情
 */
import type { AgentMood } from './types';
import { getPersonalityDb } from './db';

interface TaskEvent {
  type: 'task_done' | 'task_fail' | 'user_praise' | 'user_criticism' | 'long_idle' | 'new_skill' | 'chat_active';
  timestamp: number;
}

/** 心情衰减时间表（分钟） */
const MOOD_DECAY: Record<AgentMood, number> = {
  happy:    120,  // 2小时后从开心降为平静
  excited:  90,   // 1.5小时后从兴奋降为开心
  calm:     240,  // 4小时后保持平静
  tired:    180,  // 3小时后从疲倦恢复
  sad:      120,  // 2小时后从难过恢复
  confused: 60,   // 1小时后从困惑恢复
};

/** 心情之间的转移矩阵（当前心情 × 事件 → 新心情） */
function applyEvent(current: AgentMood, event: TaskEvent): AgentMood {
  switch (event.type) {
    case 'task_done':
      if (current === 'tired' || current === 'confused') return 'happy';
      if (current === 'happy') return 'excited';
      return 'happy';

    case 'task_fail':
      if (current === 'happy' || current === 'excited') return 'confused';
      return 'sad';

    case 'user_praise':
      if (current === 'sad' || current === 'tired') return 'happy';
      if (current === 'happy' || current === 'calm') return 'excited';
      return 'happy';

    case 'user_criticism':
      if (current === 'excited' || current === 'happy') return 'confused';
      return 'sad';

    case 'long_idle':
      if (current === 'excited' || current === 'happy') return 'calm';
      if (current === 'calm') return 'tired';
      return current;

    case 'new_skill':
      return 'excited';

    case 'chat_active':
      if (current === 'tired') return 'calm';
      if (current === 'sad') return 'happy';
      return current;

    default:
      return current;
  }
}

/** 衰减逻辑：根据经过的时间逐步降低心情等级 */
function decayMood(current: AgentMood, minutesSinceUpdate: number): AgentMood {
  // 按强度顺序排列——高→低
  const decayChain: AgentMood[] = ['excited', 'happy', 'calm'];
  const currentIndex = decayChain.indexOf(current);
  if (currentIndex === -1) return current; // sad/confused/tired → 不变

  // 计算需要衰减几级
  let levelsToDecay = 0;
  for (let i = currentIndex; i < decayChain.length - 1; i++) {
    const threshold = MOOD_DECAY[decayChain[i]];
    if (minutesSinceUpdate >= threshold) {
      levelsToDecay++;
    } else {
      break;
    }
  }

  const targetIndex = Math.min(currentIndex + levelsToDecay, decayChain.length - 1);
  return decayChain[targetIndex];
}

/** 计算新心情 */
export function calculateMood(
  agentId: string,
  events: TaskEvent[],
  currentMood: AgentMood,
  lastUpdateTimestamp: number,
): { mood: AgentMood; reason: string } {
  let mood = currentMood;
  let reason = '';

  // 1. 衰减
  const minutesSinceUpdate = (Date.now() - lastUpdateTimestamp) / 60000;
  mood = decayMood(mood, minutesSinceUpdate);

  // 2. 应用事件（按时间顺序）
  const sortedEvents = [...events].sort((a, b) => a.timestamp - b.timestamp);
  for (const event of sortedEvents) {
    const newMood = applyEvent(mood, event);
    if (newMood !== mood) {
      mood = newMood;
      reason = eventToReason(event);
    }
  }

  // 3. 如果没有事件，但衰减改变了心情
  if (!reason && mood !== currentMood) {
    reason = '情绪自然平复';
  }
  if (!reason) {
    reason = '状态稳定';
  }

  return { mood, reason };
}

function eventToReason(event: TaskEvent): string {
  switch (event.type) {
    case 'task_done':       return '任务完成，很有成就感';
    case 'task_fail':       return '任务失败了，有点沮丧';
    case 'user_praise':     return '用户表扬了我！';
    case 'user_criticism':  return '收到用户反馈，需要改进';
    case 'long_idle':       return '有一阵子没有活动了';
    case 'new_skill':       return '学会了新技能！';
    case 'chat_active':     return '和用户聊得很开心';
    default:                return '';
  }
}

/** 获取 Agent 的最新 10 条活动记录并计算心情（外部触发） */
export async function recalculateMoodFromActivity(agentId: string): Promise<void> {
  const { getMood, updateMood } = await import('./repository');
  const db = getPersonalityDb();

  const current = getMood(agentId);
  const currentMood: AgentMood = current?.mood || 'calm';
  const lastUpdate = current?.updatedAt
    ? new Date(current.updatedAt).getTime()
    : Date.now();

  // 从 activity DB 读取最近活动
  const activities: TaskEvent[] = [];
  try {
    const rows = db.prepare(`
      SELECT type, timestamp FROM activities
      WHERE agent = ? AND timestamp >= datetime('now', '-1 day')
      ORDER BY timestamp DESC LIMIT 20
    `).all(agentId) as Array<{ type: string; timestamp: string }>;

    for (const row of rows) {
      const t = new Date(row.timestamp).getTime();
      switch (row.type) {
        case 'task':         activities.push({ type: 'task_done', timestamp: t }); break;
        case 'tool_call':    activities.push({ type: 'task_done', timestamp: t }); break;
        case 'message_sent': activities.push({ type: 'chat_active', timestamp: t }); break;
      }
    }
  } catch {
    // activities table might not exist
  }

  const result = calculateMood(agentId, activities, currentMood, lastUpdate);
  updateMood(agentId, result.mood, result.reason, 'auto');
}
