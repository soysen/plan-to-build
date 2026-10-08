# 發佈與上線檢核清單 (Release & Launch Checklist)

本指南作為 `git-commit` 的延伸參考，規範生產交付、版本釋出與部署前後的安全檢查 SOP。

## 1. 變更危險度評估 (Merge Danger Assessment)
在發佈前必須評估本次變更類型：
- **雙向門 (Two-Way Door)**：低風險、隨時可透過 Feature Flag 關閉或乾淨 Revert，不影響儲存結構。
- **單向門 (One-Way Door)**：涉及資料庫 Schema Migration、不可逆的資料清洗、外部金流或第三方 Webhook 契約變更。
  - 單向門操作必須先有資料庫備份與 Migration Rollback 腳本。

## 2. 發佈前核驗清單 (Pre-Launch Checklist)
- [ ] 所有 CI 檢查（Lint, Typecheck, Test, Build）在主幹分支全數通過。
- [ ] 相關環境變數已同步至正式環境（或 Staging）。
- [ ] 資料庫 Migration 腳本已在預發環境演練過，確認相容既有資料。
- [ ] 具備監控與告警設定（如 Sentry, CloudWatch, Datadog）。

## 3. 回滾計畫 (Rollback Plan)
- 若部署後 15 分鐘內拋出不可預期重大錯誤：
  1. 第一時間執行版本回退：`git revert` 或雲端服務一鍵回退至上一 Stable 版本。
  2. 通知利害關係人並將系統切至維護或降級模式。
  3. 進入 postmortem 事故復盤，禁止直接在線上熱修補 (Hotfix on Prod)。
