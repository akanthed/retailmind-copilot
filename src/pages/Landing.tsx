import { Logo } from "@/components/ui/Logo";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, TrendingUp, Bell, BarChart3, Check } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/i18n/LanguageContext";

export default function Landing() {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const benefits = [
    t('landing.benefit1'),
    t('landing.benefit2'),
    t('landing.benefit3'),
    t('landing.benefit4')
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-accent/20">
      {/* Header */}
      <header className="h-16 flex items-center justify-between px-6 md:px-12 border-b border-border/50 bg-background/80 backdrop-blur-sm">
        <Logo size="md" />
        <Button 
          onClick={() => navigate("/onboarding")}
          className="rounded-xl bg-primary text-primary-foreground hover:bg-primary/90"
        >
          {t('landing.getStarted')}
        </Button>
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
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-foreground mb-6 leading-tight">
            {t('landing.headline')}
            <br />
            <span className="gradient-text">{t('landing.smarterPricing')}</span>
          </h1>

          {/* Subheadline */}
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8 leading-relaxed">
            {t('landing.subheadline1')}
            <br />
            {t('landing.subheadline2')}
          </p>

          {/* Benefits */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-xl mx-auto mb-10">
            {benefits.map((benefit) => (
              <div key={benefit} className="flex items-center gap-2 text-left">
                <div className="w-5 h-5 rounded-full bg-success/10 flex items-center justify-center flex-shrink-0">
                  <Check className="w-3 h-3 text-success" />
                </div>
                <span className="text-foreground">{benefit}</span>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              onClick={() => navigate("/onboarding")}
              size="lg"
              className="rounded-xl px-8 py-6 text-lg bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg group"
            >
              {t('landing.getStartedFree')}
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button
              onClick={() => navigate("/help")}
              variant="outline"
              size="lg"
              className="rounded-xl px-8 py-6 text-lg"
            >
              {t('landing.seeHowItWorks')}
            </Button>
          </div>

          <p className="text-sm text-muted-foreground mt-6">
            {t('landing.noCreditCard')}
          </p>
        </div>

        {/* Simple Features */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto mt-20 animate-fade-in" style={{ animationDelay: "0.2s" }}>
          <div className="text-center">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="w-7 h-7 text-primary" />
            </div>
            <h3 className="font-semibold text-foreground mb-2">{t('landing.smartRecommendations')}</h3>
            <p className="text-sm text-muted-foreground">
              {t('landing.smartRecommendationsDesc')}
            </p>
          </div>

          <div className="text-center">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Bell className="w-7 h-7 text-primary" />
            </div>
            <h3 className="font-semibold text-foreground mb-2">{t('landing.instantAlerts')}</h3>
            <p className="text-sm text-muted-foreground">
              {t('landing.instantAlertsDesc')}
            </p>
          </div>

          <div className="text-center">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <BarChart3 className="w-7 h-7 text-primary" />
            </div>
            <h3 className="font-semibold text-foreground mb-2">{t('landing.trackResults')}</h3>
            <p className="text-sm text-muted-foreground">
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
