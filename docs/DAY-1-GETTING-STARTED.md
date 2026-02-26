# DAY 1: AWS Setup + First Lambda + Bedrock AI 🚀

**Goal:** Learn AWS basics while building AI Copilot  
**Time:** 10-12 hours  
**Budget Used Today:** ~$5-10

---

## 🎓 WHAT YOU'LL LEARN TODAY

### AWS Concepts
1. **IAM (Identity & Access Management)** - Security and permissions
2. **Lambda** - Serverless functions (no servers to manage!)
3. **API Gateway** - Create REST APIs
4. **DynamoDB** - NoSQL database
5. **Amazon Bedrock** - Generative AI service
6. **CloudWatch** - Monitoring and logs

### Skills You'll Gain
- Creating AWS resources via Console
- Writing Lambda functions in TypeScript
- Calling AWS services from code
- Deploying serverless applications
- Using AI APIs (Bedrock)

---

## ⏰ HOUR-BY-HOUR PLAN

### HOUR 1-2: AWS Account Setup (Learning: IAM, Billing)

#### Step 1: Create/Verify AWS Account
```bash
# Go to: https://aws.amazon.com/
# Sign up or sign in
# Add credit card (required, but we'll stay under $100)
```

#### Step 2: Set Up Billing Alerts (IMPORTANT!)
```bash
# In AWS Console:
1. Search for "Billing" in top search bar
2. Click "Billing Dashboard"
3. Left sidebar → "Budgets"
4. Click "Create budget"
5. Choose "Cost budget"
6. Set budget amount: $100
7. Add alerts at: $50, $75, $90
8. Enter your email
9. Create budget
```

**🎓 Learning:** This prevents surprise bills. AWS charges by usage, so monitoring is crucial.

#### Step 3: Create IAM User (Security Best Practice)
```bash
# In AWS Console:
1. Search for "IAM" in top search bar
2. Click "Users" in left sidebar
3. Click "Create user"
4. Username: "retailmind-dev"
5. Check "Provide user access to AWS Management Console"
6. Choose "I want to create an IAM user"
7. Set custom password (save it!)
8. UNCHECK "User must create new password at next sign-in"
9. Click "Next"

# Attach Permissions:
10. Choose "Attach policies directly"
11. Search and select these policies:
    - AWSLambda_FullAccess
    - AmazonDynamoDBFullAccess
    - AmazonAPIGatewayAdministrator
    - AmazonBedrockFullAccess
    - CloudWatchFullAccess
    - AmazonSNSFullAccess
    - AmazonEventBridgeFullAccess
    - IAMReadOnlyAccess
12. Click "Next" → "Create user"

# Create Access Keys:
13. Click on the user you just created
14. Go to "Security credentials" tab
15. Scroll to "Access keys"
16. Click "Create access key"
17. Choose "Command Line Interface (CLI)"
18. Check "I understand..." → Next
19. SAVE THESE KEYS SECURELY:
    - Access Key ID: AKIA...
    - Secret Access Key: (only shown once!)
20. Download .csv file as backup
```

**🎓 Learning:** 
- Root account = full access (dangerous to use daily)
- IAM users = limited permissions (safer)
- Access keys = programmatic access (for CLI/code)

#### Step 4: Install AWS CLI
```bash
# Windows (PowerShell as Administrator):
msiexec.exe /i https://awscli.amazonaws.com/AWSCLIV2.msi

# Verify installation:
aws --version
# Should show: aws-cli/2.x.x

# Configure AWS CLI:
aws configure
# Enter:
# AWS Access Key ID: [paste from step 3]
# AWS Secret Access Key: [paste from step 3]
# Default region name: us-east-1
# Default output format: json

# Test it works:
aws sts get-caller-identity
# Should show your account info
```

**🎓 Learning:** AWS CLI lets you control AWS from terminal. Region matters - us-east-1 has most services.

---

### HOUR 3-4: DynamoDB Setup (Learning: NoSQL Databases)

#### Step 1: Create DynamoDB Tables

**Table 1: Products**
```bash
# In AWS Console:
1. Search for "DynamoDB"
2. Click "Create table"
3. Table name: "RetailMind-Products"
4. Partition key: "id" (String)
5. Table settings: "Customize settings"
6. Table class: "DynamoDB Standard"
7. Capacity mode: "On-demand" (pay per request)
8. Encryption: "Owned by Amazon DynamoDB" (free)
9. Click "Create table"
```

**Table 2: PriceHistory**
```bash
# Repeat above with:
- Table name: "RetailMind-PriceHistory"
- Partition key: "id" (String)
- Sort key: "timestamp" (Number)
- Capacity mode: "On-demand"
```

