import https from "https";

const STOP_WORDS = new Set([
  "buy",
  "best",
  "latest",
  "new",
  "online",
  "price",
  "with",
  "for",
  "and",
  "the",
  "a",
  "an",
  "at",
  "from",
  "in",
  "india"
]);

export function createPriceService({ serpApiKey, logger = console, retries = 2, scraper = scrapeFallbackPrices } = {}) {
  return {
    extractPrices,
    fetchCompetitorPrices: async (rawQuery) => {
      const cleanedQuery = cleanSearchQuery(rawQuery);
      const compactQuery = buildCompactQuery(cleanedQuery);
      const attemptedQueries = [];
      const checklist = {
        hasApiKey: Boolean(serpApiKey),
        apiKeyLooksValid: isLikelyApiKey(serpApiKey),
        region: "in",
        queryLength: cleanedQuery.length,
        hasShoppingResults: false,
        rateLimited: false
      };

      let aggregated = [];

      if (serpApiKey) {
        const serpAttempt = await searchSerpApi(cleanedQuery, serpApiKey, retries, logger);
        attemptedQueries.push({
          query: cleanedQuery,
          source: "serpapi",
          attempts: serpAttempt.attempts,
          resultCount: serpAttempt.prices.length,
          hasShoppingResults: serpAttempt.hasShoppingResults
        });
        checklist.hasShoppingResults = serpAttempt.hasShoppingResults;
        checklist.rateLimited = serpAttempt.rateLimited;
        aggregated = dedupePrices([...aggregated, ...serpAttempt.prices]);

        if (!aggregated.length && compactQuery && compactQuery !== cleanedQuery) {
          const compactAttempt = await searchSerpApi(compactQuery, serpApiKey, retries, logger);
          attemptedQueries.push({
            query: compactQuery,
            source: "serpapi_compact",
            attempts: compactAttempt.attempts,
            resultCount: compactAttempt.prices.length,
            hasShoppingResults: compactAttempt.hasShoppingResults
          });
          checklist.hasShoppingResults = checklist.hasShoppingResults || compactAttempt.hasShoppingResults;
          checklist.rateLimited = checklist.rateLimited || compactAttempt.rateLimited;
          aggregated = dedupePrices([...aggregated, ...compactAttempt.prices]);
        }
      }

      if (aggregated.length >= 3) {
        return {
          results: aggregated,
          source: "serpapi",
          selectedQuery: compactQuery || cleanedQuery,
          attemptedQueries,
          checklist
        };
      }

      const scraperResults = await scraper(compactQuery || cleanedQuery, logger);
      attemptedQueries.push({
        query: compactQuery || cleanedQuery,
        source: "playwright",
        attempts: 1,
        resultCount: scraperResults.length,
        hasShoppingResults: false
      });

      const merged = dedupePrices([...aggregated, ...scraperResults]);
      return {
        results: merged,
        source: aggregated.length ? "mixed" : "playwright",
        selectedQuery: compactQuery || cleanedQuery,
        attemptedQueries,
        checklist
      };
    }
  };
}

export function normalizePriceSummary(query, results) {
  const numericPrices = (results || [])
    .map((item) => Number(item.price))
    .filter((price) => Number.isFinite(price) && price > 0);

  const minPrice = numericPrices.length ? Math.min(...numericPrices) : null;
  const avgPrice = numericPrices.length
    ? Number((numericPrices.reduce((sum, value) => sum + value, 0) / numericPrices.length).toFixed(2))
    : null;

  return {
    product: query,
    min_price: minPrice,
    avg_price: avgPrice,
    sources: Array.from(new Set((results || []).map((item) => item.platform).filter(Boolean))),
    last_updated: new Date().toISOString()
  };
}

