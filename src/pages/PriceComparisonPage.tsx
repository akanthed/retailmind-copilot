import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/i18n/LanguageContext";
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
import { errorMessages, getUserFriendlyError } from "@/lib/errorMessages";
import { DataFreshness } from "@/components/ui/DataFreshness";
import { LoadingPage } from "@/components/ui/LoadingSpinner";
import { MatchQualityBadge } from "@/components/ui/MatchQualityBadge";

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
  matchScore?: number;
  matchType?: 'exact' | 'approximate' | 'mismatch' | 'missing';
  extractedCapacity?: string;
  capacityMatch?: boolean;
  aiScore?: number;
  aiRank?: number;
  aiReason?: string;
}

interface SearchDebugAttempt {
  query: string;
  rawShoppingResults: number;
  mappedResults: number;
  droppedNoPrice: number;
  droppedNoLink: number;
  finalResults: number;
}

interface SearchDebugInfo {
  selectedQuery?: string;
  searchQuery?: string;
  attemptedQueries: string[];
  debugAttempts: SearchDebugAttempt[];
  parsedQuery?: {
    brand?: string;
    category?: string;
    capacity?: string;
    model?: string;
  };
  rerankingApplied?: boolean;
  strictFilteringEnabled?: boolean;
}

function isLiveSource(source: string) {
  return source === "live" || source === "playwright_fallback" || source === "direct_url";
}

function getSourceLabel(source: string, t: (key: string) => string) {
  if (isLiveSource(source)) return t('priceComparison.live');
  if (source === 'synthetic') return 'Demo';
  return t('priceComparison.cache');
}

