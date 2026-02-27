# Price Monitoring Implementation Plan - India First

## Problem Statement
Users need to:
1. Add their products easily
2. Map their products to competitor products on Indian e-commerce sites
3. Get real-time competitor prices from Indian marketplaces
4. Receive alerts when prices change

## Target Indian E-commerce Platforms
1. **Amazon.in** (Primary)
2. **Flipkart.com** (Primary)
3. **Snapdeal.com**
4. **Croma.com** (Electronics)
5. **Reliance Digital** (Electronics)
6. **Tata Cliq**

---

## Implementation Approach

### Phase 1: Product Addition (Week 1)

#### 1.1 Create Product Form UI
**File:** `src/pages/AddProductPage.tsx`

**Features:**
- Product name input
- SKU/Model number
- Category dropdown (Electronics, Fashion, Home, etc.)
- Current selling price (₹)
- Cost price (₹)
- Current stock quantity
- Product image upload (optional)
- Search competitors button

**User Flow:**
```
1. User clicks "Add Product" button
2. Fills in product details
3. Clicks "Find on Competitors"
4. System searches Amazon.in, Flipkart for matching products
5. User selects which competitor products to track
6. System starts monitoring
```

#### 1.2 Product Search API
**File:** `backend/functions/productSearch/index.mjs`

**How it works:**
```javascript
// User enters: "Apple iPhone 15 Pro 256GB"
// System searches:
// - Amazon.in API (if available) or web scraping
// - Flipkart API (if available) or web scraping
// Returns: List of matching products with prices
```

**Response:**
```json
{
  "matches": [
    {
      "platform": "Amazon.in",
      "productName": "Apple iPhone 15 Pro (256 GB) - Natural Titanium",
      "url": "https://amazon.in/...",
      "price": 134900,
      "inStock": true,
      "image": "https://...",
      "confidence": 0.95
    },
    {
      "platform": "Flipkart",
      "productName": "Apple iPhone 15 Pro 256GB Natural Titanium",
      "url": "https://flipkart.com/...",
      "price": 133999,
      "inStock": true,
      "image": "https://...",
      "confidence": 0.92
    }
  ]
}
```

---

### Phase 2: Real Price Scraping (Week 2)

#### 2.1 Web Scraping Approach (Recommended for Hackathon)

**Why Scraping?**
- Most Indian e-commerce sites don't have public APIs
- Amazon Product Advertising API requires approval
- Flipkart Affiliate API has limitations
- Scraping is faster to implement

**Technology Stack:**
- **Puppeteer** or **Playwright** (headless browser)
- **Cheerio** (HTML parsing)
- **AWS Lambda** (serverless scraping)
- **Proxy rotation** (avoid IP blocking)

**File:** `backend/functions/priceScraper/index.mjs`

```javascript
// Pseudo-code
async function scrapeAmazonPrice(productUrl) {
  // 1. Launch headless browser
  // 2. Navigate to product page
  // 3. Extract price from HTML
  // 4. Extract stock status
  // 5. Return data
}

async function scrapeFlipkartPrice(productUrl) {
  // Similar logic for Flipkart
}
```

#### 2.2 Scraping Challenges & Solutions

**Challenge 1: Anti-bot detection**
- Solution: Use residential proxies (BrightData, Oxylabs)
- Solution: Rotate user agents
- Solution: Add random delays

**Challenge 2: Dynamic content (JavaScript-rendered)**
- Solution: Use Puppeteer (full browser)
- Solution: Wait for elements to load

**Challenge 3: Rate limiting**
- Solution: Implement queue system (AWS SQS)
- Solution: Scrape max 1 product per 5 seconds
- Solution: Distribute across multiple Lambda functions

**Challenge 4: HTML structure changes**
- Solution: Use multiple CSS selectors as fallbacks
- Solution: Implement error handling
- Solution: Send alerts when scraping fails

#### 2.3 Legal & Ethical Considerations

**Important:**
- Check robots.txt of each site
- Respect rate limits
- Don't overload servers
- Use data only for price comparison (fair use)
- Add disclaimer: "Prices are indicative and may vary"

---

### Phase 3: Alternative Approach - Affiliate APIs (Cleaner but Limited)

#### 3.1 Amazon Product Advertising API
**Pros:**
- Official API
- Legal and reliable
- Structured data

**Cons:**
- Requires approval (can take days)
- Need to be Amazon Associate
- Limited requests per day
- Only works for Amazon.in

**Setup:**
```javascript
import { ProductAdvertisingAPIv1 } from 'paapi5-nodejs-sdk';

async function getAmazonPrice(asin) {
  // Use official API to get price
  // Returns structured product data
}
```

#### 3.2 Flipkart Affiliate API
**Pros:**
- Official API
- Good for electronics

**Cons:**
- Requires affiliate account
- Limited product coverage
- API can be slow

---

### Phase 4: Hybrid Approach (Recommended)

**Best Strategy:**
1. **Try API first** (if available and approved)
2. **Fallback to scraping** (if API fails or not available)
3. **Cache results** (reduce scraping frequency)
4. **Update prices** every 6-12 hours (not real-time)

**Architecture:**
```
User adds product
    ↓
Search for matches (scraping/API)
    ↓
User confirms matches
    ↓
Store competitor URLs in DynamoDB
    ↓
EventBridge triggers Lambda every 6 hours
    ↓
Lambda scrapes prices from stored URLs
    ↓
Store in PriceHistory table
    ↓
Compare with user's price
    ↓
Generate alerts if needed
```

---

## Implementation Steps (Prioritized)

