---
name: git-commit
description: "執行 git 提交、PR 說明生成、版號管理與發佈檢核。語意情境：當使用者表達「完成任務了，幫我 commit」、「產生 PR 說明」、「準備提交並升級版號發佈」時觸發。"
argument-hint: "輸入提交類型與描述，如：feat(auth): 實作登入 API，或留空自動推斷"
user-invocable: true
freedom: low
models-tested: [flash, sonnet, opus]
---

# Git 提交、PR 生成與發佈管理 (git-commit)

## 目錄
1. [硬性規則 (Must)](#硬性規則-must)
2. [使用時機](#使用時機)
3. [流程步驟](#流程步驟)
4. [PR 說明生成規範 (PR Description)](#pr-說明生成規範-pr-description)
5. [版號升級與發佈檢核](#版號升級與發佈檢核)
6. [延伸參考資源](#延伸參考資源)
7. [完成前檢核](#完成前檢核)

## 硬性規則 (Must)
1. **[MUST] 敏感資訊防外洩**：暫存區若偵測到 `.env`、密鑰檔案 (`*.pem`, `*.key`)，必須立即終止操作並警告。
2. **[MUST] PR 具備三大板塊**：產出 PR 描述時必須包含「視覺化摘要」、「具體命令證據 (Evidence)」、「合併危險度 (Merge Danger)」三大板塊，拒絕口頭保證。
3. **[MUST] 絕不自動強制推送**：嚴禁未經使用者授權自動執行 `git push` 或使用 `--force` / `--no-verify`。
4. **[MUST] 評估單向門/雙向門**：發佈與合併前必須評估本次變更是否可逆（參考 [發佈與上線檢核清單](./references/release-and-launch-checklist.md)）。

## 使用時機
- 完成功能開發或問題修復，需要提交程式碼。
- 需要產生標準 Conventional Commits 訊息（不強制也不需帶 Task ID）。
- 準備開啟 Pull Request 需要高品質說明。
- 變更完成後需要自動升級語意化版號 (SemVer)。

## 流程步驟

### 第一階段：檢查工作區與安全掃描
```bash
git status
git diff --stat
```
確認無敏感設定檔與未預期檔案被暫存。

### 第二階段：暫存與 Conventional Commit
```bash
git add -A
git commit -m "<type>(<scope>): <subject>" -m "<body>"
```

## PR 說明生成規範 (PR Description)
若需要建立 PR 描述，請輸出以下高資訊密度範本：

```markdown
## 1. 視覺化摘要 (Summary)
<!-- 以最小視覺化圖表、Mermaid 流程圖或呼叫樹呈現 -->
```mermaid
flowchart LR
  Client --> API[/api/v1/auth] --> DB[(User Table)]
```

## 2. 具體客觀證據 (Evidence)
- **修改前**：`npm test` 失敗 (Exit code: 1, Cannot find module)
- **修改後**：`npm test` 通過 (Exit code: 0, 32 passed)

## 3. 合併危險度評估 (Merge Danger)
- **變更類型**：`雙向門 (Two-Way Door)` 或 `單向門 (One-Way Door)`
- **風險說明**：無破壞性 Schema 變更，可安全 Revert。
```

## 版號升級與發佈檢核
當所有變更提交且工作區乾淨時：
1. 依照變更決定版號：Major (`BREAKING`), Minor (`feat`), Patch (`fix`)。
2. 更新 `package.json` 中的 `version` 欄位。
3. 建立版本提交與 Git Tag：
```bash
git add package.json
git commit -m "chore: release v{new-version}"
git tag -a "v{new-version}" -m "Release v{new-version}"
```

## 延伸參考資源
- [Commit Message 規範與版號升版規則](./references/commit-convention.md)
- [發佈與上線檢核清單](./references/release-and-launch-checklist.md)

## 完成前檢核
- [ ] 無機密憑證或 `.env` 被加入暫存區。
- [ ] Commit message 符合 Conventional Commits 格式。
- [ ] PR 說明包含摘要、客觀執行日誌證據與危險度評估。
- [ ] 本地變更已乾淨提交，無隨意自動 push。
