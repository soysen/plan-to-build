---
name: deprecation-and-migration
description: 管理廢棄功能與系統遷移。使用時機：移除舊系統或 API、將消費者從舊實作遷移到新實作，或決定是否繼續維護現有程式碼時。觸發關鍵字：廢棄、deprecation、migration、遷移、移除、sunset、舊系統、legacy、升級、替換。
argument-hint: "描述要廢棄或遷移的功能，例如：廢棄舊版 TaskService 並遷移到新版"
user-invocable: true
---

# 廢棄與遷移

## 概覽

程式碼是負債，不是資產。每一行程式碼都有持續的維護成本——修 bug、更新依賴、安全修補、讓新成員了解。廢棄（Deprecation）是移除不再值得維護的程式碼的紀律；遷移（Migration）是安全地把使用者從舊的移到新的過程。

## 適用時機

- 用新系統取代舊系統、API 或函式庫
- 停用不再需要的功能
- 合併重複的實作
- 移除無人認領但仍被使用的 dead code
- 決定是繼續維護 legacy 系統還是投資遷移

## 廢棄決策

廢棄前，先回答這些問題：

```
1. 這個系統還提供獨特的價值嗎？
   → 是 → 繼續維護
   → 否 → 繼續評估

2. 有多少使用者/消費者依賴它？
   → 量化遷移範圍

3. 替代方案存在嗎？
   → 不存在 → 先建置替代方案，再廢棄舊的

4. 每個消費者的遷移成本是多少？
   → 可以自動化 → 直接遷移
   → 手動且高成本 → 與維護成本相比較

5. 不廢棄的持續維護成本是多少？
   → 安全風險、工程師時間、複雜度成本
```

## 廢棄流程

```
1. DECIDE   → 確認廢棄決策有依據
2. BUILD    → 先建立可用的替代方案
3. ANNOUNCE → 正式宣告廢棄，附帶遷移指南
4. MIGRATE  → 逐一遷移每個消費者
5. REMOVE   → 確認零使用後完全移除
```

---

### Phase 1：建立替代方案

**不要在沒有可用替代方案的情況下廢棄。**

替代方案必須：

- 涵蓋舊系統所有的核心使用案例
- 有文件和遷移指南
- 已在生產環境中驗證（不只是理論上更好）

---

### Phase 2：宣告廢棄

在程式碼中加入廢棄標記：

```typescript
/**
 * @deprecated 請改用 NewTaskService。
 * 遷移指南：docs/migration/task-service.md
 * 預計移除時間：建議遷移（無強制截止日）
 */
class LegacyTaskService {
	/** @deprecated 使用 NewTaskService.findById() */
	async getTask(id: number): Promise<OldTask> {
		console.warn("[DEPRECATED] LegacyTaskService.getTask() 已廢棄，" + "請使用 NewTaskService.findById()")
		// ... 現有實作
	}
}
```

建立遷移文件（`docs/migration/task-service.md`）：

```markdown
## 遷移指南：LegacyTaskService → NewTaskService

**廢棄日期：** YYYY-MM-DD
**替代方案：** NewTaskService
**移除日期：** 建議遷移（無強制截止日）
**廢棄原因：** LegacyTaskService 需要手動擴展且缺乏可觀測性。
NewTaskService 自動處理這兩個問題。

### 遷移步驟

1. 將 `import { LegacyTaskService }` 替換為 `import { NewTaskService }`
2. 更新設定（範例如下）
3. 執行遷移驗證腳本：`npx migrate-check`

### 程式碼對照

| 舊寫法                      | 新寫法                         |
| --------------------------- | ------------------------------ |
| `service.getTask(123)`      | `service.findById('task-123')` |
| `service.listTasks(userId)` | `service.findByOwner(userId)`  |
```

---

### Phase 3：遷移策略

選擇適合情況的遷移模式：

**漸進替換（Strangler Pattern）**

```
階段 1：新系統處理 0%，舊系統 100%
階段 2：新系統處理 10%（金絲雀測試）
階段 3：新系統處理 50%
階段 4：新系統處理 100%，舊系統閒置
階段 5：移除舊系統
```

**適配器模式（Adapter Pattern）**

當你擁有基礎設施，但消費者需要時間遷移時：

```typescript
// 適配器：保留舊介面，底層使用新實作
class LegacyTaskAdapter implements OldTaskAPI {
	constructor(private newService: NewTaskService) {}

	// 舊方法簽名，代理到新實作
	async getTask(id: number): Promise<OldTask> {
		const task = await this.newService.findById(String(id))
		return this.toOldFormat(task)
	}

	private toOldFormat(task: NewTask): OldTask {
		return {
			id: parseInt(task.id),
			taskName: task.title, // 欄位名稱不同
			isComplete: task.done,
		}
	}
}
```

**功能旗標遷移**

```typescript
function getTaskService(userId: string): TaskService {
	if (featureFlags.isEnabled("new-task-service", {userId})) {
		return new NewTaskService()
	}
	return new LegacyTaskService()
}
```

---

### Phase 4：逐一遷移消費者

對每個消費者依序：

```
1. 找出所有使用廢棄系統的地方
2. 更新為使用替代方案
3. 驗證行為一致（測試、整合檢查）
4. 移除對舊系統的引用
5. 確認無回歸
```

---

### Phase 5：完全移除

**只在所有消費者都已遷移後才移除：**

```
1. 確認零使用量（metrics、log、依賴分析）
2. 移除程式碼
3. 移除相關測試、文件和設定
4. 移除廢棄通知（已完成使命）
5. 慶祝——移除程式碼是一種成就
```

---

## 殭屍程式碼

殭屍程式碼是無人認領但仍被使用的程式碼：

```
症狀：
□ 6 個月以上沒有 commit，但仍有使用者
□ 沒有指定的維護者或團隊
□ 測試失敗沒人修
□ 有已知漏洞的依賴沒人更新
□ 文件引用已不存在的系統
```

**處置：** 指定一個 owner 並正常維護，或制定具體的遷移計畫廢棄它。殭屍程式碼不能繼續掛在中間地帶——要麼投資維護，要麼廢棄。

---

## 驗證清單

完成廢棄後確認：

- [ ] 替代方案在生產環境中已驗證可用
- [ ] 遷移指南有具體步驟和範例
- [ ] 所有使用者已遷移（透過 metrics/log 確認）
- [ ] 舊程式碼、測試、文件和設定已完整移除
- [ ] codebase 中無任何引用廢棄系統的地方
- [ ] 廢棄通知已移除

## 紅旗訊號

- 在沒有替代方案的情況下廢棄
- 只宣告廢棄但沒有提供遷移工具或文件
- 「建議性」廢棄掛了幾年但沒有進展
- 沒有量化當前使用量就開始廢棄
- 在廢棄的系統中新增功能（應該投資在替代方案上）
- 沒有確認零使用量就移除程式碼
