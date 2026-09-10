const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('path');
const fs = require('fs');
const os = require('os');
const { resolveIntent, evaluateRouter } = require('./eval-router');

test('resolveIntent: positive samples resolve to plan-to-build', () => {
  const p1 = resolveIntent('我想做會員註冊 POC，幫我跑 FDE 流程');
  assert.strictEqual(p1, 'plan-to-build');

  const p2 = resolveIntent('請規劃電商結帳流程並產出 Spec');
  assert.strictEqual(p2, 'plan-to-build');

  const p3 = resolveIntent('我們要重構購物車模組，幫我從 Phase 1 開始規劃');
  assert.strictEqual(p3, 'plan-to-build');
});

test('resolveIntent: without negative guardrails, negative prompts with keywords cause False Positives', () => {
  // 沒有負向排除時，包含「開案」或「plan-to-build」的否定句會被誤判為 plan-to-build
  const res1 = resolveIntent('不要開案，只要列出 Prisma 常用指令', { agentsMdContent: '' });
  assert.strictEqual(res1, 'plan-to-build');

  const res2 = resolveIntent('我只想查詢連線字串，別進 plan-to-build', { agentsMdContent: '' });
  assert.strictEqual(res2, 'plan-to-build');
});

test('resolveIntent: with negative guardrails active, correctly routes negatives to other', () => {
  const agentsMdContent = '## 負向排除清單 (Negative Guardrails)\n- 當輸入包含僅查詢、不要開案時強制路由為 other';

  const res1 = resolveIntent('不要開案，只要列出 Prisma 常用指令', { agentsMdContent });
  assert.strictEqual(res1, 'other');

  const res2 = resolveIntent('我只想查詢連線字串，別進 plan-to-build', { agentsMdContent });
  assert.strictEqual(res2, 'other');

  const res3 = resolveIntent('什麼是 Plan-to-Build？', { agentsMdContent });
  assert.strictEqual(res3, 'other');

  const res4 = resolveIntent('解釋一下評測指標中的 TPR 跟 TNR 是什麼意思？', { agentsMdContent });
  assert.strictEqual(res4, 'other');
});

test('evaluateRouter calculates metrics and confusion matrix accurately', () => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'p2b-eval-test-'));
  try {
    const mockDataset = [
      { id: 1, prompt: '我想做會員註冊 POC', expected_intent: 'plan-to-build' },
      { id: 2, prompt: '請規劃電商結帳流程', expected_intent: 'plan-to-build' },
      { id: 3, prompt: '不要開案，查詢 Prisma 指令', expected_intent: 'other' },
      { id: 4, prompt: '什麼是 Plan-to-Build？', expected_intent: 'other' }
    ];
    const datasetPath = path.join(tmpDir, 'mock-dataset.json');
    fs.writeFileSync(datasetPath, JSON.stringify(mockDataset), 'utf-8');

    const agentsMdPath = path.join(tmpDir, 'AGENTS.md');
    fs.writeFileSync(agentsMdPath, '## 負向排除 (Negative Guardrails)', 'utf-8');

    const evalReport = evaluateRouter({ datasetPath, agentsMdPath });
    assert.strictEqual(evalReport.total, 4);
    assert.strictEqual(evalReport.tp, 2);
    assert.strictEqual(evalReport.tn, 2);
    assert.strictEqual(evalReport.fp, 0);
    assert.strictEqual(evalReport.fn, 0);
    assert.strictEqual(evalReport.tpr, 1);
    assert.strictEqual(evalReport.tnr, 1);
    assert.strictEqual(evalReport.pass, true);
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
});
