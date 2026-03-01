# Implementation Plan: Revenue Impact Dashboard

## Overview

This implementation creates a revenue impact tracking system with three main components: a backend Lambda function for revenue calculations, DynamoDB schema updates for data persistence, and frontend React components for visualization. The system quantifies platform ROI through revenue protected metrics, alert response tracking, and competitive positioning scores.

## Tasks

- [x] 1. Set up backend Lambda function structure
  - Create `backend/functions/revenueCalculator/` directory
  - Create `package.json` with dependencies (aws-sdk, fast-check for testing)
  - Create `index.mjs` with handler skeleton and route dispatcher
  - _Requirements: 2.1, 2.2, 3.1, 10.1, 10.2_

- [x] 2. Implement revenue calculation core logic
  - [x] 2.1 Implement calculatePriceAdjustmentRevenue function
    - Calculate revenue from price adjustment alerts using formula: priceDifference × dailySales × daysSinceAdjustment × 0.2
    - Handle missing product data with safe defaults
    - _Requirements: 1.1, 1.2, 1.4_

  - [ ]* 2.2 Write property test for price adjustment revenue calculation
    - **Property 1: Revenue Attribution Accuracy**
    - **Validates: Requirements 1.1, 1.2**
  
  - [x] 2.3 Implement calculateRestockRevenue function
    - Calculate prevented stockout loss: productPrice × dailySales × estimatedStockoutDays
    - _Requirements: 1.2, 1.4_

  - [ ]* 2.4 Write property test for restock revenue calculation
    - **Property 1: Revenue Attribution Accuracy**
    - **Validates: Requirements 1.1, 1.2**

  - [x] 2.5 Implement calculateCompetitiveScore function
    - Calculate price competitiveness (40% weight)
    - Calculate stock availability (30% weight)
    - Calculate response rate (30% weight)
    - Return score 0.0-10.0 with one decimal precision
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7_

  - [ ]* 2.6 Write property test for competitive score calculation
    - **Property 14: Competitive Score Range and Precision**
    - **Property 15: Competitive Score Weighting Formula**
    - **Validates: Requirements 5.1, 5.2, 5.3, 5.4, 5.7**

  - [ ]* 2.7 Write unit tests for edge cases
    - Test empty product list returns 0.0 score
    - Test missing competitor data handling
    - Test division by zero protection
    - _Requirements: 5.1, 5.2, 5.3, 5.4_

- [x] 3. Implement API endpoint handlers
  - [x] 3.1 Implement getRevenueSummary function
    - Parse startDate and endDate query parameters (default to current month)
    - Query RevenueImpact table for metrics in date range
    - Aggregate revenue_protected, competitive_score, response_rate
    - Return formatted response with period metadata
    - Include CORS headers
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.6, 1.6_

  - [ ]* 3.2 Write property test for date range filtering
    - **Property 6: Date Range Query Filtering**
    - **Validates: Requirements 2.2**

  - [x] 3.3 Implement getRevenueHistory function
    - Parse days query parameter (default 30, max 90)
    - Query RevenueImpact table for daily records
    - Sort chronologically (earliest first)
    - Return array of {date, revenue_protected, competitive_score}
    - Include CORS headers
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 2.6_

  - [ ]* 3.4 Write property test for history chronological ordering
    - **Property 9: History Chronological Ordering**
    - **Validates: Requirements 3.3**

  - [ ]* 3.5 Write unit tests for API endpoints
    - Test empty data returns zero values with 200 status
    - Test invalid date format returns 400 error
    - Test CORS headers present in all responses
    - _Requirements: 2.4, 2.5, 2.6, 3.4, 3.5_

