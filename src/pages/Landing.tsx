import { Logo } from "@/components/ui/Logo";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, TrendingUp, Bell, BarChart3, Check, Languages } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/i18n/LanguageContext";
import { useEffect, useState } from "react";
import { apiClient } from "@/api/client";

export default function Landing() {
  const navigate = useNavigate();
  const { t, language, setLanguage } = useLanguage();
  const [checkingProducts, setCheckingProducts] = useState(true);

  useEffect(() => {
    checkForProducts();
  }, []);

  async function checkForProducts() {
    const result = await apiClient.getProducts();
    setCheckingProducts(false);
    
    // If no products exist and user hasn't completed onboarding, redirect
    if (result.data && result.data.products.length === 0) {
      const onboardingCompleted = localStorage.getItem("onboarding_completed");
      if (!onboardingCompleted) {
        navigate("/onboarding");
      }
    }
  }

  function handleGetStarted() {
    const onboardingCompleted = localStorage.getItem("onboarding_completed");
    if (onboardingCompleted) {
      navigate("/dashboard");
    } else {
      navigate("/onboarding");
    }
  }

  const benefits = [
    t('landing.benefit1'),
    t('landing.benefit2'),
    t('landing.benefit3'),
    t('landing.benefit4')
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-accent/20">
      {/* Header */}
      <header className="h-16 flex items-center justify-between px-4 md:px-12 border-b border-border/50 bg-background/80 backdrop-blur-sm">
        <Logo size="md" />
        <div className="flex items-center gap-2 md:gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLanguage(language === 'en' ? 'hi' : 'en')}
            className="rounded-lg text-xs md:text-sm"
          >
            <Languages className="w-4 h-4 mr-1 md:mr-2" />
            {language === 'en' ? 'हिंदी' : 'English'}
          </Button>
          <Button 
            onClick={handleGetStarted}
            size="sm"
            className="rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 text-xs md:text-sm"
          >
            {t('landing.getStarted')}
          </Button>
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-16 md:py-24">
        <div className="max-w-3xl mx-auto text-center animate-fade-in">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
            <Sparkles className="w-4 h-4" />
            {t('landing.poweredByAI')}
          </div>

          {/* Headline */}
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-foreground leading-relaxed mb-4">
            {t('landing.headline')}
          </h1>
          
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold gradient-text leading-relaxed mb-6">
            {t('landing.smarterPricing')}
          </h2>

          {/* Subheadline */}
          <p className="text-sm md:text-base text-muted-foreground max-w-2xl mx-auto mb-8 leading-relaxed px-4">
            {t('landing.subheadline1')}
            {' '}
            {t('landing.subheadline2')}
          </p>

          {/* Benefits */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl mx-auto mb-10">
            {benefits.map((benefit) => (
              <div key={benefit} className="flex items-start gap-3 text-left">
                <div className="w-5 h-5 rounded-full bg-success/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Check className="w-3 h-3 text-success" />
                </div>
                <span className="text-sm md:text-base text-foreground leading-snug">{benefit}</span>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
            <Button
              onClick={handleGetStarted}
              size="lg"
              className="rounded-xl px-8 py-6 text-base md:text-lg bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg group"
            >
              {t('landing.getStartedFree')}
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button
              onClick={() => navigate("/help")}
              variant="outline"
              size="lg"
              className="rounded-xl px-8 py-6 text-base md:text-lg"
            >
              {t('landing.seeHowItWorks')}
            </Button>
          </div>

          <p className="text-xs md:text-sm text-muted-foreground mt-4 px-4">
            {t('landing.noCreditCard')}
          </p>
        </div>

        {/* Simple Features */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto mt-16 animate-fade-in" style={{ animationDelay: "0.2s" }}>
          <div className="text-center px-4">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="w-7 h-7 text-primary" />
            </div>
            <h3 className="font-semibold text-base text-foreground mb-2">{t('landing.smartRecommendations')}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {t('landing.smartRecommendationsDesc')}
            </p>
          </div>

          <div className="text-center px-4">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Bell className="w-7 h-7 text-primary" />
            </div>
            <h3 className="font-semibold text-base text-foreground mb-2">{t('landing.instantAlerts')}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {t('landing.instantAlertsDesc')}
            </p>
          </div>

          <div className="text-center px-4">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <BarChart3 className="w-7 h-7 text-primary" />
            </div>
            <h3 className="font-semibold text-base text-foreground mb-2">{t('landing.trackResults')}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {t('landing.trackResultsDesc')}
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 px-6 text-center border-t border-border/50 bg-background/80">
        <p className="text-sm text-muted-foreground">
          {t('landing.footerText')}
        </p>
      </footer>
    </div>
  );
}
