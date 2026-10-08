---
name: design-architecture
description: "繪製 Sitemap、產出 SA/SD 系統設計與遷移策略。語意情境：當使用者表達「準備開始架構設計」、「幫我切分模組與畫 Sitemap」、「設計系統遷移與 API 廢棄」時觸發。"
argument-hint: "輸入規格書路徑，或直接描述已確認的需求內容"
user-invocable: true
freedom: high
models-tested: [flash, sonnet, opus]
---

# 系統架構設計與遷移策略 (design-architecture)

## 目錄
1. [硬性規則 (Must)](#硬性規則-must)
2. [概覽與使用時機](#概覽與使用時機)
3. [流程階段](#流程階段)
4. [輸出規範與交接協定](#輸出規範與交接協定)
5. [延伸參考指引](#延伸參考指引)
6. [完成前檢核](#完成前檢核)

## 硬性規則 (Must)
1. **[MUST] 介面契約優先**：實作前必須明確定義所有模組輸入/輸出介面、型別與錯誤回應（參考 [API 介面設計指南](./references/api-interface-guide.md)）。
2. **[MUST] 關鍵技術選型記錄 ADR**：非微型選型或跨模組重大架構變更，必須產出對應 ADR（參考 [ADR 與技術文件指南](./references/adrs-and-documentation.md)）。
3. **[MUST] 明確資料流與邊界**：架構設計必須包含 Mermaid 視覺化拓撲（資料流、狀態轉移或 Sequence），禁止通篇純文字抽象描述。
4. **[MUST] 附帶交接協定**：產出架構文件結尾必須具備標準 `Agent Handoff Protocol`。

## 概覽與使用時機
將需求規格書 (Spec) 轉化為明確的系統架構 (SA)、詳細設計 (SD)、Sitemap，以及系統遷移與舊模組廢棄策略 (Deprecation & Migration Strategy)。

### 使用時機
- 需求規格書（Spec）已確認，準備進入設計階段。
- 需要確立頁面結構與使用者動線（Sitemap）。
- 需要切分功能模組、定義邊界與資料流（SA/SD）。
- 進行系統遷移或舊 API 廢棄平滑過渡。

## 流程階段

### 第一階段：解析規格書與限制
提取功能需求清單、技術限制與非功能門檻，確認有無未決決策。

### 第二階段：Sitemap 與模組切割 (SA)
- 產出 Sitemap 頁面結構或模組分層拓撲（使用 Mermaid `graph TD`）。
- 繪製核心 Use Case Sequence Diagram，確認模組調用先後依賴。

### 第三階段：詳細設計 (SD) & 資料庫/API 合約
- 詳細 DB Schema 設計 (ER Diagram 與欄位型別)。
- API Endpoint 路由、Method、Request/Response Schema（遵循 [API 介面設計指南](./references/api-interface-guide.md)）。

### 第四階段：系統遷移與 API 廢棄策略 (Migration & Deprecation)
若屬於既有系統重構或 API 升級：
1. **並行與雙寫策略 (Parallel Running)**：設計舊 API 與新 API 的雙寫與資料同步邏輯。
2. **漸進過渡 (Strangler Fig Pattern)**：定義分流比率與降級預案。
3. **Deprecation Timeline**：標註舊模組標籤 `@deprecated` 與淘汰日期。

### 第五階段：產出寫入與 Agent Handoff Protocol
將產出寫入 `.github/harness/design/{feature-name}-architecture.md`。

## 輸出規範與交接協定

```markdown
---
## 🤝 Agent Handoff Protocol (跨 Agent 交接協定)

### 1. 當前階段與狀態 (Current Stage)
- **Workflow Phase**: `Architecture Design & SD Completed`
- **Active Task ID**: `TASK-001`
- **Status**: `Ready for Build Planning`

### 2. 本階段完成事項與決策 (Completed Decisions)
- [x] 完成 Mermaid 架構圖與模組依賴劃分
- [x] 完成 SA 模組切割與 SD 資料庫 Schema / API 介面設計
- [x] 若涉及重大技術選型，已建立 ADR 紀錄

### 3. 接手 Agent 執行指南 (Next Agent Actionable Guide)
- **Recommended Skill**: `plan-build`
- **Next Target File**: `.github/harness/plan/{feature-name}-build-plan.md`
- **Execution Criteria**:
  - [ ] 將 SD API 介面與業務流程拆解為可獨立驗證之垂直切片 (TASK)
  - [ ] 為每個切片指定驗收命令

### 4. 關鍵風險與未決問題 (Risks & Open Questions)
- ⚠️ 外部資料庫連線池上限需設定安全閥值。
---
```

## 延伸參考指引
- [API 與介面合約設計指南](./references/api-interface-guide.md)
- [架構決策紀錄 (ADRs) 與技術文件指南](./references/adrs-and-documentation.md)
- [Sitemap 指南](./references/sitemap-guide.md)
- [SA 範本](./assets/sa-template.md)
- [SD 範本](./assets/sd-template.md)

## 完成前檢核
- [ ] 已完成模組切分並附有 Mermaid 結構圖。
- [ ] API 與資料型別定義嚴格、無 `any` 模糊宣告。
- [ ] 若有技術選型已沉澱 ADR 記錄。
- [ ] 檔案已寫入 `.github/harness/design/`。
- [ ] 尾端包含 `Agent Handoff Protocol` 標籤區塊。
