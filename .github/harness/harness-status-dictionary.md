# Harness 狀態字典

本檔案是 workflow 任務狀態的單一來源（source of truth）。

## 適用範圍

- `.github/harness/plan/*-build-plan.md`
- `.github/worklog/agent-status.md`
- `.github/harness/templates/build-plan.md`
- 相關 skills 與 prompts

> **[CLI 程式化驗證]**：本字典之枚舉值受 `npm run harness:validate`（或 `node .github/scripts/harness-cli.js validate`）程式化關卡自動約束，違規術語將導致驗證失敗並攔截任務結案。

## 狀態枚舉（中文）

- 未開始：任務已定義，但尚未開始。
- 進行中：正在實作或驗證中。
- 已完成：驗收標準已通過，且證據已回寫。
- 阻塞：因外部依賴、技術問題或決策缺口無法前進。
- 暫停：有意識地延後，稍後再恢復。
- 需補充輸入：缺少使用者或利害關係人提供的必要 input。
- 已重置：中斷後選擇重置，原未完成任務不再繼續，改由新任務取代。

## 對映（若需英文）

- 未開始 = Not started
- 進行中 = In progress
- 已完成 = Completed
- 阻塞 = Blocked
- 暫停 = Paused
- 需補充輸入 = Needs input
- 已重置 = Reset

## 使用規範

- 新增或更新任務時，僅使用上述狀態。
- 執行任何實作、查詢或驗證步驟前，必須先在對應活文件更新任務狀態（至少包含目前狀態與更新時間），再執行該步驟。
- 任務標記為「已完成」時，必須同時補齊驗證證據與通過 `harness-cli validate`。
- 任務標記為「阻塞 / 暫停 / 需補充輸入」時，必須補齊 checkpoint 欄位：
  - 阻塞或中止原因
  - 已完成內容
  - 已驗證內容
  - 缺少 input / 決策
  - 建議恢復步驟
- 若偵測到中斷狀態（阻塞 / 暫停 / 需補充輸入），必須先決策：`繼續` 或 `重置`。
- 若選擇 `重置`，必須：
  - 把所有未完成任務改為 `已重置`（或移到重置歸檔區）
  - 清空「未完成任務」工作佇列
  - 建立新的任務 ID 與新任務 context 後再繼續
- 啟動閘門的 Active state 判定請見 `AGENTS.md`。

## 文件分層建議（未完成優先）

- 未完成任務：未開始 / 進行中 / 阻塞 / 暫停 / 需補充輸入。
- 已結束任務：已完成 / 已重置。
- 大型 plan 或 worklog 文件建議將未完成任務放在前段，已完成任務放在後段，提升日常可讀性。
