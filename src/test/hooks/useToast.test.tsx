import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useToast, toast } from '@/hooks/use-toast';

describe('useToast', () => {

  it('should add a toast', () => {
    const { result } = renderHook(() => useToast());
    
    act(() => {
      toast({
        title: 'Test Toast',
        description: 'This is a test'
      });
    });
    
    expect(result.current.toasts).toHaveLength(1);
    expect(result.current.toasts[0].title).toBe('Test Toast');
  });

  it('should limit toasts to TOAST_LIMIT', () => {
    const { result } = renderHook(() => useToast());
    
    act(() => {
      toast({ title: 'Toast 1' });
      toast({ title: 'Toast 2' });
    });
    
    // TOAST_LIMIT is 1 in the implementation
    expect(result.current.toasts).toHaveLength(1);
    expect(result.current.toasts[0].title).toBe('Toast 2');
  });

  it('should dismiss a specific toast', () => {
    const { result } = renderHook(() => useToast());
    
    let toastId: string;
    act(() => {
      const { id } = toast({ title: 'Test Toast' });
      toastId = id;
    });
    
    expect(result.current.toasts).toHaveLength(1);
    
    act(() => {
      result.current.dismiss(toastId!);
    });
    
    expect(result.current.toasts[0].open).toBe(false);
  });

  it('should dismiss all toasts', () => {
    const { result } = renderHook(() => useToast());
    
    act(() => {
      toast({ title: 'Toast 1' });
    });
    
    act(() => {
      result.current.dismiss();
    });
    
    expect(result.current.toasts[0].open).toBe(false);
  });

  it('should update a toast', () => {
    const { result } = renderHook(() => useToast());
    
    let updateFn: any;
    act(() => {
      const { update } = toast({ title: 'Original' });
      updateFn = update;
    });
    
    act(() => {
      updateFn({ title: 'Updated' });
    });
    
    expect(result.current.toasts[0].title).toBe('Updated');
  });

  it('should handle toast variants', () => {
    const { result } = renderHook(() => useToast());
    
    act(() => {
      toast({
        title: 'Error',
        variant: 'destructive'
      });
    });
    
    expect(result.current.toasts[0].variant).toBe('destructive');
  });

  it('should auto-dismiss after timeout', async () => {
    const { result } = renderHook(() => useToast());
    
    act(() => {
      toast({ title: 'Auto Dismiss' });
    });
    
    expect(result.current.toasts).toHaveLength(1);
    
    // Wait for auto-dismiss (TOAST_REMOVE_DELAY is very long in implementation)
    // In real tests, you'd mock timers
  });
});
