import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import enCommon from './translations/en/common.json';
import enNav from './translations/en/nav.json';
import enProducts from './translations/en/products.json';
import enDashboard from './translations/en/dashboard.json';
import enActions from './translations/en/actions.json';
import enHelp from './translations/en/help.json';
import enErrors from './translations/en/errors.json';
import enLoading from './translations/en/loading.json';
import enPriceComparison from './translations/en/priceComparison.json';
import enAlerts from './translations/en/alerts.json';
import enDecisions from './translations/en/decisions.json';
import enNotFound from './translations/en/notFound.json';
import enLanding from './translations/en/landing.json';
import enCommandCenter from './translations/en/commandCenter.json';
import enSetup from './translations/en/setup.json';
import enReports from './translations/en/reports.json';
import enOutcomes from './translations/en/outcomes.json';
import enInsights from './translations/en/insights.json';
import enOnboarding from './translations/en/onboarding.json';
import enForecast from './translations/en/forecast.json';

import hiCommon from './translations/hi/common.json';
import hiNav from './translations/hi/nav.json';
import hiProducts from './translations/hi/products.json';
import hiDashboard from './translations/hi/dashboard.json';
import hiActions from './translations/hi/actions.json';
import hiHelp from './translations/hi/help.json';
import hiErrors from './translations/hi/errors.json';
import hiLoading from './translations/hi/loading.json';
import hiPriceComparison from './translations/hi/priceComparison.json';
import hiAlerts from './translations/hi/alerts.json';
import hiDecisions from './translations/hi/decisions.json';
import hiNotFound from './translations/hi/notFound.json';
import hiLanding from './translations/hi/landing.json';
import hiCommandCenter from './translations/hi/commandCenter.json';
import hiSetup from './translations/hi/setup.json';
import hiReports from './translations/hi/reports.json';
import hiOutcomes from './translations/hi/outcomes.json';
import hiInsights from './translations/hi/insights.json';
import hiOnboarding from './translations/hi/onboarding.json';
import hiForecast from './translations/hi/forecast.json';

type Language = 'en' | 'hi';

interface Translations {
  common: typeof enCommon;
  nav: typeof enNav;
  products: typeof enProducts;
  dashboard: typeof enDashboard;
  actions: typeof enActions;
  help: typeof enHelp;
  errors: typeof enErrors;
  loading: typeof enLoading;
  priceComparison: typeof enPriceComparison;
  alerts: typeof enAlerts;
  decisions: typeof enDecisions;
  notFound: typeof enNotFound;
  landing: typeof enLanding;
  commandCenter: typeof enCommandCenter;
  setup: typeof enSetup;
  reports: typeof enReports;
  onboarding: typeof enOnboarding;
  forecast: typeof enForecast;
  outcomes: typeof enOutcomes;
  insights: typeof enInsights;
}

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const translations: Record<Language, Translations> = {
  en: {
    common: enCommon,
    nav: enNav,
    products: enProducts,
    dashboard: enDashboard,
    actions: enActions,
    help: enHelp,
    errors: enErrors,
    loading: enLoading,
    priceComparison: enPriceComparison,
    alerts: enAlerts,
    decisions: enDecisions,
    notFound: enNotFound,
    landing: enLanding,
    commandCenter: enCommandCenter,
    setup: enSetup,
    reports: enReports,
    onboarding: enOnboarding,
    forecast: enForecast,
    outcomes: enOutcomes,
    insights: enInsights,
  },
  hi: {
    common: hiCommon,
    nav: hiNav,
    products: hiProducts,
    dashboard: hiDashboard,
    actions: hiActions,
    help: hiHelp,
    errors: hiErrors,
    loading: hiLoading,
    priceComparison: hiPriceComparison,
    alerts: hiAlerts,
    decisions: hiDecisions,
    notFound: hiNotFound,
    landing: hiLanding,
    commandCenter: hiCommandCenter,
    onboarding: hiOnboarding,
    forecast: hiForecast,
    setup: hiSetup,
    reports: hiReports,
    outcomes: hiOutcomes,
    insights: hiInsights,
  },
};

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('language');
    return (saved === 'en' ? 'en' : 'hi') as Language;
  });

  useEffect(() => {
    localStorage.setItem('language', language);
    document.documentElement.lang = language;
  }, [language]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  const t = (key: string): string => {
    const keys = key.split('.');
    let value: any = translations[language];
    
    for (const k of keys) {
      value = value?.[k];
      if (value === undefined) break;
    }
    
    return value || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
}
