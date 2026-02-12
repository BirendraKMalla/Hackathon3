import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, Search, MessageSquare, Calendar, Star, Shield } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const Dashboard = () => {
  const { role, user, kycStatus, profile } = useAuth();
  const [stats, setStats] = useState({ properties: 0, bookings: 0, messages: 0, reviews: 0 });

  useEffect(() => {
    if (!user) return;
    const fetchStats = async () => {
      if (role === "owner") {
        const [props, bookings] = await Promise.all([
          supabase.from("properties").select("id", { count: "exact", head: true }).eq("owner_id", user.id),
          supabase.from("bookings").select("id", { count: "exact", head: true }).eq("owner_id", user.id),
        ]);
        setStats({ properties: props.count || 0, bookings: bookings.count || 0, messages: 0, reviews: 0 });
      } else {
        const [bookings] = await Promise.all([
          supabase.from("bookings").select("id", { count: "exact", head: true }).eq("tenant_id", user.id),
        ]);
        setStats({ properties: 0, bookings: bookings.count || 0, messages: 0, reviews: 0 });
      }
    };
    fetchStats();
  }, [user, role]);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Welcome, {profile?.full_name || "User"}
          </h1>
          <p className="text-muted-foreground">
            {role === "owner" ? "Manage your properties and bookings" : "Find your perfect rental in Kathmandu"}
          </p>
        </div>

        {kycStatus !== "verified" && (
          <Card className="border-warning/50 bg-warning/5">
            <CardContent className="flex items-center gap-3 py-4">
              <Shield className="h-5 w-5 text-warning" />
              <div>
                <p className="font-medium text-sm">KYC Verification Required</p>
                <p className="text-xs text-muted-foreground">Complete your identity verification to access all features.</p>
              </div>
              <Badge className="ml-auto bg-warning text-warning-foreground">{kycStatus || "Not Submitted"}</Badge>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {role === "owner" && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Properties</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-primary" />
                  <span className="text-2xl font-bold">{stats.properties}</span>
                </div>
              </CardContent>
            </Card>
          )}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Bookings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-secondary" />
                <span className="text-2xl font-bold">{stats.bookings}</span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Messages</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-accent" />
                <span className="text-2xl font-bold">{stats.messages}</span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Trust Score</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Star className="h-5 w-5 text-warning" />
                <span className="text-2xl font-bold">{profile?.trust_score || "0.0"}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
