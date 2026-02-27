// Price Comparison API - Lambda Function
// Searches for product prices across e-commerce platforms using SerpAPI (Google Shopping)

import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand, PutCommand, QueryCommand, ScanCommand } from "@aws-sdk/lib-dynamodb";
import { BedrockRuntimeClient, InvokeModelCommand } from "@aws-sdk/client-bedrock-runtime";
import { randomUUID } from "crypto";
import https from "https";

const client = new DynamoDBClient({ region: "us-east-1" });
const docClient = DynamoDBDocumentClient.from(client);

const PRODUCTS_TABLE = "RetailMind-Products";
const PRICE_COMPARISON_TABLE = "RetailMind-PriceComparison";

// SerpAPI key from environment variable
const SERPAPI_KEY = process.env.SERPAPI_KEY || "";
const BEDROCK_QUERY_MODEL = process.env.BEDROCK_QUERY_MODEL || "";
const bedrockClient = BEDROCK_QUERY_MODEL ? new BedrockRuntimeClient({ region: "us-east-1" }) : null;

export const handler = async (event) => {
    console.log('Price Comparison API invoked:', JSON.stringify(event, null, 2));

    const httpMethod = event.httpMethod;
    const pathParameters = event.pathParameters || {};
    const requestPath = event.resource || event.path || '';
    const productId = pathParameters.productId || pathParameters.id || extractProductIdFromPath(requestPath);
    const action = pathParameters.action;
    const isSearchRequest = requestPath.includes('/compare/search');
    const isCompareAllRequest = requestPath === '/compare' || requestPath.endsWith('/compare');

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
        } else if (httpMethod === 'POST' && isSearchRequest && !productId) {
            response = {
                statusCode: 400,
                body: {
                    error: 'Missing productId in request path',
                    path: requestPath
                }
            };
        } else if (httpMethod === 'POST' && isCompareAllRequest) {
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

    console.log('[PRICE-COMPARE] Search requested', {
        productId,
        productName: product.name,
        sku: product.sku,
        category: product.category,
        currentPrice: product.currentPrice,
        incomingKeywords: searchParams?.keywords || null,
        hasStoredKeywords: Boolean(product.keywords),
        hasSerpApiKey: Boolean(SERPAPI_KEY),
        aiQueryExpansionEnabled: Boolean(BEDROCK_QUERY_MODEL)
    });

    const queryCandidates = await buildSearchQueryCandidates(product, searchParams);
    console.log('[PRICE-COMPARE] Query candidates prepared', {
        productId,
        count: queryCandidates.length,
        candidates: queryCandidates
    });

    // 2. Search via SerpAPI (Google Shopping) - no synthetic fallback for explicit user search
    if (!SERPAPI_KEY) {
        console.error('[PRICE-COMPARE] SERPAPI_KEY missing - cannot perform live competitor search', { productId });
        return {
            statusCode: 500,
            body: {
                error: 'SERPAPI_KEY is not configured on the backend',
                message: 'Add SERPAPI_KEY to Lambda environment variables and redeploy.'
            }
        };
    }

    let results = [];
    let selectedQuery = '';
    const queryAttempts = [];

    try {
        for (const candidateQuery of queryCandidates) {
            console.log('[PRICE-COMPARE] Searching Google Shopping', {
                productId,
                query: candidateQuery
            });

            const searchResult = await searchGoogleShopping(candidateQuery, product.currentPrice);
            queryAttempts.push({
                query: candidateQuery,
                rawShoppingResults: searchResult.rawShoppingResults,
                mappedResults: searchResult.mappedResults,
                droppedNoPrice: searchResult.droppedNoPrice,
                droppedNoLink: searchResult.droppedNoLink,
                finalResults: searchResult.results.length
            });

            if (searchResult.results.length > 0) {
                results = searchResult.results;
                selectedQuery = candidateQuery;
                break;
            }
        }

        console.log('[PRICE-COMPARE] SerpAPI attempt summary', {
            productId,
            selectedQuery: selectedQuery || null,
            attempts: queryAttempts
        });
    } catch (error) {
        console.error('[PRICE-COMPARE] SerpAPI search failed', {
            productId,
            message: error.message
        });
        return {
            statusCode: 502,
            body: {
                error: 'SerpAPI search failed',
                message: error.message
            }
        };
    }

    if (!results.length) {
        console.warn('[PRICE-COMPARE] No competitor prices found after all query attempts', {
            productId,
            productName: product.name,
            attempts: queryAttempts
        });
        return {
            statusCode: 404,
            body: {
                error: 'No live prices found on Google Shopping for this query',
                message: 'No competitor prices matched this product on Google Shopping. Try adding model number/variant in keywords.',
                searchQuery: queryCandidates[0],
                attemptedQueries: queryCandidates,
                debugAttempts: queryAttempts
            }
        };
    }

    // 3. Calculate price differences
    results = results.map(r => ({
        ...r,
        priceDiff: r.price - product.currentPrice,
        priceDiffPercent: ((r.price - product.currentPrice) / product.currentPrice) * 100
    }));

    // 4. Store results in DynamoDB
    let storedCount = 0;
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
            storedCount += 1;
        } catch (err) {
            console.warn('Failed to store comparison:', err.message);
        }
    }

    console.log('[PRICE-COMPARE] Search completed', {
        productId,
        selectedQuery,
        resultsCount: results.length,
        storedCount
    });

    return {
        statusCode: 200,
        body: {
            productId,
            product: product.name,
            searchQuery: selectedQuery || queryCandidates[0],
            attemptedQueries: queryCandidates,
            results,
            resultsCount: results.length,
            source: 'google_shopping',
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

    const shoppingResults = parsed.shopping_results || [];
    const topResults = shoppingResults.slice(0, 10);

    if (!shoppingResults.length) {
        console.log('[SERPAPI] No shopping_results for query', { query });
        return {
            results: [],
            rawShoppingResults: 0,
            mappedResults: 0,
            droppedNoPrice: 0,
            droppedNoLink: 0
        };
    }

    console.log('[SERPAPI] Raw response summary', {
        query,
        rawShoppingResults: shoppingResults.length,
        hasSearchMetadata: Boolean(parsed.search_metadata),
        firstTitles: topResults.slice(0, 3).map(item => item?.title || 'N/A')
    });

    let droppedNoPrice = 0;
    let droppedNoLink = 0;

    // Map SerpAPI results to our format
    const mapped = topResults.map(item => {
        // Extract price (SerpAPI returns price as string like "₹1,29,999")
        let price = 0;
        if (item.extracted_price) {
            price = item.extracted_price;
        } else if (item.price) {
            price = parseFloat(item.price.replace(/[₹,\s]/g, '')) || 0;
        }

        if (!price || Number.isNaN(price)) {
            droppedNoPrice += 1;
            return null;
        }

        const url = item.link || item.product_link || '';
        if (!url) {
            droppedNoLink += 1;
            return null;
        }

        // Detect platform from source
        const platform = detectPlatform(item.source || item.link || '');

        return {
            platform,
            title: item.title || query,
            price,
            url,
            inStock: !item.out_of_stock,
            source: 'live',
            rating: item.rating || null,
            reviews: item.reviews || null,
            thumbnail: item.thumbnail || null
        };
    }).filter(Boolean);

    console.log('[SERPAPI] Mapped response summary', {
        query,
        rawShoppingResults: shoppingResults.length,
        mappedResults: mapped.length,
        droppedNoPrice,
        droppedNoLink
    });

    return {
        results: mapped,
        rawShoppingResults: shoppingResults.length,
        mappedResults: mapped.length,
        droppedNoPrice,
        droppedNoLink
    };
}

async function buildSearchQueryCandidates(product, searchParams) {
    const userQuery = cleanQuery(searchParams?.keywords || '');
    const storedKeywords = cleanQuery(product.keywords || '');
    const productName = cleanQuery(product.name || '');

    const deterministic = [
        userQuery,
        storedKeywords,
        productName,
        buildBrandModelQuery(productName),
        buildModelOnlyQuery(productName),
        buildProductCategoryQuery(productName, product.category)
    ].filter(Boolean);

    const aiSuggested = await generateAiSearchQueries(product, deterministic[0] || productName);
    const all = [...deterministic, ...aiSuggested]
        .map(cleanQuery)
        .filter(Boolean);

    return uniqueStrings(all).slice(0, 6);
}

async function generateAiSearchQueries(product, baseQuery) {
    if (!bedrockClient || !BEDROCK_QUERY_MODEL) {
        return [];
    }

    try {
        const prompt = `Create 3 short Google Shopping search queries for finding the exact same product from Indian e-commerce competitors.

Product name: ${product.name || ''}
Category: ${product.category || ''}
SKU: ${product.sku || ''}
Existing query: ${baseQuery || ''}

Rules:
- Focus on exact model/variant matching
- Keep each query under 12 words
- Include brand/model identifiers if visible
- Return ONLY a JSON array of strings`;

        const command = new InvokeModelCommand({
            modelId: BEDROCK_QUERY_MODEL,
            contentType: 'application/json',
            accept: 'application/json',
            body: JSON.stringify({
                messages: [{ role: 'user', content: [{ text: prompt }] }],
                inferenceConfig: {
                    max_new_tokens: 250,
                    temperature: 0.2,
                    top_p: 0.9
                }
            })
        });

        const response = await bedrockClient.send(command);
        const responseBody = JSON.parse(new TextDecoder().decode(response.body));
        const text = responseBody?.output?.message?.content?.[0]?.text || '';

        const parsed = tryParseJsonArray(text);
        const cleaned = parsed.map(cleanQuery).filter(Boolean).slice(0, 3);

        console.log('[PRICE-COMPARE] AI query suggestions generated', {
            productId: product.id,
            count: cleaned.length,
            suggestions: cleaned
        });

        return cleaned;
    } catch (error) {
        console.warn('[PRICE-COMPARE] AI query suggestion failed, continuing with deterministic queries', {
            productId: product.id,
            message: error.message
        });
        return [];
    }
}

function tryParseJsonArray(text) {
    if (!text) return [];
    try {
        const parsed = JSON.parse(text);
        return Array.isArray(parsed) ? parsed.filter(v => typeof v === 'string') : [];
    } catch {
        const match = text.match(/\[[\s\S]*\]/);
        if (!match) return [];
        try {
            const parsed = JSON.parse(match[0]);
            return Array.isArray(parsed) ? parsed.filter(v => typeof v === 'string') : [];
        } catch {
            return [];
        }
    }
}

function buildBrandModelQuery(productName) {
    const model = extractLikelyModel(productName);
    if (!model) return '';
    const brand = productName.split(' ')[0] || '';
    return cleanQuery(`${brand} ${model}`);
}

function buildModelOnlyQuery(productName) {
    const model = extractLikelyModel(productName);
    return cleanQuery(model || '');
}

function buildProductCategoryQuery(productName, category) {
    if (!productName && !category) return '';
    return cleanQuery(`${productName} ${category || ''} India`);
}

function extractLikelyModel(name) {
    if (!name) return '';
    const matches = name.match(/\b[A-Za-z0-9]*\d+[A-Za-z0-9-]*\b/g) || [];
    return matches.slice(0, 2).join(' ');
}

function cleanQuery(value) {
    return String(value || '')
        .replace(/[|,;]+/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
}

function uniqueStrings(values) {
    const seen = new Set();
    const result = [];
    for (const value of values) {
        const key = value.toLowerCase();
        if (seen.has(key)) continue;
        seen.add(key);
        result.push(value);
    }
    return result;
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

function extractProductIdFromPath(path) {
    if (!path) return undefined;
    const match = path.match(/\/products\/([^/]+)\/compare(?:\/search)?/);
    return match?.[1];
}
