# Testing Product Search - Debug Guide

## Issue
Product search returns "0 products found" when searching for "iPhone 15 Pro"

## Possible Causes

### 1. Lambda Function Not Deployed
**Check:** Go to AWS Lambda Console → Look for `retailmind-product-search`

**If missing:** Deploy it:
```powershell
cd backend
./deploy-product-search-windows.ps1
```

### 2. API Gateway Endpoint Not Configured
**Check:** Go to API Gateway → Your API → Resources

**Should see:** `/products/search-competitors` with POST method

**If missing:** Follow these steps:
1. Select `/products` resource
2. Actions → Create Resource
3. Resource Name: `search-competitors`
4. Create Resource
5. Select `/products/search-competitors`
6. Actions → Create Method → POST
7. Integration: Lambda Function
8. Lambda: `retailmind-product-search`
9. Save
10. Actions → Enable CORS
11. Actions → Deploy API → Stage: dev

### 3. Check Browser Console
Open browser DevTools (F12) and look for errors:

**Common errors:**
- `404 Not Found` → API endpoint not configured
- `CORS error` → CORS not enabled
- `500 Internal Server Error` → Lambda function error
- `Network error` → Wrong API URL

### 4. Test API Directly

```bash
# Replace YOUR_API_URL with your actual API Gateway URL
curl -X POST https://YOUR_API_URL/dev/products/search-competitors \
  -H "Content-Type: application/json" \
  -d '{"query": "iPhone 15 Pro"}'
```

**Expected response:**
```json
{
  "query": "iPhone 15 Pro",
  "matches": [
    {
      "platform": "Amazon.in",
      "productName": "Apple iPhone 15 Pro...",
      "url": "https://www.amazon.in/...",
      "price": 134900,
      "confidence": 0.95
    }
  ],
  "count": 5
}
```

### 5. Check Lambda Logs

1. Go to AWS Lambda → `retailmind-product-search`
2. Click "Monitor" tab
3. Click "View CloudWatch logs"
4. Check for errors

**Common errors:**
- `Module not found` → Dependencies not installed
- `Timeout` → Function taking too long (increase timeout)
- `403 Forbidden` → Website blocking scraping

---

## Quick Fix: Use Mock Data for Now

If scraping isn't working yet, let's add a fallback with mock data so you can continue testing:

### Update AddProductPage.tsx

Find the `handleSearchCompetitors` function and add this fallback:

```typescript
const handleSearchCompetitors = async () => {
  if (!formData.name) {
    toast({
      title: "Product name required",
      description: "Please enter a product name to search",
      variant: "destructive"
    });
    return;
  }

  setSearching(true);
  try {
    const result = await apiClient.searchCompetitorProducts(formData.name);
    
    if (result.error) {
      // FALLBACK: Use mock data if API fails
      console.error("Search API failed:", result.error);
      
      const mockMatches = [
        {
          platform: "Amazon.in",
          productName: `${formData.name} - Natural Titanium`,
          url: "https://www.amazon.in/dp/B0CHX1W1XY",
          price: 134900,
          inStock: true,
          confidence: 0.95
        },
        {
          platform: "Flipkart",
          productName: `${formData.name} 256GB`,
          url: "https://www.flipkart.com/apple-iphone-15-pro/p/itm123",
          price: 133999,
          inStock: true,
          confidence: 0.92
        }
      ];
      
      setCompetitorMatches(mockMatches);
      
      toast({
        title: "Using demo data",
        description: "Search API not configured yet. Showing sample results."
      });
      return;
    }

    setCompetitorMatches(result.data?.matches || []);
    
    toast({
      title: "Search complete",
      description: `Found ${result.data?.matches?.length || 0} matching products`
    });
  } catch (error) {
    console.error("Search error:", error);
    toast({
      title: "Error",
      description: "Failed to search competitors",
      variant: "destructive"
    });
  } finally {
    setSearching(false);
  }
};
```

---

## Step-by-Step Debug Process

### Step 1: Check API URL
```typescript
// In src/api/client.ts, check this line:
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://YOUR_API_URL.execute-api.us-east-1.amazonaws.com/dev';
```

Make sure `VITE_API_URL` is set correctly in `.env.local`

### Step 2: Check Network Tab
1. Open DevTools (F12)
2. Go to Network tab
3. Click "Search" button
4. Look for the request to `/products/search-competitors`
5. Check:
   - Status code (should be 200)
   - Response body
   - Request payload

### Step 3: Test Lambda Directly
Go to AWS Lambda Console:
1. Open `retailmind-product-search`
2. Click "Test" tab
3. Create test event:
```json
{
  "body": "{\"query\": \"iPhone 15 Pro\"}"
}
```
4. Click "Test"
5. Check response

### Step 4: Check Lambda Dependencies
```powershell
cd backend/functions/productSearch
npm install
# Should install cheerio
```

---

## Most Likely Issue

Based on your description, the most likely issue is:

**The API Gateway endpoint `/products/search-competitors` is not configured yet.**

### Quick Fix:
1. Go to API Gateway Console
2. Find your API
3. Create the endpoint (steps above)
4. Deploy API
5. Test again

---

## Alternative: Manual URL Entry

While debugging, you can skip the search and just manually enter URLs:

1. In "Add Product" page
2. Skip the "Search" button
3. Scroll down to "Competitor URLs"
4. Manually paste:
   - Amazon URL: `https://www.amazon.in/dp/B0CHX1W1XY`
   - Flipkart URL: `https://www.flipkart.com/apple-iphone-15-pro/p/itm123`
5. Click "Create Product"

This will work even if search isn't configured yet!

---

## Need More Help?

Share these details:
1. Browser console errors (F12 → Console tab)
2. Network tab response (F12 → Network tab)
3. Lambda function status (exists? deployed?)
4. API Gateway endpoint status (configured? deployed?)

Then I can give you the exact fix!
