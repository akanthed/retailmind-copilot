import { AppLayout } from "@/components/layout/AppLayout";
import { MetricCard } from "@/components/ui/Cards";
import { BarChart3, TrendingUp, Package, AlertTriangle } from "lucide-react";

const competitorData = [
  { name: "TechStore Pro", avgPriceDiff: "-8%", products: 24, lastUpdate: "2h ago" },
  { name: "GadgetWorld", avgPriceDiff: "+3%", products: 18, lastUpdate: "4h ago" },
  { name: "ElectroMart", avgPriceDiff: "-2%", products: 31, lastUpdate: "1h ago" },
];

const demandForecast = [
  { product: "Wireless Earbuds Pro", trend: "up" as const, change: "+40%", period: "Next 7 days" },
  { product: "Smart Watch Series X", trend: "up" as const, change: "+25%", period: "Next 14 days" },
  { product: "Fitness Tracker", trend: "down" as const, change: "-15%", period: "Next 7 days" },
];

export default function InsightsPage() {
  return (
    <AppLayout>
      <div className="min-h-screen p-6 md:p-10 max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-primary" />
            </div>
            <h1 className="text-2xl font-semibold text-foreground">Evidence & Insights</h1>
          </div>
          <p className="text-muted-foreground">
            Data-driven market intelligence powering your recommendations.
          </p>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8 animate-fade-in" style={{ animationDelay: "0.1s" }}>
          <MetricCard
            label="Products Tracked"
            value="127"
            icon={Package}
          />
          <MetricCard
            label="Competitor Prices"
            value="1,842"
            change="+124 today"
            trend="up"
            icon={BarChart3}
          />
          <MetricCard
            label="Pricing Opportunities"
            value="12"
            change="+3 new"
            trend="up"
            icon={TrendingUp}
          />
          <MetricCard
            label="Risk Alerts"
            value="4"
            change="2 critical"
            trend="down"
            icon={AlertTriangle}
          />
        </div>

        {/* Competitor Intelligence */}
        <div className="mb-8 animate-fade-in" style={{ animationDelay: "0.15s" }}>
          <h2 className="text-lg font-medium text-foreground mb-4">Competitor Price Intelligence</h2>
          <div className="premium-card rounded-2xl overflow-hidden">
            <div className="grid grid-cols-4 gap-4 p-4 border-b border-border text-sm font-medium text-muted-foreground">
              <span>Competitor</span>
              <span>Avg. Price Difference</span>
              <span>Products Monitored</span>
              <span>Last Update</span>
            </div>
            {competitorData.map((comp, index) => (
              <div
                key={comp.name}
                className="grid grid-cols-4 gap-4 p-4 border-b border-border last:border-0 hover:bg-accent/30 transition-colors"
              >
                <span className="font-medium text-foreground">{comp.name}</span>
                <span className={comp.avgPriceDiff.startsWith("-") ? "text-success" : "text-destructive"}>
                  {comp.avgPriceDiff}
                </span>
                <span className="text-muted-foreground">{comp.products}</span>
                <span className="text-muted-foreground">{comp.lastUpdate}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Demand Forecast */}
        <div className="animate-fade-in" style={{ animationDelay: "0.2s" }}>
          <h2 className="text-lg font-medium text-foreground mb-4">Demand Forecast</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {demandForecast.map((item, index) => (
              <div key={item.product} className="premium-card rounded-2xl p-5">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-muted-foreground">{item.period}</span>
                  <div className={`flex items-center gap-1 text-sm font-medium ${item.trend === "up" ? "text-success" : "text-destructive"}`}>
                    {item.trend === "up" ? <TrendingUp className="w-4 h-4" /> : <TrendingUp className="w-4 h-4 rotate-180" />}
                    {item.change}
                  </div>
                </div>
                <h3 className="font-medium text-foreground">{item.product}</h3>
                {/* Simple forecast bar */}
                <div className="mt-4 h-2 bg-secondary rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${item.trend === "up" ? "bg-success" : "bg-destructive"}`}
                    style={{ width: item.trend === "up" ? "75%" : "35%" }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Confidence Note */}
        <div className="mt-8 p-4 bg-secondary/50 rounded-xl text-center animate-fade-in" style={{ animationDelay: "0.25s" }}>
          <p className="text-sm text-muted-foreground">
            All forecasts include 95% confidence intervals. Data refreshes every 4 hours.
          </p>
        </div>
      </div>
    </AppLayout>
  );
}
