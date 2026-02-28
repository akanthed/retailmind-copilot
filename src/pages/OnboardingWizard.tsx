import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Logo } from "@/components/ui/Logo";
import { Sparkles, Package, TrendingUp, CheckCircle, Loader2 } from "lucide-react";
import { apiClient } from "@/api/client";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/i18n/LanguageContext";

export default function OnboardingWizard() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useLanguage();
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
        title: t('onboarding.fillAllFields'),
        description: t('onboarding.needBasics'),
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
          title: t('onboarding.errorAddingProduct'),
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
        title: t('onboarding.errorAddingProduct'),
        description: t('onboarding.failedToAddProduct'),
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
            {t('onboarding.welcome')}
          </h1>
          <p className="text-muted-foreground">
            {t('onboarding.setupTime')}
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
              {t('onboarding.step1Title')}
            </h2>
            <p className="text-sm text-muted-foreground text-center mb-6">
              {t('onboarding.step1Subtitle')}
            </p>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  {t('products.productName')}
                </label>
                <Input
                  placeholder={t('products.productNamePlaceholder')}
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  className="h-12 text-base"
                  autoFocus
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  {t('products.sellingPrice')}
                </label>
                <Input
                  type="number"
                  placeholder={t('products.sellingPricePlaceholder')}
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="h-12 text-base"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  {t('products.stock')}
                </label>
                <Input
                  type="number"
                  placeholder={t('products.stockPlaceholder')}
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
                    {t('onboarding.addingProduct')}
                  </>
                ) : (
                  t('onboarding.continue')
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
              {t('onboarding.step2Title')}
            </h2>
            <p className="text-muted-foreground mb-6">
              {t('onboarding.step2Subtitle')}
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
              {t('onboarding.step3Title')}
            </h2>
            <p className="text-muted-foreground mb-6">
              {t('onboarding.step3Subtitle')}
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
              {t('onboarding.step4Title')}
            </h2>
            <p className="text-muted-foreground mb-6">
              {t('onboarding.step4Subtitle').replace('{product}', productName)}
            </p>

            <div className="bg-accent/50 rounded-xl p-4 mb-6 text-left">
              <p className="text-sm font-medium mb-2">{t('onboarding.whatHappensNext')}</p>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>{t('onboarding.nextStep1')}</li>
                <li>{t('onboarding.nextStep2')}</li>
                <li>{t('onboarding.nextStep3')}</li>
              </ul>
            </div>

            <Button
              onClick={completeOnboarding}
              className="w-full h-12 text-base"
              size="lg"
            >
              {t('onboarding.goToDashboard')}
            </Button>
          </div>
        )}

        {/* Footer */}
        <p className="text-center text-xs text-muted-foreground mt-6">
          {t('onboarding.takesLessThan')}
        </p>
      </div>
    </div>
  );
}
