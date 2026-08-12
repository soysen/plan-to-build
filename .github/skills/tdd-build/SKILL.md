---
name: tdd-build
description: "以 TDD 方式逐一實作任務。語意情境：當使用者表達「開始照著計畫寫程式 (TDD)」、「請實作 TASK-XXX 先寫測試」時觸發。"
argument-hint: "輸入要實作的任務 ID（如 TASK-001）或任務描述"
---

# TDD 建置實作

## 使用時機

- 建置計畫（`docs/plan/build-plan-*.md`）已確認
- 準備開始實作某個具體任務（`TASK-XXX`）
- 需要以 TDD Red-Green-Refactor 循環進行開發

## 核心原則：Red → Green → Refactor (TDD Loop)

> **[Guardrails] 絕對行為邊界 (Iron Law of TDD & Anti-Rationalization)**：
> 1. **🔴 Red Phase**：你**絕對不允許**在這個階段寫出任何「非測試」的產品實作代碼。你必須先寫測試，並用終端機執行指令（如 `npm test`）來**證明該測試失敗**。
> 2. **🚫 Anti-Rationalization (嚴禁自我合理化)**：你不得以「這改動很小」、「先寫程式碼比較好設計測試」、「稍後再補測試」等理由跳過 🔴 Red 階段。若你發現自己已經先撰寫了實作代碼，**必須將實作暫存或註解，將狀態還原至只有測試且測試失敗報告**，才可繼續。
> 3. **🟢 Green Phase**：在確認測試失敗前，禁止進入此階段。實作時，只寫能讓測試通過的**最少程式碼** (Minimum Passing Code)，不要超前部署或過度設計 (YAGNI)。

---

## 流程步驟

### 第零階段：確認任務範疇 (Scope Verification)

1. 讀取建置計畫（`docs/plan/build-plan-*.md`），定位 `TASK-XXX`。
2. 驗證 Dependencies (前置任務) 是否皆已完成，並取得對應的 SA/SD (系統分析/設計) 規格。

### 第一階段：環境確認 (Environment Setup)

確認測試框架與指令（依據技術棧：`npm test`, `vitest`, `playwright test` 等）。

### 第二階段：🔴 Red — 撰寫失敗測試

依任務類型選定測試策略：
- **Backend API**：撰寫 Integration Test (整合測試)，Mock 外部依賴，測試 Request/Response 合約與 HTTP Status Codes。
- **Business Logic**：撰寫 Unit Test (單元測試)，驗證 Edge Cases 與錯誤處理。
- **Frontend Component**：撰寫 Component Test (元件測試，如 Testing Library)，驗證 DOM 行為與 User Events。

**執行測試指令，並確保終端機輸出包含明確的失敗 (Failed) 訊息。**若無失敗，代表測試無效。

### 第三階段：🟢 Green — 最小實作

1. 依照 SD 規格，實作 Minimum Passing Code。
2. 嚴格遵守 Security Best Practices (如 Parameterized SQL 預防 Injection, Zod/Joi 執行 Schema Validation, 不留存明文密碼)。
3. **執行測試，確認狀態翻轉為 🟢 Green (All Tests Passed)。**

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
