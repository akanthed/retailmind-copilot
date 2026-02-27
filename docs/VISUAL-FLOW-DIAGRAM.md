# RetailMind AI - Real Data Flow Diagram

## Complete System Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         USER INTERFACE                               │
│                     (React + TypeScript)                             │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             │ HTTPS
                             ↓
┌─────────────────────────────────────────────────────────────────────┐
│                      AWS API GATEWAY                                 │
│                    (REST API Endpoints)                              │
└─────┬──────────┬──────────┬──────────┬──────────┬──────────┬────────┘
      │          │          │          │          │          │
      ↓          ↓          ↓          ↓          ↓          ↓
┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐
│ Products │ │  Price   │ │  Price   │ │Recommend │ │  Alerts  │ │ Copilot  │
│ Lambda   │ │ Scraper  │ │ Monitor  │ │ Lambda   │ │  Lambda  │ │  Lambda  │
└────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘
     │            │            │            │            │            │
     │            │            │            │            │            │
     └────────────┴────────────┴────────────┴────────────┴────────────┘
                                    │
                                    ↓
                    ┌───────────────────────────────┐
                    │       DynamoDB Tables         │
                    ├───────────────────────────────┤
                    │  • RetailMind-Products        │
                    │  • RetailMind-PriceHistory    │
                    │  • RetailMind-Recommendations │
                    │  • RetailMind-Alerts          │
                    └───────────────────────────────┘
```

## Real Price Monitoring Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                    STEP 1: CREATE PRODUCT                            │
└─────────────────────────────────────────────────────────────────────┘

User creates product with competitor URLs:
{
  "name": "iPhone 15 Pro Max",
  "currentPrice": 159900,
  "competitorUrls": {
    "amazon": "https://www.amazon.in/dp/B0CHX1W1XY",
    "flipkart": "https://www.flipkart.com/iphone-15-pro-max/p/itm123"
  }
}
                    ↓
        Stored in DynamoDB Products table

┌─────────────────────────────────────────────────────────────────────┐
│              STEP 2: SCHEDULED MONITORING (Every 6 hours)            │
└─────────────────────────────────────────────────────────────────────┘

EventBridge Rule triggers PriceMonitor Lambda
                    ↓
        PriceMonitor fetches all products
                    ↓
        For each product with competitorUrls:

┌──────────────────────────────────────────────────────────────────────┐
│                    STEP 3: SCRAPE AMAZON                              │
└──────────────────────────────────────────────────────────────────────┘

PriceMonitor → PriceScraper
                    ↓
        Fetch HTML from Amazon.in
                    ↓
        Parse with Cheerio
                    ↓
        Extract:
        • Price: ₹119,999
        • Stock: In Stock
        • Rating: 4.5 stars
        • Reviews: 3,847
                    ↓
        Store in PriceHistory table

┌──────────────────────────────────────────────────────────────────────┐
│                    STEP 4: SCRAPE FLIPKART                            │
└──────────────────────────────────────────────────────────────────────┘

PriceMonitor → PriceScraper
                    ↓
        Fetch HTML from Flipkart
                    ↓
        Parse with Cheerio
                    ↓
        Extract:
        • Price: ₹124,999
        • Stock: In Stock
        • Rating: 4.6 stars
        • Reviews: 2,156
                    ↓
        Store in PriceHistory table

┌──────────────────────────────────────────────────────────────────────┐
│                    STEP 5: GENERATE INSIGHTS                          │
└──────────────────────────────────────────────────────────────────────┘

Recommendations Lambda analyzes price history
                    ↓
        Compares your price vs competitors
                    ↓
        Generates recommendations:
        • "Lower price to ₹119,999 to match Amazon"
        • "Increase stock - competitors running low"
                    ↓
        Store in Recommendations table

┌──────────────────────────────────────────────────────────────────────┐
│                    STEP 6: TRIGGER ALERTS                             │
└──────────────────────────────────────────────────────────────────────┘

Alerts Lambda checks for significant changes
                    ↓
        Detects:
        • Amazon dropped price by 10%
        • Flipkart out of stock
                    ↓
        Creates alerts:
        • "CRITICAL: Competitor price drop"
        • "OPPORTUNITY: Competitor out of stock"
                    ↓
        Store in Alerts table

┌──────────────────────────────────────────────────────────────────────┐
│                    STEP 7: DISPLAY IN DASHBOARD                       │
└──────────────────────────────────────────────────────────────────────┘

User opens dashboard
                    ↓
        Frontend fetches data from API
                    ↓
        Displays:
        • Real-time competitor prices
        • Price history charts
        • Recommendations
        • Alerts
                    ↓
        User makes informed decisions
```

