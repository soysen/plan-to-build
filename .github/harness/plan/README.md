# Plan

存放建置計畫、任務拆解、估點與 critical path。

任務狀態請使用 .github/harness/harness-status-dictionary.md 定義的狀態詞彙。

閱讀建議（文件過大時）：

- 先維護「未完成任務（未開始 / 進行中 / 阻塞 / 暫停 / 需補充輸入）」在前段。
- 「已完成任務」移到後段，保留摘要與證據連結即可。
- 日常追蹤優先閱讀未完成區塊；交接或稽核時再展開已完成細節。

建議命名：

- {feature-name}-build-plan.md

命名範例：

- promo-plan-update-build-plan.md
- roaming-coupon-build-plan.md

若同 feature 有多次拆分，可在檔名尾端追加語意後綴：

- promo-plan-update-build-plan-mvp.md
- promo-plan-update-build-plan-e2e.md

日期紀錄規則：

- 檔名不含日期。
- 日期記錄於 plan 內容欄位（日期）。
