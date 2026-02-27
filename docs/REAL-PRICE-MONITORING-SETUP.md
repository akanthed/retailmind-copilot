# Real Price Monitoring Setup Guide

This guide shows you how to set up genuine price monitoring with real competitor URLs and web scraping.

## Overview

The system now supports:
- ✅ Real product URLs from Amazon, Flipkart, Snapdeal
- ✅ Actual price scraping from competitor websites
- ✅ Automatic fallback to synthetic data if URLs not provided
- ✅ Web search capability to find products automatically
- ✅ Rating and review count extraction

## Step 1: Add Products with Competitor URLs

When creating or updating products, include the `competitorUrls` field:

```json
{
  "name": "Samsung Galaxy S23 Ultra 256GB",
  "sku": "SAMSUNG-S23U-256",
  "category": "Smartphones",
  "currentPrice": 124999,
  "costPrice": 95000,
  "stock": 50,
  "description": "Latest flagship smartphone with 200MP camera",
  "competitorUrls": {
    "amazon": "https://www.amazon.in/dp/B0BT9CXXXX",
    "flipkart": "https://www.flipkart.com/samsung-galaxy-s23-ultra/p/itmXXXXXXXX",
    "snapdeal": "https://www.snapdeal.com/product/samsung-galaxy-s23/XXXXXXXXX"
  }
}
```

## Step 2: Deploy Enhanced Functions

### Option A: Replace existing functions

```bash
# Backup current functions
cp backend/functions/priceScraper/index.mjs backend/functions/priceScraper/index-old.mjs
cp backend/functions/priceMonitor/index.mjs backend/functions/priceMonitor/index-old.mjs

# Use enhanced versions
cp backend/functions/priceScraper/index-enhanced.mjs backend/functions/priceScraper/index.mjs
cp backend/functions/priceMonitor/index-real.mjs backend/functions/priceMonitor/index.mjs
```

### Option B: Deploy as new functions

Deploy the enhanced versions as separate Lambda functions for testing:
- `RetailMind-PriceScraper-Enhanced`
- `RetailMind-PriceMonitor-Real`

## Step 3: Test Price Scraping

### Test Direct URL Scraping

```bash
# Test Amazon scraping
curl -X POST https://YOUR_API_URL/scraper/price \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://www.amazon.in/dp/B0BT9CXXXX",
    "platform": "amazon"
  }'

# Test Flipkart scraping
curl -X POST https://YOUR_API_URL/scraper/price \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://www.flipkart.com/product/p/itmXXXXXX",
    "platform": "flipkart"
  }'
```

### Test Search and Scrape

```bash
# Search for product and scrape first result
curl -X POST https://YOUR_API_URL/scraper/price \
  -H "Content-Type: application/json" \
  -d '{
    "productName": "Samsung Galaxy S23 Ultra",
    "platform": "amazon"
  }'
```

## Step 4: Create Products via API

### Using curl

```bash
curl -X POST https://YOUR_API_URL/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "iPhone 15 Pro Max 256GB",
    "sku": "APPLE-15PM-256",
    "category": "Smartphones",
    "currentPrice": 159900,
    "costPrice": 125000,
    "stock": 30,
    "description": "Latest iPhone with A17 Pro chip",
    "competitorUrls": {
      "amazon": "https://www.amazon.in/dp/B0CHX1W1XY",
      "flipkart": "https://www.flipkart.com/apple-iphone-15-pro-max/p/itm123456789"
    }
  }'
```

### Using the Frontend

1. Go to Products page
2. Click "Add Product"
3. Fill in product details
4. Add competitor URLs in the form
5. Save

## Step 5: Run Price Monitoring

### Manual Trigger

```bash
# Trigger price monitoring
curl -X POST https://YOUR_API_URL/monitor/prices
```

### Automated Schedule

Set up EventBridge (CloudWatch Events) to run monitoring:

1. Go to AWS EventBridge Console
2. Create new rule
3. Schedule: `rate(6 hours)` or `cron(0 */6 * * ? *)`
4. Target: Your PriceMonitor Lambda function

## How It Works

### 1. Price Scraper Function

The enhanced scraper supports two modes:

**Direct URL Mode:**
```javascript
{
  "url": "https://www.amazon.in/dp/B0BT9CXXXX",
  "platform": "amazon"
}
```

