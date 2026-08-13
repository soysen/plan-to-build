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

test('harness-cli verify subcommand wraps command and filters log output', () => {
  const output = execSync(`node "${CLI_PATH}" verify -- echo "Hello World"`, { encoding: 'utf-8' });
  assert.match(output, /VERIFY PASSED/i);
  assert.match(output, /Hello World/);
});
