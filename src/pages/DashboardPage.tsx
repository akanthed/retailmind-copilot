import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { AIRecommendationCard, AlertCard } from "@/components/ui/Cards";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { HelpTooltip } from "@/components/ui/HelpTooltip";
import { LoadingPage } from "@/components/ui/LoadingSpinner";
import { Sparkles, Send, Lightbulb, Loader2, Package, TrendingUp, Bell, IndianRupee, RefreshCw } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { apiClient, Recommendation, Alert, RevenueSummary, RevenueHistoryItem } from "@/api/client";
import { useToast } from "@/hooks/use-toast";
import { errorMessages, getUserFriendlyError } from "@/lib/errorMessages";
import { BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip } from "recharts";
import { useLanguage } from "@/i18n/LanguageContext";
import { RevenueKPICards } from "@/components/revenue/RevenueKPICards";
import { RevenueTrendChart } from "@/components/revenue/RevenueTrendChart";

const suggestedPrompts = [
  "dashboard.prompt1",
  "dashboard.prompt2",
  "dashboard.prompt3",
  "dashboard.prompt4",
];

export default function DashboardPage() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [revenueSummary, setRevenueSummary] = useState<RevenueSummary | null>(null);
  const [revenueHistory, setRevenueHistory] = useState<RevenueHistoryItem[]>([]);
  const [loadingRevenue, setLoadingRevenue] = useState(false);
  const [revenueError, setRevenueError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useLanguage();

  useEffect(() => {
    loadDashboardData();
    loadRevenueData();
  }, []);

  async function loadDashboardData() {
    setLoadingData(true);
    try {
      // Load products
      const productsResult = await apiClient.getProducts();
      const productsList = productsResult.data?.products || [];
      setProducts(productsList);

      // Load top 3 pending recommendations only
      const recsResult = await apiClient.getRecommendations();
      const recsList = recsResult.data?.recommendations || [];
      
      if (productsList.length > 0 && recsList.length === 0) {
        // Silent background generation
        apiClient.generateRecommendations().then(() => {
          loadRecommendations();
        });
      } else {
        // Show only top 3 highest confidence pending recommendations
        const topRecs = recsList
          .filter(r => r.status === 'pending')
          .sort((a, b) => (b.confidence || 0) - (a.confidence || 0))
          .slice(0, 3);
        setRecommendations(topRecs);
      }

      // Load top 3 most recent critical alerts only
      const alertsResult = await apiClient.getAlerts();
      const topAlerts = (alertsResult.data?.alerts || [])
        .filter(a => a.severity === 'critical' || a.severity === 'warning')
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 3);
      setAlerts(topAlerts);
    } catch (error) {
      console.error("Error:", error);
      const friendlyError = getUserFriendlyError(error);
      toast({
        title: friendlyError.title,
        description: friendlyError.description,
        variant: "destructive"
      });
    } finally {
      setLoadingData(false);
    }
  }

  async function loadRecommendations() {
    const result = await apiClient.getRecommendations();
    if (result.data) {
      const topRecs = result.data.recommendations
        .filter(r => r.status === 'pending')
        .sort((a, b) => (b.confidence || 0) - (a.confidence || 0))
        .slice(0, 3);
      setRecommendations(topRecs);
    }
  }

  async function loadRevenueData() {
    setLoadingRevenue(true);
    setRevenueError(null);
    try {
      const [summaryResult, historyResult] = await Promise.all([
        apiClient.getRevenueSummary(),
        apiClient.getRevenueHistory(30),
      ]);

      if (summaryResult.data) {
        setRevenueSummary(summaryResult.data);
      } else if (summaryResult.error) {
        // Use mock data if API not available
        setRevenueSummary({
          period: { start: '', end: '' },
          revenue_protected: 42000,
          alert_response_rate: 85.5,
          competitive_score: 7.8,
          alerts_responded: 17,
          alerts_total: 20,
        });
      }

      if (historyResult.data) {
        setRevenueHistory(historyResult.data.history);
      } else if (historyResult.error) {
        // Generate mock history data
        const mockHistory = [];
        for (let i = 29; i >= 0; i--) {
          const date = new Date();
          date.setDate(date.getDate() - i);
          mockHistory.push({
            date: date.toISOString().split('T')[0],
            revenue_protected: Math.round(1200 + Math.random() * 400),
            competitive_score: Math.round((7.0 + Math.random() * 1.5) * 10) / 10,
          });
        }
        setRevenueHistory(mockHistory);
      }
    } catch (error) {
      console.error("Error loading revenue data:", error);
      setRevenueError("Using demo data - revenue calculator not deployed");
      // Set mock data on error
      setRevenueSummary({
        period: { start: '', end: '' },
        revenue_protected: 42000,
        alert_response_rate: 85.5,
        competitive_score: 7.8,
        alerts_responded: 17,
        alerts_total: 20,
      });
      const mockHistory = [];
      for (let i = 29; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        mockHistory.push({
          date: date.toISOString().split('T')[0],
          revenue_protected: Math.round(1200 + Math.random() * 400),
          competitive_score: Math.round((7.0 + Math.random() * 1.5) * 10) / 10,
        });
      }
      setRevenueHistory(mockHistory);
    } finally {
      setLoadingRevenue(false);
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!query.trim()) {
      toast({
        title: t('dashboard.enterQuestion'),
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    setAiResponse(null);

    try {
      const result = await apiClient.queryCopilot(query);
      
      if (result.error) {
        toast({
          title: errorMessages.aiResponseFailed.title,
          description: errorMessages.aiResponseFailed.description,
          variant: "destructive"
        });
      } else if (result.data) {
        setAiResponse(result.data.response);
      }
    } catch (error) {
      const friendlyError = getUserFriendlyError(error);
      toast({
        title: friendlyError.title,
        description: friendlyError.description,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const totalInventoryValue = products.reduce((sum, p) => sum + (p.currentPrice * p.stock), 0);
  const lowStockCount = products.filter(p => p.stock < 10).length;

  // Prepare chart data
  const categoryData = products.reduce((acc: any[], product) => {
    const existing = acc.find(item => item.name === product.category);
    const value = product.currentPrice * product.stock;
    if (existing) {
      existing.value += value;
    } else {
      acc.push({ name: product.category, value });
    }
    return acc;
  }, []);

  const stockData = [
    { name: t('dashboard.inStock'), value: products.filter(p => p.stock > 10).length },
    { name: t('dashboard.lowStock'), value: products.filter(p => p.stock > 0 && p.stock <= 10).length },
    { name: t('dashboard.outOfStock'), value: products.filter(p => p.stock === 0).length },
  ].filter(item => item.value > 0);

  const COLORS = ['#10b981', '#f59e0b', '#ef4444', '#3b82f6', '#8b5cf6', '#ec4899'];

  if (loadingData) {
    return (
      <AppLayout>
        <LoadingPage message={t('dashboard.loadingDashboard')} />
      </AppLayout>
    );
  }

  const getStockColor = (index: number) => {
    if (index === 0) return '#10b981';
    if (index === 1) return '#f59e0b';
    return '#ef4444';
  };

  return (
    <AppLayout>
      <div className="min-h-screen p-6 md:p-10 max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <h1 className="text-2xl font-semibold text-foreground mb-1">
            {t('dashboard.welcome')}
          </h1>
          <p className="text-muted-foreground">
            {t('dashboard.subtitle')}
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 animate-fade-in" style={{ animationDelay: "0.05s" }}>
          <div className="premium-card rounded-2xl p-4">
            <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
              <Package className="w-4 h-4" />
              {t('dashboard.products')}
              <HelpTooltip content={t('dashboard.totalProductsTracking')} />
            </div>
            <p className="text-2xl font-bold">{products.length}</p>
          </div>
          <div className="premium-card rounded-2xl p-4">
            <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
              <IndianRupee className="w-4 h-4" />
              {t('dashboard.inventory')}
              <HelpTooltip content={t('dashboard.totalInventoryValue')} />
            </div>
            <p className="text-2xl font-bold">₹{(totalInventoryValue / 1000).toFixed(0)}K</p>
          </div>
          <div className="premium-card rounded-2xl p-4">
            <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
              <TrendingUp className="w-4 h-4" />
              {t('dashboard.actions')}
              <HelpTooltip content={t('dashboard.aiRecommendations')} />
            </div>
            <p className="text-2xl font-bold">{recommendations.length}</p>
          </div>
          <div className="premium-card rounded-2xl p-4">
            <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
              <Bell className="w-4 h-4" />
              {t('dashboard.alerts')}
              <HelpTooltip content={t('dashboard.needsAttention')} />
            </div>
            <p className="text-2xl font-bold text-warning">{lowStockCount}</p>
          </div>
        </div>

        {/* AI Assistant */}
        <form onSubmit={handleSubmit} className="mb-8 animate-fade-in" style={{ animationDelay: "0.1s" }}>
          <div className="premium-card rounded-2xl p-2 ai-glow">
            <div className="flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-primary ml-3 flex-shrink-0" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t('dashboard.askPlaceholder')}
                className="flex-1 px-2 py-4 bg-transparent text-foreground placeholder:text-muted-foreground focus:outline-none text-base"
                disabled={loading}
              />
              <Button
                type="submit"
                size="lg"
                className="rounded-xl px-6"
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </Button>
            </div>
          </div>
        </form>

        {/* AI Response */}
        {aiResponse && (
          <div className="mb-8 animate-fade-in premium-card rounded-2xl p-6">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-4 h-4 text-primary" />
              </div>
              <div className="flex-1">
                  <h3 className="font-medium text-foreground mb-2">{t('dashboard.aiResponse')}</h3>
                <div className="text-muted-foreground whitespace-pre-wrap leading-relaxed">{aiResponse}</div>
              </div>
            </div>
          </div>
        )}

        {/* Suggested Prompts */}
        {!aiResponse && (
          <div className="mb-8 animate-fade-in" style={{ animationDelay: "0.15s" }}>
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
              <Lightbulb className="w-4 h-4" />
              <span>{t('dashboard.tryAsking')}</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {suggestedPrompts.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => setQuery(t(prompt))}
                  className="px-4 py-2 rounded-xl bg-secondary text-secondary-foreground text-sm hover:bg-secondary/80 transition-colors"
                >
                  {t(prompt)}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Revenue Impact Section */}
        <div className="mb-8 animate-fade-in" style={{ animationDelay: "0.15s" }}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-semibold">{t('dashboard.revenueImpact')}</h2>
              {revenueError && (
                <Badge variant="outline" className="bg-orange-500/10 text-orange-600 border-orange-500/30">
                  📊 Demo Data
                </Badge>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={loadRevenueData}
              disabled={loadingRevenue}
            >
              <RefreshCw className={`w-4 h-4 ${loadingRevenue ? 'animate-spin' : ''}`} />
            </Button>
          </div>
          
          {revenueSummary && (
            <RevenueKPICards
              revenueProtected={revenueSummary.revenue_protected}
              responseRate={revenueSummary.alert_response_rate}
              alertsResponded={revenueSummary.alerts_responded}
              alertsTotal={revenueSummary.alerts_total}
              competitiveScore={revenueSummary.competitive_score}
              loading={loadingRevenue}
              error={revenueError || undefined}
              onRetry={loadRevenueData}
            />
          )}
          
          <div className="mt-4 premium-card rounded-2xl p-6">
            <h3 className="font-medium mb-4">{t('dashboard.thirtyDayTrend')}</h3>
            <RevenueTrendChart
              data={revenueHistory}
              loading={loadingRevenue}
              error={revenueError || undefined}
            />
          </div>
        </div>

        {/* Charts */}
        {products.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 animate-fade-in" style={{ animationDelay: "0.2s" }}>
            {/* Inventory by Category */}
            {categoryData.length > 0 && (
              <div className="premium-card rounded-2xl p-6">
                <h3 className="font-medium text-foreground mb-4">{t('dashboard.inventoryByCategory')}</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip 
                      formatter={(value: any) => `₹${value.toLocaleString('en-IN')}`}
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--popover))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex flex-wrap gap-2 mt-4">
                  {categoryData.map((item, index) => (
                    <div key={item.name} className="flex items-center gap-2 text-xs">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      />
                      <span className="text-muted-foreground">{item.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Stock Status */}
            {stockData.length > 0 && (
              <div className="premium-card rounded-2xl p-6">
                <h3 className="font-medium text-foreground mb-4">{t('dashboard.stockStatus')}</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={stockData}>
                    <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                      {stockData.map((_, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={getStockColor(index)}
                        />
                      ))}
                    </Bar>
                    <RechartsTooltip 
                      formatter={(value: any) => `${value} ${t('dashboard.products_count')}`}
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--popover))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                    />
                  </BarChart>
                </ResponsiveContainer>
                <div className="flex flex-wrap gap-3 mt-4">
                  {stockData.map((item, index) => (
                    <div key={item.name} className="flex items-center gap-2 text-xs">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: getStockColor(index) }}
                      />
                      <span className="text-muted-foreground">{item.name}: {item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Quick Actions */}
        {(recommendations.length > 0 || alerts.length > 0) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in" style={{ animationDelay: "0.25s" }}>
            {/* Actions Summary */}
            {recommendations.length > 0 && (
              <div 
                className="premium-card rounded-2xl p-6 cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => navigate("/actions")}
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium text-foreground">{t('dashboard.todaysActions')}</h3>
                  <TrendingUp className="w-5 h-5 text-primary" />
                </div>
                <p className="text-3xl font-bold mb-2">{recommendations.length}</p>
                <p className="text-sm text-muted-foreground mb-4">
                  {t('dashboard.waitingRecommendations')}
                </p>
                <Button variant="outline" size="sm" className="w-full">
                  {t('dashboard.viewActions')}
                </Button>
              </div>
            )}

            {/* Alerts Summary */}
            {alerts.length > 0 && (
              <div 
                className="premium-card rounded-2xl p-6 cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => navigate("/alerts")}
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium text-foreground">{t('dashboard.recentAlerts')}</h3>
                  <Bell className="w-5 h-5 text-warning" />
                </div>
                <p className="text-3xl font-bold mb-2">{alerts.length}</p>
                <p className="text-sm text-muted-foreground mb-4">
                  {t('dashboard.itemsNeedAttention')}
                </p>
                <Button variant="outline" size="sm" className="w-full">
                  {t('dashboard.viewAlerts')}
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
