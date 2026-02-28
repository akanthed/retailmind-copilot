# RetailMind AI Test Suite

Comprehensive test coverage for all features and functions.

## Test Structure

```
src/test/
├── api/              # API client tests
├── components/       # Component tests
├── hooks/            # Custom hooks tests
├── lib/              # Utility function tests
├── integration/      # End-to-end workflow tests
└── README.md

backend/functions/
├── products/index.test.mjs
├── recommendations/index.test.mjs
├── alerts/index.test.mjs
└── shared/price-service.test.mjs
```

## Running Tests

### Frontend Tests
```bash
npm run test              # Run all tests once
npm run test:watch        # Watch mode
npm run test:coverage     # With coverage report
```

### Backend Tests
```bash
npm run test:backend      # Run backend Lambda tests
```

### Specific Test Files
```bash
npm run test src/test/api/client.test.ts
npm run test backend/functions/products/index.test.mjs
```

## Test Categories

### 1. Unit Tests
- Utility functions (errorMessages, utils, reportExport)
- Custom hooks (useIsMobile, useToast, useFocusTrap)
- Business logic (GST calculations, price analysis)

### 2. Integration Tests
- API client with mocked fetch
- Product workflows (CRUD operations)
- Recommendation generation pipeline
- Alert generation and notification

### 3. Component Tests
- Form validation and submission
- Data display and formatting
- User interactions
- Accessibility features

### 4. Backend Lambda Tests
- Input validation
- DynamoDB operations
- Business rules (recommendations, alerts)
- Error handling

## Coverage Goals

- Unit tests: 90%+ coverage
- Integration tests: 80%+ coverage
- Critical business logic: 100% coverage

## Key Test Areas

### Frontend
✅ Error message mapping
✅ API client error handling
✅ Report export (CSV/PDF)
✅ Responsive design hooks
✅ Toast notifications

### Backend
✅ Product validation
✅ GST calculations
✅ Recommendation rules (4 types)
✅ Alert generation (4 types)
✅ Price scraping and deduplication

## Writing New Tests

### Example: Testing a utility function
```typescript
import { describe, it, expect } from 'vitest';
import { myFunction } from '@/lib/myModule';

describe('myFunction', () => {
  it('should handle valid input', () => {
    expect(myFunction('valid')).toBe('expected');
  });

  it('should handle edge cases', () => {
    expect(myFunction('')).toBe('default');
  });
});
```

### Example: Testing a component
```typescript
import { render, screen } from '@testing-library/react';
import { MyComponent } from '@/components/MyComponent';

describe('MyComponent', () => {
  it('should render correctly', () => {
    render(<MyComponent />);
    expect(screen.getByText('Expected Text')).toBeInTheDocument();
  });
});
```

## Mocking Guidelines

- Use `vi.fn()` for function mocks
- Use `vi.mock()` for module mocks
- Clear mocks in `beforeEach()` hooks
- Mock external APIs (fetch, AWS SDK)

## CI/CD Integration

Tests run automatically on:
- Pull requests
- Pre-commit hooks
- Deployment pipelines

## Troubleshooting

### Common Issues

1. **Import errors**: Check path aliases in `tsconfig.json`
2. **Async tests**: Use `async/await` or return promises
3. **DOM not available**: Use `jsdom` environment for component tests
4. **AWS SDK mocks**: Mock at module level, not instance level

## Next Steps

- Add E2E tests with Playwright
- Add visual regression tests
- Add performance benchmarks
- Add load testing for Lambda functions
