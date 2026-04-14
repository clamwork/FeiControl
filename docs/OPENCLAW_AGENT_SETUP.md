# OpenClaw Agent 与系统对齐指南

## 📋 概述

本文档说明如何在 OpenClaw 中添加新的 Agent，并确保其与 FeiControl 系统的 3D Office 可视化正确对齐。

---

## 🏗️ 系统架构

### 1. OpenClaw Agent 存储结构

OpenClaw 使用**目录结构**管理 Agent（新版本）：

```
~/.openclaw/
├── openclaw.json              # 全局配置文件
├── agents/                    # Agent 配置和会话
│   ├── main/                  # Agent ID = "main"
│   │   ├── agent.json         # Agent 配置
│   │   └── sessions/          # 会话记录
│   │       ├── session1.jsonl
│   │       └── session2.jsonl
│   ├── arch/                  # Agent ID = "arch"
│   │   ├── agent.json
│   │   └── sessions/
│   └── codev/                 # Agent ID = "codev"
│       ├── agent.json
│       └── sessions/
└── workspaces/                # 各智能体的工作目录
    ├── main/                  # main agent 的工作区
    │   ├── projects/
    │   ├── documents/
    │   └── ...
    ├── arch/                  # arch agent 的工作区
    │   ├── designs/
    │   ├── specs/
    │   └── ...
    └── codev/                 # codev agent 的工作区
        ├── src/
        ├── tests/
        └── ...
```

**关键目录说明：**
- `agents/`: 存放每个 Agent 的配置和会话历史
- `workspaces/`: 存放每个 Agent 的工作文件（项目代码、文档等）
- 每个 Agent 有独立的 workspace 目录，互不干扰

### 2. FeiControl 系统组件

```
src/
├── app/api/office/route.ts           # API：扫描 agents 目录，获取实时状态
├── components/Office3D/
│   ├── agentsConfig.ts                # 3D 位置配置（desk, seat, table, rest）
│   ├── Office3D.tsx                   # 主场景
│   ├── AgentAvatar.tsx                # Agent 头像渲染
│   └── AgentPanel.tsx                 # Agent 详情面板
└── i18n/locales/                      # 国际化文本
```

---

## ➕ 添加新 Agent 的步骤

### 步骤 1：在 OpenClaw 中创建 Agent

#### 方法 A：使用 OpenClaw CLI（推荐）

```bash
# 基本语法
openclaw agents add <agent-id> \
  --workspace ~/.openclaw/workspaces/<agent-id> \
  --model "<model-name>"

# ✅ 示例：添加一个架构师 agent
openclaw agents add arch \
  --workspace ~/.openclaw/workspaces/arch \
  --model "google/gemma-4-e2b"

# 示例：添加一个开发者 agent
openclaw agents add codev \
  --workspace ~/.openclaw/workspaces/codev \
  --model "google/gemma-4-e2b"

# 示例：添加一个自定义 agent
openclaw agents add myagent \
  --workspace ~/.openclaw/workspaces/myagent \
  --model "google/gemma-4-e2b"
```

**命令参数说明：**
- `<agent-id>`: Agent 的唯一标识符（如 `arch`, `codev`, `myagent`），将作为目录名
- `--workspace`: Agent 的工作区路径，通常为 `~/.openclaw/workspaces/<agent-id>`
- `--model`: 使用的 AI 模型（如 `google/gemma-4-e2b`）

执行后，OpenClaw 会自动创建以下结构：
```
~/.openclaw/
├── agents/
│   └── arch/                   # Agent 配置和会话
│       ├── agent.json          # 自动生成的配置
│       └── sessions/           # 会话记录目录
└── workspaces/
    └── arch/                   # Agent 的工作区目录（存放工作文件）
        ├── projects/
        ├── documents/
        └── ...
```

**说明：**
- `agents/arch/`: 存储 Agent 的配置和对话历史
- `workspaces/arch/`: 存储 Agent 处理的工作文件（代码、文档等）

