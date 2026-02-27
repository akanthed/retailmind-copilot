import { afterEach, describe, expect, it, vi } from "vitest";

const hoisted = vi.hoisted(() => ({
  httpsPayloads: [],
  httpsCallIndex: 0,
  mockHttpsGet: vi.fn()
}));

hoisted.mockHttpsGet.mockImplementation((url, callback) => {
  const listeners = {};
  const req = {
    on(event, handler) {
      listeners[event] = handler;
      return req;
    }
  };

  const current = hoisted.httpsPayloads[Math.min(hoisted.httpsCallIndex, Math.max(hoisted.httpsPayloads.length - 1, 0))];
  hoisted.httpsCallIndex += 1;

  queueMicrotask(() => {
    if (!current) {
      if (listeners.error) listeners.error(new Error("No mocked https payload"));
      return;
    }

    if (current.type === "error") {
      if (listeners.error) listeners.error(new Error(current.message || "network error"));
      return;
    }

    const resListeners = {};
    const res = {
      statusCode: current.statusCode ?? 200,
      on(event, handler) {
        resListeners[event] = handler;
        return res;
      }
    };

    callback(res);
    if (resListeners.data) resListeners.data(JSON.stringify(current.body));
    if (resListeners.end) resListeners.end();
  });

  return req;
});

vi.mock("https", () => ({
  default: { get: hoisted.mockHttpsGet },
  get: hoisted.mockHttpsGet
}));

import { createPriceService, extractPrices, normalizePriceSummary } from "../shared/price-service.mjs";

function mockHttpsWithPayloadSequence(payloads) {
  hoisted.httpsPayloads = payloads;
  hoisted.httpsCallIndex = 0;
}

afterEach(() => {
  hoisted.mockHttpsGet.mockClear();
  hoisted.httpsPayloads = [];
  hoisted.httpsCallIndex = 0;
});

describe("extractPrices", () => {
  it("uses extracted_price from shopping_results", () => {
    const prices = extractPrices({
      shopping_results: [
        {
          title: "iPhone 15",
          price: "₹49,999",
          extracted_price: 49999,
          source: "Amazon",
          link: "https://amazon.in/item"
        },
        {
          title: "no price",
          price: "₹0"
        }
      ]
    });

    expect(prices).toEqual([
      {
        price: 49999,
        source: "Amazon",
        title: "iPhone 15",
        link: "https://amazon.in/item"
      }
    ]);
  });

  it("falls back to inline_shopping_results and organic_results parsing", () => {
    const inline = extractPrices({
      inline_shopping_results: [
        {
          title: "Samsung S24",
          extracted_price: 65999,
          source: "Flipkart",
          link: "https://flipkart.com/item"
        }
      ]
    });

    const organic = extractPrices({
      organic_results: [
        {
          title: "Samsung S24 ₹64,999 deal",
          snippet: "Buy now",
          source: "Some Store",
          link: "https://store.example/product"
        }
      ]
    });

    expect(inline[0].price).toBe(65999);
    expect(organic[0].price).toBe(64999);
  });
});

describe("fetchCompetitorPrices", () => {
  it("retries SerpAPI and returns serpapi source when >=3 results", async () => {
    const warn = vi.fn();
    const logger = { warn, log: vi.fn(), error: vi.fn() };

    mockHttpsWithPayloadSequence([
      { type: "error", message: "socket hang up" },
      { type: "error", message: "temporary failure" },
      {
        type: "ok",
        body: {
          shopping_results: [
            { title: "P1", extracted_price: 1000, source: "Amazon", link: "https://amazon.in/p1" },
            { title: "P2", extracted_price: 1100, source: "Flipkart", link: "https://flipkart.com/p2" },
            { title: "P3", extracted_price: 1200, source: "Croma", link: "https://croma.com/p3" }
          ]
        }
      }
    ]);

    const service = createPriceService({ serpApiKey: "valid_serp_api_key_abcdefghijklmnopqrstuvwxyz", logger, retries: 2 });
    const result = await service.fetchCompetitorPrices("Apple iPhone 15 128GB Blue");

    expect(warn).toHaveBeenCalledTimes(2);
    expect(result.source).toBe("serpapi");
    expect(result.results.length).toBeGreaterThanOrEqual(3);
    expect(result.checklist.hasShoppingResults).toBe(true);
  });

  it("logs full response when SerpAPI returns empty results", async () => {
    const logger = { warn: vi.fn(), log: vi.fn(), error: vi.fn() };
    const scraper = vi.fn(async () => []);

    mockHttpsWithPayloadSequence([
      {
        type: "ok",
        body: {
          shopping_results: [],
          inline_shopping_results: [],
          organic_results: []
        }
      }
    ]);

    const service = createPriceService({
      serpApiKey: "valid_serp_api_key_abcdefghijklmnopqrstuvwxyz",
      logger,
      retries: 0,
      scraper
    });
    await service.fetchCompetitorPrices("noise words with symbols !!! and extra");

    expect(logger.warn).toHaveBeenCalled();
    expect(logger.log).toHaveBeenCalledWith(expect.stringContaining("shopping_results"));
    expect(scraper).toHaveBeenCalledTimes(1);
  });

  it("uses Playwright fallback scraping when SerpAPI has insufficient results", async () => {
    const scraper = vi.fn(async () => [
      {
        platform: "Amazon.in",
        title: "iPhone 15 128GB",
        price: 54990,
        url: "https://www.amazon.in/mock-product",
        inStock: true,
        source: "playwright_fallback",
        rating: null,
        reviews: null,
        thumbnail: null
      },
      {
        platform: "Flipkart",
        title: "iPhone 15 128GB",
        price: 53499,
        url: "https://www.flipkart.com/mock-product",
        inStock: true,
        source: "playwright_fallback",
        rating: null,
        reviews: null,
        thumbnail: null
      }
    ]);

    const service = createPriceService({
      logger: { warn: vi.fn(), log: vi.fn(), error: vi.fn() },
      scraper
    });
    const result = await service.fetchCompetitorPrices("iPhone 15 128GB");

    expect(result.source).toBe("playwright");
    expect(result.results.length).toBeGreaterThanOrEqual(2);
    expect(result.results.map((item) => item.platform)).toEqual(expect.arrayContaining(["Amazon.in", "Flipkart"]));
    expect(scraper).toHaveBeenCalledTimes(1);
    expect(scraper.mock.calls[0][0]).toContain("iphone");
  });
});

describe("normalizePriceSummary", () => {
  it("returns expected normalized shape", () => {
    const summary = normalizePriceSummary("iPhone 15", [
      { price: 50000, platform: "Amazon.in" },
      { price: 52000, platform: "Flipkart" },
      { price: 51000, platform: "Amazon.in" }
    ]);

    expect(summary.product).toBe("iPhone 15");
    expect(summary.min_price).toBe(50000);
    expect(summary.avg_price).toBe(51000);
    expect(summary.sources).toEqual(expect.arrayContaining(["Amazon.in", "Flipkart"]));
    expect(typeof summary.last_updated).toBe("string");
  });
});
