import { ReactNode } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Building2, Home, Search, MessageSquare, Calendar,
  Star, CreditCard, User, Shield, LogOut, FileCheck, Menu, X
} from "lucide-react";
import { useState } from "react";

const DashboardLayout = ({ children }: { children: ReactNode }) => {
  const { role, kycStatus, profile, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const ownerLinks = [
    { to: "/dashboard", label: "Dashboard", icon: Home },
    { to: "/properties", label: "My Properties", icon: Building2 },
    { to: "/bookings", label: "Bookings", icon: Calendar },
    { to: "/messages", label: "Messages", icon: MessageSquare },
    { to: "/reviews", label: "Reviews", icon: Star },
    { to: "/transactions", label: "Transactions", icon: CreditCard },
  ];

  const tenantLinks = [
    { to: "/dashboard", label: "Dashboard", icon: Home },
    { to: "/search", label: "Find Properties", icon: Search },
    { to: "/preferences", label: "My Preferences", icon: User },
    { to: "/bookings", label: "Bookings", icon: Calendar },
    { to: "/messages", label: "Messages", icon: MessageSquare },
    { to: "/reviews", label: "Reviews", icon: Star },
    { to: "/transactions", label: "Transactions", icon: CreditCard },
  ];

  const links = role === "owner" ? ownerLinks : tenantLinks;

  const kycBadgeColor = kycStatus === "verified" ? "bg-accent" : kycStatus === "pending" ? "bg-warning" : "bg-destructive";

  const handleLogout = async () => {
    await signOut();
    navigate("/auth");
  };

  const Sidebar = () => (
    <div className="flex flex-col h-full bg-sidebar text-sidebar-foreground">
      <div className="p-4 border-b border-sidebar-border">
        <div className="flex items-center gap-2">
          <Building2 className="h-6 w-6 text-sidebar-primary" />
          <span className="font-bold text-lg">GharSewa</span>
        </div>
        <p className="text-xs text-sidebar-foreground/60 mt-1 capitalize">{role} Account</p>
      </div>

      <nav className="flex-1 p-3 space-y-1">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = location.pathname === link.to;
          return (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                  : "hover:bg-sidebar-accent/50 text-sidebar-foreground/80"
              }`}
            >
              <Icon className="h-4 w-4" />
              {link.label}
            </Link>
          );
        })}
        <Link
          to="/kyc"
          onClick={() => setSidebarOpen(false)}
          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
            location.pathname === "/kyc"
              ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
              : "hover:bg-sidebar-accent/50 text-sidebar-foreground/80"
          }`}
        >
          <FileCheck className="h-4 w-4" />
          KYC Verification
          <Badge className={`ml-auto text-[10px] ${kycBadgeColor}`}>
            {kycStatus || "none"}
          </Badge>
        </Link>
        <Link
          to="/profile"
          onClick={() => setSidebarOpen(false)}
          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
            location.pathname === "/profile"
              ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
              : "hover:bg-sidebar-accent/50 text-sidebar-foreground/80"
          }`}
        >
          <User className="h-4 w-4" />
          Profile
        </Link>
      </nav>

      <div className="p-3 border-t border-sidebar-border">
        <div className="px-3 py-2 text-xs text-sidebar-foreground/60 truncate mb-2">
          {profile?.full_name || "User"}
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start text-sidebar-foreground/80 hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4 mr-2" />
          Sign Out
        </Button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-64 flex-shrink-0">
        <Sidebar />
      </aside>

      {/* Mobile sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-64 z-50">
            <Sidebar />
          </div>
        </div>
      )}

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        <div className="md:hidden flex items-center gap-2 p-4 border-b bg-background">
          <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(true)}>
            <Menu className="h-5 w-5" />
          </Button>
          <span className="font-semibold">GharSewa</span>
        </div>
        <div className="p-4 md:p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
