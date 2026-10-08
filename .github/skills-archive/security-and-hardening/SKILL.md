---
name: security-and-hardening
description: "強化程式碼對抗安全漏洞。語意情境：當使用者表達「檢查有沒有 SQL Injection 或 XSS」、「實作權限控管」、「處理敏感資料」時觸發。"
argument-hint: "描述要強化的安全面向，例如：審查任務 API 的輸入驗證和授權機制"
user-invocable: true
---

# 安全性與強化

## 概覽

以安全第一的開發實踐建置 Web 應用程式。將每個外部輸入視為惡意的，每個 secret 視為神聖的，每個授權檢查視為強制的。安全性不是一個階段——它是接觸使用者資料、認證或外部系統的每一行程式碼的限制條件。

## 適用時機

- 建置任何接受使用者輸入的功能
- 實作認證或授權
- 儲存或傳輸敏感資料
- 整合外部 API 或服務
- 加入檔案上傳、webhook 或回呼

---

## 三層邊界系統

### 永遠要做（無例外）

- **在系統邊界驗證所有外部輸入**（API routes、表單 handlers）
- **參數化所有資料庫查詢** — 永遠不要將使用者輸入拼接進 SQL
- **對輸出進行編碼** 以防止 XSS（使用框架的自動轉義，不要繞過它）
- **所有外部通訊使用 HTTPS**
- **用 bcrypt/scrypt/argon2 雜湊密碼**（絕不儲存明文）
- **設置安全標頭**（CSP、HSTS、X-Frame-Options）
- **使用 httpOnly、secure、sameSite cookie** 管理 session
- **每次發布前執行 `npm audit`**

### 需要先詢問（需要人工確認）

- 新增認證流程或修改 auth 邏輯
- 儲存新類別的敏感資料（PII、付款資訊）
- 新增外部服務整合
- 修改 CORS 設定
- 加入檔案上傳 handlers
- 修改 rate limiting 或節流

### 絕不要做

- **絕不提交 secrets** 到版本控制（API 金鑰、密碼、tokens）
- **絕不記錄敏感資料**（密碼、tokens、完整信用卡號）
- **絕不信任 client 端驗證** 作為安全邊界
- **絕不使用 `eval()` 或 `innerHTML`** 處理使用者提供的資料
- **絕不將 session 儲存在 client 端可存取的空間**（localStorage 不用於 auth tokens）
- **絕不向使用者暴露 stack trace** 或內部錯誤細節

---

## OWASP Top 10 防範

### 1. Injection（SQL、NoSQL、OS 指令）

```typescript
// ❌ SQL injection 風險
const query = `SELECT * FROM users WHERE id = '${userId}'`

// ✅ 參數化查詢
const user = await db.query("SELECT * FROM users WHERE id = $1", [userId])

// ✅ ORM 參數化
const user = await prisma.user.findUnique({where: {id: userId}})
```

### 2. 認證失效

```typescript
// 密碼雜湊
import {hash, compare} from "bcrypt"

const SALT_ROUNDS = 12
const hashedPassword = await hash(plaintext, SALT_ROUNDS)
const isValid = await compare(plaintext, hashedPassword)

// Session 管理
app.use(
	session({
		secret: process.env.SESSION_SECRET, // 來自環境變數
		resave: false,
		saveUninitialized: false,
		cookie: {
			httpOnly: true, // JavaScript 無法存取
			secure: true, // 僅 HTTPS
			sameSite: "lax", // CSRF 保護
			maxAge: 24 * 60 * 60 * 1000, // 24 小時
		},
	}),
)
```

### 3. 跨站腳本（XSS）

```typescript
// ❌ 將使用者輸入渲染為 HTML
element.innerHTML = userInput;

// ✅ 使用框架的自動轉義（React 預設這樣做）
return <div>{userInput}</div>;

// 如果必須渲染 HTML，先消毒
import DOMPurify from 'dompurify';
const clean = DOMPurify.sanitize(userInput);
```

### 4. 存取控制失效

```typescript
// 永遠檢查授權，不只是認證
app.patch("/api/tasks/:id", authenticate, async (req, res) => {
	const task = await taskService.findById(req.params.id)

	// 確認認證使用者擁有這個資源
	if (task.ownerId !== req.user.id) {
		return res.status(403).json({
			error: {code: "FORBIDDEN", message: "無權修改此任務"},
		})
	}

	const updated = await taskService.update(req.params.id, req.body)
	return res.json(updated)
})
```

### 5. 安全設定錯誤

