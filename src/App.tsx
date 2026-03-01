import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Analytics } from "@vercel/analytics/react";
import { KeyboardShortcuts } from "@/components/ui/KeyboardShortcuts";
import { LanguageProvider } from "@/i18n/LanguageContext";
import { OfflineBanner } from "@/components/ui/OfflineBanner";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Landing from "./pages/Landing";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
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
import InsightsPage from "./pages/InsightsPage";
import OutcomesPage from "./pages/OutcomesPage";
import ReportsPage from "./pages/ReportsPage";
import SetupPage from "./pages/SetupPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <LanguageProvider>
        <TooltipProvider>
          <OfflineBanner />
          <Toaster />
          <Sonner />
          <Analytics />
          <BrowserRouter>
            <KeyboardShortcuts />
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<Landing />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
              
              {/* Protected routes */}
              <Route path="/onboarding" element={<ProtectedRoute><OnboardingPage /></ProtectedRoute>} />
              <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
              <Route path="/products" element={<ProtectedRoute><ProductsPage /></ProtectedRoute>} />
              <Route path="/products/:productId/compare" element={<ProtectedRoute><PriceComparisonPage /></ProtectedRoute>} />
              <Route path="/actions" element={<ProtectedRoute><ActionsPage /></ProtectedRoute>} />
              <Route path="/decisions/:id" element={<ProtectedRoute><DecisionDetailPage /></ProtectedRoute>} />
              <Route path="/alerts" element={<ProtectedRoute><AlertsPage /></ProtectedRoute>} />
              <Route path="/forecast" element={<ProtectedRoute><ForecastPage /></ProtectedRoute>} />
              <Route path="/insights" element={<ProtectedRoute><InsightsPage /></ProtectedRoute>} />
              <Route path="/outcomes" element={<ProtectedRoute><OutcomesPage /></ProtectedRoute>} />
              <Route path="/reports" element={<ProtectedRoute><ReportsPage /></ProtectedRoute>} />
              <Route path="/setup" element={<ProtectedRoute><SetupPage /></ProtectedRoute>} />
              <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
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
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
