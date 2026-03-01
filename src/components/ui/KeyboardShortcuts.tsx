import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Command } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useLanguage } from "@/i18n/LanguageContext";

export function KeyboardShortcuts() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLanguage();

  const shortcuts = [
    { key: "?", description: t('common.keyboard.show') },
    { key: "Alt + D", description: t('common.keyboard.dashboard') },
    { key: "Alt + P", description: t('common.keyboard.products') },
    { key: "Alt + A", description: t('common.keyboard.actions') },
    { key: "Alt + H", description: t('common.keyboard.help') },
    { key: "Esc", description: t('common.keyboard.close') },
    { key: "Tab", description: t('common.keyboard.forward') },
    { key: "Shift + Tab", description: t('common.keyboard.backward') },
    { key: "Enter / Space", description: t('common.keyboard.activate') },
  ];

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isTyping = target.tagName === "INPUT" || target.tagName === "TEXTAREA";

      // Show shortcuts dialog with ?
      if (e.key === "?" && !e.ctrlKey && !e.metaKey && !e.altKey && !isTyping) {
        e.preventDefault();
        setOpen(true);
        return;
      }

      // Navigation shortcuts (Alt + key)
      if (e.altKey && !e.ctrlKey && !e.metaKey && !isTyping) {
        switch (e.key.toLowerCase()) {
          case "d":
            e.preventDefault();
            if (location.pathname !== "/dashboard") navigate("/dashboard");
            break;
          case "p":
            e.preventDefault();
            if (location.pathname !== "/products") navigate("/products");
            break;
          case "a":
            e.preventDefault();
            if (location.pathname !== "/actions") navigate("/actions");
            break;
          case "h":
            e.preventDefault();
            if (location.pathname !== "/help") navigate("/help");
            break;
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [navigate, location]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-md" aria-describedby="keyboard-shortcuts-description">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Command className="w-5 h-5" />
            {t('common.keyboard.title')}
          </DialogTitle>
        </DialogHeader>
        <div id="keyboard-shortcuts-description" className="space-y-3">
          {shortcuts.map((shortcut) => (
            <div key={shortcut.key} className="flex items-center justify-between py-2 border-b border-border last:border-0">
              <span className="text-sm text-muted-foreground">{shortcut.description}</span>
              <kbd className="px-2 py-1 text-xs font-semibold text-foreground bg-muted border border-border rounded">
                {shortcut.key}
              </kbd>
            </div>
          ))}
        </div>
        <p className="text-xs text-muted-foreground mt-4">
          {t('common.keyboard.pressHelpPrefix')} <kbd className="px-1 py-0.5 text-xs bg-muted border border-border rounded">?</kbd> {t('common.keyboard.pressHelpSuffix')}
        </p>
      </DialogContent>
    </Dialog>
  );
}
