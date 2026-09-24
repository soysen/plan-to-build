# 規格文件圖表產出導入 `diagram-design` 評估報告

- **評估對象**：[`cathrynlavery/diagram-design`](https://github.com/cathrynlavery/diagram-design)
- **評估專案**：`plan-to-build`（規格定義、系統架構、建置計畫與 ADR 交付流程）
- **評估日期**：2026-09-24
- **任務編號**：TASK-054
- **狀態**：完成評估（建議採用雙軌制導入）

---

## 1. 執行摘要 (Executive Summary)

經過針對 [`diagram-design`](https://github.com/cathrynlavery/diagram-design) 的設計原則、33+ 種視覺圖表型態、Token 開銷、維護複雜度與 `plan-to-build` 現有 Skills 體系（`analyze-spec`、`design-architecture`、`plan-build`、`documentation-and-adrs`）的全面評估：

> **評估結論**：**適合導入，強烈建議採用「雙軌制分級架構 (Dual-Track Diagram Strategy)」落地。**

- **日常內部迭代與快速草稿**（`micro` / `standard` 切片）：繼續採用 **Markdown Mermaid**，以換取極低 Token 開銷與超快速生成。
- **高階架構白皮書、SA/SD 系統設計、重大架構決策 (ADR) 與對外交付**：全面導入 **`diagram-design` (HTML + inline SVG)** 規範與樣板，提供出版級 (Editorial-level) 質感與零依賴開箱即看體驗。

---

## 2. `diagram-design` 核心特性分析

`diagram-design` 是專為 AI Agent（Claude Code, Copilot, Codex, Cursor 等）設計的圖表生成規範，其核心特點包含：

1. **純 HTML + Inline SVG 架構**：
   - 零外部 JS 依賴、無 runtime script、無需打包步驟（No build step）。
   - 可在任何現代瀏覽器、VS Code 預覽器、GitHub/GitLab 原始檔檢視、甚至是純靜態 HTML 報告中完美呈現。
2. **出版級視覺原則 (Editorial Philosophy)**：
   - **Target Density (4/10)**：強調充足留白（Whitespace）、清晰層次、去除視覺雜訊（No drop shadows、No unnecessary gradients、拒絕 "Mermaid slop"）。
   - **嚴格調色盤**：以中性色為底（Neutral Light `#f8fafc` 或 Dark `#0f172a`），全圖僅使用 1~2 個強調色（Accent Color，如 Indigo / Emerald）標示核心路徑或焦點。
   - **卡片結構與 Metadata**：節點具備標題列、說明標籤、狀態燈號與計量指標，遠超傳統方塊圖之語意表達力。
3. **涵蓋 33+ 種圖表類型**：
   - **結構類**：Architecture Diagram, Component Hierarchy, Sitemap, Mindmap.
   - **流程類**：User Journey, Sequence Diagram, Data Flow, CI/CD Pipeline, Swimlane.
   - **邏輯與狀態類**：State Machine, Decision Tree, Branching Logic.
   - **資料與關聯類**：ER / Database Schema, Entity Graph, Matrix / Quadrant, Venn.
   - **專案與運維類**：Kanban, Roadmap, Gantt / Timeline, Dependency Graph, Deployment Topology.

---

## 3. 現有 `plan-to-build` 圖表產出盤點與缺口

| 流程階段 / Skill | 當前產出圖表型態 | 現行方案 (Mermaid) 痛點 | 導入 `diagram-design` 效益 |
| :--- | :--- | :--- | :--- |
| **`analyze-spec`**<br>(規格分析) | Use Case Flowchart, Sequence Diagram | Mermaid 語法簡潔，但若 Use Case 涉及跨角色時 Swimlane 排版容易交錯混亂 | 能產出具備清楚分欄、步驟序號與狀態徽章的高清 User Flow |
| **`design-architecture`**<br>(SA / SD / Sitemap) | Sitemap (`graph TD`), 分層架構圖 (`graph LR`), ER Model (`erDiagram`) | 1. 跨層次節點文字過多時排版嚴重破版。<br>2. 缺乏子系統邊界、Port/Protocol 標註、雲端拓撲卡片質感。 | 提供出版級系統拓撲圖、具備欄位型態與關聯標籤的精美 DB Schema、卡片式 Sitemap。 |
| **`documentation-and-adrs`**<br>(架構決策與指南) | Decision Tree, Architecture Comparison | 純文字或 Markdown 表格過於生硬，無法直觀展現決策權衡 (Trade-offs) 與象限分析。 | 支援 Quadrant Matrix（四象限評估）、Decision Flow 與 Before/After 對比圖。 |
| **`plan-build`**<br>(建置計畫) | Slice Dependency Graph, Milestone Timeline | Mermaid Gantt 與 Graph 難以呈現切片風險等級、DoD 勾選狀態與負責 Agent 標章。 | 支援清晰的切片依賴圖與視覺化 Milestone Timeline。 |

---

## 4. 多維度量化與質化比較

| 評估維度 | Markdown Mermaid | `diagram-design` (HTML + SVG) | 評估說明與權衡 (Trade-offs) |
| :--- | :--- | :--- | :--- |
| **Token 消耗量** | **極低** (~20–80 Tokens) | **中至高** (~300–1200 Tokens) | Mermaid 在對話推理與輕量草稿具壓倒性 Token 優勢；HTML+SVG 不宜濫用於每一輪微型改動。 |
| **視覺美感與排版控制** | 普通 / 易走鐘 (Mermaid slop) | **極高** (出版級 Editorial 質感) | `diagram-design` 具備精確座標、卡片欄位、自適應寬度與優雅字級階層。 |
| **平台相容性** | 依賴 Markdown Parser 支援 Mermaid | **100% 通用** (瀏覽器、純 HTML、Webview) | HTML+SVG 在任何環境（含離線 HTML 匯出、客戶簡報、Dashboard Webview）皆零誤差還原。 |
| **文字搜尋與可維護性** | 高（純宣告式代碼） | 中高（純文字 HTML 標籤，可直接 grep） | 兩者皆為純文字（非點陣圖 PNG），可受 Git 版本控制；但 SVG 走線修改難度稍高於 Mermaid。 |
| **LLM 生成穩定度** | 高（標準 DSL 語法） | 高（只要有清晰 Style Guide 與 Pattern Template） | LLM 對 HTML+SVG 具備極強結構生成能力，配合樣板可一次到位。 |

---

## 5. 導入策略：雙軌制分級落地 (Dual-Track Diagram Strategy)

為了兼顧 **「省 Token 核心目標」** 與 **「高品質交付物視覺呈現」**，制定以下雙軌分流策略：

```
┌─────────────────────────────────────────────────────────────────┐
│                    規格與架構圖表產出決策路由                     │
└────────────────────────────────┬────────────────────────────────┘
                                 │
                 ┌───────────────┴───────────────┐
                 ▼                               ▼
    【軌道 A：輕量 Token 省算軌】     【軌道 B：出版級視覺強化軌】
          (Markdown Mermaid)           (diagram-design HTML+SVG)
                 │                               │
       ├─ analyze-spec 快速草稿          ├─ design-architecture SA/SD
       ├─ micro / standard 切片推理      ├─ documentation-and-adrs (ADR)
       ├─ tdd-build 邏輯流驗證           ├─ 系統架構白皮書與客戶交付
       └─ 日常快速迭代                    └─ 複雜資料拓撲 / 四象限決策圖
```

### 軌道 A (Default / Internal Track) — Mermaid
- **定位**：內部推理、快速草稿、切片級邏輯圖。
- **規則**：保留在 `.md` 文件中作為輕量級圖表，維持單次對話 0 負擔。

### 軌道 B (Editorial / High-Stakes Track) — `diagram-design`
- **定位**：核心架構圖、對外規格文件、重要架構決策 (ADR)、系統拓撲。
- **規則**：
  1. 生成獨立 `.html` 或 `.svg` 檔案放置於 `docs/diagrams/` 或 `.github/harness/design/assets/`。
  2. 規格文件中使用標準 Markdown 語法引用預覽，或於 Webview / Dashboard 中直接內嵌。
  3. 嚴格遵循 Density 4/10、雙色調 Accent、語意化 Card 結構規範。

---

## 6. 具體落地里程碑 (Implementation Roadmap)

### Phase 1：基礎設施與 Skill 規範建立 (In Progress)
- [ ] 於 `.github/skills/diagram-design/` 建立專屬 Agent Skill（含 Style Guide、Color Palette 規範、33 種 Pattern 提示詞）。
- [ ] 在 `docs/templates/diagrams/` 放置 5 大常用 HTML+SVG 樣板（Architecture, Sequence, ER Schema, Data Flow, State Machine）。

### Phase 2：既有 Skills 整合升級
- [ ] 更新 `.github/skills/design-architecture/`：在產出 SA (System Architecture) 與 SD (System Design) 時，引導使用 `diagram-design` 產出高階系統拓撲與 DB 關聯圖。
- [ ] 更新 `.github/skills/documentation-and-adrs/`：在撰寫重大架構決策時，提供 Quadrant Matrix 與 Decision Flowchart 樣板。

### Phase 3：Tooling 與自動化檢視
- [ ] 在 `task-dashboard` 或 VS Code 預覽環境中支援 HTML+SVG 圖表的一鍵即時預覽與 SVG 匯出。

---

## 7. 總結

`cathrynlavery/diagram-design` 所提倡的 **「純 HTML+SVG、出版級排版、去雜訊低密度、高度結構化」** 理念，與 `plan-to-build` 所追求的 **「專業、清晰、結構化一次到位」** 核心價值完全契合。透過**雙軌分流策略**，既能嚴格守護日常對話的 Token 預算，又能在關鍵交付規格中呈現最高規格的視覺水準，具備高度的實用性與導入價值。
