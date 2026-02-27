import { HelpTooltip } from "./HelpTooltip";
import { Badge } from "./badge";

interface ConfidenceIndicatorProps {
  score: number; // 0.0 to 1.0
  showLabel?: boolean;
}

export function ConfidenceIndicator({ score, showLabel = true }: ConfidenceIndicatorProps) {
  const percentage = Math.round(score * 100);
  
  let variant: "default" | "secondary" | "destructive" = "default";
  let label = "High";
  let explanation = "";
  
  if (percentage >= 80) {
    variant = "default";
    label = "High";
    explanation = "AI is very confident about this recommendation. Strong evidence from market data.";
  } else if (percentage >= 60) {
    variant = "secondary";
    label = "Medium";
    explanation = "AI has good confidence. Based on available market data, but consider your own judgment.";
  } else {
    variant = "destructive";
    label = "Low";
    explanation = "AI has limited confidence. Not enough market data. Use your own judgment.";
  }
  
  return (
    <div className="flex items-center gap-2">
      <Badge variant={variant} className="gap-1">
        {percentage}% {showLabel && label}
      </Badge>
      <HelpTooltip content={explanation} />
    </div>
  );
}
