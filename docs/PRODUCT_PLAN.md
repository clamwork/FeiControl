# FeiControl — 产品规划白皮书

> 版本: v1.0 | 最后更新: 2025-07-17
> "A cute mission control for your AI agents 💖"

---

## 📌 核心定位（一句话定义）

> **FeiControl 是你的 AI Agent 伴侣控制台——用一个漂亮的 UI 替你看一眼所有 Agent 们在做什么。**

始于 OpenClaw，但不局限于 OpenClaw。通过 Adapter 模式连接不同 Agent 生态（OpenClaw、Hermes Agent 等），让你在统一界面上看见、对话、管理所有 Agent。不是通用 AI 平台，不是 API 网关，不是编排引擎——它只是你最顺手的那块「副屏」。

### 什么是对的事情

| ✅ 做 | ❌ 不做 |
|-------|---------|
| 读取 Agent 文件系统（OpenClaw / Hermes 等），可视化呈现 | 不依赖任何外部 API 或云服务 |
| Adapter 模式支持多 Agent 后端 | 不做内置 Agent 运行时 |
| 通过本地 SQLite 存储自身的运行时数据 | 不做用户系统、不存用户数据 |
| 使用 SSE 推送实时状态 | 不做双向 WebSocket 或消息队列 |
| 插件机制扩展 UI 功能 | 不做工作流引擎或 Agent 编排 |
| PWA 离线可用 | 不做 SaaS 或多租户 |
| 个人单用户场景 | 不做多用户协作、RBAC、SSO |
| 好看 + 好玩（3D 办公室、樱花、主题） | 不做企业级严肃仪表盘 |

---

## 1. 产品愿景

### 一句话愿景

> 让每个 Agent 用户都有一个漂亮、顺手、随时看一眼就放心的统一控制台。

### 产品使命

FeiControl 只做三件事：
1. **看见** —— 跨 Agent 状态、活动、成本，一页纵览
2. **对话** —— 像聊天一样和任意 Agent 交互
3. **管理** —— 查看记忆、日志、配置，不用 SSH

### 为什么需要 FeiControl

| 场景 | 没有 FeiControl | 有 FeiControl |
|------|----------------|---------------|
| Agent 卡住了 | 不知道，几小时后才发现 | Dashboard 上红点闪烁，一眼看到 |
| 查看某个 Agent 的记忆 | SSH 进去 `cat ~/.openclaw/...` | 浏览器里直接浏览编辑 |
| 跟 Agent 说话 | 终端里 curl API | Chat 界面，流式响应 |
| 想知道今天花了多少钱 | 自己算 API 调用次数 × 价格 | 自动统计每日成本趋势图 |
| 管理定时任务 | crontab -e | 可视化 Cron 管理，带运行历史 |
| 同时用 OpenClaw + Hermes | 两个终端来回切 | 一个 Dashboard 全看见 |
| 看 3D 办公室 | ❌ | ✅ 樱花树下的 Agent 工位 |

### 产品哲学（7 条）

1. **Local First** — 数据主权在用户手中，所有文件都在本机，SQLite 只存运行时缓存
2. **Cute but Serious** — 界面可爱（樱花、表情符号），功能可靠（健康检查、错误处理、PWA）
3. **Zero Config** — `git clone && npm install && npm run dev` 就可用，自动检测 Agent
4. **Read-Only by Default** — 默认只读 Agent 文件，写操作需用户明确授权
5. **离线友好** — PWA Service Worker 缓存，断网也能看到最近状态
6. **单用户** — 不做多用户，不做团队协作，不做企业功能。保持简单
7. **Agent Neutral** — 不绑定任何 Agent 框架，通过 Adapter 平等对待每个后端

---

## 2. 用户画像与场景

### 唯一的目标用户

> **画像：OpenClaw 用户**

| 属性 | 描述 |
|------|------|
| 身份 | AI 爱好者、独立开发者、创客 |
| 技术背景 | 会用终端、懂 Node.js、有自己的 OpenClaw 实例 |
| Agent 数量 | 1 ~ 8 个（个人使用规模） |
| 运行环境 | 自己的电脑、VPS、或者 NAS |
| 使用习惯 | 每天看几次 Dashboard，偶尔跟 Agent 聊天、看看成本 |
| 核心诉求 | 方便 + 好看 + 省心 |

