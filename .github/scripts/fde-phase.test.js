const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('path');
const fs = require('fs');
const os = require('os');
const { execSync } = require('child_process');
const { getCurrentPhase, setPhase, runPhaseTransition } = require('./fde-phase');

function createTempWorkspace() {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'p2b-fde-test-'));
  const stateFile = path.join(tmpDir, '.fde-phase.json');
  return {
    tmpDir,
    stateFile,
    cleanup: () => {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  };
}

test('getCurrentPhase defaults to 1 when state file does not exist', () => {
  const { stateFile, cleanup } = createTempWorkspace();
  try {
    const phase = getCurrentPhase(stateFile);
    assert.strictEqual(phase, 1);
  } finally {
    cleanup();
  }
});

test('setPhase updates phase and validates range', () => {
  const { stateFile, cleanup } = createTempWorkspace();
  try {
    setPhase(2, stateFile);
    assert.strictEqual(getCurrentPhase(stateFile), 2);

    assert.throws(() => setPhase(0, stateFile), /無效的 Phase 編號/);
    assert.throws(() => setPhase(4, stateFile), /無效的 Phase 編號/);
  } finally {
    cleanup();
  }
});

test('runPhaseTransition blocks and reports errors when phase assertion fails', () => {
  const { tmpDir, stateFile, cleanup } = createTempWorkspace();
  try {
    const outcome = runPhaseTransition({ workspaceRoot: tmpDir, stateFile });
    assert.strictEqual(outcome.pass, false);
    assert.strictEqual(outcome.nextPhase, null);
    assert.strictEqual(outcome.currentPhase, 1);
    assert.ok(outcome.report.errors.length > 0);
  } finally {
    cleanup();
  }
});

test('runPhaseTransition advances phase when phase assertion passes', () => {
  const { tmpDir, stateFile, cleanup } = createTempWorkspace();
  try {
    fs.mkdirSync(path.join(tmpDir, 'docs'), { recursive: true });
    const content = `
# Requirements Specification
## User Stories
- As an admin, I want to manage users.

## Acceptance Criteria
- [ ] AC1: System allows adding user
- [ ] AC2: System allows deleting user
- [ ] AC3: System logs all actions
`;
    fs.writeFileSync(path.join(tmpDir, 'docs/REQUIREMENTS.md'), content, 'utf-8');

    const outcome = runPhaseTransition({ workspaceRoot: tmpDir, stateFile });
    assert.strictEqual(outcome.pass, true);
    assert.strictEqual(outcome.currentPhase, 1);
    assert.strictEqual(outcome.nextPhase, 2);
    assert.strictEqual(getCurrentPhase(stateFile), 2);
  } finally {
    cleanup();
  }
});

test('DoD: deliberate missing sections in REQUIREMENTS.md causes CLI to fail with non-zero exit', () => {
  const { tmpDir, stateFile, cleanup } = createTempWorkspace();
  try {
    fs.mkdirSync(path.join(tmpDir, 'docs'), { recursive: true });
    const brokenContent = `
# Broken Requirements
## User Stories
- Story without acceptance criteria
`;
    fs.writeFileSync(path.join(tmpDir, 'docs/REQUIREMENTS.md'), brokenContent, 'utf-8');

    const scriptPath = path.resolve(__dirname, 'fde-phase.js');

    let failed = false;
    let exitCode = 0;
    let stderrOutput = '';

    try {
      execSync(`node "${scriptPath}"`, {
        cwd: tmpDir,
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
    assert.ok(stderrOutput.includes('[FDE Blocked]'), 'Must output [FDE Blocked] error message');
  } finally {
    cleanup();
  }
});
