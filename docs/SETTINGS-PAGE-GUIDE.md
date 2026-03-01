# ⚙️ Settings Page - Complete User Guide

## Overview

The **Settings Page** is your control center for configuring notifications and monitoring data health in RetailMind Copilot. Access it from the main navigation menu.

---

## 🔧 Settings Page Features

### Section 1: WhatsApp Notifications

#### Purpose
Receive real-time alerts about:
- 📈 Upcoming festival peaks (14 days before)
- 📊 Demand forecast updates
- ⚠️ Low stock warnings
- 🎁 Festival-specific recommendations
- 💡 Pricing optimization suggestions

#### How to Set Up

**Step 1: Enter Phone Number**
```
Input field: Enter your WhatsApp phone number
Format: +91 98765 43210 (include country code)
Example: +91 (India) +971 (UAE) +1 (USA)
```

**Step 2: Validate Format**
- Must start with "+"
- Must include country code
- Accepts 10-12 digits after country code
- Error message if format is incorrect

**Step 3: Save Settings**
- Click "Save Settings" button
- Blue checkmark appears when saved ✅
- Toast notification confirms: "Settings Saved Successfully"

#### Example Phone Numbers
- India (Vodafone/Airtel/Jio): `+91 98765 43210`
- UAE (Etisalat/Axiix): `+971 98765 4321`
- USA (T-Mobile): `+1 2025551234`
- UK: `+44 7700900123`

#### What Happens After Setup
Once configured, you'll receive WhatsApp messages:

**Message Example 1: Festival Alert (14 days before)**
```
🎉 Festival Alert - Diwali in 14 days!

Your top products will see 2.5x demand surge.

📊 Recommended Actions:
• Electronics: Stock up 400% 
• Jewelry: Stock up 300%
• Sweets: Stock up 200%

💰 Estimated extra revenue: ₹45,000

Check the forecast page for details
```

**Message Example 2: Stock Warning**
```
⚠️ Stock Alert - LOW INVENTORY

Product: Samsung 55" TV (ELEC-001)
Current Stock: 3 units
Days until stockout: 2 days

🚨 URGENT: Order immediately
Suggested quantity: 45 units

Normal demand: 15 units/day
Diwali expected demand: 40 units/day
```

**Message Example 3: Demand Update**
```
📈 Demand Forecast Updated

Product: Gold Necklace Set (JEW-045)
30-day forecast: 120-150 units
Peak day (Diwali): 85 units

Current price: ₹8,999
Competitor price: ₹8,500

💡 Tip: Consider 5% price cut to increase volume
```

---

### Section 2: Live Data Health Check

#### Purpose
Validates that your product data is:
- ✅ Fetched from live sources (Amazon, Flipkart)
- ✅ Current and accurate
- ✅ Accessible (no broken links)
- ✅ Real-time pricing enabled

#### What it Validates

The system checks:
1. **Amazon Links**: Tests product pages for availability
2. **Flipkart Links**: Confirms product access
3. **Price Data**: Verifies pricing is being scraped
4. **Inventory Updates**: Checks if stock levels update in real-time

#### How to Run Validation

**Step 1: Navigate to Settings**
- Click ⚙️ Settings in main menu
- Scroll to "Live Data Health" section

**Step 2: Click "Validate URLs"**
- Button shows: "🔄 Validate URLs"
- While running: "⏳ Validating..." (button is disabled)
- Spinning icon indicates progress

**Step 3: Wait for Results**
- Takes 30-45 seconds to validate all products
- Real-time progress shown
- System checks each product link one by one

**Step 4: Review Health Metrics**

#### Metrics Explained

| Metric | What It Means | Good Value | Action |
|--------|--------------|-----------|--------|
| **Total Products** | Number of products being tracked | Varies | Should include all your products |
| **Working URLs** | Links that returned 200 status | >95% | Check if low - may be Amazon/Flipkart changes |
| **URLs with Data** | Links returning product details | >90% | If low, some links may be outdated |
| **Down URLs** | Links that failed (4xx/5xx errors) | <5% | Fix broken links, products might be delisted |
| **Success Rate** | % of successfully validated URLs | >95% | Below 90% means data issues |
| **Last Checked** | When validation was last run | Recent | Should be within last 24 hours |

#### Example Results

**HEALTHY STATUS** ✅
```
Total Products:     247
Working URLs:       243 (98%)
URLs with Data:     241 (98%)
Down URLs:          4 (2%)
Success Rate:       98%
Last Checked:       Today 10:30 AM
```
Action: No action needed. Excellent data quality.

**WARNING STATUS** ⚠️
```
Total Products:     247
Working URLs:       189 (76%)
URLs with Data:     175 (71%)
Down URLs:          58 (24%)
Success Rate:       71%
Last Checked:       3 days ago
```
Action: Need to investigate. Many URLs might be outdated or delisted on Amazon/Flipkart.

**CRITICAL STATUS** 🔴
```
Total Products:     247
Working URLs:       86 (35%)
URLs with Data:     42 (17%)
Down URLs:          161 (65%)
Success Rate:       17%
Last Checked:       7 days ago
```
Action: URGENT - Major data issues. Contact support. Most product links need updating.

---

## 🔍 How the Settings Page Works Behind the Scenes

### WhatsApp Integration Flow

```
Settings Page
    ↓
User enters phone number
    ↓
Validation: Check format (+91...)
    ↓
Save to Browser Storage (localStorage)
    ↓
Backend receives requests
    ↓
Before sending alerts:
├─ Checks if phone # exists
├─ Validates forecast data
├─ Formats message with:
│  ├─ Festival name
│  ├─ Days until peak
│  ├─ Category recommendations
│  └─ Expected demand surge
    ↓
WhatsApp API
    ↓
💬 Message sent to your phone
```

