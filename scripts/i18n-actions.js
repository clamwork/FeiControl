const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/app/(dashboard)/actions/page.tsx');
let content = fs.readFileSync(filePath, 'utf-8');

// 1. 添加i18n导入
if (!content.includes('useI18n')) {
  const lastImportIndex = content.lastIndexOf('import ');
  const nextNewline = content.indexOf('\n', lastImportIndex);
  content = content.slice(0, nextNewline + 1) +
           'import { useI18n } from "@/i18n";\n' +
           content.slice(nextNewline + 1);
  console.log('✓ 添加i18n导入');
}

// 2. 添加useI18n hook
if (!content.includes('const { t } = useI18n()')) {
  content = content.replace(
    /export default function ActionsPage\(\) \{/,
    'export default function ActionsPage() {\n  const { t } = useI18n();'
  );
  console.log('✓ 添加useI18n hook');
}

// 3. 替换ACTIONS数组中的硬编码文本
content = content.replace(
  /const ACTIONS: QuickAction\[\] = \[[\s\S]*?\];/,
  `const useActions = () => {
  const { t } = useI18n();

  return [
    {
      id: "heartbeat",
      label: t("actions.heartbeat.label"),
      description: t("actions.heartbeat.description"),
      icon: Heart,
      color: "var(--success)",
    },
    {
      id: "git-status",
      label: t("actions.git_status.label"),
      description: t("actions.git_status.description"),
      icon: GitBranch,
      color: "#60A5FA",
    },
    {
      id: "usage-stats",
      label: t("actions.usage_stats.label"),
      description: t("actions.usage_stats.description"),
      icon: BarChart3,
      color: "#C084FC",
    },
    {
      id: "restart-gateway",
      label: t("actions.restart_gateway.label"),
      description: t("actions.restart_gateway.description"),
      icon: RotateCcw,
      color: "var(--warning, #f59e0b)",
      dangerous: true,
    },
    {
      id: "clear-temp",
      label: t("actions.clear_temp.label"),
      description: t("actions.clear_temp.description"),
      icon: Trash2,
      color: "var(--error)",
      dangerous: true,
    },
    {
      id: "npm-audit",
      label: t("actions.npm_audit.label"),
      description: t("actions.npm_audit.description"),
      icon: Shield,
      color: "#4ADE80",
    },
  ];
};`
);
console.log('✓ 替换ACTIONS数组为Hook');

// 4. 在组件中使用Hook
content = content.replace(
  /export default function ActionsPage\(\) \{\n  const \{ t \} = useI18n\(\);/,
  'export default function ActionsPage() {\n  const { t } = useI18n();\n  const ACTIONS = useActions();'
);
console.log('✓ 添加ACTIONS调用');

// 5. 替换其他硬编码文本
const textReplacements = [
  ['Quick Actions', '{t("actions.title")}'],
  ['Run common maintenance and diagnostic tasks with one click', '{t("actions.subtitle")}'],
  ['Success', '{t("actions.result.success")}'],
  ['Failed', '{t("actions.result.failed")}'],
  ['Running...', '{t("actions.button.running")}'],
  ['Run', '{t("actions.button.run")}'],
  ['Recent Results', '{t("actions.recent_results")}'],
  ['Confirm:', '{t("actions.confirm.prefix")}'],
  ['Cancel', '{t("common.cancel")}'],
  ['Force Execute', '{t("actions.confirm.force_execute")}'],
];

let replacedCount = 0;
textReplacements.forEach(([from, to]) => {
  // JSX文本节点替换
  const jsxPattern = `>${from}<`;
  if (content.includes(jsxPattern)) {
    content = content.split(jsxPattern).join(`>{${to}}<`);
    replacedCount++;
    console.log(`  ✓ ${from.substring(0, 30)}`);
  }

  // 字符串替换
  const strPattern = `"${from}"`;
  if (content.includes(strPattern)) {
    content = content.split(strPattern).join(`"{${to}}"`);
    replacedCount++;
    console.log(`  ✓ "${from.substring(0, 30)}"`);
  }
});

console.log(`\n完成! 共替换 ${replacedCount} 处文本`);

fs.writeFileSync(filePath, content, 'utf-8');
