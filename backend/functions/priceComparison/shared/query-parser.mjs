// AI-Powered Query Parser with Strict Attribute Extraction
// Extracts structured product attributes from natural language queries

/**
 * Parse user query into structured attributes
 * @param {string} query - User search query like "Haier Refrigerator 15L"
 * @returns {Object} Structured attributes: { brand, category, capacity, model, attributes }
 */
export function parseUserQuery(query) {
  if (!query || typeof query !== 'string') {
    return { brand: null, category: null, capacity: null, model: null, attributes: {} };
  }

  const normalized = query.trim().toLowerCase();
  const original = query.trim();
  
  // Extract brand (common Indian brands)
  const brand = extractBrand(normalized);
  
  // Extract category
  const category = extractCategory(normalized);
  
  // Extract model numbers/codes
  const model = extractModel(original); // Use original case for model
  
  // Extract all product-specific attributes
  const attributes = extractAllAttributes(normalized, original, category);
  
  // Legacy capacity field for backward compatibility
  const capacity = attributes.capacity || null;
  
  console.log('[QUERY-PARSER] Parsed query', {
    original: query,
    brand,
    category,
    capacity,
    model,
    attributes
  });
  
  return {
    brand,
    category,
    capacity,
    model,
    attributes,
    originalQuery: query
  };
}

/**
 * Extract capacity from text with multiple format support
 * Handles: 15L, 15 L, 15 litre, 15 ltr, 15 liter, 15-litre
 * @param {string} text - Text to extract capacity from
 * @returns {string|null} Normalized capacity like "15L" or null
 */
export function extractCapacity(text) {
  if (!text) return null;
  
  const normalized = text.toLowerCase().replace(/[-_]/g, ' ');
  
  // Pattern 1: Number followed by L/litre/liter/ltr (with optional space)
  const patterns = [
    /(\d+(?:\.\d+)?)\s*l(?:itre|iter|tr)?s?\b/i,  // 15L, 15 litre, 15 ltr
    /(\d+(?:\.\d+)?)\s*(?:litre|liter|ltr)s?\b/i, // 15 litre, 15 liter
    /\b(\d+(?:\.\d+)?)\s*l\b/i                      // 15 L (word boundary)
  ];
  
  for (const pattern of patterns) {
    const match = normalized.match(pattern);
    if (match && match[1]) {
      const value = parseFloat(match[1]);
      if (value > 0 && value < 10000) { // Sanity check
        return `${value}L`;
      }
    }
  }
  
  return null;
}

/**
 * Extract weight (kg, g, grams, kilograms)
 * @param {string} text - Text to extract weight from
 * @returns {string|null} Normalized weight like "5kg" or "500g"
 */
export function extractWeight(text) {
  if (!text) return null;
  
  const patterns = [
    { regex: /(\d+(?:\.\d+)?)\s*kg\b/i, unit: 'kg' },
    { regex: /(\d+(?:\.\d+)?)\s*kilogram?s?\b/i, unit: 'kg' },
    { regex: /(\d+(?:\.\d+)?)\s*g\b/i, unit: 'g' },
    { regex: /(\d+(?:\.\d+)?)\s*gram?s?\b/i, unit: 'g' }
  ];
  
  for (const { regex, unit } of patterns) {
    const match = text.match(regex);
    if (match && match[1]) {
      const value = parseFloat(match[1]);
      if (value > 0 && value < 100000) {
        return `${value}${unit}`;
      }
    }
  }
  
  return null;
}

/**
 * Extract screen size (inches, cm)
 * @param {string} text - Text to extract screen size from
 * @returns {string|null} Normalized size like "55inch" or "140cm"
 */
