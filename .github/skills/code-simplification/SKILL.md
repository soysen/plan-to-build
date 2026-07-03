---
name: code-simplification
description: "在不改變行為的前提下簡化程式碼。語意情境：當使用者表達「這段程式碼太複雜了幫我重構」、「移除過度設計」、「清理髒 code」時觸發。"
argument-hint: "描述要簡化的程式碼或模組，例如：簡化任務過濾邏輯"
user-invocable: true
---

# 程式碼簡化

## 概覽

簡化程式碼，但不改變行為。複雜的程式碼是技術債——它讓新成員難以上手、讓 bug 更難發現，讓修改更有風險。簡化不是重寫，而是在現有邏輯的基礎上移除不必要的複雜度。

## 適用時機

- 函式超過 50 行
- 看了 5 秒還不清楚這段程式碼在做什麼
- 有過度的抽象層（只被用到一次的 class/interface）
- 條件邏輯嵌套超過 3 層
- 需要在重構後加入新功能

**不適用時機：**

- 只是風格偏好（縮排、換行習慣），不影響可讀性
- 「因為可以」而做的重構，沒有明確的可讀性問題

## 執行流程

```
1. IDENTIFY → 找出複雜度的根源
2. TEST     → 確認現有行為有測試保護
3. SIMPLIFY → 逐步移除複雜度
4. VERIFY   → 確認行為沒有改變（測試全過）
```

---

### Phase 1：識別複雜度

常見的複雜度訊號：

```
□ 函式超過 50 行
□ 嵌套超過 3 層（if / for / try 交疊）
□ 函式名稱包含「And」（做了兩件事）
□ 過多的參數（超過 4 個）
□ 注解比程式碼還多（程式碼需要解釋才能懂）
□ 只被使用一次的抽象（class、interface）
□ 重複的程式碼（超過 3 次出現相同邏輯）
```

---

### Phase 2：先有測試保護

**在重構之前，確認行為有測試覆蓋。**
如果沒有測試，先補測試再重構。

```bash
npm test -- --coverage
```

---

### Phase 3：常見簡化策略

**3.1 提早返回（Early Return / Guard Clauses）**

```typescript
// ❌ 深度嵌套
function processTask(task: Task | null) {
	if (task) {
		if (!task.archived) {
			if (task.ownerId === currentUser.id) {
				return doWork(task)
			}
		}
	}
	return null
}

// ✅ 提早返回
function processTask(task: Task | null) {
	if (!task) return null
	if (task.archived) return null
	if (task.ownerId !== currentUser.id) return null
	return doWork(task)
}
```

**3.2 拆分過長函式**

```typescript
// ❌ 函式做了太多事
async function handleCreateTask(req, res) {
  // 驗證（10 行）
  if (!req.body.title) { ... }
  if (req.body.title.length > 200) { ... }

  // 權限檢查（5 行）
  const user = await getUser(req.userId);
  if (!user.canCreateTasks) { ... }

  // 建立任務（10 行）
  const task = await db.tasks.create({ ... });

  // 發送通知（8 行）
  await notificationService.send({ ... });

  return res.json(task);
}

// ✅ 每個函式做一件事
async function handleCreateTask(req, res) {
  const input = validateCreateTaskInput(req.body);   // 拋出驗證錯誤
  await assertCanCreateTasks(req.userId);            // 拋出授權錯誤
  const task = await taskService.create(req.userId, input);
  await notifyTaskCreated(task);
  return res.status(201).json(task);
}
```

**3.3 移除不必要的抽象**

```typescript
// ❌ 只被用一次的 interface（過度設計）
interface TaskFilterStrategy {
	filter(tasks: Task[]): Task[]
}

class ActiveTaskFilterStrategy implements TaskFilterStrategy {
	filter(tasks: Task[]) {
		return tasks.filter(t => !t.archived)
	}
}

const strategy = new ActiveTaskFilterStrategy()
const filtered = strategy.filter(tasks)

// ✅ 直接寫
const activeTasks = tasks.filter(task => !task.archived)
```

**3.4 用物件取代過多參數**

```typescript
// ❌ 過多參數
function createTask(
  title: string,
  description: string,
  priority: string,
  ownerId: string,
  dueDate: Date,
  tags: string[]
) { ... }

// ✅ 用物件封裝
interface CreateTaskInput {
  title: string;
  description?: string;
  priority?: 'low' | 'medium' | 'high';
  ownerId: string;
  dueDate?: Date;
  tags?: string[];
}

function createTask(input: CreateTaskInput) { ... }
```

**3.5 用 Array 方法取代複雜迴圈**

```typescript
// ❌ 命令式迴圈
const result = []
for (let i = 0; i < tasks.length; i++) {
	if (tasks[i].ownerId === userId) {
		if (!tasks[i].done) {
			result.push({
				id: tasks[i].id,
				title: tasks[i].title,
			})
		}
	}
}

// ✅ 宣告式
const result = tasks
	.filter(task => task.ownerId === userId && !task.done)
	.map(task => ({id: task.id, title: task.title}))
```

---

### Phase 4：驗證行為未改變

```bash
# 重構後全部測試必須通過
npm test

# 型別檢查
npx tsc --noEmit

# 確認 lint 無錯誤
npm run lint
```

---

## 驗證清單

簡化完成後確認：

- [ ] 所有測試通過（行為未改變）
- [ ] 函式長度 < 50 行
- [ ] 嵌套深度 ≤ 3 層
- [ ] 每個函式只做一件事（名稱中沒有「And」）
- [ ] 沒有只使用一次的抽象類別/介面
- [ ] 程式碼不需要大量注解就能理解意圖

## 紅旗訊號

- 簡化時沒有測試保護（危險！）
- 一次簡化太多地方（應逐步進行）
- 把「風格偏好」當作「複雜度問題」
- 引入新的抽象來「簡化」（可能是逆效果）
- 修改後跳過測試驗證

## 常見合理化藉口

| 藉口                        | 現實                                           |
| --------------------------- | ---------------------------------------------- |
| 「這樣寫比較靈活」          | 靈活性沒有需求支撐就是負擔，不是優點           |
| 「三層 if 很正常」          | 提早返回可以把嵌套降至一層，可讀性更好         |
| 「這個 class 以後可能有用」 | YAGNI：You Aren't Gonna Need It                |
| 「重構不是我的工作」        | 留下比你找到時更乾淨的程式碼（Boy Scout Rule） |
