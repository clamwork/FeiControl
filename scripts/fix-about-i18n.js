const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/app/(dashboard)/about/page.tsx');
let content = fs.readFileSync(filePath, 'utf-8');

// 定义替换规则 [原文, 替换文]
const replacements = [
  ['            activities\n', '            {t("about.stats.activities")}\n'],
  ['            success rate\n', '            {t("about.stats.success_rate")}\n'],
  ['            skills\n', '            {t("about.stats.skills")}\n'],
  ['              About\n', '              {t("about.sections.about")}\n'],
  ['              Personality\n', '              {t("about.sections.personality")}\n'],
  ['            Working Philosophy\n', '            {t("about.sections.philosophy")}\n'],
  ['            Capabilities\n', '            {t("about.sections.capabilities")}\n'],
  ['            Built with ', '            {t("about.footer.built_with")} '],
  [' — Your AI co-pilot', ' {t("about.footer.tagline")}'],
  ['                  Born ', '                  出生 '],
];

let count = 0;
replacements.forEach(([from, to]) => {
  if (content.includes(from)) {
    content = content.split(from).join(to);
    count++;
    console.log('✓ Replaced:', from.trim().substring(0, 40));
  } else {
    console.log('⚠ Not found:', from.trim().substring(0, 40));
  }
});

fs.writeFileSync(filePath, content, 'utf-8');
console.log('\n完成! 共替换', count, '处文本');
