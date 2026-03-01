import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Sparkles, Package, TrendingUp, Bell, ArrowRight, Check, Loader2 } from "lucide-react";
import { apiClient } from "@/api/client";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/i18n/LanguageContext";

const SAMPLE_PRODUCTS = [
  {
    name: "Samsung Galaxy S24 Ultra 256GB",
    sku: "SAM-S24U-256",
    category: "Electronics",
    currentPrice: 124999,
    costPrice: 95000,
    stock: 15,
    keywords: "samsung galaxy s24 ultra 256gb smartphone android"
  },
  {
    name: "Apple iPhone 15 Pro 128GB",
    sku: "APL-IP15P-128",
    category: "Electronics",
    currentPrice: 134900,
    costPrice: 105000,
    stock: 12,
    keywords: "apple iphone 15 pro 128gb smartphone ios"
  },
  {
    name: "Sony WH-1000XM5 Headphones",
    sku: "SNY-WH1000XM5",
    category: "Electronics",
    currentPrice: 29990,
    costPrice: 22000,
    stock: 25,
    keywords: "sony wh-1000xm5 wireless noise cancelling headphones"
  },
  {
    name: "Dell XPS 13 Laptop",
    sku: "DEL-XPS13-I7",
    category: "Electronics",
    currentPrice: 124990,
    costPrice: 95000,
    stock: 8,
    keywords: "dell xps 13 laptop intel core i7 16gb ram"
  },
  {
    name: "Nike Air Max 270 Shoes",
    sku: "NIK-AM270-BLK",
    category: "Fashion",
    currentPrice: 12995,
    costPrice: 8500,
    stock: 45,
    keywords: "nike air max 270 running shoes black"
  }
];

export default function OnboardingPage() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useLanguage();

  async function handleLoadSampleData() {
    setLoading(true);
    try {
      let successCount = 0;
      for (const product of SAMPLE_PRODUCTS) {
        const result = await apiClient.createProduct(product);
        if (!result.error) successCount++;
      }

      toast({
        title: t('onboarding.sampleDataLoaded'),
        description: t('onboarding.sampleDataSuccess').replace('{count}', successCount.toString()),
      });

      // Generate forecasts and recommendations - wrap each in try-catch
      // so one failure doesn't block the whole flow
      try {
        await apiClient.generateForecasts();
      } catch (e) {
        console.warn('Forecast generation skipped:', e);
      }
      try {
        await apiClient.generateRecommendations();
      } catch (e) {
        console.warn('Recommendation generation skipped:', e);
      }
      try {
        await apiClient.generateAlerts();
      } catch (e) {
        console.warn('Alert generation skipped:', e);
      }

      localStorage.setItem("onboarding_completed", "true");

      setTimeout(() => {
        navigate("/dashboard");
      }, 1000);
    } catch (error) {
      console.error("Error loading sample data:", error);
      toast({
        title: t('onboarding.error'),
        description: t('onboarding.sampleDataError'),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  function handleSkip() {
    localStorage.setItem("onboarding_completed", "true");
    navigate("/dashboard");
  }

  function handleAddManually() {
    localStorage.setItem("onboarding_completed", "true");
    navigate("/products");
  }

  if (step === 1) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-sage-50 flex items-center justify-center p-6">
        <Card className="max-w-4xl w-full p-8 md:p-12 premium-card">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
              <Sparkles className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-4xl font-bold mb-3 gradient-text">{t('onboarding.welcomeTitle')}</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {t('onboarding.welcomeSubtitle')}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="text-center p-6 rounded-xl bg-gradient-to-br from-teal-50 to-white border border-teal-100">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-3">
                <TrendingUp className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">{t('onboarding.priceIntelligence')}</h3>
              <p className="text-sm text-muted-foreground">
                {t('onboarding.priceIntelligenceDesc')}
              </p>
            </div>

            <div className="text-center p-6 rounded-xl bg-gradient-to-br from-teal-50 to-white border border-teal-100">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-3">
                <Package className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">{t('onboarding.demandForecasting')}</h3>
              <p className="text-sm text-muted-foreground">
                {t('onboarding.demandForecastingDesc')}
              </p>
            </div>

            <div className="text-center p-6 rounded-xl bg-gradient-to-br from-teal-50 to-white border border-teal-100">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-3">
                <Bell className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">{t('onboarding.smartAlerts')}</h3>
              <p className="text-sm text-muted-foreground">
                {t('onboarding.smartAlertsDesc')}
              </p>
            </div>
          </div>

          <div className="flex gap-4 justify-center">
            <Button
              size="lg"
              onClick={() => setStep(2)}
              className="gap-2"
            >
              {t('onboarding.getStarted')}
              <ArrowRight className="w-4 h-4" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={handleSkip}
            >
              {t('onboarding.skipSetup')}
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  if (step === 2) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-sage-50 flex items-center justify-center p-6">
        <Card className="max-w-3xl w-full p-8 md:p-12 premium-card">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
              <Package className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-3xl font-bold mb-3">{t('onboarding.addProductsTitle')}</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              {t('onboarding.addProductsSubtitle')}
            </p>
          </div>

          <div className="space-y-4 mb-8">
            <Card className="p-6 hover-lift cursor-pointer border-2 hover:border-primary transition-all" onClick={handleLoadSampleData}>
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Sparkles className="w-6 h-6 text-primary" />
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-2">{t('onboarding.loadSampleData')}</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    {t('onboarding.loadSampleDataDesc')}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <span className="text-xs px-2 py-1 rounded-full bg-teal-100 text-teal-700">{t('onboarding.electronics')}</span>
                    <span className="text-xs px-2 py-1 rounded-full bg-teal-100 text-teal-700">{t('onboarding.fashion')}</span>
                    <span className="text-xs px-2 py-1 rounded-full bg-teal-100 text-teal-700">{t('onboarding.instantSetup')}</span>
                  </div>
                </div>
                {loading && <Loader2 className="w-5 h-5 animate-spin text-primary" />}
              </div>
            </Card>

            <Card className="p-6 hover-lift cursor-pointer border-2 hover:border-primary transition-all" onClick={handleAddManually}>
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Package className="w-6 h-6 text-primary" />
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-2">{t('onboarding.addManually')}</h3>
                  <p className="text-sm text-muted-foreground">
                    {t('onboarding.addManuallyDesc')}
                  </p>
                </div>
                <ArrowRight className="w-5 h-5 text-muted-foreground" />
              </div>
            </Card>

            <Card className="p-6 opacity-60 cursor-not-allowed border-2">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                    <Package className="w-6 h-6 text-gray-400" />
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-2">{t('onboarding.importCSV')}</h3>
                  <p className="text-sm text-muted-foreground">
                    {t('onboarding.importCSVDesc')}
                  </p>
                </div>
              </div>
            </Card>
          </div>

          <div className="flex gap-4 justify-center">
            <Button
              variant="outline"
              onClick={() => setStep(1)}
            >
              {t('onboarding.back')}
            </Button>
            <Button
              variant="ghost"
              onClick={handleSkip}
            >
              {t('onboarding.skipForNow')}
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return null;
}
