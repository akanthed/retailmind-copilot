// Alert Engine - Lambda Function
// Monitors market conditions and generates proactive alerts

import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, ScanCommand, PutCommand, GetCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { SNSClient, PublishCommand } from "@aws-sdk/client-sns";
import { randomUUID } from "crypto";

const dynamoClient = new DynamoDBClient({ region: "us-east-1" });
const docClient = DynamoDBDocumentClient.from(dynamoClient);
const snsClient = new SNSClient({ region: "us-east-1" });

const PRODUCTS_TABLE = "RetailMind-Products";
const PRICE_HISTORY_TABLE = "RetailMind-PriceHistory";
const ALERTS_TABLE = "RetailMind-Alerts";

// SNS Topic ARN (we'll create this)
const SNS_TOPIC_ARN = process.env.SNS_TOPIC_ARN || "";

export const handler = async (event) => {
    console.log('Alert Engine invoked:', JSON.stringify(event, null, 2));
    
    const httpMethod = event.httpMethod;
    const path = event.path;
    const pathParameters = event.pathParameters || {};
    
    try {
        let response;
        
        if (httpMethod === 'GET' && !pathParameters.id) {
            // GET /alerts - List all alerts
            response = await listAlerts();
        } else if (httpMethod === 'GET' && pathParameters.id) {
            // GET /alerts/{id} - Get single alert
            response = await getAlert(pathParameters.id);
        } else if (httpMethod === 'POST' && path.includes('/generate')) {
            // POST /alerts/generate - Generate new alerts
            response = await generateAlerts();
        } else if (httpMethod === 'POST' && pathParameters.id && path.includes('/acknowledge')) {
            // POST /alerts/{id}/acknowledge - Acknowledge alert
            response = await acknowledgeAlert(pathParameters.id);
        } else if (httpMethod === 'GET' && path.includes('/stats')) {
            // GET /alerts/stats - Get alert statistics
            response = await getAlertStats();
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

// List all alerts
async function listAlerts() {
    const command = new ScanCommand({
        TableName: ALERTS_TABLE,
        Limit: 50
    });
    
    const result = await docClient.send(command);
    
    // Sort by createdAt descending
    const alerts = (result.Items || []).sort((a, b) => b.createdAt - a.createdAt);
    
    return {
        statusCode: 200,
        body: {
            alerts: alerts,
            count: alerts.length
        }
    };
}

// Get single alert
async function getAlert(id) {
    const command = new GetCommand({
        TableName: ALERTS_TABLE,
        Key: { id }
    });
    
    const result = await docClient.send(command);
    
    if (!result.Item) {
        return {
            statusCode: 404,
            body: { error: 'Alert not found' }
        };
    }
    
    return {
        statusCode: 200,
        body: result.Item
    };
}

// Generate alerts for all products
async function generateAlerts() {
    console.log('Generating alerts...');
    
    // Get all products
    const products = await getAllProducts();
    console.log(`Found ${products.length} products`);
    
    if (products.length === 0) {
        return {
            statusCode: 200,
            body: {
                message: 'No products to monitor',
                alertsGenerated: 0
            }
        };
    }
    
    const alerts = [];
    
    for (const product of products) {
        // Get recent price history
        const priceHistory = await getRecentPriceHistory(product.id);
        
        // Analyze and generate alerts
        const productAlerts = await analyzeProduct(product, priceHistory);
        alerts.push(...productAlerts);
    }
    
    // Store alerts in DynamoDB
    for (const alert of alerts) {
        await storeAlert(alert);
        
        // Send SNS notification for critical alerts
        if (alert.severity === 'critical' && SNS_TOPIC_ARN) {
            await sendNotification(alert);
        }
    }
    
    console.log(`Generated ${alerts.length} alerts`);
    
    return {
        statusCode: 200,
        body: {
            message: 'Alerts generated successfully',
            alertsGenerated: alerts.length,
            alerts: alerts
        }
    };
}

// Analyze product and generate alerts
async function analyzeProduct(product, priceHistory) {
    const alerts = [];
    
    // Skip if product is expired/invalid
    if (product.validUntil) {
        const validDate = new Date(product.validUntil);
        if (validDate < new Date()) {
            console.log(`Skipping expired product: ${product.name} (expired ${validDate.toISOString()})`);
            return alerts;
        }
    }
    
    if (priceHistory.length === 0) {
        return alerts;
    }
    
    // Get latest prices for each competitor
    const latestPrices = {};
    priceHistory.forEach(p => {
        if (!latestPrices[p.competitorId] || p.timestamp > latestPrices[p.competitorId].timestamp) {
            latestPrices[p.competitorId] = p;
        }
    });
    
    // Alert 1: Competitor price drop (>10%)
    Object.values(latestPrices).forEach(competitorPrice => {
        if (competitorPrice.inStock && competitorPrice.price > 0) {
            const priceDiff = ((product.currentPrice - competitorPrice.price) / competitorPrice.price) * 100;
            
            // Only alert if competitor price is still above our cost (profitable)
            const isProfitable = !product.costPrice || competitorPrice.price > product.costPrice;
            
            if (priceDiff > 10 && isFinite(priceDiff) && isProfitable) {
                const margin = product.costPrice 
                    ? ((competitorPrice.price - product.costPrice) / competitorPrice.price * 100).toFixed(1)
                    : null;
                
                alerts.push({
                    id: randomUUID(),
                    type: 'price_drop',
                    severity: priceDiff > 20 ? 'critical' : 'warning',
                    title: `${competitorPrice.competitorName} dropped ${product.name} price`,
                    description: `Price reduced to ₹${competitorPrice.price} (${Math.round(priceDiff)}% below yours)${margin ? `, ${margin}% margin if matched` : ''}`,
                    productId: product.id,
                    productName: product.name,
                    suggestion: margin 
                        ? `Consider matching to maintain market share (${margin}% margin maintained)`
                        : `Consider matching to maintain market share`,
                    data: {
                        yourPrice: product.currentPrice,
                        competitorPrice: competitorPrice.price,
                        competitor: competitorPrice.competitorName,
                        difference: Math.round(priceDiff),
                        costPrice: product.costPrice,
                        margin: margin
                    },
                    acknowledged: false,
                    createdAt: Date.now()
                });
            } else if (priceDiff > 10 && !isProfitable) {
                // Alert about unprofitable competitor pricing
                alerts.push({
                    id: randomUUID(),
                    type: 'opportunity',
                    severity: 'info',
                    title: `${competitorPrice.competitorName} pricing ${product.name} below cost`,
                    description: `Competitor price ₹${competitorPrice.price} is below your cost ₹${product.costPrice}. They may be clearing inventory.`,
                    productId: product.id,
                    productName: product.name,
                    suggestion: `Maintain current pricing. Competitor likely clearing stock at a loss.`,
                    data: {
                        yourPrice: product.currentPrice,
                        competitorPrice: competitorPrice.price,
                        competitor: competitorPrice.competitorName,
                        costPrice: product.costPrice
                    },
                    acknowledged: false,
                    createdAt: Date.now()
                });
            }
        }
    });
    
    // Alert 2: Stock risk (< 5 days)
    if (product.stockDays > 0 && product.stockDays < 5) {
        alerts.push({
            id: randomUUID(),
            type: 'stock_risk',
            severity: product.stockDays < 2 ? 'critical' : 'warning',
            title: `${product.name} stock running low`,
            description: `Only ${product.stockDays} days of inventory remaining at current sales velocity`,
            productId: product.id,
            productName: product.name,
            suggestion: `Reorder ${Math.ceil(product.stock * 2)} units to maintain 2-week buffer`,
            data: {
                currentStock: product.stock,
                stockDays: product.stockDays,
                reorderQuantity: Math.ceil(product.stock * 2)
            },
            acknowledged: false,
            createdAt: Date.now()
        });
    }
    
    // Alert 3: Pricing opportunity (all competitors out of stock)
    const inStockCompetitors = Object.values(latestPrices).filter(p => p.inStock);
    if (inStockCompetitors.length === 0 && Object.keys(latestPrices).length > 0) {
        alerts.push({
            id: randomUUID(),
            type: 'opportunity',
            severity: 'info',
            title: `Pricing opportunity on ${product.name}`,
            description: `All competitors are out of stock. You have temporary monopoly.`,
            productId: product.id,
            productName: product.name,
            suggestion: `Consider 8% price increase while supply is limited`,
            data: {
                currentPrice: product.currentPrice,
                suggestedPrice: Math.round(product.currentPrice * 1.08 / 10) * 10,
                potentialGain: Math.round((product.currentPrice * 0.08) * 3 * 4) // 3 units/week * 4 weeks
            },
            acknowledged: false,
            createdAt: Date.now()
        });
    }
    
    // Alert 4: Demand spike (based on stock velocity)
    if (product.stockDays > 0 && product.stockDays < 10 && product.stock > 20) {
        const dailySales = product.stock / product.stockDays;
        if (dailySales > 5 && isFinite(dailySales)) {
            alerts.push({
                id: randomUUID(),
                type: 'opportunity',
                severity: 'info',
                title: `Trending: ${product.name} demand spike`,
                description: `High sales velocity detected (${Math.round(dailySales)} units/day). Stock will deplete in ${product.stockDays} days.`,
                productId: product.id,
                productName: product.name,
                suggestion: `Feature in homepage and consider premium pricing`,
                data: {
                    dailySales: Math.round(dailySales),
                    stockDays: product.stockDays,
                    currentStock: product.stock
                },
                acknowledged: false,
                createdAt: Date.now()
            });
        }
    }
    
    return alerts;
}

// Acknowledge alert
async function acknowledgeAlert(id) {
    const command = new UpdateCommand({
        TableName: ALERTS_TABLE,
        Key: { id },
        UpdateExpression: 'SET acknowledged = :ack, acknowledgedAt = :time',
        ExpressionAttributeValues: {
            ':ack': true,
            ':time': Date.now()
        },
        ReturnValues: 'ALL_NEW'
    });
    
    const result = await docClient.send(command);
    
    return {
        statusCode: 200,
        body: result.Attributes
    };
}

// Get alert statistics
async function getAlertStats() {
    const command = new ScanCommand({
        TableName: ALERTS_TABLE
    });
    
    const result = await docClient.send(command);
    const alerts = result.Items || [];
    
    const stats = {
        total: alerts.length,
        byType: {
            price_drop: alerts.filter(a => a.type === 'price_drop').length,
            stock_risk: alerts.filter(a => a.type === 'stock_risk').length,
            opportunity: alerts.filter(a => a.type === 'opportunity').length
        },
        bySeverity: {
            critical: alerts.filter(a => a.severity === 'critical').length,
            warning: alerts.filter(a => a.severity === 'warning').length,
            info: alerts.filter(a => a.severity === 'info').length
        },
        acknowledged: alerts.filter(a => a.acknowledged).length,
        unacknowledged: alerts.filter(a => !a.acknowledged).length
    };
    
    return {
        statusCode: 200,
        body: stats
    };
}

// Send SNS notification
async function sendNotification(alert) {
    if (!SNS_TOPIC_ARN) {
        console.log('SNS Topic ARN not configured, skipping notification');
        return;
    }
    
    try {
        const message = `
🚨 ${alert.title}

${alert.description}

💡 Suggestion: ${alert.suggestion}

View details in RetailMind AI dashboard.
        `.trim();
        
        const command = new PublishCommand({
            TopicArn: SNS_TOPIC_ARN,
            Subject: `RetailMind Alert: ${alert.title}`,
            Message: message
        });
        
        await snsClient.send(command);
        console.log(`SNS notification sent for alert: ${alert.id}`);
    } catch (error) {
        console.error('Failed to send SNS notification:', error);
    }
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
        Limit: 20
    });
    
    const result = await docClient.send(command);
    return result.Items || [];
}

// Helper: Store alert
async function storeAlert(alert) {
    const command = new PutCommand({
        TableName: ALERTS_TABLE,
        Item: alert
    });
    
    await docClient.send(command);
}
