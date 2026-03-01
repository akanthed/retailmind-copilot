import { CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface SuccessAnimationProps {
  message?: string;
  className?: string;
}

export function SuccessAnimation({ message = "Success!", className }: SuccessAnimationProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center gap-3 animate-bounce-in", className)}>
      <div className="relative">
        <CheckCircle className="w-16 h-16 text-success" />
        <div className="absolute inset-0 rounded-full success-pulse" />
      </div>
      <p className="text-lg font-medium text-success animate-fade-in" style={{ animationDelay: "0.2s" }}>
        {message}
      </p>
    </div>
  );
}
