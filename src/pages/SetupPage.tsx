import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Settings, Package, Users, Bell, Upload, Check } from "lucide-react";

const setupSteps = [
  {
    title: "Product Catalog",
    description: "Import or connect your products",
    status: "complete" as const,
    action: "Manage",
    count: "127 products",
  },
  {
    title: "Competitor Mapping",
    description: "Link products to competitor listings",
    status: "complete" as const,
    action: "Edit",
    count: "3 competitors",
  },
  {
    title: "Alert Preferences",
    description: "Set notification thresholds",
    status: "incomplete" as const,
    action: "Configure",
    count: "4 rules",
  },
  {
    title: "Team Access",
    description: "Invite team members",
    status: "incomplete" as const,
    action: "Invite",
    count: "1 member",
  },
];

export default function SetupPage() {
  return (
    <AppLayout>
      <div className="min-h-screen p-6 md:p-10 max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Settings className="w-5 h-5 text-primary" />
            </div>
            <h1 className="text-2xl font-semibold text-foreground">Setup & Configuration</h1>
          </div>
          <p className="text-muted-foreground">
            Configure RetailMind AI to match your business.
          </p>
        </div>

        {/* Progress */}
        <div className="premium-card rounded-2xl p-6 mb-8 animate-fade-in" style={{ animationDelay: "0.1s" }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-medium text-foreground">Setup Progress</h2>
            <span className="text-sm text-muted-foreground">2 of 4 complete</span>
          </div>
          <div className="h-2 bg-secondary rounded-full overflow-hidden">
            <div className="h-full w-1/2 bg-primary rounded-full" />
          </div>
        </div>

        {/* Setup Steps */}
        <div className="space-y-4 mb-10 animate-fade-in" style={{ animationDelay: "0.15s" }}>
          {setupSteps.map((step, index) => {
            const icons = {
              "Product Catalog": Package,
              "Competitor Mapping": Users,
              "Alert Preferences": Bell,
              "Team Access": Users,
            };
            const Icon = icons[step.title as keyof typeof icons] || Settings;
            
            return (
              <div key={step.title} className="premium-card rounded-2xl p-5">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${step.status === "complete" ? "bg-success/10" : "bg-secondary"}`}>
                    {step.status === "complete" ? (
                      <Check className="w-5 h-5 text-success" />
                    ) : (
                      <Icon className="w-5 h-5 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-foreground">{step.title}</h3>
                    <p className="text-sm text-muted-foreground">{step.description}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground mb-2">{step.count}</p>
                    <Button variant="outline" size="sm" className="rounded-lg">
                      {step.action}
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bulk Import */}
        <div className="premium-card rounded-2xl p-6 animate-fade-in" style={{ animationDelay: "0.2s" }}>
          <h2 className="font-medium text-foreground mb-2">Bulk Import</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Upload a CSV file to quickly add products or competitor mappings.
          </p>
          <div className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-primary/50 transition-colors cursor-pointer">
            <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
            <p className="text-foreground font-medium mb-1">Drop your CSV here</p>
            <p className="text-sm text-muted-foreground">or click to browse</p>
          </div>
          <div className="mt-4 flex gap-2">
            <Button variant="outline" size="sm" className="rounded-lg">
              Download template
            </Button>
            <Button variant="outline" size="sm" className="rounded-lg">
              View import guide
            </Button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
