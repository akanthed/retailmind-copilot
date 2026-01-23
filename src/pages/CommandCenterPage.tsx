import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { AIRecommendationCard } from "@/components/ui/Cards";
import { Button } from "@/components/ui/button";
import { Sparkles, Send, Lightbulb } from "lucide-react";
import { useNavigate } from "react-router-dom";

const suggestedPrompts = [
  "Why are my sales down?",
  "Should I discount this product?",
  "What's my biggest risk right now?",
  "Which products need repricing?",
];

const recommendations = [
  {
    id: 1,
    title: "Lower price on Wireless Earbuds Pro",
    product: "SKU-2847 • Electronics",
    reason: "Competitor dropped price by 12% yesterday. You're now 15% above market average. Matching could recover ~₹2,400/week in lost sales.",
    impact: "+₹2,400/week estimated",
    confidence: 87,
    status: "pending" as const,
  },
  {
    id: 2,
    title: "Increase stock for Smart Watch Series X",
    product: "SKU-1923 • Electronics",
    reason: "Demand forecast shows 40% surge expected next week. Current stock covers only 3 days at projected rate.",
    impact: "Prevent ₹8,200 stockout loss",
    confidence: 92,
    status: "pending" as const,
  },
  {
    id: 3,
    title: "Bundle offer on Fitness Tracker",
    product: "SKU-3421 • Wearables",
    reason: "Slow-moving inventory with 45 days of stock. Bundling with accessories could improve turnover by 60%.",
    impact: "Clear ₹3,100 slow inventory",
    confidence: 75,
    status: "implemented" as const,
  },
];

export default function CommandCenterPage() {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle query submission
    console.log("Query:", query);
  };

  return (
    <AppLayout>
      <div className="min-h-screen p-6 md:p-10 max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-10 animate-fade-in">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-primary" />
            </div>
            <h1 className="text-2xl font-semibold text-foreground">RetailMind Command Center</h1>
          </div>
          <p className="text-muted-foreground">
            Ask anything about your products, pricing, or market conditions.
          </p>
        </div>

        {/* AI Input */}
        <form onSubmit={handleSubmit} className="mb-8 animate-fade-in" style={{ animationDelay: "0.1s" }}>
          <div className="premium-card rounded-2xl p-2 ai-glow">
            <div className="flex items-center gap-3">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Ask RetailMind: What should I do about Product X today?"
                className="flex-1 px-4 py-4 bg-transparent text-foreground placeholder:text-muted-foreground focus:outline-none text-lg"
              />
              <Button
                type="submit"
                size="lg"
                className="rounded-xl px-6 bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <Send className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </form>

        {/* Suggested Prompts */}
        <div className="mb-10 animate-fade-in" style={{ animationDelay: "0.15s" }}>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
            <Lightbulb className="w-4 h-4" />
            <span>Try asking:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {suggestedPrompts.map((prompt) => (
              <button
                key={prompt}
                onClick={() => setQuery(prompt)}
                className="px-4 py-2 rounded-xl bg-secondary text-secondary-foreground text-sm hover:bg-secondary/80 transition-colors"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>

        {/* Recommendations */}
        <div className="animate-fade-in" style={{ animationDelay: "0.2s" }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-foreground">Today's Recommendations</h2>
            <span className="text-sm text-muted-foreground">
              {recommendations.filter(r => r.status === "pending").length} pending actions
            </span>
          </div>
          <div className="space-y-4">
            {recommendations.map((rec, index) => (
              <div key={rec.id} className="animate-slide-in-right" style={{ animationDelay: `${0.1 * index}s` }}>
                <AIRecommendationCard
                  {...rec}
                  onClick={() => navigate(`/decisions/${rec.id}`)}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
