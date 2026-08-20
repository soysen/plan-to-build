---
name: analyze-spec
description: "分析專案需求並開立規格文件。語意情境：當使用者表達「幫我把這段需求寫成 Spec」、「有客戶描述想轉為規格」或需要將模糊想法轉化為結構化 PRD 時觸發。"
argument-hint: "輸入初始需求描述或貼上需求草稿"
---

# 需求規格分析 (analyze-spec)

## 核心原則與行為邊界

> **[Guardrails] 絕對行為邊界**：
> 1. **Anti-Scope-Creep (禁止範疇蔓延)**：嚴禁 Agent 擅自添加使用者未要求的「額外功能」或「加值設計」。需求分析必須精準防守範疇。
> 2. **Explicit Non-Goals Mandatory (非目標防護槓桿)**：規格書中的「非目標 (Non-goals / Out-of-Scope)」定義必須與「目標 (Goals)」同等清晰與嚴謹。未明確定義 Non-goals 前**不得結案**。
> 3. **No Silent Selection on Conflicts (衝突公開)**：遭遇利害關係人需求衝突或技術矛盾時，**嚴禁** Agent 靜默自行挑選。必須將 Choice Vector 與 Trade-offs 列出供 Decider (決策者) 拍板。

## 適用時機

- 收到模糊的需求描述或草稿，需要結構化為正式規格 (PRD / RFC / Spec)
- 需要評估需求可行性 (Technical Feasibility) 並識別潛在風險 (Risk Mitigation)
- 開發前的團隊/利益關係人對齊 (Stakeholder Alignment)
- **Token 效益省耗目標 (Goal 1: One-Pass)**：在開工前透過主動質詢 (Grill-Me) 一次釐清所有邊界與驗收條件，避免反覆修改導致 Token 暴增。

若目前還不確定問題是否真實、目標使用者是否成立、或替代方案是否足夠差，先改用 `problem-validation`，不要把未驗證假設直接寫成 spec。

## 流程步驟

### 第一階段：需求收集與 `/grill-me` 主動質詢

1. 請使用者提供原始需求（文字、圖片、草稿皆可）。
2. **啟動 `/grill-me` 主動質詢 (3+ 輪深挖)**：
   - **假設挑戰**：「這個功能在網路斷線、401 Token 過期或 Timeout 時有悲觀降級策略嗎？」
   - **邊界與極限挑戰**：「當資料量超過 10,000 筆，或是使用者進行高頻連續點擊時，系統的反應策略為何？」
   - **衝突與狀態挑戰**：「是否有任何併發寫入衝突？是否與既有 Store/API 結構發生牴觸？」
3. 識別五個核心面向的缺口：**目標**、**使用者**、**範疇**、**成功標準**、**限制條件**。

### 第二階段：需求分析與分級 (Task Grading)

1. 將需求拆分為**功能性需求**（Functional）與**非功能性需求**（Non-functional）。
2. 進行任務分級（`micro` / `standard` / `heavy`），決定後續審查門檻。
3. 處理需求衝突，將 Choice Vector 與 Trade-offs 條列交由 Decider 拍板。

### 第三階段：產出與小區塊確認 (Bite-sized Spec Delivery)

1. 先輸出 **Bite-sized Summary**（目標 & 非目標、核心 Happy Path 流程、高風險限制）供使用者確認。
2. 確認後寫入實體檔案：`.github/harness/spec/{feature-name}-spec.md` 或 `docs/spec/{project-name}-spec-{YYYY-MM-DD}.md`。
3. **強制附帶 `Agent Handoff Protocol` 區塊**。

---

## 輸出規範與 Agent Handoff Protocol

規格書必須實體寫入檔案，且必須包含標準交接協定（方便使用者隨時 Reset 視窗）：

```markdown
---
## 🤝 Agent Handoff Protocol (跨 Agent 交接協定)

### 1. 當前階段與狀態 (Current Stage)
- **Workflow Phase**: `Spec Definition`
- **Active Task ID**: `TASK-001`
- **Status**: `Ready for Design`

### 2. 本階段完成事項與決策 (Completed Decisions)
- [x] 完成 `/grill-me` 邊界質詢（確認採用悲觀鎖定與 401 自動刷新）
- [x] 完成 Functional & Non-Functional 需求定案
- [x] 完成 Non-Goals 範圍邊界劃定

### 3. 接手 Agent 執行指南 (Next Agent Actionable Guide)
- **Recommended Skill**: `design-architecture`
- **Next Target File**: `.github/harness/design/{feature-name}-architecture.md`
- **Execution Criteria**:
  - [ ] 依據本 Spec 第 3 節點劃分 API Service 與 Store 結構
  - [ ] 繪製 Mermaid 狀態轉移圖與資料流向

### 4. 關鍵風險與未決問題 (Risks & Open Questions)
- ⚠️ 需注意第三方 API 頻率限制 (Rate Limit: 100 req/min)。
---
```

## 參考資源

- [需求釐清問卷](./references/requirement-questions.md)
- [規格書範本](./assets/spec-template.md)