export default function PriceComparisonPage() {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useLanguage();

  const [product, setProduct] = useState<Product | null>(null);
  const [competitorPrices, setCompetitorPrices] = useState<CompetitorPrice[]>([]);
  const [priceHistory, setPriceHistory] = useState<PriceHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [searchDebug, setSearchDebug] = useState<SearchDebugInfo | null>(null);
  const [lastSearchTime, setLastSearchTime] = useState<number | null>(null);

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
          title: errorMessages.productNotFound.title,
          description: errorMessages.productNotFound.description,
          variant: "destructive",
        });
        navigate("/products");
        return;
      }
      setProduct(productResult.data!);

      // Load price comparison data
      const priceResult = await apiClient.getProductPriceComparison(productId!);
      if (priceResult.data) {
        const comparisons = priceResult.data.comparisons || [];
        // Filter to only show Amazon and Flipkart
        const filteredComparisons = comparisons.filter((comp: CompetitorPrice) => {
          const platform = comp.platform.toLowerCase();
          return platform.includes('amazon') || platform.includes('flipkart');
        });
        setCompetitorPrices(filteredComparisons);
      }

      // Load price history
      const historyResult = await apiClient.getProductPrices(productId!);
      if (!historyResult.error && historyResult.data) {
        setPriceHistory(Array.isArray(historyResult.data) ? historyResult.data : []);
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSearchPrices(isAutoSearch = false) {
      if (!product || searching) return;
      setSearching(true);

      if (!isAutoSearch) {
        toast({
          title: "Searching...",
          description: "Finding competitor prices on Amazon & Flipkart",
        });
      }

      try {
        const result = await apiClient.searchCompetitorPrices(productId!, {
          keywords: product.keywords || product.name,
          amazonUrl: product.amazonUrl,
          flipkartUrl: product.flipkartUrl,
        });

        setSearchDebug({
          selectedQuery: result.data?.searchQuery,
          searchQuery: result.data?.searchQuery,
          attemptedQueries: result.data?.attemptedQueries || [],
          debugAttempts: result.data?.debugAttempts || [],
        });

        // Even if there's an error field, check if data.results has content
        const results = result.data?.results || [];
        // Filter to only show Amazon and Flipkart
        const filteredResults = results.filter((r: any) => {
          const platform = r.platform.toLowerCase();
          return platform.includes('amazon') || platform.includes('flipkart');
        });

        if (filteredResults.length > 0) {
          setCompetitorPrices(filteredResults);
          setLastSearchTime(Date.now());
        } else if (result.error) {
          // Search failed AND no results — try to load cached data
          const cachedResult = await apiClient.getProductPriceComparison(productId!);
          if (cachedResult.data) {
            const cached = (cachedResult.data.comparisons || []).filter((comp: CompetitorPrice) => {
              const platform = comp.platform.toLowerCase();
              return platform.includes('amazon') || platform.includes('flipkart');
            });
            if (cached.length > 0) {
              setCompetitorPrices(cached);
              if (!isAutoSearch) {
                toast({
                  title: "Using Cached Prices",
                  description: "Live search failed. Showing previously saved prices.",
                  variant: "default",
                });
              }
              return;
            }
          }
          if (!isAutoSearch) {
            toast({
              title: errorMessages.priceSearchFailed.title,
              description: errorMessages.priceSearchFailed.description,
              variant: "destructive",
            });
          }
          return;
        }

        // Show data source notification only for manual search
        if (!isAutoSearch) {
          const liveCount = filteredResults.filter((r: any) => isLiveSource(r.source)).length;
          const syntheticCount = filteredResults.filter((r: any) => r.source === 'synthetic').length;

          if (liveCount > 0) {
            toast({
              title: "Live Data Retrieved",
              description: `Found ${liveCount} real competitor price${liveCount > 1 ? 's' : ''}`,
            });
          } else if (syntheticCount > 0) {
            toast({
              title: "Using Demo Data",
              description: "Showing sample prices — add Amazon/Flipkart URLs for real data",
              variant: "default",
            });
          } else if (filteredResults.length === 0) {
            toast({
              title: errorMessages.noPricesFound.title,
              description: "Try adding Amazon or Flipkart product URLs in product details for better results.",
            });
          }
        }
      } catch (error) {
        console.error("Price search error:", error);
        // On network/unexpected error, try to load cached data
        try {
          const cachedResult = await apiClient.getProductPriceComparison(productId!);
          if (cachedResult.data) {
            const cached = (cachedResult.data.comparisons || []).filter((comp: CompetitorPrice) => {
              const platform = comp.platform.toLowerCase();
              return platform.includes('amazon') || platform.includes('flipkart');
            });
            if (cached.length > 0) {
              setCompetitorPrices(cached);
              if (!isAutoSearch) {
                toast({
                  title: "Using Cached Prices",
                  description: "Live search failed. Showing previously saved prices.",
                });
              }
              return;
            }
          }
        } catch {
          // Cache load also failed — nothing more we can do
        }
        if (!isAutoSearch) {
          const friendlyError = getUserFriendlyError(error);
          toast({
            title: friendlyError.title,
            description: friendlyError.description,
            variant: "destructive",
          });
        }
      } finally {
        setSearching(false);
      }
    }


  if (loading) {
    return (
      <AppLayout>
        <LoadingPage message="Loading price comparison..." />
      </AppLayout>
    );
  }

  if (!product) {
    return (
      <AppLayout>
        <LoadingPage message="Loading product details..." />
      </AppLayout>
    );
  }

  // Ensure prices are numbers
  const currentPrice = Number(product.currentPrice) || 0;
  const costPrice = Number(product.costPrice) || 0;

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
    ? currentPrice <= lowestCompetitor.price
    : true;
  const pricePosition = lowestCompetitor
    ? ((currentPrice - lowestCompetitor.price) / lowestCompetitor.price) * 100
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
            {t('priceComparison.backToProducts')}
          </Button>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-foreground">
                {product.name}
              </h1>
              <p className="text-muted-foreground">
                SKU: {product.sku} · {product.category}
                {lastSearchTime && (
                  <span className="ml-2">
                    · Updated {new Date(lastSearchTime).toLocaleTimeString()}
                  </span>
                )}
              </p>
            </div>
            <Button
              onClick={() => handleSearchPrices(false)}
              disabled={searching}
              variant="outline"
              size="sm"
              className="gap-2"
            >
              {searching ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {t('priceComparison.updating')}
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  {t('priceComparison.refreshPrices')}
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Price Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 animate-fade-in" style={{ animationDelay: "0.05s" }}>
          <div className="premium-card rounded-2xl p-4">
            <p className="text-muted-foreground text-sm mb-1">{t('priceComparison.yourPrice')}</p>
            <p className="text-2xl font-bold text-primary">
              ₹{currentPrice.toLocaleString("en-IN")}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {t('priceComparison.cost')}: ₹{costPrice.toLocaleString("en-IN")}
            </p>
          </div>

          <div className="premium-card rounded-2xl p-4">
            <p className="text-muted-foreground text-sm mb-1">{t('priceComparison.lowestFound')}</p>
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
              <p className="text-lg text-muted-foreground">{t('priceComparison.noDataYet')}</p>
            )}
          </div>

          <div className="premium-card rounded-2xl p-4">
            <p className="text-muted-foreground text-sm mb-1">
              {t('priceComparison.avgMarketPrice')}
            </p>
            {avgCompetitorPrice > 0 ? (
              <>
                <p className="text-2xl font-bold">
                  ₹{Math.round(avgCompetitorPrice).toLocaleString("en-IN")}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {t('priceComparison.acrossListings').replace('{count}', competitorPrices.length.toString())}
                </p>
              </>
            ) : (
              <p className="text-lg text-muted-foreground">{t('priceComparison.noDataYet')}</p>
            )}
          </div>

          <div className="premium-card rounded-2xl p-4">
            <p className="text-muted-foreground text-sm mb-1">
              {t('priceComparison.yourPosition')}
            </p>
            {competitorPrices.length > 0 ? (
              <>
                <div className="flex items-center gap-2">
                  {isYourPriceLowest ? (
                    <Badge className="bg-green-500/10 text-green-500 border-green-500/20">
                      <TrendingDown className="w-3 h-3 mr-1" />
                      {t('priceComparison.lowest')}
                    </Badge>
                  ) : (
                    <Badge className="bg-orange-500/10 text-orange-500 border-orange-500/20">
                      <TrendingUp className="w-3 h-3 mr-1" />
                      {t('priceComparison.higher').replace('{percent}', pricePosition.toFixed(1))}
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  {t('priceComparison.vsCompetitors').replace('{count}', competitorPrices.length.toString())}
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
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-semibold flex items-center gap-2">
                  <Globe className="w-5 h-5 text-primary" />
                  {t('priceComparison.competitorPrices')}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {t('priceComparison.pricesFoundDesc')}
                </p>
              </div>
              {competitorPrices.some(p => p.source === 'synthetic') && (
                <Badge variant="outline" className="bg-orange-500/10 text-orange-600 border-orange-500/30">
                  📊 Demo Prices
                </Badge>
              )}
            </div>
          </div>

          {competitorPrices.length === 0 ? (
            <div className="p-12 text-center">
              <ShoppingCart className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">
                {searching ? "Searching for prices..." : "No competitor prices found"}
              </h3>
              <p className="text-muted-foreground mb-6">
                {searching 
                  ? "AI is analyzing Amazon, Flipkart, and other platforms..."
                  : "Click the button below to scan competitor prices."
                }
              </p>
              {searching ? (
                <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
              ) : (
                <div className="flex flex-col gap-3 items-center">
                  <Button 
                    onClick={() => handleSearchPrices(false)}
                    disabled={searching}
                    className="gap-2"
                  >
                    <Search className="w-4 h-4" />
                    Scan Prices Now
                  </Button>
                  <p className="text-sm text-muted-foreground">
                    Make sure Amazon/Flipkart product URLs are added in product details.
                  </p>
                </div>
              )}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">{t('priceComparison.platform')}</TableHead>
                  <TableHead className="min-w-[200px]">{t('priceComparison.productTitle')}</TableHead>
                  <TableHead className="w-[140px]">Match Quality</TableHead>
                  <TableHead className="text-right w-[90px]">{t('priceComparison.price')}</TableHead>
                  <TableHead className="text-right w-[110px]">{t('priceComparison.vsYourPrice')}</TableHead>
                  <TableHead className="text-center w-[100px]">{t('priceComparison.stock')}</TableHead>
                  <TableHead className="text-center w-[90px]">{t('priceComparison.source')}</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {/* Your price row */}
                <TableRow className="bg-primary/5">
                  <TableCell className="w-[100px]">
                    <Badge variant="default" className="h-6 whitespace-nowrap text-xs">{t('priceComparison.yourStore')}</Badge>
                  </TableCell>
                  <TableCell className="font-medium min-w-[200px] text-sm">{product.name}</TableCell>
                  <TableCell className="w-[140px]">
                    <Badge variant="default" className="h-6 whitespace-nowrap text-xs">Your Product</Badge>
                  </TableCell>
                  <TableCell className="text-right font-bold text-primary w-[90px] text-sm">
                    ₹{currentPrice.toLocaleString("en-IN")}
                  </TableCell>
                  <TableCell className="text-right w-[110px]">
                    <div className="flex items-center justify-end">
                      <Minus className="w-4 h-4 text-muted-foreground" />
                    </div>
                  </TableCell>
                  <TableCell className="text-center w-[100px]">
                    <Badge
                      variant={product.stock > 0 ? "default" : "destructive"}
                      className="h-6 whitespace-nowrap text-xs"
                    >
                      {product.stock > 0 ? t('priceComparison.inStock') : t('priceComparison.out')}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center w-[90px]">
                    <Badge variant="outline" className="h-6 whitespace-nowrap text-xs">
                      {t('priceComparison.yourData')}
                    </Badge>
                  </TableCell>
                  <TableCell className="w-[50px]"></TableCell>
                </TableRow>

                {/* Competitor rows */}
                {competitorPrices.map((comp, idx) => (
                  <TableRow key={idx}>
                    <TableCell className="w-[100px]">
                      <Badge
                        variant="outline"
                        className={`${getPlatformColor(comp.platform)} h-6 w-fit whitespace-nowrap text-xs`}
                      >
                        {comp.platform}
                      </Badge>
                    </TableCell>
                    <TableCell className="min-w-[200px]">
                      <p className="line-clamp-2 text-sm break-words" title={comp.title}>{comp.title}</p>
                    </TableCell>
                    <TableCell className="w-[140px]">
                      <MatchQualityBadge
                        matchType={comp.matchType}
                        matchScore={comp.matchScore}
                        aiScore={comp.aiScore}
                        extractedCapacity={comp.extractedCapacity}
                        queryCapacity={searchDebug?.parsedQuery?.capacity}
                      />
                    </TableCell>
                    <TableCell className="text-right font-medium w-[90px] text-sm">
                      ₹{comp.price.toLocaleString("en-IN")}
                    </TableCell>
                    <TableCell className="text-right w-[110px]">
                      {comp.priceDiff < 0 ? (
                        <span className="flex items-center justify-end gap-1 text-green-500 text-xs">
                          <ArrowDownRight className="w-3 h-3" />
                          {Math.abs(comp.priceDiffPercent).toFixed(1)}%
                        </span>
                      ) : comp.priceDiff > 0 ? (
                        <span className="flex items-center justify-end gap-1 text-red-500 text-xs">
                          <ArrowUpRight className="w-3 h-3" />
                          {comp.priceDiffPercent.toFixed(1)}%
                        </span>
                      ) : (
                        <span className="text-muted-foreground text-xs">Same</span>
                      )}
                    </TableCell>
                    <TableCell className="text-center w-[100px]">
                      <Badge
                        variant={comp.inStock ? "default" : "destructive"}
                        className={`h-6 whitespace-nowrap text-xs ${
                          comp.inStock
                            ? "bg-green-500/10 text-green-500 border-green-500/20"
                            : ""
                        }`}
                      >
                        {comp.inStock ? t('priceComparison.inStock') : t('priceComparison.out')}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center w-[90px]">
                      <Badge
                        variant="outline"
                        className={`h-6 whitespace-nowrap text-xs ${
                          isLiveSource(comp.source)
                            ? "text-green-500 border-green-500/30"
                            : "text-muted-foreground"
                        }`}
                      >
                        {getSourceLabel(comp.source, t)}
                      </Badge>
                    </TableCell>
                    <TableCell className="w-[50px]">
                      {comp.url && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => window.open(comp.url, "_blank")}
                          title="View on platform"
                          className="h-8 w-8 p-0"
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
                  Your price of ₹{currentPrice.toLocaleString("en-IN")}{" "}
                  is lower than all {competitorPrices.length} competitors. You
                  could potentially increase your price by up to ₹
                  {lowestCompetitor
                    ? Math.round(
                        (lowestCompetitor.price - currentPrice) * 0.5
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
                    currentPrice - (lowestCompetitor?.price || 0)
                  ).toLocaleString("en-IN")}{" "}
                  less than your price. Consider adjusting to ₹
                  {Math.round(
                    (lowestCompetitor?.price || currentPrice) * 0.99
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
  if (lower.includes("snapdeal"))
    return "bg-red-500/10 text-red-500 border-red-500/20";
  if (lower.includes("tata") || lower.includes("tatacliq"))
    return "bg-violet-500/10 text-violet-500 border-violet-500/20";
  if (lower.includes("paytm"))
    return "bg-cyan-500/10 text-cyan-500 border-cyan-500/20";
  if (lower.includes("myntra"))
    return "bg-rose-500/10 text-rose-500 border-rose-500/20";
  if (lower.includes("nykaa"))
    return "bg-fuchsia-500/10 text-fuchsia-500 border-fuchsia-500/20";
  return "bg-muted text-muted-foreground";
}
