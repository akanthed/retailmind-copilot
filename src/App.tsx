import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Analytics } from "@vercel/analytics/react";
import { KeyboardShortcuts } from "@/components/ui/KeyboardShortcuts";
import { LanguageProvider } from "@/i18n/LanguageContext";
import { OfflineBanner } from "@/components/ui/OfflineBanner";
import Landing from "./pages/Landing";
import OnboardingPage from "./pages/OnboardingPage";
import DashboardPage from "./pages/DashboardPage";
import ProductsPage from "./pages/ProductsPage";
import PriceComparisonPage from "./pages/PriceComparisonPage";
import ActionsPage from "./pages/ActionsPage";
import DecisionDetailPage from "./pages/DecisionDetailPage";
import AlertsPage from "./pages/AlertsPage";
import ForecastPage from "./pages/ForecastPage";
import HelpPage from "./pages/HelpPage";
import SettingsPage from "./pages/SettingsPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <TooltipProvider>
        <OfflineBanner />
        <Toaster />
        <Sonner />
        <Analytics />
        <BrowserRouter>
          <KeyboardShortcuts />
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/onboarding" element={<OnboardingPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/products/:productId/compare" element={<PriceComparisonPage />} />
            <Route path="/actions" element={<ActionsPage />} />
            <Route path="/decisions/:id" element={<DecisionDetailPage />} />
            <Route path="/alerts" element={<AlertsPage />} />
            <Route path="/forecast" element={<ForecastPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/help" element={<HelpPage />} />
            
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
