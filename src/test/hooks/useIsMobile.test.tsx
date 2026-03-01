import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useIsMobile } from '@/hooks/use-mobile';

describe('useIsMobile', () => {
  let matchMediaMock: any;

  beforeEach(() => {
    matchMediaMock = vi.fn();
    window.matchMedia = matchMediaMock;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should return true for mobile viewport', () => {
    Object.defineProperty(window, 'innerWidth', { value: 500, writable: true });
    
    const listeners: any[] = [];
    matchMediaMock.mockReturnValue({
      matches: true,
      addEventListener: (event: string, handler: any) => listeners.push(handler),
      removeEventListener: vi.fn()
    });

    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(true);
  });

  it('should return false for desktop viewport', () => {
    Object.defineProperty(window, 'innerWidth', { value: 1024, writable: true });
    
    matchMediaMock.mockReturnValue({
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn()
    });

    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(false);
  });

  it('should update on window resize', () => {
    const listeners: any[] = [];
    matchMediaMock.mockReturnValue({
      matches: false,
      addEventListener: (event: string, handler: any) => listeners.push(handler),
      removeEventListener: vi.fn()
    });

    const { result, rerender } = renderHook(() => useIsMobile());
    expect(result.current).toBe(false);

    // Simulate resize
    Object.defineProperty(window, 'innerWidth', { value: 500, writable: true });
    listeners.forEach(listener => listener());
    rerender();

    expect(result.current).toBe(true);
  });
});
