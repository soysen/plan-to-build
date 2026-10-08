# Skill 體系精簡、現代化改造與 Git 規範調整復盤 (Retrospective)

- **日期**：2026-10-08
- **對象**：Skill 精簡（25 ➔ 11 個）、現代化規範（S1~S4）、`git-commit` 規則調整（移除 Task ID）
- **模式**：STANDARD
- **狀態**：已完成

---

## 1. 範圍與背景 (Scope & Context)

本輪工作流源於對 Obsidian 知識庫（包含 16 篇 AI Evals、Skill Engineering、Matt Pocock v1.3、MAPS 架構與 CDLC 筆記）與當前 Repo 現狀的深度比對，產出優化建議書後，依據使用者指令執行：
1. **收斂核心主線**：將 25 個 Skill 聚焦至前期發想、規劃、開發到 Git 發佈的 11 個核心 Skill。
2. **精華整合與封存歸檔**：6 個 Skill 精華萃取至核心 references/，其餘 8 個專用/重複 Skill 安全封存至 `.github/skills-archive/`。
3. **全面現代化規範落地**：留存之 11 個 Skill 全數注入目錄 (TOC)、前 30 行 Must 規則、Freedom 分級與檢核清單。
4. **Git Skill 去任務化**：移除 commit message 強制綁定 Task ID 的規則，回歸標準乾淨的 Conventional Commits。
5. **建立未來評估 Skill 效益的客觀基準體系**。

---

## 2. 時間線重建 (Timeline Reconstruction)

| 階段 / 動作 | 核心產物與決策 | 驗證結果 |
| :--- | :--- | :--- |
| **建議書產出** | 產出 `2026-10-08-skill-harness-optimization-proposal.md`，揭露 0 TOC、Stop Hook 空轉、模擬器過擬合等 11 項缺口。 | slice-judge 攔截模糊描述，修正後通過 |
| **TASK-001** | 建立 `.github/skills-archive/`，將 8 個專門/技術棧綁定/重複的 Skill 移入封存。 | 目錄結構清爽，保留可還原性 |
| **TASK-002** | 提煉 6 個 Skill 核心精華至 `references/`，原目錄移入 skills-archive（累積封存 14 個）。 | 6 份高密度參考指南誕生 |
| **TASK-003** | 11 個留存 Skill 全面注入 TOC、RFC 2119 Must 規則、freedom/models-tested frontmatter 與 Checklist。 | 11 個檔案現代化改造完成 |
| **TASK-004** | 升級 `validate-skills.js`（增加 TOC、Must 規則、Links 驗證）；精簡 `AGENTS.md` 至 70 行。 | 11/11 核心 Skill 通過新校驗器；Router TPR/TNR 100% |
| **TASK-005** | 全量測試與結案。 | 32 項單元測試 100% PASS，slice-judge Exit 0 |
| **GIT 調整** | 依使用者指示，更新 `git-commit` 及規範文件，移除強制 Task ID 與 `Refs: TASK-XXX`。 | commit 訊息乾淨通用，校驗 100% PASS |

---

## 3. 關鍵訊號萃取 (Signal Extraction)

### 🌟 哪些做法非常有效 (Worked Well)
1. **「精華轉 references / 舊體進 archive」兩段式清理**：
   不直接 `rm -rf`，而是將具備復用價值的架構（API 設計、ADR 格式、安全性清單、測試計畫）提煉為單層 references，其餘封存於 `skills-archive/`。既消滅了長文本注意力稀釋，又保留了完整還原能力。
2. **驗證腳本與規則同步升級 (Validator First)**：
   在修改 Skill 格式的同時升級 `validate-skills.js`，將 TOC、前 40 行 Must 規則、Frontmatter freedom 變成程式化、零 Token 的硬性守門員，避免未來寫新 Skill 時標準漂移。
3. **負向排除清單維護了意圖穩定性**：
   在將 `AGENTS.md` 從 134 行大幅精簡至 70 行時，保留了負向排除規則，使得 20 筆意圖黃金測試集持續維持 TPR 100% / TNR 100%，證明精簡不等於削弱防禦力。

