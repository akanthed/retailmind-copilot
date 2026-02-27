import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/i18n/LanguageContext";
import { Home, Package, CheckSquare, HelpCircle } from "lucide-react";

export function BottomNav() {
  const { t } = useLanguage();
  
  const navItems = [
    {
      title: t('nav.dashboard'),
      icon: Home,
      href: "/dashboard",
    },
    {
      title: t('nav.products'),
      icon: Package,
      href: "/products",
    },
    {
      title: t('nav.actions'),
      icon: CheckSquare,
      href: "/actions",
    },
    {
      title: t('nav.help'),
      icon: HelpCircle,
      href: "/help",
    },
  ];
  return (
    <nav 
      className="fixed bottom-0 left-0 right-0 bg-background border-t border-border z-50 md:hidden"
      aria-label="Mobile navigation"
    >
      <div className="flex justify-around items-center h-16 px-2">
        {navItems.map((item) => (
          <NavLink
            key={item.href}
            to={item.href}
            className={({ isActive }) =>
              cn(
                "flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-lg transition-colors min-w-[60px]",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground"
              )
            }
          >
            {({ isActive }) => (
              <>
                <item.icon 
                  className={cn("w-5 h-5", isActive && "text-primary")} 
                  aria-hidden="true"
                />
                <span className="text-xs font-medium">{item.title}</span>
                {isActive && <span className="sr-only">(current page)</span>}
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
