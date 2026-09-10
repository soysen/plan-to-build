const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('path');
const fs = require('fs');
const os = require('os');
const { execSync } = require('child_process');
const { judgeSlice } = require('./slice-judge');

test('judgeSlice: passes when task status is not completed (e.g. in progress)', () => {
  const content = `
# Agent Status
- ID: Task 1.1
- Status: 進行中
- Goal: 建立腳本
- Evidence: 進行中
`;
  const res = judgeSlice(content);
  assert.strictEqual(res.result, 'PASS');
  assert.match(res.reason, /非結案狀態/);
});

test('judgeSlice: blocks (FAIL) when status is completed but evidence is empty or placeholder', () => {
  const content1 = `
# Agent Status
- ID: Task 1.1
- Status: 已完成
- Goal: 建立腳本
- Evidence: 
`;
  const res1 = judgeSlice(content1);
  assert.strictEqual(res1.result, 'FAIL');
  assert.match(res1.reason, /Evidence 欄位為空/);

  const content2 = `
# Agent Status
- ID: Task 1.1
- Status: 已完成
- Goal: 建立腳本
- Evidence: N/A
`;
  const res2 = judgeSlice(content2);
  assert.strictEqual(res2.result, 'FAIL');
});

test('judgeSlice: blocks (FAIL) on subjective-only claims without objective logs', () => {
  const content = `
# Agent Status
- ID: Task 1.2
- Status: 已完成
- Goal: 改造進度控制器
- Evidence: 已成功實作，功能正常，在本地測試都通過了
`;
  const res = judgeSlice(content);
  assert.strictEqual(res.result, 'FAIL');
  assert.match(res.reason, /主觀口頭描述/);
});

test('judgeSlice: blocks (FAIL) when evidence contains non-zero exit code or FAIL', () => {
  const content = `
# Agent Status
- ID: Task 1.2
- Status: 已完成
- Goal: 改造進度控制器
- Evidence: node scripts/fde-phase.js (Exit code: 1, FAILED)
`;
  const res = judgeSlice(content);
  assert.strictEqual(res.result, 'FAIL');
  assert.match(res.reason, /非零退出碼|相悖/);
});

test('judgeSlice: passes (PASS) when evidence contains objective logs, tests, and exit code 0', () => {
  const content = `
# Agent Status
- ID: Task 1.1
- Status: 已完成
- Goal: 建立確定性斷言
- Evidence: npm test (26 pass, 0 fail), Exit code: 0, TPR: 100%
`;
  const res = judgeSlice(content);
  assert.strictEqual(res.result, 'PASS');
  assert.match(res.reason, /驗收證據真實完整/);
});

test('slice-judge CLI: exits with code 1 and blocks when evidence is subjective', () => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'p2b-judge-test-'));
  try {
    const brokenStatus = path.join(tmpDir, 'agent-status.md');
    fs.writeFileSync(brokenStatus, `
- ID: Task 9.9
- Status: 已完成
- Goal: 測試阻斷
- Evidence: 功能都OK，已經搞定了
`, 'utf-8');

    const scriptPath = path.resolve(__dirname, 'slice-judge.js');

    let failed = false;
    let exitCode = 0;
    let stderrOutput = '';

    try {
      execSync(`node "${scriptPath}" "${brokenStatus}"`, {
        encoding: 'utf-8',
        stdio: ['pipe', 'pipe', 'pipe']
      });
    } catch (err) {
      failed = true;
      exitCode = err.status;
      stderrOutput = err.stderr || '';
    }

    assert.strictEqual(failed, true, 'Execution must fail');
    assert.notStrictEqual(exitCode, 0, 'Exit code must be non-zero');
    assert.ok(stderrOutput.includes('Slice Judge Blocked'), 'Must report slice judge blocked');
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
});
