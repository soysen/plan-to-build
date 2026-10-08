# Plan-to-Build Master Agent Guide

本檔為全域規則與主路標層。詳細工作流在 `.github/harness/harness-workflow.md`，狀態詞彙見 `.github/harness/harness-status-dictionary.md`。

## AI 讀取順序與兩跳尋址
1. `AGENTS.md`（本檔）：原則、四閘門、強管轄路由（每次自動載入）
2. `.github/copilot-instructions.md`：環境工具偏好
3. `.github/harness/harness-workflow.md`：工作流程、追蹤卡、切片雙寫規則
4. `.github/skills/*/SKILL.md`：11 個核心 Skill（依任務等級按需分級載入）
5. 活文件：`.github/worklog/agent-status.md` 與 `.github/harness/plan/*-build-plan.md`

## 啟動四閘門 (CLI 優先)
每次新需求優先執行 `node .github/scripts/harness-cli.js check --ai`：
1. **未完成任務閘門**：`agent-status.md` 存在非 `idle/已完成` 任務時，先請使用者決策：`繼續 / 重置`。
2. **Input 收斂閘門**：遇空泛詞彙（`優化/改善/重構/調整`）缺少邊界與驗收標準時，標 `需補充輸入` 暫緩動工。
3. **任務分級閘門**：`micro`（單檔/無行為影響）、`standard`（多檔可估範圍）、`heavy`（跨模組高風險）。
4. **實作啟動閘門**：無 Spec 時強制先走 `analyze-spec`；動工前先更新活文件標記 `進行中`。

## 核心 11 大 Skill 路由對照
- 發想與探索 ➔ `idea-refine`
- 需求/架構壓力測試與質詢 ➔ `grill-me`
- 需求分析與開立規格書 ➔ `analyze-spec`
- 系統架構、Sitemap、API 設計與 ADR ➔ `design-architecture`
- 建置計畫與垂直切片拆解 ➔ `plan-build`
- TDD 紅綠循環實作與測試規劃 ➔ `tdd-build`
- 系統性除錯與根因修復 ➔ `debugging-and-error-recovery`
- 程式碼審查、簡化與安全性檢核 ➔ `code-review-and-quality`
- 獨立模型盲點審查 ➔ `cross-model-review`
- Git 提交、PR 說明、版號與發佈 ➔ `git-commit`
- 流程復盤與環境改進 ➔ `retrospective-and-learnings`

## 負向排除清單 (Negative Guardrails)
- 當輸入包含「僅查詢」、「不要開案」、「說明概念」、「範例指令」、「範例代碼」時，強制路由為 `other`，嚴禁啟動開案工作流。
- 當輸入強調「別進 plan-to-build」、「不用跑開案流程」、「只是要看版本/代碼」時，強制路由為 `other`。
- 當輸入為純問答、概念諮詢或指標查詢（例如「什麼是 Plan-to-Build？」、「解釋一下 TPR 跟 TNR」）而非開案或切片實作指令時，強制路由為 `other`。

## 全域行為鐵律
1. **狀態先於動作**：任何工具調用與切片實作前，先雙寫更新活文件。
2. **TDD 鐵律**：嚴禁在測試失敗 (Red) 報告出現前撰寫產品實作代碼。
3. **審查與 Stop Hook**：`standard`/`heavy` 任務結案前需有 `code-review-and-quality` 審查；`heavy` 需有獨立審核標記：`> [!CHECK] Cross-Model Review Approved by [Model/Role Name]`。
4. **交接協定**：重要階段產物尾端必須附帶 15 行標準 `Agent Handoff Protocol`。
