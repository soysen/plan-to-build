# AGENT TASK INSTRUCTION: Plan-to-Build AI Evals 系統升級 (MVP Sprint)

你現在擔任 `plan-to-build` 代碼庫的 **FDE (Forward-Deployed Engineer) AI Evals 資深架構師**。
你的任務是將現有基於「檔案存在」的寬鬆判定架構，全面重構為**「確定性代碼斷言 (Deterministic Evals)」**與**「雙向校準路由機制」**，杜絕 AI 生成偽產物與虛假打卡。

---

## 🎯 核心使命 (Core Mission)

1. **消滅假通過 (Zero False Positives)**：廢除 `fs.existsSync` 單純存在性檢查，引進語法 AST 與正則語意斷言。
2. **校準意圖路由 (Intent Guardrails)**：為 Router 建立 20 筆評測集，確保 TPR（敏感度）與 TNR（特異度）雙達標 $\ge 80\%$。
3. **切片驗收二元化 (Binary Slice Judge)**：建立客觀是非評判器，驗證 `agent-status.md` 的 Evidence 真實性。

---

## 🛡️ 鐵律原則 (Non-Negotiable Guardrails)

* **零 Token 優先原則 (Zero-Token-First)**：能用 AST、Regex、CLI Exit Code（如 `prisma validate`）檢查的邏輯，**嚴禁**呼叫 LLM 評判。
* **二元狀態躍遷**：驗收評判只有 `PASS` 與 `FAIL`，不得使用模糊評分制（如 1~5 分）。
* **證據必須可重現**：任何標記為完成的任務，必須在執行日誌附帶具體的命令輸出、JSON 回傳或 Exit Code 證據。
* **嚴禁破壞性跳級**：必須嚴格按照 P0 $\rightarrow$ P1 $\rightarrow$ P2 依序推進，前一階段未達 DoD 禁止進入下一階段。

---

## 🗺️ 目標檔案矩陣 (File Footprint)

```text
plan-to-build/
├── scripts/
│   ├── fde-phase.js              # [MODIFY] 升級進度控制器，串接斷言工具
│   ├── assert-phase.js           # [NEW] 確定性 Phase 結構與語法斷言核心
│   └── eval-router.js            # [NEW] Intent Router 評測執行器 (計算 TPR/TNR)
├── .agents/
│   ├── AGENTS.md                 # [MODIFY] 優化意圖路由 Prompt（增加負向排除規則）
│   └── evals/
│       ├── router-dataset.json   # [NEW] 20 筆意圖黃金測試集
│       └── slice-judge-prompt.md # [NEW] 切片二元評判 Prompt 範本
├── docs/
│   ├── REQUIREMENTS.md           # 驗證標的 (Phase 1)
│   └── TECHNICAL_SPEC.md        # 驗證標的 (Phase 2)
├── prisma/schema.prisma          # 驗證標的 (Phase 2)
├── src/app/page.tsx              # 驗證標的 (Phase 3)
└── .github/worklog/
    └── agent-status.md           # 工作流進度與 Evidence 記錄
```

---

## 📋 任務執行手冊 (Actionable Playbook)

### 🔴 Phase 0: P0 核心任務 — 確定性斷言升級

#### Task 1.1: 建立輕量確定性斷言腳本 (`scripts/assert-phase.js`)
* **職責**：以純 Node.js 編寫，接收 Phase 編號並回傳標準 JSON 報告：
  ```json
  {
    "phase": 1,
    "pass": false,
    "missingSections": ["## User Stories"],
    "errors": ["Acceptance Criteria 條目數不足 3 條"]
  }
  ```
* **斷言邏輯**：
  * **Phase 1 (`docs/REQUIREMENTS.md`)**：
    * 必須包含標題：`## User Stories` 與 `## Acceptance Criteria`。
    * 驗收條件清單條目（`- [ ]` 或 `- `）總數必須 $\ge 3$。
  * **Phase 2 (`prisma/schema.prisma` & `docs/TECHNICAL_SPEC.md`)**：
    * 執行子進程 `npx prisma validate`，Exit Code 必須為 0。
    * 檢查 `docs/TECHNICAL_SPEC.md` 包含 `## Data Models` 與 `## API Specifications`。
  * **Phase 3 (`src/app/page.tsx`)**：
    * 使用 AST 解析或 `tsc --noEmit` / `esbuild` 語法掃描，確保無語法崩潰。
    * 必須具備 `export default` 元件宣告。

