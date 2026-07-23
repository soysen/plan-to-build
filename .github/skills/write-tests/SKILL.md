---
name: write-tests
description: "產出測試計畫文件與單元測試。語意情境：當使用者表達「幫我寫單元測試」、「產出測試計畫」、「需要覆蓋率報告」時觸發。"
argument-hint: "輸入要產出測試的模組名稱（如 MOD-001）或任務 ID（如 TASK-001），或輸入 all 全部產出"
---

## 核心原則與行為邊界

> **[Guardrails] 絕對行為邊界**：
> 1. **關注點分離 (Separation of Concerns)**：本 Skill 的職責**僅限於**規劃 Test Plan 與建立測試骨架（`*.test.ts` / `*.spec.ts`）。**絕對禁止**跨界編輯 `src/` 或產品邏輯代碼。
> 2. **No Fake Assertions (禁止假斷言)**：測試骨架主體必須保留 `// TODO: 實作` 或明示的 Placeholder，禁止為了讓測試「看起來通過」而寫下空的斷言 (`expect(true).toBe(true)`)。

## 適用時機

- SA / SD 文件已確認，準備系統性地規劃測試策略 (Test Pyramid Allocation)
- 需要在 TDD 實作前建立測試計畫文件 (Test Plan Specification)
- 需要為特定模組產出規範化的測試檔案骨架 (AAA Pattern Structure)
- 需要定義 Code Coverage 門檻與測試分層 (Unit / Integration / Component / E2E)

## 輸入來源

優先讀取（依序）：

1. `docs/design/sd-*.md`（API 設計、Schema、元件定義）
2. `docs/design/sa-*.md`（模組清單、Use Case Sequence）
3. `docs/plan/build-plan-*.md`（任務清單與優先序）

---

## 流程步驟

### 第一階段：解析技術文件

1. 從 SD 文件中提取：
   - 所有 API 端點（Method、路由、Request/Response Schema）
   - 資料庫 Schema（資料表與欄位型別）
   - 前端元件定義（Props、使用者互動、狀態）
2. 從 SA 文件中提取：
   - 每個 Use Case 的 Sequence（正常流程 + 例外流程）
   - 模組邊界與相依關係
3. 識別需要測試的「決策點」：條件判斷、驗證邏輯、錯誤處理、權限檢查

### 第二階段：制定測試策略

依照 [測試分層策略](./references/test-strategy-guide.md) 為每個模組決定：

| 測試類型         | 適用對象                       | 工具                     |
| ---------------- | ------------------------------ | ------------------------ |
| Unit Test        | Service / Domain Logic / Utils | Vitest                   |
| Integration Test | API Routes（含 DB）            | Vitest + supertest       |
| Component Test   | React / Vue 元件               | Vitest + Testing Library |
| E2E Test         | 完整使用者流程                 | Playwright               |

並標記每個模組的覆蓋率目標：

- 業務邏輯（Service）：≥ 90%
- API 路由（Controller）：≥ 80%
- 前端元件：≥ 70%
- 工具函式：≥ 90%

### 第三階段：產出測試計畫文件

讀取 [測試計畫範本](./assets/test-plan-template.md)，填入所有模組的測試案例清單，**寫入**：

- **路徑**：`docs/test/test-plan-{YYYY-MM-DD}.md`
- 若 `docs/test/` 不存在，先建立目錄
- **必須實際寫入檔案，不可只在對話中顯示**

### 第四階段：產出測試檔案骨架

依照 [單元測試範例](./references/unit-test-examples.md) 為每個模組產出測試檔案，包含：

1. **後端 Service Unit Tests**（`src/{module}/{module}.service.test.ts`）：
   - 正常路徑（Happy Path）的 `it` 區塊骨架
   - 所有已識別的例外情況（`it` 區塊 + 預期錯誤）
   - Mock 設定骨架（`vi.mock`）

2. **API Integration Tests**（`tests/integration/{module}.test.ts`）：
   - 每個端點的 HTTP 狀態碼測試
   - 驗證 Request / Response Schema 的測試
   - 權限測試（未認證 / 無權限）

