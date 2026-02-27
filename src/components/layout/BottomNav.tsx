import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Home, Package, CheckSquare, HelpCircle } from "lucide-react";

const navItems = [
  {
    title: "Dashboard",
    icon: Home,
    href: "/dashboard",
  },
  {
    title: "Products",
    icon: Package,
    href: "/products",
  },
  {
    title: "To-Do",
    icon: CheckSquare,
    href: "/actions",
  },
  {
    title: "Help",
    icon: HelpCircle,
    href: "/help",
  },
];

export function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-background border-t border-border z-50 md:hidden">
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
                <item.icon className={cn("w-5 h-5", isActive && "text-primary")} />
                <span className="text-xs font-medium">{item.title}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
