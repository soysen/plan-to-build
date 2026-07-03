---
name: frontend-ui-engineering
description: "建構生產品質的使用者介面。語意情境：當使用者表達「幫我刻這個 UI」、「畫面跑版了需要調整」、「製作響應式元件」時觸發。"
argument-hint: "描述要建置的 UI 功能，例如：建置任務列表元件，包含篩選和空狀態"
user-invocable: true
---

# 前端 UI 工程

## 概覽

建構生產品質的使用者介面——可存取、效能良好且視覺精緻。目標是 UI 看起來像由具備設計意識的工程師在頂尖公司建置的，而非 AI 生成的。這意味著真正遵循設計系統、正確的 accessibility、有意義的互動模式，以及不使用通用的「AI 美學」。

## 適用時機

- 建置新的 UI 元件或頁面
- 修改現有的使用者介面
- 實作響應式版面
- 加入互動性或狀態管理
- 修復視覺或 UX 問題

---

## 元件架構

### 檔案結構

將相關內容放在一起：

```
src/components/
  TaskList/
    TaskList.tsx          # 元件實作
    TaskList.test.tsx     # 測試
    TaskList.stories.tsx  # Storybook 故事（如果有用）
    use-task-list.ts      # 自訂 hook（如果狀態複雜）
    types.ts              # 元件專用型別（如果需要）
```

### 元件模式

**優先使用組合而非設定：**

```tsx
// ✅ 可組合
<Card>
  <CardHeader><CardTitle>任務</CardTitle></CardHeader>
  <CardBody><TaskList tasks={tasks} /></CardBody>
</Card>

// ❌ 過度設定
<Card title="任務" headerVariant="large" content={<TaskList tasks={tasks} />} />
```

**分離資料取得與呈現：**

```tsx
// Container：處理資料
export function TaskListContainer() {
	const {tasks, isLoading, error} = useTasks()

	if (isLoading) return <TaskListSkeleton />
	if (error) return <ErrorState message="無法載入任務" />
	if (tasks.length === 0) return <EmptyState message="尚無任務" />

	return <TaskList tasks={tasks} />
}

// Presentation：處理呈現
export function TaskList({tasks}: {tasks: Task[]}) {
	return (
		<ul role="list" className="divide-y">
			{tasks.map(task => (
				<TaskItem key={task.id} task={task} />
			))}
		</ul>
	)
}
```

---

## 狀態管理

選擇最簡單可行的方案：

```
local state (useState)      → 元件專用 UI 狀態
lifted state                → 2-3 個兄弟元件共用
Context                     → Theme、auth、locale（多讀少寫）
URL state (searchParams)    → 篩選、分頁、可分享的 UI 狀態
Server state (React Query)  → 遠端資料（帶快取）
Global store (Zustand)      → 複雜的 client 全域狀態
```

**避免 prop drilling 超過 3 層。** 如果 props 通過不使用它們的元件傳遞，引入 context 或重構元件樹。

---

## 設計系統遵循

### 避免 AI 美學

AI 生成 UI 有可辨識的模式，全部都要避免：

| AI 預設                 | 問題                  | 生產品質                     |
| ----------------------- | --------------------- | ---------------------------- |
| 紫色/靛藍色系           | 讓所有 app 看起來相同 | 使用專案實際的色彩系統       |
| 過多漸層                | 視覺噪音              | 使用設計系統的漸層（或不用） |
| 圓角全開（rounded-2xl） | 忽略設計層次          | 使用設計系統的 border-radius |
| 到處都是大 padding      | 破壞視覺層次          | 使用一致的間距比例           |

### 間距與版面

使用一致的間距比例，不要發明值：

```css
/* ✅ 使用比例（0.25rem 為單位或專案定義的值）*/
padding: 1rem; /* 16px */
gap: 0.75rem; /* 12px */

/* ❌ 發明值 */
padding: 13px;
margin-top: 2.3rem;
```

---

## Accessibility（WCAG 2.1 AA）

每個元件都必須符合這些標準：

### 鍵盤導航

```tsx
// ✅ 使用 <button>（天然可聚焦）
<button onClick={handleClick}>點擊我</button>

// ❌ 不可聚焦的 div（避免使用）
<div onClick={handleClick}>點擊我</div>
```

### ARIA 標籤

```tsx
// 為沒有可見文字的互動元素加上標籤
<button aria-label="關閉對話框"><XIcon /></button>

// 表單輸入
<label htmlFor="email">電子郵件</label>
<input id="email" type="email" />
```

### 有意義的空狀態和錯誤狀態

```tsx
function TaskList({tasks}: {tasks: Task[]}) {
	if (tasks.length === 0) {
		return (
			<div role="status" className="text-center py-12">
				<TasksEmptyIcon className="mx-auto h-12 w-12 text-muted" />
				<h3 className="mt-2 text-sm font-medium">沒有任務</h3>
				<p className="mt-1 text-sm text-muted">建立第一個任務開始使用。</p>
				<Button className="mt-4" onClick={onCreateTask}>
					建立任務
				</Button>
			</div>
		)
	}
	return <ul role="list">...</ul>
}
```

---

## 響應式設計

從行動裝置優先，再往上擴展：

```tsx
// Tailwind：行動優先的響應式
<div className="
  grid grid-cols-1      /* 行動：單欄 */
  sm:grid-cols-2        /* 小螢幕：2 欄 */
  lg:grid-cols-3        /* 大螢幕：3 欄 */
  gap-4
">
```

測試斷點：320px、768px、1024px、1440px。

---

## 載入與過渡

```tsx
// Skeleton 載入（不用 spinner 來等待內容）
function TaskListSkeleton() {
	return (
		<div className="space-y-3" aria-busy="true" aria-label="載入任務中">
			{Array.from({length: 3}).map((_, i) => (
				<div key={i} className="h-12 bg-muted animate-pulse rounded" />
			))}
		</div>
	)
}
```

---

## 驗證清單

建置 UI 後確認：

- [ ] 元件無 console 錯誤
- [ ] 所有互動元素可用鍵盤操作（Tab 遍歷頁面）
- [ ] 螢幕閱讀器可傳達頁面內容和結構
- [ ] 響應式：在 320px、768px、1024px、1440px 下正常
- [ ] 載入、錯誤、空狀態都有處理
- [ ] 遵循專案設計系統（間距、顏色、字型）
- [ ] 無 accessibility 警告

## 紅旗訊號

- 超過 200 行的元件（拆分它）
- inline styles 或任意 pixel 值
- 缺少錯誤狀態、載入狀態或空狀態
- 沒有測試鍵盤導航
- 以顏色作為唯一的狀態指示（紅/綠沒有文字或圖示）
- 通用的 AI 外觀（紫色漸層、超大 padding、模板式版面）