export function extractPrices(data) {
  if (!data) return [];

  const results = data.shopping_results || data.inline_shopping_results || [];
  const primary = results
    .filter((item) => Number.isFinite(Number(item?.extracted_price)) && Number(item.extracted_price) > 0)
    .map((item) => ({
      price: Number(item.extracted_price),
      source: item.source,
      title: item.title,
      link: item.link || item.product_link || ""
    }));

  if (primary.length) {
    return primary;
  }

  const organic = Array.isArray(data.organic_results) ? data.organic_results : [];
  const fallback = organic
    .map((item) => {
      const price = parseCurrencyFromText(`${item?.title || ""} ${item?.snippet || ""}`);
      if (!price) return null;
      return {
        price,
        source: item.source || item.displayed_link || "Organic",
        title: item.title,
        link: item.link || ""
      };
    })
    .filter(Boolean);

  return fallback;
}

async function searchSerpApi(query, apiKey, retries, logger) {
  const safeQuery = truncateQuery(query);
  const params = new URLSearchParams({
    engine: "google_shopping",
    q: safeQuery,
    api_key: apiKey,
    country: "in",
    gl: "in",
    hl: "en"
  });

  const url = `https://serpapi.com/search.json?${params.toString()}`;
  let attempts = 0;
  let parsed;
  let rateLimited = false;

  while (attempts <= retries) {
    attempts += 1;
    try {
      const payload = await httpGet(url);
      parsed = JSON.parse(payload);

      if (parsed?.error) {
        const errorMessage = String(parsed.error);
        if (/rate\s*limit/i.test(errorMessage)) {
          rateLimited = true;
        }
        throw new Error(errorMessage);
      }

      break;
    } catch (error) {
      if (attempts > retries) {
        logger.error("[SERPAPI] Request failed after retries", {
          query: safeQuery,
          attempts,
          message: error.message
        });
        return { prices: [], attempts, hasShoppingResults: false, rateLimited };
      }

      logger.warn("[SERPAPI] Request failed, retrying", {
        query: safeQuery,
        attempt: attempts,
        message: error.message
      });
    }
  }

  const extracted = extractPrices(parsed);
  if (!extracted.length) {
    logger.warn("[SERPAPI] Empty extracted results. Full response follows", { query: safeQuery });
    logger.log(JSON.stringify(parsed, null, 2));
  }

  const prices = dedupePrices(
    extracted
      .map((item) => toComparisonResult(item, "live", safeQuery))
      .filter((item) => Number.isFinite(item.price) && item.price > 0)
  );

  return {
    prices,
    attempts,
    hasShoppingResults: Boolean(parsed?.shopping_results?.length || parsed?.inline_shopping_results?.length),
    rateLimited
  };
}

async function scrapeFallbackPrices(query, logger) {
  let playwright;
  let browser;
  let page;
  
  try {
    playwright = await import("playwright");
  } catch (error) {
    logger.warn("[SCRAPER] Playwright not installed; skipping scraping fallback", { error: error.message });
    return [];
  }

  try {
    browser = await playwright.chromium.launch({ headless: true });
    page = await browser.newPage({ locale: "en-IN" });
    const sites = [
      {
        platform: "Amazon.in",
        domain: "amazon.in",
        selector: ".a-price-whole"
      },
      {
        platform: "Flipkart",
        domain: "flipkart.com",
        selector: "._30jeq3"
      }
    ];

    const results = [];

    for (const site of sites) {
      try {
        const googleSearch = `https://www.google.com/search?q=${encodeURIComponent(`site:${site.domain} ${query}`)}&hl=en&gl=in`;
        await page.goto(googleSearch, { waitUntil: "domcontentloaded", timeout: 20000 });

        const firstLink = await page.evaluate((domain) => {
          const anchors = Array.from(document.querySelectorAll("a[href]"));
          const match = anchors.find((anchor) => {
            const href = anchor.getAttribute("href") || "";
            return href.startsWith("http") && href.includes(domain) && !href.includes("google.com");
          });
          return match ? match.getAttribute("href") : "";
        }, site.domain);

        if (!firstLink) {
          logger.warn("[SCRAPER] No search result link found", { query, site: site.platform });
          continue;
        }

        await page.goto(firstLink, { waitUntil: "domcontentloaded", timeout: 20000 });
        await page.waitForTimeout(1500);

        const priceText = await page.evaluate((selector) => {
          const element = document.querySelector(selector);
          return element ? (element.textContent || "") : "";
        }, site.selector);

        const price = parseCurrencyFromText(priceText);
        if (!price) {
          logger.warn("[SCRAPER] Price element missing", { query, site: site.platform, selector: site.selector });
          continue;
        }

        results.push({
          platform: site.platform,
          title: query,
          price,
          url: page.url(),
          inStock: true,
          source: "playwright_fallback",
          rating: null,
          reviews: null,
          thumbnail: null
        });
      } catch (siteError) {
        logger.warn("[SCRAPER] Failed to scrape site", { query, site: site.platform, error: siteError.message });
      }
    }

    return dedupePrices(results);
  } catch (error) {
    logger.warn("[SCRAPER] Fallback scraping failed", { query, message: error.message });
    return [];
  } finally {
    try {
      if (page) await page.close();
      if (browser) await browser.close();
    } catch (cleanupError) {
      logger.warn("[SCRAPER] Cleanup failed", { error: cleanupError.message });
    }
  }
}

