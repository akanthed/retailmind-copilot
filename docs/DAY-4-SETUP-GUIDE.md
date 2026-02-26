# Day 4: Alert System Setup Guide

## Overview
Build a proactive alert system that monitors market conditions and notifies you of:
- Competitor price drops
- Stock risks
- Pricing opportunities
- Demand spikes

---

## Step 1: Create Lambda Function in AWS Console

1. Go to AWS Lambda Console: https://console.aws.amazon.com/lambda
2. Click "Create function"
3. Configure:
   - Function name: `retailmind-alerts`
   - Runtime: `Node.js 20.x`
   - Architecture: `x86_64`
   - Execution role: Use existing role or create new with:
     - `AmazonDynamoDBFullAccess`
     - `AmazonSNSFullAccess` (optional, for email notifications)
4. Click "Create function"

5. Configure function settings:
   - Timeout: `60 seconds`
   - Memory: `1024 MB`

---

## Step 2: Deploy Alert Engine Code

Run the deployment script:

```powershell
cd backend
./deploy-alerts-windows.ps1
```

This will:
- Install dependencies (@aws-sdk packages)
- Create deployment package
- Upload to Lambda function

---

## Step 3: Add API Gateway Endpoints

1. Go to API Gateway Console
2. Select your API: `RetailMind-API`
3. Create `/alerts` resource:
   - Click "Actions" → "Create Resource"
   - Resource Name: `alerts`
   - Resource Path: `/alerts`
   - Enable CORS: ✓

4. Add GET method to `/alerts`:
   - Select `/alerts` resource
   - Click "Actions" → "Create Method" → "GET"
   - Integration type: Lambda Function
   - Lambda Function: `retailmind-alerts`
   - Save and confirm permissions

5. Add POST method to `/alerts/generate`:
   - Create child resource under `/alerts`: `generate`
   - Add POST method
   - Integration: `retailmind-alerts`

6. Add GET method to `/alerts/stats`:
   - Create child resource under `/alerts`: `stats`
   - Add GET method
   - Integration: `retailmind-alerts`

7. Add GET and POST methods to `/alerts/{id}`:
   - Create child resource under `/alerts`: `{id}`
   - Add GET method → Integration: `retailmind-alerts`
   - Add POST method to `/alerts/{id}/acknowledge`:
     - Create child resource: `acknowledge`
     - Add POST method → Integration: `retailmind-alerts`

8. Enable CORS for all methods:
   - Select each resource
   - Actions → Enable CORS
   - Confirm

9. Deploy API:
   - Actions → Deploy API
   - Stage: `dev`

---

## Step 4: Test Alert Generation

Test in Lambda console or via API:

```bash
# Generate alerts
curl -X POST https://YOUR_API_URL/dev/alerts/generate

# List alerts
curl https://YOUR_API_URL/dev/alerts

# Get alert stats
curl https://YOUR_API_URL/dev/alerts/stats
```

---

## Step 5: Verify Frontend Integration

1. Open your app in browser
2. Navigate to "Alerts" page
3. Click "Generate Alerts" button
4. You should see alerts based on your products and price history

---

## Alert Types Generated

1. **Price Drop** (critical/warning)
   - Competitor dropped price >10% below yours
   - Suggestion: Match price to maintain market share

2. **Stock Risk** (critical/warning)
   - Less than 5 days of inventory remaining
   - Suggestion: Reorder to maintain buffer

3. **Opportunity** (info)
   - All competitors out of stock
   - Suggestion: Consider price increase

4. **Demand Spike** (info)
   - High sales velocity detected
   - Suggestion: Feature product and consider premium pricing

---

## Optional: Email Notifications (SNS)

To receive email alerts for critical issues:

1. Create SNS Topic:
```bash
aws sns create-topic --name retailmind-alerts --region us-east-1
```

2. Subscribe your email:
```bash
aws sns subscribe \
  --topic-arn arn:aws:sns:us-east-1:YOUR_ACCOUNT_ID:retailmind-alerts \
  --protocol email \
  --notification-endpoint your-email@example.com
```

3. Confirm subscription via email

4. Update Lambda environment variable:
   - Go to Lambda function configuration
   - Add environment variable:
     - Key: `SNS_TOPIC_ARN`
     - Value: `arn:aws:sns:us-east-1:YOUR_ACCOUNT_ID:retailmind-alerts`

---

## Troubleshooting

**No alerts generated?**
- Make sure you have products seeded
- Run price monitor to generate price history
- Check Lambda logs in CloudWatch

**API Gateway errors?**
- Verify all endpoints are configured
- Check CORS is enabled
- Ensure Lambda permissions are granted

**Frontend not loading alerts?**
- Check browser console for errors
- Verify API_URL in .env.local
- Test API endpoints directly with curl

---

## What's Next?

Day 4 Complete! ✅

Your alert system is now:
- Monitoring competitor prices
- Tracking stock levels
- Identifying opportunities
- Providing actionable suggestions

Next steps:
- Day 5: Analytics Dashboard
- Day 6: Testing & Optimization
- Day 7: Final Polish & Demo Video
