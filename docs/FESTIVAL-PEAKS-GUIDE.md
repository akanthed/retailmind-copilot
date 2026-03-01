# 🎉 Indian Festival Peaks & Demand Forecasting Guide

## Overview

The RetailMind Copilot now includes comprehensive **festival-aware demand forecasting** that tracks all major Indian festivals and their corresponding demand peaks. This helps retailers optimize inventory and pricing strategies.

---

## 📊 How the Forecast Works

### Three-Layer Demand Calculation

The forecast multiplies multiple factors to predict daily demand:

```
Predicted Demand = Base Demand × Festival Impact × Weekend Multiplier × AI Adjustment
```

**Where:**
- **Base Demand**: Historical daily demand (units/day)
- **Festival Impact**: Multiplier for that specific date (1.0 = normal, 2.5 = Diwali peak)
- **Weekend Multiplier**: 1.2x on weekends, 1.0x on weekdays
- **AI Adjustment**: Amazon Bedrock-powered market analysis

---

## 🎆 Festival Calendar 2026 with Peak Periods

### Q1: January - March (Winter & Spring Festivals)

| Festival | Date | Impact | Key Categories | Peak Period |
|----------|------|--------|-----------------|-------------|
| **Christmas Pre-Peak** | Dec 20, 2025 | 1.8x | Electronics, Toys, Clothing | 5 days before Christmas |
| **Christmas** | Dec 25, 2025 | 2.2x | Electronics, Toys, Food, Gifts | 🔴 Highest peak of year |
| **New Year Peak** | Jan 1, 2026 | 1.6x | Electronics, Fashion, Gifts | Shopping frenzy |
| **Wedding Season Peak** | Jan 8, 2026 | 1.7x | Jewelry, Clothing, Accessories | Peak wedding shopping |
| **Makar Sankranti** | Jan 14, 2026 | 1.4x | Food, Clothing, Sweets | Regional peak |
| **Republic Day** | Jan 26, 2026 | 1.3x | Electronics, Fashion | Sales & patriotic items |
| **Spring Sales Peak** | Feb 1, 2026 | 1.5x | Electronics, Clothing, Fashion | Seasonal sales |
| **Holi Pre-Festival Peak** | Mar 1, 2026 | 1.9x | Colors, Food, Festival Items | Peak buying week |
| **Holi** | Mar 14, 2026 | 2.1x | Food, Colors, Sweets, Clothing | 🟡 Major festival peak |

### Q2: April - June (Summer & Wedding Season)

| Festival | Date | Impact | Key Categories | Peak Period |
|----------|------|--------|-----------------|-------------|
| **Ram Navami** | Apr 2, 2026 | 1.3x | Food, Religious Items | Regional religious peak |
| **Summer Offers Peak** | Apr 15, 2026 | 1.4x | Electronics, Clothing | Seasonal sales |
| **Back to School Peak** | May 15, 2026 | 1.6x | Electronics, Books, Stationery | Summer holidays shopping |
| **Wedding Season Peak-2** | May 20, 2026 | 1.8x | Jewelry, Clothing, Home Decor | Peak wedding season |
| **Monsoon Season Peak** | Jun 15, 2026 | 1.3x | Clothing, Footwear | Rainy season demand |

### Q3: July - September (Monsoon & Festive Prep)

| Festival | Date | Impact | Key Categories | Peak Period |
|----------|------|--------|-----------------|-------------|
| **Rakhi Pre-Peak** | Aug 1, 2026 | 1.5x | Jewelry, Gifts, Sweets | Sibling celebration |
| **Independence Day** | Aug 15, 2026 | 1.4x | Electronics, Fashion | National holiday |
| **Janmashtami** | Aug 27, 2026 | 1.3x | Food, Sweets, Religious Items | Krishna worship |
| **Navratri Pre-Peak** | Sep 1, 2026 | 1.7x | Clothing, Jewelry, Home Decor | Festival season begins |
| **Ganesh Chaturthi Peak** | Sep 17, 2026 | 1.8x | Food, Sweets, Religious Items | Major temple festival |

### Q4: October - December (🔴 DIWALI SUPERCYCLE - Strongest Peak)

