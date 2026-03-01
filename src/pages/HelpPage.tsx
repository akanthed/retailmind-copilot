import { AppLayout } from "@/components/layout/AppLayout";
import { HelpCircle, Book, ChevronRight } from "lucide-react";
import { useState } from "react";
import { useLanguage } from "@/i18n/LanguageContext";

export default function HelpPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const { t } = useLanguage();

  const quickGuides = [
    {
      title: t('help.guide1Title'),
      steps: [
        t('help.guide1Step1'),
        t('help.guide1Step2'),
        t('help.guide1Step3'),
        t('help.guide1Step4')
      ]
    },
    {
      title: t('help.guide2Title'),
      steps: [
        t('help.guide2Step1'),
        t('help.guide2Step2'),
        t('help.guide2Step3'),
        t('help.guide2Step4')
      ]
    },
    {
      title: t('help.guide3Title'),
      steps: [
        t('help.guide3Step1'),
        t('help.guide3Step2'),
        t('help.guide3Step3'),
        t('help.guide3Step4')
      ]
    }
  ];

  const faqs = [
    { question: t('help.faq1Q'), answer: t('help.faq1A') },
    { question: t('help.faq2Q'), answer: t('help.faq2A') },
    { question: t('help.faq3Q'), answer: t('help.faq3A') },
    { question: t('help.faq4Q'), answer: t('help.faq4A') },
    { question: t('help.faq5Q'), answer: t('help.faq5A') },
    { question: t('help.faq6Q'), answer: t('help.faq6A') },
  ];

  return (
    <AppLayout>
      <div className="min-h-screen p-6 md:p-10 max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <HelpCircle className="w-5 h-5 text-primary" />
            </div>
            <h1 className="text-2xl font-semibold text-foreground">{t('help.title')}</h1>
          </div>
          <p className="text-muted-foreground">
            {t('help.subtitle')}
          </p>
        </div>

        {/* Quick Start Guides */}
        <div className="mb-10 animate-fade-in" style={{ animationDelay: "0.1s" }}>
          <h2 className="text-lg font-medium text-foreground mb-4">{t('help.quickStartGuides')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {quickGuides.map((guide) => (
              <div key={guide.title} className="premium-card rounded-2xl p-5">
                <Book className="w-6 h-6 text-primary mb-3" />
                <h3 className="font-medium text-foreground mb-3">{guide.title}</h3>
                <div className="space-y-2">
                  {guide.steps.map((step, idx) => (
                    <p key={idx} className="text-sm text-muted-foreground leading-relaxed">
                      {step}
                    </p>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Key Features */}
        <div className="premium-card rounded-2xl p-6 mb-10 animate-fade-in" style={{ animationDelay: "0.15s" }}>
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Book className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-foreground mb-3">{t('help.featuresTitle')}</h3>
              <div className="space-y-3 text-sm text-muted-foreground">
                <div>
                  <p className="text-foreground font-medium mb-1">📊 {t('help.featureDashboard')}</p>
                  <p>{t('help.featureDashboardDesc')}</p>
                </div>
                <div>
                  <p className="text-foreground font-medium mb-1">📦 {t('help.featureProducts')}</p>
                  <p>{t('help.featureProductsDesc')}</p>
                </div>
                <div>
                  <p className="text-foreground font-medium mb-1">✅ {t('help.featureActions')}</p>
                  <p>{t('help.featureActionsDesc')}</p>
                </div>
                <div>
                  <p className="text-foreground font-medium mb-1">🔔 {t('help.featureAlerts')}</p>
                  <p>{t('help.featureAlertsDesc')}</p>
                </div>
                <div>
                  <p className="text-foreground font-medium mb-1">📈 {t('help.featureForecast')}</p>
                  <p>{t('help.featureForecastDesc')}</p>
                </div>
                <div>
                  <p className="text-foreground font-medium mb-1">💡 {t('help.featureInsights')}</p>
                  <p>{t('help.featureInsightsDesc')}</p>
                </div>
                <div>
                  <p className="text-foreground font-medium mb-1">📄 {t('help.featureReports')}</p>
                  <p>{t('help.featureReportsDesc')}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ */}
        <div className="mb-10 animate-fade-in" style={{ animationDelay: "0.2s" }}>
          <h2 className="text-lg font-medium text-foreground mb-4">{t('help.commonQuestions')}</h2>
          <div className="space-y-3">
            {faqs.map((faq, index) => (
              <div key={index} className="premium-card rounded-2xl overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="w-full p-5 text-left flex items-center justify-between hover:bg-accent/30 transition-colors"
                >
                  <span className="font-medium text-foreground pr-4">{faq.question}</span>
                  <ChevronRight 
                    className={`w-5 h-5 text-muted-foreground transition-transform flex-shrink-0 ${
                      openFaq === index ? 'rotate-90' : ''
                    }`} 
                  />
                </button>
                {openFaq === index && (
                  <div className="px-5 pb-5">
                    <p className="text-muted-foreground leading-relaxed">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Support */}
        <div className="premium-card rounded-2xl p-6 animate-fade-in" style={{ animationDelay: "0.25s" }}>
          <HelpCircle className="w-8 h-8 text-primary mb-3" />
          <h3 className="font-medium text-foreground mb-2">{t('help.needHelpTitle')}</h3>
          <div className="text-sm text-muted-foreground space-y-2">
            <p>{t('help.needHelpDesc')}</p>
            <p>• {t('help.needHelpPoint1')}</p>
            <p>• {t('help.needHelpPoint2')}</p>
            <p>• {t('help.needHelpPoint3')}</p>
            <p>• {t('help.needHelpPoint4')}</p>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
