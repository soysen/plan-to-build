---
name: debugging-and-error-recovery
description: 系統性地診斷並修復錯誤。使用時機：遇到 bug、測試失敗、執行期錯誤、建置失敗，或需要理解意外行為時。觸發關鍵字：bug、debug、錯誤、error、exception、crash、失敗、not working、異常行為、追蹤問題。
argument-hint: "描述遇到的錯誤或問題，例如：任務建立後頁面空白，Console 顯示 TypeError"
user-invocable: true
---

# 除錯與錯誤恢復

## 概覽

系統性地找出並修復錯誤。憑直覺猜測和隨機修改程式碼是最慢的除錯方式——它浪費時間、製造更多 bug，而且往往掩蓋問題而非解決問題。正確的流程：重現 → 定位 → 縮小範圍 → 修復 → 防守 → 驗證。

## 適用時機

- 測試失敗且不清楚原因
- 執行期出現未預期的錯誤或崩潰
- 功能行為與預期不符
- 建置或 lint 失敗
- 效能突然下降

## 除錯流程

```
1. REPRODUCE → 可靠地重現問題
2. LOCALIZE  → 縮小問題範圍
3. REDUCE    → 找到最小重現案例
4. FIX       → 解決根本原因（非症狀）
5. GUARD     → 加入測試防止再次發生
6. VERIFY    → 確認問題已解決且沒有引入新問題
```

---

### Phase 1：重現問題

**在嘗試修復之前，先確保你可以穩定重現問題。**

```
重現清單：
□ 問題可以被重現（不是偶發性）
□ 知道觸發問題的精確步驟
□ 知道「預期行為」和「實際行為」的差異
□ 知道問題最早何時出現（特定 commit？特定操作後？）
```

收集必要資訊：

```bash
# 查看完整錯誤訊息（不要截斷）
# 查看 stack trace 的第一個「你的程式碼」行（不是框架內部）
# 記錄觸發條件：特定輸入值、特定狀態、特定環境？
```

---

### Phase 2：定位問題範圍

從錯誤訊息出發，系統性縮小範圍：

**讀取 stack trace**

```
TypeError: Cannot read properties of undefined (reading 'id')
    at TaskService.findById (src/services/taskService.ts:42)  ← 你的程式碼
    at TaskController.getTask (src/controllers/task.ts:18)
    at Layer.handle [as handle_request] (express/lib/router/layer.js:95)

→ 問題在 taskService.ts 第 42 行：嘗試讀取 undefined 的 .id 屬性
→ 檢查：db.tasks.findUnique() 回傳 null 時，程式碼有處理嗎？
```

**二分搜索定位**

```typescript
// 如果問題來源不明，用 console.log 二分法
async function processTask(taskId: string) {
	console.log("processTask called with:", taskId) // ← 第一個

	const task = await db.tasks.findUnique({where: {id: taskId}})
	console.log("task from DB:", task) // ← 確認這裡的值

	const result = transformTask(task)
	console.log("transformed result:", result) // ← 確認這裡

	return result
}
```

---

### Phase 3：縮小到最小重現案例

移除所有無關的程式碼，保留能觸發問題的最小版本：

```typescript
// 原始複雜情況
it("should create task and notify user", async () => {
	// ... 大量設置 ...
	// 其中某個地方出錯，但不知道哪裡
})

// 最小重現案例
it("reproduces the bug", async () => {
	const task = null // 模擬問題輸入
	expect(() => transformTask(task)).not.toThrow()
	// → 確認：是 transformTask 沒有處理 null 嗎？
})
```

---

### Phase 4：修復根本原因

**修復症狀 vs 修復根本原因的差異：**

```typescript
// ❌ 修復症狀（治標）
function transformTask(task: Task | null) {
  if (!task) return {}; // 加了 null check，但沒想為什麼 task 會是 null
}

// ✅ 修復根本原因（治本）
// 先問：為什麼 transformTask 會收到 null？
// 答：因為 findUnique 找不到資料時回傳 null，但呼叫端沒有處理
// 正確修復：在呼叫端處理 not-found 情況

async function getTask(id: string): Promise<Task> {
  const task = await db.tasks.findUnique({ where: { id } });
  if (!task) throw new NotFoundError(`Task ${id} not found`);
  return task;
}

// transformTask 可以安全地假設收到的一定是 Task
function transformTask(task: Task) { ... }
```

**常見根本原因類型：**

```
□ 未處理的 null / undefined（需要在來源處修復）
□ 非同步錯誤未 await（導致錯誤在非預期的地方出現）
□ 狀態管理問題（React state 更新是非同步的）
□ 競態條件（兩個操作預期有順序，但實際無保證）
□ 型別不匹配（後端回傳字串，前端當數字用）
□ 環境差異（dev 和 production 的設置不同）
```

---

### Phase 5：加入防守測試

修復後，**立即加入測試**確保問題不會再次出現：

```typescript
describe("TaskService.getTask", () => {
	it("應返回存在的任務", async () => {
		const task = await createTestTask()
		const result = await taskService.getTask(task.id)
		expect(result.id).toBe(task.id)
	})

	it("找不到任務時應拋出 NotFoundError", async () => {
		await expect(taskService.getTask("nonexistent-id")).rejects.toThrow(NotFoundError)
	})
})
```

---

### Phase 6：驗證修復完整

```bash
# 確認原始問題已解決
npm test

# 確認沒有引入新問題（跑全部測試，不只是相關測試）
npm test -- --run

# 確認建置正常
npm run build

# 型別檢查
npx tsc --noEmit
```

---

## 特殊情境

### 間歇性 Bug（偶發性問題）

```
處理策略：
1. 加入詳細的 logging，讓問題發生時記錄所有狀態
2. 審查競態條件的可能性
3. 在測試中加入重試機制確認穩定性
4. 檢查是否依賴外部時序（setTimeout、網路請求順序）
```

### 只在 Production 發生的 Bug

```
調查清單：
□ 環境變數是否正確設置？
□ Production 使用的 Node.js / 依賴版本？
□ 資料庫資料與 dev 環境的差異？
□ Production 的並發量比 dev 高嗎？（可能是競態條件）
□ 查看 production 的 error logs
```

---

## 驗證清單

除錯完成後確認：

- [ ] 問題的根本原因（非症狀）已找到且修復
- [ ] 加入了防守測試防止問題再次出現
- [ ] 全部測試通過（沒有引入新問題）
- [ ] 移除了除錯用的 `console.log`
- [ ] 相關程式碼有加入適當的錯誤處理

## 紅旗訊號

- 修改程式碼沒有先重現問題
- 用 `try { ... } catch (e) {}` 靜默吞掉錯誤
- 加入 null check 但不清楚為什麼值會是 null
- 修復後沒有加入測試（問題可能再次出現）
- 用「刷新頁面試試看」作為解決方案
- 改了很多地方但只測試了其中一個
