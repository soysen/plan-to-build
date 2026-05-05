# GitHub CLI 操作指南

## 前置條件

```bash
# 確認 gh 已安裝
gh --version

# 登入 GitHub
gh auth login

# 確認目標 repo
gh repo view
```

---

## 初始化 Labels

在新 repo 建立標準 Labels（只需執行一次）：

```bash
# 類型 Labels
gh label create "backend"        --color "0075ca" --description "後端相關任務"
gh label create "frontend"       --color "e4e669" --description "前端相關任務"
gh label create "infrastructure" --color "d93f0b" --description "基礎建設任務"
gh label create "testing"        --color "0e8a16" --description "測試相關任務"
gh label create "deployment"     --color "5319e7" --description "部署相關任務"
gh label create "design"         --color "bfd4f2" --description "設計審查 Issue"
gh label create "spec"           --color "f9d0c4" --description "規格確認 Issue"

# 優先序 Labels
gh label create "priority:high"   --color "b60205" --description "🔴 必要（Must have）"
gh label create "priority:medium" --color "fbca04" --description "🟡 應有（Should have）"
gh label create "priority:low"    --color "0e8a16" --description "🟢 可有（Nice to have）"

# 狀態 Labels
gh label create "blocked"          --color "e4e669" --description "有未完成的前置相依"
gh label create "needs-discussion" --color "d876e3" --description "需要討論或確認"
gh label create "good first issue" --color "7057ff" --description "適合新手入門"
```

---

## 初始化 Milestones

```bash
# 依照規格書的里程碑建立
gh api repos/:owner/:repo/milestones \
  --method POST \
  --field title="M0 - 基礎建設" \
  --field description="開發環境與工具鏈就緒" \
  --field due_on="{YYYY-MM-DDT00:00:00Z}"

gh api repos/:owner/:repo/milestones \
  --method POST \
  --field title="M1 - MVP" \
  --field description="核心功能可運作" \
  --field due_on="{YYYY-MM-DDT00:00:00Z}"

gh api repos/:owner/:repo/milestones \
  --method POST \
  --field title="M2 - Beta" \
  --field description="完整功能" \
  --field due_on="{YYYY-MM-DDT00:00:00Z}"

gh api repos/:owner/:repo/milestones \
  --method POST \
  --field title="M3 - Launch" \
  --field description="正式上線" \
  --field due_on="{YYYY-MM-DDT00:00:00Z}"
```

---

## 建立單一 Issue

```bash
gh issue create \
  --title "TASK-001：{任務標題}" \
  --body "## 描述
{任務描述}

## 驗收標準
- [ ] {標準 1}
- [ ] {標準 2}
- [ ] 測試通過（\`pnpm test\`）
- [ ] TypeScript / Lint 無錯誤

## 參照
- 建置計畫：TASK-001
- SA：MOD-XXX
- SD：API \`POST /api/v1/{endpoint}\`" \
  --assignee "{github-username}" \
  --milestone "M1 - MVP" \
  --label "backend,priority:high"
```

---

## 批次建立 Issues（從 JSON 清單）

先產出 JSON 清單檔，再批次執行：

```bash
# 從 JSON 批次建立（由 create-issues skill 產出 docs/issues/batch-{date}.json）
cat docs/issues/batch-{YYYY-MM-DD}.json | jq -c '.[]' | while read issue; do
  title=$(echo $issue | jq -r '.title')
  body=$(echo $issue | jq -r '.body')
  assignee=$(echo $issue | jq -r '.assignee // empty')
  milestone=$(echo $issue | jq -r '.milestone')
  labels=$(echo $issue | jq -r '.labels | join(",")')

  args=(--title "$title" --body "$body" --milestone "$milestone" --label "$labels")
  [ -n "$assignee" ] && args+=(--assignee "$assignee")

  gh issue create "${args[@]}"
  echo "✅ 建立：$title"
done
```

---

## 查詢與管理

```bash
# 列出所有開啟的 Issues
gh issue list

# 依 label 篩選
gh issue list --label "backend,priority:high"

# 依 milestone 篩選
gh issue list --milestone "M1 - MVP"

# 依 assignee 篩選
gh issue list --assignee "@me"

# 關閉 Issue（任務完成時）
gh issue close {issue-number} --comment "已完成：TASK-XXX commit {hash}"

# 重新指派
gh issue edit {issue-number} --assignee "{new-username}"

# 查看 Issue 詳情
gh issue view {issue-number}
```

---

## 常用 Issue Body 格式（依階段）

### spec 階段（待確認問題）

```markdown
## 問題描述

{從規格書 [待確認] 提取的問題}

## 影響範圍

- 需求：REQ-F001
- 里程碑：M1

## 選項

- [ ] 選項 A：{描述}
- [ ] 選項 B：{描述}

## 決策期限

{日期}
```

### design 階段（技術決策）

```markdown
## 設計問題

{從 SA/SD [待確認] 提取的問題}

## 背景

{為何需要這個決策}

## 選項分析

| 選項 | 優點   | 缺點   |
| ---- | ------ | ------ |
| A    | {優點} | {缺點} |
| B    | {優點} | {缺點} |

## 建議

{如有偏好選項}
```

### build 階段（Bug 回報）

```markdown
## 問題描述

{清楚描述 bug}

## 重現步驟

1. {步驟 1}
2. {步驟 2}
3. 觀察到：{實際行為}

## 預期行為

{應該發生什麼}

## 環境

- 環境：local / staging / production
- 版本 / Commit：{hash}

## 相關任務

- TASK-XXX
```

---

## 狀態同步

Issue 建立後，同步更新建置計畫：

| Issue 狀態        | 建置計畫任務狀態 | 說明                   |
| ----------------- | ---------------- | ---------------------- |
| Open              | 🔲 待處理        | 預設狀態               |
| Assigned          | 🔄 進行中        | 有 Assignee 且開始作業 |
| Closed            | ✅ 已完成        | PR merged 或手動關閉   |
| Labeled `blocked` | 🚫 已封鎖        | 前置任務未完成         |