### 关键用户旅程

#### 🟢 首次使用

```
1. 下载安装 FeiControl
2. 设置 ADMIN_PASSWORD
3. 打开浏览器 → 登录
4. Dashboard 自动展示 OpenClaw 的所有 Agent
5. "哇，原来我的 Agent 长这样"
```

#### 🔴 日常工作

```
早晨：
  Dashboard 看昨晚 Agent 干了什么
  ⌛ 检查 Cron 任务执行情况

工作中：
  跟 Agent Chat 交流
  📊 查看今日成本趋势
  📝 浏览 Agent 的记忆文件

下班前：
  📅 看看日历上明天有什么任务
  📤 导出今日成本报表
  ✅ 安心关掉
```

#### 🟢 偶尔探索

```
🆕 安装了新 Agent：
  → 刷新 FeiControl → 自动出现新 Agent 卡片
  → 点击查看它的 SOUL.md / TOOLS.md
  → 在 3D Office 里看到新工位亮起

🔄 更新了 OpenClaw 配置：
  → FeiControl 自动适配（只是读取文件系统，无耦合）
```

---

## 3. 核心功能模块架构

### 功能树

```
FeiControl
├── 📊 Dashboard（仪表盘，首页）
│   ├── 系统健康状态（CPU / 内存 / 磁盘 / Uptime）
│   ├── Agent 概览（在线 / 总数）
│   ├── 实时活动流（SSE 推送 Agent 动态）
│   ├── 今日成本速览
│   ├── Cron 任务最近执行状态
│   └── 可拖拽小部件（6 种可选 + 自定义布局 + 重置）
│
├── 🤖 Agents（Agent 管理）
│   ├── Agent 列表（卡片视图）
│   │   ├── 在线 / 离线 / 忙碌状态指示器
│   │   ├── 名称 / 表情符号 / 颜色 / 模型 / 角色
│   │   ├── 最近活动时间
│   │   ├── 子 Agent 关系
│   │   └── 快捷操作（发送任务 / 查看日志）
│   ├── ClawTeam 远程团队
│   │   ├── 远程来源配置
│   │   └── 远程 Agent 状态同步
│   └── Agent 详情面板
│       ├── 基础信息卡
│       ├── 活动时间线
│       └── 关联文档
│
├── 💬 Chat（Agent 对话）
│   ├── 历史会话列表
│   ├── Agent 切换
│   ├── 消息输入（文本 + Markdown）
│   ├── 流式响应逐 token 展示
│   ├── 思考状态指示
│   └── 对话导出（Markdown / JSON）
│
├── 📅 Calendar（日历）
│   ├── 月视图 / 周视图 / 日视图
│   ├── 事件创建 / 编辑 / 删除
│   └── 事件拖拽
│
├── ⏰ Cron（定时任务）
│   ├── 任务列表（表达式 / 状态 / 最近运行）
│   ├── 创建 / 编辑 / 删除
│   ├── 运行历史
│   └── 手动触发
│
├── 💰 Costs（成本分析）
│   ├── 今日 → 本周 → 本月趋势
│   ├── 各 Agent 成本分布
│   ├── 预算设置与告警
│   └── 导出 CSV / JSON
│
├── 🏢 3D Office（3D 办公室）
│   ├── 等距场景 + 樱花树
│   ├── Agent 工位（在线发光 / 离线灰暗）
│   ├── 实时活动面板
│   └── 第一人称漫游
│
├── 📝 Files（文档管理）
│   ├── 文件树浏览器
│   ├── Markdown 编辑器（Monaco）
│   ├── Agent 记忆文件查看
│   ├── 文件预览
│   └── 全文搜索 + 高亮
│
├── 🔌 Plugins（插件管理）
│   ├── 已安装插件列表（启停 / 卸载）
│   ├── 插件安装（本地 / URL）
│   └── 插件热重载
│
├── 🔔 Notifications（通知中心）
│   ├── 通知列表（已读 / 未读）
│   └── 通知偏好
│
├── ⚙️ Settings（设置）
│   ├── 通用（语言 / 主题 / 快捷键）
│   ├── 安全（修改密码）
│   ├── 集成（ClawTeam 配置）
│   └── 备份（数据库导出 / 导入）
│
├── 📖 About（关于）
│   ├── 版本信息
│   └── 致谢 / 更新日志
│
└── 🔐 Auth（登录页）
    └── 密码登录
```