- [x] 4. Implement data persistence logic
  - [x] 4.1 Implement storeRevenueMetric function
    - Create DynamoDB PutItem operation
    - Set TTL to calculated_at + 365 days
    - Create separate records for each metric_type
    - Implement upsert behavior (update if exists)
    - _Requirements: 1.3, 6.1, 6.2, 6.3, 6.4, 6.5_

  - [ ]* 4.2 Write property test for metric persistence structure
    - **Property 2: Metric Persistence Structure**
    - **Property 18: TTL Calculation**
    - **Validates: Requirements 1.3, 6.2, 6.3**

  - [x] 4.3 Implement calculateRevenueImpact function
    - Query Alerts table for responses in calculation period
    - Loop through alerts and calculate revenue per alert type
    - Calculate competitive score from Products and PriceHistory
    - Calculate response rate from alert statistics
    - Store all metrics using storeRevenueMetric
    - _Requirements: 1.2, 1.5, 4.3, 4.4, 4.6_

  - [ ]* 4.4 Write property test for daily to monthly aggregation
    - **Property 4: Daily to Monthly Aggregation**
    - **Validates: Requirements 1.5**

- [ ] 5. Checkpoint - Ensure backend tests pass
  - Run all backend unit and property tests
  - Verify Lambda handler routes correctly
  - Ask the user if questions arise

- [x] 6. Implement demo data generation
  - [x] 6.1 Implement generateDemoRevenueData function
    - Generate 30 days of synthetic revenue data
    - Monthly revenue between ₹30,000-₹60,000
    - Competitive scores between 6.5-8.5
    - Alert response rates between 70-90%
    - Add realistic daily variation (±20%)
    - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5_

  - [ ]* 6.2 Write property test for demo data constraints
    - **Property 30: Demo Data Constraints**
    - **Validates: Requirements 11.2, 11.3, 11.4, 11.5**

  - [ ]* 6.3 Write unit tests for demo data generation
    - Test generates exactly 30 data points
    - Test values within specified ranges
    - Test chronological ordering
    - _Requirements: 11.5_

- [x] 7. Create DynamoDB table and update schema
  - [x] 7.1 Create RetailMind-RevenueImpact table
    - Create PowerShell script `backend/create-revenue-table.ps1`
    - Set partition key: date (String)
    - Set sort key: metric_type (String)
    - Enable TTL on ttl attribute
    - Configure billing mode: PAY_PER_REQUEST
    - _Requirements: 6.1, 6.2, 6.3_

  - [x] 7.2 Update Alerts table schema documentation
    - Document new fields: responseAction, responseTime, revenueImpact
    - Add field descriptions and allowed values
    - Note: Schema changes are additive, no migration needed
    - _Requirements: 4.1, 4.2_

- [x] 8. Deploy Lambda function and configure API Gateway
  - [x] 8.1 Create Lambda deployment script
    - Create `backend/deploy-revenue-calculator.ps1`
    - Package function with dependencies
    - Create/update Lambda function
    - Set environment variables (REGION, TABLE_NAME)
    - Configure timeout (30 seconds) and memory (512 MB)
    - _Requirements: 2.1, 3.1, 10.1, 10.2_

  - [x] 8.2 Configure API Gateway routes
    - Add GET /revenue/summary route
    - Add GET /revenue/history route
    - Configure Lambda proxy integration
    - Enable CORS with appropriate headers
    - Deploy to dev stage
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_

- [x] 9. Create frontend API client methods
  - [x] 9.1 Add TypeScript interfaces to src/api/client.ts
    - Define RevenueSummary interface
    - Define RevenueHistoryItem interface
    - _Requirements: 2.3, 3.2_

  - [x] 9.2 Implement getRevenueSummary method
    - Accept optional startDate and endDate parameters
    - Build query string from parameters
    - Make GET request to /revenue/summary
    - Return typed ApiResponse<RevenueSummary>
    - _Requirements: 2.1, 2.2, 2.3_

  - [x] 9.3 Implement getRevenueHistory method
    - Accept optional days parameter (default 30)
    - Make GET request to /revenue/history
    - Return typed ApiResponse with history array
    - _Requirements: 3.1, 3.2_

  - [ ]* 9.4 Write unit tests for API client methods
    - Test query parameter construction
    - Test response type validation
    - Test error handling
    - _Requirements: 2.3, 3.2_

