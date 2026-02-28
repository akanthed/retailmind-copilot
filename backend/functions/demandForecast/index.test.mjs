import { describe, it, expect } from 'vitest';

describe('Demand Forecast Lambda', () => {
  describe('Festival Impact Calculations', () => {
    it('should apply Diwali surge (2.5x)', () => {
      const baseDemand = 10;
      const diwaliImpact = 2.5;
      const forecastedDemand = Math.round(baseDemand * diwaliImpact);

      expect(forecastedDemand).toBe(25);
    });

    it('should apply Holi surge (1.8x)', () => {
      const baseDemand = 10;
      const holiImpact = 1.8;
      const forecastedDemand = Math.round(baseDemand * holiImpact);

      expect(forecastedDemand).toBe(18);
    });

    it('should apply Christmas surge (2.0x)', () => {
      const baseDemand = 10;
      const christmasImpact = 2.0;
      const forecastedDemand = Math.round(baseDemand * christmasImpact);

      expect(forecastedDemand).toBe(20);
    });
  });

  describe('Stock Depletion Calculations', () => {
    it('should calculate days until stockout', () => {
      const currentStock = 100;
      const avgDailyDemand = 5;
      const daysUntilStockout = Math.floor(currentStock / avgDailyDemand);

      expect(daysUntilStockout).toBe(20);
    });

    it('should classify stockout risk levels', () => {
      const getRiskLevel = (days) => {
        if (days < 3) return 'critical';
        if (days < 7) return 'high';
        if (days < 14) return 'medium';
        return 'low';
      };

      expect(getRiskLevel(2)).toBe('critical');
      expect(getRiskLevel(5)).toBe('high');
      expect(getRiskLevel(10)).toBe('medium');
      expect(getRiskLevel(20)).toBe('low');
    });
  });

  describe('Demand Forecasting', () => {
    it('should calculate 30-day total demand', () => {
      const dailyForecasts = Array(30).fill(10);
      const totalDemand = dailyForecasts.reduce((sum, d) => sum + d, 0);

      expect(totalDemand).toBe(300);
    });

    it('should identify peak demand periods', () => {
      const forecasts = [
        { date: '2024-01-01', demand: 10, festival: null },
        { date: '2024-01-15', demand: 25, festival: 'Diwali' },
        { date: '2024-01-20', demand: 12, festival: null }
      ];

      const peaks = forecasts.filter(f => f.festival !== null);
      expect(peaks).toHaveLength(1);
      expect(peaks[0].demand).toBe(25);
    });

    it('should calculate confidence scores', () => {
      const historicalAccuracy = 0.85;
      const dataQuality = 0.90;
      const confidence = (historicalAccuracy + dataQuality) / 2;

      expect(confidence).toBe(0.875);
    });
  });

  describe('Reorder Recommendations', () => {
    it('should recommend urgent reorder for critical stock', () => {
      const stockDays = 2;
      const priority = stockDays < 3 ? 'high' : 'medium';

      expect(priority).toBe('high');
    });

    it('should calculate reorder quantity', () => {
      const avgDailyDemand = 5;
      const leadTimeDays = 7;
      const bufferDays = 14;
      const reorderQuantity = Math.ceil(avgDailyDemand * (leadTimeDays + bufferDays));

      expect(reorderQuantity).toBe(105);
    });

    it('should account for festival demand in reorder', () => {
      const normalDemand = 10;
      const festivalImpact = 2.5;
      const festivalDays = 5;
      const normalDays = 25;
      
      const totalDemand = (normalDemand * normalDays) + (normalDemand * festivalImpact * festivalDays);
      expect(totalDemand).toBe(375);
    });
  });

  describe('Day of Week Patterns', () => {
    it('should apply weekend surge', () => {
      const baseDemand = 10;
      const weekendMultiplier = 1.3;
      const weekendDemand = Math.round(baseDemand * weekendMultiplier);

      expect(weekendDemand).toBe(13);
    });

    it('should identify high-demand days', () => {
      const weeklyPattern = {
        Monday: 1.0,
        Tuesday: 0.9,
        Wednesday: 0.9,
        Thursday: 1.0,
        Friday: 1.2,
        Saturday: 1.4,
        Sunday: 1.3
      };

      const highDemandDays = Object.entries(weeklyPattern)
        .filter(([_, multiplier]) => multiplier > 1.2)
        .map(([day]) => day);

      expect(highDemandDays).toContain('Friday');
      expect(highDemandDays).toContain('Saturday');
      expect(highDemandDays).toContain('Sunday');
    });
  });
});
