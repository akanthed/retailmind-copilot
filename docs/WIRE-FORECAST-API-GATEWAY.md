# Wire Forecast Lambda to API Gateway - Step-by-Step Guide

This guide shows you how to connect the Demand Forecast Lambda function to your API Gateway using the AWS Console.

## Prerequisites

- ✅ Forecast Lambda function deployed (`RetailMind-DemandForecast`)
- ✅ Forecasts DynamoDB table created (`RetailMind-Forecasts`)
- ✅ Existing API Gateway with other endpoints working

---

## Step 1: Find Your API Gateway

1. Go to AWS Console: https://console.aws.amazon.com/
2. Search for "API Gateway" in the top search bar
3. Click on "API Gateway" service
4. You should see your existing API (likely named something like `RetailMind-API` or similar)
5. Click on your API name to open it

---

## Step 2: Create the `/forecast` Resource

1. In the left sidebar, click "Resources"
2. Click on the root `/` resource to select it
3. Click the "Actions" dropdown button
4. Select "Create Resource"
5. Fill in the form:
   - **Resource Name**: `forecast`
   - **Resource Path**: `forecast` (should auto-fill)
   - ✅ Check "Enable API Gateway CORS"
6. Click "Create Resource"

---

## Step 3: Add GET Method to `/forecast` (List All Forecasts)

1. Click on the `/forecast` resource you just created
2. Click "Actions" → "Create Method"
3. A dropdown will appear under `/forecast` - select "GET"
4. Click the checkmark ✓ next to it
5. In the setup form:
   - **Integration type**: Lambda Function
   - **Use Lambda Proxy integration**: ✅ CHECK THIS BOX (important!)
   - **Lambda Region**: us-east-1
   - **Lambda Function**: Start typing `RetailMind-DemandForecast` and select it
6. Click "Save"
7. A popup will ask for permission - Click "OK" to grant API Gateway permission to invoke your Lambda

---

## Step 4: Create `/forecast/{productId}` Resource

1. Click on the `/forecast` resource (not the GET method, the resource itself)
2. Click "Actions" → "Create Resource"
3. Fill in the form:
   - **Resource Name**: `productId`
   - **Resource Path**: `{productId}` (with curly braces!)
   - ✅ Check "Enable API Gateway CORS"
4. Click "Create Resource"

---

## Step 5: Add GET Method to `/forecast/{productId}` (Get Single Forecast)

1. Click on the `/forecast/{productId}` resource
2. Click "Actions" → "Create Method"
3. Select "GET" from the dropdown
4. Click the checkmark ✓
5. In the setup form:
   - **Integration type**: Lambda Function
   - **Use Lambda Proxy integration**: ✅ CHECK THIS BOX
   - **Lambda Region**: us-east-1
   - **Lambda Function**: `RetailMind-DemandForecast`
6. Click "Save"
7. Click "OK" on the permission popup

---

## Step 6: Create `/forecast/generate` Resource

1. Click on the `/forecast` resource (the parent, not {productId})
2. Click "Actions" → "Create Resource"
3. Fill in the form:
   - **Resource Name**: `generate`
   - **Resource Path**: `generate`
   - ✅ Check "Enable API Gateway CORS"
4. Click "Create Resource"

---

## Step 7: Add POST Method to `/forecast/generate` (Generate Forecasts)

1. Click on the `/forecast/generate` resource
2. Click "Actions" → "Create Method"
3. Select "POST" from the dropdown
4. Click the checkmark ✓
5. In the setup form:
   - **Integration type**: Lambda Function
   - **Use Lambda Proxy integration**: ✅ CHECK THIS BOX
   - **Lambda Region**: us-east-1
   - **Lambda Function**: `RetailMind-DemandForecast`
6. Click "Save"
7. Click "OK" on the permission popup

---

## Step 8: Deploy the API

1. Click "Actions" → "Deploy API"
2. In the popup:
   - **Deployment stage**: Select your existing stage (probably `dev` or `prod`)
   - **Deployment description**: "Added forecast endpoints"
3. Click "Deploy"
4. You'll see a success message with your API URL

---

## Step 9: Test the Endpoints

### Test in AWS Console:

1. Click on `/forecast` → GET method
2. Click the "Test" button (lightning bolt icon)
3. Click "Test" at the bottom
4. You should see a 200 response (might be empty if no forecasts exist yet)

### Test Generate Endpoint:

1. Click on `/forecast/generate` → POST method
2. Click "Test"
3. In "Request Body", enter:
   ```json
   {}
   ```
4. Click "Test"
5. You should see forecasts being generated

---

## Step 10: Update Your Frontend

Your API URL should be in the format:
```
https://YOUR_API_ID.execute-api.us-east-1.amazonaws.com/dev
```

1. Copy your full API URL from the "Stages" section
2. Update your `.env.local` file:
   ```
   VITE_API_URL=https://YOUR_API_ID.execute-api.us-east-1.amazonaws.com/dev
   ```
3. Restart your frontend dev server:
   ```bash
   npm run dev
   ```

---

## Verification Checklist

After completing all steps, verify:

- [ ] `/forecast` (GET) - Lists all forecasts
- [ ] `/forecast/{productId}` (GET) - Gets single forecast
- [ ] `/forecast/generate` (POST) - Generates new forecasts
- [ ] All endpoints return 200 status codes
- [ ] CORS is enabled on all resources
- [ ] Lambda proxy integration is enabled
- [ ] API is deployed to your stage

---

## Troubleshooting

### Error: "Missing Authentication Token"
- Make sure you deployed the API after creating resources
- Check that you're using the correct API URL from the Stages section

### Error: "Internal Server Error" (500)
- Check Lambda function logs in CloudWatch
- Verify the Forecasts DynamoDB table exists
- Ensure Lambda has permissions to access DynamoDB

### Error: CORS Issues
- Make sure "Enable API Gateway CORS" was checked when creating resources
- You may need to manually add OPTIONS methods if CORS still fails

### Lambda Not Found
- Verify the Lambda function name is exactly `RetailMind-DemandForecast`
- Check you're in the correct AWS region (us-east-1)

---

## Quick Reference: Your New Endpoints

Once deployed, you'll have:

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/forecast` | List all forecasts |
| GET | `/forecast/{productId}` | Get forecast for specific product |
| POST | `/forecast/generate` | Generate new forecasts |

Example URLs:
```
GET  https://YOUR_API_ID.execute-api.us-east-1.amazonaws.com/dev/forecast
GET  https://YOUR_API_ID.execute-api.us-east-1.amazonaws.com/dev/forecast/abc123
POST https://YOUR_API_ID.execute-api.us-east-1.amazonaws.com/dev/forecast/generate
```

---

## Next Steps

After wiring the forecast endpoints:

1. Test the forecast page at `http://localhost:5173/forecast`
2. Click "Generate Forecasts" to create predictions
3. View festival-aware demand forecasts
4. Export forecasts to CSV

Enjoy your new demand forecasting feature! 🎉
