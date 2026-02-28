// Recommendation Engine - Lambda Function
// Generates smart pricing and inventory recommendations

import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, ScanCommand, PutCommand, GetCommand, UpdateCommand, QueryCommand } from "@aws-sdk/lib-dynamodb";
import { BedrockRuntimeClient, InvokeModelCommand } from "@aws-sdk/client-bedrock-runtime";
import { randomUUID } from "crypto";

const dynamoClient = new DynamoDBClient({ region: "us-east-1" });
const docClient = DynamoDBDocumentClient.from(dynamoClient);
const bedrockClient = new BedrockRuntimeClient({ region: "us-east-1" });

const PRODUCTS_TABLE = "RetailMind-Products";
const PRICE_HISTORY_TABLE = "RetailMind-PriceHistory";
const RECOMMENDATIONS_TABLE = "RetailMind-Recommendations";

// GST rates by category (India)
const GST_RATES = {
    'Electronics': 18,
    'Fashion': 12,
    'Clothing': 12,
    'Food': 5,
    'Groceries': 5,
    'Home': 18,
    'Furniture': 18,
    'Beauty': 18,
    'Cosmetics': 18,
    'Sports': 18,
    'Books': 0,
    'Toys': 12,
    'Jewelry': 3,
    'default': 18
};

// Helper: Calculate GST
function calculateGST(price, category) {
    const gstRate = GST_RATES[category] || GST_RATES['default'];
    const gstAmount = Math.round((price * gstRate) / (100 + gstRate));
    const priceBeforeGST = price - gstAmount;
    
    return {
        priceIncludingGST: price,
        priceExcludingGST: priceBeforeGST,
        gstAmount,
        gstRate,
        gstPercentage: `${gstRate}%`
    };
}

// Helper: Calculate price with GST
function addGST(priceExcludingGST, category) {
    const gstRate = GST_RATES[category] || GST_RATES['default'];
    const gstAmount = Math.round((priceExcludingGST * gstRate) / 100);
    const priceIncludingGST = priceExcludingGST + gstAmount;
    
    return {
        priceIncludingGST,
        priceExcludingGST,
        gstAmount,
        gstRate,
        gstPercentage: `${gstRate}%`
    };
}

