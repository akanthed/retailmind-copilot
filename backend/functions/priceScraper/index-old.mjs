// Enhanced Price Scraper with Web Search
// Searches for products and scrapes real prices from e-commerce sites

import * as cheerio from 'cheerio';

export const handler = async (event) => {
    console.log('Enhanced Price Scraper invoked:', JSON.stringify(event, null, 2));
    
    const body = JSON.parse(event.body || '{}');
    const { url, platform, productName, searchMode } = body;
    
    try {
        let result;
        
        // Mode 1: Direct URL scraping
        if (url && platform) {
            result = await scrapeDirectUrl(url, platform);
        }
        // Mode 2: Search and scrape
        else if (productName && platform) {
            result = await searchAndScrape(productName, platform);
        }
        else {
            return errorResponse(400, 'Missing required parameters. Provide either (url + platform) or (productName + platform)');
        }
        
        return successResponse(result);
        
    } catch (error) {
        console.error('Scraping error:', error);
        return errorResponse(500, 'Scraping failed', error.message);
    }
};

// Search for product and scrape price
async function searchAndScrape(productName, platform) {
    console.log(`Searching for "${productName}" on ${platform}`);
    
    let searchUrl;
    
    if (platform === 'amazon' || platform === 'Amazon.in') {
        searchUrl = `https://www.amazon.in/s?k=${encodeURIComponent(productName)}`;
    } else if (platform === 'flipkart' || platform === 'Flipkart') {
        searchUrl = `https://www.flipkart.com/search?q=${encodeURIComponent(productName)}`;
    } else if (platform === 'snapdeal' || platform === 'Snapdeal') {
        searchUrl = `https://www.snapdeal.com/search?keyword=${encodeURIComponent(productName)}`;
    } else {
        throw new Error(`Unsupported platform: ${platform}`);
    }
    
    // Fetch search results
    const searchHtml = await fetchWithRetry(searchUrl);
    const $ = cheerio.load(searchHtml);
    
    // Extract first product URL
    let productUrl;
    
    if (platform === 'amazon' || platform === 'Amazon.in') {
        const firstResult = $('div[data-component-type="s-search-result"]').first();
        const relativeUrl = firstResult.find('h2 a').attr('href');
        if (relativeUrl) {
            productUrl = `https://www.amazon.in${relativeUrl}`;
        }
    } else if (platform === 'flipkart' || platform === 'Flipkart') {
        const firstResult = $('a._1fQZEK').first().attr('href');
        if (firstResult) {
            productUrl = `https://www.flipkart.com${firstResult}`;
        }
    } else if (platform === 'snapdeal' || platform === 'Snapdeal') {
        productUrl = $('.product-tuple-listing a').first().attr('href');
    }
    
    if (!productUrl) {
        throw new Error(`No products found for "${productName}" on ${platform}`);
    }
    
    console.log(`Found product URL: ${productUrl}`);
    
    // Now scrape the product page
    return await scrapeDirectUrl(productUrl, platform);
}

// Scrape price from direct URL
async function scrapeDirectUrl(url, platform) {
    if (platform === 'amazon' || platform === 'Amazon.in') {
        return await scrapeAmazon(url);
    } else if (platform === 'flipkart' || platform === 'Flipkart') {
        return await scrapeFlipkart(url);
    } else if (platform === 'snapdeal' || platform === 'Snapdeal') {
        return await scrapeSnapdeal(url);
    } else {
        throw new Error(`Unsupported platform: ${platform}`);
    }
}

// Fetch with retry and proper headers
async function fetchWithRetry(url, retries = 3) {
    const headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        'Cache-Control': 'max-age=0'
    };
    
    for (let i = 0; i < retries; i++) {
        try {
            const response = await fetch(url, { headers });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            return await response.text();
        } catch (error) {
            console.error(`Fetch attempt ${i + 1} failed:`, error.message);
            
            if (i === retries - 1) {
                throw error;
            }
            
            // Wait before retry (exponential backoff)
            await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, i)));
        }
    }
}

// Scrape Amazon.in
async function scrapeAmazon(url) {
    console.log('Scraping Amazon:', url);
    
    const html = await fetchWithRetry(url);
    const $ = cheerio.load(html);
    
    // Extract price (multiple methods)
    let price = null;
    let priceText = '';
    
    // Method 1: Main price
    priceText = $('.a-price-whole').first().text().trim();
    if (priceText) {
        price = parseFloat(priceText.replace(/[^0-9.]/g, ''));
    }
    
    // Method 2: Offscreen price
    if (!price) {
        priceText = $('.a-price .a-offscreen').first().text().trim();
        if (priceText) {
            price = parseFloat(priceText.replace(/[^0-9.]/g, ''));
        }
    }
    
    // Method 3: Deal price
    if (!price) {
        priceText = $('#priceblock_dealprice').text().trim();
        if (priceText) {
            price = parseFloat(priceText.replace(/[^0-9.]/g, ''));
        }
    }
    
    // Method 4: Our price
    if (!price) {
        priceText = $('#priceblock_ourprice').text().trim();
        if (priceText) {
            price = parseFloat(priceText.replace(/[^0-9.]/g, ''));
        }
    }
    
    // Extract product name
    let productName = $('#productTitle').text().trim();
    if (!productName) {
        productName = $('h1.a-size-large').first().text().trim();
    }
    
    // Extract stock status
    let inStock = true;
    const availabilityText = $('#availability span').text().toLowerCase();
    if (availabilityText.includes('out of stock') || 
        availabilityText.includes('currently unavailable') ||
        availabilityText.includes('not available')) {
        inStock = false;
    }
    
    // Extract image
    const image = $('#landingImage').attr('src') || $('.a-dynamic-image').first().attr('src');
    
    // Extract rating
    const rating = parseFloat($('.a-icon-star .a-icon-alt').first().text().replace(/[^0-9.]/g, '')) || null;
    
    // Extract reviews count
    const reviewsText = $('#acrCustomerReviewText').text().trim();
    const reviewsCount = reviewsText ? parseInt(reviewsText.replace(/[^0-9]/g, '')) : null;
    
    if (!price) {
        throw new Error('Could not extract price from Amazon page');
    }
    
    return {
        platform: 'Amazon.in',
        productName: productName || 'Unknown Product',
        price: price,
        currency: 'INR',
        inStock: inStock,
        image: image,
        url: url,
        rating: rating,
        reviewsCount: reviewsCount,
        timestamp: Date.now(),
        scrapedAt: new Date().toISOString(),
        source: 'scraped'
    };
}

