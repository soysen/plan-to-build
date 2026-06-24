# GitHub Issues 清單

## TASK-001：拆分 TaskStore 寫入/讀取邏輯為獨立 Key

**類型**：FE
**估點**：3 SP
**里程碑**：M1 - Refactor
**Labels**：`frontend`, `priority:high`
**前置任務**：無

### 描述

目前 `TaskStore` 在 `chrome.storage.local` 或 `localStorage` 中將所有任務存在一個名為 `blob-todo-tasks` 的陣列。為了使用 `chrome.storage.sync` 並避開單一 Key 的 8KB 限制，必須修改儲存結構：
1. `blob-todo-meta-tasks`: Array of String，儲存所有 Task ID。
2. `blob-todo-task-{id}`: Object，儲存該 ID 對應的任務細節。
3. `blob-todo-history`: 目前維持原樣，但限制儲存的歷史數量，或是後續再獨立處理。

需要實作：
- `TaskStore.save` 需使用上述獨立 Key 寫入。
- `TaskStore.load` 需先讀取 Meta，再批次讀取所有個別 Task ID。

### 驗收標準

- [ ] 新增任務時，會寫入一個 meta 變更與一個 task 實體變更。
- [ ] 讀取任務時，能夠正確組合成完整的 tasks 陣列供 UI 渲染。
- [ ] 操作依然能保持原本的效能。

### 參照

- Spec：REQ-F001, REQ-F002

---

## TASK-002：實作任務數量 > 400 時的 UI 警告機制

**類型**：FE
**估點**：2 SP
**里程碑**：M1 - Refactor
**Labels**：`frontend`, `priority:medium`
**前置任務**：#TASK-001

### 描述

`chrome.storage.sync` 最多只允許 512 個 Item。保留一些額度給 meta、history 以及設定檔後，我們必須確保使用者的任務總數量不會超過限制。當使用者的未刪除任務（含子任務）超過 400 個時，在畫面上顯示一個明顯的警告提示，提醒使用者清理任務。

### 驗收標準

- [ ] 當 `TaskStore.getTopLevel().length + TaskStore.getChildren(...).length` > 400 時，介面上出現警告訊息。
- [ ] 訊息應明確告知：「同步空間即將額滿，請刪除已完成或不需要的任務以繼續跨裝置同步」。

### 參照

- Spec：REQ-NF001

---

## TASK-003：實作舊資料自動從 local 搬移至 sync 機制

**類型**：FE
**估點**：2 SP
**里程碑**：M2 - Migration
**Labels**：`frontend`, `priority:high`
**前置任務**：#TASK-001

### 描述

針對現有使用者，他們的資料目前存在 `chrome.storage.local` 裡的 `blob-todo-tasks` 陣列中。必須寫一段 Migration 邏輯：在 `TaskStore.load()` 時，若發現 `sync` 沒有 `blob-todo-meta-tasks`，但 `local` 裡面有資料，就把 `local` 裡的所有資料讀出，轉寫到 `sync` 中（同時清除或標記 `local` 已搬移）。

### 驗收標準

- [ ] 使用舊版的使用者打開新版擴充功能後，原本的任務依然存在，不會遺失。
- [ ] 轉換完成後，資料確實已被寫入 `chrome.storage.sync`。

### 參照

- Spec：REQ-F003

---

## TASK-004：實作 chrome.storage.onChanged 同步監聽

**類型**：FE
**估點**：2 SP
**里程碑**：M2 - Migration
**Labels**：`frontend`, `priority:medium`
**前置任務**：#TASK-001

### 描述

為了讓「跨裝置」與「多視窗」的體驗更好，當使用者開啟多個 New Tab 分頁時，若在其中一個分頁勾選完成，其他分頁應該要即時更新。實作監聽 `chrome.storage.onChanged` 事件，並觸發 `TaskStore.load()` 與 `EventBus.emit('tasks:changed')`。

### 驗收標準

- [ ] 打開兩個 Blob Todo 分頁，在 A 分頁新增任務，B 分頁會自動出現該任務。
- [ ] 注意避免無限迴圈（自己在儲存時觸發自己讀取又重新渲染）。

### 參照

- Spec：REQ-F004

---

## TASK-005：更新 Manifest 版號與釋出打包

**類型**：Deploy
**估點**：1 SP
**里程碑**：M3 - Launch
**Labels**：`deployment`, `priority:high`
**前置任務**：#TASK-003

### 描述

將 `manifest.json` 版本號更新為 `2.1.0` (或適當的新版號)，並打包成 `blob-todo-v2.1.0.zip` 以供上架 Chrome Web Store。

### 驗收標準

- [ ] `manifest.json` 的版號正確更新。
- [ ] ZIP 壓縮檔內不包含 `node_modules` 或不需要的隱藏檔（如 `.DS_Store`）。

### 參照

- 無
