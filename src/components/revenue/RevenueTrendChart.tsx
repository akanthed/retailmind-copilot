import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { format } from "date-fns";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { RevenueHistoryItem } from "@/api/client";
import { useLanguage } from "@/i18n/LanguageContext";

interface RevenueTrendChartProps {
  data: RevenueHistoryItem[];
  loading?: boolean;
  error?: string;
}

export function RevenueTrendChart({ data, loading = false, error }: RevenueTrendChartProps) {
  const { t } = useLanguage();

  if (error) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>{error}</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <LoadingSpinner />
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>{t('dashboard.noRevenueData')}</p>
        <p className="text-sm mt-2">{t('dashboard.revenueDataHint')}</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
        <XAxis
          dataKey="date"
          tickFormatter={(date) => {
            try {
              return format(new Date(date), "MMM dd");
            } catch {
              return date;
            }
          }}
          stroke="hsl(var(--muted-foreground))"
          fontSize={12}
        />
        <YAxis
          tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}K`}
          stroke="hsl(var(--muted-foreground))"
          fontSize={12}
        />
        <Tooltip
          formatter={(value: number) => [`₹${value.toLocaleString("en-IN")}`, t('dashboard.revenueProtected')]}
          labelFormatter={(date) => {
            try {
              return format(new Date(date), "PPP");
            } catch {
              return date;
            }
          }}
          contentStyle={{
            backgroundColor: "hsl(var(--card))",
            border: "1px solid hsl(var(--border))",
            borderRadius: "8px",
          }}
        />
        <Line
          type="monotone"
          dataKey="revenue_protected"
          stroke="hsl(173 58% 39%)"
          strokeWidth={2}
          dot={{ fill: "hsl(173 58% 39%)", r: 4 }}
          activeDot={{ r: 6 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
