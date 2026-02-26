import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Settings, Store, Bell, DollarSign, Check, ChevronRight } from "lucide-react";
import { useState } from "react";

export default function SetupPage() {
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
            <h1 className="text-2xl font-semibold text-foreground">Settings</h1>
          </div>
          <p className="text-muted-foreground">
            Configure RetailMind AI for your store
          </p>
        </div>

        {/* Store Information */}
        <div className="premium-card rounded-2xl p-6 mb-6 animate-fade-in" style={{ animationDelay: "0.1s" }}>
          <div className="flex items-center gap-3 mb-4">
            <Store className="w-5 h-5 text-primary" />
            <h2 className="font-medium text-foreground">Store Information</h2>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Store Name
              </label>
              <input
                type="text"
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-secondary text-foreground border border-border focus:outline-none focus:ring-2 focus:ring-primary/50"
                placeholder="Enter your store name"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Currency
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
            <h2 className="font-medium text-foreground">Alert Preferences</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Email for Alerts (Optional)
              </label>
              <input
                type="email"
                value={alertEmail}
                onChange={(e) => setAlertEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-secondary text-foreground border border-border focus:outline-none focus:ring-2 focus:ring-primary/50"
                placeholder="your@email.com"
              />
              <p className="text-xs text-muted-foreground mt-2">
                Get urgent alerts via email (critical price drops, stockouts)
              </p>
            </div>

            <div className="space-y-3">
              <label className="flex items-center justify-between p-4 rounded-xl bg-secondary cursor-pointer">
                <div>
                  <p className="font-medium text-foreground">Price Change Alerts</p>
                  <p className="text-sm text-muted-foreground">Notify when competitors change prices</p>
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
                  <p className="font-medium text-foreground">Stock Risk Alerts</p>
                  <p className="text-sm text-muted-foreground">Notify when inventory is running low</p>
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
            <h2 className="font-medium text-foreground">Pricing Rules</h2>
          </div>

          <div className="space-y-3">
            <div className="p-4 rounded-xl bg-secondary">
              <div className="flex items-center justify-between mb-2">
                <p className="font-medium text-foreground">Minimum Profit Margin</p>
                <span className="text-primary font-medium">20%</span>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                AI won't suggest prices below this margin
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
                <p className="font-medium text-foreground">Price Change Limit</p>
                <span className="text-primary font-medium">15%</span>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                Maximum price change in one recommendation
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
            Changes are saved automatically
          </p>
          <Button
            onClick={handleSave}
            className="rounded-xl bg-primary text-primary-foreground px-6"
          >
            {saved ? (
              <>
                <Check className="w-4 h-4 mr-2" />
                Saved!
              </>
            ) : (
              'Save Changes'
            )}
          </Button>
        </div>

        {/* Quick Links */}
        <div className="mt-8 space-y-2 animate-fade-in" style={{ animationDelay: "0.3s" }}>
          <h3 className="text-sm font-medium text-muted-foreground mb-3">Quick Actions</h3>
          <button className="w-full premium-card rounded-xl p-4 flex items-center justify-between hover:bg-accent/30 transition-colors">
            <span className="text-foreground">View Product Catalog</span>
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </button>
          <button className="w-full premium-card rounded-xl p-4 flex items-center justify-between hover:bg-accent/30 transition-colors">
            <span className="text-foreground">Manage Competitors</span>
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </button>
          <button className="w-full premium-card rounded-xl p-4 flex items-center justify-between hover:bg-accent/30 transition-colors">
            <span className="text-foreground">Export Data</span>
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>
      </div>
    </AppLayout>
  );
}