### 页面路由

| 路由 | 页面 | 优先级 | 状态 |
|------|------|--------|------|
| `/` | Dashboard | 🔴 P0 | ✅ v1.0 |
| `/agents` | Agent 列表 | 🔴 P0 | ✅ v1.0 |
| `/chat` | Agent 对话 | 🔴 P0 | ✅ v1.0 |
| `/calendar` | 日历 | 🟡 P1 | ✅ v1.0 |
| `/cron` | 定时任务 | 🟡 P1 | ✅ v1.0 |
| `/costs` | 成本分析 | 🟡 P1 | ✅ v1.0 |
| `/office` | 3D 办公室 | 🟢 P2 | ✅ v1.0 |
| `/files` | 文档管理 | 🟡 P1 | ✅ v1.0 |
| `/about` | 关于 | 🟢 P2 | ✅ v1.0 |
| `/settings` | 设置 | 🟡 P1 | ✅ v1.0 |
| `/plugins` | 插件管理 | 🟢 P2 | ✅ v1.0 |
| `/actions` | 操作历史 | 🟢 P2 | ✅ v1.0 |
| `/skills` | 技能管理 | 🟢 P2 | ✅ v1.0 |

> 不需要：用户管理、Web 终端、社交面板、工作流引擎

---

## 4. 技术架构

### 当前架构（v1.0）

```
┌─────────────────────────────────────┐
│         Browser (PWA)               │
├─────────────────────────────────────┤
│      Next.js 15 App Router           │
│  ┌────────┐ ┌────────┐ ┌──────────┐ │
│  │ RSC    │ │ Client │ │ API      │ │
│  │ (SSR)  │ │ (CSR)  │ │ Routes   │ │
│  └────────┘ └────────┘ └──────────┘ │
│  React 19 + Tailwind CSS v4          │
│  R3F (3D) + Recharts (Charts)        │
├─────────────────────────────────────┤
│  Data Layer                          │
│  ┌──────────────┐ ┌───────────────┐  │
│  │ SQLite       │ │ Agent         │  │
│  │ (运行时缓存)  │ │ Adapters      │  │
│  └──────────────┘ ├───────────────┤  │
│                   │OpenClawAdapter│  │
│                   │HermesAdapter  │  │
│                   │   (未来更多)   │  │
│                   └───────────────┘  │
├─────────────────────────────────────┤
│  Infra: Docker + PWA SW             │
└─────────────────────────────────────┘
```

### Agent Adapter 设计

每个 Agent 后端由一个 Adapter 封装，暴露统一接口：

```typescript
interface AgentAdapter {
  // 基本信息
  id: string
  name: string
  version: string
  detected: boolean  // 文件系统上是否存在

  // 读取接口
  getStatus(): Promise<AgentStatus>
  getSessions(): Promise<Session[]>
  getMemory(): Promise<Memory>
  getConfig(): Promise<Config>
  getLogs(): Promise<Log[]>
  getCosts(): Promise<Cost[]>
  getCronJobs(): Promise<CronJob[]>
  getWorkspaces(): Promise<Workspace[]>

  // 写入接口（需用户确认）
  sendMessage(msg: string): Promise<void>
  updateMemory(memory: Memory): Promise<void>
}

// 注册表
const ADAPTERS: AgentAdapter[] = [
  new OpenClawAdapter(),
  new HermesAdapter(),
]
```

| Adapter | 数据源 | 检测方式 |
|---------|--------|----------|
| `OpenClawAdapter` | `~/.openclaw/` 目录 | 检查 `.openclaw` 是否存在 |
| `HermesAdapter` | `~/.hermes/hermes-agent/config.yaml` + 工作目录 | 检查 `config.yaml` 和 `sessions/` |
| `AcpAdapter` | ACP 协议端点 | 配置 URL 后连接 |

> **Hermes Agent 已有 `hermes claw` 命令原生支持 OpenClaw 迁移，HermesClaw 社区项目也已桥接两者。FeiControl 在此基础上提供 UI 层面的统一管理。**

### 架构原则

