# Diagram Design 常用圖表 HTML+SVG 樣板庫

本文件提供常見出版級圖表之純 HTML+SVG 樣板代碼。

---

## 樣板 1：三層系統架構圖 (Three-Tier Architecture)

```html
<!DOCTYPE html>
<html lang="zh-TW">
<head>
  <meta charset="UTF-8">
  <title>系統架構拓撲 - Diagram Design</title>
  <style>
    body { margin: 0; padding: 24px; background: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
    .card { background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; max-width: 900px; margin: auto; }
    text { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
    .mono { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; }
  </style>
</head>
<body>
  <div class="card">
    <h3 style="margin: 0 0 16px 0; color: #0f172a;">系統分層架構 (System Architecture)</h3>
    <svg width="840" height="260" viewBox="0 0 840 260" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <marker id="arr" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M 0 1.5 L 6 5 L 0 8.5 z" fill="#64748b"/>
        </marker>
        <marker id="arr-accent" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M 0 1.5 L 6 5 L 0 8.5 z" fill="#4f46e5"/>
        </marker>
      </defs>

      <!-- Client Layer -->
      <rect x="30" y="50" width="200" height="150" rx="6" fill="#ffffff" stroke="#cbd5e1" stroke-width="1"/>
      <rect x="30" y="50" width="200" height="32" rx="6" fill="#f1f5f9"/>
      <text x="45" y="71" font-size="12" font-weight="600" fill="#0f172a">客戶端 / 前端層</text>
      <rect x="45" y="95" width="170" height="38" rx="4" fill="#ffffff" stroke="#e2e8f0"/>
      <text x="55" y="118" font-size="11" font-weight="500" fill="#334155">Next.js Web App</text>
      <rect x="45" y="145" width="170" height="38" rx="4" fill="#ffffff" stroke="#e2e8f0"/>
      <text x="55" y="168" font-size="11" font-weight="500" fill="#334155">Mobile App (Flutter)</text>

      <!-- Connector 1 -->
      <path d="M 230 140 L 320 140" stroke="#4f46e5" stroke-width="1.5" marker-end="url(#arr-accent)"/>
      <rect x="245" y="128" width="60" height="18" fill="#ffffff" rx="3" stroke="#e2e8f0"/>
      <text x="250" y="141" font-size="10" fill="#4f46e5" class="mono">HTTPS/JSON</text>

      <!-- API Gateway / Core Layer (Focal) -->
      <rect x="320" y="40" width="220" height="170" rx="6" fill="#eef2ff" stroke="#4f46e5" stroke-width="1.5"/>
      <rect x="320" y="40" width="220" height="32" rx="6" fill="#e0e7ff"/>
      <text x="335" y="61" font-size="12" font-weight="600" fill="#312e81">API Gateway & Core Service</text>
      <rect x="335" y="85" width="190" height="42" rx="4" fill="#ffffff" stroke="#c7d2fe"/>
      <text x="345" y="105" font-size="11" font-weight="600" fill="#1e1b4b">Auth & Session Guard</text>
      <text x="345" y="120" font-size="9" fill="#6366f1" class="mono">JWT / RBAC Middleware</text>
      <rect x="335" y="140" width="190" height="52" rx="4" fill="#ffffff" stroke="#c7d2fe"/>
      <text x="345" y="160" font-size="11" font-weight="600" fill="#1e1b4b">Business API Service</text>
      <text x="345" y="178" font-size="9" fill="#64748b" class="mono">GraphQL / REST</text>

      <!-- Connector 2 -->
      <path d="M 540 140 L 630 140" stroke="#64748b" stroke-width="1" marker-end="url(#arr)"/>
      <rect x="555" y="128" width="60" height="18" fill="#ffffff" rx="3" stroke="#e2e8f0"/>
      <text x="562" y="141" font-size="10" fill="#64748b" class="mono">TCP 5432</text>

      <!-- Data Persistence Layer -->
      <rect x="630" y="50" width="180" height="150" rx="6" fill="#ffffff" stroke="#cbd5e1" stroke-width="1"/>
      <rect x="630" y="50" width="180" height="32" rx="6" fill="#f1f5f9"/>
      <text x="645" y="71" font-size="12" font-weight="600" fill="#0f172a">資料持久層</text>
      <rect x="645" y="95" width="150" height="38" rx="4" fill="#ffffff" stroke="#e2e8f0"/>
      <text x="655" y="118" font-size="11" font-weight="500" fill="#334155">PostgreSQL (Primary)</text>
      <rect x="645" y="145" width="150" height="38" rx="4" fill="#ffffff" stroke="#e2e8f0"/>
      <text x="655" y="168" font-size="11" font-weight="500" fill="#334155">Redis Cache Cluster</text>
    </svg>
  </div>
</body>
</html>
```

