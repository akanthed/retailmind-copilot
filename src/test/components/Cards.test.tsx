import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AIRecommendationCard, AlertCard } from '@/components/ui/Cards';

describe('Cards Components', () => {
  describe('AIRecommendationCard', () => {
    const mockRecommendation = {
      id: 'rec-001',
      title: 'Lower price on iPhone 15',
      product: 'IPHONE-15 • Electronics',
      reason: 'You are 15% above market average',
      impact: '+₹2000/month estimated',
      confidence: 87,
      status: 'pending' as const
    };

    it('should render recommendation details', () => {
      render(<AIRecommendationCard {...mockRecommendation} />);
      
      expect(screen.getByText('Lower price on iPhone 15')).toBeInTheDocument();
      expect(screen.getByText('IPHONE-15 • Electronics')).toBeInTheDocument();
      expect(screen.getByText('You are 15% above market average')).toBeInTheDocument();
    });

    it('should display confidence score', () => {
      render(<AIRecommendationCard {...mockRecommendation} />);
      
      expect(screen.getByText(/87%/)).toBeInTheDocument();
    });

    it('should show impact estimation', () => {
      render(<AIRecommendationCard {...mockRecommendation} />);
      
      expect(screen.getByText('+₹2000/month estimated')).toBeInTheDocument();
    });

    it('should handle click events', () => {
      const handleClick = vi.fn();
      render(<AIRecommendationCard {...mockRecommendation} onClick={handleClick} />);
      
      const card = screen.getByText('Lower price on iPhone 15').closest('div');
      card?.click();
      
      expect(handleClick).toHaveBeenCalled();
    });

    it('should display implemented status', () => {
      render(<AIRecommendationCard {...mockRecommendation} status="implemented" />);
      
      expect(screen.getByText(/done/i)).toBeInTheDocument();
    });
  });

  describe('AlertCard', () => {
    const mockAlert = {
      type: 'price_drop' as const,
      title: 'Competitor price drop',
      description: 'Amazon reduced price by 15%',
      timestamp: '2 hours ago',
      suggestion: 'Consider matching to maintain market share'
    };

    it('should render alert details', () => {
      render(<AlertCard {...mockAlert} />);
      
      expect(screen.getByText('Competitor price drop')).toBeInTheDocument();
      expect(screen.getByText('Amazon reduced price by 15%')).toBeInTheDocument();
    });

    it('should display timestamp', () => {
      render(<AlertCard {...mockAlert} />);
      
      expect(screen.getByText('2 hours ago')).toBeInTheDocument();
    });

    it('should show suggestion', () => {
      render(<AlertCard {...mockAlert} />);
      
      expect(screen.getByText(/consider matching/i)).toBeInTheDocument();
    });

    it('should apply correct styling for alert types', () => {
      const { rerender } = render(<AlertCard {...mockAlert} type="price_drop" />);
      expect(screen.getByText('Competitor price drop')).toBeInTheDocument();
      
      rerender(<AlertCard {...mockAlert} type="stock_risk" />);
      expect(screen.getByText('Competitor price drop')).toBeInTheDocument();
      
      rerender(<AlertCard {...mockAlert} type="opportunity" />);
      expect(screen.getByText('Competitor price drop')).toBeInTheDocument();
    });
  });
});