**Table 3: Recommendations**
```bash
- Table name: "RetailMind-Recommendations"
- Partition key: "id" (String)
- Capacity mode: "On-demand"
```

**Table 4: Alerts**
```bash
- Table name: "RetailMind-Alerts"
- Partition key: "id" (String)
- Sort key: "createdAt" (Number)
- Capacity mode: "On-demand"
```

**Table 5: Conversations**
```bash
- Table name: "RetailMind-Conversations"
- Partition key: "sessionId" (String)
- Sort key: "timestamp" (Number)
- Capacity mode: "On-demand"
```

**🎓 Learning:**
- **Partition key** = unique identifier (like primary key in SQL)
- **Sort key** = optional, for ordering/querying
- **On-demand** = no capacity planning, pay per request (perfect for hackathon)
- **Provisioned** = cheaper if you know traffic (not for us now)

#### Step 2: Test DynamoDB with CLI
```bash
# Add a test product:
aws dynamodb put-item \
    --table-name RetailMind-Products \
    --item '{
        "id": {"S": "test-123"},
        "name": {"S": "Test Product"},
        "price": {"N": "99.99"}
    }'

# Read it back:
aws dynamodb get-item \
    --table-name RetailMind-Products \
    --key '{"id": {"S": "test-123"}}'

# Delete test item:
aws dynamodb delete-item \
    --table-name RetailMind-Products \
    --key '{"id": {"S": "test-123"}}'
```

**🎓 Learning:** DynamoDB uses JSON format with type indicators (S=String, N=Number, etc.)

---

### HOUR 5-6: First Lambda Function (Learning: Serverless)

#### Step 1: Create Lambda Function via Console

```bash
# In AWS Console:
1. Search for "Lambda"
2. Click "Create function"
3. Choose "Author from scratch"
4. Function name: "retailmind-hello-world"
5. Runtime: "Node.js 20.x"
6. Architecture: "x86_64"
7. Permissions: "Create a new role with basic Lambda permissions"
8. Click "Create function"
```

#### Step 2: Write Your First Lambda Code

```javascript
// Replace the default code with this:
export const handler = async (event) => {
    console.log('Event received:', JSON.stringify(event, null, 2));
    
    const response = {
        statusCode: 200,
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
            message: 'Hello from RetailMind AI!',
            timestamp: new Date().toISOString(),
            event: event
        })
    };
    
    return response;
};
```

**Click "Deploy" button** (top right)

#### Step 3: Test Lambda Function

```bash
# In Lambda console:
1. Click "Test" tab
2. Event name: "test-event"
3. Event JSON:
{
  "name": "RetailMind",
  "action": "test"
}
4. Click "Save"
5. Click "Test" button
6. Check "Execution results" - should see success!
```

**🎓 Learning:**
- Lambda = function that runs on-demand (no server management!)
- Event = input data (from API Gateway, EventBridge, etc.)
- Response = what Lambda returns
- Console.log = goes to CloudWatch Logs

#### Step 4: View CloudWatch Logs

```bash
# In Lambda console:
1. Click "Monitor" tab
2. Click "View CloudWatch logs"
3. Click the latest log stream
4. See your console.log output!
```

**🎓 Learning:** CloudWatch = AWS logging service. Every Lambda execution creates logs.

---

### HOUR 7-8: API Gateway (Learning: REST APIs)

#### Step 1: Create API Gateway

```bash
# In AWS Console:
1. Search for "API Gateway"
2. Click "Create API"
3. Choose "REST API" (not private)
4. Click "Build"
5. Choose "New API"
6. API name: "RetailMind-API"
7. Description: "RetailMind AI Backend API"
8. Endpoint Type: "Regional"
9. Click "Create API"
```

#### Step 2: Create Resource and Method

```bash
# Create /hello resource:
1. Click "Actions" → "Create Resource"
2. Resource Name: "hello"
3. Resource Path: "hello"
4. Enable CORS: CHECK
5. Click "Create Resource"

# Create GET method:
1. Select /hello resource
2. Click "Actions" → "Create Method"
3. Choose "GET" from dropdown
4. Click checkmark

# Connect to Lambda:
1. Integration type: "Lambda Function"
2. Use Lambda Proxy integration: CHECK
3. Lambda Region: us-east-1
4. Lambda Function: retailmind-hello-world
5. Click "Save"
6. Click "OK" on permission popup
```

#### Step 3: Deploy API

```bash
# In API Gateway console:
1. Click "Actions" → "Deploy API"
2. Deployment stage: "[New Stage]"
3. Stage name: "dev"
4. Click "Deploy"
5. COPY the "Invoke URL" (looks like: https://abc123.execute-api.us-east-1.amazonaws.com/dev)
```

#### Step 4: Test API

