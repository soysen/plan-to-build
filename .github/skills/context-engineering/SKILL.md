---
name: context-engineering
description: "優化 AI Agent 的上下文設置。語意情境：當使用者表達「AI 一直忽略專案慣例」、「幫我設定 rules 檔案」、「需要讓 Agent 更了解這個專案」時觸發。"
argument-hint: "描述要設置的上下文範圍，例如：為 Node.js + React 專案建立 copilot-instructions"
user-invocable: true
---

# Context Engineering

## 概覽

在正確的時機提供正確的資訊給 AI Agent。Context 是影響 AI 輸出品質的最大槓桿——太少會導致幻覺，太多會失焦。Context Engineering 是一門刻意管理 Agent 看到什麼、何時看到，以及如何結構化的實踐。

## 適用時機

- 開始新的編碼工作階段
- AI 輸出不符合專案規範（使用錯誤的模式、產生不存在的 API）
- 在不同功能模組間切換
- 為新專案設置 AI 輔助開發環境
- AI 不遵循專案的命名或架構慣例

## Context 的層次結構

```
┌─────────────────────────────────────┐
│  1. Rules 檔案（常駐）              │ ← 整個專案工作階段
├─────────────────────────────────────┤
│  2. Spec / 架構文件（每功能載入）   │ ← 每個功能或工作階段
├─────────────────────────────────────┤
│  3. 相關原始碼（每任務載入）        │ ← 每個任務
├─────────────────────────────────────┤
│  4. 錯誤輸出 / 測試結果（每次迭代）│ ← 每次修改循環
├─────────────────────────────────────┤
│  5. 對話歷史（自動累積）            │ ← 壓縮並管理
└─────────────────────────────────────┘
```

## Phase 0：專案 Agent 環境初始化 (Project Environment Setup)

這是最高優先級的 Setup 流程，確保 Agent 後續的所有操作都具備完整的 Context 基底與基礎建設連接。當使用者要求「為這個專案設定 Agent 環境」時，執行以下動作：

1. **Initialize `CONTEXT.md`**：在專案根目錄或 `docs/` 下建立此檔案，記錄核心 Business Logic、Architecture Decisions 與 Tech Stack。
2. **Issue Tracker Integration**：確認專案使用何種任務追蹤工具（GitHub Issues, Linear, Jira 或本地 Markdown Tracker）。建立或確認標準化 Labels（如 `backend`, `frontend`, `priority:high`, `blocked`）。
3. **Workspace State Setup**：初始化 `.github/worklog/agent-status.md` 來追蹤 Active Task (當前活躍任務)，作為後續 Handoff (交接) 基礎。

---

## Phase 1：建立 Rules 檔案 (Global Constraints)

這是你能提供的最高槓桿 Context (High-Leverage Context)。

### GitHub Copilot：`.github/copilot-instructions.md`

```markdown
# 專案：[名稱]

## 技術堆疊

- React 18, TypeScript 5, Vite, Tailwind CSS
- Node.js 22, Express, PostgreSQL, Prisma

## 指令

- 開發：`npm run dev`
- 建置：`npm run build`
- 測試：`npm test`
- Lint：`npm run lint --fix`
- 型別檢查：`npx tsc --noEmit`

## 程式碼規範

- 使用函式元件與 hooks（不用 class components）
- 使用具名匯出（不用 default export）
- 測試檔案與原始碼並列：`Button.tsx` → `Button.test.tsx`
- 條件 className 使用 `cn()` 工具函式
- Error boundary 設置在 route 層級

## 邊界（必須遵守）

- 不提交 .env 檔案或任何 secrets
- 新增依賴前先確認 bundle size 影響
- 修改資料庫 schema 前需要詢問確認
- 提交前必須執行測試

## 常用模式

### API Route Handler 範例

\`\`\`typescript
app.get('/api/tasks', authenticate, async (req, res) => {
const tasks = await taskService.findByOwner(req.user.id);
return res.json(tasks);
});
\`\`\`
```

### 其他工具對應的 rules 檔案

