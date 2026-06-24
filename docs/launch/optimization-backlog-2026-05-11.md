# Blob Todo 優化 Backlog (2026-05-11)

**建立日期**：2026-05-11
**關聯回顧**：[post-launch-review-2026-05-11.md](file:///Users/soysen/projects/plan-to-build/docs/launch/post-launch-review-2026-05-11.md)

## 1. Hotfix (立即處理)
- [x] **物理參數微調 (Gap & Drift)**
  - **What**: 縮小 `minDist` 斥力觸發範圍，改為平方反比力；提高漂浮加速度至 20+。
  - **Why**: 解決間距過大與漂流感不足。
  - **Pros**: 立即改善視覺動態，不需大幅改動結構。

## 2. Quick Wins (本輪優化)
- [x] **體積補償機制 (Volume Conservation)**
  - **What**: 在頂點更新時計算「壓入量」，並將對等的力補償到全體頂點的向外法向量上。
  - **Why**: 保持泡泡在擠壓時的圓潤「肉感」。
  - **Pros**: 顯著提升「油滴」視覺品質。

## 3. Experiments
- **流體場 (Vector Field) 漂流**
  - **What**: 測試使用簡單的 2D 流體場（Vector Field）來控制泡泡的群體漂移。
  - **Why**: 讓群體動態更有一致性且像液體。

## 4. Deeper Bets
- **SVG Filter 融合效果 (Gooey Effect)**
  - **What**: 嘗試使用 Canvas 的遮罩或 SVG Filter `feGaussianBlur` + `feColorMatrix` 來讓泡泡在靠近時產生「黏合」效果。
  - **Why**: 物理上的擠壓與視覺上的黏合結合，是油滴質感的終極方案。

## 5. 後續需要追蹤的指標
- 泡泡平均重疊面積是否增加。
- 靜態觀看 30 秒內的視覺愉悅度（質化回饋）。
