# Harness Workflow

這個 workspace 使用一套小型、本地的 workflow。它受到公開 skill packs 啟發，但已調整成適合 VS Code 與 GitHub Copilot 的形式。

## 為什麼這樣設計

`agent-skills` 顯示：當 skills 是有具體觸發條件與驗證關卡的流程文件時，效果最好。`gstack` 顯示：快速建置者需要角色分離；產品思考、工程審查、QA、安全、發布與回顧，不應該被壓成一次模糊的 coding pass。

這個 repo 把這些概念整理成本地 prompts 與 skills，讓它們容易檢查，也容易修改。

## 步驟地圖

完整步驟地圖詳見 `.github/harness/harness-workflow-appendix.md`。

## 啟動檢查清單 (Startup Checklist)

每次接到新需求時，建議依下列固定順序一次完成檢查，避免在多份文件間反覆跳轉。

0. **Project Environment Setup (專案環境閘門)**：確認專案是否已有 `CONTEXT.md` 或 Tracker Labels。若無，主動提議執行 `context-engineering` 初始化環境。
1. **未完成任務閘門 (Active State Precedence)**：依 `AGENTS.md` 掃描，若有未完成任務，需先決策繼續或重置。
2. **Input 收斂閘門 (Input Convergence)**：檢查 Task Card 啟動欄位是否完整；缺漏則標 `Needs input`。
3. **任務分級閘門 (Task Grading)**：判定 micro / standard / heavy，決定後續追蹤與驗證力度。
4. **實作啟動閘門 (Execution Gate)**：將任務寫入 plan 或 agent-status (`In progress`) 後，才能開始實作。

若任一步驟不成立，先補齊該步驟，不可越級執行 (No Bypassing)。

## 純資訊查詢 vs 工具序列邊界

為了平衡流程嚴謹與執行流暢，先判定目前任務屬性：

- 純資訊查詢：不改檔、不跑命令、不啟動工具序列，可直接回答。
- 工具序列任務：會讀檔、搜尋、編輯、驗證或回寫文件，必須先走啟動閘門。

常見正反例詳見 `.github/harness/harness-workflow-appendix.md`。

邊界模糊時，預設採工具序列處理，先更新任務狀態再執行。

## 固定輸出路徑

固定輸出路徑整理詳見 `.github/harness/harness-workflow-appendix.md`。

## 雙 Workflow 規則 (Planning vs Execution)

這個 workspace 將工作強制拆分為兩段，防止「先規劃、後續失聯」：

- **Planning Workflow**：`analyze-spec` + `design-architecture` + `plan-build`。
- **Execution Workflow**：`write-tests` + `tdd-build` (嚴格遵循 TDD Guardrails)，搭配 UI/Security 等技能。

**[Guardrails] 進入 Execution 前的絕對邊界**：
- 最新 build plan 或 agent status 已存在。
- 至少一個任務處於 `In progress`，並有具體可執行的切片 (Slice)。
- 已明確宣告本輪要更新的活文件 (Source of Truth)。
若不滿足上述條件，**禁止**直接跳到 coding；必須退回 Planning Workflow 補齊。

**Handoff (交接)**：
規劃到建置的交接，請嚴格遵守 `AGENTS.md` 的 Task Card Schema。

## 任務 Context 格式

規格與交接請一律使用漸進式 Task Card 填寫。
活文件與狀態字典為 **Single Source of Truth (SSOT)**，必須遵循 `.github/harness/harness-status-dictionary.md`。

### Task Card 兩階段填寫

同一份 Task Card Schema 採漸進式填寫，降低啟動成本並維持完成一致性。

| 階段          | 必填欄位                          | 目的                               |
| ------------- | --------------------------------- | ---------------------------------- |
| 啟動階段      | 目標、範圍 (In/Out)、驗收標準     | 確保任務可啟動且可判斷是否進入實作 |
| 切片/完成階段 | 更新檔案、驗證證據、阻塞/恢復入口 | 確保任務可驗證、可交接、可恢復     |

