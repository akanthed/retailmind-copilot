import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Logo } from "@/components/ui/Logo";
import { Sparkles, Package, TrendingUp, CheckCircle, Loader2 } from "lucide-react";
import { apiClient } from "@/api/client";
import { useToast } from "@/hooks/use-toast";

export default function OnboardingWizard() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  // Simple form - only 3 fields
  const [productName, setProductName] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [productId, setProductId] = useState("");

  async function handleAddProduct() {
    if (!productName || !price || !stock) {
      toast({
        title: "Please fill all fields",
        description: "We need these basics to get started",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const result = await apiClient.createProduct({
        name: productName,
        currentPrice: parseFloat(price),
        stock: parseInt(stock),
        category: "Electronics", // Smart default
        costPrice: 0,
        stockDays: 30,
        sku: `PROD-${Date.now()}` // Auto-generate
      });

      if (result.error) {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive"
        });
        setLoading(false);
        return;
      }

      setProductId(result.data?.product?.id || "");
      setStep(2);
      
      // Auto-search prices in background
      setTimeout(() => searchPrices(result.data?.product?.id || ""), 1000);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add product",
        variant: "destructive"
      });
      setLoading(false);
    }
  }

  async function searchPrices(id: string) {
    try {
      await apiClient.searchCompetitorPrices(id, {
        keywords: productName
      });
      setStep(3);
      
      // Generate recommendation
      setTimeout(() => generateRecommendation(), 1000);
    } catch (error) {
      setStep(3);
      setTimeout(() => generateRecommendation(), 1000);
    }
  }

  async function generateRecommendation() {
    try {
      await apiClient.generateRecommendations();
      setLoading(false);
      setStep(4);
    } catch (error) {
      setLoading(false);
      setStep(4);
    }
  }

  function completeOnboarding() {
    localStorage.setItem("hasCompletedOnboarding", "true");
    navigate("/dashboard");
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-b from-background to-accent/20">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Logo size="lg" className="mx-auto mb-4" />
          <h1 className="text-2xl font-semibold text-foreground mb-2">
            Welcome to RetailMind AI
          </h1>
          <p className="text-muted-foreground">
            Let's get you set up in 2 minutes
          </p>
        </div>

        {/* Progress */}
        <div className="flex gap-2 mb-8">
          {[1, 2, 3, 4].map((s) => (
            <div
              key={s}
              className={`h-2 flex-1 rounded-full transition-all ${
                s <= step ? "bg-primary" : "bg-muted"
              }`}
            />
          ))}
        </div>

        {/* Step 1: Add Product */}
        {step === 1 && (
          <div className="premium-card rounded-2xl p-8 animate-fade-in">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Package className="w-6 h-6 text-primary" />
            </div>
            <h2 className="text-xl font-semibold text-center mb-2">
              Add Your First Product
            </h2>
            <p className="text-sm text-muted-foreground text-center mb-6">
              Just the basics - we'll find competitor prices automatically
            </p>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Product Name
                </label>
                <Input
                  placeholder="e.g. Samsung Galaxy S24"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  className="h-12 text-base"
                  autoFocus
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  Your Selling Price (₹)
                </label>
                <Input
                  type="number"
                  placeholder="e.g. 129999"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="h-12 text-base"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  Stock Quantity
                </label>
                <Input
                  type="number"
                  placeholder="e.g. 50"
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                  className="h-12 text-base"
                />
              </div>

              <Button
                onClick={handleAddProduct}
                disabled={loading || !productName || !price || !stock}
                className="w-full h-12 text-base"
                size="lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Adding Product...
                  </>
                ) : (
                  "Continue"
                )}
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Searching Prices */}
        {step === 2 && (
          <div className="premium-card rounded-2xl p-8 text-center animate-fade-in">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="w-6 h-6 text-primary animate-pulse" />
            </div>
            <h2 className="text-xl font-semibold mb-2">
              Finding Competitor Prices
            </h2>
            <p className="text-muted-foreground mb-6">
              Our AI is searching Amazon, Flipkart, and other platforms...
            </p>
            <div className="flex justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          </div>
        )}

        {/* Step 3: Generating Recommendation */}
        {step === 3 && (
          <div className="premium-card rounded-2xl p-8 text-center animate-fade-in">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-6 h-6 text-primary animate-pulse" />
            </div>
            <h2 className="text-xl font-semibold mb-2">
              Creating Your First Recommendation
            </h2>
            <p className="text-muted-foreground mb-6">
              AI is analyzing the market and preparing your action plan...
            </p>
            <div className="flex justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          </div>
        )}

        {/* Step 4: Success */}
        {step === 4 && (
          <div className="premium-card rounded-2xl p-8 text-center animate-fade-in">
            <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-success" />
            </div>
            <h2 className="text-xl font-semibold mb-2">
              You're All Set! 🎉
            </h2>
            <p className="text-muted-foreground mb-6">
              Your dashboard is ready with AI recommendations for {productName}
            </p>

            <div className="bg-accent/50 rounded-xl p-4 mb-6 text-left">
              <p className="text-sm font-medium mb-2">What happens next:</p>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>✓ AI monitors prices 24/7</li>
                <li>✓ Get alerts when competitors change prices</li>
                <li>✓ Daily recommendations in your dashboard</li>
              </ul>
            </div>

            <Button
              onClick={completeOnboarding}
              className="w-full h-12 text-base"
              size="lg"
            >
              Go to Dashboard
            </Button>
          </div>
        )}

        {/* Footer */}
        <p className="text-center text-xs text-muted-foreground mt-6">
          Takes less than 2 minutes • No credit card required
        </p>
      </div>
    </div>
  );
}
