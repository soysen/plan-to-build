# Blob Todo — GitHub Issues 清單

> 產出自 `plan-build` skill｜2026-05-09
> 可直接複製每個 Issue 內容至 GitHub 建立 Issue

---

## M0 — 基礎骨架

---

## TASK-B01：建立 `index.html` 骨架與 DOM 結構

**類型**：Infra
**估點**：1 SP
**里程碑**：M0 - 基礎骨架
**Labels**：`infrastructure`, `priority:high`
**前置任務**：無

### 描述

建立完整的 HTML 骨架，包含所有頁面所需的 DOM 容器：
- `<header>`：breadcrumb 導航區 + 「＋」新增按鈕
- `<main id="blob-canvas">`：blob 渲染容器（`position: relative`，全視窗）
- `<div id="empty-state">`：無任務時的引導畫面
- `<dialog id="task-modal">`：新增/編輯 Modal（含完整表單）

### 驗收標準

- [ ] 所有 DOM 元素存在，id 與 SD 4.3 規格一致
- [ ] `<dialog>` 元素使用原生 HTML `<dialog>`（非 div 模擬）
- [ ] 無任何 JS 邏輯，純結構

### 參照

- SD：4.3 Modal DOM 結構

---

## TASK-B02：建立 CSS 設計系統

**類型**：FE
**估點**：1 SP
**里程碑**：M0 - 基礎骨架
**Labels**：`frontend`, `priority:high`
**前置任務**：#TASK-B01

### 描述

在 `<style>` 標籤內定義完整的 CSS 設計系統：
- Custom Properties（顏色 Token、字體、間距）
- CSS reset（`box-sizing`、`margin`、`padding`）
- 深色背景（`#0a0a0f`）
- 字體：Google Fonts Inter 或 system-ui fallback

### 驗收標準

- [ ] 所有顏色 Token 依 SD 4.2 顏色系統定義
- [ ] `--float-duration`、`--float-delay`、`--blob-shape`、`--blob-color` CSS 變數已定義
- [ ] 頁面背景為深色，無預設白底

### 參照

- SD：4.2 Blob CSS 樣式規格

---

## TASK-B03：實作 EventBus 模組（MOD-007）

**類型**：FE
**估點**：1 SP
**里程碑**：M0 - 基礎骨架
**Labels**：`frontend`, `priority:high`
**前置任務**：#TASK-B01

### 描述

實作簡單的發布/訂閱 EventBus，讓模組間解耦通訊。

支援事件清單：
- `tasks:changed` → TaskStore 寫入後觸發
- `modal:open` / `modal:close`
- `view:enter-subtask` / `view:exit-subtask`

### 驗收標準

- [ ] `EventBus.on(event, handler)` 可訂閱
- [ ] `EventBus.emit(event, data)` 可觸發
- [ ] `EventBus.off(event, handler)` 可取消訂閱
- [ ] 同一事件可有多個訂閱者

### 參照

- SA：MOD-007 EventBus

---

## M1 — MVP

---

## TASK-001：實作 TaskStore（MOD-001）

**類型**：FE
**估點**：3 SP
**里程碑**：M1 - MVP
**Labels**：`frontend`, `priority:high`
**前置任務**：#TASK-B03

### 描述

實作 `TaskStore` — 任務資料的單一真實來源，負責 CRUD 和 localStorage 持久化。

提供介面：
- `getTopLevel()`, `getChildren(parentId)`, `getById(id)`
- `getNextSubtaskHint(parentId)` → 最近建立且未完成的子任務 title
- `add(data)` → 自動產生 UUID、blobShape（隨機 border-radius 八值）
- `update(id, partial)`, `delete(id)`（含子任務聯刪）, `toggleDone(id)`
- `_load()` / `_save()` → key: `blob-todo-tasks`

### 驗收標準

- [ ] 新增後 localStorage 有對應資料
- [ ] 刪除頂層任務時，子任務一併刪除
- [ ] `toggleDone` 切換 `done` 欄位並更新 `updatedAt`
- [ ] 從 localStorage 讀取時驗證資料結構（防崩潰）
- [ ] `getNextSubtaskHint` 只回傳未完成的子任務

