---
name: documentation-and-adrs
description: "記錄架構決策與文件撰寫。語意情境：當使用者表達「幫我記錄這個架構決策 (ADR)」、「寫 README 說明」、「補充 API 文件」時觸發。"
argument-hint: "描述要記錄的決策或文件範圍，例如：記錄選擇 PostgreSQL 作為主要資料庫的決策"
user-invocable: true
---

# 文件與架構決策記錄（ADR）

## 概覽

記錄決策，不只是程式碼。最有價值的文件捕捉的是「為什麼」——做出決策時的背景、限制和取捨。程式碼展示「做了什麼」；文件解釋「為什麼這樣做」以及「考慮過哪些替代方案」。

## 適用時機

- 做出重大架構決策
- 在競爭方案中選擇其中一個
- 新增或修改公開 API
- 交付會改變使用者行為的功能
- 讓新成員或 AI Agent 了解專案

**不適用時機：** 不要記錄顯而易見的程式碼。不要加上重述程式碼本身的注解。

---

## ADR（架構決策記錄）

ADR 捕捉重大技術決策背後的理由，是你能寫的最高價值文件。

### 何時寫 ADR

- 選擇框架、函式庫或主要依賴
- 設計資料模型或資料庫 schema
- 選擇認證策略
- 決定 API 架構（REST vs GraphQL vs tRPC）
- 選擇建置工具、部署平台或基礎設施
- 任何代價高昂且難以撤銷的決策

### ADR 範本

儲存在 `docs/decisions/` 目錄，使用流水號命名：

```markdown
# ADR-001：使用 PostgreSQL 作為主要資料庫

## 狀態

Accepted | Superseded by ADR-XXX | Deprecated

## 日期

2025-01-15

## 背景

我們需要為任務管理應用程式選擇主要資料庫。關鍵需求：

- 關聯式資料模型（使用者、任務、團隊的關係）
- 任務狀態變更需要 ACID 交易
- 支援任務內容的全文搜尋
- 有托管服務（小型團隊，有限的維運能力）

## 決策

使用 PostgreSQL 搭配 Prisma ORM。

## 考慮的替代方案

### MongoDB

- 優點：彈性 schema，易於起步
- 缺點：我們的資料本質上是關聯式的；需要手動管理關係
- 拒絕理由：關聯式資料放在文件型資料庫會導致複雜的 join 或資料重複

### SQLite

- 優點：零設定、內嵌、讀取快
- 缺點：並發寫入有限，無生產環境托管服務
- 拒絕理由：不適合多使用者的 Web 應用生產環境

### MySQL

- 優點：成熟、廣泛支援
- 缺點：PostgreSQL 有更好的 JSON 支援、全文搜尋和生態系工具
- 拒絕理由：PostgreSQL 更符合我們的功能需求

## 後果

- Prisma 提供型別安全的資料庫存取和遷移管理
- 可以使用 PostgreSQL 的全文搜尋，不需要加入 Elasticsearch
- 團隊需要 PostgreSQL 知識（標準技能，低風險）
- 部署在托管服務（Supabase、Neon 或 RDS）
```

### ADR 生命週期

```
PROPOSED → ACCEPTED → (SUPERSEDED 或 DEPRECATED)
```

- **不要刪除舊 ADR**——它們保留歷史脈絡
- 當決策改變時，寫一個新 ADR 引用並取代舊的

---

## 程式碼內文件

### 何時加注解

注解「為什麼」，不是「做什麼」：

```typescript
// ❌ 重述程式碼（沒有價值）
// 計數器加 1
counter += 1

// ✅ 解釋非顯而易見的意圖
// 使用滑動視窗做 rate limit——在視窗邊界重置計數器，
// 而不是固定時間表，以防止攻擊者在視窗邊界集中請求
if (now - windowStart > WINDOW_SIZE_MS) {
	counter = 0
	windowStart = now
}
```

### 何時不加注解

```typescript
// ❌ 不注解自明的程式碼
function calculateTotal(items: CartItem[]): number {
	return items.reduce((sum, item) => sum + item.price * item.quantity, 0)
}

// ❌ 不留 TODO（現在就做或建立 issue）
// TODO: 加入錯誤處理  ← 直接加就好

// ❌ 不留被注解掉的程式碼
// const oldImpl = () => { ... }  ← 刪掉，git 有歷史記錄
```

### 記錄已知陷阱

```typescript
/**
 * 重要：此函式必須在第一次 render 之前呼叫。
 * 若在 hydration 後呼叫，會導致未樣式化內容閃現（FOUC），
 * 因為 SSR 期間 theme context 不可用。
 *
 * 詳見 ADR-003 了解完整設計理由。
 */
export function initializeTheme(theme: Theme): void {
	// ...
}
```

---

## API 文件

### TypeScript 的 JSDoc

```typescript
/**
 * 建立新任務。
 *
 * @param input - 任務建立資料（標題必填，描述選填）
 * @returns 含有伺服器生成 ID 和時間戳的新任務
 * @throws {ValidationError} 若標題為空或超過 200 字
 * @throws {AuthenticationError} 若使用者未通過認證
 *
 * @example
 * const task = await createTask({ title: '買牛奶' });
 * console.log(task.id); // "task_abc123"
 */
export async function createTask(input: CreateTaskInput): Promise<Task> {
	// ...
}
```

---

## README 結構

每個專案都應有涵蓋以下內容的 README：

```markdown
# 專案名稱

一段話說明這個專案做什麼。

## 快速開始

1. Clone 此儲存庫
2. 安裝依賴：`npm install`
3. 設置環境：`cp .env.example .env`
4. 啟動開發伺服器：`npm run dev`

## 常用指令

| 指令            | 說明           |
| --------------- | -------------- |
| `npm run dev`   | 啟動開發伺服器 |
| `npm test`      | 執行測試       |
| `npm run build` | 生產建置       |
| `npm run lint`  | 執行 linter    |

## 架構

專案結構和關鍵設計決策的簡要說明。
詳細決策見 `docs/decisions/`。

## 貢獻

如何貢獻、程式碼規範、PR 流程。
```

---

## 為 AI Agent 撰寫文件

AI Agent 在有好文件的情況下工作得更好：

- **Rules 檔案（`.github/copilot-instructions.md`）** — 記錄專案慣例，讓 Agent 遵循
- **Spec 檔案** — 保持 spec 更新，讓 Agent 建置正確的東西
- **ADR** — 幫助 Agent 理解過去決策的原因（防止 re-deciding）
- **陷阱注解** — 防止 Agent 掉入已知的坑

---

## 驗證清單

完成文件後確認：

- [ ] 重大架構決策有 ADR
- [ ] README 涵蓋快速開始、常用指令和架構概覽
- [ ] API 函式有參數和回傳型別文件
- [ ] 已知陷阱有就地的 inline 注解
- [ ] 無被注解掉的程式碼
- [ ] Rules 檔案是最新的且準確

## 紅旗訊號

- 沒有書面理由的架構決策
- 沒有文件或型別的公開 API
- README 沒有說明如何執行專案
- 被注解掉的程式碼而不是刪除
- 留著幾週的 TODO 注解
- 重述程式碼而非解釋意圖的文件
