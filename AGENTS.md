# Plan-to-Build Agent Guide

`plan-to-build` 是一套本地 AI Agent workflow / skills framework。這個 repo 的主要產出是流程文件、harness 規則、skills 與 templates，不是一般應用程式功能。

本檔是跨工具規則層，適用於支援 `AGENTS.md` 的 agent。Copilot / VS Code 的補充規則放在 `.github/copilot-instructions.md`；workflow 細節放在 `.github/harness/`。

## AI 讀取順序

AI 應依下列順序套用規則，不要把上層責任下放，也不要在下層重複定義上層規則。

| 順位 | 檔案                                                                    | 角色                                                         | 何時讀取                       |
| ---- | ----------------------------------------------------------------------- | ------------------------------------------------------------ | ------------------------------ |
| 1    | `AGENTS.md`（本檔）                                                     | 跨工具規則層：原則、閘門、任務狀態義務                       | 每次對話自動載入               |
| 2    | `.github/copilot-instructions.md`                                       | Copilot / VS Code 環境補充層：工具偏好、固定提問句、輸出格式 | 使用 Copilot 時自動載入        |
| 3    | `.github/harness/harness-workflow.md`                                   | 工作流程細節層：步驟、追蹤卡、閘門策略                       | 需執行非平凡流程時             |
| 4    | `.github/harness/harness-status-dictionary.md`                          | 任務狀態詞彙層                                               | 任何狀態變更時                 |
| 5    | `.github/skills/*/SKILL.md`                                             | 特定 workflow / skill                                        | 任務類型符合時                 |
| 6    | `.github/harness/plan/*`、`.github/worklog/*`、`.github/harness/spec/*` | 活文件：當下任務狀態、checkpoint、驗證證據                   | 開始任務、恢復任務、回寫證據時 |
| 7    | `.github/harness/templates/*`、`docs/templates/*`                       | 文件骨架                                                     | 建立新文件時                   |

衝突仲裁：低順位文件與高順位文件衝突時，以高順位為準；發現衝突應停下並回報，不可靜默選邊。

## Harness Workflow 文件

- 流程細節：`.github/harness/harness-workflow.md`
- 流程附錄、樣板與低頻範例：`.github/harness/harness-workflow-appendix.md`
- 任務狀態詞彙：`.github/harness/harness-status-dictionary.md`
- Agent / skill 速查：`.github/harness/agent-reference.md`
- 建置計畫：`.github/harness/plan/{feature-name}-build-plan.md`
- Agent 狀態：`.github/worklog/agent-status.md`

## 啟動四閘門

每次新需求都先依序通過下列閘門。純資訊查詢例外；若任務會讀檔、搜尋、編輯、驗證或回寫文件，視為工具序列任務，需走閘門。

> **[Token 優化提示]**：Agent 啟動工具序列任務時，應優先執行 `node .github/scripts/harness-cli.js check`（或 `npm run harness:check`），以精簡 JSON 或 `--ai` 極短單行格式獲得 4 閘門診斷結果；回報人類或展示 Dashboard 時可附加 `--human` 參數產生圖形化報告。

### 1. 未完成任務閘門

先掃描 active state：

1. `.github/worklog/agent-status.md` 的 `Active Task`。
2. 若 `Active Task` 為 `none`、`idle` 或不存在，再看 `.github/harness/plan/*-build-plan.md` 的「未完成任務（優先閱讀）」表格。

若存在 `未開始 / 進行中 / 阻塞 / 暫停 / 需補充輸入` 任務，先請使用者決策：`繼續 / 放棄並重置 / 放棄並保留 checkpoint`。未取得決策前，不得開始新的非平凡任務。

已完成、已重置、歸檔、歷史 change log、checkpoint 範例與模板文字只作背景，不觸發未完成任務閘門。

### 2. Input 收斂閘門

任務缺少 `目標 / 範圍 / 驗收標準` 任一欄位時，先輸出最小任務卡，缺漏欄位標 `?`，狀態為 `需補充輸入`。

空泛詞彙預設觸發收斂：`優化 / 改善 / 整理 / 重構 / 升級 / 強化 / 清理 / 調整 / 看看`。

### 3. 任務分級閘門

規格卡可執行後，先判定任務級別再啟動。

| 級別     | 判定條件                                          | 必做                                                                 | 可省略                            |
| -------- | ------------------------------------------------- | -------------------------------------------------------------------- | --------------------------------- |
| micro    | 單檔或極小文件修改；無行為影響                    | 更新 `.github/worklog/agent-status.md`；完成前列出檔案連結與驗證證據 | 完整 build plan、追蹤卡、斷點測試 |
| standard | 多檔變更；可估範圍；不跨大型模組                  | 完整閘門、build plan、agent status、追蹤卡、切片驗證、輕量 retro     | 斷點測試，除非預期跨 session      |
| heavy    | 跨模組、影響使用者行為、需要 spec/design 或高風險 | 完整 workflow、spec/design、斷點測試、完整 retro                     | 無                                |