export function extractScreenSize(text) {
  if (!text) return null;
  
  const patterns = [
    { regex: /(\d+(?:\.\d+)?)\s*(?:inch|in|")\b/i, unit: 'inch' },
    { regex: /(\d+(?:\.\d+)?)\s*cm\b/i, unit: 'cm' }
  ];
  
  for (const { regex, unit } of patterns) {
    const match = text.match(regex);
    if (match && match[1]) {
      const value = parseFloat(match[1]);
      if (value > 5 && value < 500) { // Reasonable screen sizes
        return `${value}${unit}`;
      }
    }
  }
  
  return null;
}

/**
 * Extract storage capacity (GB, TB, MB)
 * @param {string} text - Text to extract storage from
 * @returns {string|null} Normalized storage like "256GB" or "1TB"
 */
export function extractStorage(text) {
  if (!text) return null;
  
  const patterns = [
    { regex: /(\d+)\s*tb\b/i, unit: 'TB' },
    { regex: /(\d+)\s*gb\b/i, unit: 'GB' },
    { regex: /(\d+)\s*mb\b/i, unit: 'MB' }
  ];
  
  for (const { regex, unit } of patterns) {
    const match = text.match(regex);
    if (match && match[1]) {
      const value = parseInt(match[1]);
      if (value > 0) {
        return `${value}${unit}`;
      }
    }
  }
  
  return null;
}

/**
 * Extract RAM (GB)
 * @param {string} text - Text to extract RAM from
 * @returns {string|null} Normalized RAM like "8GB RAM"
 */
export function extractRAM(text) {
  if (!text) return null;
  
  const patterns = [
    /(\d+)\s*gb\s*ram\b/i,
    /ram\s*(\d+)\s*gb\b/i,
    /(\d+)\s*gb\s*memory\b/i
  ];
  
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      const value = parseInt(match[1]);
      if (value > 0 && value <= 128) { // Reasonable RAM sizes
        return `${value}GB`;
      }
    }
  }
  
  return null;
}

/**
 * Extract AC tonnage (ton)
 * @param {string} text - Text to extract tonnage from
 * @returns {string|null} Normalized tonnage like "1.5ton"
 */
export function extractTonnage(text) {
  if (!text) return null;
  
  const patterns = [
    /(\d+(?:\.\d+)?)\s*ton\b/i,
    /(\d+(?:\.\d+)?)\s*tr\b/i // TR = ton of refrigeration
  ];
  
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      const value = parseFloat(match[1]);
      if (value > 0 && value <= 10) { // Reasonable AC tonnage
        return `${value}ton`;
      }
    }
  }
  
  return null;
}

/**
 * Extract star rating (energy efficiency)
 * @param {string} text - Text to extract star rating from
 * @returns {number|null} Star rating (1-5)
 */
export function extractStarRating(text) {
  if (!text) return null;
  
  const patterns = [
    /(\d+)\s*star/i,
    /(\d+)\s*\*/i
  ];
  
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      const value = parseInt(match[1]);
      if (value >= 1 && value <= 5) {
        return value;
      }
    }
  }
  
  return null;
}

/**
 * Extract wattage (W, watts)
 * @param {string} text - Text to extract wattage from
 * @returns {string|null} Normalized wattage like "1500W"
 */
export function extractWattage(text) {
  if (!text) return null;
  
  const patterns = [
    /(\d+)\s*w\b/i,
    /(\d+)\s*watt?s?\b/i
  ];
  
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      const value = parseInt(match[1]);
      if (value > 0 && value < 100000) {
        return `${value}W`;
      }
    }
  }
  
  return null;
}

/**
 * Extract voltage (V, volts)
 * @param {string} text - Text to extract voltage from
 * @returns {string|null} Normalized voltage like "220V"
 */
export function extractVoltage(text) {
  if (!text) return null;
  
  const patterns = [
    /(\d+)\s*v\b/i,
    /(\d+)\s*volt?s?\b/i
  ];
  
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      const value = parseInt(match[1]);
      if (value > 0 && value < 1000) {
        return `${value}V`;
      }
    }
  }
  
  return null;
}

/**
 * Extract speed (RPM, Hz)
 * @param {string} text - Text to extract speed from
 * @returns {string|null} Normalized speed like "1400RPM"
 */
