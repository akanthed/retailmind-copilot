# Design Document: Revenue Impact Dashboard

## Overview

The Revenue Impact Dashboard feature quantifies the business value delivered by RetailMind AI through three key metrics: revenue protected, alert response rate, and competitive positioning score. This feature transforms abstract platform usage into concrete financial outcomes, enabling retailers to justify their investment and optimize their engagement with the system.

The implementation consists of three primary components:
1. **Revenue Calculator Lambda**: Backend service that computes revenue impact metrics from pricing decisions, alert responses, and competitive positioning
2. **DynamoDB Schema**: Data persistence layer storing daily revenue calculations and historical trends
3. **Dashboard UI Components**: React-based visualization displaying KPI cards and trend charts

The system operates in two modes: production mode using actual transaction data, and demo mode generating synthetic but realistic metrics for evaluation purposes.

## Architecture

### System Components

```
┌─────────────────────────────────────────────────────────────────┐
│                         Frontend (React)                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │  KPI Cards   │  │ Trend Chart  │  │  Dashboard Page      │  │
│  │  Component   │  │  (Recharts)  │  │  Integration         │  │
│  └──────┬───────┘  └──────┬───────┘  └──────────┬───────────┘  │
│         │                  │                      │              │
│         └──────────────────┴──────────────────────┘              │
│                            │                                     │
│                    React Query (API Client)                      │
└────────────────────────────┼────────────────────────────────────┘
                             │
                    ┌────────▼────────┐
                    │  API Gateway    │
                    │  /revenue/*     │
                    └────────┬────────┘
                             │
        ┌────────────────────┴────────────────────┐
        │                                         │
┌───────▼──────────┐                    ┌────────▼────────┐
│ GET /summary     │                    │ GET /history    │
│ Returns current  │                    │ Returns 30-day  │
│ month metrics    │                    │ daily data      │
└───────┬──────────┘                    └────────┬────────┘
        │                                         │
        └────────────────────┬────────────────────┘
                             │
                    ┌────────▼────────────┐
                    │ Revenue Calculator  │
                    │  Lambda Function    │
                    └────────┬────────────┘
                             │
        ┌────────────────────┴────────────────────┐
        │                                         │
┌───────▼──────────────┐              ┌──────────▼──────────┐
│ RetailMind-          │              │ RetailMind-         │
│ RevenueImpact        │              │ Alerts              │
│ (New Table)          │              │ (Existing)          │
│                      │              │                     │
│ PK: date             │              │ + responseAction    │
│ SK: metric_type      │              │ + responseTime      │
└──────────────────────┘              └─────────────────────┘
```

### Data Flow

1. **Revenue Calculation Trigger**: Daily scheduled event (CloudWatch Events) or on-demand API call
2. **Data Aggregation**: Lambda queries Alerts table for responses, Products table for pricing changes
3. **Metric Computation**: Calculate revenue protected, response rate, competitive score
4. **Persistence**: Store calculated metrics in RevenueImpact table with date-based partitioning
5. **API Retrieval**: Frontend requests summary or history data via API Gateway
6. **Visualization**: React components render KPI cards and trend charts using Recharts

### Technology Stack

- **Backend**: AWS Lambda (Node.js ESM), DynamoDB, API Gateway
- **Frontend**: React 18, TypeScript, Recharts, React Query
- **Styling**: Tailwind CSS with shadcn/ui components
- **Region**: us-east-1

## Components and Interfaces

### Backend Lambda Function

**File**: `backend/functions/revenueCalculator/index.mjs`

**Handler Structure**:
```javascript
export const handler = async (event) => {
  const httpMethod = event.httpMethod;
  const path = event.path;
  
  if (httpMethod === 'GET' && path.includes('/summary')) {
    return getRevenueSummary(event);
  } else if (httpMethod === 'GET' && path.includes('/history')) {
    return getRevenueHistory(event);
  } else if (httpMethod === 'POST' && path.includes('/calculate')) {
    return calculateRevenueImpact(event);
  }
}
```

**Key Functions**:

1. **getRevenueSummary(event)**
   - Extracts date range from query parameters (default: current month)
   - Queries RevenueImpact table for aggregated metrics
   - Returns: `{ revenue_protected, alert_response_rate, competitive_score }`

2. **getRevenueHistory(event)**
   - Queries last 30 days of daily revenue records
   - Sorts chronologically
   - Returns: Array of `{ date, revenue_protected, competitive_score }`

