# Harness Workflow Appendix

本附錄承接 `.github/harness/harness-workflow.md` 的低頻範例、文字樣板與流程觀測參考，避免主 workflow 文件承載過多常駐 token。

## 目錄
- [步驟地圖 (核心 11 大 Skill)](#步驟地圖)
- [追蹤卡文字樣板](#追蹤卡文字樣板)
- [常見狀態轉換與切片範例](#常見狀態轉換與切片範例)
- [流程觀測最小指標](#流程觀測最小指標)

## 步驟地圖

| 階段 | 核心 Skill | 產出 |
| --- | --- | --- |
| 路由與總覽 | `AGENTS.md` | 四閘門檢測與建議 Skill |
| 想法探索 | `idea-refine` | 可執行概念、MVP 邊界、核心假設 |
| 質詢拷問 | `grill-me` | 3+ 輪壓力測試、防衛策略與 Non-goals |
| 規格定義 | `analyze-spec` | `.github/harness/spec/{feature-name}-spec.md` |
| 架構與合約 | `design-architecture` | Sitemap、SA/SD、API 合約與 ADR |
| 計畫與切片 | `plan-build` | `.github/harness/plan/{feature-name}-build-plan.md` |
| TDD 建置 | `tdd-build` | 帶 Checkpoint 與測試日誌的薄切片實作 |
| 根因除錯 | `debugging-and-error-recovery` | 根因分析、修復與回歸測試防護 |
| 審查與品質 | `code-review-and-quality` | 程式碼審查、深模組簡化與安全檢查 |
| 獨立盲測 | `cross-model-review` | 獨立通過標記 `> [!CHECK] Cross-Model Review Approved...` |
| Git 發佈 | `git-commit` | Conventional Commit、PR 說明、版號與 Tag |
| 流程復盤 | `retrospective-and-learnings` | 環境修復、行動分流（Lint / Standards / CI） |

## 固定輸出路徑

| 產物 | 路徑 |
| --- | --- |
| 問題探索 | `doc/discovery/{feature-name}-discovery.md` |
| Feature Spec | `spec/{feature-name}-spec.md` 或 `.github/harness/spec/{feature-name}-spec.md` |
| 架構與設計 | `doc/design/{feature-name}-architecture.md` |
| 建置計畫 | `.github/harness/plan/{feature-name}-build-plan.md` |
| Agent 狀態 | `.github/worklog/agent-status.md` |
| 測試計畫 | `doc/test/{feature-name}-test-plan.md` |
| 交付筆記 | `doc/launch/{feature-name}-launch.md` |
| 回顧 | `doc/retrospectives/{feature-name}-retro.md` |

## 全域視覺化監控儀表板 (Dashboard Integration)

本專案提供全域可視化 Web 儀表板，即時動態解析目前 workspace 的 Harness 狀態、Active Task、Build Plans 與 Spec 關卡。

- **啟動方式**：在專案根目錄執行 `npm run dashboard:dev`（開發模式）或 `npm run dashboard:start`（啟動服務）。
- **解析數據源**：
  - `.github/worklog/agent-status.md`（Active Task、Task Card、Execution Tracking）
  - `.github/harness/plan/*.md`（Build Plans 內容與切片進度）
  - `spec/*.md` 與 `.github/harness/spec/*.md`（Feature Specs 狀態）
- **相容撰寫原則**：Agent 在更新 `agent-status.md` 與 Task Card 時，應保持標準 `- Key: Value` 鍵值格式，以確保 Dashboard 掃描器能 100% 精準解析並提供「Resume Command 一鍵複製」功能。

## 純資訊查詢 vs 工具序列範例

正例（可視為純資訊查詢）：
- 「harness workflow 的重點是什麼？」
- 「TASK-009 做了哪些事？」（只需口頭摘要，不改文件）

反例（屬工具序列，不能跳過閘門）：
- 「幫我再檢視一次 workflow 並回寫建議到文件。」
- 「把某條規則改寫後同步到 plan 與 agent status。」

## 執行追蹤卡樣板 (含 Cross-Model Review 認證)

```text
Execution Tracking:
- CurrentStep:
- Evidence:
- NextStep:

> [!CHECK] Cross-Model Review Approved by [Model/Role Name]
```

## Subagent 派發卡樣板 (Subagent Dispatch Card)

當 Parent Agent 需將切片任務派發給 Subagent 執行時使用：

```text
Subagent Dispatch Card
- 任務 ID 與切片：[TASK-XXX Slice Y]
- 目標描述：[單一切片具體目標]
- 異動檔案範圍：[明確限制可修訂檔案]
- 驗收與測試指令：[如 npm test path/to/test.ts]
- 行為約束：[TDD Red-Green 鐵律、不擴張範圍]
- 上下文檔連結：[對應專案 spec/ 或 CONTEXT.md 連結]
```

## 輕量 Git 分支隔離操作範例

```bash
# 1. 建立並切換至切片臨時分支
git checkout -b task/TASK-001-slice-1

# 2. 進行 TDD 實作與驗證
# ...

# 3a. 驗證通過：切回主分支合併並刪除臨時分支
git checkout main
git merge task/TASK-001-slice-1
git branch -d task/TASK-001-slice-1

# 3b. 驗證失敗/重置：直接刪除臨時分支還原環境
git checkout main
git branch -D task/TASK-001-slice-1
```

## Reset Decision 樣板

```text
Reset Decision
- 放棄項：
- 保留項：
- 接替策略：
```

## 最小 KPI（流程可觀測性）

為避免規則漂移，建議每週至少做一次輕量 KPI 回顧。若無自動化，使用活文件手動統計即可。

| KPI | 定義 | 計算方式 | 建議頻率 | 目標值（建議） |
| --- | --- | --- | --- | --- |
| 啟動到第一切片耗時 | 新需求提出到第一個可執行切片開始的時間 | `第一個 In progress 時間 - 需求確認時間` | 每週 | 中位數小於 30 分鐘 |
| 追蹤卡更新密度 | 每個任務的追蹤卡更新是否足夠 | `Execution Tracking 更新次數 / 已完成切片數` | 每週 | 大於等於 1.0 |
| 驗證缺漏率 | 宣告完成時未執行驗證的比例 | `有「未執行驗證」註記任務數 / 當週完成任務數` | 每週 | 小於等於 10% |

回寫建議：
- 週檢時可把 KPI 結果摘要回寫到當週 build plan 或 retrospective。
- 若連續兩週未達標，優先調整對應章節：啟動檢查、追蹤卡規則、最小驗證矩陣或 DoD。