export function extractSpeed(text) {
  if (!text) return null;
  
  const patterns = [
    { regex: /(\d+)\s*rpm\b/i, unit: 'RPM' },
    { regex: /(\d+)\s*hz\b/i, unit: 'Hz' }
  ];
  
  for (const { regex, unit } of patterns) {
    const match = text.match(regex);
    if (match && match[1]) {
      const value = parseInt(match[1]);
      if (value > 0) {
        return `${value}${unit}`;
      }
    }
  }
  
  return null;
}

/**
 * Extract resolution (HD, FHD, 4K, 1080p, etc.)
 * @param {string} text - Text to extract resolution from
 * @returns {string|null} Normalized resolution
 */
export function extractResolution(text) {
  if (!text) return null;
  
  const resolutions = [
    { pattern: /\b4k\b/i, value: '4K' },
    { pattern: /\b8k\b/i, value: '8K' },
    { pattern: /\buhd\b/i, value: 'UHD' },
    { pattern: /\bfull\s*hd\b/i, value: 'Full HD' },
    { pattern: /\bfhd\b/i, value: 'FHD' },
    { pattern: /\bhd\b/i, value: 'HD' },
    { pattern: /\b1080p\b/i, value: '1080p' },
    { pattern: /\b720p\b/i, value: '720p' },
    { pattern: /\b2160p\b/i, value: '2160p' }
  ];
  
  for (const { pattern, value } of resolutions) {
    if (pattern.test(text)) {
      return value;
    }
  }
  
  return null;
}

/**
 * Extract connectivity (WiFi, Bluetooth, 5G, etc.)
 * @param {string} text - Text to extract connectivity from
 * @returns {Array<string>} Array of connectivity types
 */
export function extractConnectivity(text) {
  if (!text) return [];
  
  const types = [];
  const connectivityTypes = [
    { pattern: /\b5g\b/i, value: '5G' },
    { pattern: /\b4g\b/i, value: '4G' },
    { pattern: /\bwifi\b/i, value: 'WiFi' },
    { pattern: /\bwi-fi\b/i, value: 'WiFi' },
    { pattern: /\bbluetooth\b/i, value: 'Bluetooth' },
    { pattern: /\bnfc\b/i, value: 'NFC' }
  ];
  
  for (const { pattern, value } of connectivityTypes) {
    if (pattern.test(text)) {
      types.push(value);
    }
  }
  
  return types.length > 0 ? types : null;
}

/**
 * Extract dimensions (LxWxH format)
 * @param {string} text - Text to extract dimensions from
 * @returns {string|null} Dimensions like "60x40x80cm"
 */
export function extractDimensions(text) {
  if (!text) return null;
  
  const pattern = /(\d+)\s*x\s*(\d+)\s*x\s*(\d+)\s*(cm|mm|inch)?/i;
  const match = text.match(pattern);
  
  if (match) {
    const unit = match[4] || 'cm';
    return `${match[1]}x${match[2]}x${match[3]}${unit}`;
  }
  
  return null;
}

/**
 * Extract size (clothing, general)
 * @param {string} text - Text to extract size from
 * @returns {string|null} Size like "XL", "42"
 */
export function extractSize(text) {
  if (!text) return null;
  
  // Clothing sizes
  const clothingSizeMatch = text.match(/\b(xs|s|m|l|xl|xxl|xxxl)\b/i);
  if (clothingSizeMatch) {
    return clothingSizeMatch[1].toUpperCase();
  }
  
  // Numeric sizes (shoes, clothing)
  const numericSizeMatch = text.match(/\bsize\s*(\d+)\b/i);
  if (numericSizeMatch) {
    return numericSizeMatch[1];
  }
  
  return null;
}

/**
 * Extract color
 * @param {string} text - Text to extract color from
 * @returns {string|null} Color name
 */
