import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { SimpleProductForm } from '@/components/forms/SimpleProductForm';
import { LanguageProvider } from '@/i18n/LanguageContext';

// Wrapper component with LanguageProvider
const renderWithProviders = (ui: React.ReactElement) => {
  return render(
    <LanguageProvider>
      {ui}
    </LanguageProvider>
  );
};

describe('SimpleProductForm', () => {
  const mockOnSubmit = vi.fn();
  const mockOnCancel = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render form with basic fields', () => {
    renderWithProviders(<SimpleProductForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);
    
    // Check for form elements by placeholder or role
    expect(screen.getByRole('form')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
  });

  it('should handle form submission', async () => {
    renderWithProviders(<SimpleProductForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);
    
    const nameInput = screen.getByPlaceholderText(/enter product name/i);
    const priceInput = screen.getByPlaceholderText(/enter selling price/i);
    const stockInput = screen.getByPlaceholderText(/enter stock quantity/i);
    
    fireEvent.change(nameInput, { target: { value: 'Test Product' } });
    fireEvent.change(priceInput, { target: { value: '1000' } });
    fireEvent.change(stockInput, { target: { value: '50' } });
    
    const submitButton = screen.getByRole('button', { name: /add product/i });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalled();
    });
  });

  it('should call onCancel when cancel button clicked', () => {
    renderWithProviders(<SimpleProductForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);
    
    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    fireEvent.click(cancelButton);
    
    expect(mockOnCancel).toHaveBeenCalled();
  });
});
