import { ReactNode } from "react";
import { AppSidebar } from "./AppSidebar";
import { BottomNav } from "./BottomNav";
import { SkipToContent } from "./SkipToContent";

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <>
      <SkipToContent />
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <main id="main-content" className="flex-1 overflow-auto pb-20 md:pb-0" role="main" aria-label="Main content">
          {children}
        </main>
        <BottomNav />
      </div>
    </>
  );
}
