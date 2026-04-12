const fs = require('fs');
const path = require('path');

// 读取现有翻译文件
const zhPath = path.join(__dirname, '../src/i18n/locales/zh.json');
const enPath = path.join(__dirname, '../src/i18n/locales/en.json');

const zhData = JSON.parse(fs.readFileSync(zhPath, 'utf-8'));
const enData = JSON.parse(fs.readFileSync(enPath, 'utf-8'));

// 添加缺失的翻译键 - 中文
const zhAdditions = {
  common: {
    refresh: "刷新",
    openclaw: "OpenClaw"
  },
  about: {
    stats: {
      uptime: "运行时间",
      activities: "活动",
      success_rate: "成功率",
      skills: "技能"
    },
    sections: {
      about: "关于",
      personality: "性格",
      philosophy: "工作理念",
      capabilities: "能力"
    },
    intro: {
      i_am: "我是",
      running_on: ",一个运行在",
      with_claude: "上的 AI 代理,以 Claude 为大脑。",
      purpose: "我的目的是协助",
      tasks: "处理日常任务:管理通信、安排日程、研究、文件管理,并充当数字副驾驶。",
      access: "我可以访问工作区、日历和集成——我谨慎而尊重地处理这一特权。"
    },
    skills: {
      telegram: "Telegram 机器人",
      twitter: "Twitter/X",
      web_search: "网络搜索",
      file_management: "文件管理",
      cron_scheduler: "定时调度器",
      memory_system: "记忆系统",
      youtube: "YouTube 研究",
      email: "电子邮件 (Gmail)"
    },
    footer: {
      built_with: "用 ♥ 构建于",
      tagline: "— 你的 AI 副驾驶"
    }
  },
  actions: {
    title: "快速操作",
    subtitle: "一键运行常见的维护和诊断任务",
    heartbeat: {
      label: "心跳检查",
      description: "检查所有服务是否在线且站点可访问"
    },
    git_status: {
      label: "Git 状态 (所有仓库)",
      description: "检查工作区仓库中未提交的更改"
    },
    usage_stats: {
      label: "收集使用统计",
      description: "获取磁盘、CPU 和内存使用情况概览"
    },
    restart_gateway: {
      label: "重启网关",
      description: "重启 OpenClaw 网关服务"
    },
    clear_temp: {
      label: "清理临时文件",
      description: "删除临时文件并修剪 PM2 日志"
    },
    npm_audit: {
      label: "NPM 安全审计",
      description: "检查 mission-control 依赖项中的安全漏洞"
    },
    result: {
      success: "成功",
      failed: "失败"
    },
    button: {
      running: "运行中...",
      run: "运行"
    },
    recent_results: "最近结果",
    confirm: {
      prefix: "确认:",
      message: "此操作可能影响正在运行的服务。确定要继续吗?",
      force_execute: "强制执行"
    }
  },
  calendar: {
    subtitle: "Google Calendar · Google Tasks",
    this_week: "本周",
    error: {
      fetch_events: "无法获取日历事件",
      fetch_tasks: "无法获取 Google Tasks",
      load_events: "加载日历事件失败",
      load_tasks: "加载 Google Tasks 失败"
    },
    task: {
      mark_incomplete: "点击标记为未完成",
      mark_complete: "点击标记为已完成",
      aria_mark_incomplete: "将 {title} 标记为未完成",
      aria_mark_complete: "将 {title} 标记为已完成"
    },
    google_tasks: {
      title: "✅ Google Tasks",
      pending_total: "待处理 {count} / 总计 {count}",
      configure_message: "Google Tasks 集成可用。在 .env.local 中配置 GOOGLE_TASKS_SCRIPT 以连接。",
      all_completed: "🎉 所有任务已完成!",
      completed_count: "已完成 ({count})",
      no_tasks: "暂无 Google Tasks",
      no_data: "无任务数据可用"
    },
    months: {
      january: "一月", february: "二月", march: "三月", april: "四月",
      may: "五月", june: "六月", july: "七月", august: "八月",
      september: "九月", october: "十月", november: "十一月", december: "十二月"
    },
    weekdays: {
      mon: "周一", tue: "周二", wed: "周三", thu: "周四",
      fri: "周五", sat: "周六", sun: "周日"
    }
  },
  costs: {
    subtitle: "跨所有代理的令牌使用和成本跟踪",
    timeframe: { "7d": "7天", "30d": "30天", "90d": "90天" },
    kpi: {
      today: "今天",
      vs_yesterday: "vs ¥{amount} 昨天",
      this_month: "本月",
      vs_last_month: "vs ¥{amount} 上月",
      projected: "预计月度",
      projected_note: "基于当前速度",
      budget: "预算"
    },
    chart: {
      daily_trend: "每日成本趋势",
      cost_label: "成本 ($)",
      by_agent: "按代理成本",
      by_model: "按模型成本",
      token_usage: "令牌使用 (每日)",
      input_tokens: "输入令牌",
      output_tokens: "输出令牌"
    },
    table: {
      model_pricing_title: "模型定价 (每百万令牌)",
      model: "模型",
      input: "输入",
      output: "输出",
      cache_read: "缓存读取",
      cache_write: "缓存写入",
      breakdown_title: "按代理详细分解",
      tokens: "令牌",
      cost: "成本",
      percent_total: "占总数的 %"
    },
    models: {
      claude_opus: "Claude Opus 4.6",
      claude_sonnet: "Claude Sonnet 4.6",
      claude_haiku: "Claude Haiku 4.5"
    }
  },
  cron: {
    subtitle: "查看任务、下次运行时间、最近结果和问题概览。",
    sort: {
      updated_desc: "最新更新优先",
      next_run_asc: "下次运行最早优先",
      last_run_desc: "上次运行最新优先",
      label: "排序"
    },
    view: { list: "列表", timeline: "时间线" },
    sorted_by: "按 \"{label}\" 排序",
    stats: { total: "总任务", enabled: "已启用", issues: "最近问题" },
    issues: { warning: "目前 {count} 个任务有最近失败。列表中显示红色错误指示器。" },
    empty: {
      title: "无定时任务",
      description: "通过 OpenClaw CLI 创建任务后,任务将显示在此处。"
    },
    timeline: {
      title: "未来 7 天时间线",
      timezone_note: "所有时间均以本地时区显示"
    },
    delete: {
      confirm_title: "删除 \"{name}\"?",
      confirm_button: "确认删除"
    },
    toast: {
      triggered_skipped: "触发成功,今天的计划运行已跳过",
      triggered: "触发",
      failed: "触发失败"
    }
  },
  files: {
    subtitle: "浏览代理工作区和文件",
    sidebar: { workspaces: "工作区" },
    view: { list: "列表视图", grid: "图标视图" },
    empty: { select_workspace: "选择一个工作区以浏览其文件" }
  },
  git: {
    subtitle: "{count} 个仓库 · {count} 个有更改",
    empty: { no_repos: "工作区中未找到 Git 仓库" },
    status: { ahead: "超前", behind: "落后", clean: "干净", changes: "更改" },
    action: { status: "状态", log: "日志", diff: "差异", pull: "拉取" },
    changes: {
      staged: "已暂存 ({count})",
      more: "+{count} 更多",
      modified: "已修改 ({count})",
      untracked: "未跟踪 ({count})"
    }
  },
  memory: {
    subtitle: "浏览和编辑代理记忆文档、规范和技能",
    sidebar: { workspaces: "工作区" },
    unsaved_changes: { confirm: "您有未保存的更改。确定要放弃它们吗?" },
    view: { preview: "预览", edit: "编辑" },
    empty: {
      select_document: "选择要预览或编辑的文档",
      select_workspace: "请选择工作区"
    }
  },
  reports: {
    subtitle: "分析报告和见解",
    refresh_tooltip: "刷新报告",
    count: "{count} 个报告",
    empty: {
      no_reports: "未找到报告",
      hint: "memory/ 中匹配 *-analysis-* 或 *-report-* 模式的报告将显示在此处",
      select_report: "选择报告进行预览"
    },
    loading_report: "加载报告中..."
  },
  skills: {
    subtitle: "OpenClaw 系统中可用的技能",
    stats: { total: "总技能", workspace: "工作区技能", system: "系统技能" },
    search: { placeholder: "搜索技能..." },
    filter: {
      all: "全部 ({count})",
      workspace: "工作区 ({count})",
      system: "系统 ({count})"
    },
    empty: { no_skills: "未找到技能" },
    section: { workspace: "工作区技能", system: "系统技能" },
    card: { files: "文件" },
    detail: {
      homepage: "主页",
      files_count: "文件",
      files_header: "文件 ({count})"
    }
  },
  social: {
    subtitle: "管理您的社交媒体存在",
    today: "今天",
    stats: {
      title: "📊 本月统计",
      posts_count: "{count} 篇帖子",
      category_distribution: "类别分布",
      publish_status: "发布状态",
      published: "✅ 已发布",
      scheduled: "🕐 已计划"
    },
    platform: { linkedin: "LinkedIn", xiaohongshu: "小红书" },
    coming_soon: "即将推出",
    last_updated: "最后更新:",
    post: { purpose_title: "帖子目的" },
    status: { published: "已发布", scheduled: "已计划" }
  },
  terminal: {
    subtitle: "仅限只读命令 (ls, cat, df, ps, git status 等)",
    copy: "复制",
    clear: "清除",
    empty: {
      type_command: "输入命令或点击上方快速命令",
      history_hint: "使用上/下箭头查看命令历史"
    },
    running: "运行中...",
    input: { placeholder: "输入命令...", run: "运行" }
  },
  workflows: {
    subtitle: "{count} 个活跃流程 · {count} 个自动化定时任务 · {count} 个按需",
    stats: { total: "总工作流", active_crons: "活跃定时任务", on_demand: "按需" },
    status: { active: "活跃", inactive: "非活跃" },
    trigger: { cron: "⏱ 定时", demand: "⚡ 按需" },
    steps_header: "步骤",
    items: {
      social_radar: {
        name: "社交雷达",
        description: "监控提及、合作机会..."
      },
      ai_news: {
        name: "AI 和网络新闻",
        description: "总结最相关的 AI 和 Web 开发新闻..."
      },
      trend_monitor: {
        name: "趋势监控",
        description: "技术领域的紧急趋势雷达..."
      },
      linkedin_brief: {
        name: "每日 LinkedIn 简报",
        description: "生成每日 LinkedIn 帖子..."
      },
      newsletter_digest: {
        name: "通讯摘要",
        description: "精选的每日通讯摘要..."
      },
      email_categorization: {
        name: "电子邮件分类",
        description: "分类和总结每日电子邮件..."
      },
      weekly_newsletter: {
        name: "每周通讯",
        description: "自动每周推文和 LinkedIn 帖子回顾..."
      },
      advisory_board: {
        name: "顾问委员会",
        description: "7 位具有自己个性和记忆的 AI 顾问..."
      },
      git_backup: {
        name: "Git 备份",
        description: "每 4 小时自动提交并推送工作区..."
      },
      nightly_evolution: {
        name: "夜间进化",
        description: "自主夜间会话,实施改进..."
      }
    }
  },
  login: {
    subtitle: "请输入您的凭据以继续"
  }
};

