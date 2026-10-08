---
name: debugging-and-error-recovery
description: "系統性地診斷並修復錯誤。語意情境：當使用者表達「程式報錯了」、「跑不起來幫我除錯」、「為什麼會出 exception」或遇到建置失敗時觸發。"
argument-hint: "描述遇到的錯誤或問題，例如：任務建立後頁面空白，Console 顯示 TypeError"
user-invocable: true
freedom: high
models-tested: [flash, sonnet, opus]
---

# 除錯與錯誤恢復 (debugging-and-error-recovery)

## 目錄
1. [硬性規則 (Must)](#硬性規則-must)
2. [適用時機與流程圖](#適用時機與流程圖)
3. [六步根本原因恢復法](#六步根本原因恢復法)
4. [特殊情境除錯](#特殊情境除錯)
5. [紅旗訊號](#紅旗訊號)
6. [完成前檢核](#完成前檢核)

## 硬性規則 (Must)
1. **[MUST] 嚴禁憑感覺除錯 (No Vibe Debugging)**：在未取得完整 Error Traceback 之前，禁止猜測並隨意修改產品程式碼。
2. **[MUST] 重現測試優先 (Reproduction First)**：動手修復前，必須先建立最小重現案例（如單元測試或指令），先看見失敗。
3. **[MUST] 禁止治標不治本 (No Symptom Patching)**：嚴禁使用空 catch (`try {} catch {}`) 吞掉錯誤、隨意補假資料 fallback 或註解測試。
4. **[MUST] 回歸防護測試**：修復後必須將重現測試轉為永久回歸防護測試 (Regression Test)。

## 適用時機與流程圖
- 建置失敗、Runtime Error、例外拋出或邏輯錯誤時。

```text
1. REPRODUCE → 穩定重現問題 (Traceback & Repro Case)
2. LOCALIZE  → 二分法與 Call-stack 追蹤定位
3. REDUCE    → 縮小至 Minimal Repro Unit Test
4. FIX       → 解決 Upstream 根本原因 (Root Cause Fix)
5. GUARD     → 撰寫防守測試 (Regression Test)
6. VERIFY    → 全套 Suite 驗證 (No Side Effects)
```

## 六步根本原因恢復法

### Phase 1：重現問題 (Reproduce)
收集完整錯誤 Log 與觸發步驟，確認不是隨機偶發。

### Phase 2：定位範圍 (Localize)
查看 stack trace 中屬於專案程式碼的第一行，避免追蹤外部第三方套件內部。

### Phase 3：縮小至最小重現案例 (Reduce)
撰寫能觸發該問題的最小測試或 script。

### Phase 4：修復根本原因 (Fix Root Cause)
問「為什麼這裡會是 null/錯誤？」，在資料源頭或呼叫端做防衛，而非在末端加空值判斷。

### Phase 5：加入防守測試 (Guard)
將重現案例轉為長期測試案例。

### Phase 6：全套驗證 (Verify)
執行全量測試，確保無破壞既有功能。

## 特殊情境除錯
- **間歇性 Bug**：檢查非同步 race condition、setTimeout 時序問題。
- **Production 專屬 Bug**：檢查環境變數、DB 欄位型別與並發承載差異。

## 紅旗訊號
- 修改程式碼沒有先重現問題。
- 用 `try { ... } catch (e) {}` 靜默吞掉錯誤。
- 加入 null check 但不清楚為什麼值會是 null。
- 用「刷新頁面試試看」作為解決方案。

## 完成前檢核
- [ ] 已找到問題根本原因並完成修復（非僅掩蓋症狀）。
- [ ] 已新增防守回歸測試。
- [ ] 全套測試通過，無副作用。
- [ ] 移除了除錯用的臨時 `console.log`。
