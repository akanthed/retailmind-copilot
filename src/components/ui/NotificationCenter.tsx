// Notification center for real-time alerts and updates
import { useState, useEffect } from "react";
import { Bell, X, Check, AlertTriangle, Info, TrendingDown } from "lucide-react";
import { Button } from "./button";
import { Badge } from "./badge";
import { ScrollArea } from "./scroll-area";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "./popover";
import { apiClient, Alert } from "@/api/client";
import { formatDistanceToNow } from "date-fns";

interface NotificationCenterProps {
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export function NotificationCenter({ 
  autoRefresh = true, 
  refreshInterval = 60000 
}: NotificationCenterProps) {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    loadAlerts();

    if (autoRefresh) {
      const interval = setInterval(loadAlerts, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [autoRefresh, refreshInterval]);

  async function loadAlerts() {
    setLoading(true);
    try {
      const result = await apiClient.getAlerts();
      if (result.data) {
        const sortedAlerts = result.data.alerts
          .sort((a, b) => b.createdAt - a.createdAt)
          .slice(0, 10); // Show last 10
        
        setAlerts(sortedAlerts);
        setUnreadCount(sortedAlerts.filter(a => !a.acknowledged).length);
      }
    } catch (error) {
      console.error("Failed to load alerts:", error);
    } finally {
      setLoading(false);
    }
  }

  async function acknowledgeAlert(alertId: string) {
    try {
      await apiClient.acknowledgeAlert(alertId);
      setAlerts(prev => 
        prev.map(alert => 
          alert.id === alertId 
            ? { ...alert, acknowledged: true, acknowledgedAt: Date.now() }
            : alert
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Failed to acknowledge alert:", error);
    }
  }

  async function acknowledgeAll() {
    const unacknowledged = alerts.filter(a => !a.acknowledged);
    await Promise.all(
      unacknowledged.map(alert => acknowledgeAlert(alert.id))
    );
  }

  function getAlertIcon(type: Alert['type']) {
    switch (type) {
      case 'price_drop':
        return <TrendingDown className="w-4 h-4" />;
      case 'stock_risk':
        return <AlertTriangle className="w-4 h-4" />;
      case 'opportunity':
        return <Info className="w-4 h-4" />;
      default:
        return <Bell className="w-4 h-4" />;
    }
  }

  function getAlertColor(severity: Alert['severity']) {
    switch (severity) {
      case 'critical':
        return 'text-destructive bg-destructive/10';
      case 'warning':
        return 'text-warning bg-warning/10';
      case 'info':
        return 'text-primary bg-primary/10';
      default:
        return 'text-muted-foreground bg-secondary';
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative rounded-xl">
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      
      <PopoverContent className="w-96 p-0" align="end">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div>
            <h3 className="font-semibold text-foreground">Notifications</h3>
            <p className="text-xs text-muted-foreground">
              {unreadCount} unread
            </p>
          </div>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={acknowledgeAll}
              className="text-xs"
            >
              Mark all read
            </Button>
          )}
        </div>

        <ScrollArea className="h-[400px]">
          {loading && alerts.length === 0 ? (
            <div className="p-8 text-center">
              <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full mx-auto mb-2"></div>
              <p className="text-sm text-muted-foreground">Loading...</p>
            </div>
          ) : alerts.length === 0 ? (
            <div className="p-8 text-center">
              <Bell className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
              <p className="text-sm text-muted-foreground">No notifications</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {alerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`p-4 hover:bg-accent/50 transition-colors ${
                    !alert.acknowledged ? 'bg-accent/20' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${getAlertColor(alert.severity)}`}>
                      {getAlertIcon(alert.type)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h4 className="font-medium text-sm text-foreground">
                          {alert.title}
                        </h4>
                        {!alert.acknowledged && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 flex-shrink-0"
                            onClick={() => acknowledgeAlert(alert.id)}
                          >
                            <Check className="w-3 h-3" />
                          </Button>
                        )}
                      </div>
                      
                      <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                        {alert.description}
                      </p>
                      
                      {alert.suggestion && (
                        <p className="text-xs text-primary mb-2">
                          💡 {alert.suggestion}
                        </p>
                      )}
                      
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs">
                          {alert.productName}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(alert.createdAt), { addSuffix: true })}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        {alerts.length > 0 && (
          <div className="p-3 border-t border-border">
            <Button
              variant="ghost"
              className="w-full text-sm"
              onClick={() => {
                setOpen(false);
                window.location.href = '/alerts';
              }}
            >
              View all alerts
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
