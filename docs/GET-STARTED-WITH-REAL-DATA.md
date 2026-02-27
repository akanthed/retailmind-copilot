# Get Started with Real Data Monitoring

**Your complete guide to implementing genuine price monitoring in RetailMind AI**

---

## 🎯 What You're Building

A production-ready price monitoring system that:
- Scrapes real prices from Amazon.in, Flipkart, Snapdeal
- Tracks competitor stock, ratings, and reviews
- Generates AI-powered recommendations
- Triggers automated alerts
- Works like a real SaaS product

---

## 🚀 Quick Start (5 Minutes)

### Option 1: Automated Setup (Recommended)

```powershell
.\START-REAL-MONITORING.ps1
```

This wizard will:
1. ✅ Check your configuration
2. ✅ Deploy enhanced functions
3. ✅ Help you add products
4. ✅ Test scraping
5. ✅ Start monitoring

### Option 2: Manual Setup

```powershell
# 1. Deploy enhanced functions
Copy-Item backend/functions/priceScraper/index-enhanced.mjs backend/functions/priceScraper/index.mjs
Copy-Item backend/functions/priceMonitor/index-real.mjs backend/functions/priceMonitor/index.mjs

# 2. Add a product
.\scripts\add-real-product.ps1

# 3. Test scraping
$test = @{ url = "https://www.amazon.in/dp/B0CHX1W1XY"; platform = "amazon" } | ConvertTo-Json
Invoke-RestMethod -Uri "$env:VITE_API_URL/scraper/price" -Method Post -Body $test -ContentType "application/json"

# 4. Run monitoring
Invoke-RestMethod -Uri "$env:VITE_API_URL/monitor/prices" -Method Post
```

---

## 📚 Documentation Guide

### For First-Time Setup

1. **START HERE:** [Implementation Summary](IMPLEMENTATION-SUMMARY.md)
   - Overview of what's been built
   - Quick start instructions
   - Key features and capabilities

2. **THEN READ:** [Real Price Monitoring Setup](REAL-PRICE-MONITORING-SETUP.md)
   - Detailed setup instructions
   - Deployment guide
   - Testing procedures

3. **HELPFUL:** [How to Find Product URLs](HOW-TO-FIND-PRODUCT-URLS.md)
   - Platform-specific guides
   - URL format examples
   - Tips and tricks

### For Understanding the System

4. **VISUAL:** [Visual Flow Diagram](VISUAL-FLOW-DIAGRAM.md)
   - Complete architecture
   - Data flow diagrams
   - Step-by-step processes

5. **DETAILED:** [Real Data Implementation Complete](REAL-DATA-IMPLEMENTATION-COMPLETE.md)
   - What's implemented
   - How to use
   - Files created

### For Verification

6. **CHECKLIST:** [Verification Checklist](VERIFICATION-CHECKLIST.md)
   - Pre-deployment checks
   - Testing procedures
   - Success criteria

---

## 🎓 Learning Path

### Day 1: Setup & First Product

**Time:** 30 minutes

1. Run `.\START-REAL-MONITORING.ps1`
2. Add 1 product with Amazon URL
3. Test scraping
4. Verify in dashboard

**Read:**
- Implementation Summary
- How to Find Product URLs

### Day 2: Add More Products

**Time:** 1 hour

1. Find 5-10 products you want to monitor
2. Get their URLs from Amazon, Flipkart
3. Add using `.\scripts\add-real-product.ps1`
4. Run monitoring
5. Check results

**Read:**
- Real Price Monitoring Setup
- Verification Checklist

### Day 3: Automate & Scale

**Time:** 1 hour

1. Set up EventBridge schedule
2. Add 20+ products
3. Monitor CloudWatch logs
4. Optimize as needed

**Read:**
- Visual Flow Diagram
- Real Data Implementation Complete

---

## 📖 Documentation Index

| Document | Purpose | When to Read |
|----------|---------|--------------|
| [IMPLEMENTATION-SUMMARY.md](IMPLEMENTATION-SUMMARY.md) | Overview & quick start | First |
| [REAL-PRICE-MONITORING-SETUP.md](REAL-PRICE-MONITORING-SETUP.md) | Detailed setup guide | During setup |
| [HOW-TO-FIND-PRODUCT-URLS.md](HOW-TO-FIND-PRODUCT-URLS.md) | Finding competitor URLs | When adding products |
| [VISUAL-FLOW-DIAGRAM.md](VISUAL-FLOW-DIAGRAM.md) | System architecture | To understand flow |
| [REAL-DATA-IMPLEMENTATION-COMPLETE.md](REAL-DATA-IMPLEMENTATION-COMPLETE.md) | Complete reference | For details |
| [VERIFICATION-CHECKLIST.md](VERIFICATION-CHECKLIST.md) | Testing & verification | After setup |
| [GET-STARTED-WITH-REAL-DATA.md](GET-STARTED-WITH-REAL-DATA.md) | This file - master guide | Start here |

---

## 🛠️ What's Been Created

### Backend Functions

```
backend/functions/priceScraper/
├─ index-enhanced.mjs          ← Enhanced scraper with search
└─ index.mjs                   ← Original (backup as index-old.mjs)

backend/functions/priceMonitor/
├─ index-real.mjs              ← Real price monitoring
└─ index.mjs                   ← Original (backup as index-old.mjs)

backend/functions/products/
└─ index.mjs                   ← Updated with competitorUrls field
```

### Helper Scripts

