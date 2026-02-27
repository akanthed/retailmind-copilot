# Quick Start: Real Price Monitoring (2-Day Implementation)

## Goal
Get real competitor prices from Amazon.in and Flipkart working in 2 days.

---

## Day 1: Product Addition + Manual URL Mapping (8 hours)

### Morning (4 hours): Product Form

#### Step 1: Create Add Product Page (2 hours)
```bash
# Create the page
src/pages/AddProductPage.tsx
```

**Features:**
- Product name, SKU, category
- Current price, cost price, stock
- Amazon.in URL input
- Flipkart URL input
- Save button

#### Step 2: Update Products API (1 hour)
```bash
# Already exists, just test POST endpoint
backend/functions/products/index.mjs
```

Test creating a product with competitor URLs:
```json
{
  "name": "Apple iPhone 15 Pro 256GB",
  "sku": "IPHONE15PRO256",
  "currentPrice": 134900,
  "costPrice": 120000,
  "stock": 10,
  "competitorUrls": {
    "amazon": "https://www.amazon.in/dp/B0CHX1W1XY",
    "flipkart": "https://www.flipkart.com/apple-iphone-15-pro-256-gb/p/itm6d2f4d24c0c3a"
  }
}
```

#### Step 3: Add Navigation (30 min)
Update AppLayout to include "Add Product" button in Insights page.

#### Step 4: Test End-to-End (30 min)
- Add a real product
- Enter real Amazon.in URL
- Verify it saves to DynamoDB

---

### Afternoon (4 hours): Price Scraper

#### Step 5: Create Price Scraper Lambda (3 hours)

**File:** `backend/functions/priceScraper/index.mjs`

```javascript
// Simple scraper using fetch + cheerio
import * as cheerio from 'cheerio';

export const handler = async (event) => {
  const { url, platform } = JSON.parse(event.body || '{}');
  
  try {
    if (platform === 'amazon') {
      return await scrapeAmazon(url);
    } else if (platform === 'flipkart') {
      return await scrapeFlipkart(url);
    }
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};

async function scrapeAmazon(url) {
  // Fetch HTML
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    }
  });
  
  const html = await response.text();
  const $ = cheerio.load(html);
  
  // Extract price (Amazon.in specific selectors)
  const priceWhole = $('.a-price-whole').first().text().replace(/[^0-9]/g, '');
  const priceFraction = $('.a-price-fraction').first().text();
  const price = parseFloat(priceWhole + '.' + priceFraction);
  
  // Extract stock status
  const inStock = $('#availability span').text().includes('In stock');
  
  return {
    statusCode: 200,
    body: JSON.stringify({
      platform: 'Amazon.in',
      price: price,
      inStock: inStock,
      timestamp: Date.now()
    })
  };
}

async function scrapeFlipkart(url) {
  // Similar logic for Flipkart
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    }
  });
  
  const html = await response.text();
  const $ = cheerio.load(html);
  
  // Flipkart price selector
  const priceText = $('._30jeq3._16Jk6d').first().text().replace(/[^0-9]/g, '');
  const price = parseFloat(priceText);
  
  // Stock status
  const inStock = !$('._16FRp0').text().includes('Out of Stock');
  
  return {
    statusCode: 200,
    body: JSON.stringify({
      platform: 'Flipkart',
      price: price,
      inStock: inStock,
      timestamp: Date.now()
    })
  };
}
```

**Package.json:**
```json
{
  "name": "price-scraper",
  "type": "module",
  "dependencies": {
    "cheerio": "^1.0.0-rc.12"
  }
}
```

#### Step 6: Deploy Scraper (30 min)
```powershell
cd backend/functions/priceScraper
npm install
# Zip and upload to Lambda
# Or use deployment script
```

#### Step 7: Test Scraper (30 min)
```bash
# Test with real Amazon.in URL
curl -X POST https://YOUR_API/scraper \
  -d '{"url":"https://www.amazon.in/dp/B0CHX1W1XY","platform":"amazon"}'
```

---

## Day 2: Integration + Monitoring (8 hours)

### Morning (4 hours): Connect Everything

#### Step 8: Update Price Monitor (2 hours)

**File:** `backend/functions/priceMonitor/index.mjs`

```javascript
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, ScanCommand, PutCommand } from "@aws-sdk/lib-dynamodb";

const docClient = DynamoDBDocumentClient.from(new DynamoDBClient({}));

export const handler = async (event) => {
  // 1. Get all products with competitor URLs
  const products = await getAllProducts();
  
  // 2. For each product, scrape competitor prices
  for (const product of products) {
    if (product.competitorUrls?.amazon) {
      const price = await scrapePrice(product.competitorUrls.amazon, 'amazon');
      await storePriceHistory(product.id, 'Amazon.in', price);
    }
    
    if (product.competitorUrls?.flipkart) {
      const price = await scrapePrice(product.competitorUrls.flipkart, 'flipkart');
      await storePriceHistory(product.id, 'Flipkart', price);
    }
  }
  
  return { statusCode: 200, body: 'Monitoring complete' };
};

async function scrapePrice(url, platform) {
  // Call the scraper Lambda
  const response = await fetch('YOUR_SCRAPER_API_URL', {
    method: 'POST',
    body: JSON.stringify({ url, platform })
  });
  
  return await response.json();
}

async function storePriceHistory(productId, platform, priceData) {
  await docClient.send(new PutCommand({
    TableName: 'RetailMind-PriceHistory',
    Item: {
      id: crypto.randomUUID(),
      productId,
      platform,
      price: priceData.price,
      inStock: priceData.inStock,
      timestamp: Date.now(),
      source: 'scraped'
    }
  }));
}
```

