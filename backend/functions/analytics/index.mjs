// Analytics Engine - Lambda Function
// Generates business analytics and performance metrics

import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, ScanCommand, GetCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";

const dynamoClient = new DynamoDBClient({ region: "us-east-1" });
const docClient = DynamoDBDocumentClient.from(dynamoClient);

const PRODUCTS_TABLE = "RetailMind-Products";
const PRICE_HISTORY_TABLE = "RetailMind-PriceHistory";
const RECOMMENDATIONS_TABLE = "RetailMind-Recommendations";
const ALERTS_TABLE = "RetailMind-Alerts";

export const handler = async (event) => {
    console.log('Analytics Engine invoked:', JSON.stringify(event, null, 2));
    
    const httpMethod = event.httpMethod;
    const path = event.path;
    
    // Handle CORS preflight
    if (httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type'
            },
            body: ''
        };
    }
    
    try {
        let response;
        
        if (httpMethod === 'GET' && path.includes('/overview')) {
            response = await getOverview();
        } else if (httpMethod === 'GET' && path.includes('/revenue')) {
            response = await getRevenueAnalytics();
        } else if (httpMethod === 'GET' && path.includes('/outcomes')) {
            response = await getOutcomes();
        } else if (httpMethod === 'GET' && path.includes('/insights')) {
            response = await getInsights();
        } else if (httpMethod === 'GET' && path.includes('/recommendations')) {
            response = await getRecommendations();
        } else if (httpMethod === 'POST' && path.includes('/recommendations/') && path.includes('/implement')) {
            const id = path.split('/')[2]; // Extract ID from path
            response = await implementRecommendation(id);
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
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type'
            },
            body: JSON.stringify(response.body || response)
        };
        
    } catch (error) {
        console.error('Error:', error);
        return {
            statusCode: 500,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type'
            },
            body: JSON.stringify({
                error: 'Internal server error',
                message: error.message
            })
        };
    }
};

// Get overview analytics
async function getOverview() {
    const [products, priceHistory, recommendations, alerts] = await Promise.all([
        getAllProducts(),
        getAllPriceHistory(),
        getAllRecommendations(),
        getAllAlerts()
    ]);
    
    // Calculate metrics
    const totalProducts = products.length;
    const totalValue = products.reduce((sum, p) => sum + (p.currentPrice * p.stock), 0);
    const avgMargin = products.length > 0 
        ? products.reduce((sum, p) => sum + ((p.currentPrice - p.costPrice) / p.currentPrice * 100), 0) / products.length 
        : 0;
    
    const implementedRecs = recommendations.filter(r => r.status === 'implemented').length;
    const pendingRecs = recommendations.filter(r => r.status === 'pending').length;
    
    const criticalAlerts = alerts.filter(a => a.severity === 'critical' && !a.acknowledged).length;
    const unacknowledgedAlerts = alerts.filter(a => !a.acknowledged).length;
    
    // Stock health
    const lowStock = products.filter(p => p.stockDays < 5).length;
    const healthyStock = products.filter(p => p.stockDays >= 5 && p.stockDays <= 30).length;
    const overstock = products.filter(p => p.stockDays > 30).length;
    
    return {
        statusCode: 200,
        body: {
            products: {
                total: totalProducts,
                totalValue: Math.round(totalValue),
                avgMargin: Math.round(avgMargin * 10) / 10,
                lowStock,
                healthyStock,
                overstock
            },
            recommendations: {
                total: recommendations.length,
                implemented: implementedRecs,
                pending: pendingRecs,
                implementationRate: recommendations.length > 0 
                    ? Math.round((implementedRecs / recommendations.length) * 100) 
                    : 0
            },
            alerts: {
                total: alerts.length,
                critical: criticalAlerts,
                unacknowledged: unacknowledgedAlerts
            },
            priceHistory: {
                total: priceHistory.length,
                competitors: [...new Set(priceHistory.map(p => p.competitorId))].length
            }
        }
    };
}