### 步骤 2：配置 Agent 属性

使用 CLI 创建 agent 后，可以编辑 `agent.json` 添加 UI 配置：

```bash
# 编辑 arch agent 的配置文件
nano ~/.openclaw/agents/arch/agent.json
```

在 `agent.json` 中可以添加 UI 配置：

```json
{
  "name": "Architect",                          // 显示名称（CLI 已设置）
  "model": {                                    // 模型配置（CLI 已设置）
    "primary": "google/gemma-4-e2b"
  },
  "workspace": "~/.openclaw/workspaces/arch",  // 工作区路径（CLI 已设置）
  "ui": {                                       // ⚠️ 需要手动添加 UI 配置
    "emoji": "🏗️",                             // Emoji 图标
    "color": "#607D8B"                         // 主题色
  }
}
```
```

**字段说明：**
- `name`: Agent 的显示名称（CLI 已设置）
- `model.primary`: 使用的 AI 模型（CLI 已设置）
- `workspace`: Agent 的工作区路径（CLI 已设置），指向 `~/.openclaw/workspaces/arch/`
- `ui.emoji`: 在 3D Office 中显示的 emoji（需手动添加）
- `ui.color`: Agent 的主题颜色（需手动添加）

> 💡 **提示**：
> - CLI 会自动创建基本的 `agent.json`，但 UI 配置（emoji 和 color）需要手动添加
> - `workspace` 路径对应 `~/.openclaw/workspaces/{agentId}/` 目录，Agent 在此目录中处理文件

### 步骤 3：在系统中注册 3D 位置

编辑 `src/components/Office3D/agentsConfig.ts`，添加新 Agent 的位置配置：

```typescript
export const AGENTS: AgentConfig[] = [
  // ... 现有 agents
  
  {
    id: "myagent",                          // ⚠️ 必须与目录名一致
    name: "My Custom Agent",                // 默认名称（会被 agent.json 覆盖）
    emoji: "🚀",                            // 默认 emoji（会被 agent.json 覆盖）
    deskPosition: [0, 0, 5],                // 🪑 办公桌位置 [x, y, z]
    seatPosition: [0, 0.62, 6.0],           // 🧘 空闲时座位位置
    tablePosition: [0, 0.6, 2.0],           // 🤝 工作时圆桌位置
    restPosition: [10, 0.62, 8],            // 😴 休眠时休息位置
    restRotation: Math.PI,                  // 休息时的朝向
    restPose: 'sit',                        // 'sit' 或 'lie'
    faceDirection: Math.atan2(0, -5),       // 空闲时面向方向
    position: [0, 0, 5],                    // 兼容旧版，同 deskPosition
    color: "#FF6B6B",                       // 默认颜色（会被 agent.json 覆盖）
    role: "Custom Role",                    // 角色描述
  },
];
```

**位置坐标说明：**
- **X 轴**: 左右（负数=左，正数=右）
- **Y 轴**: 上下（通常为 0 地面，0.62 坐姿高度）
- **Z 轴**: 前后（负数=后，正数=前）

**办公室布局参考：**
```
        后方 (Z = -8)
           ┌─────────┐
           │  Main   │  ← Supervisor
           └─────────┘
    
    ┌──────┐     ┌──────┐
    │Codev │     │Social│  ← 前排
    └──────┘     └──────┘
    
    ┌──────┐     ┌──────┐
    │Content│    │Teacher│ ← 后排
    └──────┘     └──────┘
    
           ┌─────┐
           │Round│  ← 中央圆桌（工作时聚集）
           │Table│
           └─────┘
           
        前方 (Z = +8)
```

### 步骤 4：重启服务

```bash
# 重启 Next.js 开发服务器
npm run dev

# 或者生产环境
npm run build
npm start
```

---

## 🔄 数据流说明

### 1. Agent 发现流程

```
API 启动
  ↓
扫描 ~/.openclaw/agents/ 目录
  ↓