// 添加缺失的翻译键 - 英文
const enAdditions = {
  common: {
    refresh: "Refresh",
    openclaw: "OpenClaw"
  },
  about: {
    stats: {
      uptime: "Uptime",
      activities: "Activities",
      success_rate: "Success Rate",
      skills: "Skills"
    },
    sections: {
      about: "About",
      personality: "Personality",
      philosophy: "Working Philosophy",
      capabilities: "Capabilities"
    },
    intro: {
      i_am: "I am",
      running_on: ", an AI agent running on",
      with_claude: "with Claude as my brain.",
      purpose: "My purpose is to assist",
      tasks: "with daily tasks: managing communications, scheduling, research, file management, and acting as a digital co-pilot.",
      access: "I have access to workspaces, calendars, and integrations — a privilege I handle with care and respect."
    },
    skills: {
      telegram: "Telegram Bot",
      twitter: "Twitter/X",
      web_search: "Web Search",
      file_management: "File Management",
      cron_scheduler: "Cron Scheduler",
      memory_system: "Memory System",
      youtube: "YouTube Research",
      email: "Email (Gmail)"
    },
    footer: {
      built_with: "Built with ♥ on",
      tagline: "— Your AI co-pilot"
    }
  },
  actions: {
    title: "Quick Actions",
    subtitle: "Run common maintenance and diagnostic tasks with one click",
    heartbeat: {
      label: "Heartbeat Check",
      description: "Check if all services are online and sites are reachable"
    },
    git_status: {
      label: "Git Status (All Repos)",
      description: "Check uncommitted changes in all workspace repositories"
    },
    usage_stats: {
      label: "Collect Usage Stats",
      description: "Get disk, CPU, and memory usage overview"
    },
    restart_gateway: {
      label: "Restart Gateway",
      description: "Restart the OpenClaw gateway service"
    },
    clear_temp: {
      label: "Clear Temp Files",
      description: "Delete temporary files and trim PM2 logs"
    },
    npm_audit: {
      label: "NPM Security Audit",
      description: "Check for security vulnerabilities in mission-control dependencies"
    },
    result: {
      success: "Success",
      failed: "Failed"
    },
    button: {
      running: "Running...",
      run: "Run"
    },
    recent_results: "Recent Results",
    confirm: {
      prefix: "Confirm:",
      message: "This action may affect running services. Are you sure you want to proceed?",
      force_execute: "Force Execute"
    }
  },
  calendar: {
    subtitle: "Google Calendar · Google Tasks",
    this_week: "This Week",
    error: {
      fetch_events: "Unable to fetch calendar events",
      fetch_tasks: "Unable to fetch Google Tasks",
      load_events: "Failed to load calendar events",
      load_tasks: "Failed to load Google Tasks"
    },
    task: {
      mark_incomplete: "Click to mark as incomplete",
      mark_complete: "Click to mark as completed",
      aria_mark_incomplete: "Mark {title} as incomplete",
      aria_mark_complete: "Mark {title} as completed"
    },
    google_tasks: {
      title: "✅ Google Tasks",
      pending_total: "Pending {count} / Total {count}",
      configure_message: "Google Tasks integration available. Configure GOOGLE_TASKS_SCRIPT in .env.local to connect.",
      all_completed: "🎉 All tasks completed!",
      completed_count: "Completed ({count})",
      no_tasks: "No Google Tasks",
      no_data: "No task data available"
    },
    months: {
      january: "January", february: "February", march: "March", april: "April",
      may: "May", june: "June", july: "July", august: "August",
      september: "September", october: "October", november: "November", december: "December"
    },
    weekdays: {
      mon: "Mon", tue: "Tue", wed: "Wed", thu: "Thu",
      fri: "Fri", sat: "Sat", sun: "Sun"
    }
  },
  costs: {
    subtitle: "Token usage and cost tracking across all agents",
    timeframe: { "7d": "7 days", "30d": "30 days", "90d": "90 days" },
    kpi: {
      today: "Today",
      vs_yesterday: "vs ${amount} yesterday",
      this_month: "This Month",
      vs_last_month: "vs ${amount} last month",
      projected: "Projected Monthly",
      projected_note: "Based on current pace",
      budget: "Budget"
    },
    chart: {
      daily_trend: "Daily Cost Trend",
      cost_label: "Cost ($)",
      by_agent: "Cost by Agent",
      by_model: "Cost by Model",
      token_usage: "Token Usage (Daily)",
      input_tokens: "Input Tokens",
      output_tokens: "Output Tokens"
    },
    table: {
      model_pricing_title: "Model Pricing (per 1M tokens)",
      model: "Model",
      input: "Input",
      output: "Output",
      cache_read: "Cache Read",
      cache_write: "Cache Write",
      breakdown_title: "Detailed Breakdown by Agent",
      tokens: "Tokens",
      cost: "Cost",
      percent_total: "% of Total"
    },
    models: {
      claude_opus: "Claude Opus 4.6",
      claude_sonnet: "Claude Sonnet 4.6",
      claude_haiku: "Claude Haiku 4.5"
    }
  },
  cron: {
    subtitle: "View tasks, next run times, recent results, and issues at a glance.",
    sort: {
      updated_desc: "Latest updated first",
      next_run_asc: "Next run soonest first",
      last_run_desc: "Last run most recent first",
      label: "Sort"
    },
    view: { list: "List", timeline: "Timeline" },
    sorted_by: "Sorted by \"{label}\"",
    stats: { total: "Total Tasks", enabled: "Enabled", issues: "Recent Issues" },
    issues: { warning: "Currently {count} tasks have recent failures. Red bug indicators are shown in the list." },
    empty: {
      title: "No Scheduled Tasks",
      description: "Tasks will appear here once created via the OpenClaw CLI."
    },
    timeline: {
      title: "Next 7 Days Timeline",
      timezone_note: "All times shown in local timezone"
    },
    delete: {
      confirm_title: "Delete \"{name}\"?",
      confirm_button: "Confirm Delete"
    },
    toast: {
      triggered_skipped: "triggered successfully, today's scheduled run has been skipped",
      triggered: "triggered",
      failed: "trigger failed"
    }
  },
  files: {
    subtitle: "Browse agent workspaces and files",
    sidebar: { workspaces: "Workspaces" },
    view: { list: "List View", grid: "Icon View" },
    empty: { select_workspace: "Select a workspace to explore its files" }
  },
  git: {
    subtitle: "{count} repositories · {count} with changes",
    empty: { no_repos: "No Git repositories found in workspace" },
    status: { ahead: "ahead", behind: "behind", clean: "clean", changes: "changes" },
    action: { status: "status", log: "log", diff: "diff", pull: "pull" },
    changes: {
      staged: "Staged ({count})",
      more: "+{count} more",
      modified: "Modified ({count})",
      untracked: "Untracked ({count})"
    }
  },
  memory: {
    subtitle: "Browse and edit agent memory documents, specs, and skills",
    sidebar: { workspaces: "Workspaces" },
    unsaved_changes: { confirm: "You have unsaved changes. Are you sure you want to discard them?" },
    view: { preview: "Preview", edit: "Edit" },
    empty: {
      select_document: "Select a document to preview or edit",
      select_workspace: "Please select a workspace"
    }
  },
  reports: {
    subtitle: "Analytics reports and insights",
    refresh_tooltip: "Refresh reports",
    count: "{count} Reports",
    empty: {
      no_reports: "No reports found",
      hint: "Reports matching *-analysis-* or *-report-* patterns in memory/ will appear here",
      select_report: "Select a report to preview"
    },
    loading_report: "Loading report..."
  },
  skills: {
    subtitle: "Skills available in the OpenClaw system",
    stats: { total: "Total Skills", workspace: "Workspace Skills", system: "System Skills" },
    search: { placeholder: "Search skills..." },
    filter: {
      all: "All ({count})",
      workspace: "Workspace ({count})",
      system: "System ({count})"
    },
    empty: { no_skills: "No skills found" },
    section: { workspace: "WORKSPACE SKILLS", system: "SYSTEM SKILLS" },
    card: { files: "files" },
    detail: {
      homepage: "Homepage",
      files_count: "files",
      files_header: "Files ({count})"
    }
  },
  social: {
    subtitle: "Manage your social media presence",
    today: "Today",
    stats: {
      title: "📊 This Month's Stats",
      posts_count: "{count} posts",
      category_distribution: "Category Distribution",
      publish_status: "Publish Status",
      published: "✅ Published",
      scheduled: "🕐 Scheduled"
    },
    platform: { linkedin: "LinkedIn", xiaohongshu: "Xiaohongshu" },
    coming_soon: "Coming Soon",
    last_updated: "Last updated:",
    post: { purpose_title: "Post Purpose" },
    status: { published: "Published", scheduled: "Scheduled" }
  },
  terminal: {
    subtitle: "Read-only commands only (ls, cat, df, ps, git status, etc.)",
    copy: "Copy",
    clear: "Clear",
    empty: {
      type_command: "Type a command or click a quick command above",
      history_hint: "Arrow Up/Down for command history"
    },
    running: "Running...",
    input: { placeholder: "Enter command...", run: "Run" }
  },
  workflows: {
    subtitle: "{count} active flows · {count} automated crons · {count} on-demand",
    stats: { total: "Total workflows", active_crons: "Active crons", on_demand: "On-demand" },
    status: { active: "Active", inactive: "Inactive" },
    trigger: { cron: "⏱ Cron", demand: "⚡ On-demand" },
    steps_header: "Steps",
    items: {
      social_radar: {
        name: "Social Radar",
        description: "Monitors mentions, collaboration opportunities..."
      },
      ai_news: {
        name: "AI & Web News",
        description: "Summarizes the most relevant AI and web development news..."
      },
      trend_monitor: {
        name: "Trend Monitor",
        description: "Urgent trend radar for the tech niche..."
      },
      linkedin_brief: {
        name: "Daily LinkedIn Brief",
        description: "Generates the daily LinkedIn post..."
      },
      newsletter_digest: {
        name: "Newsletter Digest",
        description: "Curated digest of the day's newsletters..."
      },
      email_categorization: {
        name: "Email Categorization",
        description: "Categorizes and summarizes daily emails..."
      },
      weekly_newsletter: {
        name: "Weekly Newsletter",
        description: "Automatic weekly recap of tweets and LinkedIn posts..."
      },
      advisory_board: {
        name: "Advisory Board",
        description: "7 AI advisors with their own personalities and memories..."
      },
      git_backup: {
        name: "Git Backup",
        description: "Auto-commit and push the workspace every 4 hours..."
      },
      nightly_evolution: {
        name: "Nightly Evolution",
        description: "Autonomous nightly session that implements improvements..."
      }
    }
  },
  login: {
    subtitle: "Please enter your credentials to continue"
  }
};

// 深度合并函数
function deepMerge(target, source) {
  for (const key in source) {
    if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
      if (!target[key]) target[key] = {};
      deepMerge(target[key], source[key]);
    } else {
      target[key] = source[key];
    }
  }
}

// 合并翻译
deepMerge(zhData, zhAdditions);
deepMerge(enData, enAdditions);

// 写回文件
fs.writeFileSync(zhPath, JSON.stringify(zhData, null, 2), 'utf-8');
fs.writeFileSync(enPath, JSON.stringify(enData, null, 2), 'utf-8');

console.log('✓ Translation files updated successfully!');
console.log(`  - zh.json: ${Object.keys(zhData).length} top-level keys`);
console.log(`  - en.json: ${Object.keys(enData).length} top-level keys`);
