# Sprint 0 — Agent 人格化系统 · 任务拆解

> 基于现有代码结构（Next.js App Router + SQLite + Node.js Runtime）
> 总工期：8 个工作日 | 难度：⭐⭐ 低

---

## 开发任务一览

```
Day 1 ──── Day 2 ──── Day 3 ──── Day 4 ──── Day 5 ──── Day 6 ──── Day 7 ──── Day 8
  │          │          │          │          │          │          │          │
  DB设计     Prompt    性格Tab     心情模块    主动发起    后端集成    前端集成    测试上线
  +API     引擎       UI         API+UI    API+UI    +测试      +E2E
```

---

## Day 1 — 数据库设计 + 基础 API（1人·4h）

### 任务 1.1: 数据库 Migration（1h）
新增 3 张表：

```sql
-- 1. 性格档案表
CREATE TABLE agent_personalities (
  agent_id         TEXT PRIMARY KEY,
  extraversion     INTEGER NOT NULL DEFAULT 5 CHECK(extraversion BETWEEN 1 AND 10),
  conscientiousness INTEGER NOT NULL DEFAULT 5 CHECK(conscientiousness BETWEEN 1 AND 10),
  humor            INTEGER NOT NULL DEFAULT 5 CHECK(humor BETWEEN 1 AND 10),
  empathy          INTEGER NOT NULL DEFAULT 5 CHECK(empathy BETWEEN 1 AND 10),
  creativity       INTEGER NOT NULL DEFAULT 5 CHECK(creativity BETWEEN 1 AND 10),
  is_auto_inferred BOOLEAN NOT NULL DEFAULT 0,
  tone             TEXT DEFAULT NULL CHECK(tone IN ('formal','casual','warm',NULL)),
  verbosity        TEXT DEFAULT NULL CHECK(verbosity IN ('brief','normal','detailed',NULL)),
  emoji_usage      TEXT DEFAULT NULL CHECK(emoji_usage IN ('never','occasional','frequent',NULL)),
  updated_at       TEXT NOT NULL DEFAULT (datetime('now'))
);

-- 2. 心情表
CREATE TABLE agent_moods (
  agent_id    TEXT PRIMARY KEY,
  mood        TEXT NOT NULL CHECK(mood IN ('happy','calm','tired','sad','confused','excited')),
  reason      TEXT NOT NULL DEFAULT '',
  updated_at  TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (agent_id) REFERENCES agent_personalities(agent_id)
);

-- 3. 心情历史表
CREATE TABLE agent_mood_history (
  id        INTEGER PRIMARY KEY AUTOINCREMENT,
  agent_id  TEXT NOT NULL,
  mood      TEXT NOT NULL,
  trigger   TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (agent_id) REFERENCES agent_personalities(agent_id)
);
CREATE INDEX idx_mood_history_agent_time ON agent_mood_history(agent_id, created_at DESC);
```

**产出文件：** `src/lib/migrations/002_personality.sql`

### 任务 1.2: 性格档案 CRUD API（2h）

| 端点 | 方法 | 说明 |
|------|------|------|
| `/api/personality?agentId=X` | GET | 获取 Agent 性格 |
| `/api/personality` | PUT | 更新性格（手动调整） |
| `/api/personality/infer` | POST | 自动推断性格 |

**产出文件：**
- `src/lib/personality/types.ts` — 类型定义
- `src/lib/personality/repository.ts` — DB 操作
- `src/app/api/personality/route.ts` — API 端点

### 任务 1.3: 心情基础 API（1h）

| 端点 | 方法 | 说明 |
|------|------|------|
| `/api/personality/mood?agentId=X` | GET | 获取当前心情 |
| `/api/personality/mood/history?agentId=X` | GET | 获取心情历史 |
| POST `/api/personality/mood/respond?agentId=X` | POST | 用户回应心情 |

---

## Day 2 — Prompt 注入引擎（1人·4h）

### 任务 2.1: 维度→Prompt 映射（1h）
```typescript
// src/lib/personality/prompt-builder.ts
// 核心函数: buildPersonalityPrompt(personality: AgentPersonality) => string
// 将 5 个性格维度 + 3 个说话风格 → 自然语言描述
```
参见下文 POC 代码。

### 任务 2.2: Chat API 注入改造（1.5h）
```typescript
// 修改 src/app/api/chat/route.ts
// 在发送消息到 LLM 前，读取 agent_personalities 表
// 调用 promptBuilder 生成 personality segment
// 注入到 system prompt / 消息前置
```

### 任务 2.3: 推断引擎（1.5h）
```typescript
// src/lib/personality/inferrer.ts
// 1. 读取 Agent 最近 50 条聊天记录 (workspace/chat/*.json)
// 2. 统计: 平均回复长度 / 问句比例 / emoji 频率 / 结构标记
// 3. 映射到 5 维性格
// 4. (可选) 调用 LLM 做一次增强推断
```

---

## Day 3 — 性格档案 UI（1人·4h）

### 任务 3.1: 性格 Tab 组件（2h）
```typescript
// src/components/personality/PersonalityTab.tsx
// 位置: Agent 详情页新增 Tab
// 包含: 5 个滑块 + 3 个下拉选择 + 预设模板
```

### 任务 3.2: 滑块组件（1h）
```typescript
// src/components/personality/DimensionSlider.tsx
// 视觉: 带圆形拖拽手柄 + 渐变条 + 数值显示
// 行为: 拖拽时实时预览性格描述
```

