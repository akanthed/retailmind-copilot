import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import enCommon from './translations/en/common.json';
import enNav from './translations/en/nav.json';
import enOnboarding from './translations/en/onboarding.json';
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

import hiCommon from './translations/hi/common.json';
import hiNav from './translations/hi/nav.json';
import hiOnboarding from './translations/hi/onboarding.json';
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

type Language = 'en' | 'hi';

interface Translations {
  common: typeof enCommon;
  nav: typeof enNav;
  onboarding: typeof enOnboarding;
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
    onboarding: enOnboarding,
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
  },
  hi: {
    common: hiCommon,
    nav: hiNav,
    onboarding: hiOnboarding,
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
  },
};

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('language');
    return (saved === 'hi' ? 'hi' : 'en') as Language;
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