```bash
# In your browser or terminal:
curl https://YOUR-API-URL/dev/hello

# Should return:
{
  "message": "Hello from RetailMind AI!",
  "timestamp": "2026-02-25T...",
  "event": {...}
}
```

**🎓 Learning:**
- API Gateway = creates REST APIs
- Resource = URL path (/hello)
- Method = HTTP verb (GET, POST, etc.)
- Stage = environment (dev, prod)
- Lambda Proxy = passes full request to Lambda

---

### HOUR 9-10: Amazon Bedrock Setup (Learning: Generative AI)

#### Step 1: Enable Bedrock Model Access

```bash
# In AWS Console:
1. Search for "Bedrock"
2. Click "Model access" in left sidebar
3. Click "Manage model access" (orange button)
4. Find "Claude 3 Sonnet" by Anthropic
5. Check the box next to it
6. Also check "Claude 3 Haiku" (cheaper, faster)
7. Click "Request model access" at bottom
8. Wait 1-2 minutes for "Access granted" status
9. Refresh page to verify
```

**🎓 Learning:**
- Bedrock = AWS service for AI models
- Claude = Anthropic's AI (like ChatGPT)
- Sonnet = balanced (quality + speed)
- Haiku = fast and cheap (good for testing)

#### Step 2: Test Bedrock in Playground

```bash
# In Bedrock console:
1. Click "Playgrounds" → "Chat"
2. Select model: "Claude 3 Sonnet"
3. Type: "Explain what a pricing copilot for retailers does"
4. Click "Run"
5. See AI response!
```

**🎓 Learning:** Playground = test AI models before coding. Great for prompt engineering.

---

### HOUR 11-12: AI Copilot Lambda (Learning: Bedrock Integration)

#### Step 1: Create AI Copilot Lambda

```bash
# In Lambda console:
1. Create function
2. Name: "retailmind-ai-copilot"
3. Runtime: Node.js 20.x
4. Create function
```

#### Step 2: Add Bedrock Permissions

```bash
# In Lambda console (retailmind-ai-copilot):
1. Click "Configuration" tab
2. Click "Permissions" in left sidebar
3. Click the role name (opens IAM)
4. Click "Add permissions" → "Attach policies"
5. Search "Bedrock"
6. Check "AmazonBedrockFullAccess"
7. Click "Add permissions"
```

#### Step 3: Install AWS SDK

```bash
# In Lambda console:
1. Click "Code" tab
2. We'll add dependencies in next step
```

#### Step 4: Write AI Copilot Code

I'll create this file for you:


#### Step 5: Deploy AI Copilot Lambda

```bash
# In your terminal (in project root):
cd backend

# Make script executable (Mac/Linux):
chmod +x deploy-copilot.sh

# Run deployment:
./deploy-copilot.sh

# Windows (use Git Bash or run commands manually):
cd functions/aiCopilot
npm install
# Then zip and upload via Lambda console
```

