import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import PaymentSuccess from "./pages/PaymentSuccess";
import SaveMoney from "./pages/SaveMoney";
import ProtectYourself from "./pages/ProtectYourself";
import RecentReports from "./pages/RecentReports";
import ThreatFeeds from "./pages/ThreatFeeds";
import Terms from "./pages/Terms";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/save-money" element={<SaveMoney />} />
          <Route path="/protect-yourself" element={<ProtectYourself />} />
          <Route path="/payment-success" element={<PaymentSuccess />} />
          <Route path="/recent-reports" element={<RecentReports />} />
          <Route path="/threat-feeds" element={<ThreatFeeds />} />
          <Route path="/terms" element={<Terms />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