function toComparisonResult(item, source, query) {
  return {
    platform: detectPlatform(item.source || item.link || ""),
    title: item.title || query,
    price: Number(item.price),
    url: item.link || "",
    inStock: true,
    source,
    rating: null,
    reviews: null,
    thumbnail: null
  };
}

function parseCurrencyFromText(text) {
  if (!text) return null;
  const match = String(text).match(/(?:₹|Rs\.?|INR)\s*([\d,]+(?:\.\d+)?)/i) || String(text).match(/([\d,]{3,})/);
  if (!match?.[1]) return null;
  const parsed = Number(match[1].replace(/,/g, ""));
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

function dedupePrices(items) {
  const seen = new Set();
  const output = [];

  for (const item of items || []) {
    const key = `${item.platform || ""}-${item.price || ""}-${(item.url || item.title || "").toLowerCase()}`;
    if (seen.has(key)) continue;
    seen.add(key);
    output.push(item);
  }

  return output;
}

function cleanSearchQuery(value) {
  const tokens = String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/gi, " ")
    .split(/\s+/)
    .filter(Boolean)
    .filter((token) => !STOP_WORDS.has(token));

  return tokens.join(" ").trim();
}

function buildCompactQuery(value) {
  const tokens = String(value || "")
    .split(/\s+/)
    .filter(Boolean)
    .filter((token) => /\d/.test(token) || /^[a-z]{2,}$/i.test(token));

  const prioritized = [];
  for (const token of tokens) {
    if (prioritized.length >= 5) break;
    prioritized.push(token);
  }

  return prioritized.join(" ").trim();
}

function truncateQuery(query) {
  if (!query) return "";
  const normalized = query.trim();
  return normalized.length <= 90 ? normalized : normalized.slice(0, 90).trim();
}

function isLikelyApiKey(key) {
  if (!key) return false;
  return String(key).trim().length >= 24;
}

function detectPlatform(source) {
  const s = String(source || "").toLowerCase();
  if (s.includes("amazon")) return "Amazon.in";
  if (s.includes("flipkart")) return "Flipkart";
  if (s.includes("jiomart") || s.includes("jio")) return "JioMart";
  if (s.includes("croma")) return "Croma";
  if (s.includes("reliance") || s.includes("reliancedigital")) return "Reliance Digital";
  if (s.includes("meesho")) return "Meesho";

  try {
    const url = new URL(source);
    return url.hostname.replace("www.", "").split(".")[0];
  } catch {
    return "Other";
  }
}

function httpGet(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = "";
      res.on("data", (chunk) => {
        data += chunk;
      });
      res.on("end", () => {
        if (res.statusCode && res.statusCode >= 400) {
          reject(new Error(`HTTP ${res.statusCode}: ${data.slice(0, 250)}`));
          return;
        }
        resolve(data);
      });
      res.on("error", reject);
    }).on("error", reject);
  });
}
