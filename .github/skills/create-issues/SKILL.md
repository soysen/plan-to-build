---
name: create-issues
description: "根據不同開發階段（spec、design、plan、test、build）的產出文件，建立 GitHub Issues 或本地待辦任務，並支援 assignee、label、milestone 設定。使用時機：完成任一開發階段後需要建立追蹤用的 Issue 或 Task 時。觸發關鍵字：建立 issue、建立任務、create issue、task、待辦事項、指派、assignment、milestone、追蹤進度。"
argument-hint: "指定階段（spec|design|plan|test|build）與模式（github|local），如：plan github"
---

# 建立 Issues 與任務追蹤

## 使用時機

- 完成任一開發階段，需要將產出轉化為可追蹤的 Issue / Task
- 需要指派（assign）工作給團隊成員
- 需要設定里程碑（milestone）與標籤（label）
- 沒有 GitHub 時需要在本地維護待辦清單

## 支援的階段

| 階段     | 觸發來源                         | 產出 Issue 類型                         |
| -------- | -------------------------------- | --------------------------------------- |
| `spec`   | `docs/spec/*.md`                 | 需求確認 Issues（每個 `[待確認]` 項目） |
| `design` | `docs/design/sa-*.md`, `sd-*.md` | 設計審查 Issues（架構決策、待確認項目） |
| `plan`   | `docs/plan/build-plan-*.md`      | 開發任務 Issues（每個 `TASK-XXX`）      |
| `test`   | `docs/test/test-plan-*.md`       | 測試任務 Issues（每個測試案例群組）     |
| `build`  | 目前正在進行的 `TASK-XXX`        | Bug / Subtask Issues                    |

---

## 流程步驟

### 第零階段：確認模式與來源

1. 判斷使用者指定的**階段**（spec / design / plan / test / build）
2. 判斷**輸出模式**：
   - `github`：使用 GitHub CLI（`gh`）直接建立 Issues
   - `local`：產出 Markdown 格式的待辦清單寫入 `docs/issues/`
3. 若模式為 `github`，確認環境：
   - 執行 `gh auth status` 確認已登入
   - 執行 `gh repo view` 確認目標 repo
   - 若未安裝 `gh`，改為 `local` 模式並告知使用者

### 第一階段：解析來源文件

依階段讀取對應文件，提取需要建立 Issue 的項目：

**spec 階段：**

- 讀取最新規格書，找出所有 `[待確認]` 標記的項目
- 找出「開放性問題」（Open Questions）章節的未解決問題

**design 階段：**

- 讀取 SA / SD 文件，找出所有 `[待確認]` 項目
- 找出技術選型尚未確定的部分
- 找出「開放性問題」章節

**plan 階段：**

- 讀取 `docs/plan/build-plan-*.md`
- 提取所有 `TASK-XXX` 任務（包含標題、類型、估點、里程碑、前置相依）
- 依里程碑分組

**test 階段：**

- 讀取 `docs/test/test-plan-*.md`
- 提取所有「🔲 待實作」的測試案例群組
- 依模組分組，每個模組的測試建立為一個 Issue

**build 階段：**

- 由使用者提供 Bug 描述或 Subtask 需求
- 產出單一 Issue

### 第二階段：確認 Assignee 與 Milestone

詢問使用者（或直接使用提供的參數）：

1. **Assignee**：誰負責此 Issue？（GitHub 帳號，可空白）
2. **Milestone**：對應哪個里程碑？（M0 / M1 / M2 / M3）
3. **Labels**：確認自動推斷的 label 是否正確

參考 [Label 規範](./references/label-guide.md) 自動推斷每個 Issue 的 labels。

### 第三階段：建立 Issues

#### GitHub 模式（`github`）

使用 [GitHub CLI 指令範本](./references/gh-cli-guide.md) 逐一執行：

```bash
gh issue create \
  --title "TASK-001：{任務標題}" \
  --body "$(cat <<'EOF'
## 描述
{任務描述}

## 驗收標準
- [ ] {標準 1}
- [ ] {標準 2}

## 參照
- 建置計畫：TASK-001
- SA：MOD-XXX
- SD：API `POST /api/v1/{endpoint}`
EOF
)" \
  --assignee "{github-username}" \
  --milestone "{milestone-title}" \
  --label "backend,priority:high"
```

建立後：

- 記錄每個 Issue 的 `#number` 與 `TASK-XXX` 的對應關係
- 更新 `docs/plan/build-plan-*.md` 中的 Issue 連結欄位
- 若 repo 已啟用 GitHub Projects，將 Issue 加入對應的 Project board，至少填入：
  - Status：Todo
  - Milestone / Iteration：對應里程碑
  - Assignee：若有指定則同步
- 若尚未使用 GitHub Projects，明確告知使用者目前只完成 Issue 建立，追蹤仍分散

#### Local 模式（`local`）

讀取 [Local 任務清單範本](./assets/local-issues-template.md)，產出並**寫入**：

- **路徑**：`docs/issues/{stage}-issues-{YYYY-MM-DD}.md`
- 若 `docs/issues/` 不存在，先建立目錄
- **必須實際寫入檔案，不可只在對話中顯示**

### 第四階段：完成回報

1. 列出所有已建立的 Issue（GitHub 模式：含 `#number` 連結；Local 模式：含檔案路徑）
2. 輸出統計：依里程碑 / 依 Assignee / 依類型的 Issue 數量
3. 說明後續關聯慣例：

- PR 標題或內容應包含 `closes #123` / `refs #123`
- 若使用 `TASK-XXX` 文件編號，也要在 PR 內附上對應 Issue 編號

4. 若有建立失敗的項目，列出原因並提供手動建立的指令

---

## Label 規範

### 類型 Labels（自動依任務類型推斷）

| Label            | 顏色      | 適用            |
| ---------------- | --------- | --------------- |
| `backend`        | `#0075ca` | BE 類型任務     |
| `frontend`       | `#e4e669` | FE 類型任務     |
| `infrastructure` | `#d93f0b` | Infra 類型任務  |
| `testing`        | `#0e8a16` | Test 類型任務   |
| `deployment`     | `#5319e7` | Deploy 類型任務 |
| `design`         | `#bfd4f2` | 設計審查 Issue  |
| `spec`           | `#f9d0c4` | 規格確認 Issue  |
| `bug`            | `#d73a4a` | Bug 回報        |

### 優先序 Labels（自動依 🔴/🟡/🟢 推斷）

| Label             | 對應    |
| ----------------- | ------- |
| `priority:high`   | 🔴 必要 |
| `priority:medium` | 🟡 應有 |
| `priority:low`    | 🟢 可有 |

### 狀態 Labels

| Label              | 說明               |
| ------------------ | ------------------ |
| `blocked`          | 有未完成的前置相依 |
| `needs-discussion` | 需要討論或確認     |
| `good first issue` | 適合新手入門       |

---

## 參考資源

- [GitHub CLI 操作指南](./references/gh-cli-guide.md)
- [Label 規範與初始化腳本](./references/label-guide.md)
- [Local 任務清單範本](./assets/local-issues-template.md)
