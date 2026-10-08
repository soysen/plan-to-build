# 單元測試範例

> 以下範例展示各類測試的標準寫法，作為產出測試骨架的參考。

---

## 後端 Service Unit Test

```typescript
// src/auth/auth.service.test.ts
import {describe, it, expect, vi, beforeEach} from "vitest"
import {AuthService} from "./auth.service"
import {UserRepository} from "../user/user.repository"
import {hash} from "bcrypt"

// Mock 相依模組
vi.mock("../user/user.repository")
vi.mock("bcrypt")

describe("AuthService", () => {
	let authService: AuthService
	let mockUserRepo: vi.Mocked<UserRepository>

	beforeEach(() => {
		vi.clearAllMocks()
		mockUserRepo = new UserRepository() as vi.Mocked<UserRepository>
		authService = new AuthService(mockUserRepo)
	})

	describe("login", () => {
		it("應在憑證正確時回傳 access token", async () => {
			// Arrange
			const mockUser = {id: 1, email: "user@example.com", passwordHash: "hashed", role: "user"}
			mockUserRepo.findByEmail.mockResolvedValue(mockUser)
			vi.mocked(compare).mockResolvedValue(true as never)

			// Act
			const result = await authService.login("user@example.com", "password123")

			// Assert
			expect(result.accessToken).toBeDefined()
			expect(result.tokenType).toBe("Bearer")
			expect(mockUserRepo.findByEmail).toHaveBeenCalledWith("user@example.com")
		})

		it("當使用者不存在時，應拋出 UnauthorizedException", async () => {
			// Arrange
			mockUserRepo.findByEmail.mockResolvedValue(null)

			// Act & Assert
			await expect(authService.login("nouser@example.com", "password")).rejects.toThrow("INVALID_CREDENTIALS")
		})

		it("當密碼錯誤時，應拋出 UnauthorizedException", async () => {
			// Arrange
			const mockUser = {id: 1, email: "user@example.com", passwordHash: "hashed", role: "user"}
			mockUserRepo.findByEmail.mockResolvedValue(mockUser)
			vi.mocked(compare).mockResolvedValue(false as never)

			// Act & Assert
			await expect(authService.login("user@example.com", "wrong")).rejects.toThrow("INVALID_CREDENTIALS")
		})
	})

	describe("register", () => {
		it("應建立使用者並回傳不含密碼的使用者資料", async () => {
			// Arrange
			vi.mocked(hash).mockResolvedValue("hashed_password" as never)
			mockUserRepo.findByEmail.mockResolvedValue(null)
			mockUserRepo.create.mockResolvedValue({id: 1, email: "new@example.com", name: "New User", role: "user"})

			// Act
			const result = await authService.register({email: "new@example.com", name: "New User", password: "password123"})

			// Assert
			expect(result).not.toHaveProperty("passwordHash")
			expect(result.email).toBe("new@example.com")
			expect(hash).toHaveBeenCalledWith("password123", 12)
		})

		it("當 email 已存在時，應拋出 ConflictException", async () => {
			// Arrange
			mockUserRepo.findByEmail.mockResolvedValue({id: 1, email: "existing@example.com"} as any)

			// Act & Assert
			await expect(authService.register({email: "existing@example.com", name: "X", password: "123"})).rejects.toThrow(
				"EMAIL_ALREADY_EXISTS",
			)
		})
	})
})
```

---

## 後端 API Integration Test

