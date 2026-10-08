# {專案名稱} 測試計畫（Test Plan）

**版本**：v0.1  
**建立日期**：{YYYY-MM-DD}  
**對應 SA**：`docs/design/sa-{YYYY-MM-DD}.md`  
**對應 SD**：`docs/design/sd-{YYYY-MM-DD}.md`  
**狀態**：草稿 / 審核中 / 已確認

---

## 1. 測試範疇與目標

### 範疇

本測試計畫涵蓋以下模組：

| 模組 ID | 模組名稱   | 測試類型                       | 優先序 |
| ------- | ---------- | ------------------------------ | ------ |
| MOD-001 | {模組名稱} | Unit + Integration             | 🔴     |
| MOD-002 | {模組名稱} | Unit + Integration + Component | 🔴     |

### 測試目標

- 驗證所有 🔴 必要功能的業務邏輯正確性
- 確保 API 端點符合 SD 文件定義的 Request / Response Schema
- 確認前端元件的互動行為符合預期
- 識別並覆蓋所有高風險邊界條件

### 不在範疇內

- 效能測試（Load Test）
- 滲透測試（Penetration Test）
- 瀏覽器相容性測試（E2E 僅覆蓋 Chrome）

---

## 2. 測試環境

| 環境                 | 用途                               | 設定                        |
| -------------------- | ---------------------------------- | --------------------------- |
| local                | 開發時執行 Unit / Integration Test | Docker Compose              |
| CI（GitHub Actions） | PR 時自動執行全部測試              | Ubuntu + PostgreSQL Service |
| Staging              | E2E 測試目標環境                   | {staging URL}               |

### 測試指令

```bash
pnpm test              # Unit + Integration Tests
pnpm test:coverage     # 含覆蓋率報告
pnpm test:e2e          # E2E Tests（需 Staging 環境）
```

---

## 3. 覆蓋率目標

| 層次             | 目標  | 量測工具        |
| ---------------- | :---: | --------------- |
| Service / Domain | ≥ 90% | Vitest Coverage |
| API Route        | ≥ 80% | Vitest Coverage |
| 前端元件         | ≥ 70% | Vitest Coverage |
| Utils            | ≥ 90% | Vitest Coverage |

---

## 4. 測試案例清單

### MOD-001：{模組名稱}

#### Unit Tests（`src/{module}/{module}.service.test.ts`）

| TC ID   | 測試描述                          | 分類       | 優先序 | 狀態      |
| ------- | --------------------------------- | ---------- | ------ | --------- |
| TC-U001 | 應在 {正常條件} 時回傳 {預期結果} | Happy Path | 🔴     | 🔲 待實作 |
| TC-U002 | 當 {例外條件} 時，應拋出 {例外}   | Error Path | 🔴     | 🔲 待實作 |
| TC-U003 | 當 {邊界條件} 時，應 {行為}       | Edge Case  | 🟡     | 🔲 待實作 |

#### Integration Tests（`tests/integration/{module}.test.ts`）

| TC ID   | 測試描述                 | 端點                     | 狀態碼 | 優先序 | 測試狀態  |
| ------- | ------------------------ | ------------------------ | :----: | ------ | --------- |
| TC-I001 | 應在認證正確時回傳資料   | `GET /{resource}`        |  200   | 🔴     | 🔲 待實作 |
| TC-I002 | 未認證時應回傳 401       | `GET /{resource}`        |  401   | 🔴     | 🔲 待實作 |
| TC-I003 | 無權限時應回傳 403       | `DELETE /{resource}/:id` |  403   | 🔴     | 🔲 待實作 |
| TC-I004 | 資源不存在時應回傳 404   | `GET /{resource}/:id`    |  404   | 🔴     | 🔲 待實作 |
| TC-I005 | 輸入格式錯誤時應回傳 400 | `POST /{resource}`       |  400   | 🔴     | 🔲 待實作 |

---

### MOD-002：{模組名稱}

#### Component Tests（`src/components/{Component}/{Component}.test.tsx`）

| TC ID   | 測試描述                      | 元件            | 優先序 | 測試狀態  |
| ------- | ----------------------------- | --------------- | ------ | --------- |
| TC-C001 | 應正確渲染初始狀態            | {ComponentName} | 🔴     | 🔲 待實作 |
| TC-C002 | 使用者點擊 {按鈕} 時應 {行為} | {ComponentName} | 🔴     | 🔲 待實作 |
| TC-C003 | 載入狀態時應顯示 Loading 指示 | {ComponentName} | 🟡     | 🔲 待實作 |
| TC-C004 | 錯誤狀態時應顯示錯誤訊息      | {ComponentName} | 🔴     | 🔲 待實作 |
| TC-C005 | 空資料時應顯示空狀態提示      | {ComponentName} | 🟡     | 🔲 待實作 |

---

## 5. E2E 測試案例

| TC ID   | 使用者旅程                               | 對應 Use Case | 優先序 | 測試狀態  |
| ------- | ---------------------------------------- | ------------- | ------ | --------- |
| TC-E001 | {旅程描述：如「使用者從登入到完成訂單」} | UC-001        | 🔴     | 🔲 待實作 |
| TC-E002 | {旅程描述}                               | UC-002        | 🟡     | 🔲 待實作 |

---

## 6. 測試資料策略

### Seed 資料

| 資料類型     | 建立方式            | 說明                           |
| ------------ | ------------------- | ------------------------------ |
| 基本使用者   | `beforeEach` 中插入 | 每個 Integration Test 獨立建立 |
| 管理員使用者 | Test fixture        | 需要管理員權限的測試使用       |
| 大量資料     | Seed script         | 測試分頁功能用                 |

### 測試資料隔離

- 每個 Integration Test 在 `beforeEach` 中 truncate 相關資料表
- 不同測試間共享靜態 seed 資料（如：系統設定、類型清單）

---

## 7. 高風險測試項目

> 以下測試案例因業務邏輯複雜或外部相依性高，需特別關注

| TC ID    | 風險描述 | 緩解措施 |
| -------- | -------- | -------- |
| {TC-XXX} | {風險}   | {措施}   |

---

## 8. 測試檔案清單

> 本計畫對應的測試檔案路徑

| 類型        | 檔案路徑                                          | 狀態          |
| ----------- | ------------------------------------------------- | ------------- |
| Unit        | `src/{module}/{module}.service.test.ts`           | 🔲 骨架待建立 |
| Integration | `tests/integration/{module}.test.ts`              | 🔲 骨架待建立 |
| Component   | `src/components/{Component}/{Component}.test.tsx` | 🔲 骨架待建立 |
| E2E         | `e2e/{feature}.spec.ts`                           | 🔲 骨架待建立 |

---

## 修訂記錄

| 版本 | 日期   | 修改人 | 變更說明 |
| ---- | ------ | ------ | -------- |
| v0.1 | {日期} | {作者} | 初稿建立 |
