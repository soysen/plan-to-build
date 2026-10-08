---
name: retrospective-and-learnings
description: "整理學習與流程改進 (Retro)。語意情境：當使用者表達「Sprint 結束了來做個 Retro」、「整理這次事故的 postmortem」、「這專案學到什麼」時觸發。"
argument-hint: "描述要回顧的範圍與時間，例如：回顧這次功能從 spec 到上線的整個流程"
user-invocable: true
freedom: medium
models-tested: [flash, sonnet, opus]
---

# 回顧與學習沉澱 (retrospective-and-learnings)

## 目錄
1. [硬性規則 (Must)](#硬性規則-must)
2. [概覽與適用時機](#概覽與適用時機)
3. [改善分流原則 (修環境不修代碼)](#改善分流原則-修環境不修代碼)
4. [工作流程步驟](#工作流程步驟)
5. [輸出規範與格式](#輸出規範與格式)
6. [完成前檢核](#完成前檢核)

## 硬性規則 (Must)
1. **[MUST] 修環境不修程式碼**：聚焦於探討「Repo 環境或工作流缺失了什麼讓 Agent/開發者走彎路？」，禁止僅停留在代碼層次的心得抒發。
2. **[MUST] 行動分流明確**：產出的改善項目必須明確標記去向：
   - **機械性規則** ➔ 寫入 Linter, Validator 腳本或 CI。
   - **架構裁量** ➔ 寫入 `CODING_STANDARDS.md`（按需由 Reviewer 載入）。
   - **避免膨脹 AGENTS.md** ➔ 絕不隨意將瑣碎規則塞入全域每次載入之 `AGENTS.md`。
3. **[MUST] 人類確認守門 (HITL)**：改善措施必須由人類勾選確認後方可正式落地。

## 概覽與適用時機
將實戰經驗轉化為下次可重用的工程守衛、流程檢查點與防護機制。

### 適用時機
- 功能完成上線或 Sprint 結束後。
- 重大 Bug 排查或 Rollback 事故復盤後。
- 排查出多次重複發生的踩坑模式時。

## 改善分流原則 (修環境不修代碼)
| 規則類型 | 正確歸宿 (Destination) | 理由 |
| --- | --- | --- |
| 命名格式、禁止特定 API、路徑檢查 | Linter / `validate-skills.js` / CI | 機器判定 0 Token 成本，百分之百可靠 |
| 架構模式、深模組原則、設計裁量 | `CODING_STANDARDS.md` | 僅在 Code Review 階段閱讀，不污染日常上下文 |
| 全域行為底線、四閘門、路由 | `AGENTS.md` | 僅放核心鐵律，嚴格限制篇幅 (≤ 80 行) |

## 工作流程步驟
1. **DEFINE SCOPE**：定義回顧的專案範圍與時間窗口。
2. **RECONSTRUCT TIMELINE**：梳理關鍵時間節點（Spec ➔ Design ➔ Build ➔ Verify）。
3. **EXTRACT SIGNALS**：提取 Worked Well, Friction, Surprises, Repeat Risks。
4. **IDENTIFY ROOT PATTERNS**：分析系統性根本原因（非個別人員問題）。
5. **TURN INTO ACTIONS**：依據分流表產出 Action 清單並標註優先序與負責人。
6. **WRITE DOCUMENT**：產出文件寫入 `docs/retrospective/retro-{YYYY-MM-DD}.md`。

## 輸出規範與格式

```markdown
## RETRO SUMMARY
- **Scope**: [任務/功能名稱]
- **Date**: YYYY-MM-DD

### Worked Well (有效做法)
- 採用 TDD 循序切片，有效避免隱藏 Bug。

### Friction (摩擦與阻礙)
- 某些 Skill 缺乏目錄，導致長對話模型注意力漂移。

### Root Pattern (根本模式)
- 文件超過 100 行時缺乏導引。

### Actions & Routing (改善去向)
- [ ] **[CI/Script]** 在 validate-skills.js 加入 TOC 結構斷言
- [ ] **[Standards]** 在 CODING_STANDARDS.md 加入深模組規範
```

## 完成前檢核
- [ ] 回顧聚焦於流程、工具與環境改善。
- [ ] 每個 Action 標註明確去向（CI / Standards / Agents）。
- [ ] 產出文件寫入 `docs/retrospective/` 或相關目錄。
- [ ] 待辦事項標有優先序，待人類決策採納。
