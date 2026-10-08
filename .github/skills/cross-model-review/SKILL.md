---
name: cross-model-review
description: "執行第三方模型審查，尋找邏輯盲點與邊界錯誤。語意情境：當任務宣告完成前觸發，或使用者表達「請用不同的角度檢查有沒有邏輯漏洞」時觸發。"
argument-hint: "請指派其他模型或啟動獨立的 reviewer Persona 進行盲點檢查"
user-invocable: true
freedom: low
models-tested: [flash, sonnet, opus]
---

# Cross Model Review 工作流

## 目錄
1. [硬性規則 (Must)](#硬性規則-must)
2. [概覽與使用時機](#概覽與使用時機)
3. [審查標準與流程](#審查標準與流程)
4. [審核標記規範](#審核標記規範)
5. [完成前檢核](#完成前檢核)

## 硬性規則 (Must)
1. **[MUST] 獨立性原則**：Reviewer 必須為獨立模型或受限的 Reviewer Agent，嚴禁同一作者自問自答假冒過審。
2. **[MUST] 專注邊界與併發死角**：審查禁止糾結於排版縮排等瑣事，必須檢查併發衝突、競爭條件 (Race Conditions)、極限邊界與未捕獲例外。
3. **[MUST] 認共識不認輪數**：禁止因「已過 3 輪」便草率放行；必須直至所有邏輯質疑皆被解決或合理澄清。
4. **[MUST] 審核通過章 (Marker)**：只有 Reviewer 明確同意後，才可在文件尾端蓋上通過章。

## 概覽與使用時機
AI 在實作時容易陷入思維盲區。Cross Model Review 透過呼叫另一個模型或獨立 Reviewer，從客觀立場尋找盲點。

### 使用時機
- 完成 `heavy` 任務或重大 PR 準備標記結案前。
- 使用者要求「請用不同模型檢查有沒有邏輯漏洞」。

## 審查標準與流程
1. **準備 Context**：整理本次變更的 Diff、Task Card 與測試報告。
2. **呼叫 Reviewer**：指派獨立模型（如透過 `.github/scripts/cross-model-reviewer.js` 或獨立 subagent）。
3. **過招與辯論**：作者針對盲點提出程式碼修復或架構說明。
4. **蓋章放行**：Reviewer 明確確認無安全與邊界漏洞後放行。

## 審核標記規範
在 `.github/worklog/agent-status.md` 或 Task Card 尾端標註：

```text
> [!CHECK] Cross-Model Review Approved by [Model/Role Name]
```

## 完成前檢核
- [ ] 已由獨立模型或第三方視角審閱過變更 Diff。
- [ ] 併發競爭、極限邊界與異常處理已完成辯論與修復。
- [ ] 尾端具備標準 `> [!CHECK] Cross-Model Review Approved by ...` 標記。
