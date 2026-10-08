# API 與介面合約設計指南 (API Interface Guide)

本指南作為 `design-architecture` 的延伸參考，規範系統對外與內部模組間的介面設計標準。

## 1. 核心原則 (Core Principles)
- **契約優先 (Contract First)**：在實作任何端點或模組介面前，先完成型別定義或 OpenAPI / JSON Schema 規格。
- **向前相容 (Backward Compatibility)**：欄位只增不減；破壞性變更必須透過版本號（如 `/v1/`, `/v2/`）或獨立通道隔離。
- **明確的錯誤契約**：統一錯誤回應格式（包含 `code`, `message`, `details`），禁止吐出未處理的 Exception Stack Trace。

## 2. RESTful 與 RPC 設計規範
- **語意化 HTTP 動詞**：`GET`（唯讀冪等）、`POST`（建立）、`PUT`/`PATCH`（修改）、`DELETE`（刪除）。
- **資源命名**：使用小寫複數名詞（例如 `/api/v1/users`、`/api/v1/orders/{id}/items`）。
- **分頁與過濾**：大型清單必須提供 `cursor` 或 `page` + `limit`，並設定上限（預設最多 100 筆）。

## 3. 型別與介面定義範例 (TypeScript)
```typescript
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
  meta?: {
    timestamp: string;
    requestId: string;
  };
}
```

## 4. 變更檢核清單 (Interface Checklist)
- [ ] 請求與回應欄位型別皆有嚴格宣告（禁止 `any`）。
- [ ] 邊界情況（空陣列、無權限、找不到資源）皆有定義 HTTP 狀態碼。
- [ ] 敏感欄位（密碼、金鑰、Token）不會在 API 回應中曝光。
