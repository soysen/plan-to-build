---
name: using-agent-skills
description: 發現並調用適合的 Agent Skill。使用時機：開始新的工作階段、不確定哪個 skill 適用於當前任務，或需要了解完整的 skill 集合和開發生命週期流程時。觸發關鍵字：using skills、用哪個 skill、skill 選擇、哪個適合、從哪裡開始、agent skills、skill 索引。
argument-hint: "描述你目前的任務，Agent 將協助你選擇最適合的 skill"
user-invocable: true
---

# 使用 Agent Skills

## 概覽

Agent Skills 是按照開發階段組織的工程工作流程集合。每個 skill 封裝了資深工程師遵循的特定流程。這個 meta-skill 幫助你發現並套用當前任務的正確 skill。

## Skill 選擇指南

```
任務到來
    │
    ├── 模糊的想法？ ───────────────→ idea-refine
    ├── 想先驗證問題是否成立？ ─────→ problem-validation
    ├── 新專案/功能/需求? ───────────→ analyze-spec
    ├── 有 spec，需要架構設計？ ─────→ design-architecture
    ├── 有架構，需要任務規劃？ ─────→ plan-build
    ├── 有任務，開始實作？ ─────────→ tdd-build（或 incremental-implementation）
    │   ├── UI 工作？ ────────────────→ frontend-ui-engineering
    │   ├── API 工作？ ───────────────→ api-and-interface-design
    │   ├── 需要更好的 context？ ─────→ context-engineering
    │   └── 需要文件驗證的程式碼？ ──→ source-driven-development
    ├── 撰寫/執行測試？ ────────────→ write-tests
    │   └── 瀏覽器測試？ ────────────→ browser-testing-with-devtools
    ├── 有東西壞了？ ───────────────→ debugging-and-error-recovery
    ├── 審查程式碼？ ───────────────→ code-review-and-quality
    │   ├── 安全疑慮？ ──────────────→ security-and-hardening
    │   └── 效能疑慮？ ──────────────→ performance-optimization
    ├── 程式碼太複雜？ ─────────────→ code-simplification
    ├── 提交 / 版本管理？ ──────────→ git-commit
    ├── CI/CD 管線工作？ ───────────→ ci-cd-and-automation
    ├── 撰寫文件/ADR？ ─────────────→ documentation-and-adrs
    ├── 廢棄舊功能？ ───────────────→ deprecation-and-migration
    ├── 部署/上線？ ────────────────→ shipping-and-launch
    ├── 剛 deploy，要驗證健康？ ───→ post-deploy-monitoring
    ├── 已上線，要追蹤成效/優化？ → post-launch-optimization
    └── 一輪結束，要整理學習？ ───→ retrospective-and-learnings
```

---

## 完整生命週期序列

一個完整功能的典型 skill 序列：

```
1. idea-refine                → 提煉模糊想法
2. problem-validation         → 驗證問題與受眾是否值得投入
3. analyze-spec               → 定義要建置什麼
4. design-architecture        → 建立系統架構
5. plan-build                 → 拆解為可驗證的任務
6. write-tests                → 規劃測試策略
7. context-engineering        → 載入正確的 context
8. source-driven-development  → 驗證框架特定模式
9. tdd-build                  → 逐個任務實作
10. code-review-and-quality    → 合併前審查
11. git-commit                → 整潔的提交歷史
12. documentation-and-adrs   → 記錄決策
13. shipping-and-launch       → 安全部署
14. post-deploy-monitoring    → 驗證剛上線的 deploy 是否健康
15. post-launch-optimization  → 驗證真實成效並規劃下一輪迭代
16. retrospective-and-learnings → 把 learnings 回寫到流程與文件
```

不是每個任務都需要每個 skill。修 bug 可能只需要：`debugging-and-error-recovery` → `tdd-build` → `code-review-and-quality`。

---

## 快速參考