| 原则 | 说明 |
|------|------|
| **无后端依赖** | 不需要数据库服务、消息队列、缓存服务。一个 Node.js 进程跑全部 |
| **文件系统只读** | 默认不修改 OpenClaw 的任何文件。写操作（编辑记忆、发送聊天）需用户主动触发 |
| **无外部 API** | 不调用任何外部服务。所有数据来自本地文件系统和 SQLite |
| **SSR 优先** | Dashboard、Agent 列表等页面用 Server Components 直接读文件系统渲染 |
| **CSR 补充** | Chat、3D Office 等交互密集页面用 Client Components |
| **SQLite 是缓存层** | 存储内部运行时数据（通知、Cron 历史、成本记录），不是 OpenClaw 数据的主存储 |

### 关键架构决策

| 决策 | 选择 | 理由 |
|------|------|------|
| 数据库 | SQLite (better-sqlite3) | 零配置，一个文件，不需要数据库服务 |
| 认证 | 密码 + HTTP-only Cookie (单用户) | 多用户是过度设计 |
| 实时通信 | SSE（Server-Sent Events） | 单向足够，不需要 WebSocket |
| 3D 引擎 | React Three Fiber | React 生态原生，声明式 3D |
| 插件系统 | Node.js require() + 权限声明 | 轻量，不引入沙箱复杂性 |
| 国际化 | 自建 Context (5 种语言) | 轻量无外部依赖 |
| 测试 | Vitest + React Testing Library | 快，配合 Vite 生态 |
| 样式 | Tailwind CSS v4 | 原子化，Tree-shaking |

### 不需要的技术

| ❌ 不会用 | 原因 |
|-----------|------|
| PostgreSQL / MongoDB | SQLite 已经够了 |
| Redis | 不需要缓存层和消息队列 |
| WebSocket | SSE 已覆盖实时推送需求 |
| NextAuth.js / Auth0 | 单用户密码登录足够 |
| Prisma ORM | better-sqlite3 直接操作更简单 |
| Docker Compose 多个服务 | 单容器就够了 |
| Kubernetes | 过度设计 |
| RabbitMQ / Kafka | 没有消息队列场景 |

---

## 5. 数据模型

### 实体关系

```
Agent（来自 OpenClaw 文件系统 → 只读映射）
├── id: string
├── name: string
├── emoji: string
├── color: string
├── model: string
├── status: online | offline | busy | error
├── role: string
├── workspace: string
├── lastActivity: datetime
└── subAgents: Agent[]（子 Agent 关系）

Session（本地 SQLite 缓存）
├── id: string (PK)
├── agentId: string
├── startTime: datetime
├── endTime: datetime?
├── messageCount: number
└── totalTokens: number

Message（本地 SQLite 缓存）
├── id: string (PK)
├── sessionId: string (FK → Session)
├── role: user | agent | system
├── content: text
├── tokens: number (仅 agent 回复)
├── cost: number (仅 agent 回复)
└── timestamp: datetime

CronJob（本地 SQLite）
├── id: string (PK)
├── name: string
├── expression: string
├── targetAgent: string
├── task: string
├── enabled: boolean
├── lastRun: datetime?
└── lastStatus: success | failed | never

CronRunHistory（本地 SQLite）
├── id: string (PK)
├── jobId: string (FK → CronJob)
├── startedAt: datetime
├── finishedAt: datetime?
├── status: running | success | failed
└── output: text?

Notification（本地 SQLite）
├── id: string (PK)
├── type: info | warning | error | success
├── title: string
├── content: text
├── read: boolean
├── source: string (agentId | system)
└── timestamp: datetime

CostRecord（本地 SQLite）
├── id: string (PK)
├── date: date
├── agentId: string
├── model: string
├── promptTokens: number
├── completionTokens: number
├── cost: number
└── source: string (chat | cron | api)

Plugin（本地 SQLite）
├── id: string (PK)
├── name: string
├── version: string
├── enabled: boolean
├── source: local | url
├── permissions: string[]
├── config: JSON?
└── installedAt: datetime
```

---

## 6. UI/UX 设计原则

### 品牌调性

| 维度 | 描述 |
|------|------|
| 语气 | **可爱 + 专业**。用 emoji 但不幼稚，信息明确但不冰冷 |
| 品牌色 | `#ef4444` (活力红) + `#f8fafc` (干净底) |
| 字体 | Inter（英文）+ 系统默认 CJK |
| 动效 | 克制的微交互动效（hover / click / transition） |

### 设计约定