3. **前端 Component Tests**（`src/{component}/{component}.test.tsx`）：
   - 渲染測試（snapshot 或 element 存在）
   - 使用者互動測試（click、input、submit）
   - Props 與狀態變化測試

所有測試骨架需包含：

- 正確的 `import` 語句
- `describe` 群組結構
- 每個 `it` 區塊有清楚的描述（中文）
- `// Arrange / Act / Assert` 註解佔位
- **測試主體為 `// TODO: 實作` 佔位符**（不預先實作）

將所有測試檔案**實際寫入**對應路徑。

### 第五階段：完成確認

1. 列出所有已建立的測試檔案路徑
2. 輸出測試案例統計（依模組 / 依類型）
3. 標記高風險測試項目（複雜業務邏輯、外部相依）
4. 建議下一步：執行 `/tdd-build TASK-XXX` 逐一實作

### 第六階段：執行測試並產出測試報告

> 此階段在測試骨架已填寫完畢（TDD 實作完成後）執行，也可單獨觸發（關鍵字：**測試報告**、**test report**、**coverage report**）。

1. 執行以下指令收集測試結果：

   ```bash
   # 執行測試並產出 JSON 格式覆蓋率
   pnpm test:coverage -- --reporter=json --outputFile=coverage/results.json

   # E2E 測試（若有）
   pnpm test:e2e -- --reporter=json > coverage/e2e-results.json
   ```

2. 解析測試結果，收集以下數據：
   - 每個測試檔案的通過 / 失敗 / 跳過數量
   - 各模組的行覆蓋率（Line）、分支覆蓋率（Branch）、函式覆蓋率（Function）
   - 失敗測試的錯誤訊息摘要

3. 比對 `docs/test/test-plan-*.md` 的 TC 清單，更新每個測試案例的狀態：
   - `✅ 通過`
   - `❌ 失敗`（附上錯誤摘要）
   - `⏭ 跳過`

4. 讀取 [測試報告範本](./assets/test-report-template.md)，填入所有數據，**寫入**：
   - **路徑**：`docs/test/test-report-{YYYY-MM-DD}.md`
   - 若測試有失敗項目，額外列出需建立 Bug Issue 的清單
   - **必須實際寫入檔案，不可只在對話中顯示**

5. 回報摘要：
   - 整體通過率
   - 覆蓋率是否達到目標
   - 未達標模組清單與建議行動

---

## 測試命名規範

### 測試描述格式

```
[情境] 應該 [預期行為]
[情境] 當 [條件] 時，應該 [預期行為]
```

範例：

- ✅ `'應在憑證正確時回傳 access token'`
- ✅ `'當 email 格式錯誤時，應顯示驗證錯誤'`
- ✅ `'當使用者無權限時，應回傳 403'`
- ❌ `'test login'`（太模糊）
- ❌ `'works correctly'`（無意義）

### 檔案命名

| 類型             | 位置                 | 命名                   |
| ---------------- | -------------------- | ---------------------- |
| Unit Test        | 原始碼旁             | `{file}.test.ts`       |
| Integration Test | `tests/integration/` | `{module}.test.ts`     |
| Component Test   | 元件旁               | `{Component}.test.tsx` |
| E2E Test         | `e2e/`               | `{feature}.spec.ts`    |

---

## 輸出規範

| 產出物       | 路徑                                    | 產出時機               |
| ------------ | --------------------------------------- | ---------------------- |
| 測試計畫文件 | `docs/test/test-plan-{YYYY-MM-DD}.md`   | 第三階段               |
| 測試骨架檔案 | 原始碼對應路徑                          | 第四階段               |
| 測試報告文件 | `docs/test/test-report-{YYYY-MM-DD}.md` | 第六階段（實作完成後） |

- **所有文件必須實際寫入檔案，不可只在對話中顯示**

---

## 參考資源

- [測試分層策略](./references/test-strategy-guide.md)
- [單元測試範例](./references/unit-test-examples.md)
- [測試計畫範本](./assets/test-plan-template.md)
- [測試報告範本](./assets/test-report-template.md)
