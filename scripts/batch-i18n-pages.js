/**
 * 批量国际化脚本 - 处理所有Dashboard页面
 * 自动添加useI18n hook并替换常见硬编码文本
 */
const fs = require('fs');
const path = require('path');

const pagesDir = path.join(__dirname, '../src/app/(dashboard)');

// 需要处理的页面列表
const pages = [
  'actions/page.tsx',
  'calendar/page.tsx',
  'costs/page.tsx',
  'cron/page.tsx',
  'files/page.tsx',
  'git/page.tsx',
  'memory/page.tsx',
  'reports/page.tsx',
  'skills/page.tsx',
  'social/page.tsx',
  'terminal/page.tsx',
  'workflows/page.tsx',
];

// 通用替换规则
const commonReplacements = {
  // 导入语句
  addI18nImport: (content) => {
    if (!content.includes('useI18n')) {
      // 在最后一个import后添加
      const lastImportIndex = content.lastIndexOf('import ');
      const nextNewline = content.indexOf('\n', lastImportIndex);
      return content.slice(0, nextNewline + 1) +
             'import { useI18n } from "@/i18n";\n' +
             content.slice(nextNewline + 1);
    }
    return content;
  },

  // 添加useI18n hook
  addI18nHook: (content) => {
    if (!content.includes('const { t } = useI18n()')) {
      // 在函数开头添加
      return content.replace(
        /(export default function \w+\(\) \{)/,
        '$1\n  const { t } = useI18n();'
      );
    }
    return content;
  },
};

// 页面特定的替换规则
const pageSpecificRules = {
  'actions/page.tsx': {
    replacements: [
      ['Quick Actions', '{t("actions.title")}'],
      ['Run common maintenance and diagnostic tasks with one click', '{t("actions.subtitle")}'],
      ['Heartbeat Check', '{t("actions.heartbeat.label")}'],
      ['Check if all services are online', '{t("actions.heartbeat.description")}'],
      ['Git Status', '{t("actions.git_status.label")}'],
      ['Collect Usage Stats', '{t("actions.usage_stats.label")}'],
      ['Restart Gateway', '{t("actions.restart_gateway.label")}'],
      ['Clear Temp Files', '{t("actions.clear_temp.label")}'],
      ['NPM Security Audit', '{t("actions.npm_audit.label")}'],
      ['Success', '{t("actions.result.success")}'],
      ['Failed', '{t("actions.result.failed")}'],
      ['Running...', '{t("actions.button.running")}'],
      ['Run', '{t("actions.button.run")}'],
      ['Recent Results', '{t("actions.recent_results")}'],
      ['Confirm:', '{t("actions.confirm.prefix")}'],
      ['Cancel', '{t("common.cancel")}'],
      ['Force Execute', '{t("actions.confirm.force_execute")}'],
    ]
  },
  'calendar/page.tsx': {
    replacements: [
      ['📅 Calendar', '{t("calendar.title")}'],
      ['Google Calendar · Google Tasks', '{t("calendar.subtitle")}'],
      ['This Week', '{t("calendar.this_week")}'],
      ['Loading...', '{t("common.loading")}'],
      ['Unable to fetch calendar events', '{t("calendar.error.fetch_events")}'],
      ['✅ Google Tasks', '{t("calendar.google_tasks.title")}'],
      ['No Google Tasks', '{t("calendar.google_tasks.no_tasks")}'],
    ]
  },
  'costs/page.tsx': {
    replacements: [
      ['Cost Analysis', '{t("costs.title")}'],
      ['Token usage and cost tracking', '{t("costs.subtitle")}'],
      ['7 days', '{t("costs.timeframe.7d")}'],
      ['30 days', '{t("costs.timeframe.30d")}'],
      ['90 days', '{t("costs.timeframe.90d")}'],
      ['Today', '{t("costs.kpi.today")}'],
      ['This Month', '{t("costs.kpi.this_month")}'],
      ['Projected Monthly', '{t("costs.kpi.projected")}'],
      ['Budget', '{t("costs.kpi.budget")}'],
      ['Daily Cost Trend', '{t("costs.chart.daily_trend")}'],
      ['Cost by Agent', '{t("costs.chart.by_agent")}'],
      ['Cost by Model', '{t("costs.chart.by_model")}'],
    ]
  },
  'cron/page.tsx': {
    replacements: [
      ['Scheduled Tasks', '{t("cron.title")}'],
      ['View tasks, next run times', '{t("cron.subtitle")}'],
      ['List', '{t("cron.view.list")}'],
      ['Timeline', '{t("cron.view.timeline")}'],
      ['Sort', '{t("cron.sort.label")}'],
      ['Refresh', '{t("common.refresh")}'],
      ['Total Tasks', '{t("cron.stats.total")}'],
      ['Enabled', '{t("cron.stats.enabled")}'],
      ['Recent Issues', '{t("cron.stats.issues")}'],
      ['No Scheduled Tasks', '{t("cron.empty.title")}'],
      ['Cancel', '{t("common.cancel")}'],
      ['Confirm Delete', '{t("cron.delete.confirm_button")}'],
    ]
  },
  'files/page.tsx': {
    replacements: [
      ['File Browser', '{t("files.title")}'],
      ['Browse agent workspaces and files', '{t("files.subtitle")}'],
      ['Workspaces', '{t("files.sidebar.workspaces")}'],
      ['Vista lista', '{t("files.view.list")}'],
      ['Vista iconos', '{t("files.view.grid")}'],
      ['Selecciona un workspace', '{t("files.empty.select_workspace")}'],
    ]
  },
  'git/page.tsx': {
    replacements: [
      ['Git Dashboard', '{t("git.title")}'],
      ['repositories', '{t("git.subtitle")}'],
      ['Refresh', '{t("common.refresh")}'],
      ['No Git repositories found', '{t("git.empty.no_repos")}'],
      ['ahead', '{t("git.status.ahead")}'],
      ['behind', '{t("git.status.behind")}'],
      ['clean', '{t("git.status.clean")}'],
      ['changes', '{t("git.status.changes")}'],
      ['status', '{t("git.action.status")}'],
      ['log', '{t("git.action.log")}'],
      ['diff', '{t("git.action.diff")}'],
      ['pull', '{t("git.action.pull")}'],
    ]
  },
  'memory/page.tsx': {
    replacements: [
      ['Documents', '{t("memory.title")}'],
      ['Browse and edit agent memory', '{t("memory.subtitle")}'],
      ['Workspaces', '{t("memory.sidebar.workspaces")}'],
      ['Refresh', '{t("common.refresh")}'],
      ['Preview', '{t("memory.view.preview")}'],
      ['Edit', '{t("memory.view.edit")}'],
      ['Loading...', '{t("common.loading")}'],
      ['Select a document', '{t("memory.empty.select_document")}'],
    ]
  },
  'reports/page.tsx': {
    replacements: [
      ['Reports', '{t("reports.title")}'],
      ['Analytics reports and insights', '{t("reports.subtitle")}'],
      ['Refresh reports', '{t("reports.refresh_tooltip")}'],
      ['Loading...', '{t("common.loading")}'],
      ['Reports', '{t("reports.count")}'],
      ['No reports found', '{t("reports.empty.no_reports")}'],
      ['Select a report', '{t("reports.empty.select_report")}'],
    ]
  },
  'skills/page.tsx': {
    replacements: [
      ['Skills Manager', '{t("skills.title")}'],
      ['Skills disponibles', '{t("skills.subtitle")}'],
      ['Total Skills', '{t("skills.stats.total")}'],
      ['Workspace Skills', '{t("skills.stats.workspace")}'],
      ['System Skills', '{t("skills.stats.system")}'],
      ['Buscar skills', '{t("skills.search.placeholder")}'],
      ['Todas', '{t("skills.filter.all")}'],
      ['Workspace', '{t("skills.filter.workspace")}'],
      ['System', '{t("skills.filter.system")}'],
      ['No se encontraron skills', '{t("skills.empty.no_skills")}'],
      ['WORKSPACE SKILLS', '{t("skills.section.workspace")}'],
      ['SYSTEM SKILLS', '{t("skills.section.system")}'],
      ['files', '{t("skills.card.files")}'],
      ['Homepage', '{t("skills.detail.homepage")}'],
    ]
  },
  'social/page.tsx': {
    replacements: [
      ['📱 Social Media', '{t("social.title")}'],
      ['Today', '{t("social.today")}'],
      ['📊 This Month\'s Stats', '{t("social.stats.title")}'],
      ['LinkedIn', '{t("social.platform.linkedin")}'],
      ['Xiaohongshu', '{t("social.platform.xiaohongshu")}'],
      ['Category Distribution', '{t("social.stats.category_distribution")}'],
      ['Publish Status', '{t("social.stats.publish_status")}'],
      ['✅ Published', '{t("social.stats.published")}'],
      ['🕐 Scheduled', '{t("social.stats.scheduled")}'],
      ['Coming Soon', '{t("social.coming_soon")}'],
      ['Last updated:', '{t("social.last_updated")}'],
    ]
  },
  'terminal/page.tsx': {
    replacements: [
      ['Browser Terminal', '{t("terminal.title")}'],
      ['Read-only commands only', '{t("terminal.subtitle")}'],
      ['Copy', '{t("terminal.copy")}'],
      ['Clear', '{t("terminal.clear")}'],
      ['Type a command', '{t("terminal.empty.type_command")}'],
      ['Arrow Up/Down', '{t("terminal.empty.history_hint")}'],
      ['Running...', '{t("terminal.running")}'],
      ['Enter command...', '{t("terminal.input.placeholder")}'],
      ['Run', '{t("terminal.input.run")}'],
    ]
  },
  'workflows/page.tsx': {
    replacements: [
      ['Workflows', '{t("workflows.title")}'],
      ['active flows', '{t("workflows.subtitle")}'],
      ['Total workflows', '{t("workflows.stats.total")}'],
      ['Active crons', '{t("workflows.stats.active_crons")}'],
      ['On-demand', '{t("workflows.stats.on_demand")}'],
      ['Active', '{t("workflows.status.active")}'],
      ['Inactive', '{t("workflows.status.inactive")}'],
      ['⏱ Cron', '{t("workflows.trigger.cron")}'],
      ['⚡ On-demand', '{t("workflows.trigger.demand")}'],
      ['Steps', '{t("workflows.steps_header")}'],
      ['Social Radar', '{t("workflows.items.social_radar.name")}'],
      ['AI & Web News', '{t("workflows.items.ai_news.name")}'],
      ['Trend Monitor', '{t("workflows.items.trend_monitor.name")}'],
      ['Daily LinkedIn Brief', '{t("workflows.items.linkedin_brief.name")}'],
      ['Newsletter Digest', '{t("workflows.items.newsletter_digest.name")}'],
      ['Email Categorization', '{t("workflows.items.email_categorization.name")}'],
      ['Weekly Newsletter', '{t("workflows.items.weekly_newsletter.name")}'],
      ['Advisory Board', '{t("workflows.items.advisory_board.name")}'],
      ['Git Backup', '{t("workflows.items.git_backup.name")}'],
      ['Nightly Evolution', '{t("workflows.items.nightly_evolution.name")}'],
    ]
  },
};

let totalProcessed = 0;
let totalReplacements = 0;

pages.forEach(pagePath => {
  const fullPath = path.join(pagesDir, pagePath);

  if (!fs.existsSync(fullPath)) {
    console.log(`⚠ 跳过: ${pagePath} (文件不存在)`);
    return;
  }

  console.log(`\n处理: ${pagePath}`);
  let content = fs.readFileSync(fullPath, 'utf-8');

  // 添加i18n导入
  const beforeImport = content;
  content = commonReplacements.addI18nImport(content);
  if (content !== beforeImport) {
    console.log('  ✓ 添加i18n导入');
  }

  // 添加useI18n hook
  const beforeHook = content;
  content = commonReplacements.addI18nHook(content);
  if (content !== beforeHook) {
    console.log('  ✓ 添加useI18n hook');
  }

  // 应用页面特定替换
  const rules = pageSpecificRules[pagePath];
  if (rules && rules.replacements) {
    let pageReplacements = 0;
    rules.replacements.forEach(([from, to]) => {
      // 简单的字符串替换,避免复杂的正则
      const searchStr1 = `"${from}"`;
      const replaceStr1 = `"{${to}}"`;
      const searchStr2 = `'${from}'`;
      const replaceStr2 = `'{${to}}'`;
      const searchStr3 = `>${from}<`;
      const replaceStr3 = `>{${to}}<`;

      if (content.includes(searchStr1)) {
        content = content.split(searchStr1).join(replaceStr1);
        pageReplacements++;
      } else if (content.includes(searchStr2)) {
        content = content.split(searchStr2).join(replaceStr2);
        pageReplacements++;
      } else if (content.includes(searchStr3)) {
        content = content.split(searchStr3).join(replaceStr3);
        pageReplacements++;
      }
    });

    if (pageReplacements > 0) {
      console.log(`  ✓ 替换了 ${pageReplacements} 处文本`);
      totalReplacements += pageReplacements;
    }
  }

  fs.writeFileSync(fullPath, content, 'utf-8');
  totalProcessed++;
});

console.log('\n' + '='.repeat(50));
console.log(`批量国际化完成!`);
console.log(`处理页面: ${totalProcessed}/${pages.length}`);
console.log(`总替换数: ${totalReplacements}`);
console.log('='.repeat(50));
console.log('\n⚠ 请手动检查每个页面,确保JSX语法正确!');
console.log('⚠ 运行 npm run build 验证构建是否成功');
