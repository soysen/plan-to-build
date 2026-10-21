const test = require('node:test');
const assert = require('node:assert/strict');
const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const CLI_PATH = path.resolve(__dirname, 'harness-cli.js');

test('harness-cli check subcommand returns expected JSON structure', () => {
  const output = execSync(`node "${CLI_PATH}" check`, { encoding: 'utf-8' });
  const result = JSON.parse(output.trim());

  assert.ok('active_task' in result, 'Result should have active_task');
  assert.ok('status' in result, 'Result should have status');
  assert.ok('has_spec' in result, 'Result should have has_spec');
  assert.ok('has_context' in result, 'Result should have has_context');
  assert.ok('gate_action' in result, 'Result should have gate_action');
  assert.ok('recommended_skill' in result, 'Result should have recommended_skill');
});

test('harness-cli check --human outputs human-friendly formatted dashboard', () => {
  const output = execSync(`node "${CLI_PATH}" check --human`, { encoding: 'utf-8' });
  assert.match(output, /Harness Status Dashboard/i);
  assert.match(output, /Active Task/i);
  assert.match(output, /Recommended Route/i);
});

test('harness-cli check --ai outputs ultra-compact single-line format', () => {
  const output = execSync(`node "${CLI_PATH}" check --ai`, { encoding: 'utf-8' });
  assert.ok(!output.includes('\n') || output.trim().split('\n').length === 1, 'Should be a single compact line');
  assert.match(output, /TASK:[^|]+\|STATUS:[^|]+\|SPEC:[01]\|GATE:[^|]+\|ROUTE:.+/);
});

test('harness-cli validate subcommand executes successfully on compliant workspace', () => {
  const output = execSync(`node "${CLI_PATH}" validate`, { encoding: 'utf-8' });
  assert.match(output, /Validation Passed/i);
});

test('harness-cli card subcommand outputs Task Card structure', () => {
  const output = execSync(`node "${CLI_PATH}" card`, { encoding: 'utf-8' });
  assert.match(output, /Task Card/i);
  assert.match(output, /Task ID/i);
  assert.match(output, /Skill Route/i);
});

test('harness-cli card --ai outputs compact single line card string', () => {
  const output = execSync(`node "${CLI_PATH}" card --ai`, { encoding: 'utf-8' });
  assert.ok(!output.includes('\n') || output.trim().split('\n').length === 1, 'Should be a single compact line');
  assert.match(output, /CARD\|ID:[^|]+\|STATUS:[^|]+\|ROUTE:[^|]+\|STEP:.+/);
});

test('harness-cli loop status returns expected structure and supports views', () => {
  const outputJson = execSync(`node "${CLI_PATH}" loop status`, { encoding: 'utf-8' });
  const result = JSON.parse(outputJson.trim());
  assert.ok('iteration' in result);
  assert.ok('maxIterations' in result);
  assert.ok('status' in result);

  const outputHuman = execSync(`node "${CLI_PATH}" loop status --human`, { encoding: 'utf-8' });
  assert.match(outputHuman, /Loop Engineering Monitor/i);

  const outputAi = execSync(`node "${CLI_PATH}" loop status --ai`, { encoding: 'utf-8' });
  assert.match(outputAi, /LOOP\|TASK:[^|]+\|ITER:\d+\/\d+\|STATUS:[^|]+/);
});

test('harness-cli loop step handles success and records history', () => {
  // Reset first
  execSync(`node "${CLI_PATH}" loop reset`, { encoding: 'utf-8' });

  // Run a successful step
  const output = execSync(`node "${CLI_PATH}" loop step --hypothesis="Test Pass" --cmd="node -e 'process.exit(0)'" --max=3`, { encoding: 'utf-8' });
  assert.match(output, /LOOP CONVERGED/i);

  // Check state
  const statusOut = execSync(`node "${CLI_PATH}" loop status`, { encoding: 'utf-8' });
  const state = JSON.parse(statusOut.trim());
  assert.equal(state.status, 'converged');
  assert.equal(state.iteration, 1);
  assert.equal(state.history.length, 1);
  assert.equal(state.history[0].verdict, 'PASS');

  // Clean up
  execSync(`node "${CLI_PATH}" loop reset`, { encoding: 'utf-8' });
});

