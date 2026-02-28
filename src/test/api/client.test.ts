import { describe, it, expect, vi, beforeEach } from 'vitest';
import { apiClient } from '@/api/client';

global.fetch = vi.fn();

describe('API Client', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Products API', () => {
    it('should fetch products successfully', async () => {
      const mockProducts = {
        products: [
          { id: '1', name: 'Test Product', sku: 'TEST-001', currentPrice: 1000 }
        ],
        count: 1
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockProducts
      });

      const result = await apiClient.getProducts();
      expect(result.data).toEqual(mockProducts);
      expect(result.error).toBeUndefined();
    });

    it('should handle product creation', async () => {
      const newProduct = {
        name: 'New Product',
        sku: 'NEW-001',
        category: 'Electronics',
        currentPrice: 1500,
        costPrice: 1200,
        stock: 100
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ ...newProduct, id: '123' })
      });

      const result = await apiClient.createProduct(newProduct);
      expect(result.data).toHaveProperty('id');
      expect(result.data?.name).toBe(newProduct.name);
    });

    it('should handle API errors gracefully', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        json: async () => ({ error: 'Server error' })
      });

      const result = await apiClient.getProducts();
      expect(result.error).toBeDefined();
      expect(result.data).toBeUndefined();
    });

    it('should handle network errors', async () => {
      (global.fetch as any).mockRejectedValueOnce(new Error('Network error'));

      const result = await apiClient.getProducts();
      expect(result.error).toBe('Network error');
    });
  });

  describe('AI Copilot API', () => {
    it('should query copilot successfully', async () => {
      const mockResponse = {
        query: 'What are my top products?',
        response: 'Your top products are...',
        confidence: 0.95
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const result = await apiClient.queryCopilot('What are my top products?');
      expect(result.data).toEqual(mockResponse);
    });

    it('should support language parameter', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ response: 'Hindi response' })
      });

      await apiClient.queryCopilot('Query', 'hi');
      
      const callArgs = (global.fetch as any).mock.calls[0];
      const body = JSON.parse(callArgs[1].body);
      expect(body.language).toBe('hi');
    });
  });

  describe('Price Comparison API', () => {
    it('should search competitor prices', async () => {
      const mockResults = {
        results: [
          { platform: 'Amazon.in', price: 950, inStock: true }
        ],
        resultsCount: 1,
        source: 'live'
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResults
      });

      const result = await apiClient.searchCompetitorPrices('prod-123', {
        keywords: 'iPhone 15'
      });

      expect(result.data?.results).toHaveLength(1);
      expect(result.data?.source).toBe('live');
    });
  });

  describe('Recommendations API', () => {
    it('should generate recommendations', async () => {
      const mockResponse = {
        message: 'Generated successfully',
        recommendationsGenerated: 5,
        recommendations: []
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const result = await apiClient.generateRecommendations();
      expect(result.data?.recommendationsGenerated).toBe(5);
    });

    it('should implement recommendation', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: 'rec-123', status: 'implemented' })
      });

      const result = await apiClient.implementRecommendation('rec-123');
      expect(result.data?.status).toBe('implemented');
    });
  });

  describe('Alerts API', () => {
    it('should fetch alert statistics', async () => {
      const mockStats = {
        total: 10,
        byType: { price_drop: 5, stock_risk: 3, opportunity: 2 },
        bySeverity: { critical: 2, warning: 5, info: 3 }
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockStats
      });

      const result = await apiClient.getAlertStats();
      expect(result.data?.total).toBe(10);
      expect(result.data?.byType.price_drop).toBe(5);
    });
  });

  describe('Revenue API', () => {
    it('should fetch revenue summary', async () => {
      const mockSummary = {
        revenue_protected: 50000,
        alert_response_rate: 0.85,
        competitive_score: 92
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockSummary
      });

      const result = await apiClient.getRevenueSummary();
      expect(result.data?.revenue_protected).toBe(50000);
    });

    it('should fetch revenue history with date range', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ history: [], count: 0 })
      });

      await apiClient.getRevenueHistory(30);
      
      const callUrl = (global.fetch as any).mock.calls[0][0];
      expect(callUrl).toContain('days=30');
    });
  });
});
