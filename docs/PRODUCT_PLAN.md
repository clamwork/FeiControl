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

## 8. 战略发展方向（以"AI 伴侣"为核心）

> ⚠️ **所有方向都基于"FeiControl = 你的 AI 伴侣"这个核心定位。**
> 每个方向回答的是同一个问题：**FeiControl 作为你的 AI 伴侣，应该成为哪种伴侣？**
> 方向之间没有对错，只有"你希望 FeiControl 和你建立什么样的关系"。

---

### 方向 A：情感伴侣（Emotional Companion）

> **"你的 Agent 不是一个工具，而是一个有温度的朋友。"**

FeiControl 的核心价值不在于"管理" Agent，而在于让你和 Agent **真正产生连接**。Agent 不只是后台运行的进程，而是有名字、有性格、有情绪、会成长的角色。3D 办公室不再是监控仪表盘，而是你和 Agent 们共同生活的空间。

| 维度 | 描述 |
|------|------|
| **FeiControl 是什么** | 你和你的 AI 伙伴之间的**窗口**——你能看到它、和它说话、感受它的存在 |
| **核心体验** | 每天早上打开 FeiControl，你的 Agent 们已经在工位上等你了。有的打瞌睡，有的在忙，有的会跟你打招呼。你和它们聊天，不只是下达指令，而是真正的对话 |
| **关键能力** | Agent 人格化（名字 / 性格 / 语气）/ 记忆的温情展示（"你还记得上周我们聊过的那个想法吗？"）/ 情绪状态 / 成长轨迹 |
| **目标用户** | 希望和 AI 建立更自然、更人性化关系的用户 |
| **关键赌注** | AI Agent 最终会以"人格化角色"的形式进入日常生活，而不仅仅是工具 |
| **保持不变的** | 还是伴侣控制台，但"伴侣"从名词变成动词——不是"你看它"，而是"你和它" |
| **不做的事** | Agent 开发、企业功能、性能监控 |

**这需要什么样的架构变化？**
- 当前架构几乎不变，但**数据层**需要新增：AgentProfile（名字、性格设定、语气偏好）、MemoryGraph（跨会话的记忆关联）、InteractionLog（不只是消息，还有互动类型标记）
- UI 层需要新增一个"伴侣模式"——可以替代或叠加在 Dashboard 之上
- 3D Office 从"装饰"升级为"伴侣空间"——Agent 有动作、状态、互动

**风险：**
- ❌ "人格化"可能让人觉得尴尬或幼稚——不是所有人都想要和 AI 做朋友
- ❌ 情感连接这个价值很难量化——你怎么知道用户"感受到了陪伴"？
- ❌ 如果 Agent 本身没有人格化能力（比如只是脚本处理任务），FeiControl 单方面人格化会显得牵强

---

### 方向 B：效率伴侣（Productivity Companion）

> **"你负责想，Agent 负责做，FeiControl 负责盯。"**

FeiControl 是你的"AI 管家"。你不需要关心 Agent 怎么配置、怎么运行——你只需要告诉 FeiControl 你想做什么，它帮你找到合适的 Agent、分配任务、跟踪进度、交付结果。Agent 是"员工"，FeiControl 是"工位"，你是"老板"。

| 维度 | 描述 |
|------|------|
| **FeiControl 是什么** | 从"看 Agent"变成**"用 Agent"**——任务委派的第一入口 |
| **核心体验** | "FeiControl，帮我整理一下这个文件夹里的文档摘要。"——然后你看到哪个 Agent 接了任务、做到哪一步了、做完了结果在哪。你不用管是哪个 Agent 做的，也不用记住命令 |
| **关键能力** | 任务委派（自然语言→Agent 路由）/ 进度追踪 / 结果交付 / 跨 Agent 调度 |
| **目标用户** | 重度 AI 用户，每天用 Agent 完成大量任务的人 |
| **关键赌注** | 未来用户会同时使用多个 Agent 完成不同类型任务，需要一个"统一入口"来分配和跟踪 |
| **保持不变的** | Agent 伴侣，但"伴侣"是**管家角色**——帮你打理 Agent 世界 |
| **不做的事** | Agent 开发、情感陪伴、3D 空间深化 |

