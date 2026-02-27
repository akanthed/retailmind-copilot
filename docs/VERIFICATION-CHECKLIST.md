# Real Data Monitoring - Verification Checklist

Use this checklist to verify your real data monitoring is working correctly.

## Pre-Deployment Checklist

### Configuration
- [ ] `VITE_API_URL` environment variable is set
- [ ] `.env.local` file exists with API URL
- [ ] AWS credentials are configured
- [ ] DynamoDB tables exist:
  - [ ] RetailMind-Products
  - [ ] RetailMind-PriceHistory
  - [ ] RetailMind-Recommendations
  - [ ] RetailMind-Alerts

### Files Ready
- [ ] `backend/functions/priceScraper/index-enhanced.mjs` exists
- [ ] `backend/functions/priceMonitor/index-real.mjs` exists
- [ ] `scripts/add-real-product.ps1` exists
- [ ] `START-REAL-MONITORING.ps1` exists

## Deployment Checklist

### Lambda Functions
- [ ] PriceScraper function deployed
- [ ] PriceScraper has internet access (not in VPC or VPC has NAT)
- [ ] PriceScraper has cheerio dependency installed
- [ ] PriceMonitor function deployed
- [ ] PriceMonitor has internet access
- [ ] PriceMonitor has cheerio dependency installed
- [ ] Products function updated with new fields

### API Gateway
- [ ] `/scraper/price` endpoint exists
- [ ] `/monitor/prices` endpoint exists
- [ ] `/products` endpoint exists
- [ ] CORS is enabled on all endpoints

## Testing Checklist

### Test 1: Direct URL Scraping

```powershell
# Test Amazon scraping
$test = @{
    url = "https://www.amazon.in/dp/B0CHX1W1XY"
    platform = "amazon"
} | ConvertTo-Json

$result = Invoke-RestMethod -Uri "$env:VITE_API_URL/scraper/price" `
    -Method Post -ContentType "application/json" -Body $test

# Verify result
$result | ConvertTo-Json
```

**Expected Result:**
```json
{
  "platform": "Amazon.in",
  "productName": "Apple iPhone 15 Pro Max...",
  "price": 119999,
  "inStock": true,
  "rating": 4.5,
  "reviewsCount": 3847,
  "source": "scraped"
}
```

**Checklist:**
- [ ] Request succeeds (no errors)
- [ ] Price is a valid number
- [ ] Product name is extracted
- [ ] Stock status is boolean
- [ ] Rating is present (if available)
- [ ] Source is "scraped"

### Test 2: Search and Scrape

```powershell
# Test search mode
$search = @{
    productName = "iPhone 15 Pro Max"
    platform = "amazon"
} | ConvertTo-Json

$result = Invoke-RestMethod -Uri "$env:VITE_API_URL/scraper/price" `
    -Method Post -ContentType "application/json" -Body $search

$result | ConvertTo-Json
```

**Checklist:**
- [ ] Search finds a product
- [ ] Product URL is extracted
- [ ] Price is scraped from product page
- [ ] All data fields are present

### Test 3: Create Product with URLs

```powershell
# Create test product
$product = @{
    name = "Test Product - iPhone 15"
    sku = "TEST-IP15"
    category = "Smartphones"
    currentPrice = 159900
    costPrice = 125000
    stock = 10
    description = "Test product for verification"
    competitorUrls = @{
        amazon = "https://www.amazon.in/dp/B0CHX1W1XY"
    }
} | ConvertTo-Json

$result = Invoke-RestMethod -Uri "$env:VITE_API_URL/products" `
    -Method Post -ContentType "application/json" -Body $product

$result | ConvertTo-Json
```

**Checklist:**
- [ ] Product is created successfully
- [ ] Product has an ID
- [ ] `competitorUrls` field is saved
- [ ] Product appears in DynamoDB

### Test 4: Run Price Monitoring

```powershell
# Trigger monitoring
$result = Invoke-RestMethod -Uri "$env:VITE_API_URL/monitor/prices" -Method Post

$result | ConvertTo-Json
```

**Expected Result:**
```json
{
  "message": "Price monitoring completed",
  "productsMonitored": 1,
  "pricesScraped": 1,
  "pricesFailed": 0,
  "results": [...]
}
```

**Checklist:**
- [ ] Monitoring completes without errors
- [ ] `productsMonitored` > 0
- [ ] `pricesScraped` > 0
- [ ] Results array contains data

### Test 5: Verify Price History

```powershell
# Get product ID from previous test
$productId = "prod-xxx"  # Replace with actual ID

# Get price history
$history = Invoke-RestMethod -Uri "$env:VITE_API_URL/products/$productId/prices"

