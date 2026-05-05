# 測試框架設定指南

## 後端（Node.js / TypeScript）

### 推薦組合

| 用途       | 工具                  | 安裝指令                                 |
| ---------- | --------------------- | ---------------------------------------- |
| 測試執行器 | Vitest                | `pnpm add -D vitest`                     |
| HTTP 測試  | supertest             | `pnpm add -D supertest @types/supertest` |
| Mock       | Vitest 內建 `vi.fn()` | -                                        |
| 測試資料庫 | 真實 DB（測試環境）   | 設定 `DATABASE_URL_TEST`                 |
| 覆蓋率     | `@vitest/coverage-v8` | `pnpm add -D @vitest/coverage-v8`        |

### `vitest.config.ts`（後端）

```typescript
import {defineConfig} from "vitest/config"

export default defineConfig({
	test: {
		globals: true,
		environment: "node",
		setupFiles: ["./tests/setup.ts"],
		coverage: {
			provider: "v8",
			reporter: ["text", "lcov"],
			include: ["src/**/*.ts"],
			exclude: ["src/**/*.d.ts", "src/index.ts"],
			thresholds: {
				lines: 80,
				functions: 80,
				branches: 70,
			},
		},
	},
})
```

### `tests/setup.ts`（後端）

```typescript
import {beforeAll, afterAll, beforeEach} from "vitest"
import {db} from "../src/db"
import {migrate} from "../src/db/migrate"

beforeAll(async () => {
	// 執行 migration
	await migrate(db)
})

beforeEach(async () => {
	// 每個測試前清空資料（使用 truncate + reset sequence）
	await db.execute(sql`TRUNCATE TABLE users, table_a RESTART IDENTITY CASCADE`)
})

afterAll(async () => {
	await db.end()
})
```

### `package.json` 腳本（後端）

```json
{
	"scripts": {
		"test": "vitest run",
		"test:watch": "vitest",
		"test:coverage": "vitest run --coverage",
		"test:ui": "vitest --ui"
	}
}
```

---

## 前端（React / TypeScript）

### 推薦組合

| 用途          | 工具                        | 安裝指令                                  |
| ------------- | --------------------------- | ----------------------------------------- |
| 測試執行器    | Vitest                      | `pnpm add -D vitest`                      |
| DOM 環境      | jsdom                       | `pnpm add -D jsdom`                       |
| 元件測試      | @testing-library/react      | `pnpm add -D @testing-library/react`      |
| 使用者互動    | @testing-library/user-event | `pnpm add -D @testing-library/user-event` |
| Jest Matchers | @testing-library/jest-dom   | `pnpm add -D @testing-library/jest-dom`   |
| Mock 服務     | msw（API mock）             | `pnpm add -D msw`                         |

### `vitest.config.ts`（前端）

```typescript
import {defineConfig} from "vitest/config"
import react from "@vitejs/plugin-react"

export default defineConfig({
	plugins: [react()],
	test: {
		globals: true,
		environment: "jsdom",
		setupFiles: ["./src/tests/setup.ts"],
		coverage: {
			provider: "v8",
			reporter: ["text", "lcov"],
			include: ["src/**/*.{ts,tsx}"],
			exclude: ["src/**/*.d.ts", "src/main.tsx"],
		},
	},
})
```

### `src/tests/setup.ts`（前端）

```typescript
import "@testing-library/jest-dom"
import {server} from "./mocks/server"

beforeAll(() => server.listen({onUnhandledRequest: "error"}))
afterEach(() => server.resetHandlers())
afterAll(() => server.close())
```

### MSW Handler 範例（API Mock）

```typescript
// src/tests/mocks/handlers.ts
import {http, HttpResponse} from "msw"

export const handlers = [
	http.post("/api/v1/auth/login", async ({request}) => {
		const body = (await request.json()) as {email: string; password: string}

		if (body.password === "wrong") {
			return HttpResponse.json({error: {code: "INVALID_CREDENTIALS", message: "電子郵件或密碼錯誤"}}, {status: 401})
		}

		return HttpResponse.json({
			data: {
				access_token: "mock-jwt-token",
				token_type: "Bearer",
				expires_in: 3600,
				user: {id: 1, email: body.email, name: "Test User", role: "user"},
			},
		})
	}),
]
```

---

## E2E 測試（Playwright）

### 安裝

```bash
pnpm add -D @playwright/test
npx playwright install chromium
```

### `playwright.config.ts`

```typescript
import {defineConfig, devices} from "@playwright/test"

export default defineConfig({
	testDir: "./e2e",
	timeout: 30_000,
	retries: process.env.CI ? 2 : 0,
	use: {
		baseURL: process.env.E2E_BASE_URL ?? "http://localhost:3000",
		trace: "on-first-retry",
		screenshot: "only-on-failure",
	},
	projects: [{name: "chromium", use: {...devices["Desktop Chrome"]}}],
	webServer: {
		command: "pnpm dev",
		url: "http://localhost:3000",
		reuseExistingServer: !process.env.CI,
	},
})
```

### E2E 測試範例

```typescript
// e2e/auth.spec.ts
import {test, expect} from "@playwright/test"

test.describe("登入流程", () => {
	test("使用正確憑證登入後跳轉至儀表板", async ({page}) => {
		await page.goto("/login")

		await page.getByLabel("電子郵件").fill("user@example.com")
		await page.getByLabel("密碼").fill("password123")
		await page.getByRole("button", {name: "登入"}).click()

		await expect(page).toHaveURL("/dashboard")
		await expect(page.getByText("歡迎回來")).toBeVisible()
	})

	test("憑證錯誤時顯示錯誤訊息", async ({page}) => {
		await page.goto("/login")

		await page.getByLabel("電子郵件").fill("user@example.com")
		await page.getByLabel("密碼").fill("wrong-password")
		await page.getByRole("button", {name: "登入"}).click()

		await expect(page.getByText("電子郵件或密碼錯誤")).toBeVisible()
		await expect(page).toHaveURL("/login")
	})
})
```

### `package.json` 腳本（E2E）

```json
{
	"scripts": {
		"test:e2e": "playwright test",
		"test:e2e:ui": "playwright test --ui",
		"test:e2e:report": "playwright show-report"
	}
}
```

---

## 測試目錄結構建議

```
project/
├── src/
│   └── {feature}/
│       ├── {feature}.service.ts
│       └── {feature}.service.test.ts    ← Unit tests 放在原始碼旁邊
├── tests/
│   ├── setup.ts
│   ├── integration/
│   │   └── {feature}.test.ts            ← Integration tests
│   └── mocks/
│       ├── server.ts
│       └── handlers.ts
└── e2e/
    └── {feature}.spec.ts                ← E2E tests
```
