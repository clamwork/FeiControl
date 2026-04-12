# 国际化快速上手指南

## 🚀 5分钟开始国际化任何页面

### 步骤1: 导入Hook (30秒)

```tsx
// 在页面顶部添加
import { useI18n } from "@/i18n";
```

### 步骤2: 获取翻译函数 (30秒)

```tsx
export default function MyPage() {
  const { t } = useI18n();

  // ... 其余代码
}
```

### 步骤3: 替换硬编码文本 (主要工作)

**之前:**
```tsx
<h1>My Page Title</h1>
<p>This is a description</p>
<button>Click Me</button>
```

**之后:**
```tsx
<h1>{t("my_page.title")}</h1>
<p>{t("my_page.description")}</p>
<button>{t("common.click_me") || "Click Me"}</button>
```

### 步骤4: 添加翻译键 (每个语言文件)

**src/i18n/locales/zh.json:**
```json
{
  "my_page": {
    "title": "我的页面",
    "description": "这是一个描述"
  }
}
```

**src/i18n/locales/en.json:**
```json
{
  "my_page": {
    "title": "My Page",
    "description": "This is a description"
  }
}
```

## 📋 完整示例: Actions页面国际化

### 1. 修改组件

```tsx
"use client";
import { useI18n } from "@/i18n";

export default function ActionsPage() {
  const { t } = useI18n();

  const actions = [
    {
      label: t("actions.heartbeat.label"),
      description: t("actions.heartbeat.description"),
      // ...
    },
    // ... 更多actions
  ];

  return (
    <div>
      <h1>{t("actions.title")}</h1>
      <p>{t("actions.subtitle")}</p>

      {actions.map((action) => (
        <div key={action.label}>
          <h2>{action.label}</h2>
          <p>{action.description}</p>
          <button>{t("actions.button.run")}</button>
        </div>
      ))}
    </div>
  );
}
```

### 2. 确认翻译键存在

检查 `src/i18n/locales/zh.json` 和 `en.json`,确保有:
```json
{
  "actions": {
    "title": "快速操作",
    "subtitle": "一键运行常见的维护和诊断任务",
    "heartbeat": {
      "label": "心跳检查",
      "description": "检查所有服务是否在线且站点可访问"
    },
    "button": {
      "run": "运行",
      "running": "运行中..."
    }
  }
}
```

## 🔍 查找需要国际化的文本

### 方法1: 手动检查

在页面文件中搜索:
- 所有引号内的中文/英文文本
- JSX标签之间的文本
- 按钮文本、标题、描述等

### 方法2: 使用正则表达式

```bash
# 查找所有硬编码的中文字符串
grep -rn "[\u4e00-\u9fff]" src/app/(dashboard)/your-page/

# 查找所有JSX文本节点
grep -rn ">[^<]*<" src/app/(dashboard)/your-page/*.tsx
```

## ⚡ 批量替换技巧

### VS Code多光标编辑

1. 选中所有相同的文本 (Ctrl+D)
2. 同时编辑所有选中的内容
3. 替换为 `{t("key.name")}`

### 查找替换模式

**查找:**
```
>(Some Text)<
```

**替换:**
```
>{t("module.some_text")}<
```

## 🎯 常见场景处理

### 1. 数组/对象中的文本

```tsx
// ❌ 之前
const items = [
  { name: "Item 1" },
  { name: "Item 2" }
];

// ✅ 之后 (在组件内部)
const items = [
  { name: t("items.item_1") },
  { name: t("items.item_2") }
];
```

### 2. 带变量的文本

```tsx
// ❌ 之前
<p>You have {count} items</p>

// ✅ 之后
<p>{t("items.count", { count })}</p>

// 翻译文件中:
// "count": "You have {count} items"
```

### 3. 条件文本

```tsx
// ❌ 之前
<span>{isActive ? "Active" : "Inactive"}</span>

// ✅ 之后
<span>{isActive ? t("common.active") : t("common.inactive")}</span>
```

### 4. 动态列表

```tsx
// ✅ 在map中使用
{items.map((item) => (
  <div key={item.id}>
    <h3>{t(`items.${item.type}.name`)}</h3>
    <p>{item.description}</p> {/* 如果description来自API,不需要翻译 */}
  </div>
))}
```

## 🧪 测试清单

完成国际化后,检查:

- [ ] 切换到中文,所有文本显示正确
- [ ] 切换到英文,所有文本显示正确
- [ ] 没有控制台警告 (缺失翻译键)
- [ ] 带变量的文本正确替换
- [ ] 条件文本在所有状态下都正确
- [ ] 构建成功 (`npm run build`)

## 🐛 常见问题

### Q: 翻译不显示?

**A:** 检查:
1. 是否正确导入了 `useI18n`
2. 组件是否是 `"use client"`
3. 翻译键是否正确
4. 是否在 `I18nProvider` 内

### Q: 看到翻译键而不是文本?

**A:** 翻译键不存在,检查:
1. JSON文件格式是否正确
2. 键名拼写是否正确
3. 是否同时更新了zh.json和en.json

### Q: 切换语言后文本没更新?

**A:** 确保:
1. 使用了 `useI18n()` Hook
2. 不是静态生成的内容
3. 组件正确订阅了Context变化

## 📚 参考资源

- 完整指南: `docs/i18n-guide.md`
- 实施总结: `docs/i18n-implementation-summary.md`
- 翻译键示例: `src/i18n/locales/zh.json`

## 💬 需要帮助?

查看已国际化的组件作为参考:
- `src/components/TenacitOS/TopBar.tsx`
- `src/components/TenacitOS/Dock.tsx`
- `src/components/LanguageSwitcher.tsx`

---

**提示**: 从一个简单的页面开始练习,熟悉后再处理复杂页面!