### Step 1: Add Product Form (2 hours)
```bash
# Create form UI
src/pages/AddProductPage.tsx
src/components/ProductForm.tsx

# Features:
- Input fields for product details
- Image upload
- Save to DynamoDB
```

### Step 2: Manual Competitor Mapping (1 hour)
```bash
# Simple approach for MVP
# User manually enters competitor URLs

# UI:
- "Add Competitor URL" button
- Input field for Amazon.in URL
- Input field for Flipkart URL
- Save URLs to product record
```

### Step 3: Basic Price Scraper (4 hours)
```bash
# Create Lambda function with Puppeteer
backend/functions/priceScraper/index.mjs

# Install dependencies:
npm install puppeteer-core @sparticuz/chromium

# Scrape logic:
- Take URL as input
- Extract price
- Extract stock status
- Return data
```

### Step 4: Scheduled Monitoring (1 hour)
```bash
# EventBridge rule
# Trigger every 6 hours
# Call priceScraper for all products
# Store results in PriceHistory table
```

### Step 5: Price Comparison & Alerts (2 hours)
```bash
# After scraping, compare prices
# If competitor price < user price - threshold:
#   Generate alert
#   Send notification
```

---

## Simplified MVP for Hackathon (8 hours total)

### Option A: Manual URL Entry (Fastest)
1. User adds product details
2. User manually enters competitor URLs
3. System scrapes those URLs every 6 hours
4. Shows price comparison
5. Generates alerts

**Pros:** Fast to build, reliable
**Cons:** Manual work for users

### Option B: Smart Search (Better UX)
1. User adds product name + model
2. System searches Amazon.in/Flipkart
3. Shows matching products
4. User selects which to track
5. System monitors automatically

**Pros:** Better user experience
**Cons:** More complex, scraping challenges

---

## Code Structure

```
backend/functions/
├── products/              (existing - add POST endpoint)
├── productSearch/         (NEW - search competitors)
├── priceScraper/         (NEW - scrape prices)
├── priceMonitor/         (UPDATE - use real scraping)
└── priceComparison/      (NEW - compare & alert)

src/pages/
├── AddProductPage.tsx    (NEW - product form)
├── ProductDetailPage.tsx (NEW - show price history)
└── InsightsPage.tsx      (UPDATE - show real data)
```

---

## Database Schema Updates

### Products Table (existing)
```javascript
{
  id: "prod-123",
  name: "Apple iPhone 15 Pro 256GB",
  sku: "IPHONE15PRO256",
  currentPrice: 134900,
  costPrice: 120000,
  stock: 10,
  competitorMappings: [
    {
      platform: "Amazon.in",
      url: "https://amazon.in/...",
      productId: "B0CHX1W1XY",
      lastPrice: 134900,
      lastChecked: 1234567890
    },
    {
      platform: "Flipkart",
      url: "https://flipkart.com/...",
      productId: "MOBGTAGPAQNVFZZY",
      lastPrice: 133999,
      lastChecked: 1234567890
    }
  ]
}
```

### PriceHistory Table (existing)
```javascript
{
  id: "price-123",
  productId: "prod-123",
  platform: "Amazon.in",
  price: 134900,
  inStock: true,
  timestamp: 1234567890,
  source: "scraped",  // or "api"
  scrapingStatus: "success"  // or "failed"
}
```

---

## Cost Estimation (AWS)

### Scraping Costs
- Lambda invocations: 1000 products × 4 times/day = 4000 invocations/day
- Lambda duration: ~10 seconds per scrape
- Lambda cost: ~$0.20/day = $6/month

### Storage Costs
- DynamoDB: ~$1/month for 10,000 price points
- S3 (images): ~$0.50/month

**Total: ~$7.50/month for 1000 products**

---

## Legal Disclaimer (Important!)

Add to your app:
```
"Competitor prices are collected from publicly available sources 
for informational purposes only. Prices may vary and should be 
verified on the respective platforms. This tool is intended for 
price comparison and market research only."
```

---

## Next Steps

### Immediate (Today):
1. Create AddProductPage.tsx
2. Add POST endpoint to products Lambda
3. Test product creation flow

### Tomorrow:
1. Implement basic price scraper
2. Test with 2-3 real Amazon.in URLs
3. Store results in PriceHistory

### Day After:
1. Add scheduled monitoring
2. Implement price comparison logic
3. Generate alerts

---

## Questions to Answer

1. **Do you want manual URL entry or automatic search?**
   - Manual = faster (2 hours)
   - Automatic = better UX (6 hours)

2. **Which platforms to support first?**
   - Recommend: Amazon.in + Flipkart (covers 80% of Indian e-commerce)

3. **How often to check prices?**
   - Recommend: Every 6 hours (4 times/day)
   - More frequent = higher costs

4. **Do you have proxy service budget?**
   - Free: Use Lambda's IP (risk of blocking)
   - Paid: Use BrightData/Oxylabs ($50-100/month)

---

## Demo Strategy for Hackathon

**Option 1: Hybrid Demo**
- Show 2-3 products with REAL scraped prices
- Show rest with synthetic data
- Clearly label which is real vs demo data

**Option 2: Video Proof**
- Record video of scraping working
- Show in demo even if live scraping fails
- Judges see it works

**Option 3: Manual Demo**
- During demo, manually trigger scraping
- Show live price fetch from Amazon.in
- More impressive but risky

---

## Recommendation

**For hackathon (next 2 days):**
1. Build manual URL entry (fast)
2. Implement scraper for Amazon.in only
3. Show 3-5 real products being monitored
4. Use synthetic data for rest
5. Focus on UX and AI features

**For production (after hackathon):**
1. Add automatic product search
2. Support multiple platforms
3. Implement proxy rotation
4. Add error handling
5. Scale to 1000+ products
