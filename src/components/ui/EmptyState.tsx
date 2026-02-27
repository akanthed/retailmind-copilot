import { LucideIcon } from "lucide-react";
import { Button } from "./button";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  className,
}: EmptyStateProps) {
  return (
    <div className={cn("premium-card rounded-2xl p-12 text-center animate-fade-in", className)}>
      <div className="animate-bounce-in">
        <Icon className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
      </div>
      <h3 className="text-lg font-medium text-foreground mb-2 animate-slide-in-bottom" style={{ animationDelay: "0.1s" }}>
        {title}
      </h3>
      <p className="text-muted-foreground mb-4 animate-slide-in-bottom" style={{ animationDelay: "0.15s" }}>
        {description}
      </p>
      {actionLabel && onAction && (
        <div className="animate-slide-in-bottom" style={{ animationDelay: "0.2s" }}>
          <Button onClick={onAction} className="gap-2">
            {actionLabel}
          </Button>
        </div>
      )}
    </div>
  );
}
