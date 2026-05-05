# 安全實作守則

> 每個任務實作完成後，必須逐項確認以下清單。

---

## OWASP Top 10 對應守則

### A01：存取控制失效

- [ ] 所有需要認證的 API 都有 `authMiddleware`
- [ ] 使用者只能存取自己的資料（在 WHERE 條件加上 `user_id = currentUser.id`）
- [ ] 管理員功能有獨立的角色檢查 middleware
- [ ] 不依賴前端隱藏元件作為唯一的存取控制手段

```typescript
// ✅ 正確：在 DB 查詢加上 user_id 過濾
const order = await db.query.orders.findFirst({
	where: and(eq(orders.id, orderId), eq(orders.userId, currentUser.id)),
})

// ❌ 錯誤：只憑 ID 查詢，沒有驗證擁有權
const order = await db.query.orders.findFirst({
	where: eq(orders.id, orderId),
})
```

### A02：加密失敗

- [ ] 密碼使用 `bcrypt`（cost factor ≥ 12）hash 後儲存，**絕不儲存明文**
- [ ] 敏感欄位（Token、API Key）不出現在 Log
- [ ] HTTPS 強制啟用（HTTP 自動 301 redirect）
- [ ] 資料庫連線使用 SSL（`sslmode=require`）

```typescript
// ✅ 正確：使用 bcrypt
import {hash, compare} from "bcrypt"
const passwordHash = await hash(plainPassword, 12)

// ❌ 錯誤：明文或弱加密
const passwordHash = md5(plainPassword)
```

### A03：注入攻擊

- [ ] 所有資料庫查詢使用 ORM 參數化查詢（Drizzle / Prisma），**禁止字串拼接 SQL**
- [ ] 所有使用者輸入使用 Zod / Joi 進行 Schema 驗證
- [ ] 文件操作不使用使用者輸入的路徑（防止 Path Traversal）

```typescript
// ✅ 正確：ORM 參數化查詢
const user = await db.select().from(users).where(eq(users.email, email))

// ❌ 錯誤：字串拼接
const user = await db.execute(`SELECT * FROM users WHERE email = '${email}'`)
```

### A04：不安全設計

- [ ] 登入失敗不區分「帳號不存在」與「密碼錯誤」（統一回傳 `INVALID_CREDENTIALS`）
- [ ] 密碼重設 Token 有效期限（≤ 1 小時）
- [ ] 不在 URL 中傳遞敏感資訊

### A05：安全設定錯誤

- [ ] CORS 設定白名單，禁止 `origin: '*'`（除非是公開 API）
- [ ] 移除預設憑證（資料庫、管理介面）
- [ ] 生產環境關閉 debug 模式與 stack trace 輸出
- [ ] 設定安全 HTTP Headers（使用 `helmet`）

```typescript
// ✅ 正確：明確的 CORS 白名單
app.register(cors, {
	origin: process.env.ALLOWED_ORIGINS?.split(",") ?? ["https://yourdomain.com"],
})
```

### A07：驗證與授權失敗

- [ ] JWT 使用強隨機 secret（≥ 256 bit）
- [ ] JWT 有合理的有效期限（Access Token ≤ 1 小時）
- [ ] 密碼重設 / 信箱驗證流程有防暴力攻擊的 Rate Limit

```typescript
// ✅ 正確：驗證 JWT 並提取 payload
const payload = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload
```

### A09：安全日誌與監控失效

- [ ] 登入失敗事件記錄 Log（含 IP、時間，不含密碼）
- [ ] 敏感操作（刪除、金流）記錄 Audit Log
- [ ] Log 中不包含密碼、Token、信用卡號等敏感資訊

---

## 輸入驗證規範（Zod 範例）

```typescript
import {z} from "zod"

// 登入請求 Schema
export const LoginSchema = z.object({
	email: z.string().email("請輸入有效的電子郵件").max(255),
	password: z.string().min(8, "密碼至少 8 個字元").max(100),
})

// 在 Route Handler 中驗證
app.post("/auth/login", async (req, reply) => {
	const result = LoginSchema.safeParse(req.body)
	if (!result.success) {
		return reply.status(400).send({
			error: {code: "VALIDATION_ERROR", message: result.error.message},
		})
	}
	// 使用 result.data（已驗證的安全資料）
})
```

---

## 環境變數安全

- [ ] 所有 secret 透過環境變數注入，**不 hardcode，不 commit 到 Git**
- [ ] `.env` 已加入 `.gitignore`
- [ ] 提供 `.env.example`（只含 key 名稱，不含實際值）
- [ ] 生產環境的 secret 使用 Secret Manager（如 Railway Variables、AWS Secrets Manager）

```bash
# .env.example
DATABASE_URL=postgresql://user:password@localhost:5432/dbname
JWT_SECRET=your-256-bit-random-secret
REDIS_URL=redis://localhost:6379
```

---

## 快速檢查指令

```bash
# 掃描相依套件漏洞
npm audit

# 確認無敏感資訊在 Git 歷史
git log --all --full-history -- "**/.env"

# 確認 .env 已被 gitignore
git check-ignore -v .env
```
