# Day 3 Testing Guide

## 🧪 TEST YOUR RECOMMENDATIONS

### 1. Start Frontend
```bash
npm run dev
```

### 2. Open Browser
```
http://localhost:5173
```

---

## ✅ TEST CHECKLIST

### Command Center Page

**Navigate to:** Command Center

**Should see:**
- ✅ AI Copilot input (already working)
- ✅ "Today's Recommendations" section
- ✅ Loading spinner initially
- ✅ Real recommendations appear (or "No recommendations yet")
- ✅ Refresh button to generate new recommendations
- ✅ Can click on recommendation to see details

**Test Actions:**
1. Click "Generate Recommendations" button
2. Wait 5-10 seconds
3. Should see 4-8 new recommendations appear
4. Each recommendation shows:
   - ✅ Title (e.g., "Lower price on Wireless Earbuds Pro")
   - ✅ Product SKU
   - ✅ Reason (detailed explanation)
   - ✅ Impact (₹ amount)
   - ✅ Confidence score (75-92%)
   - ✅ Status badge (pending/implemented)

---

### Decisions Page

**Navigate to:** Decisions

**Should see:**
- ✅ All recommendations listed
- ✅ Filter tabs (All, Pending, Done)
- ✅ Grouped by date (Today / Earlier)
- ✅ Same recommendation cards as Command Center

**Test Actions:**
1. Click "Pending" filter
   - Should show only pending recommendations
2. Click "Done" filter
   - Should show only implemented ones (if any)
3. Click "All" filter
   - Should show everything

---

### Insights Page

**Navigate to:** Insights

**Should see:**
- ✅ Products Tracked: 5
- ✅ Competitor Prices: 15
- ✅ Real product names in forecast
- ✅ Competitor stats table

---

## 🎯 EXPECTED RECOMMENDATIONS

You should see recommendations like:

### 1. Price Decrease
```
Title: Lower price on [Product Name]
Reason: You're X% above market average (₹X,XXX)
Impact: +₹X,XXX/month estimated
Confidence: 87%
```

### 2. Price Increase
```
Title: Increase price on [Product Name]
Reason: All competitors are out of stock
Impact: +₹X,XXX/month estimated
Confidence: 81%
```

### 3. Restock Alert
```
Title: Urgent: Restock [Product Name]
Reason: Only X days of inventory remaining
Impact: Prevent ₹X,XXX stockout loss
Confidence: 92%
```

### 4. Promotion
```
Title: Clear slow inventory: [Product Name]
Reason: X days of stock. Slow-moving inventory
Impact: Free up ₹X,XXX capital
Confidence: 75%
```

---

## 🚨 TROUBLESHOOTING

### No recommendations appear

**Check:**
1. Are products in database?
   ```bash
   curl https://YOUR_API_URL/dev/products
   ```

2. Is price history generated?
   ```bash
   aws lambda invoke \
       --function-name retailmind-price-monitor \
       response.json
   ```

3. Generate recommendations manually:
   ```bash
   curl -X POST https://YOUR_API_URL/dev/recommendations/generate
   ```

### Error: "Failed to load recommendations"

**Check:**
- API Gateway deployed?
- Lambda function working?
- Check browser console for errors
- Check Network tab in DevTools

### Recommendations look wrong

**This is normal!** They're based on:
- Synthetic competitor prices (random variations)
- Product stock levels (from seed data)
- Simple rules (not real ML yet)

**For demo, this is perfect!** Shows the system works.

---

## 📊 SUCCESS CRITERIA

You've successfully completed Day 3 if:

- ✅ Command Center shows real recommendations
- ✅ Can generate new recommendations
- ✅ Decisions page shows all recommendations
- ✅ Filters work (All, Pending, Done)
- ✅ Recommendations have realistic data
- ✅ No errors in console
- ✅ Loading states work properly

---

## 🎉 WHAT YOU'VE BUILT

### Backend:
- ✅ Recommendation Engine Lambda
- ✅ 4 types of recommendations (price up/down, restock, promotion)
- ✅ Smart analysis logic
- ✅ API endpoints for CRUD operations

### Frontend:
- ✅ Real-time recommendation loading
- ✅ Generate recommendations on demand
- ✅ Filter and sort recommendations
- ✅ Beautiful UI with loading states

### Integration:
- ✅ Frontend ↔ API Gateway ↔ Lambda ↔ DynamoDB
- ✅ Real data flow end-to-end
- ✅ Error handling
- ✅ User feedback (toasts)

---

## 💰 COST UPDATE

**Day 3 costs:** ~$1-2
- Lambda: $0 (free tier)
- DynamoDB: $0 (free tier)
- Bedrock: ~$1-2 (if using AI)

**Total (3 days):** ~$4-5  
**Budget remaining:** ~$95 💰

---

## 🎯 NEXT STEPS

**Day 4 (Tomorrow):** Alert System
- Real-time price drop alerts
- Inventory risk alerts
- SNS notifications
- Connect AlertsPage

**Days 5-7:** Polish & Demo
- Optimize performance
- Create architecture diagram
- Prepare presentation
- Practice demo

---

**Congratulations! You're 60% done with the hackathon project!** 🌟
