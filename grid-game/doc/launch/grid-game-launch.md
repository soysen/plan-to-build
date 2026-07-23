# 交付筆記 (Launch Notes)

## 專案名稱：康威生命遊戲 (Conway's Game of Life)

- **交付日期**：2026-07-15
- **Git 分支**：`practice/grid-game`
- **資料夾位置**：`grid-game/`
- **交付狀態**：已確認並驗收通過

---

## 1. 功能清單 (Delivered Features)
- **核心演化引擎**：依康威生命遊戲四規則（孤單死、存活、過擠死、繁衍）進行狀態演進，並支持 **Toroidal Grid (環面棋盤)** 繞回計算。
- **網格與手勢畫圖**：30 x 30 網格，支持單擊切換 (Click-to-Toggle) 與滑鼠按住拖曳繪圖 (Drag-to-Draw)。
- **控制面板**：
  - **Start / Pause** 演化與世代計數。
  - **Step** 單步演化手動控制。
  - **Clear** 一鍵清空畫布。
  - **Random** 隨機 Initial State 分佈（30% 密度）。
  - **Speed Slider** 動態調整模擬速度 (1.2 ticks/s 到 20 ticks/s)。
- **美學視覺 (Aesthetics)**：
  - 深色星空背景，搭配亮青到霓虹綠的細胞漸層與外發光 (Neon Glow) 特效。
  - 控制面板使用 Glassmorphism 磨砂玻璃濾鏡與微光邊框。
- **效能防護 (Performance)**：
  - 使用 `React.memo` 阻斷無效重繪。
  - 利用 React Refs 與 `useCallback` 封裝完全穩定的 `[]` 點擊與拖曳事件，防止 stale closure 閉包過期。
  - 在 CSS 中將活細胞邊框改為 `1px solid transparent` 保持 Box Sizing 一致，防止 layout reflow 導致整個 Grid 被瀏覽器重繪。

---

## 2. 本地運行與驗證步驟
如果你未來需要在其他環境重新運行此練習，請遵循以下指令：

```bash
# 1. 進入獨立打包的資料夾
cd grid-game

# 2. 安裝相依套件
npm install

# 3. 執行 11 項單元測試，確保規則 100% 正確
npm run test

# 4. 啟動 Vite 開發伺服器
npm run dev
```
啟動後在瀏覽器開啟 [http://localhost:5173](http://localhost:5173) 即可驗收。
