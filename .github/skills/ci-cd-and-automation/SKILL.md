---
name: ci-cd-and-automation
description: 建立 CI/CD 流水線與自動化品質關卡。使用時機：設置 GitHub Actions 工作流程、建立自動化測試/建置/部署管線，或需要在每次提交時強制執行品質標準時。觸發關鍵字：CI/CD、github actions、workflow、自動化、pipeline、持續整合、持續部署、lint、build check。
argument-hint: "描述要建立或改善的 CI/CD 管線，例如：為 Node.js 專案建立完整的 CI 管線"
user-invocable: true
---

# CI/CD 與自動化

## 概覽

讓機器執行重複性的品質保證工作。CI/CD 管線在每次提交時自動執行測試、lint、型別檢查與建置——在問題到達 code review 或生產環境之前就攔截它們。

## 適用時機

- 設置新專案的 CI/CD 管線
- 在 GitHub Actions 中新增品質關卡
- 為部署流程建立自動化
- 當手動測試流程變得耗時且容易出錯時

## 管線架構

```
push / PR
    │
    ├── lint          → ESLint / Prettier 格式檢查
    ├── type-check    → TypeScript 型別驗證
    ├── test          → 單元 + 整合測試
    ├── build         → 生產建置驗證
    └── (on main)
        └── deploy    → 部署到 staging / production
```

---

### Phase 1：基礎 CI 工作流程

建立 `.github/workflows/ci.yml`：

```yaml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  quality:
    name: 程式碼品質檢查
    runs-on: ubuntu-latest

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: "20"
          cache: "npm"

      - name: Install dependencies
        run: npm ci

      - name: Lint
        run: npm run lint

      - name: Type check
        run: npx tsc --noEmit

      - name: Test
        run: npm test -- --run

      - name: Build
        run: npm run build
```

---

### Phase 2：加入測試覆蓋率

```yaml
- name: Test with coverage
  run: npm run test:coverage -- --run

- name: Check coverage thresholds
  run: |
    COVERAGE=$(cat coverage/coverage-summary.json | jq '.total.lines.pct')
    echo "Coverage: $COVERAGE%"
    if (( $(echo "$COVERAGE < 80" | bc -l) )); then
      echo "Coverage $COVERAGE% is below 80% threshold"
      exit 1
    fi
```

---

### Phase 3：PR 自動化

建立 `.github/workflows/pr-checks.yml`：

```yaml
name: PR Checks

on:
  pull_request:
    types: [opened, synchronize, reopened]

jobs:
  pr-title:
    name: 驗證 PR 標題格式
    runs-on: ubuntu-latest
    steps:
      - uses: amannn/action-semantic-pull-request@v5
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        with:
          types: |
            feat
            fix
            docs
            style
            refactor
            test
            chore

  size-check:
    name: 程式碼變動範圍
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Check diff size
        run: |
          ADDITIONS=$(git diff origin/${{ github.base_ref }}...HEAD --stat | tail -1 | grep -oP '\d+ insertion' | grep -oP '\d+' || echo 0)
          if [ "$ADDITIONS" -gt 500 ]; then
            echo "⚠️ PR 新增超過 500 行，建議拆分為較小的 PR"
          fi
```

---

### Phase 4：安全掃描

```yaml
security:
  name: 安全掃描
  runs-on: ubuntu-latest
  steps:
    - uses: actions/checkout@v4

    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: "20"
        cache: "npm"

    - name: Install dependencies
      run: npm ci

    - name: npm audit
      run: npm audit --audit-level=high

    - name: Dependency review (on PR)
      if: github.event_name == 'pull_request'
      uses: actions/dependency-review-action@v4
```

---

### Phase 5：部署工作流程

建立 `.github/workflows/deploy.yml`（部署到 staging）：

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy-staging:
    name: 部署到 Staging
    runs-on: ubuntu-latest
    environment: staging
    needs: [quality, security] # 必須通過 CI 才能部署

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: "20"
          cache: "npm"

      - name: Install & Build
        run: |
          npm ci
          npm run build

      - name: Deploy
        env:
          DEPLOY_TOKEN: ${{ secrets.DEPLOY_TOKEN }}
        run: |
          # 替換為實際的部署指令
          echo "Deploying to staging..."

      - name: Health check
        run: |
          curl --fail https://staging.example.com/health || exit 1

      - name: Notify on failure
        if: failure()
        run: |
          echo "部署失敗！請檢查 Actions 日誌。"
```

---

### Phase 6：建立 npm scripts

確認 `package.json` 包含標準化的 scripts：

```json
{
	"scripts": {
		"dev": "vite",
		"build": "tsc -b && vite build",
		"lint": "eslint . --ext .ts,.tsx --report-unused-disable-directives",
		"lint:fix": "eslint . --ext .ts,.tsx --fix",
		"format": "prettier --write .",
		"format:check": "prettier --check .",
		"test": "vitest",
		"test:coverage": "vitest --coverage",
		"type-check": "tsc --noEmit"
	}
}
```

---

## 驗證清單

完成 CI/CD 設置後確認：

- [ ] 每次 PR 都觸發 lint、type-check、test、build
- [ ] 測試失敗會阻擋 PR merge
- [ ] `npm audit` 會檢測高危漏洞
- [ ] 部署只在 CI 通過後觸發
- [ ] 有 health check 確認部署成功
- [ ] Secrets 使用 GitHub Secrets 管理，未寫入程式碼

## 紅旗訊號

- CI 只在 main branch 執行（太晚了，應在 PR 時就跑）
- 測試在 CI 中跳過或被 `--passWithNoTests` 掩蓋
- Secrets 直接寫在 workflow 檔案中
- 部署步驟沒有回滾機制
- CI pipeline 執行時間超過 10 分鐘（會被開發者忽略）
- 沒有 cache 導致每次都重新安裝所有依賴
