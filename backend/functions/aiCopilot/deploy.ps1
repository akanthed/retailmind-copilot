# Quick Deploy Script for AI Copilot Lambda
# Run this in PowerShell from the aiCopilot folder

Write-Host "Deploying RetailMind AI Copilot..." -ForegroundColor Green
Write-Host ""

# Check if we're in the right directory
if (-not (Test-Path "index.mjs")) {
    Write-Host "Error: index.mjs not found!" -ForegroundColor Red
    Write-Host "Please run this script from backend/functions/aiCopilot folder" -ForegroundColor Yellow
    exit 1
}

# Install dependencies
Write-Host "Installing dependencies..." -ForegroundColor Yellow
npm install

if ($LASTEXITCODE -ne 0) {
    Write-Host "npm install failed!" -ForegroundColor Red
    exit 1
}

# Create deployment package
Write-Host "Creating deployment package..." -ForegroundColor Yellow
if (Test-Path "function.zip") {
    Remove-Item "function.zip" -Force
}

Compress-Archive -Path index.mjs,package.json,node_modules -DestinationPath function.zip -Force

Write-Host "Deployment package created: function.zip" -ForegroundColor Green
Write-Host ""
Write-Host "Package size:" ((Get-Item function.zip).Length / 1MB).ToString("F2") "MB" -ForegroundColor Cyan
Write-Host ""

# Upload to Lambda
Write-Host "Uploading to AWS Lambda..." -ForegroundColor Yellow
aws lambda update-function-code `
    --function-name retailmind-ai-copilot `
    --zip-file fileb://function.zip `
    --region us-east-1

if ($LASTEXITCODE -ne 0) {
    Write-Host "Upload failed!" -ForegroundColor Red
    Write-Host "Make sure Lambda function 'retailmind-ai-copilot' exists" -ForegroundColor Yellow
    exit 1
}

# Wait for update
Write-Host "Waiting for deployment to complete..." -ForegroundColor Yellow
aws lambda wait function-updated `
    --function-name retailmind-ai-copilot `
    --region us-east-1

Write-Host ""
Write-Host "Deployment complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Test your function:" -ForegroundColor Cyan
Write-Host "1. Go to Lambda console" -ForegroundColor White
Write-Host "2. Open 'retailmind-ai-copilot' function" -ForegroundColor White
Write-Host "3. Click 'Test' tab" -ForegroundColor White
Write-Host "4. Use test event from DEPLOY-LAMBDA-MANUAL.md" -ForegroundColor White
Write-Host ""
Write-Host "Happy coding!" -ForegroundColor Green
