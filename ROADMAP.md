# FeiControl — 产品迭代路线图

> ✅ 已全部完成 — v1.0.0 已发布
> 本路线图记录了从 v0.1.0 到 v1.0.0 的全部开发阶段。

---

## Phase 1: 基础设施与稳定性（当前 → v0.2.0）

| 优先级 | 任务 | 说明 | 文件/范围 |
|--------|------|------|-----------|
| 🔴 P0 | 添加 Error Boundary | 全局 + 页面级错误捕获，优雅降级 | `src/components/ErrorBoundary.tsx` |
| 🔴 P0 | 添加加载骨架屏 | 每个页面路由的 loading.tsx + Suspense fallback | `src/app/**/loading.tsx` |
| 🔴 P0 | 完善 TypeScript 严格模式 | 修复隐式 any，补充缺失的类型定义 | `tsconfig.json`, 各组件 |
| 🟡 P1 | 添加单元测试框架 | Vitest + React Testing Library | 配置文件 + 首批测试 |
| 🟡 P1 | 添加健康检查自愈 | 定时轮询 API 端点的可用性 | `src/app/api/health/` |
| 🟡 P1 | 环境变量校验 | 启动时校验必需的环境变量 | `src/lib/env.ts` |
| 🟢 P2 | 完善 i18n 文案覆盖 | 补齐缺失的翻译键 | `src/i18n/locales/` |

## Phase 2: 功能增强（v0.2.0 → v0.4.0）

| 优先级 | 任务 | 说明 |
|--------|------|------|
| 🔴 P0 | 完善国际化翻译 | 所有 UI 文案中英文双覆盖 |
| 🔴 P0 | 数据导出功能 | CSV/JSON 导出成本、活动日志 |
| 🟡 P1 | 通知系统增强 | 通知历史、已读/未读标记、通知偏好 |
| 🟡 P1 | 数据备份与恢复 | SQLite 数据库导出/导入 |
| 🟡 P1 | 批量文件操作 | 多选、批量删除/移动/下载 |
| 🟢 P2 | 搜索增强 | 全文搜索、搜索结果高亮、模糊匹配 |
| 🟢 P2 | 日历增强 | 月视图、年视图、事件拖拽 |

## Phase 3: 体验与工程化（v0.4.0 → v0.6.0）

| 优先级 | 任务 | 说明 |
|--------|------|------|
| 🔴 P0 | PWA 支持 | Service Worker、离线缓存、桌面图标 |
| 🔴 P0 | Docker 一键部署 | Dockerfile + docker-compose.yml |
| 🟡 P1 | 代码分割 + 懒加载 | 按路由分割、3D 组件动态导入 |
| 🟡 P1 | 多主题系统 | 亮色/暗色/自定义主题切换 |
| 🟡 P1 | 键盘快捷键 | 全局快捷键导航 |
| 🟢 P2 | 性能监控 | Web Vitals 采集 + 展示 |
| 🟢 P2 | CI/CD 流水线 | GitHub Actions 自动构建/测试/部署 |

## Phase 4: 生态与高级功能（v0.6.0 → v1.0.0）

| 优先级 | 任务 | 说明 |
|--------|------|------|
| 🔴 P0 | 多 Agent 远程管理 | 通过 ClawTeam API 管理远程 Agent |
| 🟡 P1 | WebSocket 实时推送 | 实时活动流、通知、Agent 状态 |
| 🟡 P1 | Agent 聊天界面 | 与 Agent 直接对话的 UI |
| 🟡 P1 | 插件系统 | 第三方插件热加载机制 |
| 🟢 P2 | 移动端 App | React Native 或 PWA 包装 |
| 🟢 P2 | 数据仪表盘自定义 | 用户可拖拽布局的小部件系统 |
| 🟢 P2 | 多语言扩展 | 日语、韩语、西班牙语等 |

---

## Phase 5: 品质打磨 + 多 Agent 互通（v1.0.0 → v1.2.0）