export function extractColor(text) {
  if (!text) return null;
  
  const colors = [
    'black', 'white', 'silver', 'grey', 'gray', 'red', 'blue', 'green',
    'yellow', 'orange', 'purple', 'pink', 'brown', 'gold', 'rose gold',
    'space gray', 'midnight', 'starlight', 'graphite', 'sierra blue'
  ];
  
  // Check for multi-word colors first
  const multiWordColors = colors.filter(c => c.includes(' '));
  for (const color of multiWordColors) {
    if (text.includes(color)) {
      return capitalizeWords(color);
    }
  }
  
  // Check single-word colors
  const words = text.split(/\s+/);
  for (const word of words) {
    if (colors.includes(word)) {
      return capitalizeWords(word);
    }
  }
  
  return null;
}

/**
 * Extract material
 * @param {string} text - Text to extract material from
 * @returns {string|null} Material name
 */
export function extractMaterial(text) {
  if (!text) return null;
  
  const materials = [
    'stainless steel', 'plastic', 'glass', 'metal', 'wood', 'leather',
    'fabric', 'cotton', 'polyester', 'aluminum', 'copper', 'brass',
    'ceramic', 'silicone', 'rubber'
  ];
  
  // Check for multi-word materials first
  const multiWordMaterials = materials.filter(m => m.includes(' '));
  for (const material of multiWordMaterials) {
    if (text.includes(material)) {
      return capitalizeWords(material);
    }
  }
  
  // Check single-word materials
  const words = text.split(/\s+/);
  for (const word of words) {
    if (materials.includes(word)) {
      return capitalizeWords(word);
    }
  }
  
  return null;
}

/**
 * Extract brand from query
 * @param {string} text - Normalized query text
 * @returns {string|null} Brand name or null
 */
function extractBrand(text) {
  const brands = [
    // Refrigerators & Appliances
    'haier', 'samsung', 'lg', 'whirlpool', 'godrej', 'bosch', 'ifb',
    'voltas', 'blue star', 'hitachi', 'panasonic', 'videocon',
    
    // Electronics
    'sony', 'dell', 'hp', 'lenovo', 'asus', 'acer', 'apple', 'mi', 'xiaomi',
    'realme', 'oppo', 'vivo', 'oneplus', 'motorola', 'nokia',
    
    // Home Appliances
    'philips', 'bajaj', 'orient', 'crompton', 'havells', 'usha',
    'prestige', 'pigeon', 'butterfly', 'kent', 'aquaguard',
    
    // Fashion & Lifestyle
    'nike', 'adidas', 'puma', 'reebok', 'woodland', 'bata', 'liberty'
  ];
  
  // Check for multi-word brands first
  const multiWordBrands = brands.filter(b => b.includes(' '));
  for (const brand of multiWordBrands) {
    if (text.includes(brand)) {
      return capitalizeWords(brand);
    }
  }
  
  // Check single-word brands
  const words = text.split(/\s+/);
  for (const word of words) {
    if (brands.includes(word)) {
      return capitalizeWords(word);
    }
  }
  
  return null;
}

/**
 * Extract product category
 * @param {string} text - Normalized query text
 * @returns {string|null} Category name or null
 */
function extractCategory(text) {
  const categories = {
    // Appliances
    'refrigerator': ['refrigerator', 'fridge', 'ref'],
    'washing machine': ['washing machine', 'washer', 'washing'],
    'air conditioner': ['air conditioner', 'ac', 'airconditioner'],
    'microwave': ['microwave', 'oven'],
    'television': ['television', 'tv', 'smart tv'],
    'fan': ['fan', 'ceiling fan', 'table fan'],
    'cooler': ['cooler', 'air cooler'],
    'water purifier': ['water purifier', 'purifier', 'ro'],
    
    // Electronics
    'laptop': ['laptop', 'notebook'],
    'mobile': ['mobile', 'phone', 'smartphone'],
    'tablet': ['tablet', 'ipad'],
    'headphone': ['headphone', 'earphone', 'earbud'],
    'speaker': ['speaker', 'bluetooth speaker'],
    
    // Kitchen
    'mixer': ['mixer', 'grinder', 'mixer grinder'],
    'kettle': ['kettle', 'electric kettle'],
    'toaster': ['toaster'],
    'induction': ['induction', 'induction cooktop']
  };
  
  for (const [category, keywords] of Object.entries(categories)) {
    for (const keyword of keywords) {
      if (text.includes(keyword)) {
        return capitalizeWords(category);
      }
    }
  }
  
  return null;
}

