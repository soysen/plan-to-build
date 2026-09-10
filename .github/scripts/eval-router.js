#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const DEFAULT_WORKSPACE_ROOT = path.resolve(__dirname, '../../');
const DEFAULT_DATASET_PATH = path.join(DEFAULT_WORKSPACE_ROOT, '.agents/evals/router-dataset.json');
const DEFAULT_AGENTS_MD_PATH = path.join(DEFAULT_WORKSPACE_ROOT, 'AGENTS.md');

/**
 * 意圖解析核心函數
 * @param {string} prompt - 使用者輸入
 * @param {object} [options]
 * @param {string} [options.agentsMdContent] - AGENTS.md 內容
 * @returns {'plan-to-build' | 'other'}
 */
function resolveIntent(prompt, options = {}) {
  const text = (prompt || '').trim();
  if (!text) return 'other';

  const agentsMd = options.agentsMdContent || '';
  const hasNegativeGuardrails = /負向排除|Negative Guardrail/i.test(agentsMd);

  // 1. 若 AGENTS.md 已包含負向排除規則，先執行負向檢驗
  if (hasNegativeGuardrails) {
    const negativeKeywords = [
      '僅查詢', '不要開案', '說明概念', '範例指令', '範例代碼',
      '別進 plan-to-build', '別進plan-to-build', '不用跑開案', '不用跑流程',
      '只是要看', '不要啟動', '只想查詢'
    ];

    const isExplicitNegative = negativeKeywords.some(kw => text.toLowerCase().includes(kw.toLowerCase()));
    if (isExplicitNegative) {
      return 'other';
    }

    // 邊界諮詢與純問答特徵（以問句、概念解釋為主，非行動指示）
    const inquiryPatterns = [
      /^什麼是/i,
      /是什麼意思/i,
      /^解釋(一下)?/i,
      /^說明(一下)?/i,
      /^如何看待/i,
      /的差別/i,
      /的差異/i,
      /為什麼.+說明概念/i
    ];

    const isConsultation = inquiryPatterns.some(pat => pat.test(text));
    if (isConsultation) {
      return 'other';
    }
  }

  // 2. 正向意圖特徵比對
  const positivePatterns = [
    /POC/i,
    /FDE/i,
    /plan-to-build/i,
    /開案/i,
    /Spec/i,
    /PRD/i,
    /規劃.+流程/i,
    /分析需求/i,
    /建置計畫/i,
    /重構.+模組/i,
    /使用者故事/i,
    /開立.+規格/i,
    /任務切片/i,
    /梳理需求/i
  ];

  const isPositive = positivePatterns.some(pat => pat.test(text));
  if (isPositive) {
    return 'plan-to-build';
  }

  return 'other';
}

/**
 * 評測 Intent Router
 * @param {object} [options]
 * @param {string} [options.datasetPath]
 * @param {string} [options.agentsMdPath]
 * @returns {object}
 */
function evaluateRouter(options = {}) {
  const datasetPath = options.datasetPath || DEFAULT_DATASET_PATH;
  const agentsMdPath = options.agentsMdPath || DEFAULT_AGENTS_MD_PATH;

  if (!fs.existsSync(datasetPath)) {
    throw new Error(`黃金測試集不存在: ${datasetPath}`);
  }

  const dataset = JSON.parse(fs.readFileSync(datasetPath, 'utf-8'));
  const agentsMdContent = fs.existsSync(agentsMdPath) ? fs.readFileSync(agentsMdPath, 'utf-8') : '';

  let tp = 0;
  let fp = 0;
  let tn = 0;
  let fn = 0;

  const results = [];

  for (const item of dataset) {
    const predicted = resolveIntent(item.prompt, { agentsMdContent });
    const isCorrect = predicted === item.expected_intent;

    if (item.expected_intent === 'plan-to-build') {
      if (predicted === 'plan-to-build') {
        tp++;
      } else {
        fn++;
      }
    } else {
      if (predicted === 'other') {
        tn++;
      } else {
        fp++;
      }
    }

    results.push({
      id: item.id,
      prompt: item.prompt,
      category: item.category || 'N/A',
      expected: item.expected_intent,
      predicted,
      isCorrect
    });
  }

  const total = dataset.length;
  const tpr = (tp + fn) > 0 ? tp / (tp + fn) : 0;
  const tnr = (tn + fp) > 0 ? tn / (tn + fp) : 0;
  const accuracy = total > 0 ? (tp + tn) / total : 0;

  const failedCases = results.filter(r => !r.isCorrect);

  return {
    total,
    tp,
    fp,
    tn,
    fn,
    tpr,
    tnr,
    accuracy,
    results,
    failedCases,
    pass: tpr >= 0.8 && tnr >= 0.8
  };
}