| 階段 | Skill                         | 一行說明                          |
| ---- | ----------------------------- | --------------------------------- |
| 定義 | idea-refine                   | 通過結構化思考提煉想法            |
| 定義 | problem-validation            | 驗證問題、受眾與替代方案是否成立  |
| 定義 | analyze-spec                  | 開立規格書，定義驗收標準          |
| 設計 | design-architecture           | 建立 SA/SD，設計系統架構          |
| 規劃 | plan-build                    | 拆解為可執行的建置計畫            |
| 測試 | write-tests                   | 測試計畫、骨架與測試報告          |
| 建置 | tdd-build                     | TDD 逐任務實作                    |
| 建置 | incremental-implementation    | 薄切片、逐步建置                  |
| 建置 | source-driven-development     | 每個決策都有官方文件根據          |
| 建置 | context-engineering           | 在正確時機提供正確 context        |
| 建置 | frontend-ui-engineering       | 生產品質的 UI（含 accessibility） |
| 建置 | api-and-interface-design      | 穩定介面、清晰合約                |
| 驗證 | browser-testing-with-devtools | Chrome DevTools 執行期驗證        |
| 驗證 | debugging-and-error-recovery  | 重現 → 定位 → 修復 → 防守         |
| 審查 | code-review-and-quality       | 五維審查（正確性、可讀性等）      |
| 審查 | security-and-hardening        | OWASP 防範、輸入驗證              |
| 審查 | performance-optimization      | 先測量，只優化有問題的            |
| 審查 | code-simplification           | 移除複雜度，不改變行為            |
| 交付 | git-commit                    | Conventional Commits，自動版號    |
| 交付 | ci-cd-and-automation          | 每次提交的自動品質關卡            |
| 交付 | documentation-and-adrs        | 記錄「為什麼」，不只是「做什麼」  |
| 交付 | deprecation-and-migration     | 安全地廢棄與遷移                  |
| 交付 | shipping-and-launch           | 發布前清單、監控、回滾計畫        |
| 交付 | post-deploy-monitoring        | 驗證剛 deploy 的健康與回滾訊號    |
| 交付 | post-launch-optimization      | 上線後追蹤 KPI、回饋與優化迭代    |
| 維護 | retrospective-and-learnings   | 整理 learnings 並轉成改善行動     |

---

## 核心行為原則

這些行為適用於所有時刻，跨越所有 skill：

### 1. 浮出假設

在實作任何非顯而易見的事情之前，明確說明你的假設：

```
我做的假設：
1. [關於需求的假設]
2. [關於架構的假設]
3. [關於範圍的假設]
→ 現在糾正我，否則我將按這些假設繼續。
```

### 2. 積極管理困惑

當遇到不一致、衝突的需求或不清楚的規格時：

1. **停止。** 不要用猜測繼續。
2. 說出具體的困惑。
3. 提出取捨或問釐清性問題。
4. 等待解決後再繼續。

### 3. 必要時推回

你不是附和機器。當一個方法有明確問題時：

- 直接指出問題
- 解釋具體的缺點（量化，「這增加 ~200ms 延遲」）
- 提出替代方案
- 如果對方有充分資訊後仍選擇覆蓋，接受決定

### 4. 強制簡單性

在完成任何實作前，問：

- 這可以用更少的行數做到嗎？
- 這些抽象是否值得它們的複雜度？
- 有沒有更直接的解法？

### 5. 範圍紀律

只碰被要求碰的東西。

### 6. 驗證，不假設

每個 skill 都包含驗證步驟。「看起來對」不夠——必須有證據（測試通過、建置輸出、執行期資料）。

---

## 要避免的失敗模式

1. 不查驗就做出錯誤假設
2. 不管理自己的困惑——在迷失時硬推
3. 不浮出注意到的不一致
4. 在非顯而易見的決策上不提出取捨
5. 對有明確問題的方法附和（「當然！」）
6. 過度複雜化程式碼和 API
7. 修改與任務無關的程式碼
8. 移除你不完全理解的東西
9. 在沒有 spec 的情況下建置（「很明顯嘛」）
10. 跳過驗證步驟（「看起來對了」）

---

## Skill 使用規則

1. **開始工作前先確認有無適用的 skill。** Skill 封裝了防止常見錯誤的流程。

2. **Skill 是工作流程，不是建議。** 按順序遵循步驟，不要跳過驗證步驟。

3. **多個 skill 可以同時適用。** 功能實作可能涉及 `problem-validation` → `analyze-spec` → `design-architecture` → `plan-build` → `tdd-build` → `shipping-and-launch` → `post-deploy-monitoring` → `post-launch-optimization` → `retrospective-and-learnings` 的序列。

4. **有疑問時，從 spec 開始。** 如果任務不是瑣碎的而且沒有 spec，從 `analyze-spec` 開始。
