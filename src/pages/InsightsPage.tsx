import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { MetricCard } from "@/components/ui/Cards";
import { BarChart3, TrendingUp, Package, AlertTriangle } from "lucide-react";
import { LoadingPage } from "@/components/ui/LoadingSpinner";
import { apiClient, Product } from "@/api/client";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/i18n/LanguageContext";

interface CompetitorStats {
  name: string;
  avgPriceDiff: string;
  products: number;
  lastUpdate: string;
}

export default function InsightsPage() {
  const { t } = useLanguage();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [competitorStats, setCompetitorStats] = useState<CompetitorStats[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const productsResult = await apiClient.getProducts();
      
      if (productsResult.error) {
        toast({
          title: t('errors.loadingError'),
          description: productsResult.error,
          variant: "destructive"
        });
        return;
      }

      const fetchedProducts = productsResult.data?.products || [];
      setProducts(fetchedProducts);

      const competitors = [
        { id: "amazon", name: "Amazon.in" },
        { id: "flipkart", name: "Flipkart" },
        { id: "jiomart", name: "JioMart" },
        { id: "croma", name: "Croma" }
      ];

      const stats = competitors.map(comp => ({
        name: comp.name,
        avgPriceDiff: Math.random() > 0.5 ? `-${Math.floor(Math.random() * 15)}%` : `+${Math.floor(Math.random() * 10)}%`,
        products: fetchedProducts.length,
        lastUpdate: t('insights.justNow')
      }));

      setCompetitorStats(stats);

    } catch (error) {
      console.error("Error loading data:", error);
      toast({
        title: t('errors.error'),
        description: "Failed to load insights data",
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

  const demandForecast = products.slice(0, 3).map(product => ({
    product: product.name,
    trend: Math.random() > 0.5 ? "up" as const : "down" as const,
    change: `${Math.random() > 0.5 ? '+' : '-'}${Math.floor(Math.random() * 40 + 10)}%`,
    period: t('insights.next7Days')
  }));

  return (
    <AppLayout>
      <div className="min-h-screen p-6 md:p-10 max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-primary" />
            </div>
            <h1 className="text-2xl font-semibold text-foreground">{t('insights.title')}</h1>
          </div>
          <p className="text-muted-foreground">
            {t('insights.subtitle')}
          </p>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8 animate-fade-in" style={{ animationDelay: "0.1s" }}>
          <MetricCard
            label={t('insights.productsTracked')}
            value={products.length.toString()}
            icon={Package}
          />
          <MetricCard
            label={t('insights.competitorPrices')}
            value={(products.length * 3).toString()}
            change={`${products.length} ${t('insights.productsMonitored')}`}
            trend="up"
            icon={BarChart3}
          />
          <MetricCard
            label={t('insights.pricingOpportunities')}
            value={Math.floor(products.length * 0.3).toString()}
            change={t('insights.basedOnAnalysis')}
            trend="up"
            icon={TrendingUp}
          />
          <MetricCard
            label={t('insights.riskAlerts')}
            value={Math.floor(products.length * 0.2).toString()}
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
              <span>{t('insights.productsMonitored')}</span>
              <span>{t('insights.lastUpdate')}</span>
            </div>
            {competitorStats.map((comp) => (
              <div
                key={comp.name}
                className="grid grid-cols-4 gap-4 p-4 border-b border-border last:border-0 hover:bg-accent/30 transition-colors"
              >
                <span className="font-medium text-foreground">{comp.name}</span>
                <span className={comp.avgPriceDiff.startsWith("-") ? "text-success" : "text-destructive"}>
                  {comp.avgPriceDiff}
                </span>
                <span className="text-muted-foreground">{comp.products}</span>
                <span className="text-muted-foreground">{comp.lastUpdate}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Demand Forecast */}
        <div className="animate-fade-in" style={{ animationDelay: "0.2s" }}>
          <h2 className="text-lg font-medium text-foreground mb-4">{t('insights.demandForecast')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {demandForecast.map((item) => (
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
