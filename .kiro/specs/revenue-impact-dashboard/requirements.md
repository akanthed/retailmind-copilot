# Requirements Document

## Introduction

The Revenue Impact Dashboard feature provides quantifiable ROI metrics for RetailMind AI users by tracking revenue protected through pricing recommendations, alert responses, and competitive positioning. This feature demonstrates tangible business value by calculating and visualizing financial outcomes from platform usage.

## Glossary

- **Revenue_Calculator**: AWS Lambda function that computes revenue impact metrics
- **Revenue_Impact_Table**: DynamoDB table (RetailMind-RevenueImpact) storing calculated revenue metrics
- **Alerts_Table**: DynamoDB table (RetailMind-Alerts) storing alert records and response actions
- **Alert_Response**: User action taken in response to an alert (acknowledged, price_adjusted, restocked, dismissed)
- **Revenue_Protected**: Currency amount representing revenue saved or gained through platform actions
- **Competitive_Score**: Numeric value from 0 to 10 indicating market position strength
- **Response_Rate**: Percentage of alerts that received user action within 24 hours
- **Dashboard_UI**: React component displaying revenue impact visualizations
- **API_Gateway**: AWS service routing HTTP requests to Lambda functions
- **Impact_Period**: Time range for revenue calculations (daily, monthly, or custom date range)

## Requirements

### Requirement 1: Revenue Impact Calculation

**User Story:** As a retailer, I want to see how much revenue I've protected through pricing decisions, so that I can justify the platform investment.

#### Acceptance Criteria

1. WHEN a pricing recommendation is applied by the user, THE Revenue_Calculator SHALL calculate the revenue difference between recommended price and previous price
2. WHEN an alert triggers a user action, THE Revenue_Calculator SHALL attribute revenue impact to that alert response
3. THE Revenue_Calculator SHALL store calculated metrics in the Revenue_Impact_Table with timestamp, product_id, impact_amount, and impact_type fields
4. WHEN calculating revenue impact, THE Revenue_Calculator SHALL use actual sales data WHERE available, and estimated sales velocity WHERE actual data is unavailable
5. THE Revenue_Calculator SHALL aggregate daily revenue impact values into monthly totals
6. FOR ALL revenue calculations, THE Revenue_Calculator SHALL use Indian Rupee currency format with proper thousand separators

### Requirement 2: Revenue Summary API Endpoint

**User Story:** As a dashboard component, I want to retrieve aggregated revenue metrics, so that I can display current ROI to users.

#### Acceptance Criteria

1. WHEN a GET request is sent to /revenue/summary, THE Revenue_Calculator SHALL return total revenue protected for the current month
2. WHEN a GET request is sent to /revenue/summary with a date range parameter, THE Revenue_Calculator SHALL return revenue metrics for the specified Impact_Period
3. THE Revenue_Calculator SHALL return response data containing revenue_protected, alert_response_rate, and competitive_score fields
4. THE Revenue_Calculator SHALL return HTTP status code 200 with valid JSON when the request succeeds
5. IF the Revenue_Impact_Table contains no data for the requested period, THEN THE Revenue_Calculator SHALL return zero values with HTTP status code 200
6. THE Revenue_Calculator SHALL include CORS headers in all API responses

### Requirement 3: Revenue History API Endpoint

**User Story:** As a dashboard component, I want to retrieve daily revenue impact data, so that I can render a trend chart.

#### Acceptance Criteria

1. WHEN a GET request is sent to /revenue/history, THE Revenue_Calculator SHALL return daily revenue impact records for the last 30 days
2. THE Revenue_Calculator SHALL return an array of objects containing date, revenue_protected, and competitive_score fields
3. THE Revenue_Calculator SHALL sort history records in chronological order with most recent date last
4. THE Revenue_Calculator SHALL return HTTP status code 200 with valid JSON array when the request succeeds
5. IF the Revenue_Impact_Table contains no historical data, THEN THE Revenue_Calculator SHALL return an empty array with HTTP status code 200

### Requirement 4: Alert Response Tracking

**User Story:** As a retailer, I want my alert responses to be tracked, so that the system can measure my engagement and calculate response rate.

#### Acceptance Criteria

1. WHEN a user acknowledges an alert, THE Alerts_Table SHALL store the response action with timestamp
2. THE Alerts_Table SHALL include a responseAction field with allowed values: acknowledged, price_adjusted, restocked, dismissed, or null
3. WHEN calculating response rate, THE Revenue_Calculator SHALL count alerts with non-null responseAction values as responded
4. THE Revenue_Calculator SHALL calculate response rate as (responded_alerts / total_alerts) × 100
5. WHEN an alert response occurs within 24 hours of alert creation, THE Revenue_Calculator SHALL classify it as timely response
6. THE Revenue_Calculator SHALL exclude alerts older than 30 days from response rate calculations

### Requirement 5: Competitive Position Scoring

**User Story:** As a retailer, I want to see my competitive position score, so that I can understand my market standing at a glance.

#### Acceptance Criteria