### 參照

- SA：MOD-001 TaskStore
- SD：2.1 Task 型別定義、3.1 TaskStore 介面

---

## TASK-002：實作 ColorEngine（MOD-002）

**類型**：FE
**估點**：1 SP
**里程碑**：M1 - MVP
**Labels**：`frontend`, `priority:high`
**前置任務**：#TASK-B02

### 描述

純函式 `ColorEngine.getColor(deadline)` → HSL 色彩字串。以今天 00:00 為基準計算天數。

### 驗收標準

- [ ] null → `hsl(220, 10%, 40%)`
- [ ] > 7 天 → `hsl(142, 70%, 45%)`（冷綠）
- [ ] 3–7 天 → `hsl(45, 95%, 55%)`（黃）
- [ ] 1–3 天 → `hsl(25, 95%, 58%)`（橘）
- [ ] < 1 天或過期 → `hsl(0, 85%, 60%)`（紅）

### 參照

- SA：MOD-002 ColorEngine
- SD：4.2 顏色系統

---

## TASK-003：實作 LayoutEngine（MOD-003）

**類型**：FE
**估點**：5 SP
**里程碑**：M1 - MVP
**Labels**：`frontend`, `priority:high`, `blocked`
**前置任務**：#TASK-001

### 描述

⚠️ **高風險任務**

實作 `LayoutEngine.calculate(tasks, {w, h})` → `{id, x, y, r}[]`

**演算法**：
1. `calcBaseRadius(n, w, h)` → 使總面積約佔視窗 60%
2. `calcRadius(weight, base)` → `base * sqrt(weight / 3)`，最小 40px
3. 初始位置：視窗中心向外螺旋展開
4. 50 次排斥力迭代：推開重疊的 blob
5. 邊界保護：確保 `center - r >= 16px`（不超出邊緣）

### 驗收標準

- [ ] 重要度 5 的半徑 ≈ 重要度 1 的 `sqrt(5)` 倍（約 2.24 倍）
- [ ] 50 次迭代後，任意兩 blob 中心距 ≥ r1 + r2（無嚴重重疊）
- [ ] 所有 blob 在視窗邊界內（16px padding）
- [ ] 最小半徑保護：`r >= 40px`
- [ ] 空陣列輸入 → 回傳空陣列

### 參照

- SA：MOD-003 LayoutEngine
- SD：4.2 Blob 大小計算

---

## TASK-004：實作 BlobRenderer（MOD-004）

**類型**：FE
**估點**：3 SP
**里程碑**：M1 - MVP
**Labels**：`frontend`, `priority:high`, `blocked`
**前置任務**：#TASK-002, #TASK-003

### 描述

實作 blob DOM 的完整生命週期：
- `render(tasks, container)` → 清空並重繪
- `updateBlob(id)` → 局部更新樣式（顏色、完成態）
- 每個 blob 的 DOM 結構依 SD 4.3 規格
- 完成態：`class="blob done"`，background 覆蓋為 `var(--color-done)`
- 完成態顯示勾選 overlay

### 驗收標準

- [ ] Blob 位置（left, top）與 LayoutEngine 一致
- [ ] Blob 大小（width, height）是直徑（`2r`）
- [ ] `blobShape` 設定為 `border-radius`
- [ ] 完成態 blob 顏色變灰 + 顯示勾選 overlay
- [ ] `.blob-subtask-hint` 在有子任務時顯示（無時隱藏）
- [ ] hover 時 `transform: scale(1.04)`

### 參照

- SA：MOD-004 BlobRenderer
- SD：4.2 Blob CSS 樣式規格

---

## TASK-005：實作 ModalManager（MOD-005）

**類型**：FE
**估點**：3 SP
**里程碑**：M1 - MVP
**Labels**：`frontend`, `priority:high`, `blocked`
**前置任務**：#TASK-001

### 描述

實作 Modal 的生命週期與表單邏輯：
- `openAdd(parentId?)` / `openEdit(taskId)` / `close()`
- 表單驗證：title trim 後非空
- 重要度滑桿（1–5）即時更新顯示數字
- 編輯模式顯示刪除按鈕，刪除前 `confirm()` 確認

