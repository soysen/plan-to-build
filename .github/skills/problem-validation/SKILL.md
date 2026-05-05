---
name: problem-validation
description: 在寫 spec 前驗證問題與需求是否成立。使用時機：有想法或功能方向，但尚未確認痛點是否真實、使用者是否明確、替代方案是否不足、成功訊號是否可驗證時。觸發關鍵字：需求驗證、problem validation、用戶研究、訪談、驗證痛點、驗證需求、problem-solution fit、discovery。
argument-hint: "描述要驗證的問題、目標使用者與目前假設，例如：想確認中小團隊是否真的需要一個跨專案任務收斂工具"
user-invocable: true
---

# 問題驗證

## 概覽

不要把猜測直接寫成規格。這個 skill 的目標是在 `idea-refine` 和 `analyze-spec` 之間，確認問題是否真實存在、誰最痛、現有替代方案為何不夠、以及什麼證據足以支持繼續投入。

## 適用時機

- 有產品想法，但還不確定問題是否值得做
- 有功能方向，但不確定使用者是否真的在乎
- spec 前需要做 discovery / user research / problem-solution fit 驗證
- 需要整理訪談、觀察、競品與替代方案證據
- 想決定是進入 spec、繼續研究，還是直接停損

**不適用時機：** 若問題已被充分驗證，只差整理正式需求，改用 `analyze-spec`。若你要的是發散新方向，先用 `idea-refine`。

## 工作模式

```text
TRIAGE     → 快速驗證：檢查這是否值得繼續問下去
STANDARD   → 預設模式：整理證據、痛點、受眾、替代方案
DEEP DIVE  → 面向商業重要專案：加入更多訪談、風險與決策依據
```

## 輸入前提

開始前至少要有：

- 問題假設
- 目標使用者假設
- 目前認為的替代方案
- 你為什麼覺得這件事值得做

若以上全都沒有，先回到 `idea-refine`。

---

## 工作流程

```text
1. DEFINE HYPOTHESES   → 列出問題、受眾、價值假設
2. MAP ALTERNATIVES    → 找出現有替代方案與行為
3. COLLECT EVIDENCE    → 收集訪談、觀察、數據、競品訊號
4. TEST PROBLEM SEVERITY → 判斷痛點是否高頻、高痛、可被優先解決
5. DECIDE NEXT MOVE    → 繼續 spec / 補研究 / 停止投入
6. WRITE VALIDATION DOC → 產出問題驗證文件
```

### 第一階段：定義假設

至少列出三類假設：

- **Problem Hypothesis**：使用者有什麼具體問題
- **User Hypothesis**：哪一群人最痛
- **Value Hypothesis**：如果問題被解決，會帶來什麼價值

格式建議：

```text
Hypothesis 1:
目標使用者：__
情境：__
目前痛點：__
若改善，價值是：__
```

### 第二階段：替代方案地圖

不要只看直接競品，也要看使用者現在怎麼 workaround：

- Excel / Notion / Slack / email / manual process
- 內部 SOP 或人工作業
- 其他 team 自己拼出來的流程
- 根本不解決，直接忍受

每個替代方案都要回答：

- 它怎麼被使用
- 為什麼沒有完全解決問題
- 使用者為什麼還是留在這個方案上

### 第三階段：收集證據

證據來源可包含：

- 訪談摘錄
- support / sales / success 回報
- 現有產品行為數據
- 競品或市場觀察
- 內部操作紀錄

證據強度分級：

- **Strong**：多個受訪者或可重複數據指向同一問題
- **Medium**：有明確案例，但樣本仍少
- **Weak**：直覺、單一案例或未經驗證推測

### 第四階段：測試問題強度

至少回答：

- 問題發生頻率高嗎？
- 問題夠痛嗎？還是只是 annoyance？
- 現有替代方案真的不夠嗎？
- 誰會最先願意嘗試新解法？
- 這問題若不解，會造成什麼代價？

### 第五階段：做決策

必須在以下四選一中做出結論：

1. **Proceed to Spec**：問題已被足夠驗證，可進 `analyze-spec`
2. **Narrow the Scope**：問題成立，但要縮小目標受眾或場景
3. **Research More**：證據不足，需要補訪談或數據
4. **Stop**：問題不夠痛、太低頻，或替代方案已經夠好

### 第六階段：產出文件

必須寫入：

- `docs/discovery/problem-validation-{YYYY-MM-DD}.md`

若 `docs/discovery/` 不存在，先建立目錄。

文件至少包含：

1. 問題假設
2. 目標受眾
3. 替代方案地圖
4. 證據摘要
5. 問題強度判斷
6. 風險與未知數
7. 結論：Proceed / Narrow / Research / Stop

## 驗證準則

只有在以下條件大致成立時，才建議進入 spec：

- 問題不是單一個人特例
- 至少能描述一個具體高痛情境
- 替代方案存在明顯缺口
- 成功訊號可被衡量
- 有清楚的第一批目標使用者

## 鏈結規則

- 問題驗證成立：切到 `analyze-spec`
- 問題成立但方向還發散：回到 `idea-refine`
- 已經浮現產品成長或 rollout 後的問題：切到 `post-launch-optimization`

## 反模式

- 把自己的痛點直接等同市場痛點
- 只有功能想法，沒有問題陳述
- 用競品存在當成需求成立的唯一證據
- 一邊缺證據，一邊直接寫 PRD
- 忽略使用者現在已經怎麼 workaround