### ⚠️ 遇到的阻力與摩擦 (Friction)
1. **Task ID 的過度綁定反模式**：
   先前在 `git-commit` 中設計了強制帶 `TASK-XXX` 的規範，但在純功能提交、開源發佈或非 Jira/Ticket 導向的情境下，反而成為開發者的心理負擔與流程摩擦。
2. **歷史文件路徑漂移**：
   清理舊 Skill 時發現原先有部分舊文件引用了 `docs/design/` 等已遷移路徑，若無自動化檔案檢查極易造成「孤兒連結」。

---

## 4. 根本模式洞察 (Root Patterns：修環境不修代碼)

```text
┌───────────────────────────────────────────────────────────┐
│               Skill 治理三大核心破局模式                    │
├─────────────────────────────┬─────────────────────────────┤
│ 模式 1: 避免淺模組與元框架膨脹 │ 模式 2: 上下文信號密度管理    │
│ (Shallow Module Collapse)   │ (Context Signal Density)    │
│                             │                             │
│ ❌ 每個概念獨立開 1 個 Skill  │ ❌ 25 個 Skill 同時佔據目錄  │
│ ⬇                           │ ⬇                           │
│ ✅ 核心主線 (11 個) + 提煉至  │ ✅ 主線收斂，專門工具按需載入│
│    references 單層引用      │    超過 100 行必備目錄 TOC  │
└─────────────────────────────┴─────────────────────────────┘
```

1. **「技能不是越多越好」**：
   過往容易將「看過的好文章/好概念」直接寫成獨立 Skill（如 `diagram-design`, `using-agent-skills`）。然而過多 Skill 會造成 Orchestrator 路由混淆、增加目錄掃描的 Token 成本，並引發淺模組危機。
2. **「去任務化回歸軟體工程本質」**：
   工作流應該服務於產出品質，而非服務於標籤形式。Commit Message 應忠實記錄程式碼異動的意圖（What & Why），而非強加任務系統的編號。

---

## 5. 🎯 未來評估 Skill 效益的基準體系 (Skill Utility & ROI Framework)

為防止未來 Skill 系統再次無序膨脹，未來新增、修改或保留任何 Skill 時，必須依照以下 **五大客觀評估維度** 進行評分與決策：

### 維度 1：喚醒與路由準確性 (Recall & Specificity：TPR / TNR)
- **定義**：使用者在提出相關需求時，該 Skill 是否能精準被觸發，且在無關或否定情境下不會誤觸發？
- **量化指標**：
  - **敏感度 (TPR)**：真正需要該 Skill 時的召回率 $\ge 80\%$。
  - **特異度 (TNR)**：閒聊、純查詢或否定意圖時的抗干擾率 $\ge 80\%$。
- **紅旗警告**：若一個 Skill 經常被誤喚醒（False Positive）或從未被主動觸發，代表其 `description` 邊界模糊，應當整併或修正。

### 維度 2：信噪比與 Token 經濟學 (Token Density & Context Burden)
- **定義**：該 Skill 佔用的 Prompt 長度與它為任務產生的指導價值比率。
- **量化指標**：
  - 主入口 `SKILL.md` 建議控制在 **300 行以內**。
  - 前 40 行必須包含 `## 硬性規則 (Must)`，確保在工具預覽 (`head -100`) 時完整載入核心邊界。
  - 外部引用深度保持 **單層 (One-level deep)**，禁止跨級巢狀。
- **紅旗警告**：包含大量範例代碼、長篇背景敘述、但核心限制不到 5 行的 Skill，屬於低信號噪聲，應當精簡。

### 維度 3：模型自主增量效益 (Autonomous Delta)
- **定義**：相較於高階模型的基礎能力，載入該 Skill 是否帶來了「實質的架構或防禦提升」？
- **判斷依據**：
  - 若高階模型（Opus / Sonnet / GPT-4o）在不讀該 Skill 的情況下，本來就能寫出相同水準的產物（例如：標準的 Dockerfile 或標準的 GitHub Action YAML），則該 Skill 的增量效益為 0。
  - **只有當 Skill 提供了「專屬領域限制、極端踩坑防衛、強制驗證關卡 (Stop Hook/DoD)」時，該 Skill 才具備存在價值**。

