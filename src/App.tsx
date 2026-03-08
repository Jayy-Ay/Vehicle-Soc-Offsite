import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { UserProvider } from "./lib/auth/UserContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Alerts from "./pages/Alerts";
import Fleet from "./pages/Fleet";
import TEESecurity from "./pages/TEESecurity";
import Analytics from "./pages/Analytics";
import ActivityMonitor from "./pages/ActivityMonitor";
import Settings from "./pages/Settings";
import Login from "./components/Login";
import AIModelMonitoring from "./pages/AIModelMonitoring";
import { GlobalAnomalyRuntime } from "./components/GlobalAnomalyRuntime";

const queryClient = new QueryClient();

const App = () => (
  <UserProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner position="bottom-right" />
        <GlobalAnomalyRuntime />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/alerts" element={<Alerts />} />
            <Route path="/fleet" element={<Fleet />} />
            <Route path="/tee" element={<TEESecurity />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/activity" element={<ActivityMonitor />} />
            <Route
              path="/ai-model-updates"
              element={
                <ProtectedRoute allowedRoles={["administrator", "ml_engineer"]}>
                  <AIModelMonitoring />
                </ProtectedRoute>
              }
            />
            <Route path="/settings" element={<Settings />} />
            <Route path="/login" element={<Login />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </UserProvider>
);

export default App;
