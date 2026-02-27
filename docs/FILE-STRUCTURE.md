# File Structure

## Root Files

### Essential
- `README.md` - Project overview
- `GETTING-STARTED.md` - Quick start guide
- `package.json` - Dependencies
- `.env.local` - Configuration (create this)
- `.gitignore` - Git ignore rules

### Utility Scripts
- `check-config.ps1` - Validate configuration
- `test-api-quick.ps1` - Quick API test
- `setup-aws-cli.ps1` - AWS CLI setup
- `check-security.ps1` - Security check

---

## Documentation (`docs/`)

### Implementation Guides
- `7-DAY-IMPLEMENTATION-ROADMAP.md` - Full development plan
- `DAY-1-IMPLEMENTATION-GUIDE.md` - Day 1 setup
- `IMPLEMENTATION-STATUS.md` - Current progress

### Technical Docs
- `PRICE-MONITORING-IMPLEMENTATION.md` - Price monitoring details
- `QUICK-START-PRICE-MONITORING.md` - Quick setup
- `SEARCH-ISSUE-RESOLVED.md` - Search troubleshooting

### Debugging
- `DEBUGGING-GUIDE.md` - How to debug
- `HOW-TO-READ-LOGS.md` - Console logs guide
- `SEARCH-NOT-WORKING-FIX.md` - Search fixes
- `TEST-PRODUCT-SEARCH.md` - Testing guide

---

## Source Code (`src/`)

### Pages
- `Landing.tsx` - Landing page
- `CommandCenterPage.tsx` - AI Copilot
- `InsightsPage.tsx` - Product overview
- `AddProductPage.tsx` - Add new product
- `DecisionsPage.tsx` - Recommendations
- `AlertsPage.tsx` - Alerts
- `OutcomesPage.tsx` - Results tracking
- `ReportsPage.tsx` - Reports
- `SetupPage.tsx` - Settings
- `HelpPage.tsx` - Help

### Components
- `layout/AppLayout.tsx` - Main layout
- `ui/` - UI components (buttons, cards, etc.)

### API
- `api/client.ts` - API client with all endpoints

---

## Backend (`backend/`)

### Lambda Functions
- `functions/aiCopilot/` - AI chat (Bedrock)
- `functions/products/` - Product CRUD
- `functions/priceMonitor/` - Price monitoring
- `functions/priceScraper/` - Web scraping
- `functions/productSearch/` - Competitor search
- `functions/recommendations/` - Smart suggestions
- `functions/alerts/` - Alert generation
- `functions/analytics/` - Analytics data

### Deployment Scripts
- `deploy-*-windows.ps1` - Deploy individual functions

---

## What to Keep

### Must Keep
- All `src/` files
- All `backend/functions/` files
- `README.md`
- `GETTING-STARTED.md`
- `package.json`
- `.env.local` (your config)
- Deployment scripts

### Can Archive
- Old documentation in `docs/`
- Test scripts (after testing)
- Redundant guides

---

## Clean Repository

To keep repo clean:

1. **Move old docs to archive:**
   ```powershell
   New-Item -ItemType Directory -Path "archive"
   Move-Item -Path "docs/OLD-*.md" -Destination "archive/"
   ```

2. **Delete test scripts after use:**
   ```powershell
   Remove-Item -Path "test-*.ps1"
   ```

3. **Keep only:**
   - Source code (`src/`, `backend/`)
   - Essential docs (`README.md`, `GETTING-STARTED.md`)
   - Active development docs (`docs/7-DAY-*.md`)
   - Utility scripts (`check-config.ps1`, etc.)

---

## Recommended Structure

```
retailmind-ai/
├── README.md                    # Keep
├── GETTING-STARTED.md          # Keep
├── package.json                # Keep
├── .env.local                  # Keep (your config)
├── check-config.ps1            # Keep
├── test-api-quick.ps1          # Keep
├── src/                        # Keep all
├── backend/                    # Keep all
└── docs/                       # Keep active docs only
    ├── 7-DAY-IMPLEMENTATION-ROADMAP.md
    ├── IMPLEMENTATION-STATUS.md
    └── DEBUGGING-GUIDE.md
```

Total: ~20 essential files instead of 50+
