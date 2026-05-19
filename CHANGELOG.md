# Changelog

## [1.0.0] — 2025-07-17

### 🎉 首个稳定发布

FeiControl v1.0.0 — 面向 OpenClaw 的一体化仪表盘与远程管理控制台。

---

### Phase 4: 生态与高级功能

#### 🔴 P0 — 多 Agent 远程管理
- Agent 管理页面：本地 Agent 卡片列表 + 远程团队面板
- 发送任务模态框，状态指示器，实时刷新
- 集成 `/api/agents` + `/api/clawteam` API
- ClawTeam 远程来源配置支持

#### 🟡 P1 — SSE 实时推送
- `/api/events` SSE 端点（Server-Sent Events）
- `useEventStream` hook：自动重连、状态管理
- POST 广播事件到所有连接客户端

#### 🟡 P1 — Agent 聊天界面
- Chat 页面：消息列表 + Agent 选择器 + 输入框
- `/api/chat` 代理消息到 Agent 模型 API
- 流式响应支持 + 思考状态指示

#### 🟡 P1 — 插件系统
- `plugin-engine`：插件扫描/加载/卸载/热重载
- `/api/plugins`：插件管理 API（list/toggle/install/uninstall）
- 插件清单（plugin.json）+ 生命周期钩子

#### 🟢 P2 — 多语言扩展
- 日语（ja.json）/ 韩语（ko.json）/ 西班牙语（es.json）
- i18n 系统支持 5 种语言自动检测
- LanguageSwitcher 完整语言选择器

#### 🟢 P2 — PWA 移动适配增强
- PWAInstallButton 组件增强
- StatusBar PWA 安装提示

#### 🟢 P2 — 数据仪表盘自定义
- 6 种内置小部件：系统健康 / Agent / 活动 / 成本 / Cron / 记忆
- 拖拽布局 + 保存/重置功能

---

### Phase 3: 体验与工程化

#### 🔴 P0 — PWA 支持
- Service Worker（`public/sw.js`）离线缓存策略
- Web 应用清单（`public/manifest.json`）
- 桌面图标（192px / 512px / Apple Touch Icon）
- PWAInstallButton 组件

#### 🔴 P0 — Docker 一键部署
- Dockerfile（多阶段构建，Alpine 基础镜像）
- docker-compose.yml（健康检查、自动重启、持久化卷）
- `.dockerignore` 优化构建上下文

#### 🟡 P1 — 代码分割 + 懒加载
- 按路由自动代码分割（Next.js App Router）
- 3D 组件（React Three Fiber）动态导入

#### 🟡 P1 — 多主题系统
- 亮色/暗色/自定义主题切换
- ThemeProvider 上下文
- CSS 变量驱动主题

#### 🟡 P1 — 键盘快捷键
- KeyboardShortcuts 全局快捷键导航
- 快捷键面板 UI

#### 🟢 P2 — 性能监控
- WebVitals 采集组件
- `/api/vitals` 采集端点
- StatusBar 实时显示 CLS / LCP / FID

#### 🟢 P2 — CI/CD 流水线
- GitHub Actions（TypeScript 检查 + Lint + 测试 + Docker 构建推送）
- 语义化版本标签

---

### Phase 2: 功能增强

#### 🔴 P0 — 国际化翻译
- 所有 UI 文案中英文双覆盖
- About / Actions / Notification / Cost / Cron / Calendar 等页面

#### 🔴 P0 — 数据导出功能
- CSV / JSON 导出成本、活动日志

#### 🟡 P1 — 通知系统增强
- 通知历史、已读/未读标记
- 通知偏好设置

#### 🟡 P1 — 数据备份与恢复
- SQLite 数据库导出/导入

#### 🟡 P1 — 批量文件操作
- 多选、批量删除/移动/下载

#### 🟢 P2 — 搜索增强
- 全文搜索、搜索结果高亮、模糊匹配

#### 🟢 P2 — 日历增强
- 月视图、年视图、事件拖拽

---

### Phase 1: 基础设施与稳定性

#### 🔴 P0 — Error Boundary
- 全局 + 页面级错误捕获
- 优雅降级 UI

#### 🔴 P0 — 加载骨架屏
- 每个页面路由的 loading.tsx + Suspense fallback

#### 🔴 P0 — TypeScript 严格模式
- 修复隐式 any，补充缺失的类型定义

#### 🟡 P1 — 单元测试框架
- Vitest + React Testing Library
- env / agent-skills / skill-parser / dev-server 测试

#### 🟡 P1 — 健康检查
- `/api/health` 端点
- 定时轮询 API 端点可用性

#### 🟡 P1 — 环境变量校验
- `src/lib/env.ts` 启动时校验必需变量

#### 🟢 P2 — i18n 文案覆盖
- 补齐缺失的翻译键

---

### 技术栈

| 类别 | 技术 |
|------|------|
| 框架 | Next.js 15 (App Router) |
| UI | React 19 + Tailwind CSS v4 |
| 3D | React Three Fiber + Drei + Rapier |
| 图表 | Recharts |
| 数据库 | SQLite (better-sqlite3) |
| 国际化 | 自建 i18n 系统（5 种语言） |
| 测试 | Vitest + React Testing Library |
| CI/CD | GitHub Actions |
| 部署 | Docker (多阶段构建) |

---

[1.0.0]: https://github.com/your-org/feicontrol/releases/tag/v1.0.0
