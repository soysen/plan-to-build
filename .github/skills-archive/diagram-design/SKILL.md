---
name: diagram-design
description: "使用純 HTML + Inline SVG 產出出版級 (Editorial-level) 規格圖表與架構拓撲。語意情境：當使用者表達「需要畫高階架構圖」、「產生出版級系統拓撲」、「繪製精美 DB Schema / Sequence / Data Flow 圖表」時觸發。"
argument-hint: "輸入欲視覺化的架構、流程或資料模型描述，或指定既有 Spec / SD 檔案"
user-invocable: true
---

# 出版級規格圖表設計 (diagram-design)

## 概覽

依據 [`cathrynlavery/diagram-design`](https://github.com/cathrynlavery/diagram-design) 規範，使用純 HTML + Inline SVG 產出零外部 JS 依賴、出版級 (Editorial-level) 視覺質感的規格圖表。

本 Skill 為 `plan-to-build` **雙軌制圖表架構 (Dual-Track Diagram Strategy)** 中的「出版級視覺強化軌 (Editorial Track)」，特別適用於高階系統架構 (SA)、詳細設計 (SD)、Sitemap、重大架構決策 (ADR) 與客戶交付文件。

---

## 核心設計哲學 (Editorial Philosophy)

1. **去雜訊與留白 (Target Density: 4/10)**：
   - 拒絕視覺雜訊與 Mermaid slop。
   - 移除無意義陰影（No drop shadows）、過度圓角（Max border-radius: 6–10px 或直角）、無意義漸層。
   - 每個節點與連線都必須乘載明確資訊，若由版面位置即可明瞭關聯，則刪減連接線。
2. **極致調色盤 (Strict Palette & 1–2 Accent Focus)**：
   - 中性底色（Paper: `#f8fafc` 或 `#ffffff`；Dark: `#0f172a`）。
   - 墨色文字與線條（Ink: `#0f172a` 或 `#1e293b`；Muted: `#64748b`）。
   - **Accent Color 嚴格限制 1~2 個焦點**（例如 Indigo `#4f46e5` 或 Coral `#eb6c36`），嚴禁全圖五顏六色。
3. **零依賴跨平台 (Self-Contained HTML + Inline SVG)**：
   - 輸出為單一獨立 `.html` 檔案或可直接內嵌之 `<svg>` 代碼。
   - 包含內嵌 CSS 樣式，任何瀏覽器、VS Code Webview、GitHub 原始碼檢視皆 100% 精確呈現。

---

## 支援圖表型態 (41 Visual Types)

| 分類 | 常用圖表型態 | 適用情境 |
| :--- | :--- | :--- |
| **結構與拓撲** | **Architecture**, Component Hierarchy, Sitemap, Nested, Tree, Layer Stack | 高階系統架構、雲端部署拓撲、模組分層、Sitemap 頁面樹狀圖 |
| **流程與時序** | **Sequence**, User Journey, Process Flow, Data Flow, Swimlane, Pipeline | 跨角色時序圖、使用者旅程動線、跨系統資料流向、CI/CD 流程 |
| **狀態與邏輯** | **State Machine**, Flowchart, Decision Tree, Branching Logic | 訂單/生命週期狀態轉移、複雜業務分支條件決策 |
| **資料與實體** | **ER / Database Schema**, Medallion Data Store, Matrix / Quadrant, Venn | 實體關聯圖、資料表欄位/索引定義、技術選型四象限分析 |
| **專案與排程** | **Gantt / Timeline**, Kanban, Dependency Graph, Story Map | 切片交付里程碑、模組依賴 DAG 圖、Release 故事地圖 |

---

## 雙軌制選用規則 (Dual-Track Routing)

- **選擇 Markdown Mermaid (輕量 Token 省算軌)**：
  - 日常 `micro` / `standard` 切片推理。
  - `analyze-spec` 初期需求探索與即時草稿。
  - 內部快速討論、文字變更頻繁之原型階段。
- **選擇 `diagram-design` HTML+SVG (出版級視覺強化軌)**：
  - `design-architecture` 最終定案之系統架構圖 (SA) 與資料庫模型 (SD)。
  - `documentation-and-adrs` 重大架構決策 (ADR) 與決策四象限矩陣。
  - 對外正式交付報告、Sitemap 視覺化導覽、系統白皮書。

---

## 標準產出範本結構

產出之獨立 HTML 圖表應包含：

```html
<!DOCTYPE html>
<html lang="zh-TW">
<head>
  <meta charset="UTF-8">
  <title>[圖表名稱] - Diagram Design</title>
  <style>
    :root {
      --paper: #ffffff;
      --paper-subtle: #f8fafc;
      --ink: #0f172a;
      --muted: #64748b;
      --rule: #e2e8f0;
      --accent: #4f46e5;
      --accent-tint: #eef2ff;
      --font-sans: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      --font-mono: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
    }
    body {
      margin: 0;
      padding: 32px;
      background: var(--paper-subtle);
      font-family: var(--font-sans);
      color: var(--ink);
      display: flex;
      justify-content: center;
    }
    .diagram-container {
      background: var(--paper);
      border: 1px solid var(--rule);
      border-radius: 8px;
      padding: 24px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.05);
      max-width: 100%;
    }
  </style>
</head>
<body>
  <div class="diagram-container">
    <header style="margin-bottom: 20px; border-bottom: 1px solid var(--rule); padding-bottom: 12px;">
      <h2 style="margin: 0; font-size: 1.25rem; font-weight: 600;">系統架構圖 (System Architecture)</h2>
      <p style="margin: 4px 0 0 0; font-size: 0.875rem; color: var(--muted);">核心服務與資料流向拓撲</p>
    </header>
    <!-- Inline SVG Graphic -->
    <svg width="800" height="400" viewBox="0 0 800 400" xmlns="http://www.w3.org/2000/svg">
      <!-- Defs, Markers, Nodes, and Connectors -->
    </svg>
  </div>
</body>
</html>
```

---

## 相關參考文件
- [Style Guide & Tokens](references/style-guide.md)
- [常用圖表樣板庫](references/templates.md)
