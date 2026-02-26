# RetailMind AI 🛍️

AI-powered price monitoring and market intelligence for Indian retailers.

**Real-time competitor tracking • Smart recommendations • Automated alerts**

---

## Features

- 🤖 **AI Copilot** - Ask business questions in natural language (Amazon Bedrock)
- 📊 **Real Price Monitoring** - Scrape actual prices from Amazon.in, Flipkart, Snapdeal
- 💡 **Smart Recommendations** - AI-powered pricing and inventory suggestions
- 🔔 **Proactive Alerts** - Get notified of price drops and opportunities
- 📈 **Analytics Dashboard** - Track revenue impact and performance
- 🔍 **Web Search & Scrape** - Find and monitor competitor products automatically

---

## 🚀 NEW: Real Data Monitoring

RetailMind now supports genuine price monitoring with real competitor URLs!

### Quick Start (5 Minutes)

```powershell
# Run the setup wizard
.\START-REAL-MONITORING.ps1
```

This will:
1. Deploy enhanced scraping functions
2. Help you add products with real URLs
3. Test price scraping
4. Start monitoring competitor prices

### Features

- ✅ **Real Scraping:** Actual prices from Amazon.in, Flipkart, Snapdeal
- ✅ **Complete Data:** Price, stock, ratings, reviews, images
- ✅ **Search Mode:** Find products by name automatically
- ✅ **Smart Fallback:** Uses synthetic data if URLs not provided
- ✅ **Production Ready:** Error handling, retry logic, logging

### Documentation

| Document | Purpose |
|----------|---------|
| [Get Started Guide](GET-STARTED-WITH-REAL-DATA.md) | **START HERE** - Master guide |
| [Implementation Summary](IMPLEMENTATION-SUMMARY.md) | Overview & quick start |
| [Setup Guide](REAL-PRICE-MONITORING-SETUP.md) | Detailed setup instructions |
| [Finding URLs](HOW-TO-FIND-PRODUCT-URLS.md) | How to get competitor URLs |
| [Visual Flow](VISUAL-FLOW-DIAGRAM.md) | Architecture diagrams |
| [Verification](VERIFICATION-CHECKLIST.md) | Testing checklist |

### Example: Add Product with Real URLs

```powershell
# Interactive script
.\scripts\add-real-product.ps1

# Or via API
$product = @{
    name = "iPhone 15 Pro Max 256GB"
    currentPrice = 159900
    competitorUrls = @{
        amazon = "https://www.amazon.in/dp/B0CHX1W1XY"
        flipkart = "https://www.flipkart.com/iphone-15-pro-max/p/itm123"
    }
} | ConvertTo-Json

Invoke-RestMethod -Uri "$env:VITE_API_URL/products" -Method Post -Body $product -ContentType "application/json"
```

---

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure API
```bash
# Create .env.local
echo "VITE_API_URL=https://YOUR_API_URL.execute-api.us-east-1.amazonaws.com/dev" > .env.local
```

### 3. Start Development
```bash
npm run dev
```

Visit `http://localhost:5173`

---

## Project Structure

```
├── src/                 # Frontend (React + TypeScript)
│   ├── pages/          # Application pages
│   ├── components/     # Reusable components
│   └── api/           # API client
├── backend/            # AWS Lambda functions
│   └── functions/     # Individual Lambda functions
└── docs/              # Documentation
```

---

## Tech Stack

**Frontend:**
- React + TypeScript
- TailwindCSS
- Tanstack Query
- Recharts

**Backend:**
- AWS Lambda (Node.js 20)
- Amazon Bedrock (Nova Pro)
- DynamoDB
- API Gateway

**Scraping:**
- Cheerio (HTML parsing)
- Fetch API

---

## Documentation

- [Getting Started](GETTING-STARTED.md) - Setup and first steps
- [7-Day Roadmap](docs/7-DAY-IMPLEMENTATION-ROADMAP.md) - Development plan
- [Implementation Status](docs/IMPLEMENTATION-STATUS.md) - Current progress
- [Debugging Guide](docs/DEBUGGING-GUIDE.md) - Troubleshooting

---

## Development

### Available Scripts

```bash
npm run dev          # Start dev server
npm run build        # Build for production
npm run preview      # Preview production build
```

### Utility Scripts

```powershell
./check-config.ps1        # Validate configuration
./test-api-quick.ps1      # Test API endpoints
./setup-aws-cli.ps1       # Setup AWS CLI
```

---

## Deployment

### Deploy Lambda Functions

```powershell
cd backend

# Deploy individual functions
./deploy-products-windows.ps1
./deploy-price-scraper-windows.ps1
./deploy-recommendations-windows.ps1
./deploy-alerts-windows.ps1
```

### Deploy Frontend

```bash
npm run build
# Deploy dist/ folder to Vercel, Netlify, or S3+CloudFront
```

---

## Current Status

**Day 1 Complete** ✅
- Product management
- Price scraping (3 platforms)
- Competitor search
- Manual URL entry

**Day 2 In Progress** 🔄
- Automated monitoring
- Price history
- Comparison alerts

---

## Contributing

This is a production project. See [docs/7-DAY-IMPLEMENTATION-ROADMAP.md](docs/7-DAY-IMPLEMENTATION-ROADMAP.md) for development plan.

---

## License

MIT License - See [LICENSE](LICENSE) file

---

## Support

For issues:
1. Check [GETTING-STARTED.md](GETTING-STARTED.md)
2. Run `./check-config.ps1`
3. See [docs/DEBUGGING-GUIDE.md](docs/DEBUGGING-GUIDE.md)

---

**Built with ❤️ for Indian retailers**
