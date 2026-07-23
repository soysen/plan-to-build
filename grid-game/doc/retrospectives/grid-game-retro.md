# 工作流回顧 (Retrospective)

## 專案名稱：康威生命遊戲 (Conway's Game of Life)

- **回顧日期**：2026-07-15
- **參與者**：AI Agent (Antigravity) & User (總監)
- **回顧對象**：`plan-to-build` 工作流在「練習一」中的執行效益與技術沉澱。

---

## 1. 工作流執行效益分析

### 👍 好的地方 (What went well)
1. **工作流閘門嚴謹性**：嚴格落實啟動四大閘門（未完成任務、Input 收斂、任務分級、實作啟動），成功阻斷了模糊需求。透過 spec、design 與 build plan 的制定，確保雙方在動手寫程式前已對規則與效能優化策略達成 100% 共識。
2. **TDD 流程的落實**：堅持測試先行，建立 [grid-game-test-plan.md](file:///Users/i_nelsonchung/projects/plan-to-build/.github/harness/test/grid-game-test-plan.md) 與 `gameEngine.test.ts` 後先跑出 11 個紅燈失敗，再編寫 `gameEngine.ts` 通過綠燈。這確保了核心演化算法與 toroidal 邊界計算無懈可擊，降低除錯成本。
3. **靈活的架構微調**：過程中聽取總監建議，將所有程式碼打包進獨立的 `grid-game/` 資料夾，並開立 `practice/grid-game` 分支，保持文件倉庫根目錄的整潔。

---

## 2. 踩坑記錄與技術沉澱 (Lessons Learned)

在瀏覽器手動驗收期間，我們遭遇並修復了三個經典的前端開發難題，這是非常寶貴的技術沉澱：

### 📌 2.1 React Strict Mode 導致狀態雙重遞增
- **現象**：Generation 世代計數在 Start 演化時，會跳著遞增（如 322 ➔ 324）。
- **根因**：React Strict Mode 會在開發環境雙重呼叫 state updater 以揪出 side effects。由於我們將 `setGeneration` 寫在 `setGrid(prev => { ... setGeneration() })` 的裡面，導致 side effect 被觸發兩次。
- **解法**：絕不在 state updater 內部呼叫其他狀態的 setter。我們改在 `runSimulation` 中同步計算完 `nextGrid`，在同一個 callback 內分開呼叫 `setGrid` 與 `setGeneration`，杜絕重複執行。

### 📌 2.2 React.memo 導致的 Stale Closure (閉包過期)
- **現象**：遊戲暫停或清空後，拖曳畫細胞失效，必須重新整理網頁才恢復。
- **根因**：因為 `Cell` 元件被 memo 化，且僅比對 `prev.isAlive === next.isAlive`。當 `running` 或 `grid` 狀態改變時，**死亡細胞由於狀態依然是死，因此不會 Re-render，進而無法獲取最新的 `handleMouseDown` 函式 Reference**。舊的閉包仍抓著 `running = true` 的舊狀態，導致點擊事件被 return 攔截。
- **解法**：使用 `useRef` 建立 `runningRef` 與 `gridRef` 常駐同步狀態。點擊與拖曳 callback 的依賴項設為 `[]` 保持 reference 絕對不變。事件觸發時直接讀取 `Ref.current`。這使 Memoized 元件不需要 Re-render 也能取得最新狀態，徹底解決 Stale Closure。

### 📌 2.3 CSS Border 變更引發 Layout Reflow 與全畫面重繪
- **現象**：Paint Flashing 顯示整個 Grid 都在綠色閃爍，沒有達到局部重繪的優化標準。
- **根因**：`.cell` 與 `.cell.alive` 之間存在 `border: 1px solid` 與 `border: none` 的切換。邊框的消失/出現會改變元素的 Box Sizing，觸發瀏覽器 Layout 佈局重算 (Reflow)，導致整張 CSS Grid 與所有細胞被迫一起重繪。
- **解法**：將 `.cell.alive` 改為 `border: 1px solid transparent`。保持邊框寬度始終為 1px，避免 Layout Reflow。優化後，Paint Flashing 顯示只有真正改變生死狀態的細胞會重繪，成功達成效能標準。

---

## 3. `plan-to-build` 工作流改進建議
- **分支與打包模版**：未來如果是「文件 repo 內部的程式練習專案」，應在 `analyze-spec` 階段就自動判定是否需建立獨立 folder 與獨立 branch，避免後續進行檔案移動。
- **Ref 與 Memo 配合手冊**：在 `frontend-ui-engineering` skill 中，應補上「當子元件使用 custom `React.memo` 時，父元件的 callback 必須搭配 Ref 做到完全 `[]` 穩定，以防 Stale Closure」的避坑指引。
