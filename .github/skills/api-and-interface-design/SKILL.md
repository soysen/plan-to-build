---
name: api-and-interface-design
description: "設計穩定的 API 與介面合約。語意情境：當使用者表達「我們要設計這個 API」、「定義前後端介面格式」或「開一個新的 Endpoint」時觸發。"
argument-hint: "描述要設計的 API 或介面，例如：設計任務管理系統的 REST API"
user-invocable: true
---

# API 與介面設計

## 概覽

先設計介面，再實作。穩定的介面讓前後端可以平行開發，而清楚的合約讓消費者不需讀取實作細節。API 是對外的承諾——要周全地設計，謹慎地演進。

## 適用時機

- 設計新的 REST、GraphQL 或 RPC API
- 制定前後端共用的 TypeScript 介面
- 在多人協作前確立資料格式
- 需要統一全專案的錯誤回應格式

## 執行流程

```
1. DEFINE  → 釐清邊界與消費者需求
2. CONTRACT → 明確型別、欄位與錯誤格式
3. VALIDATE → 在系統邊界進行輸入驗證
4. DOCUMENT → 加入範例與 OpenAPI 規格（如適用）
5. VERIFY  → 確認消費者可正確使用
```

---

### Phase 1：定義邊界

釐清以下問題再動手：

- 誰是消費者？（前端、第三方、其他服務）
- 哪些是核心操作？
- 需要哪些認證與授權？
- 版本策略為何？（URL 路徑版本、標頭版本）

---

### Phase 2：合約優先

**REST 端點設計**

```
POST   /api/tasks          建立任務
GET    /api/tasks           列表（支援分頁與篩選）
GET    /api/tasks/:id       取得單筆
PATCH  /api/tasks/:id       更新
DELETE /api/tasks/:id       刪除
```

**TypeScript 型別定義（前後端共用）**

```typescript
// 建立輸入
interface CreateTaskInput {
	title: string // 必填，1-200 字
	description?: string // 選填，最多 2000 字
	priority?: "low" | "medium" | "high" // 預設 'medium'
	dueDate?: string // ISO 8601
}

// 回應格式
interface Task {
	id: string
	title: string
	description: string | null
	priority: "low" | "medium" | "high"
	done: boolean
	createdAt: string
	updatedAt: string
	ownerId: string
}
```

**統一錯誤格式**

```typescript
interface ApiError {
	error: {
		code: string // 'VALIDATION_ERROR' | 'NOT_FOUND' | 'FORBIDDEN' | ...
		message: string // 人類可讀訊息
		details?: unknown // 欄位層級的詳細資訊（驗證錯誤用）
	}
}
```

---

### Phase 3：邊界驗證

在 API 入口點統一驗證，不要在多處重複：

```typescript
import {z} from "zod"

const CreateTaskSchema = z.object({
	title: z.string().min(1, "標題不得為空").max(200).trim(),
	description: z.string().max(2000).optional(),
	priority: z.enum(["low", "medium", "high"]).default("medium"),
	dueDate: z.string().datetime().optional(),
})

// Route handler
app.post("/api/tasks", authenticate, async (req, res) => {
	const result = CreateTaskSchema.safeParse(req.body)
	if (!result.success) {
		return res.status(422).json({
			error: {
				code: "VALIDATION_ERROR",
				message: "輸入資料不符合格式",
				details: result.error.flatten(),
			},
		})
	}
	const task = await taskService.create(req.user.id, result.data)
	return res.status(201).json(task)
})
```

---

### Phase 4：文件與範例

為每個端點提供範例請求與回應：

````markdown
### POST /api/tasks

建立新任務。

**請求**

```json
{
	"title": "撰寫單元測試",
	"priority": "high",
	"dueDate": "2025-12-31T00:00:00Z"
}
```

**成功回應** `201 Created`

```json
{
	"id": "task_abc123",
	"title": "撰寫單元測試",
	"priority": "high",
	"done": false,
	"createdAt": "2025-01-15T10:00:00Z"
}
```

**錯誤回應** `422 Unprocessable Entity`

```json
{
	"error": {
		"code": "VALIDATION_ERROR",
		"message": "輸入資料不符合格式",
		"details": {"fieldErrors": {"title": ["標題不得為空"]}}
	}
}
```
````

---

### Phase 5：驗證

完成設計後確認：

- [ ] 所有端點有明確的 HTTP 方法與狀態碼
- [ ] 輸入型別完整定義（包含可選欄位）
- [ ] 統一的錯誤格式並應用於所有端點
- [ ] 在系統邊界（API 入口）驗證所有輸入
- [ ] 有成功與失敗的回應範例
- [ ] 消費者（前端）可根據合約獨立開發

## 設計原則

| 情境         | 做法                                                   |
| ------------ | ------------------------------------------------------ |
| 回應欄位命名 | 使用 camelCase，前後端一致                             |
| 分頁         | `{ data: T[], meta: { total, page, limit } }`          |
| 排序/篩選    | query string：`?sort=createdAt&order=desc&status=open` |
| 部分更新     | 使用 `PATCH`，只傳送要更新的欄位                       |
| 刪除成功     | 回傳 `204 No Content`                                  |
| 未找到資源   | 回傳 `404 Not Found` + 統一錯誤格式                    |
| 未授權       | 回傳 `403 Forbidden`（已認證但無權限）                 |

## 紅旗訊號

- 在每個 route handler 中重複驗證相同欄位
- 不同端點使用不同的錯誤格式
- 回傳 `200 OK` 但 body 包含 `"error"` 欄位
- 未對外部輸入進行型別驗證就直接傳入資料庫
- API 設計依賴實作細節（洩漏資料庫欄位名稱）
- 破壞性變更未透過版本號通知消費者
