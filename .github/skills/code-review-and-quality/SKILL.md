---
name: code-review-and-quality
description: "執行多維度的程式碼審查。語意情境：當使用者表達「幫我 Review 這段 Code」、「檢查這支 PR 有沒有問題」或需要針對架構與效能全面評估時觸發。"
argument-hint: "描述要審查的程式碼範圍，例如：審查任務建立功能的 PR"
user-invocable: true
freedom: medium
models-tested: [flash, sonnet, opus]
---

# 程式碼審查與品質 (code-review-and-quality)

## 目錄
1. [硬性規則 (Must)](#硬性規則-must)
2. [適用時機與豁免規則](#適用時機與豁免規則)
3. [五維審查框架](#五維審查框架)
4. [審查輸出格式](#審查輸出格式)
5. [延伸參考資源](#延伸參考資源)
6. [完成前檢核](#完成前檢核)

## 硬性規則 (Must)
1. **[MUST] 標註單向門 / 雙向門風險 (One-way vs. Two-way Door)**：審查報告開頭必須明確標註變更爆炸半徑（🚨 單向門：核心架構/破壞性 API/底層資料庫變更；🚪 雙向門：局部 UI/樣式/可逆無副作用調整）。
2. **[MUST] 寫審分離與機械瑕疵直接修正 (Fix & Commit)**：發現非商業邏輯的機械性問題（排版、未用變數、型別標記、語法防呆遺漏），審查者應直接動手修正並 Commit，僅在商業意圖有疑義時留 Comment。
3. **[MUST] 阻擋性問題明確 (Clear Blockers)**：審查結論必須給出明確的二元狀態（`Approve` 或 `Request Changes`）。若有阻擋性問題（🔴 Must Fix），必須附帶修復範例。
4. **[MUST] 拒絕淺模組與過度設計**：檢查變更中是否有無意義的包裝或超前設計，適時要求消除淺模組（參考 [程式碼簡化指南](./references/code-simplification-guide.md)）。
5. **[MUST] 安全底線守門**：任何未參數化 SQL、未消毒 XSS、敏感資訊明文寫入，一律視為 🔴 Must Fix（參考 [安全性檢核清單](./references/security-checklist.md)）。
6. **[MUST] 小型變更 (micro) 豁免**：單檔微調依靠 TypeScript / Lint 診斷與測試即可，禁止輸出無意義長篇審查報告。

## 適用時機與豁免規則
- 審查 PR 或完成 `standard`/`heavy` 任務切片時。
- 提交前自我審查 (Self-review)。

## 五維審查框架 (按需使用)
```text
1. CORRECTNESS   → 程式碼符合 Spec 且處理邊界？
2. READABILITY   → 命名清晰、無神奇數字？
3. ARCHITECTURE  → 關注點分離、無循環依賴、無淺模組？
4. SECURITY      → 無注入漏洞、無敏感資訊外洩？
5. PERFORMANCE   → 無 N+1 查詢、資料庫分頁完整？
```

## 審查輸出格式

```markdown
## Code Review 結果

### 🚪 風險評級
- **門禁類型**：[🚨 單向門 (高風險不可逆) | 🚪 雙向門 (低風險可逆)]
- **影響範圍**：核心資料模型 / 局部前端頁面

### 🔴 必須修改（阻擋合併）
- `src/api/tasks.ts:42` — SQL 查詢未參數化，有 injection 風險

### 🟡 建議改進（不阻擋）
- `src/services/taskService.ts:67` — N+1 查詢，建議使用 join 或 include

### 🟢 值得肯定 / 直接修復項目
- 邊界條件處理完整，單元測試覆蓋齊全
- [已自動修正] 移除未使用的引用與排版調整
```

## 延伸參考資源
- [程式碼簡化與防禦性重構指南](./references/code-simplification-guide.md)
- [安全性防護與漏洞檢核表](./references/security-checklist.md)

## 完成前檢核
- [ ] 所有「🔴 必須修改」項目皆有明確依據與修復方向。
- [ ] 執行過靜態檢查與測試 (`npm test`) 無回歸。
- [ ] 無 console.log 或臨時除錯代碼殘留在生產檔案。
- [ ] 給出明確審查結論 (Approve / Request Changes)。
