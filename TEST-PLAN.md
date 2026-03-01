# RetailMind AI - Comprehensive Test Plan

## Overview
This document outlines the complete testing strategy for RetailMind AI, covering all features and functions across frontend and backend.

## Test Coverage Summary

### ✅ Completed Tests

#### Frontend Unit Tests
- [x] `src/test/lib/errorMessages.test.ts` - Error message mapping
- [x] `src/test/lib/utils.test.ts` - Tailwind class merging
- [x] `src/test/lib/reportExport.test.ts` - CSV/PDF export
- [x] `src/test/hooks/useIsMobile.test.tsx` - Responsive design hook
- [x] `src/test/api/client.test.ts` - API client with all endpoints

#### Backend Unit Tests
- [x] `backend/functions/products/index.test.mjs` - Product CRUD & validation
- [x] `backend/functions/recommendations/index.test.mjs` - GST & recommendation rules
- [x] `backend/functions/alerts/index.test.mjs` - Alert generation rules
- [x] `backend/functions/shared/price-service.test.mjs` - Price scraping & deduplication

### 📋 Pending Tests (To Be Added)

#### Frontend Component Tests
- [x] `src/test/components/Cards.test.tsx` - AIRecommendationCard, AlertCard
- [x] `src/test/components/SimpleProductForm.test.tsx` - Form validation
- [x] `src/test/components/RevenueKPICards.test.tsx` - Revenue metrics display
- [ ] `src/test/components/MatchQualityBadge.test.tsx` - Match quality indicator

#### Frontend Page Tests
- [ ] `src/test/pages/DashboardPage.test.tsx` - Dashboard functionality
- [ ] `src/test/pages/ProductsPage.test.tsx` - Product management
- [ ] `src/test/pages/PriceComparisonPage.test.tsx` - Price comparison
- [ ] `src/test/pages/AlertsPage.test.tsx` - Alert management
- [ ] `src/test/pages/DecisionsPage.test.tsx` - Recommendation management
- [ ] `src/test/pages/ForecastPage.test.tsx` - Demand forecasting

#### Frontend Hook Tests
- [x] `src/test/hooks/useToast.test.tsx` - Toast notification system
- [x] `src/test/hooks/useFocusTrap.test.tsx` - Keyboard navigation

#### Backend Lambda Tests
- [ ] `backend/functions/aiCopilot/index.test.mjs` - Bedrock integration
- [ ] `backend/functions/priceMonitor/index.test.mjs` - Price tracking
- [x] `backend/functions/demandForecast/index.test.mjs` - Forecasting logic
- [ ] `backend/functions/analytics/index.test.mjs` - Analytics aggregation
- [x] `backend/functions/priceComparison/index.test.mjs` - Price comparison

#### Integration Tests
- [x] `src/test/integration/product-workflow.test.ts` - Complete product lifecycle
- [x] `src/test/integration/recommendation-pipeline.test.ts` - Recommendation generation
- [x] `src/test/integration/alert-pipeline.test.ts` - Alert generation & notification
- [ ] `src/test/integration/price-search.test.ts` - Price search workflow

#### E2E Tests (Future)
- [ ] User onboarding flow
- [ ] Product creation and price comparison
- [ ] Recommendation implementation
- [ ] Alert acknowledgment
- [ ] Report generation and export

## Test Execution

### Run All Tests
```bash
npm run test
```

### Run Frontend Tests Only
```bash
npm run test src/test
```

### Run Backend Tests Only
```bash
npm run test:backend
```

### Run with Coverage
```bash
npm run test:coverage
```

### Watch Mode (Development)
```bash
npm run test:watch
```

## Critical Test Scenarios

### 1. Product Management
- ✅ Product validation (name, SKU, price, stock)
- ✅ SKU uniqueness check
- ✅ Price >= cost validation
- ✅ Margin calculation
- ✅ Inventory value calculation
- ✅ Stock level detection

### 2. Price Comparison
- ✅ Price extraction from SerpAPI
- ✅ Price deduplication
- ✅ Min/avg price calculation
- ✅ Platform detection
- ✅ Fallback scraping
- [ ] Match quality scoring
- [ ] AI reranking