```
布局：
  Dock（左侧 68px 导航）→ 移动端底部 Tab Bar
  TopBar（顶部 48px，标题 + 全局操作）
  Main（主内容区，响应式 padding）
  StatusBar（底部 32px，Web Vitals + 系统状态）

间距系统：4px 基准 → 4/8/12/16/20/24/32/48/64
圆角系统：8 (Dock) / 12 (卡片) / 16 (模态框)
阴影系统：sm / md / lg / xl
动画时长：150ms (hover) / 300ms (transition)
```

### 响应式断点

| 断点 | 宽度 | 布局变化 |
|------|------|----------|
| Mobile | < 640px | Dock → 底部 Tab，单列，简化信息 |
| Tablet | 640~1024px | Dock 保留，两列布局 |
| Desktop | > 1024px | 完整布局 |

### 交互原则

1. **即时反馈** — 任何操作 200ms 内给视觉反馈（loading / 动画）
2. **渐进披露** — 复杂功能逐步展示，不一次全铺开
3. **可撤销** — 支持撤销 / 确认对话框
4. **键盘可访问** — 快捷键导航 + 操作
5. **离线容错** — PWA 离线时展示缓存，恢复后自动刷新

### 暗色模式

CSS 变量驱动，所有页面同时支持亮暗切换。

```css
:root {
  --bg-primary: #ffffff;
  --bg-secondary: #f8fafc;
  --text-primary: #0f172a;
  --text-secondary: #64748b;
  --border: #e2e8f0;
  --accent: #ef4444;
}
.dark {
  --bg-primary: #0f172a;
  --bg-secondary: #1e293b;
  --text-primary: #f8fafc;
  --text-secondary: #94a3b8;
  --border: #334155;
  --accent: #f87171;
}
```

---

## 7. 安全架构

### 安全模型

```
Layer 1: 网络
  ├── HTTPS（反向代理 TLS）
  └── 防火墙限制端口

Layer 2: 认证
  ├── 单用户密码登录
  ├── HTTP-only + SameSite Cookie
  └── Rate Limiting（登录: 5次/15分钟）

Layer 3: API 保护
  ├── middleware 路由守卫
  ├── 输入校验（Zod）
  └── 终端命令白名单

Layer 4: 数据安全
  ├── SQLite 文件权限 (600)
  ├── Cookie: httpOnly + sameSite:lax + secure
  └── .env.local 不提交

Layer 5: 插件安全
  ├── manifest.json 声明权限
  ├── 运行超时
  └── 用户确认后加载
```

### 不需要的安全功能

| ❌ 不做 | 原因 |
|---------|------|
| 2FA | 单用户场景，自己用电脑就够了 |
| RBAC | 单用户，不需要角色 |
| SSO / OAuth | 不需要外部身份源 |
| 审计日志 | 自己用自己看，不需要记录操作 |
| WAF | 个人使用不需要 Web 应用防火墙 |

---

## 8. 产品迭代路线图

### 版本策略

```
v1.x.x — 伴侣控制台，支持多 Agent 后端
  发布节奏：每 2~4 周一个功能版本
  不需要大版本升级（v2.0 并无必要）
```

### Phase 5: 品质打磨 + 多 Agent 互通（v1.0 → v1.2）

#### Sprint 5.1: 质量基础设施（v1.1.0 — 预计 2 周）

> 目标：让 FeiControl 真正"稳"下来

| 优先级 | 任务 | 说明 | 验收标准 |
|--------|------|------|----------|
| 🔴 P0 | Playwright E2E 测试框架 | 安装 Playwright + CI 配置 | 覆盖核心流程 |
| 🔴 P0 | E2E: 登录流程 | 登录页测试 | ✅ 成功 / ❌ 失败 |
| 🔴 P0 | E2E: Dashboard 渲染 | 数据加载测试 | ✅ 显示 Agent 概览 |
| 🔴 P0 | E2E: Agent 列表 | 卡片渲染 | ✅ 至少显示 1 个 Agent |
| 🔴 P0 | E2E: Chat 发送消息 | 对话交互 | ✅ 发送 / ✅ 接收 / ❌ 错误 |
| 🔴 P0 | E2E: Cron CRUD | 任务增删改查 | ✅ 完整 CRUD |
| 🔴 P0 | PWA 移动端适配 | 触控优化 + 底部导航 | ✅ 触控友好 |
| 🔴 P0 | Lighthouse CI | 性能基线 | ✅ Performance ≥ 90 |
| 🟡 P1 | E2E: 文件浏览器 | 导航 + 预览 | ✅ 文件操作 |
| 🟡 P1 | 图片优化 | next/image + WebP | ✅ 体积减少 50% |
| 🟢 P2 | E2E: 3D Office | 场景加载 | ✅ 渲染正常 |

