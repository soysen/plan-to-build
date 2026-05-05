---
name: retrospective-and-learnings
description: 在開發、發布或里程碑後整理學習與流程改進。使用時機：一個 Sprint、功能、發布或事故處理結束後，需要回顧哪些做得好、哪裡卡住、哪些模式要標準化、哪些問題要防止再次發生時。觸發關鍵字：retro、retrospective、回顧、lessons learned、postmortem、process improvement、團隊學習。
argument-hint: "描述要回顧的範圍與時間，例如：回顧這次會員邀請功能從 spec 到上線的整個流程"
user-invocable: true
---

# 回顧與學習沉澱

## 概覽

回顧不是情緒總結，而是把經驗轉成下次可重用的決策、流程與 guardrails。這個 skill 的目標是回答：這次哪裡做對了、哪裡重複浪費、哪些風險其實可以更早看到、哪些 learnings 應該沉澱進 skill、文件或 checklist。

## 適用時機

- 一個功能從 spec 到上線結束後
- Sprint / 里程碑結束後
- 發布後想整理流程學習
- incident / rollback / 大型 bug 修復後
- 想把隱性知識變成文件、規則或 TODO

**不適用時機：** 若當前仍在處理事故，先用 `debugging-and-error-recovery` 或 `post-deploy-monitoring`。若重點是產品 KPI 成效，先用 `post-launch-optimization`。

## 回顧模式

```text
LIGHTWEIGHT  → 單功能或短 Sprint 回顧
STANDARD     → 預設模式，完整回顧流程、風險、協作、技術與結果
POSTMORTEM   → 針對事故、回滾或重大失敗做深度回顧
```

## 工作流程

```text
1. DEFINE SCOPE        → 定義回顧範圍與時間窗
2. RECONSTRUCT TIMELINE → 重建發生了什麼
3. EXTRACT SIGNALS     → 找出成功、失誤、摩擦、意外
4. IDENTIFY ROOT PATTERNS → 不只記事件，要找可重複模式
5. TURN LEARNINGS INTO ACTION → 產出具體改善項目
6. WRITE RETRO         → 寫成回顧文件與後續動作
```

### 第一階段：定義範圍

明確說明：

- 回顧的是哪個功能 / 里程碑 / 事故
- 回顧時間窗
- 涵蓋哪些角色（PM / 設計 / 前端 / 後端 / QA / 維運）
- 這次想回答的核心問題是什麼

### 第二階段：重建時間線

至少列出：

- spec / 設計開始時間
- 重要決策點
- 實作與驗證節點
- 發布與監控節點
- 問題發生與修正節點

不要直接跳結論，先把時間線對齊。

### 第三階段：抽取訊號

分成四類整理：

- **Worked Well**：這次哪些做法明顯有效
- **Friction**：哪些流程讓速度或品質下降
- **Surprises**：哪些事是事前沒預料到的
- **Repeat Risks**：哪些問題若不處理，下次還會再出現

### 第四階段：找出根本模式

不要只寫「這次測試太晚補」，而要追問：

- 為什麼會晚補？
- 是 skill 缺引導？規劃少了 gate？還是 ownership 不清？
- 這是偶發事件還是系統性問題？

常見模式：

- scope drift
- 決策者不清楚
- rollout 太晚準備
- spec 與真實需求落差
- 測試策略缺席
- 文件不同步
- 觀測性不足

### 第五階段：把學習轉成行動

每個 learning 都要轉成明確動作，而不是停在心得：

- 更新哪個 skill
- 更新哪份文件
- 新增哪個 checklist / template / SOP
- 建立哪個 TODO / issue
- 下次在哪個 gate 提前檢查

### 第六階段：產出文件

必須寫入：

- `docs/retrospectives/retro-{YYYY-MM-DD}.md`

若 `docs/retrospectives/` 不存在，先建立目錄。

文件至少包含：

1. 範圍與背景
2. 事件時間線
3. Worked Well
4. Friction / Failures
5. Root Patterns
6. Learnings
7. Concrete Actions
8. Owner / Priority / Due Date

## 建議輸出格式

```text
RETRO SUMMARY
=============
Scope: member-invite launch
Mode: STANDARD

Worked Well:
- 提前使用 feature flag，降低 rollout 風險

Friction:
- spec 中沒有明確定義邀請過期規則，導致後端與前端重工

Root Pattern:
- 邊界情境沒有在 spec gate 被強制檢查

Action:
- 更新 analyze-spec checklist，加入「時效 / 過期 / 重送」邊界題目
```

## 鏈結規則

- 若需要把新 learnings 寫回 skill：更新對應 skill 檔案
- 若發現 backlog：切到 `create-issues`
- 若發現問題其實是產品方向錯誤：回到 `problem-validation` 或 `analyze-spec`
- 若發現是上線後成效問題：切到 `post-launch-optimization`

## 反模式

- 只寫感想，不產出 action
- 把單次偶發問題過度制度化
- 只檢討人，不檢討流程與結構
- 回顧沒有 owner、優先序或到期日
- Learnings 沒有回寫到 skill、模板或文件
