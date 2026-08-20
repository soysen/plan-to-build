---
name: grill-me
description: "執行多輪主動質詢與壓力測試（Socratic Grilling / Devil's Advocate）。語意情境：當使用者表達「幫我 Grill 一下」、「質詢這個需求/架構」、「挑戰這個設計的盲點」、「/grill-me」時觸發。"
argument-hint: "貼上你想被質詢的需求、架構草稿或 API 設計"
user-invocable: true
---

# Grill-Me (主動質詢與壓力測試)

## 概覽

Agent 切換為 **Devil's Advocate (魔鬼代言人)** 角色，針對使用者提出的需求、架構或概念進行 3 輪主動質詢。核心目的在於開工前一次逼出隱藏假設、極限邊界與異常降級策略，達到 **一次到位 (One-Pass)**，減少開發中途反覆修改導致的 Token 浪費。

## 適用時機

- 在填寫 `analyze-spec` 或 `design-architecture` 之前，想對原始點子進行壓力測試。
- 使用者輸入 `/grill-me` 或要求「幫我找這個設計的盲點」、「質詢這個架構的漏洞」時。
- **Token 效益省耗目標 (Goal 1: One-Pass)**：在編寫正式規格與寫 Code 前，透過 3+ 輪深挖一次解決模糊空間。

## 質詢三大維度 (The 3-Layer Probing Framework)

Agent **必須**從以下三個維度向使用者提出連續性質詢（每次聚焦 2-3 個最具殺傷力的關鍵問題）：

### 1. 邊界與極限拷問 (Edge Cases & Scale Boundaries)
- **邊界極限**：「當資料筆數從 10 筆暴增至 100,000 筆時，前端 UI 的渲染與分頁策略為何？」
- **高頻與併發**：「若使用者連續快速點擊提交按鈕，或是兩個人同時修改同筆資料，系統如何防重與防鎖？」
- **輸入極致**：「若輸入欄位被貼上 1MB 的超長字串、Malicious Script (XSS) 或特殊 Unicode 字元，系統如何防禦？」

### 2. 假設與失敗模式攻擊 (Assumption & Failure Mode Attack)
- **網路與認證異常**：「當請求到一半網路斷線，或 Token 突然 401 過期時，使用者會看到什麼？有悲觀降級策略嗎？」
- **第三方依賴風險**：「若外部 API (如金流、AI Provider) 回應延遲超過 10 秒或直接 500 報錯，系統有 Circuit Breaker 或 Fallback 嗎？」
- **狀態污染**：「若使用者在步驟二突然後退回步驟一，頁面狀態與 Store 資料會被污染嗎？」

### 3. 範疇與過度設計質疑 (Scope & Over-Engineering Challenge)
- **簡單替代方案**：「這個功能真的需要加一套全新的資料庫/狀態庫嗎？有沒有更簡潔的純前端/既有 API 解法？」
- **非目標 (Non-goals) 界定**：「這個需求中，有哪些東西是『這次明確不做 (Out of Scope)』的？」

---

## 執行流程

1. **收集標的**：請使用者提供初始想法、需求敘述或架構圖（若無，自動讀取對應的 Spec/Plan 檔）。
2. **啟動質詢 (3 輪過招)**：
   - **Round 1 (極限與併發)**：針對邊界與數據極限提出 2-3 個具體問題。
   - **Round 2 (失敗與降級)**：針對斷網、401、Timeout 悲觀降級提出 2-3 個問題。
   - **Round 3 (範疇收斂)**：對過度設計與 Non-goals 進行確認。
3. **質詢總結寫入**：將答覆整理為「已知決策」與「防禦點清單」，並寫入 `Agent Handoff Protocol`。

---

## 輸出規範與 Agent Handoff Protocol

質詢完成後，將質詢結果寫入對應的 Spec/Plan 文件，並附帶標準交接協定：

```markdown
---
## 🤝 Agent Handoff Protocol (跨 Agent 交接協定)

### 1. 當前階段與狀態 (Current Stage)
- **Workflow Phase**: `Grill-Me Probing Completed`
- **Active Task ID**: `TASK-001`
- **Status**: `Ready for Spec / Design`

### 2. 本階段完成事項與決策 (Completed Decisions)
- [x] 完成 Grill-Me 3 輪質詢（確認採用 Pessimistic Locking 與 401 降級 UI）
- [x] 完成 Non-goals 明確界定

### 3. 接手 Agent 執行指南 (Next Agent Actionable Guide)
- **Recommended Skill**: `analyze-spec` 或 `design-architecture`
- **Next Target File**: `.github/harness/spec/{feature-name}-spec.md`
- **Execution Criteria**:
  - [ ] 將 Grill-Me 產出的 4 項防守點寫入 Spec 非功能需求
  - [ ] 繪製 Mermaid 狀態轉移與失敗降級流程圖

### 4. 關鍵風險與未決問題 (Risks & Open Questions)
- ⚠️ 第三方 API 尚無 Sandbox 可測試高頻 Retry。
---
```

## 驗證清單 (Definition of Done)

- [ ] 已發動 3 大維度（極限邊界、失敗模式、範疇質疑）的具體提問。
- [ ] 答案已整理為具體的防衛策略與 Non-goals。
- [ ] 產出包含 `Agent Handoff Protocol` 標籤區塊。
