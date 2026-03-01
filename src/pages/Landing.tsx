import { Logo } from "@/components/ui/Logo";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, TrendingUp, Bell, BarChart3, Check, Languages } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/i18n/LanguageContext";
import { useEffect } from "react";
import { apiClient } from "@/api/client";

export default function Landing() {
  const navigate = useNavigate();
  const { t, language, setLanguage } = useLanguage();

  useEffect(() => {
    checkForProducts();
  }, []);

  async function checkForProducts() {
    try {
      const result = await apiClient.getProducts();

      if (result.data && result.data.products.length === 0) {
        const onboardingCompleted = localStorage.getItem("onboarding_completed");
        if (!onboardingCompleted) {
          navigate("/onboarding");
        }
      }
    } catch {
      // Keep landing accessible if products API is unavailable.
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

  const headline = t('landing.mainHeadline');
  const [headlinePrimary, headlineAccent] = headline.includes(' - ')
    ? headline.split(' - ')
    : [headline, ''];

  const featureCards = [
    {
      title: t('landing.smartRecommendations'),
      description: t('landing.smartRecommendationsDesc'),
      icon: TrendingUp
    },
    {
      title: t('landing.instantAlerts'),
      description: t('landing.instantAlertsDesc'),
      icon: Bell
    },
    {
      title: t('landing.trackResults'),
      description: t('landing.trackResultsDesc'),
      icon: BarChart3
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <div className="absolute inset-x-0 top-0 h-80 bg-gradient-to-b from-primary/10 to-transparent pointer-events-none" />

      <header className="relative h-16 flex items-center justify-between px-4 md:px-8 lg:px-12 border-b border-border/60 bg-background/85 backdrop-blur">
        <Logo size="md" />
        <div className="flex items-center gap-2 md:gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLanguage(language === 'en' ? 'hi' : 'en')}
            className="rounded-lg"
          >
            <Languages className="w-4 h-4 mr-2" />
            {language === 'en' ? 'हिंदी' : 'English'}
          </Button>
          <Button onClick={handleGetStarted} size="sm" className="rounded-xl px-5">
            {t('landing.getStarted')}
          </Button>
        </div>
      </header>

      <main className="relative flex-1">
        <section className="px-4 md:px-8 lg:px-12 pt-14 md:pt-20 pb-12">
          <div className="mx-auto max-w-6xl grid lg:grid-cols-[1.1fr_0.9fr] gap-10 lg:gap-12 items-start">
            <div className="animate-fade-in">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
                <Sparkles className="w-4 h-4 flex-shrink-0" />
                {t('landing.poweredByAI')}
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight text-foreground leading-[1.1] mb-6">
                <span>{headlinePrimary}</span>
                {headlineAccent && (
                  <>
                    <br />
                    <span className="gradient-text">{headlineAccent}</span>
                  </>
                )}
              </h1>

              <p className="text-base md:text-lg text-muted-foreground max-w-2xl leading-relaxed mb-8">
                {t('landing.subheadline1')} {t('landing.subheadline2')}
              </p>

              <div className="grid sm:grid-cols-2 gap-3 mb-9 max-w-2xl">
                {benefits.map((benefit) => (
                  <div key={benefit} className="flex items-start gap-3 rounded-xl border border-border/70 bg-card/70 px-4 py-3">
                    <span className="w-5 h-5 rounded-full bg-success/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="w-3 h-3 text-success" />
                    </span>
                    <span className="text-sm md:text-base text-foreground leading-snug">{benefit}</span>
                  </div>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 mb-4">
                <Button
                  onClick={handleGetStarted}
                  size="lg"
                  className="w-full sm:w-auto rounded-xl px-8 group"
                >
                  {t('landing.getStartedFree')}
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
                <Button
                  onClick={() => navigate('/help')}
                  variant="outline"
                  size="lg"
                  className="w-full sm:w-auto rounded-xl px-8"
                >
                  {t('landing.seeHowItWorks')}
                </Button>
              </div>

              <p className="text-sm text-muted-foreground">{t('landing.noCreditCard')}</p>
            </div>

            <div className="animate-fade-in [animation-delay:120ms]">
              <div className="rounded-2xl border border-border/80 bg-card/90 p-6 md:p-7 shadow-sm">
                <p className="text-sm font-medium text-muted-foreground mb-4">RetailMind AI</p>
                <div className="space-y-4">
                  {featureCards.map((feature) => {
                    const Icon = feature.icon;
                    return (
                      <div key={feature.title} className="rounded-xl border border-border/70 bg-background/80 p-4">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                            <Icon className="w-5 h-5" />
                          </div>
                          <h3 className="font-semibold text-foreground">{feature.title}</h3>
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="px-4 md:px-8 lg:px-12 pb-14 md:pb-20">
          <div className="mx-auto max-w-6xl rounded-2xl border border-border/70 bg-card/60 p-6 md:p-8">
            <div className="grid gap-4 md:grid-cols-3">
              {featureCards.map((feature) => {
                const Icon = feature.icon;
                return (
                  <div key={`${feature.title}-detail`} className="rounded-xl border border-border/60 bg-background/80 p-5">
                    <div className="w-11 h-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4">
                      <Icon className="w-5 h-5" />
                    </div>
                    <h3 className="font-semibold text-foreground mb-2">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </main>

      <footer className="py-6 px-4 md:px-6 text-center border-t border-border/60 bg-background/90">
        <p className="text-sm text-muted-foreground">{t('landing.footerText')}</p>
      </footer>
    </div>
  );
}