/**
 * Extract model number/code from query
 * @param {string} text - Original query text (preserves case)
 * @returns {string|null} Model number or null
 */
function extractModel(text) {
  if (!text) return null;
  
  // Pattern: Alphanumeric with at least one digit
  // Examples: HRF-2674BS, WM-1234, 15L-Pro, ABC123
  const patterns = [
    /\b([A-Z]{2,}[-_]?\d+[A-Z0-9-_]*)\b/i,  // HRF-2674BS, WM1234
    /\b(\d+[A-Z]+\d*)\b/i,                   // 15L, 2674BS
    /\b([A-Z]+\d+[A-Z]*)\b/i                 // ABC123, WM1234
  ];
  
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      const model = match[1].trim();
      // Exclude if it's just a capacity
      if (!/^\d+L$/i.test(model)) {
        return model;
      }
    }
  }
  
  return null;
}

/**
 * Extract all product-specific attributes based on category
 * @param {string} normalized - Normalized query text
 * @param {string} original - Original query text
 * @param {string} category - Detected category
 * @returns {Object} All extracted attributes
 */
function extractAllAttributes(normalized, original, category) {
  const attributes = {};
  
  // Universal attributes
  attributes.capacity = extractCapacity(normalized);
  attributes.weight = extractWeight(normalized);
  attributes.size = extractSize(normalized);
  attributes.color = extractColor(normalized);
  attributes.material = extractMaterial(normalized);
  
  // Electronics & Appliances
  attributes.screenSize = extractScreenSize(normalized);
  attributes.storage = extractStorage(normalized);
  attributes.ram = extractRAM(normalized);
  attributes.tonnage = extractTonnage(normalized);
  attributes.starRating = extractStarRating(normalized);
  attributes.wattage = extractWattage(normalized);
  attributes.voltage = extractVoltage(normalized);
  
  // Specific product attributes
  attributes.speed = extractSpeed(normalized);
  attributes.resolution = extractResolution(normalized);
  attributes.connectivity = extractConnectivity(normalized);
  
  // Dimensions
  attributes.dimensions = extractDimensions(normalized);
  
  // Remove null/undefined values
  Object.keys(attributes).forEach(key => {
    if (attributes[key] === null || attributes[key] === undefined) {
      delete attributes[key];
    }
  });
  
  return attributes;
}

/**
 * Capitalize first letter of each word
 * @param {string} str - String to capitalize
 * @returns {string} Capitalized string
 */
