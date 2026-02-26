# Manual Lambda Deployment Guide

## Option 1: Deploy via Console (Easiest for First Time)

### Step 1: Prepare the Code

1. Open your project folder: `backend/functions/aiCopilot/`
2. You should see:
   - `index.mjs`
   - `package.json`

### Step 2: Install Dependencies

```bash
# In terminal, navigate to:
cd backend/functions/aiCopilot

# Install dependencies:
npm install

# You should now see a node_modules folder
```

### Step 3: Create ZIP File

**Windows:**
```bash
# Select these files/folders:
- index.mjs
- package.json
- node_modules (entire folder)

# Right-click → Send to → Compressed (zipped) folder
# Name it: function.zip
```

**Or use PowerShell:**
```powershell
# In backend/functions/aiCopilot folder:
Compress-Archive -Path index.mjs,package.json,node_modules -DestinationPath function.zip -Force
```

### Step 4: Upload to Lambda

1. Go to Lambda console → `retailmind-ai-copilot` function
2. Click "Code" tab
3. Click "Upload from" → ".zip file"
4. Click "Upload" button
5. Select your `function.zip`
6. Click "Save"
7. Wait for upload to complete (may take 30-60 seconds)

### Step 5: Verify Upload

1. In Lambda console, you should see:
   - `index.mjs` file in the file browser
   - `node_modules` folder
   - `package.json`

2. Click on `index.mjs` to view the code

---

## Option 2: Deploy via AWS CLI (Faster for Updates)

```bash
# In backend/functions/aiCopilot folder:

# Install dependencies
npm install

# Create zip
powershell Compress-Archive -Path index.mjs,package.json,node_modules -DestinationPath function.zip -Force

# Upload to Lambda
aws lambda update-function-code \
    --function-name retailmind-ai-copilot \
    --zip-file fileb://function.zip \
    --region us-east-1

# Wait for update
aws lambda wait function-updated \
    --function-name retailmind-ai-copilot \
    --region us-east-1

echo "Deployment complete!"
```

---

## Step 6: Test the Lambda Function

### Test Event JSON:
```json
{
  "body": "{\"query\": \"What is RetailMind AI and how can it help my retail business?\"}"
}
```

### Test Steps:
1. In Lambda console, click "Test" tab
2. Click "Create new event"
3. Event name: `test-query`
4. Paste the JSON above
5. Click "Save"
6. Click "Test" button
7. Check "Execution results"

### Expected Response:
```json
{
  "statusCode": 200,
  "headers": {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*"
  },
  "body": "{\"query\":\"What is RetailMind AI...\",\"response\":\"RetailMind AI is...\",\"model\":\"amazon-nova-pro\"}"
}
```

### If You See Errors:

**Error: "Cannot find module '@aws-sdk/client-bedrock-runtime'"**
- Solution: Make sure `node_modules` is in the zip file

**Error: "Access Denied" or "Bedrock"**
- Solution: Check IAM role has AmazonBedrockFullAccess

**Error: "Task timed out after 3.00 seconds"**
- Solution: Increase timeout to 30 seconds (Configuration → General)

**Error: "Model not found" or "Invalid model ID"**
- Solution: Check Nova Pro is enabled in Bedrock console

---

## Troubleshooting

### Check CloudWatch Logs:
1. Lambda console → Monitor tab
2. Click "View CloudWatch logs"
3. Click latest log stream
4. Look for error messages

### Common Issues:

1. **Zip file too large (>50MB)**
   - Solution: Use Lambda Layers for dependencies (advanced)
   - Or: Deploy via S3 (I can help with this)

2. **Module not found**
   - Solution: Ensure node_modules is included in zip
   - Run `npm install` before zipping

3. **Bedrock access denied**
   - Solution: Verify IAM role permissions
   - Check Bedrock model is enabled

---

## Next Steps After Successful Test

Once Lambda test works:
1. ✅ Create API Gateway
2. ✅ Connect Lambda to API Gateway
3. ✅ Test via HTTP endpoint
4. ✅ Connect frontend to API

You're almost there! 🚀