### 驗收標準

- [ ] 名稱為空送出時顯示錯誤，不關閉 Modal
- [ ] 編輯 Modal 帶入現有任務資料
- [ ] `Escape` 鍵可關閉 Modal（`dialog` 原生支援）
- [ ] 刪除按鈕只在編輯模式出現
- [ ] 滑桿值即時更新顯示

### 參照

- SA：MOD-005 ModalManager
- SD：4.3 Modal DOM 結構

---

## TASK-006：組裝 main.js（所有模組整合）

**類型**：FE
**估點**：2 SP
**里程碑**：M1 - MVP
**Labels**：`frontend`, `priority:high`, `blocked`
**前置任務**：#TASK-004, #TASK-005

### 描述

整合所有模組，實作完整的使用者事件流：
- 頁面載入 → `TaskStore._load()` → `BlobRenderer.render()`
- `+` 按鈕 → `ModalManager.openAdd()`
- Blob 長按 / 右鍵 → `ModalManager.openEdit(id)`
- Blob 完成按鈕 → `TaskStore.toggleDone(id)` → `BlobRenderer.updateBlob(id)`
- `tasks:changed` 事件 → 切換空狀態

### 驗收標準

- [ ] 完整 CRUD 流程在 1 分鐘內可完成
- [ ] 重整頁面後資料仍存在
- [ ] 空狀態在無任務時顯示、有任務時隱藏
- [ ] 無 console error

### 參照

- SA：所有模組（MOD-001 ~ MOD-007）

---

## TASK-007：空狀態 UI

**類型**：FE
**估點**：1 SP
**里程碑**：M1 - MVP
**Labels**：`frontend`, `priority:medium`
**前置任務**：#TASK-B02

### 描述

設計無任務時的引導畫面：視覺融入深色主題，簡短說明文字 + 「+ 新增第一個任務」按鈕。

### 驗收標準

- [ ] 無任務時顯示，有任務時隱藏
- [ ] 按鈕觸發 `ModalManager.openAdd()`

---

## M2 — 完整功能

---

## TASK-020：實作 SubtaskView（MOD-006）

**類型**：FE
**估點**：3 SP
**里程碑**：M2 - 完整功能
**Labels**：`frontend`, `priority:medium`, `blocked`
**前置任務**：#TASK-006

### 描述

實作子任務視圖的進入/返回邏輯：
- `enter(parentTask)` → 設定 `currentParentId`，渲染子任務 blob，顯示 breadcrumb
- `exit()` → 清除狀態，回到頂層視圖
- Breadcrumb 格式：`所有任務 › {parentTask.title}`

### 驗收標準

- [ ] 點擊有子任務的 blob 進入子任務視圖
- [ ] 無子任務的 blob 點擊開啟編輯 Modal（不進入子任務視圖）
- [ ] 子任務可新增/編輯/刪除/標記完成
- [ ] Breadcrumb 點擊返回主視圖
- [ ] 子任務 blob 無重要度/deadline 設定欄位

### 參照

- SA：MOD-006 SubtaskView

---

## TASK-021：父 blob 子任務提示文字

**類型**：FE
**估點**：2 SP
**里程碑**：M2 - 完整功能
**Labels**：`frontend`, `priority:medium`, `blocked`
**前置任務**：#TASK-020

### 描述

在父任務 blob 上顯示最近一筆未完成子任務的名稱。利用 `TaskStore.getNextSubtaskHint(parentId)` 取得，更新 `.blob-subtask-hint` 元素。

### 驗收標準

- [ ] 有未完成子任務時顯示提示文字
- [ ] 所有子任務完成時提示文字消失
- [ ] 文字過長時 `text-overflow: ellipsis` 截斷

---

## TASK-022：Blob 漂浮動畫

**類型**：FE
**估點**：1 SP
**里程碑**：M2 - 完整功能
**Labels**：`frontend`, `priority:medium`
**前置任務**：#TASK-004

### 描述

