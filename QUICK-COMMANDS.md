# Quick Commands Reference

Fast reference for common RetailMind AI operations.

---

## 🚀 Setup & Deployment

### Initial Setup
```powershell
# Complete setup wizard
.\START-REAL-MONITORING.ps1

# Or manual setup
Copy-Item backend/functions/priceScraper/index-enhanced.mjs backend/functions/priceScraper/index.mjs
Copy-Item backend/functions/priceMonitor/index-real.mjs backend/functions/priceMonitor/index.mjs
```

### Deploy Functions
```powershell
# Deploy Price Scraper
cd backend/functions/priceScraper
npm install
# Run your deployment script

# Deploy Price Monitor
cd backend/functions/priceMonitor
npm install
# Run your deployment script
```

---

## 📦 Product Management

### Add Product (Interactive)
```powershell
.\scripts\add-real-product.ps1
```

### Add Product (API)
```powershell
$product = @{
    name = "Product Name"
    sku = "SKU-123"
    category = "Electronics"
    currentPrice = 99999
    costPrice = 75000
    stock = 50
    description = "Product description"
    competitorUrls = @{
        amazon = "https://www.amazon.in/dp/XXXXXX"
        flipkart = "https://www.flipkart.com/product/p/itmXXXXX"
    }
} | ConvertTo-Json

Invoke-RestMethod -Uri "$env:VITE_API_URL/products" `
    -Method Post `
    -ContentType "application/json" `
    -Body $product
```

### List Products
```powershell
Invoke-RestMethod -Uri "$env:VITE_API_URL/products"
```

### Get Single Product
```powershell
$productId = "prod-xxx"
Invoke-RestMethod -Uri "$env:VITE_API_URL/products/$productId"
```

### Update Product
```powershell
$productId = "prod-xxx"
$updates = @{
    currentPrice = 89999
    stock = 75
} | ConvertTo-Json

Invoke-RestMethod -Uri "$env:VITE_API_URL/products/$productId" `
    -Method Put `
    -ContentType "application/json" `
    -Body $updates
```

### Delete Product
```powershell
$productId = "prod-xxx"
Invoke-RestMethod -Uri "$env:VITE_API_URL/products/$productId" -Method Delete
```

---

## 🔍 Price Scraping

### Scrape by URL
```powershell
# Amazon
$scrape = @{
    url = "https://www.amazon.in/dp/B0CHX1W1XY"
    platform = "amazon"
} | ConvertTo-Json

Invoke-RestMethod -Uri "$env:VITE_API_URL/scraper/price" `
    -Method Post `
    -ContentType "application/json" `
    -Body $scrape

# Flipkart
$scrape = @{
    url = "https://www.flipkart.com/product/p/itm123456"
    platform = "flipkart"
} | ConvertTo-Json

Invoke-RestMethod -Uri "$env:VITE_API_URL/scraper/price" `
    -Method Post `
    -ContentType "application/json" `
    -Body $scrape

# Snapdeal
$scrape = @{
    url = "https://www.snapdeal.com/product/name/123456"
    platform = "snapdeal"
} | ConvertTo-Json

Invoke-RestMethod -Uri "$env:VITE_API_URL/scraper/price" `
    -Method Post `
    -ContentType "application/json" `
    -Body $scrape
```

### Search and Scrape
```powershell
$search = @{
    productName = "iPhone 15 Pro Max"
    platform = "amazon"
} | ConvertTo-Json

Invoke-RestMethod -Uri "$env:VITE_API_URL/scraper/price" `
    -Method Post `
    -ContentType "application/json" `
    -Body $search
```

---

## 📊 Price Monitoring

### Run Monitoring Manually
```powershell
Invoke-RestMethod -Uri "$env:VITE_API_URL/monitor/prices" -Method Post
```

### Get Price History
```powershell
$productId = "prod-xxx"
Invoke-RestMethod -Uri "$env:VITE_API_URL/products/$productId/prices"
```

---

## 💡 Recommendations

### List Recommendations
```powershell
Invoke-RestMethod -Uri "$env:VITE_API_URL/recommendations"
```

### Generate Recommendations
```powershell
Invoke-RestMethod -Uri "$env:VITE_API_URL/recommendations/generate" -Method Post
```

### Implement Recommendation
```powershell
$recommendationId = "rec-xxx"
Invoke-RestMethod -Uri "$env:VITE_API_URL/recommendations/$recommendationId/implement" -Method Post
```

---

## 🔔 Alerts

