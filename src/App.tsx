import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CookieConsent } from "@/components/CookieConsent";

// Eagerly load the main page for fast initial render
import Index from "./pages/Index";

// Lazy load secondary pages for code splitting
const PaymentSuccess = lazy(() => import("./pages/PaymentSuccess"));
const Privacy = lazy(() => import("./pages/Privacy"));
const Disclosure = lazy(() => import("./pages/Disclosure"));
const Disclaimer = lazy(() => import("./pages/Disclaimer"));
const SaveMoney = lazy(() => import("./pages/SaveMoney"));
const ProtectYourself = lazy(() => import("./pages/ProtectYourself"));
const RecentReports = lazy(() => import("./pages/RecentReports"));
const ThreatFeeds = lazy(() => import("./pages/ThreatFeeds"));
const Terms = lazy(() => import("./pages/Terms"));
const WebsiteChecker = lazy(() => import("./pages/WebsiteChecker"));
const About = lazy(() => import("./pages/About"));
const NotFound = lazy(() => import("./pages/NotFound"));

// Minimal loading fallback
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
  </div>
);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider delayDuration={300}>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/website-checker" element={<WebsiteChecker />} />
            <Route path="/threats-feed" element={<ThreatFeeds />} />
            <Route path="/save-money" element={<SaveMoney />} />
            <Route path="/protect-yourself" element={<ProtectYourself />} />
            <Route path="/about" element={<About />} />
            <Route path="/payment-success" element={<PaymentSuccess />} />
            <Route path="/recent-reports" element={<RecentReports />} />
            <Route path="/threat-feeds" element={<ThreatFeeds />} /> {/* Legacy route redirect */}
            <Route path="/terms" element={<Terms />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/disclosure" element={<Disclosure />} />
            <Route path="/disclaimer" element={<Disclaimer />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
        <CookieConsent />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
