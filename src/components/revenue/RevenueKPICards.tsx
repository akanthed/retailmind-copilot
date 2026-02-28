import { IndianRupee, TrendingUp, Target } from "lucide-react";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

interface RevenueKPICardsProps {
  revenueProtected: number;
  responseRate: number;
  alertsResponded: number;
  alertsTotal: number;
  competitiveScore: number;
  loading?: boolean;
  error?: string;
  onRetry?: () => void;
}

export function RevenueKPICards({
  revenueProtected,
  responseRate,
  alertsResponded,
  alertsTotal,
  competitiveScore,
  loading = false,
  error,
  onRetry,
}: RevenueKPICardsProps) {
  if (error) {
    return (
      <div className="premium-card rounded-2xl p-6 text-center">
        <p className="text-destructive mb-4">{error}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="text-primary hover:underline"
          >
            Retry
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <KPICard
        icon={<IndianRupee className="w-5 h-5" />}
        title="Revenue Protected"
        value={formatCurrency(revenueProtected)}
        subtitle="This month"
        loading={loading}
        color="text-primary"
      />
      <KPICard
        icon={<TrendingUp className="w-5 h-5" />}
        title="Alert Response"
        value={`${Math.round(responseRate)}%`}
        subtitle={`${alertsResponded}/${alertsTotal} alerts`}
        loading={loading}
        color="text-success"
      />
      <KPICard
        icon={<Target className="w-5 h-5" />}
        title="Competitive Score"
        value={`${competitiveScore.toFixed(1)}/10`}
        subtitle="Market position"
        loading={loading}
        color="text-primary"
      />
    </div>
  );
}

interface KPICardProps {
  icon: React.ReactNode;
  title: string;
  value: string;
  subtitle: string;
  loading: boolean;
  color: string;
}

function KPICard({ icon, title, value, subtitle, loading, color }: KPICardProps) {
  return (
    <div className="premium-card rounded-2xl p-6 hover-lift transition-smooth">
      <div className="flex items-start justify-between mb-4">
        <div className={`${color} opacity-80`}>{icon}</div>
      </div>
      
      {loading ? (
        <div className="flex justify-center py-4">
          <LoadingSpinner size="sm" />
        </div>
      ) : (
        <>
          <div className="text-3xl font-semibold mb-1">{value}</div>
          <div className="text-sm text-muted-foreground">{title}</div>
          <div className="text-xs text-muted-foreground mt-1">{subtitle}</div>
        </>
      )}
    </div>
  );
}

function formatCurrency(amount: number): string {
  return `₹${amount.toLocaleString("en-IN")}`;
}
