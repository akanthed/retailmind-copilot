import { AppLayout } from "@/components/layout/AppLayout";
import { HelpCircle, Book, Video, Mail, Phone, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const faqs = [
  {
    question: "How do I get started?",
    answer: "Just add a product with name, price, and stock. AI does the rest automatically - finds competitor prices and creates recommendations."
  },
  {
    question: "What should I ask the AI?",
    answer: "Ask simple questions like: 'Should I lower my price?', 'Which products sell best?', 'What needs attention today?'. AI understands plain English."
  },
  {
    question: "How do I know if a recommendation is good?",
    answer: "Each recommendation shows confidence (like 92%). Higher = more confident. AI also explains why it's suggesting this action."
  },
  {
    question: "What do the alerts mean?",
    answer: "Alerts notify you of important changes. Check your To-Do List daily - AI prioritizes what matters most."
  },
  {
    question: "How often should I check?",
    answer: "Once daily (5 minutes). AI monitors 24/7 and shows you only what needs your attention."
  },
  {
    question: "Is my data safe?",
    answer: "Yes. All data is encrypted and stored securely on AWS. We never share your information."
  },
  {
    question: "How much does it cost?",
    answer: "Less than ₹50/month - about one cup of coffee. No hidden fees, cancel anytime."
  }
];

const quickGuides = [
  {
    title: "Your First Day",
    steps: [
      "1. Add a product (just 3 fields!)",
      "2. AI finds competitor prices automatically",
      "3. Review your first recommendation",
      "4. That's it - you're set up!"
    ]
  },
  {
    title: "Daily Routine (5 minutes)",
    steps: [
      "1. Open Dashboard",
      "2. Check To-Do List",
      "3. Take 1-2 actions",
      "4. Done for the day!"
    ]
  },
  {
    title: "Understanding Recommendations",
    steps: [
      "Lower Price = Match competitors",
      "Raise Price = You have advantage",
      "Restock = Order more soon",
      "Confidence = How sure AI is"
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
