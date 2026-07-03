---
name: code-review-and-quality
description: "執行多維度的程式碼審查。語意情境：當使用者表達「幫我 Review 這段 Code」、「檢查這支 PR 有沒有問題」或需要針對架構與效能全面評估時觸發。"
argument-hint: "描述要審查的程式碼範圍，例如：審查任務建立功能的 PR"
user-invocable: true
---

# 程式碼審查與品質

## 概覽

在程式碼合併前發現問題，而不是在生產環境中。良好的 code review 不只是找 bug，而是提升整體程式碼品質——從可讀性到安全性到架構設計。

## 適用時機

- 審查即將合併的 PR
- 在自己提交前做自我審查（self-review）
- 驗收新功能的實作品質
- 建立專案的程式碼風格基準

## 五維審查框架

```
1. CORRECTNESS   → 程式碼做了它應該做的事嗎？
2. READABILITY   → 程式碼清晰易懂嗎？
3. ARCHITECTURE  → 設計合理且可維護嗎？
4. SECURITY      → 有沒有安全漏洞？
5. PERFORMANCE   → 有沒有明顯的效能問題？
```

---

### 維度 1：正確性

```
□ 程式碼實作符合需求規格（spec）
□ 邊界條件（空值、空陣列、0、負數）有處理
□ 錯誤情況有適當的回傳值或例外拋出
□ 非同步操作正確處理（await、錯誤捕捉）
□ 競態條件（race conditions）已考慮
□ 測試涵蓋主要路徑與邊界案例
```

常見正確性問題：

```typescript
// ❌ 未處理 null/undefined
function getTaskTitle(task: Task) {
	return task.title.toUpperCase() // 若 task 為 null 會 crash
}

// ✅ 防禦性處理
function getTaskTitle(task: Task | null): string {
	if (!task) return "（未知任務）"
	return task.title.toUpperCase()
}

// ❌ 未 await async 操作
function saveTask(task: Task) {
	taskRepository.save(task) // 忘了 await！
	return {success: true}
}

// ✅ 正確 await
async function saveTask(task: Task) {
	await taskRepository.save(task)
	return {success: true}
}
```

---

### 維度 2：可讀性

```
□ 函式與變數命名清晰表達意圖
□ 函式專注於單一責任（< 50 行為佳）
□ 複雜邏輯有適當的說明（解釋「為什麼」，不是「做什麼」）
□ 沒有神奇數字（magic numbers），使用命名常數
□ 沒有無意義的縮寫或誤導性命名
```

```typescript
// ❌ 不清楚的命名
function proc(d: any[], f: boolean) {
  return d.filter(x => x.s === (f ? 1 : 0));
}

// ✅ 清晰的命名
function filterTasksByCompletionStatus(
  tasks: Task[],
  showCompleted: boolean
): Task[] {
  return tasks.filter(task => task.isDone === showCompleted);
}

// ❌ 神奇數字
if (tasks.length > 100) { ... }

// ✅ 命名常數
const MAX_TASKS_PER_PAGE = 100;
if (tasks.length > MAX_TASKS_PER_PAGE) { ... }
```

---

### 維度 3：架構

```
□ 關注點分離（UI / 業務邏輯 / 資料存取各自獨立）
□ 沒有不必要的複雜抽象（超前設計）
□ 遵循專案現有的設計模式與慣例
□ 沒有循環依賴
□ 函式與模組的職責邊界清晰
□ 沒有重複的程式碼（DRY，但不超前抽象）
```

```typescript
// ❌ 業務邏輯混入 UI 元件
function TaskList() {
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    fetch('/api/tasks')
      .then(r => r.json())
      .then(data => {
        // 業務邏輯在 UI 層
        const filtered = data.filter(t => !t.archived && t.ownerId === userId);
        setTasks(filtered);
      });
  }, []);
}

// ✅ 職責分離
function TaskList() {
  const { tasks } = useActiveTasks(userId); // 業務邏輯在 hook 中
  return <ul>...</ul>;
}
```

---

### 維度 4：安全性

```
□ 所有外部輸入在邊界處驗證
□ SQL/NoSQL 查詢使用參數化（無字串拼接）
□ 無敏感資料（金鑰、密碼）寫入程式碼或 log
□ API 端點有認證與授權檢查
□ 使用者只能存取自己的資源（水平權限控制）
□ HTML 輸出有正確的轉義（防 XSS）
```

```typescript
// ❌ SQL injection 風險
const user = await db.query(`SELECT * FROM users WHERE email = '${email}'`)

// ✅ 參數化查詢
const user = await db.query("SELECT * FROM users WHERE email = $1", [email])

// ❌ 回傳敏感欄位
return res.json(user) // 包含 passwordHash、resetToken

// ✅ 過濾敏感資料
const {passwordHash, resetToken, ...publicData} = user
return res.json(publicData)
```

---

### 維度 5：效能

```
□ 無 N+1 查詢問題
□ 資料庫查詢有分頁（無 findMany() 不帶 limit）
□ 無不必要的重複運算（迴圈中的昂貴操作）
□ React 元件無不必要的 re-render
□ 大量資料有適當的快取策略
```

```typescript
// ❌ N+1 查詢
const tasks = await db.tasks.findMany()
for (const task of tasks) {
	task.owner = await db.users.findUnique({where: {id: task.ownerId}})
}

// ✅ 一次查詢
const tasks = await db.tasks.findMany({
	include: {owner: true},
})

// ❌ 無分頁
const allTasks = await db.tasks.findMany() // 可能數千筆

// ✅ 分頁查詢
const tasks = await db.tasks.findMany({
	take: 20,
	skip: (page - 1) * 20,
})
```

---

## 審查輸出格式

提供清晰分類的審查意見：

```markdown
## Code Review 結果

### 🔴 必須修改（阻擋合併）

- `src/api/tasks.ts:42` — SQL 查詢未參數化，有 injection 風險
- `src/components/TaskList.tsx:18` — 未處理 tasks 為 null 的情況

### 🟡 建議改進（不阻擋，但應在近期處理）

- `src/services/taskService.ts:67` — N+1 查詢，建議使用 include
- `src/utils/format.ts:12` — 函式超過 80 行，可拆分

### 🟢 值得肯定

- 錯誤處理完整且一致
- 測試覆蓋率高，邊界案例齊全
- 命名清晰，可讀性高

### 📝 備忘

- 考慮在下個 sprint 加入 index 到 tasks.ownerId
```

## 驗證清單

審查完成後確認：

- [ ] 所有「必須修改」項目已處理
- [ ] 測試可以通過（`npm test`）
- [ ] lint 與 type-check 無錯誤
- [ ] 沒有 console.log 遺留在生產碼
- [ ] 沒有 TODO 應在本次 PR 完成卻未完成

## 紅旗訊號

- PR 超過 500 行變更（難以有效審查）
- 沒有測試的新功能
- `any` 型別隨意使用
- 直接操作 DOM 而不使用 React 狀態
- 提交訊息只寫「fix」或「update」
- 無 spec 或需求對應的程式碼變更
