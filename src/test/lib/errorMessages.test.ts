import { describe, it, expect } from 'vitest';
import { getUserFriendlyError, errorMessages } from '@/lib/errorMessages';

describe('errorMessages', () => {
  describe('getUserFriendlyError', () => {
    it('should return network error for fetch failures', () => {
      const error = new Error('Failed to fetch');
      const result = getUserFriendlyError(error);
      expect(result).toEqual(errorMessages.networkError);
    });

    it('should return product not found error', () => {
      const error = new Error('Product not found');
      const result = getUserFriendlyError(error);
      expect(result).toEqual(errorMessages.productNotFound);
    });

    it('should return AI error for bedrock failures', () => {
      const error = new Error('Bedrock service unavailable');
      const result = getUserFriendlyError(error);
      expect(result).toEqual(errorMessages.aiResponseFailed);
    });

    it('should return generic error for unknown errors', () => {
      const error = new Error('Something random');
      const result = getUserFriendlyError(error);
      expect(result).toEqual(errorMessages.genericError);
    });

    it('should handle null/undefined errors', () => {
      expect(getUserFriendlyError(null)).toEqual(errorMessages.genericError);
      expect(getUserFriendlyError(undefined)).toEqual(errorMessages.genericError);
    });
  });
});
