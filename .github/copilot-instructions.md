# Plan-to-Build — AI Agent 指南

本文件是所有 AI Agent（GitHub Copilot、Claude、Cursor 等）在這個 workspace 的行為規範。
目的：加強上下文交互、避免幻覺，並確實輔助 user 完成從 0 到生產的完整開發週期。

---

## 這個 Workspace 是什麼

`plan-to-build` 是一套封裝了資深工程師開發流程的 **Agent Skills 框架**。
Skills 存放於 `.github/skills/`，每個 skill 代表一個開發階段的完整工作流程。

**這不是一個普通應用程式專案。** 這裡的產出是流程文件和 skill 定義本身。

---

## 開始任何任務之前，AI 必須先做的事

### 1. 確認任務的開發階段

使用以下決策樹選擇適用的 skill，**不要直接開始寫程式碼**：

```
任務到來
│
├── 模糊想法？           → idea-refine
├── 想先驗證問題/需求？   → problem-validation
├── 需求/功能描述？      → analyze-spec
├── 有 spec，要架構？    → design-architecture
├── 有架構，要拆任務？   → plan-build
├── 有任務，要實作？     → tdd-build 或 incremental-implementation
│   ├── UI？             → frontend-ui-engineering
│   ├── API 設計？       → api-and-interface-design
│   └── 需要驗證框架 API？→ source-driven-development
├── 要寫測試？           → write-tests
├── 有東西壞了？         → debugging-and-error-recovery
├── 要審查程式碼？       → code-review-and-quality
├── 要提交？             → git-commit
├── 要部署？             → shipping-and-launch
├── 剛 deploy，要驗證健康？ → post-deploy-monitoring
├── 已上線，要追蹤成效/優化？ → post-launch-optimization
├── 一輪結束，要整理學習？ → retrospective-and-learnings
└── 不確定用哪個？       → 讀取 .github/skills/using-agent-skills/SKILL.md
```

### 2. 讀取對應的 SKILL.md 檔案

選定 skill 後，使用 `read_file` 讀取 `.github/skills/<skill-name>/SKILL.md`，**按照其步驟執行，不要跳步驟**。

### 3. 浮出你的假設

在開始任何非顯而易見的實作前，明確列出假設：

```
我做的假設：
1. [關於需求範圍的假設]
2. [關於技術選型的假設]
3. [關於檔案位置的假設]
→ 請確認，否則我將按這些假設繼續。
```

---

## 絕對禁止事項 (Strict Guardrails)

在沒有獲得用戶明確同意前，**絕對禁止**執行以下操作：
1. **靜默執行不可逆變更**：包含執行 `git push`、刪除目錄、刪除資料庫或發布/部署至生產環境。
2. **自行跳過安全/品質驗證**：跳過測試階段直接要求合併 PR，或是忽略 lint / type-check 錯誤。
3. **未確認即覆蓋核心文件**：不可以在沒有先與使用者討論的情況下，大範圍刪除或覆寫現有架構文件（如 ADR, SA/SD）。
4. **發明不存在的工具/套件**：嚴格檢查引用的第三方套件是否真實存在，絕不可虛構。

---

## 幻覺防止規則

這些規則在所有時刻強制執行：

### API 與框架

- 使用任何框架 API 前，**必須先查看現有程式碼** 或透過 `source-driven-development` skill 確認 API 是否存在
- 不推測函式簽名。看到不確定的 API：停下來，讀文件
- 框架版本很重要。不假設 latest，確認 package.json 中的版本

### 檔案與路徑

- **不憑空捏造檔案路徑**。用 `file_search` 或 `grep_search` 確認檔案存在
- 引用現有程式碼前，用 `read_file` 確認實際內容
- 不假設目錄結構，用 `list_dir` 探索

### 需求與規格

- 沒有 spec 不建置非顯而易見的功能（「很明顯嘛」不是充分理由）
- spec 有模糊地帶時，**停下來提問**，不自己發明需求
- 需求衝突時明確指出，而不是靜默選擇

---

## Context 管理規則

### 每個任務開始時提供的 Context 結構

```
任務 Context：
- 我們在做：[功能/任務描述]
- 相關文件：[spec 段落 / ADR / 設計文件引用]
- 要修改的檔案：[列出具體路徑]
- 要遵循的模式：[指向現有的類似程式碼]
- 本次範圍外的事：[明確排除項]
```

### Context 品質原則

| 狀況       | 錯誤做法                | 正確做法                       |
| ---------- | ----------------------- | ------------------------------ |
| 貼入 spec  | 貼整份 5000 字 spec     | 只貼相關章節                   |
| 參考程式碼 | 「你知道整個 codebase」 | 讀取具體要修改的檔案           |
| 測試失敗   | 貼 500 行輸出           | 只貼失敗的測試名稱和錯誤訊息   |
| 切換功能   | 繼續在同一對話討論      | 開新 session，重新載入 context |

---

## 核心行為準則

### 做

- **先讀後改**：修改任何檔案前先閱讀它
- **範圍紀律**：只修改被要求修改的東西
- **驗證不假設**：「看起來對」不夠，需要測試通過或執行期確認
- **必要時推回**：發現問題要說出來，不要附和
- **積極浮出困惑**：遇到矛盾立刻提出，不要硬推

