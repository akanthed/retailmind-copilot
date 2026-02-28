import { describe, it, expect, vi, beforeEach } from 'vitest';
import { apiClient } from '@/api/client';

global.fetch = vi.fn();

describe('Alert Pipeline Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should generate and acknowledge alerts', async () => {
    // 1. Generate alerts
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        alertsGenerated: 5,
        alerts: [
          {
            id: 'alert-001',
            type: 'price_drop',
            severity: 'critical',
            acknowledged: false
          }
        ]
      })
    });

    const genResult = await apiClient.generateAlerts();
    expect(genResult.data?.alertsGenerated).toBe(5);

    // 2. Get alert statistics
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        total: 5,
        byType: { price_drop: 2, stock_risk: 2, opportunity: 1 },
        unacknowledged: 5
      })
    });

    const statsResult = await apiClient.getAlertStats();
    expect(statsResult.data?.unacknowledged).toBe(5);

    // 3. Acknowledge alert
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        id: 'alert-001',
        acknowledged: true,
        acknowledgedAt: Date.now()
      })
    });

    const ackResult = await apiClient.acknowledgeAlert('alert-001');
    expect(ackResult.data?.acknowledged).toBe(true);
  });
});
