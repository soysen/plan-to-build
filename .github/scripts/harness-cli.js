#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const { judgeSlice } = require('./slice-judge');

const WORKSPACE_ROOT = path.resolve(__dirname, '../../');
const AGENT_STATUS_PATH = path.join(WORKSPACE_ROOT, '.github/worklog/agent-status.md');
const HARNESS_PLAN_DIR = path.join(WORKSPACE_ROOT, '.github/harness/plan');
const HARNESS_SPEC_DIR = path.join(WORKSPACE_ROOT, '.github/harness/spec');
const PROJ_SPEC_DIR = path.join(WORKSPACE_ROOT, 'spec');
const CONTEXT_PATH = path.join(WORKSPACE_ROOT, 'CONTEXT.md');
const LOOP_STATE_PATH = path.join(WORKSPACE_ROOT, '.github/worklog/loop-state.json');
const HISTORY_LOG_PATH = path.join(WORKSPACE_ROOT, '.github/worklog/history.jsonl');

const VALID_STATUSES = new Set([
  '未開始', '進行中', '已完成', '阻塞', '暫停', '需補充輸入', '已重置',
  'not started', 'in progress', 'in_progress', 'completed', 'blocked', 'paused', 'needs input', 'reset', 'idle'
]);

function validateSpecStructure(specContent) {
  const errors = [];
  if (!specContent || typeof specContent !== 'string' || specContent.trim().length === 0) {
    return { valid: false, errors: ['Spec 內容為空 (Empty spec content)'] };
  }

  const hasGoal = /##\s*[\d\.\s\w]*(?:目標|Goals?|摘要|Summary)/i.test(specContent);
  if (!hasGoal) {
    errors.push('缺少目標章節 (Missing ## 目標 or ## Goals)');
  }

  const hasCrit = /##\s*[\d\.\s\w\u4e00-\u9fa5]*(?:驗收標準|驗收|Acceptance Criteria|完成定義|Definition of Done|DoD|功能性需求|需求|Requirements)/i.test(specContent);
  if (!hasCrit) {
    errors.push('缺少驗收標準章節 (Missing ## 驗收標準 or ## Acceptance Criteria)');
  } else {
    const criteriaMatch = specContent.match(/##\s*[\d\.\s\w\u4e00-\u9fa5]*(?:驗收標準|驗收|Acceptance Criteria|完成定義|Definition of Done|DoD|功能性需求|需求|Requirements)([\s\S]*?)(?=\n##\s|$)/i);
    const criteriaBody = criteriaMatch ? criteriaMatch[1] : '';
    const items = criteriaBody
      .split('\n')
      .map(line => line.trim())
      .filter(line => /^(?:[-*]|\d+\.|\|(?!\s*[-:]+\s*\|))\s*/.test(line) && !line.includes('需求 ID') && !line.includes('| --- |'));

    if (items.length < 2) {
      errors.push(`驗收標準項目過少 (需至少 2 條驗收項目，目前僅偵測到 ${items.length} 條)`);
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

function validateDualWrite(activeTaskId, status, planFilesOrDirOrContent) {
  const errors = [];
  const normalizedStatus = (status || '').trim().toLowerCase();

  if (!activeTaskId || activeTaskId === 'none' || activeTaskId === 'N/A') {
    return { valid: true, errors: [] };
  }

  let planContent = null;
  if (typeof planFilesOrDirOrContent === 'string' && (planFilesOrDirOrContent.includes('## Slices') || planFilesOrDirOrContent.includes('# Build Plan'))) {
    planContent = planFilesOrDirOrContent;
  } else {
    const planDir = typeof planFilesOrDirOrContent === 'string' ? planFilesOrDirOrContent : HARNESS_PLAN_DIR;
    if (fs.existsSync(planDir)) {
      const files = fs.readdirSync(planDir).filter(f => f.endsWith('.md'));
      const taskPattern = new RegExp(activeTaskId.replace(/[^a-zA-Z0-9_-]/g, ''), 'i');
      const matchedFile = files.find(f => taskPattern.test(f.replace(/[^a-zA-Z0-9_-]/g, '')));
      if (matchedFile) {
        planContent = fs.readFileSync(path.join(planDir, matchedFile), 'utf-8');
      }
    }
  }

  if (!planContent) {
    errors.push(`[Dual-Write FAIL] 找不到對應建置藍圖 (No build plan found for ${activeTaskId})`);
    return { valid: false, errors };
  }

  const inProgressStatuses = new Set(['進行中', 'in progress', 'in_progress', 'active']);
  if (inProgressStatuses.has(normalizedStatus)) {
    const hasActiveOrPendingSlice = /-\s*\[(?:-| )\]/.test(planContent);
    if (!hasActiveOrPendingSlice) {
      errors.push(`[Dual-Write FAIL] 任務為 ${status}，但建置藍圖中無進行中 [-] 或待處理 [ ] 切片`);
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

function runCheck(options = {}) {
  let activeTask = 'none';
  let status = 'idle';
  let route = 'none';

  if (fs.existsSync(AGENT_STATUS_PATH)) {
    const content = fs.readFileSync(AGENT_STATUS_PATH, 'utf-8');
    const idMatch = content.match(/- ID:\s*([^\n]+)/);
    const statusMatch = content.match(/- Status:\s*([^\n]+)/);
    const routeMatch = content.match(/- Route:\s*([^\n]+)/);

    if (idMatch) activeTask = idMatch[1].trim();
    if (statusMatch) status = statusMatch[1].trim();
    if (routeMatch) route = routeMatch[1].trim();
  }

  // Check Spec existence and structural validity (no empty or unformed specs)
  let hasSpec = false;
  const specFilesToCheck = [];
  if (fs.existsSync(HARNESS_SPEC_DIR)) {
    specFilesToCheck.push(...fs.readdirSync(HARNESS_SPEC_DIR).filter(f => f.endsWith('.md')).map(f => path.join(HARNESS_SPEC_DIR, f)));
  }
  if (fs.existsSync(PROJ_SPEC_DIR)) {
    specFilesToCheck.push(...fs.readdirSync(PROJ_SPEC_DIR).filter(f => f.endsWith('.md')).map(f => path.join(PROJ_SPEC_DIR, f)));
  }

  for (const filePath of specFilesToCheck) {
    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      const structRes = validateSpecStructure(content);
      if (structRes.valid) {
        hasSpec = true;
        break;
      }
    } catch (_) {}
  }

  const hasContext = fs.existsSync(CONTEXT_PATH);

  let gateAction = 'PASS';
  let recommendedSkill = route !== 'none' ? route : 'plan-build';

  if (!hasSpec) {
    gateAction = 'LOCK_TO_SPEC';
    recommendedSkill = 'analyze-spec';
  } else if (!hasContext) {
    recommendedSkill = 'context-engineering';
  }

  const result = {
    active_task: activeTask,
    status: status,
    has_spec: hasSpec,
    has_context: hasContext,
    gate_action: gateAction,
    recommended_skill: recommendedSkill
  };

  if (options.human) {
    console.log(`==========================================`);
    console.log(`📋 Harness Status Dashboard (Human View)`);
    console.log(`==========================================`);
    console.log(`📌 Active Task      : ${result.active_task}`);
    console.log(`📊 Current Status   : ${result.status}`);
    console.log(`📄 Feature Spec     : ${result.has_spec ? '✅ Exists' : '❌ Missing'}`);
    console.log(`🌐 Project Context  : ${result.has_context ? '✅ Exists' : '⚠️ Missing (CONTEXT.md)'}`);
    console.log(`🚪 Startup Gate     : ${result.gate_action === 'PASS' ? '✅ PASS' : '🔒 LOCK'}`);
    console.log(`🚀 Recommended Route: ${result.recommended_skill}`);
    console.log(`==========================================`);
  } else if (options.ai || options.compact) {
    console.log(`TASK:${result.active_task}|STATUS:${result.status}|SPEC:${result.has_spec ? 1 : 0}|GATE:${result.gate_action}|ROUTE:${result.recommended_skill}`);
  } else {
    console.log(JSON.stringify(result, null, 2));
  }
}

function runValidate() {
  const errors = [];

  // Validate agent-status.md
  if (fs.existsSync(AGENT_STATUS_PATH)) {
    const content = fs.readFileSync(AGENT_STATUS_PATH, 'utf-8');
    const statusMatch = content.match(/- Status:\s*([^\n]+)/);
    const idMatch = content.match(/- ID:\s*([^\n]+)/);
    const statusVal = statusMatch ? statusMatch[1].trim() : 'idle';
    const activeTaskId = idMatch ? idMatch[1].trim() : 'none';

    if (statusMatch) {
      const normalizedStatus = statusVal.toLowerCase();
      if (!VALID_STATUSES.has(normalizedStatus)) {
        errors.push(`agent-status.md: Invalid status term '${statusVal}'`);
      }
    }

    // Binary Slice Judge Verification
    const sliceResult = judgeSlice(content);
    if (sliceResult.result !== 'PASS') {
      errors.push(`[Slice Judge FAIL] ${sliceResult.reason}`);
    }

    // Dual-Write Atomicity Verification
    const dualWriteRes = validateDualWrite(activeTaskId, statusVal, HARNESS_PLAN_DIR);
    if (!dualWriteRes.valid) {
      errors.push(...dualWriteRes.errors);
    }
  } else {
    errors.push('agent-status.md: File does not exist');
  }

  // Project Guard Hooks: auto-discover and run .github/scripts/*-guard.js
  const scriptsDir = path.join(WORKSPACE_ROOT, '.github/scripts');
  if (fs.existsSync(scriptsDir)) {
    const guardFiles = fs.readdirSync(scriptsDir).filter(f => f.endsWith('-guard.js') && !f.endsWith('.test.js'));
    for (const guardFile of guardFiles) {
      const guardPath = path.join(scriptsDir, guardFile);
      const res = spawnSync(`node "${guardPath}"`, { shell: true, encoding: 'utf-8', cwd: WORKSPACE_ROOT });
      if (res.status !== 0) {
        errors.push(`[Project Guard FAIL: ${guardFile}] ${res.stderr || res.stdout || 'Exited with code ' + res.status}`);
      }
    }
  }

  if (errors.length > 0) {
    console.error('❌ Validation Failed:');
    errors.forEach(err => console.error(`  - ${err}`));
    process.exit(1);
  }

  console.log('✅ Validation Passed: All task cards, dual-write states & guard hooks are compliant.');
  process.exit(0);
}

function runVerify(args) {
  let cmdArgs = args;
  if (cmdArgs[0] === '--') {
    cmdArgs = cmdArgs.slice(1);
  }

  if (cmdArgs.length === 0) {
    console.error('❌ Verify Error: No command specified.');
    process.exit(1);
  }

  const command = cmdArgs.join(' ');
  const res = spawnSync(command, { shell: true, encoding: 'utf-8', cwd: WORKSPACE_ROOT });

  if (res.status === 0) {
    console.log(`✅ [VERIFY PASSED] Command '${command}' completed cleanly.`);
    if (res.stdout) {
      const lines = res.stdout.trim().split('\n');
      const tail = lines.slice(-5).join('\n');
      console.log(tail);
    }
    process.exit(0);
  } else {
    console.error(`❌ [VERIFY FAILED] Command '${command}' exited with code ${res.status}:`);
    if (res.stderr || res.stdout) {
      const errLines = (res.stderr || res.stdout).trim().split('\n');
      console.error(errLines.slice(-10).join('\n'));
    }
    process.exit(res.status || 1);
  }
}

function runCard(options = {}) {
  let task = {
    id: 'none',
    title: 'N/A',
    status: 'idle',
    goal: 'N/A',
    route: 'none',
    current_step: 'N/A',
    evidence: 'N/A',
    next_step: 'N/A'
  };

  if (fs.existsSync(AGENT_STATUS_PATH)) {
    const content = fs.readFileSync(AGENT_STATUS_PATH, 'utf-8');
    
    const idMatch = content.match(/- ID:\s*([^\n]+)/);
    const titleMatch = content.match(/- Title:\s*([^\n]+)/);
    const statusMatch = content.match(/- Status:\s*([^\n]+)/);
    const goalMatch = content.match(/- Goal:\s*([^\n]+)/);
    const routeMatch = content.match(/- Route:\s*([^\n]+)/);

    const stepMatch = content.match(/- CurrentStep:\s*([^\n]+)/);
    const evidenceMatch = content.match(/- Evidence:\s*([^\n]+)/);
    const nextMatch = content.match(/- NextStep:\s*([^\n]+)/);

    if (idMatch) task.id = idMatch[1].trim();
    if (titleMatch) task.title = titleMatch[1].trim();
    if (statusMatch) task.status = statusMatch[1].trim();
    if (goalMatch) task.goal = goalMatch[1].trim();
    if (routeMatch) task.route = routeMatch[1].trim();

    if (stepMatch) task.current_step = stepMatch[1].trim();
    if (evidenceMatch) task.evidence = evidenceMatch[1].trim();
    if (nextMatch) task.next_step = nextMatch[1].trim();
  }

  if (options.ai || options.compact) {
    console.log(`CARD|ID:${task.id}|STATUS:${task.status}|ROUTE:${task.route}|STEP:${task.current_step}`);
  } else {
    console.log(`==================================================`);
    console.log(`📋 Task Card (Generated by harness-cli)`);
    console.log(`==================================================`);
    console.log(`📌 Task ID         : ${task.id}`);
    console.log(`🏷️ Task Title      : ${task.title}`);
    console.log(`🎯 Task Goal       : ${task.goal}`);
    console.log(`📊 Current Status   : ${task.status}`);
    console.log(`🚀 Skill Route     : ${task.route}`);
    console.log(`📍 Current Step    : ${task.current_step}`);
    console.log(`🔍 Evidence        : ${task.evidence}`);
    console.log(`➡️ Next Step       : ${task.next_step}`);
    console.log(`==================================================`);
  }
}

function runLoop(args) {
  const sub = args[0] || 'status';

  if (sub === 'status') {
    let state = {
      active: false,
      taskId: 'none',
      iteration: 0,
      maxIterations: 3,
      status: 'idle',
      history: []
    };
    if (fs.existsSync(LOOP_STATE_PATH)) {
      try {
        state = JSON.parse(fs.readFileSync(LOOP_STATE_PATH, 'utf-8'));
      } catch (e) {}
    }
    const isHuman = args.includes('--human');
    const isAi = args.includes('--ai');
    if (isHuman) {
      console.log(`==========================================`);
      console.log(`🔄 Loop Engineering Monitor (Human View)`);
      console.log(`==========================================`);
      console.log(`📌 Task ID         : ${state.taskId}`);
      console.log(`📊 Loop Status     : ${state.status}`);
      console.log(`🔢 Iteration       : ${state.iteration} / ${state.maxIterations}`);
      console.log(`📜 History Entries : ${state.history ? state.history.length : 0}`);
      if (state.history && state.history.length > 0) {
        const last = state.history[state.history.length - 1];
        console.log(`🎯 Last Hypothesis : ${last.hypothesis}`);
        console.log(`🏁 Last Verdict    : ${last.verdict} (Exit ${last.exitCode})`);
      }
      console.log(`==========================================`);
    } else if (isAi) {
      console.log(`LOOP|TASK:${state.taskId}|ITER:${state.iteration}/${state.maxIterations}|STATUS:${state.status}|HISTORY:${state.history ? state.history.length : 0}`);
    } else {
      console.log(JSON.stringify(state, null, 2));
    }
    return;
  }

  if (sub === 'reset') {
    if (fs.existsSync(LOOP_STATE_PATH)) {
      fs.unlinkSync(LOOP_STATE_PATH);
    }
    console.log('✅ Loop state reset successfully.');
    return;
  }

  if (sub === 'step') {
    let hypothesis = 'Iterative refinement';
    let cmd = 'npm test';
    let max = 3;

    for (let i = 1; i < args.length; i++) {
      if (args[i].startsWith('--hypothesis=')) {
        hypothesis = args[i].slice('--hypothesis='.length);
      } else if (args[i] === '--hypothesis' && args[i + 1]) {
        hypothesis = args[++i];
      } else if (args[i].startsWith('--cmd=')) {
        cmd = args[i].slice('--cmd='.length);
      } else if (args[i] === '--cmd' && args[i + 1]) {
        cmd = args[++i];
      } else if (args[i].startsWith('--max=')) {
        max = parseInt(args[i].slice('--max='.length), 10) || 3;
      } else if (args[i] === '--max' && args[i + 1]) {
        max = parseInt(args[++i], 10) || 3;
      }
    }

    let activeTaskId = 'TASK-UNKNOWN';
    if (fs.existsSync(AGENT_STATUS_PATH)) {
      const match = fs.readFileSync(AGENT_STATUS_PATH, 'utf-8').match(/- ID:\s*([^\n]+)/);
      if (match) activeTaskId = match[1].trim();
    }

    let state = {
      active: true,
      taskId: activeTaskId,
      iteration: 0,
      maxIterations: max,
      status: 'active',
      history: []
    };

    if (fs.existsSync(LOOP_STATE_PATH)) {
      try {
        state = JSON.parse(fs.readFileSync(LOOP_STATE_PATH, 'utf-8'));
      } catch (e) {}
    }

    // Hard Stop Check: if iteration already reached maxIterations
    if (state.iteration >= state.maxIterations) {
      state.status = 'blocked';
      fs.writeFileSync(LOOP_STATE_PATH, JSON.stringify(state, null, 2));

      // Update agent-status.md to 阻塞
      if (fs.existsSync(AGENT_STATUS_PATH)) {
        let content = fs.readFileSync(AGENT_STATUS_PATH, 'utf-8');
        content = content.replace(/- Status:\s*[^\n]+/, '- Status: 阻塞');
        fs.writeFileSync(AGENT_STATUS_PATH, content);
      }

      console.error(`❌ [HARD STOP TRIGGERED] Maximum iterations (${state.maxIterations}) reached. Halting loop to prevent Token Black Hole.`);
      process.exit(2);
    }

    // Execute step command
    const res = spawnSync(cmd, { shell: true, encoding: 'utf-8', cwd: WORKSPACE_ROOT });
    const exitCode = res.status !== null ? res.status : 1;
    const isPass = exitCode === 0;

    let diffSummary = '';
    try {
      const diffRes = spawnSync('git diff --stat', { shell: true, encoding: 'utf-8', cwd: WORKSPACE_ROOT });
      diffSummary = diffRes.stdout ? diffRes.stdout.trim() : '';
    } catch (e) {}

    const iterationNum = state.iteration + 1;
    const historyEntry = {
      timestamp: new Date().toISOString(),
      taskId: activeTaskId,
      iteration: iterationNum,
      hypothesis,
      command: cmd,
      exitCode,
      verdict: isPass ? 'PASS' : 'FAIL',
      diffSummary: diffSummary || 'none'
    };

    state.iteration = iterationNum;
    state.history = state.history || [];
    state.history.push(historyEntry);

    try {
      const worklogDir = path.dirname(HISTORY_LOG_PATH);
      if (!fs.existsSync(worklogDir)) {
        fs.mkdirSync(worklogDir, { recursive: true });
      }
      fs.appendFileSync(HISTORY_LOG_PATH, JSON.stringify(historyEntry) + '\n');
    } catch (e) {}

    if (isPass) {
      state.status = 'converged';
      fs.writeFileSync(LOOP_STATE_PATH, JSON.stringify(state, null, 2));
      console.log(`✅ [LOOP CONVERGED] Goal achieved at iteration ${iterationNum}/${state.maxIterations}! (Exit 0)`);
      process.exit(0);
    } else {
      if (iterationNum >= state.maxIterations) {
        state.status = 'blocked';
        fs.writeFileSync(LOOP_STATE_PATH, JSON.stringify(state, null, 2));

        if (fs.existsSync(AGENT_STATUS_PATH)) {
          let content = fs.readFileSync(AGENT_STATUS_PATH, 'utf-8');
          content = content.replace(/- Status:\s*[^\n]+/, '- Status: 阻塞');
          fs.writeFileSync(AGENT_STATUS_PATH, content);
        }

        console.error(`❌ [HARD STOP TRIGGERED] Iteration ${iterationNum}/${state.maxIterations} failed. Maximum attempts reached. State set to 阻塞.`);
        process.exit(2);
      } else {
        state.status = 'active';
        fs.writeFileSync(LOOP_STATE_PATH, JSON.stringify(state, null, 2));
        console.warn(`⚠️ [LOOP STEP FAILED] Iteration ${iterationNum}/${state.maxIterations} failed (Exit ${exitCode}). Retrying next iteration.`);
        process.exit(1);
      }
    }
  }

  console.error(`Unknown loop subcommand: ${sub}`);
  console.error('Usage: harness-cli loop <status|step|reset> [--hypothesis="..."] [--cmd="..."] [--max=3]');
  process.exit(1);
}

function main() {
  const args = process.argv.slice(2);
  const subcommand = args[0];

  const options = {
    human: args.includes('--human'),
    ai: args.includes('--ai'),
    compact: args.includes('--compact')
  };

  if (!subcommand || subcommand === 'check' || subcommand.startsWith('--')) {
    runCheck(options);
  } else if (subcommand === 'card' || subcommand === 'taskcard') {
    runCard(options);
  } else if (subcommand === 'validate') {
    runValidate();
  } else if (subcommand === 'verify') {
    runVerify(args.slice(1));
  } else if (subcommand === 'loop') {
    runLoop(args.slice(1));
  } else {
    console.error(`Unknown subcommand: ${subcommand}`);
    console.error('Usage: harness-cli <check|card|validate|verify|loop> [--human|--ai|--compact]');
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = {
  validateSpecStructure,
  validateDualWrite,
  runCheck,
  runValidate,
  runVerify,
  runCard,
  runLoop
};

