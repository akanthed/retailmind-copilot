import { useState, useEffect } from "react";
import { Loader2, Sparkles } from "lucide-react";

const inspirationalQuotes = [
  "Smart pricing wins customers...",
  "Data beats guesswork every time...",
  "Your competitors are just one click away...",
  "Every price tells a story...",
  "Knowledge is your competitive edge...",
  "Stay ahead of market trends...",
  "Price right, profit more...",
  "AI is analyzing thousands of data points...",
  "Your success starts with smart decisions...",
  "Market intelligence at your fingertips...",
  "Turning data into profits...",
  "Small changes, big impact...",
  "Compete smarter, not harder...",
  "Your business deserves better insights...",
  "Price optimization in progress...",
];

interface LoadingSpinnerProps {
  message?: string;
  showQuote?: boolean;
  size?: "sm" | "md" | "lg";
}

export function LoadingSpinner({ 
  message = "Loading...", 
  showQuote = true,
  size = "md" 
}: LoadingSpinnerProps) {
  const [quote, setQuote] = useState("");
  const [quoteIndex, setQuoteIndex] = useState(0);

  useEffect(() => {
    if (showQuote) {
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
  }, [showQuote]);

  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-12 h-12",
    lg: "w-16 h-16",
  };

  return (
    <div className="flex flex-col items-center justify-center gap-4 animate-fade-in">
      <div className="relative">
        <Loader2 className={`${sizeClasses[size]} animate-spin text-primary`} />
        <div className="absolute inset-0 rounded-full animate-pulse-soft">
          <div className="w-full h-full rounded-full bg-primary/10" />
        </div>
      </div>
      
      <div className="text-center space-y-2 max-w-md">
        <p className="text-muted-foreground font-medium">{message}</p>
        
        {showQuote && quote && (
          <div className="flex items-center justify-center gap-2 animate-fade-in">
            <Sparkles className="w-4 h-4 text-primary flex-shrink-0" />
            <p className="text-sm text-primary/80 italic">
              {quote}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// Full page loading component
export function LoadingPage({ message, showQuote = true }: LoadingSpinnerProps) {
  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <LoadingSpinner message={message} showQuote={showQuote} size="lg" />
    </div>
  );
}

// Inline loading component (for cards, sections)
export function LoadingInline({ message, showQuote = false }: LoadingSpinnerProps) {
  return (
    <div className="flex items-center justify-center p-8">
      <LoadingSpinner message={message} showQuote={showQuote} size="sm" />
    </div>
  );
}
