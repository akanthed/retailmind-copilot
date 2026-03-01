import { Badge } from "@/components/ui/badge";
import { CheckCircle2, AlertCircle, XCircle } from "lucide-react";

interface MatchQualityBadgeProps {
  matchType?: 'exact' | 'approximate' | 'mismatch' | 'missing';
  matchScore?: number;
  aiScore?: number;
  extractedCapacity?: string;
  queryCapacity?: string;
}

export function MatchQualityBadge({ 
  matchType, 
  matchScore, 
  aiScore,
  extractedCapacity,
  queryCapacity 
}: MatchQualityBadgeProps) {
  // Determine which score to use
  const score = aiScore ?? matchScore ?? 0;
  
  // Determine badge variant and icon
  let variant: 'default' | 'secondary' | 'destructive' | 'outline' = 'secondary';
  let icon = null;
  let label = '';
  
  if (matchType === 'exact' || score >= 90) {
    variant = 'default';
    icon = <CheckCircle2 className="w-3 h-3" />;
    label = 'Exact Match';
  } else if (matchType === 'approximate' || score >= 70) {
    variant = 'secondary';
    icon = <AlertCircle className="w-3 h-3" />;
    label = 'Approx Match';
  } else if (matchType === 'mismatch' || score < 50) {
    variant = 'destructive';
    icon = <XCircle className="w-3 h-3" />;
    label = 'Mismatch';
  } else {
    variant = 'outline';
    label = `${score}% Match`;
  }
  
  return (
    <div className="flex items-center gap-2">
      <Badge variant={variant} className="flex items-center gap-1">
        {icon}
        <span>{label}</span>
      </Badge>
      {extractedCapacity && queryCapacity && extractedCapacity !== queryCapacity && (
        <span className="text-xs text-muted-foreground">
          Found: {extractedCapacity}
        </span>
      )}
    </div>
  );
}
