import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { MetricCard } from "@/components/ui/Cards";
import { BarChart3, TrendingUp, Package, AlertTriangle, RefreshCw } from "lucide-react";
import { LoadingPage } from "@/components/ui/LoadingSpinner";
import { Button } from "@/components/ui/button";
import { apiClient, Product } from "@/api/client";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/i18n/LanguageContext";

interface CompetitorStats {
  name: string;
  avgPriceDiff: string;
  products: number | string;
  lastUpdate: string;
}

interface DemandForecastItem {
  product: string;
  trend: "up" | "down";
  change: string;
  period: string;
}

export default function InsightsPage() {
  const { t } = useLanguage();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [competitorStats, setCompetitorStats] = useState<CompetitorStats[]>([]);
  const [demandForecast, setDemandForecast] = useState<DemandForecastItem[]>([]);
  const [metrics, setMetrics] = useState({
    productsTracked: 0,
    competitorPrices: 0,
    pricingOpportunities: 0,
    riskAlerts: 0
  });
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      // Fetch both insights and products in parallel
      const [insightsResult, productsResult] = await Promise.all([
        apiClient.getInsights().catch(() => ({ data: null, error: 'Failed' })),
        apiClient.getProducts().catch(() => ({ data: null, error: 'Failed' }))
      ]);

      // Handle products data
      let realProducts: Product[] = [];
      if (productsResult.data) {
        const pd = productsResult.data as any;
        if (pd.products && Array.isArray(pd.products)) {
          realProducts = pd.products;
        } else if (Array.isArray(pd)) {
          realProducts = pd;
        }
      }
      setProducts(realProducts);

      // Handle insights data
      if (insightsResult.data) {
        const data = insightsResult.data as any;

        setMetrics({
          productsTracked: data.metrics?.productsTracked || realProducts.length || 0,
          competitorPrices: data.metrics?.competitorPrices || 0,
          pricingOpportunities: data.metrics?.pricingOpportunities || 0,
          riskAlerts: data.metrics?.riskAlerts || 0
        });

        setCompetitorStats(data.competitorStats || []);
        setDemandForecast(data.demandForecast || []);
      } else {
        // Fallback: compute metrics from real products
        setMetrics({
          productsTracked: realProducts.length,
          competitorPrices: 0,
          pricingOpportunities: 0,
          riskAlerts: realProducts.filter(p => (p as any).stockDays !== undefined ? (p as any).stockDays < 5 : p.stock < 10).length
        });
      }

      // If no demand forecast from API, generate from real products
      if (realProducts.length > 0) {
        const existingForecast = insightsResult.data ? (insightsResult.data as any).demandForecast : null;
        if (!existingForecast || existingForecast.length === 0) {
          const forecastFromProducts = realProducts.slice(0, 5).map((product, index) => {
            const isHighDemand = product.stock < 15;
            // Deterministic change based on product stock level
            const changeValue = isHighDemand
              ? Math.min(10 + (product.stock * 2), 40)
              : Math.min(5 + ((product.stock - 15) % 20), 25);
            return {
              product: product.name,
              trend: (isHighDemand ? "up" : "down") as "up" | "down",
              change: isHighDemand ? `+${changeValue}%` : `-${changeValue}%`,
              period: t('insights.next7Days')
            };
          });
          setDemandForecast(forecastFromProducts);
        }
      }

    } catch (error) {
      console.error("Error loading data:", error);
      toast({
        title: t('errors.error'),
        description: "Failed to load insights data. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <AppLayout>
        <LoadingPage message={t('insights.loadingInsights')} />
      </AppLayout>
    );
  }

  const demandForecastDisplay = demandForecast.length > 0 ? demandForecast : products.slice(0, 3).map(product => ({
    product: product.name,
    trend: (product.stock < 15 ? "up" : "down") as "up" | "down",
    change: product.stock < 15 ? `+${Math.min(10 + (product.stock * 2), 40)}%` : `-${Math.min(5 + ((product.stock - 15) % 20), 25)}%`,
    period: t('insights.next7Days')
  }));

  return (
    <AppLayout>
      <div className="min-h-screen p-6 md:p-10 max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold text-foreground">{t('insights.title')}</h1>
                <p className="text-muted-foreground">{t('insights.subtitle')}</p>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={loadData} disabled={loading}>
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 animate-fade-in" style={{ animationDelay: "0.1s" }}>
          <MetricCard
            label={t('insights.productsTracked')}
            value={String(metrics.productsTracked)}
            icon={Package}
          />
          <MetricCard
            label={t('insights.competitorPrices')}
            value={String(metrics.competitorPrices)}
            change={t('insights.basedOnAnalysis')}
            trend="up"
            icon={BarChart3}
          />
          <MetricCard
            label={t('insights.pricingOpportunities')}
            value={String(metrics.pricingOpportunities)}
            change={t('insights.basedOnAnalysis')}
            trend="up"
            icon={TrendingUp}
          />
          <MetricCard
            label={t('insights.riskAlerts')}
            value={String(metrics.riskAlerts)}
            change={t('insights.activeMonitoring')}
            trend="down"
            icon={AlertTriangle}
          />
        </div>

        {/* Competitor Intelligence */}
        <div className="mb-8 animate-fade-in" style={{ animationDelay: "0.15s" }}>
          <h2 className="text-lg font-medium text-foreground mb-4">{t('insights.competitorPriceIntelligence')}</h2>
          <div className="premium-card rounded-2xl overflow-hidden">
            <div className="grid grid-cols-4 gap-4 p-4 border-b border-border text-sm font-medium text-muted-foreground">
              <span>{t('insights.competitor')}</span>
              <span>{t('insights.avgPriceDifference')}</span>
              <span>{t('insights.productsTracked')}</span>
              <span>{t('insights.lastUpdate')}</span>
            </div>
            {competitorStats.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                {products.length === 0
                  ? t('insights.noProducts')
                  : t('insights.noCompetitorData')}
              </div>
            ) : (
              competitorStats.map((comp) => (
                <div
                  key={comp.name}
                  className="grid grid-cols-4 gap-4 p-4 border-b border-border last:border-0 hover:bg-accent/30 transition-colors"
                >
                  <span className="font-medium text-foreground">{comp.name}</span>
                  <span className={String(comp.avgPriceDiff).startsWith("-") ? "text-success" : "text-destructive"}>
                    {comp.avgPriceDiff}
                  </span>
                  <span className="text-muted-foreground">{comp.products}</span>
                  <span className="text-muted-foreground">
                    {comp.lastUpdate ? new Date(comp.lastUpdate).toLocaleString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    }) : t('insights.justNow')}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Demand Forecast */}
        <div className="animate-fade-in" style={{ animationDelay: "0.2s" }}>
          <h2 className="text-lg font-medium text-foreground mb-4">{t('insights.demandForecast')}</h2>
          {demandForecastDisplay.length === 0 ? (
            <div className="premium-card rounded-2xl p-8 text-center text-muted-foreground">
              {t('insights.noProducts')}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {demandForecastDisplay.map((item) => (
                <div key={item.product} className="premium-card rounded-2xl p-5">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-muted-foreground">{item.period}</span>
                    <div className={`flex items-center gap-1 text-sm font-medium ${item.trend === "up" ? "text-success" : "text-destructive"}`}>
                      {item.trend === "up" ? <TrendingUp className="w-4 h-4" /> : <TrendingUp className="w-4 h-4 rotate-180" />}
                      {item.change}
                    </div>
                  </div>
                  <h3 className="font-medium text-foreground">{item.product}</h3>
                  <div className="mt-4 h-2 bg-secondary rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${item.trend === "up" ? "bg-success" : "bg-destructive"}`}
                      style={{ width: item.trend === "up" ? "75%" : "35%" }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Confidence Note */}
        <div className="mt-8 p-4 bg-secondary/50 rounded-xl text-center animate-fade-in" style={{ animationDelay: "0.25s" }}>
          <p className="text-sm text-muted-foreground">
            {t('insights.confidenceNote')}
          </p>
        </div>
      </div>
    </AppLayout>
  );
}
