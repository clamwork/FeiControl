# 国际化 (i18n) 使用指南

## 概述

本项目已集成国际化支持,目前支持中文(zh)和英文(en)两种语言。

## 文件结构

```
src/i18n/
├── index.ts              # i18n核心工具和Hook
└── locales/
    ├── zh.json          # 中文翻译
    └── en.json          # 英文翻译
```

## 基本用法

### 1. 在组件中使用翻译

```tsx
import { useI18n } from "@/i18n";

export function MyComponent() {
  const { t } = useI18n();

  return (
    <div>
      <h1>{t("common.save")}</h1>
      <button>{t("common.cancel")}</button>
    </div>
  );
}
```

### 2. 翻译键命名规范

- 使用小写字母
- 使用下划线分隔单词
- 按模块组织: `module.key_name`
- 示例:
  - `common.save`
  - `topbar.search_placeholder`
  - `dock.cron_jobs`

### 3. 添加新的翻译

在 `src/i18n/locales/zh.json` 和 `en.json` 中添加对应的键值对:

```json
{
  "my_module": {
    "new_key": "新文本",
    "another_key": "Another text"
  }
}
```

### 4. 带参数的翻译

```tsx
// 翻译文件中
{
  "greeting": "你好, {name}!"
}

// 组件中
t("greeting", { name: "张三" })
// 输出: "你好, 张三!"
```

## 语言切换

语言切换组件已集成到顶部导航栏(TopBar),用户可以点击地球图标切换语言。

语言偏好会保存在 localStorage 中,下次访问时自动恢复。

## 已国际化的组件

- TopBar (顶部导航栏)
- Dock (侧边栏导航)
- LanguageSwitcher (语言切换器)

## 待国际化的页面

以下页面仍包含硬编码文本,需要逐步迁移到i18n:

- About 页面
- Calendar 页面
- Skills 页面
- 其他业务页面

## 最佳实践

1. **提取所有用户可见文本**: 不要硬编码任何显示给用户的文本
2. **保持一致的命名**: 使用相同的键名模式
3. **同步更新**: 添加新翻译时,确保同时更新所有语言文件
4. **测试切换**: 修改后测试语言切换功能是否正常
5. **避免动态键**: 尽量不使用动态生成的翻译键,便于维护

## 注意事项

- 所有使用 `useI18n` 的组件必须是客户端组件 (`"use client"`)
- 翻译文件会在首次加载时全部加载,注意控制文件大小
- 对于大量文本,考虑使用懒加载或代码分割
