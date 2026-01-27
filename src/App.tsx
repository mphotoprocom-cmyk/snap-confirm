import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import NewBooking from "./pages/NewBooking";
import BookingDetail from "./pages/BookingDetail";
import Settings from "./pages/Settings";
import AdminUsers from "./pages/AdminUsers";
import Packages from "./pages/Packages";
import Quotations from "./pages/Quotations";
import NewQuotation from "./pages/NewQuotation";
import QuotationDetail from "./pages/QuotationDetail";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/bookings/new" element={<NewBooking />} />
            <Route path="/bookings/:id" element={<BookingDetail />} />
            <Route path="/packages" element={<Packages />} />
            <Route path="/quotations" element={<Quotations />} />
            <Route path="/quotations/new" element={<NewQuotation />} />
            <Route path="/quotations/:id" element={<QuotationDetail />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/admin/users" element={<AdminUsers />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
