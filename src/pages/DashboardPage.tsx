// Enhanced dashboard with comprehensive analytics
import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { MetricCard } from "@/components/ui/Cards";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown,
  Package, 
  AlertTriangle,
  DollarSign,
  ShoppingCart,
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react";
import { apiClient, Product } from "@/api/client";
import { useToast } from "@/hooks/use-toast";
import { PageLoader, MetricsSkeleton } from "@/components/ui/LoadingStates";
import { ErrorState, EmptyState } from "@/components/ui/ErrorBoundary";
import { useNavigate } from "react-router-dom";
import { 
  LineChart, 
  Line, 
  BarChart,
  Bar,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";
import {
  generateRevenueData,
  generateCategoryData,
  generateCompetitorComparisonData,
  generatePerformanceIndicators
} from "@/utils/chartData";

const COLORS = ['hsl(var(--primary))', 'hsl(var(--success))', 'hsl(var(--warning))', 'hsl(var(--destructive))'];

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [metrics, setMetrics] = useState({
    totalProducts: 0,
    totalRevenue: 0,
    avgMargin: 0,
    activeAlerts: 0,
    revenueChange: 0,
    marginChange: 0,
  });
  const [chartData, setChartData] = useState({
    revenue: [] as any[],
    category: [] as any[],
    competitor: [] as any[],
    performance: {
      bestPerformer: { category: 'N/A', growth: 0 },
      needsAttention: { category: 'N/A', decline: 0 },
      avgOrderValue: 0
    }
  });
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    loadDashboardData();
  }, []);

  async function loadDashboardData() {
    setLoading(true);
    setError(null);

    try {
      // Load products
      const productsResult = await apiClient.getProducts();
      
      if (productsResult.error) {
        setError(productsResult.error);
        return;
      }

      const fetchedProducts = productsResult.data?.products || [];
      setProducts(fetchedProducts);
      
      // Load alerts
      const alertsResult = await apiClient.getAlerts();
      const alerts = alertsResult.data?.alerts || [];
      const activeAlerts = alerts.filter(a => !a.acknowledged).length;

      // Load recommendations
      const recsResult = await apiClient.getRecommendations();
      const recommendations = recsResult.data?.recommendations || [];

      // Calculate real metrics from actual data
      const totalRevenue = fetchedProducts.reduce((sum, p) => sum + (p.currentPrice * p.stock), 0);
      const totalCost = fetchedProducts.reduce((sum, p) => sum + (p.costPrice * p.stock), 0);
      const avgMargin = totalRevenue > 0
        ? ((totalRevenue - totalCost) / totalRevenue) * 100
        : 0;

      // Calculate trends (compare with previous period - mock for now)
      const revenueChange = 12.3; // TODO: Calculate from historical data
      const marginChange = 2.1; // TODO: Calculate from historical data

      setMetrics({
        totalProducts: fetchedProducts.length,
        totalRevenue,
        avgMargin,
        activeAlerts,
        revenueChange,
        marginChange,
      });

      // Generate chart data from real products
      setChartData({
        revenue: generateRevenueData(fetchedProducts),
        category: generateCategoryData(fetchedProducts),
        competitor: generateCompetitorComparisonData(fetchedProducts),
        performance: generatePerformanceIndicators(fetchedProducts)
      });

    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <AppLayout>
        <div className="min-h-screen p-6 md:p-10 max-w-7xl mx-auto">
          <div className="mb-8">
            <div className="h-8 w-48 bg-secondary rounded animate-pulse mb-2"></div>
            <div className="h-4 w-96 bg-secondary rounded animate-pulse"></div>
          </div>
          <MetricsSkeleton />
        </div>
      </AppLayout>
    );
  }

  if (error) {
    return (
      <AppLayout>
        <div className="min-h-screen p-6 md:p-10 max-w-7xl mx-auto">
          <ErrorState
            title="Failed to load dashboard"
            message={error}
            onRetry={loadDashboardData}
          />
        </div>
      </AppLayout>
    );
  }

  // Use real chart data
  const revenueData = chartData.revenue;
  const categoryData = chartData.category;
  const competitorData = chartData.competitor;
  const performanceData = chartData.performance;

  // Check if we have data
  const hasProducts = products.length > 0;
  const hasChartData = revenueData.length > 0 && categoryData.length > 0;

  return (
    <AppLayout>
      <div className="min-h-screen p-6 md:p-10 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-semibold text-foreground mb-2">Dashboard</h1>
              <p className="text-muted-foreground">
                Your business performance at a glance
              </p>
            </div>
            <Button onClick={loadDashboardData} variant="outline" className="rounded-xl">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8 animate-fade-in" style={{ animationDelay: "0.1s" }}>
          <MetricCard
            label="Total Revenue"
            value={`₹${(metrics.totalRevenue / 1000).toFixed(1)}K`}
            change={`${metrics.revenueChange > 0 ? '+' : ''}${metrics.revenueChange.toFixed(1)}% vs last month`}
            trend={metrics.revenueChange >= 0 ? "up" : "down"}
            icon={DollarSign}
          />
          
          <MetricCard
            label="Products"
            value={metrics.totalProducts.toString()}
            change="Active inventory"
            icon={Package}
          />
          
          <MetricCard
            label="Avg Margin"
            value={`${metrics.avgMargin.toFixed(1)}%`}
            change={`${metrics.marginChange > 0 ? '+' : ''}${metrics.marginChange.toFixed(1)}% vs last month`}
            trend={metrics.marginChange >= 0 ? "up" : "down"}
            icon={TrendingUp}
          />
          
          <MetricCard
            label="Active Alerts"
            value={metrics.activeAlerts.toString()}
            change="Needs attention"
            trend={metrics.activeAlerts > 0 ? "down" : "up"}
            icon={AlertTriangle}
          />
        </div>

        {!hasProducts ? (
          <div className="premium-card rounded-2xl p-12 text-center animate-fade-in" style={{ animationDelay: "0.15s" }}>
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Package className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">No Products Yet</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Add your first product to start tracking prices, monitoring competitors, and getting AI-powered recommendations.
            </p>
            <Button onClick={() => navigate("/products/add")} className="rounded-xl">
              <Package className="w-4 h-4 mr-2" />
              Add Your First Product
            </Button>
          </div>
        ) : (
          <>
        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Revenue Trend */}
          <div className="premium-card rounded-2xl p-6 animate-fade-in" style={{ animationDelay: "0.15s" }}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-medium text-foreground">Revenue Trend</h3>
              <Badge variant="secondary">Last 6 months</Badge>
            </div>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="month" 
                  stroke="hsl(var(--muted-foreground))"
                  style={{ fontSize: "12px" }}
                />
                <YAxis 
                  stroke="hsl(var(--muted-foreground))"
                  style={{ fontSize: "12px" }}
                  tickFormatter={(value) => `₹${value / 1000}K`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                  formatter={(value: any) => [`₹${value.toLocaleString()}`, ""]}
                />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  name="Revenue"
                />
                <Line
                  type="monotone"
                  dataKey="target"
                  stroke="hsl(var(--muted-foreground))"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  name="Target"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Category Distribution */}
          <div className="premium-card rounded-2xl p-6 animate-fade-in" style={{ animationDelay: "0.2s" }}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-medium text-foreground">Sales by Category</h3>
              <Badge variant="secondary">Current month</Badge>
            </div>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="hsl(var(--primary))"
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Competitor Comparison */}
          <div className="premium-card rounded-2xl p-6 animate-fade-in" style={{ animationDelay: "0.25s" }}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-medium text-foreground">Price Comparison</h3>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => navigate("/insights")}
              >
                View All
              </Button>
            </div>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={competitorData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="name" 
                  stroke="hsl(var(--muted-foreground))"
                  style={{ fontSize: "12px" }}
                />
                <YAxis 
                  stroke="hsl(var(--muted-foreground))"
                  style={{ fontSize: "12px" }}
                  tickFormatter={(value) => `₹${value}`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                  formatter={(value: any) => [`₹${value}`, ""]}
                />
                <Bar dataKey="yourPrice" fill="hsl(var(--primary))" name="Your Price" />
                <Bar dataKey="theirPrice" fill="hsl(var(--muted-foreground))" name="Their Price" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Quick Actions */}
          <div className="premium-card rounded-2xl p-6 animate-fade-in" style={{ animationDelay: "0.3s" }}>
            <h3 className="text-lg font-medium text-foreground mb-6">Quick Actions</h3>
            <div className="space-y-3">
              <Button
                onClick={() => navigate("/products/add")}
                className="w-full justify-start rounded-xl h-12 text-left"
                variant="outline"
              >
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center mr-3">
                  <Package className="w-4 h-4 text-primary" />
                </div>
                <span className="font-medium">Add New Product</span>
              </Button>
              
              <Button
                onClick={() => navigate("/alerts")}
                className="w-full justify-start rounded-xl h-12 text-left"
                variant="outline"
              >
                <div className="w-8 h-8 rounded-lg bg-destructive/10 flex items-center justify-center mr-3">
                  <AlertTriangle className="w-4 h-4 text-destructive" />
                </div>
                <div className="flex items-center justify-between flex-1">
                  <span className="font-medium">View Alerts</span>
                  {metrics.activeAlerts > 0 && (
                    <span className="px-2 py-1 rounded-full bg-destructive/10 text-destructive text-xs font-medium">
                      {metrics.activeAlerts}
                    </span>
                  )}
                </div>
              </Button>
              
              <Button
                onClick={() => navigate("/decisions")}
                className="w-full justify-start rounded-xl h-12 text-left"
                variant="outline"
              >
                <div className="w-8 h-8 rounded-lg bg-success/10 flex items-center justify-center mr-3">
                  <TrendingUp className="w-4 h-4 text-success" />
                </div>
                <span className="font-medium">Review Recommendations</span>
              </Button>
              
              <Button
                onClick={() => navigate("/reports")}
                className="w-full justify-start rounded-xl h-12 text-left"
                variant="outline"
              >
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center mr-3">
                  <BarChart3 className="w-4 h-4 text-primary" />
                </div>
                <span className="font-medium">Generate Report</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Performance Indicators */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-fade-in" style={{ animationDelay: "0.35s" }}>
          <div className="premium-card rounded-2xl p-6">
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Best Performer</p>
                <p className="text-2xl font-semibold text-foreground">{performanceData.bestPerformer.category}</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center">
                <ArrowUpRight className="w-5 h-5 text-success" />
              </div>
            </div>
            <p className="text-sm text-success font-medium">+{performanceData.bestPerformer.growth}% growth</p>
          </div>
          
          <div className="premium-card rounded-2xl p-6">
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Needs Attention</p>
                <p className="text-2xl font-semibold text-foreground">{performanceData.needsAttention.category}</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center">
                <ArrowDownRight className="w-5 h-5 text-destructive" />
              </div>
            </div>
            <p className="text-sm text-destructive font-medium">-{performanceData.needsAttention.decline}% decline</p>
          </div>
          
          <div className="premium-card rounded-2xl p-6">
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Avg Order Value</p>
                <p className="text-2xl font-semibold text-foreground">₹{performanceData.avgOrderValue.toLocaleString()}</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-primary" />
              </div>
            </div>
            <p className="text-sm text-success font-medium">+12% vs last month</p>
          </div>
        </div>
        </>
        )}
      </div>
    </AppLayout>
  );
}
