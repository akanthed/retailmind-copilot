import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { AIRecommendationCard } from "@/components/ui/Cards";
import { CheckSquare, Clock, CheckCircle, Loader2, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { apiClient, Recommendation } from "@/api/client";
import { useToast } from "@/hooks/use-toast";
import { errorMessages, getUserFriendlyError } from "@/lib/errorMessages";

export default function ActionsPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [filter, setFilter] = useState<"all" | "pending" | "implemented">("pending");
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRecommendations();
  }, []);

  async function loadRecommendations() {
    setLoading(true);
    try {
      const result = await apiClient.getRecommendations();
      
      if (result.error) {
        toast({
          title: errorMessages.recommendationsFailed.title,
          description: errorMessages.recommendationsFailed.description,
          variant: "destructive"
        });
      } else if (result.data) {
        setRecommendations(result.data.recommendations);
      }
    } catch (error) {
      const friendlyError = getUserFriendlyError(error);
      toast({
        title: friendlyError.title,
        description: friendlyError.description,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }

  const filteredRecommendations = recommendations.filter((d) => {
    if (filter === "all") return true;
    return d.status === filter;
  });

  const pendingCount = recommendations.filter(r => r.status === "pending").length;
  const doneCount = recommendations.filter(r => r.status === "implemented").length;

  if (loading) {
    return (
      <AppLayout>
        <div className="min-h-screen p-6 md:p-10 max-w-4xl mx-auto flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Loading your to-do list...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="min-h-screen p-6 md:p-10 max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-start justify-between mb-8 animate-fade-in">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <CheckSquare className="w-5 h-5 text-primary" />
              </div>
              <h1 className="text-2xl font-semibold text-foreground">To-Do List</h1>
            </div>
            <p className="text-muted-foreground">
              AI recommendations and their results
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6 animate-fade-in" style={{ animationDelay: "0.05s" }}>
          <div className="premium-card rounded-2xl p-4 text-center">
            <p className="text-2xl font-semibold text-foreground">{recommendations.length}</p>
            <p className="text-sm text-muted-foreground">Total</p>
          </div>
          <div className="premium-card rounded-2xl p-4 text-center">
            <p className="text-2xl font-semibold text-warning">{pendingCount}</p>
            <p className="text-sm text-muted-foreground">To Do</p>
          </div>
          <div className="premium-card rounded-2xl p-4 text-center">
            <p className="text-2xl font-semibold text-success">{doneCount}</p>
            <p className="text-sm text-muted-foreground">Done</p>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6 animate-fade-in" style={{ animationDelay: "0.1s" }}>
          <Button
            variant={filter === "pending" ? "default" : "outline"}
            size="sm"
            className="rounded-lg"
            onClick={() => setFilter("pending")}
          >
            <Clock className="w-4 h-4 mr-1.5" />
            To Do ({pendingCount})
          </Button>
          <Button
            variant={filter === "implemented" ? "default" : "outline"}
            size="sm"
            className="rounded-lg"
            onClick={() => setFilter("implemented")}
          >
            <CheckCircle className="w-4 h-4 mr-1.5" />
            Done ({doneCount})
          </Button>
          <Button
            variant={filter === "all" ? "default" : "outline"}
            size="sm"
            className="rounded-lg"
            onClick={() => setFilter("all")}
          >
            All ({recommendations.length})
          </Button>
        </div>

        {/* Actions List */}
        <div className="space-y-4 animate-fade-in" style={{ animationDelay: "0.15s" }}>
          {filteredRecommendations.length === 0 ? (
            <div className="premium-card rounded-2xl p-12 text-center">
              <CheckCircle className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">
                {filter === "pending" ? "All caught up!" : "No actions yet"}
              </h3>
              <p className="text-muted-foreground">
                {filter === "pending" 
                  ? "Great job! Check back tomorrow for new recommendations."
                  : "Actions will appear here as AI analyzes your products."}
              </p>
            </div>
          ) : (
            filteredRecommendations.map((action, index) => (
              <div key={action.id} className="animate-slide-in-right" style={{ animationDelay: `${0.05 * index}s` }}>
                <AIRecommendationCard
                  title={action.title}
                  product={action.product}
                  reason={action.reason}
                  impact={action.impact}
                  confidence={action.confidence}
                  status={action.status}
                  onClick={() => navigate(`/decisions/${action.id}`)}
                />
              </div>
            ))
          )}
        </div>

        {/* Results Summary (if has completed actions) */}
        {doneCount > 0 && filter !== "pending" && (
          <div className="mt-8 premium-card rounded-2xl p-6 border-l-4 border-l-success animate-fade-in">
            <div className="flex items-start gap-3">
              <TrendingUp className="w-5 h-5 text-success mt-0.5" />
              <div>
                <h3 className="font-medium text-foreground mb-1">Your Impact</h3>
                <p className="text-sm text-muted-foreground">
                  You've completed {doneCount} action{doneCount > 1 ? 's' : ''}. Keep it up!
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
