import { Logo } from "@/components/ui/Logo";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, TrendingUp, Shield, BarChart3 } from "lucide-react";
import { useNavigate } from "react-router-dom";

const features = [
  {
    icon: Sparkles,
    title: "AI Recommendations",
    description: "Get clear actions, not just data",
  },
  {
    icon: TrendingUp,
    title: "Demand Forecasting",
    description: "See what's coming before it happens",
  },
  {
    icon: Shield,
    title: "Risk Alerts",
    description: "Never be caught off guard",
  },
  {
    icon: BarChart3,
    title: "Competitor Intel",
    description: "Know the market in real-time",
  },
];

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="h-16 flex items-center justify-between px-6 md:px-12 border-b border-border/50">
        <Logo size="md" />
        <div className="flex items-center gap-4">
          <Button variant="ghost" className="text-muted-foreground hover:text-foreground">
            Sign in
          </Button>
          <Button 
            onClick={() => navigate("/copilot")}
            className="rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 shadow-soft"
          >
            Get Started
          </Button>
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-16 md:py-24">
        <div className="max-w-4xl mx-auto text-center animate-fade-in">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-8">
            <Sparkles className="w-4 h-4" />
            AI-Powered Pricing Intelligence
          </div>

          {/* Headline */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-semibold tracking-tight text-foreground mb-6 leading-[1.1]">
            Make the right pricing decision.{" "}
            <span className="gradient-text">Every time.</span>
          </h1>

          {/* Subheadline */}
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
            RetailMind AI watches the market and tells you what to do. 
            Competitor prices, demand forecasts, and smart recommendations — all in one calm, intelligent interface.
          </p>

          {/* CTA */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              onClick={() => navigate("/copilot")}
              size="lg"
              className="rounded-xl px-8 py-6 text-lg bg-primary text-primary-foreground hover:bg-primary/90 shadow-medium ai-glow group"
            >
              <Sparkles className="w-5 h-5 mr-2" />
              Ask RetailMind
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="rounded-xl px-8 py-6 text-lg border-border hover:bg-accent"
            >
              See how it works
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto mt-20 animate-fade-in" style={{ animationDelay: "0.2s" }}>
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="premium-card rounded-2xl p-6 text-center"
              style={{ animationDelay: `${0.1 * index}s` }}
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <feature.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-medium text-foreground mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="py-8 px-6 text-center border-t border-border/50">
        <p className="text-sm text-muted-foreground">
          © 2024 RetailMind AI. Built for retailers who want clarity, not complexity.
        </p>
      </footer>
    </div>
  );
}