获取所有子目录名作为 agent IDs
  ↓
对每个 agent ID：
  ├─ 读取 agent.json（如果存在）
  ├─ 解析 sessions/*.jsonl 文件
  ├─ 检测当前状态（working/idle/sleeping）
  └─ 返回 agent 信息
```

### 2. 状态检测逻辑

系统在 `src/app/api/office/route.ts` 中实现：

```typescript
// 状态优先级：
1. Lock 文件存在 → working
2. 文件大小正在增长 → working
3. 最后修改 < 2分钟 & 会话未结束 → working
4. 最后修改 < 30分钟 → idle
5. 其他情况 → sleeping
```

### 3. 3D 渲染流程

```
Office3D 组件加载
  ↓
调用 /api/office 获取 agents 列表
  ↓
合并 agentsConfig.ts 中的位置配置
  ↓
为每个 agent 创建：
  ├─ AgentAvatar（3D 角色）
  ├─ AgentDesk（办公桌）
  └─ 根据状态切换位置：
      - sleeping → restPosition
      - idle → seatPosition
      - working → tablePosition
```

---

## 🎨 自定义 Agent 外观

### 修改 Emoji 和颜色

**方法 1：通过 agent.json（推荐）**

```json
{
  "ui": {
    "emoji": "🎯",
    "color": "#9C27B0"
  }
}
```

**方法 2：修改 agentsConfig.ts**

```typescript
{
  id: "myagent",
  emoji: "🎯",
  color: "#9C27B0",
  // ...
}
```

> ⚠️ **注意**：`agent.json` 的配置优先级更高，会覆盖 `agentsConfig.ts` 中的默认值。

### 支持的 Emoji 示例

- 🤖 机器人（Main Agent）
- 💻 开发者
- 👩🏻‍💻 社交媒体
- 📣 内容创作
- 👩🏫 教师
- 🔍 扫描器
- 🏗️ 架构师
- 🚀 自定义
- 🎯 目标导向
- 📊 数据分析

---

## 📊 Agent 状态说明

| 状态 | 说明 | 3D 表现 | 触发条件 |
|------|------|---------|----------|
| **working** | 工作中 | 移动到圆桌，打字动画 | 有 lock 文件或会话文件正在写入 |
| **idle** | 空闲 | 坐在办公桌前 | 最近 30 分钟有活动 |
| **sleeping** | 休眠 | 躺在休息区，zzZ 动画 | 超过 30 分钟无活动 |
| **thinking** | 思考中 | 蓝色脉冲动画 | API 返回 thinking 状态 |
| **error** | 错误 | 红色标记 | 获取状态失败 |

---

## 🔧 故障排查

### 问题 1：新 Agent 不显示

**检查清单：**
1. ✅ 目录是否存在：`~/.openclaw/agents/myagent/`
2. ✅ 是否在 `agentsConfig.ts` 中添加了配置
3. ✅ `id` 是否与目录名完全一致
4. ✅ 是否重启了 Next.js 服务

**调试命令：**
```bash
# 检查目录
ls -la ~/.openclaw/agents/

# 测试 API
curl http://localhost:3000/api/office | jq '.agents[] | {id, name}'
```

### 问题 2：Agent 名称/Emoji 不正确

**原因：** 可能 `agent.json` 配置有误或缺失

**解决：**
```bash
# 检查 agent.json
cat ~/.openclaw/agents/myagent/agent.json

# 确保 JSON 格式正确
jq . ~/.openclaw/agents/myagent/agent.json
```

### 问题 3：位置重叠或不合理

**调整方法：**
1. 打开浏览器开发者工具
2. 在控制台查看当前坐标：
   ```javascript
   // 在 Office3D 场景中点击 agent，查看其位置
   ```
3. 修改 `agentsConfig.ts` 中的坐标值
4. 刷新页面查看效果

**建议：**
- 保持 X 轴间距至少 2 个单位
- Z 轴前后排间距至少 3 个单位
- 圆桌位置应在中心区域（X: -3~3, Z: -2~2）

### 问题 4：状态始终显示 sleeping

**可能原因：**
1. Session 文件不存在或为空
2. 权限问题导致无法读取 sessions 目录

**解决：**
```bash
# 检查 sessions 目录
ls -la ~/.openclaw/agents/myagent/sessions/

# 创建测试会话
echo '{"type":"message","message":{"role":"user","content":"test"}}' \
  > ~/.openclaw/agents/myagent/sessions/test.jsonl

# 检查文件权限
chmod -R 755 ~/.openclaw/agents/
```

---

## 📝 最佳实践

### 1. Agent ID 命名规范

- ✅ 使用小写字母和数字：`myagent`, `agent2`
- ✅ 使用下划线分隔：`data_analyzer`
- ❌ 避免大写字母：`MyAgent`
- ❌ 避免特殊字符：`my-agent`, `my.agent`

### 2. 位置规划原则

```typescript
// 推荐的办公室布局
const LAYOUT = {
  // 主管区域（后方中央）
  supervisor: { x: 0, z: -8 },
  
  // 前排工作区
  front_left: { x: -5.5, z: -4 },
  front_right: { x: 5.5, z: -4 },
  
  // 后排工作区
  back_left: { x: -5.5, z: 3 },
  back_right: { x: 5.5, z: 3 },
  
  // 侧边工作区
  side_left: { x: -3.5, z: 6 },
  side_right: { x: 3.5, z: 6 },
  
  // 中央圆桌（工作聚集点）
  round_table: { x: 0, z: 0 },
  
  // 休息区（右侧）
  lounge: { x: 10, z: 8 },
};
```

### 3. 颜色搭配建议

```typescript
const COLOR_PALETTE = {
  red: "#8B0000",      // 主管
  green: "#4CAF50",    // 开发
  blue: "#0077B5",     // 社交
  pink: "#E91E63",     // 内容
  purple: "#9C27B0",   // 教学
  orange: "#FF5722",   // 扫描
  gray: "#607D8B",     // 架构
  teal: "#009688",     // 新增推荐
  indigo: "#3F51B5",   // 新增推荐
  amber: "#FFC107",    // 新增推荐
};
```

### 4. 性能优化

- **限制 Agent 数量**：建议不超过 10 个活跃 Agent
- **Session 清理**：定期清理旧的 session 文件
- **状态缓存**：API 已实现文件大小缓存，避免频繁读取

---

## 🔗 相关文档

- [OpenClaw 官方文档](https://github.com/openclaw/openclaw)
- [FeiControl 项目 README](../README.md)
- [3D Office 设计说明](./OFFICE_3D_DESIGN.md)
- [国际化指南](../docs/i18n-guide.md)

---

## ❓ 常见问题

### Q: 可以动态添加 Agent 而不重启服务吗？

A: 目前需要重启 Next.js 服务才能识别新 Agent。API 会在每次请求时重新扫描目录，但 `agentsConfig.ts` 的更改需要重新编译。

### Q: 如何让 Agent 使用不同的 3D 模型？

A: 当前所有 Agent 使用相同的像素风格模型，仅通过颜色和 emoji 区分。未来版本可能支持自定义模型。

### Q: Agent 的工作任务从哪里获取？

A: 从最新的 session JSONL 文件中提取最后一条用户消息作为 `currentTask`。

### Q: 可以禁用某个 Agent 的 3D 显示吗？

A: 可以从 `agentsConfig.ts` 中删除该 Agent 的配置，但它仍会在 API 返回中出现。完全隐藏需要从 OpenClaw 中移除该 Agent。

---

## 📞 技术支持

如遇到问题，请：
1. 检查浏览器控制台的错误信息
2. 查看 Next.js 服务器的日志输出
3. 验证 OpenClaw 目录结构和权限
4. 提交 Issue 并附上相关日志

---

**最后更新**: 2026-04-12  
**维护者**: FeiControl Team