function capitalizeWords(str) {
  return str.split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Calculate match score between parsed query and product result
 * @param {Object} parsedQuery - Parsed query attributes
 * @param {Object} productResult - Product result from SERPAPI
 * @returns {number} Match score (0-100)
 */
export function calculateMatchScore(parsedQuery, productResult) {
  let score = 0;
  let maxScore = 0;
  
  const productText = `${productResult.title || ''} ${productResult.snippet || ''}`.toLowerCase();
  
  // Extract all attributes from product
  const productAttrs = extractAllAttributes(productText, productText, parsedQuery.category);
  
  // Brand match (25 points)
  maxScore += 25;
  if (parsedQuery.brand) {
    if (productText.includes(parsedQuery.brand.toLowerCase())) {
      score += 25;
    }
  } else {
    score += 25; // No brand requirement
  }
  
  // Category match (15 points)
  maxScore += 15;
  if (parsedQuery.category) {
    if (productText.includes(parsedQuery.category.toLowerCase())) {
      score += 15;
    }
  } else {
    score += 15; // No category requirement
  }
  
  // Model match (10 points)
  maxScore += 10;
  if (parsedQuery.model) {
    if (productText.includes(parsedQuery.model.toLowerCase())) {
      score += 10;
    }
  } else {
    score += 10; // No model requirement
  }
  
  // Attribute matching (50 points total - distributed across all attributes)
  const queryAttrs = parsedQuery.attributes || {};
  const attrKeys = Object.keys(queryAttrs).filter(k => queryAttrs[k]);
  
  if (attrKeys.length > 0) {
    const pointsPerAttr = 50 / attrKeys.length;
    maxScore += 50;
    
    for (const key of attrKeys) {
      const queryValue = queryAttrs[key];
      const productValue = productAttrs[key];
      
      if (productValue) {
        // Exact match
        if (queryValue === productValue) {
          score += pointsPerAttr;
        } else if (typeof queryValue === 'string' && typeof productValue === 'string') {
          // Check for approximate match (e.g., 15L vs 14L within tolerance)
          const tolerance = checkAttributeTolerance(key, queryValue, productValue);
          if (tolerance > 0) {
            score += pointsPerAttr * tolerance; // Partial points for approximate match
          }
        }
      }
    }
  } else {
    // No specific attributes required, give full points
    score += 50;
    maxScore += 50;
  }
  
  return Math.round((score / maxScore) * 100);
}

/**
 * Check if two attribute values are within acceptable tolerance
 * @param {string} attrKey - Attribute key (capacity, weight, etc.)
 * @param {string} queryValue - Query attribute value
 * @param {string} productValue - Product attribute value
 * @returns {number} Tolerance score (0-1), 1 = exact match, 0 = no match
 */
function checkAttributeTolerance(attrKey, queryValue, productValue) {
  // Extract numeric values
  const queryNum = parseFloat(queryValue);
  const productNum = parseFloat(productValue);
  
  if (!isNaN(queryNum) && !isNaN(productNum)) {
    const diff = Math.abs(queryNum - productNum);
    const tolerance = queryNum * 0.1; // 10% tolerance
    
    if (diff === 0) return 1.0; // Exact match
    if (diff <= tolerance) return 0.5; // Within tolerance
  }
  
  // String comparison for non-numeric attributes
  if (queryValue.toLowerCase() === productValue.toLowerCase()) {
    return 1.0;
  }
  
  return 0; // No match
}

/**
 * Filter results based on strict attribute matching
 * @param {Object} parsedQuery - Parsed query attributes
 * @param {Array} results - SERPAPI results
 * @param {Object} options - Filtering options
 * @returns {Array} Filtered and scored results
 */
export function filterResultsStrict(parsedQuery, results, options = {}) {
  const {
    strictCapacity = true,      // Require exact capacity match
    strictAttributes = true,     // Require exact attribute matches
    allowTolerance = false,      // Allow ±10% tolerance for numeric values
    minScore = 60                // Minimum match score (0-100)
  } = options;
  
  console.log('[FILTER] Starting strict filtering', {
    totalResults: results.length,
    parsedQuery,
    options
  });
  
  const scoredResults = results.map(result => {
    const productText = `${result.title || ''} ${result.snippet || ''}`.toLowerCase();
    const productAttrs = extractAllAttributes(productText, productText, parsedQuery.category);
    const matchScore = calculateMatchScore(parsedQuery, result);
    
    // Check each attribute for matching
    const attributeMatches = {};
    let allCriticalMatch = true;
    let hasCriticalMismatch = false;
    
    const queryAttrs = parsedQuery.attributes || {};
    Object.keys(queryAttrs).forEach(key => {
      const queryValue = queryAttrs[key];
      const productValue = productAttrs[key];
      
      if (queryValue) {
        if (productValue === queryValue) {
          attributeMatches[key] = 'exact';
        } else if (allowTolerance && productValue) {
          const tolerance = checkAttributeTolerance(key, queryValue, productValue);
          if (tolerance >= 0.5) {
            attributeMatches[key] = 'approximate';
          } else {
            attributeMatches[key] = 'mismatch';
            if (isCriticalAttribute(key)) {
              allCriticalMatch = false;
              hasCriticalMismatch = true;
            }
          }
        } else {
          // If product doesn't have this attribute, mark as missing (not mismatch)
          attributeMatches[key] = productValue ? 'mismatch' : 'missing';
          if (isCriticalAttribute(key) && productValue) {
            // Only fail critical match if there's an actual conflicting value
            allCriticalMatch = false;
            hasCriticalMismatch = true;
          }
        }
      }
    });
    
    // Determine overall match type based on critical attributes only
    let matchType = 'exact';
    if (hasCriticalMismatch) {
      // Only mark as mismatch if there's a critical attribute conflict
      matchType = 'mismatch';
    } else if (Object.values(attributeMatches).some(v => v === 'mismatch')) {
      // Non-critical mismatches are treated as approximate
      matchType = 'approximate';
    } else if (Object.values(attributeMatches).includes('approximate')) {
      matchType = 'approximate';
    } else if (Object.values(attributeMatches).includes('missing')) {
      // Missing attributes don't downgrade the match if score is good
      matchType = 'approximate';
    }
    
    // Legacy capacity fields for backward compatibility
    const productCapacity = productAttrs.capacity || null;
    const capacityMatch = parsedQuery.capacity ? 
      (productCapacity === parsedQuery.capacity || 
       (allowTolerance && checkAttributeTolerance('capacity', parsedQuery.capacity, productCapacity) >= 0.5)) : 
      true;
    
    console.log('[FILTER] Product evaluated', {
      title: result.title?.substring(0, 50),
      queryAttrs: Object.keys(queryAttrs).length,
      productAttrs: Object.keys(productAttrs).length,
      attributeMatches,
      matchType,
      matchScore,
      hasCriticalMismatch,
      accepted: matchScore >= minScore && (!strictAttributes || allCriticalMatch)
    });
    
    return {
      ...result,
      matchScore,
      matchType: matchScore >= 80 && !hasCriticalMismatch ? 'exact' : matchType, // Override to exact if high score and no critical conflicts
      extractedCapacity: productCapacity,
      capacityMatch,
      extractedAttributes: productAttrs,
      attributeMatches
    };
  });
  
  // Filter based on criteria
  let filtered = scoredResults.filter(result => {
    // Must meet minimum score
    if (result.matchScore < minScore) return false;
    
    // If strict attributes enabled, must match all critical attributes
    if (strictAttributes) {
      const queryAttrs = parsedQuery.attributes || {};
      for (const key of Object.keys(queryAttrs)) {
        if (isCriticalAttribute(key)) {
          const match = result.attributeMatches[key];
          if (match === 'mismatch' || (!allowTolerance && match === 'approximate')) {
            return false;
          }
        }
      }
    }
    
    // Legacy: If strict capacity is enabled, must have exact or approximate match
    if (strictCapacity && parsedQuery.capacity && !result.capacityMatch) {
      return false;
    }
    
    return true;
  });
  
  // Sort by match score (highest first)
  filtered.sort((a, b) => b.matchScore - a.matchScore);
  
  console.log('[FILTER] Filtering complete', {
    originalCount: results.length,
    filteredCount: filtered.length,
    rejectedCount: results.length - filtered.length
  });
  
  return filtered;
}

/**
 * Check if an attribute is critical for matching
 * @param {string} attrKey - Attribute key
 * @returns {boolean} True if critical
 */
function isCriticalAttribute(attrKey) {
  const criticalAttrs = [
    'capacity', 'weight', 'screenSize', 'storage', 'ram', 
    'tonnage', 'starRating', 'resolution'
  ];
  return criticalAttrs.includes(attrKey);
}
