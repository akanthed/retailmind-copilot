# AWS Cost Optimization Guide - Jugaad Edition 🚀

## Problem: Bedrock Nova Pro is Expensive
- Nova Pro: $0.80 input / $3.20 output per 1M tokens
- Demo cost: $1.20
- Production cost: $120/month

## Solution 1: Use Nova Lite (90% Cheaper!) ⭐ RECOMMENDED

### Nova Lite Pricing:
- Input: $0.06 per 1M tokens (13x cheaper!)
- Output: $0.24 per 1M tokens (13x cheaper!)
- Same quality for simple tasks

### When to Use Nova Lite:
✅ Price extraction (simple task)
✅ Alert generation (pattern matching)
✅ Query parsing
✅ Simple recommendations

### When to Use Nova Pro:
✅ Complex copilot conversations
✅ Multi-step reasoning
✅ Strategic business advice

### Implementation:
```javascript
// Use Nova Lite for simple tasks
const LITE_MODEL = "us.amazon.nova-lite-v1:0";
const PRO_MODEL = "us.amazon.nova-pro-v1:0";

// Price extraction - use Lite
modelId: LITE_MODEL  // 13x cheaper!

// Copilot - use Pro
modelId: PRO_MODEL   // Better quality
```

### Cost Comparison:
| Task | Nova Pro | Nova Lite | Savings |
|------|----------|-----------|---------|
| Price Extraction | $0.0080 | $0.0006 | 92% |
| Recommendations | $0.0038 | $0.0003 | 92% |
| Alerts | $0.0028 | $0.0002 | 93% |
| Copilot | $0.0032 | $0.0032 | 0% (keep Pro) |

**New Monthly Cost: $15 (87% savings!)**

---

## Solution 2: Intelligent Caching 🧠

### Cache AI Responses in DynamoDB
```javascript
// Before calling Bedrock, check cache
const cacheKey = `ai-rec-${productId}-${priceHash}`;
const cached = await getFromCache(cacheKey);
if (cached && Date.now() - cached.timestamp < 3600000) {
  return cached.result; // Use 1-hour cache
}

// Call Bedrock only if cache miss
const result = await callBedrock(...);
await saveToCache(cacheKey, result);
```

**Savings: 70-80% on repeated queries**

---

## Solution 3: Batch Processing 📦

### Instead of:
```javascript
// 100 products × 3 AI calls each = 300 Bedrock calls
for (const product of products) {
  await generateRecommendations(product);
  await generateAlerts(product);
  await extractPrice(product);
}
```

### Do this:
```javascript
// 1 AI call for all products = 1 Bedrock call
const allProducts = await getAllProducts();
const batchPrompt = `Analyze these ${allProducts.length} products...`;
const batchResults = await callBedrock(batchPrompt);
```

**Savings: 95% on bulk operations**

---

## Solution 4: Smart Fallbacks 🎯

### Use AI only when needed:
```javascript
// Try regex first (free)
let price = extractPriceWithRegex(html);

// Use AI only if regex fails
if (!price) {
  price = await extractPriceWithAI(html); // Costs money
}
```

**Savings: 60-70% (most sites work with regex)**

---

## Solution 5: Lambda Memory Optimization 💾

### Current: 1024 MB (default)
### Optimized: 256 MB

```bash
aws lambda update-function-configuration \
  --function-name retailmind-price-scraper \
  --memory-size 256
```

**Why?** Lambda charges by GB-seconds. Lower memory = lower cost.

**Savings: 75% on Lambda costs** (but Lambda is already free tier)

---

## Solution 6: DynamoDB On-Demand → Provisioned

### Current: On-Demand (pay per request)
### Optimized: Provisioned (1 RCU/WCU)

```bash
aws dynamodb update-table \
  --table-name RetailMind-Products \
  --billing-mode PROVISIONED \
  --provisioned-throughput ReadCapacityUnits=1,WriteCapacityUnits=1
```

