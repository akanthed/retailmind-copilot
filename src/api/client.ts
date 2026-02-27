// API Client for RetailMind AI Backend
// This connects your frontend to AWS Lambda functions

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://YOUR_API_URL.execute-api.us-east-1.amazonaws.com/dev';

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

export interface CopilotResponse {
  query: string;
  response: string;
  timestamp: string;
  model: string;
  confidence: number;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  currentPrice: number;
  costPrice: number;
  stock: number;
  stockDays: number;
  competitors?: string[];
  amazonUrl?: string;
  flipkartUrl?: string;
  keywords?: string;
  createdAt: number;
  updatedAt: number;
}

export interface PriceComparison {
  platform: string;
  title: string;
  price: number;
  url: string;
  inStock: boolean;
  lastChecked: string;
  priceDiff: number;
  priceDiffPercent: number;
  source: string;
}

export interface PriceHistory {
  id: string;
  productId: string;
  productName: string;
  competitorId: string;
  competitorName: string;
  price: number;
  inStock: boolean;
  timestamp: number;
  source: string;
}

export interface Recommendation {
  id: string;
  productId: string;
  type: 'price_decrease' | 'price_increase' | 'restock' | 'promotion';
  title: string;
  product: string;
  reason: string;
  suggestedPrice?: number;
  currentPrice?: number;
  suggestedAction?: string;
  currentStock?: number;
  impact: string;
  confidence: number;
  status: 'pending' | 'implemented' | 'dismissed';
  createdAt: number;
  updatedAt: number;
  implementedAt?: number;
}

export interface Alert {
  id: string;
  type: 'price_drop' | 'stock_risk' | 'opportunity';
  severity: 'critical' | 'warning' | 'info';
  title: string;
  description: string;
  productId: string;
  productName: string;
  suggestion: string;
  data: Record<string, any>;
  acknowledged: boolean;
  createdAt: number;
  acknowledgedAt?: number;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message ||
          errorData.error ||
          `HTTP ${response.status}: ${response.statusText}`
        );
      }

      const data = await response.json();
      return { data };
    } catch (error) {
      console.error('API Error:', error);
      return {
        error: error instanceof Error ? error.message : 'An unknown error occurred',
      };
    }
  }

  // AI Copilot
  async queryCopilot(query: string): Promise<ApiResponse<CopilotResponse>> {
    return this.request<CopilotResponse>('/copilot', {
      method: 'POST',
      body: JSON.stringify({ query }),
    });
  }

  // Products
  async getProducts(): Promise<ApiResponse<{ products: Product[]; count: number }>> {
    return this.request('/products', { method: 'GET' });
  }

  async getProduct(productId: string): Promise<ApiResponse<Product>> {
    return this.request(`/products/${productId}`, { method: 'GET' });
  }

  async createProduct(data: Partial<Product>): Promise<ApiResponse<Product>> {
    return this.request('/products', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateProduct(productId: string, data: Partial<Product>): Promise<ApiResponse<Product>> {
    return this.request(`/products/${productId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteProduct(productId: string): Promise<ApiResponse<{ message: string }>> {
    return this.request(`/products/${productId}`, { method: 'DELETE' });
  }

  async getProductPrices(productId: string): Promise<ApiResponse<PriceHistory[]>> {
    return this.request(`/products/${productId}/prices`, { method: 'GET' });
  }

  // Price Comparison
  async getProductPriceComparison(productId: string): Promise<ApiResponse<{ comparisons: PriceComparison[]; count: number }>> {
    return this.request(`/products/${productId}/compare`, { method: 'GET' });
  }

  async searchCompetitorPrices(productId: string, params: { keywords?: string; amazonUrl?: string; flipkartUrl?: string }): Promise<ApiResponse<{ results: PriceComparison[]; resultsCount: number; source: string; searchQuery?: string; attemptedQueries?: string[]; debugAttempts?: any[] }>> {
    try {
      const response = await fetch(`${this.baseUrl}/products/${productId}/compare/search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        return {
          data,
          error: data?.message || data?.error || `HTTP ${response.status}: ${response.statusText}`,
        };
      }

      return { data };
    } catch (error) {
      console.error('API Error:', error);
      return {
        error: error instanceof Error ? error.message : 'An unknown error occurred',
      };
    }
  }

  // Recommendations
  async getRecommendations(): Promise<ApiResponse<{ recommendations: Recommendation[]; count: number }>> {
    return this.request('/recommendations', { method: 'GET' });
  }

  async getRecommendation(id: string): Promise<ApiResponse<Recommendation>> {
    return this.request(`/recommendations/${id}`, { method: 'GET' });
  }

  async generateRecommendations(): Promise<ApiResponse<{ message: string; recommendationsGenerated: number; recommendations: Recommendation[] }>> {
    return this.request('/recommendations/generate', { method: 'POST' });
  }

  async implementRecommendation(id: string): Promise<ApiResponse<Recommendation>> {
    return this.request(`/recommendations/${id}/implement`, { method: 'POST' });
  }

  // Alerts
  async getAlerts(): Promise<ApiResponse<{ alerts: Alert[]; count: number }>> {
    return this.request('/alerts', { method: 'GET' });
  }

  async getAlert(id: string): Promise<ApiResponse<Alert>> {
    return this.request(`/alerts/${id}`, { method: 'GET' });
  }

  async generateAlerts(): Promise<ApiResponse<{ message: string; alertsGenerated: number; alerts: Alert[] }>> {
    return this.request('/alerts/generate', { method: 'POST' });
  }

  async acknowledgeAlert(id: string): Promise<ApiResponse<Alert>> {
    return this.request(`/alerts/${id}/acknowledge`, { method: 'POST' });
  }

  async getAlertStats(): Promise<ApiResponse<{
    total: number;
    byType: Record<string, number>;
    bySeverity: Record<string, number>;
    acknowledged: number;
    unacknowledged: number;
  }>> {
    return this.request('/alerts/stats', { method: 'GET' });
  }

  // Analytics
  async getAnalyticsOverview(): Promise<ApiResponse<any>> {
    return this.request('/analytics/overview', { method: 'GET' });
  }

  async getRevenueAnalytics(): Promise<ApiResponse<any>> {
    return this.request('/analytics/revenue', { method: 'GET' });
  }

  async getOutcomes(): Promise<ApiResponse<any>> {
    return this.request('/analytics/outcomes', { method: 'GET' });
  }
}

export const apiClient = new ApiClient(API_BASE_URL);
