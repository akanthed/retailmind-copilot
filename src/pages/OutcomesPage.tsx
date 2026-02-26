import { AppLayout } from "@/components/layout/AppLayout";
import { Target, CheckCircle, Clock } from "lucide-react";
import { apiClient } from "@/api/client";
import { useState, useEffect } from "react";

export default function OutcomesPage() {
  const [outcomes, setOutcomes] = useState<any[]>([]);
  const [summary, setSummary] = useState({
    totalRevenueImpact: 0,
    actionsImplemented: 0,
    actionsPending: 0,
    risksPrevented: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOutcomes();
  }, []);

  const loadOutcomes = async () => {
    setLoading(true);
    const response = await apiClient.getOutcomes();
    if (response.data) {
      setOutcomes(response.data.outcomes || []);
      setSummary(response.data.summary || summary);
    }
    setLoading(false);
  };
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
              <span className="text-3xl font-semibold text-success">+₹{summary.totalRevenueImpact.toLocaleString()}</span>
              <span className="text-sm text-success">this month</span>
            </div>
          </div>
          <div className="premium-card rounded-2xl p-5">
            <p className="text-sm text-muted-foreground mb-1">Actions Implemented</p>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-semibold text-foreground">{summary.actionsImplemented}</span>
              <span className="text-sm text-muted-foreground">of {summary.actionsImplemented + summary.actionsPending} recommendations</span>
            </div>
          </div>
          <div className="premium-card rounded-2xl p-5">
            <p className="text-sm text-muted-foreground mb-1">Risks Prevented</p>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-semibold text-foreground">{summary.risksPrevented}</span>
              <span className="text-sm text-muted-foreground">stockouts avoided</span>
            </div>
          </div>
        </div>

        {/* Outcomes List */}
        <div className="space-y-4 animate-fade-in" style={{ animationDelay: "0.15s" }}>
          <h2 className="text-lg font-medium text-foreground">Decision History</h2>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Loading outcomes...</div>
          ) : outcomes.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No outcomes yet. Implement recommendations to track their impact.
            </div>
          ) : (
            outcomes.map((outcome, index) => (
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
            ))
          )}
        </div>
      </div>
    </AppLayout>
  );
}
