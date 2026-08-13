#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const WORKSPACE_ROOT = path.resolve(__dirname, '../../');
const AGENT_STATUS_PATH = path.join(WORKSPACE_ROOT, '.github/worklog/agent-status.md');
const HARNESS_PLAN_DIR = path.join(WORKSPACE_ROOT, '.github/harness/plan');
const HARNESS_SPEC_DIR = path.join(WORKSPACE_ROOT, '.github/harness/spec');
const PROJ_SPEC_DIR = path.join(WORKSPACE_ROOT, 'spec');
const CONTEXT_PATH = path.join(WORKSPACE_ROOT, 'CONTEXT.md');

const VALID_STATUSES = new Set([
  '未開始', '進行中', '已完成', '阻塞', '暫停', '需補充輸入', '已重置',
  'not started', 'in progress', 'completed', 'blocked', 'paused', 'needs input', 'reset', 'idle'
]);

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

  // Check Spec existence
  let hasSpec = false;
  if (fs.existsSync(HARNESS_SPEC_DIR)) {
    const files = fs.readdirSync(HARNESS_SPEC_DIR).filter(f => f.endsWith('.md'));
    if (files.length > 0) hasSpec = true;
  }
  if (!hasSpec && fs.existsSync(PROJ_SPEC_DIR)) {
    const files = fs.readdirSync(PROJ_SPEC_DIR).filter(f => f.endsWith('.md'));
    if (files.length > 0) hasSpec = true;
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
    if (statusMatch) {
      const statusVal = statusMatch[1].trim().toLowerCase();
      if (!VALID_STATUSES.has(statusVal)) {
        errors.push(`agent-status.md: Invalid status term '${statusVal}'`);
      }
    }
  } else {
    errors.push('agent-status.md: File does not exist');
  }

  if (errors.length > 0) {
    console.error('❌ Validation Failed:');
    errors.forEach(err => console.error(`  - ${err}`));
    process.exit(1);
  }

  console.log('✅ Validation Passed: All task cards & status terms are compliant.');
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
  } else {
    console.error(`Unknown subcommand: ${subcommand}`);
    console.error('Usage: harness-cli <check|card|validate|verify> [--human|--ai|--compact]');
    process.exit(1);
  }
}

main();
