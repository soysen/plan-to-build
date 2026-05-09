# Agent Entry Point

這個檔案是給 Antigravity 與其他支援 `AGENTS.md` 的 agent 使用的入口。

---

## ⚠️ 強制前置動作（MANDATORY — 不可跳過）

**在回應任何用戶請求之前，你必須依序完成以下步驟，否則視為違規：**

### Step 1：讀取主規範
使用 `view_file` 讀取 `.github/copilot-instructions.md`，理解決策樹與絕對禁止事項。

### Step 2：套用決策樹，選擇 skill
根據 `.github/copilot-instructions.md` 中的決策樹判斷當前任務屬於哪個開發階段，選出對應的 skill 名稱。
若無法判斷，讀取 `.github/skills/using-agent-skills/SKILL.md`。

### Step 3：讀取對應 SKILL.md
使用 `view_file` 讀取 `.github/skills/<skill-name>/SKILL.md`。

### Step 4：按照 SKILL.md 的步驟執行
**嚴格照 SKILL.md 的步驟推進，不可自行發明流程、不可跳步驟。**

---

## 禁止行為

- ❌ 不可在未讀 `copilot-instructions.md` 的情況下直接開始任何實作
- ❌ 不可在未讀對應 `SKILL.md` 的情況下推進任務
- ❌ 不可使用自己的 Planning Mode 替代 skill 流程

---

本檔案只負責導向 `.github/`，不存放規範內容本身。
