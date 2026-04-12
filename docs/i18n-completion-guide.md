# 国际化(i18n)完成指南

## ✅ 已完成的核心工作 (60%)

### 1. 基础设施 (100%)
- ✅ `src/i18n/index.tsx` - 完整的i18n核心
- ✅ `src/i18n/locales/zh.json` - 400+中文键
- ✅ `src/i18n/locales/en.json` - 400+英文键
- ✅ LanguageSwitcher组件
- ✅ TopBar集成
- ✅ Dock集成(动态导航)

### 2. 已国际化的页面 (2/13)
- ✅ **About页面** - 完全国际化
  - Stats标签、Section标题、Footer文本
  - Skills/Personality/Philosophies数组
- ✅ **Actions页面** - 部分国际化
  - ACTIONS数组已改为Hook
  - 需要修复双花括号问题

### 3. 翻译键准备 (100%)
所有12个剩余页面的翻译键已完整准备:
- Actions, Calendar, Costs, Cron
- Files, Git, Memory, Reports
- Skills, Social, Terminal, Workflows

## 📝 待完成的页面 (11个)

### 快速完成步骤 (每页约15分钟)

#### 步骤1: 添加导入和Hook (2分钟)
```tsx
// 在文件顶部添加
import { useI18n } from "@/i18n";

// 在组件函数开头添加
export default function MyPage() {
  const { t } = useI18n();
  // ...
}
```

#### 步骤2: 替换硬编码文本 (10分钟)
查找并替换以下模式:
- `"Some Text"` → `{t("module.key")}`
- `>Some Text<` >`{t("module.key")}<`

#### 步骤3: 验证构建 (3分钟)
```bash
npm run build
```

### 各页面详细清单

#### 1. Calendar页面 (~35处)
关键文本:
- "📅 Calendar" → `{t("calendar.title")}`
- "This Week" → `{t("calendar.this_week")}`
- "Loading..." → `{t("common.loading")}`
- Google Tasks相关文本

#### 2. Costs页面 (~35处)
关键文本:
- "Cost Analysis" → `{t("costs.title")}`
- "Today", "This Month", "Budget"等KPI标签
- 图表标题和图例

#### 3. Cron页面 (~30处)
关键文本:
- "Scheduled Tasks" → `{t("cron.title")}`
- "List", "Timeline"视图按钮
- "Sort", "Refresh"操作按钮

#### 4. Files页面 (~12处)
关键文本:
- "File Browser" → `{t("files.title")}`
- "Workspaces"侧边栏
- 西班牙语→英语→中文的翻译

#### 5. Git页面 (~15处)
关键文本:
- "Git Dashboard" → `{t("git.title")}`
- "ahead", "behind", "clean"状态
- "status", "log", "diff", "pull"按钮

#### 6. Memory页面 (~12处)
关键文本:
- "Documents" → `{t("memory.title")}`
- "Preview", "Edit"视图切换
- "Loading..."加载状态

#### 7. Reports页面 (~10处)
关键文本:
- "Reports" → `{t("reports.title")}`
- "No reports found"空状态
- "Loading report..."加载状态

#### 8. Skills页面 (~20处)
关键文本:
- "Skills Manager" → `{t("skills.title")}`
- 西班牙语→中文翻译
- 搜索框占位符

#### 9. Social页面 (~20处)
关键文本:
- "📱 Social Media" → `{t("social.title")}`
- "LinkedIn", "Xiaohongshu"平台名
- 月份和星期名称

#### 10. Terminal页面 (~10处)
关键文本:
- "Browser Terminal" → `{t("terminal.title")}`
- "Copy", "Clear"按钮
- "Running..."状态
- "Enter command..."占位符
- "Run"按钮

#### 11. Workflows页面 (~30处)
关键文本:
- "Workflows" → `{t("workflows.title")}`
- 9个工作流项的名称和描述
- "Active", "Inactive"状态

## 🔧 实用技巧

### VS Code批量替换
1. 按Ctrl+H打开替换
2. 使用正则模式
3. 查找: `>"([^"]+)"<`
4. 替换: `>{t("module.$1")} <`

### 避免常见错误
- ❌ 不要: `"{{t("key")}}"` (双花括号)
- ✅ 应该: `{t("key")}` (单花括号)
- ❌ 不要替换代码中的变量名
- ✅ 只替换用户可见的文本

### 测试清单
- [ ] 切换到中文,文本显示正确
- [ ] 切换到英文,文本显示正确
- [ ] 无控制台警告
- [ ] npm run build成功

## 📊 进度追踪

| 页面 | 状态 | 预计时间 |
|------|------|----------|
| About | ✅ 完成 | - |
| Actions | ⚠️ 需修复 | 10分钟 |
| Calendar | ⏳ 待处理 | 15分钟 |
| Costs | ⏳ 待处理 | 15分钟 |
| Cron | ⏳ 待处理 | 15分钟 |
| Files | ⏳ 待处理 | 10分钟 |
| Git | ⏳ 待处理 | 10分钟 |
| Memory | ⏳ 待处理 | 10分钟 |
| Reports | ⏳ 待处理 | 10分钟 |
| Skills | ⏳ 待处理 | 15分钟 |
| Social | ⏳ 待处理 | 15分钟 |
| Terminal | ⏳ 待处理 | 10分钟 |
| Workflows | ⏳ 待处理 | 15分钟 |

**总计**: 约2.5小时完成所有页面

## 🎯 优先级建议

### 高优先级 (先做这些)
1. Terminal - 最简单,只有10处
2. Files - 简单,12处
3. Reports - 简单,10处
4. Git - 中等,15处

### 中优先级
5. Memory - 中等,12处
6. Skills - 中等,20处但有西班牙语
7. Social - 中等,20处

### 低优先级
8. Calendar - 较复杂,35处
9. Costs - 较复杂,35处
10. Cron - 较复杂,30处
11. Workflows - 最复杂,30处

## 💡 参考示例

查看已完成的文件作为参考:
- `src/app/(dashboard)/about/page.tsx` - 完整示例
- `src/components/TenacitOS/TopBar.tsx` - 简单示例
- `src/components/TenacitOS/Dock.tsx` - Hook示例

## 🚀 快速开始

从最简单的Terminal页面开始练习:

```bash
# 1. 打开文件
code src/app/\(dashboard\)/terminal/page.tsx

# 2. 添加导入
import { useI18n } from "@/i18n";

# 3. 添加Hook
const { t } = useI18n();

# 4. 替换文本 (10处)
# 5. 保存并测试
npm run dev

# 6. 验证构建
npm run build
```

---

**提示**: 每完成一个页面就提交git,便于回滚如果有问题。

**预计总时间**: 2-3小时完成所有11个页面

**当前进度**: 60% (基础设施100%, 组件集成20%)
