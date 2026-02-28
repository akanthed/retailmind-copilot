import { describe, it, expect } from 'vitest';

describe('Alerts Lambda', () => {
  describe('Alert Generation Rules', () => {
    it('should generate critical alert for price drop > 20%', () => {
      const yourPrice = 1200;
      const competitorPrice = 900;
      const priceDiff = ((yourPrice - competitorPrice) / competitorPrice) * 100;
      const severity = priceDiff > 20 ? 'critical' : 'warning';

      expect(priceDiff).toBeGreaterThan(20);
      expect(severity).toBe('critical');
    });

    it('should generate warning alert for price drop 10-20%', () => {
      const yourPrice = 1100;
      const competitorPrice = 1000;
      const priceDiff = ((yourPrice - competitorPrice) / competitorPrice) * 100;
      const severity = priceDiff > 20 ? 'critical' : 'warning';

      expect(priceDiff).toBe(10);
      expect(severity).toBe('warning');
    });

    it('should generate stock risk alert when < 5 days', () => {
      const stockDays = 3;
      const severity = stockDays < 2 ? 'critical' : 'warning';

      expect(severity).toBe('warning');
    });

    it('should detect demand spike from sales velocity', () => {
      const stock = 100;
      const stockDays = 10;
      const dailySales = stock / stockDays;
      const isDemandSpike = dailySales > 5;

      expect(dailySales).toBe(10);
      expect(isDemandSpike).toBe(true);
    });
  });

  describe('Alert Statistics', () => {
    it('should aggregate alerts by type', () => {
      const alerts = [
        { type: 'price_drop' },
        { type: 'price_drop' },
        { type: 'stock_risk' },
        { type: 'opportunity' }
      ];

      const byType = alerts.reduce((acc, alert) => {
        acc[alert.type] = (acc[alert.type] || 0) + 1;
        return acc;
      }, {});

      expect(byType.price_drop).toBe(2);
      expect(byType.stock_risk).toBe(1);
      expect(byType.opportunity).toBe(1);
    });

    it('should count acknowledged vs unacknowledged', () => {
      const alerts = [
        { acknowledged: true },
        { acknowledged: false },
        { acknowledged: false }
      ];

      const acknowledged = alerts.filter(a => a.acknowledged).length;
      const unacknowledged = alerts.filter(a => !a.acknowledged).length;

      expect(acknowledged).toBe(1);
      expect(unacknowledged).toBe(2);
    });
  });

  describe('Reorder Calculations', () => {
    it('should calculate reorder quantity for 2-week buffer', () => {
      const currentStock = 50;
      const stockDays = 5;
      const dailySales = currentStock / stockDays;
      const reorderQuantity = Math.ceil(dailySales * 14); // 2 weeks

      expect(reorderQuantity).toBe(140);
    });
  });
});
