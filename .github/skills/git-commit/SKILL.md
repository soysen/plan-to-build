---
name: git-commit
description: "執行 git 提交，自動整理暫存區、產出符合規範的 commit message，並在無其他待提交變更時自動升版 package.json。使用時機：完成一個任務或功能後需要提交程式碼時。觸發關鍵字：git commit、提交、commit、版號升版、bump version、暫存、git add、semantic versioning。"
argument-hint: "輸入提交類型與描述，如：feat TASK-001 實作登入 API，或留空由 skill 自動推斷"
---

# Git 提交與版號管理

## 使用時機

- 完成一個任務（`TASK-XXX`）或功能開發，需要提交程式碼
- 需要產出符合 Conventional Commits 規範的 commit message
- 所有變更提交完畢後，需要自動升版 `package.json`

---

## 流程步驟

### 第一階段：檢查工作區狀態

執行以下指令，確認目前變更：

```bash
git status
git diff --stat
```

1. 列出：
   - **已暫存（Staged）** 的檔案
   - **未暫存（Unstaged）** 的已修改檔案
   - **未追蹤（Untracked）** 的新檔案
2. 若工作區乾淨（無任何變更），告知使用者並結束

### 第二階段：整理暫存區

依使用者意圖決定暫存範圍：

**全部暫存（預設）**：

```bash
git add -A
```

**部分暫存**（若使用者指定特定檔案或目錄）：

```bash
git add {檔案路徑或目錄}
```

暫存後，再次執行 `git diff --cached --stat` 確認暫存內容，並顯示給使用者確認。

### 第三階段：產出 Commit Message

依照 [Commit Message 規範](./references/commit-convention.md) 自動推斷或產出 message：

**格式**：

```
<type>(<scope>): <subject>

[body - 可選]

[footer - 可選，如 BREAKING CHANGE 或 closes #issue]
```

**自動推斷規則**：

1. 從暫存的檔案路徑與內容判斷 `type`（feat / fix / test / refactor 等）
2. 從目錄結構或任務 ID 推斷 `scope`
3. 產出簡潔的 `subject`（≤ 72 字元，動詞開頭，中文或英文均可）
4. 若有對應的 `TASK-XXX`，加入 footer：`Refs: TASK-XXX`

**範例 message**：

```
feat(auth): 實作使用者登入 API

- 新增 POST /api/v1/auth/login 端點
- 實作 JWT access token 發放邏輯
- 加入登入失敗的錯誤處理

Refs: TASK-003
```

向使用者展示預計使用的 commit message，確認後再執行。

### 第四階段：執行提交

```bash
git commit -m "<type>(<scope>): <subject>" -m "<body>" -m "<footer>"
```

若 commit message 僅有一行：

```bash
git commit -m "<type>(<scope>): <subject>"
```

確認提交成功（顯示 commit hash 與統計）。

### 第五階段：檢查是否需要升版

提交完成後，執行以下判斷：

```bash
git status
```

**若工作區乾淨（無其他待提交變更）**：
→ 進入 **第六階段：升版 `package.json`**

**若仍有未提交的變更**：
→ 告知使用者目前剩餘的變更清單，**不升版**，結束並建議繼續提交

### 第六階段：升版 package.json

1. 讀取 `package.json`，取得目前版號（`version` 欄位）
2. 依照 [語意化版本規範](./references/commit-convention.md#版號升版規則) 決定升版類型：

   | 本次提交包含          | 升版類型 | 範例              |
   | --------------------- | :------: | ----------------- |
   | `BREAKING CHANGE`     |  Major   | `1.0.0` → `2.0.0` |
   | `feat`                |  Minor   | `1.0.0` → `1.1.0` |
   | `fix` / `perf` / 其他 |  Patch   | `1.0.0` → `1.0.1` |

3. 計算新版號並更新 `package.json` 的 `version` 欄位
4. 若專案為 Monorepo（根目錄有多個 `package.json`），詢問使用者要升版哪些套件
5. 提交版號變更：

   ```bash
   git add package.json
   # Monorepo 時加入所有受影響的 package.json
   git commit -m "chore: bump version to {new-version}"
   ```

6. 告知使用者：
   - 舊版號 → 新版號
   - 升版類型（Major / Minor / Patch）
   - 升版 commit hash

---

## 安全守則

- **絕不自動執行** `git push`，提交後僅在本地操作
- 不修改已發布（已 push）的 commit（不執行 `--amend` 或 `--force`）
- 若偵測到 `.env`、私鑰檔案（`*.pem`、`*.key`）在暫存區，**立即停止**並警告使用者
- 不跳過 pre-commit hooks（不使用 `--no-verify`）

---

## 參考資源

- [Commit Message 規範與版號升版規則](./references/commit-convention.md)