// Scrape Flipkart
async function scrapeFlipkart(url) {
    console.log('Scraping Flipkart:', url);
    
    const html = await fetchWithRetry(url);
    const $ = cheerio.load(html);
    
    // Extract price
    let price = null;
    let priceText = '';
    
    // Method 1: Main price
    priceText = $('._30jeq3._16Jk6d').first().text().trim();
    if (priceText) {
        price = parseFloat(priceText.replace(/[^0-9.]/g, ''));
    }
    
    // Method 2: Alternative
    if (!price) {
        priceText = $('._25b18c .hl05eU').first().text().trim();
        if (priceText) {
            price = parseFloat(priceText.replace(/[^0-9.]/g, ''));
        }
    }
    
    // Method 3: Another alternative
    if (!price) {
        priceText = $('div._16Jk6d').first().text().trim();
        if (priceText) {
            price = parseFloat(priceText.replace(/[^0-9.]/g, ''));
        }
    }
    
    // Extract product name
    let productName = $('.B_NuCI').first().text().trim();
    if (!productName) {
        productName = $('span.B_NuCI').first().text().trim();
    }
    if (!productName) {
        productName = $('h1 span').first().text().trim();
    }
    
    // Extract stock status
    let inStock = true;
    const stockText = $('._16FRp0').text().toLowerCase();
    if (stockText.includes('out of stock') || 
        stockText.includes('sold out') ||
        stockText.includes('currently unavailable')) {
        inStock = false;
    }
    
    // Extract image
    const image = $('._396cs4._2amPTt._3qGmMb').first().attr('src') || 
                  $('img._396cs4').first().attr('src');
    
    // Extract rating
    const rating = parseFloat($('div._3LWZlK').first().text().trim()) || null;
    
    // Extract reviews count
    const reviewsText = $('span._2_R_DZ').first().text().trim();
    const reviewsCount = reviewsText ? parseInt(reviewsText.replace(/[^0-9]/g, '')) : null;
    
    if (!price) {
        throw new Error('Could not extract price from Flipkart page');
    }
    
    return {
        platform: 'Flipkart',
        productName: productName || 'Unknown Product',
        price: price,
        currency: 'INR',
        inStock: inStock,
        image: image,
        url: url,
        rating: rating,
        reviewsCount: reviewsCount,
        timestamp: Date.now(),
        scrapedAt: new Date().toISOString(),
        source: 'scraped'
    };
}

// Scrape Snapdeal
async function scrapeSnapdeal(url) {
    console.log('Scraping Snapdeal:', url);
    
    const html = await fetchWithRetry(url);
    const $ = cheerio.load(html);
    
    // Extract price
    let price = null;
    let priceText = $('.payBlkBig').first().text().trim();
    if (priceText) {
        price = parseFloat(priceText.replace(/[^0-9.]/g, ''));
    }
    
    if (!price) {
        priceText = $('.pdp-final-price span').first().text().trim();
        if (priceText) {
            price = parseFloat(priceText.replace(/[^0-9.]/g, ''));
        }
    }
    
    // Extract product name
    const productName = $('.pdp-e-i-head').first().text().trim() || 
                       $('h1.pdp-e-i-head').first().text().trim();
    
    // Extract stock status
    let inStock = true;
    const stockText = $('.sold-out-err').text().toLowerCase();
    if (stockText.includes('out of stock') || stockText.includes('sold out')) {
        inStock = false;
    }
    
    // Extract image
    const image = $('#bx-pager img').first().attr('src') || 
                  $('.cloudzoom').first().attr('src');
    
    // Extract rating
    const rating = parseFloat($('.avrg-rating').first().text().trim()) || null;
    
    // Extract reviews count
    const reviewsText = $('.total-rating-count').first().text().trim();
    const reviewsCount = reviewsText ? parseInt(reviewsText.replace(/[^0-9]/g, '')) : null;
    
    if (!price) {
        throw new Error('Could not extract price from Snapdeal page');
    }
    
    return {
        platform: 'Snapdeal',
        productName: productName || 'Unknown Product',
        price: price,
        currency: 'INR',
        inStock: inStock,
        image: image,
        url: url,
        rating: rating,
        reviewsCount: reviewsCount,
        timestamp: Date.now(),
        scrapedAt: new Date().toISOString(),
        source: 'scraped'
    };
}

// Helper functions for responses
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
