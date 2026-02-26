// Price Scraper - Lambda Function
// Scrapes real prices from Indian e-commerce sites

import * as cheerio from 'cheerio';

export const handler = async (event) => {
    console.log('Price Scraper invoked:', JSON.stringify(event, null, 2));
    
    const body = JSON.parse(event.body || '{}');
    const { url, platform } = body;
    
    if (!url || !platform) {
        return {
            statusCode: 400,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({
                error: 'Missing required parameters: url and platform'
            })
        };
    }
    
    try {
        let result;
        
        if (platform === 'amazon' || platform === 'Amazon.in') {
            result = await scrapeAmazon(url);
        } else if (platform === 'flipkart' || platform === 'Flipkart') {
            result = await scrapeFlipkart(url);
        } else if (platform === 'snapdeal' || platform === 'Snapdeal') {
            result = await scrapeSnapdeal(url);
        } else {
            return {
                statusCode: 400,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                body: JSON.stringify({
                    error: 'Unsupported platform. Supported: amazon, flipkart, snapdeal'
                })
            };
        }
        
        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify(result)
        };
        
    } catch (error) {
        console.error('Scraping error:', error);
        return {
            statusCode: 500,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({
                error: 'Scraping failed',
                message: error.message,
                platform: platform
            })
        };
    }
};

// Scrape Amazon.in
async function scrapeAmazon(url) {
    console.log('Scraping Amazon:', url);
    
    const response = await fetch(url, {
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
            'Accept-Encoding': 'gzip, deflate, br',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1'
        }
    });
    
    if (!response.ok) {
        throw new Error(`Amazon returned status ${response.status}`);
    }
    
    const html = await response.text();
    const $ = cheerio.load(html);
    
    // Try multiple selectors for price (Amazon has different layouts)
    let price = null;
    let priceText = '';
    
    // Method 1: Main price span
    priceText = $('.a-price-whole').first().text().trim();
    if (priceText) {
        price = parseFloat(priceText.replace(/[^0-9.]/g, ''));
    }
    
    // Method 2: Price symbol span
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
    
    if (!price) {
        throw new Error('Could not extract price from Amazon page');
    }
    
    return {
        platform: 'Amazon.in',
        productName: productName || 'Unknown Product',
        price: price,
        inStock: inStock,
        image: image,
        url: url,
        timestamp: Date.now(),
        source: 'scraped'
    };
}

// Scrape Flipkart
async function scrapeFlipkart(url) {
    console.log('Scraping Flipkart:', url);
    
    const response = await fetch(url, {
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
            'Connection': 'keep-alive'
        }
    });
    
    if (!response.ok) {
        throw new Error(`Flipkart returned status ${response.status}`);
    }
    
    const html = await response.text();
    const $ = cheerio.load(html);
    
    // Try multiple selectors for price
    let price = null;
    let priceText = '';
    
    // Method 1: Main price div
    priceText = $('._30jeq3._16Jk6d').first().text().trim();
    if (priceText) {
        price = parseFloat(priceText.replace(/[^0-9.]/g, ''));
    }
    
    // Method 2: Alternative price selector
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
    
    if (!price) {
        throw new Error('Could not extract price from Flipkart page');
    }
    
    return {
        platform: 'Flipkart',
        productName: productName || 'Unknown Product',
        price: price,
        inStock: inStock,
        image: image,
        url: url,
        timestamp: Date.now(),
        source: 'scraped'
    };
}

// Scrape Snapdeal
async function scrapeSnapdeal(url) {
    console.log('Scraping Snapdeal:', url);
    
    const response = await fetch(url, {
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
            'Connection': 'keep-alive'
        }
    });
    
    if (!response.ok) {
        throw new Error(`Snapdeal returned status ${response.status}`);
    }
    
    const html = await response.text();
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
    
    if (!price) {
        throw new Error('Could not extract price from Snapdeal page');
    }
    
    return {
        platform: 'Snapdeal',
        productName: productName || 'Unknown Product',
        price: price,
        inStock: inStock,
        image: image,
        url: url,
        timestamp: Date.now(),
        source: 'scraped'
    };
}
