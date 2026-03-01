import { AppLayout } from "@/components/layout/AppLayout";
import { AlertCard } from "@/components/ui/Cards";
import { Bell, Filter, Sparkles, Download, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { apiClient } from "@/api/client";
import { useState, useEffect } from "react";
import type { Alert } from "@/api/client";
import { useLanguage } from "@/i18n/LanguageContext";
import { exportAlertsToCSV, exportAlertsToPDF } from "@/lib/exportUtils";

export default function AlertsPage() {
  const { t, language } = useLanguage();
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [stats, setStats] = useState({ price_drop: 0, stock_risk: 0, opportunity: 0 });
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    loadAlerts();
    loadStats();
  }, []);

  const loadAlerts = async () => {
    setLoading(true);
    const response = await apiClient.getAlerts();
    if (response.data) {
      setAlerts(response.data.alerts);
      
      // Calculate stats from alerts directly if available
      const calculatedStats = {
        price_drop: 0,
        stock_risk: 0,
        opportunity: 0
      };
      
      response.data.alerts.forEach(alert => {
        if (alert.type === 'price_drop') calculatedStats.price_drop++;
        else if (alert.type === 'stock_risk') calculatedStats.stock_risk++;
        else if (alert.type === 'opportunity') calculatedStats.opportunity++;
      });
      
      setStats(calculatedStats);
    }
    setLoading(false);
  };

  const loadStats = async () => {
    try {
      const response = await apiClient.getAlertStats();
      if (response.data && response.data.byType) {
        setStats({
          price_drop: response.data.byType.price_drop || 0,
          stock_risk: response.data.byType.stock_risk || 0,
          opportunity: response.data.byType.opportunity || 0
        });
      }
    } catch {
      // If stats endpoint fails, stats will be populated from loaded alerts
      return;
    }
  };

  const handleGenerateAlerts = async () => {
    setGenerating(true);
    const response = await apiClient.generateAlerts();
    if (response.data) {
      await loadAlerts();
      await loadStats();
    }
    setGenerating(false);
  };

  const formatTimestamp = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    
    if (days > 0) {
      return language === 'hi' 
        ? `${days} दिन पहले` 
        : `${days} day${days > 1 ? 's' : ''} ago`;
    }
    if (hours > 0) {
      return language === 'hi'
        ? `${hours} घंटे पहले`
        : `${hours} hour${hours > 1 ? 's' : ''} ago`;
    }
    return language === 'hi' ? 'अभी' : 'Just now';
  };

  return (
    <AppLayout>
      <div className="min-h-screen p-6 md:p-10 max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-start justify-between mb-8 animate-fade-in">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Bell className="w-5 h-5 text-primary" />
              </div>
              <h1 className="text-2xl font-semibold text-foreground">{t('alerts.title')}</h1>
            </div>
            <p className="text-muted-foreground">
              {t('alerts.subtitle')}
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => exportAlertsToCSV(alerts)}
              disabled={alerts.length === 0}
              className="gap-2"
            >
              <Download className="w-4 h-4" />
              CSV
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => exportAlertsToPDF(alerts)}
              disabled={alerts.length === 0}
              className="gap-2"
            >
              <FileText className="w-4 h-4" />
              PDF
            </Button>
            <Button 
              onClick={handleGenerateAlerts}
              disabled={generating}
              className="rounded-xl bg-gradient-to-r from-primary to-primary/80"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              {generating ? t('alerts.generating') : t('alerts.generateAlerts')}
            </Button>
          </div>
        </div>

        {/* Alert Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8 animate-fade-in" style={{ animationDelay: "0.1s" }}>
          <div className="premium-card rounded-2xl p-4 text-center">
            <p className="text-2xl font-semibold text-destructive">{stats.price_drop || 0}</p>
            <p className="text-sm text-muted-foreground">{t('alerts.priceChanges')}</p>
          </div>
          <div className="premium-card rounded-2xl p-4 text-center">
            <p className="text-2xl font-semibold text-warning">{stats.stock_risk || 0}</p>
            <p className="text-sm text-muted-foreground">{t('alerts.stockRisks')}</p>
          </div>
          <div className="premium-card rounded-2xl p-4 text-center">
            <p className="text-2xl font-semibold text-success">{stats.opportunity || 0}</p>
            <p className="text-sm text-muted-foreground">{t('alerts.opportunities')}</p>
          </div>
        </div>

        {/* Alerts Timeline */}
        <div className="space-y-4 animate-fade-in" style={{ animationDelay: "0.15s" }}>
          <h2 className="text-lg font-medium text-foreground">{t('alerts.recentActivity')}</h2>
          
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">{t('alerts.loadingAlerts')}</div>
          ) : alerts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {t('alerts.noAlerts')}
            </div>
          ) : (
            alerts.map((alert, index) => (
              <div key={alert.id} className="animate-slide-in-right" style={{ animationDelay: `${0.05 * index}s` }}>
                <AlertCard 
                  type={alert.type}
                  title={alert.title}
                  description={alert.description}
                  timestamp={formatTimestamp(alert.createdAt)}
                  suggestion={alert.suggestion}
                />
              </div>
            ))
          )}
        </div>
      </div>
    </AppLayout>
  );
}
