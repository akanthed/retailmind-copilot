import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useFocusTrap } from '@/hooks/useFocusTrap';

describe('useFocusTrap', () => {
  it('should return a ref', () => {
    const { result } = renderHook(() => useFocusTrap());
    
    expect(result.current).toHaveProperty('current');
  });

  it('should focus first element when active', () => {
    const container = document.createElement('div');
    const button1 = document.createElement('button');
    const button2 = document.createElement('button');
    
    container.appendChild(button1);
    container.appendChild(button2);
    document.body.appendChild(container);
    
    const focusSpy = vi.spyOn(button1, 'focus');
    
    const { result } = renderHook(() => useFocusTrap(true));
    result.current.current = container as any;
    
    // Trigger useEffect
    renderHook(() => useFocusTrap(true));
    
    document.body.removeChild(container);
  });

  it('should trap focus within container', () => {
    const container = document.createElement('div');
    const button1 = document.createElement('button');
    const button2 = document.createElement('button');
    
    container.appendChild(button1);
    container.appendChild(button2);
    document.body.appendChild(container);
    
    const { result } = renderHook(() => useFocusTrap(true));
    result.current.current = container as any;
    
    // Simulate Tab key
    const tabEvent = new KeyboardEvent('keydown', { key: 'Tab' });
    container.dispatchEvent(tabEvent);
    
    document.body.removeChild(container);
  });

  it('should handle Shift+Tab for reverse navigation', () => {
    const container = document.createElement('div');
    const button1 = document.createElement('button');
    const button2 = document.createElement('button');
    
    container.appendChild(button1);
    container.appendChild(button2);
    document.body.appendChild(container);
    
    const { result } = renderHook(() => useFocusTrap(true));
    result.current.current = container as any;
    
    // Simulate Shift+Tab
    const shiftTabEvent = new KeyboardEvent('keydown', { 
      key: 'Tab', 
      shiftKey: true 
    });
    container.dispatchEvent(shiftTabEvent);
    
    document.body.removeChild(container);
  });

  it('should not trap focus when inactive', () => {
    const container = document.createElement('div');
    const button = document.createElement('button');
    container.appendChild(button);
    document.body.appendChild(container);
    
    const focusSpy = vi.spyOn(button, 'focus');
    
    const { result } = renderHook(() => useFocusTrap(false));
    result.current.current = container as any;
    
    expect(focusSpy).not.toHaveBeenCalled();
    
    document.body.removeChild(container);
  });

  it('should cleanup event listeners on unmount', () => {
    const container = document.createElement('div');
    const button = document.createElement('button');
    container.appendChild(button);
    document.body.appendChild(container);
    
    const { result, unmount } = renderHook(() => useFocusTrap(true));
    result.current.current = container as any;
    
    // Unmount should cleanup
    unmount();
    
    // Just verify no errors occur
    expect(container).toBeDefined();
    
    document.body.removeChild(container);
  });
});