若任務在執行中升級，立即調升級別並補齊對應活文件。

### 4. 實作啟動閘門 (Execution Gate)

分級確認後，先更新活文件，再執行任何讀檔、搜尋、命令、編輯或驗證。不論任務屬於哪個級別，啟動時都必須在對話或文件中明確輸出所選擇的 Skill Route。

- **Project Environment Setup (環境與上下文確認)**：啟動前必須掃描是否具備足夠的專案 Context（如 `CONTEXT.md` 或 Tracker Labels）。若缺乏，應主動建議執行 `context-engineering` 初始化環境。
- **規格文件硬性檢查 (Feature Spec Requirement)**：
  - 在執行任何 Code 編輯、UI 畫面創建或系統開發前，必須確認對應所屬專案中已存在 Feature Spec 規格文件（例如專案庫的 `spec/{feature}-spec.md` 或 `.github/harness/spec/{feature}-spec.md`）。
  - **若不存在規格文件**：Agent 將自動強制鎖定在 `analyze-spec` 路由，先執行需求確認並於所屬專案產出規格文件。**嚴禁在未產出 Spec 並取得使用者確認前直接撰寫前端/後端程式碼或生成 UI 畫面**。
  - **微調與畫面調整**：必須指定或參照既有的 Spec 檔案。
- `micro`：更新 `.github/worklog/agent-status.md` 為 `進行中`，記錄一行目的描述與使用的 Skill Route 即可。
- `standard / heavy`：同時完成：
  - 在 `.github/harness/plan/{feature-name}-build-plan.md` 建立或更新本輪切片，並填寫 Skill Route。
  - 更新 `.github/worklog/agent-status.md` 的 `Active Task` 為 `進行中`。

兩份活文件缺一不可；僅更新其中一份視同閘門未通過。

例外：使用者明確指定「檔案 + 動作」（例如「在 `file.ts` 第 42 行加上 X」）、已提供完整任務卡、或純資訊查詢。

## Skill 路由

這個 repo 的 skills 位於 `.github/skills/`。任務符合某個 skill 時，必須先讀取對應 `SKILL.md`，再依其流程執行。

**語意意圖判斷：** AI 應主動分析使用者的自然語言與潛在目的，將其對應至最合適的 Skill。不可僅依發音或死板關鍵字；只要使用者的描述（如「網站變好慢」、「畫面跑版」、「幫我拆分任務」）在語意上符合某個 Skill 的解決範圍，就應該主動導向該 Skill。

**強管轄路由：** 無論是新專案或既有專案的新需求（例如「幫我做一個登入頁面」、「開發 AI 功能」），若尚無現成 Spec 規格檔，**強制預設先導向 `analyze-spec` 產出規格**，確定後再接續 `design-architecture` ➔ `plan-build` ➔ `tdd-build`，不得直接跳入 `frontend-ui-engineering` 或純程式碼寫入。

常見路由：

- 「我有個點子但不知道怎麼開始」、「想探索方向」 ➔ `idea-refine`
- 「這個需求合理嗎？」、「驗證痛點是否真實」 ➔ `problem-validation`
- 「幫我分析這段需求並寫成 Spec」、「有客戶描述想轉為規格」、「要做新功能/新頁面」 ➔ `analyze-spec`
- 「準備開始架構設計」、「幫我切分模組與畫 Sitemap」 ➔ `design-architecture`
- 「Spec 確認了，幫我規劃任務跟點數」、「產生開發 GitHub Issues」 ➔ `plan-build`
- 「開始照著計畫寫程式」、「請實作 TASK-XXX」 ➔ `tdd-build` 或 `incremental-implementation`
- 「調整既有 UI 排版」、「畫面跑版了需要微調」、「製作響應式元件」 ➔ `frontend-ui-engineering` (已有 Spec 前提下)
- 「寫單元測試」、「產出測試計畫或覆蓋率報告」 ➔ `write-tests`
- 「程式報錯了」、「跑不起來幫我除錯」、「為什麼會出 exception」 ➔ `debugging-and-error-recovery`
- 「幫我做 Code Review」、「檢查這支 PR 有沒有問題」 ➔ `code-review-and-quality`
- 「幫我記錄架構決策 (ADR)」、「寫 README 說明」 ➔ `documentation-and-adrs`
- 「完成任務了，幫我 git commit」、「準備提交程式碼」 ➔ `git-commit`
- 「不知道該用哪個 Skill」、「請幫我選擇適合的 Agent Skill」 ➔ `using-agent-skills`

