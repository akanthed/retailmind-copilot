// Price Comparison API - Lambda Function
// Searches for product prices across e-commerce platforms using SerpAPI (Google Shopping)

import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, DeleteCommand, GetCommand, PutCommand, QueryCommand, ScanCommand } from "@aws-sdk/lib-dynamodb";
import { BedrockRuntimeClient, InvokeModelCommand } from "@aws-sdk/client-bedrock-runtime";
import { randomUUID } from "crypto";

// Import shared modules from local shared folder
let createPriceService, normalizePriceSummary, parseUserQuery, rerankWithAI, rerankSimple;
try {
    const priceServiceModule = await import("./shared/price-service.mjs");
    createPriceService = priceServiceModule.createPriceService;
    normalizePriceSummary = priceServiceModule.normalizePriceSummary;
    
    const queryParserModule = await import("./shared/query-parser.mjs");
    parseUserQuery = queryParserModule.parseUserQuery;
    
    const rerankerModule = await import("./shared/ai-reranker.mjs");
    rerankWithAI = rerankerModule.rerankWithAI;
    rerankSimple = rerankerModule.rerankSimple;
    
    console.log('[INIT] Shared modules loaded successfully');
} catch (error) {
    console.warn('[INIT] Shared modules not found, using fallback implementations', error.message);
    // Fallback implementations
    createPriceService = () => ({ fetchCompetitorPrices: async () => ({ results: [], source: 'fallback', parsedQuery: {}, attemptedQueries: [], selectedQuery: '' }) });
    normalizePriceSummary = (name, results) => ({
        product: name,
        min_price: results.length ? Math.min(...results.map(r => r.price)) : 0,
        avg_price: results.length ? results.reduce((sum, r) => sum + r.price, 0) / results.length : 0,
        sources: results.length,
        last_updated: new Date().toISOString()
    });
    parseUserQuery = (query) => ({ original: query });
    rerankWithAI = async (q, p, results) => results;
    rerankSimple = (p, results) => results;
}

const client = new DynamoDBClient({ region: "us-east-1" });
const docClient = DynamoDBDocumentClient.from(client);

const PRODUCTS_TABLE = "RetailMind-Products";
const PRICE_COMPARISON_TABLE = "RetailMind-PriceComparison";
const PRICE_HISTORY_TABLE = "RetailMind-PriceHistory";

// SerpAPI key from environment variable
const SERPAPI_KEY = process.env.SERP_API_KEY || process.env.SERPAPI_KEY || "";
const BEDROCK_QUERY_MODEL = process.env.BEDROCK_QUERY_MODEL || "";
const ENABLE_AI_RERANKING = process.env.ENABLE_AI_RERANKING !== 'false'; // Default: enabled
const ENABLE_STRICT_FILTERING = process.env.ENABLE_STRICT_FILTERING !== 'false'; // Default: enabled
const ALLOW_SYNTHETIC_FALLBACK = process.env.ALLOW_SYNTHETIC_FALLBACK === 'true'; // Default: disabled
const bedrockClient = BEDROCK_QUERY_MODEL ? new BedrockRuntimeClient({ region: "us-east-1" }) : null;
const priceService = createPriceService({ 
  serpApiKey: SERPAPI_KEY, 
  logger: console, 
  retries: 2,
  enableStrictFiltering: ENABLE_STRICT_FILTERING
});