## Price Scraper Detailed Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                    PRICE SCRAPER FUNCTION                            │
└─────────────────────────────────────────────────────────────────────┘

Input: { url: "https://amazon.in/dp/XXX", platform: "amazon" }
                    ↓
┌───────────────────────────────────────────────────────────────────────┐
│                    1. FETCH HTML                                      │
└───────────────────────────────────────────────────────────────────────┘
        • Send HTTP request with proper headers
        • User-Agent: Chrome browser
        • Accept: HTML content
        • Retry on failure (3 attempts)
        • Exponential backoff
                    ↓
┌───────────────────────────────────────────────────────────────────────┐
│                    2. PARSE HTML                                      │
└───────────────────────────────────────────────────────────────────────┘
        • Load HTML into Cheerio
        • Cheerio = jQuery for Node.js
        • Fast DOM parsing
                    ↓
┌───────────────────────────────────────────────────────────────────────┐
│                    3. EXTRACT PRICE                                   │
└───────────────────────────────────────────────────────────────────────┘
        Try multiple selectors:
        • $('.a-price-whole')           → "119,999"
        • $('.a-price .a-offscreen')    → "₹119,999"
        • $('#priceblock_dealprice')    → "119999"
        • $('#priceblock_ourprice')     → "119999"
        
        Clean and parse:
        • Remove ₹, commas
        • Convert to number: 119999
                    ↓
┌───────────────────────────────────────────────────────────────────────┐
│                    4. EXTRACT STOCK STATUS                            │
└───────────────────────────────────────────────────────────────────────┘
        • Find availability text
        • Check for "out of stock"
        • Check for "currently unavailable"
        • Result: true/false
                    ↓
┌───────────────────────────────────────────────────────────────────────┐
│                    5. EXTRACT RATING & REVIEWS                        │
└───────────────────────────────────────────────────────────────────────┘
        • Rating: $('.a-icon-star .a-icon-alt') → "4.5 out of 5"
        • Reviews: $('#acrCustomerReviewText') → "3,847 ratings"
        • Parse numbers
                    ↓
┌───────────────────────────────────────────────────────────────────────┐
│                    6. RETURN RESULT                                   │
└───────────────────────────────────────────────────────────────────────┘
{
  "platform": "Amazon.in",
  "productName": "Apple iPhone 15 Pro Max",
  "price": 119999,
  "currency": "INR",
  "inStock": true,
  "rating": 4.5,
  "reviewsCount": 3847,
  "image": "https://m.media-amazon.com/images/...",
  "url": "https://www.amazon.in/dp/B0CHX1W1XY",
  "timestamp": 1709049600000,
  "source": "scraped"
}
```

## Search and Scrape Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                    SEARCH MODE                                       │
└─────────────────────────────────────────────────────────────────────┘

Input: { productName: "iPhone 15 Pro Max", platform: "amazon" }
                    ↓
┌───────────────────────────────────────────────────────────────────────┐
│                    1. BUILD SEARCH URL                                │
└───────────────────────────────────────────────────────────────────────┘
        Amazon: https://www.amazon.in/s?k=iPhone+15+Pro+Max
        Flipkart: https://www.flipkart.com/search?q=iPhone+15+Pro+Max
                    ↓
┌───────────────────────────────────────────────────────────────────────┐
│                    2. FETCH SEARCH RESULTS                            │
└───────────────────────────────────────────────────────────────────────┘
        • Send request to search page
        • Parse HTML
                    ↓
┌───────────────────────────────────────────────────────────────────────┐
│                    3. EXTRACT FIRST PRODUCT URL                       │
└───────────────────────────────────────────────────────────────────────┘
        Amazon: Find first [data-component-type="s-search-result"]
                Extract href from h2 a
                Result: /dp/B0CHX1W1XY
        
        Build full URL: https://www.amazon.in/dp/B0CHX1W1XY
                    ↓
┌───────────────────────────────────────────────────────────────────────┐
│                    4. SCRAPE PRODUCT PAGE                             │
└───────────────────────────────────────────────────────────────────────┘
        • Use direct URL scraping flow
        • Extract all product details
        • Return complete data
```

