# Plan-to-Build Agent Guide (省 Token 與 Agent Handoff 強化版)

`plan-to-build` 是一套本地 AI Agent workflow / skills framework。這個 repo 的主要產出是流程文件、harness 規則、skills 與 templates，不是一般應用程式功能。

本檔是跨工具規則層，適用於支援 `AGENTS.md` 的 agent。Copilot / VS Code 的補充規則放在 `.github/copilot-instructions.md`；workflow 細節放在 `.github/harness/`。

## 本次優化三大省 Token 核心目標 (參考影片：「三招省 Token 的實戰方法」)

1. **目標 1：結構化「一次到位 (One-Pass)」，減少 70%+ 無效來回修改**
   - 於 `idea-refine` 與 `analyze-spec` 階段導入 `/grill-me` 質詢與結構化範本，開工前一次逼出邊界條件、輸入輸出與驗收標準，避免反覆修改耗費 Token。
2. **目標 2：精準「Context 重啟與輕量交接 (Session Reset & Handoff)」**
   - 在每階段產出中強制附帶 `Agent Handoff Protocol`（濃縮 15 行狀態快照）。使用者或 Agent 可隨時 **Reset 視窗開新對話**，載入快照即可零遺失銜接。
3. **目標 3：精準「Context 剪裁與分層審查 (Targeted Trimming & Model Routing)」**
   - 僅讀取與處理異動 Diff 範圍；並依任務等級 (`micro`/`standard`/`heavy`) 進行審查分流，避免小型改動觸發全量高階模型報告。

## Matt Pocock Productivity Skills 整合說明

本專案已將 Matt Pocock 生產力 Skill 集成至既有 Skill 中：

- `/grill-me` ➔ 整合至 `grill-me` 與 `analyze-spec`
- `/handoff` ➔ 整合至 `Agent Handoff Protocol` 全流程
- `/to-questionnaire` ➔ 整合至 `analyze-spec`
- `/wait-what` ➔ 整合至 `debugging-and-error-recovery` 與 `cross-model-review`
- `/writing-for-agents` ➔ 整合至 `context-engineering` 與 `documentation-and-adrs`
- `/write-a-skill` ➔ 整合至 `using-agent-skills`

---

## AI 讀取順序

AI 應依下列順序套用規則，不要把上層責任下放，也不要在下層重複定義上層規則。

| 順位 | 檔案                                                                    | 角色                                                         | 何時讀取                                   |
| ---- | ----------------------------------------------------------------------- | ------------------------------------------------------------ | ------------------------------------------ |
| 1    | `AGENTS.md`（本檔）                                                     | 跨工具規則層：原則、閘門、任務狀態義務                       | 每次對話自動載入                           |
| 2    | `.github/copilot-instructions.md`                                       | Copilot / VS Code 環境補充層：工具偏好、固定提問句、輸出格式 | 使用 Copilot 時自動載入                    |
| 3    | `.github/harness/harness-workflow.md`                                   | 工作流程細節層：步驟、追蹤卡、閘門策略                       | 需執行非平凡流程時                         |
| 4    | `.github/harness/harness-status-dictionary.md`                          | 任務狀態詞彙層                                               | 任何狀態變更時                             |
| 5    | `.github/skills/*/SKILL.md`                                             | 特定 workflow / skill                                        | 任務類型符合時；依 Context Budget 分級載入 |
| 6    | `.github/harness/plan/*`、`.github/worklog/*`、`.github/harness/spec/*` | 活文件：當下任務狀態、checkpoint、驗證證據                   | 開始任務、恢復任務、回寫證據時             |
| 7    | `.github/harness/templates/*`                                           | 樣板層：標準輸出格式                                         | 需建立新計畫或報告時                       |

---

## 啟動四閘門 (CLI 導向)

每次新需求均需依序通過下列 4 閘門（純資訊查詢例外）。

> **[CLI 優先診斷]**： Agent 應優先執行 `node .github/scripts/harness-cli.js check --ai`（或 `npm run harness:check:ai`），以 1 行 Token 省算格式獲得診斷與建議路由。展示人類報告時使用 `--human`。

1. **未完成任務閘門**：檢視 `agent-status.md` 的 `Active Task`，若存在非 `idle` 任務，需先請使用者決策：`繼續 / 放棄並重置 / 放棄並保留 checkpoint`。
2. **Input 收斂閘門**：遇空泛詞彙（`優化/改善/整理/重構/升級/強化/清理/調整/看看`）或缺少目標/範圍/驗收標準時，標 `需補充輸入` 並暫緩實作。
3. **任務分級閘門**：區分 `micro`（單檔無行為影響）、`standard`（多檔可估範圍）與 `heavy`（跨模組高風險），確定雙寫追蹤力度。
4. **實作啟動閘門 (Execution Gate)**：
   - **Feature Spec 硬性檢查**：若專案庫無既有 Spec 檔，**強制鎖定 `analyze-spec` 路由**，先產出 Spec 並取得確認。
   - 更新 `agent-status.md`（與 `standard/heavy` 之 build plan）標為 `進行中` 即可動工。

