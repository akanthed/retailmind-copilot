# RetailMind AWS Setup Guide

This guide will help you deploy RetailMind to AWS in under 30 minutes.

## Prerequisites

- AWS Account with admin access
- AWS CLI installed and configured (`aws configure`)
- Node.js 20+ installed
- PowerShell (Windows)

## Quick Setup (Automated)

### Step 1: Run the Setup Script

```powershell
.\setup-aws.ps1
```

This script will automatically:
- ✓ Create 5 DynamoDB tables
- ✓ Create IAM role for Lambda
- ✓ Package and deploy 3 Lambda functions
- ✓ Create API Gateway

### Step 2: Configure API Gateway Routes (Manual)

The API Gateway needs routes to be wired manually. You have two options:

#### Option A: Use AWS Console (Recommended for beginners)

1. Go to [API Gateway Console](https://console.aws.amazon.com/apigateway)
2. Select **RetailMind-API**
3. Create the following resources and methods:

| Resource | Method | Lambda Function |
|----------|--------|----------------|
| `/products` | GET | retailmind-products |
| `/products` | POST | retailmind-products |
| `/products/{id}` | GET | retailmind-products |
| `/products/{id}` | PUT | retailmind-products |
| `/products/{id}` | DELETE | retailmind-products |
| `/products/{id}/compare` | GET | retailmind-price-comparison |
| `/products/{id}/compare/search` | POST | retailmind-price-comparison |

For each method:
- Integration type: **Lambda Function**
- Use Lambda Proxy integration: **✓ Checked**
- Lambda Region: **us-east-1**
- Lambda Function: Select the appropriate function

4. Enable CORS for all resources:
   - Select resource → Actions → Enable CORS
   - Click "Enable CORS and replace existing CORS headers"

5. Deploy API:
   - Actions → Deploy API
   - Deployment stage: **dev** (create new if needed)
   - Click **Deploy**

6. Copy the **Invoke URL** (looks like: `https://abc123.execute-api.us-east-1.amazonaws.com/dev`)

#### Option B: Use AWS CLI (Advanced)

```powershell
.\configure-api-gateway.ps1
```

### Step 3: Configure Frontend

1. Copy `.env.example` to `.env.local`:
   ```powershell
   Copy-Item .env.example .env.local
   ```

2. Edit `.env.local` and add your API Gateway URL:
   ```
   VITE_API_URL=https://YOUR_API_ID.execute-api.us-east-1.amazonaws.com/dev
   ```

3. (Optional) Add SERPAPI_KEY for real price data:
   ```
   SERPAPI_KEY=your_serpapi_key_here
   ```
   Get a free key at: https://serpapi.com (100 searches/month free)

### Step 4: Start the Application

```powershell
npm install
npm run dev
```

Open http://localhost:5173 in your browser.

## Testing the Setup

### Test 1: Add a Product

1. Go to **My Products** page
2. Click **Add Product**
3. Fill in:
   - Name: iPhone 15 Pro
   - Current Price: 129999
   - Category: Electronics
4. Click **Save**

### Test 2: Compare Prices

1. Click on the product you just added
2. Click **Compare Prices** tab
3. Click **Search Prices Now**
4. You should see competitor prices from various platforms

If you configured SERPAPI_KEY, you'll see real prices from Google Shopping. Otherwise, you'll see synthetic (simulated) prices.

## Troubleshooting

### Lambda Functions Not Working

Check CloudWatch Logs:
```powershell
aws logs tail /aws/lambda/retailmind-products --follow --region us-east-1
```

### API Gateway Returns 403 or 500

1. Check Lambda permissions:
   - Go to Lambda Console
   - Select function
   - Configuration → Permissions
   - Verify execution role has DynamoDB access

2. Check API Gateway integration:
   - Go to API Gateway Console
   - Select method
   - Test the integration

### DynamoDB Access Denied

Verify IAM role has `AmazonDynamoDBFullAccess` policy attached:
```powershell
aws iam list-attached-role-policies --role-name RetailMind-Lambda-Role --region us-east-1
```

## Manual Cleanup (if needed)

To remove all AWS resources:

```powershell
# Delete Lambda functions
aws lambda delete-function --function-name retailmind-products --region us-east-1
aws lambda delete-function --function-name retailmind-price-monitor --region us-east-1
aws lambda delete-function --function-name retailmind-price-comparison --region us-east-1

# Delete API Gateway
aws apigateway delete-rest-api --rest-api-id YOUR_API_ID --region us-east-1

# Delete DynamoDB tables
aws dynamodb delete-table --table-name RetailMind-Products --region us-east-1
aws dynamodb delete-table --table-name RetailMind-PriceHistory --region us-east-1
aws dynamodb delete-table --table-name RetailMind-PriceComparison --region us-east-1
aws dynamodb delete-table --table-name RetailMind-Recommendations --region us-east-1
aws dynamodb delete-table --table-name RetailMind-Alerts --region us-east-1

# Delete IAM role
aws iam detach-role-policy --role-name RetailMind-Lambda-Role --policy-arn arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole --region us-east-1
aws iam detach-role-policy --role-name RetailMind-Lambda-Role --policy-arn arn:aws:iam::aws:policy/AmazonDynamoDBFullAccess --region us-east-1
aws iam delete-role --role-name RetailMind-Lambda-Role --region us-east-1
```

## Cost Estimate

With AWS Free Tier:
- DynamoDB: Free (25 GB storage, 25 WCU, 25 RCU)
- Lambda: Free (1M requests/month, 400,000 GB-seconds)
- API Gateway: Free (1M requests/month for 12 months)

Expected cost after free tier: **$0-5/month** for light usage

## Support

For issues or questions:
1. Check CloudWatch Logs for Lambda errors
2. Review API Gateway execution logs
3. Verify all environment variables are set correctly
