# Project Structure

## Root Organization

```
retailmind-ai/
├── src/                    # Frontend React application
├── backend/                # AWS Lambda functions
├── docs/                   # Project documentation
├── .kiro/                  # Kiro AI configuration
├── dist/                   # Build output
└── *.ps1                   # PowerShell utility scripts
```

## Frontend Structure (`src/`)

```
src/
├── pages/                  # Route components (page-level)
├── components/             # Reusable React components
│   └── ui/                # shadcn/ui components
├── api/                    # API client and data fetching
├── hooks/                  # Custom React hooks
├── lib/                    # Utility functions and helpers
├── test/                   # Test files
├── App.tsx                 # Root application component
├── main.tsx                # Application entry point
└── index.css               # Global styles (Tailwind)
```

## Backend Structure (`backend/`)

```
backend/
├── functions/              # Lambda function implementations
│   ├── aiCopilot/         # Amazon Bedrock AI integration
│   ├── products/          # Product CRUD operations
│   ├── priceMonitor/      # Price tracking service
│   ├── priceScraper/      # Competitor price scraping
│   ├── recommendations/   # Recommendation engine
│   ├── alerts/            # Alert generation system
│   ├── analytics/         # Analytics and metrics
│   └── productSearch/     # Product search functionality
└── deploy-*.ps1           # Individual Lambda deployment scripts
```

## Lambda Function Pattern

Each Lambda function follows this structure:
```
backend/functions/{service}/
├── index.mjs              # Handler implementation (ESM)
├── package.json           # Dependencies
├── node_modules/          # Installed packages
└── function.zip           # Deployment package (generated)
```

## Documentation (`docs/`)

- Implementation guides (DAY-X-*.md)
- Setup and deployment instructions
- Testing and debugging guides
- Project roadmaps and status reports
- Architecture and design decisions

## Configuration Files

- `package.json` - Frontend dependencies and scripts
- `components.json` - shadcn/ui configuration
- `eslint.config.js` - Linting rules
- `tsconfig.json` - TypeScript configuration
- `vite.config.ts` - Vite build configuration
- `tailwind.config.ts` - Tailwind CSS configuration
- `.env.local` - Local environment variables
- `.gitignore` - Git exclusions

## Naming Conventions

- **Components**: PascalCase (e.g., `ProductCard.tsx`)
- **Utilities**: camelCase (e.g., `formatPrice.ts`)
- **Lambda functions**: camelCase directories (e.g., `aiCopilot/`)
- **API routes**: kebab-case (e.g., `/api/price-monitor`)
- **PowerShell scripts**: kebab-case with .ps1 extension

## Import Patterns

Use path aliases for cleaner imports:
```typescript
import { Button } from '@/components/ui/button'
import { formatCurrency } from '@/lib/utils'
import { useProducts } from '@/hooks/useProducts'
```

## AWS Resource Naming

DynamoDB tables follow the pattern: `RetailMind-{ResourceName}`
- `RetailMind-Products`
- `RetailMind-PriceHistory`
- `RetailMind-Recommendations`
- `RetailMind-Alerts`
- `RetailMind-Conversations`

## Key Architectural Patterns

- **Frontend**: Component-based architecture with React
- **Backend**: Microservices via AWS Lambda functions
- **Data Flow**: API Gateway → Lambda → DynamoDB
- **State Management**: React Query for server state
- **Styling**: Utility-first with Tailwind CSS
- **Type Safety**: TypeScript throughout frontend
