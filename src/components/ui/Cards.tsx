import { cn } from "@/lib/utils";
import { Sparkles, TrendingUp, AlertTriangle, CheckCircle } from "lucide-react";

interface AIRecommendationCardProps {
  title: string;
  product: string;
  reason: string;
  impact: string;
  confidence: number;
  status?: "pending" | "implemented" | "dismissed";
  onClick?: () => void;
}

export function AIRecommendationCard({
  title,
  product,
  reason,
  impact,
  confidence,
  status = "pending",
  onClick,
}: AIRecommendationCardProps) {
  const getConfidenceColor = () => {
    if (confidence >= 80) return "text-success";
    if (confidence >= 60) return "text-warning";
    return "text-muted-foreground";
  };

  const getConfidenceLabel = () => {
    if (confidence >= 80) return "High confidence";
    if (confidence >= 60) return "Medium confidence";
    return "Low confidence";
  };

  return (
    <div
      onClick={onClick}
      className={cn(
        "premium-card rounded-2xl p-6 cursor-pointer group",
        status === "implemented" && "border-success/30 bg-success/5"
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
              {title}
            </h3>
            <p className="text-sm text-muted-foreground">{product}</p>
          </div>
        </div>
        {status === "implemented" && (
          <div className="flex items-center gap-1.5 text-success text-sm font-medium">
            <CheckCircle className="w-4 h-4" />
            Done
          </div>
        )}
      </div>

      {/* Reason */}
      <p className="text-muted-foreground text-sm leading-relaxed mb-4">
        {reason}
      </p>

      {/* Impact & Confidence */}
      <div className="flex items-center justify-between pt-4 border-t border-border">
        <div className="flex items-center gap-2 text-sm">
          <TrendingUp className="w-4 h-4 text-success" />
          <span className="text-foreground font-medium">{impact}</span>
        </div>
        <div className={cn("flex items-center gap-1.5 text-sm", getConfidenceColor())}>
          <div className="w-2 h-2 rounded-full bg-current" />
          <span>{getConfidenceLabel()}</span>
        </div>
      </div>
    </div>
  );
}

interface AlertCardProps {
  type: "price_drop" | "stock_risk" | "opportunity";
  title: string;
  description: string;
  timestamp: string;
  suggestion?: string;
  onClick?: () => void;
}

export function AlertCard({
  type,
  title,
  description,
  timestamp,
  suggestion,
  onClick,
}: AlertCardProps) {
  const typeConfig = {
    price_drop: {
      icon: TrendingUp,
      color: "text-destructive",
      bg: "bg-destructive/10",
      label: "Price Change",
    },
    stock_risk: {
      icon: AlertTriangle,
      color: "text-warning",
      bg: "bg-warning/10",
      label: "Stock Risk",
    },
    opportunity: {
      icon: Sparkles,
      color: "text-success",
      bg: "bg-success/10",
      label: "Opportunity",
    },
  };

  const config = typeConfig[type];

  return (
    <div
      onClick={onClick}
      className="premium-card rounded-2xl p-5 cursor-pointer group"
    >
      <div className="flex gap-4">
        <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0", config.bg)}>
          <config.icon className={cn("w-5 h-5", config.color)} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-1">
            <span className={cn("text-xs font-medium", config.color)}>
              {config.label}
            </span>
            <span className="text-xs text-muted-foreground">{timestamp}</span>
          </div>
          <h4 className="font-medium text-foreground mb-1 group-hover:text-primary transition-colors">
            {title}
          </h4>
          <p className="text-sm text-muted-foreground">{description}</p>
          {suggestion && (
            <p className="text-sm text-primary mt-2 font-medium">
              → {suggestion}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

interface MetricCardProps {
  label: string;
  value: string;
  change?: string;
  trend?: "up" | "down" | "neutral";
  icon?: React.ElementType;
}

export function MetricCard({ label, value, change, trend = "neutral", icon: Icon }: MetricCardProps) {
  const trendColors = {
    up: "text-success",
    down: "text-destructive",
    neutral: "text-muted-foreground",
  };

  return (
    <div className="premium-card rounded-2xl p-5">
      <div className="flex items-start justify-between mb-3">
        <span className="text-sm text-muted-foreground">{label}</span>
        {Icon && (
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Icon className="w-4 h-4 text-primary" />
          </div>
        )}
      </div>
      <div className="flex items-end gap-2">
        <span className="text-2xl font-semibold text-foreground">{value}</span>
        {change && (
          <span className={cn("text-sm font-medium pb-0.5", trendColors[trend])}>
            {change}
          </span>
        )}
      </div>
    </div>
  );
}
