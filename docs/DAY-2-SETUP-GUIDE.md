# Day 2: Price Monitoring Setup Guide

## 🎯 Goal
Build a complete price monitoring system with:
- Products API (CRUD operations)
- Price Monitor (synthetic competitor data)
- Price history tracking
- Real-time dashboard updates

---

## STEP 1: Create Lambda Functions in AWS Console

### 1.1 Create Products Lambda

```bash
# In AWS Console:
1. Go to Lambda
2. Create function
3. Function name: retailmind-products
4. Runtime: Node.js 20.x
5. Architecture: x86_64
6. Create function

# Add DynamoDB permissions:
7. Configuration → Permissions
8. Click role name
9. Add permissions → Attach policies
10. Search: "DynamoDBFullAccess"
11. Attach policy

# Increase timeout:
12. Configuration → General configuration → Edit
13. Timeout: 30 seconds
14. Memory: 512 MB
15. Save
```

### 1.2 Create Price Monitor Lambda

```bash
# Repeat above steps with:
- Function name: retailmind-price-monitor
- Same permissions (DynamoDBFullAccess)
- Same timeout (30 seconds)
- Same memory (512 MB)
```

---

## STEP 2: Deploy Lambda Functions

### 2.1 Deploy Products API

```bash
cd backend
chmod +x deploy-products.sh
./deploy-products.sh
```

**Expected output:**
```
✅ Deployment complete!
```

### 2.2 Deploy Price Monitor

```bash
chmod +x deploy-price-monitor.sh
./deploy-price-monitor.sh
```

---

## STEP 3: Add API Gateway Endpoints

### 3.1 Create /products Resource

```bash
# In API Gateway console (RetailMind-API):
1. Actions → Create Resource
2. Resource Name: products
3. Resource Path: /products
4. Enable CORS: ✅
5. Create Resource
```

### 3.2 Add GET Method (List Products)

```bash
# With /products selected:
1. Actions → Create Method → GET
2. Integration type: Lambda Function
3. Use Lambda Proxy: ✅
4. Lambda Function: retailmind-products
5. Save → OK
```

### 3.3 Add POST Method (Create Product)

```bash
# With /products selected:
1. Actions → Create Method → POST
2. Integration type: Lambda Function
3. Use Lambda Proxy: ✅
4. Lambda Function: retailmind-products
5. Save → OK
```

### 3.4 Create /products/{id} Resource

```bash
1. Select /products
2. Actions → Create Resource
3. Resource Name: {id}
4. Resource Path: {id}
5. Enable CORS: ✅
6. Create Resource
```

### 3.5 Add Methods to /products/{id}

```bash
# Add GET method:
- Integration: Lambda Proxy
- Function: retailmind-products

# Add PUT method:
- Integration: Lambda Proxy
- Function: retailmind-products

# Add DELETE method:
- Integration: Lambda Proxy
- Function: retailmind-products
```

### 3.6 Enable CORS on All Resources

```bash
# For /products:
1. Select /products
2. Actions → Enable CORS
3. Check: GET, POST, OPTIONS
4. Enable

# For /products/{id}:
1. Select /products/{id}
2. Actions → Enable CORS
3. Check: GET, PUT, DELETE, OPTIONS
4. Enable
```

### 3.7 Deploy API

```bash
1. Actions → Deploy API
2. Stage: dev
3. Deploy
```

---

## STEP 4: Seed Sample Products

### 4.1 Update Seed Script

Edit `scripts/seed-products.sh`:
```bash
# Replace YOUR_API_URL with your actual URL
API_URL="https://igx41kdnth.execute-api.us-east-1.amazonaws.com/dev"
```

### 4.2 Run Seed Script

```bash
cd scripts
chmod +x seed-products.sh
./seed-products.sh
```

**Expected output:**
```
Creating product: Wireless Earbuds Pro
{
  "id": "uuid-here",
  "name": "Wireless Earbuds Pro",
  ...
}
✅ Seeding complete!
```

### 4.3 Verify Products

```bash
curl https://YOUR_API_URL/dev/products | jq '.'
```

Should show 5 products.

---

## STEP 5: Generate Price History

### 5.1 Test Price Monitor

```bash
# Invoke Lambda directly:
aws lambda invoke \
    --function-name retailmind-price-monitor \
    --region us-east-1 \
    response.json

# Check response:
cat response.json | jq '.'
```

**Expected output:**
```json
{
  "message": "Price monitoring completed",
  "productsMonitored": 5,
  "pricesGenerated": 15
}
```

### 5.2 Generate Historical Data

Run price monitor multiple times to build history:

```bash
# Run 10 times to simulate 10 days of data
for i in {1..10}; do
    echo "Generating prices - iteration $i"
    aws lambda invoke \
        --function-name retailmind-price-monitor \
        --region us-east-1 \
        response.json
    sleep 2
done
```

---

## STEP 6: Create Price History API Endpoint

### 6.1 Create /products/{id}/prices Resource

```bash
# In API Gateway:
1. Select /products/{id}
2. Actions → Create Resource
3. Resource Name: prices
4. Resource Path: prices
5. Enable CORS: ✅
6. Create Resource
```

### 6.2 Add GET Method

```bash
1. Select /products/{id}/prices
2. Actions → Create Method → GET
3. Integration: Lambda Proxy
4. Function: retailmind-price-monitor
5. Save → OK
```

### 6.3 Enable CORS & Deploy

```bash
1. Actions → Enable CORS
2. Enable
3. Actions → Deploy API → dev
```

---

## STEP 7: Update Frontend API Client

The API client is already set up in `src/api/client.ts`.

Test it works:

```bash
# Start dev server:
npm run dev

# Open browser: http://localhost:5173
# Go to Insights page
# Should show "No data" (we'll connect it next)
```

---

## STEP 8: Connect Insights Page to Real Data

We'll update the InsightsPage to fetch real data from API.

---

## 🧪 TESTING CHECKLIST

Before continuing, verify:

- [ ] Products Lambda deployed successfully
- [ ] Price Monitor Lambda deployed successfully
- [ ] API Gateway has /products endpoints
- [ ] API Gateway has /products/{id}/prices endpoint
- [ ] 5 sample products created
- [ ] Price history generated (15+ price points)
- [ ] Can fetch products via API
- [ ] Can fetch price history via API

---

## 🚨 TROUBLESHOOTING

### Error: "Function not found"
- Check Lambda function name matches exactly
- Verify region is us-east-1

### Error: "Access Denied" in Lambda
- Check IAM role has DynamoDBFullAccess
- Verify table names match in code

### Error: "502 Bad Gateway" from API
- Check Lambda function works when tested directly
- Check CloudWatch logs for errors

### No products returned
- Run seed script again
- Check DynamoDB table has items
- Verify API Gateway is deployed

---

## 📊 PROGRESS CHECK

After completing these steps, you should have:

✅ Products API working (CRUD operations)  
✅ 5 sample products in database  
✅ Price Monitor generating competitor prices  
✅ 15+ price history records  
✅ API endpoints accessible via HTTP  

**Next:** Connect frontend to display real data!

---

## 💰 COST UPDATE

**Day 2 costs:** ~$0.50
- Lambda invocations: $0 (free tier)
- DynamoDB: $0 (free tier)
- API Gateway: $0 (free tier)

**Total spent (2 days):** ~$2.50  
**Budget remaining:** ~$97.50 💰

---

**Ready to continue? Let me know when you've completed these steps!** 🚀
