import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";
import { BedrockRuntimeClient, InvokeModelCommand } from "@aws-sdk/client-bedrock-runtime";

const dynamodb = DynamoDBDocumentClient.from(new DynamoDBClient({ region: "us-east-1" }));
const bedrockClient = new BedrockRuntimeClient({ region: "us-east-1" });
const ALLOW_SYNTHETIC_FALLBACK = process.env.ALLOW_SYNTHETIC_FALLBACK === "true";
const USE_AI_EXTRACTION = process.env.USE_AI_EXTRACTION !== "false"; // Default: enabled
const BEDROCK_MODEL = process.env.BEDROCK_MODEL || "us.amazon.nova-lite-v1:0"; // Use Lite for cost savings!

export const handler = async (event) => {
  console.log("Price scraper invoked:", JSON.stringify(event));

  try {
    // Parse request
    const body = typeof event.body === "string" ? JSON.parse(event.body) : event.body;
    const { productId, productName, competitors } = body;

    if (!productId || !productName || !competitors || !Array.isArray(competitors)) {
      return {
        statusCode: 400,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
        body: JSON.stringify({
          error: "Missing required fields: productId, productName, competitors (array)",
        }),
      };
    }

    const scrapedPrices = [];
    const timestamp = new Date().toISOString();

    // Scrape each competitor
    for (const competitor of competitors) {
      const { name, url } = competitor;

      if (!name || !url) {
        console.log("Skipping invalid competitor:", competitor);
        continue;
      }

      try {
        const price = await scrapePrice(name, url);
        
        if (price) {
          scrapedPrices.push({
            competitor: name,
            price: price,
            url: url,
            timestamp: timestamp,
            available: true,
          });

          // Store in DynamoDB
          await storePriceHistory(productId, name, price, url, timestamp);
        } else {
          scrapedPrices.push({
            competitor: name,
            price: null,
            url: url,
            timestamp: timestamp,
            available: false,
          });
        }
      } catch (error) {
        console.error(`Error scraping ${name}:`, error);
        scrapedPrices.push({
          competitor: name,
          price: null,
          url: url,
          timestamp: timestamp,
          available: false,
          error: error.message,
        });
      }
    }

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({
        success: true,
        productId: productId,
        productName: productName,
        scrapedAt: timestamp,
        prices: scrapedPrices,
      }),
    };
  } catch (error) {
    console.error("Error in price scraper:", error);

    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({
        error: "Failed to scrape prices",
        details: error.message,
      }),
    };
  }
};

// Scrape price from competitor website
async function scrapePrice(competitor, url) {
  console.log(`Scraping ${competitor}: ${url}`);

  try {
    // Add delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 500));

    // Fetch the page with better headers
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
        "Accept-Encoding": "gzip, deflate, br",
        "Connection": "keep-alive",
        "Upgrade-Insecure-Requests": "1",
        "Sec-Fetch-Dest": "document",
        "Sec-Fetch-Mode": "navigate",
        "Sec-Fetch-Site": "none",
        "Cache-Control": "max-age=0",
      },
      signal: AbortSignal.timeout(5000), // 5 second timeout
    });

    if (!response.ok) {
      console.log(`Failed to fetch ${competitor}: ${response.status}`);
      if (ALLOW_SYNTHETIC_FALLBACK) {
        return generateDemoPrice(competitor);
      }
      return null;
    }

    const html = await response.text();

    // Extract price based on competitor
    let price = null;

    // Try AI extraction first (more accurate)
    if (USE_AI_EXTRACTION) {
      console.log(`Attempting AI-powered price extraction for ${competitor}`);
      price = await extractPriceWithAI(html, competitor, url);
    }

    // Fallback to regex if AI fails
    if (!price) {
      console.log(`AI extraction failed, falling back to regex for ${competitor}`);
      if (competitor.toLowerCase().includes("amazon")) {
        price = extractAmazonPrice(html);
      } else if (competitor.toLowerCase().includes("flipkart")) {
        price = extractFlipkartPrice(html);
      } else {
        price = extractGenericPrice(html);
      }
    }

    // If extraction failed, use demo price only if enabled
    if (!price) {
      console.log(`Price extraction failed for ${competitor}`);
      if (ALLOW_SYNTHETIC_FALLBACK) {
        return generateDemoPrice(competitor);
      }
      return null;
    }

    console.log(`Successfully extracted price for ${competitor}: ₹${price}`);
    return price;
  } catch (error) {
    console.error(`Error fetching ${competitor}:`, error.message);
    if (ALLOW_SYNTHETIC_FALLBACK) {
      console.log(`Using demo price for ${competitor}`);
      return generateDemoPrice(competitor);
    }
    return null;
  }
}

