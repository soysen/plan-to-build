---
name: tdd-build
description: "以 TDD 與漸進式切片 (Incremental Thin Slices) 實作任務。語意情境：當使用者表達「開始照著計畫寫程式 (TDD)」、「請實作 TASK-XXX 先寫測試」、「這個功能很大分批一步一步做」時觸發。"
argument-hint: "輸入要實作的任務 ID（如 TASK-001）或切片描述"
user-invocable: true
freedom: medium
models-tested: [flash, sonnet, opus]
---

# TDD 漸進式建置實作 (tdd-build)

## 目錄
1. [硬性規則 (Must)](#硬性規則-must)
2. [使用時機與核心循環](#使用時機與核心循環)
3. [切片與實作流程](#切片與實作流程)
4. [輸出規範與交接協定](#輸出規範與交接協定)
5. [延伸參考資源](#延伸參考資源)
6. [完成前檢核](#完成前檢核)

## 硬性規則 (Must)
1. **[MUST] 先紅後綠鐵律 (Iron Law of TDD)**：嚴禁在看見測試失敗 (🔴 Red) 前撰寫任何產品代碼。若已偷寫必須註解或暫存。
2. **[MUST] 最少通過代碼 (Minimum Passing Code)**：實作階段只寫能使測試轉綠的最少代碼，嚴禁自作主張添加未經測試的額外邏輯。
3. **[MUST] 杜絕三種說謊測試 (Anti-Cheat Testing)**：
   - 嚴禁同義反覆（如 `expect(true).toBe(true)` 或常數自比對）。
   - 嚴禁原始碼字串比對（如只讀取檔案比對函式名稱字串而不實際呼叫執行）。
   - 嚴禁過度 Mock 或吞掉異常（Mock 掉核心待測邏輯、catch 錯誤卻無 assertion 導致假綠燈）。
4. **[MUST] 鎖定公開介面 (Public Contract Only)**：測試只針對模組/函式/元件公開合約與行為驗收，嚴禁直接依賴或測試 private 實作細節。
5. **[MUST] 實體命令日誌證據**：切片完成時必須在 Task Card 附帶真實的測試指令執行日誌與 Exit Code 0，禁止口頭承諾。
6. **[MUST] 雙寫狀態同步**：推進切片時，必須同步更新 Build Plan 切片狀態與 `agent-status.md`。

## 使用時機與核心循環
- 建置計畫已確認，準備實作 `TASK-XXX`。
- 以 TDD 循環（Red ➔ Green ➔ Refactor）推進薄切片 (Thin Slices)。

## 切片與實作流程

### 第零階段：切片確認
1. 定位 `TASK-XXX`，劃分本輪切片範疇（例如 Slice 1 邏輯驗證 ➔ Slice 2 外部串接）。
2. 參考 [測試計畫與策略指南](./references/test-planning-strategy.md) 規劃案例。

### 第一階段：🔴 Red — 撰寫失敗測試
- 撰寫單元/整合測試，測試邊界條件與錯誤處理。
- **執行測試指令，確認終端機回傳明確的失敗 (Failed) 訊息。**

### 第二階段：🟢 Green — 最小實作
- 撰寫 Minimum Passing Code，使測試轉綠。
- **再次執行測試，確認狀態翻轉為 🟢 Green (Exit code: 0)。**

### 第三階段：🔵 Refactor — 重構
- 改善命名、消除重複，確保測試持續通過。

### 第四階段：交接與狀態雙寫
更新 `.github/harness/plan/*-build-plan.md` 與 `.github/worklog/agent-status.md`。

## 輸出規範與交接協定

```markdown
---
## 🤝 Agent Handoff Protocol (跨 Agent 交接協定)

### 1. 當前階段與狀態 (Current Stage)
- **Workflow Phase**: `TDD Build Slice Completed`
- **Active Task ID**: `TASK-001` (Slice 1/2)
- **Status**: `In Progress`

### 2. 本階段完成事項與決策 (Completed Decisions)
- [x] 🔴 撰寫測試並證實失敗 (npm test 報錯預期)
- [x] 🟢 完成最少實作，測試 100% 通過 (Exit code: 0)
- [x] 🔵 完成重構與無死代碼清理

### 3. 接手 Agent 執行指南 (Next Agent Actionable Guide)
- **Recommended Skill**: `tdd-build` (Slice 2)
- **Execution Criteria**:
  - [ ] 執行 `npm test` 確認無回歸
  - [ ] 實作 Slice 2 業務邏輯

### 4. 關鍵風險與未決問題 (Risks & Open Questions)
- ⚠️ 注意下游 API 端點尚在更新中。
---
```

## 延伸參考資源
- [測試計畫與案例設計策略](./references/test-planning-strategy.md)
- [測試環境設置指南](./references/test-setup-guide.md)
- [安全性檢核清單](./references/security-checklist.md)

## 完成前檢核
- [ ] 確實經歷 🔴 Red 階段並有真實失敗輸出記錄。
- [ ] 測試已 100% 轉為 🟢 Green 並通過所有既有測試。
- [ ] Evidence 欄位填寫具體測試指令與 Exit Code。
- [ ] 狀態已雙寫同步至 plan 與 agent-status。
- [ ] 尾端包含 `Agent Handoff Protocol`。
