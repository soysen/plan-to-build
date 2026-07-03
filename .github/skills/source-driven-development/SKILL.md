---
name: source-driven-development
description: "以官方文件為根據進行實作。語意情境：當使用者表達「請查閱最新官方文件來寫」、「確保這段 Code 符合最佳實踐，不要幻覺」時觸發。"
argument-hint: "描述要實作的功能和使用的框架/版本，例如：使用 React 19 的 useActionState 實作表單送出"
user-invocable: true
---

# 以來源為驅動的開發

## 概覽

每個框架特定的程式碼決策都必須有官方文件支撐。不要憑記憶實作——先驗證、引用來源，讓使用者看到你的根據。訓練資料會過時，API 會被廢棄，最佳實踐會演進。這個 skill 確保使用者得到可以信任的程式碼，因為每個模式都可以追溯到可驗證的權威來源。

## 適用時機

- 使用者想要遵循特定框架當前最佳實踐的程式碼
- 建置 boilerplate、起始碼或將被複製到整個專案的模式
- 實作框架推薦方式很重要的功能（表單、路由、資料取得、狀態管理、auth）
- 審查或改進使用框架特定模式的程式碼
- 任何你即將憑記憶寫框架特定程式碼的時候

**不適用時機：**

- 正確性不依賴特定版本（重新命名變數、修正 typo）
- 在所有版本都一樣運作的純邏輯（迴圈、條件判斷）
- 使用者明確想要速度而非驗證

## 執行流程

```
DETECT  → 偵測技術堆疊和版本
FETCH   → 取得官方文件
IMPLEMENT → 依據文件模式實作
CITE    → 附上引用來源
```

---

### Step 1：偵測堆疊和版本

讀取專案的依賴文件，識別確切版本：

```
package.json    → Node/React/Vue/Angular/Svelte
composer.json   → PHP/Symfony/Laravel
requirements.txt → Python/Django/Flask
go.mod          → Go
Cargo.toml      → Rust
```

明確說明你找到的：

```
偵測到的堆疊：
- React 19.1.0（來自 package.json）
- Vite 6.2.0
- Tailwind CSS 4.0.3
→ 正在取得相關模式的官方文件。
```

如果版本遺失或不明確，**詢問使用者**。不要猜測——版本決定哪些模式是正確的。

---

### Step 2：取得官方文件

取得你要實作功能的具體文件頁面。不是首頁，不是完整文件——是相關頁面。

**來源優先順序（依權威性排列）：**

| 優先級 | 來源                   | 範例                              |
| ------ | ---------------------- | --------------------------------- |
| 1      | 官方文件               | react.dev, docs.djangoproject.com |
| 2      | 官方部落格 / changelog | react.dev/blog, nextjs.org/blog   |
| 3      | Web 標準參考           | MDN, web.dev                      |
| 4      | 瀏覽器/執行環境相容性  | caniuse.com, node.green           |

**非官方來源——絕不作為主要引用：**

- Stack Overflow 答案
- 部落格文章或教學（即使是熱門的）
- AI 生成的文件或摘要
- 自己的訓練資料（這正是為什麼要驗證）

**取得文件時要精確：**

```
❌ 取得 React 首頁
✅ 取得 react.dev/reference/react/useActionState

❌ 搜尋「django 認證最佳實踐」
✅ 取得 docs.djangoproject.com/en/5.0/topics/auth/
```

---

### Step 3：依據文件模式實作

寫出符合文件所示的程式碼：

- 使用文件中的 API 簽名，不要憑記憶
- 如果文件顯示新的做法，使用新的做法
- 如果文件廢棄了某個模式，不要使用廢棄版本
- 如果文件未涵蓋某個東西，標記為未驗證

**當文件與現有程式碼衝突時：**

```
偵測到衝突：
現有程式碼使用 useState 管理表單載入狀態，
但 React 19 文件推薦使用 useActionState 處理這個模式。
（來源：react.dev/reference/react/useActionState）

選項：
A) 使用現代模式（useActionState）— 與當前文件一致
B) 符合現有程式碼（useState）— 與 codebase 一致
→ 你希望哪種方式？
```

浮出衝突，不要靜默選擇一個。

---

### Step 4：引用來源

每個框架特定的模式都要加上引用。使用者必須能夠驗證每個決策。

**在程式碼注解中：**

```typescript
// React 19 使用 useActionState 處理表單
// 來源：https://react.dev/reference/react/useActionState#usage
const [state, formAction, isPending] = useActionState(submitOrder, initialState)
```

**在對話中：**

```
我使用 useActionState 而非手動的 useState 管理表單送出狀態。
React 19 用這個 hook 取代了手動的 isPending/setIsPending 模式。

來源：https://react.dev/blog/2024/12/05/react-19#actions
「useTransition 現在支援 async 函式 [...] 自動處理 pending 狀態」
```

**引用規則：**

- 完整 URL，不縮短
- 盡可能使用深層連結（有 anchor 的連結比頂層頁面更穩定）
- 引用支援非顯而易見決策的相關段落
- 如果找不到模式的文件，明確說明：

```
未驗證：我找不到這個模式的官方文件。
這基於訓練資料且可能已過時。
在生產環境使用前請先驗證。
```

---

## 驗證清單

以來源驅動開發後確認：

- [ ] 從依賴文件中識別了框架和函式庫版本
- [ ] 框架特定模式取得了官方文件
- [ ] 所有來源都是官方文件，而非部落格文章或訓練資料
- [ ] 程式碼遵循當前版本文件中顯示的模式
- [ ] 非顯而易見的決策包含了有完整 URL 的引用
- [ ] 沒有使用廢棄 API（已對照遷移指南確認）
- [ ] 文件與現有程式碼的衝突已浮出給使用者
- [ ] 任何無法驗證的東西都明確標記為未驗證

## 紅旗訊號

- 在未查看那個版本的文件的情況下寫框架特定的程式碼
- 對 API 使用「我相信」或「我認為」而非引用來源
- 在不知道適用哪個版本的情況下實作模式
- 引用 Stack Overflow 或部落格而非官方文件
- 因為出現在訓練資料中就使用廢棄 API
- 在實作前未讀取 `package.json` / 依賴文件
- 交付沒有框架特定決策引用來源的程式碼
