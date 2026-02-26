# Connect Frontend to AWS Backend

## Step 1: Get Your API Gateway URL

1. Go to API Gateway console
2. Select "RetailMind-API"
3. Click "Stages" in left sidebar
4. Click "dev"
5. Copy the "Invoke URL" at the top
   - Format: `https://abc123xyz.execute-api.us-east-1.amazonaws.com/dev`

## Step 2: Update Environment Variable

1. Open `.env.local` file in project root
2. Replace `YOUR_API_URL_HERE` with your actual API URL:

```env
VITE_API_URL=https://abc123xyz.execute-api.us-east-1.amazonaws.com/dev
```

3. Save the file

## Step 3: Restart Development Server

```bash
# Stop current dev server (Ctrl+C)
# Then restart:
npm run dev
```

## Step 4: Test the AI Copilot

1. Open browser: http://localhost:5173
2. Navigate to "Command Center"
3. Type a question: "Why are my wireless earbuds not selling?"
4. Click Send
5. Wait for AI response (5-10 seconds)

## Expected Behavior

✅ Loading spinner appears  
✅ AI response shows up in a card  
✅ Response is detailed and specific  
✅ Uses Indian Rupees (₹)  
✅ Toast notification appears  

## Troubleshooting

### Error: "Failed to get AI response"

**Check:**
1. Is `.env.local` file updated with correct URL?
2. Did you restart dev server after updating .env?
3. Is API Gateway deployed to "dev" stage?
4. Does Lambda function work when tested directly?

**Test API directly:**
```powershell
.\test-api.ps1 -ApiUrl "YOUR_API_URL"
```

### Error: "CORS error" in browser console

**Fix:**
1. Go to API Gateway console
2. Select /copilot resource
3. Actions → Enable CORS
4. Enable and replace
5. Actions → Deploy API → dev stage

### Error: "Network request failed"

**Check:**
1. Is your internet connected?
2. Is API URL correct (no typos)?
3. Is API Gateway publicly accessible?

### Response is slow (>10 seconds)

**Normal for first request!**
- Lambda cold start takes 5-10 seconds
- Subsequent requests will be faster (1-2 seconds)
- This is expected behavior

## Success Criteria

You've successfully connected frontend to backend if:

✅ You can type a question in Command Center  
✅ AI responds with detailed, relevant answer  
✅ Response uses Indian Rupees (₹)  
✅ No errors in browser console  
✅ Response time is reasonable (<10 sec first time, <3 sec after)  

## Next Steps

Once this works:
- Day 2: Add price monitoring data
- Day 3: Connect recommendations
- Day 4: Connect alerts
- Day 5: Polish and optimize

🎉 Congratulations! Your AI Copilot is LIVE!
