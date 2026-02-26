// Price history chart component with Recharts
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { format } from "date-fns";
import { TrendingUp, TrendingDown } from "lucide-react";

interface PriceDataPoint {
  timestamp: number;
  price: number;
  competitor?: string;
}

interface PriceChartProps {
  data: PriceDataPoint[];
  title?: string;
  showTrend?: boolean;
}

export function PriceChart({ data, title = "Price History", showTrend = true }: PriceChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="premium-card rounded-2xl p-8 text-center">
        <p className="text-muted-foreground">No price history available yet</p>
      </div>
    );
  }

  // Format data for chart
  const chartData = data.map(point => ({
    date: format(new Date(point.timestamp), "MMM dd"),
    price: point.price,
    fullDate: format(new Date(point.timestamp), "PPP"),
  }));

  // Calculate trend
  const firstPrice = data[0]?.price || 0;
  const lastPrice = data[data.length - 1]?.price || 0;
  const priceChange = lastPrice - firstPrice;
  const priceChangePercent = firstPrice > 0 ? ((priceChange / firstPrice) * 100).toFixed(1) : "0";
  const isPositive = priceChange >= 0;

  return (
    <div className="premium-card rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-medium text-foreground">{title}</h3>
        {showTrend && (
          <div className={`flex items-center gap-2 text-sm font-medium ${isPositive ? "text-destructive" : "text-success"}`}>
            {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
            {isPositive ? "+" : ""}{priceChangePercent}%
          </div>
        )}
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis 
            dataKey="date" 
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
              padding: "8px 12px",
            }}
            labelStyle={{ color: "hsl(var(--foreground))", fontWeight: 500 }}
            formatter={(value: any) => [`₹${value}`, "Price"]}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="price"
            stroke="hsl(var(--primary))"
            strokeWidth={2}
            dot={{ fill: "hsl(var(--primary))", r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export function ComparisonChart({ 
  data, 
  title = "Price Comparison" 
}: { 
  data: Array<{ name: string; yourPrice: number; competitorPrice: number }>;
  title?: string;
}) {
  if (!data || data.length === 0) {
    return (
      <div className="premium-card rounded-2xl p-8 text-center">
        <p className="text-muted-foreground">No comparison data available</p>
      </div>
    );
  }

  return (
    <div className="premium-card rounded-2xl p-6">
      <h3 className="text-lg font-medium text-foreground mb-6">{title}</h3>
      
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
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
              padding: "8px 12px",
            }}
            formatter={(value: any) => [`₹${value}`, ""]}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="yourPrice"
            stroke="hsl(var(--primary))"
            strokeWidth={2}
            name="Your Price"
          />
          <Line
            type="monotone"
            dataKey="competitorPrice"
            stroke="hsl(var(--destructive))"
            strokeWidth={2}
            name="Competitor"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
