import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Alerts from "./pages/Alerts";
import Fleet from "./pages/Fleet";
import TEESecurity from "./pages/TEESecurity";
import Analytics from "./pages/Analytics";
import ActivityMonitor from "./pages/ActivityMonitor";
import Settings from "./pages/Settings";
import Login from "./components/Login";
import { AuthProvider } from "./lib/auth/AuthProvider";
import { ProtectedRoute } from "./components/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route element={<ProtectedRoute />}>
              <Route path="/" element={<Index />} />
              <Route path="/alerts" element={<Alerts />} />
              <Route path="/fleet" element={<Fleet />} />
              <Route path="/tee" element={<TEESecurity />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/activity" element={<ActivityMonitor />} />
              <Route
                path="/settings"
                element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <Settings />
                  </ProtectedRoute>
                }
              />
            </Route>
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
