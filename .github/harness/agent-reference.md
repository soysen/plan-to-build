# Agent Reference

## 可用 Skills

本 repo 的 workflow skills 位於 `.github/skills/<skill-name>/SKILL.md`。任務符合某個 skill 時，先讀取對應 `SKILL.md`，再依其流程執行。

| Skill                           | 用途                                                |
| ------------------------------- | --------------------------------------------------- |
| `using-agent-skills`            | 不確定使用哪個 skill 時，選擇合適 workflow          |
| `idea-refine`                   | 將模糊想法提煉成可執行概念                          |
| `problem-validation`            | 在寫 spec 前驗證問題、受眾與替代方案                |
| `analyze-spec`                  | 產出需求規格與驗收標準                              |
| `design-architecture`           | 產出 Sitemap、SA、SD 或架構設計                     |
| `api-and-interface-design`      | 設計 API / interface contract 與錯誤格式            |
| `plan-build`                    | 將設計拆成建置計畫、任務估點與里程碑                |
| `create-issues`                 | 依 spec / design / plan / test / build 產出追蹤任務 |
| `context-engineering`           | 建立或改善 agent rules、上下文與工作階段設定        |
| `write-tests`                   | 產出測試計畫、測試骨架或測試報告                    |
| `source-driven-development`     | 以官方文件確認框架或 API 使用方式                   |
| `tdd-build`                     | 依建置任務進行 Red-Green-Refactor 實作              |
| `incremental-implementation`    | 以薄切片逐步交付跨檔功能                            |
| `frontend-ui-engineering`       | 建構或修改生產品質 UI                               |
| `browser-testing-with-devtools` | 使用 browser/runtime 證據驗證前端行為               |
| `debugging-and-error-recovery`  | 系統性診斷並修復錯誤                                |
| `code-review-and-quality`       | 進行正確性、可讀性、架構、安全與效能審查            |
| `security-and-hardening`        | 強化輸入、認證、授權與敏感資料邊界                  |
| `performance-optimization`      | 基於量測做效能優化                                  |
| `code-simplification`           | 在不改變行為下簡化程式碼                            |
| `documentation-and-adrs`        | 撰寫 README、ADR、決策脈絡與使用者影響文件          |
| `ci-cd-and-automation`          | 建立 CI/CD 與自動化品質關卡                         |
| `deprecation-and-migration`     | 管理廢棄功能、遷移與 sunset 策略                    |
| `git-commit`                    | 整理提交並產出符合規範的 commit message             |
| `shipping-and-launch`           | 準備部署、發布檢查、監控與回滾策略                  |
| `post-deploy-monitoring`        | 部署後短週期監控與健康驗證                          |
| `post-launch-optimization`      | 上線後追蹤 adoption / KPI 並規劃優化 backlog        |
| `retrospective-and-learnings`   | 在任務、發布或事故後整理學習與流程改善              |

## 常用驗證

這個 repo 以 Markdown、skills 與 harness 文件為主。文件任務的預設驗證：

```bash
git --no-pager diff --stat
git --no-pager status --short
```

同時使用 VS Code diagnostics 檢查被修改的 Markdown 檔案。若任務涉及引用一致性，使用搜尋確認 harness 文件沒有殘留不存在的 skill / prompt 名稱。
