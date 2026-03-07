import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand, GetCommand, ScanCommand, UpdateCommand, QueryCommand, DeleteCommand } from "@aws-sdk/lib-dynamodb";
import { randomUUID } from "crypto";

const dynamodb = DynamoDBDocumentClient.from(new DynamoDBClient({ region: "us-east-1" }));

const PRODUCTS_TABLE = "RetailMind-Products";
const PRICE_HISTORY_TABLE = "RetailMind-PriceHistory";
const RECOMMENDATIONS_TABLE = "RetailMind-Recommendations";
const ALERTS_TABLE = "RetailMind-Alerts";
const FORECASTS_TABLE = "RetailMind-Forecasts";
const PRICE_COMPARISON_TABLE = "RetailMind-PriceComparison";
const REVENUE_IMPACT_TABLE = "RetailMind-RevenueImpact";

export const handler = async (event) => {
  const requestId = event.requestContext?.requestId || 'unknown';
  console.log(`[${requestId}] Products Lambda invoked:`, JSON.stringify(event));
  
  try {
    const httpMethod = event.httpMethod;
    const pathParameters = event.pathParameters || {};
    
    if (httpMethod === 'OPTIONS') {
      return buildResponse(200, {});
    }
    
    if (httpMethod === 'GET' && !pathParameters.id) {
      const queryParams = event.queryStringParameters || {};
      return await getAllProducts(queryParams, requestId);
    } else if (httpMethod === 'GET' && pathParameters.id) {
      return await getProductById(pathParameters.id, requestId);
    } else if (httpMethod === 'POST') {
      const body = JSON.parse(event.body || '{}');
      return await createProduct(body, requestId);
    } else if (httpMethod === 'PUT' && pathParameters.id) {
      const body = JSON.parse(event.body || '{}');
      return await updateProduct(pathParameters.id, body, requestId);
    } else if (httpMethod === 'DELETE' && pathParameters.id) {
      return await deleteProduct(pathParameters.id, requestId);
    }
    
    return buildResponse(404, { error: 'Not found' });
  } catch (error) {
    console.error(`[${requestId}] Unexpected error:`, error.stack);
    return buildResponse(500, { error: 'Internal server error' });
  }
};

// Build response with CORS headers
function buildResponse(statusCode, body) {
  return {
    statusCode,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*"
    },
    body: JSON.stringify(body)
  };
}

// Validation function
function validateProductData(data, isUpdate = false) {
  const errors = [];
  
  if (!isUpdate || data.name !== undefined) {
    if (!data.name || typeof data.name !== 'string' || data.name.trim().length === 0) {
      errors.push('name is required and must be non-empty');
    } else if (data.name.length > 200) {
      errors.push('name must be 200 characters or less');
    }
  }
  
  if (!isUpdate) {
    if (!data.sku || typeof data.sku !== 'string' || data.sku.trim().length === 0) {
      errors.push('sku is required and must be non-empty');
    } else if (data.sku.length > 100) {
      errors.push('sku must be 100 characters or less');
    }
  }
  
  if (!isUpdate || data.category !== undefined) {
    if (!isUpdate && (!data.category || typeof data.category !== 'string')) {
      errors.push('category is required');
    } else if (data.category && data.category.length > 50) {
      errors.push('category must be 50 characters or less');
    }
  }
  
  if (!isUpdate || data.currentPrice !== undefined) {
    const price = parseFloat(data.currentPrice);
    if (isNaN(price) || price <= 0) {
      errors.push('currentPrice must be greater than 0');
    } else if ((String(data.currentPrice).split('.')[1] || '').length > 2) {
      errors.push('currentPrice must have at most 2 decimal places');
    }
  }
  
  if (!isUpdate || data.costPrice !== undefined) {
    const cost = parseFloat(data.costPrice);
    if (isNaN(cost) || cost < 0) {
      errors.push('costPrice must be greater than or equal to 0');
    } else if ((String(data.costPrice).split('.')[1] || '').length > 2) {
      errors.push('costPrice must have at most 2 decimal places');
    }
  }
  
  if (!isUpdate || data.stock !== undefined) {
    const stock = parseInt(data.stock);
    if (isNaN(stock) || stock < 0 || !Number.isInteger(stock)) {
      errors.push('stock must be a non-negative integer');
    }
  }
  
  // Validate validUntil (optional, but must be future date if provided)
  if (data.validUntil !== undefined && data.validUntil !== null && data.validUntil !== '') {
    const validDate = new Date(data.validUntil);
    if (isNaN(validDate.getTime())) {
      errors.push('validUntil must be a valid date');
    } else if (validDate < new Date()) {
      errors.push('validUntil must be a future date');
    }
  }
  
  // Validate price >= cost
  const price = parseFloat(data.currentPrice);
  const cost = parseFloat(data.costPrice);
  if (!isNaN(price) && !isNaN(cost) && price < cost) {
    errors.push('currentPrice must be greater than or equal to costPrice');
  }
  
  return { valid: errors.length === 0, errors };
}

