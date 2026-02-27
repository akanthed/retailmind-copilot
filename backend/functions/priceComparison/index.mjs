// Price Comparison API - Lambda Function
// Searches for product prices across e-commerce platforms using SerpAPI (Google Shopping)
// Falls back to synthetic data if no API key is configured

import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand, PutCommand, QueryCommand, ScanCommand } from "@aws-sdk/lib-dynamodb";
import { randomUUID } from "crypto";
import https from "https";

const client = new DynamoDBClient({ region: "us-east-1" });
const docClient = DynamoDBDocumentClient.from(client);

const PRODUCTS_TABLE = "RetailMind-Products";
const PRICE_COMPARISON_TABLE = "RetailMind-PriceComparison";

// SerpAPI key from environment variable
const SERPAPI_KEY = process.env.SERPAPI_KEY || "";

export const handler = async (event) => {
    console.log('Price Comparison API invoked:', JSON.stringify(event, null, 2));

    const httpMethod = event.httpMethod;
    const pathParameters = event.pathParameters || {};
    const productId = pathParameters.productId || pathParameters.id;
    const action = pathParameters.action;
    const requestPath = event.resource || event.path || '';
    const isSearchRequest = requestPath.includes('/compare/search');

    try {
        let response;

        // Handle OPTIONS for CORS preflight
        if (httpMethod === 'OPTIONS') {
            return {
                statusCode: 200,
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
                    'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key'
                },
                body: ''
            };
        }

        if (httpMethod === 'GET' && productId && !action && !isSearchRequest) {
            // GET /products/{productId}/compare - Get stored comparisons
            response = await getStoredComparisons(productId);
        } else if (httpMethod === 'POST' && productId && (action === 'search' || isSearchRequest)) {
            // POST /products/{productId}/compare/search - Search e-commerce for prices
            const body = JSON.parse(event.body || '{}');
            response = await searchCompetitorPrices(productId, body);
        } else if (httpMethod === 'POST' && !productId) {
            // POST /compare - Search all products
            response = await searchAllProducts();
        } else {
            response = { statusCode: 404, body: { error: 'Not found' } };
        }

        return {
            statusCode: response.statusCode || 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
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
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({
                error: 'Internal server error',
                message: error.message
            })
        };
    }
};

// ============================================================
// Get stored price comparisons for a product
// ============================================================
async function getStoredComparisons(productId) {
    try {
        const command = new QueryCommand({
            TableName: PRICE_COMPARISON_TABLE,
            KeyConditionExpression: 'productId = :pid',
            ExpressionAttributeValues: { ':pid': productId },
            ScanIndexForward: false,
            Limit: 50
        });

        const result = await docClient.send(command);
        const comparisons = (result.Items || []).map(item => ({
            platform: item.platform,
            title: item.title,
            price: item.price,
            url: item.url || '',
            inStock: item.inStock !== false,
            lastChecked: item.createdAt || new Date(item.timestamp).toISOString(),
            priceDiff: item.priceDiff || 0,
            priceDiffPercent: item.priceDiffPercent || 0,
            source: item.source || 'cached'
        }));

        return {
            statusCode: 200,
            body: { productId, comparisons, count: comparisons.length }
        };
    } catch (error) {
        // Table might not exist yet - return empty
        console.log('No comparison data found, returning empty:', error.message);
        return {
            statusCode: 200,
            body: { productId, comparisons: [], count: 0 }
        };
    }
}

// ============================================================
// Search for competitor prices - the main comparison engine
// ============================================================
async function searchCompetitorPrices(productId, searchParams) {
    // 1. Get the product from DynamoDB
    const productResult = await docClient.send(new GetCommand({
        TableName: PRODUCTS_TABLE,
        Key: { id: productId }
    }));

    if (!productResult.Item) {
        return { statusCode: 404, body: { error: 'Product not found' } };
    }

    const product = productResult.Item;
    const searchQuery = searchParams.keywords || product.keywords || product.name;

    let results = [];

    // 2. Try real search via SerpAPI (Google Shopping)
    if (SERPAPI_KEY) {
        console.log(`Searching Google Shopping for: "${searchQuery}"`);
        try {
            const serpResults = await searchGoogleShopping(searchQuery, product.currentPrice);
            if (serpResults.length > 0) {
                results = serpResults;
                console.log(`Found ${results.length} results from Google Shopping`);
            } else {
                console.log('No live shopping results found, falling back to synthetic data');
                results = generateSyntheticPrices(product);
            }
        } catch (error) {
            console.error('SerpAPI search failed, falling back to synthetic:', error.message);
            results = generateSyntheticPrices(product);
        }
    } else {
        // No API key - use synthetic data
        console.log('No SERPAPI_KEY configured, using synthetic price data');
        results = generateSyntheticPrices(product);
    }

    // 3. Calculate price differences
    results = results.map(r => ({
        ...r,
        priceDiff: r.price - product.currentPrice,
        priceDiffPercent: ((r.price - product.currentPrice) / product.currentPrice) * 100
    }));

    // 4. Store results in DynamoDB
    for (const result of results) {
        try {
            await docClient.send(new PutCommand({
                TableName: PRICE_COMPARISON_TABLE,
                Item: {
                    productId: productId,
                    comparisonId: randomUUID(),
                    platform: result.platform,
                    title: result.title,
                    price: result.price,
                    url: result.url,
                    inStock: result.inStock,
                    priceDiff: result.priceDiff,
                    priceDiffPercent: result.priceDiffPercent,
                    source: result.source,
                    timestamp: Date.now(),
                    createdAt: new Date().toISOString()
                }
            }));
        } catch (err) {
            console.warn('Failed to store comparison:', err.message);
        }
    }

    return {
        statusCode: 200,
        body: {
            productId,
            product: product.name,
            searchQuery,
            results,
            resultsCount: results.length,
            source: SERPAPI_KEY ? 'google_shopping' : 'synthetic',
            timestamp: new Date().toISOString()
        }
    };
}

