# RetailMind AI - Getting Started Guide

Complete step-by-step instructions to set up RetailMind AI from scratch.

## Prerequisites

Before starting, ensure you have:

1. **Node.js** (v18 or higher)
2. **npm** package manager
3. **AWS CLI** configured with credentials
4. **AWS Account** with appropriate permissions
5. **PowerShell** (Windows)

Verify prerequisites:
```powershell
./check-prerequisites.ps1
```

## Step 1: Clear Existing Data (If Needed)

If you have existing data and want to start fresh:

```powershell
./clear-database.ps1
```

This will remove all data from DynamoDB tables while keeping the infrastructure intact.

## Step 2: Install Dependencies

Install frontend dependencies:
```powershell
npm install
```

Install backend Lambda dependencies (for each function you plan to use):
```powershell
cd backend/functions/products
npm install
cd ../../..

cd backend/functions/aiCopilot
npm install
cd ../../..

# Repeat for other functions as needed
```

## Step 3: Configure Environment

1. Copy the example environment file:
```powershell
Copy-Item .env.example .env.local
```

2. Edit `.env.local` and set your API Gateway URL:
```
VITE_API_URL=https://your-api-id.execute-api.us-east-1.amazonaws.com/prod
```

(You'll get this URL after deploying the API Gateway in Step 5)

## Step 4: Setup AWS Infrastructure

### Option A: Full Setup (First Time)

Run the complete setup:
```powershell
npm run aws:setup:core
```

This creates:
- DynamoDB tables
- IAM roles and policies
- Lambda execution roles

### Option B: Individual Components

Or set up components individually:

```powershell
# Create DynamoDB tables
./backend/create-forecast-table.ps1
./backend/create-revenue-table.ps1

# Deploy Lambda functions
./backend/deploy-products-windows.ps1
./backend/deploy-copilot-windows.ps1
./backend/deploy-price-monitor-windows.ps1
./backend/deploy-recommendations-windows.ps1
./backend/deploy-alerts-windows.ps1
./backend/deploy-analytics-windows.ps1
```

## Step 5: Deploy Lambda Functions

Deploy all Lambda functions:
```powershell
npm run aws:deploy:lambdas
```

Or deploy individually:
```powershell
cd backend/functions/products
./deploy.ps1
cd ../../..
```

## Step 6: Configure API Gateway

Wire up API Gateway endpoints to Lambda functions:
```powershell
npm run aws:wire:api
```

Or manually:
```powershell
./configure-api-gateway.ps1
```

After this completes, you'll get your API Gateway URL. Copy it to `.env.local`.

## Step 7: Verify Configuration

Check that everything is configured correctly:
```powershell
./check-config.ps1
./check-security.ps1
```

## Step 8: Start Development Server

Start the frontend development server:
```powershell
npm run dev
```

The application will open at `http://localhost:5173`

## Step 9: Add Initial Data

You can add products through:

1. **UI**: Navigate to Products page and click "Add Product"
2. **API**: Use the products endpoint directly
3. **Sample Data**: Import sample products (if script available)

## Step 10: Test Core Features

Test each feature to ensure everything works:

1. **Products**: Add, edit, delete products
2. **AI Copilot**: Ask questions like "What are my top products?"
3. **Price Monitor**: Add competitor prices
4. **Recommendations**: View pricing suggestions
5. **Alerts**: Check alert generation
6. **Analytics**: View dashboard metrics

## Common Issues

### API Gateway URL Not Set
**Error**: API calls fail with network errors
**Solution**: Ensure `VITE_API_URL` is set in `.env.local`

### Lambda Permission Errors
**Error**: 403 Forbidden from Lambda
**Solution**: Check IAM roles have DynamoDB permissions

### CORS Errors
**Error**: CORS policy blocking requests
**Solution**: Ensure Lambda functions return proper CORS headers

### Table Not Found
**Error**: DynamoDB table doesn't exist
**Solution**: Run table creation scripts in Step 4

## Development Workflow

1. Make code changes
2. For frontend: Hot reload happens automatically
3. For backend: Redeploy the specific Lambda function
4. Test changes in the UI
5. Check browser console and AWS CloudWatch logs for errors

## Useful Commands

```powershell
# Development
npm run dev              # Start dev server
npm run build            # Production build
npm run preview          # Preview production build

# Testing
npm run test             # Run tests
npm run lint             # Lint code

# AWS Operations
npm run aws:setup:core       # Setup infrastructure
npm run aws:deploy:lambdas   # Deploy all Lambdas
npm run aws:wire:api         # Configure API Gateway

# Utilities
./check-config.ps1           # Verify configuration
./check-prerequisites.ps1    # Check prerequisites
./check-security.ps1         # Security validation
./clear-database.ps1         # Clear all data
```

## Next Steps

- Explore the AI Copilot with natural language queries
- Set up price monitoring for your products
- Configure alerts for important events
- Review analytics dashboard
- Customize the UI to match your brand

## Getting Help

- Check `docs/` folder for detailed documentation
- Review Lambda CloudWatch logs for backend errors
- Use browser DevTools for frontend debugging
- Verify AWS resources in AWS Console

## Cost Considerations

RetailMind AI is designed to be cost-effective:
- DynamoDB: Pay per request (free tier available)
- Lambda: Pay per invocation (free tier: 1M requests/month)
- Bedrock: Pay per token (~$0.42/month per retailer)
- API Gateway: Pay per request (free tier available)

Estimated cost: $0.42-$5/month for small retailers
