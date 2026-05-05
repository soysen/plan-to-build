---
name: post-deploy-monitoring
description: 上線後短週期監控與驗證。使用時機：剛完成 deploy、需要在前 10 分鐘到 24 小時內確認錯誤率、延遲、關鍵流程、console errors、health checks 與回滾訊號時。觸發關鍵字：post-deploy、部署後監控、canary、health check、verify deploy、剛上線、rollout 驗證、回滾判斷。
argument-hint: "描述剛上線的功能、環境與要觀察的關鍵路徑，例如：邀請功能剛上 production，想監控前 30 分鐘的 health 與 rollback signal"
user-invocable: true
---

# 部署後監控與驗證

## 概覽

部署成功不等於發布成功。這個 skill 專注在最短時間內確認 deploy 是否真的健康：頁面有沒有掛、錯誤有沒有暴增、延遲有沒有回歸、關鍵路徑是否能走完，以及要不要立即暫停 rollout 或回滾。

## 適用時機

- production deploy 剛完成
- rollout 已開始，需要做 canary / smoke / health verification
- 有 feature flag，需要觀察旗標打開後的即時影響
- 想在前 10 分鐘、30 分鐘、1 小時、24 小時做短週期健康檢查
- 需要判斷是繼續 rollout、暫停、調查，還是立刻回滾

**不適用時機：** 若你要看的是一週以上的 adoption、retention、KPI 與產品成效，改用 `post-launch-optimization`。若問題已明確是 bug 根因調查，改用 `debugging-and-error-recovery`。

## 模式

```text
QUICK CHECK  → 單次健康檢查，適合 deploy 後 5-10 分鐘內
CANARY       → 短時間連續觀察，確認 rollout 是否可持續擴大
WATCH        → 24 小時內重點觀察，適合高風險版本
```

預設建議使用 `CANARY`。

## 輸入前提

開始前先確認：

- 部署的功能 / 版本 / commit 範圍
- 目標環境（staging / production）
- 健康檢查端點或主要入口頁
- 需要驗證的關鍵使用者流程
- baseline（若有）
- rollout / feature flag 狀態

若沒有 baseline，明確標示：本次只能做 health check，不能做精準 regression 判斷。

---

## 工作流程

```text
1. DEFINE SCOPE        → 定義觀察窗口、頁面與關鍵流程
2. CAPTURE BASELINE    → 收集基準線或標記 baseline 缺失
3. RUN HEALTH CHECKS   → 執行 health、console、latency、flow 檢查
4. COMPARE CHANGES     → 對照 baseline，看變化而非只看絕對值
5. TRIAGE ALERTS       → 分級處理異常：繼續 / 暫停 / 調查 / 回滾
6. WRITE REPORT        → 產出部署後健康報告與後續建議
```

### 第一階段：定義觀察範圍

至少明確以下內容：

- 觀察時間窗：10 分鐘 / 30 分鐘 / 1 小時 / 24 小時
- 關鍵頁面或入口
- 關鍵 API / background job / webhook
- 關鍵使用者流程（例如登入、結帳、邀請、儲存）
- 主要監控指標

### 第二階段：建立或引用 baseline

優先使用 deploy 前已知基準：

- error rate baseline
- p95 latency baseline
- health endpoint baseline
- console errors baseline
- 核心頁面 load time baseline

**原則：** 只對「新變化」警覺，不對歷史上已存在且未惡化的噪音過度反應。

### 第三階段：執行健康檢查

至少檢查：

- health endpoint 是否正常回應
- 主要頁面是否能打開
- 是否出現新的 console / runtime errors
- 主要 API 是否有 5xx / timeout 異常
- p95 latency 是否異常上升
- 關鍵流程是否能手動走通
- 日誌 / error reporting / tracing 是否正常流動

### 第四階段：比較與判斷

參考 canary 思維，用變化分級：

- **CRITICAL**：頁面打不開、health check fail、核心流程失敗、5xx 暴增
- **HIGH**：新 console error 持續出現、p95 latency 超過 baseline 2 倍
- **MEDIUM**：非核心流程退化、單一頁面明顯變慢、可恢復性警訊
- **LOW**：文案、邊角 UI、偶發性雜訊

### 第五階段：Alert triage

每個 alert 都要落在以下四選一：

1. **Continue**：沒有顯著退化，繼續 rollout
2. **Pause**：暫停擴大 rollout，先持續觀察
3. **Investigate**：停止 rollout，交給 `debugging-and-error-recovery`
4. **Rollback**：立即回滾或關閉 flag

判準：

- 單次波動不等於事故，至少確認是否持續 2 個觀察點以上
- 若核心流程失敗，不等待第二次，直接進 `Investigate` 或 `Rollback`
- 若 baseline 不存在，降低信心，不要對輕微效能波動做激烈決策

### 第六階段：產出文件

必須寫入：

- `docs/launch/post-deploy-monitoring-{YYYY-MM-DD}.md`

若 `docs/launch/` 不存在，先建立目錄。

報告至少包含：

1. 部署範圍與時間
2. 觀察窗口與模式
3. 檢查項目
4. baseline 與實際結果
5. alerts 與分級
6. 決策：Continue / Pause / Investigate / Rollback
7. 下一步鏈結 skill 建議

## 建議輸出格式

```text
POST-DEPLOY REPORT
==================
Window:      30 min
Mode:        CANARY
Status:      HEALTHY / DEGRADED / BROKEN

Per-Check Results:
- Health endpoint: OK
- Console errors: 1 new HIGH alert
- P95 latency: 820ms (baseline 390ms)
- Critical flow: PASS

Verdict: PAUSE ROLLOUT
Reason: latency regression > 2x baseline on 2 consecutive checks
```

## 鏈結規則

- 若狀態健康且 rollout 穩定：回到 `shipping-and-launch` 繼續 rollout，或交給 `post-launch-optimization`
- 若有明確 bug / incident：切到 `debugging-and-error-recovery`
- 若主要問題是效能退化：切到 `performance-optimization`
- 若文件、runbook、操作步驟與實際不一致：切到 `documentation-and-adrs`

## 反模式

- 只看 deploy 成功訊息就宣告沒事
- 沒有 baseline 卻對小幅波動過度反應
- 把既有噪音當新問題
- 關鍵流程沒驗證就擴大 rollout
- 發現 HIGH / CRITICAL alert 還繼續硬推 rollout
