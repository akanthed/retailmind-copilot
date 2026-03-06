// AI-Powered Result Re-ranking using Amazon Bedrock
// Provides intelligent relevance scoring and filtering

import { BedrockRuntimeClient, InvokeModelCommand } from "@aws-sdk/client-bedrock-runtime";

/**
 * Re-rank search results using AI for better relevance
 * @param {string} userQuery - Original user query
 * @param {Object} parsedQuery - Parsed query attributes
 * @param {Array} results - Search results to re-rank
 * @param {Object} options - Configuration options
 * @returns {Promise<Array>} Re-ranked results with AI scores
 */
export async function rerankWithAI(userQuery, parsedQuery, results, options = {}) {
  const {
    modelId = 'us.amazon.nova-micro-v1:0',
    region = 'us-east-1',
    maxResults = 10,
    logger = console
  } = options;
  
  if (!results || results.length === 0) {
    logger.warn('[AI-RERANK] No results to re-rank');
    return [];
  }
  
  try {
    const client = new BedrockRuntimeClient({ region });
    
    // Prepare product summaries for AI
    const productSummaries = results.slice(0, 20).map((result, index) => ({
      id: index,
      title: result.title || '',
      price: result.price || 0,
      platform: result.platform || '',
      extractedCapacity: result.extractedCapacity || 'unknown'
    }));
    
    const prompt = buildRerankingPrompt(userQuery, parsedQuery, productSummaries);
    
    logger.log('[AI-RERANK] Sending request to Bedrock', {
      modelId,
      productCount: productSummaries.length,
      query: userQuery
    });
    
    const command = new InvokeModelCommand({
      modelId,
      contentType: 'application/json',
      accept: 'application/json',
      body: JSON.stringify({
        messages: [
          {
            role: 'user',
            content: [{ text: prompt }]
          }
        ],
        inferenceConfig: {
          max_new_tokens: 1000,
          temperature: 0.1,
          top_p: 0.9
        }
      })
    });
    
    const response = await client.send(command);
    const responseBody = JSON.parse(new TextDecoder().decode(response.body));
    const aiResponse = responseBody?.output?.message?.content?.[0]?.text || '';
    
    logger.log('[AI-RERANK] Received AI response', {
      responseLength: aiResponse.length
    });
    
    // Parse AI response
    const rankings = parseAIRankings(aiResponse, logger);
    
    if (rankings.length === 0) {
      logger.warn('[AI-RERANK] Failed to parse AI rankings, returning original order');
      return results.map((r, i) => ({ ...r, aiScore: 50, aiRank: i + 1 }));
    }
    
    // Apply AI rankings to results
    const reranked = applyAIRankings(results, rankings, logger);
    
    logger.log('[AI-RERANK] Re-ranking complete', {
      originalCount: results.length,
      rerankedCount: reranked.length,
      topResult: reranked[0]?.title?.substring(0, 50)
    });
    
    return reranked.slice(0, maxResults);
    
  } catch (error) {
    logger.error('[AI-RERANK] AI re-ranking failed', {
      message: error.message,
      stack: error.stack
    });
    
    // Fallback: return original results with default scores
    return results.map((r, i) => ({ ...r, aiScore: 50, aiRank: i + 1 }));
  }
}

/**
 * Build prompt for AI re-ranking
 * @param {string} userQuery - Original query
 * @param {Object} parsedQuery - Parsed attributes
 * @param {Array} products - Product summaries
 * @returns {string} Prompt for AI
 */
function buildRerankingPrompt(userQuery, parsedQuery, products) {
  const attributesStr = Object.entries(parsedQuery)
    .filter(([key, value]) => value && key !== 'originalQuery')
    .map(([key, value]) => `${key}: ${value}`)
    .join(', ');
  
  return `You are a product matching expert. Analyze these search results and rank them by relevance.

USER QUERY: "${userQuery}"
EXTRACTED ATTRIBUTES: ${attributesStr || 'none'}

CRITICAL MATCHING RULES:
1. CAPACITY MUST MATCH EXACTLY (e.g., 15L query should ONLY match 15L products, NOT 5L or 10L)
2. Brand should match if specified
3. Category should match if specified
4. Reject products with wrong capacity, even if other attributes match

PRODUCTS TO RANK:
${products.map((p, i) => `[${i}] ${p.title} | Price: ₹${p.price} | Platform: ${p.platform} | Capacity: ${p.extractedCapacity}`).join('\n')}

TASK:
1. For each product, assign a relevance score (0-100)
2. Score 90-100: Perfect match (all attributes match exactly)
3. Score 70-89: Good match (key attributes match)
4. Score 50-69: Partial match (some attributes match)
5. Score 0-49: Poor match or wrong capacity (REJECT)

OUTPUT FORMAT (JSON only, no explanation):
[
  {"id": 0, "score": 95, "reason": "Exact capacity and brand match"},
  {"id": 1, "score": 85, "reason": "Capacity matches, different brand"},
  {"id": 2, "score": 20, "reason": "Wrong capacity (10L instead of 15L) - REJECT"}
]

Return ONLY the JSON array, nothing else.`;
}

