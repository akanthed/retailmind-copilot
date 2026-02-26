import { AppLayout } from "@/components/layout/AppLayout";
import { AlertCard } from "@/components/ui/Cards";
import { Bell, Filter, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { apiClient } from "@/api/client";
import { useState, useEffect } from "react";
import type { Alert } from "@/api/client";

export default function AlertsPage() {
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
    }
    setLoading(false);
  };

  const loadStats = async () => {
    const response = await apiClient.getAlertStats();
    if (response.data && response.data.byType) {
      setStats({
        price_drop: response.data.byType.price_drop || 0,
        stock_risk: response.data.byType.stock_risk || 0,
        opportunity: response.data.byType.opportunity || 0
      });
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
    
    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    return 'Just now';
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
              <h1 className="text-2xl font-semibold text-foreground">Alerts & Signals</h1>
            </div>
            <p className="text-muted-foreground">
              Proactive notifications about market changes and risks.
            </p>
          </div>
          <Button 
            onClick={handleGenerateAlerts}
            disabled={generating}
            className="rounded-xl bg-gradient-to-r from-primary to-primary/80"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            {generating ? 'Generating...' : 'Generate Alerts'}
          </Button>
        </div>

        {/* Alert Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8 animate-fade-in" style={{ animationDelay: "0.1s" }}>
          <div className="premium-card rounded-2xl p-4 text-center">
            <p className="text-2xl font-semibold text-destructive">{stats.price_drop || 0}</p>
            <p className="text-sm text-muted-foreground">Price Changes</p>
          </div>
          <div className="premium-card rounded-2xl p-4 text-center">
            <p className="text-2xl font-semibold text-warning">{stats.stock_risk || 0}</p>
            <p className="text-sm text-muted-foreground">Stock Risks</p>
          </div>
          <div className="premium-card rounded-2xl p-4 text-center">
            <p className="text-2xl font-semibold text-success">{stats.opportunity || 0}</p>
            <p className="text-sm text-muted-foreground">Opportunities</p>
          </div>
        </div>

        {/* Alerts Timeline */}
        <div className="space-y-4 animate-fade-in" style={{ animationDelay: "0.15s" }}>
          <h2 className="text-lg font-medium text-foreground">Recent Activity</h2>
          
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Loading alerts...</div>
          ) : alerts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No alerts yet. Click "Generate Alerts" to analyze your products.
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
