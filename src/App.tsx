import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Analytics } from "@vercel/analytics/react";
import { KeyboardShortcuts } from "@/components/ui/KeyboardShortcuts";
import { LanguageProvider } from "@/i18n/LanguageContext";
import Landing from "./pages/Landing";
import OnboardingWizard from "./pages/OnboardingWizard";
import DashboardPage from "./pages/DashboardPage";
import ProductsPage from "./pages/ProductsPage";
import PriceComparisonPage from "./pages/PriceComparisonPage";
import ActionsPage from "./pages/ActionsPage";
import DecisionDetailPage from "./pages/DecisionDetailPage";
import AlertsPage from "./pages/AlertsPage";
import ForecastPage from "./pages/ForecastPage";
import HelpPage from "./pages/HelpPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Protected route wrapper
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const hasCompletedOnboarding = localStorage.getItem("hasCompletedOnboarding");
  
  if (!hasCompletedOnboarding) {
    return <Navigate to="/onboarding" replace />;
  }
  
  return <>{children}</>;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <Analytics />
        <BrowserRouter>
          <KeyboardShortcuts />
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/onboarding" element={<OnboardingWizard />} />
            <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
            <Route path="/products" element={<ProtectedRoute><ProductsPage /></ProtectedRoute>} />
            <Route path="/products/:productId/compare" element={<ProtectedRoute><PriceComparisonPage /></ProtectedRoute>} />
            <Route path="/actions" element={<ProtectedRoute><ActionsPage /></ProtectedRoute>} />
            <Route path="/decisions/:id" element={<ProtectedRoute><DecisionDetailPage /></ProtectedRoute>} />
            <Route path="/alerts" element={<ProtectedRoute><AlertsPage /></ProtectedRoute>} />
            <Route path="/forecast" element={<ProtectedRoute><ForecastPage /></ProtectedRoute>} />
            <Route path="/help" element={<ProtectedRoute><HelpPage /></ProtectedRoute>} />
            
            {/* Legacy routes - redirect to new names */}
            <Route path="/command-center" element={<Navigate to="/dashboard" replace />} />
            <Route path="/decisions" element={<Navigate to="/actions" replace />} />
            
            {/* Catch-all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;