### List Alerts
```powershell
Invoke-RestMethod -Uri "$env:VITE_API_URL/alerts"
```

### Generate Alerts
```powershell
Invoke-RestMethod -Uri "$env:VITE_API_URL/alerts/generate" -Method Post
```

### Acknowledge Alert
```powershell
$alertId = "alert-xxx"
Invoke-RestMethod -Uri "$env:VITE_API_URL/alerts/$alertId/acknowledge" -Method Post
```

### Get Alert Stats
```powershell
Invoke-RestMethod -Uri "$env:VITE_API_URL/alerts/stats"
```

---

## 🤖 AI Copilot

### Ask Question
```powershell
$query = @{
    query = "What products should I restock?"
} | ConvertTo-Json

Invoke-RestMethod -Uri "$env:VITE_API_URL/copilot" `
    -Method Post `
    -ContentType "application/json" `
    -Body $query
```

---

## 📈 Analytics

### Get Overview
```powershell
Invoke-RestMethod -Uri "$env:VITE_API_URL/analytics/overview"
```

### Get Revenue Analytics
```powershell
Invoke-RestMethod -Uri "$env:VITE_API_URL/analytics/revenue"
```

### Get Outcomes
```powershell
Invoke-RestMethod -Uri "$env:VITE_API_URL/analytics/outcomes"
```

---

## 🔧 Debugging

### Check CloudWatch Logs
```powershell
# Via AWS CLI
aws logs tail /aws/lambda/RetailMind-PriceScraper --follow
aws logs tail /aws/lambda/RetailMind-PriceMonitor --follow
```

### Test API Connection
```powershell
# Check if API is accessible
Invoke-RestMethod -Uri "$env:VITE_API_URL/products" -Method Get
```

### Verify Environment
```powershell
# Check API URL
echo $env:VITE_API_URL

# Set API URL
$env:VITE_API_URL = "https://YOUR_API_URL.execute-api.us-east-1.amazonaws.com/dev"
```

### Check DynamoDB Tables
```powershell
# Via AWS CLI
aws dynamodb list-tables

# Scan Products table
aws dynamodb scan --table-name RetailMind-Products

# Scan PriceHistory table
aws dynamodb scan --table-name RetailMind-PriceHistory --max-items 10
```

---

## 📋 Batch Operations

### Add Multiple Products
```powershell
# Create CSV file: products.csv
# name,sku,category,currentPrice,costPrice,stock,amazonUrl,flipkartUrl

# Read and add each product
Import-Csv products.csv | ForEach-Object {
    $product = @{
        name = $_.name
        sku = $_.sku
        category = $_.category
        currentPrice = [int]$_.currentPrice
        costPrice = [int]$_.costPrice
        stock = [int]$_.stock
        competitorUrls = @{
            amazon = $_.amazonUrl
            flipkart = $_.flipkartUrl
        }
    } | ConvertTo-Json
    
    Invoke-RestMethod -Uri "$env:VITE_API_URL/products" `
        -Method Post `
        -ContentType "application/json" `
        -Body $product
    
    Start-Sleep -Seconds 1
}
```

### Scrape All Products
```powershell
# Get all products
$products = Invoke-RestMethod -Uri "$env:VITE_API_URL/products"

# Scrape each competitor URL
$products.products | ForEach-Object {
    $product = $_
    
    if ($product.competitorUrls.amazon) {
        Write-Host "Scraping Amazon for $($product.name)"
        $scrape = @{
            url = $product.competitorUrls.amazon
            platform = "amazon"
        } | ConvertTo-Json
        
        Invoke-RestMethod -Uri "$env:VITE_API_URL/scraper/price" `
            -Method Post `
            -ContentType "application/json" `
            -Body $scrape
    }
    
    Start-Sleep -Seconds 2
}
```

---

## 🎯 Common Workflows

### Daily Monitoring Routine
```powershell
# 1. Run monitoring
Invoke-RestMethod -Uri "$env:VITE_API_URL/monitor/prices" -Method Post

# 2. Generate recommendations
Invoke-RestMethod -Uri "$env:VITE_API_URL/recommendations/generate" -Method Post

# 3. Generate alerts
Invoke-RestMethod -Uri "$env:VITE_API_URL/alerts/generate" -Method Post

# 4. Check results
Invoke-RestMethod -Uri "$env:VITE_API_URL/alerts/stats"
```

### Add New Product Workflow
```powershell
# 1. Find product URLs on competitor sites
# 2. Add product
.\scripts\add-real-product.ps1