為每個 blob 加入緩慢漂浮的 CSS keyframe 動畫：
- 每個 blob 建立時隨機分配 `--float-duration`（5–8s）和 `--float-delay`（0–3s）
- 讓各 blob 晃動節奏不同，增加生命感

### 驗收標準

- [ ] 所有 blob 有漂浮動畫
- [ ] 各 blob 晃動節奏明顯不同（不同步）
- [ ] 動畫不影響 hover/click 互動

---

## TASK-023：ResizeObserver 視窗縮放重排

**類型**：FE
**估點**：2 SP
**里程碑**：M2 - 完整功能
**Labels**：`frontend`, `priority:medium`
**前置任務**：#TASK-003

### 描述

使用 `ResizeObserver` 監聽 `#blob-canvas` 大小變化，觸發 `LayoutEngine.calculate()` 重算，更新所有 blob 的 `style.left`、`style.top`（不重建 DOM）。加入 debounce（200ms）避免頻繁觸發。

### 驗收標準

- [ ] 縮放視窗後 blob 位置更新，不超出邊界
- [ ] Debounce 200ms，不每次 resize 都觸發
- [ ] 重排過程不閃爍（用 `transition: left 0.3s, top 0.3s`）

---

## M3 — Chrome Extension

---

## TASK-040：建立 manifest.json 並調整 CSP

**類型**：Infra
**估點**：3 SP
**里程碑**：M3 - Chrome Extension
**Labels**：`infrastructure`, `priority:low`, `blocked`
**前置任務**：全 M2 完成

### 描述

1. 建立 `manifest.json`（Manifest V3）
2. 將 `index.html` 中的 inline script 分拆為外部 `.js` 檔案（CSP 要求）
3. 移除所有 inline event handler

```json
{
  "manifest_version": 3,
  "name": "Blob Todo",
  "version": "1.0.0",
  "chrome_url_overrides": { "newtab": "index.html" },
  "permissions": ["storage"]
}
```

### 驗收標準

- [ ] `manifest.json` 通過 Chrome Extension 語法驗證
- [ ] 無 CSP 違規（無 inline script）
- [ ] 開發者模式可載入 Extension

---

## TASK-041：localStorage → chrome.storage.local

**類型**：FE
**估點**：2 SP
**里程碑**：M3 - Chrome Extension
**Labels**：`frontend`, `priority:low`, `blocked`
**前置任務**：#TASK-040

### 描述

⚠️ **注意**：`chrome.storage.local` 是非同步 API，需將 `TaskStore._load()` / `_save()` 改為非同步，並在整個應用初始化加入 `await`。

### 驗收標準

- [ ] 任務資料儲存在 `chrome.storage.local`（不再使用 localStorage）
- [ ] 重開 Chrome 後資料仍存在
- [ ] 非同步讀取完成前不渲染 blob（避免閃爍空白再出現）

---

## TASK-042：製作 Extension Icons

**類型**：FE
**估點**：1 SP
**里程碑**：M3 - Chrome Extension
**Labels**：`frontend`, `priority:low`
**前置任務**：無

### 描述

製作三種尺寸的 Extension icon（16×16、48×48、128×128），設計風格與 Blob Todo 深色有機風格一致。

### 驗收標準

- [ ] 三個尺寸的 PNG 圖示均已準備
- [ ] 在 Chrome Extension 管理頁面顯示正確

---

## TASK-043：手動驗證 Extension 完整功能

**類型**：Test
**估點**：2 SP
**里程碑**：M3 - Chrome Extension
**Labels**：`testing`, `priority:low`, `blocked`
**前置任務**：#TASK-041, #TASK-042

### 描述

以開發者模式載入 Extension 後，逐一驗證所有功能正常運作。

### 驗收標準

- [ ] 開啟新分頁顯示 Blob Todo
- [ ] 新增/編輯/刪除/完成任務
- [ ] 子任務視圖進入/返回
- [ ] 關閉/重開 Chrome 後資料保留
- [ ] 無 console error
- [ ] Blob 漂浮動畫正常
- [ ] 視窗縮放 blob 重排

---

*產出自 `plan-build` skill｜2026-05-09*
