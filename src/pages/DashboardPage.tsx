import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { AIRecommendationCard, AlertCard } from "@/components/ui/Cards";
import { Button } from "@/components/ui/button";
import { Sparkles, Send, Lightbulb, Loader2, Package, TrendingUp, Bell, IndianRupee } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { apiClient, Recommendation, Alert } from "@/api/client";
import { useToast } from "@/hooks/use-toast";

const suggestedPrompts = [
  "Why are my sales down?",
  "Should I change my prices?",
  "What needs attention today?",
  "Which products sell best?",
];

export default function DashboardPage() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    loadDashboardData();
  }, []);

  async function loadDashboardData() {
    setLoadingData(true);
    try {
      // Load products
      const productsResult = await apiClient.getProducts();
      const productsList = productsResult.data?.products || [];
      setProducts(productsList);

      // Auto-generate recommendations if none exist
      const recsResult = await apiClient.getRecommendations();
      const recsList = recsResult.data?.recommendations || [];
      
      if (productsList.length > 0 && recsList.length === 0) {
        // Silent background generation
        apiClient.generateRecommendations().then(() => {
          loadRecommendations();
        });
      } else {
        setRecommendations(recsList.filter(r => r.status === 'pending').slice(0, 3));
      }

      // Load alerts
      const alertsResult = await apiClient.getAlerts();
      setAlerts((alertsResult.data?.alerts || []).slice(0, 3));
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoadingData(false);
    }
  }

  async function loadRecommendations() {
    const result = await apiClient.getRecommendations();
    if (result.data) {
      setRecommendations(result.data.recommendations.filter(r => r.status === 'pending').slice(0, 3));
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!query.trim()) {
      toast({
        title: "Please enter a question",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    setAiResponse(null);

    try {
      const result = await apiClient.queryCopilot(query);
      
      if (result.error) {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive"
        });
      } else if (result.data) {
        setAiResponse(result.data.response);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to get AI response",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const totalInventoryValue = products.reduce((sum, p) => sum + (p.currentPrice * p.stock), 0);
  const lowStockCount = products.filter(p => p.stock < 10).length;

  if (loadingData) {
    return (
      <AppLayout>
        <div className="min-h-screen p-6 md:p-10 max-w-5xl mx-auto flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Loading your dashboard...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="min-h-screen p-6 md:p-10 max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <h1 className="text-2xl font-semibold text-foreground mb-1">
            Welcome back! 👋
          </h1>
          <p className="text-muted-foreground">
            Here's what's happening with your products today
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 animate-fade-in" style={{ animationDelay: "0.05s" }}>
          <div className="premium-card rounded-2xl p-4">
            <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
              <Package className="w-4 h-4" />
              Products
            </div>
            <p className="text-2xl font-bold">{products.length}</p>
          </div>
          <div className="premium-card rounded-2xl p-4">
            <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
              <IndianRupee className="w-4 h-4" />
              Inventory
            </div>
            <p className="text-2xl font-bold">₹{(totalInventoryValue / 1000).toFixed(0)}K</p>
          </div>
          <div className="premium-card rounded-2xl p-4">
            <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
              <TrendingUp className="w-4 h-4" />
              Actions
            </div>
            <p className="text-2xl font-bold">{recommendations.length}</p>
          </div>
          <div className="premium-card rounded-2xl p-4">
            <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
              <Bell className="w-4 h-4" />
              Alerts
            </div>
            <p className="text-2xl font-bold text-warning">{lowStockCount}</p>
          </div>
        </div>

        {/* AI Assistant */}
        <form onSubmit={handleSubmit} className="mb-8 animate-fade-in" style={{ animationDelay: "0.1s" }}>
          <div className="premium-card rounded-2xl p-2 ai-glow">
            <div className="flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-primary ml-3 flex-shrink-0" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Ask me anything: What should I do today?"
                className="flex-1 px-2 py-4 bg-transparent text-foreground placeholder:text-muted-foreground focus:outline-none text-base"
                disabled={loading}
              />
              <Button
                type="submit"
                size="lg"
                className="rounded-xl px-6"
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </Button>
            </div>
          </div>
        </form>

        {/* AI Response */}
        {aiResponse && (
          <div className="mb-8 animate-fade-in premium-card rounded-2xl p-6">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-4 h-4 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-foreground mb-2">AI Response</h3>
                <div className="text-muted-foreground whitespace-pre-wrap leading-relaxed">{aiResponse}</div>
              </div>
            </div>
          </div>
        )}

        {/* Suggested Prompts */}
        {!aiResponse && (
          <div className="mb-8 animate-fade-in" style={{ animationDelay: "0.15s" }}>
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
        )}

        {/* Today's Actions */}
        <div className="mb-8 animate-fade-in" style={{ animationDelay: "0.2s" }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-foreground">Today's Actions</h2>
            {recommendations.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/actions")}
                className="text-primary"
              >
                View All
              </Button>
            )}
          </div>
          
          {recommendations.length === 0 ? (
            <div className="premium-card rounded-2xl p-8 text-center">
              <Sparkles className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-muted-foreground mb-2">No actions needed right now</p>
              <p className="text-sm text-muted-foreground">
                AI is monitoring your products. Check back soon!
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {recommendations.map((rec, index) => (
                <div key={rec.id} className="animate-slide-in-right" style={{ animationDelay: `${0.1 * index}s` }}>
                  <AIRecommendationCard
                    id={rec.id}
                    title={rec.title}
                    product={rec.product}
                    reason={rec.reason}
                    impact={rec.impact}
                    confidence={rec.confidence}
                    status={rec.status}
                    onClick={() => navigate(`/decisions/${rec.id}`)}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Alerts */}
        {alerts.length > 0 && (
          <div className="animate-fade-in" style={{ animationDelay: "0.25s" }}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium text-foreground">Recent Alerts</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/alerts")}
                className="text-primary"
              >
                View All
              </Button>
            </div>
            <div className="space-y-3">
              {alerts.map((alert, index) => (
                <div key={alert.id} className="animate-slide-in-right" style={{ animationDelay: `${0.05 * index}s` }}>
                  <AlertCard
                    type={alert.type}
                    title={alert.title}
                    description={alert.description}
                    timestamp="Just now"
                    suggestion={alert.suggestion}
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