/**
 * Parse AI rankings from response
 * @param {string} aiResponse - AI response text
 * @param {Object} logger - Logger instance
 * @returns {Array} Parsed rankings
 */
function parseAIRankings(aiResponse, logger) {
  try {
    // Try to extract JSON array from response
    const jsonMatch = aiResponse.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      logger.warn('[AI-RERANK] No JSON array found in response');
      return [];
    }
    
    const rankings = JSON.parse(jsonMatch[0]);
    
    if (!Array.isArray(rankings)) {
      logger.warn('[AI-RERANK] Parsed result is not an array');
      return [];
    }
    
    // Validate rankings
    const valid = rankings.filter(r => 
      typeof r.id === 'number' && 
      typeof r.score === 'number' &&
      r.score >= 0 && 
      r.score <= 100
    );
    
    logger.log('[AI-RERANK] Parsed rankings', {
      total: rankings.length,
      valid: valid.length
    });
    
    return valid;
    
  } catch (error) {
    logger.error('[AI-RERANK] Failed to parse AI response', {
      message: error.message,
      response: aiResponse.substring(0, 200)
    });
    return [];
  }
}

/**
 * Apply AI rankings to results
 * @param {Array} results - Original results
 * @param {Array} rankings - AI rankings
 * @param {Object} logger - Logger instance
 * @returns {Array} Re-ranked results
 */
function applyAIRankings(results, rankings, logger) {
  // Create a map of id -> ranking
  const rankingMap = new Map();
  rankings.forEach(r => rankingMap.set(r.id, r));
  
  // Apply AI scores to results
  const scored = results.map((result, index) => {
    const ranking = rankingMap.get(index);
    
    if (ranking) {
      return {
        ...result,
        aiScore: ranking.score,
        aiReason: ranking.reason || '',
        aiRank: 0 // Will be set after sorting
      };
    }
    
    // Default score for unranked items
    return {
      ...result,
      aiScore: 50,
      aiReason: 'Not ranked by AI',
      aiRank: 0
    };
  });
  
  // Sort by AI score (highest first)
  scored.sort((a, b) => b.aiScore - a.aiScore);
  
  // Assign ranks
  scored.forEach((result, index) => {
    result.aiRank = index + 1;
  });
  
  // Filter out low-scoring results (below 50)
  const filtered = scored.filter(r => r.aiScore >= 50);
  
  logger.log('[AI-RERANK] Applied rankings', {
    totalScored: scored.length,
    afterFiltering: filtered.length,
    topScore: filtered[0]?.aiScore || 0
  });
  
  return filtered;
}

/**
 * Simple re-ranking without AI (fallback)
 * Uses rule-based scoring
 * @param {Object} parsedQuery - Parsed query attributes
 * @param {Array} results - Search results
 * @returns {Array} Re-ranked results
 */
export function rerankSimple(parsedQuery, results) {
  return results.map((result, index) => {
    let score = 50; // Base score
    
    const productText = `${result.title || ''} ${result.snippet || ''}`.toLowerCase();
    
    // Capacity match (most important)
    if (parsedQuery.capacity && result.extractedCapacity === parsedQuery.capacity) {
      score += 40;
    }
    
    // Brand match
    if (parsedQuery.brand && productText.includes(parsedQuery.brand.toLowerCase())) {
      score += 20;
    }
    
    // Category match
    if (parsedQuery.category && productText.includes(parsedQuery.category.toLowerCase())) {
      score += 15;
    }
    
    // Model match
    if (parsedQuery.model && productText.includes(parsedQuery.model.toLowerCase())) {
      score += 10;
    }
    
    // Price availability
    if (result.price && result.price > 0) {
      score += 5;
    }
    
    return {
      ...result,
      aiScore: Math.min(score, 100),
      aiReason: 'Rule-based scoring',
      aiRank: 0
    };
  }).sort((a, b) => b.aiScore - a.aiScore)
    .map((r, i) => ({ ...r, aiRank: i + 1 }));
}
