import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Home, Search } from "lucide-react";

const SelectRole = () => {
  const [selected, setSelected] = useState<"owner" | "tenant" | null>(null);
  const [loading, setLoading] = useState(false);
  const { user, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSelect = async () => {
    if (!user || !selected) return;
    setLoading(true);
    const { data: existingRoles, error: fetchError } = await supabase
      .from("user_roles")
      .select("id")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1);

    if (fetchError) {
      toast({ title: "Error", description: fetchError.message, variant: "destructive" });
      setLoading(false);
      return;
    }

    const existingRole = existingRoles?.[0];

    const { error } = existingRole
      ? await supabase.from("user_roles").update({ role: selected }).eq("id", existingRole.id)
      : await supabase.from("user_roles").insert({ user_id: user.id, role: selected });

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      await refreshProfile();
      navigate("/dashboard");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-lg space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground">Choose Your Role</h1>
          <p className="text-muted-foreground mt-1">How will you use GharSewa?</p>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Card
            className={`cursor-pointer transition-all hover:shadow-md ${selected === "owner" ? "ring-2 ring-primary" : ""}`}
            onClick={() => setSelected("owner")}
          >
            <CardContent className="flex flex-col items-center justify-center p-6 text-center">
              <Home className="h-10 w-10 text-primary mb-3" />
              <CardTitle className="text-lg">Property Owner</CardTitle>
              <CardDescription className="mt-1 text-xs">List properties for rent</CardDescription>
            </CardContent>
          </Card>
          <Card
            className={`cursor-pointer transition-all hover:shadow-md ${selected === "tenant" ? "ring-2 ring-primary" : ""}`}
            onClick={() => setSelected("tenant")}
          >
            <CardContent className="flex flex-col items-center justify-center p-6 text-center">
              <Search className="h-10 w-10 text-secondary mb-3" />
              <CardTitle className="text-lg">Tenant</CardTitle>
              <CardDescription className="mt-1 text-xs">Find your perfect rental</CardDescription>
            </CardContent>
          </Card>
        </div>
        <Button onClick={handleSelect} disabled={!selected || loading} className="w-full">
          {loading ? "Setting up..." : "Continue"}
        </Button>
      </div>
    </div>
  );
};

export default SelectRole;
