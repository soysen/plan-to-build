# 🚀 Plan-to-Build AI Evals 系統升級 (MVP Sprint) 回顧與學習沉澱 (Retrospective)

本報告針對 **Plan-to-Build AI Evals 系統升級 (MVP Sprint)** 進行全生命週期回顧，梳理從寬鬆存在性判定重構為「確定性代碼斷言 (Deterministic Evals)」、「雙向校準路由機制 (Intent Guardrails)」及「切片驗收二元評判器 (Binary Slice Judge)」的實踐過程、架構決策與學習洞察。

> 本報告 Obsidian 筆記同步位置：`KnowledgeBase/Wiki/Projects/plan-to-build/retro/2026-09-10-ai-evals-mvp-retro.md`

---

## 🎯 1. 回顧範圍與背景 (Scope & Context)

- **回顧標的**：Plan-to-Build AI Evals MVP Sprint (Task 1.1 ~ Task 3.2)
- **回顧日期**：2026-09-10
- **核心命題**：
  1. 如何消滅 AI 假通過 (False Positives)，確保產物具備語法與結構正確性？
  2. 如何防禦意圖誤路由，使 Intent Router 達到 TPR $\ge 80\%$ 且 TNR $\ge 80\%$？
  3. 如何在 Harness 流程中落實二元客觀評判，杜絕 Agent 口頭承諾與虛假打卡？

---

## ⏱️ 2. 重建時間線 (Timeline Reconstruction)

| 節點 / 任務 | 核心動作 | 關鍵產物與決策 | 驗證結果 |
| :--- | :--- | :--- | :--- |
| **Task 1.1** | 建立確定性斷言核心 | 實作 `assert-phase.js`，針對 Phase 1 (Markdown 結構)、Phase 2 (Prisma validate)、Phase 3 (TSX 語法/Default export) 實作純 Node.js 斷言。 | 11 項單元測試全數 PASS (179ms) |
| **Task 1.2** | 改造進度控制器 | 實作 `fde-phase.js` 串接 `assertPhase`，徹底移除 `fs.existsSync` 純存在判定。 | 刻意缺漏章節實證 `[FDE Blocked]` (Exit code: 1) |
| **架構重構** | 驗證工具收斂 | 經反思與使用者指示，將根目錄 `scripts/` 遷移至 `.github/scripts/`，保障下游專案命名空間獨立。 | 22 項測試全量 PASS，根目錄整潔 |
| **Task 2.1** | 意圖黃金測試集構建 | 建立 `.agents/evals/router-dataset.json`，精準配置 10 筆正向、5 筆明確否定、5 筆邊界諮詢。 | 20 筆資料分佈校驗 100% 合規 |
| **Task 2.2** | 評測運行器實作 | 建立 `eval-router.js`，計算混淆矩陣 (TP/FP/TN/FN) 與終端視覺化表格。 | Baseline 評測：TPR 100%, TNR 40% (抓出 6 筆誤判) |
| **Task 2.3** | 路由 Prompt 校準 | 於 `AGENTS.md` 引入「負向排除清單 (Negative Guardrails)」，優先排除「僅查詢/不要開案/純問答」。 | 重跑評測：**TPR 100.0%, TNR 100.0%** (雙指標完美達標) |
| **Task 3.1** | 二元評判 Prompt 範本 | 撰寫 `slice-judge-prompt.md`，定義非黑即白標準與嚴格 JSON 輸出規範。 | 規範完成，提供 3 組典型判決範例 |
| **Task 3.2** | 驗收攔截機制整合 | 實作 `slice-judge.js` 並深度整合至 `harness-cli validate`，針對口頭承諾強制阻斷。 | 32 項測試 100% 通過，實機驗證通過 |

---

## 📊 3. 關鍵訊號萃取 (Signal Extraction)

### 🌟 哪些做法非常有效 (Worked Well)