test('harness-cli loop step triggers hard stop at max iterations and prevents token black hole', () => {
  const agentStatusPath = path.resolve(__dirname, '../../.github/worklog/agent-status.md');
  const backup = fs.readFileSync(agentStatusPath, 'utf-8');

  try {
    execSync(`node "${CLI_PATH}" loop reset`, { encoding: 'utf-8' });

    // Step 1: fails
    try {
      execSync(`node "${CLI_PATH}" loop step --hypothesis="Attempt 1" --cmd="node -e 'process.exit(1)'" --max=2`, { encoding: 'utf-8' });
    } catch (err) {
      assert.equal(err.status, 1);
    }

    // Step 2: fails -> max reached -> triggers hard stop (exit code 2)
    try {
      execSync(`node "${CLI_PATH}" loop step --hypothesis="Attempt 2" --cmd="node -e 'process.exit(1)'" --max=2`, { encoding: 'utf-8' });
      assert.fail('Should have exited with code 2 on hard stop');
    } catch (err) {
      assert.equal(err.status, 2, 'Should exit with code 2 for Hard Stop');
      assert.match(err.stderr || err.stdout, /HARD STOP/i);
    }

    // Verify agent-status.md was updated to 阻塞
    const updatedStatus = fs.readFileSync(agentStatusPath, 'utf-8');
    assert.match(updatedStatus, /- Status:\s*阻塞/);
  } finally {
    fs.writeFileSync(agentStatusPath, backup);
    execSync(`node "${CLI_PATH}" loop reset`, { encoding: 'utf-8' });
  }
});

test('validateSpecStructure rejects empty spec or spec missing required sections', () => {
  const { validateSpecStructure } = require('./harness-cli');
  
  assert.equal(typeof validateSpecStructure, 'function', 'validateSpecStructure should be exported');

  // Blank spec
  const blankRes = validateSpecStructure('');
  assert.equal(blankRes.valid, false);
  assert.match(blankRes.errors[0], /Spec 內容為空/);

  // Missing acceptance criteria
  const noCriteria = `
# Some Spec
## 目標
1. Goal A
`;
  const noCritRes = validateSpecStructure(noCriteria);
  assert.equal(noCritRes.valid, false);
  assert.ok(noCritRes.errors.some(e => e.includes('缺少驗收標準章節')));

  // Acceptance criteria < 2 items
  const oneCriteria = `
# Some Spec
## 目標
1. Goal A
## 驗收標準
- [ ] 只有一條標準
`;
  const oneCritRes = validateSpecStructure(oneCriteria);
  assert.equal(oneCritRes.valid, false);
  assert.ok(oneCritRes.errors.some(e => e.includes('驗收標準項目過少')));

  // Valid spec with 2 criteria
  const validSpec = `
# Valid Spec
## 目標
達成系統穩定
## 驗收標準
- [ ] 標準一
- [ ] 標準二
`;
  const validRes = validateSpecStructure(validSpec);
  assert.equal(validRes.valid, true);
  assert.equal(validRes.errors.length, 0);
});

test('validateDualWrite checks plan existence and active slices when task is in progress', () => {
  const { validateDualWrite } = require('./harness-cli');
  assert.equal(typeof validateDualWrite, 'function', 'validateDualWrite should be exported');

  // Plan missing for active task
  const missingPlanRes = validateDualWrite('TASK-999', '進行中', '/nonexistent/path');
  assert.equal(missingPlanRes.valid, false);
  assert.ok(missingPlanRes.errors.some(e => e.includes('找不到對應建置藍圖')));

  // Plan exists but has no active slices while task is in progress
  const donePlanContent = `
# Build Plan
- Status: done
## Slices
- [x] Slice 1: Done
- [x] Slice 2: Also done
`;
  const noActiveSliceRes = validateDualWrite('TASK-114', '進行中', donePlanContent);
  assert.equal(noActiveSliceRes.valid, false);
  assert.ok(noActiveSliceRes.errors.some(e => e.includes('無進行中 [-] 或待處理 [ ] 切片')));

  // Plan has active slice [-]
  const inProgressPlanContent = `
# Build Plan
- Status: in_progress
## Slices
- [-] Slice 1: Working
- [ ] Slice 2: Pending
`;
  const activePlanRes = validateDualWrite('TASK-114', '進行中', inProgressPlanContent);
  assert.equal(activePlanRes.valid, true);
  assert.equal(activePlanRes.errors.length, 0);
});

test('Project Guard hook executes *-guard.js during harness validate', () => {
  const guardPath = path.resolve(__dirname, 'test-sample-guard.js');
  try {
    // Create failing guard
    fs.writeFileSync(guardPath, 'console.error("GUARD TRIGGERED FAIL"); process.exit(1);');
    assert.throws(() => {
      execSync(`node "${CLI_PATH}" validate`, { encoding: 'utf-8' });
    });
  } finally {
    if (fs.existsSync(guardPath)) fs.unlinkSync(guardPath);
  }
});



