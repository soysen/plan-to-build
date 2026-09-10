#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const DEFAULT_WORKSPACE_ROOT = path.resolve(__dirname, '../../');

/**
 * 確定性 Phase 結構與語法斷言核心
 * @param {number|string} phase - Phase 編號 (1, 2, 3)
 * @param {object} [options] - 選項
 * @param {string} [options.workspaceRoot] - 專案根目錄
 * @returns {{ phase: number, pass: boolean, missingSections: string[], errors: string[] }}
 */
function assertPhase(phase, options = {}) {
  const phaseNum = parseInt(phase, 10);
  const workspaceRoot = options.workspaceRoot || DEFAULT_WORKSPACE_ROOT;

  const report = {
    phase: phaseNum,
    pass: false,
    missingSections: [],
    errors: []
  };

  if (isNaN(phaseNum) || phaseNum < 1 || phaseNum > 3) {
    report.errors.push(`無效的 Phase 編號: ${phase} (僅支援 Phase 1, 2, 3)`);
    return report;
  }

  switch (phaseNum) {
    case 1:
      assertPhase1(workspaceRoot, report);
      break;
    case 2:
      assertPhase2(workspaceRoot, report);
      break;
    case 3:
      assertPhase3(workspaceRoot, report);
      break;
  }

  report.pass = report.missingSections.length === 0 && report.errors.length === 0;
  return report;
}

/**
 * Phase 1: 驗證 docs/REQUIREMENTS.md
 * - 必須包含標題：## User Stories 與 ## Acceptance Criteria
 * - 驗收條件清單條目（- [ ] 或 - ）總數必須 >= 3
 */
