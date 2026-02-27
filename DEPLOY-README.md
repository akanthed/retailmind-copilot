# RetailMind AWS Deployment

Quick deployment scripts to get RetailMind running on AWS in minutes.

## 🚀 Quick Start (Recommended)

Run this single command to deploy everything:

```powershell
.\quick-deploy.ps1
```

This will:
1. ✓ Create all DynamoDB tables
2. ✓ Deploy Lambda functions
3. ✓ Configure API Gateway
4. ✓ Set up your frontend
5. ✓ Run deployment tests

Then just run:
```powershell
npm run dev
```

## 📋 Prerequisites

- AWS Account with admin access
- AWS CLI installed and configured (`aws configure`)
- Node.js 20+ installed
- PowerShell (Windows)

## 📁 Deployment Scripts

| Script | Purpose |
|--------|---------|
| `quick-deploy.ps1` | **One-click deployment** - Runs everything automatically |
| `setup-aws.ps1` | Creates DynamoDB tables, IAM roles, and Lambda functions |
| `configure-api-gateway.ps1` | Configures API Gateway routes and CORS |
| `test-deployment.ps1` | Verifies all AWS resources are working |

## 🔧 Manual Deployment

If you prefer step-by-step control:

### Step 1: Deploy Infrastructure
```powershell
.\setup-aws.ps1
```

### Step 2: Configure API Gateway
```powershell
.\configure-api-gateway.ps1
```

### Step 3: Test Deployment
```powershell
.\test-deployment.ps1
```

### Step 4: Update Frontend Config
Edit `.env.local` and add your API Gateway URL:
```
VITE_API_URL=https://YOUR_API_ID.execute-api.us-east-1.amazonaws.com/dev
```

### Step 5: Start Application
```powershell
npm install
npm run dev
```

## 📖 Detailed Guide

For troubleshooting and advanced configuration, see [SETUP-GUIDE.md](SETUP-GUIDE.md)

## 🧪 Testing Your Deployment

After deployment, test the system:

1. Open http://localhost:5173
2. Go to "My Products"
3. Add a test product (e.g., iPhone 15 Pro, ₹129,999)
4. Click "Compare Prices"
5. Click "Search Prices Now"
6. View competitor prices

## 🔑 Optional: Real Price Data

By default, the system uses synthetic (simulated) prices. To get real prices from Google Shopping:

1. Get a free API key at https://serpapi.com (100 searches/month free)
2. Add to `.env.local`:
   ```
   SERPAPI_KEY=your_serpapi_key_here
   ```
3. Update Lambda environment variable:
   ```powershell
   aws lambda update-function-configuration --function-name retailmind-price-comparison --environment "Variables={SERPAPI_KEY=your_key}" --region us-east-1
   ```

## 🗑️ Cleanup

To remove all AWS resources:

```powershell
# Delete Lambda functions
aws lambda delete-function --function-name retailmind-products --region us-east-1
aws lambda delete-function --function-name retailmind-price-monitor --region us-east-1
aws lambda delete-function --function-name retailmind-price-comparison --region us-east-1

# Delete API Gateway (replace YOUR_API_ID)
aws apigateway delete-rest-api --rest-api-id YOUR_API_ID --region us-east-1

# Delete DynamoDB tables
aws dynamodb delete-table --table-name RetailMind-Products --region us-east-1
aws dynamodb delete-table --table-name RetailMind-PriceHistory --region us-east-1
aws dynamodb delete-table --table-name RetailMind-PriceComparison --region us-east-1
aws dynamodb delete-table --table-name RetailMind-Recommendations --region us-east-1
aws dynamodb delete-table --table-name RetailMind-Alerts --region us-east-1

# Delete IAM role
aws iam detach-role-policy --role-name RetailMind-Lambda-Role --policy-arn arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole
aws iam detach-role-policy --role-name RetailMind-Lambda-Role --policy-arn arn:aws:iam::aws:policy/AmazonDynamoDBFullAccess
aws iam delete-role --role-name RetailMind-Lambda-Role
```

## 💰 Cost Estimate

With AWS Free Tier:
- **DynamoDB**: Free (25 GB storage)
- **Lambda**: Free (1M requests/month)
- **API Gateway**: Free (1M requests/month for 12 months)

Expected cost after free tier: **$0-5/month** for light usage

## 🐛 Troubleshooting

### Deployment fails
- Check AWS credentials: `aws configure`
- Verify region is set to `us-east-1`
- Ensure you have admin permissions

### API returns 403/500 errors
- Check CloudWatch Logs: `aws logs tail /aws/lambda/retailmind-products --follow`
- Verify IAM role has DynamoDB permissions
- Test Lambda functions in AWS Console

### Frontend can't connect to API
- Verify `.env.local` has correct `VITE_API_URL`
- Check API Gateway is deployed to `dev` stage
- Test API endpoint: `curl https://YOUR_API_ID.execute-api.us-east-1.amazonaws.com/dev/products`

### Need more help?
Run the test script to diagnose issues:
```powershell
.\test-deployment.ps1
```

## 📚 Architecture

```
Frontend (React + Vite)
    ↓
API Gateway (REST API)
    ↓
Lambda Functions
    ├── retailmind-products (CRUD operations)
    ├── retailmind-price-monitor (Price tracking)
    └── retailmind-price-comparison (Price search)
    ↓
DynamoDB Tables
    ├── RetailMind-Products
    ├── RetailMind-PriceHistory
    ├── RetailMind-PriceComparison
    ├── RetailMind-Recommendations
    └── RetailMind-Alerts
```

## 🎯 What Gets Deployed

### DynamoDB Tables (5)
- `RetailMind-Products` - Product catalog
- `RetailMind-PriceHistory` - Historical price data
- `RetailMind-PriceComparison` - Competitor prices
- `RetailMind-Recommendations` - AI recommendations
- `RetailMind-Alerts` - Price alerts

### Lambda Functions (3)
- `retailmind-products` - Product CRUD API
- `retailmind-price-monitor` - Price monitoring
- `retailmind-price-comparison` - Price search engine

### API Gateway (1)
- `RetailMind-API` - REST API with routes

### IAM Role (1)
- `RetailMind-Lambda-Role` - Lambda execution role

## 📞 Support

For issues or questions:
1. Check [SETUP-GUIDE.md](SETUP-GUIDE.md)
2. Run `.\test-deployment.ps1` for diagnostics
3. Check CloudWatch Logs for errors
4. Review API Gateway execution logs
