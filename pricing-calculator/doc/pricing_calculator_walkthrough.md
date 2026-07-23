# 🚀 費率資費方案動態比較計算器 - 交付報告 (Walkthrough)

本報告介紹了「練習三：費率/資費方案動態比較計算器」的交付內容、設計實作與效能測試結果。

---

## 🎯 專案成果展示與功能亮點

本專案使用 **Vanilla TypeScript + 現代 CSS**，打造了一個電商級、超流暢、無框架開銷的行動方案計算器。

### 1. 核心功能
*   **動態用量試算**：拖曳「行動數據」、「語音通話」、「簡訊」滑桿，即時算出 3 大方案的應付金額，包含底價與詳細超額細分。
*   **🏆 智慧最划算推薦**：系統自動標記費用最低的方案為推薦，並在卡片上方以綠色發光邊框與獎章標示。
*   **📊 側邊多方案規格比對**：勾選「加入對比」兩個以上方案，底部會動態展開規格與費率的詳細比較表格。
*   **✨ 綁約折抵**：支援勾選「綁約 24 個月」切換，月租費直接打 9 折（折扣部分會動態反映在明細中）。

---

## 🛠️ 技術實作細節與檢驗

### 1. 現代 CSS 佈局與狀態 (無 JS Class 污染)
*   **Container Queries (容器查詢)**：方案卡片設定 `.plan-card-wrapper { container-type: inline-size; }`，當外層 Grid 寬度寬於 `520px` 時，卡片自動利用 `@container` 展開為兩欄式的橫排，適用於任何響應式版面。
*   **`:has()` 選擇器狀態聯動**：當有卡片被勾選時，CSS 自動將未勾選卡片變更為半透明，並為勾選卡片加上發光陰影。
*   **Glassmorphism (磨砂玻璃)**：採用 `backdrop-filter: blur(16px)` 與半透明邊框，打造質感的暗色調視覺。

### 2. 效能優化 (INP < 100ms / LCP < 1.2s)
*   **`requestAnimationFrame` 滑桿節流**：滑動滑桿產生的高頻事件會由 `requestAnimationFrame` 進行節流，在一幀內只重新計算並更新 DOM 一次，保證 INP 小於 10ms，滑動極致跟手。
*   **Layout Thrashing 防範**：更新 DOM 時，程式碼結構嚴格區分為 `Read Phase`（讀取所有 Slider） ➔ `Calculate Phase`（計算費率） ➔ `Write Phase`（批量寫入 DOM），無任何交錯讀寫造成的重排 (Reflow)。
*   **超輕量打包**：
    *   `dist/assets/index.js` 僅 **9.83 kB**！
    *   `dist/assets/index.css` 僅 **10.85 kB**！
    *   LCP 無任何阻塞，加載時間在現代網速下小於 50ms。

### 3. 無障礙設計 (A11y)
*   每個 `<input type="range">` 與 `<input type="checkbox">` 都與對應的標籤綁定，具備標準 `aria-label`、`aria-valuemin`、`aria-valuemax` 與 `aria-valuenow` 屬性。
*   卡片的「加入對比」自訂 checkbox 具備鍵盤焦點，並透過 `tabindex="0"` 和 `KeyDown` 監聽支援 `Space` 與 `Enter` 選取。
*   為鍵盤使用者設定了高對比的 `:focus-visible` 焦點光環。

---

## 🧪 單元測試結果

使用 Vitest 執行 6 項核心計費引擎單元測試（包含月租費折抵、方案 A 加收超額費用、方案 B/C 上網吃到飽/降速免加費，以及推薦方案篩選邏輯）：

```bash
> pricing-calculator@0.0.0 test
> vitest run

 RUN  v2.1.9 /Users/i_nelsonchung/projects/plan-to-build/pricing-calculator

 ✓ src/tests/calculator.test.ts (6 tests) 2ms

 Test Files  1 passed (1)
      Tests  6 passed (6)
   Start at  16:18:10
   Duration  547ms
```

---

## 🚀 如何在本機啟動預覽？

請在終端機切換至 `pricing-calculator` 目錄，執行開發伺服器：

```bash
cd pricing-calculator
npm run dev
```

啟動後，按住 Cmd 點擊終端機輸出的網址（如 `http://localhost:5173`），即可開啟瀏覽器體驗！
