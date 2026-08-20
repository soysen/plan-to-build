---
name: cross-model-review
description: "執行第三方模型審查，尋找邏輯盲點與邊界錯誤。語意情境：當任務宣告完成前觸發，或使用者表達「請用不同的角度檢查有沒有邏輯漏洞」時觸發。"
argument-hint: "請指派其他模型或啟動獨立的 reviewer Persona 進行盲點檢查"
user-invocable: true
---

# Cross Model Review 工作流

## 概覽

AI 在實作時（身為作者）往往會陷入自己的思維盲區。Cross Model Review（雙模型互相審查）是為了強制打破這種視角限制。透過呼叫另一個模型或啟動另一個完全客觀的 Reviewer Persona，來檢查實作計畫或程式碼中的盲點。

## 使用時機

- 當你在執行 `standard` 或 `heavy` 任務，試圖將任務標示為 `Completed` 完成前。
- 使用者要求「請用不同的 AI 模型/視角幫我檢查是否有邏輯漏洞或邊界死角」時。
- **Token 效益省耗目標 (Goal 3: Targeted Trimming)**：作為獨立的第二線防禦門檻，只在重要切片完成時觸發盲點測試，避免無謂消耗巨量 Token。

## Stop Hook 與觸發時機

當你在執行 `standard` 或 `heavy` 任務，並試圖將任務切換為 `Completed` 前，**Stop Hook** 會強制攔截你。
- **只有當任務結尾具備「審核通過標記」時，你才可以真正結束任務。**
- 若無標記，你必須立即啟動本 Skill 進行審查。

## 爭辯與共識標準

1. **尋找盲點**：Reviewer 不該專注於語法層面的小問題，而應關注「邊界情況（Corner Cases）」、「邏輯衝突」與「未處理的例外（Exceptions）」。
2. **無固定輪數**：審查沒有「最多幾輪就必須放行」的規定。不要為了結束而妥協。
3. **明確共識**：Reviewer 必須明確表態。如果是修正，Reviewer 必須確認修正有效；如果是爭辯，Reviewer 必須承認被說服，或者清楚說明堅持反對的理由。

## 審查流程與產出標記

1. **準備 Context**：作者整理出本次的 `Task Card`、變更的檔案與測試結果。
2. **呼叫 Reviewer**：作者將內容交給 Reviewer（可透過切換模型、啟動子代理、或嚴格切換角色）進行檢查。
3. **過招與修正**：雙方針對發現的盲點進行修正。
4. **蓋上審核標記**：當 Reviewer 明確表示同意且無異議後，請在 `.github/worklog/agent-status.md` 的尾端（或 Task Card 尾端）加上以下標記：

```text
> [!CHECK] Cross-Model Review Approved by [Model/Role Name]
```

## Reviewer 注意事項

- 你現在是獨立的審稿人。不要預設立場覺得作者寫的都是對的。
- 例如：若程式碼沒有處理併發邊界問題（如：只剩一件商品但兩人同時下單），你必須抓出來。
- 只有當所有的盲點都獲得解決或合理的解釋，你才能放行並允許蓋上標記。
