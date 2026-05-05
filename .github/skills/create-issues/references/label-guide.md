# Label 規範與初始化

## 標準 Label 清單

### 類型 Labels

| Label            | 色碼      | 說明           | 自動推斷條件           |
| ---------------- | --------- | -------------- | ---------------------- |
| `backend`        | `#0075ca` | 後端相關任務   | 任務類型 = BE          |
| `frontend`       | `#e4e669` | 前端相關任務   | 任務類型 = FE          |
| `infrastructure` | `#d93f0b` | 基礎建設任務   | 任務類型 = Infra       |
| `testing`        | `#0e8a16` | 測試相關任務   | 任務類型 = Test        |
| `deployment`     | `#5319e7` | 部署相關任務   | 任務類型 = Deploy      |
| `design`         | `#bfd4f2` | 設計審查 Issue | 階段 = design          |
| `spec`           | `#f9d0c4` | 規格確認 Issue | 階段 = spec            |
| `bug`            | `#d73a4a` | Bug 回報       | 階段 = build + 非 TASK |
| `documentation`  | `#0075ca` | 文件更新       | 階段 = spec/design     |

### 優先序 Labels

| Label             | 色碼      | 對應                    | 自動推斷條件  |
| ----------------- | --------- | ----------------------- | ------------- |
| `priority:high`   | `#b60205` | 🔴 必要（Must have）    | 規格書標記 🔴 |
| `priority:medium` | `#fbca04` | 🟡 應有（Should have）  | 規格書標記 🟡 |
| `priority:low`    | `#0e8a16` | 🟢 可有（Nice to have） | 規格書標記 🟢 |

### 狀態 Labels

| Label              | 色碼      | 說明             | 手動加上時機        |
| ------------------ | --------- | ---------------- | ------------------- |
| `blocked`          | `#e4e669` | 有未完成前置相依 | 前置 TASK 未完成    |
| `needs-discussion` | `#d876e3` | 需要討論         | 有 `[待確認]` 項目  |
| `good first issue` | `#7057ff` | 適合新手         | 估點 ≤ 2 且邏輯簡單 |
| `wontfix`          | `#ffffff` | 不修復           | 決定不處理的問題    |
| `duplicate`        | `#cfd3d7` | 重複 Issue       | 與既有 Issue 重複   |

---

## Label 自動推斷規則

```
任務類型 → 類型 Label
  BE      → backend
  FE      → frontend
  Infra   → infrastructure
  Test    → testing
  Deploy  → deployment
  Int     → backend + frontend

規格書優先序 → 優先序 Label
  🔴  → priority:high
  🟡  → priority:medium
  🟢  → priority:low

前置任務存在且未完成 → blocked
文件含 [待確認] → needs-discussion
估點 1-2 且無複雜邏輯 → good first issue（選擇性）
```

---

## 一鍵初始化腳本

將以下腳本存為 `scripts/init-labels.sh`，在新 repo 執行一次：

```bash
#!/bin/bash
# init-labels.sh — 初始化標準 Labels

set -e

REPO="${1:-$(gh repo view --json nameWithOwner -q .nameWithOwner)}"
echo "初始化 Labels：$REPO"

create_label() {
  local name="$1" color="$2" desc="$3"
  gh label create "$name" \
    --repo "$REPO" \
    --color "$color" \
    --description "$desc" \
    --force  # --force 表示若已存在則更新
  echo "  ✅ $name"
}

echo "--- 類型 Labels ---"
create_label "backend"        "0075ca" "後端相關任務"
create_label "frontend"       "e4e669" "前端相關任務"
create_label "infrastructure" "d93f0b" "基礎建設任務"
create_label "testing"        "0e8a16" "測試相關任務"
create_label "deployment"     "5319e7" "部署相關任務"
create_label "design"         "bfd4f2" "設計審查 Issue"
create_label "spec"           "f9d0c4" "規格確認 Issue"
create_label "bug"            "d73a4a" "Bug 回報"
create_label "documentation"  "0075ca" "文件更新"

echo "--- 優先序 Labels ---"
create_label "priority:high"   "b60205" "🔴 必要（Must have）"
create_label "priority:medium" "fbca04" "🟡 應有（Should have）"
create_label "priority:low"    "0e8a16" "🟢 可有（Nice to have）"

echo "--- 狀態 Labels ---"
create_label "blocked"          "e4e669" "有未完成的前置相依"
create_label "needs-discussion" "d876e3" "需要討論或確認"
create_label "good first issue" "7057ff" "適合新手入門"
create_label "wontfix"          "ffffff" "不修復"
create_label "duplicate"        "cfd3d7" "重複 Issue"

echo ""
echo "✅ 完成！共建立 $(gh label list --repo "$REPO" --limit 100 | wc -l) 個 Labels"
```

執行方式：

```bash
chmod +x scripts/init-labels.sh
./scripts/init-labels.sh
# 或指定 repo
./scripts/init-labels.sh owner/repo-name
```
