import { cn } from "@/lib/utils";

interface LoadingSkeletonProps {
  className?: string;
  variant?: "card" | "text" | "circle" | "button";
  count?: number;
}

export function LoadingSkeleton({ 
  className, 
  variant = "text",
  count = 1 
}: LoadingSkeletonProps) {
  const variants = {
    card: "h-32 w-full rounded-2xl",
    text: "h-4 w-full rounded",
    circle: "h-10 w-10 rounded-full",
    button: "h-10 w-24 rounded-xl",
  };

  const skeletonClass = cn("skeleton", variants[variant], className);

  if (count === 1) {
    return <div className={skeletonClass} />;
  }

  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className={skeletonClass} />
      ))}
    </div>
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="premium-card rounded-2xl p-4 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 space-y-2">
          <LoadingSkeleton variant="text" className="w-3/4" />
          <LoadingSkeleton variant="text" className="w-1/2 h-3" />
        </div>
        <LoadingSkeleton variant="button" className="w-20 h-6" />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <LoadingSkeleton variant="card" className="h-20" />
        <LoadingSkeleton variant="card" className="h-20" />
      </div>
      <div className="flex gap-2">
        <LoadingSkeleton variant="button" className="flex-1" />
        <LoadingSkeleton variant="button" className="w-10" />
        <LoadingSkeleton variant="button" className="w-10" />
      </div>
    </div>
  );
}

export function RecommendationCardSkeleton() {
  return (
    <div className="premium-card rounded-2xl p-6 space-y-4">
      <div className="flex items-start gap-3">
        <LoadingSkeleton variant="circle" />
        <div className="flex-1 space-y-2">
          <LoadingSkeleton variant="text" className="w-2/3" />
          <LoadingSkeleton variant="text" className="w-1/2 h-3" />
        </div>
      </div>
      <LoadingSkeleton variant="text" count={2} />
      <div className="flex items-center justify-between pt-4 border-t border-border">
        <LoadingSkeleton variant="text" className="w-1/3" />
        <LoadingSkeleton variant="button" className="w-20 h-6" />
      </div>
    </div>
  );
}

export function StatCardSkeleton() {
  return (
    <div className="premium-card rounded-2xl p-4 space-y-2">
      <LoadingSkeleton variant="text" className="w-1/2 h-3" />
      <LoadingSkeleton variant="text" className="w-3/4 h-8" />
    </div>
  );
}
