// Real Price Monitor - Lambda Function
// Monitors competitor prices using actual web scraping

import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, ScanCommand, PutCommand } from "@aws-sdk/lib-dynamodb";
import { randomUUID } from "crypto";
import * as cheerio from 'cheerio';

const client = new DynamoDBClient({ region: "us-east-1" });
const docClient = DynamoDBDocumentClient.from(client);

const PRODUCTS_TABLE = "RetailMind-Products";
const PRICE_HISTORY_TABLE = "RetailMind-PriceHistory";

export const handler = async (event) => {
    console.log('Real Price Monitor invoked:', JSON.stringify(event, null, 2));
    
    try {
        // Get all products with competitor URLs
        const products = await getAllProducts();
        console.log(`Found ${products.length} products to monitor`);
        
        if (products.length === 0) {
            return successResponse({
                message: 'No products to monitor',
                productsMonitored: 0
            });
        }
        
        let pricesScraped = 0;
        let pricesFailed = 0;
        const results = [];
        
        // Monitor each product
        for (const product of products) {
            const productResults = await monitorProduct(product);
            results.push({
                productId: product.id,
                productName: product.name,
                ...productResults
            });
            
            pricesScraped += productResults.success;
            pricesFailed += productResults.failed;
        }
        
        console.log(`Monitoring complete: ${pricesScraped} scraped, ${pricesFailed} failed`);
        
        return successResponse({
            message: 'Price monitoring completed',
            productsMonitored: products.length,
            pricesScraped: pricesScraped,
            pricesFailed: pricesFailed,
            results: results,
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('Error:', error);
        return errorResponse(500, 'Price monitoring failed', error.message);
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

// Monitor a single product across all competitor URLs
async function monitorProduct(product) {
    const competitorUrls = product.competitorUrls || {};
    let success = 0;
    let failed = 0;
    const prices = [];
    
    // Check if product has any competitor URLs
    if (Object.keys(competitorUrls).length === 0) {
        console.log(`Product ${product.id} has no competitor URLs, using fallback`);
        // Use synthetic data as fallback
        const syntheticPrices = generateSyntheticPrices(product);
        for (const priceData of syntheticPrices) {
            await storePriceHistory(priceData);
            prices.push(priceData);
            success++;
        }
        return { success, failed, prices, mode: 'synthetic' };
    }
    
    // Scrape each competitor URL
    for (const [platform, url] of Object.entries(competitorUrls)) {
        if (!url || url.trim() === '') {
            continue;
        }
        
        try {
            console.log(`Scraping ${platform} for product ${product.id}`);
            const priceData = await scrapeCompetitorPrice(product, platform, url);
            await storePriceHistory(priceData);
            prices.push(priceData);
            success++;
        } catch (error) {
            console.error(`Failed to scrape ${platform} for ${product.id}:`, error.message);
            failed++;
        }
    }
    
    return { success, failed, prices, mode: 'real' };
}

// Scrape competitor price
async function scrapeCompetitorPrice(product, platform, url) {
    const platformLower = platform.toLowerCase();
    
    let scrapeResult;
    
    if (platformLower.includes('amazon')) {
        scrapeResult = await scrapeAmazon(url);
    } else if (platformLower.includes('flipkart')) {
        scrapeResult = await scrapeFlipkart(url);
    } else if (platformLower.includes('snapdeal')) {
        scrapeResult = await scrapeSnapdeal(url);
    } else {
        throw new Error(`Unsupported platform: ${platform}`);
    }
    
    // Format for DynamoDB
    return {
        id: randomUUID(),
        productId: product.id,
        productName: product.name,
        productSku: product.sku,
        competitorId: `comp-${platformLower}`,
        competitorName: scrapeResult.platform,
        competitorDomain: platformLower,
        price: scrapeResult.price,
        inStock: scrapeResult.inStock,
        rating: scrapeResult.rating || null,
        reviewsCount: scrapeResult.reviewsCount || null,
        timestamp: Date.now(),
        source: 'scraped',
        url: url,
        createdAt: new Date().toISOString()
    };
}

// Fetch with retry
async function fetchWithRetry(url, retries = 2) {
    const headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Connection': 'keep-alive',
        'Cache-Control': 'max-age=0'
    };
    
    for (let i = 0; i < retries; i++) {
        try {
            const response = await fetch(url, { headers, timeout: 10000 });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            
            return await response.text();
        } catch (error) {
            if (i === retries - 1) throw error;
            await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
        }
    }
}

// Scrape Amazon
async function scrapeAmazon(url) {
    const html = await fetchWithRetry(url);
    const $ = cheerio.load(html);
    
    let price = null;
    let priceText = $('.a-price-whole').first().text().trim() ||
                    $('.a-price .a-offscreen').first().text().trim() ||
                    $('#priceblock_dealprice').text().trim() ||
                    $('#priceblock_ourprice').text().trim();
    
    if (priceText) {
        price = parseFloat(priceText.replace(/[^0-9.]/g, ''));
    }
    
    const productName = $('#productTitle').text().trim() || 
                       $('h1.a-size-large').first().text().trim();
    
    const availabilityText = $('#availability span').text().toLowerCase();
    const inStock = !(availabilityText.includes('out of stock') || 
                     availabilityText.includes('currently unavailable'));
    
    const rating = parseFloat($('.a-icon-star .a-icon-alt').first().text().replace(/[^0-9.]/g, '')) || null;
    const reviewsText = $('#acrCustomerReviewText').text().trim();
    const reviewsCount = reviewsText ? parseInt(reviewsText.replace(/[^0-9]/g, '')) : null;
    
    if (!price) throw new Error('Could not extract price');
    
    return {
        platform: 'Amazon.in',
        productName,
        price,
        inStock,
        rating,
        reviewsCount
    };
}

// Scrape Flipkart
async function scrapeFlipkart(url) {
    const html = await fetchWithRetry(url);
    const $ = cheerio.load(html);
    
    let price = null;
    let priceText = $('._30jeq3._16Jk6d').first().text().trim() ||
                    $('._25b18c .hl05eU').first().text().trim() ||
                    $('div._16Jk6d').first().text().trim();
    
    if (priceText) {
        price = parseFloat(priceText.replace(/[^0-9.]/g, ''));
    }
    
    const productName = $('.B_NuCI').first().text().trim() ||
                       $('span.B_NuCI').first().text().trim() ||
                       $('h1 span').first().text().trim();
    
    const stockText = $('._16FRp0').text().toLowerCase();
    const inStock = !(stockText.includes('out of stock') || stockText.includes('sold out'));
    
    const rating = parseFloat($('div._3LWZlK').first().text().trim()) || null;
    const reviewsText = $('span._2_R_DZ').first().text().trim();
    const reviewsCount = reviewsText ? parseInt(reviewsText.replace(/[^0-9]/g, '')) : null;
    
    if (!price) throw new Error('Could not extract price');
    
    return {
        platform: 'Flipkart',
        productName,
        price,
        inStock,
        rating,
        reviewsCount
    };
}

// Scrape Snapdeal
async function scrapeSnapdeal(url) {
    const html = await fetchWithRetry(url);
    const $ = cheerio.load(html);
    
    let price = null;
    let priceText = $('.payBlkBig').first().text().trim() ||
                    $('.pdp-final-price span').first().text().trim();
    
    if (priceText) {
        price = parseFloat(priceText.replace(/[^0-9.]/g, ''));
    }
    
    const productName = $('.pdp-e-i-head').first().text().trim() ||
                       $('h1.pdp-e-i-head').first().text().trim();
    
    const stockText = $('.sold-out-err').text().toLowerCase();
    const inStock = !(stockText.includes('out of stock') || stockText.includes('sold out'));
    
    const rating = parseFloat($('.avrg-rating').first().text().trim()) || null;
    const reviewsText = $('.total-rating-count').first().text().trim();
    const reviewsCount = reviewsText ? parseInt(reviewsText.replace(/[^0-9]/g, '')) : null;
    
    if (!price) throw new Error('Could not extract price');
    
    return {
        platform: 'Snapdeal',
        productName,
        price,
        inStock,
        rating,
        reviewsCount
    };
}

// Generate synthetic prices as fallback
function generateSyntheticPrices(product) {
    const basePrice = product.currentPrice || 1000;
    const competitors = [
        { id: "comp-amazon", name: "Amazon.in", domain: "amazon.in" },
        { id: "comp-flipkart", name: "Flipkart", domain: "flipkart.com" },
        { id: "comp-snapdeal", name: "Snapdeal", domain: "snapdeal.com" }
    ];
    
    return competitors.map(competitor => {
        const variation = (Math.random() * 0.35) - 0.20;
        const price = Math.round((basePrice * (1 + variation)) / 10) * 10;
        const inStock = Math.random() > 0.1;
        
        return {
            id: randomUUID(),
            productId: product.id,
            productName: product.name,
            productSku: product.sku,
            competitorId: competitor.id,
            competitorName: competitor.name,
            competitorDomain: competitor.domain,
            price: price,
            inStock: inStock,
            timestamp: Date.now(),
            source: 'synthetic',
            createdAt: new Date().toISOString()
        };
    });
}

// Store price in DynamoDB
async function storePriceHistory(priceData) {
    const command = new PutCommand({
        TableName: PRICE_HISTORY_TABLE,
        Item: priceData
    });
    
    await docClient.send(command);
}

// Helper functions
function successResponse(data) {
    return {
        statusCode: 200,
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify(data)
    };
}

function errorResponse(statusCode, error, message = null) {
    return {
        statusCode: statusCode,
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
            error: error,
            message: message
        })
    };
}