```typescript
// 安全標頭（Express 使用 helmet）
import helmet from "helmet"
app.use(helmet())

// CORS：限制在已知 origin
app.use(
	cors({
		origin: process.env.ALLOWED_ORIGINS?.split(",") || "http://localhost:3000",
		credentials: true,
	}),
)
```

### 6. 敏感資料暴露

```typescript
// 永遠不要在 API 回應中回傳敏感欄位
function sanitizeUser(user: UserRecord): PublicUser {
	const {passwordHash, resetToken, ...publicFields} = user
	return publicFields
}

// 使用環境變數儲存 secrets
const API_KEY = process.env.STRIPE_API_KEY
if (!API_KEY) throw new Error("STRIPE_API_KEY 未設定")
```

---

## 邊界輸入驗證

```typescript
import {z} from "zod"

const CreateTaskSchema = z.object({
	title: z.string().min(1).max(200).trim(),
	description: z.string().max(2000).optional(),
	priority: z.enum(["low", "medium", "high"]).default("medium"),
	dueDate: z.string().datetime().optional(),
})

app.post("/api/tasks", async (req, res) => {
	const result = CreateTaskSchema.safeParse(req.body)
	if (!result.success) {
		return res.status(422).json({
			error: {
				code: "VALIDATION_ERROR",
				message: "輸入資料無效",
				details: result.error.flatten(),
			},
		})
	}
	const task = await taskService.create(result.data)
	return res.status(201).json(task)
})
```

---

## Rate Limiting

```typescript
import rateLimit from "express-rate-limit"

// 一般 API rate limit
app.use(
	"/api/",
	rateLimit({
		windowMs: 15 * 60 * 1000, // 15 分鐘
		max: 100, // 每視窗 100 次請求
		standardHeaders: true,
		legacyHeaders: false,
	}),
)

// 認證端點更嚴格
app.use(
	"/api/auth/",
	rateLimit({
		windowMs: 15 * 60 * 1000,
		max: 10, // 每 15 分鐘 10 次嘗試
	}),
)
```

---

## Secrets 管理

```
.env 檔案：
  ├── .env.example  → 提交（含佔位符值的模板）
  ├── .env          → 不提交（含真實 secrets）
  └── .env.local    → 不提交（本地覆蓋）

.gitignore 必須包含：
  .env
  .env.local
  .env.*.local
  *.pem
  *.key
```

提交前確認：

```bash
# 檢查是否意外暫存了 secrets
git diff --cached | grep -i "password\|secret\|api_key\|token"
```

---

## 安全審查清單

```markdown
### 認證

- [ ] 密碼使用 bcrypt/scrypt/argon2 雜湊（salt rounds ≥ 12）
- [ ] Session tokens 是 httpOnly、secure、sameSite
- [ ] 登入有 rate limiting
- [ ] 密碼重置 tokens 有過期時間

### 授權

- [ ] 每個端點都檢查使用者權限
- [ ] 使用者只能存取自己的資源
- [ ] Admin 操作需要 admin 角色驗證

### 輸入

- [ ] 所有使用者輸入在邊界處驗證
- [ ] SQL 查詢使用參數化
- [ ] HTML 輸出有編碼/轉義

### 資料

- [ ] 程式碼或版本控制中沒有 secrets
- [ ] 敏感欄位從 API 回應中排除
- [ ] 靜態敏感資料有加密（如適用）

### 基礎設施

- [ ] 安全標頭已設置（CSP、HSTS 等）
- [ ] CORS 限制在已知 origins
- [ ] 依賴已掃描漏洞
- [ ] 錯誤訊息不暴露內部資訊
```

---

## 驗證清單

實作安全相關程式碼後確認：

- [ ] `npm audit` 無嚴重或高危漏洞
- [ ] 原始碼或 git 歷史中沒有 secrets
- [ ] 所有使用者輸入在系統邊界處驗證
- [ ] 每個受保護端點都有認證和授權檢查
- [ ] 安全標頭存在於回應中（用 DevTools 確認）
- [ ] 錯誤回應不暴露內部細節
- [ ] 認證端點有 rate limiting

## 紅旗訊號

- 使用者輸入直接傳入資料庫查詢、shell 指令或 HTML 渲染
- 原始碼或 commit 歷史中有 secrets
- 沒有認證或授權檢查的 API 端點
- 缺少 CORS 設定或使用萬用字元（`*`）
- 認證端點沒有 rate limiting
- stack trace 或內部錯誤暴露給使用者
- 有已知嚴重漏洞的依賴
