---
name: post-launch-optimization
description: "上線後追蹤產品成效並規劃優化迭代。語意情境：當使用者表達「分析上線後的使用者回饋」、「看 KPI 有沒有達標」、「規劃下一輪實驗」時觸發。"
argument-hint: "描述已上線的功能、目標指標與目前觀察，例如：會員邀請功能已上線一週，想檢查 adoption 和下一步優化方向"
user-invocable: true
---

# 上線後追蹤與優化

## 概覽

上線不是結束，而是開始收集真實世界證據。這個 skill 的目標不是只回答「系統有沒有壞」，而是回答：功能是否被採用、是否創造預期價值、哪裡有阻力、下一步應該優先修什麼或試什麼。

## 適用時機

- 功能或版本已經上線到真實使用者
- 需要檢查 adoption、activation、retention、conversion 等產品指標
- 需要整合使用者回饋、客服回報、操作資料與技術監控
- 發布後 1 天 / 1 週 / 2 週 / 1 個月需要做正式回顧
- 需要把觀察整理成可執行的優化 backlog

**不適用時機：** 若問題是 deploy 後前 10 分鐘到 24 小時的短週期健康驗證，先使用 `post-deploy-monitoring`。若問題是服務故障、錯誤暴增或明確 bug，先使用 `debugging-and-error-recovery`。若問題已確定是效能瓶頸，改用 `performance-optimization`。

## 回顧模式

參考 gstack 的 review 分層方式，先選回顧深度，不要每次都做全套：

```text
TRIAGE     → 針對剛上線、指標異常或高風險功能，只看關鍵成敗訊號
POLISH     → 預設模式，完整整理成效、摩擦點、backlog 與下一步
EXPANSION  → 當功能已證明有價值，進一步找出加碼投資與增長槓桿
```

建議預設使用 `POLISH`。若只是發現 KPI 異常後要快速判斷，改用 `TRIAGE`。

## 輸入前提

開始前先確認至少有以下資訊：

- 上線的功能/版本範圍
- 原始 spec 或 launch 時的成功標準
- 發布前 baseline 或預估值（若存在）
- 可取得的資料來源（產品分析、error tracking、support ticket、使用者訪談、數據面板）
- 本次回顧視窗（例如上線後 7 天）

若沒有成功標準，先明確說明只能做「描述性回顧」，不能做真正的成敗判斷。

若沒有 baseline，也要明確標記：**這次只能看現況，不能嚴格判斷是改善還是退步。**

---

## 工作流程

```
1. DEFINE REVIEW WINDOW   → 定義回顧範圍與基準線
2. COLLECT SIGNALS        → 收集量化與質化訊號
3. SCORE WITH EVIDENCE    → 用證據做分項評分
4. BOOMERANG COMPARISON   → 對照 launch 前預期與真實結果
5. DIAGNOSE GAPS          → 找出落差與原因
6. PRIORITIZE ACTIONS     → 產出優先排序的優化 backlog
7. PLAN NEXT ITERATION    → 決定實驗、修正與清理項目
8. WRITE THE REVIEW       → 寫出 post-launch review 文件
```

### 第一階段：定義回顧範圍與基準線

1. 明確記錄這次回顧的功能範圍與上線日期
2. 定義回顧時間窗：
   - D+1：技術穩定度與初步使用
   - D+7：採用與主要摩擦點
   - D+14：行為穩定趨勢與優化方向
   - D+30：是否達成產品目標與是否擴大投資
3. 找出 launch 前定義的成功標準：
   - adoption rate
   - activation rate
   - conversion rate
   - retention / repeat usage
   - support burden
   - 技術健康度（錯誤率、延遲、可用性）
4. 若 launch 前沒有設定基準線，明確補記「缺少 pre-launch baseline」，並避免過度解讀結果

### 基準線原則

參考 gstack `/canary` 的做法：**看變化，不看絕對值。**

- 同樣 2% 的錯誤率，若 baseline 是 0.2%，這是嚴重退步
- 同樣 18% 的 adoption，若目標是 15%，那就不是失敗
- 單一尖峰或單日波動不能直接下結論，至少確認是否持續 2 個觀察點以上

若只有單次異常，先標示為 `transient-signal`，不要直接開啟大規模修正

