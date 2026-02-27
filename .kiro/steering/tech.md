# Technology Stack

## Frontend

- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite 5
- **Styling**: Tailwind CSS with shadcn/ui components
- **State Management**: TanStack Query (React Query)
- **Routing**: React Router DOM v6
- **Form Handling**: React Hook Form with Zod validation
- **UI Components**: Radix UI primitives via shadcn/ui
- **Icons**: Lucide React
- **Charts**: Recharts

## Backend (AWS Serverless)

- **Compute**: AWS Lambda (Node.js/ESM)
- **AI/ML**: Amazon Bedrock (Nova Pro model)
- **Database**: Amazon DynamoDB
- **API**: Amazon API Gateway (REST)
- **Security**: AWS IAM
- **Region**: us-east-1

## Development Tools

- **Package Manager**: npm (with bun.lockb present)
- **Linting**: ESLint 9 with TypeScript ESLint
- **Testing**: Vitest with Testing Library
- **Type Checking**: TypeScript 5.8

## Common Commands

### Development
```bash
npm run dev              # Start Vite dev server
npm run build            # Production build
npm run build:dev        # Development build
npm run preview          # Preview production build
```

### Testing
```bash
npm run test             # Run tests once
npm run test:watch       # Run tests in watch mode
npm run lint             # Lint codebase
```

### AWS Deployment (PowerShell)
```powershell
npm run aws:setup:core       # Setup core AWS infrastructure
npm run aws:deploy:lambdas   # Deploy Lambda functions
npm run aws:wire:api         # Wire API Gateway
```

### Utility Scripts
```powershell
./check-config.ps1           # Validate configuration
./check-prerequisites.ps1    # Check AWS prerequisites
./check-security.ps1         # Security validation
```

## Path Aliases

Configured in `components.json` and used throughout the codebase:
- `@/components` → `src/components`
- `@/lib` → `src/lib`
- `@/hooks` → `src/hooks`
- `@/ui` → `src/components/ui`
- `@/utils` → `src/lib/utils`

## Environment Configuration

- `.env.local` - Local development environment variables
- `.env.example` - Template for environment setup
- Key variable: `VITE_API_URL` for API Gateway endpoint

## Platform

- **Primary OS**: Windows
- **Shell**: PowerShell (deployment scripts use .ps1)
- **AWS CLI**: Required for deployment operations