/**
 * 格式化輸出報告表格
 * @param {object} evalReport
 */
function printEvaluationReport(evalReport) {
  const formatPct = val => `${(val * 100).toFixed(1)}%`;

  console.log('======================================================================');
  console.log('📊 Intent Router 評測報告 (Intent Router Evaluation Report)');
  console.log('======================================================================');
  console.log(`總樣本數: ${evalReport.total}`);
  console.log(`TP (真陽性): ${evalReport.tp.toString().padStart(2)} | FP (偽陽性): ${evalReport.fp.toString().padStart(2)}`);
  console.log(`FN (偽陰性): ${evalReport.fn.toString().padStart(2)} | TN (真陰性): ${evalReport.tn.toString().padStart(2)}`);
  console.log('----------------------------------------------------------------------');
  console.log('【混淆矩陣 (Confusion Matrix)】');
  console.log('                        預測: plan-to-build     預測: other');
  console.log(`實際: plan-to-build            ${evalReport.tp.toString().padStart(2)}                   ${evalReport.fn.toString().padStart(2)}`);
  console.log(`實際: other                    ${evalReport.fp.toString().padStart(2)}                   ${evalReport.tn.toString().padStart(2)}`);
  console.log('----------------------------------------------------------------------');
  console.log('【核心指標表現】');
  console.log(`- TPR (True Positive Rate) : ${formatPct(evalReport.tpr)} (目標 >= 80%) [${evalReport.tpr >= 0.8 ? '✅ PASS' : '❌ FAIL'}]`);
  console.log(`- TNR (True Negative Rate) : ${formatPct(evalReport.tnr)} (目標 >= 80%) [${evalReport.tnr >= 0.8 ? '✅ PASS' : '❌ FAIL'}]`);
  console.log(`- 總體準確率 (Accuracy)    : ${formatPct(evalReport.accuracy)}`);
  console.log('----------------------------------------------------------------------');

  if (evalReport.failedCases.length > 0) {
    console.log(`【失敗案例清單 (共 ${evalReport.failedCases.length} 筆)】`);
    evalReport.failedCases.forEach(c => {
      console.log(`  [ID ${c.id.toString().padStart(2)}] 類別: ${c.category.padEnd(20)} | 實際: ${c.expected.padEnd(14)} | 預測: ${c.predicted}`);
      console.log(`       Prompt: "${c.prompt}"`);
    });
  } else {
    console.log('🎉 無任何失敗案例，全數分類正確！');
  }

  console.log('======================================================================');
}

// CLI Execution
if (require.main === module) {
  const args = process.argv.slice(2);
  const reportOnly = args.includes('--report-only');

  try {
    const evalReport = evaluateRouter();
    printEvaluationReport(evalReport);

    if (!reportOnly && !evalReport.pass) {
      process.exit(1);
    }
    process.exit(0);
  } catch (err) {
    console.error('評測執行失敗:', err.message);
    process.exit(1);
  }
}

module.exports = {
  resolveIntent,
  evaluateRouter,
  printEvaluationReport
};
