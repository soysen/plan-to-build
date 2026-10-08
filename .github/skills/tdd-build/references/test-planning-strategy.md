# 測試計畫與案例設計策略 (Test Planning Strategy)

本指南作為 `tdd-build` 的延伸參考，規範測試案例 (TC) 的分層與邊界設計原則。

## 1. 測試金字塔分層原則 (Test Pyramid)
1. **單元測試 (Unit Tests - 70%)**：
   - 聚焦於純函式、工具方法、核心業務邏輯。
   - 執行速度必須極快（毫秒級），絕不依賴真實網路或外部資料庫。
2. **整合測試 (Integration Tests - 20%)**：
   - 驗證模組與模組、Controller 與 Service、DB Adapter 的配合。
   - 使用 Mock Server (如 MSW) 或本地測試資料庫 (In-memory/Testcontainers)。
3. **端到端測試 (E2E Tests - 10%)**：
   - 針對最核心的使用者黃金旅程 (Golden Path) 進行驗證。

## 2. 測試案例 (TC) 命名與結構
採用 `Given-When-Then` 語意結構命名測試：
```typescript
describe('Feature: User Coupon Validation', () => {
  it('should reject coupon when expiration date is in the past', () => {
    // Given: 準備過期優惠券資料
    const expiredCoupon = { expiresAt: new Date(Date.now() - 86400000) };
    
    // When: 執行校驗
    const result = validateCoupon(expiredCoupon);
    
    // Then: 預期校驗失敗且回傳指定錯誤碼
    expect(result.isValid).toBe(false);
    expect(result.errorCode).toBe('COUPON_EXPIRED');
  });
});
```

## 3. 防弊與覆蓋率準則 (Anti-Cheating Rules)
- **紅燈真確性**：實作邏輯前，必須先看到測試因「邏輯未實作」而失敗，而非因語法錯誤或編譯不過而失敗。
- **拒絕假斷言**：禁止寫無效的 `expect(true).toBe(true)` 或不驗證回傳值僅測函式被呼叫。
- **變異與邊界防禦**：針對邊界數值（0、負數、極大值、空字串、null/undefined）皆需包含對應的測試案例。
