# Blob Todo Refactor 規格書

**版本**：v0.1  
**建立日期**：2026-05-11  
**最後更新**：2026-05-11  
**作者**：Antigravity (AI Agent)  
**狀態**：草稿

---

## 1. 利害關係人地圖（Stakeholders）

| 姓名/角色 | 角色 | 職責 |
| --------- | ---- | ---- |
| User | 決策者（Decider） | 對技術選型與視覺表現有最終核可權 |
| Antigravity | 實作者 | 執行重構、確保功能不倒退 |

---

## 2. 專案概述（Executive Summary）

將 Blob Todo 現有的自定義物理引擎（Verlet Integration）重構為 **Matter.js** 物理引擎。旨在提升碰撞偵測的穩定性、減少重疊時的穿透現象，並為未來更複雜的物理互動（如引力、約束力）打下基礎，同時保持原有的有機（Organic）液態視覺風格。

---

## 3. 背景與動機（Background & Motivation）

**現況問題：**
- 目前使用自定義的 `VerletPoint` 與 `SoftBlob` 類別處理物理，碰撞邏輯（MOD-003, MOD-004）相對簡單，當泡泡數量增多或快速移動時，容易產生不自然的抖動或穿透。
- 體積補償與斥力邏輯是手動計算的，擴充性較低。
- 缺乏成熟的約束（Constraints）系統，難以實現更複雜的形變效果。

**機會或驅動力：**
- **Matter.js** 是成熟的 2D 物理引擎，內建高效的碰撞偵測與求解器。
- Matter.js 的 `Composite` 與 `Constraint` 可以更輕鬆地模擬軟體（Soft Body）。
- 重構後可簡化 `app.js` 中的物理邏輯，讓代碼更易於維護。

---

## 4. 目標與非目標（Goals & Non-goals）

### 目標（Goals）
- [ ] **物理引擎遷移**：完全移除自定義的 `VerletPoint` 邏輯，改用 Matter.js 的 `Engine` 與 `World`。
- [ ] **視覺效果保持**：保留 Gooey（有機液態）的渲染風格，泡泡需具備形變與蠕動感。
- [ ] **功能無損**：確保新增、編輯、刪除、拖拽、完成任務等功能在 Matter.js 環境下正常運作。
- [ ] **效能優化**：利用 Matter.js 的空間分割技術提升大量泡泡時的流暢度。

### 非目標（Non-goals）
- **UI 框架變更**：本次不更換 HTML/Vanilla JS 框架。
- **後端整合**：不涉及 API 或伺服器端的變更。
- **全新的 3D 效果**：仍維持 2D Canvas 表現。

---

## 5. 使用者與情境（Users & Use Cases）

| 角色 | 描述 | 主要需求 |
| ---- | ---- | -------- |
| 使用者 | 想要管理任務的普通用戶 | 穩定、流暢且具有趣味性的物理互動 |

### 使用情境（Use Cases）

**UC-001：物理互動（碰撞與拖拽）**
- **主要流程**：
  1. 使用者拖拽一個泡泡。
  2. 泡泡與其他泡泡碰撞。
  3. 泡泡根據物理規律發生形變並推開其他泡泡。
- **預期結果**：碰撞反應自然，無明顯穿透 or 抖動。

---

## 6. 功能需求（Functional Requirements）

| ID       | 需求描述 | 優先序 | 相依 | 備註 |
| -------- | -------- | ------ | ---- | ---- |
| REQ-F001 | 整合 Matter.js 函式庫 | 🔴 | - | |
| REQ-F002 | 使用 Matter.js 實作 Soft Body 泡泡 | 🔴 | REQ-F001 | |
| REQ-F003 | 泡泡渲染邏輯適配 Matter.js 狀態 | 🔴 | REQ-F002 | |
| REQ-F004 | 重新實作拖拽互動（MouseConstraint） | 🔴 | REQ-F001 | |
| REQ-F005 | 保持 Gooey 濾鏡與 Canvas 渲染品質 | 🔴 | - | |

---

## 7. 技術考量（Technical Considerations）

### 技術棧建議

| 層次 | 技術選項 | 理由 |
| ---- | ---- | ---- |
| 物理引擎 | Matter.js | 功能強大、文件豐富、社群支援度高 |
| 渲染 | Canvas API | 與 Matter.js 完美結合，適合自定義渲染邏輯 |

### 整合與相依
- 需要在 `index.html` 引入 `matter-js`。
- 需將 Matter.js 的 Body 座標映射到 `SoftBlob` 的渲染點。

---

## 8. 風險與假設（Risks & Assumptions）

### 假設
- Matter.js 在處理大量 Soft Body 時仍能保持 60fps。
- 使用者同意暫時不支援舊版瀏覽器（需支援 ES6+）。

### 風險
| 風險描述 | 影響 | 可能性 | 緩解策略 |
| -------- | ---- | ------ | -------- |
| Soft Body 效能問題 | 高 | 中 | 限制每個泡泡的物理頂點數量，使用近似圓形 |
| 視覺感官差異 | 中 | 中 | 精細調校 Constraint 的 Stiffness 與 Damping |

---

## 9. 開放性問題（Open Questions）

| # | 問題 | 負責人 | 狀態 |
| - | ---- | ------ | ---- |
| Q1 | 是否需要引入 Matter.js 的完整版還是輕量版？ | Antigravity | ✅ 已解決 (完整版) |
| Q2 | 泡泡內的文字渲染是否繼續使用 `ctx.fillText`？ | Antigravity | ✅ 已解決 (改用 DOM Overlay) |

---

## 10. 修訂記錄

| 版本 | 日期 | 修改人 | 變更說明 |
| ---- | ---- | ------ | -------- |
| v0.1 | 2026-05-11 | Antigravity | 初稿建立 |
| v0.2 | 2026-05-11 | Antigravity | 根據使用者回饋更新：使用完整版 Matter.js、不限制泡泡數量、改用 DOM Overlay 渲染文字 |
