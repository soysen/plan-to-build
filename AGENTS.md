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

### 4. 實作啟動閘門

分級確認後，先更新活文件，再執行任何讀檔、搜尋、命令、編輯或驗證。

- `micro`：更新 `.github/worklog/agent-status.md` 為 `進行中`，記錄一行目的描述即可。
- `standard / heavy`：同時完成：
  - 在 `.github/harness/plan/{feature-name}-build-plan.md` 建立或更新本輪切片。
  - 更新 `.github/worklog/agent-status.md` 的 `Active Task` 為 `進行中`。

兩份活文件缺一不可；僅更新其中一份視同閘門未通過。

例外：使用者明確指定「檔案 + 動作」（例如「在 `file.ts` 第 42 行加上 X」）、已提供完整任務卡、或純資訊查詢。

## Skill 路由

這個 repo 的 skills 位於 `.github/skills/`。任務符合某個 skill 時，必須先讀取對應 `SKILL.md`，再依其流程執行。

常見路由：

- 模糊想法：`idea-refine`
- 問題或需求驗證：`problem-validation`
- 需求文件或 spec：`analyze-spec`
- 架構、SA、SD：`design-architecture`
- 建置計畫或任務拆解：`plan-build`
- 實作任務：`tdd-build` 或 `incremental-implementation`
- UI 任務：`frontend-ui-engineering`
- 測試計畫或測試報告：`write-tests`
- 錯誤或失敗：`debugging-and-error-recovery`
- 程式碼審查：`code-review-and-quality`
- 文件或 ADR：`documentation-and-adrs`
- Git commit：`git-commit`
- 不確定路由：`using-agent-skills`

若 skill 與 harness workflow 都適用：先用本檔與 harness 完成啟動、狀態與追蹤，再讀取對應 skill 執行專門步驟。

## Task Card Schema

本專案使用漸進式 Task Card 作為規格、交接、中斷與驗收的統一表單。

```text
任務卡 (Task Card)
- 目標：[啟動時填寫]
- 範圍 (In/Out)：[啟動時填寫]
- 驗收標準：[啟動時填寫]
- 更新檔案：[切片或完成時補齊，列出路徑]
- 驗證證據：[切片或完成時補齊，指令輸出/截圖/結果]
- 阻塞/恢復入口：[中斷時補齊，說明缺少什麼或下次從哪開始]
```

宣告任務完成前，上述欄位需補齊，並同步至少 `.github/worklog/agent-status.md`。`standard / heavy` 任務還需同步 build plan。

## 全域行為規則

- 狀態先於動作：任何工具呼叫、實作、驗證前，先更新對應活文件。
- 單一切片工作循環：`standard / heavy` 任務一次只推進一個切片，依序完成宣告、執行、驗證與雙寫。
- 活文件持續回寫：建置進行中也要同步 plan / worklog / agent status，不可只在結尾補寫。
- 失敗即時阻塞：build/test/lint/typecheck 非 0 結束時，先把任務標為 `阻塞`，補 checkpoint，再進入除錯。
- 薄垂直切片：優先小切片完成與驗證，避免大範圍重寫。
- 不擴張範圍：除非明確要求，不額外重構、加功能或更新不相關文件。
- 不發明工具或 API：不確定時先搜尋 repo、讀文件或讀官方來源。
- 不執行不可逆操作：未取得使用者明確同意前，不做 `git push`、部署、生產資料修改、大範圍刪除。

## 完成前檢查

宣告完成前必須確認：

- Task Card 欄位已補齊。
- 變更檔案符合本輪範圍。
- 驗證證據已回寫；若未執行驗證，已寫明原因。
- `.github/worklog/agent-status.md` 已更新；`standard / heavy` 任務的 build plan 也已同步。
- `Active Task` 已結束或提供清楚恢復入口。
- `standard` 任務已完成輕量 retro；`heavy` 任務已完成完整 retro。

## 溝通規範

- 預設使用繁體中文，程式碼與專有名詞除外。
- 先讀後改，引用現有檔案前先確認實際內容。
- 主動浮出假設、衝突與風險。
- 給選項時標明推薦項與理由。
- 不用假精確估算；以合理範圍描述。
