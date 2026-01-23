import { AppLayout } from "@/components/layout/AppLayout";
import { AIRecommendationCard } from "@/components/ui/Cards";
import { FileText, Filter, CheckCircle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

const decisions = [
  {
    id: 1,
    title: "Lower price on Wireless Earbuds Pro",
    product: "SKU-2847 • Electronics",
    reason: "Competitor dropped price by 12% yesterday. You're now 15% above market average.",
    impact: "+₹2,400/week estimated",
    confidence: 87,
    status: "pending" as const,
    date: "Today",
  },
  {
    id: 2,
    title: "Increase stock for Smart Watch Series X",
    product: "SKU-1923 • Electronics",
    reason: "Demand forecast shows 40% surge expected next week. Current stock covers only 3 days.",
    impact: "Prevent ₹8,200 stockout loss",
    confidence: 92,
    status: "pending" as const,
    date: "Today",
  },
  {
    id: 3,
    title: "Bundle offer on Fitness Tracker",
    product: "SKU-3421 • Wearables",
    reason: "Slow-moving inventory with 45 days of stock. Bundling with accessories could improve turnover.",
    impact: "Clear ₹3,100 slow inventory",
    confidence: 75,
    status: "implemented" as const,
    date: "Yesterday",
  },
  {
    id: 4,
    title: "Price increase on Portable Charger",
    product: "SKU-5612 • Accessories",
    reason: "All competitors out of stock. Strong demand spike detected.",
    impact: "+₹890/week",
    confidence: 81,
    status: "implemented" as const,
    date: "3 days ago",
  },
  {
    id: 5,
    title: "Promotional pricing on Bluetooth Speaker",
    product: "SKU-7834 • Audio",
    reason: "Seasonal demand pattern indicates optimal discount timing.",
    impact: "+₹1,200/week",
    confidence: 68,
    status: "dismissed" as const,
    date: "5 days ago",
  },
];

export default function DecisionsPage() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<"all" | "pending" | "implemented">("all");

  const filteredDecisions = decisions.filter((d) => {
    if (filter === "all") return true;
    return d.status === filter;
  });

  return (
    <AppLayout>
      <div className="min-h-screen p-6 md:p-10 max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-start justify-between mb-8 animate-fade-in">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <FileText className="w-5 h-5 text-primary" />
              </div>
              <h1 className="text-2xl font-semibold text-foreground">Decisions</h1>
            </div>
            <p className="text-muted-foreground">
              Review and manage AI recommendations.
            </p>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6 animate-fade-in" style={{ animationDelay: "0.1s" }}>
          <Button
            variant={filter === "all" ? "default" : "outline"}
            size="sm"
            className="rounded-lg"
            onClick={() => setFilter("all")}
          >
            All ({decisions.length})
          </Button>
          <Button
            variant={filter === "pending" ? "default" : "outline"}
            size="sm"
            className="rounded-lg"
            onClick={() => setFilter("pending")}
          >
            <Clock className="w-4 h-4 mr-1.5" />
            Pending ({decisions.filter((d) => d.status === "pending").length})
          </Button>
          <Button
            variant={filter === "implemented" ? "default" : "outline"}
            size="sm"
            className="rounded-lg"
            onClick={() => setFilter("implemented")}
          >
            <CheckCircle className="w-4 h-4 mr-1.5" />
            Done ({decisions.filter((d) => d.status === "implemented").length})
          </Button>
        </div>

        {/* Decisions List */}
        <div className="space-y-4 animate-fade-in" style={{ animationDelay: "0.15s" }}>
          {filteredDecisions.map((decision, index) => (
            <div key={decision.id}>
              {index === 0 || decisions[index - 1]?.date !== decision.date ? (
                <p className="text-sm text-muted-foreground mb-3 mt-6 first:mt-0">
                  {decision.date}
                </p>
              ) : null}
              <AIRecommendationCard
                {...decision}
                onClick={() => navigate(`/decisions/${decision.id}`)}
              />
            </div>
          ))}
        </div>

        {filteredDecisions.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No decisions match this filter.</p>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
