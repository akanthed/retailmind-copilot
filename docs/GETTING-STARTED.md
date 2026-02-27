# RetailMind AI - Getting Started

## Quick Start (5 minutes)

### 1. Check Configuration
```powershell
./check-config.ps1
```

### 2. Start Development Server
```bash
npm run dev
```

### 3. Add Your First Product
1. Go to `http://localhost:5173/products/add`
2. Fill in product details
3. Add competitor URLs manually:
   - Amazon: `https://www.amazon.in/dp/PRODUCT_ID`
   - Flipkart: `https://www.flipkart.com/product/p/PRODUCT_ID`
4. Click "Create Product"

---

## Project Structure

```
retailmind-ai/
├── src/                    # Frontend (React + TypeScript)
│   ├── pages/             # All pages
│   ├── components/        # Reusable components
│   └── api/              # API client
├── backend/               # Backend (AWS Lambda)
│   └── functions/        # Lambda functions
├── docs/                  # Documentation
└── *.ps1                 # Utility scripts
```

---

## Available Scripts

### Development
- `npm run dev` - Start dev server
- `npm run build` - Build for production

### Configuration
- `./check-config.ps1` - Validate configuration
- `./setup-aws-cli.ps1` - Setup AWS CLI

### Testing
- `./test-api-quick.ps1` - Quick API test

### Deployment
- `./backend/deploy-*.ps1` - Deploy Lambda functions

---

## Key Features

### ✅ Implemented (Day 1)
- Product management (add, view)
- Manual competitor URL entry
- Price scraping (Amazon, Flipkart, Snapdeal)
- Product search (with fallback to manual entry)

### 🔄 Next (Day 2)
- Automated price monitoring
- Price history charts
- Price comparison alerts
- Product detail pages

---

## Important Notes

### Product Search
The automatic product search may return 0 results due to anti-bot protection from e-commerce sites. This is normal.

**Solution:** Use manual URL entry
- Find product on Amazon.in or Flipkart
- Copy the URL
- Paste into "Competitor URLs" section
- Works perfectly!

### API Configuration
Make sure `.env.local` has your API Gateway URL:
```
VITE_API_URL=https://YOUR_API_URL.execute-api.us-east-1.amazonaws.com/dev
```

---

## Troubleshooting

### Issue: "API URL not configured"
**Fix:** Run `./check-config.ps1` and follow instructions

### Issue: "Search returns 0 results"
**Fix:** Use manual URL entry (see docs/SEARCH-ISSUE-RESOLVED.md)

### Issue: "CORS error"
**Fix:** Enable CORS in API Gateway and redeploy

---

## Documentation

Detailed guides in `docs/` folder:
- `7-DAY-IMPLEMENTATION-ROADMAP.md` - Full development plan
- `IMPLEMENTATION-STATUS.md` - Current progress
- `SEARCH-ISSUE-RESOLVED.md` - Search troubleshooting
- `DEBUGGING-GUIDE.md` - How to debug issues

---

## Next Steps

1. ✅ Add a product with manual URLs
2. ✅ Verify it saves to DynamoDB
3. ✅ Test price scraping
4. 🔄 Move to Day 2 (automated monitoring)

---

## Support

For issues or questions:
1. Check `docs/DEBUGGING-GUIDE.md`
2. Run `./check-config.ps1`
3. Check browser console (F12)

---

**Ready to build?** Start with `npm run dev` 🚀
