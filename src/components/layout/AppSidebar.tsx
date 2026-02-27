import { NavLink, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/ui/Logo";
import { LanguageSwitcher } from "@/components/ui/LanguageSwitcher";
import { useLanguage } from "@/i18n/LanguageContext";
import {
  Home,
  Package,
  CheckSquare,
  HelpCircle,
  ChevronLeft,
} from "lucide-react";
import { useState } from "react";

const bottomItems: any[] = [];

export function AppSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const { t } = useLanguage();

  const navItems = [
    {
      title: t('nav.dashboard'),
      icon: Home,
      href: "/dashboard",
      description: t('nav.dashboardDesc'),
    },
    {
      title: t('nav.products'),
      icon: Package,
      href: "/products",
      description: t('nav.productsDesc'),
    },
    {
      title: t('nav.actions'),
      icon: CheckSquare,
      href: "/actions",
      description: t('nav.actionsDesc'),
    },
    {
      title: t('nav.help'),
      icon: HelpCircle,
      href: "/help",
      description: t('nav.helpDesc'),
    },
  ];

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 h-screen flex-col border-r border-sidebar-border bg-sidebar transition-all duration-300 ease-in-out hidden md:flex z-40",
        collapsed ? "w-20" : "w-64"
      )}
      aria-label="Main navigation"
    >
      {/* Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-sidebar-border">
        <Logo size="sm" showText={!collapsed} />
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-2 rounded-lg hover:bg-sidebar-accent transition-colors"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          aria-expanded={!collapsed}
        >
          <ChevronLeft
            className={cn(
              "w-4 h-4 text-sidebar-foreground/60 transition-transform duration-300",
              collapsed && "rotate-180"
            )}
            aria-hidden="true"
          />
        </button>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto" aria-label="Primary navigation">
        {navItems.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <NavLink
              key={item.href}
              to={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group",
                isActive
                  ? "bg-sidebar-accent text-sidebar-primary font-medium"
                  : "text-sidebar-foreground hover:bg-sidebar-accent/50"
              )}
              aria-current={isActive ? "page" : undefined}
            >
              <item.icon
                className={cn(
                  "w-5 h-5 flex-shrink-0 transition-colors",
                  isActive ? "text-sidebar-primary" : "text-sidebar-foreground/70 group-hover:text-sidebar-foreground"
                )}
                aria-hidden="true"
              />
              {!collapsed && (
                <div className="flex flex-col min-w-0">
                  <span className="truncate">{item.title}</span>
                  {!isActive && (
                    <span className="text-xs text-sidebar-foreground/50 truncate">
                      {item.description}
                    </span>
                  )}
                </div>
              )}
              {collapsed && <span className="sr-only">{item.title}</span>}
            </NavLink>
          );
        })}
      </nav>

      {/* Bottom Navigation */}
      {bottomItems.length > 0 && (
        <div className="py-4 px-3 border-t border-sidebar-border space-y-1">
          {bottomItems.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <NavLink
                key={item.href}
                to={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-primary font-medium"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                )}
                aria-current={isActive ? "page" : undefined}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
                {!collapsed && <span>{item.title}</span>}
                {collapsed && <span className="sr-only">{item.title}</span>}
              </NavLink>
            );
          })}
        </div>
      )}
      
      {/* Language Switcher */}
      <div className="py-3 px-3 border-t border-sidebar-border">
        {!collapsed ? (
          <LanguageSwitcher />
        ) : (
          <div className="flex justify-center">
            <LanguageSwitcher />
          </div>
        )}
      </div>
    </aside>
  );
}
