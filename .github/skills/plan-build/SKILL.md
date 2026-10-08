---
name: plan-build
description: "產出可執行的建置計畫與任務拆解。語意情境：當使用者表達「Spec 確認了，幫我規劃任務跟點數」、「產生開發 GitHub Issues 清單」時觸發。"
argument-hint: "輸入 SA/SD 文件路徑，或直接描述已確認的設計內容"
user-invocable: true
freedom: medium
models-tested: [flash, sonnet, opus]
---

# 建置計畫規劃 (plan-build)

## 目錄
1. [硬性規則 (Must)](#硬性規則-must)
2. [使用時機與輸入來源](#使用時機與輸入來源)
3. [流程步驟](#流程步驟)
4. [輸出規範與交接協定](#輸出規範與交接協定)
5. [參考資源](#參考資源)
6. [完成前檢核](#完成前檢核)

## 硬性規則 (Must)
1. **[MUST] 垂直切片優先 (Vertical Slices)**：任務必須依使用者功能垂直切分，每個切片需可獨立測試，禁止將整個專案水平切為純 DB / 純 API / 純 UI。
2. **[MUST] 每個切片具備驗收命令**：每個 TASK 必須明確宣告驗收標準與具體驗證指令（例如 `npm test -- ...`）。
3. **[MUST] 估點上限防爆衝**：單一任務估點不得大於等於 8 Story Points；超過者必須強制拆解。
4. **[MUST] 包含交接協定**：計畫文件尾端必須包含標準 `Agent Handoff Protocol`。

## 使用時機與輸入來源
- SA / SD / Spec 文件已確認，準備進入切片開發階段。
- 需要將設計轉化為可執行的任務清單與 GitHub Issues。

### 輸入來源
優先讀取（依序）：
1. `.github/harness/design/*-architecture.md` 或 `docs/design/sd-*.md`
2. `.github/harness/spec/*-spec.md` 或 `docs/spec/*-spec.md`

## 流程步驟

### 第一階段：解析設計文件
1. 提取所有 API 端點、DB Schema、前端元件與流程。
2. 若資訊不足以支持拆解，先回報缺口；未知風險改立 Spike 任務先驗證。

### 第二階段：垂直切片任務拆解
依照 [任務拆解原則](./references/task-breakdown-guide.md) 拆解：
- **任務屬性**：ID (`TASK-001`)、類型 (BE / FE / Infra / Spike / Test / Deploy)、優先序、估點 (1/2/3/5/8)、前置相依。
- **垂直功能導向**：單一功能包含其相應前後端與驗證點。

### 第三階段：工作估點
- 1 SP: 簡單修改 (< 2h)
- 2 SP: 小任務 (半天內)
- 3 SP: 標準任務 (1天內)
- 5 SP: 複雜任務 (2-3天)
- ≥ 8 SP: 強制拆分

### 第四階段：里程碑排程與 Critical Path
1. 標記 Critical Path（直接影響交付之鏈條）。
2. M0（基礎建設/環境）先於功能任務。

### 第五階段：產出寫入
將建置計畫實體寫入 `.github/harness/plan/{feature-name}-build-plan.md`（或 `docs/plan/build-plan-{YYYY-MM-DD}.md`）。

## 輸出規範與交接協定

```markdown
---
## 🤝 Agent Handoff Protocol (跨 Agent 交接協定)

### 1. 當前階段與狀態 (Current Stage)
- **Workflow Phase**: `Build Planning Completed`
- **Active Task ID**: `TASK-001`
- **Status**: `Ready for Implementation`

### 2. 本階段完成事項與決策 (Completed Decisions)
- [x] 完成功能垂直切片與估點 (Total: XX SP)
- [x] 標記 Critical Path 與 Spike 任務
- [x] 每個切片皆定義獨立驗證指令

### 3. 接手 Agent 執行指南 (Next Agent Actionable Guide)
- **Recommended Skill**: `tdd-build`
- **Next Target File**: `.github/harness/plan/{feature-name}-build-plan.md`
- **Execution Criteria**:
  - [ ] 依據 TASK-001 撰寫失敗測試 (Red)
  - [ ] 執行實作使測試轉綠 (Green)

### 4. 關鍵風險與未決問題 (Risks & Open Questions)
- ⚠️ TASK-002 相依於外部 OAuth 金鑰設定。
---
```

## 參考資源
- [任務拆解與估點規範](./references/task-breakdown-guide.md)
- [建置計畫範本](./assets/build-plan-template.md)

## 完成前檢核
- [ ] 所有任務採功能垂直切分，無估點 ≥ 8 之龐大任務。
- [ ] 每個 TASK 均有明確的驗收標準與驗證指令。
- [ ] 標記出 Critical Path 與 Spike 任務。
- [ ] 檔案已實體寫入計畫目錄。
- [ ] 尾端包含 `Agent Handoff Protocol` 標籤區塊。
