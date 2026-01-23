import { AppLayout } from "@/components/layout/AppLayout";
import { Target, CheckCircle, Clock, TrendingUp, TrendingDown } from "lucide-react";

const outcomes = [
  {
    id: 1,
    action: "Lowered price on Wireless Earbuds Pro",
    date: "Jan 15, 2024",
    status: "implemented" as const,
    impactType: "revenue" as const,
    impactValue: "+₹3,240",
    impactPercent: "+18%",
    before: "₹79.99",
    after: "₹69.99",
    beforeMetric: "42 units/week",
    afterMetric: "68 units/week",
  },
  {
    id: 2,
    action: "Increased stock for Smart Watch Series X",
    date: "Jan 12, 2024",
    status: "implemented" as const,
    impactType: "risk" as const,
    impactValue: "0 stockouts",
    impactPercent: "Prevented",
    before: "3 days stock",
    after: "14 days stock",
    beforeMetric: "High risk",
    afterMetric: "Stable",
  },
  {
    id: 3,
    action: "Bundle offer on Fitness Tracker",
    date: "Jan 10, 2024",
    status: "implemented" as const,
    impactType: "revenue" as const,
    impactValue: "+₹1,850",
    impactPercent: "+45%",
    before: "45 days stock",
    after: "12 days stock",
    beforeMetric: "Slow moving",
    afterMetric: "Normal velocity",
  },
  {
    id: 4,
    action: "Price increase on Portable Charger",
    date: "Jan 8, 2024",
    status: "pending" as const,
    impactType: "revenue" as const,
    impactValue: "Tracking...",
    impactPercent: "",
    before: "₹24.99",
    after: "₹26.99",
    beforeMetric: "—",
    afterMetric: "—",
  },
];

export default function OutcomesPage() {
  return (
    <AppLayout>
      <div className="min-h-screen p-6 md:p-10 max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Target className="w-5 h-5 text-primary" />
            </div>
            <h1 className="text-2xl font-semibold text-foreground">Outcome Tracking</h1>
          </div>
          <p className="text-muted-foreground">
            Track the impact of your pricing decisions.
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 animate-fade-in" style={{ animationDelay: "0.1s" }}>
          <div className="premium-card rounded-2xl p-5">
            <p className="text-sm text-muted-foreground mb-1">Total Revenue Impact</p>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-semibold text-success">+₹5,090</span>
              <span className="text-sm text-success">this month</span>
            </div>
          </div>
          <div className="premium-card rounded-2xl p-5">
            <p className="text-sm text-muted-foreground mb-1">Actions Implemented</p>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-semibold text-foreground">3</span>
              <span className="text-sm text-muted-foreground">of 4 recommendations</span>
            </div>
          </div>
          <div className="premium-card rounded-2xl p-5">
            <p className="text-sm text-muted-foreground mb-1">Risks Prevented</p>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-semibold text-foreground">2</span>
              <span className="text-sm text-muted-foreground">stockouts avoided</span>
            </div>
          </div>
        </div>

        {/* Outcomes List */}
        <div className="space-y-4 animate-fade-in" style={{ animationDelay: "0.15s" }}>
          <h2 className="text-lg font-medium text-foreground">Decision History</h2>
          {outcomes.map((outcome, index) => (
            <div
              key={outcome.id}
              className="premium-card rounded-2xl p-6 animate-slide-in-right"
              style={{ animationDelay: `${0.05 * index}s` }}
            >
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    {outcome.status === "implemented" ? (
                      <CheckCircle className="w-4 h-4 text-success" />
                    ) : (
                      <Clock className="w-4 h-4 text-warning" />
                    )}
                    <span className="text-sm font-medium text-muted-foreground capitalize">
                      {outcome.status}
                    </span>
                    <span className="text-sm text-muted-foreground">• {outcome.date}</span>
                  </div>
                  <h3 className="text-foreground font-medium">{outcome.action}</h3>
                </div>
                {outcome.status === "implemented" && (
                  <div className="text-right">
                    <p className={`text-xl font-semibold ${outcome.impactType === "revenue" ? "text-success" : "text-primary"}`}>
                      {outcome.impactValue}
                    </p>
                    {outcome.impactPercent && (
                      <p className="text-sm text-muted-foreground">{outcome.impactPercent}</p>
                    )}
                  </div>
                )}
              </div>

              {/* Before/After */}
              <div className="grid grid-cols-2 gap-4 p-4 bg-secondary/50 rounded-xl">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Before</p>
                  <p className="font-medium text-foreground">{outcome.before}</p>
                  <p className="text-sm text-muted-foreground">{outcome.beforeMetric}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">After</p>
                  <p className="font-medium text-foreground">{outcome.after}</p>
                  <p className="text-sm text-muted-foreground">{outcome.afterMetric}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
