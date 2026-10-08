# 程式碼簡化與防禦性重構指南 (Code Simplification Guide)

本指南作為 `code-review-and-quality` 的延伸參考，規範如何在不改變系統外在行為的前提下簡化程式碼與降低認知負擔。

## 1. 核心哲學：深模組 vs. 淺模組 (Deep vs. Shallow Modules)
- **淺模組 (Shallow Modules)**：介面複雜度幾乎等同於內部實作複雜度（例如只包了一層轉發或 3 行透傳程式碼的 class），應毫不留情整併或刪除。
- **深模組 (Deep Modules)**：提供極簡乾淨的介面，隱藏龐大複雜的內部實作細節。

## 2. 壞味道檢測與消除方針 (Bad Smells Refactoring)
1. **散彈式修改 (Shotgun Surgery)**：改一個小功能需要修改多個檔案 ➔ 重新收斂概念邊界，將緊密相關邏輯集中。
2. **依戀情節 (Feature Envy)**：某函式頻繁存取另一個物件的內部資料 ➔ 將函式搬遷至資料所屬物件內。
3. **過度設計與死代碼 (Dead Code & Speculative Generality)**：為了「未來可能用到」寫的抽象工廠與外掛 ➔ YAGNI (You Aren't Gonna Need It)，直接移除。
4. **過長參數列 (Data Clumps)**：函式接收超過 4 個參數 ➔ 提煉為具名物件或介面合約。

## 3. 無行為改變重構 SOP (Safe Refactoring Rules)
- 重構前確認既有測試 100% 綠燈。
- 小步快跑：一次只重構一個結構性壞味道，重構完立刻執行測試。
- 絕不同時「增加新功能」與「進行大重構」。
