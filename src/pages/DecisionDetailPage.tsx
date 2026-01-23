import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Sparkles,
  TrendingUp,
  TrendingDown,
  CheckCircle,
  Clock,
  BarChart3,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

const decisionData = {
  id: 1,
  title: "Lower price on Wireless Earbuds Pro",
  product: "Wireless Earbuds Pro",
  sku: "SKU-2847",
  category: "Electronics",
  currentPrice: "₹79.99",
  recommendedPrice: "₹69.99",
  priceChange: "-12.5%",
  status: "pending" as const,
  confidence: 87,
  createdAt: "2 hours ago",
  reasoning: {
    what: "Reduce price from ₹79.99 to ₹69.99 (12.5% decrease)",
    why: "Your main competitor (TechStore Pro) dropped their price to ₹67.99 yesterday. At current pricing, you're 15% above market average, which correlates with a 23% decrease in conversion rate over the past 3 days.",
    impact: "Based on historical data and current demand patterns, this adjustment is projected to recover approximately ₹2,400/week in sales that are currently going to competitors.",
  },
  chartData: [
    { date: "Jan 15", you: 79.99, competitor: 79.99 },
    { date: "Jan 16", you: 79.99, competitor: 75.99 },
    { date: "Jan 17", you: 79.99, competitor: 72.99 },
    { date: "Jan 18", you: 79.99, competitor: 69.99 },
    { date: "Jan 19", you: 79.99, competitor: 67.99 },
  ],
};

export default function DecisionDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams();

  return (
    <AppLayout>
      <div className="min-h-screen p-6 md:p-10 max-w-4xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate("/command-center")}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Command Center
        </button>

        {/* Header Card */}
        <div className="premium-card rounded-2xl p-6 mb-6 animate-fade-in">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-foreground mb-1">
                  {decisionData.title}
                </h1>
                <p className="text-muted-foreground">
                  {decisionData.sku} • {decisionData.category}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="w-4 h-4" />
              {decisionData.createdAt}
            </div>
          </div>

          {/* Price Change Visual */}
          <div className="flex items-center gap-6 p-5 bg-secondary/50 rounded-xl mb-6">
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-1">Current</p>
              <p className="text-2xl font-semibold text-foreground">{decisionData.currentPrice}</p>
            </div>
            <div className="flex items-center gap-2">
              <TrendingDown className="w-5 h-5 text-success" />
              <span className="text-success font-medium">{decisionData.priceChange}</span>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-1">Recommended</p>
              <p className="text-2xl font-semibold text-primary">{decisionData.recommendedPrice}</p>
            </div>
            <div className="ml-auto flex items-center gap-2 px-3 py-1.5 bg-success/10 text-success rounded-full text-sm font-medium">
              <div className="w-2 h-2 rounded-full bg-success" />
              {decisionData.confidence}% confidence
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            <Button className="rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 flex-1">
              <CheckCircle className="w-4 h-4 mr-2" />
              Mark as Done
            </Button>
            <Button variant="outline" className="rounded-xl flex-1">
              <BarChart3 className="w-4 h-4 mr-2" />
              Track Impact
            </Button>
          </div>
        </div>

        {/* Reasoning Sections */}
        <div className="space-y-4 animate-fade-in" style={{ animationDelay: "0.1s" }}>
          {/* What */}
          <div className="premium-card rounded-2xl p-6">
            <h2 className="text-sm font-medium text-primary uppercase tracking-wide mb-3">
              What to do
            </h2>
            <p className="text-foreground leading-relaxed">{decisionData.reasoning.what}</p>
          </div>

          {/* Why */}
          <div className="premium-card rounded-2xl p-6">
            <h2 className="text-sm font-medium text-primary uppercase tracking-wide mb-3">
              Why this matters
            </h2>
            <p className="text-foreground leading-relaxed">{decisionData.reasoning.why}</p>
          </div>

          {/* Impact */}
          <div className="premium-card rounded-2xl p-6">
            <h2 className="text-sm font-medium text-primary uppercase tracking-wide mb-3">
              Expected Impact
            </h2>
            <div className="flex items-center gap-3">
              <TrendingUp className="w-6 h-6 text-success" />
              <p className="text-lg font-medium text-foreground">{decisionData.reasoning.impact}</p>
            </div>
          </div>
        </div>

        {/* Simple Chart Placeholder */}
        <div className="premium-card rounded-2xl p-6 mt-6 animate-fade-in" style={{ animationDelay: "0.2s" }}>
          <h2 className="text-sm font-medium text-primary uppercase tracking-wide mb-4">
            Price Comparison (Last 5 Days)
          </h2>
          <div className="h-48 flex items-end gap-2">
            {decisionData.chartData.map((point, i) => (
              <div key={point.date} className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full flex gap-1 items-end justify-center" style={{ height: "120px" }}>
                  <div
                    className="w-4 bg-primary/30 rounded-t"
                    style={{ height: `${((point.you - 60) / 25) * 100}%` }}
                  />
                  <div
                    className="w-4 bg-destructive/30 rounded-t"
                    style={{ height: `${((point.competitor - 60) / 25) * 100}%` }}
                  />
                </div>
                <span className="text-xs text-muted-foreground">{point.date.split(" ")[1]}</span>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-center gap-6 mt-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-primary/30" />
              <span className="text-muted-foreground">Your price</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-destructive/30" />
              <span className="text-muted-foreground">Competitor</span>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