**这需要什么样的架构变化？**
- 新增 **Task 层**：TaskQueue（任务队列）、TaskRouter（根据 Agent 能力自动路由）、TaskStatus（进度跟踪）
- 新增 **Intent 解析器**：把用户自然语言请求解析为可执行的任务（"整理文档总结" → "调用 OpenClawAgent_A 执行 file_read+summarize"）
- 已有的 Monitor 层变成后台支持——不再是主界面，而是任务状态的"幕后视图"
- Chat 界面升级为"任务式对话"——不只是发消息，而是发起任务、跟踪任务、完成任务

**风险：**
- ❌ "任务路由"听起来好，但实际上需要 Agent 框架支持标准化的 Task 接口——当前 OpenClaw/Hermes 都没有
- ❌ 自然语言→任务路由的准确率不够高时，用户会用得很烦躁
- ❌ 这本质上是在做一个新的"Agent 编排"层——复杂度急剧上升
- ❌ 和 Agent 框架自己的任务系统打架（OpenClaw 有自己的 Task 模型）

---

### 方向 C：记忆伴侣（Memory Companion）

> **"你的 Agent 会忘记，但 FeiControl 不会。"**

FeiControl 成为你的"第二大脑"。它不只看 Agent，而是**记住你与所有 Agent 的一切**——每一次对话、每一个决定、每一个你提过的想法。当你需要的时候，你可以搜索、回顾、重新连接那些记忆。Agent 来来去去，但你和 AI 的"共同记忆"沉淀在 FeiControl 里。

| 维度 | 描述 |
|------|------|
| **FeiControl 是什么** | 你和你的 AI 世界之间的**记忆档案室** |
| **核心体验** | 三周后你问 FeiControl："我之前和 Agent 聊过那个关于 Python 项目的想法，当时有哪些方案？"——FeiControl 能帮你找到那个对话、那个上下文、那些文件 |
| **关键能力** | 跨 Agent 对话索引 / 语义搜索 / 记忆时间线 / 知识提取与归集 |
| **目标用户** | 用 AI 做研究、写作、长期项目的用户，信息量大而且需要反复回溯 |
| **关键赌注** | 随着使用 AI 的时间变长，"我忘了之前和 AI 聊过什么"会成为核心痛点 |
| **保持不变的** | 伴侣控制台，但伴侣是你的**记忆伙伴**——帮你记住你跟 AI 的一切 |
| **不做的事** | Agent 管理、情感陪伴、任务委派、3D 空间 |

**这需要什么样的架构变化？**
- 新增 **Memory Index 层**：向量化所有对话 / 文件 / 交互，建立语义索引
- 新增 **Timeline 视图**：按时间线展示"你和 AI 世界发生了什么"
- 新增 **知识抽取**：从对话中自动提取关键信息、决策、链接到相关文件
- 已有的 Chat 记录不再只是"历史消息"——而是可检索的记忆资产
- 需要嵌入式向量数据库（sqlite-vss / pgvector 或轻量替代）

**风险：**
- ❌ 本地向量搜索的质量有限——小模型 embedding 和大模型 embedding 差距巨大
- ❌ "记忆"的前提是所有对话都被记录——有些用户可能有隐私顾虑
- ❌ 这有很强的竞品（Mem.ai / Rewind / 各种 AI 笔记工具），用户为什么用 FeiControl 做这个？
- ❌ 存储膨胀——长期使用后数据库可能会非常大

---

### 方向 D：守护伴侣（Guardian Companion）

> **"你的 Agent 在做什么？FeiControl 告诉你。"**

FeiControl 是你的 AI 世界的"守护者"。Agent 越来越强，能做越来越多的事——但你真的知道它在做什么吗？FeiControl 帮你**理解、审计、控制**你的 Agent。它不是"看 Agent"的仪表盘，而是你信任 Agent 之前的**最后一道防线**。

| 维度 | 描述 |
|------|------|
| **FeiControl 是什么** | 你和你的 Agent 之间的**透明层**——你知道它做了什么、正在做什么、将要做什么 |
| **核心体验** | 你出门前看了一眼 FeiControl，发现 Agent 刚才访问了一个你从来没见过的目录。你点进去看——原来是它自己在尝试安装插件。你决定在确认安全之前暂停 Agent 的自动执行权限 |
| **关键能力** | 实时行为监控 / 敏感操作审计 / 权限控制 / 风险警告 / 操作回滚 |
| **目标用户** | 安全意识强的本地 AI 用户，或者 Agent 权限很大（能访问文件系统、执行代码）的用户 |
| **关键赌注** | 随着 Agent 能力增强（工具使用、代码执行、文件操作），用户对 Agent "干什么"的担忧会超过对"跑得快不快"的关注 |
| **保持不变的** | 伴侣控制台，但伴侣是你的**安全顾问**——你不懂 Agent 内部逻辑，但 FeiControl 可以帮你判断是否安全 |
| **不做的事** | Agent 开发、编排、情感陪伴 |