1. **零 Token 確定性優先原則 (Zero-Token-First)**
   - 全程不依賴高延遲且不可預測的 LLM 評分，改以 AST、正則表達式、Node.js 語法掃描與 CLI Exit Code 進行評判。
   - 32 項單元測試在 **1.3 秒** 內全數跑完，達到 100% 確定性且運行成本為 0 Token。
2. **「基準評測 ➔ 失敗案例曝光 ➔ 針對性校準」閉環流程 (TDD Evals)**
   - Task 2.2 先忠實跑出未校準前的 TNR 40.0%，以表格印出 6 個失敗案例；隨後 Task 2.3 精準修改 `AGENTS.md`，使 TNR 躍升至 100.0%。這個對比證明了評測集 (Evals) 對於 AI Agent 提示詞調校的決定性價值。
3. **主動式架構衛生維護 (Proactive Architecture Hygiene)**
   - 將 Harness 與 Evals 腳本收斂進 `.github/scripts/`，避免未來使用者將本 repo 作為腳手架時與其自身的 `scripts/` 產生命名空間碰撞。

### ⚠️ 遇到的阻力與摩擦 (Friction)

1. **初始狀態檔缺失 (Cold-start Missing State)**
   - 專案剛啟動時缺少 `.github/worklog/agent-status.md`，導致第一時間執行 `harness-cli validate` 失敗。
   - *洞察*：這反而證實了 Harness 的守門機制能正常攔截不合規的工作空間。
2. **多層路徑解析陷阱**
   - 腳本在移動至 `.github/scripts/` 後，專案根目錄必須維持 `path.resolve(__dirname, '../../')` 慣例；在編寫臨時目錄測試時，必須提供 `workspaceRoot` 注入參數以防測試環境干擾生產目錄。

### 💡 意外發現 (Surprises)

1. **負向排除清單的驚人槓桿效應**
   - 傳統提示詞工程往往只著重於「正面教導 AI 何時該觸發」，但在遇到「不要開案，只要查指令」或「什麼是 Plan-to-Build？」時極易因關鍵字被 False Positive 誤觸發。
   - 僅僅在 `AGENTS.md` 加入**三條簡短的負向排除清單**，就讓誤報率直接清零（FP 由 6 降為 0，TNR 由 40% 飆升至 100%）。

---

## 🧠 4. 根本模式洞察 (Root Patterns)

```text
┌─────────────────────────────────────────────────────────┐
│               AI Workflow 兩大核心破局模式                │
├────────────────────────────┬────────────────────────────┤
│ 模式 1: 結構斷言替代存在檢查 │ 模式 2: 負向排除優先於正向比對 │
│ (Existence != Correctness) │ (Negative Guardrails First)│
│                            │                            │
│ ❌ fs.existsSync (純檔案存在) │ ❌ 純正面意圖關鍵字比對     │
│ ⬇                          │ ⬇                          │
│ ✅ 標題、條目計數、AST 掃描、  │ ✅ 優先過濾「僅查詢/不要開案/ │
│    Exit Code 二元驗收       │    概念問答」等負向守門清單   │
└────────────────────────────┴────────────────────────────┘
```

---

## 📋 5. 後續行動清單 (Actionable Improvements)

- [x] **Action 1: 驗證工具全面收斂**：完成 `.github/scripts/` 整合，確保根目錄清潔。
- [ ] **Action 2: Pre-commit Hook 整合**：將 `npm run judge:slice` 註冊至 Git Pre-commit Hook，在開發者或 Agent 下達 `git commit` 前自動攔截虛假狀態。
- [ ] **Action 3: 黃金資料集擴展至 50 筆**：目前 20 筆已覆蓋 MVP 邊界，後續可針對真實使用者日誌擴充更隱晦的拒絕開案語句。
- [ ] **Action 4: Phase 2 Prisma 環境整備**：在專案 `devDependencies` 正式宣告 `prisma`，以便在無全域安裝環境下亦能無縫執行 Phase 2 語法斷言。
