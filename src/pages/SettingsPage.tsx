import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Settings, MessageSquare, Save, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function SettingsPage() {
  const [whatsappNumber, setWhatsappNumber] = useState(
    localStorage.getItem("whatsapp_number") || ""
  );
  const [saved, setSaved] = useState(false);
  const { toast } = useToast();

  function handleSave() {
    if (whatsappNumber && !whatsappNumber.startsWith("+")) {
      toast({
        title: "Invalid Format",
        description: "Phone number must start with country code (e.g., +91)",
        variant: "destructive",
      });
      return;
    }

    localStorage.setItem("whatsapp_number", whatsappNumber);
    setSaved(true);
    
    toast({
      title: "Settings Saved",
      description: "Your WhatsApp number has been saved successfully",
    });

    setTimeout(() => setSaved(false), 3000);
  }

  return (
    <AppLayout>
      <div className="min-h-screen p-6 md:p-10 max-w-4xl mx-auto">
        <div className="mb-8 animate-fade-in">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Settings className="w-5 h-5 text-primary" />
            </div>
            <h1 className="text-2xl font-semibold">Settings</h1>
          </div>
          <p className="text-muted-foreground">
            Configure your RetailMind AI preferences
          </p>
        </div>

        <div className="space-y-6">
          {/* WhatsApp Integration */}
          <Card className="premium-card rounded-2xl p-6 animate-fade-in" style={{ animationDelay: "0.1s" }}>
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center flex-shrink-0">
                <MessageSquare className="w-6 h-6 text-green-600" />
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-semibold mb-1">WhatsApp Notifications</h2>
                <p className="text-sm text-muted-foreground">
                  Receive alerts and recommendations directly on WhatsApp
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="whatsapp">WhatsApp Number</Label>
                <Input
                  id="whatsapp"
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={whatsappNumber}
                  onChange={(e) => setWhatsappNumber(e.target.value)}
                  className="mt-1.5"
                />
                <p className="text-xs text-muted-foreground mt-1.5">
                  Include country code (e.g., +91 for India)
                </p>
              </div>

              <div className="flex items-center gap-3">
                <Button onClick={handleSave} className="gap-2">
                  {saved ? (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      Saved
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Save Settings
                    </>
                  )}
                </Button>
                
                {whatsappNumber && (
                  <span className="text-sm text-muted-foreground">
                    Alerts will be sent to this number
                  </span>
                )}
              </div>
            </div>

            <div className="mt-6 p-4 bg-muted/50 rounded-lg">
              <p className="text-sm text-muted-foreground">
                <strong className="text-foreground">Note:</strong> WhatsApp integration requires backend configuration. 
                Contact your administrator to enable this feature.
              </p>
            </div>
          </Card>

          {/* Future Settings Sections */}
          <Card className="premium-card rounded-2xl p-6 opacity-60 animate-fade-in" style={{ animationDelay: "0.2s" }}>
            <h2 className="text-lg font-semibold mb-2">Notification Preferences</h2>
            <p className="text-sm text-muted-foreground">
              Coming soon: Customize which alerts you receive and when
            </p>
          </Card>

          <Card className="premium-card rounded-2xl p-6 opacity-60 animate-fade-in" style={{ animationDelay: "0.3s" }}>
            <h2 className="text-lg font-semibold mb-2">Data & Privacy</h2>
            <p className="text-sm text-muted-foreground">
              Coming soon: Manage your data and privacy settings
            </p>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
