---
name: shipping-and-launch
description: "準備生產環境部署與發布後短週期監控。語意情境：當使用者表達「準備上線 (Launch)」、「列出發布前檢查清單」、「規劃 Rollout 策略」、「部署後短週期健康檢查」時觸發。"
argument-hint: "描述要部署的功能或版本，例如：部署任務分享功能到生產環境"
user-invocable: true
---

# 發布部署與發布後監控 (shipping-and-launch)

## 概覽

有信心地發布。目標不只是部署——而是安全地部署，有監控就位、回滾計畫準備好、清楚了解什麼是成功。每次發布都應該是可逆的、可觀測的、漸進式的。

## 適用時機

- 首次將功能部署到生產環境。
- 發布重大變更給使用者或開放 Beta 計畫。
- **發布後短週期監控 (Post-Deploy Monitoring)**：上線後前 10 分鐘至 24 小時的健康指標與錯誤率檢視。

---

## 流程階段

### Phase 1：發布前檢查清單 (Pre-Launch Checklist)
- **程式碼品質**：測試通過、Lint/Type Check 通過、無 Debug 語句。
- **安全性**：無 Secrets 洩漏、`npm audit` 無高危漏洞、CORS 與 Auth 正常。
- **效能與基建**：Core Web Vitals 良好、生產變數設置完成、Health Check 正常。

### Phase 2：漸進式推出 (Canary & Feature Flag)
1. 部署到 Staging 執行 smoke test。
2. 部署到 Production (功能旗標 OFF)。
3. 金絲雀推出 (5% ➔ 25% ➔ 50% ➔ 100%)。

### Phase 3：回滾計畫 (Rollback Protocol)
明確記錄觸發條件（如錯誤率 > 基準線 2 倍）與 1 分鐘停用 Flag / 5 分鐘 `git revert` 回滾腳本。

### Phase 4：發布後短週期健康監控 (Post-Deploy Health Verification)
上線後前 1 小時與 24 小時內：
1. **健康端點**：回應 HTTP 200。
2. **錯誤率**：監控面板無全新 Exception 類型。
3. **P95 延遲**：無明顯性能回歸。
4. **Agent Handoff Protocol 寫入**：寫入發布與監控結果。

---

## 輸出規範與 Agent Handoff Protocol

```markdown
---
## 🤝 Agent Handoff Protocol (跨 Agent 交接協定)

### 1. 當前階段與狀態 (Current Stage)
- **Workflow Phase**: `Shipping & Post-Deploy Health Check`
- **Active Task ID**: `TASK-005`
- **Status**: `Released & Healthy`

### 2. 本階段完成事項與決策 (Completed Decisions)
- [x] 完成發布前檢查清單 (100% Passed)
- [x] 成功部署至 Production (100% Feature Flag ON)
- [x] 完成 1 小時 Post-Deploy 健康監控（HTTP 200, 0 New Errors）

### 3. 接手 Agent 執行指南 (Next Agent Actionable Guide)
- **Recommended Skill**: `post-launch-optimization` 或 `retrospective-and-learnings`
- **Execution Criteria**:
  - [ ] 1 週後追蹤核心 KPI 達標狀況
  - [ ] 執行 Sprint Retro 檢討會

### 4. 關鍵風險與未決問題 (Risks & Open Questions)
- ⚠️ 預計 2 週後清理 Feature Flag 代碼。
---
```
