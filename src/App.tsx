import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useSupabase } from "@/hooks/useSupabase";
import { AuthProvider } from "@/context/AuthContext";

// Pages
import Layout from "./components/Layout";
import LoginPage from "./pages/LoginPage";
import OnboardingPage from "./pages/OnboardingPage";
import DashboardPage from "./pages/DashboardPage";
import ProductsPage from "./pages/ProductsPage";
import ProductDetailPage from "./pages/ProductDetailPage";
import MarketplacePage from "./pages/MarketplacePage";
import OrdersPage from "./pages/OrdersPage";
import OrderDetailPage from "./pages/OrderDetailPage";
import SettingsPage from "./pages/SettingsPage";
import ConnectionsPage from "./pages/settings/ConnectionsPage";
import ShippingPage from "./pages/settings/ShippingPage";
import BillingPage from "./pages/settings/BillingPage";
import ProfilePage from "./pages/settings/ProfilePage";
import AdminPage from "./pages/AdminPage";
import NotFound from "./pages/NotFound";
import AuthCallback from "./pages/AuthCallback"; // Add our new auth callback page
import ReportsPage from "@/pages/ReportsPage"; // Added ReportsPage import

// Auth-protected route wrapper
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";

// Constants
const queryClient = new QueryClient();

const App = () => {
  const { supabase, isReady } = useSupabase();

  if (!isReady) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider supabaseClient={supabase}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Public routes */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/auth/callback" element={<AuthCallback />} />

              {/* Authenticated Routes */}
              <Route element={<ProtectedRoute />}>
                <Route path="/onboarding/*" element={<OnboardingPage />} />

                <Route element={<Layout />}>
                  <Route path="/" element={<Navigate to="/dashboard" replace />} />
                  <Route path="/dashboard" element={<DashboardPage />} />
                  <Route path="/products" element={<ProductsPage />} />
                  <Route path="/products/:id" element={<ProductDetailPage />} />
                  <Route path="/marketplace" element={<MarketplacePage />} />
                  <Route path="/orders" element={<OrdersPage />} />
                  <Route path="/orders/:id" element={<OrderDetailPage />} />

                  <Route path="/settings/*" element={<SettingsPage />}>
                    <Route index element={<Navigate to="/settings/profile" replace />} />
                    <Route path="connections" element={<ConnectionsPage />} />
                    <Route path="shipping" element={<ShippingPage />} />
                    <Route path="billing" element={<BillingPage />} />
                    <Route path="profile" element={<ProfilePage />} />
                  </Route>

                  <Route path="/reports" element={<ReportsPage />} /> {/* Added Reports route */}

                  {/* Admin routes */}
                  <Route element={<AdminRoute />}>
                    <Route path="/admin" element={<AdminPage />} />
                  </Route>
                </Route>
              </Route>

              {/* 404 Not Found */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;