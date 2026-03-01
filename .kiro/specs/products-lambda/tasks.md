# Implementation Plan: Products Lambda

## Overview

This plan implements the Products Lambda function for RetailMind AI, providing complete CRUD operations for product management. The implementation follows existing Lambda patterns (whatsappWebhook, priceScraper) and integrates with DynamoDB for data persistence and API Gateway for REST endpoints.

## Tasks

- [x] 1. Set up Lambda function structure and dependencies
  - Create `backend/functions/products/` directory
  - Create `package.json` with AWS SDK v3 dependencies (@aws-sdk/client-dynamodb, @aws-sdk/lib-dynamodb)
  - Initialize DynamoDB client with connection reuse pattern
  - _Requirements: 9.3_

- [x] 2. Implement validation functions
  - [x] 2.1 Create validateProductData function
    - Validate required fields (name, sku, currentPrice, cost, stockQuantity for create)
    - Validate field lengths (name: 1-200, sku: 1-100, category: 1-50)
    - Validate numeric constraints (currentPrice > 0, cost >= 0, stockQuantity >= 0, price >= cost)
    - Validate decimal precision (max 2 decimal places for prices)
    - Validate stock is integer
    - Validate competitor URLs format (HTTP/HTTPS)
    - Return validation result with descriptive error messages
    - _Requirements: 1.3, 1.5, 1.6, 1.7, 4.2, 4.3, 4.4, 4.5, 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 8.8_
  
  - [ ]* 2.2 Write property tests for validation
    - **Property 2: Required Field Validation**
    - **Property 3: Numeric Constraint Validation**
    - **Property 5: Price-Cost Business Rule**
    - **Property 6: Field Length Validation**
    - **Property 7: Decimal Precision Validation**
    - **Property 8: Integer Stock Validation**
    - **Property 9: URL Format Validation**
    - **Validates: Requirements 1.3, 1.5, 1.6, 1.7, 1.10, 4.2, 4.3, 4.4, 4.5, 4.10, 8.1-8.8**
  
  - [x] 2.3 Create validateSKUUniqueness function
    - Query DynamoDB for existing SKU
    - Exclude current product ID for updates
    - Return boolean indicating uniqueness
    - _Requirements: 1.4_
  
  - [ ]* 2.4 Write property test for SKU uniqueness
    - **Property 4: SKU Uniqueness Constraint**
    - **Validates: Requirements 1.4**

- [x] 3. Implement createProduct operation
  - [x] 3.1 Create createProduct handler function
    - Parse and validate request body
    - Generate UUID v4 for product ID
    - Check SKU uniqueness
    - Set timestamps (createdAt, lastModified)
    - Set isActive: true
    - Insert product into RetailMind-Products table using PutCommand
    - Return 201 with created product object
    - Handle validation errors (400) and database errors (500)
    - _Requirements: 1.1, 1.2, 1.8, 1.9, 1.10, 1.11_
  
  - [ ]* 3.2 Write property tests for product creation
    - **Property 1: Product Creation Round Trip**
    - **Property 10: Successful Creation Response**
    - **Validates: Requirements 1.1, 1.2, 1.8, 1.9, 7.4**
  
  - [ ]* 3.3 Write unit tests for createProduct
    - Test successful creation with valid data
    - Test duplicate SKU rejection
    - Test validation error responses
    - Test database error handling

- [ ] 4. Checkpoint - Ensure product creation works
  - Ensure all tests pass, ask the user if questions arise.

- [x] 5. Implement getAllProducts operation
  - [x] 5.1 Create getAllProducts handler function
    - Parse query parameters (category, search, page, pageSize)
    - Scan RetailMind-Products table with FilterExpression for isActive: true
    - Apply category filter if provided
    - Apply name search filter (case-insensitive contains) if provided
    - Sort results by createdAt descending
    - Implement pagination (max pageSize: 100)
    - Calculate pagination metadata (totalCount, totalPages)
    - Return 200 with products array and pagination metadata
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.8, 2.9, 2.10, 9.4_
  
  - [ ]* 5.2 Write property tests for product listing
    - **Property 11: Product List Retrieval**
    - **Property 12: Product List Ordering**
    - **Property 13: Category Filtering**
    - **Property 14: Name Search Filtering**
    - **Property 15: Pagination Limits**
    - **Property 16: Pagination Metadata**
    - **Validates: Requirements 2.1-2.6, 2.8, 2.10, 9.4, 7.7**
  
  - [ ]* 5.3 Write unit tests for getAllProducts
    - Test empty product list
    - Test category filtering
    - Test search filtering
    - Test pagination with various page sizes
    - Test soft-deleted products exclusion

- [x] 6. Implement getProductById operation
  - [x] 6.1 Create getProductById handler function
    - Extract product ID from path parameters
    - Retrieve product from RetailMind-Products using GetCommand
    - Check if product exists and isActive: true
    - Return 200 with complete product object
    - Return 404 if not found or soft-deleted
    - _Requirements: 3.1, 3.2, 3.5, 3.6, 3.7, 3.8_
  
  - [ ]* 6.2 Write property tests for product retrieval
    - **Property 20: Not Found Error Handling**
    - **Property 21: Soft-Deleted Product Inaccessibility**
    - **Property 30: Complete Product Attributes**
    - **Validates: Requirements 3.1, 3.2, 3.6, 3.7**
  
  - [ ]* 6.3 Write unit tests for getProductById
    - Test successful retrieval
    - Test non-existent product returns 404
    - Test soft-deleted product returns 404

