import { describe, it, expect } from 'vitest';
import { cn } from '@/lib/utils';

describe('utils', () => {
  describe('cn - className merger', () => {
    it('should merge multiple class names', () => {
      expect(cn('class1', 'class2')).toBe('class1 class2');
    });

    it('should handle conditional classes', () => {
      expect(cn('base', true && 'active', false && 'inactive')).toBe('base active');
    });

    it('should handle Tailwind conflicts', () => {
      expect(cn('px-2', 'px-4')).toBe('px-4');
    });

    it('should handle empty inputs', () => {
      expect(cn()).toBe('');
      expect(cn('', null, undefined)).toBe('');
    });
  });
});
