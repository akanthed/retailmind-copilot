// Products API - Lambda Function
// Handles CRUD operations for products

import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand, GetCommand, ScanCommand, UpdateCommand, DeleteCommand } from "@aws-sdk/lib-dynamodb";
import { randomUUID } from "crypto";

const client = new DynamoDBClient({ region: "us-east-1" });
const docClient = DynamoDBDocumentClient.from(client);

const PRODUCTS_TABLE = "RetailMind-Products";

export const handler = async (event) => {
    console.log('Products API invoked:', JSON.stringify(event, null, 2));
    
    const httpMethod = event.httpMethod;
    const path = event.path;
    const pathParameters = event.pathParameters || {};
    const userId = getUserIdFromEvent(event);
    
    try {
        let response;
        
        // Handle OPTIONS for CORS preflight
        if (httpMethod === 'OPTIONS') {
            return {
                statusCode: 200,
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
                    'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key'
                },
                body: ''
            };
        }
        
        // Route based on HTTP method and path
        if (httpMethod === 'GET' && !pathParameters.id) {
            // GET /products - List all products
            response = await listProducts(userId);
        } else if (httpMethod === 'GET' && pathParameters.id) {
            // GET /products/{id} - Get single product
            response = await getProduct(pathParameters.id, userId);
        } else if (httpMethod === 'POST') {
            // POST /products - Create product
            const body = JSON.parse(event.body || '{}');
            response = await createProduct(body, userId);
        } else if (httpMethod === 'PUT' && pathParameters.id) {
            // PUT /products/{id} - Update product
            const body = JSON.parse(event.body || '{}');
            response = await updateProduct(pathParameters.id, body, userId);
        } else if (httpMethod === 'DELETE' && pathParameters.id) {
            // DELETE /products/{id} - Delete product
            response = await deleteProduct(pathParameters.id, userId);
        } else {
            response = {
                statusCode: 404,
                body: { error: 'Not found' }
            };
        }
        
        return {
            statusCode: response.statusCode || 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify(response.body || response)
        };
        
    } catch (error) {
        console.error('Error:', error);
        return {
            statusCode: 500,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({
                error: 'Internal server error',
                message: error.message
            })
        };
    }
};

function getUserIdFromEvent(event) {
    const claims = event?.requestContext?.authorizer?.claims || event?.requestContext?.authorizer?.jwt?.claims || {};
    return claims.sub || claims['cognito:username'] || 'anonymous';
}

// List all products
async function listProducts(userId) {
    const command = new ScanCommand({
        TableName: PRODUCTS_TABLE,
        FilterExpression: 'attribute_not_exists(userId) OR userId = :uid',
        ExpressionAttributeValues: {
            ':uid': userId
        },
        Limit: 100
    });
    
    const result = await docClient.send(command);
    
    return {
        statusCode: 200,
        body: {
            products: result.Items || [],
            count: result.Count || 0
        }
    };
}

// Get single product
async function getProduct(id, userId) {
    const command = new GetCommand({
        TableName: PRODUCTS_TABLE,
        Key: { id }
    });
    
    const result = await docClient.send(command);
    
    if (!result.Item || (result.Item.userId && result.Item.userId !== userId)) {
        return {
            statusCode: 404,
            body: { error: 'Product not found' }
        };
    }
    
    return {
        statusCode: 200,
        body: result.Item
    };
}

// Create new product
async function createProduct(data, userId) {
    const product = {
        id: randomUUID(),
        userId,
        name: data.name,
        sku: data.sku || `SKU-${Math.floor(Math.random() * 10000)}`,
        category: data.category || 'Electronics',
        currentPrice: parseFloat(data.currentPrice || 0),
        costPrice: parseFloat(data.costPrice || 0),
        stock: parseInt(data.stock || 0),
        stockDays: parseInt(data.stockDays || 0),
        competitors: data.competitors || [],
        amazonUrl: data.amazonUrl || '',
        flipkartUrl: data.flipkartUrl || '',
        keywords: data.keywords || data.name,
        createdAt: Date.now(),
        updatedAt: Date.now()
    };
    
    const command = new PutCommand({
        TableName: PRODUCTS_TABLE,
        Item: product
    });
    
    await docClient.send(command);
    
    return {
        statusCode: 201,
        body: product
    };
}

// Update product
async function updateProduct(id, data, userId) {
    const existing = await getProduct(id, userId);
    if (existing.statusCode !== 200) {
        return existing;
    }

    const updateExpression = [];
    const expressionAttributeNames = {};
    const expressionAttributeValues = {};
    
    // Build update expression dynamically
    const allowedFields = ['name', 'currentPrice', 'costPrice', 'stock', 'stockDays', 'category', 'amazonUrl', 'flipkartUrl', 'keywords'];
    
    allowedFields.forEach(field => {
        if (data[field] !== undefined) {
            updateExpression.push(`#${field} = :${field}`);
            expressionAttributeNames[`#${field}`] = field;
            expressionAttributeValues[`:${field}`] = data[field];
        }
    });
    
    if (updateExpression.length === 0) {
        return {
            statusCode: 400,
            body: { error: 'No valid fields to update' }
        };
    }
    
    // Always update updatedAt
    updateExpression.push('#updatedAt = :updatedAt');
    expressionAttributeNames['#updatedAt'] = 'updatedAt';
    expressionAttributeValues[':updatedAt'] = Date.now();
    
    const command = new UpdateCommand({
        TableName: PRODUCTS_TABLE,
        Key: { id },
        UpdateExpression: `SET ${updateExpression.join(', ')}`,
        ExpressionAttributeNames: expressionAttributeNames,
        ExpressionAttributeValues: expressionAttributeValues,
        ReturnValues: 'ALL_NEW'
    });
    
    const result = await docClient.send(command);
    
    return {
        statusCode: 200,
        body: result.Attributes
    };
}

// Delete product
async function deleteProduct(id, userId) {
    const existing = await getProduct(id, userId);
    if (existing.statusCode !== 200) {
        return existing;
    }

    const command = new DeleteCommand({
        TableName: PRODUCTS_TABLE,
        Key: { id }
    });
    
    await docClient.send(command);
    
    return {
        statusCode: 200,
        body: { message: 'Product deleted successfully', id }
    };
}
