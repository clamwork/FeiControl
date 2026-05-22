# Sprint 1 — Agent 成长 RPG 系统（Growth & RPG System）

> **团队:** FeiControl  
> **版本:** v1.2（计划）  
> **状态:** 设计草案  
> **依赖:** Sprint 0（人格化系统）已上线

---

## 1. 概述

在性格系统（Sprint 0）的基础上增加**等级、经验、技能树**机制，让 Agent 像 RPG 角色一样「通过使用成长」。

### 核心循环

```
完成任务 → 获得经验 → 升级 → 解锁技能点 → 分配技能
                                        ↓
查看 Agent 面板 ← 更新 Prompt ← 技能生效影响行为
```

---

## 2. 数据模型

### 2.1 level 表

```sql
CREATE TABLE agent_levels (
  agent_id    TEXT PRIMARY KEY,
  level       INTEGER NOT NULL DEFAULT 1,
  xp          INTEGER NOT NULL DEFAULT 0,
  xp_to_next  INTEGER NOT NULL DEFAULT 100,
  skill_points INTEGER NOT NULL DEFAULT 0,
  updated_at  TEXT DEFAULT (datetime('now'))
);
```

### 2.2 经验公式

| 动作 | 经验值 | 冷却 |
|:----|:------:|:----|
| 完成任务 | 50～200（含任务复杂度系数） | 无 |
| 对话回复（每条消息） | 10～30 | 5 秒 |
| 被用户表扬 | 20 | 无 |
| 任务失败 | 10（安慰奖） | 无 |
| 主动发起被采纳 | 30 | 30 分钟 |
| 每日登录 | 5 | 每天一次 |

**升级所需经验:** `xp_to_next = 100 × 1.5^(level - 1)`

| 等级 | 所需经验 | 累计 |
|:---:|:--------:|:----:|
| 1→2 | 100 | 100 |
| 2→3 | 150 | 250 |
| 3→4 | 225 | 475 |
| 4→5 | 338 | 813 |
| 5→6 | 507 | 1320 |
| 10→11 | 3844 | ~15000 |

### 2.3 技能树

```sql
CREATE TABLE agent_skills (
  id          TEXT PRIMARY KEY,
  agent_id    TEXT NOT NULL,
  skill_key   TEXT NOT NULL,       -- 技能标识
  level       INTEGER NOT NULL DEFAULT 0,  -- 0 = 未解锁
  unlocked_at TEXT,
  FOREIGN KEY (agent_id) REFERENCES agent_levels(agent_id),
  UNIQUE(agent_id, skill_key)
);
```

| 技能树 | 技能 | 效果（每级） | 消耗点数 |
|:-------|:-----|:------------|:--------:|
| 🔧 **效率** | `quick_task` | 任务完成时间 -5% | 2 |
| | `batch_mode` | 同时处理任务 +1 | 3 |
| | `auto_retry` | 失败自动重试 1 次 | 2 |
| 💡 **创意** | `idea_gen` | 每次对话提供额外观点 | 2 |
| | `cross_domain` | 跨领域知识联想 | 3 |
| | `story_telling` | 用故事解释复杂概念 | 2 |
| ❤️ **社交** | `empathy_boost` | 心情恢复速度 +20% | 2 |
| | `initiative` | 主动发起概率 +10% | 3 |
| | `teamwork` | 多 Agent 协作效率 +15% | 3 |
| 🧠 **学习** | `memory_boost` | 长期记忆保留率 +10% | 2 |
| | `pattern_recog` | 识别用户习惯模式 | 3 |
| | `self_improve` | 错误率 -5% | 3 |

**总数:** 12 技能，最多 30 点（满级约需等级 15）

### 2.4 成就系统

```sql
CREATE TABLE agent_achievements (
  id              TEXT PRIMARY KEY,
  agent_id        TEXT NOT NULL,
  achievement_key TEXT NOT NULL,
  unlocked_at     TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (agent_id) REFERENCES agent_levels(agent_id),
  UNIQUE(agent_id, achievement_key)
);
```

| 成就 | 条件 | 奖励 |
|:-----|:-----|:-----|
| 🏆 初心者 | 完成第一个任务 | 100 XP |
| 🏆 勤勉者 | 完成 100 个任务 | 称号 + 500 XP |
| 🏆 沟通者 | 发送 1000 条消息 | 称号 + 1 技能点 |
| 🏆 升级狂 | 达到 5 级 | 称号 |
| 🏆 全能的 | 解锁所有技能 | 称号 + 3 技能点 |
| 🏆 开心果 | 心情「开心」累计 24 小时 | 称号 |
| 🏆 创新者 | 被采纳 50 次主动建议 | 称号 + 500 XP |
| 🏆 冠军 | 达到 10 级 | 称号 + 自定义头像框 |