// AI-powered price extraction using Amazon Bedrock
async function extractPriceWithAI(html, competitor, url) {
  try {
    // Truncate HTML to first 8000 chars to stay within token limits
    const truncatedHtml = html.substring(0, 8000);
    
    const prompt = `You are a price extraction expert. Extract the current selling price from this e-commerce page HTML.

Competitor: ${competitor}
URL: ${url}

HTML snippet:
${truncatedHtml}

Instructions:
- Find the CURRENT SELLING PRICE (not MRP/original price)
- Look for discounted price, offer price, or deal price
- Return ONLY the numeric value in INR (no currency symbols)
- If multiple prices exist, return the lowest/offer price
- If price not found, return "NOT_FOUND"

Example responses:
- "79999"
- "1299"
- "NOT_FOUND"

Price:`;

    const command = new InvokeModelCommand({
      modelId: BEDROCK_MODEL, // Nova Lite: 13x cheaper than Pro!
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
          max_new_tokens: 50,
          temperature: 0.1,
          top_p: 0.9
        }
      })
    });

    const response = await bedrockClient.send(command);
    const responseBody = JSON.parse(new TextDecoder().decode(response.body));
    const aiResponse = responseBody.output.message.content[0].text.trim();

    console.log(`AI extraction response for ${competitor}: ${aiResponse}`);

    // Parse the response
    if (aiResponse === "NOT_FOUND" || aiResponse.includes("NOT_FOUND")) {
      return null;
    }

    // Extract numeric value
    const priceMatch = aiResponse.match(/(\d+(?:,\d+)*(?:\.\d+)?)/);
    if (priceMatch) {
      const price = parseFloat(priceMatch[1].replace(/,/g, ""));
      if (!isNaN(price) && price > 0 && price < 10000000) {
        console.log(`AI successfully extracted price for ${competitor}: ₹${price}`);
        return price;
      }
    }

    return null;
  } catch (error) {
    console.error(`AI price extraction error for ${competitor}:`, error.message);
    return null;
  }
}

// Generate realistic demo price for hackathon
function generateDemoPrice(competitor) {
  // Base price with variation by competitor
  const basePrice = 79900;
  const competitorLower = competitor.toLowerCase();
  
  let variation = 0;
  if (competitorLower.includes("amazon")) {
    variation = -2500; // Amazon typically cheaper
  } else if (competitorLower.includes("flipkart")) {
    variation = 1500; // Flipkart slightly higher
  } else if (competitorLower.includes("myntra")) {
    variation = 3000;
  } else if (competitorLower.includes("ajio")) {
    variation = 2000;
  } else {
    // Random variation for other competitors
    variation = Math.floor(Math.random() * 5000) - 2000;
  }
  
  const finalPrice = basePrice + variation;
  console.log(`Generated demo price for ${competitor}: ₹${finalPrice}`);
  return finalPrice;
}

// Extract price from Amazon.in
function extractAmazonPrice(html) {
  // Amazon price patterns
  const patterns = [
    /<span class="a-price-whole">([0-9,]+)<\/span>/,
    /<span class="a-price-whole">₹([0-9,]+)<\/span>/,
    /"priceAmount":([0-9.]+)/,
    /₹\s*([0-9,]+(?:\.[0-9]{2})?)/,
  ];

  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match) {
      const priceStr = match[1].replace(/,/g, "");
      const price = parseFloat(priceStr);
      if (!isNaN(price) && price > 0) {
        console.log(`Amazon price found: ₹${price}`);
        return price;
      }
    }
  }

  return null;
}

// Extract price from Flipkart
function extractFlipkartPrice(html) {
  // Flipkart price patterns
  const patterns = [
    /<div class="[^"]*_30jeq3[^"]*">₹([0-9,]+)<\/div>/,
    /<div class="[^"]*Nx9bqj[^"]*">₹([0-9,]+)<\/div>/,
    /₹([0-9,]+)/,
  ];

  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match) {
      const priceStr = match[1].replace(/,/g, "");
      const price = parseFloat(priceStr);
      if (!isNaN(price) && price > 0) {
        console.log(`Flipkart price found: ₹${price}`);
        return price;
      }
    }
  }

  return null;
}

// Generic price extraction
function extractGenericPrice(html) {
  // Look for rupee symbol followed by numbers
  const patterns = [
    /₹\s*([0-9,]+(?:\.[0-9]{2})?)/,
    /Rs\.?\s*([0-9,]+(?:\.[0-9]{2})?)/i,
    /INR\s*([0-9,]+(?:\.[0-9]{2})?)/i,
  ];

  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match) {
      const priceStr = match[1].replace(/,/g, "");
      const price = parseFloat(priceStr);
      if (!isNaN(price) && price > 0 && price < 10000000) {
        console.log(`Generic price found: ₹${price}`);
        return price;
      }
    }
  }

  return null;
}

// Store price in DynamoDB
async function storePriceHistory(productId, competitor, price, url, timestamp) {
  // Create a unique ID combining productId and competitor
  const id = `${productId}#${competitor}`;
  const timestampNum = Date.parse(timestamp);
  
  const params = {
    TableName: "RetailMind-PriceHistory",
    Item: {
      id: id,
      timestamp: timestampNum,
      productId: productId,
      competitor: competitor,
      price: price,
      url: url,
      scrapedAt: timestamp,
    },
  };

  await dynamodb.send(new PutCommand(params));
  console.log(`Stored price history for ${productId} - ${competitor}: ₹${price}`);
}
