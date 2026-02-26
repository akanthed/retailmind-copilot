# RetailMind AI 🛍️

AI-powered price monitoring and market intelligence for Indian retailers.

**Real-time competitor tracking • Smart recommendations • Automated alerts**

---

## Features

- 🤖 **AI Copilot** - Ask business questions in natural language (Amazon Bedrock)
- 📊 **Price Monitoring** - Track competitor prices from Amazon.in, Flipkart, Snapdeal
- 💡 **Smart Recommendations** - AI-powered pricing and inventory suggestions
- 🔔 **Proactive Alerts** - Get notified of price drops and opportunities
- 📈 **Analytics Dashboard** - Track revenue impact and performance

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
