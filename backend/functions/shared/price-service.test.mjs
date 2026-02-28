import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createPriceService, extractPrices, normalizePriceSummary } from './price-service.mjs';

describe('Price Service', () => {
  describe('extractPrices', () => {
    it('should extract prices from shopping results', () => {
      const data = {
        shopping_results: [
          {
            title: 'iPhone 15 Pro',
            extracted_price: 129900,
            source: 'Amazon.in',
            link: 'https://amazon.in/product'
          }
        ]
      };

      const prices = extractPrices(data);
      expect(prices).toHaveLength(1);
      expect(prices[0].price).toBe(129900);
      expect(prices[0].title).toBe('iPhone 15 Pro');
    });

    it('should filter out invalid prices', () => {
      const data = {
        shopping_results: [
          { extracted_price: 0, title: 'Invalid' },
          { extracted_price: -100, title: 'Negative' },
          { extracted_price: 1000, title: 'Valid' }
        ]
      };

      const prices = extractPrices(data);
      expect(prices).toHaveLength(1);
      expect(prices[0].price).toBe(1000);
    });

    it('should handle missing shopping results', () => {
      const prices = extractPrices({});
      expect(prices).toEqual([]);
    });
  });

  describe('normalizePriceSummary', () => {
    it('should calculate min and average prices', () => {
      const results = [
        { price: 1000, platform: 'Amazon' },
        { price: 1200, platform: 'Flipkart' },
        { price: 900, platform: 'JioMart' }
      ];

      const summary = normalizePriceSummary('iPhone 15', results);
      
      expect(summary.min_price).toBe(900);
      expect(summary.avg_price).toBe(1033.33);
      expect(summary.sources).toContain('Amazon');
      expect(summary.sources).toHaveLength(3);
    });

    it('should handle empty results', () => {
      const summary = normalizePriceSummary('Product', []);
      expect(summary.min_price).toBeNull();
      expect(summary.avg_price).toBeNull();
      expect(summary.sources).toEqual([]);
    });

    it('should filter out non-numeric prices', () => {
      const results = [
        { price: 'invalid', platform: 'Test' },
        { price: 1000, platform: 'Valid' }
      ];

      const summary = normalizePriceSummary('Product', results);
      expect(summary.min_price).toBe(1000);
      expect(summary.avg_price).toBe(1000);
    });
  });

  describe('createPriceService', () => {
    it('should create service with default options', () => {
      const service = createPriceService();
      expect(service).toHaveProperty('extractPrices');
      expect(service).toHaveProperty('fetchCompetitorPrices');
    });

    it('should deduplicate prices by platform and price', async () => {
      const mockScraper = vi.fn().mockResolvedValue([
        { platform: 'Amazon', price: 1000, title: 'Product A' },
        { platform: 'Amazon', price: 1000, title: 'Product A' }
      ]);

      const service = createPriceService({ scraper: mockScraper });
      const result = await service.fetchCompetitorPrices('test query');
      
      expect(result.results).toHaveLength(1);
    });

    it('should handle SerpAPI errors gracefully', async () => {
      const service = createPriceService({ serpApiKey: 'invalid-key' });
      const result = await service.fetchCompetitorPrices('test query');
      
      expect(result.checklist.hasApiKey).toBe(true);
      expect(result.results).toBeDefined();
    });
  });
});
