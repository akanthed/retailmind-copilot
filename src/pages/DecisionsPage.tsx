import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { AIRecommendationCard } from "@/components/ui/Cards";
import { FileText, CheckCircle, Clock, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { apiClient, Recommendation } from "@/api/client";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/i18n/LanguageContext";

export default function DecisionsPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useLanguage();
  const [filter, setFilter] = useState<"all" | "pending" | "implemented">("all");
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    loadRecommendations();
  }, []);

  async function loadRecommendations() {
    setLoading(true);
    try {
      const result = await apiClient.getRecommendations();
      
      if (result.error) {
        toast({
          title: t('errors.error'),
          description: result.error,
          variant: "destructive"
        });
      } else if (result.data) {
        setRecommendations(result.data.recommendations);
      }
    } catch (error) {
      toast({
        title: t('errors.error'),
        description: t('decisions.failedToLoad'),
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleGenerateRecommendations() {
    setGenerating(true);
    try {
      const result = await apiClient.generateRecommendations();
      
      if (result.error) {
        toast({
          title: t('errors.error'),
          description: result.error,
          variant: "destructive"
        });
      } else {
        toast({
          title: t('common.success'),
          description: t('decisions.generatedCount').replace('{count}', String(result.data?.generated || 0)),
        });
        await loadRecommendations();
      }
    } catch (error) {
      toast({
        title: t('errors.error'),
        description: t('decisions.failedToGenerate'),
        variant: "destructive"
      });
    } finally {
      setGenerating(false);
    }
  }

  const filteredRecommendations = recommendations.filter((d) => {
    if (filter === "all") return true;
    return d.status === filter;
  });

  // Group by date (simplified - just show "Today" for recent ones)
  const groupedRecommendations = filteredRecommendations.map(rec => ({
    ...rec,
    date: new Date(rec.createdAt).toDateString() === new Date().toDateString() ? t('decisions.today') : t('decisions.earlier')
  }));

  if (loading) {
    return (
      <AppLayout>
        <div className="min-h-screen p-6 md:p-10 max-w-4xl mx-auto flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">{t('decisions.loadingDecisions')}</p>
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
                <FileText className="w-5 h-5 text-primary" />
              </div>
              <h1 className="text-2xl font-semibold text-foreground">{t('decisions.title')}</h1>
            </div>
            <p className="text-muted-foreground">
              {t('decisions.subtitle')}
            </p>
          </div>
          <Button
            onClick={handleGenerateRecommendations}
            disabled={generating}
            className="gap-2"
          >
            {generating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                {t('decisions.generating')}
              </>
            ) : (
              t('decisions.generateRecommendations')
            )}
          </Button>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6 animate-fade-in" style={{ animationDelay: "0.1s" }}>
          <Button
            variant={filter === "all" ? "default" : "outline"}
            size="sm"
            className="rounded-lg"
            onClick={() => setFilter("all")}
          >
            {t('decisions.all')} ({recommendations.length})
          </Button>
          <Button
            variant={filter === "pending" ? "default" : "outline"}
            size="sm"
            className="rounded-lg"
            onClick={() => setFilter("pending")}
          >
            <Clock className="w-4 h-4 mr-1.5" />
            {t('decisions.pending')} ({recommendations.filter((d) => d.status === "pending").length})
          </Button>
          <Button
            variant={filter === "implemented" ? "default" : "outline"}
            size="sm"
            className="rounded-lg"
            onClick={() => setFilter("implemented")}
          >
            <CheckCircle className="w-4 h-4 mr-1.5" />
            {t('decisions.done')} ({recommendations.filter((d) => d.status === "implemented").length})
          </Button>
        </div>

        {/* Decisions List */}
        <div className="space-y-4 animate-fade-in" style={{ animationDelay: "0.15s" }}>
          {groupedRecommendations.map((decision, index) => (
            <div key={decision.id}>
              {index === 0 || groupedRecommendations[index - 1]?.date !== decision.date ? (
                <p className="text-sm text-muted-foreground mb-3 mt-6 first:mt-0">
                  {decision.date}
                </p>
              ) : null}
              <AIRecommendationCard
                id={decision.id}
                title={decision.title}
                product={decision.product}
                reason={decision.reason}
                impact={decision.impact}
                confidence={decision.confidence}
                status={decision.status}
                onClick={() => navigate(`/decisions/${decision.id}`)}
              />
            </div>
          ))}
        </div>

        {filteredRecommendations.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">{t('decisions.noMatches')}</p>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
