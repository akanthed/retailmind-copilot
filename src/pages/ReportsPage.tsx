import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { FileDown, FileText, Download, Calendar, Loader2 } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import {
  generateCSV,
  generatePDF,
  getPricingPerformanceData,
  getCompetitorAnalysisData,
  getDemandForecastData,
  getInventoryRiskData,
} from "@/lib/reportGenerator";
import { apiClient } from "@/api/client";

export default function ReportsPage() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [selectedPeriod, setSelectedPeriod] = useState<'7' | '30' | '90' | 'custom'>('30');
  const [generatingReport, setGeneratingReport] = useState<string | null>(null);

  const getPeriodLabel = () => {
    switch (selectedPeriod) {
      case '7': return t('reports.last7Days');
      case '30': return t('reports.last30Days');
      case '90': return t('reports.last90Days');
      default: return 'Custom Period';
    }
  };

  const getReportData = async (reportTitle: string) => {
    const period = getPeriodLabel();

    let data;
    if (reportTitle === t('reports.pricingPerformance')) {
      // Try to enrich with real product data
      try {
        const productsResult = await apiClient.getProducts();
        const pd = productsResult.data as any;
        const products = pd?.products || (Array.isArray(pd) ? pd : []);
        if (products.length > 0) {
          data = products.map((p: any) => ({
            product: p.name,
            sku: p.sku || '—',
            currentPrice: p.currentPrice || 0,
            costPrice: p.costPrice || 0,
            margin: p.currentPrice && p.costPrice
              ? `${(((p.currentPrice - p.costPrice) / p.currentPrice) * 100).toFixed(1)}%`
              : '—',
            stock: p.stock || 0,
            category: p.category || '—',
          }));
        } else {
          data = await getPricingPerformanceData(period);
        }
      } catch {
        data = await getPricingPerformanceData(period);
      }
    } else if (reportTitle === t('reports.competitorAnalysis')) {
      try {
        const insightsResult = await apiClient.getInsights();
        const insightsData = insightsResult.data as any;
        if (insightsData?.competitorStats?.length > 0) {
          data = insightsData.competitorStats.map((cs: any) => ({
            competitor: cs.name,
            avgPriceDifference: cs.avgPriceDiff,
            productsCompared: cs.products,
            lastUpdated: cs.lastUpdate ? new Date(cs.lastUpdate).toLocaleDateString('en-IN') : '—',
          }));
        } else {
          data = await getCompetitorAnalysisData(period);
        }
      } catch {
        data = await getCompetitorAnalysisData(period);
      }
    } else if (reportTitle === t('reports.demandForecast')) {
      try {
        const productsResult = await apiClient.getProducts();
        const pd = productsResult.data as any;
        const products = pd?.products || (Array.isArray(pd) ? pd : []);
        if (products.length > 0) {
          data = products.map((p: any) => ({
            product: p.name,
            currentStock: p.stock || 0,
            category: p.category || '—',
            stockStatus: (p.stock || 0) < 10 ? 'Low' : (p.stock || 0) < 30 ? 'Medium' : 'Healthy',
            estimatedDemand: (p.stock || 0) < 10 ? 'High' : (p.stock || 0) < 30 ? 'Medium' : 'Low',
            reorderSuggestion: (p.stock || 0) < 10 ? 'Reorder Now' : (p.stock || 0) < 20 ? 'Plan Reorder' : 'No Action',
          }));
        } else {
          data = await getDemandForecastData(period);
        }
      } catch {
        data = await getDemandForecastData(period);
      }
    } else if (reportTitle === t('reports.inventoryRisk')) {
      try {
        const productsResult = await apiClient.getProducts();
        const pd = productsResult.data as any;
        const products = pd?.products || (Array.isArray(pd) ? pd : []);
        if (products.length > 0) {
          data = products.map((p: any) => ({
            product: p.name,
            currentStock: p.stock || 0,
            category: p.category || '—',
            riskLevel: (p.stock || 0) < 5 ? 'Critical' : (p.stock || 0) < 10 ? 'High' : (p.stock || 0) < 20 ? 'Medium' : 'Low',
            estimatedStockoutDate: (p.stock || 0) < 20 ? `${Math.max(1, Math.floor((p.stock || 0) / 2))} days` : 'N/A',
            suggestedAction: (p.stock || 0) < 5 ? 'Urgent Restock' : (p.stock || 0) < 10 ? 'Reorder Soon' : 'Monitor',
          }));
        } else {
          data = await getInventoryRiskData(period);
        }
      } catch {
        data = await getInventoryRiskData(period);
      }
    } else {
      return null;
    }

    return {
      title: reportTitle,
      period,
      generatedAt: new Date().toLocaleString('en-IN'),
      data,
    };
  };

  const handleGenerateReport = async (reportTitle: string, format: string) => {
    const reportKey = `${reportTitle}-${format}`;
    setGeneratingReport(reportKey);
    toast({
      title: t('reports.generating'),
      description: `${reportTitle} (${format})`,
    });

    try {
      const reportData = await getReportData(reportTitle);

      if (!reportData || !reportData.data || reportData.data.length === 0) {
        toast({
          title: t('errors.error'),
          description: 'No data available for this report. Add products first.',
          variant: 'destructive',
        });
        return;
      }

      const filename = `${reportTitle.replace(/\s+/g, '_')}_${selectedPeriod}days.${format.toLowerCase()}`;

      if (format === 'PDF') {
        generatePDF(reportData, filename);
        toast({
          title: t('reports.ready'),
          description: t('reports.pdfOpened'),
        });
      } else if (format === 'CSV') {
        generateCSV(reportData.data, filename);
        toast({
          title: t('reports.ready'),
          description: t('reports.downloadStarting'),
        });
      }
    } catch (error) {
      console.error('Report generation error:', error);
      toast({
        title: t('errors.error'),
        description: 'Failed to generate report. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setGeneratingReport(null);
    }
  };

  const handleDownloadRecent = async (reportName: string, type: string) => {
    setGeneratingReport(reportName);
    toast({
      title: t('reports.downloading'),
      description: reportName,
    });

    try {
      const reportData = await getReportData(reportName);

      if (!reportData || !reportData.data || reportData.data.length === 0) {
        toast({
          title: t('errors.error'),
          description: 'No data available. Add products first.',
          variant: 'destructive',
        });
        return;
      }

      const filename = `${reportName.replace(/\s+/g, '_')}.${type.toLowerCase()}`;
      if (type === 'PDF') {
        generatePDF(reportData, filename);
      } else {
        generateCSV(reportData.data, filename);
      }

      toast({
        title: t('reports.ready'),
        description: `${reportName} downloaded`,
      });
    } catch (error) {
      console.error('Download error:', error);
      toast({
        title: t('errors.error'),
        description: 'Failed to download report',
        variant: 'destructive',
      });
    } finally {
      setGeneratingReport(null);
    }
  };

  const handlePeriodChange = (period: '7' | '30' | '90' | 'custom') => {
    setSelectedPeriod(period);
    if (period === 'custom') {
      toast({
        title: t('reports.customRange'),
        description: t('reports.customRangeDesc'),
      });
    }
  };

  const reportTypes = [
    {
      title: t('reports.pricingPerformance'),
      description: t('reports.pricingPerformanceDesc'),
      formats: ["PDF", "CSV"],
    },
    {
      title: t('reports.competitorAnalysis'),
      description: t('reports.competitorAnalysisDesc'),
      formats: ["PDF", "CSV"],
    },
    {
      title: t('reports.demandForecast'),
      description: t('reports.demandForecastDesc'),
      formats: ["PDF", "CSV"],
    },
    {
      title: t('reports.inventoryRisk'),
      description: t('reports.inventoryRiskDesc'),
      formats: ["PDF"],
    },
  ];

  const recentReports = [
    { name: `${t('reports.weeklySummary')} - ${new Date().toLocaleDateString('en-IN')}`, date: new Date().toLocaleDateString('en-IN'), type: "PDF" },
    { name: `${t('reports.competitorAnalysis')} - Q${Math.ceil((new Date().getMonth() + 1) / 3)}`, date: new Date(Date.now() - 7 * 86400000).toLocaleDateString('en-IN'), type: "PDF" },
    { name: t('reports.productPerformanceExport'), date: new Date(Date.now() - 14 * 86400000).toLocaleDateString('en-IN'), type: "CSV" },
  ];

  return (
    <AppLayout>
      <div className="min-h-screen p-6 md:p-10 max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <FileDown className="w-5 h-5 text-primary" />
            </div>
            <h1 className="text-2xl font-semibold text-foreground">{t('reports.title')}</h1>
          </div>
          <p className="text-muted-foreground">
            {t('reports.subtitle')}
          </p>
        </div>

        {/* Time Range */}
        <div className="premium-card rounded-2xl p-4 mb-8 flex items-center justify-between animate-fade-in" style={{ animationDelay: "0.1s" }}>
          <div className="flex items-center gap-3">
            <Calendar className="w-5 h-5 text-muted-foreground" />
            <span className="text-foreground font-medium">{t('reports.reportPeriod')}</span>
          </div>
          <div className="flex gap-2">
            <Button 
              variant={selectedPeriod === '7' ? 'default' : 'outline'} 
              size="sm" 
              className="rounded-lg"
              onClick={() => handlePeriodChange('7')}
            >
              {t('reports.last7Days')}
            </Button>
            <Button 
              variant={selectedPeriod === '30' ? 'default' : 'outline'}
              size="sm" 
              className="rounded-lg"
              onClick={() => handlePeriodChange('30')}
            >
              {t('reports.last30Days')}
            </Button>
            <Button 
              variant={selectedPeriod === '90' ? 'default' : 'outline'}
              size="sm" 
              className="rounded-lg"
              onClick={() => handlePeriodChange('90')}
            >
              {t('reports.last90Days')}
            </Button>
            <Button 
              variant={selectedPeriod === 'custom' ? 'default' : 'outline'}
              size="sm" 
              className="rounded-lg"
              onClick={() => handlePeriodChange('custom')}
            >
              {t('reports.custom')}
            </Button>
          </div>
        </div>

        {/* Report Types */}
        <div className="mb-10 animate-fade-in" style={{ animationDelay: "0.15s" }}>
          <h2 className="text-lg font-medium text-foreground mb-4">{t('reports.generateReport')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {reportTypes.map((report) => (
              <div key={report.title} className="premium-card rounded-2xl p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-medium text-foreground mb-1">{report.title}</h3>
                    <p className="text-sm text-muted-foreground">{report.description}</p>
                  </div>
                  <FileText className="w-5 h-5 text-muted-foreground" />
                </div>
                <div className="flex gap-2">
                  {report.formats.map((format) => (
                    <Button
                      key={format}
                      variant="outline"
                      size="sm"
                      className="rounded-lg"
                      onClick={() => handleGenerateReport(report.title, format)}
                      disabled={generatingReport === `${report.title}-${format}`}
                    >
                      {generatingReport === `${report.title}-${format}` ? (
                        <Loader2 className="w-3 h-3 mr-1.5 animate-spin" />
                      ) : (
                        <Download className="w-3 h-3 mr-1.5" />
                      )}
                      {format}
                    </Button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Reports */}
        <div className="animate-fade-in" style={{ animationDelay: "0.2s" }}>
          <h2 className="text-lg font-medium text-foreground mb-4">{t('reports.recentReports')}</h2>
          <div className="premium-card rounded-2xl overflow-hidden">
            {recentReports.map((report) => (
              <div
                key={report.name}
                className="flex items-center justify-between p-4 border-b border-border last:border-0 hover:bg-accent/30 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
                    <FileText className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{report.name}</p>
                    <p className="text-sm text-muted-foreground">{report.date}</p>
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="rounded-lg"
                  onClick={() => handleDownloadRecent(report.name, report.type)}
                  disabled={generatingReport === report.name}
                >
                  {generatingReport === report.name ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Download className="w-4 h-4" />
                  )}
                </Button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
