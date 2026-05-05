# Commit Message 規範與版號升版規則

## Conventional Commits 規範

格式：

```
<type>(<scope>): <subject>

[body]

[footer]
```

---

## Type 定義

| Type              | 說明                                |            升版影響            |
| ----------------- | ----------------------------------- | :----------------------------: |
| `feat`            | 新增功能                            |            Minor ↑             |
| `fix`             | 修正 Bug                            |            Patch ↑             |
| `perf`            | 效能改善（不影響 API）              |            Patch ↑             |
| `refactor`        | 重構（不影響行為）                  |            Patch ↑             |
| `test`            | 新增或修改測試                      |             不升版             |
| `docs`            | 文件更新                            |             不升版             |
| `style`           | 格式調整（空格、縮排等）            |             不升版             |
| `chore`           | 維護性工作（依賴更新、設定）        | 不升版（版號 commit 本身除外） |
| `infra`           | 基礎建設相關                        |             不升版             |
| `ci`              | CI/CD 設定                          |             不升版             |
| `revert`          | 回滾前一個 commit                   |            Patch ↑             |
| `BREAKING CHANGE` | 不相容的 API 變更（在 footer 標記） |          **Major ↑**           |

---

## Scope 建議

以下為常見 scope 命名，依專案模組而定：

| Scope         | 說明                         |
| ------------- | ---------------------------- |
| `auth`        | 驗證 / 授權模組              |
| `user`        | 使用者模組                   |
| `api`         | API 層通用                   |
| `db`          | 資料庫 / Migration           |
| `ui`          | 前端通用 UI                  |
| `{page-name}` | 特定頁面                     |
| `config`      | 設定檔                       |
| `deps`        | 依賴套件                     |
| `task-{n}`    | 特定任務 ID（如 `task-001`） |

Scope 可省略，但有助於快速定位變更範圍。

---

## Subject 規則

- 動詞開頭，現在式（implement / add / fix / update）
- 中文亦可：「實作」、「新增」、「修正」、「更新」
- 不超過 72 字元
- 結尾不加句號

```
✅ feat(auth): 實作使用者登入 API
✅ fix(user): 修正查詢使用者時未過濾已刪除紀錄
✅ test(auth): 新增登入 integration tests
❌ feat: done
❌ fix: fix bug.
```

---

## Body 規則

- 用於說明**為何**做這個變更，以及**做了什麼**
- 每行不超過 72 字元
- 與 subject 之間空一行

```
feat(order): 實作訂單建立 API

新增 POST /api/v1/orders 端點，支援以下功能：
- 驗證庫存是否足夠
- 計算總金額（含折扣）
- 發送訂單確認 Email（非同步）
```

---

## Footer 規則

| 用法              | 範例                                                             |
| ----------------- | ---------------------------------------------------------------- |
| 關聯任務          | `Refs: TASK-001`                                                 |
| 關閉 GitHub Issue | `Closes #42`                                                     |
| 不相容變更        | `BREAKING CHANGE: 移除 GET /api/users 的 page 參數，改用 cursor` |
| 多個              | 每項各一行                                                       |

---

## 版號升版規則

### 語意化版本（Semantic Versioning）

格式：`MAJOR.MINOR.PATCH`（如 `1.3.2`）

| 版號位置   | 何時升版                                                  | 範例              |
| ---------- | --------------------------------------------------------- | ----------------- |
| **MAJOR**  | 有 `BREAKING CHANGE`                                      | `1.3.2` → `2.0.0` |
| **MINOR**  | 有 `feat`，且無 breaking change                           | `1.3.2` → `1.4.0` |
| **PATCH**  | 有 `fix` / `perf` / `refactor`，且無 feat / breaking      | `1.3.2` → `1.3.3` |
| **不升版** | 只有 `test` / `docs` / `style` / `chore` / `ci` / `infra` | 不變              |

> **優先序**：BREAKING CHANGE > feat > fix/perf/refactor > 其他

### 計算範例

若本次 commit 包含：

- `feat(auth): 實作登入`
- `fix(user): 修正查詢錯誤`
- `test(auth): 新增測試`

→ 最高等級為 `feat` → **Minor 升版**：`1.2.3` → `1.3.0`

---

## Pre-release 版號（選擇性）

開發中可使用 pre-release 版號：

| 階段              | 格式              | 範例            |
| ----------------- | ----------------- | --------------- |
| Alpha（內部測試） | `x.y.z-alpha.{n}` | `1.0.0-alpha.1` |
| Beta（外部測試）  | `x.y.z-beta.{n}`  | `1.0.0-beta.3`  |
| RC（候選發布）    | `x.y.z-rc.{n}`    | `1.0.0-rc.1`    |
| 正式發布          | `x.y.z`           | `1.0.0`         |

---

## 常見錯誤

```
❌ git commit -m "update"          → 無 type，無法判斷變更性質
❌ git commit -m "WIP"             → 不應提交未完成的 WIP（應用 stash）
❌ git commit -m "fix everything"  → subject 過於模糊
❌ git commit --no-verify          → 跳過 pre-commit hook（禁止）
```
