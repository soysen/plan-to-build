# Blob Todo 優化 Backlog

**建立日期**：2026-05-10

## 1. Hotfix
無。

## 2. Quick Wins
- [x] **連續漸變顏色與 Urgency Boost 大小加成**
  - **What**: 將顏色從硬斷點改為連續 HSL 計算；為 7 天內的任務加入大小乘數（上限 +1.5 weight）。
  - **Why**: 解決紅色難以區分、小任務過期仍不明顯的 UX 摩擦。
  - **Pros**: 提升直覺感知能力。

## 3. Experiments
- **任務擁擠測試**
  - **What**: 測試任務數量超過 20 個時，視覺是否過於混亂。
  - **Why**: 預防使用者任務累積後無法閱讀。

## 4. Deeper Bets
- **Chrome Extension 打包與上架**
  - **What**: 將目前 MVP 包裝成 Chrome New Tab Extension 並上架。
  - **Why**: 達到原本設定的「替換 New Tab」目標，增加觸及與使用頻率。

## 5. 後續需要追蹤的指標
- 修正顏色與大小後，是否能更有效辨識任務優先級。

## 6. 需要同步更新的文件
- `docs/spec/blob-todo-spec-2026-05-09.md`：需更新 REQ-F002 (大小比例) 與 REQ-F003 (顏色系統) 的描述，反映新的 Urgency Boost 與連續顏色邏輯。
