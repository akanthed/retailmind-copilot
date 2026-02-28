import { describe, it, expect, vi, beforeEach } from 'vitest';
import { apiClient } from '@/api/client';

global.fetch = vi.fn();

describe('Recommendation Pipeline Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should generate and implement recommendation', async () => {
    // 1. Generate recommendations
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        recommendationsGenerated: 3,
        recommendations: [
          {
            id: 'rec-001',
            type: 'price_decrease',
            status: 'pending',
            confidence: 87
          }
        ]
      })
    });

    const genResult = await apiClient.generateRecommendations();
    expect(genResult.data?.recommendationsGenerated).toBe(3);

    // 2. Get recommendation details
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        id: 'rec-001',
        type: 'price_decrease',
        suggestedPrice: 127900,
        currentPrice: 129900
      })
    });

    const detailResult = await apiClient.getRecommendation('rec-001');
    expect(detailResult.data?.suggestedPrice).toBe(127900);

    // 3. Implement recommendation
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        id: 'rec-001',
        status: 'implemented',
        implementedAt: Date.now()
      })
    });

    const implResult = await apiClient.implementRecommendation('rec-001');
    expect(implResult.data?.status).toBe('implemented');
  });
});