- [x] 10. Create RevenueKPICards component
  - [x] 10.1 Create src/components/revenue/RevenueKPICards.tsx
    - Define RevenueKPICardsProps interface
    - Create three KPI cards: Revenue Protected, Alert Response, Competitive Score
    - Apply premium-card CSS class
    - Format revenue with ₹ symbol and Indian number format
    - Display response rate as percentage with "X/Y alerts" subtitle
    - Display competitive score as "X.X/10"
    - Show loading spinners when loading prop is true
    - Show error state with retry button on error
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 1.6_

  - [ ]* 10.2 Write property test for currency formatting
    - **Property 5: Currency Formatting**
    - **Validates: Requirements 1.6**

  - [ ]* 10.3 Write unit tests for KPI cards
    - Test correct rendering of all three cards
    - Test loading state displays spinners
    - Test error state displays message and retry button
    - Test premium-card class applied
    - _Requirements: 7.4, 7.5, 7.6_

- [x] 11. Create RevenueTrendChart component
  - [x] 11.1 Create src/components/revenue/RevenueTrendChart.tsx
    - Define RevenueTrendChartProps interface
    - Use Recharts ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid
    - Format Y-axis as "₹XK" (thousands with K suffix)
    - Format X-axis as abbreviated dates (e.g., "Jan 15")
    - Configure tooltip to show exact revenue and full date
    - Use primary color (hsl(173 58% 39%)) for line
    - Set line strokeWidth to 2, dot radius to 4
    - Show empty state when data array is empty
    - Show loading spinner when loading prop is true
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 8.7_

  - [ ]* 11.2 Write property test for chart axis formatting
    - **Property 23: Chart Axis Formatting**
    - **Validates: Requirements 8.3, 8.4**

  - [ ]* 11.3 Write unit tests for trend chart
    - Test chart renders with correct styling
    - Test empty state displays when no data
    - Test loading state displays spinner
    - Test tooltip content format
    - _Requirements: 8.2, 8.5, 8.6, 8.7_

- [x] 12. Integrate revenue components into DashboardPage
  - [x] 12.1 Update src/pages/DashboardPage.tsx
    - Import RevenueKPICards and RevenueTrendChart components
    - Add React Query hooks for getRevenueSummary and getRevenueHistory
    - Fetch data on component mount
    - Add Revenue Impact section after Quick Stats
    - Render KPI cards with fetched summary data
    - Render trend chart in premium-card container
    - Add refresh button that triggers data refetch
    - Apply animate-fade-in with 0.15s delay
    - Maintain responsive layout (single column mobile, multi-column desktop)
    - _Requirements: 9.2, 9.3, 9.4, 9.5, 9.6, 7.1, 7.2, 7.3, 8.1_

  - [ ]* 12.2 Write integration test for dashboard data fetching
    - **Property 26: Component Mount Data Fetching**
    - **Validates: Requirements 9.3, 9.4**

  - [ ]* 12.3 Write unit tests for dashboard integration
    - Test revenue section renders when data available
    - Test loading state during data fetch
    - Test error handling and retry
    - Test refresh button triggers refetch
    - _Requirements: 9.3, 9.4, 9.5_

- [x] 13. Add alert response tracking to frontend
  - [x] 13.1 Update alert acknowledgment logic
    - When user acknowledges alert, send responseAction and responseTime to backend
    - Update local alert state with response data
    - Show toast notification on successful response
    - _Requirements: 4.1, 4.2_

  - [ ]* 13.2 Write unit tests for alert response tracking
    - Test responseAction values are valid
    - Test responseTime is set correctly
    - Test API call includes correct payload
    - _Requirements: 4.1, 4.2_

- [ ] 14. Final checkpoint - End-to-end validation
  - Run all frontend and backend tests
  - Verify API Gateway routes are accessible
  - Test dashboard displays revenue metrics correctly
  - Test chart renders with demo data
  - Ensure all tests pass, ask the user if questions arise

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Property tests validate universal correctness properties from the design document
- Unit tests validate specific examples and edge cases
- Backend uses Node.js ESM (.mjs files), frontend uses TypeScript
- All currency values use Indian Rupee (₹) format
- Demo data generation enables evaluation without real transaction data
