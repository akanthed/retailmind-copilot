import { WifiOff } from "lucide-react";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import { useLanguage } from "@/i18n/LanguageContext";

export function OfflineBanner() {
  const isOnline = useOnlineStatus();
  const { t } = useLanguage();

  if (isOnline) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-destructive text-white py-2 px-4 text-center text-sm font-medium animate-slide-in-bottom">
      <div className="flex items-center justify-center gap-2">
        <WifiOff className="w-4 h-4" />
        <span>{t('common.offlineNotice')}</span>
      </div>
    </div>
  );
}
