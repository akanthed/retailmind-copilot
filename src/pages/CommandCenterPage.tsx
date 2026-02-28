import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { AIRecommendationCard } from "@/components/ui/Cards";
import { Button } from "@/components/ui/button";
import { Sparkles, Send, Lightbulb, Loader2, RefreshCw } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { apiClient, Recommendation } from "@/api/client";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/i18n/LanguageContext";

export default function CommandCenterPage() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loadingRecommendations, setLoadingRecommendations] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useLanguage();

  const suggestedPrompts = [
    t('commandCenter.prompt1'),
    t('commandCenter.prompt2'),
    t('commandCenter.prompt3'),
    t('commandCenter.prompt4'),
  ];

  useEffect(() => {
    loadRecommendations();
  }, []);

  async function loadRecommendations() {
    setLoadingRecommendations(true);
    try {
      const result = await apiClient.getRecommendations();
      
      if (result.error) {
        console.error("Error loading recommendations:", result.error);
      } else if (result.data) {
        const pending = result.data.recommendations
          .filter(r => r.status === 'pending')
          .slice(0, 3);
        setRecommendations(pending);
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoadingRecommendations(false);
    }
  }

  async function handleGenerateRecommendations() {
    setLoadingRecommendations(true);
    try {
      const result = await apiClient.generateRecommendations();
      
      if (result.error) {
        toast({
          title: t('commandCenter.errorTitle'),
          description: result.error,
          variant: "destructive"
        });
      } else if (result.data) {
        toast({
          title: t('commandCenter.recommendationsGenerated'),
          description: t('commandCenter.generatedCount').replace('{count}', String(result.data.recommendationsGenerated)),
        });
        await loadRecommendations();
      }
    } catch (error) {
      toast({
        title: t('commandCenter.errorTitle'),
        description: "Failed to generate recommendations",
        variant: "destructive"
      });
    } finally {
      setLoadingRecommendations(false);
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!query.trim()) {
      toast({
        title: t('commandCenter.emptyQuery'),
        description: t('commandCenter.pleaseEnterQuestion'),
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
          title: t('commandCenter.errorTitle'),
          description: result.error,
          variant: "destructive"
        });
      } else if (result.data) {
        setAiResponse(result.data.response);
        toast({
          title: t('commandCenter.aiResponseReady'),
          description: `${t('commandCenter.poweredBy')} ${result.data.model}`,
        });
      }
    } catch (error) {
      toast({
        title: t('commandCenter.errorTitle'),
        description: "Failed to get AI response",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
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
            <h1 className="text-2xl font-semibold text-foreground">{t('commandCenter.title')}</h1>
          </div>
          <p className="text-muted-foreground">
            {t('commandCenter.subtitle')}
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
                placeholder={t('commandCenter.inputPlaceholder')}
                className="flex-1 px-4 py-4 bg-transparent text-foreground placeholder:text-muted-foreground focus:outline-none text-lg"
                disabled={loading}
              />
              <Button
                type="submit"
                size="lg"
                className="rounded-xl px-6 bg-primary text-primary-foreground hover:bg-primary/90"
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
            <div className="flex items-start gap-3 mb-3">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-4 h-4 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-foreground mb-2">{t('commandCenter.aiResponse')}</h3>
                <div className="text-muted-foreground whitespace-pre-wrap">{aiResponse}</div>
              </div>
            </div>
          </div>
        )}

        {/* Suggested Prompts */}
        <div className="mb-10 animate-fade-in" style={{ animationDelay: "0.15s" }}>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
            <Lightbulb className="w-4 h-4" />
            <span>{t('commandCenter.tryAsking')}</span>
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
            <h2 className="text-lg font-medium text-foreground">{t('commandCenter.todaysRecommendations')}</h2>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                {recommendations.length} {t('commandCenter.pendingActions')}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleGenerateRecommendations}
                disabled={loadingRecommendations}
                className="rounded-lg"
              >
                {loadingRecommendations ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>
          
          {loadingRecommendations ? (
            <div className="premium-card rounded-2xl p-8 text-center">
              <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-2" />
              <p className="text-muted-foreground">{t('commandCenter.loadingRecommendations')}</p>
            </div>
          ) : recommendations.length === 0 ? (
            <div className="premium-card rounded-2xl p-8 text-center">
              <p className="text-muted-foreground mb-4">{t('commandCenter.noRecommendationsYet')}</p>
              <Button onClick={handleGenerateRecommendations} className="rounded-xl">
                <Sparkles className="w-4 h-4 mr-2" />
                {t('commandCenter.generateRecommendations')}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {recommendations.map((rec, index) => (
                <div key={rec.id} className="animate-slide-in-right" style={{ animationDelay: `${0.1 * index}s` }}>
                  <AIRecommendationCard
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
      </div>
    </AppLayout>
  );
}
