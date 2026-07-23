---
name: idea-refine
description: "提煉原始想法為可執行概念。語意情境：當使用者表達「我有個點子但不知道怎麼開始」、「想探索功能方向」、「幫我腦力激盪一下」時觸發。"
argument-hint: "描述你的原始想法或問題，例如：我想建置一個幫助開發者追蹤學習進度的工具"
user-invocable: true
---

# 想法提煉

## 概覽

透過結構化的發散與收斂，將模糊點子轉化為具備商業價值與可行性的 MVP 概念。核心手段包含 HMW (How Might We) 框架、Socratic Grilling (蘇格拉底式壓力測試) 與明確的 Kill Criteria。

## 適用時機

- 需具體化模糊想法或定義 MVP (Minimum Viable Product) 範疇。
- 投入實作前需識別 Core Assumptions (核心假設) 與 Market Gap (市場空白)。

## 執行階段 (Phases)

### Phase 1：理解與發散 (Divergence)

1. **重述問題 (Problem Restatement)**：強制套用 `HMW (How Might We)` 框架，釐清真實痛點。
2. **Context Discovery (上下文探索)**：透過 3-5 個關鍵問題釐清 Target Audience (目標受眾)、Success Metrics (成功指標) 與 Constraints (限制條件)。
3. **市場掃描 (Market Scanning)**：檢查現有解法 (Competitors / Workarounds)。若現有解法已完美滿足需求，**立即觸發終止**。
4. **生成變體 (Generate Variants)**：透過視角轉換 (反轉、移除限制、10x Scale、簡化) 產出 5-8 個差異化方向。

### Phase 2：Socratic Grilling 與收斂 (Convergence)

**此階段為本 Skill 核心。Agent 必須扮演 Devil's Advocate (魔鬼代言人)，對篩選出的 2-3 個方向進行無情但不失善意的壓力測試。**

1. **Socratic Grilling (蘇格拉底式提問)**：
   針對每個方向發動攻擊，主動戳破盲點與邏輯缺漏：
   - *Value Proposition (價值主張)* 夠強嗎？是 Painkiller (止痛藥) 還是 Vitamin (維他命)？
   - *Technical Feasibility (技術可行性)* 有無致命缺陷？
   - *Switching Cost (切換成本)* 是否高到使用者不願採用？
2. **Impact-Effort Matrix (影響力-付出矩陣)**：將方向定位於矩陣中，尋找 High Impact / Low Effort 的 Sweet Spot 作為 MVP 首選。
3. **Kill Criteria (終止條件驗證)**：若觸發以下任一，立即建議 Pivot (轉軸) 或暫停：
   - 存在免費、成熟且涵蓋率 100% 的替代方案。
   - 核心假設 (Core Assumptions) 無法在短週期內驗證。
   - 缺乏明確的 Target Audience 或付費意願。
4. **明確列出 Assumptions & Risks (隱藏假設與風險)**。

### Phase 3：產出規格 (Artifact Generation)

產出一頁式 Markdown 概念文件 (`docs/ideas/[idea-name].md`)，包含：
1. **Problem Statement** (HMW 格式)
2. **Value Proposition** (為了 [TA]，在 [Context]，提供 [Core Value]，不像 [Competitors]，我們 [Differentiation])
3. **Recommended Direction**
4. **Core Assumptions to Validate**
5. **MVP Scope (In-Scope / Out-of-Scope)**
6. **Open Questions**

> **Guardrails (行為邊界)**：
> - **絕對不允許**在一味附和使用者的想法。若點子有邏輯漏洞，必須直接指出。
> - **必須**明確定義 Out-of-Scope (不做什麼)。
> - 在確認想法具備基本可行性前，**禁止**直接跳入架構設計或撰寫程式碼。

## 驗證清單 (Definition of Done)

- [ ] 已進行 Socratic Grilling 並明確列出盲點與風險。
- [ ] 產出包含明確 In-Scope 與 Out-of-Scope 的 Markdown 概念文件。
- [ ] 使用者確認最終方向。
