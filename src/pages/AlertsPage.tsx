import { AppLayout } from "@/components/layout/AppLayout";
import { AlertCard } from "@/components/ui/Cards";
import { Bell, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";

const alerts = [
  {
    id: 1,
    type: "price_drop" as const,
    title: "TechStore Pro dropped Wireless Earbuds price",
    description: "Price reduced from $79.99 to $67.99 (15% decrease)",
    timestamp: "2 hours ago",
    suggestion: "Consider matching to maintain market share",
  },
  {
    id: 2,
    type: "stock_risk" as const,
    title: "Smart Watch Series X stock running low",
    description: "Only 3 days of inventory remaining at current sales velocity",
    timestamp: "4 hours ago",
    suggestion: "Reorder 150 units to maintain 2-week buffer",
  },
  {
    id: 3,
    type: "opportunity" as const,
    title: "Pricing opportunity on Bluetooth Speaker",
    description: "All competitors are out of stock. Demand up 45% this week.",
    timestamp: "6 hours ago",
    suggestion: "Consider 8% price increase while supply is limited",
  },
  {
    id: 4,
    type: "price_drop" as const,
    title: "ElectroMart undercut on Fitness Tracker",
    description: "New price: $34.99 (you: $39.99, 14% higher)",
    timestamp: "8 hours ago",
    suggestion: "Bundle with accessories instead of price match",
  },
  {
    id: 5,
    type: "stock_risk" as const,
    title: "USB-C Cable stockout imminent",
    description: "Zero stock expected in 48 hours. High-velocity item.",
    timestamp: "12 hours ago",
    suggestion: "Expedite reorder or source from backup supplier",
  },
  {
    id: 6,
    type: "opportunity" as const,
    title: "Trending: Portable Charger demand spike",
    description: "Search volume up 120% this week. You have healthy stock.",
    timestamp: "1 day ago",
    suggestion: "Feature in homepage and consider 5% premium pricing",
  },
];

export default function AlertsPage() {
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
          <Button variant="outline" className="rounded-xl">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
        </div>

        {/* Alert Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8 animate-fade-in" style={{ animationDelay: "0.1s" }}>
          <div className="premium-card rounded-2xl p-4 text-center">
            <p className="text-2xl font-semibold text-destructive">2</p>
            <p className="text-sm text-muted-foreground">Price Changes</p>
          </div>
          <div className="premium-card rounded-2xl p-4 text-center">
            <p className="text-2xl font-semibold text-warning">2</p>
            <p className="text-sm text-muted-foreground">Stock Risks</p>
          </div>
          <div className="premium-card rounded-2xl p-4 text-center">
            <p className="text-2xl font-semibold text-success">2</p>
            <p className="text-sm text-muted-foreground">Opportunities</p>
          </div>
        </div>

        {/* Alerts Timeline */}
        <div className="space-y-4 animate-fade-in" style={{ animationDelay: "0.15s" }}>
          <h2 className="text-lg font-medium text-foreground">Recent Activity</h2>
          {alerts.map((alert, index) => (
            <div key={alert.id} className="animate-slide-in-right" style={{ animationDelay: `${0.05 * index}s` }}>
              <AlertCard {...alert} />
            </div>
          ))}
        </div>

        {/* Load More */}
        <div className="mt-8 text-center">
          <Button variant="outline" className="rounded-xl">
            Load more alerts
          </Button>
        </div>
      </div>
    </AppLayout>
  );
}