3. **calculateRevenueImpact()**
   - Scans Alerts table for responses in calculation period
   - Calculates revenue attribution per alert type
   - Computes competitive score from Products and PriceHistory tables
   - Stores results in RevenueImpact table

4. **calculateCompetitiveScore()**
   - Price competitiveness: 40% weight (within 5% of lowest competitor = max points)
   - Stock availability: 30% weight (in stock = full points)
   - Response rate: 30% weight (responded within 24h / total alerts)
   - Returns: Score from 0.0 to 10.0

5. **attributeRevenueToAlert(alert)**
   - `price_adjusted`: Calculate price difference × estimated sales velocity × days since adjustment
   - `restocked`: Estimate prevented stockout loss based on product value and demand
   - `acknowledged`: No direct revenue, but counts toward response rate
   - `dismissed`: No revenue attribution

### API Endpoints

**Base URL**: `https://{api-id}.execute-api.us-east-1.amazonaws.com/dev`

#### GET /revenue/summary

**Query Parameters**:
- `startDate` (optional): ISO date string (default: first day of current month)
- `endDate` (optional): ISO date string (default: today)

**Response** (200 OK):
```json
{
  "revenue_protected": 45230,
  "alert_response_rate": 78.5,
  "competitive_score": 7.8,
  "period": {
    "start": "2024-01-01",
    "end": "2024-01-31"
  },
  "alerts_responded": 22,
  "alerts_total": 28
}
```

**Error Response** (500):
```json
{
  "error": "Internal server error",
  "message": "Failed to retrieve revenue summary"
}
```

#### GET /revenue/history

**Query Parameters**:
- `days` (optional): Number of days to retrieve (default: 30, max: 90)

**Response** (200 OK):
```json
{
  "history": [
    {
      "date": "2024-01-01",
      "revenue_protected": 1520,
      "competitive_score": 7.5
    },
    {
      "date": "2024-01-02",
      "revenue_protected": 1680,
      "competitive_score": 7.6
    }
  ],
  "count": 30
}
```

**Empty State** (200 OK):
```json
{
  "history": [],
  "count": 0
}
```

### Frontend Components

#### RevenueKPICards Component

**File**: `src/components/revenue/RevenueKPICards.tsx`

**Props**:
```typescript
interface RevenueKPICardsProps {
  revenueProtected: number;
  responseRate: number;
  alertsResponded: number;
  alertsTotal: number;
  competitiveScore: number;
  loading?: boolean;
  error?: string;
}
```

**Structure**:
```tsx
<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
  <KPICard
    icon={<IndianRupee />}
    title="Revenue Protected"
    value={formatCurrency(revenueProtected)}
    subtitle="This month"
    loading={loading}
  />
  <KPICard
    icon={<TrendingUp />}
    title="Alert Response"
    value={`${responseRate}%`}
    subtitle={`${alertsResponded}/${alertsTotal} alerts`}
    loading={loading}
  />
  <KPICard
    icon={<Target />}
    title="Competitive Score"
    value={`${competitiveScore}/10`}
    subtitle="Market position"
    loading={loading}
  />
</div>
```

#### RevenueTrendChart Component

**File**: `src/components/revenue/RevenueTrendChart.tsx`

**Props**:
```typescript
interface RevenueTrendChartProps {
  data: Array<{
    date: string;
    revenue_protected: number;
    competitive_score: number;
  }>;
  loading?: boolean;
  error?: string;
}
```

**Recharts Configuration**:
```tsx
<ResponsiveContainer width="100%" height={300}>
  <LineChart data={chartData}>
    <CartesianGrid strokeDasharray="3 3" />
    <XAxis 
      dataKey="date" 
      tickFormatter={(date) => format(new Date(date), 'MMM dd')}
    />
    <YAxis 
      tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}K`}
    />
    <Tooltip 
      formatter={(value) => `₹${value.toLocaleString('en-IN')}`}
      labelFormatter={(date) => format(new Date(date), 'PPP')}
    />
    <Line 
      type="monotone" 
      dataKey="revenue_protected" 
      stroke="hsl(173 58% 39%)" 
      strokeWidth={2}
      dot={{ fill: 'hsl(173 58% 39%)', r: 4 }}
    />
  </LineChart>