### 維度 4：確定性防弊價值 (Deterministic Defensive Value)
- **定義**：該 Skill 是否包含機器可判定的驗收關卡，而非僅依賴 AI 的口頭承諾？
- **量化指標**：
  - 是否具備清晰的 `Definition of Done (Checklist)`？
  - 是否能產出讓 `slice-judge` 判定為 Pass 的客觀執行命令日誌或 Exit Code？
- **紅旗警告**：只有建議性質（Should/May）且無客觀產物可斷言的 Skill，應降級為日常提示詞或文件，不適合作為正式 Skill。

### 維度 5：生命週期決策矩陣 (Lifecycle Decision Matrix)

每隔一個季度或發佈週期，對所有 Skill 進行矩陣盤點：

```text
┌──────────────────────┬────────────────────────────────────────────────────────┐
│ 狀態 / 評估結果      │ 處置策略 (Action)                                      │
├──────────────────────┼────────────────────────────────────────────────────────┤
│ 高頻使用 + 高防禦價值 │ 【保留並維護】列為核心 11 大主線，優化 Must 規則        │
│ 高頻使用 + 規則機械化 │ 【代碼化/工具化】將規則寫入 Validator / Linter，消滅該 Skill │
│ 特定技術 + 領域專門   │ 【專案化隔離】移至特定專案的 .agent/，不放在全域庫      │
│ 低頻使用 + 概念重疊   │ 【整併入 references】作為核心主 Skill 的單層延伸文件   │
│ 零觸發 / 模型已具常識 │ 【封存至 archive】移入 skills-archive，釋放主庫空間    │
└──────────────────────┴────────────────────────────────────────────────────────┘
```

---

## 6. 行動分流清單 (Actions & Routing)

依據「修環境不修代碼」原則，本次復盤產出的後續改善項目明確分流如下：

| 改善項目 | 分流去向 | 責任與驗證標準 | 狀態 |
| :--- | :--- | :--- | :---: |
| **1. 擴充 Router 評測集至 11 大 Skill** | `.github/scripts/eval-router.js` (CI 腳本) | 為留存的 11 個 Skill 建立各 3 筆測試 Intent，確認多類分類混淆矩陣無衝突。 | 待決策 |
| **2. 建立 Pre-commit Hook 守門** | Git Hook / `.github/scripts/` (機械性規則) | 整合 `validate-skills.js` 至本地 commit 攔截，確保未來新 Skill 必備 TOC 與 Must 規則。 | 待決策 |
| **3. 新增 CODING_STANDARDS.md** | `docs/CODING_STANDARDS.md` (架構裁量) | 收錄深模組原則、壞味道清除等設計準則，僅供 Code Review 時按需閱讀。 | 待決策 |
| **4. 定期歸檔檢視機制** | Routine (心跳/排程) | 每一季執行一次生命週期矩陣檢查，評估 skills-archive 是否有需永久廢棄或喚醒之項目。 | 待決策 |

---

## 7. 🤝 Agent Handoff Protocol (跨 Agent 交接協定)

### 1. 當前階段與狀態 (Current Stage)
- **Workflow Phase**: `Retrospective & Learnings Completed`
- **Active Task ID**: `RETRO-2026-10-08`
- **Status**: `已完成` (Sprint Closed)

### 2. 本階段完成事項與決策 (Completed Decisions & Work)
- [x] 完成本次 Skill 大精簡與現代化重構之全生命週期覆盤。
- [x] 梳理根本模式，貫徹「修環境不修代碼」之 CDLC 治理哲學。
- [x] 正式建立「未來評估 Skill 效益的五大基準體系（TPR/TNR、Token 密度、自主增量效益、防弊價值、生命週期矩陣）」。
- [x] 改善項目已落實四維分流（CI 腳本 / Standards / 全域路標 / Archive）。

### 3. 接手 Agent 執行指南 (Next Agent Actionable Guide)
- **Recommended Skill**: `git-commit`
- **Next Target File**: `package.json` / git staging
- **Execution Criteria**:
  - [ ] 執行 `npm run harness:check:ai` 確認全域閘門 PASS
  - [ ] 執行 `node .github/scripts/harness-cli.js validate`
  - [ ] 提交本次所有異動（Skill 精簡、現代化、Git 調整與 Retro 報告）

### 4. 關鍵風險與未決問題 (Risks & Open Questions)
- 無未決問題。全套測試與驗證器皆綠燈。
---