**Manual Upload (if script doesn't work):**
```bash
# In functions/aiCopilot folder:
1. Run: npm install
2. Select all files (index.mjs, package.json, node_modules)
3. Right-click → Compress/Zip
4. Name it: function.zip
5. In Lambda console → Upload from → .zip file
6. Upload function.zip
7. Click "Save"
```

#### Step 6: Test AI Copilot

```bash
# In Lambda console:
1. Click "Test" tab
2. Event name: "test-query"
3. Event JSON:
{
  "body": "{\"query\": \"What is RetailMind AI and how can it help my retail business?\"}"
}
4. Click "Test"
5. Check response - should see AI answer!
```

**🎓 Learning:**
- AWS SDK = libraries to call AWS services from code
- Bedrock Runtime = service to invoke AI models
- InvokeModelCommand = sends prompt to AI model
- Response parsing = extract AI text from JSON

#### Step 7: Connect AI Copilot to API Gateway

```bash
# In API Gateway console:
1. Select "RetailMind-API"
2. Click "Actions" → "Create Resource"
3. Resource Name: "copilot"
4. Enable CORS: CHECK
5. Create Resource

6. Select /copilot
7. Actions → Create Method → POST
8. Integration type: Lambda Function
9. Use Lambda Proxy: CHECK
10. Lambda Function: retailmind-ai-copilot
11. Save → OK

12. Actions → Deploy API
13. Stage: dev
14. Deploy
```

#### Step 8: Test AI Copilot via API

```bash
# In terminal:
curl -X POST https://YOUR-API-URL/dev/copilot \
  -H "Content-Type: application/json" \
  -d '{"query": "Why are my wireless earbuds not selling well?"}'

# Should get AI response!
```

**🎓 Learning:** Now your AI is accessible via HTTP API - ready for frontend integration!

---

## 🎉 DAY 1 ACHIEVEMENTS

### What You Built Today:
✅ AWS account with proper security (IAM)  
✅ 5 DynamoDB tables for data storage  
✅ First Lambda function (Hello World)  
✅ API Gateway with REST endpoints  
✅ AI Copilot powered by Amazon Bedrock  
✅ Full serverless backend foundation  

### AWS Services You Learned:
1. ✅ IAM - Security and permissions
2. ✅ Lambda - Serverless functions
3. ✅ API Gateway - REST APIs
4. ✅ DynamoDB - NoSQL database
5. ✅ Bedrock - Generative AI
6. ✅ CloudWatch - Logging and monitoring

### Skills Gained:
- Creating AWS resources via Console
- Writing serverless functions
- Calling AI APIs
- Deploying to AWS
- Reading CloudWatch logs
- Testing with curl/Postman

---

## 📊 COST TRACKER (Day 1)

### Estimated Costs Today:
- Lambda invocations: $0 (free tier)
- DynamoDB: $0 (free tier)
- API Gateway: $0 (free tier)
- Bedrock API calls: ~$0.50 (testing)
- **Total: ~$0.50**

### Budget Remaining: **$99.50** 💰

---

## 🔍 TROUBLESHOOTING

### Issue: "Access Denied" when calling Bedrock
**Solution:**
```bash
# Check IAM role has Bedrock permissions:
1. Go to Lambda → Configuration → Permissions
2. Click role name
3. Verify "AmazonBedrockFullAccess" is attached
4. If not, add it
```

### Issue: Lambda timeout
**Solution:**
```bash
# Increase timeout:
1. Lambda → Configuration → General configuration
2. Click "Edit"
3. Timeout: 30 seconds
4. Save
```

### Issue: CORS errors in browser
**Solution:**
```bash
# Enable CORS in API Gateway:
1. Select resource
2. Actions → Enable CORS
3. Check all methods
4. Enable
5. Deploy API again
```

### Issue: "Module not found" error
**Solution:**
```bash
# Ensure node_modules is in zip:
cd functions/aiCopilot
npm install
# Verify node_modules folder exists
# Re-zip everything including node_modules
```

---

## 🏠 HOMEWORK (Optional but Recommended)

### Practice Tasks:
1. **Create another Lambda function** that returns current time
2. **Add it to API Gateway** at /time endpoint
3. **Test with curl** and verify it works
4. **Check CloudWatch logs** to see execution details

### Learning Resources:
- AWS Lambda docs: https://docs.aws.amazon.com/lambda/
- Bedrock docs: https://docs.aws.amazon.com/bedrock/
- DynamoDB docs: https://docs.aws.amazon.com/dynamodb/

### Questions to Explore:
- What happens if Lambda runs longer than timeout?
- How does DynamoDB pricing work?
- What's the difference between Claude Sonnet and Haiku?

---

## 📝 NOTES FOR TOMORROW (Day 2)

### What We'll Build:
- Price Monitor Lambda with EventBridge
- DynamoDB CRUD operations
- Synthetic data generator
- Connect frontend to real API

### What You'll Learn:
- EventBridge scheduled rules
- DynamoDB queries and scans
- Lambda environment variables
- Frontend API integration with React

### Preparation:
- Keep AWS Console open
- Have API Gateway URL handy
- Review DynamoDB table names
- Get good sleep! 😴

---

## 🎯 SUCCESS CRITERIA

You've successfully completed Day 1 if:
- ✅ You can log into AWS Console
- ✅ You have 5 DynamoDB tables created
- ✅ Your AI Copilot Lambda responds to test events
- ✅ API Gateway returns AI responses via curl
- ✅ You understand what each AWS service does
- ✅ You're excited for Day 2! 🚀

---

## 💬 QUESTIONS?

I'm here to help! Common questions:

**Q: Do I need to know Node.js well?**  
A: Basic JavaScript is enough. I'll provide all code.

**Q: What if I make a mistake in AWS?**  
A: No worries! We can delete and recreate resources. That's how you learn.

**Q: Is $100 really enough?**  
A: Yes! Most services are free tier. Bedrock is the only real cost (~$30-40 total).

**Q: Can I use Python instead of Node.js?**  
A: Yes! Lambda supports Python. Let me know and I'll adjust code.

**Q: How do I delete resources to save money?**  
A: I'll show you at the end. But don't worry - we're well under budget.

---

## 🚀 READY FOR DAY 2?

Tomorrow we'll:
1. Build Price Monitor with real data
2. Set up EventBridge automation
3. Connect your beautiful frontend to the backend
4. See live data in your dashboard!

**Get some rest - tomorrow we make it REAL!** 💪

---

*"The expert in anything was once a beginner."*  
*You're doing great! Keep going!* 🌟
