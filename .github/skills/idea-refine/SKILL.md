---
name: idea-refine
description: "提煉原始想法並驗證問題真實性。語意情境：當使用者表達「我有個點子但不知道怎麼開始」、「這個需求/痛點合理嗎」、「想探索功能方向」時觸發。"
argument-hint: "描述你的原始想法或問題，例如：我想建置一個幫助開發者追蹤學習進度的工具"
user-invocable: true
freedom: high
models-tested: [flash, sonnet, opus]
---

# 想法提煉與問題驗證 (idea-refine)

## 目錄
1. [硬性規則 (Must)](#硬性規則-must)
2. [概覽與適用時機](#概覽與適用時機)
3. [執行流程](#執行流程)
4. [輸出規範與交接協定](#輸出規範與交接協定)
5. [完成前檢核](#完成前檢核)

## 硬性規則 (Must)
1. **[MUST] 驗證問題真實性**：必須先釐清需求是「止痛藥」還是「維他命」，若已有零成本完美替代品必須觸發終止警告。
2. **[MUST] 明確畫出邊界**：產出文件必須嚴格區分 `MVP In-Scope` 與 `Out-of-Scope`，嚴禁定義模糊的大雜燴。
3. **[MUST] 保留交接快照**：產出文件尾端必須包含標準 `Agent Handoff Protocol` 區塊。

## 概覽與適用時機
結合 **Problem Validation (問題真實性驗證)**、**Superpower 抽象能力** 與 **GrillMe (壓力測試)**，將模糊點子轉化為具備商業價值與技術可行性的 MVP 概念。

### 適用時機
- 需驗證痛點是否真實成立、使用者是否真有需求。
- 具體化模糊想法或定義 MVP 範疇。
- 投入實作前需識別 Core Assumptions (核心假設) 與 Market Gap (市場空白)。

## 執行流程

### Phase 0：Problem Validation (問題真實性驗證)
1. **痛點真實性檢查**：確認解決的問題是痛點而非偽需求。
2. **使用者情境確認**：確認目標使用者是誰、在什麼特定情境下會遭遇此問題。
3. **替代方案掃描**：檢查使用者目前如何解決？若免費現成解法已完美滿足，建議止步。

### Phase 1：結構化發散 (Divergence)
1. **重述問題**：套用 `HMW (How Might We)` 框架，釐清真實本質。
2. **上下文探索**：透過 3-5 個關鍵問題釐清 Target Audience、Success Metrics 與 Constraints。
3. **生成變體**：產出差異化架構與功能方向供評估。

### Phase 2：壓力測試與收斂 (Convergence)
1. **蘇格拉底式提問**：針對價值主張、技術可行性與切換成本進行壓力測試。
2. **Kill Criteria 驗證**：若假設無法驗證，建議 Pivot 或暫停。

### Phase 3：產出概念文件
產出一頁式 Markdown 概念文件 (`docs/ideas/[idea-name].md` 或 `.github/harness/discovery/discovery-[YYYY-MM-DD].md`)。

## 輸出規範與交接協定

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

## 完成前檢核
- [ ] 已通過問題真實性檢查並掃描替代方案。
- [ ] 已進行壓力測試並列出盲點與潛在風險。
- [ ] 產出包含明確 In-Scope 與 Out-of-Scope 的 Markdown 概念文件。
- [ ] 文件結尾已具備完整 `Agent Handoff Protocol`。