export const handler = async (event) => {
    console.log('Recommendation Engine invoked:', JSON.stringify(event, null, 2));
    
    const httpMethod = event.httpMethod;
    const path = event.path;
    const pathParameters = event.pathParameters || {};
    
    try {
        let response;
        
        if (httpMethod === 'GET' && !pathParameters.id) {
            // GET /recommendations - List all recommendations
            response = await listRecommendations();
        } else if (httpMethod === 'GET' && pathParameters.id) {
            // GET /recommendations/{id} - Get single recommendation
            response = await getRecommendation(pathParameters.id);
        } else if (httpMethod === 'POST' && path.includes('/generate')) {
            // POST /recommendations/generate - Generate new recommendations
            response = await generateRecommendations();
        } else if (httpMethod === 'POST' && pathParameters.id && path.includes('/implement')) {
            // POST /recommendations/{id}/implement - Mark as implemented
            response = await implementRecommendation(pathParameters.id);
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

// List all recommendations
async function listRecommendations() {
    const command = new ScanCommand({
        TableName: RECOMMENDATIONS_TABLE,
        Limit: 50
    });
    
    const result = await docClient.send(command);
    
    // Sort by createdAt descending
    const recommendations = (result.Items || []).sort((a, b) => b.createdAt - a.createdAt);
    
    return {
        statusCode: 200,
        body: {
            recommendations: recommendations,
            count: recommendations.length
        }
    };
}

// Get single recommendation
async function getRecommendation(id) {
    const command = new GetCommand({
        TableName: RECOMMENDATIONS_TABLE,
        Key: { id }
    });
    
    const result = await docClient.send(command);
    
    if (!result.Item) {
        return {
            statusCode: 404,
            body: { error: 'Recommendation not found' }
        };
    }
    
    return {
        statusCode: 200,
        body: result.Item
    };
}

// Generate recommendations for all products
async function generateRecommendations() {
    console.log('Generating recommendations...');
    
    // Get all products
    const products = await getAllProducts();
    console.log(`Found ${products.length} products`);
    
    if (products.length === 0) {
        return {
            statusCode: 200,
            body: {
                message: 'No products to analyze',
                recommendationsGenerated: 0
            }
        };
    }
    
    const recommendations = [];
    
    for (const product of products) {
        // Get recent price history for this product
        const priceHistory = await getRecentPriceHistory(product.id);
        
        // Analyze and generate recommendations
        const productRecommendations = await analyzeProduct(product, priceHistory);
        recommendations.push(...productRecommendations);
    }
    
    // Store recommendations in DynamoDB
    for (const rec of recommendations) {
        await storeRecommendation(rec);
    }
    
    console.log(`Generated ${recommendations.length} recommendations`);
    
    return {
        statusCode: 200,
        body: {
            message: 'Recommendations generated successfully',
            recommendationsGenerated: recommendations.length,
            recommendations: recommendations
        }
    };
}

// Analyze product and generate recommendations
async function analyzeProduct(product, priceHistory) {
    const recommendations = [];
    
    // Calculate average competitor price
    const competitorPrices = priceHistory.filter(p => p.inStock);
    if (competitorPrices.length === 0) {
        return recommendations;
    }
    
    const avgCompetitorPrice = competitorPrices.reduce((sum, p) => sum + p.price, 0) / competitorPrices.length;
    const minCompetitorPrice = Math.min(...competitorPrices.map(p => p.price));
    const maxCompetitorPrice = Math.max(...competitorPrices.map(p => p.price));
    
    // Rule 1: Price too high (>15% above average)
    if (product.currentPrice > avgCompetitorPrice * 1.15) {
        const suggestedPrice = Math.round(avgCompetitorPrice * 0.98 / 10) * 10; // Round to nearest 10
        const priceDiff = product.currentPrice - suggestedPrice;
        const estimatedImpact = Math.round(priceDiff * 0.5 * 4); // Rough estimate: ₹X diff * 0.5 units/week * 4 weeks
        
        // Calculate GST breakdown
        const currentGST = calculateGST(product.currentPrice, product.category);
        const suggestedGST = calculateGST(suggestedPrice, product.category);
        
        recommendations.push({
            id: randomUUID(),
            productId: product.id,
            type: 'price_decrease',
            title: `Lower price on ${product.name}`,
            product: `${product.sku} • ${product.category}`,
            reason: `You're ${Math.round((product.currentPrice / avgCompetitorPrice - 1) * 100)}% above market average (₹${Math.round(avgCompetitorPrice)}). Competitor prices range from ₹${minCompetitorPrice} to ₹${maxCompetitorPrice}.`,
            suggestedPrice: suggestedPrice,
            currentPrice: product.currentPrice,
            gst: {
                current: currentGST,
                suggested: suggestedGST
            },
            impact: `+₹${estimatedImpact}/month estimated`,
            confidence: 87,
            status: 'pending',
            createdAt: Date.now(),
            updatedAt: Date.now()
        });
    }
    
    // Rule 2: All competitors out of stock (opportunity)
    const inStockCompetitors = priceHistory.filter(p => p.inStock);
    if (inStockCompetitors.length === 0 && priceHistory.length > 0) {
        const suggestedPrice = Math.round(product.currentPrice * 1.08 / 10) * 10;
        const estimatedImpact = Math.round((suggestedPrice - product.currentPrice) * 3 * 4);
        
        // Calculate GST breakdown
        const currentGST = calculateGST(product.currentPrice, product.category);
        const suggestedGST = calculateGST(suggestedPrice, product.category);
        
        recommendations.push({
            id: randomUUID(),
            productId: product.id,
            type: 'price_increase',
            title: `Increase price on ${product.name}`,
            product: `${product.sku} • ${product.category}`,
            reason: `All competitors are out of stock. You have a temporary monopoly. Demand is likely high.`,
            suggestedPrice: suggestedPrice,
            currentPrice: product.currentPrice,
            gst: {
                current: currentGST,
                suggested: suggestedGST
            },
            impact: `+₹${estimatedImpact}/month estimated`,
            confidence: 81,
            status: 'pending',
            createdAt: Date.now(),
            updatedAt: Date.now()
        });
    }
    
    // Rule 3: Low inventory (< 5 days)
    if (product.stockDays < 5) {
        const estimatedLoss = Math.round(product.currentPrice * 2 * 4); // 2 units/day * 4 weeks
        
        recommendations.push({
            id: randomUUID(),
            productId: product.id,
            type: 'restock',
            title: `Urgent: Restock ${product.name}`,
            product: `${product.sku} • ${product.category}`,
            reason: `Only ${product.stockDays} days of inventory remaining at current sales velocity. Risk of stockout.`,
            suggestedAction: `Order ${Math.ceil(product.stock * 2)} units immediately`,
            currentStock: product.stock,
            impact: `Prevent ₹${estimatedLoss} stockout loss`,
            confidence: 92,
            status: 'pending',
            createdAt: Date.now(),
            updatedAt: Date.now()
        });
    }
    
    // Rule 4: Slow-moving inventory (> 30 days)
    if (product.stockDays > 30) {
        const tiedUpCapital = Math.round(product.costPrice * product.stock);
        
        recommendations.push({
            id: randomUUID(),
            productId: product.id,
            type: 'promotion',
            title: `Clear slow inventory: ${product.name}`,
            product: `${product.sku} • ${product.category}`,
            reason: `${product.stockDays} days of stock. Slow-moving inventory ties up ₹${tiedUpCapital} in capital.`,
            suggestedAction: `Bundle with accessories or run 10-15% promotion`,
            currentStock: product.stock,
            impact: `Free up ₹${Math.round(tiedUpCapital * 0.7)} capital`,
            confidence: 75,
            status: 'pending',
            createdAt: Date.now(),
            updatedAt: Date.now()
        });
    }
    
    return recommendations;
}

// Implement recommendation
async function implementRecommendation(id) {
    const command = new UpdateCommand({
        TableName: RECOMMENDATIONS_TABLE,
        Key: { id },
        UpdateExpression: 'SET #status = :status, #implementedAt = :implementedAt, #updatedAt = :updatedAt',
        ExpressionAttributeNames: {
            '#status': 'status',
            '#implementedAt': 'implementedAt',
            '#updatedAt': 'updatedAt'
        },
        ExpressionAttributeValues: {
            ':status': 'implemented',
            ':implementedAt': Date.now(),
            ':updatedAt': Date.now()
        },
        ReturnValues: 'ALL_NEW'
    });
    
    const result = await docClient.send(command);
    
    return {
        statusCode: 200,
        body: result.Attributes
    };
}

// Helper: Get all products
async function getAllProducts() {
    const command = new ScanCommand({
        TableName: PRODUCTS_TABLE
    });
    
    const result = await docClient.send(command);
    return result.Items || [];
}

// Helper: Get recent price history
async function getRecentPriceHistory(productId) {
    const command = new ScanCommand({
        TableName: PRICE_HISTORY_TABLE,
        FilterExpression: 'productId = :productId',
        ExpressionAttributeValues: {
            ':productId': productId
        },
        Limit: 10
    });
    
    const result = await docClient.send(command);
    return result.Items || [];
}

// Helper: Store recommendation
async function storeRecommendation(recommendation) {
    const command = new PutCommand({
        TableName: RECOMMENDATIONS_TABLE,
        Item: recommendation
    });
    
    await docClient.send(command);
}
