import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { apiClient, Recommendation } from "@/api/client";
import { LoadingPage } from "@/components/ui/LoadingSpinner";
import { useToast } from "@/hooks/use-toast";
import {
  ArrowLeft,
  Sparkles,
  TrendingUp,
  TrendingDown,
  CheckCircle,
  Clock,
  Loader2,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";

export default function DecisionDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [recommendation, setRecommendation] = useState<Recommendation | null>(null);
  const [loading, setLoading] = useState(true);
  const [implementing, setImplementing] = useState(false);

  useEffect(() => {
    async function loadRecommendation() {
      if (!id) {
        setLoading(false);
        return;
      }

      try {
        const result = await apiClient.getRecommendation(id);
        if (result.data) {
          setRecommendation(result.data);
        }
      } finally {
        setLoading(false);
      }
    }

    loadRecommendation();
  }, [id]);

  async function handleMarkAsDone() {
    if (!id || implementing) return;
    
    setImplementing(true);
    try {
      const result = await apiClient.implementRecommendation(id);
      if (result.data) {
        setRecommendation(result.data);
        toast({
          title: "Marked as Done",
          description: "Recommendation has been implemented",
        });
        // Navigate back to actions page after a short delay
        setTimeout(() => navigate("/actions"), 1500);
      } else if (result.error) {
        toast({
          title: "Failed to update",
          description: result.error,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to mark as done",
        variant: "destructive",
      });
    } finally {
      setImplementing(false);
    }
  }

  const { toast } = useToast();

  const currentPrice = recommendation?.currentPrice || 0;
  const suggestedPrice = recommendation?.suggestedPrice || currentPrice;
  const percentageChange = currentPrice
    ? (((suggestedPrice - currentPrice) / currentPrice) * 100).toFixed(1)
    : "0.0";

  const createdAtLabel = recommendation?.createdAt
    ? new Date(recommendation.createdAt).toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "Just now";

  if (loading) {
    return (
      <AppLayout>
        <LoadingPage message="Loading recommendation..." />
      </AppLayout>
    );
  }

  if (!recommendation) {
    return (
      <AppLayout>
        <div className="min-h-screen p-6 md:p-10 max-w-4xl mx-auto flex items-center justify-center">
          <div className="text-center">
            <p className="text-muted-foreground mb-4">Recommendation not found</p>
            <Button onClick={() => navigate("/decisions")}>Back to Decisions</Button>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="min-h-screen p-6 md:p-10 max-w-4xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate("/actions")}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to To-Do List
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
                  {recommendation.title}
                </h1>
                <p className="text-muted-foreground">
                  {recommendation.product}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="w-4 h-4" />
              {createdAtLabel}
            </div>
          </div>

          {/* Price Change Visual */}
          <div className="flex items-center gap-6 p-5 bg-secondary/50 rounded-xl mb-6">
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-1">Current</p>
              <p className="text-2xl font-semibold text-foreground">₹{currentPrice.toLocaleString("en-IN")}</p>
            </div>
            <div className="flex items-center gap-2">
              {Number(percentageChange) > 0 ? (
                <TrendingUp className="w-5 h-5 text-destructive" />
              ) : (
                <TrendingDown className="w-5 h-5 text-success" />
              )}
              <span className={Number(percentageChange) > 0 ? "text-destructive font-medium" : "text-success font-medium"}>
                {Number(percentageChange) > 0 ? "+" : ""}
                {percentageChange}%
              </span>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-1">Recommended</p>
              <p className="text-2xl font-semibold text-primary">₹{suggestedPrice.toLocaleString("en-IN")}</p>
            </div>
            <div className="ml-auto flex items-center gap-2 px-3 py-1.5 bg-success/10 text-success rounded-full text-sm font-medium">
              <div className="w-2 h-2 rounded-full bg-success" />
              {recommendation.confidence}% confidence
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            <Button 
              className="rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 flex-1"
              onClick={handleMarkAsDone}
              disabled={implementing || recommendation.status === 'implemented'}
            >
              {implementing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : recommendation.status === 'implemented' ? (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Completed
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Mark as Done
                </>
              )}
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
            <p className="text-foreground leading-relaxed">{recommendation.suggestedAction || recommendation.title}</p>
          </div>

          {/* Why */}
          <div className="premium-card rounded-2xl p-6">
            <h2 className="text-sm font-medium text-primary uppercase tracking-wide mb-3">
              Why this matters
            </h2>
            <p className="text-foreground leading-relaxed">{recommendation.reason}</p>
          </div>

          {/* Impact */}
          <div className="premium-card rounded-2xl p-6">
            <h2 className="text-sm font-medium text-primary uppercase tracking-wide mb-3">
              Expected Impact
            </h2>
            <div className="flex items-center gap-3">
              <TrendingUp className="w-6 h-6 text-success" />
              <p className="text-lg font-medium text-foreground">{recommendation.impact}</p>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