```typescript
// tests/integration/auth.test.ts
import {describe, it, expect, beforeAll, afterAll, beforeEach} from "vitest"
import supertest from "supertest"
import {app} from "../../src/app"
import {db} from "../../src/db"
import {users} from "../../src/db/schema"
import {hash} from "bcrypt"

const request = supertest(app.server)

describe("POST /api/v1/auth/login", () => {
	beforeEach(async () => {
		// 清空資料並 seed 測試使用者
		await db.delete(users)
		await db.insert(users).values({
			email: "test@example.com",
			passwordHash: await hash("password123", 12),
			name: "Test User",
			role: "user",
		})
	})

	it("應在憑證正確時回傳 200 與 access token", async () => {
		// Act
		const res = await request.post("/api/v1/auth/login").send({email: "test@example.com", password: "password123"})

		// Assert
		expect(res.status).toBe(200)
		expect(res.body.data).toMatchObject({
			access_token: expect.any(String),
			token_type: "Bearer",
			expires_in: expect.any(Number),
		})
		expect(res.body.data.user).not.toHaveProperty("passwordHash")
	})

	it("應在密碼錯誤時回傳 401", async () => {
		const res = await request.post("/api/v1/auth/login").send({email: "test@example.com", password: "wrong"})

		expect(res.status).toBe(401)
		expect(res.body.error.code).toBe("INVALID_CREDENTIALS")
	})

	it("應在缺少欄位時回傳 400", async () => {
		const res = await request.post("/api/v1/auth/login").send({email: "test@example.com"}) // 缺少 password

		expect(res.status).toBe(400)
		expect(res.body.error.code).toBe("VALIDATION_ERROR")
	})

	it("應在 email 格式錯誤時回傳 400", async () => {
		const res = await request.post("/api/v1/auth/login").send({email: "not-an-email", password: "password123"})

		expect(res.status).toBe(400)
	})
})

describe("GET /api/v1/auth/me", () => {
	let accessToken: string

	beforeEach(async () => {
		await db.delete(users)
		await db.insert(users).values({
			email: "test@example.com",
			passwordHash: await hash("password123", 12),
			name: "Test User",
			role: "user",
		})

		const res = await request.post("/api/v1/auth/login").send({email: "test@example.com", password: "password123"})
		accessToken = res.body.data.access_token
	})

	it("應在 Token 有效時回傳使用者資料", async () => {
		const res = await request.get("/api/v1/auth/me").set("Authorization", `Bearer ${accessToken}`)

		expect(res.status).toBe(200)
		expect(res.body.data).toMatchObject({email: "test@example.com", name: "Test User"})
	})

	it("應在缺少 Token 時回傳 401", async () => {
		const res = await request.get("/api/v1/auth/me")

		expect(res.status).toBe(401)
	})

	it("應在 Token 無效時回傳 401", async () => {
		const res = await request.get("/api/v1/auth/me").set("Authorization", "Bearer invalid.token.here")

		expect(res.status).toBe(401)
	})
})
```

---

## 前端 Component Test

```typescript
// src/components/LoginForm/LoginForm.test.tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { LoginForm } from './LoginForm'

// Mock 路由（如果元件內使用 useNavigate）
vi.mock('react-router-dom', () => ({
  useNavigate: () => vi.fn(),
  Link: ({ children, to }: any) => <a href={to}>{children}</a>,
}))

describe('LoginForm', () => {
  const mockOnSubmit = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('渲染', () => {
    it('應顯示電子郵件、密碼輸入欄位與登入按鈕', () => {
      // Arrange & Act
      render(<LoginForm onSubmit={mockOnSubmit} />)

      // Assert
      expect(screen.getByLabelText('電子郵件')).toBeInTheDocument()
      expect(screen.getByLabelText('密碼')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: '登入' })).toBeInTheDocument()
    })

    it('初始狀態不應顯示錯誤訊息', () => {
      render(<LoginForm onSubmit={mockOnSubmit} />)

      expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    })
  })

  describe('表單驗證', () => {
    it('當 email 格式錯誤時，應顯示驗證錯誤', async () => {
      // Arrange
      render(<LoginForm onSubmit={mockOnSubmit} />)
      const user = userEvent.setup()

      // Act
      await user.type(screen.getByLabelText('電子郵件'), 'invalid-email')
      await user.click(screen.getByRole('button', { name: '登入' }))

      // Assert
      expect(await screen.findByText('請輸入有效的電子郵件')).toBeInTheDocument()
      expect(mockOnSubmit).not.toHaveBeenCalled()
    })

    it('當密碼為空時，應顯示必填錯誤', async () => {
      render(<LoginForm onSubmit={mockOnSubmit} />)
      const user = userEvent.setup()

      await user.type(screen.getByLabelText('電子郵件'), 'valid@example.com')
      await user.click(screen.getByRole('button', { name: '登入' }))

      expect(await screen.findByText('密碼為必填')).toBeInTheDocument()
    })
  })

  describe('提交行為', () => {
    it('應在表單正確時呼叫 onSubmit 並傳入表單值', async () => {
      // Arrange
      render(<LoginForm onSubmit={mockOnSubmit} />)
      const user = userEvent.setup()

      // Act
      await user.type(screen.getByLabelText('電子郵件'), 'user@example.com')
      await user.type(screen.getByLabelText('密碼'), 'password123')
      await user.click(screen.getByRole('button', { name: '登入' }))

      // Assert
      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith({
          email: 'user@example.com',
          password: 'password123',
        })
      })
    })

    it('提交時應顯示載入狀態', async () => {
      // Arrange
      const slowSubmit = vi.fn(() => new Promise(resolve => setTimeout(resolve, 1000)))
      render(<LoginForm onSubmit={slowSubmit} />)
      const user = userEvent.setup()

      // Act
      await user.type(screen.getByLabelText('電子郵件'), 'user@example.com')
      await user.type(screen.getByLabelText('密碼'), 'password123')
      await user.click(screen.getByRole('button', { name: '登入' }))

      // Assert
      expect(screen.getByRole('button', { name: /載入中/ })).toBeDisabled()
    })

    it('當 API 回傳錯誤時，應顯示錯誤訊息', async () => {
      // Arrange（由 MSW handler 模擬 401 回應）
      render(<LoginForm onSubmit={mockOnSubmit} />)
      const user = userEvent.setup()
      mockOnSubmit.mockRejectedValue(new Error('電子郵件或密碼錯誤'))

      // Act
      await user.type(screen.getByLabelText('電子郵件'), 'user@example.com')
      await user.type(screen.getByLabelText('密碼'), 'wrongpass')
      await user.click(screen.getByRole('button', { name: '登入' }))

      // Assert
      expect(await screen.findByRole('alert')).toHaveTextContent('電子郵件或密碼錯誤')
    })
  })
})
```