- `micro`：更新 `.github/worklog/agent-status.md` 為 `進行中`，記錄一行目的描述與使用的 Skill Route 即可；預設不讀完整 Skill，除非修改 Agent 規則、提交、或使用者明確要求。
- `standard / heavy`：同時完成：
  - 在 `.github/harness/plan/{feature-name}-build-plan.md` 建立或更新本輪切片，並填寫 Skill Route。
  - 更新 `.github/worklog/agent-status.md` 的 `Active Task` 為 `進行中`。

---

## Skill 路由與對應關係

這個 repo 的 skills 位於 `.github/skills/`。任務符合某個 skill 時，依 Context Budget 分級載入，避免小任務消耗完整流程文件：

- `micro`：通常只記錄 Skill Route，不讀完整 `SKILL.md`；若該 skill 是唯一安全守門員（如 commit、agent customization、security）才讀必要段落。
- `standard`：讀對應 `SKILL.md` 的目標、流程、驗證或紅旗段落；不要整份展開與任務無關的範例。
- `heavy`：完整讀取主要 skill；跨領域時再讀第二 skill，並用 plan / status 摘要降低後續重讀。
- 同一 conversation 已讀過的 skill 不重讀；沿用既有摘要，只有當任務邊界改變時補讀相關段落。

**語意意圖判斷與強管轄路由：**

- 「我有個點子但不知道怎麼開始」、「想探索方向」 ➔ `idea-refine` (Superpower 結構化發想)
- 「幫我 Grill 一下」、「質詢這個需求/架構」、「挑戰這個設計的盲點」、「/grill-me」 ➔ `grill-me` (3 輪主動質詢與壓力測試)
- 「幫我分析這段需求並寫成 Spec」、「要做新功能/新頁面」 ➔ `analyze-spec` (Superpower Spec + `/grill-me` 質詢)
- 「準備開始架構設計」、「幫我切分模組與畫 Sitemap」 ➔ `design-architecture`
- 「Spec 確認了，幫我規劃任務與切片」 ➔ `plan-build` (含 Issue 建立)
- 「開始照著計畫寫程式」、「請實作 TASK-XXX」 ➔ `tdd-build` (TDD 漸進式切片)
- 「程式報錯了」、「跑不起來幫我除錯」 ➔ `debugging-and-error-recovery`
- 「幫我做 Code Review」、「檢查這支 PR 的 Diff」 ➔ `code-review-and-quality` (第一線異動審查)
- 「用不同模型/視角盲測盲點」 ➔ `cross-model-review` (第二線 Approved 蓋章審查)

---

## Task Card Schema & Agent Handoff Protocol

本專案使用 Task Card 與 Agent Handoff Protocol 作為規格、交接、中斷與驗收的統一表單。

```markdown
---
## 🤝 Agent Handoff Protocol (跨 Agent 交接協定)

### 1. 當前階段與狀態 (Current Stage)
- **Workflow Phase**: `Spec Definition` / `Architecture Design` / `Build Implementation`
- **Active Task ID**: `TASK-002`
- **Status**: `In Progress` (Ready for next slice)

### 2. 本階段完成事項與決策 (Completed Decisions & Work)
- [x] 完成基本 Data Schema 設計
- [x] 完成 `/grill-me` 邊界質詢（確認採用悲觀鎖定與 401 自動刷新）

### 3. 接手 Agent 執行指南 (Next Agent Actionable Guide)
- **Recommended Skill**: `design-architecture`
- **Next Target File**: `.github/harness/design/{feature-name}-architecture.md`
- **Execution Criteria**:
  - [ ] 依據本文件第 3 節處理 DB 鎖定邏輯
  - [ ] 補齊 401 Unauthorized 降級處理流程

### 4. 關鍵風險與未決問題 (Risks & Open Questions)
- ⚠️ 外部第三方支付 API 目前缺少 Sandbox 環境測試。
---
```

---

## 全域行為規則與完成前檢查

1. **狀態先於動作**：任何工具呼叫、實作、驗證前，先更新對應活文件。
2. **活文件確保機制**：寫入活文件時，若資料夾不存在，主動建立父目錄。
3. **TDD 鐵律**：實作功能時嚴禁在未看到失敗測試 (Red) 報告前撰寫產品實作代碼。
4. **雙軌審查與 Stop Hook**：
   - `micro` 自動豁免。
   - `standard / heavy` 完成時需有 `code-review-and-quality` 第一線異動檢查。
   - `heavy` 任務結案前需有 `cross-model-review` 蓋章標記：`> [!CHECK] Cross-Model Review Approved by [Model/Role Name]`。
