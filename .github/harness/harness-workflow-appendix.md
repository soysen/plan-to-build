# Harness Workflow Appendix

本附錄承接 `.github/harness/harness-workflow.md` 的低頻範例、文字樣板與流程觀測參考，避免主 workflow 文件承載過多常駐 token。

## 步驟地圖

| 階段       | 本地入口                                                    | 產出                                                              |
| ---------- | ----------------------------------------------------------- | ----------------------------------------------------------------- |
| 路由       | `using-agent-skills`                                        | 建議下一個 workflow                                               |
| 想法       | `idea-refine`                                               | 可執行概念、MVP 邊界、核心假設                                    |
| 驗證       | `problem-validation`                                        | 問題、受眾、替代方案與成功訊號                                    |
| 定義       | `analyze-spec`                                              | `.github/harness/spec/{feature-name}-spec.md`                     |
| 設計       | `design-architecture`                                       | Sitemap、SA、SD 或架構筆記                                        |
| API 合約   | `api-and-interface-design`                                  | endpoint / interface contract 與錯誤格式                          |
| 規劃       | `plan-build`                                                | `.github/harness/plan/{feature-name}-build-plan.md` 與 agent 狀態 |
| 任務追蹤   | `create-issues`                                             | GitHub Issues 或本地待辦任務                                      |
| Context    | `context-engineering`                                       | rules、agent 設置與工作階段 context                               |
| 測試規劃   | `write-tests`                                               | 測試計畫、測試骨架或測試報告                                      |
| 文件驗證   | `source-driven-development`                                 | 官方文件依據與 API 使用確認                                       |
| 建置       | `tdd-build` / `incremental-implementation`                  | 帶 checkpoint 的薄切片實作                                        |
| 前端       | `frontend-ui-engineering` / `browser-testing-with-devtools` | UI 狀態、互動、可近用性與 browser/runtime 證據                    |
| 除錯       | `debugging-and-error-recovery`                              | 根因、修復、回歸驗證與恢復入口                                    |
| 審查       | `code-review-and-quality`                                   | findings、缺口、風險備註                                          |
| 安全       | `security-and-hardening`                                    | 安全邊界、漏洞檢查與強化項                                        |
| 效能       | `performance-optimization`                                  | 量測結果、瓶頸與優化                                              |
| 簡化       | `code-simplification`                                       | 不改變行為的重構與複雜度移除                                      |
| 文件       | `documentation-and-adrs`                                    | README、ADR、決策脈絡或使用者影響文件                             |
| 自動化     | `ci-cd-and-automation`                                      | CI/CD workflow 與品質關卡                                         |
| 廢棄/遷移  | `deprecation-and-migration`                                 | sunset、migration plan 與消費者遷移策略                           |
| 提交       | `git-commit`                                                | Conventional Commit 與版本變更                                    |
| 發布       | `shipping-and-launch` / `post-deploy-monitoring`            | 發布清單、監控、回滾訊號與部署後驗證                              |
| 上線後優化 | `post-launch-optimization`                                  | adoption / KPI 檢查與下一輪 backlog                               |
| 回顧       | `retrospective-and-learnings`                               | 經驗、學習與流程改善回寫                                          |

## 固定輸出路徑

| 產物       | 路徑                                                     |
| ---------- | -------------------------------------------------------- |
| 問題探索   | `.github/harness/discovery/{feature-name}-discovery.md`  |
| Spec       | `.github/harness/spec/{feature-name}-spec.md`            |
| 架構與設計 | `.github/harness/design/{feature-name}-architecture.md`  |
| 建置計畫   | `.github/harness/plan/{feature-name}-build-plan.md`      |
| Agent 狀態 | `.github/worklog/agent-status.md`                        |
| 交付筆記   | `.github/harness/launch/{feature-name}-launch.md`        |
| 回顧       | `.github/harness/retrospectives/{feature-name}-retro.md` |

## 純資訊查詢 vs 工具序列範例

正例（可視為純資訊查詢）：

- 「harness workflow 的重點是什麼？」
- 「TASK-009 做了哪些事？」（只需口頭摘要，不改文件）

反例（屬工具序列，不能跳過閘門）：

- 「幫我再檢視一次 workflow 並回寫建議到文件。」
- 「把某條規則改寫後同步到 plan 與 agent status。」

## 執行追蹤卡樣板

```text
Execution Tracking:
- CurrentStep:
- Evidence:
- NextStep:
```

## Reset Decision 樣板

```text
Reset Decision
- 放棄項：
- 保留項：
- 接替策略：
```

## 最小 KPI（流程可觀測性）

為避免規則漂移，建議每週至少做一次輕量 KPI 回顧。若無自動化，使用活文件手動統計即可。

| KPI                | 定義                                   | 計算方式                                      | 建議頻率 | 目標值（建議）     |
| ------------------ | -------------------------------------- | --------------------------------------------- | -------- | ------------------ |
| 啟動到第一切片耗時 | 新需求提出到第一個可執行切片開始的時間 | `第一個 In progress 時間 - 需求確認時間`      | 每週     | 中位數小於 30 分鐘 |
| 追蹤卡更新密度     | 每個任務的追蹤卡更新是否足夠           | `Execution Tracking 更新次數 / 已完成切片數`  | 每週     | 大於等於 1.0       |
| 驗證缺漏率         | 宣告完成時未執行驗證的比例             | `有「未執行驗證」註記任務數 / 當週完成任務數` | 每週     | 小於等於 10%       |

回寫建議：

- 週檢時可把 KPI 結果摘要回寫到當週 build plan 或 retrospective。
- 若連續兩週未達標，優先調整對應章節：啟動檢查、追蹤卡規則、最小驗證矩陣或 DoD。