### 第二階段：收集訊號

同時收集量化與質化資料，不要只看單一面板。

**量化訊號：**

- adoption：有多少符合資格的使用者真的看到並使用功能
- activation：有多少使用者完成核心關鍵行為
- conversion：有多少使用者從起點走到目標終點
- retention：是否有重複使用
- 技術健康：錯誤率、延遲、崩潰、支援工單量

**質化訊號：**

- 使用者回饋
- 客服或業務回報
- 內部團隊觀察
- 使用者訪談摘錄

收集時強制分類為：

- `bug`：與預期不符，必須修正
- `ux-friction`：流程能完成，但有阻力或困惑
- `education-gap`：功能存在但使用者不知道或不理解
- `missing-capability`：需求成立，但目前功能做不到
- `unexpected-positive-signal`：意料外的正向訊號，值得加碼

### 訊號品質規則

- **TESTED**：有事件、儀表板、報表或明確數據支撐
- **OBSERVED**：有客服、訪談、內部觀察或使用者實例
- **INFERRED**：根據多個訊號推測，但尚未直接驗證

不要把 `INFERRED` 寫成既定事實。

### 第三階段：證據式評分

參考 gstack `/devex-review` 的 scorecard 做法，對主要面向給 0-10 分，但**分數只是輸出，不是目的**。每個分數都必須附上證據來源與「10 分長什麼樣」。

```text
9-10  明顯成功，可擴大投入
7-8   有價值，只有局部摩擦
5-6   勉強可用，但成效或體驗有明顯阻力
3-4   採用或價值不足，已影響成長
1-2   幾乎失敗，使用者不回來或核心行為無法成立
0     沒有資料或未被衡量
```

至少評以下維度：

- Adoption
- Activation
- Retention
- Business Impact
- UX Friction
- Technical Health
- Support Load
- Measurement Quality

建議輸出格式：

```text
+====================================================================+
|         POST-LAUNCH SCORECARD                                       |
+====================================================================+
| Dimension         | Score | Evidence                  | Method     |
|-------------------|-------|---------------------------|------------|
| Adoption          | __/10 | [dashboard / query]       | TESTED     |
| Activation        | __/10 | [funnel / event trace]    | TESTED     |
| Retention         | __/10 | [cohort / repeat usage]   | TESTED     |
| Business Impact   | __/10 | [revenue / task success]  | TESTED     |
| UX Friction       | __/10 | [tickets / interviews]    | OBSERVED   |
| Technical Health  | __/10 | [error / latency report]  | TESTED     |
| Support Load      | __/10 | [support volume]          | TESTED     |
| Measurement       | __/10 | [tracking completeness]   | INFERRED   |
+--------------------------------------------------------------------+
| Overall           | __/10 |                           |            |
+====================================================================+
```

### 第四階段：Boomerang 比對

參考 gstack 的 `plan vs reality` 機制，若 launch 前有 spec、目標值或 rollout 假設，必須做一次回彈檢查：

```text
PLAN vs REALITY
================
| Dimension        | Planned | Actual | Delta | Alert |
|------------------|---------|--------|-------|-------|
| Adoption         | __      | __     | __    | ✓/⚠   |
| Activation       | __      | __     | __    | ✓/⚠   |
| Retention        | __      | __     | __    | ✓/⚠   |
| Support Load     | __      | __     | __    | ✓/⚠   |
| Error Rate       | __      | __     | __    | ✓/⚠   |
```

標記規則：

- 若實際結果比預期差距超過 20%，標記 `⚠`
- 若 launch 前沒有對應目標，填 `N/A`
- 若差距只出現在單一觀察點，標記 `watch` 而不是直接判定失敗

### 第五階段：診斷落差

把實際結果對照 launch 目標，不只陳述數字，要嘗試回答原因。

建議用以下框架：

```markdown
觀察：啟用率只有 18%，低於目標 35%
可能原因：

1. 入口曝光不足
2. 使用者沒有在第一步理解價值
3. 第三步表單要求過多資訊
   證據：

- 事件漏斗顯示 62% 使用者卡在 step 2
- 支援工單中有 14 筆提到「不知道下一步」
```

若資料不足以支持因果推論，要明寫「目前只是推測」，並建立後續驗證行動。