$history | ConvertTo-Json
```

**Checklist:**
- [ ] Price history is returned
- [ ] Contains scraped price data
- [ ] Has correct product ID
- [ ] Timestamp is recent
- [ ] Source is "scraped"

### Test 6: Check CloudWatch Logs

**PriceScraper Logs:**
```
Go to CloudWatch → Log Groups → /aws/lambda/RetailMind-PriceScraper
```

**Look for:**
- [ ] "Scraping Amazon: https://..."
- [ ] "Price extracted: 119999"
- [ ] No error messages
- [ ] Successful completion

**PriceMonitor Logs:**
```
Go to CloudWatch → Log Groups → /aws/lambda/RetailMind-PriceMonitor
```

**Look for:**
- [ ] "Found X products to monitor"
- [ ] "Scraping amazon for product..."
- [ ] "Monitoring complete: X scraped, Y failed"
- [ ] Success rate > 90%

## Dashboard Verification

### Products Page
- [ ] Products list loads
- [ ] Test product appears
- [ ] Competitor URLs are visible
- [ ] Can edit product
- [ ] Can add new product with URLs

### Price History
- [ ] Price history chart shows data
- [ ] Multiple competitors visible
- [ ] Prices are realistic (not synthetic)
- [ ] Timestamps are recent
- [ ] Source shows "scraped"

### Recommendations
- [ ] Recommendations are generated
- [ ] Based on real competitor prices
- [ ] Suggestions make sense
- [ ] Can implement recommendations

### Alerts
- [ ] Alerts are generated
- [ ] Price drop alerts appear
- [ ] Stock alerts appear
- [ ] Can acknowledge alerts

## Production Readiness Checklist

### Monitoring
- [ ] CloudWatch alarms set up
- [ ] Error rate monitoring
- [ ] Success rate tracking
- [ ] Cost monitoring

### Scheduling
- [ ] EventBridge rule created
- [ ] Schedule: `rate(6 hours)` or similar
- [ ] Target: PriceMonitor Lambda
- [ ] Rule is enabled

### Error Handling
- [ ] Failed scrapes don't break system
- [ ] Fallback to synthetic data works
- [ ] Errors are logged properly
- [ ] Retry logic is working

### Performance
- [ ] Scraping completes in < 30 seconds per product
- [ ] No timeout errors
- [ ] Memory usage is acceptable
- [ ] Cost per scrape is reasonable

### Data Quality
- [ ] Scraped prices match website prices
- [ ] Stock status is accurate
- [ ] Ratings are correct
- [ ] No duplicate price entries

## Common Issues & Solutions

### Issue: "Could not extract price"

**Check:**
- [ ] URL is accessible in browser
- [ ] Product is in stock
- [ ] Platform name is correct (amazon/flipkart/snapdeal)
- [ ] Website structure hasn't changed

**Solution:**
- Test URL manually in browser
- Try different product
- Update CSS selectors if needed

### Issue: "Network timeout"

**Check:**
- [ ] Lambda has internet access
- [ ] Not in VPC or VPC has NAT gateway
- [ ] Security groups allow outbound HTTPS
- [ ] Timeout is set high enough (30s+)

**Solution:**
- Check VPC configuration
- Increase Lambda timeout
- Add retry logic

### Issue: "No data in dashboard"

**Check:**
- [ ] Products have `competitorUrls` field
- [ ] Monitoring has been run
- [ ] DynamoDB tables have data
- [ ] API endpoints are working

**Solution:**
- Run monitoring manually
- Check CloudWatch logs
- Verify DynamoDB data
- Test API endpoints

### Issue: "Rate limiting (HTTP 429/503)"

**Check:**
- [ ] Monitoring frequency
- [ ] Number of products
- [ ] Requests per minute

**Solution:**
- Reduce monitoring frequency
- Add delays between requests
- Use proxy service
- Respect robots.txt

## Success Criteria

Your implementation is successful when:

### Functionality
- [x] Can add products with competitor URLs
- [x] Can scrape prices from Amazon, Flipkart, Snapdeal
- [x] Price history is stored correctly
- [x] Dashboard shows real data
- [x] Recommendations use real prices
- [x] Alerts trigger on price changes

### Reliability
- [x] Success rate > 90%
- [x] No system crashes
- [x] Errors are handled gracefully
- [x] Fallback works when needed

### Performance
- [x] Scraping completes in reasonable time
- [x] No timeout errors
- [x] Dashboard loads quickly
- [x] Data is fresh (< 6 hours old)

### Data Quality
- [x] Prices match actual websites
- [x] Stock status is accurate
- [x] No duplicate entries
- [x] Timestamps are correct

## Final Verification

Run this complete test:

```powershell
# 1. Add product
.\scripts\add-real-product.ps1

# 2. Run monitoring
Invoke-RestMethod -Uri "$env:VITE_API_URL/monitor/prices" -Method Post

# 3. Check dashboard
# Open browser to your frontend URL
# Verify data appears

# 4. Check logs
# Go to CloudWatch
# Verify no errors

# 5. Verify DynamoDB
# Go to DynamoDB console
# Check PriceHistory table
# Verify recent entries with source="scraped"
```

**All checks passed?** 🎉 Your real data monitoring is working!

## Next Steps After Verification

1. **Add More Products**
   - Use `.\scripts\add-real-product.ps1`
   - Target: 20-30 products

2. **Set Up Scheduling**
   - Create EventBridge rule
   - Schedule: Every 6 hours
   - Monitor for 24 hours

3. **Monitor Performance**
   - Check CloudWatch logs daily
   - Track success rate
   - Adjust as needed

4. **Optimize**
   - Update selectors if needed
   - Adjust monitoring frequency
   - Add more competitors

5. **Scale**
   - Add 100+ products
   - Implement automation
   - Build custom reports

---

**Need Help?**

If any checks fail:
1. Review the error message
2. Check CloudWatch logs
3. Refer to REAL-PRICE-MONITORING-SETUP.md
4. Test individual components
5. Verify AWS permissions

**Everything working?** You're ready for production! 🚀