export const handler = async (event) => {
    console.log('Price Comparison API invoked:', JSON.stringify(event, null, 2));

    const httpMethod = event.httpMethod;
    const pathParameters = event.pathParameters || {};
    const requestPath = event.resource || event.path || '';
    const productId = pathParameters.productId || pathParameters.id || extractProductIdFromPath(requestPath);
    const action = pathParameters.action;
    const isSearchRequest = requestPath.includes('/compare/search');
    const isCompareAllRequest = requestPath === '/compare' || requestPath.endsWith('/compare');

    console.log('[ROUTING]', {
        httpMethod,
        requestPath,
        productId,
        action,
        isSearchRequest,
        pathParameters
    });

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
            console.log('[ROUTING] No route matched, returning 404');
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
        aiQueryExpansionEnabled: Boolean(BEDROCK_QUERY_MODEL),
        strictFilteringEnabled: ENABLE_STRICT_FILTERING,
        aiRerankingEnabled: ENABLE_AI_RERANKING
    });

    const queryCandidates = await buildSearchQueryCandidates(product, searchParams);
    console.log('[PRICE-COMPARE] Query candidates prepared', {
        productId,
        count: queryCandidates.length,
        candidates: queryCandidates
    });

    if (!SERPAPI_KEY) {
        console.warn('[PRICE-COMPARE] SERP API key missing, running Playwright fallback first', { productId });
    }

    let results = [];
    let selectedQuery = '';
    let parsedQuery = null;
    const queryAttempts = [];
    const providedUrlPlatforms = getProvidedUrlPlatforms(product, searchParams);
    const useProvidedUrlOnly = providedUrlPlatforms.length > 0 && searchParams?.allowSearchFallback !== true;
    const directUrlResults = await fetchDirectCompetitorPrices(product, searchParams);
    if (directUrlResults.length > 0) {
        results = dedupeResultsByPlatformAndPrice(directUrlResults);
        console.log('[PRICE-COMPARE] Direct URL results found', {
            productId,
            count: results.length,
            platforms: results.map((r) => r.platform)
        });
    }

    if (useProvidedUrlOnly) {
        console.log('[PRICE-COMPARE] Using provided URL mode (search fallback disabled)', {
            productId,
            providedUrlPlatforms,
            directResults: results.length
        });
    }

    try {
        if (!useProvidedUrlOnly) {
        for (const candidateQuery of queryCandidates) {
            console.log('[PRICE-COMPARE] Searching Google Shopping', {
                productId,
                query: candidateQuery
            });

            // Configure filtering options
            const filterOptions = {
                strictCapacity: searchParams?.strictCapacity !== false,
                allowTolerance: searchParams?.allowTolerance || false,
                minScore: searchParams?.minScore || 60
            };

            const searchResult = await priceService.fetchCompetitorPrices(candidateQuery, filterOptions);
            parsedQuery = searchResult.parsedQuery;
            
            queryAttempts.push({
                query: candidateQuery,
                source: searchResult.source,
                selectedQuery: searchResult.selectedQuery,
                checklist: searchResult.checklist,
                attempts: searchResult.attemptedQueries,
                finalResults: searchResult.results.length,
                filteringApplied: searchResult.filteringApplied,
                parsedQuery: searchResult.parsedQuery
            });

            if (searchResult.results.length > 0) {
                results = dedupeResultsByPlatformAndPrice([...results, ...searchResult.results]);
                selectedQuery = searchResult.selectedQuery || candidateQuery;
                if (results.length >= 3) {
                    break;
                }
            }
        }
        }

        console.log('[PRICE-COMPARE] SerpAPI attempt summary', {
            productId,
            selectedQuery: selectedQuery || null,
            attempts: queryAttempts,
            parsedQuery
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

    if (!results.length && !useProvidedUrlOnly && ALLOW_SYNTHETIC_FALLBACK) {
        console.warn('[PRICE-COMPARE] No live results found - using synthetic fallback (enabled via env)', {
            productId,
            productName: product.name,
            attempts: queryAttempts
        });
        results = generateSyntheticPrices(product);
    }

    if (useProvidedUrlOnly) {
        results = results.filter((item) => item.source === 'direct_url');
    }

    // Apply AI re-ranking if enabled and we have results
    let rerankingApplied = false;
    if (ENABLE_AI_RERANKING && results.length > 1 && parsedQuery) {
        try {
            console.log('[PRICE-COMPARE] Applying AI re-ranking', {
                productId,
                resultCount: results.length
            });
            
            if (BEDROCK_QUERY_MODEL) {
                results = await rerankWithAI(
                    selectedQuery || queryCandidates[0],
                    parsedQuery,
                    results,
                    {
                        modelId: BEDROCK_QUERY_MODEL,
                        logger: console
                    }
                );
            } else {
                // Fallback to simple re-ranking
                results = rerankSimple(parsedQuery, results);
            }
            
            rerankingApplied = true;
            
            console.log('[PRICE-COMPARE] AI re-ranking complete', {
                productId,
                finalCount: results.length,
                topScore: results[0]?.aiScore || 0
            });
        } catch (error) {
            console.error('[PRICE-COMPARE] AI re-ranking failed, using original order', {
                productId,
                message: error.message
            });
        }
    }

    const summary = normalizePriceSummary(product.name, results);

    // 3. Calculate price differences
    results = results.map(r => ({
        ...r,
        priceDiff: r.price - product.currentPrice,
        priceDiffPercent: ((r.price - product.currentPrice) / product.currentPrice) * 100
    }));

    // 3.5. Deduplicate - Keep only the BEST match per platform
    const platformBestMatches = {};
    results.forEach(result => {
        const platform = result.platform?.toLowerCase() || 'unknown';
        const score = result.aiScore || result.matchScore || 0;
        
        if (!platformBestMatches[platform] || score > (platformBestMatches[platform].aiScore || platformBestMatches[platform].matchScore || 0)) {
            platformBestMatches[platform] = result;
        }
    });
    
    // Replace results with only best matches per platform
    results = Object.values(platformBestMatches);
    
    console.log('[PRICE-COMPARE] Deduplicated results', {
        productId,
        originalCount: results.length,
        deduplicatedCount: results.length,
        platforms: Object.keys(platformBestMatches)
    });

    // 4. Replace previously stored comparisons to avoid stale mismatched rows
    await deleteExistingComparisons(productId);

    // 5. Store latest results in DynamoDB
    let storedCount = 0;
    for (const result of results) {
        const timestamp = Date.now();
        const comparisonId = randomUUID();
        const competitorId = `${String(result.platform || 'unknown').toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
        try {
            await docClient.send(new PutCommand({
                TableName: PRICE_COMPARISON_TABLE,
                Item: {
                    productId: productId,
                    comparisonId,
                    platform: result.platform,
                    title: result.title,
                    price: result.price,
                    url: result.url,
                    inStock: result.inStock,
                    priceDiff: result.priceDiff,
                    priceDiffPercent: result.priceDiffPercent,
                    source: result.source,
                    timestamp,
                    createdAt: new Date().toISOString()
                }
            }));

            await docClient.send(new PutCommand({
                TableName: PRICE_HISTORY_TABLE,
                Item: {
                    id: randomUUID(),
                    timestamp,
                    productId: productId,
                    productName: product.name,
                    productSku: product.sku,
                    competitorId,
                    competitorName: result.platform || 'Unknown',
                    competitorDomain: extractDomain(result.url),
                    price: result.price,
                    inStock: result.inStock !== false,
                    source: result.source || 'live',
                    url: result.url || '',
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
        storedCount,
        rerankingApplied,
        parsedQuery
    });

    const liveSourcesCount = results.filter((item) => ['live', 'playwright_fallback', 'direct_url'].includes(item.source)).length;
    const syntheticCount = results.filter((item) => item.source === 'synthetic').length;

    return {
        statusCode: 200,
        body: {
            productId,
            product: summary.product,
            min_price: summary.min_price,
            avg_price: summary.avg_price,
            sources: summary.sources,
            last_updated: summary.last_updated,
            searchQuery: selectedQuery || queryCandidates[0],
            attemptedQueries: queryCandidates,
            debugAttempts: queryAttempts,
            results,
            resultsCount: results.length,
            source: syntheticCount > 0 ? 'synthetic' : (liveSourcesCount > 0 ? 'live' : 'none'),
            liveDataAvailable: liveSourcesCount > 0,
            syntheticFallbackUsed: syntheticCount > 0,
            directUrlUsed: results.some((item) => item.source === 'direct_url'),
            useProvidedUrlOnly,
            providedUrlPlatforms,
            fallbackEnabled: ALLOW_SYNTHETIC_FALLBACK,
            timestamp: new Date().toISOString(),
            parsedQuery,
            rerankingApplied,
            strictFilteringEnabled: ENABLE_STRICT_FILTERING
        }
    };
}

function getProvidedUrlPlatforms(product, searchParams = {}) {
    const entries = [
        { platform: 'Amazon.in', url: searchParams?.amazonUrl || product.amazonUrl },
        { platform: 'Flipkart', url: searchParams?.flipkartUrl || product.flipkartUrl }
    ];

    return entries
        .filter((entry) => typeof entry.url === 'string' && entry.url.trim().length > 0)
        .map((entry) => entry.platform);
}

async function deleteExistingComparisons(productId) {
    try {
        const queryResult = await docClient.send(new QueryCommand({
            TableName: PRICE_COMPARISON_TABLE,
            KeyConditionExpression: 'productId = :pid',
            ExpressionAttributeValues: { ':pid': productId }
        }));

        const items = queryResult.Items || [];
        for (const item of items) {
            if (!item.comparisonId) continue;
            await docClient.send(new DeleteCommand({
                TableName: PRICE_COMPARISON_TABLE,
                Key: {
                    productId,
                    comparisonId: item.comparisonId
                }
            }));
        }
    } catch (error) {
        console.warn('[PRICE-COMPARE] Failed to clear old comparisons', {
            productId,
            message: error.message
        });
    }
}

async function fetchDirectCompetitorPrices(product, searchParams = {}) {
    const urls = [
        { platform: 'Amazon.in', url: searchParams?.amazonUrl || product.amazonUrl },
        { platform: 'Flipkart', url: searchParams?.flipkartUrl || product.flipkartUrl }
    ].filter((item) => typeof item.url === 'string' && item.url.trim().length > 0);

    if (!urls.length) {
        return [];
    }

    const results = [];
    for (const item of urls) {
        try {
            const response = await fetch(item.url, {
                headers: {
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
                    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
                    "Accept-Language": "en-IN,en;q=0.9"
                },
                signal: AbortSignal.timeout(7000)
            });

            if (!response.ok) {
                console.warn('[PRICE-COMPARE] Direct URL fetch failed', {
                    platform: item.platform,
                    status: response.status
                });
                continue;
            }

            const html = await response.text();
            const price = extractPriceFromHtml(item.platform, html);
            if (!price) {
                console.warn('[PRICE-COMPARE] Direct URL price extraction failed', {
                    platform: item.platform
                });
                continue;
            }

            results.push({
                platform: item.platform,
                title: product.name,
                price,
                url: item.url,
                inStock: true,
                source: 'direct_url',
                rating: null,
                reviews: null,
                thumbnail: null
            });
        } catch (error) {
            console.warn('[PRICE-COMPARE] Direct URL scrape error', {
                platform: item.platform,
                message: error.message
            });
        }
    }

    return results;
}

function extractPriceFromHtml(platform, html) {
    if (!html) return null;

    const amazonPatterns = [
        /<span class="a-price-whole">([0-9,]+)<\/span>/,
        /"priceAmount":\s*"?([0-9]+(?:\.[0-9]+)?)"?/,
        /₹\s*([0-9,]+(?:\.[0-9]{1,2})?)/
    ];

    const flipkartPatterns = [
        /<div class="[^"]*_30jeq3[^"]*">₹([0-9,]+)<\/div>/,
        /<div class="[^"]*Nx9bqj[^"]*">₹([0-9,]+)<\/div>/,
        /₹\s*([0-9,]+(?:\.[0-9]{1,2})?)/
    ];

    const genericPatterns = [
        /₹\s*([0-9,]+(?:\.[0-9]{1,2})?)/,
        /Rs\.?\s*([0-9,]+(?:\.[0-9]{1,2})?)/i,
        /INR\s*([0-9,]+(?:\.[0-9]{1,2})?)/i
    ];

    const patterns = platform.toLowerCase().includes('amazon')
        ? amazonPatterns
        : platform.toLowerCase().includes('flipkart')
            ? flipkartPatterns
            : genericPatterns;

    for (const pattern of patterns) {
        const match = html.match(pattern);
        if (!match?.[1]) continue;
        const parsed = Number(match[1].replace(/,/g, ''));
        if (Number.isFinite(parsed) && parsed > 0) {
            return parsed;
        }
    }

    return null;
}

function dedupeResultsByPlatformAndPrice(items) {
    const seen = new Set();
    const output = [];

    for (const item of items || []) {
        const key = `${String(item.platform || '').toLowerCase()}-${Number(item.price)}`;
        if (seen.has(key)) continue;
        seen.add(key);
        output.push(item);
    }

    return output;
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
    const stopWords = new Set(['buy', 'best', 'latest', 'new', 'online', 'price', 'with', 'for', 'and', 'the', 'a', 'an', 'at', 'from', 'in']);
    return String(value || '')
        .replace(/[^a-zA-Z0-9\s-]/g, ' ')
        .split(/\s+/)
        .filter(Boolean)
        .filter(token => !stopWords.has(token.toLowerCase()))
        .join(' ')
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

function generateSyntheticPrices(product) {
    const platforms = [
        { name: 'Amazon.in', minDelta: -0.12, maxDelta: 0.08 },
        { name: 'Flipkart', minDelta: -0.15, maxDelta: 0.06 },
        { name: 'Croma', minDelta: -0.08, maxDelta: 0.1 },
        { name: 'Reliance Digital', minDelta: -0.1, maxDelta: 0.12 },
        { name: 'JioMart', minDelta: -0.2, maxDelta: 0.04 },
        { name: 'Meesho', minDelta: -0.22, maxDelta: 0.03 }
    ];

    const basePrice = Number(product.currentPrice) > 0 ? Number(product.currentPrice) : 1000;
    const shuffled = [...platforms].sort(() => Math.random() - 0.5).slice(0, 4);

    return shuffled.map((platform) => {
        const delta = platform.minDelta + Math.random() * (platform.maxDelta - platform.minDelta);
        const simulatedPrice = Math.max(1, Math.round(basePrice * (1 + delta)));

        return {
            platform: platform.name,
            title: product.name,
            price: simulatedPrice,
            url: '',
            inStock: Math.random() > 0.15,
            source: 'synthetic',
            rating: Number((3.5 + Math.random() * 1.5).toFixed(1)),
            reviews: Math.floor(Math.random() * 5000),
            thumbnail: null
        };
    });
}

function extractProductIdFromPath(path) {
    if (!path) return undefined;
    const match = path.match(/\/products\/([^/]+)\/compare(?:\/search)?/);
    return match?.[1];
}
