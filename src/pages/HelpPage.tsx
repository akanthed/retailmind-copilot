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

  const translatedFaqs = [
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
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>• <span className="text-foreground font-medium">{t('help.featureAICopilot')}</span> {t('help.featureAICopilotDesc')}</p>
                <p>• <span className="text-foreground font-medium">{t('help.featurePriceMonitoring')}</span> {t('help.featurePriceMonitoringDesc')}</p>
                <p>• <span className="text-foreground font-medium">{t('help.featureRecommendations')}</span> {t('help.featureRecommendationsDesc')}</p>
                <p>• <span className="text-foreground font-medium">{t('help.featureAlerts')}</span> {t('help.featureAlertsDesc')}</p>
                <p>• <span className="text-foreground font-medium">{t('help.featureAnalytics')}</span> {t('help.featureAnalyticsDesc')}</p>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ */}
        <div className="mb-10 animate-fade-in" style={{ animationDelay: "0.2s" }}>
          <h2 className="text-lg font-medium text-foreground mb-4">{t('help.commonQuestions')}</h2>
          <div className="space-y-3">
            {translatedFaqs.map((faq, index) => (
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

        {/* Technical Details & Support */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in" style={{ animationDelay: "0.25s" }}>
          <div className="premium-card rounded-2xl p-6">
            <Book className="w-8 h-8 text-primary mb-3" />
            <h3 className="font-medium text-foreground mb-2">{t('help.technicalStackTitle')}</h3>
            <div className="text-sm text-muted-foreground space-y-1">
              <p>• {t('help.techBedrock')}</p>
              <p>• {t('help.techLambda')}</p>
              <p>• {t('help.techDynamoDB')}</p>
              <p>• {t('help.techAPIGateway')}</p>
              <p>• {t('help.techFrontend')}</p>
            </div>
          </div>
          <div className="premium-card rounded-2xl p-6">
            <HelpCircle className="w-8 h-8 text-primary mb-3" />
            <h3 className="font-medium text-foreground mb-2">{t('help.needHelpTitle')}</h3>
            <div className="text-sm text-muted-foreground space-y-2">
              <p>{t('help.needHelpDesc')} <code className="text-xs bg-accent px-1 py-0.5 rounded">docs/</code> {t('help.needHelpFolder')}</p>
              <p>• {t('help.needHelpFile1')}</p>
              <p>• {t('help.needHelpFile2')}</p>
              <p>• {t('help.needHelpFile3')}</p>
              <p className="pt-2">{t('help.needHelpCommand')} <code className="text-xs bg-accent px-1 py-0.5 rounded">./check-config.ps1</code></p>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