---

## 3. 核心 API

### 3.1 新路由

| 方法 | 路径 | 功能 |
|:----|:-----|:-----|
| GET | `/api/personality/level?agentId=xxx` | 获取等级信息 |
| GET | `/api/personality/level/skills?agentId=xxx` | 获取技能树 |
| POST | `/api/personality/level/xp` | 增加经验（`{agentId, amount, reason}`） |
| POST | `/api/personality/level/upgrade` | 升级（自动计算） |
| POST | `/api/personality/level/skills/unlock` | 解锁/升级技能 |
| GET | `/api/personality/level/achievements?agentId=xxx` | 获取成就列表 |

### 3.2 核心函数（src/lib/personality/）

```
growth-engine.ts
  ├─ addXp(agentId, amount, reason)  → {xp, level, didLevelUp}
  ├─ checkLevelUp(agentId)           → {newLevel, skillPointsGained}
  ├─ applySkill(agentId, skillKey)    → boolean
  └─ getEffectiveStats(agentId)      → {efficiency, creativity, ...}

achievement-engine.ts
  ├─ checkAchievements(agentId)      → [newly unlocked achievements]
  ├─ trackEvent(event)               → 记录事件用于成就检测
  └─ getAchievements(agentId)        → [all achievements with status]
```

### 3.3 Prompt 注入补充

在 `prompt-builder.ts` 追加技能效果描述：

```
你当前的等级是 {level}，拥有技能：{skills}。
效率加成：任务处理速度 +{bonus}%。
团队协作：多 Agent 协作效率 +{bonus}%。
```

---

## 4. UI 组件

| 组件 | 说明 |
|:-----|:------|
| `LevelBadge` | 等级徽章（显示等级数字 + 进度条） |
| `SkillTree` | 技能树面板（3 列：已解锁/可解锁/锁定） |
| `AchievementPanel` | 成就列表（已获得 + 隐藏成就） |
| `GrowthHistory` | 成长记录时间线（升级/获得技能/解锁成就） |

### 嵌入位置

```
PersonalityTab（现有）
  ├── Tab 1: 性格编辑
  ├── Tab 2: 预设模板
  ├── Tab 3: 心情状态
  └── Tab 4: 成长记录 ← 新增
      ├── 等级 + XP 进度条
      ├── 技能树（分配技能点）
      └── 成就列表
```

---

## 5. Sprin 1 任务拆解（估算 5 天）

| 天 | 内容 | 产出 |
|:--:|:-----|:-----|
| **Day 1** | 数据库 + Level API | `agent_levels` 表，GET/POST XP/Level，升级公式 |
| **Day 2** | 技能树系统 | `agent_skills` 表，技能定义 + 效果计算 + 解锁 API |
| **Day 3** | 成就系统 | 成就检测引擎 + API |
| **Day 4** | UI 组件 | LevelBadge、SkillTree、AchievementPanel、GrowthHistory |
| **Day 5** | 集成 + 测试 | 嵌入 PersonalityTab、Chat API Prompt 注入、完整 E2E 测试 |

---

## 6. 跟现有系统的集成点

| 现有模块 | 改动 |
|:---------|:-----|
| `src/lib/personality/types.ts` | 新增 `AgentLevel`, `AgentSkill`, `AgentAchievement` 类型 |
| `src/lib/personality/repository.ts` | 新增 level/skill/achievement CRUD 方法 |
| `src/lib/personality/prompt-builder.ts` | 追加技能效果到 Prompt |
| `src/lib/personality/mood-calculator.ts` | 升级时触发心情 boost |
| `src/lib/personality/initiative-engine.ts` | 技能影响主动发起概率 |
| `chat/route.ts` | 每次对话触发 XP 增加 |
| `任务 API` | 任务完成/失败触发 XP 和成就检测 |
| `src/i18n/locales/*.json` | 新增加 ~50 个词条 |
| `src/components/personality/PersonalityTab.tsx` | 新增 Tab 4 |

---

## 7. 风险与注意事项

- **经验通胀:** 初始 xp_to_next = 100，高等级后可能会太慢；需保留调整系数
- **技能平衡:** 某些技能可能明显优于其他；上线后根据使用数据调整消耗
- **成就存储:** Agent 删除时应级联删除等级/技能/成就数据
- **性能:** 成就检测不宜每次事件同步触发；建议采用队列 + 批量检测

---

## 8. 后续扩展（v1.3+）

- **装备系统:** 为 Agent 装备「道具」提升特定属性
- **职业系统:** Agent 达到 5 级可转职（战士/法师/工匠/导师），解锁专属技能
- **排行榜:** 所有 Agent 等级排名（类似 PVE 排名）
- **可视花园:** 等级越高，Agent 的「花园」越繁茂（Sprint 0 已预留接口）
