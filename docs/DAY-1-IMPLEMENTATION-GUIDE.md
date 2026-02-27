# Day 1: Product Management & Price Scraping - Implementation Guide

## ✅ What We've Built

### Frontend
1. **AddProductPage.tsx** - Complete product addition form
   - Product details (name, SKU, category, description)
   - Pricing & inventory (selling price, cost, stock)
   - Competitor search functionality
   - Manual URL entry for Amazon.in, Flipkart, Snapdeal
   - Form validation and error handling

2. **Updated InsightsPage.tsx** - Added "Add Product" button

3. **Updated API Client** - New methods:
   - `createProduct()` - Create new product
   - `updateProduct()` - Update existing product
   - `deleteProduct()` - Delete product
   - `searchCompetitorProducts()` - Search for matching products
   - `scrapePrice()` - Scrape price from URL

### Backend
1. **priceScraper Lambda** - Real price scraping
   - Scrapes Amazon.in prices
   - Scrapes Flipkart prices
   - Scrapes Snapdeal prices
   - Extracts: price, stock status, product name, image

2. **productSearch Lambda** - Competitor product search
   - Searches Amazon.in for matching products
   - Searches Flipkart for matching products
   - Returns top 10 matches with confidence scores
   - Extracts product URLs for monitoring

---

## 🚀 Deployment Steps

### Step 1: Create Lambda Functions in AWS Console

#### 1.1 Create Price Scraper Lambda
```
Function name: retailmind-price-scraper
Runtime: Node.js 20.x
Architecture: x86_64
Timeout: 60 seconds
Memory: 512 MB
```

**Permissions:** Attach `AWSLambdaBasicExecutionRole`

#### 1.2 Create Product Search Lambda
```
Function name: retailmind-product-search
Runtime: Node.js 20.x
Architecture: x86_64
Timeout: 60 seconds
Memory: 512 MB
```

**Permissions:** Attach `AWSLambdaBasicExecutionRole`

### Step 2: Deploy Lambda Code

```powershell
# Deploy Price Scraper
cd backend
./deploy-price-scraper-windows.ps1

# Deploy Product Search
./deploy-product-search-windows.ps1
```

### Step 3: Configure API Gateway

#### 3.1 Add Price Scraper Endpoint
1. Go to API Gateway → RetailMind-API
2. Create resource: `/scraper`
3. Create child resource: `/price`
4. Add POST method to `/scraper/price`
5. Integration type: Lambda Function
6. Lambda: `retailmind-price-scraper`
7. Enable CORS
8. Deploy to `dev` stage

#### 3.2 Add Product Search Endpoint
1. Go to `/products` resource
2. Create child resource: `search-competitors`
3. Add POST method
4. Integration: `retailmind-product-search`
5. Enable CORS
6. Deploy to `dev` stage

### Step 4: Update Products Lambda

The existing products Lambda needs to support:
- POST /products (create)
- PUT /products/{id} (update)
- DELETE /products/{id} (delete)

It already has GET endpoints working.

---

## 🧪 Testing

### Test 1: Add Product via UI
1. Run frontend: `npm run dev`
2. Navigate to `/products/add`
3. Fill in product details
4. Add competitor URLs
5. Click "Create Product"
6. Verify product appears in Insights page

### Test 2: Search Competitors
1. In Add Product page
2. Enter product name: "iPhone 15 Pro"
3. Click "Search" button
4. Verify results from Amazon.in and Flipkart appear
5. Click "Select" to add URL

### Test 3: Price Scraping
```bash
# Test Amazon scraping
curl -X POST https://YOUR_API_URL/dev/scraper/price \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://www.amazon.in/dp/B0CHX1W1XY",
    "platform": "amazon"
  }'

# Test Flipkart scraping
curl -X POST https://YOUR_API_URL/dev/scraper/price \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://www.flipkart.com/apple-iphone-15-pro/p/itm123",
    "platform": "flipkart"
  }'
```

---

## 📋 Next Steps (Day 2)

Tomorrow we'll build:
1. **Automated Price Monitoring** - Scheduled Lambda to check prices
2. **Price History Display** - Show price trends over time
3. **Price Comparison Logic** - Compare your price vs competitors
4. **Alert Generation** - Auto-generate alerts when prices change
5. **Product Detail Page** - View individual product with price history

---

## 🐛 Troubleshooting

### Issue: Scraping returns 403 Forbidden
**Solution:** This is anti-bot protection. Options:
1. Add more realistic headers
2. Use proxy service (BrightData, Oxylabs)
3. Add delays between requests
4. For demo: Use manual URL entry

### Issue: Can't find price on page
**Solution:** Website HTML changed. Update selectors in scraper code.

### Issue: CORS errors
**Solution:** Enable CORS on all API Gateway endpoints and deploy.

---

## 💰 Cost Estimate

### Current Setup
- 2 new Lambda functions
- ~100 invocations/day for testing
- Cost: ~$0.05/day

### Production (1000 products, 4 checks/day)
- 4000 Lambda invocations/day
- ~10 seconds per scrape
- Cost: ~$3/month

Very affordable! ✅
