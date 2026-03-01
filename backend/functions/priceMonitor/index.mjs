// Price Monitor - Lambda Function
// Fetches live competitor price data and stores in DynamoDB

import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, ScanCommand, PutCommand, QueryCommand } from "@aws-sdk/lib-dynamodb";
import { randomUUID } from "crypto";
import { createPriceService } from "../shared/price-service.mjs";

const client = new DynamoDBClient({ region: "us-east-1" });
const docClient = DynamoDBDocumentClient.from(client);

const PRODUCTS_TABLE = "RetailMind-Products";
const PRICE_HISTORY_TABLE = "RetailMind-PriceHistory";
const SERPAPI_KEY = process.env.SERP_API_KEY || process.env.SERPAPI_KEY || "";
const ALLOW_SYNTHETIC_FALLBACK = process.env.ALLOW_SYNTHETIC_FALLBACK === "true";
const priceService = createPriceService({
    serpApiKey: SERPAPI_KEY,
    logger: console,
    retries: 2,
    enableStrictFiltering: true
});

// Competitor data
const COMPETITORS = [
    { id: "comp-1", name: "TechStore Pro", domain: "techstore.in" },
    { id: "comp-2", name: "GadgetWorld", domain: "gadgetworld.in" },
    { id: "comp-3", name: "ElectroMart", domain: "electromart.in" }
];

export const handler = async (event) => {
    console.log('Price Monitor invoked:', JSON.stringify(event, null, 2));
    
    try {
        // Get all products
        const products = await getAllProducts();
        console.log(`Found ${products.length} products to monitor`);
        
        if (products.length === 0) {
            return {
                statusCode: 200,
                body: JSON.stringify({
                    message: 'No products to monitor',
                    productsMonitored: 0
                })
            };
        }
        
        let pricesGenerated = 0;
        let productsWithLiveData = 0;
        let productsSkipped = 0;
        let syntheticGenerated = 0;
        
        for (const product of products) {
            const livePrices = await fetchLivePricesForProduct(product);

            if (livePrices.length > 0) {
                productsWithLiveData++;
                for (const result of livePrices) {
                    const priceData = buildPriceHistoryItem(product, result);
                    await storePriceHistory(priceData);
                    pricesGenerated++;
                }
                continue;
            }

            if (ALLOW_SYNTHETIC_FALLBACK) {
                for (const competitor of COMPETITORS) {
                    const priceData = generateCompetitorPrice(product, competitor);
                    await storePriceHistory(priceData);
                    pricesGenerated++;
                    syntheticGenerated++;
                }
            } else {
                productsSkipped++;
            }
        }
        
        console.log(`Generated ${pricesGenerated} price points`);
        
        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({
                message: 'Price monitoring completed',
                productsMonitored: products.length,
                pricesGenerated: pricesGenerated,
                productsWithLiveData,
                productsSkipped,
                syntheticGenerated,
                syntheticFallbackUsed: ALLOW_SYNTHETIC_FALLBACK,
                timestamp: new Date().toISOString()
            })
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
                error: 'Price monitoring failed',
                message: error.message
            })
        };
    }
};

// Get all products from DynamoDB
async function getAllProducts() {
    const command = new ScanCommand({
        TableName: PRODUCTS_TABLE
    });
    
    const result = await docClient.send(command);
    return result.Items || [];
}

async function fetchLivePricesForProduct(product) {
    const query = product.keywords || product.name;
    if (!query) {
        return [];
    }

    try {
        const searchResult = await priceService.fetchCompetitorPrices(query, {
            strictCapacity: true,
            minScore: 60
        });

        return (searchResult.results || [])
            .filter((result) => Number.isFinite(Number(result.price)) && Number(result.price) > 0)
            .slice(0, 5)
            .map((result) => ({
                platform: result.platform || 'Unknown',
                domain: extractDomain(result.url),
                price: Number(result.price),
                inStock: result.inStock !== false,
                source: result.source || 'live',
                url: result.url || ''
            }));
    } catch (error) {
        console.warn('[PRICE-MONITOR] Live search failed', {
            productId: product.id,
            productName: product.name,
            message: error.message
        });
        return [];
    }
}

function buildPriceHistoryItem(product, result) {
    return {
        id: randomUUID(),
        productId: product.id,
        productName: product.name,
        productSku: product.sku,
        competitorId: `${String(result.platform || 'unknown').toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
        competitorName: result.platform || 'Unknown',
        competitorDomain: result.domain || 'unknown',
        price: result.price,
        inStock: result.inStock,
        timestamp: Date.now(),
        source: result.source || 'live',
        url: result.url || '',
        createdAt: new Date().toISOString()
    };
}

function extractDomain(url) {
    if (!url) return '';
    try {
        return new URL(url).hostname;
    } catch {
        return '';
    }
}

// Generate realistic competitor price
function generateCompetitorPrice(product, competitor) {
    const basePrice = product.currentPrice || 1000;
    
    // Generate price variation (-20% to +15%)
    const variation = (Math.random() * 0.35) - 0.20;
    const competitorPrice = basePrice * (1 + variation);
    
    // Round to nearest 10
    const roundedPrice = Math.round(competitorPrice / 10) * 10;
    
    // Determine if in stock (90% chance)
    const inStock = Math.random() > 0.1;
    
    return {
        id: randomUUID(),
        productId: product.id,
        productName: product.name,
        productSku: product.sku,
        competitorId: competitor.id,
        competitorName: competitor.name,
        competitorDomain: competitor.domain,
        price: roundedPrice,
        inStock: inStock,
        timestamp: Date.now(),
        source: 'synthetic',
        createdAt: new Date().toISOString()
    };
}

// Store price in DynamoDB
async function storePriceHistory(priceData) {
    const command = new PutCommand({
        TableName: PRICE_HISTORY_TABLE,
        Item: priceData
    });
    
    await docClient.send(command);
}

// Get price history for a product (used by API)
export async function getPriceHistory(productId, limit = 30) {
    const command = new QueryCommand({
        TableName: PRICE_HISTORY_TABLE,
        IndexName: 'productId-timestamp-index', // We'll create this GSI
        KeyConditionExpression: 'productId = :productId',
        ExpressionAttributeValues: {
            ':productId': productId
        },
        ScanIndexForward: false, // Descending order (newest first)
        Limit: limit
    });
    
    const result = await docClient.send(command);
    return result.Items || [];
}