診斷時強制檢查四種常見失敗模式：

1. **分發失敗**：功能本身可能有價值，但使用者根本沒看到
2. **價值傳達失敗**：看到了，但第一分鐘不理解為何重要
3. **流程摩擦失敗**：想用，但被步驟、文案或設定卡住
4. **產品假設失敗**：真的沒有形成重複使用或商業價值

### 第六階段：優先排序行動

把觀察轉成可執行項目，分成四類：

1. **Hotfix**：影響使用者完成任務或商業指標的問題
2. **Quick Wins**：低成本、高改善機會的 UX / 文案 / 曝光優化
3. **Experiments**：需要 A/B test、feature flag 或分組驗證的假設
4. **Deeper Bets**：需要新設計、架構或跨團隊投入的大改動

每個項目至少要有：

- 問題描述
- 預期改善的指標
- 估計成本
- 建議 owner
- 建議優先序

如果要進 backlog，額外補上：

- `What`：要做什麼
- `Why`：它在解決哪個可觀察問題
- `Pros`：改善什麼
- `Cons`：成本、風險或副作用
- `Depends on / blocked by`：相依關係

### 第七階段：規劃下一輪迭代

除了功能優化，還要檢查上線後的收尾是否完成：

- 功能旗標是否還需要保留，或可移除
- 臨時監控、額外 logging、緊急 fallback 是否可以降級
- 教學文件、內部 SOP、客服話術是否需更新
- 是否需要回到 `analyze-spec` 或 `plan-build` 重新定義下一階段工作

鏈結規則：

- 若發現 rollout 後穩定性仍不明，回到 `shipping-and-launch`
- 若發現主要是 bug 或 incident，切到 `debugging-and-error-recovery`
- 若發現主要是效能回歸，切到 `performance-optimization`
- 若發現文件、SOP、說明與實際功能脫節，切到 `documentation-and-adrs`
- 若發現這其實不是優化而是新一輪產品方向調整，回到 `analyze-spec`

### 第八階段：產出文件

必須實際寫入兩份文件：

- `docs/launch/post-launch-review-{YYYY-MM-DD}.md`
- `docs/launch/optimization-backlog-{YYYY-MM-DD}.md`

若 `docs/launch/` 不存在，先建立目錄。

`post-launch-review` 至少要包含：

1. 功能範圍與回顧視窗
2. 原始目標與成功標準
3. 實際觀察（量化 + 質化）
4. Scorecard with Evidence
5. Plan vs Reality Boomerang Comparison
6. 與目標的落差分析
7. 決策建議：持續擴張 / 修正後再推 / 降低投資 / 下線

`optimization-backlog` 至少要包含：

1. Hotfix
2. Quick Wins
3. Experiments
4. Deeper Bets
5. 後續需要追蹤的指標
6. 需要同步更新的文件 / SOP / 客服腳本

---

## 輸出規範

- 每個觀察都要標明資料來源
- 每個優化項目都要對應至少一個改善指標
- 區分「已知事實」與「推測假設」
- 若建議做實驗，需寫出成功/失敗判準
- 若建議停止投資，也要明確寫出停止條件與理由
- 若有 baseline，必須顯示 delta，而不是只列現況數字
- 若沒有 baseline，必須明寫這次屬於描述性 review

## 交付後決策框架

在回顧結尾，必須給出以下四選一建議：

1. **Scale**：指標達標，擴大 rollout 或投入更多資源
2. **Fix**：價值成立，但需要先修正明顯摩擦
3. **Experiment**：證據不足，先做低成本驗證
4. **Stop**：效果不成立，暫停或收斂投入

## 反模式

- 只看錯誤率就判定發布成功
- 沒有 pre-launch KPI，卻對結果做強結論
- 把所有回饋都直接當成 roadmap 項目
- 沒有分類 bug / friction / education-gap / missing-capability
- 上線後 backlog 只列功能，不處理 flag、監控與文件清理
- 不做 plan vs reality 比對，導致 launch 前承諾無法被驗證
- 只根據單日波動做大決策，沒有區分 transient signal 與持續趨勢

完成這一輪 review 後，若要整理流程與協作層面的 learnings，下一步切到 `retrospective-and-learnings`。
