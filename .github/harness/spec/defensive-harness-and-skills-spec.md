# Defensive Harness and Skills Optimization Spec (TASK-114)

## 目標 (Goals)
1. **消滅「存在性陷阱」**：升級 `harness-cli.js` 的 `check` 與 `validate`，不僅檢查 Spec 檔案是否存在，且斷言其內容包含關鍵章節（`## 目標` 或 `## Goals`、`## 驗收標準` 或 `## Acceptance Criteria`）且驗收標準條目 $\ge 2$。
2. **落實雙寫原子性檢查（Dual-Write Atomicity）**：`harness-cli.js validate` 必須校驗 `agent-status.md` 的 Active Task ID 在 `.github/harness/plan/` 中有對應的 build plan，且當 Active Task 為非完成狀態（如 `進行中`）時，Plan 內必須存在至少一個進行中 `[-]` 或待處理 `[ ]` 的切片。
3. **擴充 Project Guard Hook 插件機制**：在 `harness-cli.js validate` 流程中，自動掃描並執行 `.github/scripts/*-guard.js` 守門腳本，讓子專案可客製化零 Token 的語法與追蹤屬性防呆。
4. **注入防範說謊測試與單雙向門審查規範**：
   - 在 `tdd-build/SKILL.md` 明訂「嚴禁三種說謊測試（同義反覆、原始碼字串比對、過度 Mock 吞掉異常）」，強制測試公開介面。
   - 在 `code-review-and-quality/SKILL.md` 導入「單向門 (One-way) / 雙向門 (Two-way)」風險標記，並落實寫審分離、機械瑕疵直接 Commit 修復原則。
5. **Retro 三路環境沉澱閉環**：在 `retrospective-and-learnings/SKILL.md` 確立踩坑後的「Linter/Guard Hook $\times$ Review Skill $\times$ AGENTS.md 路標」三路沉澱原則。

## 非目標 (Non-goals)
- 不改寫特定下游專案（如 `fetnet-eservice-f2e`）的特有業務程式碼或專屬相容性規則。
- 不移除 `plan-to-build` 現有的 11 大核心 Skill 架構。

## 架構與實作設計 (Architecture & Implementation)

### 1. Spec 結構斷言函式 (`assertSpecContent`)
```javascript
function validateSpecStructure(specContent) {
  // 檢查是否包含目標章節與驗收標準章節
  // 檢查驗收標準列表項目是否 >= 2
}
```

### 2. 雙寫同步校驗函式 (`validateDualWrite`)
```javascript
function validateDualWrite(activeTask, status, planFiles) {
  // 尋找對應 task id 的 build-plan.md
  // 檢查切片標記與狀態一致性
}
```

### 3. Project Guard 插件機制
在 `runValidate()` 尾端執行：
```javascript
const guardScripts = fs.readdirSync(SCRIPTS_DIR).filter(f => f.endsWith('-guard.js') && !f.endsWith('.test.js'));
// 依序執行並回報結果
```

### 4. 驗收標準 (Acceptance Criteria)
1. **Spec 結構校驗**：當傳入空白或缺乏「目標」/「驗收標準」/驗收條目少於 2 條的 Spec 時，`harness-cli` 必須阻斷並提出具體缺失；合規 Spec 則順利 PASS。
2. **雙寫同步驗證**：當 `agent-status.md` 為「進行中」但對應的 `build-plan.md` 缺失或所有切片皆已打勾/未定義時，`harness-cli.js validate` 阻斷並報錯。
3. **Project Guard Hook**：若存在符合 `*-guard.js` 的腳本，`harness-cli validate` 會自動執行並納入驗證結果（若 Guard 失敗則整體驗證失敗）。
4. **Skills 規範完備性**：`tdd-build`、`code-review-and-quality`、`retrospective-and-learnings` 皆通過 `node .github/scripts/validate-skills.js` 語法與品質檢核。
5. **既有測試相容性**：所有既有 `npm test`（35+ 個測試）與新增測試 100% 通過。

---
<!-- Agent Handoff Protocol
- Step: Spec completed
- Evidence: .github/harness/spec/defensive-harness-and-skills-spec.md
- Next: Create build plan task-114-build-plan.md
-->
