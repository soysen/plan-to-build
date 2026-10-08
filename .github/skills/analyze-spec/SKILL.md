---
name: analyze-spec
description: "分析專案需求並開立規格文件。語意情境：當使用者表達「幫我把這段需求寫成 Spec」、「有客戶描述想轉為規格」或需要將模糊想法轉化為結構化 PRD 時觸發。"
argument-hint: "輸入初始需求描述或貼上需求草稿"
user-invocable: true
freedom: medium
models-tested: [flash, sonnet, opus]
---

# 需求規格分析 (analyze-spec)

## 目錄
1. [硬性規則 (Must)](#硬性規則-must)
2. [適用時機](#適用時機)
3. [流程步驟](#流程步驟)
4. [輸出規範與交接協定](#輸出規範與交接協定)
5. [參考資源](#參考資源)
6. [完成前檢核](#完成前檢核)

## 硬性規則 (Must)
1. **[MUST] 禁止範疇蔓延 (Anti-Scope-Creep)**：嚴禁 Agent 擅自添加未要求的「額外功能」或「加值設計」。
2. **[MUST] 明確界定 Non-goals**：規格書中必須具備明確且獨立的 `Non-goals (非目標)` 區塊，否則不得標記結案。
3. **[MUST] 包含 ≥ 3 條客觀驗收標準**：驗收標準 (Acceptance Criteria) 必須可量化、可測試，不得使用主觀形容詞。
4. **[MUST] 衝突公開不靜默**：遭遇需求衝突時，禁止擅自決定，必須列出 Trade-offs 供人類拍板。
5. **[MUST] 附帶交接協定**：產出規格書結尾必須包含標準 `Agent Handoff Protocol`。

## 適用時機
- 收到模糊的需求描述或草稿，需要結構化為正式規格 (PRD / RFC / Spec)。
- 需要評估需求可行性 (Technical Feasibility) 並識別潛在風險。
- 開發前的團隊/利益關係人對齊 (Stakeholder Alignment)。

## 流程步驟

### 第一階段：需求收集與 `/grill-me` 主動質詢
1. 請使用者提供原始需求（文字、圖片、草稿皆可）。
2. **啟動質詢深挖**：
   - 假設挑戰（斷網、401 Token 過期、Timeout 悲觀降級）。
   - 邊界與極限挑戰（高數據量、高頻連續點擊）。
   - 衝突與狀態挑戰（併發衝突、Store 污染）。
3. 識別五個核心面向：**目標**、**使用者**、**範疇**、**成功標準**、**限制條件**。

### 第二階段：需求分析與分級
1. 將需求拆分為**功能性需求**（Functional）與**非功能性需求**（Non-functional）。
2. 進行任務分級（`micro` / `standard` / `heavy`），決定後續追蹤與審查門檻。
3. 處理需求衝突，將選項向量與權衡交由決策者拍板。

### 第三階段：產出與確認 (Bite-sized Spec Delivery)
1. 先輸出 **Bite-sized Summary**（目標、非目標、Happy Path、高風險限制）供確認。
2. 確認後寫入實體檔案：`.github/harness/spec/{feature-name}-spec.md`。
3. **強制附帶 `Agent Handoff Protocol` 區塊**。

## 輸出規範與交接協定

```markdown
---
## 🤝 Agent Handoff Protocol (跨 Agent 交接協定)

### 1. 當前階段與狀態 (Current Stage)
- **Workflow Phase**: `Spec Definition`
- **Active Task ID**: `TASK-001`
- **Status**: `Ready for Design`

### 2. 本階段完成事項與決策 (Completed Decisions)
- [x] 完成邊界質詢（確認採用悲觀鎖定與 401 自動刷新）
- [x] 完成 Functional & Non-Functional 需求定案
- [x] 完成 Non-Goals 範圍邊界劃定

### 3. 接手 Agent 執行指南 (Next Agent Actionable Guide)
- **Recommended Skill**: `design-architecture`
- **Next Target File**: `.github/harness/design/{feature-name}-architecture.md`
- **Execution Criteria**:
  - [ ] 依據本 Spec 第 3 節劃分 API Service 與 Store 結構
  - [ ] 繪製 Mermaid 狀態轉移圖與資料流向

### 4. 關鍵風險與未決問題 (Risks & Open Questions)
- ⚠️ 需注意第三方 API 頻率限制 (Rate Limit: 100 req/min)。
---
```

## 參考資源
- [需求釐清問卷](./references/requirement-questions.md)
- [規格書範本](./assets/spec-template.md)

## 完成前檢核
- [ ] 規格書包含明確的 Goals 與 Non-goals。
- [ ] 包含至少 3 條客觀、確定性可驗證的驗收標準 (Acceptance Criteria)。
- [ ] 潛在邊界情況與失敗降級策略已明確定義。
- [ ] 檔案實體寫入 `.github/harness/spec/{feature-name}-spec.md`。
- [ ] 尾端具備完整的 `Agent Handoff Protocol`。
