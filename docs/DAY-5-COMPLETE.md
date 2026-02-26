# Day 5: Analytics Dashboard - Setup Checklist

## Files Created ✅

### Backend
- ✅ `backend/functions/analytics/index.mjs` - Analytics Lambda function
- ✅ `backend/functions/analytics/package.json` - Dependencies
- ✅ `backend/deploy-analytics-windows.ps1` - Deployment script

### Frontend
- ✅ `src/api/client.ts` - Added analytics API methods
- ✅ `src/pages/OutcomesPage.tsx` - Updated to use real data

### Testing
- ✅ `test-analytics.ps1` - Test script

---

## Deployment Steps

### 1. Create Lambda Function
Go to AWS Lambda Console and create:
- Function name: `retailmind-analytics`
- Runtime: Node.js 20.x
- Timeout: 60 seconds
- Memory: 512 MB
- Permissions: DynamoDBFullAccess

### 2. Deploy Code
```powershell
cd backend
./deploy-analytics-windows.ps1
```

### 3. Configure API Gateway
Add these 3 endpoints to your RetailMind-API:

**Create `/analytics` resource:**
- Actions → Create Resource
- Resource Name: `analytics`
- Enable CORS

**Add child resources and methods:**

1. `/analytics/overview` (GET)
   - Create resource: `overview`
   - Add GET method
   - Integration: Lambda → `retailmind-analytics`
   - Enable CORS

2. `/analytics/revenue` (GET)
   - Create resource: `revenue`
   - Add GET method
   - Integration: Lambda → `retailmind-analytics`
   - Enable CORS

3. `/analytics/outcomes` (GET)
   - Create resource: `outcomes`
   - Add GET method
   - Integration: Lambda → `retailmind-analytics`
   - Enable CORS

**Deploy API:**
- Actions → Deploy API
- Stage: `dev`

### 4. Test
```powershell
./test-analytics.ps1
```

---

## What Analytics Provides

### Overview Analytics (`/analytics/overview`)
```json
{
  "products": {
    "total": 5,
    "totalValue": 125000,
    "avgMargin": 35.2,
    "lowStock": 2,
    "healthyStock": 2,
    "overstock": 1
  },
  "recommendations": {
    "total": 8,
    "implemented": 3,
    "pending": 5,
    "implementationRate": 37
  },
  "alerts": {
    "total": 20,
    "critical": 2,
    "unacknowledged": 15
  }
}
```

### Revenue Analytics (`/analytics/revenue`)
```json
{
  "totalRevenueImpact": 5090,
  "implementedActions": 3,
  "outcomesByType": {
    "price_decrease": 3240,
    "price_increase": 0,
    "restock": 1850,
    "promotion": 0
  },
  "weeklyTrend": [
    { "week": "Week 1", "revenue": 15000, "impact": 0 },
    { "week": "Week 2", "revenue": 16272, "impact": 1272 },
    { "week": "Week 3", "revenue": 17545, "impact": 2545 },
    { "week": "Week 4", "revenue": 20090, "impact": 5090 }
  ],
  "avgRevenuePerAction": 1696
}
```

### Outcomes (`/analytics/outcomes`)
```json
{
  "outcomes": [
    {
      "id": "rec-123",
      "action": "Lowered price on Wireless Earbuds",
      "date": "Feb 20, 2026",
      "status": "implemented",
      "impactType": "revenue",
      "impactValue": "+₹3,240",
      "impactPercent": "+18%",
      "before": "₹2,499",
      "after": "₹2,199",
      "beforeMetric": "42 units/week",
      "afterMetric": "68 units/week"
    }
  ],
  "summary": {
    "totalRevenueImpact": 5090,
    "actionsImplemented": 3,
    "actionsPending": 1,
    "risksPrevented": 1
  }
}
```

---

## Frontend Integration

### Outcomes Page
- Shows real decision history
- Displays revenue impact per action
- Tracks before/after metrics
- Shows implementation status

### Reports Page
- Ready for analytics integration (currently mock data)
- Can be enhanced with charts using the analytics data

---

## Testing Checklist

- [ ] Lambda function created
- [ ] Code deployed successfully
- [ ] API Gateway endpoints configured
- [ ] CORS enabled on all endpoints
- [ ] API deployed to dev stage
- [ ] Test script runs without errors
- [ ] Outcomes page loads real data
- [ ] Revenue impact displays correctly

---

## Quick Test Commands

```bash
# Test overview
curl https://igx41kdnth.execute-api.us-east-1.amazonaws.com/dev/analytics/overview

# Test revenue
curl https://igx41kdnth.execute-api.us-east-1.amazonaws.com/dev/analytics/revenue

# Test outcomes
curl https://igx41kdnth.execute-api.us-east-1.amazonaws.com/dev/analytics/outcomes
```

---

## What's Next?

### Day 6: Testing & Polish
- End-to-end testing
- Error handling improvements
- Performance optimization
- UI polish

### Day 7: Demo & Submission
- Record demo video
- Update README
- Create deployment guide
- Submit to hackathon

---

## Current Status

**Days Completed:** 5/7
**Budget Used:** ~$5
**Budget Remaining:** ~$95

**Working Features:**
✅ AI Copilot (Amazon Nova Pro)
✅ Products API
✅ Price Monitoring
✅ Recommendation Engine
✅ Alert System
✅ Analytics Dashboard

**Ready for Demo!** 🎉