### 不做

- 不加未被要求的功能
- 不重構未被要求重構的程式碼
- 不加 docstring、comment、型別標注到未修改的程式碼
- 不在沒有前置 spec/架構文件的情況下開始建置複雜功能
- 不跳過 skill 的驗證步驟（「看起來對了」）
- 不假設 secret、金鑰或環境變數的值
- 不推測不確定的 API（優先搜尋確認）

---

## 完整開發生命週期

從 0 到 production 的標準 skill 序列：

```
1. idea-refine                → 模糊想法 → 可執行概念
2. problem-validation         → 驗證問題、受眾與替代方案是否成立
3. analyze-spec               → 定義要建置什麼與驗收標準
4. design-architecture        → Sitemap + SA + SD
5. api-and-interface-design   → 確立 API 合約（如有需要）
6. plan-build                 → 拆解為帶估點的可執行任務
7. create-issues              → 建立 GitHub Issues 追蹤
8. context-engineering        → 設置 rules 檔案與工作階段 context
9. write-tests                → 測試計畫與測試骨架
10. source-driven-development  → 確認框架 API（如有需要）
11. tdd-build                 → 逐任務 Red-Green-Refactor
12. browser-testing-with-devtools → 前端執行期驗證（如有需要）
13. code-review-and-quality   → 五維度合併前審查
14. security-and-hardening    → OWASP 審查（每個功能伴隨）
15. performance-optimization  → 基於量測的效能調整（如有需要）
16. git-commit                → Conventional Commits + 自動版號
17. documentation-and-adrs   → 記錄架構決策
18. ci-cd-and-automation      → 建立自動化品質關卡
19. shipping-and-launch       → 發布前清單 + 監控 + 回滾計畫
20. post-deploy-monitoring    → 短週期驗證 deploy 健康與回滾訊號
21. post-launch-optimization  → 上線後成效追蹤 + 優化迭代
22. retrospective-and-learnings → 沉澱流程學習與改善項
```

> 不是每個任務都需要所有 skill。修 bug 通常只需要：
> `debugging-and-error-recovery` → `tdd-build` → `git-commit`

---

## 失敗模式警示

AI 在這個專案中**最常出錯**的方式：

1. **幻覺 skill 步驟**：自己發明流程而不讀取 SKILL.md
2. **假設檔案存在**：捏造路徑而不用搜尋工具確認
3. **過早進入程式碼**：跳過 spec/設計直接寫實作
4. **靜默解決衝突**：需求矛盾時自己選一個而不提出
5. **工作階段過長**：對話過長後引用已過時的 context
6. **Context 過載**：貼入整個 spec/codebase 而不是精確節錄

---

## 與 User 的互動規範

- 回應使用繁體中文（除程式碼、術語外）
- 不說「好的！我馬上來做～」之類的空洞開場
- 直接進入任務，在行動前列出假設
- 主動指出潛在問題，不等 user 踩坑後才說
- 給出選項時，標明推薦項及理由
- 估算時給出範圍，不給假精確（「大約 2-4 小時」而非「3 小時」）

---

## ⚠️ 強制追蹤與評估 (Tracing & Evaluation)

當你執行完任何一個 skill 並且產出結果後，在等待 User 下一個指令前，**你必須執行以下指令來回報你的執行紀錄**：

```bash
node .github/scripts/trace-skill.js --skill <當前skill名稱> --output <你剛剛產出或修改的主要檔案> --input "<使用者的初始請求或任務目標>"
```

這會觸發 Langfuse 的追蹤與規則評估，請確保你已經建立或修改了目標檔案，並且把檔案路徑帶入 `--output` 參數。**絕對不可跳過此步驟**。

---

## Skills 目錄速查

```
.github/skills/
├── idea-refine/                   # 提煉模糊想法
├── problem-validation/            # 驗證問題與需求是否成立
├── analyze-spec/                  # 產出規格書
├── design-architecture/           # SA / SD 文件
├── api-and-interface-design/      # API 合約設計
├── plan-build/                    # 任務拆解與估點
├── create-issues/                 # 建立 GitHub Issues
├── context-engineering/           # 設置 AI Context
├── write-tests/                   # 測試計畫與骨架
├── source-driven-development/     # 官方文件驗證
├── tdd-build/                     # TDD 實作
├── incremental-implementation/    # 薄切片逐步建置
├── frontend-ui-engineering/       # 生產品質 UI
├── browser-testing-with-devtools/ # 瀏覽器端驗證
├── debugging-and-error-recovery/  # 系統性除錯
├── code-review-and-quality/       # 五維度審查
├── security-and-hardening/        # 安全性強化
├── performance-optimization/      # 效能調整
├── code-simplification/           # 移除複雜度
├── git-commit/                    # 提交與版號
├── ci-cd-and-automation/          # CI/CD 管線
├── documentation-and-adrs/        # ADR 與文件
├── deprecation-and-migration/     # 廢棄與遷移
├── shipping-and-launch/           # 生產部署
├── post-deploy-monitoring/        # 部署後短週期監控
├── post-launch-optimization/      # 上線後追蹤與優化
├── retrospective-and-learnings/   # 回顧與學習沉澱
└── using-agent-skills/            # Skill 選擇指南（從這裡開始）
```
