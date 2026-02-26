import { ReactNode } from "react";
import { AppSidebar } from "./AppSidebar";
import { AppHeader } from "./AppHeader";

interface AppLayoutProps {
  children: ReactNode;
  showHeader?: boolean;
  headerTitle?: string;
  showSearch?: boolean;
}

export function AppLayout({ 
  children, 
  showHeader = true,
  headerTitle,
  showSearch = false 
}: AppLayoutProps) {
  return (
    <div className="flex min-h-screen w-full">
      <AppSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        {showHeader && (
          <AppHeader title={headerTitle} showSearch={showSearch} />
        )}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
