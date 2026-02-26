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
    
    try {
        let response;
        
        // Route based on HTTP method and path
        if (httpMethod === 'GET' && !pathParameters.id) {
            // GET /products - List all products
            response = await listProducts();
        } else if (httpMethod === 'GET' && pathParameters.id) {
            // GET /products/{id} - Get single product
            response = await getProduct(pathParameters.id);
        } else if (httpMethod === 'POST') {
            // POST /products - Create product
            const body = JSON.parse(event.body || '{}');
            response = await createProduct(body);
        } else if (httpMethod === 'PUT' && pathParameters.id) {
            // PUT /products/{id} - Update product
            const body = JSON.parse(event.body || '{}');
            response = await updateProduct(pathParameters.id, body);
        } else if (httpMethod === 'DELETE' && pathParameters.id) {
            // DELETE /products/{id} - Delete product
            response = await deleteProduct(pathParameters.id);
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

// List all products
async function listProducts() {
    const command = new ScanCommand({
        TableName: PRODUCTS_TABLE,
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
async function getProduct(id) {
    const command = new GetCommand({
        TableName: PRODUCTS_TABLE,
        Key: { id }
    });
    
    const result = await docClient.send(command);
    
    if (!result.Item) {
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
async function createProduct(data) {
    const product = {
        id: randomUUID(),
        name: data.name,
        sku: data.sku || `SKU-${Math.floor(Math.random() * 10000)}`,
        category: data.category || 'Electronics',
        currentPrice: parseFloat(data.currentPrice || 0),
        costPrice: parseFloat(data.costPrice || 0),
        stock: parseInt(data.stock || 0),
        stockDays: parseInt(data.stockDays || 0),
        competitors: data.competitors || [],
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
async function updateProduct(id, data) {
    const updateExpression = [];
    const expressionAttributeNames = {};
    const expressionAttributeValues = {};
    
    // Build update expression dynamically
    const allowedFields = ['name', 'currentPrice', 'costPrice', 'stock', 'stockDays', 'category'];
    
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
async function deleteProduct(id) {
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