</ResponsiveContainer>
```

#### Dashboard Integration

**File**: `src/pages/DashboardPage.tsx` (modifications)

Add revenue section after Quick Stats:
```tsx
{/* Revenue Impact Section */}
<div className="mb-8 animate-fade-in" style={{ animationDelay: "0.15s" }}>
  <h2 className="text-xl font-semibold mb-4">Revenue Impact</h2>
  <RevenueKPICards {...revenueSummary} loading={loadingRevenue} />
  <div className="mt-4 premium-card rounded-2xl p-6">
    <h3 className="font-medium mb-4">30-Day Trend</h3>
    <RevenueTrendChart data={revenueHistory} loading={loadingRevenue} />
  </div>
</div>
```

### API Client Integration

**File**: `src/api/client.ts` (additions)

```typescript
export interface RevenueSummary {
  revenue_protected: number;
  alert_response_rate: number;
  competitive_score: number;
  period: {
    start: string;
    end: string;
  };
  alerts_responded: number;
  alerts_total: number;
}

export interface RevenueHistoryItem {
  date: string;
  revenue_protected: number;
  competitive_score: number;
}

class ApiClient {
  // ... existing methods ...
  
  async getRevenueSummary(startDate?: string, endDate?: string): Promise<ApiResponse<RevenueSummary>> {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    
    const query = params.toString() ? `?${params.toString()}` : '';
    return this.request(`/revenue/summary${query}`, { method: 'GET' });
  }
  