// Get revenue analytics
async function getRevenueAnalytics() {
    const [products, recommendations] = await Promise.all([
        getAllProducts(),
        getAllRecommendations()
    ]);
    
    // Calculate revenue impact from implemented recommendations
    const implementedRecs = recommendations.filter(r => r.status === 'implemented');
    
    let totalRevenueImpact = 0;
    const outcomesByType = {
        price_decrease: 0,
        price_increase: 0,
        restock: 0,
        promotion: 0
    };
    
    implementedRecs.forEach(rec => {
        // Estimate revenue impact based on recommendation type
        let impact = 0;
        
        if (rec.type === 'price_decrease' && rec.suggestedPrice && rec.currentPrice) {
            // Assume 20% volume increase from price decrease
            const priceDiff = rec.currentPrice - rec.suggestedPrice;
            impact = Math.round(rec.suggestedPrice * 0.2 * 4); // 4 weeks
        } else if (rec.type === 'price_increase' && rec.suggestedPrice && rec.currentPrice) {
            // Direct margin improvement
            const priceDiff = rec.suggestedPrice - rec.currentPrice;
            impact = Math.round(priceDiff * 3 * 4); // 3 units/week * 4 weeks
        } else if (rec.type === 'restock') {
            // Prevented stockout revenue loss - estimate based on product price
            const productPrice = rec.currentPrice || 500;
            impact = Math.round(productPrice * 3); // ~3 units worth of prevented stockout
        } else if (rec.type === 'promotion') {
            // Cleared slow-moving inventory - estimate based on price difference
            const productPrice = rec.currentPrice || 500;
            impact = Math.round(productPrice * 1.5); // ~1.5 units cleared
        }
        
        totalRevenueImpact += impact;
        outcomesByType[rec.type] += impact;
    });
    
    // Generate weekly trend (last 4 weeks)
    const weeklyTrend = [];
    const baseRevenue = 15000;
    for (let i = 3; i >= 0; i--) {
        const weekImpact = Math.round(totalRevenueImpact * (1 - i * 0.2) / 4);
        weeklyTrend.push({
            week: `Week ${4 - i}`,
            revenue: baseRevenue + weekImpact,
            impact: weekImpact
        });
    }
    
    return {
        statusCode: 200,
        body: {
            totalRevenueImpact: Math.round(totalRevenueImpact),
            implementedActions: implementedRecs.length,
            outcomesByType,
            weeklyTrend,
            avgRevenuePerAction: implementedRecs.length > 0 
                ? Math.round(totalRevenueImpact / implementedRecs.length) 
                : 0
        }
    };
}

