import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiClient } from "@/api/client";
import { Package, Loader2, Search, ExternalLink } from "lucide-react";

interface CompetitorMatch {
  platform: string;
  productName: string;
  url: string;
  price: number;
  inStock: boolean;
  image?: string;
  confidence: number;
}

export default function AddProductPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [competitorMatches, setCompetitorMatches] = useState<CompetitorMatch[]>([]);
  const [showDebug, setShowDebug] = useState(false);
  
  const [formData, setFormData] = useState({
    name: "",
    sku: "",
    category: "Electronics",
    currentPrice: "",
    costPrice: "",
    stock: "",
    description: "",
    amazonUrl: "",
    flipkartUrl: ""
  });

  // Log API configuration on mount
  useEffect(() => {
    console.group('🔧 API Configuration');
    console.log('VITE_API_URL:', import.meta.env.VITE_API_URL);
    console.log('Mode:', import.meta.env.MODE);
    console.log('Dev:', import.meta.env.DEV);
    console.groupEnd();
  }, []);

  const categories = [
    "Electronics",
    "Fashion",
    "Home & Kitchen",
    "Books",
    "Sports",
    "Beauty",
    "Toys",
    "Grocery",
    "Other"
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSearchCompetitors = async () => {
    if (!formData.name) {
      toast({
        title: "Product name required",
        description: "Please enter a product name to search",
        variant: "destructive"
      });
      return;
    }

    console.group('🔍 Product Search');
    console.log('Search query:', formData.name);
    console.log('API Base URL:', import.meta.env.VITE_API_URL);
    
    setSearching(true);
    try {
      console.log('Calling apiClient.searchCompetitorProducts...');
      const result = await apiClient.searchCompetitorProducts(formData.name);
      
      console.log('Search result:', result);
      
      if (result.error) {
        console.error('❌ Search API error:', result.error);
        console.log('Falling back to demo data...');
        
        // FALLBACK: Use mock data if API fails (for testing)
        const mockMatches: CompetitorMatch[] = [
          {
            platform: "Amazon.in",
            productName: `${formData.name} - Natural Titanium`,
            url: "https://www.amazon.in/dp/B0CHX1W1XY",
            price: 134900,
            inStock: true,
            confidence: 0.95,
            image: "https://m.media-amazon.com/images/I/81SigpJN1KL._SX679_.jpg"
          },
          {
            platform: "Flipkart",
            productName: `${formData.name} 256GB`,
            url: "https://www.flipkart.com/apple-iphone-15-pro-256-gb-natural-titanium/p/itm6d2f4d24c0c3a",
            price: 133999,
            inStock: true,
            confidence: 0.92,
            image: "https://rukminim2.flixcart.com/image/416/416/xif0q/mobile/k/l/l/-original-imagtc5fz9spysyk.jpeg"
          }
        ];
        
        console.log('Demo matches:', mockMatches);
        setCompetitorMatches(mockMatches);
        
        toast({
          title: "Using demo data",
          description: "Search API not configured yet. Showing sample results. You can still manually enter URLs below.",
          variant: "default"
        });
        
        console.groupEnd();
        return;
      }

      const matches = result.data?.matches || [];
      console.log('✅ Search successful! Matches found:', matches.length);
      console.log('Matches:', matches);
      
      setCompetitorMatches(matches);
      
      if (matches.length === 0) {
        console.warn('No matches found for query:', formData.name);
        toast({
          title: "No matches found",
          description: "Try a different product name or manually enter competitor URLs below",
          variant: "default"
        });
      } else {
        toast({
          title: "Search complete",
          description: `Found ${matches.length} matching products`
        });
      }
      
      console.groupEnd();
    } catch (error) {
      console.error('❌ Search error (caught in component):', error);
      console.error('Error type:', typeof error);
      console.error('Error details:', error);
      
      toast({
        title: "Search unavailable",
        description: "You can manually enter competitor URLs below",
        variant: "default"
      });
      
      console.groupEnd();
    } finally {
      setSearching(false);
    }
  };

  const handleSelectMatch = (match: CompetitorMatch) => {
    if (match.platform === "Amazon.in") {
      setFormData({ ...formData, amazonUrl: match.url });
    } else if (match.platform === "Flipkart") {
      setFormData({ ...formData, flipkartUrl: match.url });
    }

    toast({
      title: "URL added",
      description: `${match.platform} URL added to product`
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.name || !formData.currentPrice || !formData.costPrice || !formData.stock) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    if (!formData.amazonUrl && !formData.flipkartUrl) {
      toast({
        title: "No competitor URLs",
        description: "Please add at least one competitor URL to enable price monitoring",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const productData = {
        name: formData.name,
        sku: formData.sku || `SKU-${Date.now()}`,
        category: formData.category,
        currentPrice: parseFloat(formData.currentPrice),
        costPrice: parseFloat(formData.costPrice),
        stock: parseInt(formData.stock),
        description: formData.description,
        competitorUrls: {
          amazon: formData.amazonUrl || undefined,
          flipkart: formData.flipkartUrl || undefined
        }
      };

      const result = await apiClient.createProduct(productData);

      if (result.error) {
        toast({
          title: "Failed to create product",
          description: result.error,
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Product created!",
        description: "Price monitoring has been activated"
      });

      // Navigate to insights page
      navigate("/insights");
    } catch (error) {
      console.error("Error creating product:", error);
      toast({
        title: "Error",
        description: "Failed to create product",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout>
      <div className="min-h-screen p-6 md:p-10 max-w-4xl mx-auto">
        {/* Debug Panel */}
        <div className="mb-4">
          <button
            onClick={() => setShowDebug(!showDebug)}
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            {showDebug ? '▼' : '▶'} Debug Info
          </button>
          
          {showDebug && (
            <div className="mt-2 p-4 bg-secondary/50 rounded-lg text-xs font-mono space-y-1">
              <div><span className="text-muted-foreground">API URL:</span> {import.meta.env.VITE_API_URL || 'Not set'}</div>
              <div><span className="text-muted-foreground">Mode:</span> {import.meta.env.MODE}</div>
              <div><span className="text-muted-foreground">Search Endpoint:</span> {import.meta.env.VITE_API_URL}/products/search-competitors</div>
              <div className="pt-2 text-muted-foreground">
                Check browser console (F12) for detailed logs when clicking Search
              </div>
            </div>
          )}
        </div>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Package className="w-5 h-5 text-primary" />
            </div>
            <h1 className="text-2xl font-semibold text-foreground">Add New Product</h1>
          </div>
          <p className="text-muted-foreground">
            Add your product details and competitor URLs to start price monitoring
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="premium-card rounded-2xl p-6 space-y-4">
            <h2 className="text-lg font-medium text-foreground mb-4">Basic Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Product Name *</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g., Apple iPhone 15 Pro 256GB"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="sku">SKU / Model Number</Label>
                <Input
                  id="sku"
                  name="sku"
                  value={formData.sku}
                  onChange={handleChange}
                  placeholder="Auto-generated if empty"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-lg border border-input bg-background"
                required
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Product description (optional)"
                rows={3}
              />
            </div>
          </div>

          {/* Pricing & Inventory */}
          <div className="premium-card rounded-2xl p-6 space-y-4">
            <h2 className="text-lg font-medium text-foreground mb-4">Pricing & Inventory</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="currentPrice">Your Selling Price (₹) *</Label>
                <Input
                  id="currentPrice"
                  name="currentPrice"
                  type="number"
                  step="0.01"
                  value={formData.currentPrice}
                  onChange={handleChange}
                  placeholder="e.g., 134900"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="costPrice">Your Cost Price (₹) *</Label>
                <Input
                  id="costPrice"
                  name="costPrice"
                  type="number"
                  step="0.01"
                  value={formData.costPrice}
                  onChange={handleChange}
                  placeholder="e.g., 120000"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="stock">Current Stock *</Label>
                <Input
                  id="stock"
                  name="stock"
                  type="number"
                  value={formData.stock}
                  onChange={handleChange}
                  placeholder="e.g., 50"
                  required
                />
              </div>
            </div>

            {formData.currentPrice && formData.costPrice && (
              <div className="p-3 bg-secondary/50 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  Profit Margin: <span className="font-medium text-foreground">
                    {((parseFloat(formData.currentPrice) - parseFloat(formData.costPrice)) / parseFloat(formData.currentPrice) * 100).toFixed(1)}%
                  </span>
                </p>
              </div>
            )}
          </div>

          {/* Competitor Search */}
          <div className="premium-card rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-medium text-foreground">Find Competitors</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Search for your product on Amazon.in and Flipkart
                </p>
              </div>
              <Button
                type="button"
                onClick={handleSearchCompetitors}
                disabled={searching || !formData.name}
                variant="outline"
              >
                {searching ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Searching...
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4 mr-2" />
                    Search
                  </>
                )}
              </Button>
            </div>

            {competitorMatches.length > 0 && (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Click "Select" to add the URL to your product monitoring
                </p>
                {competitorMatches.map((match, index) => (
                  <div key={index} className="p-4 border border-border rounded-lg hover:bg-accent/30 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium text-primary">{match.platform}</span>
                          <span className="text-xs text-muted-foreground">
                            {(match.confidence * 100).toFixed(0)}% match
                          </span>
                        </div>
                        <p className="text-sm text-foreground mb-2">{match.productName}</p>
                        <div className="flex items-center gap-4 text-sm">
                          <span className="font-medium text-foreground">₹{match.price.toLocaleString('en-IN')}</span>
                          <span className={match.inStock ? "text-success" : "text-destructive"}>
                            {match.inStock ? "In Stock" : "Out of Stock"}
                          </span>
                        </div>
                      </div>
                      <Button
                        type="button"
                        size="sm"
                        onClick={() => handleSelectMatch(match)}
                      >
                        Select
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {!searching && competitorMatches.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <p className="text-sm">
                  Enter a product name above and click "Search" to find matching products,
                  <br />
                  or manually enter competitor URLs below.
                </p>
              </div>
            )}
          </div>

          {/* Manual URL Entry */}
          <div className="premium-card rounded-2xl p-6 space-y-4">
            <h2 className="text-lg font-medium text-foreground mb-4">Competitor URLs *</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Add at least one competitor URL to enable price monitoring
            </p>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="amazonUrl">Amazon.in URL</Label>
                <div className="flex gap-2">
                  <Input
                    id="amazonUrl"
                    name="amazonUrl"
                    value={formData.amazonUrl}
                    onChange={handleChange}
                    placeholder="https://www.amazon.in/dp/..."
                  />
                  {formData.amazonUrl && (
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => window.open(formData.amazonUrl, '_blank')}
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="flipkartUrl">Flipkart URL</Label>
                <div className="flex gap-2">
                  <Input
                    id="flipkartUrl"
                    name="flipkartUrl"
                    value={formData.flipkartUrl}
                    onChange={handleChange}
                    placeholder="https://www.flipkart.com/..."
                  />
                  {formData.flipkartUrl && (
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => window.open(formData.flipkartUrl, '_blank')}
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/insights")}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating Product...
                </>
              ) : (
                "Create Product & Start Monitoring"
              )}
            </Button>
          </div>
        </form>
      </div>
    </AppLayout>
  );
}