規則：

- 啟動階段任一欄位缺漏時，狀態應為 `Needs input`。
- 宣告完成前，六個欄位需補齊且同步到活文件。

## Active State Precedence

依 `AGENTS.md` 的 Active state 判定順序掃描。

## 執行追蹤卡（必填）

Skill 或 workflow 執行期間，agent 必須定期輸出追蹤卡，不可只在結尾一次總結。

文字樣板詳見 `.github/harness/harness-workflow-appendix.md`。

規則：

- 任何工具呼叫、實作、驗證或文件回寫步驟開始前，先更新任務狀態，再執行步驟。
- `CurrentStep`：目前正在做的單一步驟（動詞開頭，避免模糊描述）。
- `Evidence`：目前可驗證的證據（已讀文件、已跑指令、已更新檔案、browser/runtime 結果）。
- `NextStep`：下一個立即動作（同一切片內可執行，避免寫成遠期計畫）。
- 更新時機：切片完成、狀態切換、影響範圍變化（純讀取探索不觸發）。
- 可計數規則：每完成 1 個切片至少更新 1 次；每次任務狀態切換（例如 `In progress` -> `Blocked`）再更新 1 次。
- 短切片例外：若同一回合內連續完成多個極小變更，可合併為 1 次更新，但需在 `Evidence` 明確列出涵蓋的切片。
- 若尚無證據，`Evidence` 不可留白，需填 `N/A（原因）`。

## 切片進度即時同步（雙寫強制）

為避免「plan 有切片但進度未更新」，每次切片狀態變更都必須在同一回合完成雙寫：

1. 先更新 build plan 的切片狀態（例如 `未開始 -> 進行中`）。
2. 同步更新 `.github/worklog/agent-status.md` 的 `Execution Tracking`（CurrentStep / Evidence / NextStep）。
3. 寫入本輪最小證據（指令、修改檔案、或驗證結果）。
4. 完成雙寫後，才能執行下一個命令或進入下一個切片。

禁止模式：

- 先連續執行多個切片，最後一次補寫。
- 只更新 plan 不更新 agent-status，或反之。

最小核對條件：

- plan 最新切片狀態與 agent-status 最新 `CurrentStep` 描述一致。
- `Evidence` 可對應實際命令或檔案變更。

## 斷點與狀態更新測試

預期會跨 session 或可能進入 `Blocked / Paused` 的任務至少做一次 workflow 斷點測試，證明中斷後可恢復：

- 模擬中斷：把任務切到 `Paused` 或 `Blocked`，寫下阻塞原因與缺少 input。
- 恢復演練：依文件中的恢復入口回到 `In progress`，並記錄恢復步驟。
- 狀態一致性：plan / worklog / agent status 的狀態與證據必須一致。

證據至少要落在一份活文件，且包含：

- 狀態轉換（例如 `In progress` -> `Blocked` -> `In progress`）。
- 每次轉換對應的 `CurrentStep / Evidence / NextStep`。
- 可直接重啟工作的恢復入口。

## Retro 完成條件

任務宣告完成前，retro 要求如下：

- `micro`：可選擇性補充 retro，非強制。
- `standard`：必須完成輕量 retro（至少 3 點：做得好 / 問題 / 下次調整），並回寫到 build plan 或 `.github/worklog/agent-status.md`。
- `heavy`：必須完成完整 retro，建議輸出 `{project-name}/doc/retrospectives/{feature-name}-retro.md`，並在活文件附上連結與摘要。

若未滿足上述條件，任務狀態不得標記為 `已完成`。

## 中斷決策（繼續或重置）

當任務狀態為 `Blocked`、`Paused`、`Needs input` 時，必須先做決策，不可直接往下寫 code：

- `繼續`：沿用原任務，更新阻塞資訊後回到 `In progress`。
- `重置`：終止原未完成任務，清空未完成佇列，建立新任務再開始。

補充硬性規則：

- 未完成上述決策前，不得直接切換到新任務。
- 若發現已切到新任務但舊任務未結案，必須立即停下並回補舊任務狀態與 checkpoint。

