# FeiControl — 产品规划白皮书

> 版本: v1.0 | 最后更新: 2025-07-17
> 从"一个 Agent 仪表盘"到"AI 团队协作操作系统"

---

## 目录

1. [产品愿景](#1-产品愿景)
2. [用户画像与场景](#2-用户画像与场景)
3. [核心功能模块架构](#3-核心功能模块架构)
4. [技术架构规划](#4-技术架构规划)
5. [数据模型](#5-数据模型)
6. [UI/UX 设计原则](#6-uiux-设计原则)
7. [安全架构](#7-安全架构)
8. [产品迭代路线图](#8-产品迭代路线图)
9. [质量指标与验收标准](#9-质量指标与验收标准)
10. [开放生态与社区治理](#10-开放生态与社区治理)
11. [商业模式建议](#11-商业模式建议)

---

## 1. 产品愿景

### 一句话定位

> **FeiControl 是 AI Agent 团队的"航空母舰"——一个集监控、管理、协作、扩展于一体的开源控制台。**

### 产品使命

让 AI Agent 的管理从"SSH 进服务器看日志"进化到"开箱即用的可视化舰队指挥中心"。

### 核心价值主张

| 维度 | 价值 | 说明 |
|------|------|------|
| 🎯 **统一** | 一个入口管理所有 Agent | 不再需要在多个终端、日志文件、API 文档间来回切换 |
| 👀 **可见** | 状态、成本、活动实时可见 | 每个 Agent 在做什么、花了多少钱、有什么问题，一目了然 |
| 🎮 **可控** | 远程指挥、任务下发、策略配置 | 像玩 RTS 游戏一样管理你的 AI 团队 |
| 🔌 **可扩展** | 插件系统、公开 API、技能商店 | 社区可以贡献插件、分享技能，生态自我生长 |
| 🏠 **私有部署** | 数据不出本机，完全离线可用 | 所有数据存储在本地 SQLite，无需云服务 |

### 产品哲学

1. **Cute but Serious** — 界面可爱有趣（3D 办公室、樱花、表情符号），但功能严肃可靠（RBAC、审计日志、安全合规）
2. **Local First** —— 数据主权在用户手中，所有功能可离线运行
3. **Frictionless UX** —— 零配置启动（`npm run dev` 即可使用），渐进式复杂度
4. **Agent-Centric** —— 一切围绕 Agent 的生命周期和交互展开
5. **Open by Default** —— 开源、开放 API、开放插件生态

---

## 2. 用户画像与场景

### 画像 1: 个人独立开发者 / AI 爱好者

| 项目 | 描述 |
|------|------|
| 姓名 | 小王 |
| 背景 | 全栈开发者，运行 3-5 个 OpenClaw Agent 做个人项目 |
| 痛点 | Agent 经常不工作也不知道；想看成本但只能翻 API 日志；记不住每个 Agent 负责什么 |
| 使用场景 | 早上看 Dashboard 了解昨晚 Agent 干了什么；中午通过 Chat 给 Agent 分配任务；下班前导出一份成本报表 |
| 核心诉求 | **一键启动、可视化、低成本** |
| 用户量预估 | 占整体用户 60% |

### 画像 2: 小型 AI 创业团队

| 项目 | 描述 |
|------|------|
| 姓名 | Lisa（CTO） |
| 背景 | 带领 3 人团队，运行 10+ Agent 做自动化内容生成和客户服务 |
| 痛点 | 团队成员各自管自己的 Agent，没有统一视图；新人 onboarding 成本高；想给客户开放 Agent 能力但不知道怎么实现 |
| 使用场景 | 团队共享一个 FeiControl 实例；CTO 看全局 Dashboard 和成本报表；成员通过自己的账号管理分配的 Agent |
| 核心诉求 | **多用户协作、权限管理、API 对外暴露** |
| 用户量预估 | 占整体用户 25% |

### 画像 3: AI 原生企业 / 企业内部 AI 团队

| 项目 | 描述 |
|------|------|
| 姓名 | 张总（IT 总监） |
| 背景 | 公司部署了 50+ Agent 做自动化运维、代码审查、文档生成 |
| 痛点 | 安全合规要求所有操作可审计；需要 SSO 集成；需要 SLA 监控和告警 |
| 使用场景 | 运维团队通过 FeiControl 监控所有 Agent 健康状态；管理层查看成本和使用报告；开发者通过 REST API 集成到内部工具链 |
| 核心诉求 | **SSO/RBAC、审计日志、高可用部署、SLA 监控** |
| 用户量预估 | 占整体用户 15% |

### 关键用户旅程

#### 🟢 新用户 Onboarding 旅程

```
安装 → 首次打开 → 自动检测 Agent → Dashboard 展示概览
  ↓
浏览每个页面（Agent / Cost / Cron / Calendar...）
  ↓
尝试聊天功能 → 给 Agent 发消息 → 看到实时回复
  ↓
探索 3D Office → 看到 Agent 状态可视化
  ↓
配置设置 → 主题 / 语言 / 快捷键
  ↓
✅ 成为活跃用户
```

#### 🔴 团队管理员日活旅程

```
登录 → Dashboard 一页纵览全局
  ↓
检查异常 Agent → 点击进入详情 → 查看日志 / 重新启动
  ↓
查看昨日成本报告 → 导出为 CSV → 发给团队
  ↓
给 Agent 布置今日任务 → 通过 Chat 或 Cron
  ↓
查看新注册插件 → 安装 / 配置
  ↓
✅ 下班
```

---

## 3. 核心功能模块架构

### 功能树

```
FeiControl
├── 📊 Dashboard (控制台首页)
│   ├── 欢迎语 + 系统健康状态
│   ├── Agent 团队概览 (在线/总数)
│   ├── 最近活动流 (实时 SSE)
│   ├── 今日成本速览
│   ├── Cron 任务状态
│   └── 可拖拽小部件系统 (自定义布局)
│
├── 🤖 Agents (Agent 管理)
│   ├── 本地 Agent 列表 (卡片视图)
│   │   ├── 状态指示器 (online/offline/busy/error)
│   │   ├── 基本信息 (名称/角色/模型/工作空间)
│   │   ├── 会话数量 / 最近活动时间
│   │   ├── 子 Agent 关系图
│   │   └── 快捷操作 (查看日志 / 重启 / 发送任务)
│   ├── ClawTeam 远程团队 (外部连接)
│   │   ├── 远程来源配置
│   │   ├── 远程 Agent 状态同步
│   │   └── 跨实例任务下发
│   ├── 详情面板
│   │   ├── Agent 资料 (SOUL.md / IDENTITY.md)
│   │   ├── 活动时间线
│   │   ├── 成本明细
│   │   └── 技能列表
│   └── 批量操作 (多选 / 批量重启 / 批量发送任务)
│
├── 💬 Chat (Agent 对话)
│   ├── 对话列表 (历史会话)
│   ├── Agent 选择器 (切换对话目标)
│   ├── 消息输入 (文本 / Markdown / Code Block)
│   ├── 流式响应 (逐 token 展示)
│   ├── 思考状态指示 (Agent 正在思考...)
│   ├── 消息历史 (按日期分组)
│   └── 对话导出 (Markdown / JSON)
│
├── 📅 Calendar (日历)
│   ├── 月视图 / 周视图 / 日视图
│   ├── Agent 事件展示 (Color-coded by Agent)
│   ├── 事件拖拽创建 / 编辑 / 删除
│   └── 日历订阅 (iCal 导出)
│
├── ⏰ Cron (定时任务)
│   ├── 任务列表 (名称 / 表达式 / 状态 / 最近运行)
│   ├── 任务创建 (Cron 表达式编辑器 + 预设模板)
│   ├── 运行历史 (每次执行结果 / 耗时 / 状态)
│   ├── 手动触发
│   └── 失败告警 (通知推送)
│
├── 💰 Costs (成本分析)
│   ├── 今日成本 → 本周 → 本月趋势图
│   ├── 各 Agent 成本分布 (饼图 / 柱状图)
│   ├── 模型级别成本分解 (GPT-4 / Claude / 其他)
│   ├── 预算设置与告警阈值
│   ├── 成本导出 (CSV / JSON)
│   └── 成本预测 (基于历史趋势)
│
├── 🏢 3D Office (3D 办公室)
│   ├── 等距 3D 场景
│   ├── Agent 工位 (每个 Agent 一个卡通工位)
│   ├── Agent 状态可视化 (在线发光 / 忙碌动效 / 离线灰暗)
│   ├── 实时活动流 (Agent 在做什么)
│   ├── 会议室 / 休息区 / 樱花树 (氛围元素)
│   └── 第一人称漫游模式
│
├── 📝 Documents (文档管理)
│   ├── 文件浏览器 (树形目录)
│   ├── Markdown 编辑器 (monaco-editor)
│   ├── Agent 记忆文件 (SOUL.md / TOOLS.md / IDENTITY.md)
│   ├── 文件预览 (图片 / Markdown / Code)
│   └── 搜索 (全文搜索 + 高亮)
│
├── 🔌 Plugins (插件管理)
│   ├── 已安装插件列表 (名称 / 版本 / 状态)
│   ├── 插件详情 (manifest.json / 权限 / 配置)
│   ├── 插件启停 (toggle on/off)
│   ├── 插件安装 (本地文件 / URL / 商店)
│   ├── 插件热重载
│   └── (未来) 插件商店浏览
│
├── 🔔 Notifications (通知中心)
│   ├── 通知列表 (时间 / 类型 / 内容)
│   ├── 已读 / 未读标记
│   ├── 通知偏好设置
│   └── 通知渠道 (WebSocket / Webhook / 邮件 / 飞书 / Slack)
│
├── ⚙️ Settings (系统设置)
│   ├── General (语言 / 主题 / 快捷键)
│   ├── Security (修改密码 / 会话管理 / 2FA)
│   ├── Integrations (ClawTeam / Webhook / SMTP / 通知渠道)
│   ├── Backup (数据库导出 / 导入 / 自动备份)
│   ├── Plugins (插件管理)
│   ├── Agents (全局 Agent 配置)
│   └── (未来) Users & Roles (多用户管理)
│
├── 📖 About (关于)
│   ├── 版本信息
│   ├── 技术栈 / 致谢
│   └── 更新日志
│
└── 🔐 Auth (认证)
    ├── 登录页
    ├── (未来) 注册页
    ├── (未来) SSO / OAuth 集成
    └── (未来) 密码重置
```

### 页面路由规划

| 路由 | 页面 | 状态 |
|------|------|------|
| `/` | Dashboard | ✅ v1.0 |
| `/agents` | Agent 列表 | ✅ v1.0 |
| `/chat` | Agent 对话 | ✅ v1.0 |
| `/calendar` | 日历 | ✅ v1.0 |
| `/cron` | 定时任务 | ✅ v1.0 |
| `/costs` | 成本分析 | ✅ v1.0 |
| `/office` | 3D 办公室 | ✅ v1.0 |
| `/files` | 文档管理 | ✅ v1.0 |
| `/about` | 关于 | ✅ v1.0 |
| `/settings` | 设置 | ✅ v1.0 |
| `/plugins` | 插件管理 | ✅ v1.0 |
| `/actions` | 操作历史 | ✅ v1.0 |
| `/skills` | 技能管理 | ✅ v1.0 |
| `/workflows` | (未来) 工作流 | 📅 v1.2 |
| `/users` | (未来) 用户管理 | 📅 v1.2 |
| `/terminal` | (未来) Web 终端 | 📅 v1.3 |
| `/social` | (未来) 社交面板 | 📅 v1.3 |

---

## 4. 技术架构规划

### 当前技术栈 (v1.0)

```
┌─────────────────────────────────────────────┐
│                  Browser (PWA)               │
├─────────────────────────────────────────────┤
│           Next.js 15 App Router              │
│  ┌─────────┐ ┌──────────┐ ┌──────────────┐  │
│  │ RSC     │ │ Client   │ │ API Routes   │  │
│  │ (Server)│ │ Components│ │ (REST + SSE) │  │
│  └─────────┘ └──────────┘ └──────────────┘  │
│  ┌───────────────────────────────────────┐   │
│  │  React 19 + Tailwind CSS v4           │   │
│  │  React Three Fiber (3D) + Recharts    │   │
│  │  Zustand-like State + i18n System     │   │
│  └───────────────────────────────────────┘   │
├─────────────────────────────────────────────┤
│           Data Layer                         │
│  ┌──────────────┐  ┌────────────────────┐   │
│  │ SQLite       │  │ OpenClaw 文件系统  │   │
│  │ (better-sqlite│  │ (Agent 配置/记忆) │   │
│  │ ³)          │  │                    │   │
│  └──────────────┘  └────────────────────┘   │
├─────────────────────────────────────────────┤
│           Infra                              │
│  Docker + GitHub Actions + PWA SW           │
└─────────────────────────────────────────────┘
```

### 未来技术演进路线

| 版本 | 技术变更 | 说明 |
|------|----------|------|
| v1.0 | 当前基线 | 单体 Next.js + SQLite |
| v1.1 | Playwright + Lighthouse | 质量基础设施 |
| v1.2 | NextAuth.js + Prisma (可选) | 多用户支持 |
| v1.2 | OpenAPI (Swagger) + Rate Limiter | 公开 API |
| v1.3 | WebSocket (独立服务) | 替代 SSE 实现双向通信 |
| v1.3 | Redis (可选) | 会话缓存 / Rate Limit / 发布订阅 |
| v2.0 | 前后端分离 (独立 API Server) | 为多客户端做准备 |

### 关键架构决策

| 决策 | 选择 | 理由 |
|------|------|------|
| 数据库 | SQLite (better-sqlite3) | 零配置、本地优先、单文件备份 |
| 认证 | 密码 + HTTP-only Cookie | 简单安全，无需外部依赖 |
| 实时通信 | SSE (Server-Sent Events) | 单向推送足够，比 WebSocket 简单 |
| 3D 引擎 | React Three Fiber | React 生态内，声明式 3D |
| 插件系统 | Node.js require() + 沙箱 | 热加载、隔离权限 |
| 国际化 | 自建 Context | 轻量，无外部依赖 |
| 测试 | Vitest + RTL | 快、Vite 原生、React 友好 |
| 样式 | Tailwind CSS v4 | 原子化、Tree-shaking、主题变量 |

---

## 5. 数据模型

### 核心实体关系

```
Agent
├── id (string, PK)
├── name (string)
├── emoji (string)
├── color (string)
├── model (string)
├── status (enum: online/offline/busy/error)
├── role (string)
├── workspace (string)
├── lastActivity (datetime)
├── activeSessions (number)
├── config (JSON)
└── subagents (relation[])

Session
├── id (string, PK)
├── agentId (string, FK → Agent)
├── startTime (datetime)
├── endTime (datetime?)
├── status (enum: active/completed/failed)
├── messages (relation[])
└── metadata (JSON)

Message
├── id (string, PK)
├── sessionId (string, FK → Session)
├── role (enum: user/agent/system)
├── content (text)
├── tokens (number)
├── cost (number)
├── timestamp (datetime)
└── metadata (JSON)

CronJob
├── id (string, PK)
├── name (string)
├── expression (string)
├── target (string)
├── command (string)
├── enabled (boolean)
├── lastRun (datetime)
├── lastStatus (enum: success/failed)
└── history (relation[])

Notification
├── id (string, PK)
├── type (enum: info/warning/error/success)
├── title (string)
├── content (text)
├── read (boolean)
├── source (string)
├── timestamp (datetime)
└── metadata (JSON)

Plugin
├── id (string, PK)
├── name (string)
├── version (string)
├── enabled (boolean)
├── permissions (string[])
├── config (JSON)
├── source (enum: local/npm/store)
└── installTime (datetime)

User (未来)
├── id (string, PK)
├── username (string, unique)
├── passwordHash (string)
├── role (enum: admin/editor/viewer)
├── preferences (JSON)
├── lastLogin (datetime)
├── createdAt (datetime)
└── sessions (relation[])
```

---

## 6. UI/UX 设计原则

### 品牌调性

| 维度 | 定位 | 说明 |
|------|------|------|
| 语气 | **Cute + Professional** | 表情符号友好，但信息层级清晰 |
| 主色 | **#ef4444 (Red)** + **#f8fafc (背景)** | 活力红 + 干净白 |
| 字体 | Inter (英文) + 系统默认 (CJK) | 清晰可读 |
| 动效 | 克制但有反馈 | 微交互动效，不过度 |

### 设计规范

```
布局:
├── Dock (左侧导航, 68px) → 移动端底部 Tab Bar
├── TopBar (顶部栏, 48px) → 标题 + 全局操作
├── Main (主内容区) → 响应式 padding
└── StatusBar (底部状态栏, 32px) → Vitals + 信息

间距系统: 4px 基准 → 4/8/12/16/20/24/32/48/64
圆角系统: 4/8/12/16 (Dock → 8px, 卡片 → 12px, 模态框 → 16px)
阴影系统: sm/md/lg/xl
动画: 150ms ease (hover) / 300ms ease (transition)
```

### 响应式断点

| 断点 | 宽度 | 布局变更 |
|------|------|----------|
| Mobile | < 640px | Dock → 底部 Tab；单列布局；简化信息层级 |
| Tablet | 640-1024px | Dock 保留；两列布局可 |
| Desktop | > 1024px | 完整布局 |


### 交互原则

1. **即时反馈** — 任何操作 200ms 内应有视觉反馈（loading / 动画 / 文字变化）
2. **渐进披露** — 复杂功能逐步展示，不要第一次就全部铺开
3. **可撤销** — 支持 Ctrl+Z / 撤销操作 / 确认对话框
4. **键盘可访问** — 所有操作可通过键盘完成
5. **离线容错** — PWA 离线时显示缓存数据，网络恢复后自动同步

### 暗色模式

所有页面必须同时支持亮色和暗色模式，颜色通过 CSS 变量定义。

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

### 安全层级

```
Layer 0: 物理安全
  └── 用户负责服务器物理安全
Layer 1: 网络
  └── HTTPS (反向代理 TLS)
  └── 防火墙限制端口
Layer 2: 认证
  └── 密码登录 + HTTP-only Cookie
  └── (未来) 2FA / SSO / OAuth
Layer 3: 授权
  └── (v1.0) 单用户 = 管理员
  └── (v1.2) RBAC (admin/editor/viewer/agent)
Layer 4: API 安全
  └── 所有 API 路由受 middleware 保护
  └── Rate Limiting (登录: 5次/15分钟, API: 100次/分钟)
  └── 输入校验 (Zod schemas)
Layer 5: 数据安全
  └── SQLite 文件权限 (600)
  └── Cookie: httpOnly + sameSite + secure
  └── 终端命令白名单
Layer 6: 插件安全
  └── 沙箱执行
  └── 权限声明 (manifest.json)
  └── 超时终止
```

### 安全清单 (v1.0 → v1.2+)

| 安全措施 | v1.0 | v1.1 | v1.2 | v2.0 |
|----------|------|------|------|------|
| 密码认证 | ✅ | ✅ | ✅ | ✅ |
| HTTP-only Cookie | ✅ | ✅ | ✅ | ✅ |
| Rate Limiting | ✅ | ✅ | ✅ | ✅ |
| Route protection | ✅ | ✅ | ✅ | ✅ |
| 终端白名单 | ✅ | ✅ | ✅ | ✅ |
| 输入校验 (Zod) | ✅ | ✅ | ✅ | ✅ |
| CSP Headers | 📅 | ✅ | ✅ | ✅ |
| 2FA | 📅 | 📅 | ✅ | ✅ |
| RBAC | 📅 | 📅 | ✅ | ✅ |
| OAuth/SSO | 📅 | 📅 | 📅 | ✅ |
| Audit Log | 📅 | 📅 | 📅 | ✅ |
| WAF | 📅 | 📅 | 📅 | ✅ |

---

## 8. 产品迭代路线图

### 版本策略

```
语义化版本: v{大版本}.{功能版本}.{修复版本}
  v1.x.x — 单体 Next.js 架构
  v2.x.x — 前后端分离架构

发布节奏: 每 2-4 周一个功能版本
```

### Phase 5: 稳定与生态扩展 (v1.0.0 → v1.2.0)

#### Sprint 5.1: 质量基础设施 (v1.1.0 — 预计 2 周)

| 优先级 | 任务 | 说明 | 验收标准 |
|--------|------|------|----------|
| 🔴 P0 | Playwright E2E 测试框架 | 安装 Playwright + 配置 GitHub Actions | 覆盖核心用户流程 (登录 / Dashboard / Agent 列表 / Chat) |
| 🔴 P0 | E2E: 登录流程 | 登录页测试 | ✅ 成功登录跳转 Dashboard / ❌ 错误密码显示错误信息 |
| 🔴 P0 | E2E: Dashboard 渲染 | 仪表盘数据加载测试 | ✅ 页面加载显示 Agent 概览和活动流 |
| 🔴 P0 | E2E: Agent 列表 | Agent 卡片渲染测试 | ✅ 至少显示 1 个 Agent / ✅ 状态指示器正确 |
| 🔴 P0 | E2E: Chat 发送消息 | 对话交互测试 | ✅ 发送消息 / ✅ 接收响应 / ✅ 错误处理 |
| 🔴 P0 | E2E: Cron 创建任务 | 定时任务 CRUD 测试 | ✅ 创建 / ✅ 编辑 / ✅ 删除 / ✅ 手动触发 |
| 🔴 P0 | PWA 移动端适配 | 响应式重构 | ✅ 触控友好 / ✅ 底部导航 / ✅ 手势支持 |
| 🔴 P0 | 性能基线 + Lighthouse CI | Lighthouse CI 集成 | ✅ Score >= 90 (Performance) / ✅ Score >= 95 (Accessibility) |
| 🟡 P1 | E2E: 日历 | 日历年历交互测试 | ✅ 月视图切换 / ✅ 事件创建和拖拽 |
| 🟡 P1 | E2E: 成本页面 | 数据加载和图表测试 | ✅ 图表渲染 / ✅ 数据导出 |
| 🟡 P1 | E2E: 文件浏览器 | 文件 CRUD 测试 | ✅ 目录导航 / ✅ 文件预览 |
| 🟡 P1 | 图片优化 | next/image + WebP 转换 | ✅ 图片加载减少 50% 以上 |
| 🟢 P2 | E2E: 3D Office | 3D 场景渲染测试 | ✅ 场景加载 / ✅ Agent 工位显示 |

#### Sprint 5.2: 多用户系统 (v1.2.0-alpha — 预计 3 周)

| 优先级 | 任务 | 说明 | 验收标准 |
|--------|------|------|----------|
| 🔴 P0 | 用户模型与数据库迁移 | User 表 + Prisma/Schema | ✅ Schema 定义 / ✅ 迁移脚本 |
| 🔴 P0 | 注册与登录 | 多用户注册登录流程 | ✅ 注册 / ✅ 登录 / ✅ 登出 / ✅ 密码加密 (bcrypt) |
| 🔴 P0 | 会话管理 | JWT / Session 存储 | ✅ Cookie 管理 / ✅ 过期 / ✅ 登出清除 |
| 🔴 P0 | RBAC 权限系统 | admin / editor / viewer 三种角色 | ✅ 路由守卫 / ✅ API 权限校验 / ✅ UI 根据角色显示/隐藏 |
| 🔴 P0 | 用户管理页面 | 管理员管理用户 | ✅ 用户列表 / ✅ 创建/编辑/删除 / ✅ 角色分配 |
| 🟡 P1 | 个人资料页 | 用户信息修改 | ✅ 修改昵称 / ✅ 修改密码 / ✅ 偏好设置 |
| 🟡 P1 | 密码重置 | 忘记密码流程 | ✅ 邮件验证 / ✅ 重置页面 / ✅ Token 过期 |
| 🟢 P2 | 2FA (TOTP) | Google Authenticator 集成 | ✅ 绑定 / ✅ 验证 / ✅ 恢复码 |

#### Sprint 5.3: 对外开放 (v1.2.0-beta — 预计 3 周)

| 优先级 | 任务 | 说明 | 验收标准 |
|--------|------|------|----------|
| 🔴 P0 | 公开 REST API | 完整的 RESTful API | ✅ OpenAPI 3.0 文档 / ✅ 所有端点的 CRUD |
| 🔴 P0 | API Key 认证 | API 密钥管理 | ✅ 生成 / ✅ 撤销 / ✅ 权限范围 / ✅ Rate Limit |
| 🔴 P0 | API Rate Limiting | 按 IP / 按 API Key | ✅ 配置阈值 / ✅ 返回 429 / ✅ Redis 支持 |
| 🟡 P1 | 系统配置页面 | SMTP / Webhook / Backup / Theme | ✅ 邮件配置 / ✅ Webhook 管理 / ✅ 自动备份设置 |
| 🟡 P1 | Webhook 集成 | Agent 事件推送 | ✅ 事件列表 / ✅ Webhook 配置 / ✅ 重试机制 |
| 🟡 P1 | 飞书 / Slack / Discord 推送 | 三方通知渠道 | ✅ 至少 2 个渠道的集成 |
| 🟢 P2 | API SDK (JavaScript) | 客户端 SDK | ✅ npm 包 / ✅ 类型定义 / ✅ 示例 |

#### Sprint 5.4: 生态建设 (v1.2.0 — 预计 2 周)

| 优先级 | 任务 | 说明 | 验收标准 |
|--------|------|------|----------|
| 🟡 P1 | Agent 技能商店 UI | 浏览 / 搜索 / 安装插件 | ✅ 商店页面 / ✅ 一键安装 / ✅ 版本管理 |
| 🟡 P1 | 插件发布流程 | 开发者如何发布插件 | ✅ 文档 / ✅ manifest.json 标准 / ✅ CI 自动发布 |
| 🟡 P1 | 数据看板增强 | 自定义图表 + 导出 | ✅ 图表配置 / ✅ PDF 导出 / ✅ PNG 导出 |
| 🟡 P1 | 定时邮件报表 | 日报 / 周报 / 月报 | ✅ 模板 / ✅ 计划配置 / ✅ 发送记录 |
| 🟢 P2 | 插件评分系统 | 评论 / 评分 / 下载量 | ✅ 评分 / ✅ 评论 / ✅ 排行榜 |
| 🟢 P2 | 集成测试覆盖 | 全量 E2E 覆盖 | ✅ 覆盖率达到 80%+ |

### Phase 6: 协作与智能 (v1.3.0 — v2.0.0 概念规划)

> 此阶段为概念规划，将在 v1.2 发布后细化

| 优先级 | 任务 | 说明 |
|--------|------|------|
| 🔴 P0 | WebTerminal | 在浏览器中 SSH 到服务器 |
| 🔴 P0 | 工作流引擎 | 可视化编排多 Agent 工作流 (DAG) |
| 🟡 P1 | 实时协作 | 多用户同时操作（类似 Figma 的协作） |
| 🟡 P1 | WebSocket 升级 | SSE → 全双工 WebSocket |
| 🟡 P1 | Agent 模板市场 | 预制 Agent 配置文件一键部署 |
| 🟢 P2 | AI 运维助手 | 内置 AI 分析问题并建议修复 |
| 🟢 P2 | 社交面板 | Agent 社交媒体账号管理 |

### Phase 7: 企业级 (v2.0.0+ 概念规划)

| 优先级 | 任务 | 说明 |
|--------|------|------|
| 🔴 P0 | 前后端分离 | 独立 API Server (FastAPI / Express) |
| 🔴 P0 | 多数据库支持 | PostgreSQL / MySQL 可选 |
| 🟡 P1 | SSO / LDAP 集成 | 企业身份源 |
| 🟡 P1 | 高可用部署 | 多实例 + 负载均衡 |
| 🟢 P2 | Kubernetes Operator | 云原生部署 |

---

## 9. 质量指标与验收标准

### 性能指标 (Lighthouse)

| 指标 | v1.0 基线 | v1.1 目标 | v1.2 目标 |
|------|-----------|-----------|-----------|
| Performance | ≥ 75 | ≥ 90 | ≥ 95 |
| Accessibility | ≥ 90 | ≥ 95 | ≥ 95 |
| Best Practices | ≥ 90 | ≥ 90 | ≥ 95 |
| SEO | ≥ 90 | ≥ 95 | ≥ 95 |
| FCP | ≤ 2.0s | ≤ 1.5s | ≤ 1.0s |
| LCP | ≤ 3.0s | ≤ 2.0s | ≤ 1.5s |
| CLS | ≤ 0.1 | ≤ 0.05 | ≤ 0.05 |
| TBT | ≤ 500ms | ≤ 300ms | ≤ 200ms |

### 测试覆盖率目标

| 层级 | v1.0 | v1.1 目标 | v1.2 目标 |
|------|------|-----------|-----------|
| Unit (Vitest) | 4 files | ≥ 50% lines | ≥ 70% lines |
| Integration (API) | 0 | ≥ 10 tests | ≥ 30 tests |
| E2E (Playwright) | 0 | ≥ 10 flows | ≥ 30 flows |
| Component (RTL) | 0 | ≥ 20 tests | ≥ 50 tests |

### 发布质量门禁

每次发布前必须通过以下检查:

```
□ TypeScript 编译零错误 (tsc --noEmit)
□ ESLint 零错误零警告
□ Unit Test 100% 通过
□ E2E 核心流程 100% 通过
□ Lighthouse Performance ≥ 85
□ Lighthouse Accessibility ≥ 90
□ npm audit 无 Critical 级别漏洞
□ Docker build 成功
□ CHANGELOG 已更新
□ README 中的版本号已更新
□ 所有 i18n key 覆盖率 100%
```

---

## 10. 开放生态与社区治理

### 开源策略

| 项目 | 决策 |
|------|------|
| License | MIT — 完全开放 |
| 仓库 | GitHub Public |
| C4 (Collective Code Construction) | 贡献者可以自由 fork 和 PR |
| CLA | 不需要 CLA，降低贡献门槛 |

### 社区角色

| 角色 | 权限 | 如何成为 |
|------|------|----------|
| 🧑‍💻 Contributor | 提 PR、提 Issue | 提交一个被合并的 PR |
| 👤 Maintainer | Review PR、合并、发布版本 | 持续贡献 + 现有 Maintainer 邀请 |
| 🧭 Core Team | 项目方向决策、架构决策 | Maintainer 中选举 |
| 🔒 Security Team | 安全漏洞处理 | 邀请制 |

### 社区健康指标

| 指标 | v1.0 | v1.2 目标 | v2.0 目标 |
|------|------|-----------|-----------|
| GitHub Stars | — | 500+ | 5000+ |
| Contributors | 1 | 5+ | 50+ |
| 已安装实例 | 1 | 100+ | 1000+ |
| 插件数量 | 0 | 10+ | 100+ |
| Issue 响应时间 | — | < 48h | < 24h |
| PR 合并时间 | — | < 7 天 | < 3 天 |

### 文档策略

```
docs/
├── README.md           # 产品介绍 + Quick Start
├── INSTALL.md          # 详细安装指南
├── CONFIG.md           # 配置说明
├── API.md              # REST API 文档
├── PLUGIN_DEV.md       # 插件开发指南
├── THEMING.md          # 主题定制
├── ARCHITECTURE.md     # 架构说明
├── CONTRIBUTING.md     # 贡献指南
├── SECURITY.md         # 安全策略
├── CHANGELOG.md        # 更新日志
├── ROADMAP.md          # 路线图
└── screenshots/        # 截图
```

---

## 11. 商业模式建议

> FeiControl 本身是 **MIT 开源免费软件**，以下为可选增值服务。

### 开源版 (Free)

- ✅ 全部核心功能
- ✅ 单用户
- ✅ Docker 部署
- ✅ 社区支持 (GitHub Issues / Discussions)
- ✅ 插件系统 (社区插件免费)

### 团队版 (SaaS / Self-hosted — 付费)

- 所有开源版功能 +
- ✅ 多用户 + RBAC
- ✅ 审计日志
- ✅ SSO 集成
- ✅ 专属技术支持 (Slack / Discord)
- ✅ SLA 保障
- 定价建议: $29/月 (5人团队) / $99/月 (不限用户)

### 企业版 (Self-hosted — 按年付费)

- 所有团队版功能 +
- ✅ 高可用部署
- ✅ Kubernetes Operator
- ✅ LDAP / Active Directory
- ✅ 定制开发
- ✅ 上门技术支持 (可选)
- 定价建议: $999/年起

### 插件商店 (佣金模式 — 未来)

- 免费插件: 社区贡献
- 付费插件: 开发者定价，平台抽成 20%
- 企业定制插件: 按需报价

---

## 附录 A: 竞品分析

| 产品 | 定位 | 优势 | 劣势 | FeiControl 差异化 |
|------|------|------|------|-------------------|
| OpenClaw CLI | Agent 管理终端 | 直接、功能全 | 无 UI、学习成本高 | 可视化+可交互 |
| LangSmith | LLM 可观测性 | 专业 tracing | 不管理 Agent、云服务 | 本地部署+Agent 管理 |
| LangFlow | Agent 可视化编排 | 拖拽工作流 | 偏实验性、不生产可用 | 生产级+团队协作 |
| Flowise | AI 应用构建 | 低代码 | 非 Agent 管理 | 专注 Agent 管理 |
| Dify | AI 应用平台 | 功能全 | 云端重、Agent 弱 | 轻量+Agent 原生 |

## 附录 B: 风险与缓解

| 风险 | 概率 | 影响 | 缓解措施 |
|------|------|------|----------|
| OpenClaw API 变更 | 中 | 高 | 抽象适配层、版本兼容测试 |
| 单用户架构限制增长 | 高 | 高 | v1.2 优先做多用户 |
| 数据库性能瓶颈 | 低 | 中 | 索引优化 + 分页 + 可选迁移 PG |
| 浏览器兼容性 | 低 | 中 | 仅支持现代浏览器 (Chrome/Firefox/Safari/Edge) |
| 安全漏洞 | 中 | 高 | 定期审计 + npm audit + 安全策略 |
| 社区活跃度不足 | 高 | 中 | 完善贡献文档 + 低门槛入门 |