  async getRevenueHistory(days: number = 30): Promise<ApiResponse<{ history: RevenueHistoryItem[]; count: number }>> {
    return this.request(`/revenue/history?days=${days}`, { method: 'GET' });
  }
}
```

## Data Models

### RetailMind-RevenueImpact Table

**Table Type**: DynamoDB Table

**Primary Key**:
- Partition Key: `date` (String, format: YYYY-MM-DD)
- Sort Key: `metric_type` (String, values: "revenue_protected" | "competitive_score" | "response_rate")

**Attributes**:
```typescript
{
  date: string;              // "2024-01-15"
  metric_type: string;       // "revenue_protected" | "competitive_score" | "response_rate"
  value: number;             // Numeric value of the metric
  product_id?: string;       // Optional: specific product attribution
  calculated_at: number;     // Unix timestamp of calculation
  ttl: number;              // Expiration timestamp (365 days from creation)
  metadata?: {              // Optional additional context
    alerts_responded?: number;
    alerts_total?: number;
    products_analyzed?: number;
  }
}
```

**Access Patterns**:
1. Get all metrics for a specific date: Query by `date`
2. Get metric history: Query by `metric_type` with date range
3. Get daily summary: Query by `date` for all metric types

**Indexes**: None required (primary key supports all access patterns)

**TTL Configuration**: 
- Attribute: `ttl`
- Retention: 365 days
- Purpose: Automatic cleanup of old historical data

**Example Records**:
```json
[
  {
    "date": "2024-01-15",
    "metric_type": "revenue_protected",
    "value": 1520,
    "calculated_at": 1705334400000,
    "ttl": 1736870400,
    "metadata": {
      "alerts_responded": 3,
      "products_analyzed": 12
    }
  },
  {
    "date": "2024-01-15",
    "metric_type": "competitive_score",
    "value": 7.8,
    "calculated_at": 1705334400000,
    "ttl": 1736870400
  },
  {
    "date": "2024-01-15",
    "metric_type": "response_rate",
    "value": 78.5,
    "calculated_at": 1705334400000,
    "ttl": 1736870400,
    "metadata": {
      "alerts_responded": 22,
      "alerts_total": 28
    }
  }
]
```

### RetailMind-Alerts Table (Schema Extension)

**New Attributes** (added to existing schema):

```typescript
{
  // ... existing fields ...
  responseAction?: string;   // "acknowledged" | "price_adjusted" | "restocked" | "dismissed" | null
  responseTime?: number;     // Unix timestamp when action was taken
  revenueImpact?: number;   // Calculated revenue attributed to this alert response
}
```

**Response Action Values**:
- `acknowledged`: User viewed and acknowledged the alert
- `price_adjusted`: User changed product price in response
- `restocked`: User ordered more inventory
- `dismissed`: User explicitly dismissed without action
- `null`: No response yet

**Response Time Calculation**:
```javascript
responseTime = actionTimestamp;
isTimelyResponse = (responseTime - createdAt) < (24 * 60 * 60 * 1000); // 24 hours
```

### Revenue Calculation Formulas

#### Revenue Protected from Price Adjustments

```javascript
function calculatePriceAdjustmentRevenue(alert, product) {
  if (alert.responseAction !== 'price_adjusted') return 0;
  
  const priceDifference = alert.data.yourPrice - alert.data.competitorPrice;
  const estimatedDailySales = product.stock / product.stockDays;
  const daysSinceAdjustment = (Date.now() - alert.responseTime) / (1000 * 60 * 60 * 24);
  
  // Revenue protected = price difference × daily sales × days active
  // Assumes matching competitor price prevented 20% sales loss
  const revenueProtected = priceDifference * estimatedDailySales * daysSinceAdjustment * 0.2;
  
  return Math.round(revenueProtected);
}
```

#### Revenue Protected from Restocking

```javascript
function calculateRestockRevenue(alert, product) {
  if (alert.responseAction !== 'restocked') return 0;
  
  // Prevented stockout loss = product value × estimated lost sales
  const dailySales = product.stock / product.stockDays;
  const stockoutDays = Math.max(0, 7 - product.stockDays); // Would have been out for ~7 days
  const lostSalesValue = product.currentPrice * dailySales * stockoutDays;
  
  return Math.round(lostSalesValue);
}
```

#### Competitive Score Formula

```javascript
function calculateCompetitiveScore(products, priceHistory, alerts) {
  let priceScore = 0;
  let stockScore = 0;
  let responseScore = 0;
  
  // Price Competitiveness (40%)
  products.forEach(product => {
    const competitorPrices = priceHistory.filter(p => p.productId === product.id && p.inStock);
    if (competitorPrices.length > 0) {
      const lowestCompetitorPrice = Math.min(...competitorPrices.map(p => p.price));
      const priceDiff = ((product.currentPrice - lowestCompetitorPrice) / lowestCompetitorPrice) * 100;
      
      if (priceDiff <= 5) {
        priceScore += 10; // Within 5% = max points
      } else if (priceDiff <= 10) {
        priceScore += 7;
      } else if (priceDiff <= 15) {
        priceScore += 4;
      } else {
        priceScore += 1;
      }
    }
  });
  priceScore = (priceScore / products.length) * 0.4;
  
  // Stock Availability (30%)
  const inStockCount = products.filter(p => p.stock > 0).length;
  stockScore = (inStockCount / products.length) * 10 * 0.3;
  
  // Alert Response Rate (30%)
  const recentAlerts = alerts.filter(a => a.createdAt > Date.now() - 30 * 24 * 60 * 60 * 1000);
  const respondedAlerts = recentAlerts.filter(a => a.responseAction && a.responseTime - a.createdAt < 24 * 60 * 60 * 1000);
  const responseRate = recentAlerts.length > 0 ? respondedAlerts.length / recentAlerts.length : 0;
  responseScore = responseRate * 10 * 0.3;
  
  return Math.round((priceScore + stockScore + responseScore) * 10) / 10;
}
```

### Demo Data Generation

For demo mode, generate synthetic but realistic data:

```javascript
function generateDemoRevenueData(days = 30) {
  const baseRevenue = 40000; // Monthly base
  const dailyBase = baseRevenue / 30;
  
  const history = [];
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    
    // Add realistic variation (±20%)
    const variation = (Math.random() - 0.5) * 0.4;
    const revenue = Math.round(dailyBase * (1 + variation));
    
    // Competitive score with slight trend upward
    const scoreBase = 7.0 + (days - i) * 0.02;
    const scoreVariation = (Math.random() - 0.5) * 0.6;
    const score = Math.max(6.5, Math.min(8.5, scoreBase + scoreVariation));
    
    history.push({
      date: date.toISOString().split('T')[0],
      revenue_protected: revenue,
      competitive_score: Math.round(score * 10) / 10
    });
  }
  
  return history;
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Revenue Attribution Accuracy

*For any* alert with a response action (price_adjusted or restocked), the calculated revenue impact should match the expected formula based on alert type, product data, and time elapsed since response.

**Validates: Requirements 1.1, 1.2**

### Property 2: Metric Persistence Structure

*For any* calculated revenue metric, when stored in the RevenueImpact table, the record should contain all required fields (date, metric_type, value, calculated_at, ttl) with correct data types.

**Validates: Requirements 1.3, 6.2**

### Property 3: Data Source Fallback

*For any* product in revenue calculation, if actual sales data is available it should be used; otherwise estimated sales velocity (stock / stockDays) should be used as fallback.

**Validates: Requirements 1.4**