#### Sprint 5.2: Hermes Agent Adapter（v1.2.0 — 预计 3 周）

> 目标：FeiControl 成为首个同时支持 OpenClaw + Hermes Agent 的伴侣控制台

| 优先级 | 任务 | 说明 | 验收标准 |
|--------|------|------|----------|
| 🔴 P0 | HermesAdapter 核心实现 | 读取 config.yaml / sessions / memory | ✅ 成功检测 Hermes Agent |
| 🔴 P0 | Dashboard 多 Agent 视图 | 同时显示 OpenClaw + Hermes | ✅ 每个 Agent 独立卡片 |
| 🔴 P0 | Chat 支持后端切换 | 下拉选择 OpenClaw / Hermes | ✅ 消息路由正确 |
| 🟡 P1 | Hermes 成本追踪 | 解析模型调用记录汇总成本 | ✅ 每日成本趋势正确 |
| 🟡 P1 | Hermes 文件浏览器 | 查看 Hermes Agent 的工作目录 | ✅ 目录结构准确 |
| 🟡 P1 | Hermes Cron 管理 | 可视化任务编排 | ✅ 任务状态正确 |
| 🟢 P2 | ACP 协议支持 | 通过 ACP 连接任意兼容 Agent | ✅ 基础通信可用 |

#### Sprint 5.3: 插件生态（v1.3.0 — 预计 2 周）

| 优先级 | 任务 | 说明 | 验收标准 |
|--------|------|------|----------|
| 🟡 P1 | 插件商店 UI | 浏览 / 搜索 / 安装 | ✅ 商店页面 / ✅ 一键安装 |
| 🟡 P1 | 插件发布文档 | 开发者指南 | ✅ 完整的 PLUGIN_DEV.md |
| 🟡 P1 | 数据看板增强 | 图表自定义 + PDF/PNG 导出 | ✅ 看板更灵活 |
| 🟢 P2 | 插件模板脚手架 | `npm create feicontrol-plugin` | ✅ 快速创建 |

### 不计划的功能

| ❌ 不做 | 理由 |
|---------|------|
| 多用户系统 | 个人控制台，不需要 |
| WebSocket 升级 | SSE 已经够了 |
| Web Terminal | 这不是终端模拟器 |
| 工作流引擎 | 任务编排交给 Agent 自己做 |
| 前后端分离 | 单体已经够好，分离带来不必要的复杂度 |
| 企业级功能（SSO/LDAP/K8s） | 不是目标用户群 |
| 商业模式（付费版） | 开源项目，不收费 |

### 长期维护方向

v1.2 之后，FeiControl 进入稳定维护 + 生态扩展模式：

| 方向 | 说明 |
|------|------|
| 🔧 **Agent 版本兼容** | 跟随 OpenClaw / Hermes 更新，确保新特性有对应展示 |
| 🧩 **Agent Adapter 生态** | 新增 Agent 后端的 Adapter，扩大兼容范围 |
| 🌐 **社区插件商店** | 用户提交自定义插件，丰富扩展能力 |
| 🔌 **ACP 协议兼容** | 支持 Agent Communication Protocol，对接更多 ACP 兼容 Agent |
| 📊 **体验持续优化** | 响应式、国际化、可访问性持续提升 |
| 🌐 **更多语言** | 社区贡献的 i18n 翻译 |
| 🎨 **主题社区** | 社区贡献的自定义主题 |
| 🔌 **插件生态** | 社区贡献的插件丰富化 |
| 🐛 **Bug 修复** | 用户反馈的稳定性和兼容性问题 |
| ⚡ **性能优化** | 持续降低加载时间和资源占用 |
| 📱 **PWA 增强** | 更好的离线体验 |

---

## 9. 质量指标与验收标准

### Lighthouse 目标