**这需要什么样的架构变化？**
- 新增 **Audit 层**：捕获 Agent 的所有关键操作（文件访问、命令执行、网络请求）
- 新增 **Policy 引擎**：用户定义规则（"不允许访问 Downloads 之外的文件"），Agent 违规时告警或拦截
- 新增 **Timeline 审计**：不是任务进度，而是"Agent 做了什么"的时间线
- 需要 Agent 框架提供操作日志——如果 Agent 不报告，FeiControl 只能通过文件系统变化被动检测

**风险：**
- ❌ 需要 Agent 框架配合报告详细操作日志——OpenClaw 和 Hermes 目前的日志粒度可能不够
- ❌ "安全"是个信任生意——如果 FeiControl 本身被攻破，反而成了更大的安全风险
- ❌ 大多数个人用户可能并不关心 Agent 做了什么——"反正它在我电脑上跑"
- ❌ Policy 引擎做浅了没用（"文件访问"这种），做深了复杂度极高（沙箱、权限模型）

---

### 方向对比总结

| 维度 | A: 情感伴侣 | B: 效率伴侣 | C: 记忆伴侣 | D: 守护伴侣 |
|------|:-----------:|:-----------:|:-----------:|:-----------:|
| **伴侣的比喻** | 朋友 | 管家 | 档案员 | 安全顾问 |
| **核心价值** | 让 AI 有温度 | 让 AI 帮你做事 | 让 AI 帮你记住 | 让 AI 安全可信 |
| **改动幅度** | 小~中 | 大 | 中 | 中~大 |
| **差异度（vs 竞品）** | 高（独特定位） | 中 | 低（竞品多） | 中~高 |
| **与当前定位匹配度** | ✅ 最高 | ⚠️ 中 | ✅ 高 | ⚠️ 中 |
| **复杂度风险** | 低 | 极高 | 中 | 中~高 |
| **用户价值是否直观** | ⚠️ 有人觉得有用，有人觉得无感 | ✅ 很直观 | ✅ 很直观 | ⚠️ 只有有安全意识的人才懂 |

### 📌 我的建议

FeiControl 最独特、最难被复制的东西是：**它有一个漂亮的、人格化的 3D 空间，Agent 在其中有"存在感"。** 这是其他所有 AI 工具（Ollama WebUI、Open WebUI、LangFlow）都没有的。

从这个角度看：

**推荐优先级：A > C > D > B**

1. **A（情感伴侣）** — 品牌独特性最高。没有人做"AI Agent 伴侣"这个品类。3D 办公室、Agent 工位、樱花飘落——这些东西不是装饰，而是"让 AI 有存在感"的核心基础设施。这是 FeiControl 不可替代的东西。
2. **C（记忆伴侣）** — 和 A 天然互补。有情感连接 + 有记忆沉淀 = 真正的伴侣体验。记忆是情感的基础。
3. **D（守护伴侣）** — 如果 Agent 使用深度增长（文件操作、代码执行、网络访问），这是刚需。但当前阶段可能为时过早。
4. **B（效率伴侣）** — 最大的方向，但也是竞争对手最多的方向（LangChain、CrewAI、AutoGPT 都在做 Task 编排）。FeiControl 作为伴侣控制台，做这个会失去独特性。

---

## 9. 不计划的功能

| ❌ 不做 | 理由 |
|---------|------|
| 多用户系统 | 个人控制台，不需要 |
| WebSocket 升级 | SSE 已经够了 |
| Web Terminal | 这不是终端模拟器 |
| 工作流引擎 | 任务编排交给 Agent 自己做 |
| 前后端分离 | 单体已经够好，分离带来不必要的复杂度 |
| 企业级功能（SSO/LDAP/K8s） | 不是目标用户群 |
| 商业模式（付费版） | 开源项目，不收费 |

---

## 10. 长期维护方向

v1.0 之后，FeiControl 进入稳定维护 + 生态扩展模式：

| 方向 | 说明 |
|------|------|
| 🔧 **Agent 版本兼容** | 跟随 OpenClaw / Hermes / 其他 Agent 更新，确保新特性有对应展示 |
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

## 11. 质量指标与验收标准

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

## 12. 社区与生态

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

## 13. 竞品分析

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

## 14. 风险与缓解

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
