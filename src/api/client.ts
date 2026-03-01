// API Client for RetailMind AI Backend
// This connects your frontend to AWS Lambda functions

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://YOUR_API_URL.execute-api.us-east-1.amazonaws.com/dev';

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

// Retry configuration
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

async function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchWithRetry(url: string, options: RequestInit, retries = MAX_RETRIES): Promise<Response> {
  try {
    const response = await fetch(url, options);
    
    // Retry on 5xx errors or network issues
    if (response.status >= 500 && retries > 0) {
      console.warn(`Request failed with ${response.status}, retrying... (${retries} attempts left)`);
      await sleep(RETRY_DELAY);
      return fetchWithRetry(url, options, retries - 1);
    }
    
    return response;
  } catch (error) {
    // Network error - retry if attempts remaining
    if (retries > 0) {
      console.warn(`Network error, retrying... (${retries} attempts left)`, error);
      await sleep(RETRY_DELAY);
      return fetchWithRetry(url, options, retries - 1);
    }
    throw error;
  }
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
  validUntil?: string | null;
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
  matchScore?: number;
  matchType?: 'exact' | 'approximate' | 'mismatch' | 'missing';
  extractedCapacity?: string;
  capacityMatch?: boolean;
  aiScore?: number;
  aiRank?: number;
  aiReason?: string;
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
  gst?: {
    current: GSTBreakdown;
    suggested: GSTBreakdown;
  };
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

export interface DemandForecast {
  productId: string;
  productName: string;
  sku: string;
  category: string;
  currentStock: number;
  forecastPeriod: string;
  generatedAt: number;
  summary: {
    totalPredictedDemand: number;
    avgDailyDemand: number;
    maxDemand: number;
    minDemand: number;
    daysUntilStockout: number;
    stockoutRisk: 'low' | 'medium' | 'high' | 'critical';
    confidence: number;
  };
  dailyForecasts: Array<{
    date: string;
    predictedDemand: number;
    confidence: number;
    festival: string | null;
    festivalImpact: number;
    dayOfWeek: string;
  }>;
  peakPeriods: Array<{
    date: string;
    festival: string;
    expectedDemand: number;
    impact: number;
  }>;
  recommendations: Array<{
    type: string;
    priority: string;
    message: string;
    action: string;
    impact: string;
  }>;
  methodology: string;
}

export interface RevenueSummary {
  revenue_protected: number;
  alert_response_rate: number;
  competitive_score: number;
  period: {
    start: string;
    end: string;
  };
  alerts_responded: number;
  alerts_total: number;
}

export interface RevenueHistoryItem {
  date: string;
  revenue_protected: number;
  competitive_score: number;
}

export interface GSTBreakdown {
  priceIncludingGST: number;
  priceExcludingGST: number;
  gstAmount: number;
  gstRate: number;
  gstPercentage: string;
}

export interface UrlValidationEntry {
  present: boolean;
  validFormat: boolean;
  domainMatches: boolean;
  reachable: boolean | null;
  status: number | null;
  error: string | null;
  url: string;
}

export interface ProductUrlValidationDetail {
  productId: string;
  productName: string;
  sku: string;
  hasAnyUrl: boolean;
  hasBothUrls: boolean;
  invalidCount: number;
  unreachableCount: number;
  amazon: UrlValidationEntry;
  flipkart: UrlValidationEntry;
}

export interface UrlValidationSummary {
  checkedAt: string;
  totalProducts: number;
  productsWithAnyUrl: number;
  productsWithBothUrls: number;
  productsMissingUrls: number;
  invalidFormatCount: number;
  unreachableCount: number;
  validReachableCount: number;
  issueCount: number;
  details: ProductUrlValidationDetail[];
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
      const method = (options.method || 'GET').toUpperCase();
      const shouldSetJsonContentType = Boolean(options.body) && method !== 'GET' && method !== 'HEAD';

      const response = await fetchWithRetry(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers: {
          ...(shouldSetJsonContentType ? { 'Content-Type': 'application/json' } : {}),
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
      
      // Provide user-friendly error messages
      let errorMessage = 'An unknown error occurred';
      if (error instanceof Error) {
        if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
          errorMessage = 'Network error. Please check your internet connection.';
        } else if (error.message.includes('timeout')) {
          errorMessage = 'Request timed out. Please try again.';
        } else {
          errorMessage = error.message;
        }
      }
      
      return { error: errorMessage };
    }
  }

  // AI Copilot
  async queryCopilot(query: string, language: 'en' | 'hi' = 'en'): Promise<ApiResponse<CopilotResponse>> {
    return this.request<CopilotResponse>('/copilot', {
      method: 'POST',
      body: JSON.stringify({ query, language }),
    });
  }

  // Products
  async getProducts(): Promise<ApiResponse<{ products: Product[]; count: number }>> {
    return this.request('/products', { method: 'GET' });
  }

  async validateProductUrls(): Promise<ApiResponse<{ products: Product[]; pagination: { totalCount: number; pageSize: number; currentPage: number; totalPages: number }; urlValidation: UrlValidationSummary | null }>> {
    return this.request('/products?validateUrls=true&pageSize=100', { method: 'GET' });
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

  async searchCompetitorPrices(productId: string, params: { keywords?: string; amazonUrl?: string; flipkartUrl?: string }): Promise<ApiResponse<{ results: PriceComparison[]; resultsCount: number; source: string; searchQuery?: string; attemptedQueries?: string[]; debugAttempts?: any[]; liveDataAvailable?: boolean; syntheticFallbackUsed?: boolean; directUrlUsed?: boolean; fallbackEnabled?: boolean }>> {
    try {
      const response = await fetchWithRetry(`${this.baseUrl}/products/${productId}/compare/search`, {
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

  async getInsights(): Promise<ApiResponse<any>> {
    return this.request('/analytics/insights', { method: 'GET' });
  }

  // Demand Forecasting
  async getForecasts(): Promise<ApiResponse<{ forecasts: DemandForecast[]; count: number }>> {
    return this.request('/forecast', { method: 'GET' });
  }

  async getForecast(productId: string): Promise<ApiResponse<{ forecast: DemandForecast }>> {
    return this.request(`/forecast/${productId}`, { method: 'GET' });
  }

  async generateForecasts(productId?: string): Promise<ApiResponse<{ message: string; forecasts: DemandForecast[] }>> {
    return this.request('/forecast/generate', {
      method: 'POST',
      body: JSON.stringify({ productId }),
    });
  }

  // Revenue Impact
  async getRevenueSummary(startDate?: string, endDate?: string): Promise<ApiResponse<RevenueSummary>> {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    
    const query = params.toString() ? `?${params.toString()}` : '';
    return this.request<RevenueSummary>(`/revenue/summary${query}`, { method: 'GET' });
  }

  async getRevenueHistory(days: number = 30): Promise<ApiResponse<{ history: RevenueHistoryItem[]; count: number }>> {
    return this.request(`/revenue/history?days=${days}`, { method: 'GET' });
  }
}

export const apiClient = new ApiClient(API_BASE_URL);