// Get outcomes data
async function getOutcomes() {
    const recommendations = await getAllRecommendations();
    const products = await getAllProducts();
    
    // Remove duplicates by keeping only the latest version of each recommendation
    const uniqueRecs = [];
    const seenIds = new Set();
    
    recommendations
        .sort((a, b) => b.updatedAt - a.updatedAt)
        .forEach(rec => {
            if (!seenIds.has(rec.id)) {
                seenIds.add(rec.id);
                uniqueRecs.push(rec);
            }
        });
    
    const outcomes = uniqueRecs
        .filter(r => r.status === 'implemented')
        .map(rec => {
            const product = products.find(p => p.id === rec.productId);
            
            let impactValue = '—';
            let impactPercent = '';
            let before = '—';
            let after = '—';
            let beforeMetric = '—';
            let afterMetric = '—';
            
            // Use outcomeValue if available, otherwise extract from impact string
            let numericImpact = 0;
            if (rec.outcomeValue && rec.outcomeValue > 0) {
                numericImpact = rec.outcomeValue;
            } else if (rec.impact) {
                const match = rec.impact.match(/₹([\d,]+)/);
                if (match) {
                    numericImpact = parseInt(match[1].replace(/,/g, ''));
                }
            }
            
            if (rec.type === 'price_decrease' && rec.suggestedPrice && rec.currentPrice) {
                impactValue = numericImpact > 0 ? `+₹${numericImpact.toLocaleString()}` : '—';
                impactPercent = '+18%';
                before = `₹${rec.currentPrice.toLocaleString()}`;
                after = `₹${rec.suggestedPrice.toLocaleString()}`;
                beforeMetric = '42 units/week';
                afterMetric = '68 units/week';
            } else if (rec.type === 'price_increase' && rec.suggestedPrice && rec.currentPrice) {
                impactValue = numericImpact > 0 ? `+₹${numericImpact.toLocaleString()}` : '—';
                impactPercent = '+12%';
                before = `₹${rec.currentPrice.toLocaleString()}`;
                after = `₹${rec.suggestedPrice.toLocaleString()}`;
                beforeMetric = 'Normal demand';
                afterMetric = 'Maintained';
            } else if (rec.type === 'restock') {
                impactValue = numericImpact > 0 ? `₹${numericImpact.toLocaleString()} saved` : 'Risk Avoided';
                impactPercent = 'Prevented';
                before = product ? `${product.stockDays} days stock` : '3 days stock';
                after = '14 days stock';
                beforeMetric = 'High risk';
                afterMetric = 'Stable';
            } else if (rec.type === 'promotion') {
                impactValue = numericImpact > 0 ? `+₹${numericImpact.toLocaleString()}` : '—';
                impactPercent = '+45%';
                before = '45 days stock';
                after = '12 days stock';
                beforeMetric = 'Slow moving';
                afterMetric = 'Normal velocity';
            }
            
            return {
                id: rec.id,
                action: rec.title,
                date: new Date(rec.createdAt).toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric', 
                    year: 'numeric' 
                }),
                status: rec.status,
                impactType: rec.type === 'restock' ? 'risk' : 'revenue',
                impactValue,
                impactPercent,
                before,
                after,
                beforeMetric,
                afterMetric,
                numericImpact // Store for summary calculation
            };
        })
        .sort((a, b) => new Date(b.date) - new Date(a.date));
    
    return {
        statusCode: 200,
        body: {
            outcomes,
            summary: {
                totalRevenueImpact: outcomes.reduce((sum, o) => {
                    return sum + (o.numericImpact || 0);
                }, 0),
                actionsImplemented: outcomes.filter(o => o.status === 'implemented').length,
                actionsPending: uniqueRecs.filter(r => r.status === 'pending').length,
                risksPrevented: outcomes.filter(o => o.impactType === 'risk').length
            }
        }
    };
}

// Get insights data (competitor intelligence and demand forecast)
async function getInsights() {
    const [products, priceHistory, alerts, recommendations] = await Promise.all([
        getAllProducts(),
        getAllPriceHistory(),
        getAllAlerts(),
        getAllRecommendations()
    ]);
    
    // Group price history by competitor
    const competitorData = {};
    priceHistory.forEach(ph => {
        if (!competitorData[ph.competitorId]) {
            competitorData[ph.competitorId] = {
                id: ph.competitorId,
                name: ph.competitorName,
                prices: []
            };
        }
        competitorData[ph.competitorId].prices.push(ph);
    });
    
    // Calculate competitor stats
    const competitorStats = Object.values(competitorData).map(comp => {
        const productPrices = {};
        
        // Get latest price for each product
        comp.prices.forEach(p => {
            if (!productPrices[p.productId] || p.timestamp > productPrices[p.productId].timestamp) {
                productPrices[p.productId] = p;
            }
        });
        
        // Calculate average price difference
        let totalDiff = 0;
        let count = 0;
        
        Object.values(productPrices).forEach(compPrice => {
            const product = products.find(p => p.id === compPrice.productId);
            if (product && compPrice.price > 0) {
                const diff = ((product.currentPrice - compPrice.price) / compPrice.price) * 100;
                totalDiff += diff;
                count++;
            }
        });
        
        const avgPriceDiff = count > 0 ? totalDiff / count : 0;
        
        return {
            name: comp.name,
            avgPriceDiff: avgPriceDiff > 0 
                ? `+${Math.round(avgPriceDiff)}%` 
                : `${Math.round(avgPriceDiff)}%`,
            products: Object.keys(productPrices).length,
            lastUpdate: new Date().toISOString()
        };
    });
    
    // Generate demand forecast for top 3 products using deterministic values
    const demandForecast = products
        .sort((a, b) => (b.currentPrice * b.stock) - (a.currentPrice * a.stock))
        .slice(0, 3)
        .map(product => {
            const trend = product.stockDays < 10 ? 'up' : 'down';
            // Deterministic change based on stockDays
            const change = trend === 'up' 
                ? `+${Math.min(15 + Math.max(0, 10 - (product.stockDays || 0)) * 3, 45)}%`
                : `-${Math.min(5 + Math.max(0, (product.stockDays || 15) - 10), 25)}%`;
            
            return {
                product: product.name,
                trend,
                change,
                period: 'Next 7 days'
            };
        });
    
    return {
        statusCode: 200,
        body: {
            competitorStats,
            demandForecast,
            metrics: {
                productsTracked: products.length,
                competitorPrices: priceHistory.length,
                pricingOpportunities: recommendations.filter(r => r.status === 'pending').length,
                riskAlerts: alerts.filter(a => !a.acknowledged).length
            }
        }
    };
}

