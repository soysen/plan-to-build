---
name: plan-build
description: "根據 SA（系統分析）與 SD（系統設計）文件，產出可執行的建置計畫：任務拆解、工作估點、里程碑排程與 GitHub Issues 清單。使用時機：SA/SD 文件已確認，準備開始開發前的任務規劃。觸發關鍵字：建置計畫、任務拆解、工作估點、Sprint 規劃、開發計畫、GitHub Issues。"
argument-hint: "輸入 SA/SD 文件路徑，或直接描述已確認的設計內容"
---

# 建置計畫規劃

## 使用時機

- SA / SD 文件已確認，準備進入開發階段
- 需要將設計文件轉化為可執行的任務清單
- 需要估算工作量、安排 Sprint 或里程碑
- 需要產出 GitHub Issues / 任務卡片

## 輸入來源

優先讀取以下文件（依序）：

1. `docs/design/sd-*.md`（最新 SD 文件）
2. `docs/design/sa-*.md`（最新 SA 文件）
3. `docs/spec/*-spec-*.md`（最新規格書）

---

## 流程步驟

### 第一階段：解析設計文件

1. 讀取 SD 文件，提取：
   - 所有 API 端點清單
   - 資料庫 Schema（資料表與欄位）
   - 前端元件樹
   - 技術棧與部署架構
2. 讀取 SA 文件，提取：
   - 功能模組清單（`MOD-XXX`）
   - 使用者流程（Use Case Sequence）
3. 讀取規格書，確認里程碑規劃與優先序（🔴/🟡/🟢）
4. 若 SA / SD 資訊不足以支持拆解，先停止並回報缺口。至少要能回答以下問題，否則不應進入正式計畫：
   - 核心模組有哪些？
   - MVP 的邊界是什麼？
   - 哪些 API / 畫面 / 資料結構是本期一定要做的？
   - 哪些外部依賴或技術風險尚未釐清？
5. 若技術風險尚未釐清，不要把不確定性硬塞進功能任務，改建立 Spike 任務先驗證。

### 第二階段：任務拆解

依照 [任務拆解原則](./references/task-breakdown-guide.md) 將設計拆解為原子任務：

**拆解維度：**

- **基礎建設**（Infrastructure）：環境設定、CI/CD、資料庫遷移
- **後端任務**：每個 API 端點為一個任務單元
- **前端任務**：每個頁面或主要元件為一個任務單元
- **整合任務**：前後端整合、第三方服務串接
- **Spike 任務**：針對未知技術、架構抉擇、第三方服務可行性做時間盒研究
- **測試任務**：Unit Test、Integration Test、E2E Test
- **部署任務**：環境設定、上線準備

每個任務需標明：

- 任務 ID（格式：`TASK-001`）
- 類型（BE / FE / Infra / Spike / Test / Deploy）
- 優先序（🔴/🟡/🟢）
- 估點（Story Points：1 / 2 / 3 / 5 / 8）
- 前置相依任務
- 對應設計文件（SA/SD）的參照

### 第三階段：工作估點

使用 [估點規範](./references/task-breakdown-guide.md#估點規範) 評估每個任務：

| Story Points | 工作量描述           |
| :----------: | -------------------- |
|      1       | 簡單修改，< 2 小時   |
|      2       | 小任務，半天內完成   |
|      3       | 標準任務，1 天內完成 |
|      5       | 複雜任務，2-3 天     |
|      8       | 大型任務，需拆分評估 |

> 若任務估點 ≥ 8，強制要求進一步拆分。

### 第四階段：里程碑排程

依照規格書的里程碑，將任務分配至各 Sprint / 里程碑：

1. 計算各里程碑的總估點
2. 依前置相依排序任務執行順序
3. 確保 M0（基礎建設）所有任務先於功能任務
4. 標記 **Critical Path**：找出一旦延誤就會直接影響 MVP 交付日期的任務鏈
5. 將 Spike 任務排在其所影響功能任務之前，避免未驗證風險延後爆炸

### 第五階段：產出文件

讀取 [建置計畫範本](./assets/build-plan-template.md)，填入拆解結果，寫入：

- **路徑**：`docs/plan/build-plan-{YYYY-MM-DD}.md`
- 若 `docs/plan/` 不存在，先建立目錄
- **必須實際寫入檔案，不可只在對話中顯示**

同時產出 **GitHub Issues 格式清單**（`docs/plan/github-issues-{YYYY-MM-DD}.md`），每個任務格式如下：

```markdown
## TASK-001：{任務標題}

**類型**：BE / FE / Infra / Test / Deploy
**估點**：3 SP
**里程碑**：M1 - MVP
**Labels**：`backend`, `api`, `priority:high`
**前置任務**：#TASK-XXX

### 描述

{任務描述，說明要實作什麼}

### 驗收標準

- [ ] {標準 1}
- [ ] {標準 2}

### 參照

- SD：API `POST /api/v1/{endpoint}`
- SA：MOD-XXX
```

### 第六階段：摘要確認

1. 回報兩份文件的寫入路徑
2. 輸出總估點統計表（依里程碑 / 依類型）
3. 標記高風險任務（估點高、相依複雜、技術不確定）
4. 額外列出 Critical Path 任務與所有 Spike 任務
5. 若是新專案且沒有歷史 velocity，明確說明第一個 Sprint 應保守抓 60%-70% 容量，用來校準團隊實際速度
6. 建議下一步：執行 `/tdd-build` 開始實作

---

## 輸出規範

- 任務 ID 格式：`TASK-{三位數字}`（如 `TASK-001`）
- 里程碑命名對應規格書（M0 / M1 / M2 / M3）
- GitHub Issues 文件中的 Labels 統一使用：
  - 類型：`backend`、`frontend`、`infrastructure`、`research`、`testing`、`deployment`
  - 優先序：`priority:high`、`priority:medium`、`priority:low`
  - 狀態：`blocked`（有未完成的前置任務）

---

## 參考資源

- [任務拆解與估點規範](./references/task-breakdown-guide.md)
- [建置計畫範本](./assets/build-plan-template.md)
