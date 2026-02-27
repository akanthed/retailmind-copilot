# How to Find Product URLs for Price Monitoring

Quick guide to finding and adding real product URLs from Indian e-commerce sites.

## Amazon.in

### Finding the URL

1. Go to [Amazon.in](https://www.amazon.in)
2. Search for your product (e.g., "Samsung Galaxy S23 Ultra")
3. Click on the product you want to monitor
4. Copy the URL from your browser's address bar

### URL Format

Amazon URLs contain `/dp/` or `/gp/product/` followed by the product ID:

```
https://www.amazon.in/dp/B0BT9CXXXX
https://www.amazon.in/Samsung-Galaxy-Ultra-Green-Storage/dp/B0BT9CXXXX
```

### Clean URL (Recommended)

You can simplify Amazon URLs to just the essential part:

```
Original: https://www.amazon.in/Samsung-Galaxy-Ultra-Green-Storage/dp/B0BT9CXXXX/ref=sr_1_1?keywords=samsung+s23
Clean:    https://www.amazon.in/dp/B0BT9CXXXX
```

Both work, but the clean version is easier to manage.

### Example Products

```
iPhone 15 Pro Max:
https://www.amazon.in/dp/B0CHX1W1XY

Sony WH-1000XM5:
https://www.amazon.in/dp/B09XS7JWHH

MacBook Air M2:
https://www.amazon.in/dp/B0B3C2R8MP
```

## Flipkart

### Finding the URL

1. Go to [Flipkart.com](https://www.flipkart.com)
2. Search for your product
3. Click on the product
4. Copy the URL from your browser

### URL Format

Flipkart URLs contain `/p/itm` followed by the product ID:

```
https://www.flipkart.com/samsung-galaxy-s23-ultra/p/itm123456789abc
```

### Clean URL

Flipkart URLs are already pretty clean. Just make sure you have the `/p/itm` part:

```
https://www.flipkart.com/product-name/p/itmXXXXXXXXXXXX
```

### Example Products

```
iPhone 15 Pro Max:
https://www.flipkart.com/apple-iphone-15-pro-max/p/itm123456789

Samsung Galaxy S23 Ultra:
https://www.flipkart.com/samsung-galaxy-s23-ultra/p/itm987654321

OnePlus 11:
https://www.flipkart.com/oneplus-11/p/itm456789123
```

## Snapdeal

### Finding the URL

1. Go to [Snapdeal.com](https://www.snapdeal.com)
2. Search for your product
3. Click on the product
4. Copy the URL from your browser

### URL Format

Snapdeal URLs contain the product name and ID:

```
https://www.snapdeal.com/product/samsung-galaxy-s23-ultra/123456789
```

### Example Products

```
Samsung Galaxy S23:
https://www.snapdeal.com/product/samsung-galaxy-s23/123456789

Boat Airdopes:
https://www.snapdeal.com/product/boat-airdopes-141/987654321
```

## Quick Start Examples

### Example 1: Smartphone

```json
{
  "name": "Samsung Galaxy S23 Ultra 256GB",
  "currentPrice": 124999,
  "competitorUrls": {
    "amazon": "https://www.amazon.in/dp/B0BT9CXXXX",
    "flipkart": "https://www.flipkart.com/samsung-galaxy-s23-ultra/p/itm123456",
    "snapdeal": "https://www.snapdeal.com/product/samsung-galaxy-s23/123456"
  }
}
```

### Example 2: Laptop

```json
{
  "name": "MacBook Air M2 13-inch 256GB",
  "currentPrice": 114900,
  "competitorUrls": {
    "amazon": "https://www.amazon.in/dp/B0B3C2R8MP",
    "flipkart": "https://www.flipkart.com/apple-macbook-air-m2/p/itm789456"
  }
}
```

### Example 3: Headphones

```json
{
  "name": "Sony WH-1000XM5 Wireless Headphones",
  "currentPrice": 29990,
  "competitorUrls": {
    "amazon": "https://www.amazon.in/dp/B09XS7JWHH",
    "flipkart": "https://www.flipkart.com/sony-wh-1000xm5/p/itm456123",
    "snapdeal": "https://www.snapdeal.com/product/sony-wh-1000xm5/789123"
  }
}
```

## Tips for Finding Products

### 1. Use Exact Model Numbers

Search for specific model numbers to find exact matches:
- ✅ "Samsung Galaxy S23 Ultra 256GB"
- ❌ "Samsung phone"

### 2. Check Multiple Variants

Some products have multiple variants (color, storage). Make sure you're tracking the right one:
- iPhone 15 Pro Max 256GB vs 512GB
- Black vs Blue color

### 3. Verify the Product

Before adding the URL:
1. Open the URL in your browser
2. Verify it's the correct product
3. Check the price is showing
4. Confirm it's in stock (or note if out of stock)

### 4. Test the URL

Use the scraper to test before adding to your product:

```bash
curl -X POST https://YOUR_API_URL/scraper/price \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://www.amazon.in/dp/B0BT9CXXXX",
    "platform": "amazon"
  }'
```

## Common Issues

### Issue: "Could not extract price"

**Causes:**
- Product is out of stock
- URL is incorrect
- Product page structure changed
- Website is blocking automated access

**Solutions:**
1. Open URL in browser to verify it works
2. Check if product is in stock
3. Try a different product
4. Update scraper selectors

### Issue: Wrong Product

**Causes:**
- Copied URL from search results instead of product page
- URL contains redirect or tracking parameters

**Solutions:**
1. Make sure you're on the actual product page
2. Look for `/dp/` (Amazon) or `/p/itm` (Flipkart) in URL
3. Remove tracking parameters (everything after `?`)

### Issue: Price Doesn't Match

**Causes:**
- Different variant (color, storage, etc.)
- Sale or discount applied
- Region-specific pricing

**Solutions:**
1. Verify exact product variant
2. Check if there's a sale
3. Test scraping to see what price is extracted

## Using the Scripts

### Add Product with URLs (Bash)

```bash
chmod +x scripts/add-real-product.sh
./scripts/add-real-product.sh
```

### Add Product with URLs (PowerShell)

```powershell
.\scripts\add-real-product.ps1
```

The scripts will:
1. Prompt you for product details
2. Ask for competitor URLs
3. Create the product
4. Test scraping each URL
5. Show you the results

## Best Practices

1. **Start Small:** Add 3-5 products first to test
2. **Verify URLs:** Always test URLs before adding
3. **Monitor Logs:** Check CloudWatch logs for scraping errors
4. **Update Regularly:** If scraping fails, URLs may need updating
5. **Document Products:** Keep a list of products and their URLs

## Next Steps

1. Find 5-10 products you want to monitor
2. Get their URLs from Amazon, Flipkart, Snapdeal
3. Use the script to add them: `.\scripts\add-real-product.ps1`
4. Run price monitoring: Trigger the PriceMonitor Lambda
5. Check the results in your dashboard

## Need Help?

If you're having trouble:
1. Check the URL in a browser first
2. Test with the scraper endpoint
3. Look at CloudWatch logs
4. Try a different product
5. Refer to REAL-PRICE-MONITORING-SETUP.md for detailed troubleshooting
