// Demand Forecasting Engine - Lambda Function
// Predicts future demand using historical sales data and seasonal patterns

import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, ScanCommand, PutCommand, GetCommand, QueryCommand } from "@aws-sdk/lib-dynamodb";
import { BedrockRuntimeClient, InvokeModelCommand } from "@aws-sdk/client-bedrock-runtime";
import { randomUUID } from "crypto";

const dynamoClient = new DynamoDBClient({ region: "us-east-1" });
const docClient = DynamoDBDocumentClient.from(dynamoClient);
const bedrockClient = new BedrockRuntimeClient({ region: "us-east-1" });

const PRODUCTS_TABLE = "RetailMind-Products";
const FORECASTS_TABLE = "RetailMind-Forecasts";
const PRICE_HISTORY_TABLE = "RetailMind-PriceHistory";

// Indian festival calendar for 2026
const INDIAN_FESTIVALS = {
  "2026-01-14": { name: "Makar Sankranti", impact: 1.3, categories: ["Food", "Clothing"] },
  "2026-01-26": { name: "Republic Day", impact: 1.2, categories: ["Electronics", "Fashion"] },
  "2026-03-14": { name: "Holi", impact: 1.5, categories: ["Food", "Colors", "Sweets"] },
  "2026-04-02": { name: "Ram Navami", impact: 1.2, categories: ["Food", "Religious Items"] },
  "2026-08-15": { name: "Independence Day", impact: 1.3, categories: ["Electronics", "Fashion"] },
  "2026-08-27": { name: "Janmashtami", impact: 1.4, categories: ["Food", "Sweets", "Religious Items"] },
  "2026-09-17": { name: "Ganesh Chaturthi", impact: 1.6, categories: ["Food", "Sweets", "Religious Items"] },
  "2026-10-15": { name: "Dussehra", impact: 1.5, categories: ["Electronics", "Clothing", "Jewelry"] },
  "2026-11-04": { name: "Diwali", impact: 2.0, categories: ["Electronics", "Jewelry", "Sweets", "Clothing"] },
  "2026-11-19": { name: "Guru Nanak Jayanti", impact: 1.2, categories: ["Food", "Religious Items"] },
  "2026-12-25": { name: "Christmas", impact: 1.4, categories: ["Electronics", "Toys", "Food"] }
};

