# 測試分層策略

## 測試金字塔

```
        △  E2E Tests（少量）
       △△△  Integration Tests（適量）
      △△△△△  Unit Tests（大量）
```

多數邏輯以 Unit Test 驗證（快速、穩定），關鍵流程以 Integration Test 確保整合正確，完整使用者旅程以 E2E Test 保護。

---

## 各層測試定義

### Unit Test（單元測試）

**測試對象**：單一函式、類別或模組，隔離所有外部相依

**何時使用**：

- Business Logic（Service / Domain Layer）
- 工具函式（utils、helpers）
- 資料轉換函式（mappers、formatters）
- 驗證邏輯

**特性**：

- 執行速度最快（毫秒級）
- 以 Mock 取代外部相依（DB、API、時間）
- 覆蓋所有邊界條件與例外情況

**不適用**：

- 純粹的 CRUD（無業務邏輯）→ 改用 Integration Test
- UI 渲染行為 → 改用 Component Test

---

### Integration Test（整合測試）

**測試對象**：多個層次的整合（API Route → Service → DB）

**何時使用**：

- API 端點（含真實資料庫連線）
- DB 查詢邏輯（ORM 行為、索引、關聯）
- 外部服務整合（Email、Payment，可用 Mock Server）

**特性**：

- 使用真實資料庫（測試環境）
- 每個測試前 reset 資料（truncate + seed）
- 比 Unit Test 慢，但比 E2E 快

**不適用**：

- 複雜業務邏輯 → 先以 Unit Test 覆蓋
- 使用者介面流程 → 改用 E2E Test

---

### Component Test（元件測試）

**測試對象**：React / Vue 元件的渲染與互動行為

**何時使用**：

- 表單提交與驗證
- 使用者互動（點擊、輸入、鍵盤）
- 條件渲染（載入狀態、錯誤狀態、空狀態）
- Props 變化對 UI 的影響

**特性**：

- 使用 jsdom 環境，不需要真實瀏覽器
- 以 MSW 攔截 API 請求
- 關注行為（what user sees），不關注實作細節

**不適用**：

- 跨頁面的導覽流程 → 改用 E2E Test
- 純邏輯函式 → 改用 Unit Test

---

### E2E Test（端對端測試）

**測試對象**：完整使用者旅程（從瀏覽器操作到資料庫）

**何時使用**：

- 核心使用者旅程（登入→操作→登出）
- 跨頁面流程（結帳流程、多步驟表單）
- 關鍵業務功能的煙霧測試（Smoke Test）

**特性**：

- 最慢、最脆弱，數量要少
- 使用真實瀏覽器（Playwright）
- 主要驗證「系統整體可運作」，不驗證細節

**不適用**：

- 所有邊界條件 → 改用 Unit / Integration Test
- 大量重複場景 → 合併或降層測試

---

## 模組測試策略對應表

| 模組類型               |   Unit    | Integration | Component |   E2E   |
| ---------------------- | :-------: | :---------: | :-------: | :-----: |
| Service / Domain Logic |  ✅ 主力  |    補充     |     -     |    -    |
| API Controller / Route |     -     |   ✅ 主力   |     -     |    -    |
| Repository / DB Layer  |     -     |   ✅ 主力   |     -     |    -    |
| React / Vue 元件       |     -     |      -      |  ✅ 主力  |    -    |
| 完整使用者流程         |     -     |      -      |     -     | ✅ 少量 |
| Utils / Helpers        |  ✅ 主力  |      -      |     -     |    -    |
| Auth Middleware        | Unit 邏輯 |   ✅ 整合   |     -     |    -    |

---

## 覆蓋率目標

| 層次             | 最低目標 | 建議目標 | 備註                  |
| ---------------- | :------: | :------: | --------------------- |
| Service / Domain |   90%    |   100%   | 業務邏輯全覆蓋        |
| API Route        |   80%    |   90%    | 含錯誤路徑            |
| Repository       |   70%    |   80%    | 透過 Integration Test |
| React 元件       |   70%    |   80%    | 含互動測試            |
| Utils            |   90%    |   100%   | 純函式易覆蓋          |

---

## 測試隔離原則

### 後端隔離

```typescript
// ✅ 每個測試前清空資料
beforeEach(async () => {
	await db.execute(sql`TRUNCATE TABLE users RESTART IDENTITY CASCADE`)
})

// ✅ Mock 外部服務
vi.mock("../services/email.service", () => ({
	sendEmail: vi.fn().mockResolvedValue({success: true}),
}))

// ✅ Mock 時間（測試時間相關邏輯）
vi.useFakeTimers()
vi.setSystemTime(new Date("2026-01-01"))
```

### 前端隔離

```typescript
// ✅ 每個測試後重置 MSW handlers
afterEach(() => server.resetHandlers())

// ✅ 使用 render 的 wrapper 提供 Provider
const renderWithProviders = (ui: ReactElement) =>
  render(ui, { wrapper: ({ children }) => <QueryClientProvider client={queryClient}>{children}</QueryClientProvider> })
```

---

## 測試執行指令

```bash
# 執行全部測試
pnpm test

# 監看模式（開發時使用）
pnpm test:watch

# 含覆蓋率報告
pnpm test:coverage

# 只執行特定檔案
pnpm test src/auth/auth.service.test.ts

# 只執行特定測試（使用 -t 篩選 describe/it 名稱）
pnpm test -t "登入"

# E2E 測試
pnpm test:e2e

# E2E 互動模式（Debug 用）
pnpm test:e2e:ui
```
