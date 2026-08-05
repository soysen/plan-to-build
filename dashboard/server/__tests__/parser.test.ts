import { describe, it, expect } from 'vitest';
import { parseAgentStatusContent, parseBuildPlanContent } from '../parser.js';

describe('parser.ts', () => {
  it('should parse active task correctly', () => {
    const markdown = `
# Agent Status

## Active Task

- ID: TASK-GLOBAL-HARNESS-DASHBOARD
- Title: 全域 Harness Workflow 監測控制台
- Status: 進行中
- Last updated: 2026-08-05
- Goal: 建立控制台
- Route: frontend-ui-engineering

## Last Completed Task

- ID: TASK-5G-PASS-HTML-MOCKUP
- Title: 5G 原型
- Status: 已完成
- Last updated: 2026-07-30
- Goal: 製作 HTML Mockup
- Route: frontend-ui-engineering

## Execution Tracking

- CurrentStep: 實作 UI
- Evidence: 全部通過
- NextStep: 部署測試

## Resume Entry

- Start here: .github/worklog/agent-status.md
`;

    const { activeTask, lastCompletedTask } = parseAgentStatusContent(markdown, '/fake/path/agent-status.md');

    expect(activeTask.id).toBe('TASK-GLOBAL-HARNESS-DASHBOARD');
    expect(activeTask.status).toBe('進行中');
    expect(activeTask.goal).toBe('建立控制台');
    expect(activeTask.route).toBe('frontend-ui-engineering');
    expect(activeTask.currentStep).toBe('實作 UI');
    expect(activeTask.evidence).toBe('全部通過');

    expect(lastCompletedTask).toBeDefined();
    expect(lastCompletedTask?.id).toBe('TASK-5G-PASS-HTML-MOCKUP');
    expect(lastCompletedTask?.status).toBe('已完成');
  });

  it('should default to idle when Active Task ID is none', () => {
    const markdown = `
# Agent Status

## Active Task

- ID: none
- Title: N/A
- Status: idle
- Last updated: 2026-07-30
- Goal: N/A
- Route: none
`;

    const { activeTask } = parseAgentStatusContent(markdown, '/fake/path/agent-status.md');

    expect(activeTask.id).toBe('none');
    expect(activeTask.status).toBe('idle');
  });

  it('should parse explicit build plan slices correctly', () => {
    const buildPlanMd = `
# Dashboard Build Plan

### 切片 1：後端解析器 - [已完成]
- 目標：寫 parser.ts
- Skill Route：incremental-implementation
- In/Out Boundary：server/parser.ts
- 驗證證據：Vitest 測試通過

### 切片 2：前端 UI - [進行中]
- 目標：寫 App.tsx
- Skill Route：frontend-ui-engineering
`;

    const plan = parseBuildPlanContent(buildPlanMd, '/fake/plan.md');
    expect(plan.title).toBe('Dashboard Build Plan');
    expect(plan.slices).toHaveLength(2);
    expect(plan.slices[0].title).toBe('切片 1：後端解析器 - [已完成]');
    expect(plan.slices[0].status).toBe('已完成');
    expect(plan.slices[0].goal).toBe('寫 parser.ts');
    expect(plan.slices[0].route).toBe('incremental-implementation');
    expect(plan.slices[0].verification).toBe('Vitest 測試通過');
    expect(plan.slices[1].status).toBe('進行中');
  });

  it('should parse build plans with Task Card and sub-slice tables', () => {
    const buildPlanMd = `
# Agent Claude Symlink Build Plan

## Workflow 模式與交接

- 目前任務 ID：TASK-ACS-001
- 本輪切片目標：建立 .agent 與 .claude 目錄，並在兩者底下建立 harness、skills、worklog symlink。

## 任務卡 (Task Card)

- 目標：新增 .agent 與 .claude 資料夾，並透過 symlink 共用 .github 的 agent workflow 內容。
- 路由 (Skill Route)：tdd-build
- 範圍 (In/Out)：In: .agent, .claude; Out: 其他專案檔案
- 驗收標準：.agent 與 .claude 存在且可正確解析

## 任務詳情

### 未完成任務（優先閱讀）

| ID | 狀態 | 類型 | 優先序 | 估點 | 里程碑 | 前置 | 標題 |
| TASK-ACS-001 | 進行中 | Infra | 高 | 1 | M0 | - | 建立 .agent / .claude symlink |

### TASK-ACS-001：建立 .agent / .claude symlink
- 狀態：已完成
- 類型：Infra

#### 描述
建立 .agent 與 .claude 目錄，並在兩者底下建立 harness、skills、worklog symlink。

#### 切片
| 切片 | 狀態 | 目標 | 驗證方式 |
| ---- | ------ | ------------------ | --------------- |
| #1   | 已完成 | 建立本輪追蹤文件   | plan / status   |
| #2   | 進行中 | 建立目錄與 symlink | readlink / ls   |
| #3   | 未開始 | 收尾驗證與回寫     | status / errors |
`;

    const plan = parseBuildPlanContent(buildPlanMd, '/fake/agent-claude-symlink-build-plan.md');
    expect(plan.currentTaskId).toBe('TASK-ACS-001');
    expect(plan.currentSliceGoal).toContain('建立 .agent 與 .claude 目錄');
    expect(plan.taskCard?.route).toBe('tdd-build');
    expect(plan.taskCard?.inOutScope).toBe('In: .agent, .claude; Out: 其他專案檔案');

    // Slices extracted from #### 切片 table (ignoring ### 未完成任務（優先閱讀）)
    expect(plan.slices).toHaveLength(3);
    expect(plan.slices[0].sliceId).toBe('TASK-ACS-001-#1');
    expect(plan.slices[0].status).toBe('已完成');
    expect(plan.slices[0].goal).toBe('建立本輪追蹤文件');
    expect(plan.slices[0].route).toBe('tdd-build'); // Inherited from task card

    expect(plan.slices[1].status).toBe('進行中');
    expect(plan.slices[1].goal).toBe('建立目錄與 symlink');
    expect(plan.slices[1].verification).toBe('readlink / ls');
  });

  it('should parse build plans with Task descriptions (grid-game style)', () => {
    const buildPlanMd = `
# 網格遊戲開發建置計畫 (Grid Game Build Plan)

## 狀態

- 專案名稱：Grid Game
- 目前模式：進行中
- 目前任務 ID：TASK-GRID-GAME
- 本輪切片目標：初始化專案狀態、撰寫 Spec 與架構設計

## 任務詳情

### 未完成任務（優先閱讀）

| ID | 狀態 | 類型 | 優先序 | 估點 | 里程碑 | 前置 | 標題 |
| TASK-001 | 進行中 | Infra | 高 | 1 | M0 | - | 專案環境與測試框架初始化 |
| TASK-002 | 未開始 | Spec | 高 | 1 | M0 | TASK-001 | 撰寫生命遊戲規則 Spec |

### TASK-001：專案環境與測試框架初始化
- 狀態：已完成
- 類型：Infra
- 優先序：高

#### 描述
在根目錄中初始化 npm，安裝 React、TypeScript、Vite，以及測試框架 Vitest。配置 package.json、tsconfig.json、vite.config.ts。

#### 驗收標準
- [ ] 執行 \`npm test\` 可正常啟動 Vitest
- [ ] 執行 \`npm run build\` 成功

### TASK-002：撰寫生命遊戲規則 Spec
- 狀態：未開始
- 類型：Spec
- 優先序：高

#### 描述
撰寫規格書 grid-game-spec.md，定義網格初始化、康威生命遊戲狀態演進規則。
`;

    const plan = parseBuildPlanContent(buildPlanMd, '/fake/grid-game-build-plan.md', 'tdd-build');
    expect(plan.currentTaskId).toBe('TASK-GRID-GAME');
    expect(plan.currentSliceGoal).toBe('初始化專案狀態、撰寫 Spec 與架構設計');

    // Should parse the 2 tasks into slices with their real descriptions and routes
    expect(plan.slices).toHaveLength(2);
    expect(plan.slices[0].sliceId).toBe('TASK-001');
    expect(plan.slices[0].status).toBe('已完成');
    expect(plan.slices[0].goal).toContain('在根目錄中初始化 npm');
    expect(plan.slices[0].route).toBe('tdd-build'); // fallback route

    expect(plan.slices[1].sliceId).toBe('TASK-002');
    expect(plan.slices[1].status).toBe('未開始');
    expect(plan.slices[1].goal).toContain('撰寫規格書 grid-game-spec.md');
  });
});

