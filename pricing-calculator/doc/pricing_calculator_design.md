# 🛠️ 資費方案智能比較計算器 - 技術設計說明書 (Technical Design)

本文件詳述「資費方案智能比較計算器」的架構設計、現代 CSS 選用策略、效能優化手段（Core Web Vitals）與無障礙實作方案。

---

## 1. 系統架構與狀態流程

本應用採用 **Vanilla TypeScript + 響應式資料流** 設計，避免框架（React/Vue）在狀態變更時帶來的虛擬 DOM 比對開銷。

### 📁 模組設計
```
src/
├── core/
│   ├── plans.ts         # 定義方案的介面 (Interface) 與 3 種資費靜態資料
│   └── calculator.ts    # 純粹的計算函數：輸入 (用量, 是否綁約) ➔ 輸出各方案費率細節
├── tests/
│   └── calculator.test.ts # 使用 Vitest 進行計費公式的單元測試
├── style.css            # 現代 CSS 變數、Glassmorphism、容器查詢、:has() 聯動
└── main.ts              # 監聽 DOM 事件、更新 DOM、處理 A11y 鍵盤與滑桿節流
```

### 🔄 狀態流向
1.  **使用者操作** 滑桿（數據/語音/簡訊）或勾選框（是否綁約）。
2.  **事件觸發**：`input` 監聽器被喚醒，取得最新用量數據。
3.  **計算核心**：呼叫 `calculateTariff(usage, isContracted)` 進行計算，回傳各方案的總花費與超額細分。
4.  **DOM 渲染**：計算最划算方案，一次性批量更新 UI 的金額與高亮邊框。

---

## 2. 現代 CSS 實作策略

我們將採用 CSS 最新主流特性（Baseline Widely Available）來實作無 JS 介入的元件樣式切換：

### A. 磨砂玻璃 (Glassmorphism) 設計系統
定義專屬的設計 Token (CSS 變數)：
```css
:root {
  --bg-app: radial-gradient(circle at center, #16182c 0%, #0b0d19 100%);
  --bg-card: rgba(255, 255, 255, 0.03);
  --border-card: 1px solid rgba(255, 255, 255, 0.08);
  --glass-blur: blur(12px);
  --color-primary: #6366f1; /* 靛藍 */
  --color-accent: #a855f7;  /* 紫色 */
}
```

### B. CSS Container Queries (容器查詢)
為方案卡片設定「容器類型」，讓卡片在外層 Grid 縮小或被丟入側邊欄時，能自動改變自身排版：
```css
/* 設定卡片容器 */
.plan-card-wrapper {
  container-type: inline-size;
  container-name: plan-card;
}

/* 預設窄卡片 (直排) */
.plan-card {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

/* 當卡片容器寬度大於 400px 時 (自動展開為橫排) */
@container plan-card (min-width: 400px) {
  .plan-card {
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }
  .plan-details {
    margin-block-start: 0;
  }
}
```

### C. CSS `:has()` 選擇器狀態聯動
我們不透過 JS 去為選中的卡片添加 `.active` 或為其他卡片加上 `.dimmed`，而是直接利用 `:has()` 選擇器：
```css
/* 當列表內有任何一個方案被勾選時，將「沒有被選中」的卡片透明度調低 */
.plan-list:has(.plan-checkbox:checked) .plan-card:not(:has(.plan-checkbox:checked)) {
  opacity: 0.55;
  filter: grayscale(15%) blur(0.5px);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* 為被選中的卡片套用發光邊框 */
.plan-card:has(.plan-checkbox:checked) {
  border-color: var(--color-primary);
  background: rgba(99, 102, 241, 0.06);
  box-shadow: 0 0 25px rgba(99, 102, 241, 0.2);
}
```

---

## 3. 效能優化 (INP < 100ms & LCP < 1.2s)

### A. 透過 `requestAnimationFrame` 進行滑桿事件節流 (INP 優化)
頻繁滑動滑桿會產生高頻率的 `input` 事件，如果每次事件都立刻更新 DOM，會造成畫面掉幀與主執行緒卡頓。我們將使用 `requestAnimationFrame` 進行排程優化：
```typescript
let updatePending = false;

function onSliderInput() {
  if (updatePending) return;
  updatePending = true;
  
  // 安排在下一次瀏覽器繪製前執行更新
  requestAnimationFrame(() => {
    updateCalculatorUI();
    updatePending = false;
  });
}
```

### B. 避免 Layout Thrashing (版面配置抖動)
在更新介面時，嚴格遵守「先讀後寫」的原則：
1.  **Read Phase**：一次讀取所有輸入滑桿的最新數值。
2.  **Calculate Phase**：在記憶體中進行計費運算。
3.  **Write Phase**：一次性把所有計算出來的費用文字寫入 DOM，絕不在寫入 DOM 後又立刻讀取其高度或尺寸（避開 Reflow / 重排）。

---

## 4. 無障礙設計 (Accessibility)

1.  **鍵盤無障礙與 Focus 環**：
    *   方案卡片的「加入對比」勾選框，我們使用 CSS 將原生 `<input type="checkbox">` 隱藏，但將其外層的 `<label>` 的 tabindex 設為 `0`，使其能被鍵盤聚焦。
    *   監聽 `KeyDown` 事件，若使用者按下 `Space` 或 `Enter`，則動態切換該勾選框的 `checked` 狀態。
    *   全域設定 `:focus-visible`：
        ```css
        *:focus-visible {
          outline: 2px solid var(--color-accent);
          outline-offset: 4px;
        }
        ```
2.  **語意與螢幕閱讀器友善**：
    *   每個輸入滑桿皆對齊一個 `<label>` 並使用 `for` 屬性與 input ID 綁定。
    *   最划算的推薦方案，除了視覺高亮，DOM 上會加入 `aria-live="polite"`，以在數值改變時主動告知語音使用者最新推薦。
