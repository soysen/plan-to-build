# Diagram Design Style Guide & Token Specification

本風格指南定義 `diagram-design` 之顏色、字體、連接線與卡片幾何規範。

---

## 1. 顏色 Token (Color Tokens)

### Light Theme (預設)
- **`--paper`**: `#ffffff` (主要卡片/畫布底色)
- **`--paper-subtle`**: `#f8fafc` (外層頁面底色 / 弱背景)
- **`--ink`**: `#0f172a` (主要標題、主要節點文字、重要邊框)
- **`--ink-secondary`**: `#334155` (次要標籤、一般內文)
- **`--muted`**: `#64748b` (輔助說明文字、次要連線、註解)
- **`--rule`**: `#e2e8f0` (分隔線、弱邊框、容器外框)
- **`--rule-solid`**: `#cbd5e1` (節點卡片實線邊框)
- **`--accent`**: `#4f46e5` (焦點節點、主流程路徑、主按鈕；全圖限 1~2 處)
- **`--accent-tint`**: `#eef2ff` (焦點節點背景填色)
- **`--success`**: `#10b981` (成功/通過狀態)
- **`--warning`**: `#f59e0b` (警告/待確認狀態)

### Dark Theme (選用)
- **`--paper`**: `#1e293b`
- **`--paper-subtle`**: `#0f172a`
- **`--ink`**: `#f8fafc`
- **`--muted`**: `#94a3b8`
- **`--rule`**: `#334155`
- **`--accent`**: `#6366f1`
- **`--accent-tint`**: `rgba(99, 102, 241, 0.15)`

---

## 2. 字體階層 (Typography Hierarchy)

- **標題 (Diagram Title)**: `-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`, `18px - 20px`, `font-weight: 600`
- **卡片/節點標題 (Node Title)**: `13px - 14px`, `font-weight: 600`, color: `--ink`
- **卡片內文/描述 (Node Body)**: `11px - 12px`, `font-weight: 400`, color: `--ink-secondary`
- **技術標籤/埠號/型態 (Technical Metadata)**: `ui-monospace, SFMono-Regular, Menlo, monospace`, `10px - 11px`, `font-weight: 500`, color: `--muted`
- **連線標籤 (Edge Label)**: `ui-monospace, monospace`, `10px`, background mask 避免線條穿透。

---

## 3. 連接線與箭頭規範 (Connectors & Arrows)

1. **正交走線 (Orthogonal Routing)**：連線以水平 (H) 與垂直 (V) 折角為主，避免混亂斜線。
2. **端點對齊 (Pin Alignment)**：連線起迄點應精確鎖定節點卡片之四邊中心或特定 Anchor Point。
3. **標籤遮罩 (Label Masking)**：連線上的文字標籤必須自帶小背景矩形遮罩（`<rect fill="var(--paper)"/>`），嚴禁文字與線條重疊。
4. **箭頭定義 (Marker Defs)**：
```xml
<defs>
  <marker id="arrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
    <path d="M 0 1.5 L 6 5 L 0 8.5 z" fill="#64748b"/>
  </marker>
  <marker id="arrow-accent" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
    <path d="M 0 1.5 L 6 5 L 0 8.5 z" fill="#4f46e5"/>
  </marker>
</defs>
```

---

## 4. 節點卡片幾何與間距 (Geometry & Spacing)

- **標準卡片圓角**：`rx="6" ry="6"` 或直角 `rx="0" ry="0"`。
- **邊框粗細**：一般卡片 `stroke-width="1"`；焦點卡片 `stroke-width="1.5"`。
- **最小水平間距**：節點之間至少保留 `40px`。
- **最小垂直間距**：層級之間至少保留 `50px`。
