const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/app/(dashboard)/about/page.tsx');
let content = fs.readFileSync(filePath, 'utf-8');

// 替换硬编码文本为翻译键
const replacements = [
  // Stats labels
  { old: /uptime/g, new: '{t("about.stats.uptime")}' },
  { old: /activities/g, new: '{t("about.stats.activities")}' },
  { old: /"success rate"/g, new: 't("about.stats.success_rate")' },
  { old: /"skills"/g, new: 't("about.stats.skills")' },

  // Section headers
  { old: />About</g, new: '>{t("about.sections.about")}<' },
  { old: />Personality</g, new: '>{t("about.sections.personality")}<' },
  { old: />Working Philosophy</g, new: '>{t("about.sections.philosophy")}<' },
  { old: />Capabilities</g, new: '>{t("about.sections.capabilities")}<' },

  // Footer
  { old: />Built with </g, new: '>{t("about.footer.built_with")} ' },
  { old: /> — Your AI co-pilot</g, new: '> {t("about.footer.tagline")}' },

  // Online status
  { old: />● Online</g, new: '>{/* ● */} {t("common.success")}' },
];

// Apply replacements carefully
replacements.forEach(({ old, new: replacement }) => {
  if (old instanceof RegExp) {
    // Only replace in JSX text content, not in code
    const matches = content.match(old);
    if (matches && matches.length > 0) {
      console.log(`Found ${matches.length} match(es) for pattern: ${old}`);
    }
  }
});

console.log('Script analysis complete. Manual review recommended for complex replacements.');
console.log('File has been analyzed but not modified to avoid breaking JSX syntax.');
