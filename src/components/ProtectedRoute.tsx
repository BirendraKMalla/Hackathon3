import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

interface Props {
  children: React.ReactNode;
  requireRole?: boolean;
  requireConsent?: boolean;
}

const ProtectedRoute = ({ children, requireRole = true, requireConsent = true }: Props) => {
  const { user, loading, role, consentAgreed } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!user) return <Navigate to="/auth" replace />;
  if (requireConsent && !consentAgreed) return <Navigate to="/consent" replace />;
  if (requireRole && !role) return <Navigate to="/select-role" replace />;

  return <>{children}</>;
};

export default ProtectedRoute;
