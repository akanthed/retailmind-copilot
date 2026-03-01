import { describe, it, expect, vi, beforeEach } from 'vitest';
import { apiClient } from '@/api/client';

global.fetch = vi.fn();

describe('Product Workflow Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should complete full product lifecycle', async () => {
    // 1. Create product
    const newProduct = {
      name: 'iPhone 15 Pro',
      sku: 'IPHONE-15-PRO',
      category: 'Electronics',
      currentPrice: 129900,
      costPrice: 110000,
      stock: 50
    };

    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ ...newProduct, id: 'prod-123' })
    });

    const createResult = await apiClient.createProduct(newProduct);
    expect(createResult.data?.id).toBe('prod-123');

    // 2. Search competitor prices
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        results: [
          { platform: 'Amazon.in', price: 125900, inStock: true }
        ],
        source: 'live'
      })
    });

    const priceResult = await apiClient.searchCompetitorPrices('prod-123', {
      keywords: 'iPhone 15 Pro'
    });
    expect(priceResult.data?.results).toHaveLength(1);

    // 3. Generate recommendations
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        recommendationsGenerated: 1,
        recommendations: [{
          type: 'price_decrease',
          suggestedPrice: 127900
        }]
      })
    });

    const recResult = await apiClient.generateRecommendations();
    expect(recResult.data?.recommendationsGenerated).toBe(1);

    // 4. Update product price
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ ...newProduct, id: 'prod-123', currentPrice: 127900 })
    });

    const updateResult = await apiClient.updateProduct('prod-123', {
      currentPrice: 127900
    });
    expect(updateResult.data?.currentPrice).toBe(127900);

    // 5. Delete product
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ message: 'Deleted', id: 'prod-123' })
    });

    const deleteResult = await apiClient.deleteProduct('prod-123');
    expect(deleteResult.data?.message).toBe('Deleted');
  });

  it('should handle product with low stock', async () => {
    // Create product with low stock
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        id: 'prod-456',
        stock: 3,
        stockDays: 2
      })
    });

    await apiClient.createProduct({
      name: 'Low Stock Product',
      sku: 'LOW-001',
      stock: 3
    });

    // Generate alerts
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        alertsGenerated: 1,
        alerts: [{
          type: 'stock_risk',
          severity: 'critical',
          productId: 'prod-456'
        }]
      })
    });

    const alertResult = await apiClient.generateAlerts();
    expect(alertResult.data?.alerts[0].type).toBe('stock_risk');
    expect(alertResult.data?.alerts[0].severity).toBe('critical');
  });

  it('should handle pricing opportunity', async () => {
    // Product exists
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        id: 'prod-789',
        currentPrice: 50000
      })
    });

    await apiClient.getProduct('prod-789');

    // All competitors out of stock
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        results: [
          { platform: 'Amazon.in', price: 48000, inStock: false },
          { platform: 'Flipkart', price: 49000, inStock: false }
        ]
      })
    });

    await apiClient.searchCompetitorPrices('prod-789', {});

    // Generate recommendations
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        recommendations: [{
          type: 'price_increase',
          reason: 'All competitors out of stock'
        }]
      })
    });

    const recResult = await apiClient.generateRecommendations();
    expect(recResult.data?.recommendations[0].type).toBe('price_increase');
  });
});