| Festival | Date | Impact | Key Categories | Peak Period |
|----------|------|--------|-----------------|-------------|
| **Diwali Season Starts** | Oct 1, 2026 | 1.6x | Electronics, Jewelry, Home Decor | 5+ weeks of peak |
| **Dussehra** | Oct 15, 2026 | 1.7x | Electronics, Clothing, Jewelry | Navratri culmination |
| **Diwali Peak Starts (2 weeks before)** | Oct 21, 2026 | 1.9x | Electronics, Jewelry, Clothing | 🔴 **CRITICAL PEAK** |
| **Diwali** | Nov 4, 2026 | 2.5x | Electronics, Jewelry, Sweets, Home Decor | 🔴 **ABSOLUTE PEAK** - Highest impact of year |
| **Guru Nanak Jayanti** | Nov 19, 2026 | 1.4x | Food, Clothing, Religious Items | Sikh festival |
| **Black Friday/Year-End Sales** | Nov 25, 2026 | 1.8x | Electronics, Fashion, Home | Global retail peak |
| **Christmas Pre-Season Peak** | Dec 1, 2026 | 1.7x | Electronics, Toys, Home, Gifts | Final quarter push |

---

## 📈 Key Demand Peak Insights for India

### Absolute Peak Periods (2.0x+ multiplier)
1. **Diwali (Nov 4)** - 2.5x impact 🏆 HIGHEST
2. **Christmas (Dec 25)** - 2.2x impact
3. **Holi (Mar 14)** - 2.1x impact

### Major Peaks (1.7x - 1.9x)
- Diwali 2-week lead-up period (Oct 21 - Oct 31)
- Wedding season peaks
- Holi pre-festival (Mar 1)
- New Year shopping (Jan 1)
- Black Friday (Nov 25)

### Why Diwali is the Strongest Peak
- **Duration**: 6+ weeks of elevated demand (Oct 1 - Nov 30)
- **Categories**: Nearly all consumer goods
- **Consumer Psychology**: Gift-giving, home decoration, festive fashion
- **Retail Tradition**: Major discount season across India
- **2.5x Impact**: Demand surges 150% above baseline

### Why Holi & Christmas are Strong
- **Holi (2.1x)**: Festival of colors, sweets, new clothes
- **Christmas (2.2x)**: Year-end shopping, gift season, electronics

---

## 🎯 Settings Page Features

### 1. WhatsApp Integration
**Purpose**: Get real-time demand alerts for upcoming peak periods

**Setup**:
1. Go to Settings page
2. Enter phone number with country code: `+91 98765 43210`
3. Click "Save Settings"

**Alerts You'll Receive**:
- 📊 Festival peak approaching (14 days before)
- ⚠️ Stock running low warnings
- 📈 Surge in demand detected
- 🎁 Festival-specific recommendations

### 2. Live Data Health Check
**Purpose**: Validate that product URLs are accessible and pricing is real-time

**Features**:
- ✅ Checks Amazon product links
- ✅ Validates Flipkart product access
- 📊 Shows total products being monitored
- 🔗 Displays URL validation success rate
- ⏱️ Shows last check time

**How to Use**:
1. Go to Settings page
2. Click "Validate URLs" button
3. System checks all configured product links
4. Review health metrics

**What the Metrics Mean**:
| Metric | Meaning |
|--------|---------|
| **Total Products** | Number of products being tracked for price changes |
| **Working URLs** | Links that are currently accessible |
| **Down URLs** | Links that returned errors (may need updating) |
| **Success Rate** | Percentage of working product links |
| **Last Checked** | When validation was last run |

---

## 💡 How to Use the Forecast in Operations

### Step 1: View the Forecast
1. Go to **Forecast page**
2. Select a product
3. View 30-day demand predictions

### Step 2: Identify Peak Periods
- 🎉 Look for **Festival markers** on the chart
- Red dots = Festival dates with surge
- Peak labels show expected demand increase

### Step 3: Plan Inventory
Based on the forecast:

**If stock runs out before festival**:
1. Act urgently if stockout is < 7 days
2. Order **30 days of average demand**
3. Add 50% extra for festival multiplier

**If festival is 14 days away**:
1. Stock up with formula: `Current Stock + (Avg Daily Demand × Festival Impact × 14)`
2. Example: If daily demand is 10 units and Diwali impact is 2.5x:
   - Order: `10 × 2.5 × 14 = 350 additional units`

