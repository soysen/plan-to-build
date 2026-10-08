---
name: performance-optimization
description: "優化應用程式效能。語意情境：當使用者表達「網站載入好慢」、「畫面卡卡的」、「Core Web Vitals 分數太低需要優化」時觸發。"
argument-hint: "描述要優化的效能問題，例如：首頁 LCP 超過 4 秒，需要優化"
user-invocable: true
---

# 效能優化

## 概覽

先測量，再優化。沒有測量的效能工作只是猜測——而猜測往往導致增加複雜度卻不改善使用者體驗。先分析，找出真正的瓶頸，修復它，再次測量。只優化測量結果顯示確實有問題的地方。

## 適用時機

- 規格中有效能需求（載入時間預算、回應時間 SLA）
- 使用者或監控系統回報緩慢
- Core Web Vitals 低於標準
- 懷疑某個變更引入了回歸
- 建置處理大量資料或高流量的功能

**不適用時機：** 在有問題的證據之前不要優化。過早優化增加了比效能收益更多的複雜度。

## Core Web Vitals 目標

| 指標                        | 良好    | 需改進  | 不佳    |
| --------------------------- | ------- | ------- | ------- |
| **LCP**（最大內容繪製）     | ≤ 2.5s  | ≤ 4.0s  | > 4.0s  |
| **INP**（互動到下一次繪製） | ≤ 200ms | ≤ 500ms | > 500ms |
| **CLS**（累積版面偏移）     | ≤ 0.1   | ≤ 0.25  | > 0.25  |

## 優化工作流程

```
1. MEASURE  → 建立有真實資料的基準線
2. IDENTIFY → 找出真正的瓶頸（不是假設的）
3. FIX      → 解決具體的瓶頸
4. VERIFY   → 再次測量，確認改善
5. GUARD    → 加入監控或測試防止回歸
```

---

### Step 1：測量

**前端（兩種互補方式，兩者都用）：**

```bash
# 合成測量：Lighthouse（可重現，適合 CI 回歸偵測）
# Chrome DevTools → Lighthouse → 執行報告

# 真實使用者監控（RUM）
import { onLCP, onINP, onCLS } from 'web-vitals';
onLCP(console.log);
onINP(console.log);
onCLS(console.log);
```

**後端：**

```typescript
// 簡單計時
console.time('db-query');
const result = await db.query(...);
console.timeEnd('db-query');

// 生產環境：APM 工具（Datadog、New Relic 等）
```

---

### Step 2：找出瓶頸

根據症狀決定先測量什麼：

```
問題是什麼？
├── 首頁載入慢
│   ├── Bundle 太大？ → 測量 bundle size，檢查 code splitting
│   ├── 伺服器回應慢？ → 看 DevTools Network 的 TTFB
│   └── 渲染阻塞資源？ → 看 Network waterfall 的 CSS/JS 阻塞
├── 互動感覺遲緩
│   ├── UI 在點擊時凍結？ → 分析主執行緒，找長任務（>50ms）
│   └── 表單輸入延遲？ → 檢查 re-render、controlled component 開銷
├── 頁面切換後資料載入
│   └── API 回應時間？ → 測量端點回應時間，檢查 N+1
└── 後端 / API
    ├── 單一端點慢？ → 分析資料庫查詢，檢查索引
    └── 所有端點慢？ → 檢查連線池、記憶體、CPU
```

---

### Step 3：修復常見反模式

**N+1 查詢（後端）**

```typescript
// ❌ N+1：每個任務一次查詢
const tasks = await db.tasks.findMany()
for (const task of tasks) {
	task.owner = await db.users.findUnique({where: {id: task.ownerId}})
}

// ✅ 單一查詢含 join
const tasks = await db.tasks.findMany({
	include: {owner: true},
})
```

**無邊界的資料查詢**

```typescript
// ❌ 取得所有記錄
const allTasks = await db.tasks.findMany()

// ✅ 分頁查詢
const tasks = await db.tasks.findMany({
	take: 20,
	skip: (page - 1) * 20,
	orderBy: {createdAt: "desc"},
})
```

**不必要的 React Re-render**

```tsx
// ❌ 每次 render 創建新物件，導致子元件 re-render
function TaskList() {
	return <TaskFilters options={{sortBy: "date", order: "desc"}} />
}

// ✅ 穩定的引用
const DEFAULT_OPTIONS = {sortBy: "date", order: "desc"} as const
function TaskList() {
	return <TaskFilters options={DEFAULT_OPTIONS} />
}

// 對昂貴元件使用 React.memo
const TaskItem = React.memo(function TaskItem({task}: Props) {
	return <div>{/* 複雜渲染 */}</div>
})
```

**Bundle Size 過大**

```typescript
// ✅ 路由層級的 code splitting
const SettingsPage = lazy(() => import('./pages/Settings'));

function App() {
  return (
    <Suspense fallback={<Spinner />}>
      <SettingsPage />
    </Suspense>
  );
}
```

**缺少快取（後端）**

```typescript
// 快取頻繁讀取、很少變動的資料
const CACHE_TTL = 5 * 60 * 1000 // 5 分鐘
let cachedConfig: AppConfig | null = null
let cacheExpiry = 0

async function getAppConfig(): Promise<AppConfig> {
	if (cachedConfig && Date.now() < cacheExpiry) {
		return cachedConfig
	}
	cachedConfig = await db.config.findFirst()
	cacheExpiry = Date.now() + CACHE_TTL
	return cachedConfig
}
```

---

### Step 4：設定效能預算

```
JavaScript bundle：< 200KB（gzip，初始載入）
CSS：< 50KB gzip
圖片：< 200KB 每張（首屏以上）
API 回應時間：< 200ms（p95）
首次互動時間：< 3.5s（4G 網路）
Lighthouse 效能分數：≥ 90
```

**在 CI 中強制執行：**

```bash
# Bundle size 檢查
npx bundlesize --config bundlesize.config.json

# Lighthouse CI
npx lhci autorun
```

---

## 驗證清單

效能相關變更後確認：

- [ ] 有變更前後的測量數據（具體數字）
- [ ] 找出並解決了具體的瓶頸
- [ ] Core Web Vitals 在「良好」門檻內
- [ ] Bundle size 無顯著增加
- [ ] 新的資料查詢程式碼中沒有 N+1
- [ ] 效能預算在 CI 中通過（如果已設置）
- [ ] 現有測試仍通過（優化沒有破壞行為）

## 紅旗訊號

- 沒有分析資料就進行優化
- 列表端點沒有分頁
- 圖片沒有尺寸、懶載入或響應式大小
- Bundle size 增加沒有審查
- 生產環境沒有效能監控
- 到處都加 `React.memo` 和 `useMemo`（過度使用和不用一樣糟糕）

## 常見合理化藉口

| 藉口                 | 現實                                               |
| -------------------- | -------------------------------------------------- |
| 「我們之後再優化」   | 效能債會複利。現在修明顯的反模式，之後再做微優化   |
| 「在我的機器上很快」 | 你的機器不是使用者的機器。在代表性硬體和網路上分析 |
| 「這個優化很明顯」   | 如果你沒有測量，你不知道。先分析                   |
| 「框架會處理效能」   | 框架防止一些問題，但修不了 N+1 查詢或超大 bundle   |
