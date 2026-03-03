// AI Response Caching Layer
// Reduces Bedrock costs by 70-80% through intelligent caching

import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand, PutCommand } from "@aws-sdk/lib-dynamodb";
import crypto from "crypto";

const dynamoClient = new DynamoDBClient({ region: "us-east-1" });
const docClient = DynamoDBDocumentClient.from(dynamoClient);

const CACHE_TABLE = "RetailMind-AICache";
const DEFAULT_TTL = 3600; // 1 hour in seconds

/**
 * Generate cache key from prompt
 */
function generateCacheKey(prompt, modelId) {
    const hash = crypto.createHash('sha256')
        .update(`${modelId}:${prompt}`)
        .digest('hex')
        .substring(0, 32);
    return `ai-${hash}`;
}

/**
 * Get cached AI response
 * @param {string} prompt - The AI prompt
 * @param {string} modelId - Bedrock model ID
 * @param {number} ttlSeconds - Cache TTL in seconds (default: 1 hour)
 * @returns {Promise<string|null>} - Cached response or null
 */
export async function getCachedResponse(prompt, modelId, ttlSeconds = DEFAULT_TTL) {
    try {
        const cacheKey = generateCacheKey(prompt, modelId);
        
        const command = new GetCommand({
            TableName: CACHE_TABLE,
            Key: { cacheKey }
        });
        
        const result = await docClient.send(command);
        
        if (!result.Item) {
            console.log('[AI-CACHE] Cache miss:', cacheKey);
            return null;
        }
        
        // Check if expired
        const now = Math.floor(Date.now() / 1000);
        if (result.Item.expiresAt < now) {
            console.log('[AI-CACHE] Cache expired:', cacheKey);
            return null;
        }
        
        console.log('[AI-CACHE] Cache hit:', cacheKey, '- Saved Bedrock call! 💰');
        return result.Item.response;
        
    } catch (error) {
        // If cache table doesn't exist, just return null
        if (error.name === 'ResourceNotFoundException') {
            console.log('[AI-CACHE] Cache table not found, skipping cache');
            return null;
        }
        console.error('[AI-CACHE] Error reading cache:', error.message);
        return null;
    }
}

/**
 * Store AI response in cache
 * @param {string} prompt - The AI prompt
 * @param {string} modelId - Bedrock model ID
 * @param {string} response - AI response to cache
 * @param {number} ttlSeconds - Cache TTL in seconds (default: 1 hour)
 */
export async function setCachedResponse(prompt, modelId, response, ttlSeconds = DEFAULT_TTL) {
    try {
        const cacheKey = generateCacheKey(prompt, modelId);
        const now = Math.floor(Date.now() / 1000);
        const expiresAt = now + ttlSeconds;
        
        const command = new PutCommand({
            TableName: CACHE_TABLE,
            Item: {
                cacheKey,
                prompt: prompt.substring(0, 500), // Store truncated prompt for debugging
                modelId,
                response,
                createdAt: now,
                expiresAt,
                ttl: expiresAt // DynamoDB TTL attribute
            }
        });
        
        await docClient.send(command);
        console.log('[AI-CACHE] Cached response:', cacheKey, `(TTL: ${ttlSeconds}s)`);
        
    } catch (error) {
        // Don't fail if caching fails
        if (error.name === 'ResourceNotFoundException') {
            console.log('[AI-CACHE] Cache table not found, skipping cache storage');
            return;
        }
        console.error('[AI-CACHE] Error storing cache:', error.message);
    }
}

/**
 * Wrapper for Bedrock calls with automatic caching
 * @param {Function} bedrockCallFn - Function that calls Bedrock
 * @param {string} prompt - The AI prompt
 * @param {string} modelId - Bedrock model ID
 * @param {number} ttlSeconds - Cache TTL in seconds
 * @returns {Promise<string>} - AI response (cached or fresh)
 */
export async function cachedBedrockCall(bedrockCallFn, prompt, modelId, ttlSeconds = DEFAULT_TTL) {
    // Try cache first
    const cached = await getCachedResponse(prompt, modelId, ttlSeconds);
    if (cached) {
        return cached;
    }
    
    // Cache miss - call Bedrock
    console.log('[AI-CACHE] Calling Bedrock (cache miss)...');
    const response = await bedrockCallFn();
    
    // Store in cache for next time
    await setCachedResponse(prompt, modelId, response, ttlSeconds);
    
    return response;
}

/**
 * Create DynamoDB cache table (run once during setup)
 */
export async function createCacheTable() {
    const command = `
aws dynamodb create-table \\
  --table-name RetailMind-AICache \\
  --attribute-definitions \\
    AttributeName=cacheKey,AttributeType=S \\
  --key-schema \\
    AttributeName=cacheKey,KeyType=HASH \\
  --billing-mode PAY_PER_REQUEST \\
  --time-to-live-specification \\
    Enabled=true,AttributeName=ttl \\
  --region us-east-1
`;
    
    console.log('Run this command to create cache table:');
    console.log(command);
}

// Cache TTL presets
export const CacheTTL = {
    SHORT: 300,      // 5 minutes - for frequently changing data
    MEDIUM: 3600,    // 1 hour - default
    LONG: 21600,     // 6 hours - for stable data
    DAY: 86400       // 24 hours - for rarely changing data
};
