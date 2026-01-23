import { AppLayout } from "@/components/layout/AppLayout";
import { HelpCircle, Book, MessageCircle, Video, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const helpTopics = [
  {
    icon: Book,
    title: "Getting Started",
    description: "Learn the basics of RetailMind AI",
    articles: 5,
  },
  {
    icon: Video,
    title: "Video Tutorials",
    description: "Watch step-by-step guides",
    articles: 8,
  },
  {
    icon: MessageCircle,
    title: "FAQ",
    description: "Common questions answered",
    articles: 12,
  },
];

const faqs = [
  {
    question: "How does RetailMind AI determine pricing recommendations?",
    answer: "RetailMind AI analyzes competitor prices, demand forecasts, inventory levels, and historical sales data to generate recommendations with confidence scores.",
  },
  {
    question: "How often is competitor data updated?",
    answer: "Competitor pricing data is refreshed every 4 hours. Critical price changes trigger immediate alerts.",
  },
  {
    question: "Can I customize alert thresholds?",
    answer: "Yes! Go to Setup → Alert Preferences to configure when you receive notifications based on price changes, stock levels, and opportunities.",
  },
];

export default function HelpPage() {
  return (
    <AppLayout>
      <div className="min-h-screen p-6 md:p-10 max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <HelpCircle className="w-5 h-5 text-primary" />
            </div>
            <h1 className="text-2xl font-semibold text-foreground">Help Center</h1>
          </div>
          <p className="text-muted-foreground">
            Find answers and learn how to get the most from RetailMind AI.
          </p>
        </div>

        {/* Search */}
        <div className="premium-card rounded-2xl p-2 mb-8 animate-fade-in" style={{ animationDelay: "0.1s" }}>
          <input
            type="text"
            placeholder="Search for help..."
            className="w-full px-4 py-3 bg-transparent text-foreground placeholder:text-muted-foreground focus:outline-none"
          />
        </div>

        {/* Help Topics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10 animate-fade-in" style={{ animationDelay: "0.15s" }}>
          {helpTopics.map((topic) => (
            <div key={topic.title} className="premium-card rounded-2xl p-5 cursor-pointer group">
              <topic.icon className="w-8 h-8 text-primary mb-3" />
              <h3 className="font-medium text-foreground mb-1 group-hover:text-primary transition-colors">
                {topic.title}
              </h3>
              <p className="text-sm text-muted-foreground mb-2">{topic.description}</p>
              <p className="text-xs text-primary">{topic.articles} articles</p>
            </div>
          ))}
        </div>

        {/* FAQ */}
        <div className="animate-fade-in" style={{ animationDelay: "0.2s" }}>
          <h2 className="text-lg font-medium text-foreground mb-4">Frequently Asked Questions</h2>
          <div className="space-y-3">
            {faqs.map((faq, index) => (
              <details key={index} className="premium-card rounded-2xl group">
                <summary className="p-5 cursor-pointer list-none flex items-center justify-between">
                  <span className="font-medium text-foreground pr-4">{faq.question}</span>
                  <ChevronRight className="w-5 h-5 text-muted-foreground group-open:rotate-90 transition-transform flex-shrink-0" />
                </summary>
                <div className="px-5 pb-5 pt-0">
                  <p className="text-muted-foreground">{faq.answer}</p>
                </div>
              </details>
            ))}
          </div>
        </div>

        {/* Contact Support */}
        <div className="premium-card rounded-2xl p-6 mt-8 text-center animate-fade-in" style={{ animationDelay: "0.25s" }}>
          <MessageCircle className="w-8 h-8 text-primary mx-auto mb-3" />
          <h3 className="font-medium text-foreground mb-2">Still need help?</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Our support team is here to assist you.
          </p>
          <Button className="rounded-xl bg-primary text-primary-foreground">
            Contact Support
          </Button>
        </div>
      </div>
    </AppLayout>
  );
}
