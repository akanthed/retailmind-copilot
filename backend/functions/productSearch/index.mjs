// Product Search - Lambda Function
// Searches for matching products on competitor sites

import * as cheerio from 'cheerio';

export const handler = async (event) => {
    console.log('Product Search invoked:', JSON.stringify(event, null, 2));
    
    const body = JSON.parse(event.body || '{}');
    const { query } = body;
    
    if (!query) {
        return {
            statusCode: 400,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({
                error: 'Missing required parameter: query'
            })
        };
    }
    
    try {
        const matches = [];
        
        // Search Amazon.in
        try {
            const amazonResults = await searchAmazon(query);
            matches.push(...amazonResults);
        } catch (error) {
            console.error('Amazon search failed:', error);
        }
        
        // Search Flipkart
        try {
            const flipkartResults = await searchFlipkart(query);
            matches.push(...flipkartResults);
        } catch (error) {
            console.error('Flipkart search failed:', error);
        }
        
        // Sort by confidence score
        matches.sort((a, b) => b.confidence - a.confidence);
        
        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({
                query: query,
                matches: matches.slice(0, 10), // Top 10 results
                count: matches.length
            })
        };
        
    } catch (error) {
        console.error('Search error:', error);
        return {
            statusCode: 500,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({
                error: 'Search failed',
                message: error.message
            })
        };
    }
};

// Search Amazon.in
async function searchAmazon(query) {
    const searchUrl = `https://www.amazon.in/s?k=${encodeURIComponent(query)}`;
    console.log('Searching Amazon:', searchUrl);
    
    try {
        const response = await fetch(searchUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.5'
            }
        });
        
        console.log('Amazon response status:', response.status);
        
        if (!response.ok) {
            console.error(`Amazon search failed with status ${response.status}`);
            return [];
        }
        
        const html = await response.text();
        console.log('Amazon HTML length:', html.length);
        
        const $ = cheerio.load(html);
        
        const results = [];
        
        // Parse search results
        $('[data-component-type="s-search-result"]').each((index, element) => {
            if (index >= 5) return; // Limit to top 5 results
            
            const $el = $(element);
            
            // Extract product name
            const productName = $el.find('h2 a span').text().trim();
            
            // Extract price
            let price = null;
            const priceWhole = $el.find('.a-price-whole').first().text().trim();
            if (priceWhole) {
                price = parseFloat(priceWhole.replace(/[^0-9.]/g, ''));
            }
            
            // Extract URL
            const relativeUrl = $el.find('h2 a').attr('href');
            const url = relativeUrl ? `https://www.amazon.in${relativeUrl}` : null;
            
            // Extract image
            const image = $el.find('img').first().attr('src');
            
            // Extract ASIN from URL
            let asin = null;
            if (url) {
                const asinMatch = url.match(/\/dp\/([A-Z0-9]{10})/);
                if (asinMatch) {
                    asin = asinMatch[1];
                }
            }
            
            // Calculate confidence score based on name similarity
            const confidence = calculateConfidence(query, productName);
            
            if (productName && url && price) {
                console.log('Found Amazon product:', productName, price);
                results.push({
                    platform: 'Amazon.in',
                    productName: productName,
                    url: url,
                    price: price,
                    inStock: true, // Assume in stock if in search results
                    image: image,
                    confidence: confidence,
                    productId: asin
                });
            }
        });
        
        console.log(`Amazon search found ${results.length} results`);
        return results;
        
    } catch (error) {
        console.error('Amazon search error:', error.message);
        return [];
    }
}

// Search Flipkart
async function searchFlipkart(query) {
    const searchUrl = `https://www.flipkart.com/search?q=${encodeURIComponent(query)}`;
    console.log('Searching Flipkart:', searchUrl);
    
    try {
        const response = await fetch(searchUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.5'
            }
        });
        
        console.log('Flipkart response status:', response.status);
        
        if (!response.ok) {
            console.error(`Flipkart search failed with status ${response.status}`);
            return [];
        }
        
        const html = await response.text();
        console.log('Flipkart HTML length:', html.length);
        
        const $ = cheerio.load(html);
        
        const results = [];
        
        // Parse search results (Flipkart has dynamic class names, so we use more generic selectors)
        $('a[href*="/p/"]').each((index, element) => {
            if (index >= 5) return; // Limit to top 5 results
            
            const $el = $(element);
            const $parent = $el.closest('div[data-id]');
            
            // Extract product name
            const productName = $el.find('div').first().text().trim() || 
                               $el.attr('title') || 
                               $el.text().trim();
            
            // Extract URL
            const relativeUrl = $el.attr('href');
            const url = relativeUrl ? `https://www.flipkart.com${relativeUrl}` : null;
            
            // Extract price from parent container
            let price = null;
            const priceText = $parent.find('div:contains("₹")').first().text().trim();
            if (priceText) {
                price = parseFloat(priceText.replace(/[^0-9.]/g, ''));
            }
            
            // Extract image
            const image = $parent.find('img').first().attr('src');
            
            // Extract product ID from URL
            let productId = null;
            if (url) {
                const idMatch = url.match(/\/p\/([a-zA-Z0-9]+)/);
                if (idMatch) {
                    productId = idMatch[1];
                }
            }
            
            // Calculate confidence score
            const confidence = calculateConfidence(query, productName);
            
            if (productName && url && price && confidence > 0.3) {
                console.log('Found Flipkart product:', productName, price);
                results.push({
                    platform: 'Flipkart',
                    productName: productName,
                    url: url,
                    price: price,
                    inStock: true,
                    image: image,
                    confidence: confidence,
                    productId: productId
                });
            }
        });
        
        console.log(`Flipkart search found ${results.length} results`);
        return results;
        
    } catch (error) {
        console.error('Flipkart search error:', error.message);
        return [];
    }
}

// Calculate confidence score based on text similarity
function calculateConfidence(query, productName) {
    if (!productName) return 0;
    
    const queryLower = query.toLowerCase();
    const nameLower = productName.toLowerCase();
    
    // Exact match
    if (queryLower === nameLower) return 1.0;
    
    // Contains full query
    if (nameLower.includes(queryLower)) return 0.9;
    
    // Word matching
    const queryWords = queryLower.split(/\s+/).filter(w => w.length > 2);
    const nameWords = nameLower.split(/\s+/);
    
    let matchedWords = 0;
    for (const qWord of queryWords) {
        if (nameWords.some(nWord => nWord.includes(qWord) || qWord.includes(nWord))) {
            matchedWords++;
        }
    }
    
    const wordMatchRatio = queryWords.length > 0 ? matchedWords / queryWords.length : 0;
    
    // Boost score if brand name matches
    const brands = ['apple', 'samsung', 'sony', 'lg', 'oneplus', 'xiaomi', 'realme', 'oppo', 'vivo'];
    for (const brand of brands) {
        if (queryLower.includes(brand) && nameLower.includes(brand)) {
            return Math.min(wordMatchRatio + 0.2, 1.0);
        }
    }
    
    return wordMatchRatio;
}