### Property 4: Daily to Monthly Aggregation

*For any* set of daily revenue values within a month, the monthly total should equal the sum of all daily values for that month.

**Validates: Requirements 1.5**

### Property 5: Currency Formatting

*For any* revenue value displayed or returned by the API, it should be formatted with the ₹ symbol and proper Indian number format thousand separators.

**Validates: Requirements 1.6**

### Property 6: Date Range Query Filtering

*For any* GET request to /revenue/summary with startDate and endDate parameters, all returned metrics should fall within the specified date range (inclusive).

**Validates: Requirements 2.2**

### Property 7: API Response Structure

*For any* successful API request to /revenue/summary or /revenue/history, the response should contain all required fields (revenue_protected, alert_response_rate, competitive_score for summary; date, revenue_protected, competitive_score for each history item) and return HTTP 200 with valid JSON.

**Validates: Requirements 2.3, 2.4, 3.2, 3.4**

### Property 8: CORS Headers Presence

*For any* API response from the Revenue Calculator Lambda, the response headers should include Access-Control-Allow-Origin.

**Validates: Requirements 2.6, 10.5**

### Property 9: History Chronological Ordering

*For any* revenue history response, the records should be sorted in chronological order with earliest date first and most recent date last.

**Validates: Requirements 3.3**

### Property 10: Alert Response Persistence

*For any* alert acknowledgment or response action, the Alerts table should be updated with the responseAction value and responseTime timestamp.

**Validates: Requirements 4.1**

### Property 11: Response Action Validation

*For any* alert record with a responseAction field, the value should be one of the allowed values: "acknowledged", "price_adjusted", "restocked", "dismissed", or null.

**Validates: Requirements 4.2**

### Property 12: Response Rate Calculation

*For any* set of alerts, the response rate should equal (count of alerts with non-null responseAction / total alert count) × 100, and only alerts from the last 30 days should be included in the calculation.

**Validates: Requirements 4.3, 4.4, 4.6**

### Property 13: Timely Response Classification

*For any* alert with a responseAction, if (responseTime - createdAt) < 24 hours, it should be classified as a timely response.

**Validates: Requirements 4.5**

### Property 14: Competitive Score Range and Precision

*For any* competitive score calculation, the result should be a number between 0.0 and 10.0 (inclusive) with exactly one decimal place.

**Validates: Requirements 5.1**

### Property 15: Competitive Score Weighting Formula

*For any* competitive score calculation, the final score should equal (priceScore × 0.4) + (stockScore × 0.3) + (responseScore × 0.3), where each component is calculated according to its specific rules.

**Validates: Requirements 5.2, 5.3, 5.4, 5.7**

### Property 16: Price Competitiveness Scoring

*For any* product with competitor price data, if the product's current price is within 5% of the lowest competitor price, it should receive maximum price competitiveness points (10) for that product.

**Validates: Requirements 5.5**

### Property 17: Stock Availability Scoring

*For any* product with stock > 0, it should receive full stock availability points in the competitive score calculation.

**Validates: Requirements 5.6**

### Property 18: TTL Calculation

*For any* revenue impact record stored in DynamoDB, the ttl field should equal calculated_at timestamp plus 365 days (in seconds).

**Validates: Requirements 6.3**

### Property 19: Metric Type Separation

*For any* date in the RevenueImpact table, there should be exactly three separate records with metric_type values: "revenue_protected", "competitive_score", and "response_rate".

**Validates: Requirements 6.4**

### Property 20: Upsert Behavior

*For any* attempt to store a revenue record with an existing date and metric_type combination, the system should update the existing record rather than create a duplicate.

**Validates: Requirements 6.5**

### Property 21: KPI Card CSS Styling

*For any* rendered KPI card component, it should have the "premium-card" CSS class applied.

**Validates: Requirements 7.4**

### Property 22: Loading State Display

*For any* dashboard component when loading prop is true, loading spinners should be visible in all KPI cards.

**Validates: Requirements 7.5**

### Property 23: Chart Axis Formatting

*For any* revenue trend chart, Y-axis values should be formatted as "₹XK" (Indian Rupees with K suffix for thousands) and X-axis values should be formatted as abbreviated dates (e.g., "Jan 15").

**Validates: Requirements 8.3, 8.4**

### Property 24: Chart Tooltip Content

*For any* data point in the revenue trend chart, hovering should display a tooltip containing both the exact revenue value (formatted in Indian Rupees) and the date.

