#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const DEFAULT_WORKSPACE_ROOT = path.resolve(__dirname, '../../');
const DEFAULT_AGENT_STATUS_PATH = path.join(DEFAULT_WORKSPACE_ROOT, '.github/worklog/agent-status.md');

/**
 * 客觀命令日誌與確定性證據特徵
 */
const OBJECTIVE_SIGNATURES = [
  /exit\s*code:\s*\d+/i,
  /退出碼[:：]\s*\d+/i,
  /\b\d+\s+(pass|passed|tests|failing)\b/i,
  /[✔✖]/,
  /\b(npm|node|npx|git|pnpm|yarn|cargo|go|python)\s+\S+/i,
  /\b(TPR|TNR|Accuracy|ExitCode|missingSections)\b/i,
  /\{[\s\S]*\}/,
  /\[[\s\S]*\]/
];

/**
 * 主觀/宣稱型口頭特徵
 */
const SUBJECTIVE_ONLY_PATTERNS = [
  /^已(成功)?(完成|實作|修復|處理|更新|寫好)[!。.]?$/i,
  /^功能(正常|運作正常|都OK)[!。.]?$/i,
  /^在本地測試(都|全部)?通過[!。.]?$/i,
  /^(全部|一切)正常[!。.]?$/i,
  /^已經(修改完畢|搞定|測試過)[!。.]?$/i
];

/**
 * 執行切片二元評判
 * @param {string} statusContent - agent-status.md 檔案內容
 * @returns {{ result: 'PASS' | 'FAIL', reason: string, details?: object }}
 */
function judgeSlice(statusContent) {
  if (!statusContent || typeof statusContent !== 'string') {
    return {
      result: 'FAIL',
      reason: '未提供有效的 agent-status 內容或檔案為空。'
    };
  }

  const idMatch = statusContent.match(/- ID:\s*([^\n]+)/);
  const statusMatch = statusContent.match(/- Status:\s*([^\n]+)/);
  const goalMatch = statusContent.match(/- Goal:\s*([^\n]+)/);
  const evidenceMatch = statusContent.match(/- Evidence:\s*([^\n]+)/);

  const taskId = idMatch ? idMatch[1].trim() : 'unknown';
  const status = statusMatch ? statusMatch[1].trim() : 'idle';
  const goal = goalMatch ? goalMatch[1].trim() : '';
  const evidence = evidenceMatch ? evidenceMatch[1].trim() : '';

  // 1. 若當前狀態非「已完成」，處於過渡期，允許通過但提示非結案狀態
  const isCompleted = /已完成|completed/i.test(status);
  if (!isCompleted) {
    return {
      result: 'PASS',
      reason: `任務 [${taskId}] 當前狀態為 '${status}'，非結案狀態，二元驗收攔截放行。`,
      details: { taskId, status, goal, evidence }
    };
  }

  // 2. 若狀態為「已完成」，嚴格審查 Evidence
  // 檢查 A：Evidence 是否為空或無效佔位符
  if (!evidence || /^(無|none|n\/a|進行中|待補|未提供)$/i.test(evidence)) {
    return {
      result: 'FAIL',
      reason: `任務 [${taskId}] 標記為已完成，但 Evidence 欄位為空或為無效佔位符。`,
      details: { taskId, status, goal, evidence }
    };
  }

  // 檢查 B：純口頭描述攔截
  const isPureSubjective = SUBJECTIVE_ONLY_PATTERNS.some(pat => pat.test(evidence.trim()));
  const hasObjectiveSignatures = OBJECTIVE_SIGNATURES.some(sig => sig.test(evidence));

  if (isPureSubjective || !hasObjectiveSignatures) {
    return {
      result: 'FAIL',
      reason: `任務 [${taskId}] Evidence 僅有主觀口頭描述「${evidence}」，缺少實際命令執行日誌、Exit Code 或測試通過數據等客觀證據。`,
      details: { taskId, status, goal, evidence }
    };
  }

  // 檢查 C：命令失敗但標記完成攔截 (非零退出碼)
  const nonZeroExitMatch = evidence.match(/exit\s*code:\s*([1-9]\d*)/i) || evidence.match(/退出碼[:：]\s*([1-9]\d*)/i);
  if (nonZeroExitMatch) {
    return {
      result: 'FAIL',
      reason: `任務 [${taskId}] 標記為已完成，但 Evidence 包含非零退出碼 (Exit code: ${nonZeroExitMatch[1]}) 失敗紀錄。`,
      details: { taskId, status, goal, evidence }
    };
  }

  // 檢查 D：包含 FAIL 關鍵字且無通過說明
  if (/\bFAIL\b/i.test(evidence) && !/0\s+fail/i.test(evidence)) {
    return {
      result: 'FAIL',
      reason: `任務 [${taskId}] Evidence 包含測試失敗或 FAIL 紀錄，與「已完成」狀態相悖。`,
      details: { taskId, status, goal, evidence }
    };
  }

  // 通過二元評判
  return {
    result: 'PASS',
    reason: `任務 [${taskId}] 驗收證據真實完整，包含客觀命令日誌或量化測試數據，二元評判通過。`,
    details: { taskId, status, goal, evidence }
  };
}

// CLI Execution
if (require.main === module) {
  const args = process.argv.slice(2);
  const targetFile = args[0] || DEFAULT_AGENT_STATUS_PATH;

  if (!fs.existsSync(targetFile)) {
    console.error(JSON.stringify({
      result: 'FAIL',
      reason: `狀態檔案不存在: ${targetFile}`
    }, null, 2));
    process.exit(1);
  }

  const content = fs.readFileSync(targetFile, 'utf-8');
  const decision = judgeSlice(content);

  console.log(JSON.stringify({
    result: decision.result,
    reason: decision.reason
  }, null, 2));

  if (decision.result !== 'PASS') {
    console.error(`\n❌ [Slice Judge Blocked] 結案驗收未通過，阻斷提交！\n原因: ${decision.reason}`);
    process.exit(1);
  } else {
    console.log(`\n✅ [Slice Judge Passed] ${decision.reason}`);
    process.exit(0);
  }
}

module.exports = {
  judgeSlice
};