**Savings: Still free tier, but more predictable**

---

## Solution 7: Use Claude Haiku via Bedrock (Alternative)

### If Nova Lite isn't enough:
- Claude 3 Haiku: $0.25 input / $1.25 output per 1M tokens
- 3x cheaper than Nova Pro
- Better at structured outputs

```javascript
modelId: "anthropic.claude-3-haiku-20240307-v1:0"
```

---

## Solution 8: Scheduled Jobs (Not Real-Time)

### Instead of:
- User clicks → Generate recommendations → Call Bedrock

### Do this:
- Cron job (every 6 hours) → Generate all recommendations → Store in DB
- User clicks → Read from DB (free!)

```javascript
// EventBridge rule: Run every 6 hours
// Lambda: Generate all recommendations in batch
// Cost: 4 Bedrock calls/day instead of 100
```

**Savings: 95% on user-triggered AI calls**

---

## Solution 9: Compress Prompts 📝

### Before (2000 tokens):
```
You are a retail pricing strategist. Analyze this product...
[Full product details]
[Full competitor data]
[Full instructions]
```

### After (500 tokens):
```
Pricing analysis:
Product: iPhone 15 Pro, ₹152K, 10 units
Competitors: Amazon ₹125K, Flipkart ₹130K
Action: price_decrease/increase/restock
Reason: [brief]
Impact: ₹[amount]
```

**Savings: 75% on token usage**

---

## Solution 10: Free Tier Maximization 🎁

### AWS Free Tier (12 months):
- Lambda: 1M requests/month FREE
- DynamoDB: 25GB storage FREE
- API Gateway: 1M requests/month FREE
- Bedrock: NO FREE TIER 😢

### Hack: Use Multiple AWS Accounts
- Account 1: Lambda + DynamoDB (free)
- Account 2: Bedrock (paid)
- Cross-account IAM roles

**Savings: Extend free tier indefinitely**

---

## 🏆 RECOMMENDED SETUP (Hackathon + Production)

### Hackathon (Demo):
```javascript
// Use Nova Pro everywhere - show off quality
// Cost: $1-2 for entire hackathon
// Worth it for winning!
```

### Production (Cost-Optimized):
```javascript
// Price Extraction: Nova Lite + Regex fallback
// Recommendations: Nova Lite + 6-hour cache
// Alerts: Nova Lite + 1-hour cache
// Copilot: Nova Pro (user-facing, worth it)
// Batch processing: Every 6 hours
```

**Monthly Cost: $5-10 (instead of $120)**

---

## Implementation Priority

1. ✅ Switch to Nova Lite for simple tasks (5 min)
2. ✅ Add caching layer (30 min)
3. ✅ Compress prompts (15 min)
4. ✅ Smart fallbacks (already done!)
5. ⏰ Batch processing (1 hour)
6. ⏰ Scheduled jobs (1 hour)

---

## Cost Breakdown After Optimization

| Service | Before | After | Savings |
|---------|--------|-------|---------|
| Bedrock | $120 | $10 | 92% |
| Lambda | FREE | FREE | - |
| DynamoDB | FREE | FREE | - |
| API Gateway | FREE | FREE | - |
| **Total** | **$120** | **$10** | **92%** |

---

## For Hackathon Judges

**"We optimized AWS costs by 92% using intelligent model selection, caching, and batch processing while maintaining AI quality."**

This shows:
- Cost awareness
- Production readiness
- Smart engineering
- AWS expertise

---

## Quick Commands

```bash
# Set Nova Lite for price extraction
aws lambda update-function-configuration \
  --function-name retailmind-price-scraper \
  --environment Variables="{USE_AI_EXTRACTION=true,BEDROCK_MODEL=us.amazon.nova-lite-v1:0}"

# Set Nova Pro for copilot
aws lambda update-function-configuration \
  --function-name retailmind-ai-copilot \
  --environment Variables="{BEDROCK_MODEL=us.amazon.nova-pro-v1:0}"
```