```
scripts/
├─ add-real-product.ps1        ← PowerShell: Add product interactively
└─ add-real-product.sh         ← Bash: Add product interactively

START-REAL-MONITORING.ps1      ← Complete setup wizard
```

### Documentation

```
IMPLEMENTATION-SUMMARY.md              ← Overview & quick start
REAL-PRICE-MONITORING-SETUP.md        ← Detailed setup guide
HOW-TO-FIND-PRODUCT-URLS.md           ← URL finding guide
VISUAL-FLOW-DIAGRAM.md                ← Architecture diagrams
REAL-DATA-IMPLEMENTATION-COMPLETE.md  ← Complete reference
VERIFICATION-CHECKLIST.md             ← Testing checklist
GET-STARTED-WITH-REAL-DATA.md         ← This master guide
```

---

## 🎯 Key Features

### 1. Real Price Scraping
- Actual HTML fetching from e-commerce sites
- Multiple CSS selector strategies
- Retry logic with exponential backoff
- Extracts: price, stock, rating, reviews, images

### 2. Search Capability
- Search by product name
- Finds first matching result
- Scrapes product page automatically
- Useful for discovering competitors

### 3. Smart Fallback
- Products with URLs → real scraping
- Products without URLs → synthetic data
- Failed scrapes → logged, system continues
- Never breaks completely

### 4. Complete Data
- Price (INR)
- Stock status (in/out of stock)
- Customer rating (1-5 stars)
- Number of reviews
- Product images
- Timestamps

### 5. Production Ready
- Error handling
- Logging to CloudWatch
- Batch processing
- Scheduled monitoring
- Cost-effective

---

## 📊 Example Product

```json
{
  "name": "Samsung Galaxy S23 Ultra 256GB",
  "sku": "SAMSUNG-S23U-256",
  "category": "Smartphones",
  "currentPrice": 124999,
  "costPrice": 95000,
  "stock": 50,
  "description": "Flagship smartphone with 200MP camera",
  "competitorUrls": {
    "amazon": "https://www.amazon.in/dp/B0BT9CXXXX",
    "flipkart": "https://www.flipkart.com/samsung-galaxy-s23-ultra/p/itm123456",
    "snapdeal": "https://www.snapdeal.com/product/samsung-galaxy-s23/123456"
  }
}
```

---

## 🔍 How It Works

```
1. You add product with competitor URLs
        ↓
2. EventBridge triggers monitoring (every 6 hours)
        ↓
3. PriceMonitor scrapes each competitor URL
        ↓
4. Extracts price, stock, rating, reviews
        ↓
5. Stores in DynamoDB PriceHistory table
        ↓
6. Dashboard shows real competitor data
        ↓
7. Recommendations generated from real prices
        ↓
8. Alerts triggered on price changes
```

---

## ✅ Success Checklist

- [ ] Enhanced functions deployed
- [ ] Added 3+ products with URLs
- [ ] Tested scraping manually
- [ ] Verified data in dashboard
- [ ] Set up EventBridge schedule
- [ ] Monitored for 24 hours
- [ ] Success rate > 90%
- [ ] Ready for production

---

## 🎓 Common Questions

### Q: Do I need to provide URLs for all products?
**A:** No! Products without URLs will use synthetic data automatically. The system always works.

### Q: What if scraping fails?
**A:** The system logs the error and continues with other products. It never breaks completely.

### Q: How often should I scrape?
**A:** Every 6-12 hours is good. Don't scrape too frequently to avoid rate limiting.

### Q: Can I add more e-commerce sites?
**A:** Yes! Add new scraping functions following the same pattern.

### Q: How do I know if it's working?
**A:** Check CloudWatch logs and verify `source: "scraped"` in price history.

---

## 🚨 Troubleshooting

### Issue: "Could not extract price"
→ Read: [Verification Checklist](VERIFICATION-CHECKLIST.md) - Common Issues section

### Issue: No data in dashboard
→ Read: [Real Price Monitoring Setup](REAL-PRICE-MONITORING-SETUP.md) - Troubleshooting section

### Issue: Rate limiting
→ Read: [Real Data Implementation Complete](REAL-DATA-IMPLEMENTATION-COMPLETE.md) - Best Practices section

---

## 📞 Support Resources

1. **CloudWatch Logs:** Check Lambda function logs for errors
2. **Test Endpoint:** Use `/scraper/price` to test URLs
3. **Documentation:** Refer to specific guides above
4. **Verification:** Use the checklist to verify each step

---

## 🎉 You're Ready!

Your RetailMind AI system now supports genuine price monitoring with real competitor data!

**Next Steps:**
1. Run `.\START-REAL-MONITORING.ps1`
2. Add your first product
3. Watch the magic happen! ✨

**Happy monitoring!** 📊🚀

---

## 📝 Quick Reference

### Add Product
```powershell
.\scripts\add-real-product.ps1
```

### Test Scraping
```powershell
$test = @{ url = "URL"; platform = "amazon" } | ConvertTo-Json
Invoke-RestMethod -Uri "$env:VITE_API_URL/scraper/price" -Method Post -Body $test -ContentType "application/json"
```

### Run Monitoring
```powershell
Invoke-RestMethod -Uri "$env:VITE_API_URL/monitor/prices" -Method Post
```

### Check Logs
```
AWS Console → CloudWatch → Log Groups → /aws/lambda/RetailMind-PriceMonitor
```

---

**Made with ❤️ for genuine price monitoring**