#### Step 9: Add Price History Endpoint (1 hour)

Update `backend/functions/products/index.mjs` to add:
```javascript
// GET /products/{id}/prices
if (path.includes('/prices')) {
  const productId = pathParameters.id;
  const prices = await getPriceHistory(productId);
  return { statusCode: 200, body: prices };
}

async function getPriceHistory(productId) {
  const result = await docClient.send(new QueryCommand({
    TableName: 'RetailMind-PriceHistory',
    KeyConditionExpression: 'productId = :pid',
    ExpressionAttributeValues: { ':pid': productId },
    Limit: 50,
    ScanIndexForward: false
  }));
  
  return result.Items;
}
```

#### Step 10: Update Frontend (1 hour)

**File:** `src/pages/ProductDetailPage.tsx`

Show:
- Product details
- Your price vs competitor prices
- Price history chart
- Last updated time

---

### Afternoon (4 hours): Polish + Testing

#### Step 11: Add Scheduled Monitoring (1 hour)

**EventBridge Rule:**
```bash
# AWS Console → EventBridge → Rules
# Create rule:
# - Name: price-monitoring-schedule
# - Schedule: rate(6 hours)
# - Target: priceMonitor Lambda
```

#### Step 12: Price Comparison Logic (1 hour)

**File:** `backend/functions/priceComparison/index.mjs`

```javascript
export const handler = async (event) => {
  const products = await getAllProducts();
  
  for (const product of products) {
    const latestPrices = await getLatestCompetitorPrices(product.id);
    
    // Find lowest competitor price
    const lowestCompetitor = Math.min(...latestPrices.map(p => p.price));
    
    // If your price is higher, generate alert
    if (product.currentPrice > lowestCompetitor * 1.05) {
      await generateAlert({
        productId: product.id,
        type: 'price_drop',
        severity: 'warning',
        message: `Competitor price is ₹${lowestCompetitor}, you're at ₹${product.currentPrice}`
      });
    }
  }
};
```

#### Step 13: Test Everything (1 hour)

1. Add a real product (iPhone, laptop, etc.)
2. Enter real Amazon.in and Flipkart URLs
3. Manually trigger price monitoring
4. Verify prices are scraped correctly
5. Check price history is stored
6. Verify alerts are generated

#### Step 14: Handle Errors (1 hour)

Add error handling for:
- Invalid URLs
- Scraping failures (site structure changed)
- Network timeouts
- Rate limiting

---

## Testing Checklist

- [ ] Can add product with competitor URLs
- [ ] Scraper works for Amazon.in
- [ ] Scraper works for Flipkart
- [ ] Prices are stored in DynamoDB
- [ ] Price history displays in UI
- [ ] Alerts are generated when needed
- [ ] Scheduled monitoring works
- [ ] Error handling works

---

## Demo Products (Use Real URLs)

### Product 1: Apple iPhone 15 Pro
- Amazon.in: https://www.amazon.in/dp/B0CHX1W1XY
- Flipkart: https://www.flipkart.com/apple-iphone-15-pro-256-gb/p/itm6d2f4d24c0c3a

### Product 2: Sony WH-1000XM5
- Amazon.in: https://www.amazon.in/dp/B0BZZ8JYN5
- Flipkart: https://www.flipkart.com/sony-wh-1000xm5/p/itm3c4d8f8f8c8c8

### Product 3: Samsung Galaxy S24
- Amazon.in: https://www.amazon.in/dp/B0CMDRCZ4Z
- Flipkart: https://www.flipkart.com/samsung-galaxy-s24/p/itm1234567890

---

## Fallback Plan (If Scraping Fails)

### Option 1: Manual Price Entry
Add a "Update Competitor Price" button where users can manually enter prices.

### Option 2: Hybrid Approach
- Show 2-3 products with real scraped prices
- Use synthetic data for others
- Label clearly: "Live Price" vs "Demo Data"

### Option 3: API Approach
If you have time, apply for Amazon Product Advertising API:
- https://affiliate-program.amazon.in/
- Takes 1-2 days for approval
- More reliable than scraping

---

## Important Notes

### Scraping Challenges
1. **Anti-bot protection**: Amazon/Flipkart may block requests
   - Solution: Add delays, rotate user agents
   
2. **HTML structure changes**: Selectors may break
   - Solution: Have multiple fallback selectors
   
3. **Rate limiting**: Too many requests = IP ban
   - Solution: Limit to 1 request per 5 seconds

### Legal Considerations
- Only scrape publicly available data
- Don't overload servers
- Add disclaimer in your app
- Use data for comparison only

---

## Cost Estimate

### For 100 products, checking 4 times/day:
- Lambda invocations: 800/day
- Lambda duration: ~5 seconds each
- Cost: ~$0.10/day = $3/month

### Very affordable! ✅

---

## Success Criteria

By end of Day 2, you should have:
1. ✅ Product addition form working
2. ✅ Real price scraping from Amazon.in
3. ✅ Real price scraping from Flipkart
4. ✅ Price history stored in DynamoDB
5. ✅ Price comparison working
6. ✅ Alerts generated automatically
7. ✅ UI showing real competitor prices

---

## Next: Start with Step 1!

Want me to create the AddProductPage.tsx file now?
