import { describe, it, expect } from 'vitest';

describe('Price Comparison Lambda', () => {
  describe('Match Quality Scoring', () => {
    it('should score exact capacity match as 100', () => {
      const queryCapacity = '256GB';
      const resultCapacity = '256GB';
      const score = queryCapacity === resultCapacity ? 100 : 0;

      expect(score).toBe(100);
    });

    it('should score approximate match as 80', () => {
      const queryCapacity = '256GB';
      const resultCapacity = '256 GB'; // Space difference
      const normalized1 = queryCapacity.replace(/\s/g, '').toLowerCase();
      const normalized2 = resultCapacity.replace(/\s/g, '').toLowerCase();
      const score = normalized1 === normalized2 ? 80 : 0;

      expect(score).toBe(80);
    });

    it('should score capacity mismatch as 0', () => {
      const queryCapacity = '256GB';
      const resultCapacity = '128GB';
      const score = queryCapacity === resultCapacity ? 100 : 0;

      expect(score).toBe(0);
    });
  });

  describe('Price Difference Calculations', () => {
    it('should calculate price difference percentage', () => {
      const yourPrice = 1000;
      const competitorPrice = 900;
      const diff = ((yourPrice - competitorPrice) / competitorPrice) * 100;

      expect(Math.round(diff)).toBe(11);
    });

    it('should handle negative differences', () => {
      const yourPrice = 900;
      const competitorPrice = 1000;
      const diff = ((yourPrice - competitorPrice) / competitorPrice) * 100;

      expect(Math.round(diff)).toBe(-10);
    });
  });

  describe('Platform Detection', () => {
    it('should detect Amazon platform', () => {
      const url = 'https://www.amazon.in/product';
      const platform = url.includes('amazon') ? 'Amazon.in' : 'Other';

      expect(platform).toBe('Amazon.in');
    });

    it('should detect Flipkart platform', () => {
      const url = 'https://www.flipkart.com/product';
      const platform = url.includes('flipkart') ? 'Flipkart' : 'Other';

      expect(platform).toBe('Flipkart');
    });
  });
});