---

## 工具函式 Unit Test

```typescript
// src/utils/jwt.test.ts
import {describe, it, expect, vi, beforeEach} from "vitest"
import {signToken, verifyToken} from "./jwt"

describe("JWT Utils", () => {
	describe("signToken", () => {
		it("應產生有效的 JWT 字串", () => {
			const token = signToken({userId: 1, role: "user"})

			expect(token).toBeDefined()
			expect(token.split(".")).toHaveLength(3) // JWT 有三個部分
		})

		it("不同 payload 應產生不同 token", () => {
			const token1 = signToken({userId: 1})
			const token2 = signToken({userId: 2})

			expect(token1).not.toBe(token2)
		})
	})

	describe("verifyToken", () => {
		it("應解析有效的 token 並回傳 payload", () => {
			const payload = {userId: 1, role: "user"}
			const token = signToken(payload)

			const result = verifyToken(token)

			expect(result.userId).toBe(1)
			expect(result.role).toBe("user")
		})

		it("應在 token 無效時拋出錯誤", () => {
			expect(() => verifyToken("invalid.token.string")).toThrow()
		})

		it("應在 token 過期時拋出錯誤", () => {
			// Arrange：使用假時間讓 token 過期
			vi.useFakeTimers()
			const token = signToken({userId: 1}, {expiresIn: "1h"})

			vi.advanceTimersByTime(2 * 60 * 60 * 1000) // 快轉 2 小時

			// Act & Assert
			expect(() => verifyToken(token)).toThrow("TokenExpiredError")

			vi.useRealTimers()
		})
	})
})
```

---

## 測試骨架（空白版，供自動產出使用）

```typescript
// {模組路徑}/{模組名}.service.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { {ServiceName} } from './{moduleName}.service'

vi.mock('../{dependency}/{dependency}.repository')

describe('{ServiceName}', () => {
  let service: {ServiceName}

  beforeEach(() => {
    vi.clearAllMocks()
    service = new {ServiceName}()
  })

  describe('{methodName}', () => {
    it('應在 {正常條件} 時回傳 {預期結果}', async () => {
      // Arrange
      // TODO: 設定 mock 與測試資料

      // Act
      // TODO: 呼叫被測函式

      // Assert
      // TODO: 驗證結果
    })

    it('當 {例外條件} 時，應 {例外行為}', async () => {
      // Arrange
      // TODO: 設定觸發例外的條件

      // Act & Assert
      // TODO: 驗證拋出正確錯誤
      await expect(service.{methodName}()).rejects.toThrow('{ExpectedError}')
    })
  })
})
```