**If inventory is too high**:
1. Run promotional discounts
2. Prepare for eventual festival demand
3. Avoid stockouts before major peaks

### Step 4: Pricing Strategy
- **During pre-peak (7-14 days before)**: Maintain normal pricing
- **At festival (exact date)**: Offer modest discounts to attract volume
- **Post-festival**: Clear remaining inventory with higher discounts
- **Before next festival**: Resume normal margins

---

## 🤖 AI-Powered Enhancements

The forecast uses **Amazon Bedrock Nova Pro** to analyze:
- Product category trends in Indian market
- Regional demand variations
- Competitor pricing impact
- Supply chain constraints
- Weather and seasonal factors

**Confidence Score**: How certain the AI is about predictions (0.6-0.95)
- Higher = more historical data available
- Lower = new products or unusual market conditions

---

## 📋 Festival Categories Chart

Different festivals affect different product categories:

```
ELECTRONICS & GADGETS
├─ Diwali (2.5x) 🔴
├─ Christmas (2.2x) 🟠
├─ Holi (2.1x) 🟡
└─ New Year (1.6x) 🟡

FASHION & CLOTHING
├─ Holi (2.1x) - New clothes tradition
├─ Diwali (2.5x) - Festival wear
├─ Wedding Season (1.7-1.8x)
└─ Independence Day (1.4x)

JEWELRY & ACCESSORIES
├─ Diwali (2.5x) - Jewelry gifts
├─ Wedding Season (1.8x) - Engagement rings
├─ Rakhi (1.5x) - Gift bracelets
└─ Dussehra (1.7x)

FOOD & SWEETS
├─ Diwali (2.5x) - Festival sweets
├─ Holi (2.1x) - Festive foods
├─ Janmashtami (1.3x) - Temple offerings
└─ Makar Sankranti (1.4x)

HOME & DECOR
├─ Diwali (2.5x) - Diyas, lights, decorations
├─ Wedding Season (1.8x) - Home gifts
└─ Navratri (1.7x)

BOOKS & EDUCATION
├─ Back to School (1.6x) - May-June
└─ Christmas (2.2x) - Gift books
```

---

## 🚀 Pro Tips for Maximum Profit

### 1. **Diwali Strategy** (Start planning Oct 1)
- Oct 1-20: Stock up 3-4x normal inventory
- Oct 21-31: Aggressive marketing campaign
- Nov 1-4: Peak pricing (high demand absorbs)
- Nov 5-15: Clear excess with 10-20% discount

### 2. **Holi Strategy** (Start planning Feb 15)
- Feb 15-28: Increase color & sweet inventory
- Mar 1-13: Launch "Holi Offers" campaign
- Mar 14-20: Peak discount period
- Mar 21+: Clear remaining inventory

### 3. **Christmas Strategy** (Start planning Oct 1)
- Oct 1-Nov 20: Plan gift bundles
- Nov 20-Dec 20: Ramp up toy & electronics stock
- Dec 21-24: Black Friday equivalent
- Dec 25+: Gift-wrap promotions

### 4. **Wedding Season** (Jan-Feb & May-Jun)
- Jewelry: +70% stock (1.7-1.8x demand)
- Clothing: Ethnic wear +50%
- Home: Decor items +40%

### 5. **Regular Peaks to Watch**
- Black Friday (Nov 25): 1.8x
- New Year (Jan 1): 1.6x
- Back to School (May 15): 1.6x

---

## 🔍 Troubleshooting

### Issue: Forecast shows high demand but no festival marker
**Solution**: Check if the product category matches festival categories. Some festivals only affect specific categories.

### Issue: Confidence score is low (< 0.75)
**Solution**: New products have less historical data. Add more sales history for better predictions.

### Issue: Actual sales don't match forecast
**Solution**: 
1. Check Live Data Health - URLs might be outdated
2. Verify product pricing is correct
3. Review competitor prices
4. Check for local supply issues

### Issue: Festival doesn't show on calendar
**Solution**: Regional festivals may vary. The system tracks major national festivals only.

---

## 📞 Support

For questions about specific festivals or demand peaks in your region, contact customer support with:
- Product category
- Location/state
- Time period of concern

---

**Last Updated**: March 1, 2026
**Version**: 2.0 - Enhanced Festival Calendar