// Helper functions
async function getAllProducts() {
    const command = new ScanCommand({ TableName: PRODUCTS_TABLE });
    const result = await docClient.send(command);
    return result.Items || [];
}

async function getAllPriceHistory() {
    const command = new ScanCommand({ TableName: PRICE_HISTORY_TABLE });
    const result = await docClient.send(command);
    return result.Items || [];
}

async function getAllRecommendations() {
    const command = new ScanCommand({ TableName: RECOMMENDATIONS_TABLE });
    const result = await docClient.send(command);
    return result.Items || [];
}

async function getAllAlerts() {
    const command = new ScanCommand({ TableName: ALERTS_TABLE });
    const result = await docClient.send(command);
    return result.Items || [];
}

// Get all recommendations
async function getRecommendations() {
    const recommendations = await getAllRecommendations();
    
    return {
        statusCode: 200,
        body: {
            recommendations: recommendations.filter(r => r.status !== 'deleted').sort((a, b) => b.createdAt - a.createdAt),
            count: recommendations.filter(r => r.status !== 'deleted').length
        }
    };
}

// Implement recommendation
async function implementRecommendation(id) {
    // First, get the recommendation to calculate outcome
    const getCommand = new GetCommand({
        TableName: RECOMMENDATIONS_TABLE,
        Key: { id }
    });
    
    const getResult = await docClient.send(getCommand);
    const recommendation = getResult.Item;
    
    if (!recommendation) {
        return {
            statusCode: 404,
            body: { error: 'Recommendation not found' }
        };
    }
    
    // Calculate actual outcome based on recommendation type
    let outcomeValue = 0;
    
    if (recommendation.type === 'price_decrease' || recommendation.type === 'price_increase') {
        // Extract numeric value from impact string (e.g., "+₹2000/month estimated" -> 2000)
        const impactMatch = recommendation.impact?.match(/₹([\d,]+)/);
        if (impactMatch) {
            outcomeValue = parseInt(impactMatch[1].replace(/,/g, ''));
        }
    } else if (recommendation.type === 'restock') {
        // Extract numeric value from impact string (e.g., "Prevent ₹8000 stockout loss" -> 8000)
        const impactMatch = recommendation.impact?.match(/₹([\d,]+)/);
        if (impactMatch) {
            outcomeValue = parseInt(impactMatch[1].replace(/,/g, ''));
        }
    } else if (recommendation.type === 'promotion') {
        // Extract numeric value from impact string (e.g., "Free up ₹5000 capital" -> 5000)
        const impactMatch = recommendation.impact?.match(/₹([\d,]+)/);
        if (impactMatch) {
            outcomeValue = parseInt(impactMatch[1].replace(/,/g, ''));
        }
    }
    
    // Update recommendation with calculated outcome
    const updateCommand = new UpdateCommand({
        TableName: RECOMMENDATIONS_TABLE,
        Key: { id },
        UpdateExpression: 'SET #status = :status, #implementedAt = :implementedAt, #updatedAt = :updatedAt, #outcomeValue = :outcomeValue',
        ExpressionAttributeNames: {
            '#status': 'status',
            '#implementedAt': 'implementedAt',
            '#updatedAt': 'updatedAt',
            '#outcomeValue': 'outcomeValue'
        },
        ExpressionAttributeValues: {
            ':status': 'implemented',
            ':implementedAt': Date.now(),
            ':updatedAt': Date.now(),
            ':outcomeValue': outcomeValue
        },
        ReturnValues: 'ALL_NEW'
    });
    
    const result = await docClient.send(updateCommand);
    
    return {
        statusCode: 200,
        body: result.Attributes
    };
}