若 skill 與 harness workflow 都適用：先用本檔與 harness 完成啟動、狀態與追蹤，再讀取對應 skill 執行專門步驟。

## Task Card Schema

本專案使用漸進式 Task Card 作為規格、交接、中斷與驗收的統一表單。

```text
任務卡 (Task Card)
- 目標：[啟動時填寫]
- 路由 (Skill Route)：[啟動時填寫，標註使用的 skill，如無則填 none]
- 範圍 (In/Out)：[啟動時填寫]
- 驗收標準：[啟動時填寫]
- 更新檔案：[切片或完成時補齊，列出路徑]
- 驗證證據：[切片或完成時補齊，指令輸出/截圖/結果]
- 阻塞/恢復入口：[中斷時補齊，說明缺少什麼或下次從哪開始]
```

宣告任務完成前，上述欄位需補齊，並同步至少 `.github/worklog/agent-status.md`。`standard / heavy` 任務還需同步 build plan。

> **[Token 優化與自動化提示]**：Agent 在任務啟動、切片更新或宣告完成時，應優先執行 `node .github/scripts/harness-cli.js card`（或 `npm run harness:card`），自動解析活檔案並格式化輸出 Task Card 區塊，避免手動拼接文字遺漏或浪費 Output Token。

## 全域行為規則

- 狀態先於動作：任何工具呼叫、實作、驗證前，先更新對應活文件。
- 活文件確保機制：寫入活文件（如 `worklog`、`plan` 等）時，若對應的資料夾或檔案不存在，必須主動建立（包含建立父目錄），不可因找不到路徑而跳過同步。
- 單一切片工作循環：`standard / heavy` 任務一次只推進一個切片，依序完成宣告、執行、驗證與雙寫。
- TDD 鐵律 (Iron Law of TDD)：進行功能實作時，嚴禁在未先看到失敗測試 (Red) 報告前撰寫任何產品實作代碼；測試失敗後只寫能讓測試通過的最少代碼 (Minimum Passing Code)。
- 輕量 Review & Simplify 原則：`micro` 任務自動豁免 Code Review；`code-review-and-quality` 僅在 `heavy` 切片採雙維度（Spec契合度+邊界防禦）點檢；`code-simplification` 僅為 TDD 藍燈按需選用工具，絕非強制關卡。
- 切片隔離策略：`standard / heavy` 任務切片建議使用輕量 Git Branch 隔離開發與驗證，成功後 merge 回主分支，失敗則直接刪除分支，免去維護複雜 Worktrees 的成本。
- 活文件持續回寫：建置進行中也要同步 plan / worklog / agent status，不可只在結尾補寫。
- 失敗即時阻塞：build/test/lint/typecheck 非 0 結束時，先把任務標為 `阻塞`，補 checkpoint，再進入除錯。
- 薄垂直切片：優先小切片完成與驗證，避免大範圍重寫。
- 不擴張範圍：除非明確要求，不額外重構、加功能或更新不相關文件。
- 不發明工具或 API：不確定時先搜尋 repo、讀文件或讀官方來源。
- 不執行不可逆操作：未取得使用者明確同意前，不做 `git push`、部署、生產資料修改、大範圍刪除。

## 完成前檢查 (DoD & Shutdown Checklist)

宣告完成前必須確認：

- Task Card 欄位已補齊。
- 變更檔案符合本輪範圍。
- 驗證證據已回寫；若未執行驗證，已寫明原因。
- `.github/worklog/agent-status.md` 已更新；`standard / heavy` 任務的 build plan 也已同步。
- `Active Task` 已結束或提供清楚恢復入口 (Handoff Point)。
- `standard` 任務已完成輕量 retro；`heavy` 任務已完成完整 retro。
- **Living Spec 活文件同步**：若本輪修改涉及邏輯調整、API 合約或 UI 流程，必須同步回寫並更新對應專案中（如 `spec/` 或 `.github/harness/spec/`）的 Feature Spec 規格檔。
- **Continuous Context Update (知識回寫)**：自我檢查對話過程中是否有新增的架構決策、限制或邊界情境。若有，強制要求更新 `CONTEXT.md` 或對應 ADR，絕不允許將知識遺留在對話歷史中。
- **Stop Hook 守門員**：對於 `standard` 與 `heavy` 任務，檢查 Task Card 或 agent status 的尾端是否有明確的 `> [!CHECK] Cross-Model Review Approved by [Model/Role Name]` 標記。若無，強制攔截任務結案，並先執行 `cross-model-review` skill。

## 溝通規範

- 預設使用繁體中文，程式碼與專有名詞除外。
- 先讀後改，引用現有檔案前先確認實際內容。
- 主動浮出假設、衝突與風險。
- 給選項時標明推薦項與理由。
- 不用假精確估算；以合理範圍描述。
