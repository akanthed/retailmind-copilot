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
  
  // Determine badge variant and icon based on score first, then matchType
  let variant: 'default' | 'secondary' | 'destructive' | 'outline' = 'secondary';
  let icon = null;
  let label = '';
  
  // Prioritize score over matchType for better accuracy
  if (score >= 85 || matchType === 'exact') {
    variant = 'default';
    icon = <CheckCircle2 className="w-3 h-3" />;
    label = 'Exact Match';
  } else if (score >= 70 || matchType === 'approximate') {
    variant = 'secondary';
    icon = <CheckCircle2 className="w-3 h-3" />;
    label = 'Good Match';
  } else if (score >= 50) {
    variant = 'outline';
    icon = <AlertCircle className="w-3 h-3" />;
    label = 'Approx Match';
  } else {
    variant = 'destructive';
    icon = <XCircle className="w-3 h-3" />;
    label = 'Mismatch';
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