**Search Mode:**
```javascript
{
  "productName": "Samsung Galaxy S23 Ultra",
  "platform": "amazon"
}
```

### 2. Price Monitor Function

The real monitor:
1. Fetches all products from DynamoDB
2. For each product with `competitorUrls`:
   - Scrapes each competitor URL
   - Extracts price, stock, rating, reviews
   - Stores in PriceHistory table
3. For products without URLs:
   - Falls back to synthetic data
   - Ensures system keeps working

### 3. Data Extracted

From each competitor page:
- ✅ Product name
- ✅ Current price (INR)
- ✅ Stock status (in stock / out of stock)
- ✅ Product image URL
- ✅ Rating (1-5 stars)
- ✅ Number of reviews
- ✅ Timestamp

## Example Product Data

### Complete Product with URLs

```json
{
  "id": "prod-123",
  "name": "Sony WH-1000XM5 Wireless Headphones",
  "sku": "SONY-WH1000XM5",
  "category": "Audio",
  "currentPrice": 29990,
  "costPrice": 22000,
  "stock": 75,
  "stockDays": 45,
  "description": "Industry-leading noise cancellation",
  "competitorUrls": {
    "amazon": "https://www.amazon.in/dp/B09XS7JWHH",
    "flipkart": "https://www.flipkart.com/sony-wh-1000xm5/p/itm123456",
    "snapdeal": "https://www.snapdeal.com/product/sony-wh-1000xm5/123456"
  },
  "createdAt": 1709049600000,
  "updatedAt": 1709049600000
}
```

### Price History Entry (Scraped)

```json
{
  "id": "price-456",
  "productId": "prod-123",
  "productName": "Sony WH-1000XM5 Wireless Headphones",
  "productSku": "SONY-WH1000XM5",
  "competitorId": "comp-amazon",
  "competitorName": "Amazon.in",
  "competitorDomain": "amazon",
  "price": 27990,
  "inStock": true,
  "rating": 4.5,
  "reviewsCount": 2847,
  "timestamp": 1709049600000,
  "source": "scraped",
  "url": "https://www.amazon.in/dp/B09XS7JWHH",
  "createdAt": "2024-02-27T12:00:00.000Z"
}
```

## Finding Product URLs

### Amazon.in
1. Search for product on Amazon.in
2. Click on product
3. Copy URL from browser (should contain `/dp/` or `/gp/product/`)
4. Example: `https://www.amazon.in/dp/B0BT9CXXXX`

### Flipkart
1. Search for product on Flipkart
2. Click on product
3. Copy URL from browser (should contain `/p/itm`)
4. Example: `https://www.flipkart.com/product-name/p/itmXXXXXXXX`

### Snapdeal
1. Search for product on Snapdeal
2. Click on product
3. Copy URL from browser
4. Example: `https://www.snapdeal.com/product/product-name/XXXXXXXXX`

## Troubleshooting

### Scraping Fails

**Issue:** "Could not extract price"

**Solutions:**
1. Check if URL is accessible
2. Verify platform name is correct (amazon, flipkart, snapdeal)
3. Website structure may have changed - selectors need updating
4. Try the URL in a browser first

### Rate Limiting

**Issue:** HTTP 503 or 429 errors

**Solutions:**
1. Add delays between requests
2. Use rotating User-Agent headers
3. Consider using proxy services
4. Reduce monitoring frequency

### No Data Showing

**Issue:** Price history is empty

**Solutions:**
1. Check if products have `competitorUrls` field
2. Verify Lambda function has internet access
3. Check CloudWatch logs for errors
4. Ensure DynamoDB tables exist

## Best Practices

1. **URL Validation:** Always test URLs before adding to products
2. **Monitoring Frequency:** Don't scrape too often (6-12 hours is good)
3. **Error Handling:** System falls back to synthetic data automatically
4. **Data Quality:** Verify scraped prices match actual website prices
5. **Compliance:** Respect robots.txt and terms of service

## Next Steps

1. Add more products with real URLs
2. Set up automated monitoring schedule
3. Monitor CloudWatch logs for scraping success rate
4. Adjust selectors if websites change structure
5. Consider adding more e-commerce platforms

## Support

If scraping stops working:
1. Check CloudWatch logs
2. Test URLs manually in browser
3. Update CSS selectors in scraper functions
4. Contact support with error logs