// ============================================================
// Search Google Shopping via SerpAPI
// ============================================================
async function searchGoogleShopping(query, yourPrice) {
    const params = new URLSearchParams({
        engine: 'google_shopping',
        q: query,
        location: 'India',
        hl: 'en',
        gl: 'in',
        api_key: SERPAPI_KEY
    });

    const url = `https://serpapi.com/search.json?${params.toString()}`;

    const data = await httpGet(url);
    const parsed = JSON.parse(data);

    if (parsed.error) {
        throw new Error(`SerpAPI error: ${parsed.error}`);
    }

    if (!parsed.shopping_results || parsed.shopping_results.length === 0) {
        console.log('No Google Shopping results found');
        return [];
    }

    // Map SerpAPI results to our format
    return parsed.shopping_results.slice(0, 10).map(item => {
        // Extract price (SerpAPI returns price as string like "₹1,29,999")
        let price = 0;
        if (item.extracted_price) {
            price = item.extracted_price;
        } else if (item.price) {
            price = parseFloat(item.price.replace(/[₹,\s]/g, '')) || 0;
        }

        // Detect platform from source
        const platform = detectPlatform(item.source || item.link || '');

        return {
            platform,
            title: item.title || query,
            price,
            url: item.link || item.product_link || '',
            inStock: !item.out_of_stock,
            source: 'live',
            rating: item.rating || null,
            reviews: item.reviews || null,
            thumbnail: item.thumbnail || null
        };
    }).filter(r => r.price > 0); // Only include results with valid prices
}

// ============================================================
// Generate synthetic but realistic prices (fallback)
// ============================================================
function generateSyntheticPrices(product) {
    const basePrice = product.currentPrice || 1000;
    const productName = product.name || 'Product';

    const platforms = [
        { name: 'Amazon.in', urlPrefix: 'https://www.amazon.in/s?k=' },
        { name: 'Flipkart', urlPrefix: 'https://www.flipkart.com/search?q=' },
        { name: 'JioMart', urlPrefix: 'https://www.jiomart.com/search/' },
        { name: 'Croma', urlPrefix: 'https://www.croma.com/searchB?q=' },
        { name: 'Reliance Digital', urlPrefix: 'https://www.reliancedigital.in/search?q=' },
        { name: 'Meesho', urlPrefix: 'https://www.meesho.com/search?q=' }
    ];

    // Pick 3-5 random platforms
    const count = 3 + Math.floor(Math.random() * 3);
    const selected = platforms.sort(() => Math.random() - 0.5).slice(0, count);

    return selected.map(platform => {
        // Generate realistic price variation:
        // -15% to +10% from your price, based on platform tendencies
        let variation;
        if (platform.name === 'Amazon.in') {
            variation = (Math.random() * 0.20) - 0.10; // -10% to +10%
        } else if (platform.name === 'Flipkart') {
            variation = (Math.random() * 0.20) - 0.12; // -12% to +8%
        } else if (platform.name === 'Meesho') {
            variation = (Math.random() * 0.25) - 0.20; // -20% to +5%
        } else {
            variation = (Math.random() * 0.25) - 0.10; // -10% to +15%
        }

        const competitorPrice = Math.round(basePrice * (1 + variation));
        const searchTerm = encodeURIComponent(productName);

        return {
            platform: platform.name,
            title: productName,
            price: competitorPrice,
            url: `${platform.urlPrefix}${searchTerm}`,
            inStock: Math.random() > 0.1, // 90% chance in stock
            source: 'synthetic'
        };
    });
}

// ============================================================
// Search all products for prices
// ============================================================
async function searchAllProducts() {
    const scanResult = await docClient.send(new ScanCommand({
        TableName: PRODUCTS_TABLE,
        Limit: 20
    }));

    const products = scanResult.Items || [];
    let totalResults = 0;

    for (const product of products) {
        const result = await searchCompetitorPrices(product.id, {});
        totalResults += (result.body?.resultsCount || 0);
    }

    return {
        statusCode: 200,
        body: {
            message: 'Price comparison completed for all products',
            productsSearched: products.length,
            totalResults,
            timestamp: new Date().toISOString()
        }
    };
}

// ============================================================
// Utility: Detect e-commerce platform from URL/source
// ============================================================
function detectPlatform(source) {
    const s = source.toLowerCase();
    if (s.includes('amazon')) return 'Amazon.in';
    if (s.includes('flipkart')) return 'Flipkart';
    if (s.includes('jiomart') || s.includes('jio')) return 'JioMart';
    if (s.includes('croma')) return 'Croma';
    if (s.includes('reliance') || s.includes('reliancedigital')) return 'Reliance Digital';
    if (s.includes('meesho')) return 'Meesho';
    if (s.includes('snapdeal')) return 'Snapdeal';
    if (s.includes('paytm') || s.includes('paytmmall')) return 'Paytm Mall';
    if (s.includes('tata') || s.includes('tatacliq')) return 'Tata CLiQ';
    if (s.includes('myntra')) return 'Myntra';
    if (s.includes('nykaa')) return 'Nykaa';
    if (s.includes('shopclues')) return 'ShopClues';

    // Extract domain name as fallback
    try {
        const url = new URL(source);
        return url.hostname.replace('www.', '').split('.')[0];
    } catch {
        return source.slice(0, 30) || 'Other';
    }
}

// ============================================================
// Utility: HTTP GET request (for SerpAPI)
// ============================================================
function httpGet(url) {
    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve(data));
            res.on('error', reject);
        }).on('error', reject);
    });
}
