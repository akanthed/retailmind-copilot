import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Settings, Store, Bell, DollarSign, Check, ChevronRight } from "lucide-react";
import { useState } from "react";
import { useLanguage } from "@/i18n/LanguageContext";

export default function SetupPage() {
  const { t } = useLanguage();
  const [storeName, setStoreName] = useState("My Retail Store");
  const [currency, setCurrency] = useState("INR");
  const [alertEmail, setAlertEmail] = useState("");
  const [priceAlerts, setPriceAlerts] = useState(true);
  const [stockAlerts, setStockAlerts] = useState(true);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <AppLayout>
      <div className="min-h-screen p-6 md:p-10 max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Settings className="w-5 h-5 text-primary" />
            </div>
            <h1 className="text-2xl font-semibold text-foreground">{t('setup.title')}</h1>
          </div>
          <p className="text-muted-foreground">
            {t('setup.subtitle')}
          </p>
        </div>

        {/* Store Information */}
        <div className="premium-card rounded-2xl p-6 mb-6 animate-fade-in" style={{ animationDelay: "0.1s" }}>
          <div className="flex items-center gap-3 mb-4">
            <Store className="w-5 h-5 text-primary" />
            <h2 className="font-medium text-foreground">{t('setup.storeInfo')}</h2>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                {t('setup.storeName')}
              </label>
              <input
                type="text"
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-secondary text-foreground border border-border focus:outline-none focus:ring-2 focus:ring-primary/50"
                placeholder={t('setup.storeNamePlaceholder')}
              />
            </div>

            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                {t('setup.currency')}
              </label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-secondary text-foreground border border-border focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                <option value="INR">₹ Indian Rupee (INR)</option>
                <option value="USD">$ US Dollar (USD)</option>
                <option value="EUR">€ Euro (EUR)</option>
                <option value="GBP">£ British Pound (GBP)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Alert Settings */}
        <div className="premium-card rounded-2xl p-6 mb-6 animate-fade-in" style={{ animationDelay: "0.15s" }}>
          <div className="flex items-center gap-3 mb-4">
            <Bell className="w-5 h-5 text-primary" />
            <h2 className="font-medium text-foreground">{t('setup.alertPreferences')}</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                {t('setup.emailForAlerts')}
              </label>
              <input
                type="email"
                value={alertEmail}
                onChange={(e) => setAlertEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-secondary text-foreground border border-border focus:outline-none focus:ring-2 focus:ring-primary/50"
                placeholder={t('setup.emailPlaceholder')}
              />
              <p className="text-xs text-muted-foreground mt-2">
                {t('setup.emailHelp')}
              </p>
            </div>

            <div className="space-y-3">
              <label className="flex items-center justify-between p-4 rounded-xl bg-secondary cursor-pointer">
                <div>
                  <p className="font-medium text-foreground">{t('setup.priceChangeAlerts')}</p>
                  <p className="text-sm text-muted-foreground">{t('setup.priceChangeAlertsDesc')}</p>
                </div>
                <input
                  type="checkbox"
                  checked={priceAlerts}
                  onChange={(e) => setPriceAlerts(e.target.checked)}
                  className="w-5 h-5 rounded border-border text-primary focus:ring-primary"
                />
              </label>

              <label className="flex items-center justify-between p-4 rounded-xl bg-secondary cursor-pointer">
                <div>
                  <p className="font-medium text-foreground">{t('setup.stockRiskAlerts')}</p>
                  <p className="text-sm text-muted-foreground">{t('setup.stockRiskAlertsDesc')}</p>
                </div>
                <input
                  type="checkbox"
                  checked={stockAlerts}
                  onChange={(e) => setStockAlerts(e.target.checked)}
                  className="w-5 h-5 rounded border-border text-primary focus:ring-primary"
                />
              </label>
            </div>
          </div>
        </div>

        {/* Pricing Rules */}
        <div className="premium-card rounded-2xl p-6 mb-6 animate-fade-in" style={{ animationDelay: "0.2s" }}>
          <div className="flex items-center gap-3 mb-4">
            <DollarSign className="w-5 h-5 text-primary" />
            <h2 className="font-medium text-foreground">{t('setup.pricingRules')}</h2>
          </div>

          <div className="space-y-3">
            <div className="p-4 rounded-xl bg-secondary">
              <div className="flex items-center justify-between mb-2">
                <p className="font-medium text-foreground">{t('setup.minProfitMargin')}</p>
                <span className="text-primary font-medium">20%</span>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                {t('setup.minProfitMarginDesc')}
              </p>
              <input
                type="range"
                min="10"
                max="50"
                defaultValue="20"
                className="w-full"
              />
            </div>

            <div className="p-4 rounded-xl bg-secondary">
              <div className="flex items-center justify-between mb-2">
                <p className="font-medium text-foreground">{t('setup.priceChangeLimit')}</p>
                <span className="text-primary font-medium">15%</span>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                {t('setup.priceChangeLimitDesc')}
              </p>
              <input
                type="range"
                min="5"
                max="30"
                defaultValue="15"
                className="w-full"
              />
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex items-center justify-between animate-fade-in" style={{ animationDelay: "0.25s" }}>
          <p className="text-sm text-muted-foreground">
            {t('setup.changesSavedAuto')}
          </p>
          <Button
            onClick={handleSave}
            className="rounded-xl bg-primary text-primary-foreground px-6"
          >
            {saved ? (
              <>
                <Check className="w-4 h-4 mr-2" />
                {t('setup.saved')}
              </>
            ) : (
              t('setup.saveChanges')
            )}
          </Button>
        </div>

        {/* Quick Links */}
        <div className="mt-8 space-y-2 animate-fade-in" style={{ animationDelay: "0.3s" }}>
          <h3 className="text-sm font-medium text-muted-foreground mb-3">{t('setup.quickActions')}</h3>
          <button className="w-full premium-card rounded-xl p-4 flex items-center justify-between hover:bg-accent/30 transition-colors">
            <span className="text-foreground">{t('setup.viewProductCatalog')}</span>
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </button>
          <button className="w-full premium-card rounded-xl p-4 flex items-center justify-between hover:bg-accent/30 transition-colors">
            <span className="text-foreground">{t('setup.manageCompetitors')}</span>
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </button>
          <button className="w-full premium-card rounded-xl p-4 flex items-center justify-between hover:bg-accent/30 transition-colors">
            <span className="text-foreground">{t('setup.exportData')}</span>
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>
      </div>
    </AppLayout>
  );
}
