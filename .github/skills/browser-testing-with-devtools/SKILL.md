---
name: browser-testing-with-devtools
description: "使用 Chrome DevTools 進行瀏覽器端測試與除錯。語意情境：當使用者表達「幫我測一下畫面上這個流程」、「檢查網路請求為什麼失敗」或「驗證前端 UI 行為」時觸發。"
argument-hint: "描述要測試或驗證的 UI 行為，例如：驗證任務建立後列表正確更新"
user-invocable: true
---

# 瀏覽器測試與 DevTools

## 概覽

在真實瀏覽器環境中驗證前端行為。用 Chrome DevTools MCP 直接觀察 DOM、網路、Console 與 Performance，而不是靠猜測——讓每一個 UI 斷言都有可觀察的證據。

## 適用時機

- 驗證新實作的 UI 元件行為正確
- 追蹤 API 呼叫與網路請求
- 除錯 JavaScript 錯誤或警告
- 確認 accessibility 與鍵盤導航
- 在視覺上確認 RWD 響應式設計
- 執行端對端（E2E）驗證流程

## 執行流程

```
1. NAVIGATE  → 開啟目標頁面
2. OBSERVE   → 擷取 Console / Network / DOM 狀態
3. INTERACT  → 模擬使用者操作
4. VERIFY    → 確認預期的狀態變化
5. REPORT    → 記錄測試結果
```

---

### Phase 1：環境準備

使用 Chrome DevTools MCP 工具導航到目標頁面：

```
// 開啟目標 URL（開發環境）
navigate: http://localhost:5173/tasks

// 確認頁面載入成功
- 頁面標題正確
- 無 Console 錯誤
- Network 無失敗請求（4xx / 5xx）
```

---

### Phase 2：基礎觀察

在執行操作之前先建立 baseline：

```
觀察項目：
□ Console 錯誤或警告
□ 關鍵元素是否存在（使用 DOM 查詢）
□ 目前的網路請求狀態
□ 頁面的 accessibility 結構（aria-label、role）
```

---

### Phase 3：互動測試

模擬使用者操作並觀察結果：

```
操作流程範例（建立任務）：
1. 點擊「新增任務」按鈕
2. 填入標題欄位
3. 選擇優先等級
4. 點擊「送出」
5. 驗證：
   - 任務出現在列表中
   - 無 Console 錯誤
   - API 請求成功（HTTP 201）
   - 表單清空
```

---

### Phase 4：具體驗證項目

**DOM 狀態驗證**

```javascript
// 確認元素存在
document.querySelector('[data-testid="task-list"]')
document.querySelectorAll('[data-testid="task-item"]').length

// 確認文字內容
document.querySelector("h1").textContent

// 確認 class 狀態
document.querySelector(".task-item").classList.contains("completed")
```

**Network 請求驗證**

```
確認 POST /api/tasks：
- Request Body 包含正確欄位
- Response Status: 201
- Response Body 包含新建任務的 id

確認 GET /api/tasks：
- Response Status: 200
- Response Body 為陣列格式
```

**Console 清潔度**

```
確認無：
- [Error] 紅色錯誤
- React key 警告
- 未處理的 Promise rejection
- 過時 API 警告（如 findDOMNode）
```

---

### Phase 5：Accessibility 驗證

```
鍵盤導航測試：
□ Tab 鍵可聚焦所有互動元素
□ Enter / Space 可觸發按鈕
□ Escape 可關閉 Modal / Dropdown
□ 焦點順序合理（從上到下，從左到右）

ARIA 驗證：
□ 表單輸入有關聯的 label
□ 按鈕有語意化文字或 aria-label
□ 動態更新有 aria-live 或 role="status"
□ 圖片有 alt 文字
```

---

### Phase 6：RWD 響應式驗證

```
測試斷點：
□ 320px  - 最小行動裝置
□ 768px  - 平板
□ 1024px - 桌面
□ 1440px - 大螢幕

確認：
- 內容未溢出容器
- 文字可讀（不截斷）
- 觸控目標夠大（44px × 44px 以上）
- 導航可正常使用
```

---

### Phase 7：測試報告

完成測試後輸出結構化結果：

```markdown
## 瀏覽器測試報告

**測試頁面：** http://localhost:5173/tasks
**測試日期：** YYYY-MM-DD
**瀏覽器：** Chrome

### 測試結果

| 項目              | 狀態 | 備註                   |
| ----------------- | ---- | ---------------------- |
| 頁面載入          | ✅   | 無 Console 錯誤        |
| 建立任務          | ✅   | API 返回 201，列表更新 |
| 刪除任務          | ✅   | 項目從 DOM 移除        |
| 鍵盤導航          | ✅   | Tab 順序正確           |
| 行動裝置（320px） | ✅   | 版面無溢出             |

### 發現的問題

- [Bug] 任務標題超過 100 字時 UI 截斷位置不正確
```

## 驗證清單

測試完成後確認：

- [ ] 無 Console 錯誤或警告
- [ ] 所有 API 請求均成功（狀態碼正確）
- [ ] 關鍵使用者流程可完整執行
- [ ] 鍵盤導航可正常操作所有互動元素
- [ ] 至少在 320px 和 1024px 寬度下確認版面
- [ ] 動態狀態更新（載入中、空狀態、錯誤）均已測試

## 紅旗訊號

- UI 只在「我的機器」能正常運作
- 沒有確認 API 回應就宣告功能完成
- 忽略 Console 警告（警告往往是錯誤的前兆）
- 跳過 accessibility 測試
- 只在桌面寬度測試 RWD 頁面
