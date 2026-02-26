# Day 3: Recommendation Engine Setup

## 🎯 Goal
Build intelligent recommendation engine that analyzes products and generates actionable advice.

---

## STEP 1: Create Recommendations Lambda

### 1.1 Create Function in AWS Console

```bash
1. Go to Lambda console
2. Create function
3. Function name: retailmind-recommendations
4. Runtime: Node.js 20.x
5. Create function

# Add permissions:
6. Configuration → Permissions → Click role
7. Add permissions → Attach policies
8. Attach: AmazonDynamoDBFullAccess
9. Attach: AmazonBedrockFullAccess
10. Back to Lambda

# Increase timeout:
11. Configuration → General configuration → Edit
12. Timeout: 60 seconds (recommendations take longer)
13. Memory: 1024 MB (more memory = faster)
14. Save
```

---

## STEP 2: Deploy Recommendations Lambda

### 2.1 Deploy Code

```powershell
cd backend
.\deploy-recommendations-windows.ps1
```

**Expected output:**
```
✅ Deployment complete!
```

### 2.2 Test Lambda

```bash
# In Lambda console:
1. Click "Test" tab
2. Create event: "test-generate"
3. Event JSON:
```

```json
{
  "httpMethod": "POST",
  "path": "/recommendations/generate"
}
```

```bash
4. Click "Test"
5. Should see: "recommendationsGenerated": 4-8
```

---

## STEP 3: Add API Gateway Endpoints

### 3.1 Create /recommendations Resource

```bash
# In API Gateway (RetailMind-API):
1. Actions → Create Resource
2. Resource Name: recommendations
3. Resource Path: /recommendations
4. Enable CORS: ✅
5. Create Resource
```

### 3.2 Add GET Method (List Recommendations)

```bash
1. Select /recommendations
2. Actions → Create Method → GET
3. Integration: Lambda Proxy
4. Function: retailmind-recommendations
5. Save → OK
```

### 3.3 Add POST Method (Generate Recommendations)

```bash
1. Select /recommendations
2. Actions → Create Method → POST
3. Integration: Lambda Proxy
4. Function: retailmind-recommendations
5. Save → OK
```

### 3.4 Create /recommendations/generate Resource

```bash
1. Select /recommendations
2. Actions → Create Resource
3. Resource Name: generate
4. Resource Path: generate
5. Enable CORS: ✅
6. Create Resource

7. Add POST method
8. Integration: Lambda Proxy
9. Function: retailmind-recommendations
10. Save → OK
```

### 3.5 Create /recommendations/{id} Resource

```bash
1. Select /recommendations
2. Actions → Create Resource
3. Resource Name: {id}
4. Resource Path: {id}
5. Enable CORS: ✅
6. Create Resource

7. Add GET method
8. Integration: Lambda Proxy
9. Function: retailmind-recommendations
10. Save → OK
```

### 3.6 Create /recommendations/{id}/implement Resource

```bash
1. Select /recommendations/{id}
2. Actions → Create Resource
3. Resource Name: implement
4. Resource Path: implement
5. Enable CORS: ✅
6. Create Resource

7. Add POST method
8. Integration: Lambda Proxy
9. Function: retailmind-recommendations
10. Save → OK
```

### 3.7 Enable CORS on All Resources

```bash
# For each resource (/recommendations, /recommendations/generate, etc.):
1. Select resource
2. Actions → Enable CORS
3. Check all methods
4. Enable
```

### 3.8 Deploy API

```bash
1. Actions → Deploy API
2. Stage: dev
3. Deploy
```

---

## STEP 4: Generate Recommendations

### 4.1 Via API

```bash
curl -X POST https://YOUR_API_URL/dev/recommendations/generate
```

**Expected response:**
```json
{
  "message": "Recommendations generated successfully",
  "recommendationsGenerated": 6,
  "recommendations": [...]
}
```

### 4.2 Via Lambda Console

```bash
1. Go to Lambda → retailmind-recommendations
2. Test tab
3. Use test event from Step 2.2
4. Click "Test"
```

---

## STEP 5: Verify Recommendations

### 5.1 List Recommendations

```bash
curl https://YOUR_API_URL/dev/recommendations
```

Should return array of recommendations with:
- ✅ title
- ✅ reason
- ✅ impact
- ✅ confidence
- ✅ status (pending/implemented)

---

## STEP 6: Update Frontend

We'll update:
1. API client (add recommendation methods)
2. DecisionsPage (fetch real recommendations)
3. CommandCenterPage (show real recommendations)

---

## 🧪 TESTING CHECKLIST

- [ ] Lambda function created
- [ ] Code deployed successfully
- [ ] Test generates 4-8 recommendations
- [ ] API endpoints created
- [ ] API deployed to dev stage
- [ ] Can generate recommendations via API
- [ ] Can list recommendations via API

---

## 🚨 TROUBLESHOOTING

### No recommendations generated

**Check:**
- Are there products in database?
- Is price history generated?
- Check CloudWatch logs for errors

**Fix:**
```bash
# Regenerate price history:
aws lambda invoke \
    --function-name retailmind-price-monitor \
    response.json
```

### Error: "Access Denied"

**Fix:**
- Check IAM role has DynamoDBFullAccess
- Check IAM role has BedrockFullAccess

### Timeout errors

**Fix:**
- Increase timeout to 60 seconds
- Increase memory to 1024 MB

---

## 📊 EXPECTED RECOMMENDATIONS

For 5 products, you should get ~4-8 recommendations:

1. **Price Decrease** - Products priced too high
2. **Price Increase** - Competitors out of stock
3. **Restock** - Low inventory items
4. **Promotion** - Slow-moving inventory

---

## 💰 COST UPDATE

**Day 3 costs:** ~$1-2
- Lambda: $0 (free tier)
- DynamoDB: $0 (free tier)
- Bedrock: ~$1-2 (if using AI descriptions)

**Total (3 days):** ~$4-5  
**Budget remaining:** ~$95 💰

---

**Next: Connect frontend to show real recommendations!** 🚀