### Live Data Validation Flow

```
Settings Page
    ↓
User clicks "Validate URLs"
    ↓
Frontend → Backend API
    ↓
DynamoDB retrieves all products
    ↓
For each product:
├─ Fetch Amazon product URL
├─ Fetch Flipkart product URL
├─ Check HTTP response (200 = working)
├─ Parse product data (price, availability)
└─ Store result with timestamp
    ↓
Calculate statistics:
├─ Total: Count all products
├─ Working: Count 200 responses
├─ Data: Count successful parses
├─ Down: Count error responses
└─ Success Rate: (Working / Total) × 100
    ↓
Return metrics to frontend
    ↓
Display in Settings page
```

---

## 🛠️ Troubleshooting Settings

### Issue: "Invalid Format" Error
**Problem**: WhatsApp number validation failed
**Solution**:
- Check number starts with "+"
- Include country code (e.g., +91 for India)
- Remove spaces or dashes
- Use 10-12 digits after country code
**Example Fix**: `+91 98765 43210` → `+919876543210`

### Issue: Messages Not Arriving
**Problem**: Notifications aren't showing up on WhatsApp
**Solutions**:
1. Verify number is saved (green checkmark visible)
2. Check if WhatsApp Business API is active
3. Wait 2-3 minutes (server processing delay)
4. Check WhatsApp number is correct
5. Confirm alerts are enabled in app settings

**If still not working**:
- Try entering number without formatting: `919876543210`
- Check if phone has WhatsApp installed
- Verify internet connection is stable

### Issue: "Validating..." Stuck
**Problem**: URL validation taking too long or stuck
**Solutions**:
1. Close browser tab and navigate back
2. Check internet connection
3. Wait 2-3 minutes (large inventory takes longer)
4. Refresh page if still stuck

**Why it's slow**:
- Each product requires 2 API calls (Amazon + Flipkart)
- 250 products = 500+ API calls
- Network latency adds up
- Expected time: 30-45 seconds

### Issue: Down URLs After Validation
**Problem**: Many URLs shows as "Down" (2xx status failed)
**Root Causes**:
1. **Product delisted**: Amazon/Flipkart removed the product
2. **URL outdated**: Link structure changed (Amazon often updates)
3. **API rate limit**: Server limiting requests
4. **Regional availability**: Product not available in your region

**Solutions**:
1. **Manually check**: Visit Amazon/Flipkart -> search product → update URL
2. **Update in Products page**: Edit product and paste new URL
3. **Re-validate**: Click "Validate URLs" again after updates
4. **Contact seller**: Check if product is still available

---

## 📊 Settings Data Storage

### What's Stored Locally (Browser)
```
localStorage: {
  "whatsapp_number": "+91 98765 43210",
  "language": "en" or "hi",
  "theme": "light" or "dark"
}
```
**Private**: Only stored on your browser
**Synced**: Across tabs/sessions on same device

### What's Stored on Server (DynamoDB)
```
User Settings Table:
├─ User ID
├─ WhatsApp number (encrypted)
├─ Last forecast check time
├─ Products being tracked
└─ Alert preferences

URL Validation Table:
├─ Product ID
├─ Amazon URL (status)
├─ Flipkart URL (status)
├─ Last validated timestamp
└─ Response codes
```
**Secure**: Encrypted in transit
**Backed up**: Auto-backed daily

---

## 💡 Pro Tips for Settings

### Tip 1: Regular Validation Checks
**Recommended Schedule**:
- Every Monday: Full validation
- Weekly before festivals: Extra check
- Daily during peak season (Diwali/Christmas)

### Tip 2: Multiple Numbers
**Not currently supported**, but:
- Each store location: Use main office number
- Team alerts: Add manager/owner number

### Tip 3: WhatsApp Business Account
If you have a WhatsApp Business number:
- Use the main WhatsApp number
- Business app provides better analytics
- Works with both personal and business accounts

### Tip 4: Time Zone Alerts
Alerts are sent in UTC
- Set notifications in WhatsApp app for your timezone
- Important for early morning/late night alerts

---

## 🔐 Security & Privacy

### Data Protection
- ✅ Phone number encrypted in database
- ✅ HTTPS/TLS for all communications
- ✅ No data shared with third parties
- ✅ Compliant with Indian data privacy laws

### What You Control
- ✅ Can change phone number anytime
- ✅ Can delete WhatsApp notifications
- ✅ Can export validation report
- ✅ Can request data deletion

### Permissions Required
- WhatsApp Business API access
- DynamoDB read/write (your data)
- S3 access (for logs, optional)

---

## 📞 Support & Help

### Common Questions

**Q: How often should I validate URLs?**
A: At least weekly, more frequently during festivals.

**Q: What if I don't have WhatsApp?**
A: Feature requires WhatsApp. Email/SMS coming soon.

**Q: Can I validate specific products only?**
A: Currently validates all products. Filtering coming soon.

**Q: How long after validation are results accurate?**
A: Results valid for 7 days. Prices update realtime independently.

**Q: What if validation shows 100% down?**
A: Check internet connection first. Contact support if persists.

---

## 🎬 Quick Start Checklist

```
☐ Step 1: Navigate to Settings page
☐ Step 2: Enter WhatsApp number (+91...)
☐ Step 3: Click "Save Settings"
☐ Step 4: Wait for green checkmark
☐ Step 5: Click "Validate URLs"
☐ Step 6: Review health metrics
☐ Step 7: Fix any critical issues
☐ Step 8: Start receiving alerts!
```

---

**Last Updated**: March 1, 2026
**Settings Page Version**: 2.0
