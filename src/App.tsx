import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import CopilotPage from "./pages/CopilotPage";
import DecisionsPage from "./pages/DecisionsPage";
import DecisionDetailPage from "./pages/DecisionDetailPage";
import InsightsPage from "./pages/InsightsPage";
import AlertsPage from "./pages/AlertsPage";
import OutcomesPage from "./pages/OutcomesPage";
import ReportsPage from "./pages/ReportsPage";
import SetupPage from "./pages/SetupPage";
import HelpPage from "./pages/HelpPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/copilot" element={<CopilotPage />} />
          <Route path="/decisions" element={<DecisionsPage />} />
          <Route path="/decisions/:id" element={<DecisionDetailPage />} />
          <Route path="/insights" element={<InsightsPage />} />
          <Route path="/alerts" element={<AlertsPage />} />
          <Route path="/outcomes" element={<OutcomesPage />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/setup" element={<SetupPage />} />
          <Route path="/help" element={<HelpPage />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