**Validates: Requirements 8.5**

### Property 25: Chart Line Styling

*For any* revenue trend chart, the line should use the primary color (hsl(173 58% 39%) - deep teal).

**Validates: Requirements 8.6**

### Property 26: Component Mount Data Fetching

*For any* dashboard component mount, both getRevenueSummary and getRevenueHistory API calls should be triggered.

**Validates: Requirements 9.3, 9.4**

### Property 27: Refresh Button Behavior

*For any* click on the refresh button, the dashboard should trigger new API calls to fetch updated revenue data.

**Validates: Requirements 9.5**

### Property 28: Query Parameter Forwarding

*For any* API Gateway request with query parameters, those parameters should be accessible in the Lambda function event.queryStringParameters object.

**Validates: Requirements 10.3**

### Property 29: HTTP Status Code Preservation

*For any* Lambda function response with a statusCode field, the API Gateway should return that same status code to the client.

**Validates: Requirements 10.4**

### Property 30: Demo Data Constraints

*For any* demo mode revenue data generation, monthly revenue should be between ₹30,000 and ₹60,000, competitive scores should be between 6.5 and 8.5, alert response rates should be between 70% and 90%, and historical data should contain exactly 30 daily data points with realistic variation.

**Validates: Requirements 11.2, 11.3, 11.4, 11.5**

## Error Handling

### Backend Error Handling

**Lambda Function Error Patterns**:

1. **DynamoDB Query Failures**: Wrap all database operations in try-catch blocks, log errors, return 500 status with error message
2. **Invalid Date Range Parameters**: Validate date format, return 400 status for invalid inputs
3. **Missing Required Data**: Return 200 with zero values when no data exists (not an error condition)
4. **Calculation Errors**: Validate calculation results, use safe defaults (0) if invalid

**Error Response Format**:
```json
{
  "error": "Short error identifier",
  "message": "Human-readable description"
}
```

**HTTP Status Codes**:
- 200: Success (including empty results)
- 400: Invalid request parameters
- 500: Server error (database, calculation failures)

### Frontend Error Handling

**React Query Configuration**:
- Retry failed requests 2 times with 1 second delay
- Display toast notifications for errors using getUserFriendlyError helper
- Show error state UI with retry button in components

**Component Error States**:
- Display error icon, message, and retry button
- Maintain layout structure even in error state
- Log technical details to console for debugging

**Network Timeout**: 10 second timeout for all API requests using AbortController

## Testing Strategy

### Dual Testing Approach

- **Unit Tests**: Verify specific examples, edge cases, error conditions
- **Property Tests**: Verify universal properties across randomized inputs
- Both are necessary and complementary for comprehensive coverage

### Property-Based Testing Configuration

**Library**: fast-check (JavaScript/TypeScript)

**Test Configuration**:
- Minimum 100 iterations per property test
- Each test must reference design document property in comment
- Tag format: `// Feature: revenue-impact-dashboard, Property X: [property title]`

### Backend Testing

**Test File**: `backend/functions/revenueCalculator/index.test.mjs`

**Property Tests** (examples):
- Revenue attribution accuracy across all alert types and product data
- Competitive score always between 0.0-10.0 with one decimal
- Response rate calculation formula correctness
- Currency formatting for all revenue values
- Date range filtering for all query combinations

**Unit Tests** (examples):
- Empty data returns zero values with 200 status
- Invalid date format returns 400 error
- Lambda execution failure returns 500 error
- CORS headers present in all responses

### Frontend Testing

**Test Files**: 
- `src/components/revenue/RevenueKPICards.test.tsx`
- `src/components/revenue/RevenueTrendChart.test.tsx`

**Property Tests** (examples):
- Currency formatting with ₹ and separators for all values
- Chart axis formatting for all data ranges
- Component renders correctly for all valid prop combinations

**Unit Tests** (examples):
- KPI cards display correct formats
- Loading spinners appear when loading=true
- Error message and retry button on failure
- Chart renders with correct styling
- Empty state displays when no data

### Integration Testing

**API Integration Tests**:
- GET /revenue/summary returns valid structure
- GET /revenue/history returns chronologically sorted data
- Query parameters are correctly forwarded
- Error responses have correct format

### Test Coverage Goals

- Backend Lambda: 80% code coverage
- Frontend components: 85% code coverage
- All 30 correctness properties: 100% property test coverage
- Critical paths: 100% integration test coverage

