# Debugging Guide - Product Search

## What I Just Added

✅ **Comprehensive logging in API client**
- Shows full URL being called
- Shows request/response details
- Shows errors with full context

✅ **Detailed logging in AddProductPage**
- Logs search query
- Logs API configuration
- Logs results or errors
- Groups logs for easy reading

✅ **Debug panel in UI**
- Shows current API URL
- Shows search endpoint
- Reminds you to check console

✅ **Configuration checker script**
- Checks if .env.local exists
- Validates API URL
- Tests API connectivity
- Tests search endpoint

---

## How to Debug Now

### Step 1: Check Configuration
```powershell
./check-config.ps1
```

This will:
- Check if .env.local exists
- Validate your API URL
- Test if API is reachable
- Test if search endpoint works

### Step 2: Start Frontend
```bash
npm run dev
```

### Step 3: Open Browser Console
1. Go to `http://localhost:5173/products/add`
2. Press `F12` to open DevTools
3. Click "Console" tab
4. You'll see: `🔧 API Configuration` logs

### Step 4: Test Search
1. Click "▶ Debug Info" at top of page
2. Verify API URL is correct
3. Enter "iPhone 15 Pro" in product name
4. Click "Search"
5. Watch console for detailed logs

---

## What You'll See in Console

### On Page Load:
```
🔧 API Configuration
  VITE_API_URL: https://your-api.execute-api.us-east-1.amazonaws.com/dev
  Mode: development
  Dev: true
```

### When Clicking Search:
```
🔍 Product Search
  Search query: iPhone 15 Pro
  API Base URL: https://your-api...
  Calling apiClient.searchCompetitorProducts...

🌐 API Request: POST /products/search-competitors
  Full URL: https://your-api.../dev/products/search-competitors
  Options: {method: 'POST', body: '{"query":"iPhone 15 Pro"}'}
  Response Status: 200 OK
  Response Body (parsed): {query: "iPhone 15 Pro", matches: [...]}
  ✅ Request successful

✅ Search successful! Matches found: 5
```

### If There's an Error:
```
🌐 API Request: POST /products/search-competitors
  Full URL: https://your-api.../dev/products/search-competitors
  Response Status: 404 Not Found
  Error Response Body: {"message":"Missing Authentication Token"}
  ❌ API Error: HTTP 404: Not Found

❌ Search API error: HTTP 404: Not Found
Falling back to demo data...
```

---

## Common Issues & Solutions

### Issue 1: "VITE_API_URL: undefined"
**Problem:** .env.local not configured
**Solution:**
```bash
# Create .env.local
echo "VITE_API_URL=https://YOUR_API_URL.execute-api.us-east-1.amazonaws.com/dev" > .env.local

# Restart dev server
npm run dev
```

### Issue 2: "404 Not Found"
**Problem:** Search endpoint not configured in API Gateway
**Solution:** See SEARCH-NOT-WORKING-FIX.md
**Workaround:** Use manual URL entry (works fine!)

### Issue 3: "500 Internal Server Error"
**Problem:** Lambda function error
**Solution:**
1. Go to Lambda Console
2. Open `retailmind-product-search`
3. Check CloudWatch logs
4. Redeploy: `./deploy-product-search-windows.ps1`

### Issue 4: "CORS error"
**Problem:** CORS not enabled
**Solution:**
1. API Gateway → Select endpoint
2. Actions → Enable CORS
3. Deploy API

### Issue 5: "Failed to fetch"
**Problem:** Wrong API URL or network issue
**Solution:**
1. Check .env.local has correct URL
2. Test with: `./check-config.ps1`
3. Verify API is deployed

---

## Files Created for Debugging

1. **HOW-TO-READ-LOGS.md** - Detailed guide on reading console logs
2. **check-config.ps1** - Script to validate configuration
3. **test-search-api.ps1** - Script to test search API
4. **DEBUGGING-GUIDE.md** - This file

---

## Quick Checklist

Before asking for help, check:

- [ ] Ran `./check-config.ps1`
- [ ] .env.local exists and has correct API URL
- [ ] Opened browser console (F12)
- [ ] Clicked "Search" and watched logs
- [ ] Copied the console logs (especially errors)

---

## What to Share for Help

If you need help, share:

1. **Configuration check output:**
   ```powershell
   ./check-config.ps1
   ```

2. **Console logs:**
   - Open Console (F12)
   - Click "Search"
   - Copy all logs from "🔍 Product Search" group

3. **Debug panel info:**
   - Click "▶ Debug Info"
   - Share what it shows

---

## Remember

Even if search doesn't work, you can:
1. ✅ Use manual URL entry
2. ✅ Add products successfully
3. ✅ Test price scraping
4. ✅ Continue building Day 2 features

Search is a convenience feature - not critical for testing!

---

## Next Steps

1. Run `./check-config.ps1` to validate setup
2. Open browser console and test search
3. Share the logs if you need help
4. Or skip search and use manual URLs!

**Ready to debug?** 🔍