## Data Storage Structure

```
┌─────────────────────────────────────────────────────────────────────┐
│                    DynamoDB: Products Table                          │
└─────────────────────────────────────────────────────────────────────┘

{
  "id": "prod-abc123",                    ← Primary Key
  "name": "iPhone 15 Pro Max 256GB",
  "sku": "APPLE-15PM-256",
  "category": "Smartphones",
  "currentPrice": 159900,
  "costPrice": 125000,
  "stock": 30,
  "stockDays": 45,
  "description": "Latest iPhone",
  "competitorUrls": {                     ← NEW: Real URLs
    "amazon": "https://www.amazon.in/dp/B0CHX1W1XY",
    "flipkart": "https://www.flipkart.com/iphone-15/p/itm123"
  },
  "createdAt": 1709049600000,
  "updatedAt": 1709049600000
}

┌─────────────────────────────────────────────────────────────────────┐
│                    DynamoDB: PriceHistory Table                      │
└─────────────────────────────────────────────────────────────────────┘

{
  "id": "price-xyz789",                   ← Primary Key
  "productId": "prod-abc123",             ← GSI Partition Key
  "productName": "iPhone 15 Pro Max 256GB",
  "productSku": "APPLE-15PM-256",
  "competitorId": "comp-amazon",
  "competitorName": "Amazon.in",
  "competitorDomain": "amazon",
  "price": 119999,                        ← Scraped price
  "inStock": true,                        ← Scraped stock
  "rating": 4.5,                          ← Scraped rating
  "reviewsCount": 3847,                   ← Scraped reviews
  "timestamp": 1709049600000,             ← GSI Sort Key
  "source": "scraped",                    ← "scraped" or "synthetic"
  "url": "https://www.amazon.in/dp/B0CHX1W1XY",
  "createdAt": "2024-02-27T12:00:00.000Z"
}
```

## Error Handling Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                    ERROR SCENARIOS                                   │
└─────────────────────────────────────────────────────────────────────┘

Scenario 1: Network Error
        Fetch fails → Retry (attempt 1)
                   → Retry (attempt 2)
                   → Retry (attempt 3)
                   → Log error
                   → Continue with next product

Scenario 2: Price Not Found
        HTML parsed → Price selector fails
                   → Try alternative selector
                   → Try another alternative
                   → Throw error "Could not extract price"
                   → Log error
                   → Continue with next product

Scenario 3: Product Has No URLs
        Product fetched → competitorUrls is empty
                       → Generate synthetic data
                       → Store synthetic prices
                       → System continues working

Scenario 4: Website Blocks Request
        HTTP 403/503 → Retry with backoff
                    → Still fails
                    → Log error
                    → Continue with next product

Result: System is resilient and never breaks completely
```

## Monitoring & Observability

```
┌─────────────────────────────────────────────────────────────────────┐
│                    CloudWatch Logs                                   │
└─────────────────────────────────────────────────────────────────────┘

/aws/lambda/RetailMind-PriceScraper
    • Scraping attempts
    • Success/failure per URL
    • Extracted data
    • Error messages

/aws/lambda/RetailMind-PriceMonitor
    • Products monitored
    • Prices scraped
    • Prices failed
    • Detailed results per product

┌─────────────────────────────────────────────────────────────────────┐
│                    Metrics to Track                                  │
└─────────────────────────────────────────────────────────────────────┘

• Total products
• Products with URLs (%)
• Scraping success rate (%)
• Average scrape time (ms)
• Prices per hour
• Data freshness (hours)
• Error rate (%)
```

## Complete User Journey

```
Day 1: Setup
    → Run START-REAL-MONITORING.ps1
    → Deploy enhanced functions
    → Add 5 products with URLs
    → Test scraping
    → Verify data in dashboard

Day 2: Expand
    → Add 20 more products
    → Set up EventBridge schedule
    → Monitor CloudWatch logs
    → Adjust as needed

Day 3: Optimize
    → Review scraping success rate
    → Update URLs if needed
    → Add more competitors
    → Fine-tune monitoring frequency

Week 2: Scale
    → Add 100+ products
    → Analyze price trends
    → Implement recommendations
    → Build custom reports

Month 2: Mature
    → Automated decision making
    → Price optimization
    → Inventory management
    → Revenue growth tracking
```

---

**This is how RetailMind AI works with real data! 🚀**
