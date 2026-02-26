// Reusable loading states and skeleton screens
import { Loader2 } from "lucide-react";

export function PageLoader({ message = "Loading..." }: { message?: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
        <p className="text-muted-foreground">{message}</p>
      </div>
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="premium-card rounded-2xl p-6 animate-pulse">
      <div className="h-4 bg-secondary rounded w-1/4 mb-4"></div>
      <div className="h-8 bg-secondary rounded w-1/2 mb-2"></div>
      <div className="h-3 bg-secondary rounded w-3/4"></div>
    </div>
  );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="premium-card rounded-2xl overflow-hidden">
      <div className="p-4 border-b border-border animate-pulse">
        <div className="grid grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-4 bg-secondary rounded"></div>
          ))}
        </div>
      </div>
      {[...Array(rows)].map((_, i) => (
        <div key={i} className="p-4 border-b border-border last:border-0 animate-pulse">
          <div className="grid grid-cols-4 gap-4">
            {[...Array(4)].map((_, j) => (
              <div key={j} className="h-4 bg-secondary rounded"></div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export function MetricsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {[...Array(4)].map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}

export function InlineLoader({ size = "sm" }: { size?: "sm" | "md" | "lg" }) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8"
  };
  
  return <Loader2 className={`${sizeClasses[size]} animate-spin text-primary`} />;
}