- [x] 7. Implement updateProduct operation
  - [x] 7.1 Create updateProduct handler function
    - Extract product ID from path parameters
    - Parse and validate update data
    - Check product exists using GetCommand
    - Detect price changes and record in RetailMind-PriceHistory
    - Update product using UpdateCommand with UpdateExpression
    - Update lastModified timestamp
    - Preserve createdAt and id
    - Return 200 with updated product object
    - Return 404 if product not found
    - Handle validation errors (400) and database errors (500)
    - _Requirements: 4.1, 4.6, 4.7, 4.8, 4.9, 4.10, 4.11, 4.12_
  
  - [ ]* 7.2 Write property tests for product updates
    - **Property 17: Product Update Round Trip**
    - **Property 18: Price Change History Recording**
    - **Validates: Requirements 4.1, 4.6, 4.7, 4.8, 4.12**
  
  - [ ]* 7.3 Write unit tests for updateProduct
    - Test successful update
    - Test price change creates history record
    - Test non-existent product returns 404
    - Test validation errors
    - Test preserves createdAt and id

- [x] 8. Implement deleteProduct operation
  - [x] 8.1 Create deleteProduct handler function
    - Extract product ID from path parameters
    - Check product exists using GetCommand
    - Perform soft delete (set isActive: false) using UpdateCommand
    - Update lastModified timestamp
    - Return 200 with confirmation message
    - Return 404 if product not found
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7_
  
  - [ ]* 8.2 Write property test for soft delete
    - **Property 19: Soft Delete Behavior**
    - **Validates: Requirements 5.1, 5.2, 5.3, 5.4, 5.5**
  
  - [ ]* 8.3 Write unit tests for deleteProduct
    - Test successful soft delete
    - Test non-existent product returns 404
    - Test soft-deleted product not in list results

- [ ] 9. Checkpoint - Ensure all CRUD operations work
  - Ensure all tests pass, ask the user if questions arise.

- [x] 10. Implement main Lambda handler with routing
  - [x] 10.1 Create main handler function
    - Log complete event object at entry with requestId
    - Parse HTTP method and path from event
    - Route to appropriate operation handler:
      - POST /products → createProduct
      - GET /products → getAllProducts
      - GET /products/{id} → getProductById
      - PUT /products/{id} → updateProduct
      - DELETE /products/{id} → deleteProduct
    - Wrap all operations in try-catch for error handling
    - Return consistent response format with CORS headers
    - Log all successful operations with product IDs
    - Log validation failures with details
    - Log database errors with stack traces
    - Return 500 with generic message for unexpected errors
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7_
  
  - [ ]* 10.2 Write property tests for response format
    - **Property 22: CORS Headers on All Responses**
    - **Property 23: JSON Response Format**
    - **Property 24: Error Response Format**
    - **Property 25: Database Error Handling**
    - **Property 26: Operation Logging**
    - **Property 27: Validation Error Logging**
    - **Property 28: Request Correlation Tracing**
    - **Validates: Requirements 1.11, 2.9, 3.8, 4.11, 5.7, 6.1-6.7, 7.1, 7.2, 7.3, 7.5**
  
  - [ ]* 10.3 Write unit tests for handler routing
    - Test routing to correct operation handlers
    - Test CORS headers on all responses
    - Test error response format
    - Test logging includes requestId

- [x] 11. Create deployment script
  - Create `backend/deploy-products.ps1` following existing pattern
  - Install dependencies with `npm install`
  - Create function.zip with index.mjs and node_modules
  - Deploy to AWS Lambda with appropriate IAM role
  - Configure timeout (10 seconds) and memory (512 MB)
  - _Requirements: 9.1_

- [x] 12. Wire API Gateway endpoints
  - [x] 12.1 Create API Gateway resources and methods
    - Create `/products` resource
    - Create `POST /products` method with Lambda integration
    - Create `GET /products` method with Lambda integration
    - Create `/products/{id}` resource
    - Create `GET /products/{id}` method with Lambda integration
    - Create `PUT /products/{id}` method with Lambda integration
    - Create `DELETE /products/{id}` method with Lambda integration
    - Enable CORS on all methods
    - Deploy API to stage
  
  - [ ]* 12.2 Write integration tests for API endpoints
    - Test all endpoints return proper status codes
    - Test CORS headers present
    - Test request/response flow end-to-end

- [ ] 13. Final checkpoint - End-to-end validation
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties (30 properties total)
- Unit tests validate specific examples and edge cases
- Follow existing Lambda patterns from whatsappWebhook and priceScraper
- Use AWS SDK v3 with ESM imports (.mjs files)
- All responses include CORS headers for frontend compatibility
- DynamoDB client initialized at module level for connection reuse
