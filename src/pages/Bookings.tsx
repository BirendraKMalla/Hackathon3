import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const statusColors: Record<string, string> = {
  requested: "bg-warning",
  confirmed: "bg-accent",
  canceled: "bg-destructive",
  completed: "bg-primary",
};

const Bookings = () => {
  const { user, role } = useAuth();
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchBookings = async () => {
    if (!user) return;
    const col = role === "owner" ? "owner_id" : "tenant_id";
    const { data } = await supabase
      .from("bookings")
      .select("*, properties(title, rent_amount)")
      .eq(col, user.id)
      .order("created_at", { ascending: false });
    setBookings(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchBookings(); }, [user, role]);

  const updateStatus = async (id: string, status: "requested" | "confirmed" | "canceled" | "completed") => {
    const { error } = await supabase.from("bookings").update({ status }).eq("id", id);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else fetchBookings();
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Bookings</h1>
        {loading ? (
          <p className="text-muted-foreground">Loading...</p>
        ) : bookings.length === 0 ? (
          <Card><CardContent className="py-10 text-center text-muted-foreground">No bookings yet.</CardContent></Card>
        ) : (
          <div className="space-y-3">
            {bookings.map((b) => (
              <Card key={b.id}>
                <CardContent className="flex items-center justify-between py-4">
                  <div>
                    <p className="font-medium text-sm">{b.properties?.title || "Property"}</p>
                    <p className="text-sm text-muted-foreground">Rs. {Number(b.properties?.rent_amount || 0).toLocaleString()}/mo</p>
                    <p className="text-xs text-muted-foreground mt-1">{new Date(b.created_at).toLocaleDateString()}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={statusColors[b.status] || "bg-muted"}>{b.status}</Badge>
                    {role === "owner" && b.status === "requested" && (
                      <>
                        <Button size="sm" onClick={() => updateStatus(b.id, "confirmed")}>Confirm</Button>
                        <Button size="sm" variant="destructive" onClick={() => updateStatus(b.id, "canceled")}>Cancel</Button>
                      </>
                    )}
                    {b.status === "confirmed" && (
                      <Button size="sm" variant="outline" onClick={() => updateStatus(b.id, "completed")}>Complete</Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Bookings;