1. THE Revenue_Calculator SHALL calculate Competitive_Score on a scale from 0 to 10 with one decimal precision
2. WHEN calculating Competitive_Score, THE Revenue_Calculator SHALL weight price competitiveness at 40 percent of total score
3. WHEN calculating Competitive_Score, THE Revenue_Calculator SHALL weight stock availability at 30 percent of total score
4. WHEN calculating Competitive_Score, THE Revenue_Calculator SHALL weight alert response rate at 30 percent of total score
5. WHEN a product price is within 5 percent of the lowest competitor price, THE Revenue_Calculator SHALL assign maximum price competitiveness points
6. WHEN a product is in stock, THE Revenue_Calculator SHALL assign full stock availability points for that product
7. THE Revenue_Calculator SHALL aggregate individual product scores into an overall Competitive_Score
8. THE Revenue_Calculator SHALL update Competitive_Score daily at midnight UTC

### Requirement 6: Revenue Impact Data Persistence

**User Story:** As the system, I want to persist revenue calculations, so that historical data remains available for trend analysis.

#### Acceptance Criteria

1. THE Revenue_Impact_Table SHALL use composite primary key with partition key date and sort key metric_type
2. THE Revenue_Impact_Table SHALL store records with fields: date, metric_type, value, product_id, and calculated_at timestamp
3. WHEN storing revenue impact records, THE Revenue_Calculator SHALL set TTL to 365 days from creation date
4. THE Revenue_Calculator SHALL create separate records for metric types: revenue_protected, competitive_score, and response_rate
5. IF a record already exists for a given date and metric_type, THEN THE Revenue_Calculator SHALL update the existing record rather than create a duplicate

### Requirement 7: Dashboard KPI Cards Display

**User Story:** As a retailer, I want to see three key metrics at the top of my dashboard, so that I can quickly assess platform ROI.

#### Acceptance Criteria

1. THE Dashboard_UI SHALL display a KPI card showing total revenue protected for the current month in Indian Rupee format
2. THE Dashboard_UI SHALL display a KPI card showing alert response rate as a percentage with format "X/Y alerts responded"
3. THE Dashboard_UI SHALL display a KPI card showing current Competitive_Score with format "X.X/10"
4. THE Dashboard_UI SHALL apply the premium-card CSS class to all KPI cards
5. WHEN revenue data is loading, THE Dashboard_UI SHALL display a loading spinner in each KPI card
6. IF the API request fails, THEN THE Dashboard_UI SHALL display an error message with retry option

### Requirement 8: Revenue Trend Chart Visualization

**User Story:** As a retailer, I want to see a line chart of my revenue impact over time, so that I can identify trends and patterns.

#### Acceptance Criteria

1. THE Dashboard_UI SHALL render a line chart displaying daily revenue protected for the last 30 days
2. THE Dashboard_UI SHALL use the Recharts library for chart rendering
3. THE Dashboard_UI SHALL format Y-axis values in Indian Rupee currency with K suffix for thousands
4. THE Dashboard_UI SHALL format X-axis values as abbreviated dates (e.g., "Jan 15")
5. THE Dashboard_UI SHALL display a tooltip showing exact revenue value and date WHEN the user hovers over a data point
6. THE Dashboard_UI SHALL use the primary color (deep teal) for the revenue trend line
7. WHEN the chart contains no data points, THE Dashboard_UI SHALL display an empty state message with illustration

### Requirement 9: Dashboard Page Integration

**User Story:** As a user, I want to access the revenue impact dashboard from the main navigation, so that I can view ROI metrics easily.

#### Acceptance Criteria

1. WHERE the application uses a dedicated revenue page, THE Dashboard_UI SHALL be accessible via route /revenue-impact
2. WHERE the application integrates into existing dashboard, THE Dashboard_UI SHALL render within the DashboardPage component
3. THE Dashboard_UI SHALL fetch revenue summary data on component mount
4. THE Dashboard_UI SHALL fetch revenue history data on component mount
5. THE Dashboard_UI SHALL refresh data WHEN the user clicks a refresh button
6. THE Dashboard_UI SHALL maintain responsive layout with single column on mobile and multi-column on desktop

### Requirement 10: API Gateway Integration

**User Story:** As the Revenue_Calculator, I want to receive HTTP requests through API Gateway, so that the frontend can access revenue data securely.

#### Acceptance Criteria

1. THE API_Gateway SHALL route GET requests to /revenue/summary to the Revenue_Calculator Lambda function
2. THE API_Gateway SHALL route GET requests to /revenue/history to the Revenue_Calculator Lambda function
3. THE API_Gateway SHALL pass query parameters from the request to the Lambda function event object
4. THE API_Gateway SHALL return Lambda function responses to the client with appropriate HTTP status codes
5. THE API_Gateway SHALL enforce CORS policy allowing requests from the frontend origin
6. IF the Lambda function execution fails, THEN THE API_Gateway SHALL return HTTP status code 500 with error message

### Requirement 11: Demo Data Support

**User Story:** As a demo user, I want to see realistic revenue impact metrics, so that I can evaluate the platform without real transaction data.

#### Acceptance Criteria

1. WHERE the system operates in demo mode, THE Revenue_Calculator SHALL generate synthetic revenue impact data
2. THE Revenue_Calculator SHALL generate demo revenue protected values between ₹30,000 and ₹60,000 per month
3. THE Revenue_Calculator SHALL generate demo Competitive_Score values between 6.5 and 8.5
4. THE Revenue_Calculator SHALL generate demo alert response rates between 70 and 90 percent
5. THE Revenue_Calculator SHALL create demo historical data points for the last 30 days with realistic daily variation
6. THE Dashboard_UI SHALL display a badge indicating "Demo Data" WHEN synthetic data is being shown