### 3. Recommendations
- ✅ GST calculations (18%, 12%, 5%, 0%)
- ✅ Price decrease rule (>15% above market)
- ✅ Price increase rule (competitors out of stock)
- ✅ Restock rule (<5 days inventory)
- ✅ Promotion rule (>30 days slow-moving)
- ✅ Impact estimation

### 4. Alerts
- ✅ Price drop detection (>10%, >20%)
- ✅ Stock risk detection (<5 days, <2 days)
- ✅ Pricing opportunity detection
- ✅ Demand spike detection
- ✅ Alert statistics aggregation
- ✅ Reorder quantity calculation

### 5. API Client
- ✅ Product CRUD operations
- ✅ AI copilot queries
- ✅ Price comparison search
- ✅ Recommendation generation
- ✅ Alert management
- ✅ Revenue analytics
- ✅ Error handling
- ✅ Network error handling

### 6. Utilities
- ✅ Error message mapping
- ✅ Tailwind class merging
- ✅ CSV export
- ✅ PDF report generation
- ✅ Responsive design detection

## Coverage Goals

| Category | Target | Current |
|----------|--------|---------|
| Frontend Utils | 90% | 85% |
| Frontend Hooks | 90% | 90% |
| Frontend Components | 80% | 60% |
| Frontend Pages | 70% | 0% |
| Backend Lambda | 85% | 75% |
| Integration | 75% | 75% |
| **Overall** | **80%** | **65%** |

## Test Data

### Sample Products
```javascript
{
  id: 'prod-001',
  name: 'iPhone 15 Pro 256GB',
  sku: 'IPHONE-15-PRO-256',
  category: 'Electronics',
  currentPrice: 129900,
  costPrice: 110000,
  stock: 50,
  stockDays: 10
}
```

### Sample Competitor Prices
```javascript
{
  platform: 'Amazon.in',
  price: 125900,
  inStock: true,
  source: 'live',
  matchScore: 95
}
```

### Sample Recommendations
```javascript
{
  type: 'price_decrease',
  confidence: 87,
  suggestedPrice: 127900,
  currentPrice: 129900,
  impact: '+₹2000/month'
}
```

### Sample Alerts
```javascript
{
  type: 'stock_risk',
  severity: 'critical',
  stockDays: 2,
  suggestion: 'Reorder 100 units immediately'
}
```

## Mocking Strategy

### Frontend Mocks
- `fetch` - Mock API responses
- `window.matchMedia` - Mock responsive breakpoints
- `URL.createObjectURL` - Mock file downloads
- `document.createElement` - Mock DOM manipulation

### Backend Mocks
- `@aws-sdk/client-dynamodb` - Mock DynamoDB operations
- `@aws-sdk/client-bedrock-runtime` - Mock AI responses
- `@aws-sdk/client-sns` - Mock notifications
- `https` - Mock external API calls
- `playwright` - Mock web scraping

## CI/CD Integration

### Pre-commit Hooks
```bash
npm run lint
npm run test
```

### Pull Request Checks
- All tests must pass
- Coverage must not decrease
- No linting errors

### Deployment Pipeline
1. Run full test suite
2. Generate coverage report
3. Deploy only if tests pass

## Performance Benchmarks

### Frontend
- Page load: < 2s
- API response: < 500ms
- Component render: < 100ms

### Backend
- Lambda cold start: < 3s
- Lambda warm start: < 500ms
- DynamoDB query: < 100ms
- Price search: < 10s

## Accessibility Testing

- [ ] Keyboard navigation
- [ ] Screen reader compatibility
- [ ] ARIA labels
- [ ] Color contrast (WCAG AA)
- [ ] Focus management

## Security Testing

- [ ] Input validation
- [ ] SQL injection prevention
- [ ] XSS prevention
- [ ] CORS configuration
- [ ] Authentication flows

## Next Steps

1. **Week 1**: Complete frontend component tests
2. **Week 2**: Complete frontend page tests
3. **Week 3**: Complete remaining backend tests
4. **Week 4**: Add integration tests
5. **Week 5**: Add E2E tests with Playwright
6. **Week 6**: Performance and load testing

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [Testing Library](https://testing-library.com/)
- [AWS SDK Mocking](https://docs.aws.amazon.com/sdk-for-javascript/v3/developer-guide/unit-testing.html)
- [React Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
