# RetailMind AI Copilot - Model Options

## Amazon Nova Models (December 2024 - Latest!)

### Nova Pro (RECOMMENDED for Hackathon)
- **Model ID:** `us.amazon.nova-pro-v1:0`
- **Best for:** Production-quality responses
- **Cost:** ~$0.0008 per 1K tokens (input), ~$0.0032 per 1K tokens (output)
- **Quality:** Excellent
- **Speed:** Fast
- **Use case:** Main AI Copilot for demo

### Nova Lite (Backup/Testing)
- **Model ID:** `us.amazon.nova-lite-v1:0`
- **Best for:** Fast responses, testing
- **Cost:** ~$0.00006 per 1K tokens (input), ~$0.00024 per 1K tokens (output)
- **Quality:** Good
- **Speed:** Very fast
- **Use case:** Development and testing

### Nova Micro (Ultra-cheap testing)
- **Model ID:** `us.amazon.nova-micro-v1:0`
- **Best for:** Rapid testing, cost optimization
- **Cost:** ~$0.000035 per 1K tokens (input), ~$0.00014 per 1K tokens (output)
- **Quality:** Decent
- **Speed:** Fastest
- **Use case:** Initial development only

## Current Implementation

The `index.mjs` file uses **Nova Pro** by default.

To switch models, change the `modelId` in the code:

```javascript
modelId: "us.amazon.nova-pro-v1:0"     // Production (recommended)
modelId: "us.amazon.nova-lite-v1:0"    // Testing
modelId: "us.amazon.nova-micro-v1:0"   // Development
```

## Why Nova is Perfect for Hackathon

1. ✅ **Latest AWS AI** (December 2024) - judges will be impressed!
2. ✅ **Instant access** - no approval needed
3. ✅ **AWS native** - shows deep AWS knowledge
4. ✅ **Cost effective** - $100 budget = 30,000+ queries
5. ✅ **High quality** - comparable to Claude/GPT
6. ✅ **Fast** - low latency for live demo

## Budget Estimate (Nova Pro)

With $100 budget:
- Input tokens: ~125M tokens (~62,500 queries)
- Output tokens: ~31M tokens (~15,500 responses)
- **Realistic usage:** 5,000-10,000 queries during hackathon
- **Cost:** $20-30 total
- **Remaining:** $70-80 for other services

## Testing in Playground

1. Go to Bedrock Console
2. Click "Playgrounds" → "Chat"
3. Select "Amazon Nova Pro"
4. Test prompt: "Explain pricing strategies for small retailers in India"
5. Verify quality before deploying Lambda

## Deployment

Use the deployment script:
```bash
cd backend
./deploy-copilot.sh
```

Or deploy manually via Lambda console (upload zip file).
