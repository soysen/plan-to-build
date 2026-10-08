# 安全性防護與漏洞檢核表 (Security & Hardening Checklist)

本指南作為 `code-review-and-quality` 的延伸參考，規範生產代碼必須通過的安全性檢核項目。

## 1. 核心安全檢核矩陣 (OWASP Top 10 防護)

### 輸入驗證與消毒 (Input Validation)
- [ ] 所有外部輸入（Query params, Request Body, Headers）皆有嚴格 Schema 驗證（如 Zod, Joi）。
- [ ] 禁止字串串接 SQL 查詢；一律使用參數化查詢 (Prepared Statements) 或合格 ORM。
- [ ] 前端渲染使用者內容時，防範 XSS 注入；禁止不安全的 `dangerouslySetInnerHTML` 或未消毒的 HTML 插入。

### 認證與授權 (Authentication & Authorization)
- [ ] 所有受保護 Endpoint 皆校驗合法 Token / Session。
- [ ] 實施水平越權防護 (IDOR 防護)：操作資源時，必須驗證該資源確實屬於當前登入使用者。
- [ ] 密碼採用加鹽雜湊存儲（如 bcrypt, Argon2），禁止使用 MD5/SHA1 等過時演算法。

### 敏感資訊與通訊安全 (Data Protection)
- [ ] 程式碼與提交紀錄中絕無寫死 API Keys、Secret、私鑰或真實密碼。
- [ ] 機密組態一律透過環境變數注入。
- [ ] 拋出之錯誤訊息對外不洩漏伺服器底層目錄、DB 結構或第三方服務連線字串。

## 2. 依賴項安全性
- [ ] 執行 `npm audit` 或套件相依性掃描，無 High / Critical 等級漏洞。
- [ ] 移除未使用的過期或廢棄依賴。
