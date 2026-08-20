---
name: tdd-build
description: "以 TDD 與漸進式切片 (Incremental Thin Slices) 實作任務。語意情境：當使用者表達「開始照著計畫寫程式 (TDD)」、「請實作 TASK-XXX 先寫測試」、「這個功能很大分批一步一步做」時觸發。"
argument-hint: "輸入要實作的任務 ID（如 TASK-001）或切片描述"
user-invocable: true
---

# TDD 漸進式建置實作 (tdd-build)

## 使用時機

- 建置計畫（`docs/plan/build-plan-*.md`）已確認。
- 準備開始實作某個具體任務（`TASK-XXX`）或大型功能的薄切片 (Thin Slices)。
- 需要以 TDD Red-Green-Refactor 循環搭配 Checkpoint 逐步交付。
- **Token 效益省耗目標 (Goal 3: Targeted Trimming)**：按切片精準編寫與測試，避免一次載入大量程式碼造成 Token 暴增。

## 核心原則：Red → Green → Refactor (TDD Loop)

> **[Guardrails] 絕對行為邊界 (Iron Law of TDD & Incremental Execution)**：
> 1. **🔴 Red Phase**：你**絕對不允許**在這個階段寫出任何「非測試」的產品實作代碼。你必須先寫測試，並用終端機執行指令（如 `npm test`）來**證明該測試失敗**。
> 2. **🚫 Anti-Rationalization (嚴禁自我合理化)**：你不得以「這改動很小」、「先寫程式碼比較好設計測試」等理由跳過 🔴 Red 階段。若你發現自己已經先撰寫了實作代碼，必須暫存或註解，將狀態還原至只有測試失敗報告。
> 3. **🟢 Green Phase**：實作時，只寫能讓測試通過的**最少程式碼** (Minimum Passing Code)。
> 4. **薄切片隔離 (Incremental Slice Isolation)**：一次只推進一個切片 (Slice)，並在每個切片完成時寫入 Checkpoint，更新 `Agent Handoff Protocol`。

---

## 流程步驟

### 第零階段：切片與任務確認 (Slice & Scope Verification)
1. 讀取建置計畫（`docs/plan/build-plan-*.md`），定位 `TASK-XXX`。
2. 劃分本輪的薄切片範疇（例如：Slice 1 UI Component ➔ Slice 2 Data Store ➔ Slice 3 API Integration）。

### 第一階段：🔴 Red — 撰寫失敗測試
- **Backend API**：撰寫 Integration Test (整合測試)，Mock 外部依賴，測試 Request/Response 合約與 HTTP Status Codes。
- **Business Logic**：撰寫 Unit Test (單元測試)，驗證 Edge Cases 與錯誤處理。
- **Frontend Component**：撰寫 Component Test (元件測試)。
**執行測試指令，確保終端機輸出包含明確的失敗 (Failed) 訊息。**

### 第二階段：🟢 Green — 最小實作
1. 依照 SD 規格，實作 Minimum Passing Code。
2. 遵守 Security Best Practices。
3. **執行測試，確認狀態翻轉為 🟢 Green (All Tests Passed)。**

### 第三階段：🔵 Refactor — 重構
1. 消除重複程式碼（DRY），改善命名。
2. 確認符合專案編碼規範。測試持續 🟢 Green。

### 第四階段：Checkpoint 寫入與 Agent Handoff Protocol
在每個薄切片完成時，寫入 Checkpoint 並更新 Task Card 狀態：

```markdown
---
## 🤝 Agent Handoff Protocol (跨 Agent 交接協定)

### 1. 當前階段與狀態 (Current Stage)
- **Workflow Phase**: `TDD Build Slice Completed`
- **Active Task ID**: `TASK-001` (Slice 1/3)
- **Status**: `In Progress`

### 2. 本階段完成事項與決策 (Completed Decisions)
- [x] 🔴 撰寫 TASK-001 切片 1 測試案例
- [x] 🟢 完成最少實作，測試 100% 通過
- [x] 🔵 完成邏輯抽離與重構

### 3. 接手 Agent 執行指南 (Next Agent Actionable Guide)
- **Recommended Skill**: `tdd-build` (Slice 2)
- **Execution Criteria**:
  - [ ] 執行 `npm test` 確認既有測試無迴歸
  - [ ] 繼續實作 Slice 2 (API 串接)

### 4. 關鍵風險與未決問題 (Risks & Open Questions)
- ⚠️ 注意 Slice 3 需與 backend API 團隊確認最新 Endpoint Schema。
---
```

---

## 測試覆蓋率目標

| 類型 | 最低目標 | 建議目標 |
| --- | :---: | :---: |
| 業務邏輯（Service / Domain） | 90% | 100% |
| API 路由（Controller） | 80% | 90% |
| 前端元件 | 70% | 80% |
| 工具函式（Utils） | 90% | 100% |