---

## 樣板 2：循序時序圖 (Sequence Diagram)

```html
<svg width="700" height="280" viewBox="0 0 700 280" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <marker id="seq-arr" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1.5 L 6 5 L 0 8.5 z" fill="#4f46e5"/>
    </marker>
    <marker id="seq-ret" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1.5 L 6 5 L 0 8.5 z" fill="#64748b"/>
    </marker>
  </defs>

  <!-- Lifelines -->
  <rect x="50" y="20" width="120" height="36" rx="4" fill="#f8fafc" stroke="#cbd5e1"/>
  <text x="110" y="43" font-size="12" font-weight="600" text-anchor="middle" fill="#0f172a">使用者 (Client)</text>
  <line x1="110" y1="56" x2="110" y2="250" stroke="#cbd5e1" stroke-dasharray="4,4"/>

  <rect x="280" y="20" width="140" height="36" rx="4" fill="#eef2ff" stroke="#4f46e5" stroke-width="1.5"/>
  <text x="350" y="43" font-size="12" font-weight="600" text-anchor="middle" fill="#312e81">閘道 (Gateway)</text>
  <line x1="350" y1="56" x2="350" y2="250" stroke="#cbd5e1" stroke-dasharray="4,4"/>

  <rect x="520" y="20" width="130" height="36" rx="4" fill="#f8fafc" stroke="#cbd5e1"/>
  <text x="585" y="43" font-size="12" font-weight="600" text-anchor="middle" fill="#0f172a">資料服務 (Service)</text>
  <line x1="585" y1="56" x2="585" y2="250" stroke="#cbd5e1" stroke-dasharray="4,4"/>

  <!-- Step 1 -->
  <line x1="110" y1="100" x2="350" y2="100" stroke="#4f46e5" stroke-width="1.5" marker-end="url(#seq-arr)"/>
  <rect x="175" y="86" width="110" height="18" fill="#ffffff" rx="2" stroke="#e2e8f0"/>
  <text x="230" y="99" font-size="10" text-anchor="middle" fill="#4f46e5">1. POST /api/v1/auth</text>

  <!-- Step 2 -->
  <line x1="350" y1="140" x2="585" y2="140" stroke="#4f46e5" stroke-width="1.5" marker-end="url(#seq-arr)"/>
  <rect x="410" y="126" width="120" height="18" fill="#ffffff" rx="2" stroke="#e2e8f0"/>
  <text x="470" y="139" font-size="10" text-anchor="middle" fill="#4f46e5">2. Validate Credentials</text>

  <!-- Step 3 (Return) -->
  <line x1="585" y1="180" x2="350" y2="180" stroke="#64748b" stroke-width="1.2" stroke-dasharray="4,3" marker-end="url(#seq-ret)"/>
  <rect x="420" y="166" width="100" height="18" fill="#ffffff" rx="2" stroke="#e2e8f0"/>
  <text x="470" y="179" font-size="10" text-anchor="middle" fill="#64748b">3. Return User Data</text>

  <!-- Step 4 (Final Return) -->
  <line x1="350" y1="220" x2="110" y2="220" stroke="#64748b" stroke-width="1.2" stroke-dasharray="4,3" marker-end="url(#seq-ret)"/>
  <rect x="175" y="206" width="110" height="18" fill="#ffffff" rx="2" stroke="#e2e8f0"/>
  <text x="230" y="219" font-size="10" text-anchor="middle" fill="#64748b">4. 200 OK (JWT Token)</text>
</svg>
```
