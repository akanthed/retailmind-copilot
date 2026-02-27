import { Clock, CheckCircle, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface DataFreshnessProps {
  timestamp: number | null;
  label?: string;
}

export function DataFreshness({ timestamp, label = "Updated" }: DataFreshnessProps) {
  if (!timestamp) return null;
  
  const now = Date.now();
  const diff = now - timestamp;
  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  let timeText = "";
  let variant: "default" | "secondary" | "destructive" = "default";
  let icon = <CheckCircle className="w-3 h-3" />;
  
  if (minutes < 1) {
    timeText = "Just now";
    variant = "default";
  } else if (minutes < 60) {
    timeText = `${minutes}m ago`;
    variant = "default";
  } else if (hours < 24) {
    timeText = `${hours}h ago`;
    variant = hours < 6 ? "default" : "secondary";
    icon = hours < 6 ? <CheckCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />;
  } else {
    timeText = `${days}d ago`;
    variant = "destructive";
    icon = <AlertCircle className="w-3 h-3" />;
  }
  
  return (
    <Badge variant={variant} className="gap-1 text-xs">
      {icon}
      {label} {timeText}
    </Badge>
  );
}
