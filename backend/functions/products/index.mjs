import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand, GetCommand, ScanCommand, UpdateCommand, QueryCommand } from "@aws-sdk/lib-dynamodb";
import { randomUUID } from "crypto";

const dynamodb = DynamoDBDocumentClient.from(new DynamoDBClient({ region: "us-east-1" }));

const PRODUCTS_TABLE = "RetailMind-Products";
const PRICE_HISTORY_TABLE = "RetailMind-PriceHistory";

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
    } else if (!Number.isInteger(price * 100)) {
      errors.push('currentPrice must have at most 2 decimal places');
    }
  }
  
  if (!isUpdate || data.cost !== undefined) {
    const cost = parseFloat(data.cost);
    if (isNaN(cost) || cost < 0) {
      errors.push('cost must be greater than or equal to 0');
    } else if (!Number.isInteger(cost * 100)) {
      errors.push('cost must have at most 2 decimal places');
    }
  }
  
  if (!isUpdate || data.stockQuantity !== undefined) {
    const stock = parseInt(data.stockQuantity);
    if (isNaN(stock) || stock < 0 || !Number.isInteger(stock)) {
      errors.push('stockQuantity must be a non-negative integer');
    }
  }
  
  // Validate price >= cost
  const price = parseFloat(data.currentPrice);
  const cost = parseFloat(data.cost);
  if (!isNaN(price) && !isNaN(cost) && price < cost) {
    errors.push('currentPrice must be greater than or equal to cost');
  }
  
  // Validate competitor URLs
  if (data.competitorUrls && Array.isArray(data.competitorUrls)) {
    data.competitorUrls.forEach((comp, idx) => {
      if (comp.url && !isValidUrl(comp.url)) {
        errors.push(`competitorUrls[${idx}].url must be a valid HTTP or HTTPS URL`);
      }
    });
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
  console.log(`[${requestId}] Creating product`);
  
  const validation = validateProductData(data, false);
  if (!validation.valid) {
    console.error(`[${requestId}] Validation failed:`, validation.errors);
    return buildResponse(400, { error: 'Validation failed', details: validation.errors.join(', ') });
  }
  
  const isUnique = await checkSKUUniqueness(data.sku);
  if (!isUnique) {
    console.error(`[${requestId}] SKU already exists:`, data.sku);
    return buildResponse(400, { error: 'SKU already exists' });
  }
  
  const timestamp = new Date().toISOString();
  const product = {
    id: randomUUID(),
    name: data.name.trim(),
    sku: data.sku.trim(),
    category: data.category.trim(),
    currentPrice: parseFloat(data.currentPrice),
    cost: parseFloat(data.cost),
    stockQuantity: parseInt(data.stockQuantity),
    competitorUrls: data.competitorUrls || [],
    isActive: true,
    createdAt: timestamp,
    lastModified: timestamp
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
    
    console.log(`[${requestId}] Retrieved ${paginatedProducts.length} products`);
    
    return buildResponse(200, {
      products: paginatedProducts,
      pagination: {
        totalCount,
        pageSize,
        currentPage: page,
        totalPages
      }
    });
  } catch (error) {
    console.error(`[${requestId}] DynamoDB error:`, error);
    return buildResponse(500, { error: 'Failed to retrieve products' });
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
    if (data.cost !== undefined) {
      updates.push('#cost = :cost');
      names['#cost'] = 'cost';
      values[':cost'] = parseFloat(data.cost);
    }
    if (data.stockQuantity !== undefined) {
      updates.push('#stockQuantity = :stockQuantity');
      names['#stockQuantity'] = 'stockQuantity';
      values[':stockQuantity'] = parseInt(data.stockQuantity);
    }
    if (data.competitorUrls !== undefined) {
      updates.push('#competitorUrls = :competitorUrls');
      names['#competitorUrls'] = 'competitorUrls';
      values[':competitorUrls'] = data.competitorUrls;
    }
    
    updates.push('#lastModified = :lastModified');
    names['#lastModified'] = 'lastModified';
    values[':lastModified'] = new Date().toISOString();
    
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

// Delete product (soft delete)
async function deleteProduct(productId, requestId) {
  console.log(`[${requestId}] Deleting product:`, productId);
  
  try {
    const existing = await dynamodb.send(new GetCommand({
      TableName: PRODUCTS_TABLE,
      Key: { id: productId }
    }));
    
    if (!existing.Item) {
      console.log(`[${requestId}] Product not found:`, productId);
      return buildResponse(404, { error: 'Product not found' });
    }
    
    await dynamodb.send(new UpdateCommand({
      TableName: PRODUCTS_TABLE,
      Key: { id: productId },
      UpdateExpression: 'SET isActive = :inactive, lastModified = :lastModified',
      ExpressionAttributeValues: {
        ':inactive': false,
        ':lastModified': new Date().toISOString()
      }
    }));
    
    console.log(`[${requestId}] Product deleted successfully:`, productId);
    return buildResponse(200, { message: 'Product deleted successfully', id: productId });
  } catch (error) {
    console.error(`[${requestId}] DynamoDB error:`, error);
    return buildResponse(500, { error: 'Failed to delete product' });
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
