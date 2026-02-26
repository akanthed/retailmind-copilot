// Product detail page with price history and competitor comparison
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PriceChart } from "@/components/ui/PriceChart";
import { PageLoader } from "@/components/ui/LoadingStates";
import { ErrorState, EmptyState } from "@/components/ui/ErrorBoundary";
import { apiClient, Product, PriceHistory } from "@/api/client";
import { 
  ArrowLeft, 
  Package, 
  TrendingUp, 
  TrendingDown,
  ExternalLink,
  RefreshCw,
  AlertCircle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [product, setProduct] = useState<Product | null>(null);
  const [priceHistory, setPriceHistory] = useState<PriceHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      loadProductData();
    }
  }, [id]);

  async function loadProductData() {
    if (!id) return;
    
    setLoading(true);
    setError(null);

    try {
      // Load product details
      const productResult = await apiClient.getProduct(id);
      
      if (productResult.error) {
        setError(productResult.error);
        return;
      }

      if (productResult.data) {
        setProduct(productResult.data);
      }

      // Load price history
      const pricesResult = await apiClient.getProductPrices(id);
      
      if (pricesResult.data) {
        // Ensure it's an array
        const prices = Array.isArray(pricesResult.data) ? pricesResult.data : [];
        setPriceHistory(prices);
      } else {
        setPriceHistory([]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load product");
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <AppLayout>
        <PageLoader message="Loading product details..." />
      </AppLayout>
    );
  }

  if (error || !product) {
    return (
      <AppLayout>
        <div className="min-h-screen p-6 md:p-10 max-w-6xl mx-auto">
          <ErrorState
            title="Failed to load product"
            message={error || "Product not found"}
            onRetry={loadProductData}
          />
        </div>
      </AppLayout>
    );
  }

  // Calculate metrics
  const profitMargin = product.currentPrice > 0 
    ? (((product.currentPrice - product.costPrice) / product.currentPrice) * 100).toFixed(1)
    : "0";
  const isLowStock = product.stock < 10;
  const stockStatus = product.stock === 0 ? "Out of Stock" : isLowStock ? "Low Stock" : "In Stock";

  // Group price history by competitor
  const pricesByCompetitor = priceHistory.reduce((acc, price) => {
    if (!acc[price.competitorName]) {
      acc[price.competitorName] = [];
    }
    acc[price.competitorName].push(price);
    return acc;
  }, {} as Record<string, PriceHistory[]>);

  return (
    <AppLayout>
      <div className="min-h-screen p-6 md:p-10 max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <Button
            variant="ghost"
            onClick={() => navigate("/insights")}
            className="mb-4 -ml-2"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Insights
          </Button>

          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Package className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h1 className="text-2xl font-semibold text-foreground">{product.name}</h1>
                  <p className="text-muted-foreground">SKU: {product.sku}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 mt-3">
                <Badge variant="secondary">{product.category}</Badge>
                <Badge variant={product.stock === 0 ? "destructive" : isLowStock ? "default" : "secondary"}>
                  {stockStatus}
                </Badge>
              </div>
            </div>

            <Button onClick={loadProductData} variant="outline" className="rounded-xl">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8 animate-fade-in" style={{ animationDelay: "0.1s" }}>
          <div className="premium-card rounded-2xl p-5">
            <p className="text-sm text-muted-foreground mb-1">Current Price</p>
            <p className="text-2xl font-semibold text-foreground">₹{product.currentPrice.toLocaleString()}</p>
          </div>
          
          <div className="premium-card rounded-2xl p-5">
            <p className="text-sm text-muted-foreground mb-1">Cost Price</p>
            <p className="text-2xl font-semibold text-foreground">₹{product.costPrice.toLocaleString()}</p>
          </div>
          
          <div className="premium-card rounded-2xl p-5">
            <p className="text-sm text-muted-foreground mb-1">Profit Margin</p>
            <div className="flex items-center gap-2">
              <p className="text-2xl font-semibold text-foreground">{profitMargin}%</p>
              {parseFloat(profitMargin) > 20 ? (
                <TrendingUp className="w-5 h-5 text-success" />
              ) : (
                <TrendingDown className="w-5 h-5 text-destructive" />
              )}
            </div>
          </div>
          
          <div className="premium-card rounded-2xl p-5">
            <p className="text-sm text-muted-foreground mb-1">Stock Level</p>
            <p className="text-2xl font-semibold text-foreground">{product.stock} units</p>
          </div>
        </div>

        {/* Competitor URLs */}
        {product.competitorUrls && Object.keys(product.competitorUrls).length > 0 && (
          <div className="mb-8 animate-fade-in" style={{ animationDelay: "0.15s" }}>
            <h2 className="text-lg font-medium text-foreground mb-4">Monitored Competitors</h2>
            <div className="premium-card rounded-2xl p-6">
              <div className="space-y-3">
                {product.competitorUrls.amazon && (
                  <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-[#FF9900]/10 flex items-center justify-center">
                        <Package className="w-4 h-4 text-[#FF9900]" />
                      </div>
                      <span className="font-medium text-foreground">Amazon.in</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => window.open(product.competitorUrls?.amazon, "_blank")}
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                  </div>
                )}
                
                {product.competitorUrls.flipkart && (
                  <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-[#2874F0]/10 flex items-center justify-center">
                        <Package className="w-4 h-4 text-[#2874F0]" />
                      </div>
                      <span className="font-medium text-foreground">Flipkart</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => window.open(product.competitorUrls?.flipkart, "_blank")}
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Price History */}
        <div className="mb-8 animate-fade-in" style={{ animationDelay: "0.2s" }}>
          <h2 className="text-lg font-medium text-foreground mb-4">Price History</h2>
          {priceHistory.length > 0 ? (
            <div className="space-y-6">
              {Object.entries(pricesByCompetitor).map(([competitor, prices]) => (
                <PriceChart
                  key={competitor}
                  data={prices.map(p => ({ timestamp: p.timestamp, price: p.price }))}
                  title={`${competitor} Price Trend`}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={AlertCircle}
              title="No price history yet"
              message="Price monitoring will start collecting data soon. Check back later to see trends."
            />
          )}
        </div>

        {/* Description */}
        {product.description && (
          <div className="animate-fade-in" style={{ animationDelay: "0.25s" }}>
            <h2 className="text-lg font-medium text-foreground mb-4">Description</h2>
            <div className="premium-card rounded-2xl p-6">
              <p className="text-muted-foreground">{product.description}</p>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
