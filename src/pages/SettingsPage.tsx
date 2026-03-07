import { useEffect, useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Settings, MessageSquare, Save, CheckCircle, LogOut, User, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiClient } from "@/api/client";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/i18n/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";

export default function SettingsPage() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [whatsappNumber, setWhatsappNumber] = useState(
    localStorage.getItem("whatsapp_number") || ""
  );
  const [saved, setSaved] = useState(false);
  const [sendingTest, setSendingTest] = useState(false);
  const { toast } = useToast();

  const handleLogout = () => {
    logout();
    toast({
      title: 'Logged out',
      description: 'You have been successfully logged out',
    });
    navigate('/login');
  };

  async function handleSendTestMessage() {
    if (!whatsappNumber) {
      toast({
        title: t('setup.invalidFormat'),
        description: t('setup.phoneFormatError'),
        variant: "destructive",
      });
      return;
    }
    if (!whatsappNumber.startsWith('+')) {
      toast({
        title: t('setup.invalidFormat'),
        description: t('setup.phoneFormatError'),
        variant: "destructive",
      });
      return;
    }

    setSendingTest(true);
    try {
      const result = await apiClient.sendWhatsAppMessage(
        whatsappNumber,
        '\u2705 RetailMind AI connected! You will receive price alerts and recommendations on this number.'
      );
      if (result.error) {
        toast({
          title: 'Test Message Failed',
          description: result.error,
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Test Message Sent!',
          description: `Check your WhatsApp on ${whatsappNumber}`,
        });
      }
    } catch {
      toast({
        title: 'WhatsApp Not Configured',
        description: 'The WhatsApp Lambda is not deployed or Twilio credentials are missing. Please deploy the whatsappSender Lambda with Twilio credentials.',
        variant: 'destructive',
      });
    } finally {
      setSendingTest(false);
    }
  }

  function handleSave() {
    if (whatsappNumber && !whatsappNumber.startsWith("+")) {
      toast({
        title: t('setup.invalidFormat'),
        description: t('setup.phoneFormatError'),
        variant: "destructive",
      });
      return;
    }

    localStorage.setItem("whatsapp_number", whatsappNumber);
    setSaved(true);
    
    toast({
      title: t('setup.saved'),
      description: t('setup.settingsSavedDesc'),
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
            <h1 className="text-2xl font-semibold">{t('setup.title')}</h1>
          </div>
          <p className="text-muted-foreground">
            {t('setup.subtitle')}
          </p>
        </div>

        <div className="space-y-6">
          {/* Account Information */}
          <Card className="premium-card rounded-2xl p-6 animate-fade-in">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <User className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-semibold mb-1">Account</h2>
                <p className="text-sm text-muted-foreground">
                  Manage your account settings and preferences
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-muted-foreground">Email</Label>
                  <p className="text-sm font-medium mt-1">{user?.email || 'Not available'}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Shop Name</Label>
                  <p className="text-sm font-medium mt-1">{user?.shopName || 'Not set'}</p>
                </div>
              </div>

              <div className="pt-4 border-t">
                <Button onClick={handleLogout} variant="outline" className="gap-2">
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </Button>
              </div>
            </div>
          </Card>

          {/* WhatsApp Integration */}
          <Card className="premium-card rounded-2xl p-6 animate-fade-in" style={{ animationDelay: "0.1s" }}>
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center flex-shrink-0">
                <MessageSquare className="w-6 h-6 text-green-600" />
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-semibold mb-1">{t('setup.whatsappNotifications')}</h2>
                <p className="text-sm text-muted-foreground">
                  {t('setup.whatsappNotificationDesc')}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="whatsapp">{t('setup.whatsappNumber')}</Label>
                <Input
                  id="whatsapp"
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={whatsappNumber}
                  onChange={(e) => setWhatsappNumber(e.target.value)}
                  className="mt-1.5"
                />
                <p className="text-xs text-muted-foreground mt-1.5">
                  {t('setup.includeCountryCode')}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <Button onClick={handleSave} className="gap-2">
                  {saved ? (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      {t('setup.saved')}
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      {t('setup.saveSettings')}
                    </>
                  )}
                </Button>

                {whatsappNumber && (
                  <Button onClick={handleSendTestMessage} disabled={sendingTest} variant="outline" className="gap-2">
                    <Send className="w-4 h-4" />
                    {sendingTest ? 'Sending...' : 'Send Test Message'}
                  </Button>
                )}
                
                {whatsappNumber && (
                  <span className="text-sm text-muted-foreground">
                    {t('setup.alertsWillBeSent')}
                  </span>
                )}
              </div>
            </div>

            <div className="mt-6 p-4 bg-muted/50 rounded-lg">
              <p className="text-sm text-muted-foreground">
                <strong className="text-foreground">Note:</strong> {t('setup.noteWhatsappIntegration')}
              </p>
            </div>
          </Card>

          {/* Future Settings Sections */}
          <Card className="premium-card rounded-2xl p-6 opacity-60 animate-fade-in" style={{ animationDelay: "0.2s" }}>
            <h2 className="text-lg font-semibold mb-2">{t('setup.notificationPreferences')}</h2>
            <p className="text-sm text-muted-foreground">
              {t('setup.customizeAlerts')}
            </p>
          </Card>

          <Card className="premium-card rounded-2xl p-6 opacity-60 animate-fade-in" style={{ animationDelay: "0.3s" }}>
            <h2 className="text-lg font-semibold mb-2">{t('setup.dataPrivacy')}</h2>
            <p className="text-sm text-muted-foreground">
              {t('setup.manageData')}
            </p>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
