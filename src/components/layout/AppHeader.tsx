// App header with notifications and user menu
import { NotificationCenter } from "@/components/ui/NotificationCenter";
import { Button } from "@/components/ui/button";
import { Search, User } from "lucide-react";
import { useState } from "react";

interface AppHeaderProps {
  title?: string;
  showSearch?: boolean;
}

export function AppHeader({ title, showSearch = false }: AppHeaderProps) {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <header className="h-16 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="h-full px-6 flex items-center justify-between gap-4">
        {/* Left side - Title or Search */}
        <div className="flex-1 flex items-center gap-4">
          {title && (
            <h1 className="text-lg font-semibold text-foreground">{title}</h1>
          )}
          
          {showSearch && (
            <div className="max-w-md w-full">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search products, alerts, recommendations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>
          )}
        </div>

        {/* Right side - Actions */}
        <div className="flex items-center gap-2">
          <NotificationCenter />
          
          <Button variant="ghost" size="icon" className="rounded-xl">
            <User className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </header>
  );
}
