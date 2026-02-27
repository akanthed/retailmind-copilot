# How to Read Browser Console Logs

## Opening the Console

**Windows/Linux:** Press `F12` or `Ctrl + Shift + I`
**Mac:** Press `Cmd + Option + I`

Then click the "Console" tab.

---

## What You'll See Now

I've added comprehensive logging. When you click "Search", you'll see:

### 1. API Configuration (on page load)
```
🔧 API Configuration
  VITE_API_URL: https://your-api-url.execute-api.us-east-1.amazonaws.com/dev
  Mode: development
  Dev: true
```

**What to check:**
- Is `VITE_API_URL` set correctly?
- Should match your API Gateway URL

### 2. Product Search Start
```
🔍 Product Search
  Search query: iPhone 15 Pro
  API Base URL: https://your-api-url...
  Calling apiClient.searchCompetitorProducts...
```

### 3. API Request Details
```
🌐 API Request: POST /products/search-competitors
  Full URL: https://your-api-url.../dev/products/search-competitors
  Options: {method: 'POST', body: '{"query":"iPhone 15 Pro"}'}
  Response Status: 200 OK
  Response Headers: {...}
  Response Body (raw): {"query":"iPhone 15 Pro","matches":[...]}
  Response Body (parsed): {query: "iPhone 15 Pro", matches: Array(5)}
  ✅ Request successful
```

### 4. Search Results
```
✅ Search successful! Matches found: 5
Matches: [{platform: "Amazon.in", ...}, ...]
```

---

## Common Error Patterns

### Error 1: API URL Not Set
```
🌐 API Request: POST /products/search-competitors
  Full URL: https://YOUR_API_URL.execute-api.us-east-1.amazonaws.com/dev/products/search-competitors
  ❌ API Error: Failed to fetch
```

**Problem:** `VITE_API_URL` not configured
**Fix:** Create/update `.env.local`:
```
VITE_API_URL=https://YOUR_ACTUAL_API_URL.execute-api.us-east-1.amazonaws.com/dev
```

### Error 2: 404 Not Found
```
🌐 API Request: POST /products/search-competitors
  Response Status: 404 Not Found
  Error Response Body: {"message":"Missing Authentication Token"}
  ❌ API Error: HTTP 404: Not Found
```

**Problem:** API Gateway endpoint not configured
**Fix:** 
1. Go to API Gateway Console
2. Create `/products/search-competitors` endpoint
3. Add POST method
4. Integrate with Lambda
5. Deploy API

### Error 3: 500 Internal Server Error
```
🌐 API Request: POST /products/search-competitors
  Response Status: 500 Internal Server Error
  Error Response Body: {"message":"Internal server error"}
  ❌ API Error: HTTP 500: Internal Server Error
```

**Problem:** Lambda function error
**Fix:**
1. Go to Lambda Console
2. Open `retailmind-product-search`
3. Check CloudWatch logs
4. Common issues:
   - Dependencies not installed
   - Timeout too short
   - Memory too low

### Error 4: CORS Error
```
Access to fetch at 'https://...' from origin 'http://localhost:5173' 
has been blocked by CORS policy
```

**Problem:** CORS not enabled on API Gateway
**Fix:**
1. Go to API Gateway
2. Select endpoint
3. Actions → Enable CORS
4. Deploy API

### Error 5: Network Error
```
❌ API Error: Failed to fetch
Error details: {name: "TypeError", message: "Failed to fetch"}
```

**Problem:** Can't reach API (wrong URL, network issue, or API not deployed)
**Fix:**
1. Check API URL is correct
2. Check API is deployed
3. Test with curl

---

## Debug Panel in UI

I also added a debug panel at the top of the Add Product page:

1. Click "▶ Debug Info" to expand
2. You'll see:
   - Current API URL
   - Mode (development/production)
   - Full search endpoint URL

This helps verify your configuration without opening console.

---

## Testing Steps

### Step 1: Check Configuration
1. Open Add Product page
2. Click "▶ Debug Info"
3. Verify API URL is correct
4. Open Console (F12)
5. Look for "🔧 API Configuration" log

### Step 2: Test Search
1. Enter "iPhone 15 Pro" in product name
2. Click "Search"
3. Watch console for logs
4. Look for the grouped logs:
   - 🔍 Product Search
   - 🌐 API Request
   - ✅ or ❌ Result

### Step 3: Identify Issue
Based on the logs, you'll see exactly what's wrong:
- Wrong URL → Update .env.local
- 404 → Configure API Gateway
- 500 → Check Lambda logs
- CORS → Enable CORS
- Network → Check API deployment

---

## What Happens Now

With the updated code:

1. **If search works:** You'll see real results from Amazon/Flipkart
2. **If search fails:** You'll see demo results + can use manual URLs
3. **Either way:** You can continue adding products!

---

## Quick Test

Run this in your terminal to test the API directly:

```powershell
# Get your API URL from .env.local
$apiUrl = (Get-Content .env.local | Select-String "VITE_API_URL").ToString().Split("=")[1]

# Test search endpoint
curl -X POST "$apiUrl/products/search-competitors" `
  -H "Content-Type: application/json" `
  -d '{"query":"iPhone 15 Pro"}'
```

Compare the terminal output with browser console logs!

---

## Need More Help?

After clicking "Search", copy the console logs and share:
1. The "🔧 API Configuration" section
2. The "🌐 API Request" section
3. Any error messages

This will tell us exactly what's wrong!