### 任务 3.3: 预设模板选择器（1h）
```typescript
// src/components/personality/PresetSelector.tsx
// 4 个预制模板卡片 + "应用"按钮 + 预览
```

---

## Day 4 — 心情系统 API + UI（1人·4h）

### 任务 4.1: 心情计算服务（1.5h）
```typescript
// src/lib/personality/mood-calculator.ts
// 基于最近任务表现计算心情
// 被以下调用：任务完成事件 / 定时器 (每5分钟)
```

### 任务 4.2: 心情 UI 组件（1.5h）
```typescript
// src/components/personality/MoodBadge.tsx
// 显示在: Agent 卡片、Chat 头像旁、详情页头部
// 交互: 悬停显示原因、点击回应emoji
```

### 任务 4.3: SSE 心情推送（1h）
```typescript
// 修改 src/app/api/events/route.ts
// 新增 mood:{agentId} 频道
// 心情变化时推送事件
```

---

## Day 5 — 主动发起系统（1人·4h）

### 任务 5.1: 规则引擎（2h）
```typescript
// src/lib/personality/initiative-engine.ts
// 检查 5 种触发条件 + 冷却时间
// 被定时器 (每分钟) 调用
```

### 任务 5.2: 主动发起 API（0.5h）
```typescript
// PUT /api/personality/initiative-settings
// GET  /api/personality/initiative-settings?agentId=X
```

### 任务 5.3: 设置 UI（1.5h）
```typescript
// 在 Agent 详情页新增"主动发起"配置区域
// 开关 + 频率选择 (高/中/低/仅重要)
```

---

## Day 6 — 后端集成 + 单元测试（1人·4h）

### 任务 6.1: 与现有 Agent 状态系统集成（1.5h）
```typescript
// 在 agent-skills.ts / agents route 中集成性格和心情数据
// Agent 详情页 API 返回: { personlaity, mood, growth }
```

### 任务 6.2: 单元测试（1.5h）
```typescript
// src/lib/personality/__tests__/prompt-builder.test.ts
// src/lib/personality/__tests__/inferrer.test.ts
// src/lib/personality/__tests__/mood-calculator.test.ts
// > 20 个测试用例覆盖边界值
```

### 任务 6.3: 集成测试（1h）
```typescript
// API 端到端测试: 创建 → 修改 → 查询 → 删除
```

---

## Day 7 — 前端集成 + E2E（1人·4h）

### 任务 7.1: Agent 详情页集成（1.5h）
```typescript
// 在 Agent 详情页/页面新增 Tab 导航
// 注入性格 Tab + 成长 Tab (占位)
// 修改 Agent 卡片显示心情 emoji
```

### 任务 7.2: Chat UI 集成（1h）
```typescript
// 在 Chat 页面 Agent 头像旁显示心情badge
// 对话中显示性格驱动的回复风格
```

### 任务 7.3: E2E 测试（1.5h）
```typescript
// Playwright/Cypress 测试用例:
// 1. 访问 Agent 详情页 → 点性格 Tab → 拖动滑块 → 保存
// 2. 打开聊天 → 发送消息 → 看到性格化回复
// 3. 悬停心情图标 → 看到原因提示
```

---

## Day 8 — 测试 + 灰度发布（1人·4h）

### 任务 8.1: 性能测试（1h）
- 测试 7 Agent 下性格加载 < 50ms
- 测试 50 Agent 下性格加载 < 200ms
- 测试 1000 条聊天记录的推断 < 3s

### 任务 8.2: i18n 翻译（1h）
- 添加 30+ 词条到中英文翻译文件
- 性格维度描述、心情描述、模板名称

### 任务 8.3: 灰度发布（2h）
1. 合并到 main → 部署 preview
2. 内部测试 → 修复 bug
3. 功能默认关闭 (feature flag) → 逐步放开 10% → 50% → 100%

---

## 📦 产出文件清单

```
新增:
  src/lib/personality/types.ts              # 类型定义
  src/lib/personality/repository.ts          # DB 操作
  src/lib/personality/prompt-builder.ts      # Prompt 生成引擎
  src/lib/personality/mood-calculator.ts     # 心情计算
  src/lib/personality/inferrer.ts            # 性格推断
  src/lib/personality/initiative-engine.ts   # 主动发起
  src/lib/personality/personality.db.ts      # DB 连接 (从 db.ts 扩展)
  src/lib/migrations/002_personality.sql     # Migration
  src/app/api/personality/route.ts           # 性格 CRUD API
  src/app/api/personality/infer/route.ts     # 推断 API
  src/app/api/personality/mood/route.ts      # 心情 API
  src/components/personality/PersonalityTab.tsx
  src/components/personality/DimensionSlider.tsx
  src/components/personality/PresetSelector.tsx
  src/components/personality/MoodBadge.tsx
  
修改:
  src/app/api/chat/route.ts                  # 注入 personality prompt
  src/app/api/agents/route.ts                # 返回性格+心情数据
  src/app/(dashboard)/agents/page.tsx         # 新增 Tab
  src/components/AgentOrganigrama.tsx         # 显示心情

测试:
  src/lib/personality/__tests__/*.test.ts    # 20+ 测试用例
```

## 🔗 依赖链

```
migrations/002_personality.sql
  ↓
repository.ts (读 DB)
  ↓
prompt-builder.ts ← inferrer.ts → mood-calculator.ts → initiative-engine.ts
  ↓                  ↓                                    ↓
chat/route.ts      PersonalityTab.tsx                  InitiativeSetting UI
                   (前端)
```