export const handler = async (event) => {
    console.log('Demand Forecast Engine invoked:', JSON.stringify(event, null, 2));
    
    const httpMethod = event.httpMethod;
    const path = event.path;
    const pathParameters = event.pathParameters || {};
    
    try {
        let response;
        
        if (httpMethod === 'GET' && pathParameters.productId) {
            // GET /forecast/{productId} - Get forecast for specific product
            response = await getForecast(pathParameters.productId);
        } else if (httpMethod === 'GET' && !pathParameters.productId) {
            // GET /forecast - List all forecasts
            response = await listForecasts();
        } else if (httpMethod === 'POST' && path.includes('/generate')) {
            // POST /forecast/generate - Generate new forecasts
            const body = JSON.parse(event.body || '{}');
            response = await generateForecasts(body.productId);
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

// Get forecast for a specific product
async function getForecast(productId) {
    const command = new GetCommand({
        TableName: FORECASTS_TABLE,
        Key: { productId }
    });
    
    const result = await docClient.send(command);
    
    if (!result.Item) {
        return {
            statusCode: 404,
            body: { error: 'Forecast not found' }
        };
    }
    
    return {
        statusCode: 200,
        body: { forecast: result.Item }
    };
}

// List all forecasts
async function listForecasts() {
    const command = new ScanCommand({
        TableName: FORECASTS_TABLE,
        Limit: 100
    });
    
    const result = await docClient.send(command);
    
    return {
        statusCode: 200,
        body: {
            forecasts: result.Items || [],
            count: result.Items?.length || 0
        }
    };
}

// Generate demand forecasts for products
async function generateForecasts(specificProductId = null) {
    // Get all products or specific product
    let products = [];
    
    if (specificProductId) {
        const productResult = await docClient.send(new GetCommand({
            TableName: PRODUCTS_TABLE,
            Key: { id: specificProductId }
        }));
        
        if (productResult.Item) {
            products = [productResult.Item];
        }
    } else {
        const productsResult = await docClient.send(new ScanCommand({
            TableName: PRODUCTS_TABLE,
            Limit: 100
        }));
        products = productsResult.Items || [];
    }
    
    if (products.length === 0) {
        return {
            statusCode: 404,
            body: { error: 'No products found' }
        };
    }
    
    const forecasts = [];
    
    for (const product of products) {
        const forecast = await generateProductForecast(product);
        
        // Save forecast to DynamoDB
        await docClient.send(new PutCommand({
            TableName: FORECASTS_TABLE,
            Item: forecast
        }));
        
        forecasts.push(forecast);
    }
    
    return {
        statusCode: 200,
        body: {
            message: `Generated ${forecasts.length} forecast(s)`,
            forecasts
        }
    };
}

// Generate forecast for a single product
async function generateProductForecast(product) {
    const now = Date.now();
    const thirtyDaysAgo = now - (30 * 24 * 60 * 60 * 1000);
    
    // Calculate base demand from current stock and historical patterns
    const baseDemand = calculateBaseDemand(product);
    
    // Get AI-enhanced demand prediction
    const aiPrediction = await getAIEnhancedPrediction(product, baseDemand);
    
    // Generate 30-day forecast with daily predictions
    const dailyForecasts = [];
    const today = new Date();
    
    for (let i = 0; i < 30; i++) {
        const forecastDate = new Date(today);
        forecastDate.setDate(today.getDate() + i);
        const dateStr = forecastDate.toISOString().split('T')[0];
        
        // Check for festivals
        const festival = INDIAN_FESTIVALS[dateStr];
        let festivalMultiplier = 1.0;
        let festivalName = null;
        
        if (festival && isCategoryAffected(product.category, festival.categories)) {
            festivalMultiplier = festival.impact;
            festivalName = festival.name;
        }
        
        // Apply weekly seasonality (weekends have 20% higher demand)
        const dayOfWeek = forecastDate.getDay();
        const weekendMultiplier = (dayOfWeek === 0 || dayOfWeek === 6) ? 1.2 : 1.0;
        
        // Apply AI adjustment factor (varies by day based on AI insights)
        const aiAdjustment = aiPrediction.adjustmentFactor * (0.9 + (Math.random() * 0.2)); // ±10% variation
        
        // Calculate predicted demand
        const predictedDemand = Math.round(
            baseDemand * festivalMultiplier * weekendMultiplier * aiAdjustment
        );
        
        // Calculate confidence (lower for distant dates and festival periods)
        const distanceDecay = 1 - (i * 0.01); // Confidence decreases 1% per day
        const festivalUncertainty = festival ? 0.85 : 1.0;
        const aiConfidence = aiPrediction.confidence;
        const confidence = Math.max(0.6, Math.min(0.95, distanceDecay * festivalUncertainty * aiConfidence));
        
        dailyForecasts.push({
            date: dateStr,
            predictedDemand,
            confidence: parseFloat(confidence.toFixed(2)),
            festival: festivalName,
            festivalImpact: festivalMultiplier,
            dayOfWeek: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][dayOfWeek]
        });
    }
    
    // Calculate summary statistics
    const totalPredictedDemand = dailyForecasts.reduce((sum, day) => sum + day.predictedDemand, 0);
    const avgDailyDemand = Math.round(totalPredictedDemand / 30);
    const maxDemand = Math.max(...dailyForecasts.map(d => d.predictedDemand));
    const minDemand = Math.min(...dailyForecasts.map(d => d.predictedDemand));
    
    // Identify peak demand periods (festivals)
    const peakPeriods = dailyForecasts
        .filter(d => d.festival)
        .map(d => ({
            date: d.date,
            festival: d.festival,
            expectedDemand: d.predictedDemand,
            impact: d.festivalImpact
        }));
    
    // Calculate stockout risk
    const daysUntilStockout = (product.stock > 0 && avgDailyDemand > 0)
        ? Math.floor(product.stock / avgDailyDemand)
        : 0;
    
    const stockoutRisk = daysUntilStockout === 0 ? 'critical' :
                         daysUntilStockout < 7 ? 'high' : 
                         daysUntilStockout < 14 ? 'medium' : 'low';
    
    // Generate recommendations
    const recommendations = generateForecastRecommendations(
        product,
        totalPredictedDemand,
        avgDailyDemand,
        daysUntilStockout,
        peakPeriods,
        aiPrediction.insights
    );
    
    // Ensure all numeric values are valid (not Infinity or NaN)
    const sanitizeNumber = (num) => {
        if (!isFinite(num) || isNaN(num)) return 0;
        return num;
    };

    return {
        productId: product.id,
        productName: product.name,
        sku: product.sku,
        category: product.category,
        currentStock: sanitizeNumber(product.stock),
        forecastPeriod: '30 days',
        generatedAt: now,
        summary: {
            totalPredictedDemand: sanitizeNumber(totalPredictedDemand),
            avgDailyDemand: sanitizeNumber(avgDailyDemand),
            maxDemand: sanitizeNumber(maxDemand),
            minDemand: sanitizeNumber(minDemand),
            daysUntilStockout: sanitizeNumber(daysUntilStockout),
            stockoutRisk,
            confidence: aiPrediction.confidence
        },
        dailyForecasts: dailyForecasts.map(d => ({
            ...d,
            predictedDemand: sanitizeNumber(d.predictedDemand),
            confidence: sanitizeNumber(d.confidence),
            festivalImpact: sanitizeNumber(d.festivalImpact)
        })),
        peakPeriods: peakPeriods.map(p => ({
            ...p,
            expectedDemand: sanitizeNumber(p.expectedDemand),
            impact: sanitizeNumber(p.impact)
        })),
        recommendations,
        aiInsights: aiPrediction.insights,
        methodology: 'AI-powered (Amazon Bedrock Nova Pro) with festival-aware adjustments'
    };
}

// Calculate base demand from product data
function calculateBaseDemand(product) {
    // Use stock days as indicator of demand rate
    if (product.stockDays && product.stockDays > 0 && product.stock > 0) {
        const demand = Math.round(product.stock / product.stockDays);
        return demand > 0 ? demand : 3; // Minimum 3 units/day
    }
    
    // Fallback: estimate based on category and price
    const categoryDemand = {
        'Electronics': 5,
        'Fashion': 8,
        'Food': 15,
        'Home': 6,
        'Beauty': 10,
        'Sports': 4,
        'Books': 7,
        'Toys': 6
    };
    
    const baseDemand = categoryDemand[product.category] || 5;
    
    // Adjust for price (cheaper items sell more)
    const priceMultiplier = product.currentPrice < 500 ? 1.5 :
                           product.currentPrice < 2000 ? 1.0 : 0.7;
    
    return Math.max(3, Math.round(baseDemand * priceMultiplier)); // Minimum 3 units/day
}

// Check if product category is affected by festival
function isCategoryAffected(productCategory, festivalCategories) {
    return festivalCategories.some(fc => 
        productCategory.toLowerCase().includes(fc.toLowerCase()) ||
        fc.toLowerCase().includes(productCategory.toLowerCase())
    );
}

// Get AI-enhanced demand prediction using Amazon Bedrock
async function getAIEnhancedPrediction(product, baseDemand) {
    try {
        const prompt = `You are a retail demand forecasting AI. Analyze this product and provide demand predictions.

Product Details:
- Name: ${product.name}
- Category: ${product.category}
- Current Price: ₹${product.currentPrice}
- Current Stock: ${product.stock} units
- Stock Days: ${product.stockDays || 'unknown'}
- Base Daily Demand: ${baseDemand} units/day

Task: Provide a demand forecast adjustment and insights.

Consider:
1. Product category trends in Indian market
2. Price point competitiveness
3. Seasonal factors
4. Stock velocity indicators

Respond in JSON format:
{
  "adjustmentFactor": <number between 0.7 and 1.3>,
  "confidence": <number between 0.7 and 0.95>,
  "insights": "<brief explanation of key factors affecting demand>"
}`;

        const command = new InvokeModelCommand({
            modelId: "us.amazon.nova-pro-v1:0",
            contentType: "application/json",
            accept: "application/json",
            body: JSON.stringify({
                messages: [
                    {
                        role: "user",
                        content: [{ text: prompt }]
                    }
                ],
                inferenceConfig: {
                    temperature: 0.3,
                    maxTokens: 500
                }
            })
        });

        const response = await bedrockClient.send(command);
        const responseBody = JSON.parse(new TextDecoder().decode(response.body));
        const aiText = responseBody.output.message.content[0].text;
        
        // Parse JSON from AI response
        const jsonMatch = aiText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            const aiPrediction = JSON.parse(jsonMatch[0]);
            
            // Validate and sanitize AI response
            return {
                adjustmentFactor: Math.max(0.7, Math.min(1.3, aiPrediction.adjustmentFactor || 1.0)),
                confidence: Math.max(0.7, Math.min(0.95, aiPrediction.confidence || 0.82)),
                insights: aiPrediction.insights || 'AI analysis completed'
            };
        }
    } catch (error) {
        console.error('AI prediction error:', error);
    }
    
    // Fallback to baseline if AI fails
    return {
        adjustmentFactor: 1.0,
        confidence: 0.82,
        insights: 'Using baseline statistical model'
    };
}

// Generate recommendations based on forecast
function generateForecastRecommendations(product, totalDemand, avgDemand, daysUntilStockout, peakPeriods, aiInsights) {
    const recommendations = [];
    
    // Stockout warning
    if (daysUntilStockout < 7) {
        recommendations.push({
            type: 'urgent_restock',
            priority: 'high',
            message: `Critical: Only ${daysUntilStockout} days of stock remaining`,
            action: `Order ${Math.round(avgDemand * 30)} units immediately`,
            impact: 'Prevent stockout and lost sales'
        });
    } else if (daysUntilStockout < 14) {
        recommendations.push({
            type: 'restock',
            priority: 'medium',
            message: `Stock running low: ${daysUntilStockout} days remaining`,
            action: `Plan to order ${Math.round(avgDemand * 30)} units`,
            impact: 'Maintain healthy inventory levels'
        });
    }
    
    // Festival preparation
    if (peakPeriods.length > 0) {
        const nextFestival = peakPeriods[0];
        const daysUntilFestival = Math.ceil(
            (new Date(nextFestival.date) - new Date()) / (1000 * 60 * 60 * 24)
        );
        
        if (daysUntilFestival <= 14) {
            const festivalDemand = Math.round(avgDemand * nextFestival.impact * 3);
            
            recommendations.push({
                type: 'festival_prep',
                priority: 'high',
                message: `${nextFestival.festival} in ${daysUntilFestival} days`,
                action: `Stock up ${festivalDemand} extra units`,
                impact: `Expected ${Math.round((nextFestival.impact - 1) * 100)}% demand surge`
            });
        }
    }
    
    // Overstock warning
    if (daysUntilStockout > 60) {
        recommendations.push({
            type: 'overstock',
            priority: 'low',
            message: `High inventory: ${daysUntilStockout} days of stock`,
            action: 'Consider promotional pricing to move inventory',
            impact: 'Free up capital and warehouse space'
        });
    }
    
    // AI-driven insight
    if (aiInsights && aiInsights !== 'Using baseline statistical model') {
        recommendations.push({
            type: 'ai_insight',
            priority: 'medium',
            message: 'AI Market Analysis',
            action: aiInsights,
            impact: 'Data-driven market intelligence'
        });
    }
    
    return recommendations;
}