# 3. Test scraping
# (Script does this automatically)

# 4. Verify in dashboard
# Open browser to your frontend URL
```

### Troubleshooting Workflow
```powershell
# 1. Check API connection
Invoke-RestMethod -Uri "$env:VITE_API_URL/products"

# 2. Test scraping
$test = @{ url = "https://www.amazon.in/dp/B0CHX1W1XY"; platform = "amazon" } | ConvertTo-Json
Invoke-RestMethod -Uri "$env:VITE_API_URL/scraper/price" -Method Post -Body $test -ContentType "application/json"

# 3. Check CloudWatch logs
aws logs tail /aws/lambda/RetailMind-PriceScraper --follow

# 4. Verify DynamoDB
aws dynamodb scan --table-name RetailMind-PriceHistory --max-items 5
```

---

## 💾 Backup & Restore

### Export Products
```powershell
# Export to JSON
$products = Invoke-RestMethod -Uri "$env:VITE_API_URL/products"
$products | ConvertTo-Json -Depth 10 | Out-File "products-backup.json"
```

### Import Products
```powershell
# Import from JSON
$backup = Get-Content "products-backup.json" | ConvertFrom-Json

$backup.products | ForEach-Object {
    $product = $_ | ConvertTo-Json
    
    Invoke-RestMethod -Uri "$env:VITE_API_URL/products" `
        -Method Post `
        -ContentType "application/json" `
        -Body $product
}
```

---

## 🔐 Environment Setup

### Set Environment Variables
```powershell
# Set API URL
$env:VITE_API_URL = "https://YOUR_API_URL.execute-api.us-east-1.amazonaws.com/dev"

# Save to .env.local
"VITE_API_URL=$env:VITE_API_URL" | Out-File .env.local

# Set AWS Region
$env:AWS_REGION = "us-east-1"
```

### Load Environment Variables
```powershell
# Load from .env.local
Get-Content .env.local | ForEach-Object {
    if ($_ -match '^([^=]+)=(.*)$') {
        [Environment]::SetEnvironmentVariable($matches[1], $matches[2], "Process")
    }
}
```

---

## 📊 Monitoring & Metrics

### Check Success Rate
```powershell
# Run monitoring and check results
$result = Invoke-RestMethod -Uri "$env:VITE_API_URL/monitor/prices" -Method Post

$successRate = ($result.pricesScraped / ($result.pricesScraped + $result.pricesFailed)) * 100
Write-Host "Success Rate: $successRate%"
```

### Get Recent Price History
```powershell
# Get all products
$products = Invoke-RestMethod -Uri "$env:VITE_API_URL/products"

# Check each product's price history
$products.products | ForEach-Object {
    $history = Invoke-RestMethod -Uri "$env:VITE_API_URL/products/$($_.id)/prices"
    
    Write-Host "`n$($_.name):"
    $history | Select-Object -First 3 | ForEach-Object {
        Write-Host "  $($_.competitorName): ₹$($_.price) - $($_.source)"
    }
}
```

---

## 🎓 Learning Commands

### Explore API
```powershell
# List all endpoints
Write-Host "Products: $env:VITE_API_URL/products"
Write-Host "Scraper: $env:VITE_API_URL/scraper/price"
Write-Host "Monitor: $env:VITE_API_URL/monitor/prices"
Write-Host "Recommendations: $env:VITE_API_URL/recommendations"
Write-Host "Alerts: $env:VITE_API_URL/alerts"
Write-Host "Copilot: $env:VITE_API_URL/copilot"
Write-Host "Analytics: $env:VITE_API_URL/analytics/overview"
```

### Test Each Feature
```powershell
# Test products
Invoke-RestMethod -Uri "$env:VITE_API_URL/products"

# Test scraper
$test = @{ url = "https://www.amazon.in/dp/B0CHX1W1XY"; platform = "amazon" } | ConvertTo-Json
Invoke-RestMethod -Uri "$env:VITE_API_URL/scraper/price" -Method Post -Body $test -ContentType "application/json"

# Test monitoring
Invoke-RestMethod -Uri "$env:VITE_API_URL/monitor/prices" -Method Post

# Test recommendations
Invoke-RestMethod -Uri "$env:VITE_API_URL/recommendations"

# Test alerts
Invoke-RestMethod -Uri "$env:VITE_API_URL/alerts"
```

---

**Save this file for quick reference!** 📌

**Tip:** Press `Ctrl+F` to search for specific commands.