> 🆕 二期规划 — 核心方向：质量基础设施 + Hermes Agent 互通 + 插件生态
> "始于 OpenClaw，但不局限于 OpenClaw" — 通过 Adapter 模式支持多 Agent 后端

### Sprint 5.1: 质量基础设施（v1.1.0 — 预计 2 周）

| 优先级 | 任务 | 说明 | 验收标准 |
|--------|------|------|----------|
| 🔴 P0 | Playwright E2E 测试 | 覆盖核心用户流程 | 登录/Dashboard/Agent/Chat/Cron 全部通过 |
| 🔴 P0 | PWA 移动端适配 | 触控优化 + 底部导航栏 | 所有页面移动端可操作 |
| 🔴 P0 | Lighthouse CI 性能基线 | 持续监控 Performance | ≥ 90 |
| 🟡 P1 | 图片优化 | next/image + WebP | 体积减少 50% |
| 🟡 P1 | 补全组件测试 | 核心组件 React Testing Library 测试 | ≥ 20 个组件测试 |
| 🟢 P2 | 3D Office 性能优化 | 降面、LOD、懒加载 | FPS ≥ 30 |

### Sprint 5.2: Hermes Agent Adapter（v1.2.0 — 预计 3 周）

| 优先级 | 任务 | 说明 | 验收标准 |
|--------|------|------|----------|
| 🔴 P0 | HermesAdapter 核心实现 | 读取 config.yaml / sessions / memory | ✅ 成功检测 Hermes Agent |
| 🔴 P0 | Dashboard 多 Agent 视图 | 同时显示 OpenClaw + Hermes | ✅ 每个 Agent 独立卡片 |
| 🔴 P0 | Chat 支持后端切换 | 下拉选择 OpenClaw / Hermes | ✅ 消息路由正确 |
| 🟡 P1 | Hermes 成本追踪 | 解析模型调用记录汇总成本 | ✅ 每日成本趋势正确 |
| 🟡 P1 | Hermes 文件浏览器 | 查看 Hermes Agent 的工作目录 | ✅ 目录结构准确 |
| 🟡 P1 | Hermes Cron 管理 | 可视化任务编排 | ✅ 任务状态正确 |
| 🟢 P2 | ACP 协议支持 | 通过 ACP 连接任意兼容 Agent | ✅ 基础通信可用 |

### Sprint 5.3: 插件生态（v1.3.0 — 预计 2 周）

| 优先级 | 任务 | 说明 | 验收标准 |
|--------|------|------|----------|
| 🟡 P1 | 插件商店 UI | 浏览、搜索、一键安装 | 商店页面可用 |
| 🟡 P1 | 插件开发文档 | 开发者如何写插件 | 完整的 PLUGIN_DEV.md |
| 🟡 P1 | 数据看板增强 | 图表自定义 + PDF/PNG 导出 | 看板更灵活 |
| 🟢 P2 | 插件脚手架 | `npm create feicontrol-plugin` | 30 秒创建插件项目 |

### v1.3 之后：长期维护模式

稳定维护 + 生态扩展，不做大版本升级。

---

## 里程碑总览

| 版本 | 阶段 | 状态 |
|------|------|------|
| v0.1.0 → v0.2.0 | Phase 1: 基础设施与稳定性 | ✅ 已完成 |
| v0.2.0 → v0.4.0 | Phase 2: 功能增强 | ✅ 已完成 |
| v0.4.0 → v0.6.0 | Phase 3: 体验与工程化 | ✅ 已完成 |
| v0.6.0 → v1.0.0 | Phase 4: 生态与高级功能 | ✅ 已完成 |
| **v1.0.0 → v1.1.0** | **Sprint 5.1: 质量基础设施** | **🆕 规划中** |
| **v1.1.0 → v1.2.0** | **Sprint 5.2: Hermes Agent Adapter** | **📅 待定** |
| **v1.2.0 → v1.3.0** | **Sprint 5.3: 插件生态** | **📅 待定** |
