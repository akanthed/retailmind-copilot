# Price Comparison Lambda Function

## Overview
This Lambda function searches for product prices across Indian e-commerce platforms (Amazon.in, Flipkart, JioMart, Croma, Reliance Digital, Meesho) and compares them with your store prices.

## How It Works

### With SerpAPI Key (Real Prices)
1. User clicks "Search Prices Now" on a product
2. Lambda searches Google Shopping India via SerpAPI
3. Returns real prices from Amazon, Flipkart, and other platforms
4. Stores results in DynamoDB for history tracking

### Without SerpAPI Key (Synthetic Prices)
1. Generates realistic competitor prices based on your product price
2. Applies platform-specific price variations:
   - Amazon: -10% to +10%
   - Flipkart: -12% to +8%
   - Meesho: -20% to +5%
   - Others: -10% to +15%

## Setup

### DynamoDB Table
Create a table called `RetailMind-PriceComparison`:
- **Partition Key**: `productId` (String)
- **Sort Key**: `comparisonId` (String)

### Environment Variables
| Variable | Required | Description |
|----------|----------|-------------|
| `SERPAPI_KEY` | Optional | SerpAPI key for real price searches. Get free at https://serpapi.com |

### API Gateway Routes
```
GET  /products/{productId}/compare        → Get stored comparisons
POST /products/{productId}/compare/search → Search e-commerce for prices
POST /compare                             → Search all products
```

### Deploy
```bash
cd backend/functions/priceComparison
npm install
zip -r function.zip .
# Upload to AWS Lambda
```

## SerpAPI Setup (Free Tier)
1. Go to https://serpapi.com
2. Sign up for free (100 searches/month)
3. Copy your API key
4. Add to Lambda environment variable: `SERPAPI_KEY=your_key_here`

## Cost
- SerpAPI Free: 100 searches/month (enough for ~20 products searched 5 times)
- SerpAPI Paid: $50/month for 5,000 searches
- DynamoDB: Within free tier for hackathon usage
