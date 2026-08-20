---
name: idea-refine
description: "提煉原始想法並驗證問題真實性。語意情境：當使用者表達「我有個點子但不知道怎麼開始」、「這個需求/痛點合理嗎」、「想探索功能方向」時觸發。"
argument-hint: "描述你的原始想法或問題，例如：我想建置一個幫助開發者追蹤學習進度的工具"
user-invocable: true
---

# 想法提煉與問題驗證 (idea-refine)

## 概覽

結合 **Problem Validation (問題真實性驗證)**、**Superpower 架構抽象能力** 與 **GrillMe (壓力測試)**，將模糊點子轉化為具備商業價值與技術可行性的 MVP 概念。

## 適用時機

- 需驗證痛點是否真實成立、使用者是否真有需求。
- 具體化模糊想法或定義 MVP (Minimum Viable Product) 範疇。
- 投入實作前需識別 Core Assumptions (核心假設) 與 Market Gap (市場空白)。
- **Token 效益省耗目標 (Goal 1: One-Pass)**：引導使用者在發想階段即確立痛點與範疇，減少無效反覆發問。

## 執行階段 (Phases)

### Phase 0：Problem Validation (問題真實性驗證)
1. **痛點真實性檢查 (Pain Point Validation)**：確認解決的問題是「止痛藥 (Painkiller)」還是「維他命 (Vitamin)」。
2. **使用者情境確認 (User Persona & Context)**：確認目標使用者是誰、在什麼情境下會遭遇此問題。
3. **現有替代方案掃描 (Alternative Scanning)**：檢查使用者目前如何解決？若現有免費解法已 100% 完美解決，觸發 Kill Criteria 終止。

### Phase 1：Superpower 結構化發散 (Divergence)
1. **重述問題 (Problem Restatement)**：套用 `HMW (How Might We)` 框架，釐清真實痛點。
2. **Context Discovery (上下文探索)**：透過 3-5 個關鍵問題釐清 Target Audience、Success Metrics 與 Constraints。
3. **生成變體 (Generate Variants)**：產出 5-8 個差異化架構與功能方向。

### Phase 2：GrillMe 壓力測試與收斂 (Convergence)
1. **Socratic Grilling (蘇格拉底式提問)**：針對價值主張、技術可行性與切換成本進行 3+ 輪壓力測試。
2. **Kill Criteria 驗證**：若假設無法驗證，建議 Pivot 或暫停。

### Phase 3：Superpower 產出與 Agent Handoff Protocol
產出一頁式 Markdown 概念文件 (`docs/ideas/[idea-name].md` 或 `.github/harness/discovery/discovery-[YYYY-MM-DD].md`)，內含 Problem Statement, Value Proposition, Recommended Direction, MVP Scope (In/Out) 與 Agent Handoff Protocol。

---

## 輸出規範與 Agent Handoff Protocol

```markdown
---
## 🤝 Agent Handoff Protocol (跨 Agent 交接協定)

### 1. 當前階段與狀態 (Current Stage)
- **Workflow Phase**: `Concept Discovery & Problem Validation`
- **Active Task ID**: `TASK-000`
- **Status**: `Ready for Spec Definition`

### 2. 本階段完成事項與決策 (Completed Decisions)
- [x] 完成 Phase 0 問題真實性驗證與現有替代方案掃描
- [x] 完成 HMW 問題重述與 Target Audience 劃定
- [x] 完成 GrillMe 價值主張測試與 MVP Scope 劃定

### 3. 接手 Agent 執行指南 (Next Agent Actionable Guide)
- **Recommended Skill**: `analyze-spec`
- **Next Target File**: `.github/harness/spec/{feature-name}-spec.md`
- **Execution Criteria**:
  - [ ] 依據本概念文件開立正式需求規格書 (PRD / RFC)

### 4. 關鍵風險與未決問題 (Risks & Open Questions)
- ⚠️ 核心假設需在第 1 個 Sprint 內透過 Mock UI 驗證。
---
```

## 驗證清單 (Definition of Done)

- [ ] 已通過 Phase 0 問題真實性檢查。
- [ ] 已進行 Socratic Grilling 並明確列出盲點與風險。
- [ ] 產出包含明確 In-Scope 與 Out-of-Scope 的 Markdown 概念文件。
- [ ] 產出包含 `Agent Handoff Protocol` 標籤區塊。
