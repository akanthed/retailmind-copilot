import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { LoadingPage } from "@/components/ui/LoadingSpinner";
import { Calendar, TrendingUp, AlertTriangle, Sparkles, Download } from "lucide-react";
import { apiClient, DemandForecast } from "@/api/client";
import { useToast } from "@/hooks/use-toast";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { useLanguage } from "@/i18n/LanguageContext";

export default function ForecastPage() {
  const [forecasts, setForecasts] = useState<DemandForecast[]>([]);
  const [selectedForecast, setSelectedForecast] = useState<DemandForecast | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const { toast } = useToast();
  const { t } = useLanguage();

  useEffect(() => {
    loadForecasts();
  }, []);

  async function loadForecasts() {
    setLoading(true);
    try {
      const result = await apiClient.getForecasts();
      if (result.data) {
        setForecasts(result.data.forecasts);
        if (result.data.forecasts.length > 0 && !selectedForecast) {
          setSelectedForecast(result.data.forecasts[0]);
        }
      }
    } catch (error) {
      console.error('Error loading forecasts:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleGenerateForecasts() {
    setGenerating(true);
    try {
      const result = await apiClient.generateForecasts();
      if (result.data) {
        toast({
          title: t('forecast.generateBtn'),
          description: result.data.message,
        });
        await loadForecasts();
      } else {
        toast({
          title: t('common.error'),
          description: result.error || t('forecast.generateFailed'),
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: t('common.error'),
        description: t('forecast.generateFailed'),
        variant: "destructive",
      });
    } finally {
      setGenerating(false);
    }
  }

  function exportForecastCSV() {
    if (!selectedForecast) return;

    const csvData = selectedForecast.dailyForecasts.map(d => ({
      Date: d.date,
      'Day': d.dayOfWeek,
      'Predicted Demand': d.predictedDemand,
      'Confidence': (d.confidence * 100).toFixed(0) + '%',
      'Festival': d.festival || '-',
      'Festival Impact': d.festivalImpact > 1 ? `+${((d.festivalImpact - 1) * 100).toFixed(0)}%` : '-'
    }));

    const headers = Object.keys(csvData[0]);
    const csv = [
      headers.join(','),
      ...csvData.map(row => headers.map(h => row[h as keyof typeof row]).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `forecast-${selectedForecast.sku}-${Date.now()}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  if (loading) {
    return (
      <AppLayout>
        <LoadingPage message={t('loading.forecast')} />
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="min-h-screen p-6 md:p-10 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-start justify-between mb-8 animate-fade-in">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-primary" />
              </div>
              <h1 className="text-2xl font-semibold text-foreground">{t('forecast.title')}</h1>
            </div>
            <p className="text-muted-foreground">
              {t('forecast.subtitle')}
            </p>
          </div>
          <Button
            onClick={handleGenerateForecasts}
            disabled={generating}
            className="gap-2"
          >
            {generating ? (
              <>
                <Sparkles className="h-4 w-4 animate-spin" />
                {t('forecast.generating')}
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                {t('forecast.generateBtn')}
              </>
            )}
          </Button>
        </div>

        {forecasts.length === 0 ? (
          <div className="premium-card rounded-2xl p-12 text-center animate-fade-in">
            <Calendar className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">
              {t('forecast.noForecasts')}
            </h3>
            <p className="text-muted-foreground mb-4">
              {t('forecast.noForecastsDesc')}
            </p>
            <Button onClick={handleGenerateForecasts} disabled={generating}>
              <Sparkles className="h-4 w-4 mr-2" />
              {t('forecast.generateBtn')}
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Product List */}
            <div className="lg:col-span-1 space-y-2 animate-fade-in">
              <h3 className="font-semibold text-foreground mb-3 text-sm">{t('forecast.products')}</h3>
              {forecasts.map((forecast) => (
                <button
                  key={forecast.productId}
                  onClick={() => setSelectedForecast(forecast)}
                  className={`w-full text-left p-3 rounded-xl border transition-all duration-200 ${
                    selectedForecast?.productId === forecast.productId
                      ? 'premium-card border-primary/50 shadow-sm'
                      : 'bg-card border-border hover:border-primary/30'
                  }`}
                >
                  <div className="font-medium text-sm text-foreground">{forecast.productName}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{forecast.sku}</div>
                  <div className={`text-xs mt-2 font-medium ${
                    forecast.summary.stockoutRisk === 'critical' || forecast.summary.stockoutRisk === 'high' ? 'text-destructive' :
                    forecast.summary.stockoutRisk === 'medium' ? 'text-warning' :
                    'text-success'
                  }`}>
                    {forecast.summary.daysUntilStockout} {t('forecast.daysStock')}
                  </div>
                </button>
              ))}
            </div>

            {/* Forecast Details */}
            {selectedForecast && (
              <div className="lg:col-span-3 space-y-6 animate-fade-in" style={{ animationDelay: "0.1s" }}>
                {/* Summary Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="premium-card rounded-xl p-4">
                    <div className="text-xs text-muted-foreground mb-1">{t('forecast.avgDailyDemand')}</div>
                    <div className="text-2xl font-semibold text-foreground">
                      {selectedForecast.summary.avgDailyDemand}
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5">{t('forecast.unitsPerDay')}</div>
                  </div>
                  <div className="premium-card rounded-xl p-4">
                    <div className="text-xs text-muted-foreground mb-1">{t('forecast.total30Day')}</div>
                    <div className="text-2xl font-semibold text-foreground">
                      {selectedForecast.summary.totalPredictedDemand}
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5">{t('forecast.units')}</div>
                  </div>
                  <div className="premium-card rounded-xl p-4">
                    <div className="text-xs text-muted-foreground mb-1">{t('forecast.daysUntilStockout')}</div>
                    <div className={`text-2xl font-semibold ${
                      selectedForecast.summary.stockoutRisk === 'critical' || selectedForecast.summary.stockoutRisk === 'high' ? 'text-destructive' :
                      selectedForecast.summary.stockoutRisk === 'medium' ? 'text-warning' :
                      'text-success'
                    }`}>
                      {selectedForecast.summary.daysUntilStockout}
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5 capitalize">
                      {selectedForecast.summary.stockoutRisk} {t('forecast.risk')}
                    </div>
                  </div>
                  <div className="premium-card rounded-xl p-4">
                    <div className="text-xs text-muted-foreground mb-1">{t('forecast.confidence')}</div>
                    <div className="text-2xl font-semibold text-foreground">
                      {Math.round(selectedForecast.summary.confidence * 100)}%
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5">{t('forecast.accuracy')}</div>
                  </div>
                </div>

                {/* Demand Chart */}
                <div className="premium-card rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="font-semibold text-foreground">{t('forecast.chartTitle')}</h3>
                      <p className="text-xs text-muted-foreground mt-1">
                        {t('forecast.chartHelper')}
                      </p>
                    </div>
                    <Button variant="outline" size="sm" onClick={exportForecastCSV} className="gap-2">
                      <Download className="h-4 w-4" />
                      {t('forecast.exportCSV')}
                    </Button>
                  </div>
                  
                  <ResponsiveContainer width="100%" height={350}>
                    <LineChart data={selectedForecast.dailyForecasts} margin={{ top: 5, right: 30, left: 20, bottom: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis 
                        dataKey="date" 
                        tickFormatter={(date) => {
                          const d = new Date(date);
                          return `${d.getDate()}/${d.getMonth() + 1}`;
                        }}
                        stroke="hsl(var(--muted-foreground))"
                        style={{ fontSize: '11px' }}
                        label={{ value: t('forecast.date'), position: 'insideBottom', offset: -10, style: { fontSize: '12px', fill: 'hsl(var(--muted-foreground))' } }}
                      />
                      <YAxis 
                        stroke="hsl(var(--muted-foreground))"
                        style={{ fontSize: '11px' }}
                        label={{ value: t('forecast.unitsNeeded'), angle: -90, position: 'insideLeft', style: { fontSize: '12px', fill: 'hsl(var(--muted-foreground))' } }}
                      />
                      <Tooltip 
                        labelFormatter={(date) => {
                          const d = new Date(date);
                          return d.toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' });
                        }}
                        formatter={(value: any, name: string, props: any) => {
                          if (name === 'predictedDemand') {
                            const festival = props.payload.festival;
                            return [
                              `${value} units${festival ? ` (${festival})` : ''}`,
                              t('forecast.expectedDemand')
                            ];
                          }
                          return [value, name];
                        }}
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                          fontSize: '12px',
                          padding: '8px 12px'
                        }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="predictedDemand" 
                        name={t('forecast.expectedDemand')}
                        stroke="hsl(var(--primary))" 
                        strokeWidth={3}
                        dot={(props: any) => {
                          const { cx, cy, payload, index } = props;
                          if (payload.festival) {
                            return (
                              <g key={`festival-dot-${index}`}>
                                <circle cx={cx} cy={cy} r={6} fill="hsl(var(--destructive))" stroke="#fff" strokeWidth={2} />
                                <text x={cx} y={cy - 12} textAnchor="middle" fontSize="10" fill="hsl(var(--destructive))" fontWeight="600">
                                  🎉
                                </text>
                              </g>
                            );
                          }
                          return <circle key={`normal-dot-${index}`} cx={cx} cy={cy} r={3} fill="hsl(var(--primary))" />;
                        }}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                  
                  {/* Legend */}
                  <div className="flex items-center justify-center gap-6 mt-4 text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-primary"></div>
                      <span className="text-muted-foreground">{t('forecast.normalDays')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-destructive"></div>
                      <span className="text-muted-foreground">{t('forecast.festivalDays')}</span>
                    </div>
                  </div>
                </div>

                {/* Festival Peaks */}
                {selectedForecast.peakPeriods.length > 0 && (
                  <div className="premium-card rounded-2xl p-6 border-l-4 border-l-warning">
                    <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-warning" />
                      {t('forecast.festivalPeaks')}
                    </h3>
                    <div className="space-y-3">
                      {selectedForecast.peakPeriods.map((peak, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 bg-muted/50 rounded-xl">
                          <div>
                            <div className="font-medium text-foreground text-sm">{peak.festival}</div>
                            <div className="text-xs text-muted-foreground mt-0.5">
                              {new Date(peak.date).toLocaleDateString('en-IN', { 
                                month: 'long', 
                                day: 'numeric' 
                              })}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-semibold text-warning">
                              {peak.expectedDemand} {t('forecast.units')}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              +{Math.round((peak.impact - 1) * 100)}% {t('forecast.surge')}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recommendations */}
                {selectedForecast.recommendations.length > 0 && (
                  <div className="premium-card rounded-2xl p-6">
                    <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-primary" />
                      {t('forecast.recommendations')}
                    </h3>
                    <div className="space-y-3">
                      {selectedForecast.recommendations.map((rec, idx) => (
                        <div 
                          key={idx} 
                          className={`p-4 rounded-xl border-l-4 ${
                            rec.priority === 'high' ? 'bg-destructive/5 border-l-destructive' :
                            rec.priority === 'medium' ? 'bg-warning/5 border-l-warning' :
                            'bg-primary/5 border-l-primary'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <AlertTriangle className={`h-5 w-5 mt-0.5 flex-shrink-0 ${
                              rec.priority === 'high' ? 'text-destructive' :
                              rec.priority === 'medium' ? 'text-warning' :
                              'text-primary'
                            }`} />
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-foreground text-sm">{rec.message}</div>
                              <div className="text-sm text-muted-foreground mt-1">{rec.action}</div>
                              <div className="text-xs text-muted-foreground mt-1 italic">{rec.impact}</div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