function assertPhase1(workspaceRoot, report) {
  const reqPath = path.join(workspaceRoot, 'docs/REQUIREMENTS.md');

  if (!fs.existsSync(reqPath)) {
    report.missingSections.push('## User Stories', '## Acceptance Criteria');
    report.errors.push('docs/REQUIREMENTS.md 檔案不存在');
    return;
  }

  const content = fs.readFileSync(reqPath, 'utf-8');

  const hasUserStories = /^##\s+User Stories\b/m.test(content);
  const hasAcceptanceCriteria = /^##\s+Acceptance Criteria\b/m.test(content);

  if (!hasUserStories) {
    report.missingSections.push('## User Stories');
  }

  if (!hasAcceptanceCriteria) {
    report.missingSections.push('## Acceptance Criteria');
  }

  // 檢查 Acceptance Criteria 條目數
  let criteriaCount = 0;
  if (hasAcceptanceCriteria) {
    const acIdx = content.search(/^##\s+Acceptance Criteria\b/m);
    if (acIdx !== -1) {
      const lines = content.slice(acIdx).split('\n').slice(1);
      const acLines = [];
      for (const line of lines) {
        if (/^##\s+/.test(line)) break;
        acLines.push(line);
      }
      const items = acLines.filter(line => /^[-*]\s+(\[[ xX]\]\s*)?\S+/.test(line.trim()));
      criteriaCount = items.length;
    }
  }

  if (criteriaCount < 3) {
    report.errors.push(`Acceptance Criteria 條目數不足 3 條 (當前: ${criteriaCount} 條)`);
  }
}

/**
 * Phase 2: 驗證 prisma/schema.prisma & docs/TECHNICAL_SPEC.md
 * - 執行子進程 npx prisma validate，Exit Code 必須為 0
 * - 檢查 docs/TECHNICAL_SPEC.md 包含 ## Data Models 與 ## API Specifications
 */
function assertPhase2(workspaceRoot, report) {
  const specPath = path.join(workspaceRoot, 'docs/TECHNICAL_SPEC.md');
  const schemaPath = path.join(workspaceRoot, 'prisma/schema.prisma');

  // 1. 檢查 docs/TECHNICAL_SPEC.md
  if (!fs.existsSync(specPath)) {
    report.missingSections.push('## Data Models', '## API Specifications');
    report.errors.push('docs/TECHNICAL_SPEC.md 檔案不存在');
  } else {
    const specContent = fs.readFileSync(specPath, 'utf-8');
    if (!/^##\s+Data Models\b/m.test(specContent)) {
      report.missingSections.push('## Data Models');
    }
    if (!/^##\s+API Specifications\b/m.test(specContent)) {
      report.missingSections.push('## API Specifications');
    }
  }

  // 2. 檢查 prisma/schema.prisma 並執行驗證
  if (!fs.existsSync(schemaPath)) {
    report.errors.push('prisma/schema.prisma 檔案不存在');
  } else {
    try {
      const res = spawnSync('npx', ['prisma', 'validate', '--schema', schemaPath], {
        cwd: workspaceRoot,
        encoding: 'utf-8',
        shell: true,
        timeout: 15000,
        input: '',
        env: { ...process.env, CI: 'true' }
      });

      if (res.status !== 0) {
        const errDetails = (res.stderr || res.stdout || '未知錯誤').trim();
        report.errors.push(`Prisma 驗證失敗 (Exit code: ${res.status}): ${errDetails.slice(0, 300)}`);
      }
    } catch (err) {
      report.errors.push(`Prisma 驗證執行異常: ${err.message}`);
    }
  }
}

/**
 * Phase 3: 驗證 src/app/page.tsx
 * - 使用 AST 解析或 esbuild 語法掃描，確保無語法崩潰
 * - 必須具備 export default 元件宣告
 */
function assertPhase3(workspaceRoot, report) {
  const pagePath = path.join(workspaceRoot, 'src/app/page.tsx');

  if (!fs.existsSync(pagePath)) {
    report.errors.push('src/app/page.tsx 檔案不存在');
    return;
  }

  const content = fs.readFileSync(pagePath, 'utf-8');

  // 1. 檢查 export default
  const hasExportDefault = /export\s+default\s+/m.test(content);
  if (!hasExportDefault) {
    report.errors.push('缺少 export default 元件宣告');
  }

  // 2. 語法掃描 (優先使用專案既有 esbuild，若無則進行基本語法 AST / 括號平衡掃描)
  let esbuild;
  const esbuildPaths = [
    path.join(workspaceRoot, 'dashboard/node_modules/esbuild'),
    path.join(workspaceRoot, 'node_modules/esbuild'),
    path.join(DEFAULT_WORKSPACE_ROOT, 'dashboard/node_modules/esbuild'),
    path.join(DEFAULT_WORKSPACE_ROOT, 'node_modules/esbuild'),
    'esbuild'
  ];

  for (const ep of esbuildPaths) {
    try {
      esbuild = require(ep);
      if (esbuild && typeof esbuild.transformSync === 'function') break;
    } catch (_) {}
  }

  if (esbuild && typeof esbuild.transformSync === 'function') {
    try {
      esbuild.transformSync(content, { loader: 'tsx' });
    } catch (err) {
      report.errors.push(`語法錯誤 (esbuild): ${err.message}`);
    }
  } else {
    // 輕量 fallback 語法驗證
    try {
      const stack = [];
      const pairs = { ')': '(', ']': '[', '}': '{' };
      let inString = false;
      let stringChar = '';

      for (let i = 0; i < content.length; i++) {
        const char = content[i];
        if (inString) {
          if (char === stringChar && content[i - 1] !== '\\') inString = false;
          continue;
        }
        if (char === '"' || char === "'" || char === '`') {
          inString = true;
          stringChar = char;
          continue;
        }
        if (char === '(' || char === '[' || char === '{') {
          stack.push(char);
        } else if (char === ')' || char === ']' || char === '}') {
          const expected = pairs[char];
          if (stack.pop() !== expected) {
            report.errors.push(`語法錯誤: 括號未匹配 '${char}'`);
            break;
          }
        }
      }
      if (stack.length > 0) {
        report.errors.push(`語法錯誤: 未閉合的括號 '${stack[stack.length - 1]}'`);
      }
    } catch (fallbackErr) {
      report.errors.push(`語法檢查異常: ${fallbackErr.message}`);
    }
  }
}

// Direct CLI Execution
if (require.main === module) {
  const phaseArg = process.argv[2];
  if (!phaseArg) {
    console.error('Usage: node .github/scripts/assert-phase.js <phaseNumber>');
    process.exit(1);
  }

  const result = assertPhase(phaseArg);
  console.log(JSON.stringify(result, null, 2));

  if (!result.pass) {
    process.exit(1);
  }
  process.exit(0);
}

module.exports = { assertPhase };
