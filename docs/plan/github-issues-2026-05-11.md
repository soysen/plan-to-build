# GitHub Issues: 自然彈簧泡泡 (Spring-Physics + Canvas)

## TASK-001：Canvas 基礎建設與 SVG 濾鏡
**類型**：Infra
**估點**：1 SP
**里程碑**：M1
**Labels**：`infrastructure`, `priority:high`

### 描述
1. 在 `index.html` 加入 SVG Gooey Filter 定義（含 GaussianBlur 與 ColorMatrix）。
2. 將 `<main id="blob-canvas">` 替換為 `<canvas id="blob-canvas">`。
3. 在 `style.css` 移除不再需要的舊 DOM 泡泡樣式，保留彈性容器與 Filter 應用。

---

## TASK-002：實作 SpringPhysicsEngine 基礎
**類型**：FE
**估點**：3 SP
**里程碑**：M2
**Labels**：`frontend`, `priority:high`

### 描述
1. 建立 `PhysicsEngine` 類別。
2. 實作 `update()` 方法，應用歐拉積分 (Euler Integration) 更新 `pos += vel`, `vel += acc`。
3. 實作 `damping` 邏輯，每幀按比例衰減速度。

---

## TASK-003：實作彈簧斥力與邊界
**類型**：FE
**估點**：3 SP
**里程碑**：M2
**Labels**：`frontend`, `priority:high`

### 描述
1. 在物理循環中加入雙重迭代，檢查泡泡間的距離。
2. 根據重疊量計算彈簧斥力：`F = stiffness * (targetDist - currentDist)`。
3. 實作邊界彈性反彈，防止泡泡移出畫布。

---

## TASK-004：實作 CanvasRenderer
**類型**：FE
**估點**：3 SP
**里程碑**：M3
**Labels**：`frontend`, `priority:high`

### 描述
1. 建立渲染循環 (requestAnimationFrame)。
2. 使用 Canvas 繪製圓形，並應用 `createRadialGradient` 實現有機質感。
3. 根據當前速度向量對泡泡進行輕微的 Scale 形變（拉長效果）。
