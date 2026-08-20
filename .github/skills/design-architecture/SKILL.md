---
name: design-architecture
description: "繪製 Sitemap、產出 SA/SD 系統設計與遷移策略。語意情境：當使用者表達「準備開始架構設計」、「幫我切分模組與畫 Sitemap」、「設計系統遷移與 API 廢棄」時觸發。"
argument-hint: "輸入規格書路徑，或直接描述已確認的需求內容"
user-invocable: true
---

# 系統架構設計與遷移策略 (design-architecture)

## 概覽

將需求規格書 (Spec) 轉化為明確的系統架構 (SA)、詳細設計 (SD)、Sitemap，以及系統遷移與舊模組廢棄策略 (Deprecation & Migration Strategy)。

## 使用時機

- 需求規格書（Spec）已確認，準備進入設計階段。
- 需要確立頁面結構與使用者動線（Sitemap）。
- 需要切分功能模組、定義邊界與資料流（SA/SD）。
- **系統遷移與 API 淘汰 (Migration & Deprecation)**：設計新舊系統並行、雙寫 (Double-Write) 或平滑過渡方案。

---

## 流程階段

### 第一階段：解析規格書與限制
提取功能需求清單、技術限制與非功能門檻，確認有無待決決策。

### 第二階段：Sitemap 與模組切割 (SA)
- 產出 Mermaid `graph TD` Sitemap 頁面結構。
- 繪製分層系統架構圖 (Mermaid `graph LR`) 與 Use Case Sequence Diagram。

### 第三階段：詳細設計 (SD) & 資料庫/API 合約
- 詳細 DB Schema 設計 (ER Diagram 與欄位表)。
- API Endpoint 路由、Method 與 Request/Response Schema。

### 第四階段：系統遷移與 API 廢棄策略 (Migration & Deprecation)
若屬於既有系統重構或 API 升級：
1. **並行與雙寫策略 (Parallel Running)**：設計舊 API 與新 API 的雙寫與資料同步邏輯。
2. **漸進過渡 (Strangler Fig Pattern)**：定義分流比率與降級預案。
3. **Deprecation Timeline**：標註舊模組標籤 `@deprecated` 與淘汰日期。

### 第五階段：產出寫入與 Agent Handoff Protocol
將產出寫入 `docs/design/sitemap-*.md`, `docs/design/sa-*.md`, `docs/design/sd-*.md` 或 `.github/harness/design/`。

---

## 輸出規範與 Agent Handoff Protocol

```markdown
---
## 🤝 Agent Handoff Protocol (跨 Agent 交接協定)

### 1. 當前階段與狀態 (Current Stage)
- **Workflow Phase**: `Architecture Design & SD Completed`
- **Active Task ID**: `TASK-001`
- **Status**: `Ready for Build Planning`

### 2. 本階段完成事項與決策 (Completed Decisions)
- [x] 完成 Sitemap (Mermaid graph TD) 繪製
- [x] 完成 SA 模組切割與 SD 資料庫 Schema / API 介面設計
- [x] 定案 Migration 雙寫與舊 API 廢棄時程

### 3. 接手 Agent 執行指南 (Next Agent Actionable Guide)
- **Recommended Skill**: `plan-build`
- **Next Target File**: `.github/harness/plan/{feature-name}-build-plan.md`
- **Execution Criteria**:
  - [ ] 將 SD API 介面拆解為後端 TASK 切片
  - [ ] 將 Sitemap 前端畫面拆解為前端 TASK 切片

### 4. 關鍵風險與未決問題 (Risks & Open Questions)
- ⚠️ Migration 過程需注意舊資料庫中包含 500 筆格式不相容的舊資料。
---
```
