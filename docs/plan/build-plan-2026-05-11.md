# Build Plan: 自然彈簧泡泡 (Spring-Physics + Canvas)

## 1. 估點統計
| 里程碑 | 任務數 | 總估點 | 說明 |
| --- | --- | --- | --- |
| M1: 基礎建設 | 2 | 2 | Canvas 環境與舊代碼清理 |
| M2: 物理引擎 | 2 | 6 | 實作 Spring 斥力與漂浮算法 |
| M3: 渲染與同步 | 2 | 5 | Canvas 繪圖與 DOM Overlay 同步 |
| M4: 調優拋光 | 1 | 2 | 參數調校 (Stiffness, Damping) |
| **總計** | **7** | **15** | |

## 2. 任務列表

| ID | 類型 | 優先序 | 估點 | 前置任務 | 說明 |
| --- | --- | --- | --- | --- | --- |
| TASK-001 | Infra | 🔴 | 1 | - | 修改 `index.html`，建立 `<canvas>` 與 SVG Gooey Filter 定義。 |
| TASK-002 | FE | 🔴 | 3 | TASK-001 | 實作 `SpringPhysicsEngine` 基礎循環 (acc, vel, pos)。 |
| TASK-003 | FE | 🔴 | 3 | TASK-002 | 實作 `RepulsionLogic`：計算泡泡間的彈簧受力與邊界碰撞。 |
| TASK-004 | FE | 🔴 | 3 | TASK-003 | 實作 `CanvasRenderer`：繪製帶漸層的圓形，支援動態 Scaling。 |
| TASK-005 | FE | 🟡 | 2 | TASK-004 | 實作 `DOMOverlay` 同步：將任務標籤與按鈕映射至物理座標。 |
| TASK-006 | FE | 🟡 | 2 | TASK-002 | 實作 `BrownianDrift`：添加隨機擾動力場模擬流體感。 |
| TASK-007 | FE | 🟢 | 1 | TASK-004 | 精細調校物理參數，確保「水面波紋/彈簧」的手感。 |
