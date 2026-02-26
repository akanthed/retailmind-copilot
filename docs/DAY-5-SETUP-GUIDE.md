# Day 5: Analytics Dashboard Setup Guide

## Overview
Build comprehensive analytics to track business performance, revenue impact, and decision outcomes.

---

## Step 1: Create Lambda Function in AWS Console

1. Go to AWS Lambda Console
2. Click 'Create function'
3. Configure:
   - Function name: retailmind-analytics
   - Runtime: Node.js 20.x
   - Architecture: x86_64
   - Execution role: Use existing role or create new with AmazonDynamoDBFullAccess
4. Click 'Create function'
5. Configure settings:
   - Timeout: 60 seconds
   - Memory: 512 MB

---

## Step 2: Deploy Analytics Code

cd backend
./deploy-analytics-windows.ps1

---

## Step 3: Add API Gateway Endpoints

Add these endpoints to your RetailMind-API:

1. GET /analytics/overview - Overall business metrics
2. GET /analytics/revenue - Revenue analytics and trends
3. GET /analytics/outcomes - Decision outcomes tracking

For each endpoint:
- Create resource under /analytics
- Add GET method
- Integration: Lambda Function  retailmind-analytics
- Enable CORS
- Deploy to dev stage

---

## What You Get

### Overview Analytics
- Total products and inventory value
- Average profit margin
- Stock health distribution
- Recommendation implementation rate
- Alert statistics

### Revenue Analytics
- Total revenue impact from decisions
- Impact by recommendation type
- Weekly revenue trends
- Average revenue per action

### Outcomes Tracking
- Decision history with before/after metrics
- Revenue impact per decision
- Risk prevention tracking
- Implementation status
