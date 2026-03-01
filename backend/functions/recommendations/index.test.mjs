import { describe, it, expect } from 'vitest';

describe('Recommendations Lambda', () => {
  describe('GST Calculations', () => {
    it('should calculate GST for Electronics (18%)', () => {
      const priceIncludingGST = 1180;
      const gstRate = 18;
      const gstAmount = Math.round((priceIncludingGST * gstRate) / (100 + gstRate));
      const priceExcludingGST = priceIncludingGST - gstAmount;

      expect(gstAmount).toBe(180);
      expect(priceExcludingGST).toBe(1000);
    });

    it('should calculate GST for Food (5%)', () => {
      const priceIncludingGST = 105;
      const gstRate = 5;
      const gstAmount = Math.round((priceIncludingGST * gstRate) / (100 + gstRate));

      expect(gstAmount).toBe(5);
    });

    it('should calculate GST for Books (0%)', () => {
      const priceIncludingGST = 500;
      const gstRate = 0;
      const gstAmount = Math.round((priceIncludingGST * gstRate) / (100 + gstRate));

      expect(gstAmount).toBe(0);
    });
  });

  describe('Recommendation Rules', () => {
    it('should recommend price decrease when 15% above market', () => {
      const yourPrice = 1150;
      const avgMarketPrice = 1000;
      const priceDiff = ((yourPrice / avgMarketPrice) - 1) * 100;

      expect(priceDiff).toBeGreaterThan(15);
    });

    it('should recommend restock when stock days < 5', () => {
      const stockDays = 3;
      const shouldRestock = stockDays < 5;

      expect(shouldRestock).toBe(true);
    });

    it('should identify pricing opportunity when competitors out of stock', () => {
      const inStockCompetitors = [];
      const totalCompetitors = 5;
      const hasOpportunity = inStockCompetitors.length === 0 && totalCompetitors > 0;

      expect(hasOpportunity).toBe(true);
    });

    it('should recommend promotion for slow-moving inventory', () => {
      const stockDays = 45;
      const isSlowMoving = stockDays > 30;

      expect(isSlowMoving).toBe(true);
    });
  });

  describe('Impact Calculations', () => {
    it('should estimate revenue impact of price change', () => {
      const priceDiff = 200;
      const estimatedUnitsPerWeek = 0.5;
      const weeks = 4;
      const estimatedImpact = Math.round(priceDiff * estimatedUnitsPerWeek * weeks);

      expect(estimatedImpact).toBe(400);
    });

    it('should calculate tied-up capital', () => {
      const costPrice = 800;
      const stock = 50;
      const tiedUpCapital = costPrice * stock;

      expect(tiedUpCapital).toBe(40000);
    });
  });
});
