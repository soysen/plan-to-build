# {專案名稱} 系統分析文件（SA）

**版本**：v0.1  
**建立日期**：{YYYY-MM-DD}  
**最後更新**：{YYYY-MM-DD}  
**對應規格書**：`docs/spec/{project-name}-spec-{YYYY-MM-DD}.md`  
**狀態**：草稿 / 審核中 / 已確認

---

## 1. 系統架構概觀

### 1.1 架構圖

```mermaid
graph LR
  subgraph 客戶端
    Browser[瀏覽器 / App]
  end

  subgraph 前端層
    FE[前端應用\nReact / Vue / etc.]
  end

  subgraph 後端層
    API[API Server\nREST / GraphQL]
    Auth[Auth Service]
    Worker[Background Worker]
  end

  subgraph 資料層
    DB[(主資料庫\nPostgreSQL / MySQL)]
    Cache[(快取\nRedis)]
    Storage[(檔案儲存\nS3 / GCS)]
  end

  subgraph 外部服務
    ExtAPI[[第三方 API]]
    Email[[Email 服務]]
  end

  Browser --> FE
  FE --> API
  API --> Auth
  API --> DB
  API --> Cache
  API --> Storage
  API --> Worker
  Worker --> ExtAPI
  Worker --> Email
```

### 1.2 架構說明

| 層次       | 技術選型 | 職責   |
| ---------- | -------- | ------ |
| 前端       | {技術}   | {職責} |
| API Server | {技術}   | {職責} |
| 資料庫     | {技術}   | {職責} |
| 快取       | {技術}   | {職責} |

---

## 2. 功能模組切分

### 2.1 模組清單

| 模組 ID | 模組名稱 | 職責描述 | 對應 REQ           | 相依模組 |
| ------- | -------- | -------- | ------------------ | -------- |
| MOD-001 | {模組名} | {職責}   | REQ-F001           | -        |
| MOD-002 | {模組名} | {職責}   | REQ-F002, REQ-F003 | MOD-001  |

### 2.2 模組相依圖

```mermaid
graph LR
  MOD001[MOD-001\n模組名稱] --> MOD002[MOD-002\n模組名稱]
  MOD001 --> MOD003[MOD-003\n模組名稱]
  MOD002 --> MOD004[MOD-004\n模組名稱]
```

### 2.3 各模組詳述

#### MOD-001：{模組名稱}

**職責**：{詳細描述模組的功能邊界}

**提供的介面**：

- `{方法/函式}(參數)`：{說明}

**消費的介面**：

- 依賴 {MOD-XXX} 的 `{方法/函式}`

**對應頁面**：PAGE-001, PAGE-002

---

## 3. 使用者流程圖（Use Case Sequence Diagrams）

### UC-001：{情境名稱}

> 對應規格書 UC-001

```mermaid
sequenceDiagram
  actor User as 使用者
  participant FE as 前端
  participant API as API Server
  participant DB as 資料庫
  participant ExtSvc as 外部服務

  User->>FE: 執行動作
  FE->>API: POST /api/endpoint
  API->>DB: 查詢 / 寫入
  DB-->>API: 回傳結果
  API-->>FE: 200 OK { data }
  FE-->>User: 顯示結果

  alt 錯誤情況
    API-->>FE: 4xx / 5xx { error }
    FE-->>User: 顯示錯誤訊息
  end
```

---

## 4. 資料模型概觀（Entity Relationship）

```mermaid
erDiagram
  USER {
    int id PK
    string email
    string name
    datetime created_at
  }

  ENTITY_A {
    int id PK
    int user_id FK
    string title
    datetime created_at
  }

  ENTITY_B {
    int id PK
    int entity_a_id FK
    string content
    datetime created_at
  }

  USER ||--o{ ENTITY_A : "擁有"
  ENTITY_A ||--o{ ENTITY_B : "包含"
```

### 主要實體說明

| 實體     | 說明   | 關聯                         |
| -------- | ------ | ---------------------------- |
| USER     | {說明} | 擁有多個 ENTITY_A            |
| ENTITY_A | {說明} | 屬於 USER，包含多個 ENTITY_B |
| ENTITY_B | {說明} | 屬於 ENTITY_A                |

---

## 5. 頁面與模組對應

| 頁面 ID  | 頁面名稱 | 涉及模組         | 主要操作   |
| -------- | -------- | ---------------- | ---------- |
| PAGE-001 | {頁面名} | MOD-001          | 讀取、列表 |
| PAGE-002 | {頁面名} | MOD-001, MOD-002 | 新增、編輯 |

---

## 6. 開放性問題

| #   | 問題   | 影響模組 | 負責人   | 狀態      |
| --- | ------ | -------- | -------- | --------- |
| Q1  | {問題} | MOD-001  | {負責人} | 🔍 待確認 |

---

## 修訂記錄

| 版本 | 日期   | 修改人 | 變更說明 |
| ---- | ------ | ------ | -------- |
| v0.1 | {日期} | {作者} | 初稿建立 |
