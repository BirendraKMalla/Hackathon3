import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Auth from "./pages/Auth";
import Consent from "./pages/Consent";
import SelectRole from "./pages/SelectRole";
import Dashboard from "./pages/Dashboard";
import KYC from "./pages/KYC";
import Profile from "./pages/Profile";
import Properties from "./pages/Properties";
import PropertyForm from "./pages/PropertyForm";
import PropertyDetail from "./pages/PropertyDetail";
import SearchProperties from "./pages/SearchProperties";
import Preferences from "./pages/Preferences";
import Bookings from "./pages/Bookings";
import Messages from "./pages/Messages";
import Reviews from "./pages/Reviews";
import Transactions from "./pages/Transactions";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const IndexRedirect = () => {
  const { user, loading, consentAgreed, role } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>;
  if (!user) return <Navigate to="/auth" replace />;
  if (!consentAgreed) return <Navigate to="/consent" replace />;
  if (!role) return <Navigate to="/select-role" replace />;
  return <Navigate to="/dashboard" replace />;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<IndexRedirect />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/consent" element={<ProtectedRoute requireConsent={false} requireRole={false}><Consent /></ProtectedRoute>} />
            <Route path="/select-role" element={<ProtectedRoute requireRole={false}><SelectRole /></ProtectedRoute>} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/kyc" element={<ProtectedRoute><KYC /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/properties" element={<ProtectedRoute><Properties /></ProtectedRoute>} />
            <Route path="/properties/new" element={<ProtectedRoute><PropertyForm /></ProtectedRoute>} />
            <Route path="/properties/edit/:id" element={<ProtectedRoute><PropertyForm /></ProtectedRoute>} />
            <Route path="/property/:id" element={<ProtectedRoute><PropertyDetail /></ProtectedRoute>} />
            <Route path="/search" element={<ProtectedRoute><SearchProperties /></ProtectedRoute>} />
            <Route path="/preferences" element={<ProtectedRoute><Preferences /></ProtectedRoute>} />
            <Route path="/bookings" element={<ProtectedRoute><Bookings /></ProtectedRoute>} />
            <Route path="/messages" element={<ProtectedRoute><Messages /></ProtectedRoute>} />
            <Route path="/reviews" element={<ProtectedRoute><Reviews /></ProtectedRoute>} />
            <Route path="/transactions" element={<ProtectedRoute><Transactions /></ProtectedRoute>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
