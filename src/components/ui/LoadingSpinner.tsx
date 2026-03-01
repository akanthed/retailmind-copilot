import { useState, useEffect } from "react";
import { Loader2, Sparkles } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";

interface LoadingSpinnerProps {
  message?: string;
  showQuote?: boolean;
  size?: "sm" | "md" | "lg";
}

export function LoadingSpinner({ 
  message = "loading.default", 
  showQuote = true,
  size = "md" 
}: LoadingSpinnerProps) {
  const { t } = useLanguage();
  const [quote, setQuote] = useState("");
  const [quoteIndex, setQuoteIndex] = useState(0);

  // Generate quote keys array
  const quoteKeys = Array.from({ length: 15 }, (_, i) => `loading.quote${i + 1}`);

  // Get translated quotes
  const inspirationalQuotes = quoteKeys.map(key => t(key));
  
  // Get translated message
  const displayMessage = message.startsWith('loading.') ? t(message) : message;

  useEffect(() => {
    if (showQuote && inspirationalQuotes.length > 0) {
      // Pick random quote on mount
      const randomIndex = Math.floor(Math.random() * inspirationalQuotes.length);
      setQuoteIndex(randomIndex);
      setQuote(inspirationalQuotes[randomIndex]);

      // Rotate quotes every 4 seconds
      const interval = setInterval(() => {
        setQuoteIndex((prev) => {
          const next = (prev + 1) % inspirationalQuotes.length;
          setQuote(inspirationalQuotes[next]);
          return next;
        });
      }, 4000);

      return () => clearInterval(interval);
    }
  }, [showQuote, inspirationalQuotes]);

  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-12 h-12",
    lg: "w-16 h-16",
  };

  return (
    <div className="flex flex-col items-center justify-center gap-4 animate-fade-in" role="status" aria-live="polite" aria-label={displayMessage}>
      <div className="relative">
        <Loader2 className={`${sizeClasses[size]} animate-spin text-primary`} aria-hidden="true" />
        <div className="absolute inset-0 rounded-full animate-pulse-soft">
          <div className="w-full h-full rounded-full bg-primary/10" />
        </div>
      </div>
      
      <div className="text-center space-y-2 max-w-md">
        <p className="text-muted-foreground font-medium">{displayMessage}</p>
        
        {showQuote && quote && (
          <div className="flex items-center justify-center gap-2 animate-fade-in">
            <Sparkles className="w-4 h-4 text-primary flex-shrink-0" aria-hidden="true" />
            <p className="text-sm text-primary/80 italic" aria-label={`Tip: ${quote}`}>
              {quote}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// Full page loading component
export function LoadingPage({ message = "loading.default", showQuote = true }: LoadingSpinnerProps) {
  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <LoadingSpinner message={message} showQuote={showQuote} size="lg" />
    </div>
  );
}

// Inline loading component (for cards, sections)
export function LoadingInline({ message = "loading.default", showQuote = false }: LoadingSpinnerProps) {
  return (
    <div className="flex items-center justify-center p-8">
      <LoadingSpinner message={message} showQuote={showQuote} size="sm" />
    </div>
  );
}
