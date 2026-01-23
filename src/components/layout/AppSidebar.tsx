import { NavLink, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/ui/Logo";
import {
  Sparkles,
  FileText,
  BarChart3,
  Bell,
  Target,
  FileDown,
  Settings,
  HelpCircle,
  ChevronLeft,
} from "lucide-react";
import { useState } from "react";

const navItems = [
  {
    title: "Command Center",
    icon: Sparkles,
    href: "/command-center",
    description: "AI recommendations",
  },
  {
    title: "Decisions",
    icon: FileText,
    href: "/decisions",
    description: "Review actions",
  },
  {
    title: "Insights",
    icon: BarChart3,
    href: "/insights",
    description: "Market evidence",
  },
  {
    title: "Alerts",
    icon: Bell,
    href: "/alerts",
    description: "Signals & risks",
  },
  {
    title: "Outcomes",
    icon: Target,
    href: "/outcomes",
    description: "Track results",
  },
  {
    title: "Reports",
    icon: FileDown,
    href: "/reports",
    description: "Export & share",
  },
];

const bottomItems = [
  {
    title: "Setup",
    icon: Settings,
    href: "/setup",
  },
  {
    title: "Help",
    icon: HelpCircle,
    href: "/help",
  },
];

export function AppSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  return (
    <aside
      className={cn(
        "h-screen flex flex-col border-r border-sidebar-border bg-sidebar transition-all duration-300 ease-in-out",
        collapsed ? "w-20" : "w-64"
      )}
    >
      {/* Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-sidebar-border">
        <Logo size="sm" showText={!collapsed} />
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-2 rounded-lg hover:bg-sidebar-accent transition-colors"
        >
          <ChevronLeft
            className={cn(
              "w-4 h-4 text-sidebar-foreground/60 transition-transform duration-300",
              collapsed && "rotate-180"
            )}
          />
        </button>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
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
            >
              <item.icon
                className={cn(
                  "w-5 h-5 flex-shrink-0 transition-colors",
                  isActive ? "text-sidebar-primary" : "text-sidebar-foreground/70 group-hover:text-sidebar-foreground"
                )}
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
            </NavLink>
          );
        })}
      </nav>

      {/* Bottom Navigation */}
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
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {!collapsed && <span>{item.title}</span>}
            </NavLink>
          );
        })}
      </div>
    </aside>
  );
}