若選 `重置`，最小動作如下：

- 將原未完成任務標記為 `Reset`（或移入已重置歸檔段落）。
- 在 plan / worklog / agent status 記錄「重置原因、已完成、已驗證、未完成放棄項」。
- 新增新任務 ID、切片目標、驗證策略與文件同步目標。

### 命令失敗的即時中斷處置（build/test/lint/typecheck）

當命令以非 0 結束時，視為中斷事件，必須在同一回合執行：

1. 先把任務狀態改為 `Blocked`（至少 plan + agent-status 雙寫）。
2. 在 checkpoint 補齊：失敗原因、已完成、已驗證、缺少 input、恢復入口。
3. 再決策 `繼續` 或 `重置`，未決策前不得直接啟動下一個開發切片。

若漏做上述步驟，該輪不得宣告切片完成。

### 重置決策標準欄位（必填）

為了讓重置決策可追蹤且可恢復，建議每次 `Reset` 都補齊以下三欄：

- 放棄項：此次重置後不再延續的內容（需求、驗證、文件或程式碼方向）。
- 保留項：可沿用到新任務的內容（已完成成果、驗證證據、已確認決策）。
- 接替策略：新任務如何承接（新任務 ID、第一個切片、驗證策略、文件同步目標）。

填寫規則：

- 三欄不可空白；若無內容請填 `N/A（原因）`。
- 接替策略必須可直接執行，至少包含「下一步動作 + 要更新的活文件」。

最小樣板：

文字樣板詳見 `.github/harness/harness-workflow-appendix.md`。

## 中斷閘門策略（不是每個 step 都中斷）

不建議在每個 step 都設定中斷條件，會造成流程噪音。改採固定閘門：

- 進場閘門：開始建置前（確認 plan 或 agent status 與任務 ID）。
- 切片閘門：每個切片完成後（驗證證據與文件同步）。
- 狀態閘門：進入 `Blocked / Paused / Needs input` 時（必問繼續或重置）。
- 審核閘門：在交付前如果缺乏 Cross-Model Review Marker，狀態強制退回 `Blocked` 或 `In progress`。
- 交付閘門：宣告完成前（DoD 與文件同步完整性）。

除了上述閘門，其他步驟維持流暢執行，不強制中斷。

## 執行期間自動整理（Plan Housekeeping）

為避免 plan 在開發中持續膨脹，整理動作不延後到收尾，而是在 workflow 執行期間由切片閘門自動觸發。

自動觸發時機（任一成立即執行）：

- 每次切片驗證完成後（切片閘門）。
- 主 plan 行數超過 500 行。
- 已完成任務詳情超過 5 筆。

自動整理最小步驟：

1. 先更新任務狀態與 `Execution Tracking`（CurrentStep / Evidence / NextStep）。
2. 將超出保留窗口的已完成任務詳情搬到 `.github/harness/plan/archive/`。
3. 主 plan 僅保留 active 視窗 + 最近 5 個已完成任務詳情 + archive 入口。
4. 在主 plan 的「歷史任務詳情（已歸檔）」更新歸檔範圍與路徑。
5. 在 agent status 證據欄回寫本次整理動作與結果。

失敗處理：

- 若當輪無法完成整理，任務狀態不得直接標 `Completed`；需標示原因與恢復入口。

## Input 審核規則（繼續前必檢）

當狀態是 `Needs input` 或有決策缺口時，先做 input 審核再決定繼續/重置。

最小審核清單：

- 完整性：是否回答了目標、範圍、限制與成功標準。
- 一致性：是否與現有 spec/plan/worklog 衝突。
- 可執行性：是否足以產生下一個可實作切片。
- 可驗證性：是否能對應至少一種驗證證據。
- 風險性：是否牽涉權限、資料暴露、不可逆操作或高成本重工。

審核結果處置：