function isValidUrl(string) {
  try {
    const url = new URL(string);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

// Check SKU uniqueness
async function checkSKUUniqueness(sku, excludeProductId = null) {
  const params = {
    TableName: PRODUCTS_TABLE,
    FilterExpression: 'sku = :sku AND isActive = :active',
    ExpressionAttributeValues: {
      ':sku': sku,
      ':active': true
    }
  };
  
  const result = await dynamodb.send(new ScanCommand(params));
  const existing = result.Items?.filter(item => item.id !== excludeProductId);
  return existing.length === 0;
}

// Create product
async function createProduct(data, requestId) {
  console.log(`[${requestId}] Creating product with data:`, JSON.stringify(data));
  
  const validation = validateProductData(data, false);
  if (!validation.valid) {
    console.error(`[${requestId}] Validation failed:`, validation.errors);
    return buildResponse(400, { 
      error: 'Validation failed', 
      message: validation.errors.join(', '),
      details: validation.errors,
      receivedData: data
    });
  }
  
  const isUnique = await checkSKUUniqueness(data.sku);
  if (!isUnique) {
    console.error(`[${requestId}] SKU already exists:`, data.sku);
    return buildResponse(400, { error: 'SKU already exists' });
  }
  
  const timestamp = Date.now();
  const product = {
    id: randomUUID(),
    name: data.name.trim(),
    sku: data.sku.trim(),
    category: data.category.trim(),
    currentPrice: parseFloat(data.currentPrice),
    costPrice: parseFloat(data.costPrice),
    stock: parseInt(data.stock),
    stockDays: Math.floor(parseInt(data.stock) / 10) || 0, // Estimate stock days
    validUntil: data.validUntil || null, // Product validity/expiry date
    competitors: data.competitors || [],
    amazonUrl: data.amazonUrl || '',
    flipkartUrl: data.flipkartUrl || '',
    keywords: data.keywords || data.name,
    isActive: true,
    createdAt: timestamp,
    updatedAt: timestamp
  };
  
  try {
    await dynamodb.send(new PutCommand({
      TableName: PRODUCTS_TABLE,
      Item: product
    }));
    
    console.log(`[${requestId}] Product created successfully:`, product.id);
    return buildResponse(201, product);
  } catch (error) {
    console.error(`[${requestId}] DynamoDB error:`, error);
    return buildResponse(500, { error: 'Failed to create product' });
  }
}

// Get all products
async function getAllProducts(queryParams, requestId) {
  console.log(`[${requestId}] Listing products with filters:`, queryParams);
  
  const pageSize = Math.min(parseInt(queryParams.pageSize) || 50, 100);
  const page = parseInt(queryParams.page) || 1;
  
  try {
    let filterExpression = 'isActive = :active';
    const expressionValues = { ':active': true };
    
    if (queryParams.category) {
      filterExpression += ' AND category = :category';
      expressionValues[':category'] = queryParams.category;
    }
    
    const result = await dynamodb.send(new ScanCommand({
      TableName: PRODUCTS_TABLE,
      FilterExpression: filterExpression,
      ExpressionAttributeValues: expressionValues
    }));
    
    let products = result.Items || [];
    
    // Apply search filter
    if (queryParams.search) {
      const searchLower = queryParams.search.toLowerCase();
      products = products.filter(p => p.name.toLowerCase().includes(searchLower));
    }
    
    // Sort by createdAt descending
    products.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    // Pagination
    const totalCount = products.length;
    const totalPages = Math.ceil(totalCount / pageSize);
    const startIndex = (page - 1) * pageSize;
    const paginatedProducts = products.slice(startIndex, startIndex + pageSize);
    
    const shouldValidateUrls = queryParams.validateUrls === 'true';
    let urlValidation = null;
    if (shouldValidateUrls) {
      urlValidation = await validateProductUrls(products);
    }

    console.log(`[${requestId}] Retrieved ${paginatedProducts.length} products`);
    
    return buildResponse(200, {
      products: paginatedProducts,
      pagination: {
        totalCount,
        pageSize,
        currentPage: page,
        totalPages
      },
      urlValidation
    });
  } catch (error) {
    console.error(`[${requestId}] DynamoDB error:`, error);
    return buildResponse(500, { error: 'Failed to retrieve products' });
  }
}

async function validateProductUrls(products) {
  const checkedAt = new Date().toISOString();

  const details = await Promise.all(
    products.map(async (product) => {
      const amazon = await validateSingleUrl(product.amazonUrl, 'amazon.');
      const flipkart = await validateSingleUrl(product.flipkartUrl, 'flipkart.');

      const hasAnyUrl = amazon.present || flipkart.present;
      const hasBothUrls = amazon.present && flipkart.present;
      const invalidCount = [amazon, flipkart].filter((item) => item.present && (!item.validFormat || !item.domainMatches)).length;
      const unreachableCount = [amazon, flipkart].filter((item) => item.present && item.validFormat && item.domainMatches && item.reachable === false).length;

      return {
        productId: product.id,
        productName: product.name,
        sku: product.sku,
        hasAnyUrl,
        hasBothUrls,
        invalidCount,
        unreachableCount,
        amazon,
        flipkart
      };
    })
  );

  const productsWithAnyUrl = details.filter((item) => item.hasAnyUrl).length;
  const productsWithBothUrls = details.filter((item) => item.hasBothUrls).length;
  const productsMissingUrls = details.filter((item) => !item.hasAnyUrl).length;
  const invalidFormatCount = details.reduce((sum, item) => sum + item.invalidCount, 0);
  const unreachableCount = details.reduce((sum, item) => sum + item.unreachableCount, 0);
  const validReachableCount = details.reduce((sum, item) => {
    const reachable = [item.amazon, item.flipkart].filter((entry) => entry.present && entry.validFormat && entry.domainMatches && entry.reachable === true).length;
    return sum + reachable;
  }, 0);
  const issueCount = details.filter((item) => item.invalidCount > 0 || item.unreachableCount > 0 || !item.hasAnyUrl).length;

  return {
    checkedAt,
    totalProducts: products.length,
    productsWithAnyUrl,
    productsWithBothUrls,
    productsMissingUrls,
    invalidFormatCount,
    unreachableCount,
    validReachableCount,
    issueCount,
    details
  };
}

async function validateSingleUrl(rawUrl, expectedDomainFragment) {
  const url = String(rawUrl || '').trim();
  if (!url) {
    return {
      present: false,
      validFormat: false,
      domainMatches: false,
      reachable: null,
      status: null,
      error: null,
      url: ''
    };
  }

  if (!isValidUrl(url)) {
    return {
      present: true,
      validFormat: false,
      domainMatches: false,
      reachable: null,
      status: null,
      error: 'Invalid URL format',
      url
    };
  }

  const hostname = new URL(url).hostname.toLowerCase();
  const domainMatches = hostname.includes(expectedDomainFragment);
  if (!domainMatches) {
    return {
      present: true,
      validFormat: true,
      domainMatches: false,
      reachable: null,
      status: null,
      error: `Expected domain containing ${expectedDomainFragment}`,
      url
    };
  }

  try {
    const response = await fetch(url, {
      method: 'GET',
      redirect: 'follow',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-IN,en;q=0.9'
      },
      signal: AbortSignal.timeout(7000)
    });

    return {
      present: true,
      validFormat: true,
      domainMatches: true,
      reachable: response.ok,
      status: response.status,
      error: response.ok ? null : `HTTP ${response.status}`,
      url
    };
  } catch (error) {
    return {
      present: true,
      validFormat: true,
      domainMatches: true,
      reachable: false,
      status: null,
      error: error.message,
      url
    };
  }
}

// Get product by ID
async function getProductById(productId, requestId) {
  console.log(`[${requestId}] Getting product:`, productId);
  
  try {
    const result = await dynamodb.send(new GetCommand({
      TableName: PRODUCTS_TABLE,
      Key: { id: productId }
    }));
    
    if (!result.Item || !result.Item.isActive) {
      console.log(`[${requestId}] Product not found or inactive:`, productId);
      return buildResponse(404, { error: 'Product not found' });
    }
    
    console.log(`[${requestId}] Product retrieved successfully:`, productId);
    return buildResponse(200, result.Item);
  } catch (error) {
    console.error(`[${requestId}] DynamoDB error:`, error);
    return buildResponse(500, { error: 'Failed to retrieve product' });
  }
}

// Update product
async function updateProduct(productId, data, requestId) {
  console.log(`[${requestId}] Updating product:`, productId);
  
  const validation = validateProductData(data, true);
  if (!validation.valid) {
    console.error(`[${requestId}] Validation failed:`, validation.errors);
    return buildResponse(400, { error: 'Validation failed', details: validation.errors.join(', ') });
  }
  
  try {
    // Check if product exists
    const existing = await dynamodb.send(new GetCommand({
      TableName: PRODUCTS_TABLE,
      Key: { id: productId }
    }));
    
    if (!existing.Item || !existing.Item.isActive) {
      console.log(`[${requestId}] Product not found:`, productId);
      return buildResponse(404, { error: 'Product not found' });
    }
    
    // Cross-validate price vs cost against existing values
    const finalPrice = data.currentPrice !== undefined ? parseFloat(data.currentPrice) : existing.Item.currentPrice;
    const finalCost = data.costPrice !== undefined ? parseFloat(data.costPrice) : existing.Item.costPrice;
    if (!isNaN(finalPrice) && !isNaN(finalCost) && finalPrice < finalCost) {
      return buildResponse(400, { error: 'currentPrice must be greater than or equal to costPrice' });
    }
    
    // Record price change if price updated
    if (data.currentPrice !== undefined && data.currentPrice !== existing.Item.currentPrice) {
      await recordPriceChange(productId, existing.Item.currentPrice, data.currentPrice);
    }
    
    // Build update expression
    const updates = [];
    const names = {};
    const values = {};
    
    if (data.name !== undefined) {
      updates.push('#name = :name');
      names['#name'] = 'name';
      values[':name'] = data.name.trim();
    }
    if (data.category !== undefined) {
      updates.push('#category = :category');
      names['#category'] = 'category';
      values[':category'] = data.category.trim();
    }
    if (data.currentPrice !== undefined) {
      updates.push('#currentPrice = :currentPrice');
      names['#currentPrice'] = 'currentPrice';
      values[':currentPrice'] = parseFloat(data.currentPrice);
    }
    if (data.costPrice !== undefined) {
      updates.push('#costPrice = :costPrice');
      names['#costPrice'] = 'costPrice';
      values[':costPrice'] = parseFloat(data.costPrice);
    }
    if (data.stock !== undefined) {
      updates.push('#stock = :stock');
      names['#stock'] = 'stock';
      values[':stock'] = parseInt(data.stock);
      
      // Update stockDays estimate
      updates.push('#stockDays = :stockDays');
      names['#stockDays'] = 'stockDays';
      values[':stockDays'] = Math.floor(parseInt(data.stock) / 10) || 0;
    }
    if (data.competitors !== undefined) {
      updates.push('#competitors = :competitors');
      names['#competitors'] = 'competitors';
      values[':competitors'] = data.competitors;
    }
    if (data.amazonUrl !== undefined) {
      updates.push('#amazonUrl = :amazonUrl');
      names['#amazonUrl'] = 'amazonUrl';
      values[':amazonUrl'] = data.amazonUrl;
    }
    if (data.flipkartUrl !== undefined) {
      updates.push('#flipkartUrl = :flipkartUrl');
      names['#flipkartUrl'] = 'flipkartUrl';
      values[':flipkartUrl'] = data.flipkartUrl;
    }
    if (data.keywords !== undefined) {
      updates.push('#keywords = :keywords');
      names['#keywords'] = 'keywords';
      values[':keywords'] = data.keywords;
    }
    if (data.validUntil !== undefined) {
      updates.push('#validUntil = :validUntil');
      names['#validUntil'] = 'validUntil';
      values[':validUntil'] = data.validUntil || null;
    }
    
    updates.push('#updatedAt = :updatedAt');
    names['#updatedAt'] = 'updatedAt';
    values[':updatedAt'] = Date.now();
    
    const result = await dynamodb.send(new UpdateCommand({
      TableName: PRODUCTS_TABLE,
      Key: { id: productId },
      UpdateExpression: `SET ${updates.join(', ')}`,
      ExpressionAttributeNames: names,
      ExpressionAttributeValues: values,
      ReturnValues: 'ALL_NEW'
    }));
    
    console.log(`[${requestId}] Product updated successfully:`, productId);
    return buildResponse(200, result.Attributes);
  } catch (error) {
    console.error(`[${requestId}] DynamoDB error:`, error);
    return buildResponse(500, { error: 'Failed to update product' });
  }
}

// Delete product (soft delete) and all related data
async function deleteProduct(productId, requestId) {
  console.log(`[${requestId}] Deleting product and all related data:`, productId);
  
  try {
    const existing = await dynamodb.send(new GetCommand({
      TableName: PRODUCTS_TABLE,
      Key: { id: productId }
    }));
    
    if (!existing.Item) {
      console.log(`[${requestId}] Product not found:`, productId);
      return buildResponse(404, { error: 'Product not found' });
    }
    
    // Soft delete the product
    await dynamodb.send(new UpdateCommand({
      TableName: PRODUCTS_TABLE,
      Key: { id: productId },
      UpdateExpression: 'SET isActive = :inactive, updatedAt = :updatedAt',
      ExpressionAttributeValues: {
        ':inactive': false,
        ':updatedAt': Date.now()
      }
    }));
    
    // Delete all related data across all tables
    await Promise.all([
      deleteProductRecommendations(productId, requestId),
      deleteProductPriceHistory(productId, requestId),
      deleteProductAlerts(productId, requestId),
      deleteProductForecasts(productId, requestId),
      deleteProductPriceComparisons(productId, requestId),
      deleteProductRevenueImpact(productId, requestId)
    ]);
    
    console.log(`[${requestId}] Product and all related data deleted successfully:`, productId);
    return buildResponse(200, { message: 'Product and all related data deleted successfully', id: productId });
  } catch (error) {
    console.error(`[${requestId}] DynamoDB error:`, error);
    return buildResponse(500, { error: 'Failed to delete product' });
  }
}

// Delete all recommendations for a product
async function deleteProductRecommendations(productId, requestId) {
  try {
    const scanResult = await dynamodb.send(new ScanCommand({
      TableName: RECOMMENDATIONS_TABLE,
      FilterExpression: 'productId = :productId',
      ExpressionAttributeValues: {
        ':productId': productId
      }
    }));
    
    const items = scanResult.Items || [];
    console.log(`[${requestId}] Found ${items.length} recommendations to delete for product ${productId}`);
    
    for (const item of items) {
      await dynamodb.send(new UpdateCommand({
        TableName: RECOMMENDATIONS_TABLE,
        Key: { id: item.id },
        UpdateExpression: 'SET #status = :status, #updatedAt = :updatedAt',
        ExpressionAttributeNames: {
          '#status': 'status',
          '#updatedAt': 'updatedAt'
        },
        ExpressionAttributeValues: {
          ':status': 'deleted',
          ':updatedAt': Date.now()
        }
      }));
    }
  } catch (error) {
    console.error(`[${requestId}] Error deleting recommendations:`, error);
  }
}

// Delete all price history for a product
async function deleteProductPriceHistory(productId, requestId) {
  try {
    const scanResult = await dynamodb.send(new ScanCommand({
      TableName: PRICE_HISTORY_TABLE,
      FilterExpression: 'productId = :productId',
      ExpressionAttributeValues: {
        ':productId': productId
      }
    }));
    
    const items = scanResult.Items || [];
    console.log(`[${requestId}] Found ${items.length} price history records to delete for product ${productId}`);
    
    for (const item of items) {
      await dynamodb.send(new DeleteCommand({
        TableName: PRICE_HISTORY_TABLE,
        Key: { id: item.id, timestamp: item.timestamp }
      }));
    }
  } catch (error) {
    console.error(`[${requestId}] Error deleting price history:`, error);
  }
}

// Delete all alerts for a product
async function deleteProductAlerts(productId, requestId) {
  try {
    const scanResult = await dynamodb.send(new ScanCommand({
      TableName: ALERTS_TABLE,
      FilterExpression: 'productId = :productId',
      ExpressionAttributeValues: {
        ':productId': productId
      }
    }));
    
    const items = scanResult.Items || [];
    console.log(`[${requestId}] Found ${items.length} alerts to delete for product ${productId}`);
    
    for (const item of items) {
      await dynamodb.send(new DeleteCommand({
        TableName: ALERTS_TABLE,
        Key: { id: item.id }
      }));
    }
  } catch (error) {
    console.error(`[${requestId}] Error deleting alerts:`, error);
  }
}

// Delete all forecasts for a product
async function deleteProductForecasts(productId, requestId) {
  try {
    const scanResult = await dynamodb.send(new ScanCommand({
      TableName: FORECASTS_TABLE,
      FilterExpression: 'productId = :productId',
      ExpressionAttributeValues: {
        ':productId': productId
      }
    }));
    
    const items = scanResult.Items || [];
    console.log(`[${requestId}] Found ${items.length} forecasts to delete for product ${productId}`);
    
    for (const item of items) {
      await dynamodb.send(new DeleteCommand({
        TableName: FORECASTS_TABLE,
        Key: { id: item.id }
      }));
    }
  } catch (error) {
    console.error(`[${requestId}] Error deleting forecasts:`, error);
  }
}

// Delete all price comparisons for a product
async function deleteProductPriceComparisons(productId, requestId) {
  try {
    const scanResult = await dynamodb.send(new ScanCommand({
      TableName: PRICE_COMPARISON_TABLE,
      FilterExpression: 'productId = :productId',
      ExpressionAttributeValues: {
        ':productId': productId
      }
    }));
    
    const items = scanResult.Items || [];
    console.log(`[${requestId}] Found ${items.length} price comparisons to delete for product ${productId}`);
    
    for (const item of items) {
      await dynamodb.send(new DeleteCommand({
        TableName: PRICE_COMPARISON_TABLE,
        Key: { id: item.id }
      }));
    }
  } catch (error) {
    console.error(`[${requestId}] Error deleting price comparisons:`, error);
  }
}

// Delete all revenue impact records for a product
async function deleteProductRevenueImpact(productId, requestId) {
  try {
    const scanResult = await dynamodb.send(new ScanCommand({
      TableName: REVENUE_IMPACT_TABLE,
      FilterExpression: 'productId = :productId',
      ExpressionAttributeValues: {
        ':productId': productId
      }
    }));
    
    const items = scanResult.Items || [];
    console.log(`[${requestId}] Found ${items.length} revenue impact records to delete for product ${productId}`);
    
    for (const item of items) {
      await dynamodb.send(new DeleteCommand({
        TableName: REVENUE_IMPACT_TABLE,
        Key: { id: item.id }
      }));
    }
  } catch (error) {
    console.error(`[${requestId}] Error deleting revenue impact records:`, error);
  }
}

// Record price change in history
async function recordPriceChange(productId, oldPrice, newPrice) {
  const timestamp = Date.now();
  
  try {
    await dynamodb.send(new PutCommand({
      TableName: PRICE_HISTORY_TABLE,
      Item: {
        id: `${productId}#price-change`,
        timestamp,
        productId,
        oldPrice,
        newPrice,
        changedBy: 'system',
        recordedAt: new Date().toISOString()
      }
    }));
    
    console.log(`Price history recorded for ${productId}: ${oldPrice} → ${newPrice}`);
  } catch (error) {
    console.error('Failed to record price history:', error);
  }
}
