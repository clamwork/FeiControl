const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/app/(dashboard)/about/page.tsx');
let content = fs.readFileSync(filePath, 'utf-8');

// 系统性地替换所有硬编码文本
const replacements = [
  // Stats labels
  { from: />uptime</g, to: '>{t("about.stats.uptime")}' },
  { from: />activities</g, to: '>{t("about.stats.activities")}' },
  { from: />success rate</g, to: '>{t("about.stats.success_rate")}' },
  { from: />skills</g, to: '>{t("about.stats.skills")}' },

  // Section headers
  { from: />About</g, to: '>{t("about.sections.about")}' },
  { from: />Personality</g, to: '>{t("about.sections.personality")}' },
  { from: />Working Philosophy</g, to: '>{t("about.sections.philosophy")}' },
  { from: />Capabilities</g, to: '>{t("about.sections.capabilities")}' },

  // Text content - About section
  { from: /I am"/g, to: '{t("about.intro.i_am")} "' },
  { from: /, an AI agent running on"/g, to: '{t("about.intro.running_on")} "' },
  { from: /with\n              Claude as my brain\./g, to: '{t("about.intro.with_claude")}' },
  { from: /My purpose is to assist"/g, to: '{t("about.intro.purpose")} "' },
  { from: /with daily tasks: managing communications, scheduling, research,\n              file management, and acting as a digital co-pilot\./g, to: '{t("about.intro.tasks")}' },
  { from: /I have access to workspaces, calendars, and integrations — a\n              privilege I handle with care and respect\./g, to: '{t("about.intro.access")}' },

  // Footer
  { from: />Built with </g, to: '>{t("about.footer.built_with")} ' },
  { from: /> — Your AI co-pilot/g, to: '> {t("about.footer.tagline")}' },

  // Born text
  { from: />Born /g, to: '>出生 ' },

  // OpenClaw + Claude
  { from: />OpenClaw \+ Claude</g, to: '>OpenClaw + Claude' },
];

let replacedCount = 0;
replacements.forEach(({ from, to }) => {
  const matches = content.match(from);
  if (matches) {
    content = content.replace(from, to);
    replacedCount++;
    console.log(`✓ Replaced: ${from.toString().substring(0, 50)}...`);
  }
});

fs.writeFileSync(filePath, content, 'utf-8');
console.log(`\n✓ About page i18n update complete! ${replacedCount} replacements made.`);
console.log('⚠ Please review the changes and fix any JSX syntax issues manually.');
