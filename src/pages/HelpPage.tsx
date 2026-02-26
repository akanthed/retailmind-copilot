import { AppLayout } from "@/components/layout/AppLayout";
import { HelpCircle, Book, Video, Mail, Phone, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const faqs = [
  {
    question: "How do I get started?",
    answer: "Simply navigate to the Command Center and ask a question like 'What products need attention?' The AI will guide you from there. No technical knowledge needed!"
  },
  {
    question: "What should I ask the AI?",
    answer: "Ask natural questions like: 'Should I lower my price?', 'Which products are selling fast?', 'What inventory should I reorder?'. The AI understands plain English."
  },
  {
    question: "How do I know if a recommendation is good?",
    answer: "Each recommendation shows a confidence score (like 92%) and explains the reasoning. Higher scores mean more confident suggestions. You can always ask the AI 'Why?' for more details."
  },
  {
    question: "What do the alerts mean?",
    answer: "Alerts notify you of important changes: Red (urgent - act today), Yellow (important - review soon), Green (opportunity - consider this). Each alert includes what to do next."
  },
  {
    question: "How often should I check the system?",
    answer: "Check once daily in the morning. The AI monitors everything 24/7 and will alert you to urgent matters. Spend 10-15 minutes reviewing recommendations."
  },
  {
    question: "Can I undo a decision?",
    answer: "Yes! Go to Outcomes page to see all your decisions. While you can't undo in the system, you can manually adjust prices back in your store and the AI will track the new changes."
  },
  {
    question: "Is my data safe?",
    answer: "Yes. All data is encrypted and stored securely on AWS. We never share your business information with competitors or third parties."
  },
  {
    question: "How much does it cost?",
    answer: "RetailMind AI costs less than ₹50/month - about the price of one cup of coffee per day. No hidden fees, cancel anytime."
  }
];

const quickGuides = [
  {
    title: "Your First Day",
    steps: [
      "1. Go to Command Center",
      "2. Ask: 'What products need attention?'",
      "3. Review the AI's suggestions",
      "4. Click 'Generate Recommendations'",
      "5. Implement one recommendation to start"
    ]
  },
  {
    title: "Daily Routine (10 minutes)",
    steps: [
      "1. Check Alerts for urgent items",
      "2. Review new Recommendations",
      "3. Implement 1-2 actions",
      "4. Ask AI any questions",
      "5. Check Outcomes to see impact"
    ]
  },
  {
    title: "Understanding Recommendations",
    steps: [
      "Price Down = Lower price to match competitors",
      "Price Up = Raise price (you have advantage)",
      "Restock = Order more inventory soon",
      "Promotion = Run sale to clear old stock"
    ]
  }
];

export default function HelpPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <AppLayout>
      <div className="min-h-screen p-6 md:p-10 max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <HelpCircle className="w-5 h-5 text-primary" />
            </div>
            <h1 className="text-2xl font-semibold text-foreground">Help & Support</h1>
          </div>
          <p className="text-muted-foreground">
            Simple guides to help you succeed with RetailMind AI
          </p>
        </div>

        {/* Quick Start Guides */}
        <div className="mb-10 animate-fade-in" style={{ animationDelay: "0.1s" }}>
          <h2 className="text-lg font-medium text-foreground mb-4">Quick Start Guides</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {quickGuides.map((guide) => (
              <div key={guide.title} className="premium-card rounded-2xl p-5">
                <Book className="w-6 h-6 text-primary mb-3" />
                <h3 className="font-medium text-foreground mb-3">{guide.title}</h3>
                <div className="space-y-2">
                  {guide.steps.map((step, idx) => (
                    <p key={idx} className="text-sm text-muted-foreground leading-relaxed">
                      {step}
                    </p>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Video Tutorial */}
        <div className="premium-card rounded-2xl p-6 mb-10 animate-fade-in" style={{ animationDelay: "0.15s" }}>
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Video className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-foreground mb-2">Watch: 5-Minute Tutorial</h3>
              <p className="text-sm text-muted-foreground mb-4">
                See how a real retailer uses RetailMind AI to make better pricing decisions
              </p>
              <Button className="rounded-xl bg-primary text-primary-foreground">
                Watch Tutorial
              </Button>
            </div>
          </div>
        </div>

        {/* FAQ */}
        <div className="mb-10 animate-fade-in" style={{ animationDelay: "0.2s" }}>
          <h2 className="text-lg font-medium text-foreground mb-4">Common Questions</h2>
          <div className="space-y-3">
            {faqs.map((faq, index) => (
              <div key={index} className="premium-card rounded-2xl overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="w-full p-5 text-left flex items-center justify-between hover:bg-accent/30 transition-colors"
                >
                  <span className="font-medium text-foreground pr-4">{faq.question}</span>
                  <ChevronRight 
                    className={`w-5 h-5 text-muted-foreground transition-transform flex-shrink-0 ${
                      openFaq === index ? 'rotate-90' : ''
                    }`} 
                  />
                </button>
                {openFaq === index && (
                  <div className="px-5 pb-5">
                    <p className="text-muted-foreground leading-relaxed">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Contact Support */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in" style={{ animationDelay: "0.25s" }}>
          <div className="premium-card rounded-2xl p-6 text-center">
            <Mail className="w-8 h-8 text-primary mx-auto mb-3" />
            <h3 className="font-medium text-foreground mb-2">Email Support</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Get help within 24 hours
            </p>
            <Button variant="outline" className="rounded-xl">
              support@retailmind.ai
            </Button>
          </div>
          <div className="premium-card rounded-2xl p-6 text-center">
            <Phone className="w-8 h-8 text-primary mx-auto mb-3" />
            <h3 className="font-medium text-foreground mb-2">Phone Support</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Mon-Fri, 9 AM - 6 PM IST
            </p>
            <Button variant="outline" className="rounded-xl">
              +91-XXXX-XXXXXX
            </Button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