- **Claude Code**：`CLAUDE.md`（在專案根目錄）
- **Cursor**：`.cursorrules` 或 `.cursor/rules/*.md`
- **Windsurf**：`.windsurfrules`
- **OpenAI Codex**：`AGENTS.md`

---

## Phase 2：任務開始時的 Context 載入

每個任務開始前，提供以下結構化的 context：

```
任務 Context：
- 我們在建置：[功能描述]
- 相關 spec 章節：[貼入或引用 spec 段落]
- 要修改的檔案：
  - src/routes/tasks.ts（要新增的端點）
  - src/services/taskService.ts（業務邏輯）
  - tests/tasks.test.ts（要擴展的測試）
- 要遵循的模式：參考 src/routes/users.ts 的寫法
- 限制：
  - 必須使用現有的 ValidationError class
  - 不要修改資料庫 schema（本次範圍外）
```

**有效 vs 低效 context：**

```
❌ 低效：「這是我們 5000 字的完整 spec：[完整 spec]」
✅ 有效：「這是認證功能的 spec 章節：[只有認證段落]」

❌ 低效：「你需要了解整個 codebase」
✅ 有效：讓 AI 讀取要修改的具體檔案
```

---

## Phase 3：錯誤回饋

測試失敗時，提供精確的錯誤資訊：

```
❌ 低效：把 500 行測試輸出全貼上
✅ 有效：「這個測試失敗：
TypeError: Cannot read property 'id' of undefined
  at TaskService.ts:42 in createTask

測試期待 task.id 存在，但 createTask 回傳 undefined」
```

---

## Phase 4：管理工作階段

長對話會累積過時的 context，主動管理：

```
建議策略：
□ 切換到新功能模組時，開啟新的工作階段
□ 定期摘要進度：「到目前為止我們完成了 X、Y、Z，現在進行 W」
□ 切換任務前明確宣告：「我們結束任務 A，現在開始任務 B」
```

---

## 困惑處理

當 AI 輸出不符合預期時，先檢查：

### Context 衝突

```
若發現：
  Spec 要求 REST API，但現有程式碼用 GraphQL

不要讓 AI 靜默選擇，而是明確提出：
「Spec 要求 REST 端點，但 src/graphql/user.ts 使用 GraphQL。
 應該遵循 spec 還是現有模式？請告訴我偏好。」
```

### 需求不完整

```
若 spec 未說明某個情況：
1. 先查現有程式碼有無先例
2. 若無，停下來詢問，不要自己發明需求

「Spec 定義了任務建立，但未說明重複標題的處理方式。
 選項：A) 允許重複 B) 拒絕 C) 自動加編號
 你希望哪種行為？」
```

---

## 反模式

| 反模式       | 問題                              | 修正方法                                        |
| ------------ | --------------------------------- | ----------------------------------------------- |
| Context 不足 | AI 發明 API、忽略規範             | 在每個任務前載入 rules 檔案和相關原始碼         |
| Context 過載 | AI 失焦，超過 5000 行無關 context | 只包含與當前任務相關的內容（目標 < 2000 行）    |
| Context 過時 | AI 引用已刪除的模式               | 切換主要功能時開啟新工作階段                    |
| 缺少範例     | AI 發明新風格而非遵循現有模式     | 提供一個現有的相似模式作為參考                  |
| 隱性知識     | AI 不知道專案特定規則             | 將規則寫入 rules 檔案——沒有書面記錄就等於不存在 |

## 驗證清單

設置 context 後確認：

- [ ] Rules 檔案存在且涵蓋技術堆疊、指令、規範與邊界
- [ ] AI 輸出符合 rules 檔案中展示的模式
- [ ] AI 引用實際存在的專案檔案和 API（無幻覺）
- [ ] 切換主要任務時有重新整理 context

## 紅旗訊號

- AI 輸出不符合專案規範
- AI 發明不存在的 API 或 import
- AI 重新實作 codebase 中已有的工具函式
- 對話越長品質越差
- 專案中沒有 rules 檔案
- 外部資料檔案或 config 被當作可信指令處理