- 全部通過：可 `繼續`。
- 缺 1-2 項且可快速補：標記 `Needs input`，待補後繼續。
- 關鍵項未通過（完整性/一致性/可執行性）：建議 `重置` 並開新任務。

### 空泛 input 收斂格式（未收斂不得實作）

若 input 無法直接形成可執行切片，請使用 `AGENTS.md` 定義的 Task Card Schema 填寫（至少補齊啟動階段欄位）。任一必填欄位空白前，不得進入 coding。此時任務狀態應標為 `Needs input`。

## 如何延伸

當 workflow 有多個步驟且需要可重用判斷時，新增 skill。當任務是聚焦的一次性互動時，新增 prompt。只有當每個任務都應看到某條規則時，才新增 always-on instructions。

## 驗證工具分層

每個切片都要留下最小但有意義的證據：

- 靜態檢查：VS Code diagnostics、typecheck、lint。
- 自動化檢查：unit/integration/e2e test，或 repo 現有測試命令。
- Browser/runtime：DOM snapshot、Playwright smoke test、console/network 檢查、必要時截圖。
- 文件證據：plan / worklog / agent status 回寫通過、失敗、未執行與原因。

前端 UI 變更預設需要 `frontend-ui-engineering` 與 `browser-testing-with-devtools`；切片驗證依本檔最小驗證矩陣回寫。若只跑 build，必須說明為什麼不需要 browser/runtime 證據。

### 最小驗證矩陣（預設值）

若任務未另外指定驗證策略，預設至少達到下表要求：

| 任務類型                       | 最小驗證要求                                                                       |
| ------------------------------ | ---------------------------------------------------------------------------------- |
| DOC（文件/流程）               | 文件一致性檢查（跨 AGENTS / workflow / plan / agent status） + VS Code diagnostics |
| FE（前端/UI）                  | VS Code diagnostics + 至少一次 browser/runtime smoke（DOM snapshot 或等價證據）    |
| 高風險變更（安全/權限/不可逆） | 對應類型最小驗證 + 安全檢查（輸入邊界、權限、資料暴露）                            |

補充：

- 若只執行部分驗證，必須在證據中記錄未執行項與原因。
- 若任務有既有測試命令，優先沿用專案既定命令。

## 完成前固定提問

宣告完成前，請確認已補齊 `AGENTS.md` 規定的 Task Card Schema 所有欄位。

## 完成定義 (DoD) 最低門檻

若任務未另行定義更高標準，宣告完成前至少要同時滿足以下條件：

1. **任務狀態**：active 任務轉為 `Completed`，時間戳更新。
2. **Task Card**：六個欄位已補齊（目標、範圍、驗收標準、更新檔案、驗證證據、阻塞/恢復入口）。
3. **驗證證據**：至少一項符合任務類型的證據已落地。
4. **文件同步 (SSOT)**：至少同步兩份活文件，其中必含 `agent-status.md`。
5. **Continuous Context Update (知識回寫)**：對話期間產生的新知、限制與決策，必須主動更新至 `CONTEXT.md` 或 ADR，嚴禁遺留於 Ephemeral Conversation 中。
6. **未完成項揭露**：延後事項已記錄原因與後續 Handoff 入口。
7. **審核標記**：`standard` 與 `heavy` 任務必須有 `cross-model-review` 的通過標記。

### 完成前檢查清單 (Shutdown Quick Check)

- [ ] active 任務已清空或切為 idle，Last Completed Task 已更新。
- [ ] plan 與 agent status 的任務狀態一致。
- [ ] 更新檔案清單可對應實際修改內容。
- [ ] 驗證證據已寫明結果，不是只有命令名稱。
- [ ] **Continuous Context Update 檢查**：確認無遺漏的重要架構與限制未回寫 `CONTEXT.md`。
- [ ] 若有風險或限制，已在阻塞/恢復入口或備註中留下下一步。
- [ ] diagnostics 無新錯誤，或已記錄例外原因。

## 最小 KPI（流程可觀測性）

流程觀測 KPI 與週檢建議詳見 `.github/harness/harness-workflow-appendix.md`。
