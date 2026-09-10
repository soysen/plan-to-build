#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { assertPhase } = require('./assert-phase');

const DEFAULT_WORKSPACE_ROOT = path.resolve(__dirname, '../../');
const DEFAULT_STATE_FILE = path.join(DEFAULT_WORKSPACE_ROOT, '.fde-phase.json');

/**
 * 取得當前 FDE Phase
 * @param {string} [stateFile]
 * @returns {number}
 */
function getCurrentPhase(stateFile = DEFAULT_STATE_FILE) {
  if (fs.existsSync(stateFile)) {
    try {
      const data = JSON.parse(fs.readFileSync(stateFile, 'utf-8'));
      if (typeof data.currentPhase === 'number' && data.currentPhase >= 1 && data.currentPhase <= 3) {
        return data.currentPhase;
      }
    } catch (_) {}
  }
  return 1;
}

/**
 * 設定當前 FDE Phase
 * @param {number} phase
 * @param {string} [stateFile]
 */
function setPhase(phase, stateFile = DEFAULT_STATE_FILE) {
  const p = parseInt(phase, 10);
  if (isNaN(p) || p < 1 || p > 3) {
    throw new Error(`無效的 Phase 編號: ${phase} (僅支援 1, 2, 3)`);
  }
  fs.writeFileSync(stateFile, JSON.stringify({ currentPhase: p, updatedAt: new Date().toISOString() }, null, 2), 'utf-8');
  return p;
}

/**
 * 執行 Phase 驗證並於通過時躍遷
 * @param {object} [options]
 * @param {string} [options.workspaceRoot]
 * @param {string} [options.stateFile]
 * @param {boolean} [options.checkOnly]
 * @returns {{ currentPhase: number, nextPhase: number|null, pass: boolean, report: object }}
 */
function runPhaseTransition(options = {}) {
  const workspaceRoot = options.workspaceRoot || DEFAULT_WORKSPACE_ROOT;
  const stateFile = options.stateFile || path.join(workspaceRoot, '.fde-phase.json');
  const checkOnly = Boolean(options.checkOnly);

  const currentPhase = getCurrentPhase(stateFile);
  const report = assertPhase(currentPhase, { workspaceRoot });

  if (!report.pass) {
    console.error(`[FDE Blocked] Phase ${currentPhase} 驗收未通過:`, report.errors);
    if (report.missingSections && report.missingSections.length > 0) {
      console.error(`[FDE Blocked] 缺少必要章節:`, report.missingSections);
    }
    return {
      currentPhase,
      nextPhase: null,
      pass: false,
      report
    };
  }

  let nextPhase = currentPhase;
  if (!checkOnly) {
    if (currentPhase < 3) {
      nextPhase = currentPhase + 1;
      setPhase(nextPhase, stateFile);
      console.log(`[FDE Success] Phase ${currentPhase} 驗收通過！已推進至 Phase ${nextPhase}`);
    } else {
      console.log(`[FDE Complete] 所有 Phase (1~3) 已全數驗收通過！`);
    }
  } else {
    console.log(`[FDE Verified] Phase ${currentPhase} 驗收通過 (Check-only 模式，未變更狀態)`);
  }

  return {
    currentPhase,
    nextPhase,
    pass: true,
    report
  };
}

// CLI Execution
if (require.main === module) {
  const args = process.argv.slice(2);

  if (args.includes('--get')) {
    console.log(getCurrentPhase());
    process.exit(0);
  }

  const setIdx = args.indexOf('--set');
  if (setIdx !== -1 && args[setIdx + 1]) {
    try {
      const p = setPhase(args[setIdx + 1]);
      console.log(`已將當前 Phase 設定為: ${p}`);
      process.exit(0);
    } catch (err) {
      console.error(err.message);
      process.exit(1);
    }
  }

  if (args.includes('--reset')) {
    setPhase(1);
    console.log('已重置 Phase 為 Phase 1');
    process.exit(0);
  }

  const checkOnly = args.includes('--check');
  const outcome = runPhaseTransition({ checkOnly });

  if (!outcome.pass) {
    process.exit(1);
  }
  process.exit(0);
}

module.exports = {
  getCurrentPhase,
  setPhase,
  runPhaseTransition
};
