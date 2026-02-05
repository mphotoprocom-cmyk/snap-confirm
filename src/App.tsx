import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { ThemeProvider } from "@/hooks/useTheme";
import { AppLayout } from "@/components/AppLayout";
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
import ShareView from "./pages/ShareView";
import PublicPortfolio from "./pages/PublicPortfolio";
import PortfolioManagement from "./pages/PortfolioManagement";
import DeliveryGalleries from "./pages/DeliveryGalleries";
import DeliveryGalleryDetail from "./pages/DeliveryGalleryDetail";
import PublicDeliveryGallery from "./pages/PublicDeliveryGallery";
import WeddingInvitations from "./pages/WeddingInvitations";
import NewWeddingInvitation from "./pages/NewWeddingInvitation";
import WeddingInvitationDetail from "./pages/WeddingInvitationDetail";
import PublicWeddingInvitation from "./pages/PublicWeddingInvitation";
import AdminMigration from "./pages/AdminMigration";
import ImageSplit from "./pages/ImageSplit";
import CollageBuilder from "./pages/CollageBuilder";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <ThemeProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Public routes - no layout */}
              <Route path="/auth" element={<Auth />} />
              <Route path="/share/:token" element={<ShareView />} />
              <Route path="/portfolio/:userId" element={<PublicPortfolio />} />
              <Route path="/delivery/:token" element={<PublicDeliveryGallery />} />
              <Route path="/invitation/:token" element={<PublicWeddingInvitation />} />

              {/* Authenticated routes - with AppLayout */}
              <Route element={<AppLayout />}>
                <Route path="/" element={<Index />} />
                <Route path="/bookings/new" element={<NewBooking />} />
                <Route path="/bookings/:id" element={<BookingDetail />} />
                <Route path="/packages" element={<Packages />} />
                <Route path="/quotations" element={<Quotations />} />
                <Route path="/quotations/new" element={<NewQuotation />} />
                <Route path="/quotations/:id" element={<QuotationDetail />} />
                <Route path="/portfolio" element={<PortfolioManagement />} />
                <Route path="/deliveries" element={<DeliveryGalleries />} />
                <Route path="/deliveries/:id" element={<DeliveryGalleryDetail />} />
                <Route path="/invitations" element={<WeddingInvitations />} />
                <Route path="/invitations/new" element={<NewWeddingInvitation />} />
                <Route path="/invitations/:id" element={<WeddingInvitationDetail />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/admin/users" element={<AdminUsers />} />
                <Route path="/admin/migration" element={<AdminMigration />} />
                <Route path="/tools/image-split" element={<ImageSplit />} />
                <Route path="/tools/collage" element={<CollageBuilder />} />
              </Route>

              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
