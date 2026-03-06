import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import { useCreditStore } from "@/store/creditStore";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Index from "./pages/Index";
import PracticePage from "./pages/Practice";
import FeedbackPage from "./pages/Feedback";
import ProgressPage from "./pages/Progress";
import FindClubsPage from "./pages/FindClubs";
import UpgradePage from "./pages/Upgrade";
import AboutPage from "./pages/About";
import PrivacyPage from "./pages/Privacy";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const AppLayout = ({ children }: { children: React.ReactNode }) => {
  const { initCredits } = useCreditStore();
  useEffect(() => { initCredits(); }, [initCredits]);
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppLayout>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/practice" element={<PracticePage />} />
            <Route path="/feedback" element={<FeedbackPage />} />
            <Route path="/progress" element={<ProgressPage />} />
            <Route path="/find-clubs" element={<FindClubsPage />} />
            <Route path="/upgrade" element={<UpgradePage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/privacy" element={<PrivacyPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AppLayout>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
