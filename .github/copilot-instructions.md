# Copilot 指引（VS Code 補充）

> 跨工具規則以 [`AGENTS.md`](../AGENTS.md) 為準；本檔只補充 Copilot / VS Code 執行細節，不重複定義 harness workflow 規則。

## 專案定位

`plan-to-build` 是 AI Agent workflow / skills framework。日常變更多半是 Markdown、SKILL.md、templates、harness plan / worklog，而不是應用程式碼。

## 讀取順序

1. [`AGENTS.md`](../AGENTS.md)
2. 本檔
3. `.github/harness/harness-workflow.md`
4. `.github/harness/harness-status-dictionary.md`
5. 對應 `.github/skills/*/SKILL.md`
6. `.github/worklog/agent-status.md` 與相關 `.github/harness/plan/*-build-plan.md`

低順位文件若與高順位文件衝突，以高順位為準；發現衝突時先回報，不要靜默選邊。

## 啟動原則

- 新需求先依 [`AGENTS.md`](../AGENTS.md) 執行未完成任務閘門、Input 收斂閘門、任務分級閘門與實作啟動閘門。
- 需要執行非平凡流程時，讀取 `.github/harness/harness-workflow.md`；需要改變任務狀態時，讀取 `.github/harness/harness-status-dictionary.md`。
- 任務符合特定 skill 時，先讀取對應 `.github/skills/<skill-name>/SKILL.md`，再執行該 workflow。
- 本檔只補充 Copilot 的工具使用、輸出格式與 VS Code 習慣；若與 [`AGENTS.md`](../AGENTS.md) 衝突，以 [`AGENTS.md`](../AGENTS.md) 為準。

## 固定提問句

未完成任務：

```text
偵測到未完成任務：<任務 ID 與標題>（狀態：<status>）。請選擇：繼續 / 放棄並重置 / 放棄並保留 checkpoint。
```

Input 不足或出現空泛詞（`優化 / 改善 / 整理 / 重構 / 升級 / 強化 / 清理 / 調整 / 看看`）時，輸出最小任務卡：

```text
任務卡 (Task Card)
- 目標：?
- 範圍 (In/Out)：?
- 驗收標準：?
```

## 例外

可跳過完整啟動閘門的情況：

- 純資訊查詢：不修改檔案、不跑命令、不啟動工具序列。
- 使用者明確指定「檔案 + 動作」（例如「在 `file.ts` 第 42 行加上 X」）。
- 使用者已提供完整任務卡，且內容足以直接產生下一個切片。

邊界模糊時，預設採工具序列處理，先更新活文件再動手。

## 活文件規則

- `.github/worklog/agent-status.md`：每次任務都必須更新。
- `.github/harness/plan/{feature-name}-build-plan.md`：`standard / heavy` 任務必須建立並更新。
- 工具呼叫前先更新狀態，不要先做再補寫。
- `standard / heavy` 的切片狀態變更需雙寫到 build plan 與 `.github/worklog/agent-status.md`。
- build/test/lint/typecheck 失敗時，先把活文件標為 `阻塞` 並補 checkpoint，再進入 debug。
- 宣告完成前，需補齊驗證證據與文件同步證據。

## VS Code 工具習慣

- 回應預設使用繁體中文，程式碼與專有名詞除外。
- 工具呼叫前先用一句話說明意圖。
- 可平行的讀取或搜尋儘量平行執行。
- 搜尋檔案或路徑前先確認實際存在；不要憑空捏造路徑。
- 修改文字檔使用 `apply_patch`；不要用 shell write tricks 產生或覆寫檔案。
- 修改前先讀取相關檔案；變更保持最小範圍。
- 不執行 `git push`、部署、生產資料修改、大範圍刪除等不可逆操作，除非使用者明確要求。
- 若 worktree 已有使用者變更，不要還原或覆蓋不相關內容。

## 輸出格式

- 對使用者說明時保持精簡，優先說明完成了什麼、驗證了什麼、還有哪些風險。
- 引用本 workspace 內檔案時使用 Markdown 連結，例如 `[AGENTS.md](../AGENTS.md)`。
- 不輸出破碎的內部 citation 格式。
- 若無法執行驗證，明確說明原因。

## 完成前檢查

宣告完成前確認：

- 變更符合本輪 Task Card 範圍。
- `agent-status.md` 已回寫；`standard / heavy` 任務的 build plan 也已同步。
- 驗證證據已記錄；未執行的驗證有原因。
- `Active Task` 已結束或提供明確 Resume Entry。
- Copilot 最終回覆與活文件狀態一致。
