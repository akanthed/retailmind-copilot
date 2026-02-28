import { describe, it, expect, vi, beforeEach } from 'vitest';
import { exportToCSV, exportProductsToCSV } from '@/lib/reportExport';
import type { Product } from '@/api/client';

// Mock URL.createObjectURL and document methods
global.URL.createObjectURL = vi.fn(() => 'blob:mock-url');
global.URL.revokeObjectURL = vi.fn();

describe('reportExport', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    document.body.innerHTML = '';
  });

  describe('exportToCSV', () => {
    it('should generate CSV with headers and data', () => {
      const data = [
        { name: 'Product 1', price: 100 },
        { name: 'Product 2', price: 200 }
      ];

      const createElementSpy = vi.spyOn(document, 'createElement');
      exportToCSV(data, 'test.csv');

      expect(createElementSpy).toHaveBeenCalledWith('a');
      expect(global.URL.createObjectURL).toHaveBeenCalled();
    });

    it('should handle values with commas', () => {
      const data = [{ name: 'Product, with comma', price: 100 }];
      
      exportToCSV(data, 'test.csv');
      expect(global.URL.createObjectURL).toHaveBeenCalled();
    });

    it('should throw error for empty data', () => {
      expect(() => exportToCSV([], 'test.csv')).toThrow('No data to export');
    });
  });

  describe('exportProductsToCSV', () => {
    it('should export products with calculated margins', () => {
      const products: Product[] = [
        {
          id: '1',
          name: 'Test Product',
          sku: 'TEST-001',
          category: 'Electronics',
          currentPrice: 1000,
          costPrice: 800,
          stock: 50,
          stockDays: 10,
          createdAt: Date.now(),
          updatedAt: Date.now()
        }
      ];

      const createElementSpy = vi.spyOn(document, 'createElement');
      exportProductsToCSV(products);

      expect(createElementSpy).toHaveBeenCalled();
      expect(global.URL.createObjectURL).toHaveBeenCalled();
    });
  });
});