| 指标 | v1.0 基线 | v1.1 目标 | v1.2 目标 |
|------|-----------|-----------|-----------|
| Performance | ≥ 75 | ≥ 90 | ≥ 95 |
| Accessibility | ≥ 90 | ≥ 95 | ≥ 95 |
| Best Practices | ≥ 90 | ≥ 90 | ≥ 95 |
| SEO | ≥ 90 | ≥ 95 | ≥ 95 |

### 测试覆盖目标

| 层级 | v1.0 | v1.1 | v1.2 |
|------|------|------|------|
| Unit | 4 files | ≥ 50% lines | ≥ 60% lines |
| E2E (Playwright) | 0 | ≥ 10 flows | ≥ 20 flows |
| Component | 0 | ≥ 20 tests | ≥ 40 tests |

### 发布门禁

```
□ TypeScript 编译零错误
□ ESLint 零错误零警告
□ Unit Test 100% 通过
□ E2E 核心流程 100% 通过
□ Lighthouse Performance ≥ 85
□ Lighthouse Accessibility ≥ 90
□ npm audit 无 Critical 漏洞
□ Docker build 成功
□ CHANGELOG 已更新
□ README 版本号更新
□ i18n key 覆盖率 100%
```

---

## 10. 社区与生态

### 开源策略

| 项目 | 决策 |
|------|------|
| License | MIT — 完全开放 |
| 仓库 | GitHub Public |
| 贡献方式 | PR + Issues |

### 社区角色

| 角色 | 权限 | 如何成为 |
|------|------|----------|
| 🧑‍💻 User | 提 Issue、Star | 下载即用户 |
| 🧑‍💻 Contributor | 提 PR | 提交被合并的 PR |
| 👤 Maintainer | Review、合并、发版 | 持续贡献并由核心团队邀请 |

### 社区指标

| 指标 | v1.0 | v1.2 目标 |
|------|------|-----------|
| GitHub Stars | — | 200+ |
| Contributors | 1 | 5+ |
| 插件数量 | 0 | 10+ |
| Issue 响应 | — | < 48h |
| PR 合并时间 | — | < 7 天 |

---

## 11. 竞品分析

### 同类工具对比

| 产品 | 定位 | FeiControl 的差异 |
|------|------|-------------------|
| **[TenacitOS](https://github.com/carlosazaustre/tenacitOS)** | 通用 Agent 仪表盘（上游 Fork） | FeiControl 专注于 OpenClaw 生态，深层集成文件系统读取、Agent 状态检测、记忆文件编辑等 OpenClaw 专属功能 |
| **OpenClaw CLI** | 终端直接操作 | FeiControl 是可视化界面，不替代 CLI，而是互补 |
| **自建 Dashboard** | 自己写 Python/Node 监控页 | FeiControl 开箱即用，不用写代码；有 3D Office、多语言等开箱体验 |
| **无控制台** | 只用终端看日志 | FeiControl 提供更直观的图形化体验 |

### FeiControl 的独特价值

1. **OpenClaw 原生** — 自动解析 OpenClaw 的配置文件、记忆文件、Agent 关系
2. **零配置** — 装好就能用，自动发现 Agent
3. **有趣** — 3D 办公室、樱花、Agent 工位，让监控不再枯燥
4. **美观** — 精心打磨的 UI、多主题、PWA
5. **本地优先** — 所有数据在本地，不依赖任何云服务

---

## 12. 风险与缓解

| 风险 | 概率 | 影响 | 缓解 |
|------|------|------|------|
| OpenClaw 文件格式变更 | 中 | 高 | 抽象文件读取层，单点适配 |
| 上游 TenacitOS 停止维护 | 低 | 中 | 代码已是自己的，不依赖上游更新 |
| 用户量太小 | 中 | 低 | 个人项目也不影响使用 |
| 浏览器兼容性 | 低 | 中 | 只支持现代浏览器（Chrome/Firefox/Safari/Edge） |
| 安全漏洞 | 低 | 高 | npm audit + 保持依赖更新 |

---

## 附录：文档结构

```
docs/
├── PRODUCT_PLAN.md    ← 本文档
├── screenshots/       ← 截图
README.md              ← 产品介绍 + Quick Start
SECURITY.md            ← 安全策略
CHANGELOG.md           ← 更新日志
CONTRIBUTING.md        ← 贡献指南
ATTRIBUTION.md         ← 上游致谢
```
