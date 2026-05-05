---
name: tdd-build
description: "以 TDD（測試驅動開發）方式逐一實作建置計畫中的任務：先寫失敗測試、再實作程式碼使測試通過、最後重構。使用時機：建置計畫已確立，開始逐一實作 TASK-XXX 任務時。觸發關鍵字：TDD、測試驅動、實作任務、開始開發、tdd-build、Red-Green-Refactor。"
argument-hint: "輸入要實作的任務 ID（如 TASK-001）或任務描述"
---

# TDD 建置實作

## 使用時機

- 建置計畫（`docs/plan/build-plan-*.md`）已確認
- 準備開始實作某個具體任務（`TASK-XXX`）
- 需要以 TDD Red-Green-Refactor 循環進行開發

## 核心原則：Red → Green → Refactor

```
🔴 Red    → 先寫一個會失敗的測試（定義預期行為）
🟢 Green  → 寫最少量的程式碼讓測試通過
🔵 Refactor → 重構程式碼（測試仍須通過）
```

> **鐵律**：在測試通過前，不寫任何非測試的程式碼。

---

## 流程步驟

### 第零階段：確認任務範疇

1. 讀取建置計畫（`docs/plan/build-plan-*.md`），找到指定的 `TASK-XXX`
2. 確認：
   - 任務類型（BE / FE / Infra / Test）
   - 前置任務是否已完成
   - 對應的 SD 設計（API 規格、Schema、元件定義）
3. 若前置任務未完成，停止並提醒使用者

### 第一階段：環境確認

1. 確認測試框架已安裝（依技術棧，參考 [測試框架設定](./references/test-setup-guide.md)）
2. 確認可以執行測試指令：
   - 後端：`npm test` / `pnpm test`
   - 前端：`npm test` / `vitest`
   - E2E：`playwright test`
3. 確認測試目錄結構是否存在

### 第二階段：🔴 Red — 撰寫失敗測試

依任務類型選擇對應的測試策略：

**後端 API 任務** → Integration Test（使用真實資料庫或 in-memory DB）：

```typescript
// 範例：tests/integration/auth.test.ts
describe("POST /auth/login", () => {
	it("應在憑證正確時回傳 access token", async () => {
		// Arrange
		await createUser({email: "test@example.com", password: "password123"})

		// Act
		const res = await request(app).post("/api/v1/auth/login").send({email: "test@example.com", password: "password123"})

		// Assert
		expect(res.status).toBe(200)
		expect(res.body.data).toHaveProperty("access_token")
		expect(res.body.data.token_type).toBe("Bearer")
	})

	it("應在憑證錯誤時回傳 401", async () => {
		const res = await request(app).post("/api/v1/auth/login").send({email: "test@example.com", password: "wrong"})

		expect(res.status).toBe(401)
		expect(res.body.error.code).toBe("INVALID_CREDENTIALS")
	})
})
```

**業務邏輯任務** → Unit Test（隔離外部相依）：

```typescript
// 範例：tests/unit/auth.service.test.ts
describe("AuthService.login", () => {
	it("應驗證密碼並回傳 token", async () => {
		const mockUser = {id: 1, email: "test@example.com", passwordHash: await hash("password123")}
		mockUserRepo.findByEmail.mockResolvedValue(mockUser)

		const result = await authService.login("test@example.com", "password123")

		expect(result.accessToken).toBeDefined()
		expect(mockUserRepo.findByEmail).toHaveBeenCalledWith("test@example.com")
	})
})
```

**前端元件任務** → Component Test（使用 Testing Library）：

```typescript
// 範例：src/components/LoginForm.test.tsx
describe('LoginForm', () => {
  it('應在送出時呼叫 onSubmit 並傳入表單值', async () => {
    const mockOnSubmit = vi.fn()
    render(<LoginForm onSubmit={mockOnSubmit} />)

    await userEvent.type(screen.getByLabelText('電子郵件'), 'test@example.com')
    await userEvent.type(screen.getByLabelText('密碼'), 'password123')
    await userEvent.click(screen.getByRole('button', { name: '登入' }))

    expect(mockOnSubmit).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123'
    })
  })

  it('應在 email 格式錯誤時顯示錯誤訊息', async () => {
    render(<LoginForm onSubmit={vi.fn()} />)

    await userEvent.type(screen.getByLabelText('電子郵件'), 'not-an-email')
    await userEvent.click(screen.getByRole('button', { name: '登入' }))

    expect(screen.getByText('請輸入有效的電子郵件')).toBeInTheDocument()
  })
})
```

**執行測試，確認測試失敗（🔴 Red）**

### 第三階段：🟢 Green — 最小實作

1. 以 SD 文件為規格，實作最小可通過測試的程式碼
2. 遵循以下安全規範（詳見 [安全實作守則](./references/security-checklist.md)）：
   - 所有輸入必須經過 Schema 驗證（Zod / Joi）
   - SQL 必須使用參數化查詢
   - 密碼使用 bcrypt hash，不儲存明文
   - 錯誤訊息不洩漏系統內部資訊
3. **只寫讓測試通過所需的最少程式碼，不要超前實作**

**執行測試，確認全部通過（🟢 Green）**

### 第四階段：🔵 Refactor — 重構

在測試持續通過的前提下：

1. 消除重複程式碼（DRY）
2. 改善命名（變數、函式、型別）
3. 提取共用邏輯為獨立函式或模組
4. 確認符合專案編碼規範

**重構後再次執行測試，確認仍全部通過**

### 第五階段：任務完成確認

確認以下 Definition of Done：

- [ ] 所有測試通過（`npm test` 無失敗）
- [ ] TypeScript / Lint 無錯誤
- [ ] 程式碼已 commit（commit message 格式：`feat(task-001): 實作登入 API`）
- [ ] 若有 API 變動，確認 SD 文件是否需要更新
- [ ] 更新建置計畫中的任務狀態為 ✅

**回報完成，並建議下一個應執行的任務**

---

## Commit Message 規範

```
<type>(<task-id>): <描述>

類型：
  feat     - 新功能
  fix      - 修正錯誤
  test     - 新增/修改測試
  refactor - 重構（不影響行為）
  infra    - 基礎建設相關
  docs     - 文件更新
  chore    - 其他維護工作

範例：
  feat(task-001): 實作使用者登入 API
  test(task-001): 新增登入 API integration tests
  refactor(task-001): 抽取 JWT 工具函式
```

---

## 測試覆蓋率目標

| 類型                         | 最低目標 | 建議目標 |
| ---------------------------- | :------: | :------: |
| 業務邏輯（Service / Domain） |   90%    |   100%   |
| API 路由（Controller）       |   80%    |   90%    |
| 前端元件                     |   70%    |   80%    |
| 工具函式（Utils）            |   90%    |   100%   |

---

## 參考資源

- [測試框架設定指南](./references/test-setup-guide.md)
- [安全實作守則](./references/security-checklist.md)
