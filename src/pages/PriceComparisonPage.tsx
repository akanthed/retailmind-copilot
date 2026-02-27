import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  Loader2,
  RefreshCw,
  ExternalLink,
  IndianRupee,
  ShoppingCart,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Globe,
  Search,
} from "lucide-react";
import { apiClient, Product, PriceHistory } from "@/api/client";
import { useToast } from "@/hooks/use-toast";

interface CompetitorPrice {
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

export default function PriceComparisonPage() {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [product, setProduct] = useState<Product | null>(null);
  const [competitorPrices, setCompetitorPrices] = useState<CompetitorPrice[]>([]);
  const [priceHistory, setPriceHistory] = useState<PriceHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    if (productId) {
      loadProductData();
    }
  }, [productId]);

  async function loadProductData() {
    setLoading(true);
    try {
      // Load product details
      const productResult = await apiClient.getProduct(productId!);
      if (productResult.error) {
        toast({
          title: "Error",
          description: "Product not found",
          variant: "destructive",
        });
        navigate("/products");
        return;
      }
      setProduct(productResult.data!);

      // Load price comparison data
      const priceResult = await apiClient.getProductPriceComparison(productId!);
      if (priceResult.data) {
        setCompetitorPrices(priceResult.data.comparisons || []);
      }

      // Load price history
      const historyResult = await apiClient.getProductPrices(productId!);
      if (historyResult.data) {
        setPriceHistory(
          Array.isArray(historyResult.data)
            ? historyResult.data
            : (historyResult.data as any).priceHistory || []
        );
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSearchPrices() {
    if (!product) return;
    setSearching(true);
    try {
      const result = await apiClient.searchCompetitorPrices(productId!, {
        keywords: (product as any).keywords || product.name,
        amazonUrl: (product as any).amazonUrl,
        flipkartUrl: (product as any).flipkartUrl,
      });

      if (result.error) {
        toast({
          title: "Search Error",
          description: result.error,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Prices Updated",
        description: `Found ${result.data?.results?.length || 0} competitor prices`,
      });

      // Reload data
      loadProductData();
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Error",
        description: "Failed to search competitor prices",
        variant: "destructive",
      });
    } finally {
      setSearching(false);
    }
  }

  if (loading) {
    return (
      <AppLayout>
        <div className="min-h-screen p-6 md:p-10 max-w-6xl mx-auto flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Loading price comparison...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (!product) return null;

  const lowestCompetitor = competitorPrices.length
    ? competitorPrices.reduce((min, p) => (p.price < min.price ? p : min), competitorPrices[0])
    : null;
  const highestCompetitor = competitorPrices.length
    ? competitorPrices.reduce((max, p) => (p.price > max.price ? p : max), competitorPrices[0])
    : null;
  const avgCompetitorPrice = competitorPrices.length
    ? competitorPrices.reduce((sum, p) => sum + p.price, 0) / competitorPrices.length
    : 0;

  const isYourPriceLowest = lowestCompetitor
    ? product.currentPrice <= lowestCompetitor.price
    : true;
  const pricePosition = lowestCompetitor
    ? ((product.currentPrice - lowestCompetitor.price) / lowestCompetitor.price) * 100
    : 0;

  return (
    <AppLayout>
      <div className="min-h-screen p-6 md:p-10 max-w-6xl mx-auto">
        {/* Back Button & Header */}
        <div className="mb-8 animate-fade-in">
          <Button
            variant="ghost"
            onClick={() => navigate("/products")}
            className="mb-4 gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Products
          </Button>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-foreground">
                {product.name}
              </h1>
              <p className="text-muted-foreground">
                SKU: {product.sku} · {product.category}
              </p>
            </div>
            <Button
              onClick={handleSearchPrices}
              disabled={searching}
              className="gap-2"
            >
              {searching ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Searching...
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  Search Prices Now
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Price Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 animate-fade-in" style={{ animationDelay: "0.05s" }}>
          <div className="premium-card rounded-2xl p-4">
            <p className="text-muted-foreground text-sm mb-1">Your Price</p>
            <p className="text-2xl font-bold text-primary">
              ₹{product.currentPrice.toLocaleString("en-IN")}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Cost: ₹{product.costPrice.toLocaleString("en-IN")}
            </p>
          </div>

          <div className="premium-card rounded-2xl p-4">
            <p className="text-muted-foreground text-sm mb-1">Lowest Found</p>
            {lowestCompetitor ? (
              <>
                <p className="text-2xl font-bold text-green-500">
                  ₹{lowestCompetitor.price.toLocaleString("en-IN")}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {lowestCompetitor.platform}
                </p>
              </>
            ) : (
              <p className="text-lg text-muted-foreground">No data yet</p>
            )}
          </div>

          <div className="premium-card rounded-2xl p-4">
            <p className="text-muted-foreground text-sm mb-1">
              Average Market Price
            </p>
            {avgCompetitorPrice > 0 ? (
              <>
                <p className="text-2xl font-bold">
                  ₹{Math.round(avgCompetitorPrice).toLocaleString("en-IN")}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Across {competitorPrices.length} listings
                </p>
              </>
            ) : (
              <p className="text-lg text-muted-foreground">No data yet</p>
            )}
          </div>

          <div className="premium-card rounded-2xl p-4">
            <p className="text-muted-foreground text-sm mb-1">
              Your Position
            </p>
            {competitorPrices.length > 0 ? (
              <>
                <div className="flex items-center gap-2">
                  {isYourPriceLowest ? (
                    <Badge className="bg-green-500/10 text-green-500 border-green-500/20">
                      <TrendingDown className="w-3 h-3 mr-1" />
                      Lowest
                    </Badge>
                  ) : (
                    <Badge className="bg-orange-500/10 text-orange-500 border-orange-500/20">
                      <TrendingUp className="w-3 h-3 mr-1" />
                      {pricePosition.toFixed(1)}% higher
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  vs. {competitorPrices.length} competitors
                </p>
              </>
            ) : (
              <p className="text-lg text-muted-foreground">—</p>
            )}
          </div>
        </div>

        {/* Competitor Prices Table */}
        <div className="premium-card rounded-2xl overflow-hidden mb-6 animate-fade-in" style={{ animationDelay: "0.1s" }}>
          <div className="p-4 border-b border-border">
            <h2 className="font-semibold flex items-center gap-2">
              <Globe className="w-5 h-5 text-primary" />
              Competitor Prices
            </h2>
            <p className="text-sm text-muted-foreground">
              Prices found across e-commerce platforms for this product
            </p>
          </div>

          {competitorPrices.length === 0 ? (
            <div className="p-12 text-center">
              <ShoppingCart className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">
                No competitor prices yet
              </h3>
              <p className="text-muted-foreground mb-4">
                Click "Search Prices Now" to find this product on Amazon,
                Flipkart, and other platforms
              </p>
              <Button
                onClick={handleSearchPrices}
                disabled={searching}
                className="gap-2"
              >
                <Search className="w-4 h-4" />
                Search Prices
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Platform</TableHead>
                  <TableHead>Product Title</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                  <TableHead className="text-right">vs. Your Price</TableHead>
                  <TableHead className="text-center">Stock</TableHead>
                  <TableHead className="text-center">Source</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {/* Your price row */}
                <TableRow className="bg-primary/5">
                  <TableCell>
                    <Badge variant="default">Your Store</Badge>
                  </TableCell>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell className="text-right font-bold text-primary">
                    ₹{product.currentPrice.toLocaleString("en-IN")}
                  </TableCell>
                  <TableCell className="text-right">
                    <Minus className="w-4 h-4 mx-auto text-muted-foreground" />
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge
                      variant={product.stock > 0 ? "default" : "destructive"}
                    >
                      {product.stock > 0 ? `${product.stock} units` : "Out of Stock"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center text-muted-foreground text-sm">
                    —
                  </TableCell>
                  <TableCell></TableCell>
                </TableRow>

                {/* Competitor rows */}
                {competitorPrices.map((comp, idx) => (
                  <TableRow key={idx}>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={getPlatformColor(comp.platform)}
                      >
                        {comp.platform}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <p className="max-w-xs truncate">{comp.title}</p>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      ₹{comp.price.toLocaleString("en-IN")}
                    </TableCell>
                    <TableCell className="text-right">
                      {comp.priceDiff < 0 ? (
                        <span className="flex items-center justify-end gap-1 text-green-500">
                          <ArrowDownRight className="w-3 h-3" />₹
                          {Math.abs(comp.priceDiff).toLocaleString("en-IN")} (
                          {Math.abs(comp.priceDiffPercent).toFixed(1)}% cheaper)
                        </span>
                      ) : comp.priceDiff > 0 ? (
                        <span className="flex items-center justify-end gap-1 text-red-500">
                          <ArrowUpRight className="w-3 h-3" />₹
                          {comp.priceDiff.toLocaleString("en-IN")} (
                          {comp.priceDiffPercent.toFixed(1)}% more)
                        </span>
                      ) : (
                        <span className="text-muted-foreground">Same</span>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge
                        variant={comp.inStock ? "default" : "destructive"}
                        className={
                          comp.inStock
                            ? "bg-green-500/10 text-green-500 border-green-500/20"
                            : ""
                        }
                      >
                        {comp.inStock ? "In Stock" : "Out of Stock"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge
                        variant="outline"
                        className={
                          comp.source === "live"
                            ? "text-green-500 border-green-500/30"
                            : "text-muted-foreground"
                        }
                      >
                        {comp.source === "live" ? "Live" : "Cached"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {comp.url && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => window.open(comp.url, "_blank")}
                          title="View on platform"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>

        {/* Price History */}
        {priceHistory.length > 0 && (
          <div className="premium-card rounded-2xl p-4 animate-fade-in" style={{ animationDelay: "0.15s" }}>
            <h2 className="font-semibold mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Price History
            </h2>
            <div className="space-y-2">
              {priceHistory.slice(0, 10).map((entry, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 rounded-xl bg-secondary/50"
                >
                  <div>
                    <p className="font-medium text-sm">
                      {entry.competitorName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(entry.timestamp).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">
                      ₹{entry.price.toLocaleString("en-IN")}
                    </p>
                    <Badge
                      variant="outline"
                      className={
                        entry.inStock
                          ? "text-green-500 border-green-500/30"
                          : "text-red-500 border-red-500/30"
                      }
                    >
                      {entry.inStock ? "In Stock" : "Out of Stock"}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* AI Recommendation */}
        {competitorPrices.length > 0 && (
          <div className="mt-6 premium-card rounded-2xl p-6 border-l-4 border-l-primary animate-fade-in" style={{ animationDelay: "0.2s" }}>
            <h2 className="font-semibold mb-2 flex items-center gap-2">
              <IndianRupee className="w-5 h-5 text-primary" />
              AI Pricing Recommendation
            </h2>
            {isYourPriceLowest ? (
              <div>
                <p className="text-green-500 font-medium">
                  You have the lowest price in the market!
                </p>
                <p className="text-muted-foreground text-sm mt-1">
                  Your price of ₹{product.currentPrice.toLocaleString("en-IN")}{" "}
                  is lower than all {competitorPrices.length} competitors. You
                  could potentially increase your price by up to ₹
                  {lowestCompetitor
                    ? Math.round(
                        (lowestCompetitor.price - product.currentPrice) * 0.5
                      ).toLocaleString("en-IN")
                    : "—"}{" "}
                  and still remain competitive.
                </p>
              </div>
            ) : (
              <div>
                <p className="text-orange-500 font-medium">
                  Competitors are pricing lower
                </p>
                <p className="text-muted-foreground text-sm mt-1">
                  {lowestCompetitor?.platform} is selling at ₹
                  {lowestCompetitor?.price.toLocaleString("en-IN")} — that's ₹
                  {Math.abs(
                    product.currentPrice - (lowestCompetitor?.price || 0)
                  ).toLocaleString("en-IN")}{" "}
                  less than your price. Consider adjusting to ₹
                  {Math.round(
                    (lowestCompetitor?.price || product.currentPrice) * 0.99
                  ).toLocaleString("en-IN")}{" "}
                  to win the price-conscious buyer.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </AppLayout>
  );
}

function getPlatformColor(platform: string): string {
  const lower = platform.toLowerCase();
  if (lower.includes("amazon"))
    return "bg-orange-500/10 text-orange-500 border-orange-500/20";
  if (lower.includes("flipkart"))
    return "bg-blue-500/10 text-blue-500 border-blue-500/20";
  if (lower.includes("jiomart"))
    return "bg-purple-500/10 text-purple-500 border-purple-500/20";
  if (lower.includes("meesho"))
    return "bg-pink-500/10 text-pink-500 border-pink-500/20";
  if (lower.includes("croma"))
    return "bg-green-500/10 text-green-500 border-green-500/20";
  if (lower.includes("reliance"))
    return "bg-indigo-500/10 text-indigo-500 border-indigo-500/20";
  return "bg-muted text-muted-foreground";
}
