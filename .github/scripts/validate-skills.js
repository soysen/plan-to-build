#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '../..');
const skillsDir = path.join(root, '.github', 'skills');

const usageHeadings = [
  '## 使用時機',
  '## 適用時機',
  '## When to Use',
  '## Skill 選擇指南',
  '## Core Principles',
  '## Use case specific references'
];

const evidenceMarkers = [
  '驗證',
  '驗收',
  '測試',
  '檢查清單',
  '輸出',
  '報告',
  '安全守則',
  '參考資源',
  'Handoff',
  'Evidence',
  'Documentation',
  'CLI',
  'Best Practices'
];

function fail(message) {
  console.error(`ERROR: ${message}`);
  process.exitCode = 1;
}

function parseFrontmatter(content, filePath) {
  if (!content.startsWith('---\n')) {
    fail(`${filePath} is missing YAML frontmatter`);
    return {};
  }

  const end = content.indexOf('\n---', 4);
  if (end === -1) {
    fail(`${filePath} has unterminated YAML frontmatter`);
    return {};
  }

  const fields = {};
  for (const line of content.slice(4, end).split('\n')) {
    const match = line.match(/^([a-zA-Z0-9_-]+):\s*(.*)$/);
    if (!match) continue;
    fields[match[1]] = match[2].replace(/^"|"$/g, '').trim();
  }
  return fields;
}

if (!fs.existsSync(skillsDir)) {
  fail('.github/skills does not exist');
} else {
  let count = 0;
  for (const entry of fs.readdirSync(skillsDir, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;

    const skillPath = path.join(skillsDir, entry.name, 'SKILL.md');
    if (!fs.existsSync(skillPath)) {
      fail(`${entry.name} is missing SKILL.md`);
      continue;
    }

    const relPath = path.relative(root, skillPath);
    const content = fs.readFileSync(skillPath, 'utf8');
    const frontmatter = parseFrontmatter(content, relPath);

    if (frontmatter.name !== entry.name) {
      fail(`${relPath} frontmatter name must match directory name (${entry.name})`);
    }

    if (!frontmatter.description) {
      fail(`${relPath} is missing description`);
    }

    if (!/Use when|使用時機：|觸發關鍵字：|觸發/.test(frontmatter.description || '')) {
      fail(`${relPath} description must include usage triggers`);
    }

    if (!usageHeadings.some(heading => content.includes(heading))) {
      fail(`${relPath} is missing a usage section`);
    }

    const h2Count = content.match(/^##\s+/gm)?.length ?? 0;
    if (h2Count < 2) {
      fail(`${relPath} must contain at least two workflow sections`);
    }

    if (!evidenceMarkers.some(marker => content.includes(marker))) {
      fail(`${relPath} is missing output, safety, or verification guidance`);
    }
    count++;
  }
  if (!process.exitCode) {
    console.log(`✅ Skill validation passed for ${count} skills in .github/skills`);
  }
}