#### Task 1.2: 改造 `scripts/fde-phase.js`
* 移除所有以 `fs.existsSync` 作為躍遷依據的邏輯。
* 改為調用 `scripts/assert-phase.js`：
  ```javascript
  const { assertPhase } = require('./assert-phase');
  const report = assertPhase(currentPhase);
  if (!report.pass) {
    console.error(`[FDE Blocked] Phase ${currentPhase} 驗收未通過:`, report.errors);
    process.exit(1);
  }
  // 驗證通過才執行 Phase 遞增
  ```
* **DoD**：建立故意缺少章節的 `docs/REQUIREMENTS.md`，執行 `npm run phase` 必須明確失敗且退出碼不為 0。

---

### 🟡 Phase 1: P1 強化任務 — Intent Router 雙向校準機制

#### Task 2.1: 建立 20 筆黃金數據集 (`.agents/evals/router-dataset.json`)
* 必須精準包含以下 3 類樣本，格式：`{ "id": 1, "prompt": "...", "expected_intent": "plan-to-build" | "other" }`：
  1. **正向樣本（10 筆）**：明確需要 FDE 開案/進程引導的情境（例：「我想做會員註冊 POC，幫我跑 FDE 流程」、「請規劃電商結帳流程」）。
  2. **明確否定樣本（5 筆）**：使用者強調「不要開案」（例：「不要開案，只要列出 Prisma 常用指令」、「我只想查詢連線字串，別進 plan-to-build」）。
  3. **邊界/諮詢樣本（5 筆）**：問答或概念查詢（例：「什麼是 Plan-to-Build？」、「解釋一下 TPR 跟 TNR」）。

#### Task 2.2: 撰寫評測運行器 (`scripts/eval-router.js`)
* 讀取 `router-dataset.json`，將 prompt 餵入意圖解析函數。
* 計算混淆矩陣：
  * $\text{TPR (True Positive Rate)} = \frac{TP}{TP + FN}$（目標 $\ge 80\%$）
  * $\text{TNR (True Negative Rate)} = \frac{TN}{TN + FP}$（目標 $\ge 80\%$）
* **DoD**：以終端表格印出評測矩陣、失敗案例與最終 TPR/TNR 數值。

#### Task 2.3: 校準 `AGENTS.md` 路由 Prompt
* 在 `AGENTS.md` 的 Router 規則中加入「**負向排除清單 (Negative Guardrails)**」：
  * 當輸入包含「僅查詢」、「不要開案」、「說明概念」、「範例指令」時，強制路由為 `other`。
* **DoD**：重跑 `node scripts/eval-router.js`，輸出 TPR $\ge 80\%$ 且 TNR $\ge 80\%$。

---

### 🟢 Phase 2: P2 演進任務 — 切片驗收二元評判器

#### Task 3.1: 定義切片二元評判範本 (`.agents/evals/slice-judge-prompt.md`)
* 輸入格式：讀取 `.github/worklog/agent-status.md` 的當前切片區塊。
* 評判標準：
  * `[PASS]`：Evidence 欄位必須包含實際終端執行日誌（如 `Exit code: 0`、具體測試輸出或 DOM 截圖），且狀態與產物一致。
  * `[FAIL]`：Evidence 為空、僅有口頭描述（如「已成功實作」）而無客觀命令產出。
* 輸出規範：嚴格 JSON：`{ "result": "PASS" | "FAIL", "reason": "說明判定原因" }`。

#### Task 3.2: 整合驗收攔截機制
* 撰寫輕量檢查腳本或 Git Hook 雛形，在 Agent 標記階段完成前校驗二元評判結果，若為 `FAIL` 則自動阻斷。

---

## 📊 執行進度匯報格式 (Agent Status Reporting)

每次回合回報，請維持以下簡潔結構：

```markdown
### 執行進度回報
- **當前任務**：Task 1.1 / Task 2.2 ...
- **執行動作**：[簡述你建立或修改的檔案]
- **確定性驗收證據 (Evidence)**：
  ```bash
  $ node scripts/eval-router.js
  # 貼上實際執行結果表格與退出碼
  ```
- **DoD 檢查**：
  - [x] 條件 1 (已驗證)
  - [x] 條件 2 (已驗證)
- **下一步**：預計執行的下一個任務編號
```
